import {IPlayer, Player} from '../player/player';
import {Card, CardSymbol, CardSymbolEnum, CardSymbolsMap, CardValue, CardValueEnum, CardValuesMap} from '../card/card';
import * as AsyncLock from 'async-lock';
import {CardsValidator} from '../common/cards-validator';
import {GameEvents} from './game.events';


export interface GameConfig {
  yanivThreshold: number;
  scoreLimit: number;
  cardsPerPlayer: number;
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

export interface GameStatus {
  config: GameConfig;
  gameIsOver: boolean;
  currentPlayer: IPlayer;
  players: IPlayer[];
  isRunning: boolean;
  thrownCards: Card[];
  deckNumberOfCards: number;
}

export class Game implements GameStatus {
  config: GameConfig;
  players: Player[];
  currentPlayer: Player;
  deck: Card[];
  isRunning = false;
  roundsResults: RoundResult[];

  private lock = new AsyncLock({maxPending: 1, timeout: 100});
  private lockKey = 'lockKey';
  private moves: Move[];

  constructor(
    config: GameConfig,
    player: Player,
    private cardsValidator: CardsValidator,
    private gameEvents: GameEvents
  ) {
    this.config = config;
    this.deck = [];
    this.players = [player];
    this.currentPlayer = player;
    this.moves = [];
    this.roundsResults = [];
  }

  get gameIsOver(): boolean {
    return this.activePlayers.filter(player => player.totalScore <= this.config.scoreLimit).length < 2;
  }

  get activePlayers(): Player[] {
    return this.players.filter(player => !player.isOut);
  }

  addPlayer(player: Player): void {
    this.players.push(player);
    this.updateGameStatus();
  }

  startGame(): void {
    if (this.players.length < 2) {
      return;
    }
    this.players.forEach(player => player.totalScore = 0);
    const startingPlayer = this.getRandomItemFromArray(this.players);
    this.startNewRound(startingPlayer);
    this.initComputerMove();
    this.updateGameStatus();
  }

  private startNewRound(startingPlayer: Player): void {
    this.updateActivePlayers();
    this.dealCards();
    this.currentPlayer = startingPlayer;
    this.updatePlayersCards();
    this.updateGameStatus();
    this.isRunning = true;
  }

  private updateActivePlayers(): void {
    this.activePlayers.forEach(player => {
      if (player.totalScore > this.config.scoreLimit) {
        player.isOut = true;
      }
    });
  }

  async makeMove(player: Player, thrownCards: Card[], cardToTake: Card | null = null): Promise<void> {
    if (this.currentPlayer?.id !== player.id || !this.cardsValidator.isLegalMove(thrownCards) || this.lock.isBusy(this.lockKey)) {
      return;
    }

    await this.lock.acquire(this.lockKey, () => {
      if (this.currentPlayer?.id !== player.id) {
        return;
      }
      const takeFromDeck = !cardToTake;
      this.currentPlayer.cards = this.currentPlayer.cards?.filter(c => !thrownCards.includes(c));
      const drawnCard = takeFromDeck ? this.getCardFromDeck() : this.getCardFromPile(cardToTake as Card);
      thrownCards.forEach(card => card.selected = false);
      this.moves.push({cards: thrownCards} as Move);
      this.currentPlayer.cards?.push(drawnCard);
      this.setNextPlayer();
      this.updatePlayersCards();
      this.updateGameStatus();
      this.initComputerMove();
    });
  }

  private updatePlayersCards(): void {
    this.players.forEach(player => {
      this.gameEvents.onPlayerCardsUpdate(player.id, player.cards ?? []);
    });
  }

