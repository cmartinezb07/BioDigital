import { apiError } from '../../_lib/http.js';
import { handleMercadoPagoWebhook } from '../../_lib/webhook-service.js';

export async function onRequestPost(context) {
  try {
    return await handleMercadoPagoWebhook({ request: context.request, env: context.env });
  } catch {
    return apiError('service_unavailable', 503, 'El webhook no está disponible.');
  }
}
