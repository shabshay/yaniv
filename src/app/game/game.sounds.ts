import {Injectable} from '@angular/core';

@Injectable()
export class GameSounds {
  cardClickAudio = new Audio('assets/card-click.mp3');
  shortBellAudio = new Audio('assets/short-bell.mp3');
  deckCardAudio = new Audio('assets/deck-card.mp3');
  shuffleCardsAudio = new Audio('assets/shuffle-cards.mp3');
  yanivAudio = new Audio('assets/yaniv.mp3');
  asafAudio = new Audio('assets/asaf.mp3');
  gameOverAudio = new Audio('assets/game-over.mp3');
  tikTokAudio = new Audio('assets/tick-tok.mp3');

  private audios = [
    this.cardClickAudio,
    this.shortBellAudio,
    this.deckCardAudio,
    this.shuffleCardsAudio,
    this.yanivAudio,
    this.asafAudio,
    this.gameOverAudio,
    this.tikTokAudio
  ];

  constructor() {
    this.audios.forEach(audio => {
      audio.load();
    });
  }
}
