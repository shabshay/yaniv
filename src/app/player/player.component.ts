import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Player, cardsScore} from '../game/game.model';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  isCurrentPlayer!: boolean;

  @Input()
  yanivThreshold!: number;

  @Input()
  timeLeft?: number;

  @Output()
  yanivClick: EventEmitter<any> = new EventEmitter<any>();

  cardsScore = cardsScore;

  constructor() {
  }

  ngOnInit(): void {
  }

  onYanivClick(): void {
    this.yanivClick.emit();
  }
}
