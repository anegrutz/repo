export const REPORT_REASONS = [
  'harassment',
  'inappropriate_photos',
  'underage',
  'spam',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export type ModerationAction = 'allow' | 'flag' | 'block';

/**
 * Maps a Perspective-style 0..1 toxicity / severe-toxicity score to an action.
 * - < 0.6: allow as-is
 * - 0.6..0.85: flag (kept in the DB, hidden in the UI, surfaced to admins)
 * - > 0.85: block (server stores `redacted_text` placeholder; never delivered)
 */
export function scoreToAction(score: number): ModerationAction {
  if (Number.isNaN(score) || score < 0.6) return 'allow';
  if (score < 0.85) return 'flag';
  return 'block';
}
