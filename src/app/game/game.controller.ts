import {GameValidator} from './game.validator';
import {GameEvents} from './game.events';
import {Injectable} from '@angular/core';
import {Card, cardsScore, GameConfig, GameState, getThrownCards, Player} from './game.model';
import {GameReducer} from './game.reducer';

@Injectable()
export class GameController {
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
    if (gameState.started || gameState.players.length > 3) {
      return;
    }
    const newState = this.gameReducer.addPlayer(gameState, player);
    this.updateGameState(newState);
  }

  startGame(gameState: GameState): void {
    if (gameState.players.length < 2 || gameState.started) {
      return;
    }
    const newState = this.gameReducer.startGame(gameState);
    this.updateGameState(newState);
  }

  makeMove(gameState: GameState, thrownCards: Card[], cardToTake: Card | null = null): void {
    if (gameState.yaniv || gameState.gameIsOver || !gameState.started
      || !this.gameValidator.selectedCardsAreValid(thrownCards)
      || !this.gameValidator.selectedCardIsValid(cardToTake, gameState)
    ) {
      return;
    }
    const newState = this.gameReducer.makeMove(gameState, thrownCards, cardToTake);
    this.updateGameState(newState);
  }

  yaniv(gameState: GameState): void {
    if (cardsScore(gameState.currentPlayer?.cards) > gameState.config.yanivThreshold
      || gameState.gameIsOver
      || gameState.yaniv
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
  }

  private startNewRound(gameState: GameState): void {
    setTimeout(() => {
      if (!gameState.gameIsOver) {
        const newState = this.gameReducer.startNewRound(gameState, gameState.roundsResults[gameState.roundsResults.length - 1].winner);
        this.updateGameState(newState);
      }
    }, 5000);
  }

  private initComputerMove(gameState: GameState): void {
    if (!gameState.currentPlayer?.isComputerPlayer || gameState.yaniv || gameState.gameIsOver) {
      return;
    }

    setTimeout(async () => {
      if (cardsScore(gameState.currentPlayer?.cards) <= gameState.config.yanivThreshold) {
        this.yaniv(gameState);
      } else {
        const cards: Card[] = this.maxDuplicatedCards(gameState.currentPlayer?.cards as Card[]);
        const thrownCards = getThrownCards(gameState);
        const cardToTake = getThrownCards(gameState).length && thrownCards[0].value.score < 4 ? thrownCards[0] : null;
        await this.makeMove(gameState, cards, cardToTake);
      }
    }, 2000);
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