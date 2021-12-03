import {Component, Input, OnInit} from '@angular/core';
import {Game} from './game';
import {Player} from '../player/player';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent implements OnInit {

  @Input()
  game!: Game;

  constructor() {
  }

  get opponents(): Player[] {
    return this.game.players.slice(1);
  }

  get player(): Player {
    return this.game.players[0];
  }

  ngOnInit(): void {
  }
}
