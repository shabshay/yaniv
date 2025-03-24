import {Component, Input, OnInit} from '@angular/core';
import {GameSounds} from '../game/game.sounds';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
    standalone: false
})
export class TimerComponent implements OnInit {

  @Input()
  timeLeft?: number;

  constructor(private gameSounds: GameSounds) {
  }

  ngOnInit(): void {
    setInterval(() => {
      if (this.timeLeft === 5) {
        this.gameSounds.tikTokAudio.play().catch();
      }
    }, 1000);
  }
}
