import { CATALOG, CURRENCY, PAYMENT_PURPOSES } from './catalog.js';
import { json } from './http.js';

export function handlePaymentConfig({ env, catalog = CATALOG }) {
  const globallyEnabled = env.PAYMENTS_ENABLED === 'true';
  return json({
    payments_enabled: globallyEnabled,
    currency: CURRENCY,
    products: Object.values(catalog).map((product) => ({
      sku: product.sku,
      title: product.title,
      quote_only: product.quoteOnly === true,
      enabled: globallyEnabled && product.enabled === true,
      purposes: Object.fromEntries(PAYMENT_PURPOSES.map((purpose) => [purpose, {
        amount: product.purposes?.[purpose]?.amount ?? null,
        enabled: globallyEnabled && product.enabled === true && product.purposes?.[purpose]?.enabled === true
      }]))
    }))
  });
}
