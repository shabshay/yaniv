import {Card} from '../card/card';

export class Player {
  id: string;
  name: string;
  cards?: Card[];
  score = 0;
  isCurrentPlayer = false;
  isOut = false;
  showCards = false;

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

  isReachedYaniv(): boolean {
    return this.cardsScore <= 7;
  }
}
