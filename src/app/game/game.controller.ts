import {GameValidator} from './game.validator';
import {GameEvents} from './game.events';
import {Injectable} from '@angular/core';
import {Card, cardsScore, GameConfig, GameState, GameStatus, getThrownCards, Player} from './game.model';
import {GameReducer} from './game.reducer';

@Injectable()
export class GameController {

  private autoMoveTimer?: number;

  constructor(
    private gameValidator: GameValidator,
    private gameEvents: GameEvents,
    private gameReducer: GameReducer
  ) {
  }

  newGame(config: GameConfig, player: Player): GameState {
    const gameState = this.gameReducer.newGame(config, player);
    this.updateGameState(gameState);
    return gameState;
  }

  addPlayer(gameState: GameState, player: Player): void {
    if (gameState.status !== GameStatus.pending || gameState.players.length > 3) {
      return;
    }
    const newState = this.gameReducer.addPlayer(gameState, player);
    this.updateGameState(newState);
  }

  startGame(gameState: GameState): void {
    if (gameState.players.length < 2 || ![GameStatus.pending, GameStatus.gameOver].includes(gameState.status)) {
      return;
    }
    const newState = this.gameReducer.startGame(gameState);
    this.updateGameState(newState);
  }

  makeMove(gameState: GameState, thrownCards: Card[], cardToTake: Card | null = null): void {
    if ([GameStatus.gameOver, GameStatus.yaniv, GameStatus.pending].includes(gameState.status)
      || !this.gameValidator.selectedCardsAreValid(thrownCards)
      || !this.gameValidator.selectedCardIsValid(cardToTake, gameState)
    ) {
      return;
    }
    if (this.autoMoveTimer) {
      clearTimeout(this.autoMoveTimer);
      this.autoMoveTimer = undefined;
    }
    const newState = this.gameReducer.makeMove(gameState, thrownCards, cardToTake);
    this.updateGameState(newState);
  }

  yaniv(gameState: GameState): void {
    if (cardsScore(gameState.currentPlayer?.cards) > gameState.config.yanivThreshold
      || [GameStatus.gameOver, GameStatus.yaniv].includes(gameState.status)
    ) {
      return;
    }
    const newState = this.gameReducer.yaniv(gameState);
    this.updateGameState(newState);
    const result = newState.roundsResults[newState.roundsResults.length - 1];
    this.gameEvents.onYaniv(result);
    this.startNewRound(newState);
  }

  private updateGameState(gameState: GameState): void {
    this.gameEvents.onGameStateUpdate(gameState);
    this.initComputerMove(gameState);
    this.initAutoMoveTimer(gameState);
  }

  private initAutoMoveTimer(gameState: GameState): void {
    if (gameState.currentPlayer?.isComputerPlayer ||
      [GameStatus.gameOver, GameStatus.yaniv, GameStatus.pending].includes(gameState.status)
    ) {
      return;
    }
    this.autoMoveTimer = setTimeout(() => {
      this.makeAutoMove(gameState);
    }, gameState.config.moveTimeoutInMS + 1000);
  }

  private startNewRound(gameState: GameState): void {
    setTimeout(() => {
      if (gameState.status !== GameStatus.gameOver) {
        const newState = this.gameReducer.startNewRound(gameState, gameState.roundsResults[gameState.roundsResults.length - 1].winner);
        this.updateGameState(newState);
      }
    }, gameState.config.timeBetweenRoundsInMS);
  }

  private initComputerMove(gameState: GameState): void {
    if (!gameState.currentPlayer?.isComputerPlayer || [GameStatus.yaniv, GameStatus.gameOver].includes(gameState.status)) {
      return;
    }
    setTimeout(() => {
      this.makeAutoMove(gameState);
    }, Math.random() * 2000 + 1000);
  }

  private makeAutoMove(gameState: GameState): void {
    if (cardsScore(gameState.currentPlayer?.cards) <= gameState.config.yanivThreshold) {
      this.yaniv(gameState);
    } else {
      const cards: Card[] = this.maxDuplicatedCards(gameState.currentPlayer?.cards as Card[]);
      const thrownCards = getThrownCards(gameState);
      const cardToTake = getThrownCards(gameState).length &&
      (thrownCards[0].value.score < 4 || !gameState.deck.length)
        ? thrownCards[0] : null;
      this.makeMove(gameState, cards, cardToTake);
    }
  }

  private maxDuplicatedCards(cards: Card[]): Card[] {
    const counts = new Map<number, Card[]>();
    let max = 0;
    let res: Card[] = [];
    cards.forEach(card => {
      const sameOrderCards: Card[] = counts.get(card.value.order) ?? [];
      const updatedSameOrderCards = [...sameOrderCards, card];
      counts.set(card.value.order, updatedSameOrderCards);
      const cardsCount = updatedSameOrderCards.length * card.value.score;
      if (cardsCount > max) {
        max = cardsCount;
        res = updatedSameOrderCards;
      }
    });
    return res;
  }
}
