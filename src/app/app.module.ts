import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import { GameComponent } from './game/game.component';
import { PlayerComponent } from './player/player.component';
import { CardComponent } from './card/card.component';
import {MatButtonModule} from '@angular/material/button';
import { OpponentComponent } from './opponent/opponent.component';
import { DialogComponent } from './dialog/dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {GameValidator} from './game/api/game.validator';
import {GameEvents} from './game/api/game.events';
import {GameController} from './game/api/game.controller';
import {GameReducer} from './game/api/game.reducer';
import { AvatarComponent } from './avatar/avatar.component';
import { TimerComponent } from './timer/timer.component';
import {GameSounds} from './game/game.sounds';
import {MenuComponent} from './menu/menu.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PlayerComponent,
    CardComponent,
    OpponentComponent,
    DialogComponent,
    AvatarComponent,
    TimerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MenuComponent
  ],
  providers: [GameController, GameValidator, GameEvents, GameReducer, GameSounds],
  bootstrap: [AppComponent]
})
export class AppModule { }
