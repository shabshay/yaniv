import {Injectable} from '@angular/core';
import {Card, GameState, getThrownCards} from './game.model';


@Injectable()
export class GameValidator {

  selectedCardIsValid(cardToTake: Card | null, gameState: GameState): boolean {
    if (cardToTake) {
      const cardsFromPile = getThrownCards(gameState);
      const selectedCardIsFirstOrLast = cardsFromPile[0] === cardToTake || cardsFromPile[cardsFromPile.length - 1] === cardToTake;
      if (cardsFromPile.length && !this.cardsHasSameValue(cardsFromPile) && selectedCardIsFirstOrLast) {
        return false;
      }
    }
    return true;
  }

  selectedCardsAreValid(selectedCards: Card[]): boolean {
    if (selectedCards?.length) {
      return (this.isStraightCards(selectedCards) && selectedCards.length >= 3) || this.cardsHasSameValue(selectedCards);
    }
    return false;
  }

  cardSelectionIsValid(card: Card, cards: Card[]): boolean {
    if (card.value.order === 0) {
      return true;
    }
    const selectedCards: Card[] | undefined = cards?.filter(c => c.selected);
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