  async yaniv(): Promise<void> {
    if (this.currentPlayer.cardsScore > this.config.yanivThreshold
      || this.gameIsOver
      || !this.isRunning
      || this.lock.isBusy(this.lockKey)
    ) {
      return;
    }

    await this.lock.acquire(this.lockKey, () => {
      this.isRunning = false;
      let winner = this.currentPlayer;
      const otherPlayers = this.activePlayers.filter(player => player.id !== this.currentPlayer.id);
      otherPlayers.forEach(player => {
        if (player.cardsScore <= winner.cardsScore) {
          winner = player;
        }
        return player.cardsScore;
      });

      const asaf = winner.id !== this.currentPlayer.id;
      const winnerPlayers: Player[] = this.players.filter(player => player.cardsScore === winner.cardsScore);
      if (asaf) {
        winner = this.getRandomItemFromArray(winnerPlayers);
      }

      const playersRoundScores: PlayerRoundScore[] =
        this.activePlayers.map(player => {
          let score = player.cardsScore;
          if (player.id === this.currentPlayer.id) {
            score = asaf ? 30 + player.cardsScore : 0;
          }
          player.totalScore += score;
          return {
            player,
            score
          } as PlayerRoundScore;
        });

      const roundResult = {
        winner,
        asaf,
        playersRoundScores
      } as RoundResult;

      this.roundsResults.push(roundResult);
      this.updateGameStatus(true);
      this.gameEvents.onYaniv(roundResult);

      setTimeout(() => {
        if (!this.gameIsOver) {
          this.startNewRound(roundResult.winner);
          this.initComputerMove();
        }
      }, 5000);
    });
  }

  get lastMove(): Move {
    return this.moves[this.moves.length - 1];
  }

  get thrownCards(): Card[] {
    return this.lastMove?.cards ?? [];
  }

  get deckNumberOfCards(): number {
    return this.deck.length;
  }

  private updateGameStatus(showCards: boolean = false): void {
    const players: IPlayer[] = this.players.map(player => {
      return {
        ...player,
        cards: showCards ? player.cards : undefined,
        cardsScore: showCards ? player.cardsScore : undefined,
        numberOfCards: player.numberOfCards,
      } as IPlayer;
    });

    const gameStatus: GameStatus = {
      ...this,
      players,
      thrownCards: this.thrownCards,
      deckNumberOfCards: this.deckNumberOfCards,
      gameIsOver: this.gameIsOver
    };

    this.gameEvents.onGameStatusUpdate(gameStatus);
  }

  private getCardFromPile(cardToTake: Card): Card {
    return this.lastMove.cards.find(card => card === cardToTake) as Card;
  }

  private getCardFromDeck(): Card {
    return this.getRandomItemFromArray(this.deck, true);
  }

  private setNextPlayer(): void {
    this.currentPlayer = this.getNextPlayer();
  }

  private getRandomItemFromArray<T>(array: T[], removeItem: boolean = false): T {
    const item = array[Math.floor(Math.random() * array.length)];
    if (removeItem) {
      array.splice(array.indexOf(item), 1);
    }
    return item;
  }

  private dealCards(): void {
    this.deck = this.getShuffledDeckCards();
    this.players.forEach(player => {
      player.cards = this.deck?.splice(0, this.config.cardsPerPlayer);
    });
    const cardToStart = this.getCardFromDeck();
    this.moves = [{
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

  private getNextPlayer(): Player {
    const currentIndex = this.activePlayers.indexOf(this.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.activePlayers.length;
    return this.activePlayers[nextIndex];
  }

  private initComputerMove(): void {
    if (this.currentPlayer.isComputerPlayer && !this.gameIsOver) {
      setTimeout(async () => {
        if (this.currentPlayer.cardsScore <= this.config.yanivThreshold) {
          await this.yaniv();
        } else {
          const cards: Card[] = this.maxDuplicatedCards(this.currentPlayer.cards as Card[]);
          const cardToTake = this.thrownCards.length && this.thrownCards[0].value.score < 4 ? this.thrownCards[0] : null;
          await this.makeMove(this.currentPlayer, cards, cardToTake);
        }
      }, 2000);
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
