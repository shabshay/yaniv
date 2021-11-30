import {Component} from '@angular/core';
import {Game} from './game/game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: Game;

  constructor() {
    this.game = new Game({
      name: 'Shay'
    });
    this.game.addPlayer({
      name: 'Tal'
    });
    this.game.addPlayer({
      name: 'Shamib'
    });
    this.game.addPlayer({
      name: 'Dodik'
    });
  }

  startGame(): void {
    this.game.startGame();
  }
}
