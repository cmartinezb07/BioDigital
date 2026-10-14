import { CATALOG, resolveCartPayment } from './catalog.js';
import { deriveOrderAccessToken, sha256Base64Url } from './crypto.js';
import { apiError, json, readSmallJson } from './http.js';
import { checkoutOnlineConfig, createMercadoPagoOrder, MercadoPagoError } from './mercadopago.js';
import { D1OrderRepository, isUniqueConstraintError } from './order-repository.js';
import { PaymentVerificationError, reconcileOrder } from './payment-verification.js';

const IDEMPOTENCY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORDER_ID_PATTERN = IDEMPOTENCY_PATTERN;
const ALLOWED_FIELDS = new Set(['items', 'sku', 'purpose']);

function publicOrder(order, accessToken, reused = false) {
  return {
    id: order.id,
    access_token: accessToken,
    status: order.status,
    sku: order.sku,
    purpose: order.purpose,
    amount: order.amount,
    currency: order.currency,
    items: order.items || [],
    checkout_url: order.checkout_url || null,
    reused
  };
}

function fingerprint(payment) {
  const items = payment.items.map((item) => `${item.sku}:${item.amount}`).join('|');
  return `${items}:${payment.purpose}:${payment.amount}:${payment.currency}`;
}

async function getExisting(repo, idempotencyKey, expectedFingerprint, secret) {
  const order = await repo.findByIdempotencyKey(idempotencyKey);
  if (!order) return null;
  if (order.request_fingerprint !== expectedFingerprint) {
    return { response: apiError('idempotency_conflict', 409, 'La clave de idempotencia ya fue usada para otra solicitud.') };
  }
  const accessToken = await deriveOrderAccessToken(secret, order.id);
  return { order, accessToken };
}

async function processOrder({ order, accessToken, repo, env, fetchImpl, now }) {
  if (order.checkout_url && order.status === 'created') {
    return json(publicOrder(order, accessToken, true));
  }

  const updatedAt = now().toISOString();
  await repo.markCreating(order.id, updatedAt);

  try {
    const mpOrder = await createMercadoPagoOrder({
      payment: order,
      externalReference: order.external_reference,
      idempotencyKey: order.idempotency_key,
      env,
      onlineConfig: checkoutOnlineConfig(env),
      fetchImpl
    });
    await repo.markCreated(order.id, mpOrder, now().toISOString());
    return json(publicOrder({
      ...order,
      status: 'created',
      mp_order_id: mpOrder.id,
      mp_status: mpOrder.status,
      checkout_url: mpOrder.checkoutUrl
    }, accessToken), 201);
  } catch (error) {
    const code = error instanceof MercadoPagoError ? error.code : 'internal_error';
    await repo.markCreationFailed(order.id, code, now().toISOString());
    return apiError('order_creation_failed', 502, 'No fue posible crear la orden de pago. Reintenta con la misma clave de idempotencia.');
  }
}

