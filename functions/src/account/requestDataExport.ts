import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) initializeApp();

/**
 * GDPR Article 20 — right to data portability. Returns a JSON snapshot of
 * everything the app stores about the calling user. Photos in Storage are
 * referenced by `storagePath` rather than re-encoded inline; the client can
 * download originals separately if needed.
 */
export const requestDataExport = onCall<Record<string, never>>(
  { region: 'europe-west1' },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    const uid = req.auth.uid;
    const db = getFirestore();

    const profileSnap = await db.doc(`users/${uid}`).get();
    const swipesSnap = await db.collection(`swipes/${uid}/targets`).get();
    const matchesSnap = await db.collection('matches').where('users', 'array-contains', uid).get();

    const messages: Array<{ matchId: string; messageId: string; data: unknown }> = [];
    for (const match of matchesSnap.docs) {
      const msgs = await match.ref.collection('messages').orderBy('createdAt').get();
      for (const m of msgs.docs) {
        messages.push({ matchId: match.id, messageId: m.id, data: m.data() });
      }
    }

    return {
      exportedAt: Date.now(),
      uid,
      profile: profileSnap.exists ? profileSnap.data() : null,
      swipes: swipesSnap.docs.map((d) => ({ targetUid: d.id, ...d.data() })),
      matches: matchesSnap.docs.map((d) => ({ matchId: d.id, ...d.data() })),
      messages,
    };
  },
);
