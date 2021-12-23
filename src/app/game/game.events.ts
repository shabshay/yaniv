import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {RoundResult} from './game';

@Injectable()
export class GameEvents{
  private playerCalledYanivSubject = new Subject<RoundResult>();
  public playerCalledYaniv = this.playerCalledYanivSubject.asObservable();

  onPlayerCalledYaniv(roundResult: RoundResult): void {
    this.playerCalledYanivSubject.next(roundResult);
  }
}
