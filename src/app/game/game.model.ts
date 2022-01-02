export interface GameConfig {
  yanivThreshold: number;
  scoreLimit: number;
  cardsPerPlayer: number;
}

export interface PlayerRoundScore {
  score: number;
  player: Player;
}

export interface RoundResult {
  winner: Player;
  asaf: boolean;
  playersRoundScores: PlayerRoundScore[];
}

export interface Move {
  cards: Card[];
}

export interface GameState {
  config: GameConfig;
  gameIsOver: boolean;
  started: boolean;
  currentPlayer?: Player;
  players: Player[];
  yaniv: boolean;
  deck: Card[];
  roundsResults: RoundResult[];
  moves: Move[];
}

export interface Player {
  id: string;
  name: string;
  isOut: boolean;
  cards?: Card[];
  totalScore: number;
  isComputerPlayer: boolean;
}

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

export function cardsScore(cards: Card[] | undefined): number {
  const cardsScores: number[] | undefined = cards?.map(card => card.value.score);
  return cardsScores?.reduce((a, b) => a + b, 0) ?? 0;
}

export function getLastMove(gameState: GameState): Move | undefined {
  return gameState.moves.length ? gameState.moves[gameState.moves.length - 1] : undefined;
}

export function getThrownCards(gameState: GameState): Card[] {
  return getLastMove(gameState)?.cards ?? [];
}
