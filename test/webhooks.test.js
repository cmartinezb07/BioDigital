import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { sha256Base64Url } from '../functions/_lib/crypto.js';
import { handleGetOrder } from '../functions/_lib/order-service.js';
import { handleMercadoPagoWebhook } from '../functions/_lib/webhook-service.js';
import { ENV, NOW, LOCAL_ID, MP_ID, PAYMENT_ID, merchant, payment, seededRepository, upstream } from './fixtures.mjs';

function webhookRequest({
  resourceId = PAYMENT_ID, bodyResourceId = resourceId, eventId = 123456,
  requestId = 'request-1', timestamp = NOW.valueOf(), signature, body = {}
} = {}) {
  const manifest = 'id:' + resourceId + ';request-id:' + requestId + ';ts:' + timestamp + ';';
  const digest = signature ?? createHmac('sha256', ENV.MP_WEBHOOK_SECRET).update(manifest).digest('hex');
  return new Request('https://example.test/api/webhooks/mercadopago?data.id=' + resourceId + '&type=payment', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-request-id': requestId, 'x-signature': 'ts=' + timestamp + ',v1=' + digest },
    body: JSON.stringify({
      action: 'payment.updated', api_version: 'v1', date_created: NOW.toISOString(),
      id: eventId, live_mode: false, type: 'payment', user_id: ENV.MP_USER_ID,
      data: { id: bodyResourceId }, ...body
    })
  });
}

function deps(repo, fetchImpl = upstream()) {
  return { env: ENV, repo, fetchImpl, now: () => NOW };
}

async function local(repo) { return repo.findByExternalReference(LOCAL_ID); }

test('webhook payment firmado verifica pago y preferencia antes de acreditar; SQL D1 real', async (t) => {
  const { repo, sqlite } = await seededRepository();
  t.after(() => sqlite.close());
  const calls = [];
  const remote = upstream();
  const response = await handleMercadoPagoWebhook({
    request: webhookRequest(), ...deps(repo, async (url, init) => {
      calls.push(url);
      assert.equal(init.headers.authorization, 'Bearer ' + ENV.MP_ACCESS_TOKEN);
      return remote(url);
    })
  });
  assert.equal(response.status, 200);
  const order = await local(repo);
  assert.equal(order.status, 'accredited');
  assert.equal(order.mp_order_id, MP_ID);
  assert.equal(order.verified_paid_amount, 79990);
  assert.ok(calls.includes('https://api.mercadopago.com/v1/payments/' + PAYMENT_ID));
  assert.ok(calls.includes('https://api.mercadopago.com/merchant_orders/' + MP_ID));
});

test('rechaza firma inválida, ausente, timestamp vencido y payload manipulado antes de consultar', async (t) => {
  const { repo, sqlite } = await seededRepository();
  t.after(() => sqlite.close());
  let calls = 0;
  const options = deps(repo, async () => { calls++; throw new Error('Unexpected API call'); });
  const absent = webhookRequest(); absent.headers.delete('x-signature');
  const requests = [
    [webhookRequest({ signature: '0'.repeat(64) }), 401], [absent, 400],
    [webhookRequest({ timestamp: NOW.valueOf() - 301000 }), 401],
    [webhookRequest({ bodyResourceId: '999999' }), 400],
    [webhookRequest({ body: { user_id: 'another-seller' } }), 400],
    [webhookRequest({ body: { live_mode: true } }), 400]
  ];
  for (const [request, status] of requests) {
    assert.equal((await handleMercadoPagoWebhook({ request, ...options })).status, status);
  }
  assert.equal(calls, 0);
});

test('acepta timestamp en segundos conservando el valor firmado original', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  const response = await handleMercadoPagoWebhook({
    request: webhookRequest({ timestamp: NOW.valueOf() / 1000 }), ...deps(repo)
  });
  assert.equal(response.status, 200);
});

test('webhook repetido no duplica eventos ni verificación', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  let calls = 0; const mock = upstream();
  const options = deps(repo, async (url) => { calls++; return mock(url); });
  await handleMercadoPagoWebhook({ request: webhookRequest(), ...options });
  const before = calls;
  const response = await handleMercadoPagoWebhook({ request: webhookRequest(), ...options });
  assert.equal((await response.json()).duplicate, true);
  assert.equal(calls, before);
  assert.equal((await local(repo)).verification_version, 1);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM payment_events').get().n, 1);
});

test('evento atrasado y notificaciones duplicadas no revierten un reembolso', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  const refunded = upstream({ payments: [payment({ status: 'refunded', status_detail: 'refunded', transaction_amount_refunded: 79990 })] });
  await handleMercadoPagoWebhook({ request: webhookRequest({ eventId: 'refund' }), ...deps(repo, refunded) });
  const old = upstream({
    remote: merchant({ last_updated: '2026-10-24T14:59:00.000Z' }),
    payments: [payment({ date_last_updated: '2026-10-24T14:59:00.000Z' })]
  });
  // Las llamadas comparten una conexión SQLite; cada batch se ejecuta íntegro.
  await handleMercadoPagoWebhook({ request: webhookRequest({ eventId: 'older' }), ...deps(repo, old) });
  await handleMercadoPagoWebhook({ request: webhookRequest({ eventId: 'older' }), ...deps(repo, old) });
  assert.equal((await local(repo)).status, 'refunded');
  assert.equal((await local(repo)).verified_paid_amount, 0);
});

test('pago sin orden local no se acredita', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  const response = await handleMercadoPagoWebhook({
    request: webhookRequest(), ...deps(repo, upstream({ payments: [payment({ external_reference: 'unknown' })] }))
  });
  assert.equal(response.status, 404);
  assert.equal((await local(repo)).status, 'created');
});

