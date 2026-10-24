import { PAYMENT_LINKS, fixedPaymentUrl } from './enlaces-pago.mjs';

export const ORDER_STORAGE_KEY = 'bd.checkout.order.v1';

export function formatClp(amount) {
  return Number.isSafeInteger(amount) ? new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0
  }).format(amount) : '—';
}

export function createIdempotencyAttempt(randomUUID = () => crypto.randomUUID()) {
  let key;
  return {
    current() { key ||= randomUUID(); return key; },
    reset() { key = undefined; }
  };
}

async function responseJson(response) {
  try { return await response.json(); } catch { return null; }
}

export async function fetchPaymentConfig(fetchImpl = fetch) {
  const response = await fetchImpl('/api/payments/config', { headers: { accept: 'application/json' } });
  const body = await responseJson(response);
  if (!response.ok || !body || !Array.isArray(body.products)) throw new Error('config_unavailable');
  return body;
}

export async function createOrder({ items, idempotencyKey, fetchImpl = fetch }) {
  const response = await fetchImpl('/api/orders', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'idempotency-key': idempotencyKey
    },
    body: JSON.stringify({ items, purpose: 'full' })
  });
  const body = await responseJson(response);
  if (!response.ok) {
    const error = new Error(body?.error?.message || 'No fue posible preparar el pago.');
    error.code = body?.error?.code || 'request_failed';
    error.status = response.status;
    throw error;
  }
  if (!body?.id || !body?.access_token || !isMercadoPagoUrl(body.checkout_url)) throw new Error('invalid_order_response');
  return body;
}

export function storeOrder(storage, order) {
  storage.setItem(ORDER_STORAGE_KEY, JSON.stringify({
    id: order.id,
    access_token: order.access_token,
    checkout_url: order.checkout_url,
    items: order.items || [],
    purpose: order.purpose
  }));
}

export function readStoredOrder(storage) {
  try {
    const order = JSON.parse(storage.getItem(ORDER_STORAGE_KEY));
    return order?.id && order?.access_token ? order : null;
  } catch { return null; }
}

export async function getStoredOrder(order, fetchImpl = fetch) {
  const response = await fetchImpl('/api/orders/' + encodeURIComponent(order.id) + '?reconcile=1', {
    headers: { accept: 'application/json', authorization: 'Bearer ' + order.access_token }
  });
  const body = await responseJson(response);
  if (!response.ok || !body?.id) throw new Error(body?.error?.message || 'No fue posible comprobar la orden.');
  return body;
}

function isMercadoPagoUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (
      url.hostname === 'mercadopago.cl' || url.hostname.endsWith('.mercadopago.cl') || url.hostname === 'mpago.la'
    );
  } catch { return false; }
}

export function evaluateCart(config, items, paymentLinks = PAYMENT_LINKS) {
  const products = new Map((config?.products || []).map((product) => [product.sku, product]));
  const uniqueItems = [...new Set(Array.isArray(items) ? items : [])].sort();
  if (!uniqueItems.length) return { kind: 'empty', items: [], amount: 0, allowed: false };
  const selected = uniqueItems.map((sku) => products.get(sku));
  if (selected.some((product) => !product)) {
    return { kind: 'unavailable', items: uniqueItems, amount: 0, allowed: false };
  }
  if (selected.some((product) => product.quote_only)) {
    return { kind: 'quote', items: uniqueItems, amount: 0, allowed: false };
  }
  if (selected.some((product) => !Number.isSafeInteger(product.purposes?.full?.amount) || product.purposes.full.amount <= 0)) {
    return { kind: 'unavailable', items: uniqueItems, amount: 0, allowed: false };
  }
  const amount = selected.reduce((total, product) => {
    const itemAmount = product.purposes?.full?.amount;
    return total + (Number.isSafeInteger(itemAmount) ? itemAmount : 0);
  }, 0);
  const allowed = Boolean(config.payments_enabled && selected.every((product) => (
    product.enabled && product.purposes?.full?.enabled && Number.isSafeInteger(product.purposes.full.amount)
  )));
  if (!allowed && uniqueItems.length === 1) {
    const checkoutUrl = fixedPaymentUrl(paymentLinks[uniqueItems[0]], amount);
    if (checkoutUrl) return { kind: 'manual', items: uniqueItems, amount, allowed: false, checkoutUrl };
  }
  return { kind: allowed ? 'payable' : 'disabled', items: uniqueItems, amount, allowed };
}

