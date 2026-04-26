import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { logger } from 'firebase-functions/v2';

if (getApps().length === 0) initializeApp();

export const computeMatch = onDocumentCreated(
  'swipes/{swiperUid}/targets/{targetUid}',
  async (event) => {
    const data = event.data?.data();
    if (!data || data.direction === 'pass') return;
    const { swiperUid, targetUid } = event.params;

    const reciprocalSnap = await getFirestore()
      .doc(`swipes/${targetUid}/targets/${swiperUid}`)
      .get();
    const reciprocal = reciprocalSnap.data();
    if (!reciprocal || reciprocal.direction === 'pass') return;

    const matchId = [swiperUid, targetUid].sort().join('_');
    await getFirestore().doc(`matches/${matchId}`).set(
      {
        users: [swiperUid, targetUid].sort(),
        createdAt: Date.now(),
        lastMessageAt: null,
        status: 'active',
      },
      { merge: true },
    );
    logger.info('Match created', { matchId });
  },
);
