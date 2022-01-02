import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../game/game.model';

@Component({
  selector: 'app-opponent',
  templateUrl: './opponent.component.html',
  styleUrls: ['./opponent.component.less']
})
export class OpponentComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  isCurrentPlayer!: boolean;

  @Input()
  showCards = false;

  constructor() { }

  ngOnInit(): void {
  }

}
