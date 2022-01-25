import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {GameState} from './game.model';

@Injectable()
export class GameEvents {
  private gameStateUpdateSubject = new Subject<GameState>();
  public gameStateUpdate = this.gameStateUpdateSubject.asObservable();

  onGameStateUpdate(gameStatus: GameState): void {
    this.gameStateUpdateSubject.next(gameStatus);
  }
}
