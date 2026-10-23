// Guion de prueba de Cabañas Los Copihues (con --movimiento para probar las escenas que avanzan con el scroll).
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const ir = async (el, k) => { const top = el.getBoundingClientRect().top + scrollY; scrollTo(0, top + (el.offsetHeight - innerHeight) * k); await dormir(500); };
// 1. Día / noche
$('[data-modo-btn]').click(); await dormir(200);
ok('1 el botón pasa a noche', document.documentElement.dataset.modo === 'noche');
$('[data-modo-btn]').click(); await dormir(200);
ok('1b y vuelve a día', document.documentElement.dataset.modo === 'dia');
// 2. Menú
$('[data-menu-btn]').click(); await dormir(900);
ok('2 el menú abre', $('[data-menu]').classList.contains('abierto') && !$('[data-menu]').hidden);
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await dormir(900);
ok('2b Esc lo cierra', $('[data-menu]').hidden);
// 3. La llegada: la ventana se abre al bajar
const ll = $('[data-llegada]');
await ir(ll, 0.05); const c1 = +getComputedStyle($('.llegada-fija')).getPropertyValue('--c');
await ir(ll, 0.9); const c2 = +getComputedStyle($('.llegada-fija')).getPropertyValue('--c');
ok('3 la ventana se abre (c baja de ~1 a 0)', c1 > 0.8 && c2 < 0.05, c1 + ' → ' + c2);
// 4. Adentro: cambia de cabaña al bajar
const ad = $('[data-adentro]');
await ir(ad, 0.1); const a = $('[data-cuarto].activo').dataset.cuarto;
await ir(ad, 0.9); const b = $('[data-cuarto].activo').dataset.cuarto;
ok('4 al bajar pasa de la primera a la última cabaña', a === '0' && b === '2', a + ' → ' + b);
ok('4b la pestaña acompaña', $('[data-ir="2"]').getAttribute('aria-selected') === 'true');
// 5. Reservar esta cabaña deja elegida la Canelo
$('[data-reservar-activo]').click(); await dormir(1700);
r.paso = (($('#reserva-modulo .res-vivo') || {}).textContent || '').slice(0, 60);
ok('5 el módulo avanzó con la cabaña elegida', /paso 2/i.test(r.paso), r.paso);
return r;
