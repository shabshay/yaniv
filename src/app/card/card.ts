export enum CardSymbol {
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
