import {Component} from '@angular/core';
import {Game, GameConfig} from './game/game';
import {Player} from './player/player';
import {CardsValidator} from './common/cards-validator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: Game;

  constructor(private cardsValidator: CardsValidator) {
    const config = {
      yanivThreshold: 7,
      scoreLimit: 50,
      cardsPerPlayer: 5
    } as GameConfig;

    this.game = new Game(config, new Player('Shay', '3sfdaa'), cardsValidator);
    this.game.addPlayer(new Player('Shamib', 'asd'));
    this.game.addPlayer(new Player('Dodik', 'ffsa3'));
    this.game.addPlayer(new Player('Kaduri', '234sdf'));

    this.startGame();
  }

  startGame(): void {
    this.game.startGame();
  }
}
