import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import type { OnboardingDraft, Photo, Profile } from './schema';
import { profileSchema } from './schema';

function requireUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User must be authenticated');
  return uid;
}

export async function readProfile(uid: string): Promise<Profile | null> {
  const snap = await firestore().doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const parsed = profileSchema.safeParse({ uid, ...snap.data() });
  return parsed.success ? parsed.data : null;
}

export async function persistDraft(draft: OnboardingDraft): Promise<Profile> {
  const uid = requireUid();
  const now = Date.now();
  const tokenResult = await auth().currentUser!.getIdTokenResult();
  const ageVerifiedAt =
    typeof tokenResult.claims.ageVerifiedAt === 'number'
      ? tokenResult.claims.ageVerifiedAt
      : 0;

  const profile: Profile = profileSchema.parse({
    uid,
    displayName: draft.displayName,
    bio: draft.bio,
    vibe: draft.vibe,
    munchies: draft.munchies,
    photos: draft.photos,
    country: 'NL',
    ageVerifiedAt,
    createdAt: now,
    lastActiveAt: now,
  });

  const { uid: _uid, ...payload } = profile;
  await firestore().doc(`users/${uid}`).set(payload, { merge: true });
  return profile;
}

export async function pickAndUploadPhoto(): Promise<Photo | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
    allowsEditing: true,
    aspect: [4, 5],
  });
  if (picked.canceled || picked.assets.length === 0) return null;
  const asset = picked.assets[0];
  if (!asset) return null;

  const compressed = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );

  const uid = requireUid();
  const photoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `users/${uid}/photos/${photoId}.jpg`;
  await storage().ref(storagePath).putFile(compressed.uri, {
    contentType: 'image/jpeg',
  });

  return {
    id: photoId,
    storagePath,
    width: compressed.width,
    height: compressed.height,
  };
}

export async function deletePhoto(photo: Photo): Promise<void> {
  await storage().ref(photo.storagePath).delete();
}
