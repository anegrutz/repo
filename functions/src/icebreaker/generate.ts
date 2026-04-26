import { onCall, HttpsError } from 'firebase-functions/v2/https';

export const generateIcebreaker = onCall<{ matchId: string }>(
  { secrets: ['ANTHROPIC_API_KEY'] },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    if (!req.data.matchId) throw new HttpsError('invalid-argument', 'matchId required');
    return { question: 'What conspiracy theory do you secretly half-believe?' };
  },
);
