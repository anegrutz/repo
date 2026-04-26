import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { fuzz, type LatLng } from '@/lib/location';

export type FriendLocation = {
  uid: string;
  displayName: string;
  fuzzy: LatLng | null;
  couchLockMode: boolean;
  lastUpdated: number | null;
};

function requireUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated');
  return uid;
}

export async function updateMyLocation(raw: LatLng): Promise<void> {
  const uid = requireUid();
  const fuzzed = fuzz(raw);
  await firestore().doc(`users/${uid}`).set(
    {
      location: {
        fuzzy: fuzzed,
        lastUpdated: Date.now(),
      },
    },
    { merge: true },
  );
}

export async function setCouchLock(enabled: boolean): Promise<void> {
  const uid = requireUid();
  await firestore().doc(`users/${uid}`).set(
    {
      location: { couchLockMode: enabled },
    },
    { merge: true },
  );
}

export async function fetchFriendLocations(matchUids: string[]): Promise<FriendLocation[]> {
  if (matchUids.length === 0) return [];
  const snaps = await Promise.all(
    matchUids.map((uid) => firestore().doc(`users/${uid}`).get()),
  );
  const out: FriendLocation[] = [];
  for (const snap of snaps) {
    if (!snap.exists) continue;
    const data = snap.data() as {
      displayName?: string;
      location?: { fuzzy?: LatLng; couchLockMode?: boolean; lastUpdated?: number };
    };
    out.push({
      uid: snap.id,
      displayName: data.displayName ?? 'Unknown',
      fuzzy: data.location?.fuzzy ?? null,
      couchLockMode: Boolean(data.location?.couchLockMode),
      lastUpdated: data.location?.lastUpdated ?? null,
    });
  }
  return out;
}
