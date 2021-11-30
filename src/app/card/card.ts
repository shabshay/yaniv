export enum CardSymbol {
  Hearts = 'Hearts',
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
  Spades = 'Spades'
}

export interface Card {
  value: number;
  symbol: CardSymbol;
}
