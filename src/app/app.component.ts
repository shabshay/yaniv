import {Component} from '@angular/core';
import {Game, GameConfig} from './game/game';
import {Player} from './player/player';
import {CardsValidator} from './common/cards-validator';
import {GameEvents} from './game/game.events';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  game: Game;

  constructor(private cardsValidator: CardsValidator, private gameEvents: GameEvents) {
    const config = {
      yanivThreshold: 10,
      scoreLimit: 20,
      cardsPerPlayer: 2
    } as GameConfig;

    this.game = new Game(config, new Player('Shay', '3sfdaa'), cardsValidator, gameEvents);
    this.game.addPlayer(new Player('Shamib', 'asd'));
    this.game.addPlayer(new Player('Dodik', 'ffsa3'));
    this.game.addPlayer(new Player('Kaduri', '234sdf'));

    this.startGame();
  }

  startGame(): void {
    this.game.startGame();
  }
}
