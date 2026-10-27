// Prueba de humo de un sistema de reservas ya conectado (el de un cliente o la demostración): corre sobre su página de reservas.
// Quien la lanza define antes PRUEBA = { N (negocio en la base), AGENDA (id de la agenda), DUENO y RECEP (PIN del jefe y de la recepción) }; sin eso
// (por ejemplo en check.mjs) usa la configuración de la página: su negocio, la agenda de ?negocio= y los PIN de demostración.
// Reserva de verdad (con un cliente "zz-prueba"), prueba lo que el servidor debe cuidar y al final borra lo que creó.
const r = {};
const PR = typeof PRUEBA !== 'undefined' ? PRUEBA : (() => { const a = window.AGENDA, pin = (re) => (a.pistas.find((p) => re.test(p.rol)) || {}).pin; return { N: a.negocio, AGENDA: new URLSearchParams(location.search).get('negocio') || Reservas.NEGOCIOS[0].id, DUENO: pin(/jefe|due/i), RECEP: pin(/recep/i) }; })();
const { N, AGENDA, DUENO, RECEP } = PR;
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)) : ''); };
const R = Reservas, U = R.util;
const esperar = async (fn, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await dormir(300); } return null; };
const cli = (n) => ({ nombre: 'zz-prueba', correo: 'zz' + n + '@prueba.cl', telefono: '+56 9 1234 567' + n, pais: 'Chile', idioma: 'es' });
const limpiar = async (ids = []) => { const l = await Nube.borrar(N, 'reservas', DUENO, { filtro: { cliente: { nombre: 'zz-prueba' } } }); for (const x of ids.filter(Boolean)) await Nube.borrar(N, 'avisos', DUENO, { filtro: { reserva: x } }); return l; };
await limpiar();   // restos de una prueba anterior que se cortó
Nube.pin(N, null);
await R.conectar(AGENDA); await dormir(3500);
const D = R.leer(AGENDA), c = D.config;
ok('1 la agenda está publicada en la base y se ve en pantalla', R.conectado(AGENDA) && R.estaPublicada(AGENDA) && c.id === AGENDA && (c.recursos.length + c.servicios.length) > 0);
const catalogo = c.modo === 'noches' || c.modo === 'bloques' ? c.recursos : c.servicios;
ok('1b el catálogo aparece en la pantalla (si la página muestra esta agenda)', !document.querySelector('.opcion') || [...document.querySelectorAll('.opcion')].length === catalogo.length || R.NEGOCIOS.length > 1, document.querySelectorAll('.opcion').length + ' de ' + catalogo.length);

// ---- Un horario libre dentro de las reglas del negocio ----
const unidad1 = (x) => (x.unidades || 1) === 1;
const buscar = (desde = 12) => {
  const lista = [...(c.modo === 'noches' || c.modo === 'bloques' ? c.recursos : c.servicios)].sort((a, b) => (unidad1(b) ? 1 : 0) - (unidad1(a) ? 1 : 0));   // primero los de una sola unidad (se puede probar el doble cupo)
  for (const x of lista) for (let k = desde; k < desde + 70; k++) {
    const f = U.sumaDias(U.hoy(), k), sel = { personas: 2 };
    if (c.modo === 'noches') Object.assign(sel, { recurso: x.id, llegada: f, salida: U.sumaDias(f, Math.max(c.politicas.estadiaMinAlta || 1, c.politicas.estadiaMin || 1, 2)), personas: Math.min(2, x.capacidad || 2) });
    else if (c.modo === 'cupos') { if ((x.dias || []).indexOf(U.diaSem(f)) < 0) continue; const s = R.salidas(D, { servicio: x.id, fecha: f, personas: x.minPersonas || 1 }); if (!s.length) continue; Object.assign(sel, { servicio: x.id, fecha: f, min: s[0].min, personas: x.minPersonas || 1 }); }
    else { Object.assign(sel, c.modo === 'bloques' ? { recurso: x.id, fecha: f, horas: x.minHoras || 1 } : { servicio: x.id, fecha: f }); const h = R.horas(D, sel); if (!h.length) continue; sel.min = h[0].min; if (c.modo === 'horas') delete sel.personas; else sel.personas = Math.min(2, x.capacidad || 2); }
    if (!R.validar(D, sel)) return sel;
  }
  return null;
};
const sel = buscar();
ok('2 hay al menos un horario libre para reservar', !!sel, sel);
if (!sel) { await limpiar(); return r; }
const selM = buscar(45) || sel;   // otro horario para la prueba de datos manipulados: así no choca con la reserva real de abajo

// ---- El precio lo calcula el servidor y coincide con el del navegador ----
const cot = await R.cotizar(AGENDA, sel, ''), local = R.precio(D, sel, ''), cotM = await R.cotizar(AGENDA, selM, '');
ok('3 la cotización del servidor coincide con la del navegador', cot.ok && cot.precio.total === local.total && cot.precio.deposito === local.deposito, [cot.precio && cot.precio.total, local.total]);

