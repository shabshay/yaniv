import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Player, cardsScore, Card, getSortedCards} from '../game/api/game.model';
import {GameValidator} from '../game/api/game.validator';
import {GameSounds} from '../game/game.sounds';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input()
  player!: Player;

  @Input()
  isCurrentPlayer!: boolean;

  @Input()
  yanivThreshold!: number;

  @Input()
  opponentClass?: string;

  @Output()
  yanivClick: EventEmitter<any> = new EventEmitter<any>();

  cardsScore = cardsScore;

  constructor(private cardsValidator: GameValidator, private gameSounds: GameSounds) {
  }

  ngOnInit(): void {
  }

  onYanivClick(): void {
    this.yanivClick.emit();
  }

  get sortedCard(): Card[] | undefined {
    return getSortedCards(this.player.cards);
  }

  onCardClick(card: Card): void {
    const isValidSelection = this.player.cards && this.cardsValidator.cardSelectionIsValid(card, this.player.cards);
    if (isValidSelection) {
      this.gameSounds.cardClickAudio.play().catch();
    }
    card.selected = !card.selected && isValidSelection;
  }
}
