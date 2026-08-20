import {Card, GameConfig, GameState, GameStatus, Player, RoundResult} from '../game/api/game.model';
import {buildPlaceholderCards, mergeLocalHand, sanitizeGameState} from './game-state-sanitizer';

function card(order: number, type = 'clubs'): Card {
  return {value: {text: String(order), score: order, order}, symbol: {icon: type, type, color: 'black'}, selected: false};
}

function player(id: string, cards: Card[]): Player {
  return {id, name: `player-${id}`, img: `assets/${id}.png`, isOut: false, totalScore: 0, isComputerPlayer: false, cards};
}

const config: GameConfig = {
  yanivThreshold: 7,
  scoreLimit: 50,
  cardsPerPlayer: 5,
  moveTimeoutInMS: 10000,
  timeBetweenRoundsInMS: 5000
};

describe('game-state-sanitizer', () => {

  describe('buildPlaceholderCards', () => {

    it('creates the requested number of face-down placeholder cards', () => {
      const cards = buildPlaceholderCards(3);
      expect(cards).toHaveLength(3);
      cards.forEach(placeholder => {
        expect(placeholder.symbol.type).toBe('hidden');
      });
    });

    it('creates distinct object instances so mutating one does not affect the others', () => {
      const [first, second] = buildPlaceholderCards(2);
      first.selected = true;
      expect(second.selected).toBe(false);
    });

    it('returns an empty array for a zero or negative count', () => {
      expect(buildPlaceholderCards(0)).toEqual([]);
      expect(buildPlaceholderCards(-1)).toEqual([]);
    });
  });

  describe('sanitizeGameState', () => {

    it('strips hand cards from every player, replacing them with a count', () => {
      const player1 = player('p1', [card(1), card(2)]);
      const player2 = player('p2', [card(3)]);
      const gameState: GameState = {
        config,
        currentPlayer: player1,
        players: [player1, player2],
        deck: [card(4), card(5), card(6)],
        roundsResults: [],
        moves: [],
        status: GameStatus.move
      };

      const sanitized = sanitizeGameState(gameState);

      expect(sanitized.players.every(p => !('cards' in p))).toBe(true);
      expect(sanitized.players.find(p => p.id === 'p1')?.cardsCount).toBe(2);
      expect(sanitized.players.find(p => p.id === 'p2')?.cardsCount).toBe(1);
      expect(sanitized.currentPlayer?.cardsCount).toBe(2);
      expect(sanitized.deckCount).toBe(3);
      expect('deck' in sanitized).toBe(false);
    });

    it('reveals every hand during Yaniv so participants can verify the scores', () => {
      const player1 = player('p1', [card(1), card(2)]);
      const player2 = player('p2', [card(3)]);
      const gameState: GameState = {
        config,
        currentPlayer: player1,
        players: [player1, player2],
        deck: [card(4)],
        roundsResults: [],
        moves: [],
        status: GameStatus.yaniv
      };

      const sanitized = sanitizeGameState(gameState);

      expect(sanitized.players.find(p => p.id === 'p1')?.cards).toEqual(player1.cards);
      expect(sanitized.players.find(p => p.id === 'p2')?.cards).toEqual(player2.cards);
      expect(sanitized.currentPlayer?.cards).toEqual(player1.cards);
      expect('deck' in sanitized).toBe(false);
    });

    it('strips nested hand cards from round results (winner and every player round score)', () => {
      const player1 = player('p1', [card(1), card(2)]);
      const player2 = player('p2', [card(3)]);
      const roundResult: RoundResult = {
        winner: player1,
        asaf: false,
        playersRoundScores: [
          {score: 0, player: player1},
          {score: 10, player: player2}
        ]
      };
      const gameState: GameState = {
        config,
        players: [player1, player2],
        deck: [],
        roundsResults: [roundResult],
        moves: [],
        status: GameStatus.newRound
      };

      const sanitized = sanitizeGameState(gameState);
      const sanitizedResult = sanitized.roundsResults[0];

      expect('cards' in sanitizedResult.winner).toBe(false);
      sanitizedResult.playersRoundScores.forEach(playerRoundScore => {
        expect('cards' in playerRoundScore.player).toBe(false);
      });
    });

    it('omits currentPlayer when the game has not started', () => {
      const gameState: GameState = {
        config,
        players: [],
        deck: [],
        roundsResults: [],
        moves: [],
        status: GameStatus.pending
      };

      expect(sanitizeGameState(gameState).currentPlayer).toBeUndefined();
    });
  });

  describe('mergeLocalHand', () => {

    it('restores the local player\'s real hand from the private hand doc', () => {
      const player1 = player('p1', [card(1), card(2)]);
      const player2 = player('p2', [card(3)]);
      const gameState: GameState = {
        config,
        currentPlayer: player1,
        players: [player1, player2],
        deck: [card(4)],
        roundsResults: [],
        moves: [],
        status: GameStatus.move
      };
      const sanitized = sanitizeGameState(gameState);
      const localHand = [card(9), card(10)];

      const merged = mergeLocalHand(sanitized, 'p1', localHand);

      expect(merged.players.find(p => p.id === 'p1')?.cards).toBe(localHand);
    });

    it('replaces opponents\' cards with face-down placeholders matching their count', () => {
      const player1 = player('p1', [card(1)]);
      const player2 = player('p2', [card(2), card(3)]);
      const gameState: GameState = {
        config,
        players: [player1, player2],
        deck: [],
        roundsResults: [],
        moves: [],
        status: GameStatus.move
      };
      const sanitized = sanitizeGameState(gameState);

      const merged = mergeLocalHand(sanitized, 'p1', [card(1)]);
      const opponentCards = merged.players.find(p => p.id === 'p2')?.cards;

      expect(opponentCards).toHaveLength(2);
      opponentCards?.forEach(c => expect(c.symbol.type).toBe('hidden'));
    });

    it.each([GameStatus.yaniv, GameStatus.gameOver])(
      'restores opponents\' revealed cards during %s',
      status => {
        const player1 = player('p1', [card(1)]);
        const player2 = player('p2', [card(2), card(3)]);
        const gameState: GameState = {
          config,
          players: [player1, player2],
          deck: [],
          roundsResults: [],
          moves: [],
          status
        };
        const sanitized = sanitizeGameState(gameState);

        const merged = mergeLocalHand(sanitized, 'p1', [card(1)]);

        expect(merged.players.find(p => p.id === 'p2')?.cards).toEqual(player2.cards);
      }
    );

    it('leaves players who are already out without any cards', () => {
      const player1 = player('p1', [card(1)]);
      const player2: Player = {...player('p2', []), isOut: true};
      const gameState: GameState = {
        config,
        players: [player1, player2],
        deck: [],
        roundsResults: [],
        moves: [],
        status: GameStatus.move
      };
      const sanitized = sanitizeGameState(gameState);

      const merged = mergeLocalHand(sanitized, 'p1', [card(1)]);

      expect(merged.players.find(p => p.id === 'p2')?.cards).toBeUndefined();
    });

    it('builds face-down placeholders for the deck matching its published count', () => {
      const player1 = player('p1', [card(1)]);
      const gameState: GameState = {
        config,
        players: [player1],
        deck: [card(2), card(3), card(4)],
        roundsResults: [],
        moves: [],
        status: GameStatus.move
      };
      const sanitized = sanitizeGameState(gameState);

      const merged = mergeLocalHand(sanitized, 'p1', [card(1)]);

      expect(merged.deck).toHaveLength(3);
      merged.deck.forEach(c => expect(c.symbol.type).toBe('hidden'));
    });
  });
});
