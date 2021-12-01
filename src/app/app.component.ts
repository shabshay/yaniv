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
      name: 'Shay',
      id: '132'
    });
    this.game.addPlayer({
      name: 'Tal',
      id: '133'
    });
    this.game.addPlayer({
      name: 'Shamib',
      id: '111'
    });
    this.game.addPlayer({
      name: 'Dodik',
      id: '1bd2'
    });
  }

  startGame(): void {
    this.game.startGame();
  }
}
