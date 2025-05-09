export interface GameConfig {
  yanivThreshold: number;
  scoreLimit: number;
  cardsPerPlayer: number;
  moveTimeoutInMS: number;
  timeBetweenRoundsInMS: number;
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

export enum GameStatus {
  pending = 'pending',
  move = 'move',
  yaniv = 'yaniv',
  newRound = 'newRound',
  gameOver = 'gameOver'
}

export interface GameState {
  config: GameConfig;
  currentPlayer?: Player;
  players: Player[];
  deck: Card[];
  roundsResults: RoundResult[];
  moves: Move[];
  status: GameStatus;
}

export interface Player {
  id: string;
  name: string;
  img: string;
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
  type: string;
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
    type: 'clubs',
    color: 'black'
  }],
  [CardSymbolEnum.Diamonds, {
    icon: '♦',
    type: 'diamonds',
    color: 'red'
  }],
  [CardSymbolEnum.Spades, {
    icon: '♠',
    type: 'spades',
    color: 'black'
  }],
  [CardSymbolEnum.Hearts, {
    icon: '♥',
    type: 'hearts',
    color: 'red'
  }],
  [CardSymbolEnum.Joker, {
    icon: '🤡',
    type: 'joker',
    color: ''
  }],
]);

export const CardValuesMap: Map<CardValueEnum, CardValue> = new Map([
  [CardValueEnum.Joker, {
    text: '',
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

export function getSortedCards(cards: Card[] | undefined): Card[] | undefined {
  return cards?.sort((card1, card2) => {
    return (card1.value.order - card2.value.order)
      || ((card1.symbol.icon < card2.symbol.icon) ? -1 : 1);
  });
}
