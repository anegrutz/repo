import { createHmac } from 'crypto';

import { verifyOnfidoSignature } from '../verifySignature';

const TOKEN = 'test-webhook-token';

function sign(body: string): string {
  return createHmac('sha256', TOKEN).update(body).digest('hex');
}

describe('verifyOnfidoSignature', () => {
  it('accepts a correctly-signed payload', () => {
    const body = '{"payload":{"action":"workflow_run.completed"}}';
    expect(verifyOnfidoSignature(body, sign(body), TOKEN)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const body = '{"payload":{"action":"workflow_run.completed"}}';
    const sig = sign(body);
    const tampered = body.replace('completed', 'cancelled');
    expect(verifyOnfidoSignature(tampered, sig, TOKEN)).toBe(false);
  });

  it('rejects a missing signature header', () => {
    expect(verifyOnfidoSignature('{}', undefined, TOKEN)).toBe(false);
    expect(verifyOnfidoSignature('{}', null, TOKEN)).toBe(false);
    expect(verifyOnfidoSignature('{}', '', TOKEN)).toBe(false);
  });

  it('rejects when webhook token is empty', () => {
    expect(verifyOnfidoSignature('{}', 'whatever', '')).toBe(false);
  });

  it('rejects a signature of wrong length', () => {
    expect(verifyOnfidoSignature('{}', 'too-short', TOKEN)).toBe(false);
  });
});
