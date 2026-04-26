import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';

import { readClaims } from './api';
import { useAuth } from './store';

/**
 * Subscribes to Firebase auth state changes and pushes them into the Zustand
 * store. Mount this once at the app root.
 */
export function useAuthListener(): void {
  const { setAuthenticated, setUnauthenticated } = useAuth();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (!user) {
        setUnauthenticated();
        return;
      }
      const claims = await readClaims();
      setAuthenticated({ uid: user.uid, email: user.email, claims });
    });
    return unsubscribe;
  }, [setAuthenticated, setUnauthenticated]);
}
