import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { CATALOG } from '../functions/_lib/catalog.js';
import { sha256Base64Url } from '../functions/_lib/crypto.js';
import { handleCreateOrder, handleGetOrder } from '../functions/_lib/order-service.js';
import { handlePaymentConfig } from '../functions/_lib/payment-config.js';
import { createIdempotencyAttempt, createOrder, evaluateCart, getStoredOrder, readStoredOrder, storeOrder } from '../web/propuesta/fuentes/pagos.mjs';

const SECRET = 'test-only-order-token-secret-32-characters-minimum';
const IDEMPOTENCY_KEY = '123e4567-e89b-42d3-a456-426614174000';

function enabledCatalog(entries = [['full-pack', 'Pack completo', 79990]]) {
  return Object.fromEntries(entries.map(([sku, title, amount]) => [sku, {
    sku,
    title,
    currency: 'CLP',
    enabled: true,
    purposes: {
      full: { amount, enabled: true },
      deposit: { amount: null, enabled: false },
      balance: { amount: null, enabled: false }
    }
  }]));
}

class MemoryOrderRepository {
  constructor() {
    this.orders = new Map();
  }

  async findByIdempotencyKey(key) {
    return [...this.orders.values()].find((order) => order.idempotency_key === key) || null;
  }

  async findByPublicAccess(id, hash) {
    const order = this.orders.get(id);
    return order?.access_token_hash === hash ? { ...order } : null;
  }

  async insert(order) {
    if (await this.findByIdempotencyKey(order.idempotency_key)) throw new Error('UNIQUE constraint failed');
    this.orders.set(order.id, { ...order });
  }

  async markCreating(id, updatedAt) {
    const order = this.orders.get(id);
    Object.assign(order, {
      status: 'creating',
      creation_attempts: order.creation_attempts + 1,
      last_error_code: null,
      updated_at: updatedAt
    });
  }

  async markCreated(id, mpOrder, updatedAt) {
    Object.assign(this.orders.get(id), {
      status: 'created',
      mp_order_id: mpOrder.id,
      mp_status: mpOrder.status,
      checkout_url: mpOrder.checkoutUrl,
      last_error_code: null,
      updated_at: updatedAt
    });
  }

  async markCreationFailed(id, errorCode, updatedAt) {
    Object.assign(this.orders.get(id), {
      status: 'creation_failed',
      last_error_code: errorCode,
      updated_at: updatedAt
    });
  }
}

function request(body, { key = IDEMPOTENCY_KEY } = {}) {
  return new Request('https://example.test/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': key },
    body: JSON.stringify(body)
  });
}

function mpSuccess(amount = 79990, overrides = {}) {
  return new Response(JSON.stringify({
    id: 'ORD01TEST123',
    type: 'online',
    processing_mode: 'manual',
    status: 'created',
    status_detail: 'created',
    external_reference: '123e4567-e89b-42d3-a456-426614174001',
    user_id: 'seller-456',
    country_code: 'CHL',
    currency: 'CLP',
    total_amount: String(amount),
    checkout_url: 'https://www.mercadopago.cl/checkout/v1/redirect?order_id=test',
    integration_data: { application_id: 'app-123' },
    ...overrides
  }), { status: 201, headers: { 'content-type': 'application/json' } });
}

function mpSuccessForRequest(init, amount = 79990, overrides = {}) {
  const requestPayload = JSON.parse(init.body);
  return mpSuccess(amount, { external_reference: requestPayload.external_reference, ...overrides });
}

function dependencies(overrides = {}) {
  return {
    env: {
      PAYMENTS_ENABLED: 'true',
      MP_ACCESS_TOKEN: 'TEST_ACCESS_TOKEN_NOT_REAL',
      MP_APPLICATION_ID: 'app-123',
      MP_USER_ID: 'seller-456',
      MP_TEST_PAYER_EMAIL: 'buyer-test@example.test',
      MP_LIVE_MODE: 'false',
      MP_COUNTRY_CODE: 'CHL',
      ORDER_TOKEN_SECRET: SECRET,
      CHECKOUT_SITE_URL: 'https://pagos.example.test',
      ...overrides.env
    },
    repo: overrides.repo || new MemoryOrderRepository(),
    catalog: overrides.catalog || enabledCatalog(),
    fetchImpl: overrides.fetchImpl || (async (_url, init) => mpSuccessForRequest(init)),
    now: overrides.now || (() => new Date('2026-10-11T12:00:00.000Z'))
  };
}