test('rechaza monto, moneda, cuenta, aplicación, preferencia, ambiente e identidad incorrectos', async (t) => {
  const cases = [
    { payments: [payment({ transaction_amount: 80000 })] },
    { payments: [payment({ currency_id: 'USD' })] },
    { payments: [payment({ collector_id: 'other' })] },
    { payments: [payment({ live_mode: true })] },
    { payments: [payment({ id: 444 })] },
    { remote: merchant({ client_id: 'other' }) },
    { remote: merchant({ collector: { id: 'other' } }) },
    { remote: merchant({ preference_id: 'other' }) },
    { remote: merchant({ site_id: 'MLA' }) },
    { remote: merchant({ external_reference: 'other' }) },
    { remote: merchant({ total_amount: 1 }) }
  ];
  for (const changes of cases) {
    const { repo, sqlite } = await seededRepository();
    try {
      const response = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo, upstream(changes)) });
      assert.ok([422, 503].includes(response.status), JSON.stringify(changes));
      assert.equal((await local(repo)).status, 'created');
    } finally { sqlite.close(); }
  }
});

test('mapea pendiente, rechazado, cancelado, reembolso parcial y contracargo', async () => {
  for (const [changes, expected, amount] of [
    [{ status: 'pending', status_detail: 'pending_waiting_payment' }, 'pending', 0],
    [{ status: 'rejected', status_detail: 'cc_rejected_other_reason' }, 'rejected', 0],
    [{ status: 'cancelled', status_detail: 'by_collector' }, 'cancelled', 0],
    [{ transaction_amount_refunded: 10000 }, 'partially_refunded', 69990],
    [{ status: 'charged_back', status_detail: 'settled' }, 'charged_back', 0]
  ]) {
    const { repo, sqlite } = await seededRepository();
    try {
      const response = await handleMercadoPagoWebhook({
        request: webhookRequest(), ...deps(repo, upstream({ payments: [payment(changes)] }))
      });
      assert.equal(response.status, 200);
      assert.equal((await local(repo)).status, expected);
      assert.equal((await local(repo)).verified_paid_amount, amount);
    } finally { sqlite.close(); }
  }
});

test('suma dos medios de pago y no entrega si solo está acreditada una parte', async () => {
  for (const pending of [true, false]) {
    const { repo, sqlite } = await seededRepository();
    try {
      const mock = upstream({
        remote: merchant({ payments: [{ id: Number(PAYMENT_ID) }, { id: 222222 }] }),
        payments: [
          payment({ transaction_amount: 30000 }),
          payment({ id: 222222, transaction_amount: 49990, status: pending ? 'pending' : 'approved' })
        ]
      });
      const response = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo, mock) });
      assert.equal(response.status, 200);
      assert.equal((await local(repo)).status, pending ? 'pending' : 'accredited');
      assert.equal((await local(repo)).verified_paid_amount, pending ? 30000 : 79990);
    } finally { sqlite.close(); }
  }
});

test('un intento rechazado no borra la acreditación de otro pago', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  const mock = upstream({
    remote: merchant({ payments: [{ id: Number(PAYMENT_ID) }, { id: 222222 }] }),
    payments: [payment(), payment({ id: 222222, status: 'rejected' })]
  });
  const response = await handleMercadoPagoWebhook({ request: webhookRequest({ resourceId: '222222' }), ...deps(repo, mock) });
  assert.equal(response.status, 200);
  assert.equal((await local(repo)).status, 'accredited');
});

test('API no disponible permite reintentar la notificación sin perderla', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  const first = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo, upstream({ fail: 503 })) });
  const retry = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo) });
  assert.equal(first.status, 503);
  assert.equal(retry.status, 200);
  assert.equal((await local(repo)).status, 'accredited');
});

test('un recurso aún no consistente puede verificarse después de un rechazo', async (t) => {
  const { repo, sqlite } = await seededRepository(); t.after(() => sqlite.close());
  const first = await handleMercadoPagoWebhook({
    request: webhookRequest(), ...deps(repo, upstream({ remote: merchant({ preference_id: 'not-yet-consistent' }) }))
  });
  assert.equal(first.status, 422);
  const retry = await handleMercadoPagoWebhook({ request: webhookRequest(), ...deps(repo) });
  assert.equal(retry.status, 200);
  assert.equal((await local(repo)).status, 'accredited');
  assert.equal(sqlite.prepare('SELECT outcome FROM payment_events').get().outcome, 'verified');
});

test('GET autenticado busca por preferencia, concilia y limita incluso los intentos sin pago', async () => {
  const token = 'a'.repeat(43);
  const hash = await sha256Base64Url(token);
  for (const hasPayment of [true, false]) {
    const { repo, sqlite } = await seededRepository({ access_token_hash: hash });
    try {
      let calls = 0; const mock = upstream(hasPayment ? {} : { search: [] });
      const options = deps(repo, async (url) => { calls++; return mock(url); });
      const makeRequest = () => new Request('https://example.test/api/orders/' + LOCAL_ID + '?reconcile=1', {
        headers: { authorization: 'Bearer ' + token }
      });
      const response = await handleGetOrder({ request: makeRequest(), id: LOCAL_ID, ...options });
      const body = await response.json();
      assert.equal(body.payment_verified, hasPayment);
      assert.equal(body.reconciliation, hasPayment ? 'completed' : 'deferred');
      assert.equal('mp_preference_id' in body, false);
      assert.equal('mp_order_id' in body, false);
      const before = calls;
      const again = await handleGetOrder({ request: makeRequest(), id: LOCAL_ID, ...options });
      assert.equal((await again.json()).reconciliation, 'rate_limited');
      assert.equal(calls, before);
    } finally { sqlite.close(); }
  }
});
