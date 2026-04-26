import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

import type { ChatMessage } from '@/types';

function requireUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated');
  return uid;
}

export async function sendMessage(matchId: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  if (trimmed.length > 2000) throw new Error('Message too long');

  const uid = requireUid();
  const messagesRef = firestore().collection(`matches/${matchId}/messages`);
  const matchRef = firestore().doc(`matches/${matchId}`);

  const batch = firestore().batch();
  const newMsg = messagesRef.doc();
  batch.set(newMsg, {
    senderId: uid,
    text: trimmed,
    createdAt: Date.now(),
    readBy: [uid],
  });
  batch.update(matchRef, { lastMessageAt: Date.now() });
  await batch.commit();
}

export function subscribeMessages(
  matchId: string,
  onChange: (msgs: ChatMessage[]) => void,
): () => void {
  return firestore()
    .collection(`matches/${matchId}/messages`)
    .orderBy('createdAt', 'asc')
    .onSnapshot((snap: FirebaseFirestoreTypes.QuerySnapshot) => {
      const msgs: ChatMessage[] = [];
      for (const doc of snap.docs) {
        const data = doc.data() as Omit<ChatMessage, 'id'>;
        msgs.push({ id: doc.id, ...data });
      }
      onChange(msgs);
    });
}

export async function generateIcebreakerForMatch(matchId: string): Promise<string> {
  const fn = functions().httpsCallable('generateIcebreaker');
  const res = await fn({ matchId });
  const data = res.data as { question?: string } | null;
  if (!data?.question) throw new Error('No icebreaker returned');
  return data.question;
}
