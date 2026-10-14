import { getMercadoPagoOrder, MercadoPagoError } from './mercadopago.js';

const TRANSITIONS = Object.freeze({
  created: ['pending_creation', 'creating', 'created', 'creation_failed'],
  pending: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled'],
  accredited: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled', 'accredited'],
  rejected: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected'],
  cancelled: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled'],
  partially_refunded: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled', 'accredited', 'partially_refunded'],
  refunded: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled', 'accredited', 'partially_refunded', 'refunded', 'charged_back'],
  charged_back: ['pending_creation', 'creating', 'created', 'creation_failed', 'pending', 'rejected', 'cancelled', 'accredited', 'partially_refunded', 'charged_back']
});

export class PaymentVerificationError extends Error {
  constructor(code, retryable = false) {
    super(code);
    this.name = 'PaymentVerificationError';
    this.code = code;
    this.retryable = retryable;
  }
}

function clpAmount(value) {
  if (typeof value === 'number') value = String(value);
  if (typeof value !== 'string' || !/^\d+(?:\.0+)?$/.test(value)) return null;
  const integer = Number(value.split('.')[0]);
  return Number.isSafeInteger(integer) ? integer : null;
}

function stateFor(status, detail) {
  if (status === 'created' && detail === 'created') return 'created';
  if (status === 'processed' && detail === 'accredited') return 'accredited';
  if (detail === 'partially_refunded') return 'partially_refunded';
  if (status === 'refunded' || detail === 'refunded') return 'refunded';
  if (status === 'failed') return 'rejected';
  if (status === 'canceled' || status === 'expired') return 'cancelled';
  if (status === 'charged_back') return 'charged_back';
  if (['processing', 'action_required'].includes(status)) return 'pending';
  return null;
}

function sumAmounts(entries, predicate, field = 'paid_amount') {
  if (!Array.isArray(entries)) return null;
  let total = 0;
  for (const entry of entries) {
    if (!predicate(entry)) continue;
    const amount = clpAmount(entry?.[field] ?? entry?.amount);
    if (amount === null) return null;
    total += amount;
    if (!Number.isSafeInteger(total)) return null;
  }
  return total;
}

function equalConfigured(actual, expected) {
  return expected !== undefined && expected !== null && String(actual) === String(expected);
}

export function verifyMercadoPagoOrder(remote, local, env) {
  if (!remote || typeof remote !== 'object') throw new PaymentVerificationError('mp_invalid_response', true);
  if (remote.id !== local.mp_order_id || remote.external_reference !== local.external_reference) {
    throw new PaymentVerificationError('order_identity_mismatch');
  }
  if (remote.type !== 'online' || remote.processing_mode !== 'manual') {
    throw new PaymentVerificationError('order_contract_mismatch');
  }
  if (!equalConfigured(remote.user_id, env.MP_USER_ID)) {
    throw new PaymentVerificationError('recipient_mismatch');
  }
  if (!equalConfigured(remote.integration_data?.application_id, env.MP_APPLICATION_ID)) {
    throw new PaymentVerificationError('application_mismatch');
  }
  if (remote.country_code !== (env.MP_COUNTRY_CODE || 'CHL')) {
    throw new PaymentVerificationError('environment_mismatch');
  }
  if (remote.currency !== 'CLP' || local.currency !== 'CLP') {
    throw new PaymentVerificationError('currency_mismatch');
  }
  const total = clpAmount(remote.total_amount);
  const totalPaid = clpAmount(remote.total_paid_amount);
  if (total !== local.amount || totalPaid === null || totalPaid < 0 || totalPaid > local.amount) {
    throw new PaymentVerificationError('amount_mismatch');
  }

  const state = stateFor(remote.status, remote.status_detail);
  if (!state) throw new PaymentVerificationError('unsupported_payment_status');
  const payments = remote.transactions?.payments;
  const refunds = remote.transactions?.refunds;
  const credited = sumAmounts(payments, (payment) => payment?.status === 'processed' && payment?.status_detail === 'accredited');
  const refunded = sumAmounts(refunds, (refund) => refund?.status === 'processed', 'amount');

  if (state === 'accredited' && (totalPaid !== local.amount || credited !== local.amount || (refunded ?? 0) !== 0)) {
    throw new PaymentVerificationError('accreditation_mismatch');
  }
  if (state === 'partially_refunded' && (
    totalPaid !== local.amount || credited !== local.amount || refunded === null || refunded <= 0 || refunded >= local.amount
  )) throw new PaymentVerificationError('refund_mismatch');
  if (state === 'refunded' && (
    credited !== local.amount || refunded === null || refunded < local.amount
  )) throw new PaymentVerificationError('refund_mismatch');

  const lastUpdated = new Date(remote.last_updated_date);
  if (!remote.last_updated_date || Number.isNaN(lastUpdated.valueOf())) {
    throw new PaymentVerificationError('mp_invalid_response', true);
  }
  return {
    state,
    mpStatus: remote.status,
    statusDetail: remote.status_detail,
    netPaidAmount: Math.max(0, totalPaid - (refunded ?? 0)),
    lastUpdatedAt: lastUpdated.toISOString(),
    allowedFrom: TRANSITIONS[state]
  };
}

export async function reconcileOrder({ order, env, repo, event, fetchImpl = fetch, now = () => new Date() }) {
  let remote;
  try {
    remote = await getMercadoPagoOrder({ orderId: order.mp_order_id, accessToken: env.MP_ACCESS_TOKEN, fetchImpl });
  } catch (error) {
    if (error instanceof MercadoPagoError) throw new PaymentVerificationError(error.code, true);
    throw error;
  }
  const verification = verifyMercadoPagoOrder(remote, order, env);
  const timestamp = now().toISOString();
  const applied = await repo.applyVerification(order, event, verification, timestamp);
  return { verification, applied };
}
