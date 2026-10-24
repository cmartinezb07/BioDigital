import { verifyHmacSha256Hex } from './crypto.js';
import { apiError, json, readSmallJson } from './http.js';
import { D1OrderRepository } from './order-repository.js';
import { getMercadoPagoPayment, MercadoPagoError } from './mercadopago.js';
import { PaymentVerificationError, reconcileOrder } from './payment-verification.js';

function parseSignature(value) {
  if (!value) return null;
  const parts = {};
  for (const raw of value.split(',')) {
    const match = /^(ts|v1)=([^,]+)$/.exec(raw.trim());
    if (!match || parts[match[1]]) return null;
    parts[match[1]] = match[2].trim();
  }
  return /^\d{10}(?:\d{3})?$/.test(parts.ts || '') && /^[0-9a-f]{64}$/i.test(parts.v1 || '') ? parts : null;
}

export async function handleMercadoPagoWebhook({
  request, env, repo = new D1OrderRepository(env.DB), fetchImpl = fetch, now = () => new Date()
}) {
  const requestId = request.headers.get('x-request-id');
  const signature = parseSignature(request.headers.get('x-signature'));
  const url = new URL(request.url);
  const resourceId = url.searchParams.get('data.id') || url.searchParams.get('data_id');
  if (!requestId || !/^[A-Za-z0-9_-]{1,128}$/.test(requestId) || !signature || !/^[1-9]\d{0,24}$/.test(resourceId || '')) {
    return apiError('invalid_webhook_headers', 400, 'Notificación malformada.');
  }
  const timestamp = Number(signature.ts) * (signature.ts.length === 10 ? 1000 : 1);
  const tolerance = Number(env.MP_WEBHOOK_TOLERANCE_SECONDS || 300) * 1000;
  if (!Number.isSafeInteger(timestamp) || !Number.isFinite(tolerance) || tolerance < 1000 || Math.abs(now().valueOf() - timestamp) > tolerance) {
    return apiError('stale_webhook', 401, 'Timestamp de notificación inválido.');
  }
  const manifest = 'id:' + resourceId + ';request-id:' + requestId + ';ts:' + signature.ts + ';';
  let valid;
  try { valid = await verifyHmacSha256Hex(env.MP_WEBHOOK_SECRET, manifest, signature.v1); }
  catch { return apiError('webhook_not_configured', 503, 'Webhook no configurado.'); }
  if (!valid) return apiError('invalid_webhook_signature', 401, 'Firma inválida.');

  const parsed = await readSmallJson(request);
  if (parsed.error) return parsed.error;
  const body = parsed.value;
  // El contrato de payment no incluye application_id; la aplicación se
  // comprueba en la orden comercial obtenida con el token del servidor.
  if (body.type !== 'payment' || body.api_version !== 'v1' ||
      !['string', 'number'].includes(typeof body.id) ||
      !/^payment\.(created|updated)$/.test(body.action || '') ||
      String(body.data?.id) !== resourceId ||
      !env.MP_USER_ID || String(body.user_id) !== String(env.MP_USER_ID) ||
      body.live_mode !== (env.MP_LIVE_MODE === 'true') ||
      !body.date_created || Number.isNaN(Date.parse(body.date_created))) {
    return apiError('invalid_webhook_payload', 400, 'Payload de notificación inválido.');
  }
  const eventKey = 'payment:' + body.id + ':' + resourceId;
  const existing = await repo.findWebhookEvent(eventKey);
  if (existing?.outcome === 'verified') return json({ received: true, duplicate: true });
  // Los rechazos se vuelven a verificar: los recursos pueden estar aún
  // propagándose cuando llega la primera notificación.
  let order;
  const event = { eventKey, eventId: String(body.id), requestId, action: body.action, source: 'webhook', resourceId };
  try {
    const payment = await getMercadoPagoPayment({ paymentId: resourceId, env, fetchImpl });
    if (String(payment.id) !== resourceId) throw new PaymentVerificationError('payment_identity_mismatch');
    order = await repo.findByExternalReference(payment.external_reference);
    if (!order || !order.mp_preference_id) return apiError('order_not_found', 404, 'Orden no encontrada.');
    const result = await reconcileOrder({ order, env, repo, fetchImpl, now, event, payment });
    return json({ received: true, duplicate: !result.applied });
  } catch (error) {
    if (error instanceof MercadoPagoError) return apiError(error.code, 503, 'No fue posible consultar el pago.');
    if (error instanceof PaymentVerificationError) {
      if (order && !error.retryable && !existing) await repo.recordRejectedEvent(order, event, error.code, now().toISOString());
      return apiError(error.code, error.retryable ? 503 : 422, 'No fue posible verificar la orden.');
    }
    throw error;
  }
}
