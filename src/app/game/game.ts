import {Player} from '../player/player';
import {Card, CardSymbol} from '../card/card';


export class Game {
  players: Player[];
  deck: Card[];
  isRunning = false;

  constructor(player: Player) {
    this.players = [player];
    this.deck = [];
  }

  addPlayer(player: Player): void {
    this.players = this.players.concat(player);
  }

  startGame(): void {
    this.deck = this.getShuffledDeck();
    this.players.forEach(player => {
      player.cards = this.deck.splice(0, 5);
    });
    this.isRunning = true;
  }

  private getShuffledDeck(): Card[] {
    return this.getInitDeck()
      .map((value) => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}) => value);
  }

  private getInitDeck(): Card[] {
    let initDeck = [] as Card[];
    for (let i = 1; i <= 13; i++) {
      for (const key of Object.keys(CardSymbol)) {
        const cardSymbol = CardSymbol[key as keyof typeof CardSymbol];
        if (cardSymbol !== CardSymbol.Joker) {
          initDeck = initDeck.concat({
            value: i,
            symbol: cardSymbol
          });
        }
      }
    }
    initDeck = initDeck.concat(
      {value: 0, symbol: CardSymbol.Joker},
      {value: 0, symbol: CardSymbol.Joker}
    );
    return initDeck;
  }
}
