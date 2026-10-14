import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

import { sha256Base64Url } from '../functions/_lib/crypto.js';
import { handleGetOrder } from '../functions/_lib/order-service.js';
import { handleMercadoPagoWebhook } from '../functions/_lib/webhook-service.js';

const NOW = new Date('2026-10-11T12:00:00.000Z');
const WEBHOOK_SECRET = 'test-only-webhook-secret';
const ORDER_TOKEN = 'a'.repeat(43);
const LOCAL_ID = '123e4567-e89b-42d3-a456-426614174001';
const MP_ID = 'ORD01TEST123';

const ENV = Object.freeze({
  MP_ACCESS_TOKEN: 'TEST_ACCESS_TOKEN_NOT_REAL',
  MP_WEBHOOK_SECRET: WEBHOOK_SECRET,
  MP_APPLICATION_ID: 'app-123',
  MP_USER_ID: 'seller-456',
  MP_LIVE_MODE: 'false',
  MP_COUNTRY_CODE: 'CHL'
});

class VerificationRepository {
  constructor(order = {}) {
    this.order = {
      id: LOCAL_ID,
      access_token_hash: null,
      sku: 'full-pack', purpose: 'full', amount: 79990, currency: 'CLP',
      status: 'created', external_reference: LOCAL_ID, mp_order_id: MP_ID,
      mp_status: 'created', mp_status_detail: null, verified_paid_amount: null,
      mp_last_updated_at: null, last_verified_at: null, verification_version: 0,
      checkout_url: 'https://www.mercadopago.cl/checkout/test',
      created_at: NOW.toISOString(), updated_at: NOW.toISOString(),
      ...order
    };
    this.events = new Map();
  }
  async findWebhookEvent(key) { return this.events.get(key) || null; }
  async findByMercadoPagoId(id) { return id === this.order.mp_order_id ? { ...this.order } : null; }
  async findByPublicAccess(id, hash) {
    return id === this.order.id && hash === this.order.access_token_hash ? { ...this.order } : null;
  }
  async applyVerification(order, event, verification, now) {
    if (this.events.has(event.eventKey)) return false;
    const currentDate = this.order.mp_last_updated_at;
    const allowed = verification.allowedFrom.includes(this.order.status);
    const currentEnough = !currentDate || verification.lastUpdatedAt >= currentDate;
    let applied = false;
    if (order.id === this.order.id && allowed && currentEnough) {
      Object.assign(this.order, {
        status: verification.state,
        mp_status: verification.mpStatus,
        mp_status_detail: verification.statusDetail,
        verified_paid_amount: verification.netPaidAmount,
        mp_last_updated_at: verification.lastUpdatedAt,
        last_verified_at: now,
        updated_at: now,
        verification_version: this.order.verification_version + 1
      });
      applied = true;
    }
    this.events.set(event.eventKey, { event_key: event.eventKey, outcome: 'verified' });
    return applied;
  }
  async recordRejectedEvent(order, event, errorCode, now) {
    if (!this.events.has(event.eventKey)) {
      this.events.set(event.eventKey, {
        event_key: event.eventKey, outcome: 'rejected', error_code: errorCode,
        resource_id: order.mp_order_id, received_at: now
      });
    }
  }
}

function remoteOrder(overrides = {}) {
  return {
    id: MP_ID,
    type: 'online',
    processing_mode: 'manual',
    status: 'processed',
    status_detail: 'accredited',
    external_reference: LOCAL_ID,
    total_amount: '79990',
    total_paid_amount: '79990',
    currency: 'CLP',
    country_code: 'CHL',
    user_id: 'seller-456',
    integration_data: { application_id: 'app-123' },
    last_updated_date: '2026-10-11T11:59:00.000Z',
    transactions: {
      payments: [{ id: 'PAY01', status: 'processed', status_detail: 'accredited', paid_amount: '79990' }],
      refunds: []
    },
    ...overrides
  };
}

function mpResponse(value = remoteOrder(), status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}