export async function handleCreateOrder({
  request,
  env,
  repo = new D1OrderRepository(env.DB),
  catalog = CATALOG,
  fetchImpl = fetch,
  now = () => new Date()
}) {
  const parsed = await readSmallJson(request);
  if (parsed.error) return parsed.error;

  const unknown = Object.keys(parsed.value).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknown.length) {
    return apiError('unsupported_field', 400, 'La solicitud contiene campos no permitidos. Los precios se determinan en el servidor.');
  }

  const requestedItems = Array.isArray(parsed.value.items)
    ? parsed.value.items
    : parsed.value.sku ? [parsed.value.sku] : null;
  const resolved = resolveCartPayment(catalog, requestedItems, parsed.value.purpose || 'full');
  if (resolved.error === 'invalid_items') return apiError('invalid_items', 400, 'El carrito debe contener entre 1 y 20 productos.');
  if (resolved.error === 'duplicate_item') return apiError('duplicate_item', 400, 'El carrito contiene productos duplicados.');
  if (resolved.error === 'invalid_sku') return apiError('invalid_sku', 400, 'SKU inválido.');
  if (resolved.error === 'invalid_purpose') return apiError('invalid_purpose', 400, 'Propósito de pago inválido.');
  if (resolved.error === 'quote_required') return apiError('quote_required', 409, 'Este carrito necesita una cotización antes de pagar.');
  if (resolved.error === 'product_disabled') return apiError('product_disabled', 403, 'Este producto todavía no está habilitado para cobro.');
  if (resolved.error) return apiError('catalog_error', 503, 'El catálogo de pagos no está disponible.');

  if (env.PAYMENTS_ENABLED !== 'true') {
    return apiError('payments_disabled', 503, 'Los pagos todavía no están habilitados.');
  }

  const idempotencyKey = request.headers.get('idempotency-key');
  if (!idempotencyKey || !IDEMPOTENCY_PATTERN.test(idempotencyKey)) {
    return apiError('invalid_idempotency_key', 400, 'Se requiere un encabezado Idempotency-Key con un UUID válido.');
  }

  const payment = resolved.value;
  const requestFingerprint = fingerprint(payment);
  const existing = await getExisting(repo, idempotencyKey, requestFingerprint, env.ORDER_TOKEN_SECRET);
  if (existing?.response) return existing.response;
  if (existing?.order) {
    return processOrder({ ...existing, repo, env, fetchImpl, now });
  }

  const id = crypto.randomUUID();
  const accessToken = await deriveOrderAccessToken(env.ORDER_TOKEN_SECRET, id);
  const timestamp = now().toISOString();
  const order = {
    id,
    access_token_hash: await sha256Base64Url(accessToken),
    idempotency_key: idempotencyKey,
    request_fingerprint: requestFingerprint,
    sku: payment.sku,
    title: payment.title,
    amount: payment.amount,
    currency: payment.currency,
    purpose: payment.purpose,
    items: payment.items,
    project_reference: null,
    parent_order_id: null,
    status: 'pending_creation',
    external_reference: id,
    checkout_url: null,
    creation_attempts: 0,
    created_at: timestamp,
    updated_at: timestamp
  };

  try {
    await repo.insert(order);
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      return apiError('persistence_error', 503, 'No fue posible registrar la orden.');
    }
    const raced = await getExisting(repo, idempotencyKey, requestFingerprint, env.ORDER_TOKEN_SECRET);
    if (raced?.response) return raced.response;
    if (!raced?.order) return apiError('persistence_error', 503, 'No fue posible registrar la orden.');
    return processOrder({ ...raced, repo, env, fetchImpl, now });
  }

  return processOrder({ order, accessToken, repo, env, fetchImpl, now });
}

export async function handleGetOrder({
  request, env, id, repo = new D1OrderRepository(env.DB), fetchImpl = fetch,
  now = () => new Date()
}) {
  if (!ORDER_ID_PATTERN.test(id || '')) return apiError('not_found', 404, 'Orden no encontrada.');

  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization);
  if (!match) return apiError('unauthorized', 401, 'Se requiere el token de acceso de la orden.');

  const accessTokenHash = await sha256Base64Url(match[1]);
  let order = await repo.findByPublicAccess(id, accessTokenHash);
  if (!order) return apiError('not_found', 404, 'Orden no encontrada.');

  let reconciliation = 'not_requested';
  const requested = new URL(request.url).searchParams.get('reconcile') === '1';
  const terminal = order.status === 'refunded';
  if (requested && order.mp_order_id && !terminal) {
    const bucket = Math.floor(now().valueOf() / 60000);
    const eventKey = `reconcile:${order.mp_order_id}:${bucket}`;
    const duplicate = await repo.findWebhookEvent(eventKey);
    if (duplicate) {
      reconciliation = 'rate_limited';
    } else {
      try {
        await reconcileOrder({
          order, env, repo, fetchImpl, now,
          event: {
            eventKey, eventId: eventKey, requestId: eventKey,
            action: 'order.reconciled', source: 'reconciliation'
          }
        });
        order = await repo.findByPublicAccess(id, accessTokenHash);
        reconciliation = 'completed';
      } catch (error) {
        if (!(error instanceof PaymentVerificationError)) throw error;
        reconciliation = 'deferred';
      }
    }
  }

  return json({
    id: order.id,
    status: order.status,
    sku: order.sku,
    purpose: order.purpose,
    amount: order.amount,
    currency: order.currency,
    items: order.items || [],
    status_detail: order.mp_status_detail || null,
    verified_paid_amount: order.verified_paid_amount ?? null,
    payment_verified: order.status === 'accredited',
    checkout_url: order.checkout_url || null,
    reconciliation,
    created_at: order.created_at,
    updated_at: order.updated_at
  });
}
