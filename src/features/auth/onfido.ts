import functions from '@react-native-firebase/functions';
import * as WebBrowser from 'expo-web-browser';

import { readClaims } from './api';

type StartCheckInput = { firstName: string; lastName: string; dob: string };

/**
 * Drives the user through Onfido's hosted verification flow:
 *  1. Cloud Function `startOnfidoCheck` creates an applicant + workflow run
 *     and returns the hosted URL.
 *  2. We open the URL in an in-app browser session.
 *  3. The user completes document scan + selfie.
 *  4. Onfido webhook fires `workflow_run.completed`; the server-side
 *     `onfidoWebhook` function sets `country` + `ageVerifiedAt` claims.
 *  5. We force a token refresh and return the freshly-read claims.
 *
 * The browser dismissal is just a signal that the user is done with the
 * SDK — final verification result is delivered async via the webhook.
 */
export async function runOnfidoFlow(input: StartCheckInput) {
  const start = functions().httpsCallable('startOnfidoCheck');
  const result = await start(input);
  const data = result.data as { hostedUrl?: string } | null;
  if (!data?.hostedUrl) throw new Error('Onfido did not return a hosted URL');

  await WebBrowser.openBrowserAsync(data.hostedUrl);

  // Wait briefly for the webhook to land, then refresh claims.
  await new Promise((r) => setTimeout(r, 1500));
  return readClaims(true);
}
