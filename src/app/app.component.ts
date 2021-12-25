import {Component} from '@angular/core';
import {Game, GameConfig, GameStatus} from './game/game';
import {Player} from './player/player';
import {CardsValidator} from './common/cards-validator';
import {GameEvents} from './game/game.events';
import {GameService} from './game/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: GameStatus;
  gameService: GameService;
  player: Player;

  constructor(private cardsValidator: CardsValidator, private gameEvents: GameEvents) {
    const config = {
      yanivThreshold: 10,
      scoreLimit: 30,
      cardsPerPlayer: 2
    } as GameConfig;

    this.player = new Player('Shay', '3sfdaa');
    const game = new Game(config, this.player, cardsValidator, gameEvents);
    this.game = game as GameStatus;
    this.gameService = new GameService(game);
    this.gameService.addPlayer(new Player('Shamib', 'asd'));
    this.gameService.addPlayer(new Player('Dodik', 'ffsa3'));
    this.gameService.addPlayer(new Player('Kaduri', '234sdf'));

    this.startGame();
  }

  startGame(): void {
    this.gameService.startGame();
  }
}
