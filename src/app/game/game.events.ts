import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {GameStatus, RoundResult} from './game';

@Injectable()
export class GameEvents {
  private yanivSubject = new Subject<RoundResult>();
  public yaniv = this.yanivSubject.asObservable();

  private gameStatusUpdateSubject = new Subject<GameStatus>();
  public gameStatusUpdate = this.gameStatusUpdateSubject.asObservable();

  onYaniv(roundResult: RoundResult): void {
    this.yanivSubject.next(roundResult);
  }

  onGameStatusUpdate(gameStatus: GameStatus): void {
    this.gameStatusUpdateSubject.next(gameStatus);
  }
}
