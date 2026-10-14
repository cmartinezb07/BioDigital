import { handlePaymentConfig } from '../../_lib/payment-config.js';
import { apiError } from '../../_lib/http.js';

export function onRequestGet(context) {
  try {
    return handlePaymentConfig({ env: context.env });
  } catch {
    return apiError('service_unavailable', 503, 'La disponibilidad de pagos no se pudo consultar.');
  }
}
