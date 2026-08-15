import {generateRoomCode, isValidRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH} from './room-code';

describe('room-code', () => {

  describe('generateRoomCode', () => {

    it('generates a code of the expected length', () => {
      const code = generateRoomCode();
      expect(code.length).toBe(ROOM_CODE_LENGTH);
    });

    it('generates a code that only contains unambiguous uppercase letters/digits', () => {
      const code = generateRoomCode();
      expect(isValidRoomCode(code)).toBe(true);
    });

    it('never includes visually ambiguous characters (0, O, 1, I)', () => {
      for (let i = 0; i < 200; i++) {
        const code = generateRoomCode();
        expect(code).not.toMatch(/[01OI]/);
      }
    });

    it('uses the provided random function deterministically', () => {
      const alwaysZero = () => 0;
      const code = generateRoomCode(alwaysZero);
      expect(code).toBe('AAAAAA');
    });
  });

  describe('normalizeRoomCode', () => {

    it('trims whitespace and uppercases the code', () => {
      expect(normalizeRoomCode('  a2b3c4  ')).toBe('A2B3C4');
    });
  });

  describe('isValidRoomCode', () => {

    it('accepts a valid 6-character code', () => {
      expect(isValidRoomCode('A2B3C4')).toBe(true);
    });

    it('rejects codes with the wrong length', () => {
      expect(isValidRoomCode('A2B3C')).toBe(false);
      expect(isValidRoomCode('A2B3C45')).toBe(false);
    });

    it('rejects codes containing ambiguous characters', () => {
      expect(isValidRoomCode('A2B3O4')).toBe(false);
      expect(isValidRoomCode('A2B3I4')).toBe(false);
      expect(isValidRoomCode('A2B304')).toBe(false);
      expect(isValidRoomCode('A2B314')).toBe(false);
    });

    it('rejects lowercase codes', () => {
      expect(isValidRoomCode('a2b3c4')).toBe(false);
    });
  });
});
