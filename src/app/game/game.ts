import {Player} from '../player/player';
import {Card, CardSymbol, CardSymbolEnum, CardSymbolsMap} from '../card/card';


export class Game {
  players: Player[];
  currentPlayer: Player;
  deck: Card[];
  thrownCards?: Card[];
  isRunning = false;

  constructor(player: Player) {
    this.deck = [];
    this.players = [player];
    this.currentPlayer = player;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  startGame(): void {
    this.dealCards();
    this.currentPlayer = this.getRandomItemFromArray(this.players);
    this.isRunning = true;
    setInterval(() => {
      const card: Card = this.currentPlayer.cards?.pop() ?? {} as Card;
      const drawn = this.makeMove(this.currentPlayer, card);
      console.log('drawn: ', drawn);
      console.log('cards left: ', this.deck.length);
    }, 1000);
  }

  makeMove(player: Player, thrownCard: Card): Card | null {
    if (this.currentPlayer?.id !== player.id || player.id !== this.currentPlayer.id) {
      return null;
    }
    this.thrownCards?.push(thrownCard);
    const drawnCard = this.getRandomItemFromArray(this.deck, true);
    this.currentPlayer.cards?.push(drawnCard);
    this.setNextPlayer();
    return drawnCard;
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
    this.thrownCards = [];
    this.deck = this.getShuffledDeckCards();
    this.players.forEach(player => {
      player.cards = this.deck?.splice(0, 5);
    });
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
            symbol: cardSymbol
          });
        }
      });
    }
    const jokerCardSymbol = CardSymbolsMap.get(CardSymbolEnum.Joker) as CardSymbol;
    initDeck.push(
      {value: 0, symbol: jokerCardSymbol},
      {value: 0, symbol: jokerCardSymbol}
    );
    return initDeck;
  }

  private getNextPlayer(): Player {
    const currentIndex = this.players.indexOf(this.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;
    return this.players[nextIndex];
  }
}
