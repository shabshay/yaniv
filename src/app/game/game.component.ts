import {Component, Input, OnInit} from '@angular/core';
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
export class GameComponent implements OnInit {

  @Input()
  game!: Game;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.game.isRunning && this.game.isComputerTurn) {
      this.initComputerMove();
    }
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
      this.initComputerMove();
    }
  }

  onPlayerCallYaniv(player: Player): void {
    if (!player.isCurrentPlayer) {
      return;
    }
    const result: RoundResult = this.game.yaniv() as RoundResult;
    const resultScoresString = result.playersRoundScores.map(playerScore => `${playerScore.player.name}: ${playerScore.score} \n`).join('');
    setTimeout(() => {
      if (!result.gameIsOver) {
        this.dialog.closeAll();
        this.game.startNewRound(result.winner);
        if (this.game.isComputerTurn) {
          this.initComputerMove();
        }
      }
    }, 5000);

    let title = result.asaf ? 'Asaf!' : 'Yaniv!';
    if (result.gameIsOver) {
      title = title + ' GAME OVER!';
    }

    this.dialog.open(DialogComponent, {
      data: {
        title,
        content: resultScoresString
      } as DialogData,
    });
  }

  private maxDuplicatedCards(cards: Card[]): Card[] {
    const counts = new Map<number, Card[]>();
    let max = 0;
    let res: Card[] = [];
    cards.forEach(card => {
      const sameOrderCards: Card[] = counts.get(card.value.order) ?? [];
      const updatedSameOrderCards = [...sameOrderCards, card];
      counts.set(card.value.order, updatedSameOrderCards);
      const cardsCount = updatedSameOrderCards.length * card.value.score;
      if (cardsCount > max) {
        max = cardsCount;
        res = updatedSameOrderCards;
      }
    });
    return res;
  }

  private initComputerMove(): void {
    if (this.game.isComputerTurn && !this.game.gameIsOver) {
      setTimeout(() => {
        if (this.game.currentPlayer.cardsScore <= this.game.config.yanivThreshold) {
          this.onPlayerCallYaniv(this.game.currentPlayer);
        } else {
          const cards: Card[] = this.maxDuplicatedCards(this.game.currentPlayer.cards as Card[]);
          const cardToTake = this.thrownCards.length && this.thrownCards[0].value.score < 4 ? this.thrownCards[0] : null;
          this.game.makeMove(this.game.currentPlayer, cards, cardToTake);
          this.initComputerMove();
        }
      }, 2000);
    }
  }
}
