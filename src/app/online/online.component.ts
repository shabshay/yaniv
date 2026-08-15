import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SubscriberDirective} from '../../Subscriber';
import {GameConfig} from '../game/api/game.model';
import {OnlineRoomService} from './online-room.service';
import {MAX_ONLINE_PLAYERS, MIN_ONLINE_PLAYERS, OnlineRoomError, PublicRoomState, RoomParticipant, RoomStatus} from './online.model';

type OnlineView = 'home' | 'create' | 'join' | 'connecting' | 'lobby';

const AVATARS = ['assets/avatar1.png', 'assets/avatar2.png', 'assets/avatar3.png', 'assets/avatar4.png'];

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

  hostNameInput = '';
  joinNameInput = '';
  joinCodeInput = '';

  constructor(private onlineRoomService: OnlineRoomService) {
    super();
  }

  ngOnInit(): void {
    this.room$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(room => this.onRoomUpdate(room));
    this.onlineRoomService.tryResumeHostSession()
      .then(resumed => {
        if (resumed) {
          this.view = 'lobby';
        }
      })
      .catch(() => {
        // No previous host session to resume from - stay on the home view.
      });
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

  copyRoomCode(code: string): void {
    navigator.clipboard?.writeText(code).catch(() => {
      // Clipboard access can be denied by the browser; the code is already shown on screen.
    });
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

  private onRoomUpdate(room: PublicRoomState | null): void {
    if (room?.status === RoomStatus.closed) {
      this.errorMessage = 'The host closed this room.';
      this.view = 'home';
    }
  }
}

function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

function describeError(error: unknown): string {
  if (error instanceof OnlineRoomError) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
