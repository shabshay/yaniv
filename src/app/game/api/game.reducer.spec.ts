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
    expect(winnersResult.asaf).toBe(false);
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
    expect(winnersResult.asaf).toBe(true);
    expect(winnersResult.winner.id === yanivPlayer.id).toBe(false);
  });

  it('Yaniv without Asaf - caller wins and gets 0 points', () => {
    const testState = gameReducer.startNewRound(gameState, player1);
    player1.cards = [];
    player2.cards = [{symbol: {} as CardSymbol, value: {score: 5} as CardValue}];

    const newState = gameReducer.yaniv(testState);
    const updatedPlayer1 = newState.players.filter(player => player.id === player1.id)[0];
    const updatedPlayer2 = newState.players.filter(player => player.id === player2.id)[0];
    expect(newState.roundsResults[0].asaf).toBe(false);
    expect(newState.roundsResults[0].winner.id).toEqual(player1.id);
    expect(updatedPlayer1.totalScore).toEqual(0);
    expect(updatedPlayer2.totalScore).toEqual(5);
  });

  it('Yaniv with Asaf - caller gets penalty, winner gets 0 points', () => {
    const testState = gameReducer.startNewRound(gameState, player1);
    player1.cards = [{symbol: {} as CardSymbol, value: {score: 7} as CardValue}];
    player2.cards = [{symbol: {} as CardSymbol, value: {score: 5} as CardValue}];

    const newState = gameReducer.yaniv(testState);

    expect(newState.roundsResults[0].asaf).toBe(true);
    expect(newState.roundsResults[0].winner.id).toEqual(player2.id);
    expect(player1.totalScore).toEqual(37); // 7 points + 30 penalty
    expect(player2.totalScore).toEqual(0);
  });

  it('Yaniv with Asaf and tied scores - caller gets penalty, random winner chosen', () => {
    const testState = gameReducer.startNewRound(gameState, player1);
    player1.cards = [{symbol: {} as CardSymbol, value: {score: 7} as CardValue}];
    player2.cards = [{symbol: {} as CardSymbol, value: {score: 7} as CardValue}];
    player3.cards = [{symbol: {} as CardSymbol, value: {score: 8} as CardValue}];

    const newState = gameReducer.yaniv(testState);

    expect(newState.roundsResults[0].asaf).toBe(true);
    expect(newState.roundsResults[0].winner.id).not.toEqual(player1.id);
    expect(player1.totalScore).toEqual(37);
    const possibleWinners = [player2.id];
    expect(possibleWinners).toContain(newState.roundsResults[0].winner.id);
    expect(player2.totalScore).toEqual(0);
  });
});
