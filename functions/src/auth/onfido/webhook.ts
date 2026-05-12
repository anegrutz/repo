import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import { verifyOnfidoSignature } from './verifySignature';

if (getApps().length === 0) initializeApp();

const onfidoWebhookToken = defineSecret('ONFIDO_WEBHOOK_TOKEN');

type WorkflowCompletedPayload = {
  payload?: {
    resource_type?: string;
    action?: string;
    object?: {
      id?: string;
      tags?: string[];
      output?: { document_country?: string; date_of_birth?: string };
      status?: string;
    };
  };
};

const UID_TAG = /^uid:(.+)$/;

export const onfidoWebhook = onRequest(
  {
    region: 'europe-west1',
    secrets: [onfidoWebhookToken],
    cors: false,
    invoker: 'public', // Onfido needs to reach this directly
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      logger.warn('Onfido webhook: no rawBody available');
      res.status(400).send('Bad Request');
      return;
    }

    const signature = req.header('x-sha2-signature');
    const ok = verifyOnfidoSignature(rawBody, signature, onfidoWebhookToken.value());
    if (!ok) {
      logger.warn('Onfido webhook: signature mismatch');
      res.status(401).send('Unauthorized');
      return;
    }

    const body = req.body as WorkflowCompletedPayload;
    const obj = body?.payload?.object;
    const action = body?.payload?.action;
    const resource = body?.payload?.resource_type;

    if (resource !== 'workflow_run' || action !== 'workflow_run.completed') {
      // Acknowledge other events without applying claims
      res.status(200).send('ignored');
      return;
    }

    const tag = (obj?.tags ?? []).find((t) => UID_TAG.test(t));
    const uid = tag?.match(UID_TAG)?.[1];
    if (!uid) {
      logger.warn('Onfido webhook: no uid tag on workflow run', { workflowRunId: obj?.id });
      res.status(200).send('ignored');
      return;
    }

    const status = obj?.status ?? '';
    if (status !== 'approved') {
      logger.info('Onfido workflow not approved; not setting claims', { uid, status });
      res.status(200).send('ok');
      return;
    }

    const documentCountry = obj?.output?.document_country ?? null;
    if (documentCountry !== 'NLD') {
      logger.info('Onfido document country not NL; not setting claims', { uid, documentCountry });
      res.status(200).send('ok');
      return;
    }

    await getAuth().setCustomUserClaims(uid, {
      country: 'NL',
      ageVerifiedAt: Date.now(),
    });

    logger.info('Onfido claims set from workflow approval', { uid });
    res.status(200).send('ok');
  },
);
