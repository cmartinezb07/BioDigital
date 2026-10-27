const entries = [
  ['web', 'Página web', 49990, true],
  ['social-video', 'Video para redes', 9990, true],
  ['interactive-menu', 'Menú digital', 27990, true],
  ['photography', 'Registro fotográfico', 4990, false],
  ['reservations', 'Sistema de reservas', 24990, true],
  ['loyalty-card', 'Tarjeta de fidelización', 9990, false],
  ['interactive-menu-pro', 'Menú digital PRO', 99990, false],
  ['reservations-pro', 'Sistema de reservas PRO', 99990, false],
  ['full-pack', 'Pack esencial', 79990, false],
  ['launch-pack', 'Pack esencial — lanzamiento', 69990, false],
  ['pro-pack', 'Pack PRO', 150000, false],
  ['launch-pro-pack', 'Pack PRO — lanzamiento', 120000, false],
  ['launch-web', 'Página web — lanzamiento', 39990, true],
  ['launch-interactive-menu-pro', 'Menú digital PRO — lanzamiento', 79990, false],
  ['launch-reservations-pro', 'Sistema de reservas PRO — lanzamiento', 79990, false],
  ['web-video', 'Página web + video (relámpago)', 52990, true],
  ['social-video-2', '2 videos para redes', 17990, false],
  ['social-video-3', '3 videos para redes', 24990, false],
  ['launch-loyalty-card', 'Tarjeta de fidelización — lanzamiento', 7990, false],
  ['menu-photography', 'Menú digital PRO + fotos (relámpago)', 89990, false],
  ['reservations-loyalty', 'Sistema de reservas PRO + fidelización (relámpago)', 94990, false]
];

export const CURRENCY = 'CLP';
export const PAYMENT_PURPOSES = Object.freeze(['full', 'deposit', 'balance']);

export const CATALOG = Object.freeze(Object.fromEntries(entries.map(([sku, title, amount, quoteOnly]) => [
  sku,
  Object.freeze({
    sku,
    title,
    currency: CURRENCY,
    quoteOnly,
    enabled: false,
    purposes: Object.freeze({
      full: Object.freeze({ amount, enabled: false }),
      deposit: Object.freeze({ amount: null, enabled: false }),
      balance: Object.freeze({ amount: null, enabled: false })
    })
  })
])));

export function resolveCatalogPayment(catalog, sku, purpose) {
  return resolveCartPayment(catalog, [sku], purpose);
}

export function resolveCartPayment(catalog, skus, purpose = 'full') {
  if (!Array.isArray(skus) || skus.length < 1 || skus.length > 20) {
    return { error: 'invalid_items' };
  }
  if (new Set(skus).size !== skus.length) return { error: 'duplicate_item' };
  if (!PAYMENT_PURPOSES.includes(purpose)) return { error: 'invalid_purpose' };

  const items = [];
  for (const sku of [...skus].sort()) {
    if (typeof sku !== 'string' || !/^[a-z0-9-]{2,64}$/.test(sku)) {
      return { error: 'invalid_sku' };
    }
    const product = catalog[sku];
    if (!product) return { error: 'invalid_sku' };
    if (product.quoteOnly) return { error: 'quote_required' };
    if (product.currency !== CURRENCY) return { error: 'invalid_catalog_currency' };

    const option = product.purposes?.[purpose];
    if (!product.enabled || !option?.enabled) return { error: 'product_disabled' };
    if (!Number.isSafeInteger(option.amount) || option.amount <= 0) {
      return { error: 'invalid_catalog_amount' };
    }
    items.push(Object.freeze({
      sku: product.sku,
      title: product.title,
      amount: option.amount,
      currency: product.currency,
      quantity: 1
    }));
  }

  const amount = items.reduce((sum, item) => sum + item.amount, 0);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return { error: 'invalid_catalog_amount' };
  }
  return {
    value: Object.freeze({
      sku: items.length === 1 ? items[0].sku : 'cart',
      title: items.length === 1 ? items[0].title : `Pedido Bío Digital (${items.length} servicios)`,
      amount,
      currency: CURRENCY,
      purpose,
      items: Object.freeze(items)
    })
  };
}
