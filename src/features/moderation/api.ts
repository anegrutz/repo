import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import type { ReportReason } from './helpers';

function requireUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated');
  return uid;
}

export async function reportUser(input: {
  reportedUid: string;
  reason: ReportReason;
  matchId?: string;
  note?: string;
}): Promise<void> {
  const reporterId = requireUid();
  await firestore().collection('reports').add({
    reporterId,
    reportedId: input.reportedUid,
    reason: input.reason,
    matchId: input.matchId ?? null,
    note: input.note ?? '',
    createdAt: Date.now(),
    status: 'pending',
  });
}

export async function unmatch(matchId: string): Promise<void> {
  await firestore().doc(`matches/${matchId}`).update({
    status: 'unmatched',
    unmatchedAt: Date.now(),
  });
}
