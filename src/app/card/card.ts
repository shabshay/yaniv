export enum CardSymbolEnum {
  Hearts = 'Hearts',
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
  Spades = 'Spades',
  Joker = 'Joker'
}

export interface Card {
  value: number;
  symbol: CardSymbol;
}

export interface CardSymbol {
  icon: string;
  color: string;
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
    icon: '🃏',
    color: 'red'
  }],
]);
