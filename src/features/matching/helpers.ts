import type { SwipeDirection } from '@/types';

export function computeMatchId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

export function directionToFirestore(direction: 'right' | 'left' | 'up'): SwipeDirection {
  switch (direction) {
    case 'right':
      return 'ash'; // "Pass the joint" — like
    case 'up':
      return 'hotbox'; // super like
    case 'left':
      return 'pass'; // skip
  }
}