function webhookRequest({
  resourceId = MP_ID, bodyResourceId = resourceId, eventId = 'evt-1',
  requestId = 'request-1', timestamp = NOW.valueOf(), signature, body = {}
} = {}) {
  const manifest = `id:${resourceId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const digest = signature ?? createHmac('sha256', WEBHOOK_SECRET).update(manifest).digest('hex');
  return new Request(`https://example.test/api/webhooks/mercadopago?data.id=${encodeURIComponent(resourceId)}&type=order`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': requestId,
      'x-signature': `ts=${timestamp},v1=${digest}`
    },
    body: JSON.stringify({
      action: 'order.processed', api_version: 'v1', application_id: 'app-123',
      date_created: NOW.toISOString(), id: eventId, live_mode: false,
      type: 'order', user_id: 'seller-456', data: { id: bodyResourceId }, ...body
    })
  });
}

function deps(repo, fetchImpl = async () => mpResponse()) {
  return { env: ENV, repo, fetchImpl, now: () => NOW };
}

test('firma HMAC válida consulta Orders API y acredita solo la respuesta oficial completa', async () => {
  const repo = new VerificationRepository();
  let upstream;
  const response = await handleMercadoPagoWebhook({
    request: webhookRequest(),
    ...deps(repo, async (url, init) => { upstream = { url, init }; return mpResponse(); })
  });
  assert.equal(response.status, 200);
  assert.equal(repo.order.status, 'accredited');
  assert.equal(repo.order.verified_paid_amount, 79990);
  assert.equal(upstream.url, `https://api.mercadopago.com/v1/orders/${MP_ID}`);
  assert.equal(upstream.init.headers.authorization, `Bearer ${ENV.MP_ACCESS_TOKEN}`);
});

test('rechaza firma inválida, ausente, timestamp vencido y payload manipulado sin consultar API', async () => {
  let calls = 0;
  const run = (request) => handleMercadoPagoWebhook({
    request, ...deps(new VerificationRepository(), async () => { calls++; return mpResponse(); })
  });
  const invalid = await run(webhookRequest({ signature: '0'.repeat(64) }));
  const absentRequest = webhookRequest();
  absentRequest.headers.delete('x-signature');
  const absent = await run(absentRequest);
  const stale = await run(webhookRequest({ timestamp: NOW.valueOf() - 301000 }));
  const manipulated = await run(webhookRequest({ bodyResourceId: 'ORD01OTHER' }));
  assert.deepEqual([invalid.status, absent.status, stale.status, manipulated.status], [401, 400, 401, 400]);
  assert.equal(calls, 0);
});

test('webhook duplicado y reintentos son idempotentes', async () => {
  const repo = new VerificationRepository();
  let calls = 0;
  const options = deps(repo, async () => { calls++; return mpResponse(); });
  const first = await handleMercadoPagoWebhook({ request: webhookRequest(), ...options });
  const duplicate = await handleMercadoPagoWebhook({ request: webhookRequest(), ...options });
  assert.equal(first.status, 200);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);
  assert.equal(calls, 1);
  assert.equal(repo.events.size, 1);
});

test('eventos desordenados y simultáneos no hacen regresar un estado terminal', async () => {
  const repo = new VerificationRepository();
  const refunded = remoteOrder({
    status: 'refunded', status_detail: 'refunded', last_updated_date: '2026-10-11T12:00:00.000Z',
    transactions: {
      payments: [{ status: 'processed', status_detail: 'accredited', paid_amount: '79990' }],
      refunds: [{ status: 'processed', amount: '79990' }]
    }
  });
  await handleMercadoPagoWebhook({ request: webhookRequest({ eventId: 'evt-new' }), ...deps(repo, async () => mpResponse(refunded)) });
  await Promise.all([
    handleMercadoPagoWebhook({ request: webhookRequest({ eventId: 'evt-old-1', requestId: 'req-old-1' }), ...deps(repo, async () => mpResponse()) }),
    handleMercadoPagoWebhook({ request: webhookRequest({ eventId: 'evt-old-2', requestId: 'req-old-2' }), ...deps(repo, async () => mpResponse()) })
  ]);
  assert.equal(repo.order.status, 'refunded');
  assert.equal(repo.order.verified_paid_amount, 0);
});

test('rechaza orden inexistente antes de consultar Mercado Pago', async () => {
  const repo = new VerificationRepository({ mp_order_id: 'ORD01LOCAL' });
  let calls = 0;
  const response = await handleMercadoPagoWebhook({
    request: webhookRequest(), ...deps(repo, async () => { calls++; return mpResponse(); })
  });
  assert.equal(response.status, 404);
  assert.equal(calls, 0);
});

