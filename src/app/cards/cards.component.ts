import {Component, Input, OnInit} from '@angular/core';
import {Card} from '../card/card';
import {CardsValidator} from '../common/cards-validator';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.less']
})
export class CardsComponent implements OnInit {

  @Input()
  cards?: Card[];

  constructor(private cardsValidator: CardsValidator) {
  }

  ngOnInit(): void {
  }

  get sortedCard(): Card[] | undefined {
    return this.cards?.sort((card1, card2) => {
      return (card1.value.order - card2.value.order)
        || ((card1.symbol.icon < card2.symbol.icon) ? -1 : 1);
    });
  }

  onCardClick(card: Card): void {
    card.selected = !card.selected && this.cards && this.cardsValidator.isLegalCardMove(card, this.cards);
  }
}
