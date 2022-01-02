import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {GameState, RoundResult} from './game.model';

@Injectable()
export class GameEvents {
  private yanivSubject = new Subject<RoundResult>();
  public yaniv = this.yanivSubject.asObservable();

  private gameStateUpdateSubject = new Subject<GameState>();
  public gameStateUpdate = this.gameStateUpdateSubject.asObservable();

  onYaniv(roundResult: RoundResult): void {
    this.yanivSubject.next(roundResult);
  }

  onGameStateUpdate(gameStatus: GameState): void {
    this.gameStateUpdateSubject.next(gameStatus);
  }
}
