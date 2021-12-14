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
      return (card1.value.order - card2.value.order)
        || ((card1.symbol.icon < card2.symbol.icon) ? -1 : 1);
    });
  }

  onCardClick(card: Card): void {
    card.selected = !card.selected && this.isLegalMove(card);
  }

  private isLegalMove(card: Card): boolean {
    if (card.value.order === 0) {
      return true;
    }
    const selectedCards: Card[] | undefined = this.cards?.filter(c => c.selected);
    if (selectedCards?.length) {
      const selectedWithCard = [...selectedCards, card];
      return this.isStraightCards(selectedWithCard) || this.cardsHasSameValue(selectedWithCard);
    }
    return true;
  }

  private isStraightCards(cards: Card[]): boolean {
    let numOfJokers = cards.filter(card => card.value.order === 0)?.length ?? 0;
    const cardsWithoutJokers = cards.filter(card => card.value.order !== 0);
    return cardsWithoutJokers
      .sort((a, b) => a.value.order - b.value.order)
      .every((card, i) => {
        if (i === 0) {
          return true;
        }
        // validate cards symbol are the same
        if (card.symbol !== cardsWithoutJokers[0].symbol) {
          return false;
        }
        // validate order
        if (card.value.order === cardsWithoutJokers[i - 1].value.order + 1) {
          return true;
        }
        // validate order with jokers
        if (numOfJokers === 2) {
          if (card.value.order === cardsWithoutJokers[i - 1].value.order + 3) {
            numOfJokers = 0;
            return true;
          }
        }
        // validate order with joker
        if (numOfJokers) {
          if (card.value.order === cardsWithoutJokers[i - 1].value.order + 2) {
            numOfJokers--;
            return true;
          }
        }
        return false;
      });
  }

  private cardsHasSameValue(cards: Card[]): boolean {
    const cardsWithoutJokers = cards.filter(card => card.value.order !== 0);
    return cardsWithoutJokers.every(card => card.value.order === cardsWithoutJokers[0].value.order);
  }
}
