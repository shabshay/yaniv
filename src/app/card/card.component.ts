import {Component, Input, OnInit} from '@angular/core';
import {Card} from '../game/api/game.model';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    standalone: false
})
export class CardComponent implements OnInit {

  @Input()
  card!: Card;

  @Input()
  isActive = false;

  @Input()
  flipped = false;

  constructor() {
  }

  ngOnInit(): void {
  }
}
