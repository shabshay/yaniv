import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Player, cardsScore, Card, getSortedCards} from '../game/game.model';
import {GameValidator} from '../game/game.validator';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  isCurrentPlayer!: boolean;

  @Input()
  yanivThreshold!: number;

  @Output()
  yanivClick: EventEmitter<any> = new EventEmitter<any>();

  cardsScore = cardsScore;

  constructor(private cardsValidator: GameValidator) {
  }

  ngOnInit(): void {
  }

  onYanivClick(): void {
    this.yanivClick.emit();
  }

  get sortedCard(): Card[] | undefined {
    return getSortedCards(this.player.cards);
  }

  onCardClick(card: Card): void {
    card.selected = !card.selected && this.player.cards && this.cardsValidator.cardSelectionIsValid(card, this.player.cards);
  }
}