test('no actualiza ante monto, moneda, cuenta o referencia incorrectos', async () => {
  const cases = [
    { id: 'ORD01OTHER' }, { total_amount: '1' }, { total_paid_amount: '1' },
    { currency: 'USD' }, { user_id: 'other-seller' }, { country_code: 'ARG' },
    { integration_data: { application_id: 'other-app' } },
    { external_reference: 'other-reference' }
  ];
  for (const [index, changes] of cases.entries()) {
    const repo = new VerificationRepository();
    const response = await handleMercadoPagoWebhook({
      request: webhookRequest({ eventId: `evt-mismatch-${index}`, requestId: `req-mismatch-${index}` }),
      ...deps(repo, async () => mpResponse(remoteOrder(changes)))
    });
    assert.equal(response.status, 422);
    assert.equal(repo.order.status, 'created');
    assert.equal(repo.events.size, 1);
  }
});

test('processed/refunded nunca acredita y queda como reembolsado', async () => {
  const repo = new VerificationRepository({ status: 'accredited' });
  const response = await handleMercadoPagoWebhook({
    request: webhookRequest(),
    ...deps(repo, async () => mpResponse(remoteOrder({
      status: 'processed', status_detail: 'refunded',
      transactions: {
        payments: [{ status: 'processed', status_detail: 'accredited', paid_amount: '79990' }],
        refunds: [{ status: 'processed', amount: '79990' }]
      }
    })))
  });
  assert.equal(response.status, 200);
  assert.equal(repo.order.status, 'refunded');
  assert.notEqual(repo.order.status, 'accredited');
});

test('mapea pagos pendiente, rechazado y parcialmente reembolsado', async () => {
  const scenarios = [
    [remoteOrder({ status: 'processing', status_detail: 'in_process', total_paid_amount: '0', transactions: { payments: [], refunds: [] } }), 'pending', 'created'],
    [remoteOrder({ status: 'failed', status_detail: 'cc_rejected_other_reason', total_paid_amount: '0', transactions: { payments: [], refunds: [] } }), 'rejected', 'created'],
    [remoteOrder({ status: 'processed', status_detail: 'partially_refunded', transactions: {
      payments: [{ status: 'processed', status_detail: 'accredited', paid_amount: '79990' }],
      refunds: [{ status: 'processed', amount: '10000' }]
    } }), 'partially_refunded', 'accredited']
  ];
  for (const [remote, expected, initial] of scenarios) {
    const repo = new VerificationRepository({ status: initial });
    const response = await handleMercadoPagoWebhook({
      request: webhookRequest({ eventId: `evt-${expected}`, requestId: `req-${expected}` }),
      ...deps(repo, async () => mpResponse(remote))
    });
    assert.equal(response.status, 200);
    assert.equal(repo.order.status, expected);
  }
});

test('API no disponible responde 503 y permite reintentar el mismo evento', async () => {
  const repo = new VerificationRepository();
  let calls = 0;
  const fetchImpl = async () => {
    calls++;
    return calls === 1 ? new Response('{}', { status: 503 }) : mpResponse();
  };
  const first = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo, fetchImpl) });
  const retry = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo, fetchImpl) });
  assert.equal(first.status, 503);
  assert.equal(retry.status, 200);
  assert.equal(repo.order.status, 'accredited');
  assert.equal(calls, 2);
});

test('GET autenticado concilia y expone solo el estado verificado', async () => {
  const hash = await sha256Base64Url(ORDER_TOKEN);
  const repo = new VerificationRepository({ access_token_hash: hash });
  const request = new Request(`https://example.test/api/orders/${LOCAL_ID}?reconcile=1`, {
    headers: { authorization: `Bearer ${ORDER_TOKEN}` }
  });
  const response = await handleGetOrder({ request, id: LOCAL_ID, ...deps(repo) });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'accredited');
  assert.equal(body.status_detail, 'accredited');
  assert.equal(body.payment_verified, true);
  assert.equal(body.verified_paid_amount, 79990);
  assert.equal(body.reconciliation, 'completed');
  assert.equal('mp_order_id' in body, false);
});
