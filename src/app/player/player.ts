import {Card} from '../card/card';

export interface IPlayer {
  id: string;
  name: string;
  numberOfCards: number;
  isOut: boolean;
  cards?: Card[];
  totalScore: number;
  cardsScore: number;
  isComputerPlayer: boolean;
}

export class Player implements IPlayer {
  id: string;
  name: string;
  cards?: Card[];
  totalScore = 0;
  isOut = false;
  isComputerPlayer: boolean;

  constructor(name: string, id: string, isComputerPlayer: boolean) {
    this.name = name;
    this.id = id;
    this.isComputerPlayer = isComputerPlayer;
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
