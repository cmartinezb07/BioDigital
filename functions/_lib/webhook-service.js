import { verifyHmacSha256Hex } from './crypto.js';
import { apiError, json, readSmallJson } from './http.js';
import { D1OrderRepository } from './order-repository.js';
import { PaymentVerificationError, reconcileOrder } from './payment-verification.js';

const SIGNATURE_PART = /^(ts|v1)=([^,]+)$/;

function parseSignature(value) {
  if (!value) return null;
  const parts = {};
  for (const raw of value.split(',')) {
    const match = SIGNATURE_PART.exec(raw.trim());
    if (!match || parts[match[1]]) return null;
    parts[match[1]] = match[2].trim();
  }
  return /^\d{13}$/.test(parts.ts || '') && /^[0-9a-f]{64}$/i.test(parts.v1 || '') ? parts : null;
}

function same(value, expected) {
  return expected !== undefined && expected !== null && String(value) === String(expected);
}

export async function handleMercadoPagoWebhook({
  request, env, repo = new D1OrderRepository(env.DB), fetchImpl = fetch, now = () => new Date()
}) {
  const requestId = request.headers.get('x-request-id');
  const signature = parseSignature(request.headers.get('x-signature'));
  const url = new URL(request.url);
  const resourceId = url.searchParams.get('data.id') || url.searchParams.get('data_id');
  if (!requestId || !/^[A-Za-z0-9_-]{1,128}$/.test(requestId) || !signature || !resourceId) {
    return apiError('invalid_webhook_headers', 400, 'Notificación malformada.');
  }
  const timestamp = Number(signature.ts);
  const tolerance = Number(env.MP_WEBHOOK_TOLERANCE_SECONDS || 300) * 1000;
  if (!Number.isSafeInteger(timestamp) || !Number.isFinite(tolerance) || tolerance < 1000 || Math.abs(now().valueOf() - timestamp) > tolerance) {
    return apiError('stale_webhook', 401, 'Timestamp de notificación inválido.');
  }
  const manifest = `id:${resourceId.toLowerCase()};request-id:${requestId};ts:${signature.ts};`;
  let valid;
  try {
    valid = await verifyHmacSha256Hex(env.MP_WEBHOOK_SECRET, manifest, signature.v1);
  } catch {
    return apiError('webhook_not_configured', 503, 'Webhook no configurado.');
  }
  if (!valid) return apiError('invalid_webhook_signature', 401, 'Firma inválida.');

  const parsed = await readSmallJson(request);
  if (parsed.error) return parsed.error;
  const body = parsed.value;
  if (
    body.type !== 'order' || body.api_version !== 'v1' ||
    typeof body.id !== 'string' || !/^order\.[a-z_]+$/.test(body.action || '') ||
    body.data?.id !== resourceId ||
    !same(body.application_id, env.MP_APPLICATION_ID) ||
    !same(body.user_id, env.MP_USER_ID) ||
    body.live_mode !== (env.MP_LIVE_MODE === 'true') ||
    Number.isNaN(Date.parse(body.date_created))
  ) return apiError('invalid_webhook_payload', 400, 'Payload de notificación inválido.');

  const eventKey = `${body.id}:${resourceId}`;
  const existing = await repo.findWebhookEvent(eventKey);
  if (existing?.outcome === 'verified') return json({ received: true, duplicate: true });
  if (existing?.outcome === 'rejected') {
    return apiError('verification_rejected', 422, 'La orden no superó la verificación.');
  }
  const order = await repo.findByMercadoPagoId(resourceId);
  if (!order) return apiError('order_not_found', 404, 'Orden no encontrada.');

  const event = { eventKey, eventId: body.id, requestId, action: body.action, source: 'webhook' };

  try {
    const result = await reconcileOrder({
      order, env, repo, fetchImpl, now, event
    });
    return json({ received: true, duplicate: !result.applied });
  } catch (error) {
    if (error instanceof PaymentVerificationError) {
      if (!error.retryable) {
        await repo.recordRejectedEvent(order, event, error.code, now().toISOString());
      }
      return apiError(error.code, error.retryable ? 503 : 422, 'No fue posible verificar la orden.');
    }
    throw error;
  }
}
