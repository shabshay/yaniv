import {Card} from '../card/card';

export class Player {
  id: string;
  name: string;
  cards?: Card[];
  points: number;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
    this.points = 0;
  }
}
