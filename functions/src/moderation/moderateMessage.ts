import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import { scoreToAction, type ModerationAction } from './scoreToAction';

if (getApps().length === 0) initializeApp();

const perspectiveKey = defineSecret('PERSPECTIVE_API_KEY');

type PerspectiveResponse = {
  attributeScores?: {
    TOXICITY?: { summaryScore?: { value?: number } };
    SEVERE_TOXICITY?: { summaryScore?: { value?: number } };
  };
};

async function scoreText(text: string, apiKey: string): Promise<number | null> {
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;
  const body = {
    comment: { text },
    languages: ['en', 'nl'],
    requestedAttributes: { TOXICITY: {}, SEVERE_TOXICITY: {} },
    doNotStore: true,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    logger.warn('Perspective API non-OK', { status: res.status });
    return null;
  }
  const json = (await res.json()) as PerspectiveResponse;
  const tox = json.attributeScores?.TOXICITY?.summaryScore?.value ?? 0;
  const severe = json.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value ?? 0;
  return Math.max(tox, severe);
}

export const moderateMessage = onDocumentCreated(
  {
    document: 'matches/{matchId}/messages/{messageId}',
    region: 'europe-west1',
    secrets: [perspectiveKey],
  },
  async (event) => {
    const data = event.data?.data() as { text?: string } | undefined;
    if (!data?.text) return;
    const ref = event.data!.ref;

    const apiKey = perspectiveKey.value();
    if (!apiKey) {
      logger.info('PERSPECTIVE_API_KEY not configured; skipping moderation', {
        matchId: event.params.matchId,
      });
      return;
    }

    let score: number | null;
    try {
      score = await scoreText(data.text, apiKey);
    } catch (e) {
      logger.error('Perspective fetch failed', { error: String(e) });
      return;
    }
    if (score == null) return;

    const action: ModerationAction = scoreToAction(score);
    if (action === 'allow') return;

    const update: Record<string, unknown> = {
      moderation: { score, action, scoredAt: Date.now() },
    };
    if (action === 'block') {
      update.text = '[removed by auto-moderation]';
      update.redactedText = data.text;
    }

    await ref.update(update);

    if (action === 'block' || action === 'flag') {
      await getFirestore().collection('moderation_queue').add({
        matchId: event.params.matchId,
        messageId: event.params.messageId,
        text: data.text,
        score,
        action,
        createdAt: Date.now(),
      });
    }

    logger.info('Moderation applied', {
      matchId: event.params.matchId,
      messageId: event.params.messageId,
      score,
      action,
    });
  },
);
