import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DialogComponent, DialogData} from '../dialog/dialog.component';
import {GameValidator} from './api/game.validator';
import {GameEvents} from './api/game.events';
import {takeUntil} from 'rxjs/operators';
import {SubscriberDirective} from '../../Subscriber';
import {GameController} from './api/game.controller';
import {Card, GameState, GameStatus, getThrownCards, Player} from './api/game.model';
import {GameSounds} from './game.sounds';
import { DialogPosition } from '@angular/material/dialog';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
    standalone: false
})
export class GameComponent extends SubscriberDirective implements OnInit {

  @Input()
  gameState!: GameState;

  @Input()
  player!: Player;

  timeLeft?: number;
  private timerInterval?: ReturnType<typeof setInterval>;
  private dialogPosition = {
    top: '300px'
  } as DialogPosition;

  constructor(
    private gameService: GameController,
    private dialog: MatDialog,
    private cardsValidator: GameValidator,
    private gameEvents: GameEvents,
    private gameSounds: GameSounds
  ) {
    super();
  }

  ngOnInit(): void {
    this.initGameEvents();

    setTimeout(() => {
      const player = {
        name: 'Shamib',
        id: 'asd',
        img: '../../assets/avatar2.png',
        isComputerPlayer: true
      } as Player;
      this.gameService.addPlayer(this.gameState, player);
    }, 500);

    setTimeout(() => {
      const player = {
        name: 'Dodik',
        id: 'fasdf',
        img: '../../assets/avatar3.png',
        isComputerPlayer: true
      } as Player;
      this.gameService.addPlayer(this.gameState, player);
    }, 1000);

    setTimeout(() => {
      const player = {
        name: 'Kaduri',
        id: '2dsfx',
        img: '../../assets/avatar4.png',
        isComputerPlayer: true
      } as Player;
      this.gameService.addPlayer(this.gameState, player);
    }, 2000);

    setTimeout(() => {
      this.gameService.startGame(this.gameState);
    }, 3000);
  }

  isCurrentPlayer(player: Player): boolean {
    return this.gameState?.currentPlayer?.id === player.id;
  }

  get opponents(): Player[] {
    return this.gameState.players?.filter(player => player.id !== this.player.id) ?? [];
  }

  get opponentTop(): Player | undefined {
    if (this.opponents.length === 1) {
      return this.opponents[0];
    }
    if (this.opponents.length === 3) {
      return this.opponents[1];
    }
    return undefined;
  }

  get opponentLeft(): Player | undefined {
    if (this.opponents.length > 1) {
      return this.opponents[0];
    }
    return undefined;
  }

  get opponentRight(): Player | undefined {
    if (this.opponents.length > 1) {
      return this.opponents[this.opponents.length - 1];
    }
    return undefined;
  }

  get thrownCards(): Card[] | undefined {
    return getThrownCards(this.gameState);
  }

  get deckTopCards(): Card[] {
    return this.gameState.deck.slice(0, 6);
  }

  get showCards(): boolean {
    return [GameStatus.yaniv, GameStatus.gameOver].includes(this.gameState.status);
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
  }

  private onGameStateUpdate(gameStatus: GameState): void {
    this.gameState = gameStatus;
    this.gameSounds.tikTokAudio.pause();
    this.gameSounds.tikTokAudio.currentTime = 0;
    if (this.isCurrentPlayer(this.player)) {
      this.gameSounds.shortBellAudio.play().catch();
    }
    switch (this.gameState.status) {
      case GameStatus.move:
        this.gameSounds.deckCardAudio.play().catch();
        break;

      case GameStatus.newRound:
        this.gameSounds.shuffleCardsAudio.play().catch();
        break;

      case GameStatus.gameOver:
        this.onGameOver();
        break;

      case GameStatus.yaniv:
        this.onYaniv();
        break;
    }

    this.player = this.gameState.players.find(player => player.id === this.player.id) as Player;
    this.startTimer();
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timeLeft = undefined;
  }

  private startTimer(): void {
    this.stopTimer();
    if (![GameStatus.newRound, GameStatus.move].includes(this.gameState.status)) {
      return;
    }
    this.timeLeft = this.gameState.config.moveTimeoutInMS / 1000;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft as number > 0) {
        (this.timeLeft as number)--;
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  private onGameOver(): void {
    this.gameSounds.gameOverAudio.play().catch();
    const result = this.gameState.roundsResults[this.gameState.roundsResults.length - 1];
    this.dialog.open(DialogComponent, {
      position: this.dialogPosition,
      data: {
        title: 'GAME OVER!',
        content: `${result.winner.name} Wins!`
      } as DialogData,
    });
  }

  private onYaniv(): void {
    this.gameSounds.yanivAudio.play().catch();
    const result = this.gameState.roundsResults[this.gameState.roundsResults.length - 1];
    if (result.asaf) {
      setTimeout(() => {
        this.gameSounds.asafAudio.play().catch();
      }, 1200);
    }
    const resultScoresString = result.playersRoundScores.map(playerScore => `${playerScore.player.name}: ${playerScore.score} \n`).join('');
    setTimeout(() => {
      if (this.gameState.status !== GameStatus.gameOver) {
        this.dialog.closeAll();
      }
    }, 5000);

    let title = result.asaf ? 'Asaf!' : 'Yaniv!';
    title = `${title} ${result.winner.name} Wins!`;

    this.dialog.open(DialogComponent, {
      position: this.dialogPosition,
      data: {
        title,
        content: resultScoresString
      } as DialogData,
    });
  }
}
