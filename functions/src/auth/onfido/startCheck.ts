import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';

const onfidoApiToken = defineSecret('ONFIDO_API_TOKEN');
const onfidoWorkflowId = defineSecret('ONFIDO_WORKFLOW_ID');

const ONFIDO_BASE = 'https://api.eu.onfido.com/v3.6';

type StartCheckInput = { firstName: string; lastName: string; dob: string };

type Applicant = { id: string };
type WorkflowRun = { id: string; sdk_token?: string; output?: unknown; status: string };

async function onfido<T>(
  path: string,
  apiToken: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${ONFIDO_BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      authorization: `Token token=${apiToken}`,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    logger.error('Onfido API error', { path, status: res.status, body: text });
    throw new HttpsError('internal', `Onfido API ${res.status}`);
  }
  return (await res.json()) as T;
}

export const startOnfidoCheck = onCall<StartCheckInput, Promise<{ workflowRunId: string; hostedUrl: string }>>(
  {
    region: 'europe-west1',
    secrets: [onfidoApiToken, onfidoWorkflowId],
  },
  async (req) => {
    if (!req.auth) throw new HttpsError('unauthenticated', 'Login required');
    const apiToken = onfidoApiToken.value();
    const workflowId = onfidoWorkflowId.value();
    if (!apiToken || !workflowId) {
      throw new HttpsError('failed-precondition', 'Onfido not configured on the server');
    }
    const { firstName, lastName, dob } = req.data ?? {};
    if (!firstName || !lastName || !dob) {
      throw new HttpsError('invalid-argument', 'firstName, lastName and dob required');
    }

    const applicant = await onfido<Applicant>('/applicants', apiToken, {
      first_name: firstName,
      last_name: lastName,
      dob, // ISO yyyy-mm-dd
    });

    const run = await onfido<WorkflowRun>('/workflow_runs', apiToken, {
      applicant_id: applicant.id,
      workflow_id: workflowId,
      tags: [`uid:${req.auth.uid}`],
    });

    const hostedUrl = `https://eu.onfido.app/${run.id}`;

    logger.info('Onfido workflow_run created', {
      uid: req.auth.uid,
      applicantId: applicant.id,
      workflowRunId: run.id,
    });

    return { workflowRunId: run.id, hostedUrl };
  },
);
