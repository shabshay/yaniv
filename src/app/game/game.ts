import {Player} from '../player/player';
import {Card, CardSymbol, CardSymbolEnum, CardSymbolsMap} from '../card/card';


export interface Move {
  cards: Card[];
}

export class Game {
  players: Player[];
  currentPlayer: Player;
  deck: Card[];
  moves: Move[];
  isRunning = false;

  constructor(player: Player) {
    this.deck = [];
    this.players = [player];
    this.currentPlayer = player;
    this.moves = [];
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  startGame(): void {
    if (this.players.length < 2) {
      return;
    }
    this.dealCards();
    this.currentPlayer = this.getRandomItemFromArray(this.players);
    this.currentPlayer.isCurrentPlayer = true;
    this.isRunning = true;
    this.initComputerMove();
  }

  makeMove(player: Player, thrownCards: Card[], cardToTake: Card | null = null): void {
    const takeFromDeck = !cardToTake;
    if (this.currentPlayer?.id !== player.id || player.id !== this.currentPlayer.id) {
      return;
    }
    this.currentPlayer.cards = this.currentPlayer.cards?.filter(c => !thrownCards.includes(c));
    const drawnCard = takeFromDeck ? this.getCardFromDeck() : this.getCardFromPile(cardToTake as Card);
    thrownCards.forEach(card => card.selected = false);
    this.moves.push({cards: thrownCards});
    this.currentPlayer.cards?.push(drawnCard);
    this.currentPlayer.cards?.forEach(card => card.selected = false);
    this.setNextPlayer();
    this.initComputerMove();
  }

  get lastMove(): Move {
    return this.moves[this.moves.length - 1];
  }

  private getCardFromPile(cardToTake: Card): Card {
    return this.lastMove.cards.find(card => card === cardToTake) as Card;
  }

  private initComputerMove(): void {
    if (this.currentPlayer.id !== this.players[0].id) {
      setTimeout(() => {
        const cards: Card[] = this.maxDuplicatedCards(this.currentPlayer.cards as Card[]);
        this.makeMove(this.currentPlayer, cards);
      }, 1000);
    }
  }

  private maxDuplicatedCards(cards: Card[]): Card[] {
    const counts = new Map<number, Card[]>();
    let max = 0;
    let res: Card[] = [];
    cards.forEach(card => {
      const cardsCount: Card[] = counts.get(card.value) ?? [];
      const cardsCountUpdated = [...cardsCount, card];
      counts.set(card.value, cardsCountUpdated);
      if (cardsCountUpdated.length > max) {
        max = cardsCountUpdated.length;
        res = cardsCountUpdated;
      }
    });
    return res;
  }

  private getCardFromDeck(): Card {
    return this.getRandomItemFromArray(this.deck, true);
  }

  private setNextPlayer(): void {
    this.currentPlayer = this.getNextPlayer();
    this.currentPlayer.isCurrentPlayer = true;
    this.players
      .filter(p => p.id !== this.currentPlayer.id)
      .forEach(p => p.isCurrentPlayer = false);
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
      player.cards = this.deck?.splice(0, 5);
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
    for (let i = 1; i <= 13; i++) {
      CardSymbolsMap.forEach((cardSymbol: CardSymbol, symbolEnum: CardSymbolEnum) => {
        if (symbolEnum !== CardSymbolEnum.Joker) {
          initDeck.push({
            value: i,
            symbol: cardSymbol,
            selected: false
          });
        }
      });
    }
    const jokerCardSymbol = CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol;
    initDeck.push(
      {value: 0, symbol: jokerCardSymbol, selected: false},
      {value: 0, symbol: jokerCardSymbol, selected: false}
    );
    return initDeck;
  }

  private getNextPlayer(): Player {
    const currentIndex = this.players.indexOf(this.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    return this.players[nextIndex];
  }
}
