import {isValidRoomAction} from './online.model';
import {Timestamp} from 'firebase/firestore';

describe('online action validation', () => {
  it('accepts a well-formed move', () => {
    expect(isValidRoomAction({
      type: 'move',
      uid: 'player-1',
      createdAt: Date.now(),
      processed: false,
      expiresAt: Timestamp.now(),
      cards: [{valueOrder: 7, symbolType: 'hearts', symbolColor: 'red'}],
      cardToTake: null
    })).toBe(true);
  });

  it('rejects malformed card references', () => {
    expect(isValidRoomAction({
      type: 'move',
      uid: 'player-1',
      createdAt: Date.now(),
      processed: false,
      expiresAt: Timestamp.now(),
      cards: [null],
      cardToTake: null
    })).toBe(false);
  });

  it('rejects unknown action types', () => {
    expect(isValidRoomAction({
      type: 'overwrite-state',
      uid: 'player-1',
      createdAt: Date.now(),
      processed: false,
      expiresAt: Timestamp.now()
    })).toBe(false);
  });
});
