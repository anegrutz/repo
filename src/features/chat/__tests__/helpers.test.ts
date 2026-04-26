import { formatTime, side } from '@/features/chat/helpers';

describe('formatTime', () => {
  const NOW = 1_700_000_000_000;

  it('returns "now" for messages within the last minute', () => {
    expect(formatTime(NOW - 30_000, NOW)).toBe('now');
  });

  it('returns minute count for messages within the last hour', () => {
    expect(formatTime(NOW - 5 * 60_000, NOW)).toBe('5m');
  });

  it('returns hour count for messages within the last day', () => {
    expect(formatTime(NOW - 3 * 3_600_000, NOW)).toBe('3h');
  });

  it('returns day count for older messages', () => {
    expect(formatTime(NOW - 4 * 86_400_000, NOW)).toBe('4d');
  });
});

describe('side', () => {
  it('returns "me" when sender matches my uid', () => {
    expect(side('alice', 'alice')).toBe('me');
  });

  it('returns "them" when sender does not match my uid', () => {
    expect(side('alice', 'bob')).toBe('them');
  });

  it('returns "them" when myUid is null (defensive)', () => {
    expect(side('alice', null)).toBe('them');
  });
});
