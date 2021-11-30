import { Component, OnInit } from '@angular/core';
import {Game} from './game';
import {CardSymbol} from '../card/card';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.less']
})
export class GameComponent implements OnInit {

  game: Game = {
    deck: [
      {symbol: CardSymbol.Clubs, value: 3},
      {symbol: CardSymbol.Hearts, value: 10},
      {symbol: CardSymbol.Diamonds, value: 5},
      {symbol: CardSymbol.Spades, value: 13},
      {symbol: CardSymbol.Clubs, value: 7}
    ],
    players: [
      {
        name: 'Shay',
        cards: [
          {symbol: CardSymbol.Clubs, value: 3},
          {symbol: CardSymbol.Hearts, value: 10},
          {symbol: CardSymbol.Diamonds, value: 5},
          {symbol: CardSymbol.Spades, value: 13},
          {symbol: CardSymbol.Clubs, value: 7}
        ]
      },
      {
        name: 'Tal',
        cards: [
          {symbol: CardSymbol.Clubs, value: 3},
          {symbol: CardSymbol.Hearts, value: 10},
          {symbol: CardSymbol.Diamonds, value: 5},
          {symbol: CardSymbol.Spades, value: 13},
          {symbol: CardSymbol.Clubs, value: 7}
        ]
      },
      {
        name: 'Kfir',
        cards: [
          {symbol: CardSymbol.Clubs, value: 3},
          {symbol: CardSymbol.Hearts, value: 10},
          {symbol: CardSymbol.Diamonds, value: 5},
          {symbol: CardSymbol.Spades, value: 13},
          {symbol: CardSymbol.Clubs, value: 7}
        ]
      },
      {
        name: 'Shamir',
        cards: [
          {symbol: CardSymbol.Clubs, value: 3},
          {symbol: CardSymbol.Hearts, value: 10},
          {symbol: CardSymbol.Diamonds, value: 5},
          {symbol: CardSymbol.Spades, value: 13},
          {symbol: CardSymbol.Clubs, value: 7}
        ]
      }
    ]
  };
  constructor() { }

  ngOnInit(): void {
  }

}
