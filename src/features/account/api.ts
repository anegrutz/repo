import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

export async function deleteMyAccount(): Promise<void> {
  const fn = functions().httpsCallable('deleteMyAccount');
  await fn({});
  // The auth user has been deleted server-side; sign out locally so the
  // RNFirebase listener flips to unauthenticated and the gate redirects.
  await auth().signOut().catch(() => undefined);
}

export async function requestDataExport(): Promise<unknown> {
  const fn = functions().httpsCallable('requestDataExport');
  const res = await fn({});
  return res.data;
}
