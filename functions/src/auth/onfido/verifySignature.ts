import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Onfido webhooks are signed with HMAC-SHA256 over the raw request body, with
 * the webhook token as the key. Always compare with `timingSafeEqual` to
 * avoid timing attacks.
 *
 * https://documentation.onfido.com/api/latest/#verifying-webhooks
 */
export function verifyOnfidoSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  webhookToken: string,
): boolean {
  if (!signatureHeader || !webhookToken) return false;
  const buf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const expected = createHmac('sha256', webhookToken).update(buf).digest('hex');
  if (expected.length !== signatureHeader.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
