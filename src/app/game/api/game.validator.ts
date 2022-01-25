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
      return (this.asStraightCards(selectedCards).length >= 3) || this.cardsHasSameValue(selectedCards);
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
      return this.cardsHasSameValue(selectedWithCard) || this.asStraightCards(selectedWithCard).length > 0;
    }
    return true;
  }

  asStraightCards(cards: Card[]): Card[] {
    const cardsWithoutJokers = cards.filter(card => card.value.order !== 0);
    if (!this.cardsHasSameSymbol(cardsWithoutJokers)) {
      return [];
    }
    const sortedCardsWithoutJokers = cardsWithoutJokers.sort((a, b) => a.value.order - b.value.order);
    const jokers = cards.filter(card => card.value.order === 0);
    const sortedCards: Card[] = [];
    let prevCard: Card | undefined;
    for (const card of sortedCardsWithoutJokers) {
      if (!prevCard) {
        sortedCards.push(card);
        prevCard = card;
        continue;
      }
      let jokersOffset = 0;
      while (jokers?.length && card.value.order - 1 - jokersOffset !== prevCard?.value.order) {
        jokersOffset++;
        sortedCards.push(jokers.pop() as Card);
      }
      if (card.value.order - 1 - jokersOffset !== prevCard?.value.order) {
        return [];
      }
      prevCard = card;
      sortedCards.push(card);
      jokersOffset = 0;
    }

    while (jokers.length) {
      sortedCards.push(jokers.pop() as Card);
    }
    return sortedCards;
  }

  private cardsHasSameValue(cards: Card[]): boolean {
    const cardsWithoutJokers = cards.filter(card => card.value.order !== 0);
    return cardsWithoutJokers.every(card => card.value.order === cardsWithoutJokers[0].value.order);
  }

  private cardsHasSameSymbol(cards: Card[]): boolean {
    const cardsWithoutJokers = cards.filter(card => card.value.order !== 0);
    return cardsWithoutJokers.every(card => card.symbol === cardsWithoutJokers[0].symbol);
  }
}
