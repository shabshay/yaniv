import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs';
import AsyncLock from 'async-lock';
import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import {GameController} from '../game/api/game.controller';
import {GameEvents} from '../game/api/game.events';
import {GameConfig, GameState, GameStatus, getThrownCards, Player} from '../game/api/game.model';
import {FirebaseService} from './firebase.service';
import {sanitizeGameState} from './game-state-sanitizer';
import {resolveCardRef, resolveCardRefs} from './card-refs';
import {actionConverter, handConverter, presenceConverter, privateStateConverter, roomConverter} from './firestore-converters';
import {
  HandDoc,
  JoinActionData,
  MAX_ONLINE_PLAYERS,
  MIN_ONLINE_PLAYERS,
  MoveActionData,
  PresenceDoc,
  PrivateRoomState,
  PublicRoomState,
  RoomActionData,
  RoomParticipant,
  RoomStatus,
  StartActionData,
  YanivActionData,
  isValidRoomAction
} from './online.model';
import {isAllowedPlayerAvatar, normalizePlayerName} from './player-profile';
import {expirationTimestamp, PROCESSED_ACTION_TTL_MS, ROOM_TTL_MS} from './firestore-ttl';
import {AnalyticsService} from '../analytics.service';

const PRESENCE_TIMEOUT_MS = 90000;

/**
 * Runs only in the host's browser. Listens for join/move/yaniv/start commands submitted by every
 * participant (including the host itself, for a single uniform code path), validates and applies
 * them through the existing GameController/GameReducer/GameValidator, then republishes a
 * sanitized public state plus each player's private hand. There is no server-side component
 * (Spark plan, no Cloud Functions), so the host tab is the sole source of truth while it's open.
 */
@Injectable()
export class HostGameEngineService {

  private readonly lock = new AsyncLock();

  private roomCode?: string;
  private hostUid?: string;
  private roomCreatedAt = 0;
  private participants: Record<string, RoomParticipant> = {};
  private playerOrder: string[] = [];
  private currentState?: GameState;
  private seenActionIds = new Set<string>();
  private gameStartedAt?: number;
  private gameCompletionTracked = false;

  private gameEventsSubscription?: Subscription;
  private actionsUnsubscribe?: Unsubscribe;
  private presenceUnsubscribe?: Unsubscribe;

  constructor(
    private firebaseService: FirebaseService,
    private gameController: GameController,
    private gameEvents: GameEvents,
    private analyticsService: AnalyticsService
  ) {
  }

  /** Creates a brand-new room and starts hosting it. */
  async start(roomCode: string, hostUid: string, hostPlayer: Player, config: GameConfig): Promise<void> {
    this.stop();
    this.roomCode = roomCode;
    this.hostUid = hostUid;
    this.roomCreatedAt = Date.now();
    this.participants = {
      [hostUid]: {uid: hostUid, name: hostPlayer.name, img: hostPlayer.img, joinedAt: this.roomCreatedAt}
    };
    this.playerOrder = [hostUid];
    this.seenActionIds = new Set();
    this.gameStartedAt = undefined;
    this.gameCompletionTracked = false;

    let publishAfterFirstEvent: Promise<void> = Promise.resolve();
    this.gameEventsSubscription = this.gameEvents.gameStateUpdate.subscribe(state => {
      this.onAuthoritativeStateUpdate(state);
      publishAfterFirstEvent = this.queuePublish().catch(error => console.error('Failed to publish room state', error));
    });

    this.currentState = this.gameController.newGame(config, hostPlayer);
    await publishAfterFirstEvent;
    this.subscribeToActions();
    this.subscribeToPresence();
  }

  /** Reattaches to a room this browser was hosting, restoring state from the private document. */
  async resume(roomCode: string, hostUid: string): Promise<void> {
    this.stop();
    const roomSnap = await getDoc(this.roomDocRef(roomCode));
    const privateSnap = await getDoc(this.privateDocRef(roomCode));
    if (!roomSnap.exists() || !privateSnap.exists()) {
      throw new Error(`Cannot resume hosting room ${roomCode}: state not found`);
    }
    const room = roomSnap.data();
    if (room.hostId !== hostUid) {
      throw new Error(`Cannot resume hosting room ${roomCode}: not the host`);
    }
    this.roomCode = roomCode;
    this.hostUid = hostUid;
    this.roomCreatedAt = room.createdAt;
    this.participants = room.participants;
    this.playerOrder = room.playerOrder;
    this.currentState = privateSnap.data().game;
    this.seenActionIds = new Set();
    this.gameStartedAt = undefined;
    this.gameCompletionTracked = this.currentState.status === GameStatus.gameOver;

    this.gameEventsSubscription = this.gameEvents.gameStateUpdate.subscribe(state => {
      this.onAuthoritativeStateUpdate(state);
      this.queuePublish().catch(error => console.error('Failed to publish room state', error));
    });

    this.subscribeToActions();
    this.subscribeToPresence();
    this.gameController.resumeGame(this.currentState);
  }

