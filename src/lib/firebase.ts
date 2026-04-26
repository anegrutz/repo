import firebase from '@react-native-firebase/app';

let initialized = false;

/**
 * Phase 0 stub. RNFirebase auto-initializes from `GoogleService-Info.plist`
 * (iOS) and `google-services.json` (Android) once those files are added in
 * Phase 1. App Check, Crashlytics, and analytics wiring follow in Phase 7.
 */
export function initFirebase(): void {
  if (initialized) return;
  if (firebase.apps.length === 0) return;
  initialized = true;
}
