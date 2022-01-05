import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent, DialogData} from '../dialog/dialog.component';
import {GameValidator} from './game.validator';
import {GameEvents} from './game.events';
import {takeUntil} from 'rxjs/operators';
import {SubscriberDirective} from '../../Subscriber';
import {GameController} from './game.controller';
import {Card, GameState, getThrownCards, Player, RoundResult} from './game.model';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent extends SubscriberDirective implements OnInit {

  @Input()
  gameState!: GameState;

  @Input()
  player!: Player;

  timeLeft?: number;
  private timerInterval?: number;

  constructor(
    private gameService: GameController,
    private dialog: MatDialog,
    private cardsValidator: GameValidator,
    private gameEvents: GameEvents
  ) {
    super();
  }

  ngOnInit(): void {
    this.initGameEvents();

    setTimeout(() => {
      const player = {
        name: 'Shamib',
        id: 'asd',
        isComputerPlayer: true
      } as Player;
      this.gameService.addPlayer(this.gameState, player);
    }, 500);

    setTimeout(() => {
      const player = {
        name: 'Dodik',
        id: 'fasdf',
        isComputerPlayer: true
      } as Player;
      this.gameService.addPlayer(this.gameState, player);
    }, 1000);

    setTimeout(() => {
      const player = {
        name: 'Kaduri',
        id: '2dsfx',
        isComputerPlayer: true
      } as Player;
      this.gameService.addPlayer(this.gameState, player);
      this.gameService.startGame(this.gameState);
    }, 2000);
  }

  get opponents(): Player[] {
    return this.gameState.players?.filter(player => player.id !== this.player.id) ?? [];
  }

  get thrownCards(): Card[] | undefined {
    return getThrownCards(this.gameState);
  }

  makeMove(cardToTake: Card | null = null): void {
    if (this.gameState.currentPlayer?.id === this.player.id) {
      const selectedCards = this.player.cards?.filter(c => c.selected);
      if (selectedCards?.length && this.cardsValidator.selectedCardsAreValid(selectedCards)) {
        this.gameService.makeMove(this.gameState, selectedCards, cardToTake);
      }
    }
  }

  onPlayerCallYaniv(): void {
    this.gameService.yaniv(this.gameState);
  }

  private initGameEvents(): void {
    this.gameEvents.gameStateUpdate
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((gameStatus: GameState) => {
        this.onGameStateUpdate(gameStatus);
      });

    this.gameEvents.yaniv
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((roundResult: RoundResult) => {
        this.onYanivResult(roundResult);
      });
  }

  private onGameStateUpdate(gameStatus: GameState): void {
    this.gameState = gameStatus;
    this.player = this.gameState.players.find(player => player.id === this.player.id) as Player;
    this.startTimer();
  }

  private startTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (!this.gameState.started || this.gameState.gameIsOver || this.gameState.yaniv) {
      return;
    }
    this.timeLeft = this.gameState.config.moveTimeoutInMS / 1000;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft as number >= 0) {
        (this.timeLeft as number)--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  private onYanivResult(result: RoundResult): void {
    const resultScoresString = result.playersRoundScores.map(playerScore => `${playerScore.player.name}: ${playerScore.score} \n`).join('');
    setTimeout(() => {
      if (!this.gameState.gameIsOver) {
        this.dialog.closeAll();
      }
    }, 5000);

    let title = result.asaf ? 'Asaf!' : 'Yaniv!';
    if (this.gameState.gameIsOver) {
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
