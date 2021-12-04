import {Card} from '../card/card';

export class Player {
  id: string;
  name: string;
  cards?: Card[];
  points: number;
  isCurrentPlayer: boolean;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
    this.points = 0;
    this.isCurrentPlayer = false;
  }

  get selectedCards(): Card[] | undefined {
    return this.cards?.filter(c => c.selected);
  }
}
