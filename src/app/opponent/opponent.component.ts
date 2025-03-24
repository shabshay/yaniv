import {Component, Input, OnInit} from '@angular/core';
import {Card, cardsScore, getSortedCards, Player} from '../game/api/game.model';

@Component({
    selector: 'app-opponent',
    templateUrl: './opponent.component.html',
    styleUrls: ['./opponent.component.scss'],
    standalone: false
})
export class OpponentComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  showCards = false;

  @Input()
  isCurrentPlayer = false;

  @Input()
  opponentClass?: string;

  @Input()
  cardsClass?: string;

  cardsScore = cardsScore;

  constructor() {
  }

  ngOnInit(): void {
  }

  get sortedCard(): Card[] | undefined {
    return getSortedCards(this.player.cards);
  }
}
