export function formatTime(ts: number, now = Date.now()): string {
  const diff = now - ts;
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

export type Side = 'me' | 'them';

export function side(senderId: string, myUid: string | null): Side {
  return senderId === myUid ? 'me' : 'them';
}
