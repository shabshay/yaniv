import {Component} from '@angular/core';
import {GameConfig, GameState} from './game/game';
import {Player} from './player/player';
import {GameService} from './game/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: GameState;
  player: Player;

  constructor(private gameService: GameService) {
    const config = {
      yanivThreshold: 7,
      scoreLimit: 20,
      cardsPerPlayer: 2
    } as GameConfig;

    this.player = new Player('Shay', '3sfdaa', false);
    this.game = this.gameService.createNewGame(this.player, config);
  }

  startGame(): void {

  }
}
