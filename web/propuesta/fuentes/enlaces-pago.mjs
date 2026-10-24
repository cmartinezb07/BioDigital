// Enlaces PUBLICOS de monto fijo, uno por producto/promocion.
// Completar url con el enlace generado en la cuenta comercial y verificar
// monto, receptor y nombre antes de publicarlo. Vacio conserva la solicitud.
// Los servicios "desde" siguen requiriendo cotizacion aunque se agregue URL.
export const PAYMENT_LINKS = Object.freeze({
  'web': { amount: 49990, url: '' },
  'social-video': { amount: 9990, url: '' },
  'interactive-menu': { amount: 27990, url: '' },
  'photography': { amount: 4990, url: 'https://mpago.la/2WXuyew' },
  'reservations': { amount: 24990, url: '' },
  'loyalty-card': { amount: 9990, url: 'https://mpago.la/1YgPBi2' },
  'full-pack': { amount: 79990, url: 'https://mpago.la/1VSZrje' },
  'launch-pack': { amount: 69990, url: 'https://mpago.la/1V8qXPv' },
  'social-video-2': { amount: 17990, url: 'https://mpago.la/326EtXb' },
  'social-video-3': { amount: 24990, url: 'https://mpago.la/2qcCph5' },
  'launch-loyalty-card': { amount: 7990, url: 'https://mpago.la/12kjBMo' },
  'menu-photography': { amount: 29990, url: 'https://mpago.la/16Sz4uM' },
  'reservations-loyalty': { amount: 29990, url: 'https://mpago.la/287sNEn' }
});

export function fixedPaymentUrl(link, amount) {
  if (!link || link.amount !== amount || !Number.isSafeInteger(amount) || amount <= 0) return null;
  try {
    const url = new URL(link.url);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash ||
        !['mpago.la', 'www.mercadopago.cl', 'mercadopago.cl'].includes(url.hostname)) return null;
    // No reutilizar el enlace del ensayo de $100 para otros importes.
    if (url.hostname === 'mpago.la' && /^\/2JmNHED\/?$/.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
