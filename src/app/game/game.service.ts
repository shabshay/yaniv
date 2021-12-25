import {Player} from '../player/player';
import {Card} from '../card/card';
import {Game} from './game';

export class GameService {
  game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  async makeMove(player: Player, thrownCards: Card[], cardToTake: Card | null = null): Promise<void> {
    return this.game.makeMove(player, thrownCards, cardToTake);
  }

  yaniv(): void {
    this.game.yaniv();
  }

  addPlayer(player: Player): void {
    this.game.addPlayer(player);
  }

  startGame(): void {
    this.game.startGame();
  }
}
