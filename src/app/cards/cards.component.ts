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
    if (card.value === 0) {
      return true;
    }
    const selectedCards: Card[] | undefined = this.cards?.filter(c => c.selected);
    if (selectedCards?.length) {
      const selectedWithCard = [...selectedCards, card];
      return this.isStraightCards(selectedWithCard) || this.isSameValueCards(selectedWithCard);
    }
    return true;
  }

  private isStraightCards(cards: Card[]): boolean {
    let numOfJokers = cards.filter(card => card.value === 0)?.length ?? 0;
    const cardsWithoutJokers = cards.filter(card => card.value !== 0);
    return cardsWithoutJokers
      .sort((a, b) => a.value - b.value)
      .every((card, i) => {
        if (i === 0){
          return true;
        }
        // verify cards symbol are the same
        if (card.symbol !== cardsWithoutJokers[0].symbol) {
          return false;
        }
        // verify serial
        if (card.value === cardsWithoutJokers[i - 1].value + 1) {
          return true;
        }
        // verify serial with jokers
        if (numOfJokers === 2){
          if (card.value === cardsWithoutJokers[i - 1].value + 3) {
            numOfJokers = 0;
            return true;
          }
        }
        // verify serial with joker
        if (numOfJokers) {
          if (card.value === cardsWithoutJokers[i - 1].value + 2) {
            numOfJokers--;
            return true;
          }
        }
        return false;
      });
  }

  private isSameValueCards(cards: Card[]): boolean {
    const cardsWithoutJokers = cards.filter(card => card.value !== 0);
    return cardsWithoutJokers.every(card => card.value === cardsWithoutJokers[0].value);
  }
}
