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
import { CardsComponent } from './cards/cards.component';
import { CardComponent } from './card/card.component';
import {MatButtonModule} from '@angular/material/button';
import { OpponentComponent } from './opponent/opponent.component';
import { DialogComponent } from './dialog/dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {CardsValidator} from './common/cards-validator';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PlayerComponent,
    CardsComponent,
    CardComponent,
    OpponentComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [CardsValidator],
  bootstrap: [AppComponent]
})
export class AppModule { }
