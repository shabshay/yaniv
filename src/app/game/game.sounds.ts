import {Injectable} from '@angular/core';

@Injectable()
export class GameSounds {
  private cardClickAudio = new Audio('./assets/card-click.mp3');
  private clockBellAudio = new Audio('./assets/clock-bell.mp3');

  constructor() {
    this.cardClickAudio.load();
  }

  playCardClick(): void {
    this.cardClickAudio.play().catch();
  }

  playClockBell(): void {
    this.clockBellAudio.play().catch();
  }
}