export function initCartCheckout(root, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl || fetch;
  const storage = dependencies.storage || sessionStorage;
  const navigate = dependencies.navigate || ((url) => location.assign(url));
  const getItems = dependencies.getItems || (() => window.BioDigitalCart?.items() || []);
  const pay = root.querySelector('[data-cart-pay]');
  const manualPay = root.querySelector('[data-cart-manual-pay]');
  const quote = root.querySelector('[data-cart-pedir]');
  const state = root.querySelector('[data-cart-payment-state]');
  const label = pay.querySelector('.btn-label');
  const attempt = createIdempotencyAttempt(dependencies.randomUUID);
  let config;
  let lastFingerprint = '';

  function setState(message, tone = '') {
    state.textContent = message;
    state.dataset.tone = tone;
  }

  function render() {
    if (!config) return;
    const evaluation = evaluateCart(config, getItems());
    const fingerprint = evaluation.items.join('|');
    if (fingerprint !== lastFingerprint) {
      attempt.reset();
      lastFingerprint = fingerprint;
    }
    pay.hidden = evaluation.kind !== 'payable';
    if (manualPay) {
      manualPay.hidden = evaluation.kind !== 'manual';
      if (evaluation.kind === 'manual') {
        manualPay.href = evaluation.checkoutUrl;
        manualPay.textContent = `Pagar ${formatClp(evaluation.amount)} con Mercado Pago ↗`;
      } else manualPay.removeAttribute('href');
    }
    quote.hidden = false;
    quote.textContent = evaluation.kind === 'quote' ? 'Continuar para cotizar'
      : evaluation.kind === 'manual' ? 'Consultar antes de pagar' : 'Confirmar pedido por WhatsApp';

    if (evaluation.kind === 'empty') {
      setState('Agrega servicios para ver las opciones de contratación.');
    } else if (evaluation.kind === 'quote') {
      setState('Uno o más servicios necesitan diagnóstico y cotización previa.');
    } else if (evaluation.kind === 'unavailable') {
      setState('Este carrito contiene una selección que ya no está disponible.', 'error');
    } else if (evaluation.kind === 'manual') {
      setState(`Pagarás ${formatClp(evaluation.amount)} en Mercado Pago. Confirmaremos la operación antes de coordinar el servicio.`, 'ok');
    } else if (evaluation.kind === 'disabled') {
      pay.hidden = true;
      pay.disabled = true;
      setState(`Total del carrito: ${formatClp(evaluation.amount)}. Confirma el pedido y te enviaremos un enlace de pago por el importe acordado.`);
    } else {
      pay.hidden = false;
      pay.disabled = false;
      label.textContent = `Pagar ${formatClp(evaluation.amount)} con Mercado Pago`;
      setState('Pagarás en Mercado Pago y luego volverás a este sitio.', 'ok');
    }
  }

  async function load() {
    pay.hidden = false;
    pay.disabled = true;
    label.textContent = 'Comprobando pago en línea…';
    setState('Consultando disponibilidad de pagos…');
    try {
      config = await fetchPaymentConfig(fetchImpl);
      render();
    } catch {
      pay.hidden = true;
      setState('No pudimos consultar la disponibilidad de pago. Puedes continuar con la cotización.', 'error');
    }
  }

  document.addEventListener('biodigital:cartchange', render);
  pay.addEventListener('click', async () => {
    const evaluation = evaluateCart(config, getItems());
    if (!evaluation.allowed) return;
    pay.disabled = true;
    pay.classList.add('busy');
    label.textContent = 'Preparando pago…';
    setState('Creando una orden segura…');
    try {
      const order = await createOrder({ items: evaluation.items, idempotencyKey: attempt.current(), fetchImpl });
      storeOrder(storage, order);
      setState('Orden lista. Abriendo Mercado Pago…', 'ok');
      navigate(order.checkout_url);
    } catch (error) {
      setState(error.message || 'No fue posible preparar el pago.', 'error');
      pay.disabled = false;
      label.textContent = 'Reintentar pago con Mercado Pago';
    } finally {
      pay.classList.remove('busy');
    }
  });
  load();
}

