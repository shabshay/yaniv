import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Move, RoundResult} from './game';

@Injectable()
export class GameEvents {
  private yanivSubject = new Subject<RoundResult>();
  public yaniv = this.yanivSubject.asObservable();

  private playerMoveSubject = new Subject<Move>();
  public playerMove = this.playerMoveSubject.asObservable();

  onYaniv(roundResult: RoundResult): void {
    this.yanivSubject.next(roundResult);
  }

  onPlayerMove(move: Move): void {
    this.playerMoveSubject.next(move);
  }
}
