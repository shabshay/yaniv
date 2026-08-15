import {isValidRoomAction} from './online.model';

describe('online action validation', () => {
  it('accepts a well-formed move', () => {
    expect(isValidRoomAction({
      type: 'move',
      uid: 'player-1',
      createdAt: Date.now(),
      processed: false,
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
      cards: [null],
      cardToTake: null
    })).toBe(false);
  });

  it('rejects unknown action types', () => {
    expect(isValidRoomAction({
      type: 'overwrite-state',
      uid: 'player-1',
      createdAt: Date.now(),
      processed: false
    })).toBe(false);
  });
});
