import { handleGetOrder } from '../../_lib/order-service.js';
import { apiError } from '../../_lib/http.js';

export async function onRequestGet(context) {
  try {
    return await handleGetOrder({
      request: context.request,
      env: context.env,
      id: context.params.id
    });
  } catch {
    return apiError('service_unavailable', 503, 'El servicio de órdenes no está disponible.');
  }
}
