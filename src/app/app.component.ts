import {Component} from '@angular/core';
import {GameController} from './game/game.controller';
import {GameConfig, GameState, Player} from './game/game.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  gameState: GameState;
  player: Player;

  constructor(private gameService: GameController) {
    const config = {
      yanivThreshold: 7,
      scoreLimit: 50,
      cardsPerPlayer: 5,
      moveTimeoutInMS: 15000,
      timeBetweenRoundsInMS: 5000
    } as GameConfig;

    this.player = {
      name: 'Shay',
      id: '2fb5s',
      isComputerPlayer: false
    } as Player;
    this.gameState = this.gameService.newGame(config, this.player);
  }

  startGame(): void {

  }
}
