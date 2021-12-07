import {Component, Input, OnInit} from '@angular/core';
import {Card} from '../card/card';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.less']
})
export class CardsComponent implements OnInit {

  @Input()
  cards?: Card[];

  constructor() {
  }

  ngOnInit(): void {
  }

  get sortedCard(): Card[] | undefined {
    return this.cards?.sort((card1, card2) => {
      return card1.value - card2.value || ((card1.symbol.icon < card2.symbol.icon) ? -1 : 1);
    });
  }

  onCardClick(card: Card): void {
    card.selected = !card.selected && this.isLegalMove(card);
  }

  private isLegalMove(card: Card): boolean {
    const selectedCards: Card[] | undefined = this.cards?.filter(c => c.selected);
    if (selectedCards?.length) {
      const selectedWithCard = [...selectedCards, card];
      return this.isStraightCards(selectedWithCard) || this.isSameValueCards(selectedWithCard);
    }
    return true;
  }

  private isStraightCards(cards: Card[]): boolean {
    return cards
      .sort((a, b) => a.value - b.value)
      .every((card, i) => (i === 0) ||
        (card.symbol === cards[0].symbol && card.value === cards[i - 1].value + 1));
  }

  private isSameValueCards(cards: Card[]): boolean {
    return cards.every(card => card.value === cards[0].value);
  }
}
