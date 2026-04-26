import { REPORT_REASONS, scoreToAction } from '@/features/moderation/helpers';

describe('scoreToAction', () => {
  it('allows benign messages (score < 0.6)', () => {
    expect(scoreToAction(0)).toBe('allow');
    expect(scoreToAction(0.4)).toBe('allow');
    expect(scoreToAction(0.59)).toBe('allow');
  });

  it('flags moderate toxicity (0.6..0.85)', () => {
    expect(scoreToAction(0.6)).toBe('flag');
    expect(scoreToAction(0.75)).toBe('flag');
    expect(scoreToAction(0.849)).toBe('flag');
  });

  it('blocks high toxicity (>= 0.85)', () => {
    expect(scoreToAction(0.85)).toBe('block');
    expect(scoreToAction(0.99)).toBe('block');
    expect(scoreToAction(1)).toBe('block');
  });

  it('treats NaN as allow (defensive)', () => {
    expect(scoreToAction(Number.NaN)).toBe('allow');
  });
});

describe('REPORT_REASONS', () => {
  it('contains the canonical 5 reasons', () => {
    expect(REPORT_REASONS).toEqual([
      'harassment',
      'inappropriate_photos',
      'underage',
      'spam',
      'other',
    ]);
  });

  it('has a unique set of values', () => {
    const set = new Set<string>(REPORT_REASONS);
    expect(set.size).toBe(REPORT_REASONS.length);
  });
});
