import {Component} from '@angular/core';
import {GameConfig, GameStatus} from './game/game';
import {Player} from './player/player';
import {GameService} from './game/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: GameStatus;
  player: Player;

  constructor(private gameService: GameService) {
    const config = {
      yanivThreshold: 10,
      scoreLimit: 30,
      cardsPerPlayer: 2
    } as GameConfig;

    this.player = new Player('Shay', '3sfdaa');
    this.game = this.gameService.createNewGame(this.player, config);
    this.gameService.addPlayer(new Player('Shamib', 'asd'));
    this.gameService.addPlayer(new Player('Dodik', 'ffsa3'));
    this.gameService.addPlayer(new Player('Kaduri', '234sdf'));

    this.startGame();
  }

  startGame(): void {
    this.gameService.startGame();
  }
}
