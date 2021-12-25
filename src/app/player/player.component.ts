import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IPlayer, cardsScore} from './player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.less']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: IPlayer;

  @Input()
  isCurrentPlayer!: boolean;

  @Input()
  yanivThreshold!: number;

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
