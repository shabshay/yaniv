import {Injectable} from '@angular/core';
import {Analytics, getAnalytics, isSupported, logEvent} from 'firebase/analytics';
import {GameConfig, GameState} from './game/api/game.model';
import {FirebaseService} from './online/firebase.service';

type GameMode = 'local' | 'online';

@Injectable()
export class AnalyticsService {

  private readonly analytics: Promise<Analytics | undefined>;

  constructor(firebaseService: FirebaseService) {
    this.analytics = isSupported()
      .then(supported => supported ? getAnalytics(firebaseService.app) : undefined)
      .catch(error => {
        console.error('Firebase Analytics initialization failed', error);
        return undefined;
      });
  }

  trackGameCreated(config: GameConfig): void {
    this.track('game_created', {
      cards_per_player: config.cardsPerPlayer,
      score_limit: config.scoreLimit,
      yaniv_threshold: config.yanivThreshold
    });
  }

  trackGameJoined(): void {
    this.track('game_joined');
  }

  trackGameResumed(): void {
    this.track('game_resumed');
  }

  trackGameStarted(mode: GameMode, state: GameState): void {
    this.track('game_started', {
      game_mode: mode,
      player_count: state.players.length,
      cards_per_player: state.config.cardsPerPlayer
    });
  }

  trackGameCompleted(mode: GameMode, state: GameState, startedAt?: number): void {
    this.track('game_completed', {
      game_mode: mode,
      player_count: state.players.length,
      round_count: state.roundsResults.length,
      move_count: state.moves.length,
      ...(startedAt ? {duration_seconds: Math.round((Date.now() - startedAt) / 1000)} : {})
    });
  }

  trackGameAbandoned(mode: GameMode, state: GameState, startedAt?: number): void {
    this.track('game_abandoned', {
      game_mode: mode,
      player_count: state.players.length,
      round_count: state.roundsResults.length,
      ...(startedAt ? {duration_seconds: Math.round((Date.now() - startedAt) / 1000)} : {})
    });
  }

  private track(name: string, parameters: Record<string, string | number> = {}): void {
    this.analytics
      .then(analytics => {
        if (analytics) {
          logEvent(analytics, name, parameters);
        }
      })
      .catch(error => console.error(`Failed to log Analytics event ${name}`, error));
  }
}
