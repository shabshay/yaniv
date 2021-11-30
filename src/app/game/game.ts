import {Player} from '../player/player';
import {Card} from '../card/card';

export interface Game {
  players: Player[];
  deck: Card[];
}
