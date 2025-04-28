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
  gameSettings: GameConfig = {
    yanivThreshold: 7,
    scoreLimit: 50,
    cardsPerPlayer: 5,
    moveTimeoutInMS: 10000,
    timeBetweenRoundsInMS: 5000
  } as GameConfig;
  gameState: GameState | undefined;
  player: Player;
  settingsVisible = false;

  constructor(private gameService: GameController) {
    this.player = {
      name: 'Shay',
      id: '2fb5s',
      img: 'assets/avatar1.png',
      isComputerPlayer: false
    } as Player;
  }

  showSettings(): void {
    this.settingsVisible = true;
  }

  handleSettingsClose(): void {
    this.settingsVisible = false;
  }

  startGame(): void {
    this.gameState = this.gameService.newGame(this.gameSettings, this.player);
  }

  updateSettings(config: GameConfig): void {
    this.gameSettings = config;
  }
}
