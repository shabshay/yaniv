import {Component, Input} from '@angular/core';
import {Game, RoundResult} from './game';
import {Player} from '../player/player';
import {Card} from '../card/card';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent, DialogData} from '../dialog/dialog.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent {

  @Input()
  game!: Game;

  constructor(private dialog: MatDialog) {
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

  makeMove(cardToTake: Card | null = null): void {
    if (this.player.selectedCards?.length) {
      this.game.makeMove(this.player, this.player.selectedCards, cardToTake);
    }
  }

  onPlayerCallYaniv(player: Player): void {
    if (!player.isCurrentPlayer) {
      return;
    }
    const result: RoundResult = this.game.yaniv();
    const resultScoresString = result.playersRoundScores.map(playerScore => `${playerScore.player.name}: ${playerScore.score} \n`).join('');
    setTimeout(() => {
      this.dialog.closeAll();
      this.game.startNewRound(result.winner);
    }, 3000);
    this.dialog.open(DialogComponent, {
      data: {
        title: result.asaf ? 'Asaf!' : 'Yaniv!',
        content: resultScoresString
      } as DialogData,
    });
  }
}