  async close(): Promise<void> {
    if (!this.roomCode) {
      this.stop();
      return;
    }
    const roomCode = this.roomCode;
    await this.lock.acquire(roomCode, async () => {
      this.trackAbandonedGame();
      this.stop();
      await updateDoc(this.roomDocRef(roomCode), {status: RoomStatus.closed});
    });
  }

  /** Stops listening. The room documents remain untouched so a future resume() can pick up. */
  stop(): void {
    this.gameController.cancelPendingActions();
    this.gameEventsSubscription?.unsubscribe();
    this.gameEventsSubscription = undefined;
    this.actionsUnsubscribe?.();
    this.actionsUnsubscribe = undefined;
    this.presenceUnsubscribe?.();
    this.presenceUnsubscribe = undefined;
    this.roomCode = undefined;
    this.hostUid = undefined;
    this.currentState = undefined;
  }

  private subscribeToActions(): void {
    const roomCode = this.requireRoomCode();
    const actionsQuery = query(
      this.actionsColRef(roomCode),
      where('processed', '==', false),
      orderBy('createdAt')
    );
    this.actionsUnsubscribe = onSnapshot(actionsQuery, snapshot => {
      snapshot.docs
        .filter(document => !document.data().processed && !this.seenActionIds.has(document.id))
        .forEach(document => {
          this.seenActionIds.add(document.id);
          this.lock.acquire(roomCode, () => this.processAction(document))
            .catch(error => console.error('Failed to process room action', document.id, error));
        });
    }, error => console.error('Room actions listener failed', error));
  }

  private subscribeToPresence(): void {
    const roomCode = this.requireRoomCode();
    this.presenceUnsubscribe = onSnapshot(this.presenceColRef(roomCode), snapshot => {
      this.lock.acquire(roomCode, () => this.pruneStaleLobbyPlayers(snapshot))
        .catch(error => console.error('Failed to prune stale room participants', error));
    }, error => console.error('Room presence listener failed', error));
  }

  private async pruneStaleLobbyPlayers(snapshot: QuerySnapshot<PresenceDoc>): Promise<void> {
    if (!this.currentState || this.currentState.status !== GameStatus.pending || !this.hostUid) {
      return;
    }
    const cutoff = Date.now() - PRESENCE_TIMEOUT_MS;
    const activeUids = new Set(
      snapshot.docs
        .map(document => document.data())
        .filter(presence => presence.lastSeenAt >= cutoff)
        .map(presence => presence.uid)
    );
    const staleUids = this.playerOrder.filter(uid => uid !== this.hostUid && !activeUids.has(uid));
    if (!staleUids.length) {
      return;
    }
    const staleUidSet = new Set(staleUids);
    this.playerOrder = this.playerOrder.filter(uid => !staleUidSet.has(uid));
    this.currentState.players = this.currentState.players.filter(player => !staleUidSet.has(player.id));
    const activeParticipants: Record<string, RoomParticipant> = {};
    Object.keys(this.participants).forEach(uid => {
      if (!staleUidSet.has(uid)) {
        activeParticipants[uid] = this.participants[uid];
      }
    });
    this.participants = activeParticipants;
    await this.publish();
  }

  private async processAction(document: QueryDocumentSnapshot<RoomActionData>): Promise<void> {
    const action: unknown = document.data();
    if (!isValidRoomAction(action)) {
      console.warn('Rejected malformed room action', document.id);
      await this.markActionProcessed(document);
      return;
    }
    switch (action.type) {
      case 'join':
        this.handleJoin(action);
        break;
      case 'start':
        this.handleStart(action);
        break;
      case 'move':
        this.handleMove(action);
        break;
      case 'yaniv':
        this.handleYaniv(action);
        break;
    }
    await this.markActionProcessed(document);
  }

  private markActionProcessed(document: QueryDocumentSnapshot<RoomActionData>): Promise<void> {
    return updateDoc(document.ref, {
      processed: true,
      expiresAt: expirationTimestamp(PROCESSED_ACTION_TTL_MS)
    });
  }

  private queuePublish(): Promise<void> {
    const roomCode = this.requireRoomCode();
    return this.lock.acquire(roomCode, () => this.publish());
  }

  private handleJoin(action: JoinActionData): void {
    if (!this.currentState || this.currentState.status !== GameStatus.pending) {
      return;
    }
    const name = normalizePlayerName(action.name);
    const nameTaken = Object.values(this.participants)
      .some(participant => participant.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!name || !isAllowedPlayerAvatar(action.img) || nameTaken) {
      console.warn('Rejected invalid or duplicate player profile', action.uid);
      return;
    }
    if (this.participants[action.uid] || Object.keys(this.participants).length >= MAX_ONLINE_PLAYERS) {
      return;
    }
    const player: Player = {
      id: action.uid,
      name,
      img: action.img,
      isOut: false,
      totalScore: 0,
      isComputerPlayer: false
    };
    this.participants = {
      ...this.participants,
      [action.uid]: {uid: action.uid, name, img: action.img, joinedAt: action.createdAt}
    };
    this.playerOrder = [...this.playerOrder, action.uid];
    this.gameController.addPlayer(this.currentState, player);
  }

