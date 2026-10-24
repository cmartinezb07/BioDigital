const API = 'https://api.mercadopago.com';

export class MercadoPagoError extends Error {
  constructor(code) { super(code); this.name = 'MercadoPagoError'; this.code = code; }
}

export function isCheckoutUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      (url.hostname === 'mercadopago.cl' || url.hostname.endsWith('.mercadopago.cl'));
  } catch { return false; }
}

export function checkoutOnlineConfig(env) {
  let site;
  try { site = new URL(env.CHECKOUT_SITE_URL); }
  catch { throw new MercadoPagoError('return_url_not_configured'); }
  const publicAppUrl = /^https:\/\//i.test(site.href) &&
    !['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(site.hostname);
  if (!publicAppUrl || site.username || site.password || site.search || site.hash) {
    throw new MercadoPagoError('return_url_not_configured');
  }
  const back_urls = {};
  for (const [key, variable, fallback] of [
    ['success', 'CHECKOUT_SUCCESS_PATH', '/pago/exitoso'],
    ['pending', 'CHECKOUT_PENDING_PATH', '/pago/pendiente'],
    ['failure', 'CHECKOUT_FAILURE_PATH', '/pago/error']
  ]) {
    const path = env[variable] || fallback;
    const target = new URL(path, site);
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || target.origin !== site.origin) {
      throw new MercadoPagoError('return_url_not_configured');
    }
    back_urls[key] = target.href;
  }
  return {
    back_urls,
    ...(publicAppUrl ? { auto_return: 'approved' } : {}),
    notification_url: new URL('/api/webhooks/mercadopago', site).href
  };
}

async function apiRequest(path, { env, fetchImpl = fetch, method = 'GET', body, idempotencyKey }) {
  if (typeof env.MP_ACCESS_TOKEN !== 'string' || env.MP_ACCESS_TOKEN.length < 8) {
    throw new MercadoPagoError('mp_not_configured');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetchImpl(API + path, {
      method,
      headers: {
        accept: 'application/json', authorization: 'Bearer ' + env.MP_ACCESS_TOKEN,
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: controller.signal
    });
    if (!response.ok) throw new MercadoPagoError('mp_http_' + response.status);
    try { return await response.json(); }
    catch { throw new MercadoPagoError('mp_invalid_response'); }
  } catch (error) {
    if (error instanceof MercadoPagoError) throw error;
    throw new MercadoPagoError(error?.name === 'AbortError' ? 'mp_timeout' : 'mp_unavailable');
  } finally { clearTimeout(timeout); }
}

export async function createMercadoPagoPreference({ payment, externalReference, idempotencyKey, env, onlineConfig, fetchImpl = fetch }) {
  const items = payment.items.map((item) => ({
    id: item.sku, title: item.title, unit_price: item.amount,
    quantity: item.quantity, currency_id: 'CLP'
  }));
  const body = { items, external_reference: externalReference, ...onlineConfig };
  if (env.MP_LIVE_MODE !== 'true') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.MP_TEST_PAYER_EMAIL || '')) {
      throw new MercadoPagoError('test_payer_not_configured');
    }
    body.payer = { email: env.MP_TEST_PAYER_EMAIL };
  }
  const data = await apiRequest('/checkout/preferences', { env, fetchImpl, method: 'POST', body, idempotencyKey });
  const expectedItems = new Map(items.map((item) => [item.id, item]));
  const received = Array.isArray(data.items) ? data.items : [];
  const validItems = received.length === items.length && new Set(received.map((item) => item.id)).size === items.length &&
    received.every((item) => {
      const expected = expectedItems.get(item.id);
      return expected && item.currency_id === 'CLP' && item.quantity === expected.quantity && item.unit_price === expected.unit_price;
    });
  if (typeof data.id !== 'string' || !/^[A-Za-z0-9-]{5,128}$/.test(data.id) ||
      data.external_reference !== externalReference ||
      !env.MP_USER_ID || String(data.collector_id) !== String(env.MP_USER_ID) ||
      !env.MP_APPLICATION_ID || String(data.client_id) !== String(env.MP_APPLICATION_ID) ||
      !validItems || !isCheckoutUrl(data.init_point)) {
    throw new MercadoPagoError('mp_contract_mismatch');
  }
  return { id: data.id, status: 'created', checkoutUrl: data.init_point };
}

function numericId(id) {
  if (!/^[1-9]\d{0,24}$/.test(String(id))) throw new MercadoPagoError('mp_invalid_resource_id');
  return String(id);
}

export function getMercadoPagoPayment({ paymentId, ...options }) {
  return apiRequest('/v1/payments/' + numericId(paymentId), options);
}

export function getMercadoPagoMerchantOrder({ orderId, ...options }) {
  return apiRequest('/merchant_orders/' + numericId(orderId), options);
}

export async function searchMercadoPagoMerchantOrder({ order, ...options }) {
  const query = new URLSearchParams({ preference_id: order.mp_preference_id, external_reference: order.external_reference });
  const data = await apiRequest('/merchant_orders/search?' + query, options);
  if (!Array.isArray(data.elements) || data.elements.length > 1 ||
      (data.total !== undefined && Number(data.total) !== data.elements.length)) {
    throw new MercadoPagoError('mp_ambiguous_merchant_order');
  }
  return data.elements[0] || null;
}
