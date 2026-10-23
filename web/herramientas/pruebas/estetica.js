// Guion de prueba de Centro Aurora (se pasa con --probar). Cuerpo de una función async con $, $$ y dormir(ms).
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const visibles = () => $$('.trat').filter((t) => !t.classList.contains('fuera')).length;

// 1. Filtros de tratamientos
ok('1 al inicio se ven los 8 tratamientos', visibles() === 8, String(visibles()));
$('[data-filtro="masaje"]').click(); await dormir(500);
ok('1b "Masajes" deja 3', visibles() === 3, String(visibles()));
$('[data-filtro="todos"]').click(); await dormir(300);

// 2. Agenda de la semana
const dias = $$('[data-dias] button');
ok('2 la agenda muestra 7 días', dias.length === 7);
const abiertos = dias.filter((b) => !b.disabled);
if (abiertos.length > 1) { abiertos[1].click(); await dormir(400); }
ok('2b hay un día elegido y la marca se mueve con él', !!$('[data-dias] [aria-selected="true"]') && parseFloat($('.dias-marca').style.width) > 20);
const filas = $$('[data-horas] tr');
ok('2c el día elegido tiene filas', filas.length > 0, String(filas.length));
$('[data-semana="1"]').click(); await dormir(300);
ok('2d se puede pasar a la semana siguiente', !$('[data-semana="-1"]').disabled);

// 3. Reservar desde un tratamiento deja ese servicio elegido en el módulo
$$('.trat button')[5].click(); await dormir(1600);
const paso = ($('#reserva-modulo .res-vivo') || {}).textContent || '';
const elegido = $$('#reserva-modulo .res-op[aria-pressed="true"], #reserva-modulo .res-op.sel, #reserva-modulo [aria-checked="true"]').map((e) => e.textContent.trim().slice(0, 30));
r.paso = paso.slice(0, 80);
ok('3 el módulo avanzó tras elegir "Masaje relajante"', /d[ií]a|paso 2/i.test(paso) || elegido.some((t) => t.indexOf('Masaje relajante') === 0), paso.slice(0, 60));
return r;