  private handleStart(action: StartActionData): void {
    if (!this.currentState || action.uid !== this.hostUid) {
      return;
    }
    const playerCount = this.currentState.players.length;
    if (playerCount < MIN_ONLINE_PLAYERS || playerCount > MAX_ONLINE_PLAYERS) {
      return;
    }
    if (this.currentState.status !== GameStatus.pending) {
      return;
    }
    this.gameStartedAt = Date.now();
    this.gameController.startGame(this.currentState);
    if (this.currentState.status !== GameStatus.pending) {
      this.analyticsService.trackGameStarted('online', this.currentState);
    }
  }

  private handleMove(action: MoveActionData): void {
    if (!this.currentState || action.uid !== this.currentState.currentPlayer?.id) {
      return;
    }
    const hand = this.currentState.currentPlayer.cards ?? [];
    const thrownCards = resolveCardRefs(hand, action.cards);
    if (!thrownCards.length) {
      return;
    }
    const pile = getThrownCards(this.currentState);
    const cardToTake = action.cardToTake ? resolveCardRef(pile, action.cardToTake) : null;
    if (action.cardToTake && !cardToTake) {
      return;
    }
    this.gameController.makeMove(this.currentState, thrownCards, cardToTake);
  }

  private handleYaniv(action: YanivActionData): void {
    if (!this.currentState || action.uid !== this.currentState.currentPlayer?.id) {
      return;
    }
    this.gameController.yaniv(this.currentState);
  }

  private onAuthoritativeStateUpdate(state: GameState): void {
    this.currentState = state;
    if (state.status === GameStatus.gameOver && !this.gameCompletionTracked) {
      this.gameCompletionTracked = true;
      this.analyticsService.trackGameCompleted('online', state, this.gameStartedAt);
    }
  }

  private trackAbandonedGame(): void {
    if (!this.currentState
      || this.gameCompletionTracked
      || [GameStatus.pending, GameStatus.gameOver].includes(this.currentState.status)
    ) {
      return;
    }
    this.analyticsService.trackGameAbandoned('online', this.currentState, this.gameStartedAt);
  }

  private async publish(): Promise<void> {
    if (!this.currentState || !this.roomCode || !this.hostUid) {
      return;
    }
    const state = this.currentState;
    const sanitized = sanitizeGameState(state);
    const expiresAt = expirationTimestamp(ROOM_TTL_MS);
    const publicRoom: PublicRoomState = {
      code: this.roomCode,
      hostId: this.hostUid,
      status: state.status === GameStatus.pending ? RoomStatus.lobby : RoomStatus.active,
      createdAt: this.roomCreatedAt,
      participants: this.participants,
      playerOrder: this.playerOrder,
      game: sanitized,
      expiresAt
    };
    const privateState: PrivateRoomState = {game: state, updatedAt: Date.now(), expiresAt};

    // The public room doc is written first (and awaited) so that firestore.rules can safely
    // get() its hostId while validating the private/hand writes below: within a single batch,
    // rule evaluation for one document cannot see another document's not-yet-committed write.
    await setDoc(this.roomDocRef(this.roomCode), publicRoom);

    const batch = writeBatch(this.firebaseService.firestore);
    batch.set(this.privateDocRef(this.roomCode), privateState);
    state.players.forEach(player => {
      const handDoc: HandDoc = {cards: player.cards ?? [], updatedAt: Date.now(), expiresAt};
      batch.set(this.handDocRef(this.roomCode as string, player.id), handDoc);
    });
    await batch.commit();
  }

  private requireRoomCode(): string {
    if (!this.roomCode) {
      throw new Error('Host engine is not attached to a room');
    }
    return this.roomCode;
  }

  private roomDocRef(roomCode: string): DocumentReference<PublicRoomState> {
    return doc(this.firebaseService.firestore, 'rooms', roomCode).withConverter(roomConverter);
  }

  private privateDocRef(roomCode: string): DocumentReference<PrivateRoomState> {
    return doc(this.firebaseService.firestore, 'rooms', roomCode, 'private', 'state').withConverter(privateStateConverter);
  }

  private handDocRef(roomCode: string, uid: string): DocumentReference<HandDoc> {
    return doc(this.firebaseService.firestore, 'rooms', roomCode, 'hands', uid).withConverter(handConverter);
  }

  private actionsColRef(roomCode: string): CollectionReference<RoomActionData> {
    return collection(this.firebaseService.firestore, 'rooms', roomCode, 'actions').withConverter(actionConverter);
  }

  private presenceColRef(roomCode: string): CollectionReference<PresenceDoc> {
    return collection(this.firebaseService.firestore, 'rooms', roomCode, 'presence').withConverter(presenceConverter);
  }
}
