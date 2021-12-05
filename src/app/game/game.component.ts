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

  get thrownCard(): Card {
    return this.game.thrownCards?.[this.game.thrownCards.length - 1] as Card;
  }

  onDeckClick(): void {
    if (this.player && this.player.selectedCards?.length) {
      this.game.makeMove(this.player, this.player.selectedCards, true);
    }
  }
}
