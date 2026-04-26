import Constants from 'expo-constants';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';

let initialized = false;

/**
 * Connects RNFirebase to the local emulator suite when the
 * `firebase.useEmulators` extra flag is true and the app is in dev. The real
 * project credentials still have to be loaded by the native modules via
 * `GoogleService-Info.plist` / `google-services.json` — those land in Phase 7.
 */
export function initFirebase(): void {
  if (initialized) return;
  if (firebase.apps.length === 0) return;

  const useEmulators =
    __DEV__ && Boolean(Constants.expoConfig?.extra?.firebase?.useEmulators);

  if (useEmulators) {
    auth().useEmulator('http://localhost:9099');
    firestore().useEmulator('localhost', 8080);
    functions().useEmulator('localhost', 5001);
    storage().useEmulator('localhost', 9199);
  }

  initialized = true;
}