// ---- Un precio, un pago o un estado manipulados se ignoran ----
const idM = Nube.idNuevo(); R.seguir(AGENDA, idM);   // en otro horario: así no choca con la reserva real de abajo
const mal = await Nube.escribir(N, 'reservas', idM, { agenda: AGENDA, neg: AGENDA, sel: selM, cliente: cli(1), precio: { total: 1, deposito: 0 }, pagado: 999999, estado: 'pagada', codigo: 'X' }, { modo: 'poner' }).then((x) => x, (e) => ({ error: e.codigo }));
const vista = await Nube.leer(N, 'reservas', { ids: [idM] }), docM = (vista.mios || [])[0] && vista.mios[0].data;
ok('4 un precio, pago o estado manipulado se ignora: manda el servidor', !!docM && docM.precio.total === cotM.precio.total && docM.pagado === 0 && ['retenida', 'confirmada'].includes(docM.estado) && docM.codigo !== 'X', docM ? [docM.precio.total, docM.pagado, docM.estado] : mal);

// ---- Una reserva real ----
const una = await R.crear(AGENDA, sel, cli(2), {});
ok('5 una reserva real nace "retenida" (o confirmada si no hay depósito), con código, versión 1 e historial', !!una.reserva && ['retenida', 'confirmada'].includes(una.reserva.estado) && una.reserva.codigo && una.reserva.rev === 1 && una.reserva.historial.length >= 1, una);
const rid = una.reserva && una.reserva.id;
if (!una.reserva) { await limpiar([idM]); return r; }

// ---- No se vende dos veces ----
let tope = null;
if (c.modo === 'cupos') { const s = R.servicio(D, sel.servicio); tope = await R.crear(AGENDA, { ...sel, personas: s.capacidad }, cli(3), {}); ok('6 los cupos no se sobrevenden', !!tope.error && /cupos/.test(tope.codigo || ''), tope); }
else {
  const rec = R.recurso(D, (una.reserva || {}).recurso), solo = rec && unidad1(rec);
  if (solo) { tope = await R.crear(AGENDA, { ...sel, recurso: rec.id }, cli(3), {}); ok('6 lo mismo, en la misma fecha u hora, no se vende dos veces', !!tope.error && /ocupado/.test(tope.codigo || ''), tope); }
  else ok('6 (este recurso tiene varias unidades iguales: no se prueba el doble cupo)', true);
}
ok('6b el público ve qué está ocupado pero no quién reservó', !JSON.stringify((await Nube.leer(N, 'reservas', {})).pub || []).includes('zz-prueba'));

// ---- Roles: cada PIN entra a lo suyo ----
ok('7 cada PIN entra a lo suyo', (await Nube.rol(N, DUENO)) === 'dueno' && (await Nube.rol(N, RECEP)) === 'recepcion' && (await Nube.rol(N, '000000')) === null);
ok('7b un cliente no puede publicar la configuración', (await Nube.escribir(N, 'config', 'cfg-' + AGENDA, { config: c }, { modo: 'poner' }).then(() => 'aceptó', (e) => e.codigo)) === 'sin permiso');

// ---- La recepción cobra y el cliente ve el cambio ----
Nube.pin(N, RECEP); R.entrarEquipo(AGENDA); await dormir(1500);
const dep = una.reserva.precio.deposito || una.reserva.precio.total;
const pag = await R.estado(AGENDA, rid, 'pagada', { pagado: dep });
ok('8 la recepción registra el depósito: queda "pagada" con lo pagado', !pag.error && pag.estado === 'pagada' && pag.pagado === dep, pag);
const cob = await R.estado(AGENDA, rid, 'pagada', { pagado: una.reserva.precio.total });
ok('8b y luego cobra el saldo, sin cambiar de estado', !cob.error && cob.estado === 'pagada' && cob.pagado === una.reserva.precio.total, cob);
ok('8c la recepción no puede publicar la configuración ni vaciar los datos', !!(await R.publicarConfig(AGENDA)).error && (await R.restablecer(AGENDA).then(() => false, () => true)));
Nube.pin(N, null);
const cliVe = await esperar(() => { const x = R.reservaDe(AGENDA, rid); return x && x.estado === 'pagada' && x; }, 8000);
ok('9 el cliente (sin PIN) ve su reserva pagada', !!cliVe);

// ---- Modificar y cancelar desde el cliente ----
const nueva = buscar(30); let mod = null;
if (nueva && JSON.stringify(nueva) !== JSON.stringify(sel)) {
  mod = await R.modificar(AGENDA, rid, { sel: nueva });
  ok('10 el cliente modifica la MISMA reserva (versión 2, con la anterior guardada) o el servidor explica por qué no', (!mod.error && mod.reserva.rev === 2 && mod.reserva.ediciones.length === 1) || /tarde_modificar|no_modificable|ocupado|conflicto/.test(mod.codigo || ''), mod);
}
const can = await R.cancelar(AGENDA, rid, 'cliente');
ok('11 el cliente cancela y el servidor calcula la devolución según la política', !can.error && can.estado === 'cancelada' && can.reembolso && typeof can.reembolso.monto === 'number', can);

// ---- Limpieza: borra solo lo que creó la prueba ----
const lim = await limpiar([idM, rid, ...(tope && tope.reserva ? [tope.reserva.id] : [])]);
ok('12 limpieza de la prueba', lim.ok === true, lim);
return r;
