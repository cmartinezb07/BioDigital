// Pantallas de reservas del cliente, de punta a punta y conectadas a la base: elegir → fechas → datos con validación → reserva real → "Mis reservas" →
// gestión → modificar la MISMA reserva → cancelar con la devolución. Usa páginas reales dentro de un iframe (así prueba lo que ve la persona).
// Corre sobre /ejemplos/reservas/?negocio=cabanas (o el de un cliente); N, DUENO se sacan de la configuración de la página.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)) : ''); };
const esperar = async (fn, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await dormir(250); } return null; };
const A = window.AGENDA, N = A.negocio, DUENO = (A.pistas.find((p) => /jefe|due/i.test(p.rol)) || {}).pin;
const R = Reservas, U = R.util, AG = new URLSearchParams(location.search).get('negocio') || R.NEGOCIOS[0].id;
const extra = new URLSearchParams(location.search).get('nube') ? '&nube=' + new URLSearchParams(location.search).get('nube') : '';
const limpiar = async () => { await Nube.borrar(N, 'reservas', DUENO, { filtro: { cliente: { nombre: 'zz-ui' } } }); };
await limpiar();
Nube.pin(N, null);
const abrir = (qs) => new Promise((res) => { const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:99999'; f.src = location.pathname + '?negocio=' + AG + extra + qs; f.onload = () => res(f); document.body.appendChild(f); });
const set = (d, id, v) => { const e = d.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };

// ---- 1. El asistente ----
let f = await abrir(''), d = f.contentDocument, w = f.contentWindow;
await esperar(() => d.querySelector('.opcion'));
const opciones = [...d.querySelectorAll('.opcion')];
ok('1 el catálogo se ve en pantalla con sus precios', opciones.length >= 1 && opciones.every((o) => /\$\d/.test(o.textContent)), opciones.length);
// Una opción con una sola unidad (así probamos que no se vende dos veces)
const cfg = R.leer(AG).config, uno = cfg.recursos.find((x) => (x.unidades || 1) === 1) || cfg.recursos[0];
d.querySelector('[data-recurso="' + uno.id + '"]').click(); await dormir(200);
d.querySelector('[data-sig]').click(); await dormir(300);
let llegada = null, salida = null;
for (let k = 55; k < 140 && !llegada; k++) { const a = U.sumaDias(U.hoy(), k), b = U.sumaDias(a, 2); if (!R.validar(R.leer(AG), { recurso: uno.id, llegada: a, salida: b, personas: 2 })) { llegada = a; salida = b; } }
const irA = async (fecha) => { for (let i = 0; i < 8 && !d.querySelector('[data-f="' + fecha + '"]'); i++) { d.querySelector('[data-mes="1"]').click(); await dormir(150); } d.querySelector('[data-f="' + fecha + '"]').click(); await dormir(250); };
await irA(llegada); await irA(salida); await dormir(1200);
const total = d.querySelector('.resumen-lat .total span:last-child');
ok('2 elegidas las fechas, el resumen muestra el precio del servidor', !!total && /\$\d/.test(total.textContent), d.querySelector('.resumen-lat').innerText.slice(0, 80));
d.querySelector('[data-sig]').click(); await dormir(300);

// ---- 2. Validación visible de campos ----
d.querySelector('[data-form] button[type=submit]').click(); await dormir(300);
const malos = [...d.querySelectorAll('.campo.mal')];
ok('3 enviar vacío marca en rojo los campos con su mensaje y lleva el foco al primero', malos.length === 4 && malos.every((c) => c.querySelector('.campo-err').textContent.length > 8) && d.activeElement.id === 'r-nombre', [malos.length, d.activeElement.id]);
set(d, 'r-nombre', 'zz-ui Prueba'); set(d, 'r-correo', 'mal'); set(d, 'r-tel', '+56 9 8765 4321'); d.getElementById('r-acepto').checked = true;
d.querySelector('[data-form] button[type=submit]').click(); await dormir(300);
ok('3b un correo mal escrito se marca solo a él, y al corregirlo el error desaparece', d.querySelectorAll('.campo.mal').length === 1 && d.getElementById('r-correo').getAttribute('aria-invalid') === 'true');
set(d, 'r-correo', 'ui@prueba.cl'); await dormir(100);
ok('3c ya sin errores', d.querySelectorAll('.campo.mal').length === 0);

// ---- 3. La reserva real ----
d.querySelector('[data-form] button[type=submit]').click();
await esperar(() => d.querySelector('[data-reloj]') || d.querySelector('.ok-hero'), 12000);
const mias = w.Reservas.mias(AG), rid = mias[mias.length - 1], res = w.Reservas.reservaDe(AG, rid);
ok('4 la reserva se crea en el servidor y queda retenida con su cuenta regresiva (o confirmada si no hay depósito)', !!res && ['retenida', 'confirmada'].includes(res.estado) && (res.estado !== 'retenida' || !!d.querySelector('[data-reloj]')), res && res.estado);
const cod = res && res.codigo;
ok('4b el total y el depósito coinciden con lo que el cliente vio', res && res.precio.total === +total.textContent.replace(/\D/g, ''), [res && res.precio.total, total.textContent]);
f.remove();

// ---- 4. Mis reservas y gestión ----
f = await abrir('&mis=1'); d = f.contentDocument;
const tarjeta = await esperar(() => [...d.querySelectorAll('article')].find((a) => a.textContent.includes(cod)));
ok('5 "Mis reservas" muestra la reserva con su estado y un enlace para gestionarla', !!tarjeta && !!tarjeta.querySelector('a[href*="gestion=' + cod + '"]'));
f.remove();
f = await abrir('&gestion=' + cod + '&rid=' + rid); d = f.contentDocument; w = f.contentWindow;
await esperar(() => d.querySelector('[data-paso] h2'));
const modLink = d.querySelector('a[href*="editar="]'), bCancelar = d.querySelector('[data-cancelar]');
ok('6 la gestión ofrece modificar y cancelar, con el historial', !!modLink && !!bCancelar && /Historial/.test(d.body.innerText), d.body.innerText.slice(0, 160));
f.remove();

// ---- 5. Modificar la MISMA reserva ----
f = await abrir('&editar=' + rid); d = f.contentDocument; w = f.contentWindow;
await esperar(() => d.querySelector('.banda-ed'));
ok('7 el asistente de modificar avisa que cambia la misma reserva y parte con lo elegido', !!d.querySelector('.banda-ed') && d.querySelectorAll('.cal .borde').length === 2 && d.getElementById('r-nombre') === null);
const nueva = U.sumaDias(salida, 1);   // una noche más
const bordes = [...d.querySelectorAll('.cal .borde')].map((b) => b.dataset.f);
const clic = async (fecha) => { for (let i = 0; i < 8 && !d.querySelector('[data-f="' + fecha + '"]'); i++) { d.querySelector('[data-mes="1"]').click(); await dormir(150); } d.querySelector('[data-f="' + fecha + '"]').click(); await dormir(250); };
await clic(bordes[0]); await clic(nueva); await dormir(1200);
d.querySelector('[data-sig]').click(); await dormir(300);
ok('7b en el paso de datos ya vienen los del cliente y el botón dice "Guardar los cambios"', d.getElementById('r-nombre').value === 'zz-ui Prueba' && /Guardar/.test(d.querySelector('[data-form] button[type=submit]').textContent));
d.querySelector('[data-form] button[type=submit]').click();
const mod = await esperar(() => { const x = w.Reservas.reservaDe(AG, rid); return x && x.rev === 2 && x; }, 12000);
ok('8 queda la MISMA reserva en versión 2, con una noche más, la anterior guardada y el mismo código', !!mod && mod.codigo === cod && mod.hasta - mod.desde === 3 * 864e5 && mod.ediciones.length === 1 && mod.precio.total > res.precio.total, mod && [mod.rev, mod.precio.total, res.precio.total]);
f.remove();

// ---- 6. Cancelar con la devolución de la política ----
f = await abrir('&gestion=' + cod + '&rid=' + rid); d = f.contentDocument; w = f.contentWindow;
await esperar(() => d.querySelector('[data-cancelar]'));
w.confirm = () => true;
d.querySelector('[data-cancelar]').click();
const canc = await esperar(() => { const x = w.Reservas.reservaDe(AG, rid); return x && x.estado === 'cancelada' && x; }, 12000);
ok('9 el cliente cancela y el servidor calcula la devolución según la política', !!canc && canc.reembolso && typeof canc.reembolso.monto === 'number' && canc.canceladaPor === 'cliente', canc && canc.reembolso);
f.remove();
const libre = !R.validar(R.leer(AG), { recurso: uno.id, llegada, salida, personas: 2 });
ok('10 y esas fechas vuelven a estar disponibles', await esperar(() => !R.validar(R.leer(AG), { recurso: uno.id, llegada, salida, personas: 2 }), 8000) !== null || libre);
await limpiar(); await Nube.borrar(N, 'avisos', DUENO, { filtro: { reserva: rid } });
return r;
