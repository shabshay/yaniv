import {Card, GameState, Player, RoundResult} from '../game/api/game.model';
import {PublicPlayerSummary, SanitizedGameState, SanitizedPlayer, SanitizedRoundResult} from './online.model';

// Placeholder face for cards whose identity must not be revealed (opponents' hands, the deck).
// The UI always renders these flipped (card back) so the face values are never shown.
const HIDDEN_CARD: Card = {
  value: {text: '', score: 0, order: 0},
  symbol: {icon: '', type: 'hidden', color: ''},
  selected: false
};

export function buildPlaceholderCards(count: number): Card[] {
  return Array.from({length: Math.max(count, 0)}, () => ({...HIDDEN_CARD}));
}

function toPublicPlayerSummary(player: Player): PublicPlayerSummary {
  return {
    id: player.id,
    name: player.name,
    img: player.img,
    isOut: player.isOut,
    totalScore: player.totalScore,
    isComputerPlayer: player.isComputerPlayer
  };
}

function toSanitizedPlayer(player: Player): SanitizedPlayer {
  const {cards, ...publicFields} = player;
  return {...publicFields, cardsCount: cards?.length ?? 0};
}

function sanitizeRoundResult(roundResult: RoundResult): SanitizedRoundResult {
  return {
    winner: toPublicPlayerSummary(roundResult.winner),
    asaf: roundResult.asaf,
    playersRoundScores: roundResult.playersRoundScores.map(playerRoundScore => ({
      score: playerRoundScore.score,
      player: toPublicPlayerSummary(playerRoundScore.player)
    }))
  };
}

/**
 * Produces the shape of GameState that is safe to publish to every room participant: no deck
 * contents and no player hands (top-level or nested inside round results).
 */
export function sanitizeGameState(gameState: GameState): SanitizedGameState {
  return {
    config: gameState.config,
    currentPlayer: gameState.currentPlayer ? toSanitizedPlayer(gameState.currentPlayer) : undefined,
    players: gameState.players.map(toSanitizedPlayer),
    deckCount: gameState.deck.length,
    roundsResults: gameState.roundsResults.map(sanitizeRoundResult),
    moves: gameState.moves,
    status: gameState.status
  };
}

/**
 * Rebuilds a renderable GameState from the sanitized public state: the viewer's own hand (read
 * from their private hand document) is restored in full, while every other player's cards - and
 * the deck - become face-down placeholders that only carry the correct count.
 */
export function mergeLocalHand(sanitized: SanitizedGameState, localPlayerId: string, localHand: Card[] | undefined): GameState {
  const players: Player[] = sanitized.players.map(player => ({
    id: player.id,
    name: player.name,
    img: player.img,
    isOut: player.isOut,
    totalScore: player.totalScore,
    isComputerPlayer: player.isComputerPlayer,
    cards: player.id === localPlayerId
      ? localHand
      : (player.isOut ? undefined : buildPlaceholderCards(player.cardsCount))
  }));

  return {
    config: sanitized.config,
    currentPlayer: sanitized.currentPlayer ? players.find(player => player.id === sanitized.currentPlayer?.id) : undefined,
    players,
    deck: buildPlaceholderCards(sanitized.deckCount),
    roundsResults: sanitized.roundsResults,
    moves: sanitized.moves,
    status: sanitized.status
  };
}
