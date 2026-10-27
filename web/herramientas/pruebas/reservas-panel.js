// Panel del negocio de reservas, de punta a punta y conectado a la base: entra el jefe o la recepción con su PIN (cada uno ve lo suyo), llega una reserva
// y el panel avisa solo, se registra el pago, el jefe edita el catálogo (borrador → publicar) y bloquea y libera fechas.
// Usa el panel real dentro de un iframe. Corre sobre /ejemplos/reservas/?negocio=cabanas (o el de un cliente); N y los PIN salen de la configuración de la página.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)) : ''); };
const esperar = async (fn, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await dormir(250); } return null; };
const A = window.AGENDA, N = A.negocio, pin = (re) => (A.pistas.find((p) => re.test(p.rol)) || {}).pin, DUENO = pin(/jefe|due/i), RECEP = pin(/recep/i);
const R = Reservas, U = R.util, AG = new URLSearchParams(location.search).get('negocio') || R.NEGOCIOS[0].id;
const extra = new URLSearchParams(location.search).get('nube') ? '&nube=' + new URLSearchParams(location.search).get('nube') : '';
const limpiar = async () => { await Nube.borrar(N, 'reservas', DUENO, { filtro: { cliente: { nombre: 'zz-panel' } } }); await Nube.borrar(N, 'bloqueos', DUENO, { filtro: { motivo: 'zz-panel' } }); };
const abrirPanel = (pinDe) => new Promise((res) => {
  Nube.pin(N, pinDe);
  const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#fff;z-index:99999';
  f.src = location.pathname.replace(/\/?$/, '/') + 'admin/?negocio=' + AG + extra; f.onload = () => res(f); document.body.appendChild(f);
});
const tabs = (d) => [...d.querySelectorAll('.menu-adm [data-tab]')].map((b) => b.dataset.tab);
const ir = async (d, t) => { d.querySelector('[data-tab="' + t + '"]').click(); await dormir(350); };
await limpiar();
const cfg0 = R.leer(AG).config, uno = (cfg0.modo === 'noches' ? cfg0.recursos : cfg0.servicios)[0];

// ---- 1. El jefe: ve todo ----
let f = await abrirPanel(DUENO), d = f.contentDocument, w = f.contentWindow;
await esperar(() => d.querySelector('.menu-adm [data-tab]'));
ok('1 el jefe ve todas las secciones (catálogo, horarios, promociones, políticas, integraciones, negocio y equipo)', ['resumen', 'reservas', 'calendario', 'catalogo', 'horarios', 'promos', 'politicas', 'avisos', 'integraciones', 'reportes', 'negocio'].every((t) => tabs(d).includes(t)), tabs(d));
const errs = []; w.addEventListener('error', (e) => errs.push(e.message));
for (const t of tabs(d)) { await ir(d, t); if (d.querySelector('[data-vista]').innerText.trim().length < 20) errs.push('vacía: ' + t); }
ok('1b ninguna sección falla ni queda vacía', errs.length === 0, errs);
await ir(d, 'resumen');
let ridP = null;
ok('1c el resumen trae el nombre del negocio y los indicadores', d.querySelectorAll('.kpi').length >= 5 && d.querySelector('[data-vista] h1').textContent.length > 2);

// ---- 2. Llega una reserva: el panel avisa solo ----
await dormir(4500);   // el panel toma como "ya vistas" las que existían al entrar
let sel;
for (let k = 70; k < 150 && !sel; k++) { const a = U.sumaDias(U.hoy(), k), cand = cfg0.modo === 'noches' ? { recurso: uno.id, llegada: a, salida: U.sumaDias(a, 2), personas: 2 } : null; if (cand && !R.validar(R.leer(AG), cand)) sel = cand; }
if (!sel) { ok('2 (esta agenda no es de noches: la alerta se prueba con la de alojamiento)', true); }
else {
  const rid = ridP = Nube.idNuevo();
  await Nube.escribir(N, 'reservas', rid, { agenda: AG, neg: AG, sel, cliente: { nombre: 'zz-panel', correo: 'pa@prueba.cl', telefono: '+56 9 1234 5678', pais: 'Chile', idioma: 'es' } }, { modo: 'poner' });
  const alerta = await esperar(() => { const a = d.querySelector('[data-alerta]'); return a && !a.hidden && a.innerText.includes('Nueva reserva') && a; }, 15000);
  ok('2 llega una reserva y el panel muestra el aviso (con sonido) y el contador, sin recargar', !!alerta && /\d/.test(d.querySelector('[data-tab="reservas"]').innerText), alerta && alerta.innerText);
  await ir(d, 'reservas');
  const fila = [...d.querySelectorAll('.tabla tbody tr')].find((tr) => tr.textContent.includes('zz-panel'));
  ok('2b la reserva aparece en la tabla con su estado y los botones que corresponden', !!fila && !!fila.querySelector('[data-acc]'), fila && fila.innerText.slice(0, 120));
  const boton = fila && fila.querySelector('[data-acc="pagada"]');
  if (boton) boton.click();
  const pagada = await esperar(() => { const x = R.reservaDe(AG, rid); return x && x.estado === 'pagada' && x; }, 12000);
  ok('3 el jefe registra el depósito: queda pagada y el panel lo refleja', !!pagada && /Pagada/.test([...d.querySelectorAll('.tabla tbody tr')].find((tr) => tr.textContent.includes('zz-panel')).innerText), pagada && pagada.pagado);
}

