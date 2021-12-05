import {Component, Input, OnInit} from '@angular/core';
import {Card} from '../card/card';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.less']
})
export class CardsComponent implements OnInit {

  @Input()
  cards?: Card[];

  constructor() { }

  ngOnInit(): void {
  }

  get sortedCard(): Card[] | undefined {
    return this.cards?.sort((card1, card2) => {
      return card1.value - card2.value || ((card1.symbol.icon < card2.symbol.icon) ? -1 : 1);
    });
  }
}
