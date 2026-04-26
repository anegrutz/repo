import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import type { Profile } from '@/features/profile/schema';
import { profileSchema } from '@/features/profile/schema';
import type { SwipeDirection } from '@/types';

export { computeMatchId, directionToFirestore } from './helpers';

export type DiscoveryCard = Pick<
  Profile,
  'uid' | 'displayName' | 'bio' | 'vibe' | 'munchies' | 'photos'
>;

export type MatchSummary = {
  id: string;
  otherUid: string;
  createdAt: number;
  lastMessageAt: number | null;
};

const DISCOVERY_PAGE_SIZE = 20;

function requireUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated');
  return uid;
}

export async function fetchDiscoveryDeck(): Promise<DiscoveryCard[]> {
  const uid = requireUid();

  const swipedSnap = await firestore().collection(`swipes/${uid}/targets`).get();
  const excluded = new Set<string>(swipedSnap.docs.map((d) => d.id));
  excluded.add(uid);

  const usersSnap = await firestore()
    .collection('users')
    .where('country', '==', 'NL')
    .orderBy('lastActiveAt', 'desc')
    .limit(DISCOVERY_PAGE_SIZE * 2)
    .get();

  const cards: DiscoveryCard[] = [];
  for (const doc of usersSnap.docs) {
    if (excluded.has(doc.id)) continue;
    const parsed = profileSchema.safeParse({ uid: doc.id, ...doc.data() });
    if (!parsed.success) continue;
    const { uid: cardUid, displayName, bio, vibe, munchies, photos } = parsed.data;
    cards.push({ uid: cardUid, displayName, bio, vibe, munchies, photos });
    if (cards.length === DISCOVERY_PAGE_SIZE) break;
  }
  return cards;
}

export async function recordSwipe(
  targetUid: string,
  direction: SwipeDirection,
): Promise<void> {
  const uid = requireUid();
  await firestore().doc(`swipes/${uid}/targets/${targetUid}`).set({
    direction,
    createdAt: Date.now(),
  });
}

export function subscribeMatches(
  onChange: (matches: MatchSummary[]) => void,
): () => void {
  const uid = requireUid();
  return firestore()
    .collection('matches')
    .where('users', 'array-contains', uid)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snap) => {
      const items: MatchSummary[] = [];
      for (const doc of snap.docs) {
        const data = doc.data() as {
          users: [string, string];
          createdAt: number;
          lastMessageAt: number | null;
        };
        const otherUid = data.users.find((u) => u !== uid) ?? '';
        items.push({
          id: doc.id,
          otherUid,
          createdAt: data.createdAt,
          lastMessageAt: data.lastMessageAt,
        });
      }
      onChange(items);
    });
}
