import { readFileSync } from 'node:fs';
import { CATALOG } from '../functions/_lib/catalog.js';
import { PAYMENT_LINKS, fixedPaymentUrl } from '../web/propuesta/fuentes/enlaces-pago.mjs';

const requireReady = process.argv.includes('--exigir-completos');
const errors = [];
const pending = [];
const seen = new Map();
const rows = [];
for (const product of Object.values(CATALOG)) {
  const link = PAYMENT_LINKS[product.sku];
  const amount = product.purposes.full.amount;
  if (!link || link.amount !== amount) errors.push(`${product.sku}: configuración y catálogo no coinciden.`);
  if (product.quoteOnly) {
    if (link?.url) errors.push(`${product.sku}: requiere cotización; no debe tener un enlace genérico de cobro.`);
    rows.push({ producto: product.title, importe: amount ?? 'A cotizar', estado: 'Cotización previa' });
    continue;
  }
  const url = fixedPaymentUrl(link, amount);
  if (!link?.url) pending.push(`${product.title}: $${amount.toLocaleString('es-CL')} CLP`);
  else if (!url) errors.push(`${product.sku}: enlace inválido, importe incorrecto o enlace de ensayo.`);
  if (url && seen.has(url)) errors.push(`${product.sku}: comparte el enlace con ${seen.get(url)}; crear uno por producto.`);
  if (url) seen.set(url, product.sku);
  rows.push({ producto: product.title, importe: amount, estado: url ? 'Configurado; verificar en Mercado Pago' : 'Falta enlace fijo' });
}
for (const sku of Object.keys(PAYMENT_LINKS)) {
  if (!CATALOG[sku]) errors.push(`${sku}: no existe en el catálogo comercial.`);
}

const html = readFileSync(new URL('../web/propuesta/index.html', import.meta.url), 'utf8');
const embedded = html.match(/<script type="application\/json" id="catalogo">([\s\S]*?)<\/script>/);
const products = embedded ? JSON.parse(embedded[1]) : [];
if (products.length !== Object.keys(CATALOG).length || new Set(products.map((p) => p.id)).size !== products.length) {
  errors.push('El catálogo generado no contiene exactamente todos los productos comerciales.');
}
for (const product of products) {
  const expected = CATALOG[product.id];
  if (!expected || product.precio !== expected.purposes.full.amount || product.desde !== expected.quoteOnly) {
    // El extra a cotizar no usa la etiqueta "desde" en el frontend.
    if (!(expected?.quoteOnly && product.precio === null && product.id === 'interactive-menu-ar')) {
      errors.push(`${product.id}: precio o condición de cotización incoherente en la página.`);
    }
  }
}
for (const name of ['index.html', 'fuentes/config.mjs', 'fuentes/pagos.mjs', 'fuentes/enlaces-pago.mjs']) {
  const text = readFileSync(new URL('../web/propuesta/' + name, import.meta.url), 'utf8');
  if (/payment-test-100|https:\/\/mpago\.la\/2JmNHED|t-payment-test/.test(text)) errors.push(`${name}: contiene la prueba de $100.`);
}
console.table(rows);
if (pending.length) console.log(`\nFaltan ${pending.length} enlaces de monto fijo:\n- ${pending.join('\n- ')}`);
if (errors.length) console.error(`\nErrores:\n- ${errors.join('\n- ')}`);
if (errors.length || (requireReady && pending.length)) process.exitCode = 1;
else console.log('\nConfiguración coherente. La comprobación local no valida el monto externo ni garantiza la aprobación de pagos.');
