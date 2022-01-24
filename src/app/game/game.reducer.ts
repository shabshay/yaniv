import {Injectable} from '@angular/core';
import {
  Card,
  cardsScore,
  CardSymbol,
  CardSymbolEnum,
  CardSymbolsMap,
  CardValue,
  CardValueEnum,
  CardValuesMap,
  GameConfig,
  GameState,
  GameStatus,
  getThrownCards,
  Move,
  Player,
  PlayerRoundScore,
  RoundResult
} from './game.model';


@Injectable()
export class GameReducer {

  newGame(config: GameConfig, player: Player): GameState {
    return {
      config,
      players: [player],
      deckNumberOfCards: 0,
      deck: [],
      roundsResults: [],
      moves: [],
      status: GameStatus.pending
    } as GameState;
  }

  addPlayer(gameState: GameState, player: Player): GameState {
    const newState = {...gameState};
    newState.players.push(player);
    return newState;
  }

  startGame(gameState: GameState): GameState {
    const newState = {...gameState};
    newState.status = GameStatus.running;
    newState.players.forEach(player => {
      player.totalScore = 0;
      player.isOut = false;
    });
    const startingPlayer = this.getRandomItemFromArray(newState.players);
    return this.startNewRound(newState, startingPlayer);
  }

  makeMove(gameState: GameState, thrownCards: Card[], cardToTake: Card | null = null): GameState {
    const newState = {...gameState};
    newState.status = GameStatus.move;
    const takeFromDeck = !cardToTake;
    const currentPlayer = newState.currentPlayer as Player;
    currentPlayer.cards = currentPlayer?.cards?.filter(c => !thrownCards.includes(c));
    const drawnCard = takeFromDeck ? this.getCardFromDeck(newState) : this.getCardFromPile(newState, cardToTake as Card);
    thrownCards.forEach(card => card.selected = false);
    newState.moves.push({cards: thrownCards} as Move);
    currentPlayer.cards?.push(drawnCard);
    this.setNextPlayer(newState);
    return newState;
  }

  yaniv(gameState: GameState): GameState {
    const newState = {...gameState};
    const currentPlayer = newState.currentPlayer as Player;
    const otherPlayers = this.getActivePlayers(newState).filter(player => player.id !== currentPlayer.id);
    const {asaf, winner} = this.getWinners(otherPlayers, currentPlayer);

    const playersRoundScores: PlayerRoundScore[] = this.getActivePlayers(newState).map(player => {
      let score = cardsScore(player.cards);
      if (player.id === currentPlayer.id) {
        score = asaf ? 30 + cardsScore(player.cards) : 0;
      }
      player.totalScore += score;
      return {player, score} as PlayerRoundScore;
    });

    const roundResult = {winner, asaf, playersRoundScores} as RoundResult;
    newState.roundsResults.push(roundResult);
    newState.status = this.isGameOver(gameState) ? GameStatus.gameOver : GameStatus.yaniv;
    return newState;
  }

  getWinners(otherPlayers: Player[], currentPlayer: Player): { winner: Player; asaf: boolean } {
    const otherPlayersMinScore = otherPlayers.map(player => cardsScore(player.cards)).sort()[0];
    const asaf = otherPlayersMinScore <= cardsScore(currentPlayer.cards);
    const winnerPlayers: Player[] = !asaf
      ? [currentPlayer]
      : otherPlayers.filter(player => cardsScore(player.cards) === otherPlayersMinScore);
    const winner = this.getRandomItemFromArray(winnerPlayers);
    return {asaf, winner};
  }

  startNewRound(gameState: GameState, startingPlayer: Player): GameState {
    const newState = {...gameState};
    this.updateActivePlayers(newState);
    this.dealCards(newState);
    newState.currentPlayer = startingPlayer;
    newState.status = GameStatus.newRound;
    return newState;
  }

  private updateActivePlayers(gameState: GameState): void {
    this.getActivePlayers(gameState).forEach(player => {
      if (player.totalScore > gameState.config.scoreLimit) {
        player.isOut = true;
      }
    });
  }

  private isGameOver(gameState: GameState): boolean {
    const activePlayersWithValidScore =
      this.getActivePlayers(gameState).filter(player => player.totalScore <= (gameState?.config.scoreLimit as number));
    return activePlayersWithValidScore.length < 2;
  }

  private getActivePlayers(gameState: GameState): Player[] {
    return gameState.players.filter(player => !player.isOut);
  }

  private getCardFromPile(gameState: GameState, cardToTake: Card): Card {
    return getThrownCards(gameState)?.find(card => card === cardToTake) as Card;
  }

  private getCardFromDeck(gameState: GameState): Card {
    return this.getRandomItemFromArray(gameState.deck, true);
  }

  private setNextPlayer(gameState: GameState): void {
    gameState.currentPlayer = this.getNextPlayer(gameState);
  }

  private getRandomItemFromArray<T>(array: T[], removeItem: boolean = false): T {
    const item = array[Math.floor(Math.random() * array.length)];
    if (removeItem) {
      array.splice(array.indexOf(item), 1);
    }
    return item;
  }

  private dealCards(gameState: GameState): void {
    gameState.deck = this.getShuffledDeckCards();
    gameState.players.forEach(player => {
      player.cards = player.isOut ? undefined : gameState.deck?.splice(0, gameState.config.cardsPerPlayer);
    });
    const cardToStart = this.getCardFromDeck(gameState);
    gameState.moves = [{
      cards: [cardToStart]
    }];
  }

  private getShuffledDeckCards(): Card[] {
    return this.getInitDeckCards()
      .map((value) => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}) => value);
  }

  private getInitDeckCards(): Card[] {
    const initDeck = [] as Card[];
    CardValuesMap.forEach((cardValue: CardValue, valueEnum: CardValueEnum) => {
      CardSymbolsMap.forEach((cardSymbol: CardSymbol, symbolEnum: CardSymbolEnum) => {
        if (symbolEnum !== CardSymbolEnum.Joker && valueEnum !== CardValueEnum.Joker) {
          initDeck.push({
            value: cardValue,
            symbol: cardSymbol,
            selected: false
          });
        }
      });
    });

    const jokerCardSymbol = CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol;
    const jokerCardValue = CardValuesMap.get(CardValueEnum.Joker) as CardValue;
    initDeck.push(
      {value: jokerCardValue, symbol: {...jokerCardSymbol, color: 'red'}, selected: false},
      {value: jokerCardValue, symbol: {...jokerCardSymbol, color: 'black'}, selected: false}
    );
    return initDeck;
  }

  private getNextPlayer(gameState: GameState): Player {
    const currentPlayer = gameState.currentPlayer as Player;
    const currentIndex = this.getActivePlayers(gameState).indexOf(currentPlayer);
    const nextIndex = (currentIndex + 1) % this.getActivePlayers(gameState).length;
    return this.getActivePlayers(gameState)[nextIndex];
  }
}
