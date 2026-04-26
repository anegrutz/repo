import { Platform } from 'react-native';
import Constants from 'expo-constants';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';

let initialized = false;

/**
 * Android emulator can't reach the host's `localhost` directly — its loopback
 * is `10.0.2.2`. iOS simulator and physical iOS devices share localhost with
 * the host, so they keep using `localhost`.
 */
function emulatorHost(): string {
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

/**
 * Connects RNFirebase to the local emulator suite when the
 * `firebase.useEmulators` extra flag is true and the app is in dev. The real
 * project credentials still have to be loaded by the native modules via
 * `GoogleService-Info.plist` / `google-services.json`.
 */
export function initFirebase(): void {
  if (initialized) return;
  if (firebase.apps.length === 0) return;

  const useEmulators =
    __DEV__ && Boolean(Constants.expoConfig?.extra?.firebase?.useEmulators);

  if (useEmulators) {
    const host = emulatorHost();
    auth().useEmulator(`http://${host}:9099`);
    firestore().useEmulator(host, 8080);
    functions().useEmulator(host, 5001);
    storage().useEmulator(host, 9199);
  }

  initialized = true;
}
