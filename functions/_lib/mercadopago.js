const ORDERS_URL = 'https://api.mercadopago.com/v1/orders';

export class MercadoPagoError extends Error {
  constructor(code) {
    super(code);
    this.name = 'MercadoPagoError';
    this.code = code;
  }
}

function isCheckoutUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (
      url.hostname === 'mercadopago.cl' || url.hostname.endsWith('.mercadopago.cl')
    );
  } catch {
    return false;
  }
}

const RETURN_PATHS = Object.freeze({
  success_url: ['CHECKOUT_SUCCESS_PATH', '/pago/exitoso'],
  pending_url: ['CHECKOUT_PENDING_PATH', '/pago/pendiente'],
  failure_url: ['CHECKOUT_FAILURE_PATH', '/pago/error']
});

export function checkoutOnlineConfig(env) {
  let site;
  try {
    site = new URL(env.CHECKOUT_SITE_URL);
  } catch {
    throw new MercadoPagoError('return_url_not_configured');
  }
  if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash) {
    throw new MercadoPagoError('return_url_not_configured');
  }

  const online = { auto_return: 'all' };
  for (const [field, [variable, fallback]] of Object.entries(RETURN_PATHS)) {
    const path = env[variable] || fallback;
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
      throw new MercadoPagoError('return_url_not_configured');
    }
    online[field] = new URL(path, site).href;
  }
  return online;
}

function sameConfigured(actual, expected) {
  return expected !== undefined && expected !== null && String(actual) === String(expected);
}

function testPayer(env) {
  if (env.MP_LIVE_MODE === 'true') return undefined;
  const email = env.MP_TEST_PAYER_EMAIL;
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new MercadoPagoError('test_payer_not_configured');
  }
  return { email };
}

export async function createMercadoPagoOrder({ payment, externalReference, idempotencyKey, env, onlineConfig, fetchImpl = fetch }) {
  const accessToken = env.MP_ACCESS_TOKEN;
  if (typeof accessToken !== 'string' || accessToken.length < 8) {
    throw new MercadoPagoError('mp_not_configured');
  }

  const payer = testPayer(env);
  const payload = {
    type: 'online',
    processing_mode: 'manual',
    total_amount: String(payment.amount),
    external_reference: externalReference,
    config: { online: onlineConfig },
    items: (payment.items?.length ? payment.items : [{
      sku: payment.sku, title: payment.title, amount: payment.amount, quantity: 1
    }]).map((item) => ({
      id: item.sku,
      title: item.title,
      unit_price: String(item.amount),
      quantity: item.quantity || 1,
      unit_measure: 'unit',
      total_amount: String(item.amount * (item.quantity || 1))
    }))
  };
  if (payer) payload.payer = payer;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetchImpl(ORDERS_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
        'x-idempotency-key': idempotencyKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    throw new MercadoPagoError(error?.name === 'AbortError' ? 'mp_timeout' : 'mp_unavailable');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new MercadoPagoError(`mp_http_${response.status}`);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new MercadoPagoError('mp_invalid_response');
  }

  if (
    typeof data.id !== 'string' || !/^ORD[A-Z0-9]+$/i.test(data.id) ||
    data.type !== 'online' ||
    data.processing_mode !== 'manual' ||
    data.status !== 'created' ||
    data.status_detail !== 'created' ||
    data.external_reference !== externalReference ||
    !sameConfigured(data.user_id, env.MP_USER_ID) ||
    !sameConfigured(data.integration_data?.application_id, env.MP_APPLICATION_ID) ||
    data.country_code !== (env.MP_COUNTRY_CODE || 'CHL') ||
    data.currency !== 'CLP' ||
    !Number.isSafeInteger(Number(data.total_amount)) ||
    Number(data.total_amount) !== payment.amount ||
    !isCheckoutUrl(data.checkout_url)
  ) {
    throw new MercadoPagoError('mp_contract_mismatch');
  }

  return {
    id: data.id,
    status: data.status,
    checkoutUrl: data.checkout_url
  };
}

export async function getMercadoPagoOrder({ orderId, accessToken, fetchImpl = fetch }) {
  if (typeof accessToken !== 'string' || accessToken.length < 8) {
    throw new MercadoPagoError('mp_not_configured');
  }
  if (typeof orderId !== 'string' || !/^ORD[A-Z0-9]+$/i.test(orderId)) {
    throw new MercadoPagoError('mp_invalid_order_id');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetchImpl(`${ORDERS_URL}/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: { accept: 'application/json', authorization: `Bearer ${accessToken}` },
      signal: controller.signal
    });
  } catch (error) {
    throw new MercadoPagoError(error?.name === 'AbortError' ? 'mp_timeout' : 'mp_unavailable');
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) throw new MercadoPagoError(`mp_http_${response.status}`);
  try {
    return await response.json();
  } catch {
    throw new MercadoPagoError('mp_invalid_response');
  }
}
