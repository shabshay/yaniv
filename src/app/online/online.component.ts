import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SubscriberDirective} from '../../Subscriber';
import {GameConfig} from '../game/api/game.model';
import {OnlineRoomService} from './online-room.service';
import {MAX_ONLINE_PLAYERS, MIN_ONLINE_PLAYERS, OnlineRoomError, PublicRoomState, RoomParticipant, RoomStatus} from './online.model';
import {PLAYER_AVATARS} from './player-profile';

type OnlineView = 'home' | 'create' | 'join' | 'connecting' | 'lobby';

/**
 * Handles the "create/join online game" flow and realtime lobby. Once the host starts the game,
 * AppComponent (which shares the same OnlineRoomService singleton) switches to rendering
 * `<app-game>` directly, so this component only ever needs to cover pre-game states.
 */
@Component({
  selector: 'app-online',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.scss']
})
export class OnlineComponent extends SubscriberDirective implements OnInit {

  @Input()
  gameConfig!: GameConfig;

  @Output()
  exit = new EventEmitter<void>();

  readonly minPlayers = MIN_ONLINE_PLAYERS;
  readonly maxPlayers = MAX_ONLINE_PLAYERS;

  readonly room$: Observable<PublicRoomState | null> = this.onlineRoomService.room$;

  view: OnlineView = 'home';
  errorMessage?: string;
  busy = false;
  codeCopied = false;
  canResumeLastGame = false;
  private copyFeedbackTimer?: ReturnType<typeof setTimeout>;

  hostNameInput = '';
  joinNameInput = '';
  joinCodeInput = '';

  constructor(private onlineRoomService: OnlineRoomService) {
    super();
  }

  ngOnInit(): void {
    this.room$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(room => this.onRoomUpdate(room));
    this.onlineRoomService.hasResumableHostSession()
      .then(canResume => this.canResumeLastGame = canResume)
      .catch(error => this.errorMessage = describeError(error));
  }

  isHost(room: PublicRoomState | null): boolean {
    return this.onlineRoomService.isHost(room);
  }

  participantsOf(room: PublicRoomState): RoomParticipant[] {
    return room.playerOrder.map(uid => room.participants[uid]).filter((participant): participant is RoomParticipant => !!participant);
  }

  showCreateForm(): void {
    this.errorMessage = undefined;
    this.hostNameInput = '';
    this.view = 'create';
  }

  showJoinForm(): void {
    this.errorMessage = undefined;
    this.joinNameInput = '';
    this.joinCodeInput = '';
    this.view = 'join';
  }

  backToHome(): void {
    this.errorMessage = undefined;
    this.view = 'home';
  }

  async resumeLastGame(): Promise<void> {
    this.errorMessage = undefined;
    this.busy = true;
    this.view = 'connecting';
    try {
      const resumed = await this.onlineRoomService.tryResumeHostSession();
      if (!resumed) {
        this.canResumeLastGame = false;
        this.errorMessage = 'The previous room is no longer available.';
        this.view = 'home';
        return;
      }
      this.view = 'lobby';
    } catch (error) {
      this.errorMessage = describeError(error);
      this.view = 'home';
    } finally {
      this.busy = false;
    }
  }

  async createRoom(): Promise<void> {
    this.errorMessage = undefined;
    this.busy = true;
    this.view = 'connecting';
    try {
      await this.onlineRoomService.createRoom(this.hostNameInput, randomAvatar(), this.gameConfig);
      this.view = 'lobby';
    } catch (error) {
      this.errorMessage = describeError(error);
      this.view = 'create';
    } finally {
      this.busy = false;
    }
  }

  async joinRoom(): Promise<void> {
    this.errorMessage = undefined;
    this.busy = true;
    this.view = 'connecting';
    try {
      await this.onlineRoomService.joinRoom(this.joinCodeInput, this.joinNameInput, randomAvatar());
      this.view = 'lobby';
    } catch (error) {
      this.errorMessage = describeError(error);
      this.view = 'join';
    } finally {
      this.busy = false;
    }
  }

  startGame(room: PublicRoomState): void {
    if (!this.canStart(room)) {
      return;
    }
    this.onlineRoomService.requestStart().catch(error => this.errorMessage = describeError(error));
  }

  canStart(room: PublicRoomState): boolean {
    const playerCount = room.playerOrder.length;
    return playerCount >= this.minPlayers && playerCount <= this.maxPlayers;
  }

  async copyRoomCode(code: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(code);
      this.codeCopied = true;
      if (this.copyFeedbackTimer) {
        clearTimeout(this.copyFeedbackTimer);
      }
      this.copyFeedbackTimer = setTimeout(() => {
        this.codeCopied = false;
        this.copyFeedbackTimer = undefined;
      }, 2000);
    } catch {
      this.errorMessage = 'Could not copy the room code. Please copy it manually.';
    }
  }

  async leave(): Promise<void> {
    try {
      await this.onlineRoomService.leaveRoom();
      this.view = 'home';
      this.exit.emit();
    } catch (error) {
      this.errorMessage = describeError(error);
    }
  }

  exitMenu(): void {
    this.exit.emit();
  }

  override ngOnDestroy(): void {
    if (this.copyFeedbackTimer) {
      clearTimeout(this.copyFeedbackTimer);
    }
    super.ngOnDestroy();
  }

  private onRoomUpdate(room: PublicRoomState | null): void {
    if (room?.status === RoomStatus.closed) {
      this.errorMessage = 'The host closed this room.';
      this.view = 'home';
      this.onlineRoomService.leaveRoom()
        .catch(error => this.errorMessage = describeError(error));
    }
  }
}

function randomAvatar(): string {
  return PLAYER_AVATARS[cryptoRandomIndex(PLAYER_AVATARS.length)];
}

function cryptoRandomIndex(length: number): number {
  const max = Math.floor(0x100000000 / length) * length;
  const randomValue = new Uint32Array(1);
  do {
    crypto.getRandomValues(randomValue);
  } while (randomValue[0] >= max);
  return randomValue[0] % length;
}

function describeError(error: unknown): string {
  if (error instanceof OnlineRoomError) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
