// Guion de prueba de Barbería El Filo (estructura DBC): entrada, menú, pestañas y reservar desde un servicio.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
await dormir(3000);
ok('1 la entrada se quita sola', $('[data-intro]').classList.contains('listo'));
$('[data-menu-btn]').click(); await dormir(800);
ok('2 el menú abre', !$('[data-menu]').hidden && $('[data-menu]').classList.contains('abierto'));
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await dormir(800);
ok('2b Esc lo cierra', $('[data-menu]').hidden);
$('#b-barba').click(); await dormir(200);
ok('3 la pestaña Barba muestra sus filas', !$('#tab-barba').hidden && $('#tab-corte').hidden);
$('#b-corte').click(); await dormir(200);
$('[data-reservar="Fade"]').click(); await dormir(1800);
r.paso = (($('#reserva-modulo .res-vivo') || {}).textContent || '').slice(0, 60);
ok('4 reservar Fade avanza el módulo', /paso 2/i.test(r.paso), r.paso);
return r;
