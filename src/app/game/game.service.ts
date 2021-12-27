import {Player} from '../player/player';
import {Card} from '../card/card';
import {Game, GameConfig, GameState} from './game';
import {CardsValidator} from '../common/cards-validator';
import {GameEvents} from './game.events';
import {Injectable} from '@angular/core';

@Injectable()
export class GameService {
  game?: Game;

  constructor(private cardsValidator: CardsValidator, private gameEvents: GameEvents) {
  }

  async makeMove(player: Player, thrownCards: Card[], cardToTake: Card | null = null): Promise<void> {
    return this.game?.makeMove(player, thrownCards, cardToTake);
  }

  yaniv(): void {
    this.game?.yaniv();
  }

  addPlayer(player: Player): void {
    this.game?.addPlayer(player);
  }

  createNewGame(player: Player, config: GameConfig): GameState {
    this.game = new Game(config, player, this.cardsValidator, this.gameEvents);
    return {...this.game} as Game;
  }

  startGame(): void {
    this.game?.startGame();
  }
}
