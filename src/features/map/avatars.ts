const AVATARS = ['👽', '🍕', '🌿', '✨', '🦄', '🐸', '🍩', '🌮', '🛸', '🎮'] as const;

export function avatarFor(uid: string): string {
  if (!uid) return AVATARS[0];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  return AVATARS[hash % AVATARS.length] ?? AVATARS[0];
}

export const COUCH_LOCK_AVATAR = '🛋️';