export function initPaymentReturn(root, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl || fetch;
  const storage = dependencies.storage || sessionStorage;
  const url = dependencies.url || new URL(location.href);
  const badge = root.querySelector('[data-return-badge]');
  const title = root.querySelector('[data-return-title]');
  const message = root.querySelector('[data-return-message]');
  const detail = root.querySelector('[data-return-detail]');
  const retry = root.querySelector('[data-return-retry]');
  const checkout = root.querySelector('[data-return-checkout]');

  async function verify() {
    retry.disabled = true;
    badge.textContent = 'Comprobando';
    title.textContent = 'Estamos comprobando tu orden';
    message.textContent = 'La URL de retorno no se usa como comprobante de pago.';
    detail.innerHTML = '';
    checkout.hidden = true;
    const stored = readStoredOrder(storage);
    const reference = url.searchParams.get('external_reference');
    if (!stored || (reference && reference !== stored.id)) {
      badge.textContent = 'Sin verificación';
      title.textContent = 'No pudimos recuperar la orden de forma segura';
      message.textContent = 'No afirmaremos que el pago fue aprobado. Contáctanos si completaste el pago y conservaremos la revisión pendiente.';
      retry.hidden = true;
      return;
    }
    try {
      const order = await getStoredOrder(stored, fetchImpl);
      detail.innerHTML = `<div><span>Orden</span><strong>${order.id.slice(0, 8)}…</strong></div><div><span>Total</span><strong>${formatClp(order.amount)}</strong></div>`;
      if (order.status === 'accredited' && order.payment_verified === true) {
        badge.textContent = 'Pago verificado';
        title.textContent = 'Tu pago está confirmado';
        message.textContent = 'El servidor confirmó el estado de la orden. Te contactaremos para coordinar el siguiente paso.';
      } else if (['rejected', 'cancelled', 'refunded', 'partially_refunded', 'charged_back'].includes(order.status)) {
        badge.textContent = 'No aprobado';
        title.textContent = ['refunded', 'partially_refunded'].includes(order.status)
          ? 'La orden registra un reembolso' : 'La orden no registra un pago aprobado';
        message.textContent = order.status === 'partially_refunded'
          ? 'El servidor confirmó un reembolso parcial. Contáctanos para revisar el detalle.'
          : order.status === 'refunded'
            ? 'El servidor confirmó que el pago fue reembolsado.'
            : 'Puedes volver al sitio o contactarnos para revisar otra forma de pago.';
      } else {
        badge.textContent = 'Comprobación pendiente';
        title.textContent = 'Todavía estamos comprobando el pago';
        message.textContent = 'La orden existe, pero el servidor aún no confirma un pago aprobado. No necesitas pagar nuevamente mientras la revisamos.';
        if (root.dataset.returnKind === 'error' && order.status === 'created' && isMercadoPagoUrl(order.checkout_url)) {
          checkout.href = order.checkout_url;
          checkout.hidden = false;
        }
      }
      retry.hidden = false;
    } catch (error) {
      badge.textContent = 'Sin verificación';
      title.textContent = 'No pudimos comprobar la orden ahora';
      message.textContent = error.message + ' Reintenta en unos momentos; la página no dará el pago por aprobado sin confirmación del servidor.';
      retry.hidden = false;
    } finally {
      retry.disabled = false;
    }
  }
  retry.addEventListener('click', verify);
  verify();
}

if (typeof document !== 'undefined') {
  const cartRoot = document.querySelector('[data-cart-checkout]');
  if (cartRoot) initCartCheckout(cartRoot);
  const returnRoot = document.querySelector('[data-payment-return]');
  if (returnRoot) initPaymentReturn(returnRoot);
}
