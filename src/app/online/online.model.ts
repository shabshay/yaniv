import {Card, GameConfig, GameState, GameStatus, Move, Player} from '../game/api/game.model';
import {Timestamp} from 'firebase/firestore';

export const MIN_ONLINE_PLAYERS = 2;
export const MAX_ONLINE_PLAYERS = 4;
export const MAX_ONLINE_CARDS_PER_PLAYER = 10;

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

/** A publicly shared player. Cards are included only while a completed round is being shown. */
export type SanitizedPlayer = Omit<Player, 'cards'> & { cardsCount: number; cards?: Card[] };

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

/** The public GameState shape. Hands are present only while a completed round is being shown. */
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
  expiresAt: Timestamp;
}

/** Host-only document at rooms/{code}/private/state holding the full authoritative GameState. */
export interface PrivateRoomState {
  game: GameState;
  updatedAt: number;
  expiresAt: Timestamp;
}

/** Per-player document at rooms/{code}/hands/{uid}, readable only by that uid and the host. */
export interface HandDoc {
  cards: Card[];
  updatedAt: number;
  expiresAt: Timestamp;
}

/** Ephemeral per-player heartbeat at rooms/{code}/presence/{uid}. */
export interface PresenceDoc {
  uid: string;
  lastSeenAt: number;
  expiresAt: Timestamp;
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
  expiresAt: Timestamp;
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

export function isValidRoomAction(value: unknown): value is RoomActionData {
  if (!isRecord(value)
    || typeof value.uid !== 'string'
    || !value.uid
    || typeof value.createdAt !== 'number'
    || !Number.isSafeInteger(value.createdAt)
    || typeof value.processed !== 'boolean'
    || !(value.expiresAt instanceof Timestamp)
  ) {
    return false;
  }
  switch (value.type) {
    case 'join':
      return typeof value.name === 'string' && typeof value.img === 'string';
    case 'start':
    case 'yaniv':
      return true;
    case 'move':
      return Array.isArray(value.cards)
        && value.cards.length > 0
        && value.cards.length <= MAX_ONLINE_CARDS_PER_PLAYER
        && value.cards.every(isCardRef)
        && (value.cardToTake === null || isCardRef(value.cardToTake));
    default:
      return false;
  }
}

function isCardRef(value: unknown): value is CardRef {
  return isRecord(value)
    && typeof value.valueOrder === 'number'
    && Number.isInteger(value.valueOrder)
    && typeof value.symbolType === 'string'
    && typeof value.symbolColor === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export type OnlineRoomErrorReason =
  | 'not-found'
  | 'room-full'
  | 'already-started'
  | 'invalid-code'
  | 'invalid-config'
  | 'invalid-name'
  | 'timeout'
  | 'not-signed-in';

export class OnlineRoomError extends Error {
  constructor(message: string, public readonly reason: OnlineRoomErrorReason) {
    super(message);
    this.name = 'OnlineRoomError';
  }
}
