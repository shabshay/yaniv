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

  get cardsCount(): number {
    const cardsValues: number[] | undefined = this.cards?.map(card => card.value);
    return cardsValues?.reduce((a, b) => a + b, 0) ?? 0;
  }

  isReachedYaniv(): boolean {
    return this.cardsCount <= 7;
  }
}