test('el catálogo real contiene solo CLP, montos enteros y cobros deshabilitados', () => {
  assert.ok(Object.keys(CATALOG).length > 0);
  for (const product of Object.values(CATALOG)) {
    assert.equal(product.currency, 'CLP');
    assert.equal(product.enabled, false);
    assert.equal(product.purposes.full.enabled, false);
    if (product.purposes.full.amount === null) assert.equal(product.quoteOnly, true);
    else assert.ok(Number.isSafeInteger(product.purposes.full.amount));
  }
});

test('la migración crea el esquema y aplica restricciones críticas', () => {
  const database = new DatabaseSync(':memory:');
  for (const name of ['0001_orders.sql', '0002_order_items.sql']) {
    database.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
  }

  const insert = database.prepare(`
    INSERT INTO orders (
      id, access_token_hash, idempotency_key, request_fingerprint, sku, title,
      amount, currency, purpose, status, external_reference, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const values = [
    '123e4567-e89b-42d3-a456-426614174001', 'hash-1', IDEMPOTENCY_KEY,
    'full-pack:full:79990:CLP', 'full-pack', 'Pack completo', 79990,
    'CLP', 'full', 'pending_creation', '123e4567-e89b-42d3-a456-426614174001',
    '2026-10-11T12:00:00.000Z', '2026-10-11T12:00:00.000Z'
  ];
  insert.run(...values);
  assert.equal(database.prepare('SELECT amount FROM orders').get().amount, 79990);
  database.prepare(`
    INSERT INTO order_items (order_id, position, sku, title, amount, currency, quantity)
    VALUES (?, 0, 'full-pack', 'Pack completo', 79990, 'CLP', 1)
  `).run(values[0]);
  assert.equal(database.prepare('SELECT sku FROM order_items').get().sku, 'full-pack');
  assert.throws(() => insert.run(...values), /unique/i);
  assert.throws(() => insert.run(
    '123e4567-e89b-42d3-a456-426614174002', 'hash-2',
    '223e4567-e89b-42d3-a456-426614174000', 'bad', 'full-pack', 'Pack',
    1.5, 'CLP', 'full', 'pending_creation',
    '123e4567-e89b-42d3-a456-426614174002',
    '2026-10-11T12:00:00.000Z', '2026-10-11T12:00:00.000Z'
  ), /check/i);
  database.close();
});

test('rechaza SKU inválido', async () => {
  const response = await handleCreateOrder({ request: request({ sku: 'unknown', purpose: 'full' }), ...dependencies() });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'invalid_sku');
});

test('rechaza montos y precios enviados por el navegador', async () => {
  for (const field of ['amount', 'price', 'total_amount', 'currency']) {
    const response = await handleCreateOrder({
      request: request({ sku: 'full-pack', purpose: 'full', [field]: 1 }),
      ...dependencies()
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'unsupported_field');
  }
});

test('rechaza un producto no habilitado sin llamar a Mercado Pago', async () => {
  let calls = 0;
  const response = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...dependencies({ catalog: CATALOG, fetchImpl: async () => { calls++; return mpSuccess(); } })
  });
  assert.equal(response.status, 403);
  assert.equal((await response.json()).error.code, 'product_disabled');
  assert.equal(calls, 0);
});

test('el interruptor global impide crear órdenes', async () => {
  const response = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...dependencies({ env: { PAYMENTS_ENABLED: 'false' } })
  });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'payments_disabled');
});

test('crea y persiste una orden usando Orders API con precio del servidor', async () => {
  const repo = new MemoryOrderRepository();
  let upstreamRequest;
  const deps = dependencies({
    repo,
    fetchImpl: async (url, init) => {
      upstreamRequest = { url, init };
      return mpSuccessForRequest(init);
    }
  });
  const response = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...deps
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.amount, 79990);
  assert.equal(body.currency, 'CLP');
  assert.equal(body.status, 'created');
  assert.match(body.access_token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(upstreamRequest.url, 'https://api.mercadopago.com/v1/orders');
  assert.equal(upstreamRequest.init.headers['x-idempotency-key'], IDEMPOTENCY_KEY);
  assert.equal(upstreamRequest.init.headers.authorization, 'Bearer TEST_ACCESS_TOKEN_NOT_REAL');

  const payload = JSON.parse(upstreamRequest.init.body);
  assert.equal(payload.type, 'online');
  assert.equal(payload.processing_mode, 'manual');
  assert.equal(payload.total_amount, '79990');
  assert.deepEqual(payload.payer, { email: 'buyer-test@example.test' });
  assert.equal(payload.items[0].unit_price, '79990');
  assert.equal(payload.external_reference, body.id);
  assert.deepEqual(payload.config.online, {
    auto_return: 'all',
    success_url: 'https://pagos.example.test/pago/exitoso',
    pending_url: 'https://pagos.example.test/pago/pendiente',
    failure_url: 'https://pagos.example.test/pago/error'
  });

  const stored = [...repo.orders.values()][0];
  assert.equal(stored.status, 'created');
  assert.equal(stored.mp_order_id, 'ORD01TEST123');
  assert.equal(stored.creation_attempts, 1);
  assert.notEqual(stored.access_token_hash, body.access_token);
});

test('crea una sola orden para varios productos del carrito y suma precios del servidor', async () => {
  const catalog = enabledCatalog([
    ['photography', 'Fotografía gastronómica', 34990],
    ['loyalty-card', 'Tarjeta de fidelización', 9990]
  ]);
  let payload;
  const response = await handleCreateOrder({
    request: request({ items: ['loyalty-card', 'photography'], purpose: 'full' }),
    ...dependencies({
      catalog,
      fetchImpl: async (_url, init) => {
        payload = JSON.parse(init.body);
        return mpSuccessForRequest(init, 44980);
      }
    })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.amount, 44980);
  assert.deepEqual(body.items.map((item) => item.sku), ['loyalty-card', 'photography']);
  assert.equal(payload.total_amount, '44980');
  assert.deepEqual(payload.items.map((item) => item.id), ['loyalty-card', 'photography']);
});

test('repite la misma respuesta pública sin duplicar la llamada upstream', async () => {
  const repo = new MemoryOrderRepository();
  let calls = 0;
  const deps = dependencies({ repo, fetchImpl: async (_url, init) => { calls++; return mpSuccessForRequest(init); } });
  const first = await handleCreateOrder({ request: request({ sku: 'full-pack', purpose: 'full' }), ...deps });
  const firstBody = await first.json();
  const second = await handleCreateOrder({ request: request({ sku: 'full-pack', purpose: 'full' }), ...deps });
  const secondBody = await second.json();

  assert.equal(calls, 1);
  assert.equal(second.status, 200);
  assert.equal(secondBody.id, firstBody.id);
  assert.equal(secondBody.access_token, firstBody.access_token);
  assert.equal(secondBody.checkout_url, firstBody.checkout_url);
  assert.equal(secondBody.reused, true);
  assert.equal(repo.orders.size, 1);
});

test('una clave idempotente no puede reutilizarse con otra compra', async () => {
  const repo = new MemoryOrderRepository();
  const catalog = enabledCatalog([
    ['full-pack', 'Pack completo', 79990],
    ['loyalty-card', 'Tarjeta', 9990]
  ]);
  const deps = dependencies({ repo, catalog });
  await handleCreateOrder({ request: request({ sku: 'full-pack', purpose: 'full' }), ...deps });
  const response = await handleCreateOrder({ request: request({ sku: 'loyalty-card', purpose: 'full' }), ...deps });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error.code, 'idempotency_conflict');
});

test('un fallo upstream se puede reintentar con la misma clave sin otra orden local', async () => {
  const repo = new MemoryOrderRepository();
  let calls = 0;
  const deps = dependencies({
    repo,
    fetchImpl: async (_url, init) => {
      calls++;
      return calls === 1 ? new Response('{}', { status: 503 }) : mpSuccessForRequest(init);
    }
  });
  const first = await handleCreateOrder({ request: request({ sku: 'full-pack', purpose: 'full' }), ...deps });
  const second = await handleCreateOrder({ request: request({ sku: 'full-pack', purpose: 'full' }), ...deps });

  assert.equal(first.status, 502);
  assert.equal(second.status, 201);
  assert.equal(repo.orders.size, 1);
  assert.equal([...repo.orders.values()][0].creation_attempts, 2);
});

test('rechaza una respuesta upstream con moneda o monto inesperados', async () => {
  const repo = new MemoryOrderRepository();
  const response = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...dependencies({ repo, fetchImpl: async () => new Response(JSON.stringify({
      id: 'ORD01WRONG', type: 'online', processing_mode: 'manual', status: 'created',
      status_detail: 'created', external_reference: '123e4567-e89b-42d3-a456-426614174001',
      user_id: 'seller-456', country_code: 'CHL', currency: 'USD', total_amount: '1',
      integration_data: { application_id: 'app-123' },
      checkout_url: 'https://www.mercadopago.cl/checkout/test'
    }), { status: 201 }) })
  });
  assert.equal(response.status, 502);
  assert.equal([...repo.orders.values()][0].status, 'creation_failed');
  assert.equal([...repo.orders.values()][0].last_error_code, 'mp_contract_mismatch');
});

test('exige comprador de prueba y rechaza identidad o ambiente inesperados al crear', async () => {
  const missingPayer = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...dependencies({ env: { MP_TEST_PAYER_EMAIL: undefined } })
  });
  assert.equal(missingPayer.status, 502);

  const mismatches = [
    { user_id: 'other-seller' },
    { country_code: 'ARG' },
    { integration_data: { application_id: 'other-app' } },
    { external_reference: 'other-order' }
  ];
  for (const [index, changes] of mismatches.entries()) {
    const response = await handleCreateOrder({
      request: request(
        { sku: 'full-pack', purpose: 'full' },
        { key: `123e4567-e89b-42d3-a456-42661417410${index}` }
      ),
      ...dependencies({ fetchImpl: async (_url, init) => mpSuccessForRequest(init, 79990, changes) })
    });
    assert.equal(response.status, 502);
  }
});

test('GET exige la capacidad secreta y no expone campos internos', async () => {
  const repo = new MemoryOrderRepository();
  const deps = dependencies({ repo });
  const createdResponse = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...deps
  });
  const created = await createdResponse.json();
  const url = `https://example.test/api/orders/${created.id}`;

  const missing = await handleGetOrder({ request: new Request(url), env: deps.env, id: created.id, repo });
  assert.equal(missing.status, 401);

  const wrong = await handleGetOrder({
    request: new Request(url, { headers: { authorization: `Bearer ${'a'.repeat(43)}` } }),
    env: deps.env,
    id: created.id,
    repo
  });
  assert.equal(wrong.status, 404);

  const allowed = await handleGetOrder({
    request: new Request(url, { headers: { authorization: `Bearer ${created.access_token}` } }),
    env: deps.env,
    id: created.id,
    repo
  });
  const publicBody = await allowed.json();
  assert.equal(allowed.status, 200);
  assert.equal(publicBody.id, created.id);
  assert.equal(publicBody.status, 'created');
  assert.equal('access_token' in publicBody, false);
  assert.equal('idempotency_key' in publicBody, false);
  assert.equal('mp_order_id' in publicBody, false);
  assert.equal('last_error_code' in publicBody, false);
  assert.equal(await sha256Base64Url(created.access_token), [...repo.orders.values()][0].access_token_hash);
});

test('las rutas de retorno se pueden configurar sin aceptar un dominio inseguro', async () => {
  let payload;
  const response = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }),
    ...dependencies({
      env: {
        CHECKOUT_SITE_URL: 'https://preview.example.test/base/',
        CHECKOUT_SUCCESS_PATH: '/ok',
        CHECKOUT_PENDING_PATH: '/waiting',
        CHECKOUT_FAILURE_PATH: '/failed'
      },
      fetchImpl: async (_url, init) => { payload = JSON.parse(init.body); return mpSuccessForRequest(init); }
    })
  });
  assert.equal(response.status, 201);
  assert.deepEqual(payload.config.online, {
    auto_return: 'all',
    success_url: 'https://preview.example.test/ok',
    pending_url: 'https://preview.example.test/waiting',
    failure_url: 'https://preview.example.test/failed'
  });

  let calls = 0;
  const rejected = await handleCreateOrder({
    request: request({ sku: 'full-pack', purpose: 'full' }, { key: '223e4567-e89b-42d3-a456-426614174000' }),
    ...dependencies({ env: { CHECKOUT_SITE_URL: 'http://unsafe.example.test' }, fetchImpl: async () => { calls++; return mpSuccess(); } })
  });
  assert.equal(rejected.status, 502);
  assert.equal(calls, 0);
});

