import {
  Card,
  CardSymbol,
  CardSymbolEnum,
  CardSymbolsMap,
  CardValue,
  CardValueEnum,
  CardValuesMap,
  GameState,
  GameStatus
} from './game.model';
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

  it('asStraightCards accepts deserialized cards with equivalent suit objects', () => {
    const hearts = CardSymbolsMap.get(CardSymbolEnum.Hearts) as CardSymbol;
    const cards: Card[] = [
      {value: CardValuesMap.get(CardValueEnum.Three) as CardValue, symbol: {...hearts}},
      {value: CardValuesMap.get(CardValueEnum.Four) as CardValue, symbol: {...hearts}},
      {value: CardValuesMap.get(CardValueEnum.Five) as CardValue, symbol: {...hearts}}
    ];

    expect(validator.selectedCardsAreValid(cards)).toBe(true);
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

  it('allows taking an edge card from a straight pile', () => {
    const pile = straightPile();
    const state = gameStateWithPile(pile);

    expect(validator.selectedCardIsValid(pile[0], state)).toBe(true);
    expect(validator.selectedCardIsValid(pile[pile.length - 1], state)).toBe(true);
  });

  it('rejects taking a middle card from a straight pile', () => {
    const pile = straightPile();

    expect(validator.selectedCardIsValid(pile[1], gameStateWithPile(pile))).toBe(false);
  });

  it('allows taking any card from a same-value pile', () => {
    const pile = [
      card(CardValueEnum.Seven, CardSymbolEnum.Hearts),
      card(CardValueEnum.Seven, CardSymbolEnum.Diamonds),
      card(CardValueEnum.Seven, CardSymbolEnum.Clubs)
    ];

    expect(validator.selectedCardIsValid(pile[1], gameStateWithPile(pile))).toBe(true);
  });
});

function straightPile(): Card[] {
  return [
    card(CardValueEnum.Five, CardSymbolEnum.Hearts),
    card(CardValueEnum.Six, CardSymbolEnum.Hearts),
    card(CardValueEnum.Seven, CardSymbolEnum.Hearts)
  ];
}

function card(value: CardValueEnum, symbol: CardSymbolEnum): Card {
  return {
    value: CardValuesMap.get(value) as CardValue,
    symbol: CardSymbolsMap.get(symbol) as CardSymbol
  };
}

function gameStateWithPile(pile: Card[]): GameState {
  return {
    config: {
      yanivThreshold: 7,
      scoreLimit: 50,
      cardsPerPlayer: 5,
      moveTimeoutInMS: 30000,
      timeBetweenRoundsInMS: 3000
    },
    players: [],
    deck: [],
    roundsResults: [],
    moves: [{cards: pile}],
    status: GameStatus.move
  };
}
