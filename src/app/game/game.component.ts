import {Component, Input} from '@angular/core';
import {Game} from './game';
import {Player} from '../player/player';
import {Card} from '../card/card';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent {

  @Input()
  game!: Game;

  constructor() {
  }

  get opponents(): Player[] {
    return this.game.players.slice(1);
  }

  get player(): Player {
    return this.game.players[0];
  }

  get thrownCards(): Card[] {
    if (!this.game.moves?.length) {
      return [];
    }
    return this.game.lastMove.cards;
  }

  onDeckClick(): void {
    this.makeMove(true);
  }

  onStackCardClick(): void {
    this.makeMove(false);
  }

  private makeMove(takeFromDeck: boolean): void {
    if (this.player && this.player.selectedCards?.length) {
      this.game.makeMove(this.player, this.player.selectedCards, takeFromDeck);
    }
  }
}
