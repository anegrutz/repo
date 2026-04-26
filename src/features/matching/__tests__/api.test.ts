import { computeMatchId, directionToFirestore } from '@/features/matching/helpers';

describe('computeMatchId', () => {
  it('is deterministic regardless of argument order', () => {
    expect(computeMatchId('alice', 'bob')).toBe(computeMatchId('bob', 'alice'));
  });

  it('joins the sorted uids with an underscore', () => {
    expect(computeMatchId('zzz', 'aaa')).toBe('aaa_zzz');
  });
});

describe('directionToFirestore', () => {
  it('maps right swipe to "ash" (Pass the joint = like)', () => {
    expect(directionToFirestore('right')).toBe('ash');
  });

  it('maps left swipe to "pass" (skip)', () => {
    expect(directionToFirestore('left')).toBe('pass');
  });

  it('maps up swipe to "hotbox" (super like)', () => {
    expect(directionToFirestore('up')).toBe('hotbox');
  });
});
