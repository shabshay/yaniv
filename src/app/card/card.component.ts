import {Component, Input, OnInit} from '@angular/core';
import {Card} from '../game/game.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input()
  card!: Card;

  @Input()
  flipped = false;

  constructor() {
  }

  ngOnInit(): void {
  }
}
