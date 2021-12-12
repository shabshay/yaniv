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
      return card1.value.score - card2.value.score || ((card1.symbol.icon < card2.symbol.icon) ? -1 : 1);
    });
  }

  onCardClick(card: Card): void {
    card.selected = !card.selected && this.isLegalMove(card);
  }

  private isLegalMove(card: Card): boolean {
    if (card.value.score === 0) {
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
    let numOfJokers = cards.filter(card => card.value.score === 0)?.length ?? 0;
    const cardsWithoutJokers = cards.filter(card => card.value.score !== 0);
    return cardsWithoutJokers
      .sort((a, b) => a.value.score - b.value.score)
      .every((card, i) => {
        if (i === 0){
          return true;
        }
        // validate cards symbol are the same
        if (card.symbol !== cardsWithoutJokers[0].symbol) {
          return false;
        }
        // validate order
        if (card.value.score === cardsWithoutJokers[i - 1].value.score + 1) {
          return true;
        }
        // validate order with jokers
        if (numOfJokers === 2){
          if (card.value.score === cardsWithoutJokers[i - 1].value.score + 3) {
            numOfJokers = 0;
            return true;
          }
        }
        // validate order with joker
        if (numOfJokers) {
          if (card.value.score === cardsWithoutJokers[i - 1].value.score + 2) {
            numOfJokers--;
            return true;
          }
        }
        return false;
      });
  }

  private cardsHasSameValue(cards: Card[]): boolean {
    const cardsWithoutJokers = cards.filter(card => card.value.score !== 0);
    return cardsWithoutJokers.every(card => card.value.score === cardsWithoutJokers[0].value.score);
  }
}
