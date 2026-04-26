import auth from '@react-native-firebase/auth';
import functions from '@react-native-firebase/functions';

import type { AuthClaims } from './store';

export type AuthError =
  | 'invalid-email'
  | 'weak-password'
  | 'wrong-credentials'
  | 'email-in-use'
  | 'network'
  | 'generic';

function mapFirebaseError(code: string | undefined): AuthError {
  switch (code) {
    case 'auth/invalid-email':
      return 'invalid-email';
    case 'auth/weak-password':
      return 'weak-password';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'wrong-credentials';
    case 'auth/email-already-in-use':
      return 'email-in-use';
    case 'auth/network-request-failed':
      return 'network';
    default:
      return 'generic';
  }
}

export class AuthApiError extends Error {
  constructor(public readonly code: AuthError) {
    super(code);
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  try {
    await auth().createUserWithEmailAndPassword(email, password);
  } catch (e) {
    throw new AuthApiError(mapFirebaseError((e as { code?: string }).code));
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    await auth().signInWithEmailAndPassword(email, password);
  } catch (e) {
    throw new AuthApiError(mapFirebaseError((e as { code?: string }).code));
  }
}

export async function signOut(): Promise<void> {
  await auth().signOut();
}

export async function readClaims(force = false): Promise<AuthClaims> {
  const user = auth().currentUser;
  if (!user) return { country: null, ageVerifiedAt: null };
  const tokenResult = await user.getIdTokenResult(force);
  return {
    country: typeof tokenResult.claims.country === 'string' ? tokenResult.claims.country : null,
    ageVerifiedAt:
      typeof tokenResult.claims.ageVerifiedAt === 'number'
        ? tokenResult.claims.ageVerifiedAt
        : null,
  };
}

/**
 * Phase 1a: dev-only mock that calls a callable Cloud Function which sets
 * `country: 'NL'` + `ageVerifiedAt` claims on the calling user. Replaced in
 * Phase 1b by a real iDIN webhook that posts to Cloud Functions after the
 * user completes the BankID-style flow.
 */
export async function mockVerifyAge(): Promise<AuthClaims> {
  const fn = functions().httpsCallable('mockVerifyAge');
  await fn({});
  return readClaims(true);
}