// ---- 3. Catálogo: borrador → publicar ----
await ir(d, 'catalogo');
const tipoNuevo = cfg0.modo === 'noches' || cfg0.modo === 'bloques' ? 'recurso' : 'servicio';
d.querySelector('[data-nuevo="' + tipoNuevo + '"]').click(); await dormir(300);
let dlg = d.querySelector('dialog.editor[open]');
ok('4 agregar abre el editor', !!dlg);
dlg.querySelector('form').requestSubmit(); await dormir(300);
ok('4b guardar vacío marca el nombre en rojo con su mensaje', dlg.querySelectorAll('.campo.mal').length >= 1 && /nombre/i.test(dlg.querySelector('.campo.mal .campo-err').textContent));
const llenar = (id, v) => { const e = dlg.querySelector('#' + id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } };
llenar('e-nombre', 'zz-panel Prueba'); llenar('e-precio', '12345');
if (dlg.querySelector('[data-atiende]')) dlg.querySelector('[data-atiende]').checked = true;
if (dlg.querySelector('[data-dia]')) dlg.querySelector('[data-dia]').checked = true;
dlg.querySelector('form').requestSubmit(); await dormir(500);
await dormir(400);
ok('4c el elemento nuevo queda en el borrador y aparece la barra "Publicar cambios"', !d.querySelector('[data-barra]').hidden && /zz-panel Prueba/.test(d.querySelector('[data-vista]').innerText) && w.Reservas.configPendiente(AG), [d.querySelector('[data-barra]').hidden, /zz-panel Prueba/.test(d.querySelector('[data-vista]').innerText), w.Reservas.configPendiente(AG), d.querySelector('[data-vista]').innerText.slice(0, 200)]);
const publico = async () => { const x = await Nube.leer(N, 'config', { ids: ['cfg-' + AG] }); const c = ((x.mios || [])[0] || {}).data; return c && c.config; };
ok('4d mientras no se publica, los clientes NO lo ven', !JSON.stringify(await publico()).includes('zz-panel Prueba'));
d.querySelector('[data-publicar]').click();
ok('5 al publicar, la barra desaparece y los clientes ya lo ven', !!(await esperar(() => d.querySelector('[data-barra]').hidden && !w.Reservas.configPendiente(AG), 12000)) && JSON.stringify(await publico()).includes('zz-panel Prueba'));
// Se quita (queda en el borrador hasta publicar) y se deja todo como estaba
w.confirm = () => true;
d.querySelector('[data-del*=":' + 'zz-panel-prueba' + '"]').click(); await dormir(400);
d.querySelector('[data-publicar]').click();
ok('5b quitarlo y publicar lo saca del sitio de los clientes (el catálogo vuelve a como estaba)', !!(await esperar(() => d.querySelector('[data-barra]').hidden, 12000)) && !JSON.stringify(await publico()).includes('zz-panel Prueba'));

// ---- 4. Bloquear y liberar fechas ----
await ir(d, 'calendario');
const rec = (cfg0.modo === 'cupos' ? cfg0.servicios : cfg0.recursos)[0], desde = U.sumaDias(U.hoy(), 200);
d.querySelector('#b-rec').value = rec.id; d.querySelector('#b-desde').value = desde; d.querySelector('#b-hasta').value = U.sumaDias(desde, 2); d.querySelector('#b-mot').value = 'zz-panel';
d.querySelector('[data-bloq]').requestSubmit();
const quitar = await esperar(() => d.querySelector('[data-quitar-bloqueo]'), 12000);
ok('6 el jefe bloquea fechas y aparece el bloqueo vigente', !!quitar);
if (quitar) { quitar.click(); ok('6b al quitarlo, las fechas se liberan y el bloqueo desaparece', !!(await esperar(() => !d.querySelector('[data-quitar-bloqueo]'), 12000))); }
f.remove();

// ---- 5. La recepción: solo el día a día ----
f = await abrirPanel(RECEP); d = f.contentDocument; w = f.contentWindow;
await esperar(() => d.querySelector('.menu-adm [data-tab]'));
ok('7 la recepción ve reservas, calendario, avisos y reportes; no el catálogo, las políticas ni el negocio y equipo', ['resumen', 'reservas', 'calendario', 'avisos', 'reportes'].every((t) => tabs(d).includes(t)) && !['catalogo', 'horarios', 'promos', 'politicas', 'integraciones', 'negocio'].some((t) => tabs(d).includes(t)), tabs(d));
ok('7b y no tiene barra de publicar ni botón de borrar datos', d.querySelector('[data-barra]').hidden && !d.querySelector('[data-reset]'));
f.remove(); Nube.pin(N, null);
await limpiar(); if (ridP) await Nube.borrar(N, 'avisos', DUENO, { filtro: { reserva: ridP } });
return r;
