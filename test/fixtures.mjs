import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { D1OrderRepository } from '../functions/_lib/order-repository.js';

export const NOW = new Date('2026-10-24T15:00:00.000Z');
export const LOCAL_ID = '123e4567-e89b-42d3-a456-426614174001';
export const MP_ID = '123456789';
export const PREF_ID = '456-test-preference';
export const PAYMENT_ID = '987654321';
export const ENV = {
  MP_ACCESS_TOKEN: 'NOT_A_REAL_ACCESS_TOKEN', MP_WEBHOOK_SECRET: 'test-only-webhook-secret',
  MP_APPLICATION_ID: 'app-123', MP_USER_ID: 'seller-456', MP_LIVE_MODE: 'false'
};

export function databaseRepository() {
  const sqlite = new DatabaseSync(':memory:');
  for (const file of ['0001_orders.sql', '0002_order_items.sql', '0003_checkout_preferences.sql']) {
    sqlite.exec(readFileSync(new URL('../migrations/' + file, import.meta.url), 'utf8'));
  }
  const adapter = {
    prepare(sql) {
      let args = [];
      return {
        bind(...values) { args = values; return this; },
        async first() { return sqlite.prepare(sql).get(...args) || null; },
        async all() { return { results: sqlite.prepare(sql).all(...args) }; },
        async run() { return { meta: sqlite.prepare(sql).run(...args) }; }
      };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    }
  };
  return { repo: new D1OrderRepository(adapter), sqlite };
}

export async function seededRepository(overrides = {}) {
  const { repo, sqlite } = databaseRepository();
  await repo.insert({
    id: LOCAL_ID, access_token_hash: 'hash', idempotency_key: LOCAL_ID, request_fingerprint: 'fixture',
    sku: 'full-pack', title: 'Pack', amount: 79990, currency: 'CLP', purpose: 'full',
    project_reference: null, parent_order_id: null, status: 'created', external_reference: LOCAL_ID,
    items: [{ sku: 'full-pack', title: 'Pack', amount: 79990, currency: 'CLP', quantity: 1 }],
    created_at: NOW.toISOString(), updated_at: NOW.toISOString()
  });
  await repo.markCreated(LOCAL_ID, { id: PREF_ID, status: 'created', checkoutUrl: 'https://www.mercadopago.cl/checkout/test' }, NOW.toISOString());
  for (const [column, value] of Object.entries(overrides)) {
    if (!['status', 'access_token_hash', 'mp_order_id', 'mp_preference_id'].includes(column)) throw new Error('Invalid fixture column');
    sqlite.prepare('UPDATE orders SET ' + column + ' = ? WHERE id = ?').run(value, LOCAL_ID);
  }
  return { repo, sqlite };
}

export function merchant(overrides = {}) {
  return {
    id: Number(MP_ID), status: 'closed', external_reference: LOCAL_ID, preference_id: PREF_ID,
    collector: { id: ENV.MP_USER_ID }, client_id: ENV.MP_APPLICATION_ID, site_id: 'MLC',
    total_amount: 79990, last_updated: NOW.toISOString(),
    payments: [{ id: Number(PAYMENT_ID) }], ...overrides
  };
}

export function payment(overrides = {}) {
  return {
    id: Number(PAYMENT_ID), status: 'approved', status_detail: 'accredited',
    external_reference: LOCAL_ID, collector_id: ENV.MP_USER_ID, live_mode: false,
    order: { id: Number(MP_ID), type: 'mercadopago' },
    transaction_amount: 79990, transaction_amount_refunded: 0, currency_id: 'CLP',
    date_last_updated: NOW.toISOString(), ...overrides
  };
}

export function upstream({ remote = merchant(), payments = [payment()], search = [remote], fail } = {}) {
  return async (url) => {
    if (fail) return new Response('{}', { status: fail });
    const path = new URL(url).pathname;
    let value;
    if (path === '/merchant_orders/search') value = { elements: search, total: search.length };
    else if (path === '/merchant_orders/' + MP_ID) value = remote;
    else if (path.startsWith('/v1/payments/')) value = payments.find((p) => String(p.id) === path.split('/').pop());
    if (!value) return new Response('{}', { status: 404 });
    return new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
  };
}
