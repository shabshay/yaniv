import {Component, Input, OnInit} from '@angular/core';
import {Card, getSortedCards, Player, cardsScore} from '../game/game.model';

@Component({
  selector: 'app-opponent',
  templateUrl: './opponent.component.html',
  styleUrls: ['./opponent.component.scss']
})
export class OpponentComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  showCards = false;

  cardsScore = cardsScore;

  constructor() { }

  ngOnInit(): void {
  }

  get sortedCard(): Card[] | undefined {
    return getSortedCards(this.player.cards);
  }
}
