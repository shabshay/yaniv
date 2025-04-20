import {Component} from '@angular/core';
import {GameController} from './game/api/game.controller';
import {GameConfig, GameState, Player} from './game/api/game.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  gameState: GameState | undefined;
  player: Player;

  constructor(private gameService: GameController) {


    this.player = {
      name: 'Shay',
      id: '2fb5s',
      img: 'assets/avatar1.png',
      isComputerPlayer: false
    } as Player;
  }

  startGame(): void {
    const config = {
      yanivThreshold: 7,
      scoreLimit: 50,
      cardsPerPlayer: 5,
      moveTimeoutInMS: 10000,
      timeBetweenRoundsInMS: 5000
    } as GameConfig;
    this.gameState = this.gameService.newGame(config, this.player);
  }
}
