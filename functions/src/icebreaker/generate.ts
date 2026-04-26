import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';

if (getApps().length === 0) initializeApp();

const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

const SYSTEM_PROMPT = `You generate playful icebreaker questions for PuffMatch, a 420-friendly social discovery app for the Netherlands.

Rules:
- Output exactly one question, no preamble, no quotes, no bullet points.
- Light, cheeky, conversational — nothing heavy (politics, religion, mental health crises).
- Avoid explicit drug-use content; keep it lifestyle-flavoured (coffeeshop, munchies, weekend energy).
- 6 to 22 words.
- English by default unless the user data clearly says otherwise.
- Vary your phrasing and structure across responses — don't fall into a template.`;

type IcebreakerInput = { matchId: string };

type ProfileSnapshot = {
  displayName: string;
  vibe: 'indica' | 'sativa';
  munchies: string[];
};

async function readProfile(uid: string): Promise<ProfileSnapshot | null> {
  const snap = await getFirestore().doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const d = snap.data() as Partial<ProfileSnapshot>;
  if (!d.displayName || !d.vibe || !Array.isArray(d.munchies)) return null;
  return {
    displayName: d.displayName,
    vibe: d.vibe,
    munchies: d.munchies.slice(0, 3),
  };
}

export const generateIcebreaker = onCall<IcebreakerInput>(
  { secrets: [anthropicKey], region: 'europe-west1' },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    const matchId = req.data?.matchId;
    if (!matchId) throw new HttpsError('invalid-argument', 'matchId required');

    const matchSnap = await getFirestore().doc(`matches/${matchId}`).get();
    const matchData = matchSnap.data() as { users?: [string, string]; status?: string } | undefined;
    if (!matchData || !Array.isArray(matchData.users) || !matchData.users.includes(req.auth.uid)) {
      throw new HttpsError('permission-denied', 'Not a participant of this match');
    }
    if (matchData.status !== 'active') {
      throw new HttpsError('failed-precondition', 'Match is not active');
    }

    const [a, b] = matchData.users;
    const [profileA, profileB] = await Promise.all([readProfile(a), readProfile(b)]);
    if (!profileA || !profileB) {
      throw new HttpsError('failed-precondition', 'Both profiles must exist');
    }

    const userMessage = `Match context (do not repeat back):
- ${profileA.displayName}: Team ${profileA.vibe === 'indica' ? 'Indica' : 'Sativa'}, munchies: ${profileA.munchies.join(', ') || 'unknown'}
- ${profileB.displayName}: Team ${profileB.vibe === 'indica' ? 'Indica' : 'Sativa'}, munchies: ${profileB.munchies.join(', ') || 'unknown'}

Give one fresh icebreaker question now.`;

    const client = new Anthropic({ apiKey: anthropicKey.value() });
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 200,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const question =
      textBlock && textBlock.type === 'text' ? textBlock.text.trim().replace(/^"|"$/g, '') : '';
    if (!question) {
      logger.error('Empty icebreaker response', { matchId });
      throw new HttpsError('internal', 'Icebreaker generation failed');
    }

    logger.info('Icebreaker generated', {
      matchId,
      cacheRead: response.usage.cache_read_input_tokens,
      cacheCreate: response.usage.cache_creation_input_tokens,
      output: response.usage.output_tokens,
    });

    return { question };
  },
);
