import {Card} from '../game/api/game.model';
import {cardMatchesRef, resolveCardRef, resolveCardRefs, toCardRef, toCardRefs} from './card-refs';

function card(order: number, type: string, color: string): Card {
  return {value: {text: String(order), score: order, order}, symbol: {icon: type, type, color}};
}

describe('card-refs', () => {

  const sevenClubs = card(7, 'clubs', 'black');
  const sevenDiamonds = card(7, 'diamonds', 'red');
  const kingSpades = card(13, 'spades', 'black');
  const jokerRed = card(0, 'joker', 'red');
  const jokerBlack = card(0, 'joker', 'black');

  describe('toCardRef / toCardRefs', () => {

    it('maps a card to a plain, serializable reference', () => {
      expect(toCardRef(sevenClubs)).toEqual({valueOrder: 7, symbolType: 'clubs', symbolColor: 'black'});
    });

    it('maps a list of cards preserving order', () => {
      expect(toCardRefs([sevenClubs, kingSpades])).toEqual([
        {valueOrder: 7, symbolType: 'clubs', symbolColor: 'black'},
        {valueOrder: 13, symbolType: 'spades', symbolColor: 'black'}
      ]);
    });
  });

  describe('cardMatchesRef', () => {

    it('matches a card with the same value/symbol/color', () => {
      expect(cardMatchesRef(sevenClubs, toCardRef(sevenClubs))).toBe(true);
    });

    it('does not match a card with a different symbol', () => {
      expect(cardMatchesRef(sevenClubs, toCardRef(sevenDiamonds))).toBe(false);
    });

    it('distinguishes the two differently-colored jokers', () => {
      expect(cardMatchesRef(jokerRed, toCardRef(jokerBlack))).toBe(false);
      expect(cardMatchesRef(jokerRed, toCardRef(jokerRed))).toBe(true);
    });
  });

  describe('resolveCardRef', () => {

    it('finds the matching card instance in the pool', () => {
      const pool = [sevenClubs, kingSpades, jokerRed];
      expect(resolveCardRef(pool, toCardRef(kingSpades))).toBe(kingSpades);
    });

    it('returns null when no card in the pool matches', () => {
      const pool = [sevenClubs, kingSpades];
      expect(resolveCardRef(pool, toCardRef(jokerRed))).toBeNull();
    });

    it('skips already-excluded card instances so duplicates resolve to distinct objects', () => {
      const sevenClubsCopy = card(7, 'clubs', 'black');
      const pool = [sevenClubs, sevenClubsCopy];
      const first = resolveCardRef(pool, toCardRef(sevenClubs));
      const second = resolveCardRef(pool, toCardRef(sevenClubs), first ? [first] : []);
      expect(first).toBe(sevenClubs);
      expect(second).toBe(sevenClubsCopy);
    });
  });

  describe('resolveCardRefs', () => {

    it('resolves every ref to a distinct card instance from the pool, in order', () => {
      const pool = [sevenClubs, kingSpades, jokerRed];
      const resolved = resolveCardRefs(pool, [toCardRef(kingSpades), toCardRef(sevenClubs)]);
      expect(resolved).toEqual([kingSpades, sevenClubs]);
    });

    it('resolves duplicate refs to two distinct matching instances when both exist', () => {
      const sevenClubsCopy = card(7, 'clubs', 'black');
      const pool = [sevenClubs, sevenClubsCopy, kingSpades];
      const resolved = resolveCardRefs(pool, [toCardRef(sevenClubs), toCardRef(sevenClubs)]);
      expect(resolved).toEqual([sevenClubs, sevenClubsCopy]);
      expect(resolved[0]).not.toBe(resolved[1]);
    });

    it('returns an empty array when any ref cannot be matched, rejecting the whole command', () => {
      const pool = [sevenClubs, kingSpades];
      const resolved = resolveCardRefs(pool, [toCardRef(sevenClubs), toCardRef(jokerRed)]);
      expect(resolved).toEqual([]);
    });

    it('returns an empty array (not a partial match) when the pool lacks enough duplicates', () => {
      const pool = [sevenClubs];
      const resolved = resolveCardRefs(pool, [toCardRef(sevenClubs), toCardRef(sevenClubs)]);
      expect(resolved).toEqual([]);
    });
  });
});
