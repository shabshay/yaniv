import {Component, Input, OnInit} from '@angular/core';
import {GameStatus, RoundResult} from './game';
import {IPlayer, Player} from '../player/player';
import {Card} from '../card/card';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent, DialogData} from '../dialog/dialog.component';
import {CardsValidator} from '../common/cards-validator';
import {GameEvents} from './game.events';
import {takeUntil} from 'rxjs/operators';
import {SubscriberDirective} from '../../Subscriber';
import {GameService} from './game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent extends SubscriberDirective implements OnInit {

  @Input()
  gameStatus!: GameStatus;

  @Input()
  player!: Player;

  constructor(
    private gameService: GameService,
    private dialog: MatDialog,
    private cardsValidator: CardsValidator,
    private gameEvents: GameEvents
  ) {
    super();
  }

  ngOnInit(): void {
    this.gameEvents.gameStatusUpdate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((gameStatus: GameStatus) => {
        this.gameStatus = gameStatus;
      });

    this.gameEvents.yaniv
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((roundResult: RoundResult) => {
        this.handleYanivResult(roundResult);
      });

    setTimeout(() => {
      this.gameService.addPlayer(new Player('Shamib', 'asd'));
    }, 500);

    setTimeout(() => {
      this.gameService.addPlayer(new Player('Dodik', 'ffsa3'));
    }, 1000);

    setTimeout(() => {
      this.gameService.addPlayer(new Player('Kaduri', '234sdf'));
      this.gameService.startGame();
    }, 2000);
  }

  get opponents(): IPlayer[] {
    return this.gameStatus.players?.slice(1) ?? [];
  }

  async makeMove(cardToTake: Card | null = null): Promise<void> {
    if (this.player.selectedCards?.length && this.player.isCurrentPlayer && this.cardsValidator.isLegalMove(this.player.selectedCards)) {
      await this.gameService.makeMove(this.player, this.player.selectedCards, cardToTake);
    }
  }

  onPlayerCallYaniv(player: Player): void {
    if (!player.isCurrentPlayer) {
      return;
    }
    this.gameService.yaniv();
  }

  private handleYanivResult(result: RoundResult): void {
    const resultScoresString = result.playersRoundScores.map(playerScore => `${playerScore.player.name}: ${playerScore.score} \n`).join('');
    setTimeout(() => {
      if (!this.gameStatus.gameIsOver) {
        this.dialog.closeAll();
      }
    }, 5000);

    let title = result.asaf ? 'Asaf!' : 'Yaniv!';
    if (this.gameStatus.gameIsOver) {
      title = `${title} GAME OVER!`;
    }
    title = `${title} ${result.winner.name} Wins!`;

    this.dialog.open(DialogComponent, {
      data: {
        title,
        content: resultScoresString
      } as DialogData,
    });
  }
}
