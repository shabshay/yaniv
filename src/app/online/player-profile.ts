export const MAX_PLAYER_NAME_LENGTH = 20;

export const PLAYER_AVATARS = [
  'assets/avatar1.png',
  'assets/avatar2.png',
  'assets/avatar3.png',
  'assets/avatar4.png'
] as const;

export function normalizePlayerName(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, MAX_PLAYER_NAME_LENGTH);
}

export function isAllowedPlayerAvatar(img: unknown): img is typeof PLAYER_AVATARS[number] {
  return typeof img === 'string' && PLAYER_AVATARS.includes(img as typeof PLAYER_AVATARS[number]);
}
