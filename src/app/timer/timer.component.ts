import {Component, Input, OnInit} from '@angular/core';
import {GameSounds} from '../game/game.sounds';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  @Input()
  timeLeft?: number;

  constructor(private gameSounds: GameSounds) { }

  ngOnInit(): void {
    setInterval(() => {
      if (this.timeLeft === 4) {
        this.gameSounds.playClockBell();
      }
    }, 1000);
  }
}
