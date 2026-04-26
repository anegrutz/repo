/**
 * Mirrors the client's `src/features/moderation/helpers.ts`. Kept duplicated
 * (rather than published as a shared package) because the functions/ codebase
 * is intentionally a separate npm package — the duplication is small and the
 * thresholds are unit-tested on the client side.
 */
export type ModerationAction = 'allow' | 'flag' | 'block';

export function scoreToAction(score: number): ModerationAction {
  if (Number.isNaN(score) || score < 0.6) return 'allow';
  if (score < 0.85) return 'flag';
  return 'block';
}
