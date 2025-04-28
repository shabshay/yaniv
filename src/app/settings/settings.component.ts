import { Component, EventEmitter, Output } from '@angular/core';
import { GameConfig } from '../game/api/game.model';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    imports: [
      FormsModule
    ],
    styleUrls: ['./settings.component.scss']
  })
  export class SettingsComponent {
    gameConfig: GameConfig = {
      yanivThreshold: 7,
      scoreLimit: 50,
      cardsPerPlayer: 5,
      moveTimeoutInMS: 10000,
      timeBetweenRoundsInMS: 5000
    };

    @Output() settingsChanged = new EventEmitter<GameConfig>();
    @Output() close = new EventEmitter<void>();

    onSave(): void {
      this.settingsChanged.emit(this.gameConfig);
      this.onClose();
    }

    onClose(): void {
      this.close.emit();
    }
  }
