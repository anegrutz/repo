import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

if (getApps().length === 0) initializeApp();

async function deleteCollection(path: string, batchSize = 50): Promise<void> {
  const db = getFirestore();
  const ref = db.collection(path);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await ref.limit(batchSize).get();
    if (snap.empty) return;
    const batch = db.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);
    await batch.commit();
  }
}

export const deleteMyAccount = onCall<Record<string, never>>(
  { region: 'europe-west1' },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    const uid = req.auth.uid;
    const db = getFirestore();

    // 1. Delete swipes/{uid}/targets/*
    await deleteCollection(`swipes/${uid}/targets`);
    await db.doc(`swipes/${uid}`).delete().catch(() => undefined);

    // 2. Mark all matches involving this user as unmatched (preserve history
    //    on the other side rather than ripping it out, so the partner can
    //    still see the conversation transcript ended on a date).
    const matches = await db.collection('matches').where('users', 'array-contains', uid).get();
    const matchBatch = db.batch();
    for (const m of matches.docs) {
      matchBatch.update(m.ref, { status: 'unmatched', unmatchedAt: Date.now() });
    }
    if (!matches.empty) await matchBatch.commit();

    // 3. Delete all photos in Storage
    try {
      await getStorage().bucket().deleteFiles({ prefix: `users/${uid}/photos/` });
    } catch (e) {
      logger.warn('Photo deletion partial failure', { uid, error: String(e) });
    }

    // 4. Delete the user profile
    await db.doc(`users/${uid}`).delete().catch(() => undefined);

    // 5. Delete the auth user (this is the irreversible step — last)
    try {
      await getAuth().deleteUser(uid);
    } catch (e) {
      logger.error('Auth user deletion failed', { uid, error: String(e) });
      throw new HttpsError('internal', 'Account deletion partially failed');
    }

    logger.info('Account deleted', { uid });
    return { ok: true };
  },
);
