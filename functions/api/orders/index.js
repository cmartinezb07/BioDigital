import { handleCreateOrder } from '../../_lib/order-service.js';
import { apiError } from '../../_lib/http.js';

export async function onRequestPost(context) {
  try {
    return await handleCreateOrder({ request: context.request, env: context.env });
  } catch {
    return apiError('service_unavailable', 503, 'El servicio de órdenes no está disponible.');
  }
}
