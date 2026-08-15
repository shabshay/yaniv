import {
  isAllowedPlayerAvatar,
  MAX_PLAYER_NAME_LENGTH,
  normalizePlayerName,
  PLAYER_AVATARS
} from './player-profile';

describe('player profile validation', () => {
  it('normalizes, strips control characters and limits names', () => {
    const name = `  Player\u0000${'x'.repeat(MAX_PLAYER_NAME_LENGTH)}  `;

    expect(normalizePlayerName(name)).toBe(`Player${'x'.repeat(14)}`);
    expect(normalizePlayerName(name)).toHaveLength(MAX_PLAYER_NAME_LENGTH);
  });

  it('allows only bundled avatar paths', () => {
    expect(isAllowedPlayerAvatar(PLAYER_AVATARS[0])).toBe(true);
    expect(isAllowedPlayerAvatar('https://attacker.example/tracker.png')).toBe(false);
  });
});
