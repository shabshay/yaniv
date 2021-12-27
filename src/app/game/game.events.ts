import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {GameState, RoundResult} from './game';
import {Card} from '../card/card';

@Injectable()
export class GameEvents {
  private yanivSubject = new Subject<RoundResult>();
  public yaniv = this.yanivSubject.asObservable();

  private gameStatusUpdateSubject = new Subject<GameState>();
  public gameStatusUpdate = this.gameStatusUpdateSubject.asObservable();

  private playerCardsUpdateSubjects = new Map<string, Subject<Card[]>>();
  public playerCardsUpdate(playerId: string): Observable<Card[]> | undefined {
    if (!this.playerCardsUpdateSubjects.has(playerId)) {
      this.playerCardsUpdateSubjects.set(playerId, new Subject<Card[]>());
    }
    return this.playerCardsUpdateSubjects.get(playerId)?.asObservable();
  }

  onPlayerCardsUpdate(playerId: string, cards: Card[]): void {
    this.playerCardsUpdateSubjects.get(playerId)?.next(cards);
  }

  onYaniv(roundResult: RoundResult): void {
    this.yanivSubject.next(roundResult);
  }

  onGameStatusUpdate(gameStatus: GameState): void {
    this.gameStatusUpdateSubject.next(gameStatus);
  }
}
