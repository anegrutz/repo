import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

if (getApps().length === 0) initializeApp();

/**
 * Phase 1a dev-only KYC stand-in. Sets the same custom claims that the real
 * iDIN webhook will write in Phase 1b. Hard-fails outside the emulator.
 */
export const mockVerifyAge = onCall(async (req) => {
  if (process.env.FUNCTIONS_EMULATOR !== 'true') {
    throw new HttpsError('failed-precondition', 'mockVerifyAge is dev-only');
  }
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  await getAuth().setCustomUserClaims(req.auth.uid, {
    country: 'NL',
    ageVerifiedAt: Date.now(),
  });

  return { ok: true };
});
