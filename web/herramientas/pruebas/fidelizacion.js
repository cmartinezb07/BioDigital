// Guion de prueba de la tarjeta de fidelización con QR: alta, QR, sellos, protección contra sellos repetidos y canje.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
localStorage.removeItem('bdfid-v2'); localStorage.removeItem('bdfid-mi'); location.hash = '';
const F = window.Fidelizacion; F.desconectar();   // el cliente y la caja en la nube se prueban en nube-e2e.mjs
// Recargar la vista del cliente sin tarjeta
document.dispatchEvent(new Event('x'));
const app = document.getElementById('app');
const form = app.querySelector('[data-alta]') || (await (async () => { localStorage.removeItem('bdfid-mi'); return null; })());
if (form) {
  form.requestSubmit(); await dormir(100);
  ok('1 sin nombre no crea la tarjeta', /nombre/i.test(form.querySelector('.err').textContent));
  form.querySelector('#f-nom').value = 'Prueba'; form.querySelector('#f-ok').checked = true; form.requestSubmit(); await dormir(400);
}
const cod = localStorage.getItem('bdfid-mi');
ok('2 crea la tarjeta con su QR', !!cod && !!app.querySelector('[data-qr] img, [data-qr] canvas'), cod);
const s1 = F.sellar(cod);
ok('3 suma un sello', s1.tarjeta && s1.tarjeta.sellos === 1);
const s2 = F.sellar(cod);
ok('4 bloquea un segundo sello inmediato', !!s2.error);
const d = F.leer(); d.tarjetas[0].sellos = F.PROGRAMA.sellos; localStorage.setItem('bdfid-v2', JSON.stringify(d));
const c = F.canjear(cod);
ok('5 canjea el premio y la tarjeta parte de nuevo', c.tarjeta && c.tarjeta.sellos === 0 && c.tarjeta.premios === 1);
await dormir(300);
ok('6 la tarjeta en pantalla muestra los sellos', app.querySelectorAll('.sellos i').length === F.PROGRAMA.sellos);
localStorage.removeItem('bdfid-v2'); localStorage.removeItem('bdfid-mi');
return r;
