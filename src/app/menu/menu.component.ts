import { Component, EventEmitter, Output } from '@angular/core';
import {SettingsComponent} from '../settings/settings.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  imports: [
    SettingsComponent
  ],
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Output() startGame = new EventEmitter<void>();
  @Output() showSettings = new EventEmitter<void>();
}