test('la configuración pública refleja el interruptor y habilita anticipos solo desde catálogo', async () => {
  const catalog = enabledCatalog();
  catalog['full-pack'].purposes.deposit = { amount: 30000, enabled: true };

  const off = await handlePaymentConfig({ env: { PAYMENTS_ENABLED: 'false' }, catalog });
  const offBody = await off.json();
  assert.equal(offBody.payments_enabled, false);
  assert.equal(offBody.products[0].enabled, false);
  assert.equal(offBody.products[0].purposes.deposit.enabled, false);

  const on = await handlePaymentConfig({ env: { PAYMENTS_ENABLED: 'true' }, catalog });
  const onBody = await on.json();
  assert.equal(onBody.products[0].enabled, true);
  assert.deepEqual(onBody.products[0].purposes.deposit, { amount: 30000, enabled: true });
});

test('el cliente envía solo sku y purpose, conserva la idempotencia y usa la capacidad en GET', async () => {
  const seen = [];
  const orderBody = {
    id: '123e4567-e89b-42d3-a456-426614174001',
    access_token: 'a'.repeat(43),
    checkout_url: 'https://www.mercadopago.cl/checkout/v1/redirect?order_id=test',
    items: [{ sku: 'full-pack', title: 'Pack completo', amount: 79990, currency: 'CLP', quantity: 1 }],
    purpose: 'full'
  };
  const fetchImpl = async (url, init) => {
    seen.push({ url, init });
    return new Response(JSON.stringify(orderBody), { status: 201, headers: { 'content-type': 'application/json' } });
  };
  let generated = 0;
  const attempt = createIdempotencyAttempt(() => `${++generated}`);
  const key = attempt.current();
  assert.equal(attempt.current(), key);
  await createOrder({ items: ['full-pack'], idempotencyKey: key, fetchImpl });
  await createOrder({ items: ['full-pack'], idempotencyKey: key, fetchImpl });
  assert.deepEqual(JSON.parse(seen[0].init.body), { items: ['full-pack'], purpose: 'full' });
  assert.equal(seen[0].init.headers['idempotency-key'], key);
  assert.equal(seen[1].init.headers['idempotency-key'], key);
  attempt.reset();
  assert.notEqual(attempt.current(), key);

  const values = new Map();
  const storage = { setItem: (k, v) => values.set(k, v), getItem: (k) => values.get(k) || null };
  storeOrder(storage, orderBody);
  const stored = readStoredOrder(storage);
  let getInit;
  await getStoredOrder(stored, async (_url, init) => {
    getInit = init;
    return new Response(JSON.stringify({ ...orderBody, status: 'created', amount: 79990 }), { status: 200 });
  });
  assert.equal(getInit.headers.authorization, `Bearer ${orderBody.access_token}`);
});

