import {GameReducer} from './game.reducer';
import {CardSymbol, CardValue, GameConfig, Player} from './game.model';

const gameReducer = new GameReducer();

const config = {
  yanivThreshold: 7,
  scoreLimit: 50,
  cardsPerPlayer: 5,
  moveTimeoutInMS: 15000,
  timeBetweenRoundsInMS: 5000
} as GameConfig;

const player1 = {
  name: 'player1',
  id: 'player1',
  img: '../../assets/avatar1.png',
  isComputerPlayer: false
} as Player;

const player2 = {
  name: 'player2',
  id: 'player2',
  img: '../../assets/avatar1.png',
  isComputerPlayer: false
} as Player;

const player3 = {
  name: 'player3',
  id: 'player3',
  img: '../../assets/avatar1.png',
  isComputerPlayer: false
} as Player;

const player4 = {
  name: 'player4',
  id: 'player4',
  img: '../../assets/avatar1.png',
  isComputerPlayer: false
} as Player;

let gameState = gameReducer.newGame(config, player1);
gameState = gameReducer.addPlayer(gameState, player2);
gameState = gameReducer.addPlayer(gameState, player3);
gameState = gameReducer.addPlayer(gameState, player4);
gameState = gameReducer.startGame(gameState);

describe('GameReducer', () => {
  it('getWinners should return winner without asaf', () => {
    const newGameState = gameReducer.startNewRound(gameState, gameState.players[0]);
    const yanivPlayer = newGameState.players[0];
    yanivPlayer.cards = [];
    const otherPlayers = newGameState.players.filter(player => player.id !== yanivPlayer.id);
    otherPlayers.forEach(player => player.cards?.push({
      symbol: {} as CardSymbol,
      value: {
        score: 1
      } as CardValue
    }));
    const winnersResult = gameReducer.getWinners(otherPlayers, yanivPlayer);
    expect(winnersResult.asaf).toBeFalse();
    expect(winnersResult.winner.id).toEqual(yanivPlayer.id);
  });

  it('getWinners should return winner with asaf', () => {
    const newGameState = gameReducer.startNewRound(gameState, gameState.players[0]);
    const yanivPlayer = newGameState.players[0];
    const otherPlayers = newGameState.players.filter(player => player.id !== yanivPlayer.id);
    yanivPlayer.cards?.push({
      symbol: {} as CardSymbol,
      value: {
        score: 1
      } as CardValue
    });
    otherPlayers.forEach(player => player.cards = []);
    const winnersResult = gameReducer.getWinners(otherPlayers, yanivPlayer);
    expect(winnersResult.asaf).toBeTrue();
    expect(winnersResult.winner.id === yanivPlayer.id).toBeFalse();
  });
});
