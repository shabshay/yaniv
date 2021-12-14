export enum CardSymbolEnum {
  Hearts = 'Hearts',
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
  Spades = 'Spades',
  Joker = 'Joker'
}

export enum CardValueEnum {
  Joker,
  Ace,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King
}

export interface Card {
  value: CardValue;
  symbol: CardSymbol;
  selected?: boolean;
}

export interface CardSymbol {
  icon: string;
  color: string;
}

export interface CardValue {
  text: string;
  score: number;
  order: number;
}

export const CardSymbolsMap: Map<CardSymbolEnum, CardSymbol> = new Map([
  [CardSymbolEnum.Clubs, {
    icon: '♣',
    color: 'black'
  }],
  [CardSymbolEnum.Diamonds, {
    icon: '♦',
    color: 'red'
  }],
  [CardSymbolEnum.Spades, {
    icon: '♠',
    color: 'black'
  }],
  [CardSymbolEnum.Hearts, {
    icon: '♥',
    color: 'red'
  }],
  [CardSymbolEnum.Joker, {
    icon: '🤡',
    color: ''
  }],
]);

export const CardValuesMap: Map<CardValueEnum, CardValue> = new Map([
  [CardValueEnum.Joker, {
    text: 'Joker',
    score: 0,
    order: 0
  }],
  [CardValueEnum.Ace, {
    text: 'A',
    score: 1,
    order: 1
  }],
  [CardValueEnum.Two, {
    text: '2',
    score: 2,
    order: 2
  }],
  [CardValueEnum.Three, {
    text: '3',
    score: 3,
    order: 3
  }],
  [CardValueEnum.Four, {
    text: '4',
    score: 4,
    order: 4
  }],
  [CardValueEnum.Five, {
    text: '5',
    score: 5,
    order: 5
  }],
  [CardValueEnum.Six, {
    text: '6',
    score: 6,
    order: 6
  }],
  [CardValueEnum.Seven, {
    text: '7',
    score: 7,
    order: 7
  }],
  [CardValueEnum.Eight, {
    text: '8',
    score: 8,
    order: 8
  }],
  [CardValueEnum.Nine, {
    text: '9',
    score: 9,
    order: 9
  }],
  [CardValueEnum.Ten, {
    text: '10',
    score: 10,
    order: 10
  }],
  [CardValueEnum.Jack, {
    text: 'J',
    score: 10,
    order: 11
  }],
  [CardValueEnum.Queen, {
    text: 'Q',
    score: 10,
    order: 12
  }],
  [CardValueEnum.King, {
    text: 'K',
    score: 10,
    order: 13
  }],
]);
