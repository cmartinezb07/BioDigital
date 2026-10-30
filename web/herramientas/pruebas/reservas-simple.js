// Reserva simple (ejemplos/reservas-simple/): la planilla manda sobre el catálogo, se ignoran las filas mal escritas, lo ocupado en el Google Calendar del
// dueño no se ofrece, varios servicios en una solicitud, se valida el formulario, el WhatsApp lleva la solicitud completa y el enlace del negocio agenda y confirma.
// Uso: node web/herramientas/revisar.mjs "http://localhost:4321/ejemplos/reservas-simple/" --anchos 390 --probar web/herramientas/pruebas/reservas-simple.js
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + JSON.stringify(extra) : ''); };
const esperar = async (fn, ms = 10000) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await dormir(200); } return null; };
const abrir = (qs) => new Promise((res) => { const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:99999'; f.src = location.pathname + qs; f.onload = () => res(f); document.body.appendChild(f); });

// ---- Salón (citas) ----
let f = await abrir('?negocio=salon'), w = f.contentWindow, d = f.contentDocument;
await esperar(() => w.Reservas && d.querySelector('[data-elige]'));
const R = w.Reservas, U = R.util, D = R.leer('salon');
const nombres = D.config.servicios.map((s) => s.nombre);
ok('1 el catálogo sale de la planilla: trae el servicio nuevo ("Corte de barba") y no la fila sin precio ("Alisado")', nombres.includes('Corte de barba') && !nombres.includes('Alisado') && D.config.servicios.find((s) => s.nombre === 'Corte y lavado').id === 'corte', nombres);
ok('1b el tipo de agenda no cambia desde la planilla (sigue siendo citas) y el horario del lunes viene con su pausa de almuerzo', D.config.modo === 'horas' && JSON.stringify(D.config.horario.lun) === '[["10:00","14:00"],["15:00","20:00"]]', D.config.horario.lun);
const f1 = U.sumaDias(U.hoy(), 1), f3 = U.sumaDias(U.hoy(), 3);
const hs = R.horas(D, { servicio: 'corte', fecha: f1 }).map((h) => h.hora), abiertoF1 = (D.config.horario[['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'][U.diaSem(f1)]] || []).length > 0;
ok('2 las horas ocupadas en el Google Calendar del dueño (11:00 a 12:00 y 16:00 a 17:30) no se ofrecen', !abiertoF1 || (!hs.includes('11:00') && !hs.includes('10:30') && !hs.includes('16:00') && !hs.includes('17:00')), hs);
ok('2b un día completo ocupado en el calendario no ofrece horas', R.horas(D, { servicio: 'corte', fecha: f3 }).length === 0);
// el recorrido completo
d.querySelector('[data-elige="corte"]').click(); d.querySelector('[data-elige="corte-de-barba"]').click(); await dormir(100);
const combo = R.servicio(R.leer('salon'), 'combo');
ok('2c se pueden pedir dos servicios juntos: se suman duración y precio (corte 45 + barba 30 = 75 min, $20.000)', combo && combo.duracion === 75 && combo.precio === 20000 && /Corte y lavado \+ Corte de barba/.test(combo.nombre), combo);
d.querySelector('[data-sig]').click(); await dormir(200);
let dia = null; for (let k = 2; k < 30 && !dia; k++) { const x = U.sumaDias(U.hoy(), k); if (k !== 3 && R.horas(R.leer('salon'), { servicio: 'combo', fecha: x }).length) dia = x; }
if (!d.querySelector('[data-f="' + dia + '"]')) { d.querySelector('[data-mes="1"]').click(); await dormir(150); }
d.querySelector('[data-f="' + dia + '"]').click(); await dormir(150);
d.querySelector('[data-min]').click(); d.querySelector('[data-sig]').click(); await dormir(150);
d.querySelector('[data-form] [type=submit]').click(); await dormir(150);
ok('3 sin nombre ni celular no avanza y marca los campos', d.querySelectorAll('.campo.mal').length >= 2 && !d.querySelector('[data-enviar]'));
d.querySelector('#s-nombre').value = 'Prueba Simple'; d.querySelector('#s-tel').value = '+56 9 1111 2222';
ok('3b el formulario dice que es una solicitud y que el negocio confirma', /Todavía no es una reserva/.test(d.querySelector('[data-form]').innerText));
d.querySelector('[data-form] [type=submit]').click(); await dormir(200);
const a = d.querySelector('[data-enviar]'), txt = a ? decodeURIComponent(a.href.split('text=')[1]) : '';
ok('4 el botón abre el WhatsApp del negocio con la solicitud completa (servicios, día, hora, total, nombre y celular)', a && a.href.startsWith('https://wa.me/56946941640?text=') && /Corte y lavado \+ Corte de barba/.test(txt) && /Total estimado: \$20\.000/.test(txt) && /Prueba Simple/.test(txt) && /\+56911112222/.test(txt), txt);
const enl = (/Para el negocio[^:]*: (\S+)/.exec(txt) || [])[1];
ok('4b y trae el enlace para que el negocio agende y confirme (los datos van después de #, no a un servidor)', enl && /\?negocio=salon#g=[A-Za-z0-9_-]+$/.test(enl), enl);
ok('4c la pantalla final avisa que no es una reserva confirmada', /no una reserva confirmada/.test(d.querySelector('[data-paso]').innerText));
f.remove();
// ---- Lo que ve el negocio al tocar ese enlace ----
f = await abrir(enl.slice(enl.indexOf('?'))); w = f.contentWindow; d = f.contentDocument;
await esperar(() => d.querySelector('h1') && /Solicitud para/.test(d.querySelector('h1').textContent));
const btns = [...d.querySelectorAll('a.btn')], gc = btns.find((b) => /Agendar/.test(b.textContent)), cf = btns.find((b) => /Confirmar a/.test(b.textContent));
const cfTxt = cf ? decodeURIComponent(cf.href.split('text=')[1]) : '';
ok('5 el negocio ve la solicitud y "Agendar" abre su Google Calendar con la cita ya escrita (75 min)', gc && gc.href.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE') && /Prueba%20Simple/.test(gc.href) && (() => { const m = /dates=(\d{8}T\d{6}Z)\/(\d{8}T\d{6}Z)/.exec(gc.href); const t = (x) => Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8), +x.slice(9, 11), +x.slice(11, 13)); return m && (t(m[2]) - t(m[1])) / 6e4 === 75; })(), gc && gc.href);
ok('5b "Confirmar" abre el WhatsApp del cliente con la confirmación, la dirección y su enlace para agregarlo al calendario', cf && cf.href.startsWith('https://wa.me/56911112222?text=') && /te confirmo/.test(cfTxt) && /calendar\.google\.com/.test(cfTxt) && /Av\. Ejemplo 789/.test(cfTxt), cfTxt);
ok('5c y puede avisar que no hay disponibilidad con un toque', btns.some((b) => /no hay disponibilidad/.test(b.textContent) && b.href.startsWith('https://wa.me/56911112222')));
f.remove();

// ---- Cabañas (noches) ----
f = await abrir('?negocio=cabanas'); w = f.contentWindow; d = f.contentDocument;
await esperar(() => w.Reservas && d.querySelector('[data-elige]'));
const R2 = w.Reservas, D2 = R2.leer('cabanas'), mot = (rec, x) => R2.mes(D2, { recurso: rec }, +x.slice(0, 4), +x.slice(5, 7) - 1)[x];
const f6 = U.sumaDias(U.hoy(), 6), f13 = U.sumaDias(U.hoy(), 13);
ok('6 la cabaña nueva de la planilla aparece', D2.config.recursos.some((x) => x.nombre === 'Cabaña Canelo'));
ok('6b una cabaña ocupada en su calendario sale "Ocupado"; las demás siguen libres esos días', mot('copihue', f6).estado === 'lleno' && /Ocupado/.test(mot('copihue', f6).motivo) && mot('araucaria', f6).estado !== 'lleno' && mot('araucaria', f6).estado !== 'bloqueado', [mot('copihue', f6), mot('araucaria', f6)]);
ok('6c un evento del negocio sin cabaña (mantención) ocupa todas', mot('araucaria', f13).estado === 'lleno' && mot('cabana-canelo', f13).estado === 'lleno');
ok('6d no se puede pedir una estadía que cruza una noche ocupada', !!R2.validar(D2, { recurso: 'copihue', llegada: U.sumaDias(U.hoy(), 4), salida: U.sumaDias(U.hoy(), 7), personas: 2 }));
const pr = R2.precio(D2, { recurso: 'araucaria', llegada: U.sumaDias(U.hoy(), 40), salida: U.sumaDias(U.hoy(), 42), personas: 2 });
ok('7 el total estimado usa la planilla (Araucaria $65.000 la noche, con fin de semana y temporada)', pr.total >= 130000 && pr.deposito === 0, pr);
f.remove();
return r;
