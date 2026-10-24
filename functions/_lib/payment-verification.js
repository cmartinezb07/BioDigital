import {
  getMercadoPagoPayment, getMercadoPagoMerchantOrder,
  searchMercadoPagoMerchantOrder, MercadoPagoError
} from './mercadopago.js';

const OPEN = ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled'];
const TRANSITIONS = Object.freeze({
  created: OPEN, pending: OPEN, rejected: OPEN, cancelled: OPEN,
  accredited: [...OPEN, 'accredited'],
  partially_refunded: [...OPEN, 'accredited', 'partially_refunded'],
  refunded: [...OPEN, 'accredited', 'partially_refunded', 'refunded', 'charged_back'],
  charged_back: [...OPEN, 'accredited', 'partially_refunded', 'charged_back']
});

export class PaymentVerificationError extends Error {
  constructor(code, retryable = false) {
    super(code); this.name = 'PaymentVerificationError'; this.code = code; this.retryable = retryable;
  }
}

function amount(value) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new PaymentVerificationError('amount_mismatch');
  }
  return value;
}

function configured(actual, expected) {
  return expected !== undefined && expected !== null && String(actual) === String(expected);
}

// La orden comercial enlaza la preferencia del servidor con TODOS sus pagos.
// Nunca se acredita por parámetros de retorno ni por el contenido del webhook.
export function verifyMercadoPagoOrder(remote, payments, local, env) {
  if (!remote || !/^[1-9]\d*$/.test(String(remote.id)) ||
      (local.mp_order_id && String(remote.id) !== local.mp_order_id) ||
      remote.external_reference !== local.external_reference ||
      remote.preference_id !== local.mp_preference_id) {
    throw new PaymentVerificationError('order_identity_mismatch');
  }
  if (!configured(remote.collector?.id, env.MP_USER_ID)) throw new PaymentVerificationError('recipient_mismatch');
  if (!configured(remote.client_id, env.MP_APPLICATION_ID)) throw new PaymentVerificationError('application_mismatch');
  if (remote.site_id !== 'MLC') throw new PaymentVerificationError('environment_mismatch');
  if (local.currency !== 'CLP' || amount(remote.total_amount) !== local.amount) throw new PaymentVerificationError('amount_mismatch');
  if (!Array.isArray(remote.payments) || remote.payments.length !== payments.length ||
      new Set(remote.payments.map((p) => String(p.id))).size !== payments.length) {
    throw new PaymentVerificationError('payment_set_mismatch', true);
  }
  let credited = 0, refunded = 0, pending = false, rejected = false, cancelled = false, chargedBack = false;
  const dates = [Date.parse(remote.last_updated)];
  for (const payment of payments) {
    if (!remote.payments.some((entry) => String(entry.id) === String(payment.id)) ||
        payment.external_reference !== local.external_reference ||
        String(payment.order?.id) !== String(remote.id) || payment.order?.type !== 'mercadopago') {
      throw new PaymentVerificationError('payment_identity_mismatch');
    }
    if (!configured(payment.collector_id, env.MP_USER_ID)) throw new PaymentVerificationError('recipient_mismatch');
    if (payment.live_mode !== (env.MP_LIVE_MODE === 'true')) throw new PaymentVerificationError('environment_mismatch');
    if (payment.currency_id !== 'CLP') throw new PaymentVerificationError('currency_mismatch');
    const total = amount(payment.transaction_amount);
    const refund = amount(payment.transaction_amount_refunded);
    if (!total || total > local.amount || refund > total) throw new PaymentVerificationError('amount_mismatch');
    dates.push(Date.parse(payment.date_last_updated));
    switch (payment.status) {
      case 'approved':
        if (payment.status_detail !== 'accredited') throw new PaymentVerificationError('accreditation_mismatch');
        credited += total; refunded += refund; break;
      case 'refunded':
        if (refund !== total) throw new PaymentVerificationError('refund_mismatch');
        credited += total; refunded += refund; break;
      case 'charged_back': chargedBack = true; break;
      case 'pending': case 'in_process': case 'authorized': case 'in_mediation': pending = true; break;
      case 'rejected': rejected = true; break;
      case 'cancelled': cancelled = true; break;
      default: throw new PaymentVerificationError('unsupported_payment_status');
    }
  }
  if (dates.some((date) => !Number.isFinite(date))) throw new PaymentVerificationError('mp_invalid_response', true);
  if (credited > local.amount || refunded > credited) throw new PaymentVerificationError('overpayment_requires_review');
  let state = 'created';
  if (chargedBack) state = 'charged_back';
  else if (credited === local.amount && refunded === credited) state = 'refunded';
  else if (credited === local.amount && refunded > 0) state = 'partially_refunded';
  else if (credited === local.amount) state = 'accredited';
  else if (credited > 0 || pending) state = 'pending';
  else if (rejected) state = 'rejected';
  else if (cancelled) state = 'cancelled';
  return {
    state, mpStatus: remote.status, statusDetail: state,
    merchantOrderId: String(remote.id), netPaidAmount: chargedBack ? 0 : credited - refunded,
    lastUpdatedAt: new Date(Math.max(...dates)).toISOString(), allowedFrom: TRANSITIONS[state]
  };
}

export async function reconcileOrder({ order, env, repo, event, payment, fetchImpl = fetch, now = () => new Date() }) {
  try {
    let merchant;
    if (payment) {
      merchant = await getMercadoPagoMerchantOrder({ orderId: payment.order?.id, env, fetchImpl });
    } else if (order.mp_order_id) {
      merchant = await getMercadoPagoMerchantOrder({ orderId: order.mp_order_id, env, fetchImpl });
    } else {
      const found = await searchMercadoPagoMerchantOrder({ order, env, fetchImpl });
      if (!found) throw new PaymentVerificationError('payment_not_found', true);
      merchant = await getMercadoPagoMerchantOrder({ orderId: found.id, env, fetchImpl });
    }
    if (!Array.isArray(merchant.payments) || merchant.payments.length > 20) {
      throw new PaymentVerificationError('payment_set_mismatch', true);
    }
    // También valida la pertenencia del pago que originó la notificación.
    if (payment && !merchant.payments.some((p) => String(p.id) === String(payment.id))) {
      throw new PaymentVerificationError('payment_identity_mismatch');
    }
    const payments = await Promise.all(merchant.payments.map((entry) =>
      getMercadoPagoPayment({ paymentId: entry.id, env, fetchImpl })
    ));
    const verification = verifyMercadoPagoOrder(merchant, payments, order, env);
    const applied = await repo.applyVerification(order, event, verification, now().toISOString());
    return { verification, applied };
  } catch (error) {
    if (error instanceof MercadoPagoError) throw new PaymentVerificationError(error.code, true);
    throw error;
  }
}
