import {Card, CardSymbol, CardSymbolEnum, CardSymbolsMap, CardValue, CardValueEnum, CardValuesMap} from './game.model';
import {GameValidator} from './game.validator';

const validator = new GameValidator();

describe('GameValidator', () => {
  it('asStraightCards should return straight cards ordered', () => {
    const cards: Card[] = [
      {value: CardValuesMap.get(CardValueEnum.Six) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Five) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Seven) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
    ];

    const cardsResult = validator.asStraightCards(cards);
    const orderedValues = cardsResult.map(card => card.value.order);
    expect(orderedValues).toEqual([5, 6, 7]);
  });

  it('asStraightCards should return empty when its not straight cards', () => {
    const cards: Card[] = [
      {value: CardValuesMap.get(CardValueEnum.Six) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Ace) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Seven) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
    ];

    const cardsResult = validator.asStraightCards(cards);
    expect(cardsResult).toEqual([]);
  });

  it('asStraightCards should return empty when its not same symbols', () => {
    const cards: Card[] = [
      {value: CardValuesMap.get(CardValueEnum.Six) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Five) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Diamonds) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Seven) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
    ];

    const cardsResult = validator.asStraightCards(cards);
    expect(cardsResult).toEqual([]);
  });

  it('asStraightCards should return straight cards ordered with jokers', () => {
    const cards: Card[] = [
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Five) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Seven) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Ten) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
    ];

    const cardsResult = validator.asStraightCards(cards);
    const orderedValues = cardsResult.map(card => card.value.order);
    expect(orderedValues).toEqual([5, 0, 7, 0, 0, 10, 0]);
  });

  it('asStraightCards with jokers should return empty cards when not straight', () => {
    const cards: Card[] = [
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Ten) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Seven) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Joker) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol},
      {value: CardValuesMap.get(CardValueEnum.Ace) as CardValue, symbol: CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol},
    ];

    const cardsResult = validator.asStraightCards(cards);
    expect(cardsResult).toEqual([]);
  });
});

