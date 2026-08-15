import {Injectable} from '@angular/core';
import {addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, Unsubscribe} from 'firebase/firestore';
import {combineLatest, Observable, ReplaySubject, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {Card, GameConfig, GameState, Player} from '../game/api/game.model';
import {FirebaseService} from './firebase.service';
import {HostGameEngineService} from './host-game-engine.service';
import {mergeLocalHand} from './game-state-sanitizer';
import {toCardRef, toCardRefs} from './card-refs';
import {generateRoomCode, isValidRoomCode, normalizeRoomCode} from './room-code';
import {handConverter, presenceConverter, roomConverter} from './firestore-converters';
import {isAllowedPlayerAvatar, normalizePlayerName} from './player-profile';
import {
  JoinActionData,
  MAX_ONLINE_CARDS_PER_PLAYER,
  MAX_ONLINE_PLAYERS,
  MoveActionData,
  OnlineRoomError,
  PublicRoomState,
  RoomActionData,
  RoomStatus,
  StartActionData,
  YanivActionData
} from './online.model';
import {expirationTimestamp, PRESENCE_TTL_MS, ROOM_TTL_MS} from './firestore-ttl';
import {AnalyticsService} from '../analytics.service';

const HOST_SESSION_STORAGE_KEY = 'yaniv.onlineHostSession';
const JOIN_TIMEOUT_MS = 15000;
const MAX_ROOM_CODE_ATTEMPTS = 10;
const PRESENCE_HEARTBEAT_MS = 15000;

interface StoredHostSession {
  code: string;
  uid: string;
}

/**
 * Client-facing API for online play. Every browser (host included) talks to Firestore only
 * through this service: it publishes commands to the room's `actions` subcollection and renders
 * whatever the host has published to the public room document, merged with the viewer's own
 * private hand. It never touches game rules directly - that only happens on the host, in
 * HostGameEngineService, via the shared GameController.
 */
@Injectable()
export class OnlineRoomService {

  localPlayer?: Player;

  private roomCode?: string;
  private roomUnsubscribe?: Unsubscribe;
  private handUnsubscribe?: Unsubscribe;
  private presenceHeartbeat?: ReturnType<typeof setInterval>;
  private presenceCode?: string;
  private presenceUid?: string;

  private readonly roomSubject = new ReplaySubject<PublicRoomState | null>(1);
  private readonly handSubject = new ReplaySubject<Card[] | undefined>(1);

  readonly room$: Observable<PublicRoomState | null> = this.roomSubject.asObservable();
  readonly hand$: Observable<Card[] | undefined> = this.handSubject.asObservable();

  readonly gameState$: Observable<GameState | undefined> = combineLatest([this.room$, this.hand$]).pipe(
    map(([room, hand]) => {
      const uid = this.uid;
      if (!room?.game || !uid) {
        return undefined;
      }
      return mergeLocalHand(room.game, uid, hand);
    })
  );

  /** Emits the renderable game + local player only once the host has actually started the game. */
  readonly activeGame$: Observable<{ gameState: GameState; player: Player } | undefined> =
    combineLatest([this.room$, this.gameState$]).pipe(
      map(([room, gameState]) => {
        if (!room || room.status === RoomStatus.lobby || !gameState) {
          return undefined;
        }
        const player = gameState.players.find(candidate => candidate.id === this.localPlayer?.id);
        return player ? {gameState, player} : undefined;
      })
    );

  constructor(
    private firebaseService: FirebaseService,
    private hostEngine: HostGameEngineService,
    private analyticsService: AnalyticsService
  ) {
  }

  get uid(): string | undefined {
    return this.firebaseService.uid ?? undefined;
  }

  isHost(room: PublicRoomState | null | undefined): boolean {
    return !!room && !!this.uid && room.hostId === this.uid;
  }

  async createRoom(hostName: string, hostImg: string, config: GameConfig): Promise<string> {
    const name = requireName(hostName);
    const img = requireAvatar(hostImg);
    if (!Number.isInteger(config.cardsPerPlayer)
      || config.cardsPerPlayer < 1
      || config.cardsPerPlayer > MAX_ONLINE_CARDS_PER_PLAYER
    ) {
      throw new OnlineRoomError(
        `Online games support 1-${MAX_ONLINE_CARDS_PER_PLAYER} cards per player`,
        'invalid-config'
      );
    }
    const uid = await this.firebaseService.ensureSignedIn();
    await this.closeStoredHostRoom(uid);
    const code = await this.reserveRoomCode();
    const hostPlayer: Player = {id: uid, name, img, isOut: false, totalScore: 0, isComputerPlayer: false};

    this.localPlayer = hostPlayer;
    this.roomCode = code;
    this.subscribeToRoom(code);
    this.subscribeToHand(code, uid);
    await this.hostEngine.start(code, uid, hostPlayer, config);
    await this.startPresence(code, uid);
    this.saveHostSession(code, uid);
    this.analyticsService.trackGameCreated(config);
    return code;
  }

  async hasResumableHostSession(): Promise<boolean> {
    const saved = this.loadHostSession();
    if (!saved) {
      return false;
    }
    const uid = await this.firebaseService.ensureSignedIn();
    if (uid !== saved.uid) {
      this.clearHostSession();
      return false;
    }
    const snap = await getDoc(doc(this.firestore, 'rooms', saved.code).withConverter(roomConverter));
    const room = snap.exists() ? snap.data() : undefined;
    const resumable = !!room && room.hostId === uid && room.status !== RoomStatus.closed;
    if (!resumable) {
      this.clearHostSession();
    }
    return resumable;
  }

  /** Resumes only after the user explicitly chooses to restore their last hosted room. */
  async tryResumeHostSession(): Promise<boolean> {
    const saved = this.loadHostSession();
    if (!saved) {
      return false;
    }
    const uid = await this.firebaseService.ensureSignedIn();
    if (uid !== saved.uid) {
      this.clearHostSession();
      return false;
    }
    const snap = await getDoc(doc(this.firestore, 'rooms', saved.code).withConverter(roomConverter));
    const room = snap.exists() ? snap.data() : undefined;
    if (!room || room.hostId !== uid || room.status === RoomStatus.closed) {
      this.clearHostSession();
      return false;
    }
    this.roomCode = saved.code;
    this.localPlayer = room.game?.players.find(player => player.id === uid);
    this.subscribeToRoom(saved.code);
    this.subscribeToHand(saved.code, uid);
    await this.hostEngine.resume(saved.code, uid);
    await this.startPresence(saved.code, uid);
    this.analyticsService.trackGameResumed();
    return true;
  }

  async joinRoom(rawCode: string, name: string, img: string): Promise<void> {
    const code = normalizeRoomCode(rawCode);
    if (!isValidRoomCode(code)) {
      throw new OnlineRoomError('Please enter a valid 6-character room code', 'invalid-code');
    }
    const playerName = requireName(name);
    const playerImg = requireAvatar(img);
    const uid = await this.firebaseService.ensureSignedIn();
    await this.closeStoredHostRoom(uid);
    const roomRef = doc(this.firestore, 'rooms', code).withConverter(roomConverter);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      throw new OnlineRoomError('No room was found with that code', 'not-found');
    }
    const room = snap.data();
    const alreadyJoined = !!room.participants[uid];
    if (!alreadyJoined && room.status !== RoomStatus.lobby) {
      throw new OnlineRoomError('This game has already started', 'already-started');
    }
    if (!alreadyJoined && Object.keys(room.participants).length >= MAX_ONLINE_PLAYERS) {
      throw new OnlineRoomError('This room is already full', 'room-full');
    }

    this.localPlayer = {id: uid, name: playerName, img: playerImg, isOut: false, totalScore: 0, isComputerPlayer: false};
    this.roomCode = code;
    this.subscribeToRoom(code);
    this.subscribeToHand(code, uid);
    await this.startPresence(code, uid);

    try {
      if (!alreadyJoined) {
        const action: JoinActionData = {
          type: 'join',
          uid,
          name: playerName,
          img: playerImg,
          createdAt: Date.now(),
          processed: false,
          expiresAt: expirationTimestamp(ROOM_TTL_MS)
        };
        await addDoc(collection(this.firestore, 'rooms', code, 'actions'), action);
        await this.waitUntilJoined(code, uid);
        this.analyticsService.trackGameJoined();
      }
    } catch (error) {
      try {
        await this.stopPresence(true);
      } catch (cleanupError) {
        console.error('Failed to clean up presence after join failure', cleanupError);
      }
      throw error;
    }
  }

  requestStart(): Promise<void> {
    const action: StartActionData = {
      type: 'start',
      uid: this.requireUid(),
      createdAt: Date.now(),
      processed: false,
      expiresAt: expirationTimestamp(ROOM_TTL_MS)
    };
    return this.submitAction(action);
  }

  submitMove(cards: Card[], cardToTake: Card | null): Promise<void> {
    const action: MoveActionData = {
      type: 'move',
      uid: this.requireUid(),
      cards: toCardRefs(cards),
      cardToTake: cardToTake ? toCardRef(cardToTake) : null,
      createdAt: Date.now(),
      processed: false,
      expiresAt: expirationTimestamp(ROOM_TTL_MS)
    };
    return this.submitAction(action);
  }

  submitYaniv(): Promise<void> {
    const action: YanivActionData = {
      type: 'yaniv',
      uid: this.requireUid(),
      createdAt: Date.now(),
      processed: false,
      expiresAt: expirationTimestamp(ROOM_TTL_MS)
    };
    return this.submitAction(action);
  }

  async leaveRoom(): Promise<void> {
    try {
      let presenceError: unknown;
      try {
        await this.stopPresence(true);
      } catch (error) {
        presenceError = error;
      }
      await this.hostEngine.close();
      if (presenceError) {
        throw presenceError;
      }
    } finally {
      this.roomUnsubscribe?.();
      this.handUnsubscribe?.();
      this.roomUnsubscribe = undefined;
      this.handUnsubscribe = undefined;
      this.roomCode = undefined;
      this.localPlayer = undefined;
      this.clearHostSession();
      this.roomSubject.next(null);
      this.handSubject.next(undefined);
    }
  }

  private submitAction(action: RoomActionData): Promise<void> {
    if (!this.roomCode) {
      return Promise.reject(new OnlineRoomError('Not currently in a room', 'not-found'));
    }
    return addDoc(collection(this.firestore, 'rooms', this.roomCode, 'actions'), action).then(() => undefined);
  }

  private waitUntilJoined(code: string, uid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let subscription: Subscription | undefined;
      const timeout = setTimeout(() => {
        subscription?.unsubscribe();
        reject(new OnlineRoomError('The host did not respond to the join request in time', 'timeout'));
      }, JOIN_TIMEOUT_MS);
      subscription = this.room$.subscribe(room => {
        if (room?.participants?.[uid]) {
          clearTimeout(timeout);
          subscription?.unsubscribe();
          resolve();
        } else if (room && room.status !== RoomStatus.lobby) {
          clearTimeout(timeout);
          subscription?.unsubscribe();
          reject(new OnlineRoomError('This game has already started', 'already-started'));
        }
      });
    });
  }

  private async reserveRoomCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt++) {
      const code = generateRoomCode();
      const snap = await getDoc(doc(this.firestore, 'rooms', code));
      if (!snap.exists()) {
        return code;
      }
    }
    throw new OnlineRoomError('Could not allocate a free room code, please try again', 'not-found');
  }

  private subscribeToRoom(code: string): void {
    this.roomUnsubscribe?.();
    this.roomUnsubscribe = onSnapshot(doc(this.firestore, 'rooms', code).withConverter(roomConverter), snap => {
      this.roomSubject.next(snap.exists() ? snap.data() : null);
    }, error => console.error('Room listener failed', error));
  }

  private subscribeToHand(code: string, uid: string): void {
    this.handUnsubscribe?.();
    this.handUnsubscribe = onSnapshot(doc(this.firestore, 'rooms', code, 'hands', uid).withConverter(handConverter), snap => {
      this.handSubject.next(snap.exists() ? snap.data().cards : undefined);
    }, error => console.error('Hand listener failed', error));
  }

  private async startPresence(code: string, uid: string): Promise<void> {
    await this.stopPresence(false);
    this.presenceCode = code;
    this.presenceUid = uid;
    await this.writePresence(code, uid);
    this.presenceHeartbeat = setInterval(() => {
      this.writePresence(code, uid).catch(error => console.error('Presence heartbeat failed', error));
    }, PRESENCE_HEARTBEAT_MS);
  }

  private async stopPresence(deleteRemote: boolean): Promise<void> {
    if (this.presenceHeartbeat) {
      clearInterval(this.presenceHeartbeat);
      this.presenceHeartbeat = undefined;
    }
    const code = this.presenceCode;
    const uid = this.presenceUid;
    this.presenceCode = undefined;
    this.presenceUid = undefined;
    if (deleteRemote && code && uid) {
      await deleteDoc(this.presenceDocRef(code, uid));
    }
  }

  private writePresence(code: string, uid: string): Promise<void> {
    return setDoc(this.presenceDocRef(code, uid), {
      uid,
      lastSeenAt: Date.now(),
      expiresAt: expirationTimestamp(PRESENCE_TTL_MS)
    });
  }

  private presenceDocRef(code: string, uid: string) {
    return doc(this.firestore, 'rooms', code, 'presence', uid).withConverter(presenceConverter);
  }

  private async closeStoredHostRoom(uid: string): Promise<void> {
    const saved = this.loadHostSession();
    if (!saved) {
      return;
    }
    if (saved.uid !== uid) {
      this.clearHostSession();
      return;
    }
    const roomRef = doc(this.firestore, 'rooms', saved.code).withConverter(roomConverter);
    const snap = await getDoc(roomRef);
    if (snap.exists() && snap.data().hostId === uid && snap.data().status !== RoomStatus.closed) {
      await this.hostEngine.closeStoredRoom(saved.code, uid);
    }
    this.clearHostSession();
  }

  private requireUid(): string {
    const uid = this.uid;
    if (!uid) {
      throw new OnlineRoomError('Not signed in', 'not-signed-in');
    }
    return uid;
  }

  private saveHostSession(code: string, uid: string): void {
    const session: StoredHostSession = {code, uid};
    localStorage.setItem(HOST_SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  private loadHostSession(): StoredHostSession | undefined {
    const raw = localStorage.getItem(HOST_SESSION_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    try {
      return JSON.parse(raw) as StoredHostSession;
    } catch {
      this.clearHostSession();
      return undefined;
    }
  }

  private clearHostSession(): void {
    localStorage.removeItem(HOST_SESSION_STORAGE_KEY);
  }

  private get firestore() {
    return this.firebaseService.firestore;
  }
}

function requireName(name: string): string {
  const normalized = normalizePlayerName(name);
  if (!normalized) {
    throw new OnlineRoomError('Please enter a name', 'invalid-name');
  }
  return normalized;
}

function requireAvatar(img: string): string {
  if (!isAllowedPlayerAvatar(img)) {
    throw new Error('Invalid player avatar');
  }
  return img;
}
