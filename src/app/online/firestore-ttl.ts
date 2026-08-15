import {Timestamp} from 'firebase/firestore';

export const ROOM_TTL_MS = 60 * 60 * 1000;
export const PRESENCE_TTL_MS = 5 * 60 * 1000;
export const PROCESSED_ACTION_TTL_MS = 5 * 60 * 1000;

export function expirationTimestamp(ttlInMs: number, now: number = Date.now()): Timestamp {
  return Timestamp.fromMillis(now + ttlInMs);
}
