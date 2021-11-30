import {Component, Input, OnInit} from '@angular/core';
import {Game} from './game';
import {CardSymbol} from '../card/card';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent implements OnInit {

  @Input()
  game!: Game;
  constructor() { }

  ngOnInit(): void {
  }
}
