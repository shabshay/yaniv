import {Component} from '@angular/core';
import {Game} from './game/game';
import {Player} from './player/player';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: Game;

  constructor() {
    this.game = new Game(new Player('Shay', '3sfdaa'));
    this.game.addPlayer(new Player('Shamib', 'asd'));
    this.game.addPlayer(new Player('Dodik', 'ffsa3'));
    this.game.addPlayer(new Player('Kaduri', '234sdf'));

    this.startGame();
  }

  startGame(): void {
    this.game.startGame();
  }
}