test('el carrito distingue pago directo, cotización y pagos deshabilitados', () => {
  const catalog = enabledCatalog([
    ['photography', 'Fotografía', 34990],
    ['loyalty-card', 'Fidelización', 9990]
  ]);
  catalog['interactive-menu-ar'] = {
    sku: 'interactive-menu-ar', title: 'Menú AR', currency: 'CLP', enabled: false, quote_only: true,
    purposes: { full: { amount: null, enabled: false } }
  };
  const products = Object.values(catalog);
  assert.deepEqual(evaluateCart({ payments_enabled: true, products }, ['photography', 'loyalty-card']), {
    kind: 'payable', items: ['loyalty-card', 'photography'], amount: 44980, allowed: true
  });
  assert.equal(evaluateCart({ payments_enabled: true, products }, ['interactive-menu-ar']).kind, 'quote');
  assert.equal(evaluateCart({ payments_enabled: false, products }, ['photography']).kind, 'disabled');
});

test('los retornos generados no acreditan un pago desde parámetros de URL', () => {
  const client = readFileSync(new URL('../web/propuesta/fuentes/pagos.mjs', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../web/propuesta/pagos.css', import.meta.url), 'utf8');
  assert.equal(client.includes("searchParams.get('status')"), false);
  assert.match(client, /order\.status === 'accredited'/);
  assert.match(styles, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(styles, /\.cart-payment-state/);
  const landing = readFileSync(new URL('../web/propuesta/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(landing, /data-checkout-root/);
  assert.match(landing, /data-cart-pay/);
  for (const route of ['exitoso', 'pendiente', 'error']) {
    const html = readFileSync(new URL(`../web/propuesta/pago/${route}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    assert.match(html, /La URL de retorno no se usa como comprobante de pago/);
    assert.doesNotMatch(html, /pago (fue|está) aprobado/i);
  }
});
