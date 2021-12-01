import {Card} from '../card/card';

export interface Player {
  id: string;
  name: string;
  cards?: Card[];
}
