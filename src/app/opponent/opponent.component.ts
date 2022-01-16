import {Component, Input, OnInit} from '@angular/core';
import {Card, getSortedCards, Player} from '../game/game.model';

@Component({
  selector: 'app-opponent',
  templateUrl: './opponent.component.html',
  styleUrls: ['./opponent.component.less']
})
export class OpponentComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  showCards = false;

  constructor() { }

  ngOnInit(): void {
  }

  get sortedCard(): Card[] | undefined {
    return getSortedCards(this.player.cards);
  }
}
