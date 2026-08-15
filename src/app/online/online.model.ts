import {Card, GameConfig, GameState, GameStatus, Move, Player} from '../game/api/game.model';

export const MIN_ONLINE_PLAYERS = 2;
export const MAX_ONLINE_PLAYERS = 4;

export enum RoomStatus {
  lobby = 'lobby',
  active = 'active',
  closed = 'closed'
}

export interface RoomParticipant {
  uid: string;
  name: string;
  img: string;
  joinedAt: number;
}

/** A Player as it may safely be shared with every client: never carries hidden card data. */
export type SanitizedPlayer = Omit<Player, 'cards'> & { cardsCount: number };

/** Minimal public identity of a player, used inside round results so hands never leak there either. */
export interface PublicPlayerSummary {
  id: string;
  name: string;
  img: string;
  isOut: boolean;
  totalScore: number;
  isComputerPlayer: boolean;
}

export interface SanitizedPlayerRoundScore {
  score: number;
  player: PublicPlayerSummary;
}

export interface SanitizedRoundResult {
  winner: PublicPlayerSummary;
  asaf: boolean;
  playersRoundScores: SanitizedPlayerRoundScore[];
}

/** The shape of GameState that is safe to publish to every participant (no deck, no hands). */
export interface SanitizedGameState {
  config: GameConfig;
  currentPlayer?: SanitizedPlayer;
  players: SanitizedPlayer[];
  deckCount: number;
  roundsResults: SanitizedRoundResult[];
  moves: Move[];
  status: GameStatus;
}

/** Public document at rooms/{code}. Readable by any signed-in user who knows the room code. */
export interface PublicRoomState {
  code: string;
  hostId: string;
  status: RoomStatus;
  createdAt: number;
  participants: Record<string, RoomParticipant>;
  playerOrder: string[];
  game: SanitizedGameState | null;
}

/** Host-only document at rooms/{code}/private/state holding the full authoritative GameState. */
export interface PrivateRoomState {
  game: GameState;
  updatedAt: number;
}

/** Per-player document at rooms/{code}/hands/{uid}, readable only by that uid and the host. */
export interface HandDoc {
  cards: Card[];
  updatedAt: number;
}

/** Identifies a physical card without relying on object identity, safe to send over the wire. */
export interface CardRef {
  valueOrder: number;
  symbolType: string;
  symbolColor: string;
}

interface BaseActionData {
  uid: string;
  createdAt: number;
  processed: boolean;
}

export interface JoinActionData extends BaseActionData {
  type: 'join';
  name: string;
  img: string;
}

export interface StartActionData extends BaseActionData {
  type: 'start';
}

export interface MoveActionData extends BaseActionData {
  type: 'move';
  cards: CardRef[];
  cardToTake: CardRef | null;
}

export interface YanivActionData extends BaseActionData {
  type: 'yaniv';
}

export type RoomActionData = JoinActionData | StartActionData | MoveActionData | YanivActionData;

export type OnlineRoomErrorReason =
  | 'not-found'
  | 'room-full'
  | 'already-started'
  | 'invalid-code'
  | 'invalid-name'
  | 'timeout'
  | 'not-signed-in';

export class OnlineRoomError extends Error {
  constructor(message: string, public readonly reason: OnlineRoomErrorReason) {
    super(message);
    this.name = 'OnlineRoomError';
  }
}
