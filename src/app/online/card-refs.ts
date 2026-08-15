import {Card} from '../game/api/game.model';
import {CardRef} from './online.model';

/**
 * Card objects are compared by reference inside GameReducer/GameValidator, but action commands
 * travel through Firestore as plain data. CardRef identifies a physical card by its value/symbol
 * combination (unique across the 54-card deck, including both distinctly colored jokers) so the
 * host can resolve an incoming command back to the real Card object instances it holds in memory.
 */
export function toCardRef(card: Card): CardRef {
  return {
    valueOrder: card.value.order,
    symbolType: card.symbol.type,
    symbolColor: card.symbol.color
  };
}

export function toCardRefs(cards: Card[]): CardRef[] {
  return cards.map(toCardRef);
}

export function cardMatchesRef(card: Card, ref: CardRef): boolean {
  return card.value.order === ref.valueOrder
    && card.symbol.type === ref.symbolType
    && card.symbol.color === ref.symbolColor;
}

export function resolveCardRef(pool: Card[], ref: CardRef, exclude: Card[] = []): Card | null {
  return pool.find(card => !exclude.includes(card) && cardMatchesRef(card, ref)) ?? null;
}

/**
 * Resolves every ref to a distinct Card instance from the pool, in order. Returns an empty array
 * (rather than a partial result) if any ref cannot be matched, so callers can reject the whole
 * command atomically instead of silently dropping cards.
 */
export function resolveCardRefs(pool: Card[], refs: CardRef[]): Card[] {
  const resolved: Card[] = [];
  for (const ref of refs) {
    const match = resolveCardRef(pool, ref, resolved);
    if (!match) {
      return [];
    }
    resolved.push(match);
  }
  return resolved;
}
