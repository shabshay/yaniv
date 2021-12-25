import {Card} from '../card/card';

export interface IPlayer {
  id: string;
  name: string;
  numberOfCards: number;
  isCurrentPlayer: boolean;
  isOut: boolean;
  cards?: Card[];
  score: number;
}

export class Player implements IPlayer {
  id: string;
  name: string;
  cards?: Card[];
  score = 0;
  isCurrentPlayer = false;
  isOut = false;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }

  get selectedCards(): Card[] | undefined {
    return this.cards?.filter(c => c.selected);
  }

  get cardsScore(): number {
    const cardsScores: number[] | undefined = this.cards?.map(card => card.value.score);
    return cardsScores?.reduce((a, b) => a + b, 0) ?? 0;
  }

  get numberOfCards(): number {
    return this.cards?.length ?? 0;
  }
}
