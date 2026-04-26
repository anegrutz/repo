import firebase from '@react-native-firebase/app';
import appCheck from '@react-native-firebase/app-check';

let initialized = false;

export function initFirebase(): void {
  if (initialized) return;
  if (firebase.apps.length === 0) {
    return;
  }
  void appCheck()
    .newReactNativeFirebaseAppCheckProvider()
    .configure({
      android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
      apple: { provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback' },
    });
  initialized = true;
}
