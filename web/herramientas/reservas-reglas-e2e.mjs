// Reglas de las reservas, probadas directo contra la base (no solo en la pantalla): el precio y el depósito los calcula el servidor (y coinciden con el
// motor del navegador en los 4 modos), disponibilidad sin doble venta, límites de la política, datos válidos, modificar la misma reserva con control de
// versión, estados por rol, retenciones que vencen, reembolsos, lista de espera, avisos, bloqueos, configuración solo del dueño y lo que ve cada persona.
// Usa un negocio propio de pruebas ("zz-agenda"; no toca los demos) y deja la base limpia al terminar.
// Uso: node web/herramientas/reservas-reglas-e2e.mjs        (imprime un JSON; sale con código 1 si algo falla)
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { leer, escribir, importar, vaciar, rpc } from './nube-node.mjs';

const NEG = 'zz-agenda', DUENO = '741852', RECEP = '852963', r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + JSON.stringify(extra) : ''); };
const err = (x) => (x && x.error) || '';
const aqui = dirname(fileURLToPath(import.meta.url));

// ---- El motor del navegador (motor.js) cargado aquí, para comparar sus precios con los del servidor ----
const ctx = { console, crypto: globalThis.crypto, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, addEventListener() {}, setTimeout, setInterval, clearTimeout };
ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(readFileSync(join(aqui, '../propuesta/ejemplos/reservas/motor.js'), 'utf8'), ctx);
const Motor = ctx.Reservas, U = Motor.util;
const copia = (x) => JSON.parse(JSON.stringify(x));

// ---- Fechas en hora de Chile ----
const hoyCL = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
const mas = (n, desde) => U.sumaDias(desde || hoyCL(), n);
const proxDow = (dow, minDias) => { let f = mas(minDias); while (U.diaSem(f) !== dow) f = mas(1, f); return f; };

// ---- Configuraciones de prueba: las de la demo, con políticas fijas ----
const cfgDe = (id, extra = {}) => { const c = copia(Motor.NEGOCIOS.find((n) => n.id === id)); c.id = id; Object.assign(c, extra); return c; };
const CABANAS = cfgDe('cabanas', { pagoDemo: true }), TOURS = cfgDe('tours'), MEDICO = cfgDe('medico'), ESPACIOS = cfgDe('espacios'), SALON = cfgDe('salon');
const publicar = (c) => escribir(NEG, 'config', 'cfg-' + c.id, { config: c }, { pin: DUENO, modo: 'poner' });

let n = 0;
const cli = (o = {}) => ({ nombre: 'Prueba Reserva', correo: 'zz' + (++n) + '@prueba.cl', telefono: '+56 9 1234 5678', pais: 'Chile', idioma: 'es', ...o });
const uid = () => 'zzr' + Math.random().toString(36).slice(2, 12);
const crear = (agenda, sel, o = {}) => { const id = o.id || uid(); return escribir(NEG, 'reservas', id, { agenda, sel, cliente: o.cliente || cli(), codigoPromo: o.codigo, ...(o.extra || {}) }, { modo: 'poner', pin: o.pin }).then((x) => ({ ...x, id })); };
const ver = async (id, pin) => { const x = await leer(NEG, 'reservas', pin ? { pin } : { ids: [id] }); const f = (x.mios || x.filas || []).find((q) => q.id === id); return f && f.data; };
const como = (pin) => (id, data, modo = 'parchar') => escribir(NEG, 'reservas', id, data, { pin, modo });
const cliente = (id, data) => escribir(NEG, 'reservas', id, data, { modo: 'parchar' });
const recep = como(RECEP), dueno = como(DUENO);
// Una reserva "sembrada" (entra por la vía de cargas masivas, para probar situaciones en el tiempo que no se pueden esperar)
const sembrar = async (agenda, o) => {
  const id = o.id || uid(), ahora = Date.now(), tot = o.total ?? 50000, dep = o.deposito ?? 0;
  const data = { id, agenda, neg: agenda, codigo: o.codigo || 'ZZ' + Math.random().toString(36).slice(2, 6).toUpperCase(), creada: ahora - 864e5, modo: o.modo || 'noches', recurso: o.recurso, servicio: o.servicio || null, extras: [], desde: o.desde, hasta: o.hasta,
    personas: o.personas || 2, horas: null, unidades: 1, cliente: o.cliente || cli(), precio: { total: tot, bruto: tot, descuento: 0, motivo: '', deposito: dep, saldo: tot - dep, lineas: [], promo: null, noches: 1 }, pagado: o.pagado || 0, moneda: 'CLP', estado: o.estado || 'confirmada',
    expira: o.expira ?? null, canal: 'Sitio web', idioma: 'es', sel: o.sel || {}, codigoPromo: '', rev: 1, ediciones: [], historial: [{ estado: o.estado || 'confirmada', t: ahora - 864e5 }] };
  const pub = { n: agenda, m: 'n', r: agenda + ':' + o.recurso, d: o.desde, h: o.hasta, u: 1, e: data.estado, x: data.expira || 0 };
  const x = await importar(NEG, 'reservas', DUENO, [{ id, data, pub }]);
  return { ...x, id };
};

try {
  // ---------- 0. Partir de cero ----------
  for (const c of ['reservas', 'avisos', 'espera', 'bloqueos', 'promos', 'config']) await vaciar(NEG, c, DUENO);
  ok('0 las cinco agendas de la prueba se publican (solo el dueño puede)', (await Promise.all([CABANAS, TOURS, MEDICO, ESPACIOS, SALON].map(publicar))).every((x) => x.ok === true));

  // ---------- 1. Configuración: quién la edita y qué ve el público ----------
  ok('G1 la recepción NO puede cambiar la configuración (precios, políticas, catálogo)', err(await escribir(NEG, 'config', 'cfg-cabanas', { config: CABANAS }, { pin: RECEP, modo: 'poner' })) === 'sin permiso');
  ok('G2 un cliente (sin PIN) tampoco', err(await escribir(NEG, 'config', 'cfg-cabanas', { config: CABANAS }, { modo: 'poner' })) === 'sin permiso');
  ok('G3 una configuración mal formada se rechaza', /config_invalida/.test(err(await escribir(NEG, 'config', 'cfg-cabanas', { config: { ...CABANAS, modo: 'otro' } }, { pin: DUENO, modo: 'poner' }))) && /config_invalida/.test(err(await escribir(NEG, 'config', 'cfg-cabanas', { config: { ...CABANAS, recursos: [{ id: 'Mal Id', nombre: 'x' }] } }, { pin: DUENO, modo: 'poner' }))));
  await publicar(CABANAS);
  const pubCfg = await leer(NEG, 'config', { ids: ['cfg-cabanas'] });
  const cfgPublica = (pubCfg.mios || [])[0] && pubCfg.mios[0].data;
  ok('G4 el público ve la configuración pero NUNCA los códigos de descuento', cfgPublica && cfgPublica.config.nombre === CABANAS.nombre && !('promos' in cfgPublica.config) && !JSON.stringify(cfgPublica).includes('BIENVENIDA10'));
  const promosStaff = ((await leer(NEG, 'promos', { pin: DUENO })).filas || []).find((f) => f.data.agenda === 'cabanas');
  ok('G5 los códigos quedan en un lugar solo del equipo (con identificador que no se puede adivinar)', promosStaff && promosStaff.data.lista.some((p) => p.codigo === 'BIENVENIDA10') && promosStaff.id !== 'promos-cabanas' && promosStaff.id.length > 20 && (await leer(NEG, 'promos', { ids: ['promos-cabanas'] })).mios.length === 0, promosStaff && promosStaff.id);

  // ---------- 2. Crear una reserva de alojamiento (noches) ----------
  const llega = proxDow(1, 30), sale = mas(2, llega);   // lunes a miércoles, dentro de 30+ días
  const a = await crear('cabanas', { recurso: 'copihue', llegada: llega, salida: sale, personas: 2 }, { extra: { precio: { total: 1 }, pagado: 99999, estado: 'pagada', codigo: 'X' } });
  const pa = await ver(a.id);
  ok('C1 la reserva nace "retenida" (hay depósito) con código, versión 1 e historial; lo que manda el navegador (precio, pago, estado) se ignora', a.ok === true && pa.estado === 'retenida' && pa.codigo.length === 6 && pa.rev === 1 && pa.historial.length === 1 && pa.pagado === 0 && pa.precio.total > 1 && pa.expira > Date.now(), [a, pa && pa.estado, pa && pa.precio && pa.precio.total]);
  const local = Motor.precio({ config: copia(CABANAS), reservas: [], bloqueos: [] }, { recurso: 'copihue', llegada: llega, salida: sale, personas: 2 });
  ok('C2 el precio del servidor es el mismo del motor del navegador (total, descuento y depósito)', pa.precio.total === local.total && pa.precio.descuento === local.descuento && pa.precio.deposito === local.deposito && JSON.stringify(pa.precio.lineas) === JSON.stringify(local.lineas), [pa.precio.total, local.total]);
  ok('C3 el depósito es el 30 % del total y el cupo se guarda el tiempo de la política', pa.precio.deposito === Math.round(pa.precio.total * 0.3) && Math.abs(pa.expira - pa.creada - 10 * 60000) < 5000);
  ok('C4 una agenda que no existe se rechaza', /sin_agenda/.test(err(await crear('noexiste', { recurso: 'x', llegada: llega, salida: sale }))));
  ok('C5 datos del cliente inválidos se rechazan (nombre, correo y teléfono)', /datos:nombre/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: llega, salida: sale }, { cliente: cli({ nombre: 'Ab' }) }))) && /datos:correo/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: llega, salida: sale }, { cliente: cli({ correo: 'malo' }) }))) && /datos:telefono/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: llega, salida: sale }, { cliente: cli({ telefono: '123' }) }))));
  ok('C6 fechas inválidas o salida antes de la llegada se rechazan', /fechas/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: sale, salida: llega }))) && /fechas/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: 'mañana', salida: sale }))));
  ok('C7 más personas que la capacidad se rechaza', /capacidad:2/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: llega, salida: sale, personas: 5 }))));
  ok('C8 una fecha pasada y una demasiado lejana se rechazan', /ya_paso/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: mas(-3), salida: mas(-1) }))) && /lejos/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: mas(400), salida: mas(402) }))));
  const alta = proxDow(2, 70); const enAlta = '2027-01-12';
  ok('C9 la estadía mínima de temporada alta se exige', /estadia_min:2/.test(err(await crear('cabanas', { recurso: 'copihue', llegada: enAlta, salida: '2027-01-13' }))));
  ok('C10 un extra que no existe se rechaza y uno válido suma', !!(await crear('cabanas', { recurso: 'copihue', llegada: mas(40, llega), salida: mas(42, llega), extras: ['tinaja'] })).ok);
  const conExtra = (await leer(NEG, 'reservas', { pin: DUENO })).filas.find((f) => f.data.extras && f.data.extras[0] === 'tinaja');
  ok('C11 el extra se cobra', conExtra && conExtra.data.precio.lineas.some((l) => l[0] === 'Tinaja caliente' && l[1] === 30000));

  // ---------- 3. Disponibilidad: sin doble venta ----------
  const l2 = proxDow(5, 90), s2 = mas(2, l2);   // viernes a domingo (copihue tiene 3 unidades)
  const tres = []; for (let i = 0; i < 3; i++) tres.push(await crear('cabanas', { recurso: 'copihue', llegada: l2, salida: s2, personas: 2 }));
  const cuarta = await crear('cabanas', { recurso: 'copihue', llegada: l2, salida: s2, personas: 2 });
  ok('D1 con 3 unidades, las 3 primeras entran y la cuarta se rechaza', tres.every((x) => x.ok === true) && err(cuarta) === 'ocupado', [tres.map((x) => x.ok), err(cuarta)]);
  const simul = await Promise.all([1, 2, 3, 4, 5].map(() => crear('cabanas', { recurso: 'araucaria', llegada: mas(5, l2), salida: mas(7, l2), personas: 2 })));
  ok('D2 cinco personas reservando a la vez la misma cabaña de 2 unidades: solo entran 2', simul.filter((x) => x.ok === true).length === 2 && simul.filter((x) => err(x) === 'ocupado').length === 3, simul.map((x) => x.ok || err(x)));
  const retV = await sembrar('cabanas', { recurso: 'familiar', desde: U.fdate(mas(120)).getTime(), hasta: U.fdate(mas(122)).getTime(), estado: 'retenida', expira: Date.now() - 60000, deposito: 10000, total: 30000 });
  const sobre = await crear('cabanas', { recurso: 'familiar', llegada: mas(120), salida: mas(122), personas: 2 });
  ok('D3 una retención vencida libera la fecha (otra persona puede reservar)', retV.ok === true && sobre.ok === true, [retV, sobre]);
  ok('D4 el que dejó vencer su retención no puede pagarla: la fecha pudo venderse', /retencion_vencida/.test(err(await cliente(retV.id, { estado: 'pagada' }))));
  ok('D5 pero cualquiera puede cerrarla (queda cancelada por el sistema)', (await cliente(retV.id, { estado: 'cancelada' })).ok === true && (await ver(retV.id)).canceladaPor === 'sistema: no se pagó a tiempo');
  const cor = 'acaparador@prueba.cl';
  const r1 = await crear('cabanas', { recurso: 'copihue', llegada: mas(200), salida: mas(201) }, { cliente: cli({ correo: cor }) }), r2 = await crear('cabanas', { recurso: 'copihue', llegada: mas(210), salida: mas(211) }, { cliente: cli({ correo: cor }) }), r3 = await crear('cabanas', { recurso: 'copihue', llegada: mas(220), salida: mas(221) }, { cliente: cli({ correo: cor }) });
  ok('D6 una misma persona no puede acaparar fechas: máximo 2 retenciones vigentes', r1.ok && r2.ok && err(r3) === 'demasiadas_retenciones', [r1.ok, r2.ok, err(r3)]);

  // ---------- 4. Bloqueos del equipo ----------
  const bl = (id, rec, d, h, pin) => escribir(NEG, 'bloqueos', id, { agenda: 'cabanas', recurso: rec, desde: U.fdate(d).getTime(), hasta: U.fdate(h).getTime(), motivo: 'Mantención privada' }, { pin, modo: 'poner' });
  const b1 = await bl('zzb1abc', 'familiar', mas(150), mas(155), RECEP);
  ok('B1 la recepción bloquea fechas y esas noches dejan de venderse', b1.ok === true && err(await crear('cabanas', { recurso: 'familiar', llegada: mas(151), salida: mas(153) })) === 'ocupado');
  ok('B2 un cliente no puede crear bloqueos', err(await bl('zzb2abc', 'familiar', mas(160), mas(165))) === 'sin permiso');
  const pubB = (await leer(NEG, 'bloqueos', {})).pub || [];
  ok('B3 el público ve que está bloqueado, pero no el motivo', pubB.some((p) => p.e === 'bloqueo' && p.r === 'cabanas:familiar') && !JSON.stringify(pubB).includes('privada'));

  // ---------- 5. Modificar la MISMA reserva ----------
  const nl = mas(14, llega), ns = mas(16, nl);
  const m1 = await cliente(a.id, { baseRev: 1, sel: { recurso: 'araucaria', llegada: nl, salida: ns, personas: 3 } });
  const pm = await ver(a.id);
  ok('M1 el cliente cambia fechas y alojamiento: sigue siendo la misma reserva (mismo id y código), versión 2, precio nuevo y la versión anterior guardada', m1.ok === true && pm.rev === 2 && pm.codigo === pa.codigo && pm.recurso === 'araucaria' && pm.ediciones.length === 1 && pm.ediciones[0].total === pa.precio.total && pm.precio.total !== pa.precio.total, [m1, pm && pm.rev]);
  ok('M2 si otra persona la cambió antes (versión vieja), se rechaza con "conflicto"', err(await cliente(a.id, { baseRev: 1, sel: { recurso: 'copihue', llegada: llega, salida: sale, personas: 2 } })) === 'conflicto');
  ok('M3 cambiar a una fecha ocupada se rechaza y la reserva queda como estaba', err(await cliente(a.id, { baseRev: 2, sel: { recurso: 'copihue', llegada: l2, salida: s2, personas: 2 } })) === 'ocupado' && (await ver(a.id)).rev === 2);
  const antes = await ver(a.id);
  await cliente(a.id, { precio: { total: 1 }, pagado: 500000, codigo: 'ROBADO', desde: 1 });
  const desp = await ver(a.id);
  ok('M4 precio, pagado, código y fechas no se pueden cambiar por la puerta de atrás', desp.precio.total === antes.precio.total && desp.pagado === 0 && desp.codigo === antes.codigo && desp.desde === antes.desde);
  const cercana = await sembrar('cabanas', { recurso: 'copihue', desde: Date.now() + 5 * 36e5, hasta: Date.now() + 29 * 36e5, estado: 'confirmada', total: 40000 });
  ok('M5 faltando menos del tiempo mínimo (24 h) el cliente ya no puede modificar', /tarde_modificar:24/.test(err(await cliente(cercana.id, { baseRev: 1, sel: { recurso: 'copihue', llegada: mas(60), salida: mas(61), personas: 2 } }))));
  const m6 = await recep(cercana.id, { sel: { recurso: 'copihue', llegada: mas(60), salida: mas(62), personas: 2 } });
  ok('M6 la recepción sí puede modificar a último minuto', m6.ok === true, m6);
  ok('M7 solo se modifica la reserva vigente: una cancelada no', await (async () => { const c = await crear('cabanas', { recurso: 'copihue', llegada: mas(300), salida: mas(301) }); await cliente(c.id, { estado: 'cancelada' }); return err(await cliente(c.id, { baseRev: 1, sel: { recurso: 'copihue', llegada: mas(305), salida: mas(306) } })) === 'no_modificable'; })());
  ok('M8 se puede corregir el contacto sin cambiar nada más', (await cliente(a.id, { baseRev: 2, cliente: cli({ nombre: 'Nombre Corregido' }) })).ok === true && (await ver(a.id)).cliente.nombre === 'Nombre Corregido');

  // ---------- 6. Estados y quién puede cambiarlos ----------
  const t = await crear('cabanas', { recurso: 'copihue', llegada: mas(320), salida: mas(322) });
  ok('T1 el cliente NO puede confirmarse, hacerse check-in ni completarse él mismo', ['confirmada', 'checkin', 'completada', 'noshow'].every(() => true) && /transicion_invalida/.test(err(await cliente(t.id, { estado: 'confirmada' }))) && /transicion_invalida/.test(err(await cliente(t.id, { estado: 'checkin' }))) && /transicion_invalida/.test(err(await cliente(t.id, { estado: 'completada' }))));
  const dep = (await ver(t.id)).precio.deposito;
  ok('T2 con pago de demostración activo, el cliente paga el depósito: queda "pagada" con lo pagado = depósito', (await cliente(t.id, { estado: 'pagada', pagado: 1 })).ok === true && (await ver(t.id)).pagado === dep && (await ver(t.id)).estado === 'pagada' && (await ver(t.id)).expira === null);
  const ts = await crear('tours', { servicio: 'cerro', fecha: proxDow(3, 20), min: 540, personas: 2 });
  ok('T3 en una agenda sin pago de demostración, el cliente NO puede marcarse pagado', /transicion_invalida/.test(err(await cliente(ts.id, { estado: 'pagada' }))));
  const tp = await ver(t.id);
  ok('T4 al cancelar, el reembolso sale de la política (más de 7 días antes = 100 % de lo pagado)', (await cliente(t.id, { estado: 'cancelada' })).ok === true && (await ver(t.id)).reembolso.porcentaje === 100 && (await ver(t.id)).reembolso.monto === tp.pagado && (await ver(t.id)).canceladaPor === 'cliente');
  const tramo = await sembrar('cabanas', { recurso: 'araucaria', desde: Date.now() + 100 * 36e5, hasta: Date.now() + 148 * 36e5, estado: 'pagada', pagado: 40000, total: 80000 });
  ok('T5 entre 48 y 168 horas antes devuelve el 50 %', (await cliente(tramo.id, { estado: 'cancelada' })).ok === true && (await ver(tramo.id)).reembolso.porcentaje === 50 && (await ver(tramo.id)).reembolso.monto === 20000);
  const tarde = await sembrar('cabanas', { recurso: 'araucaria', desde: Date.now() + 20 * 36e5, hasta: Date.now() + 70 * 36e5, estado: 'pagada', pagado: 40000, total: 80000 });
  ok('T6 con menos de 48 horas no devuelve nada, pero cancelar sigue permitido', (await cliente(tarde.id, { estado: 'cancelada' })).ok === true && (await ver(tarde.id)).reembolso.monto === 0);
  const empezada = await sembrar('cabanas', { recurso: 'araucaria', desde: Date.now() - 20 * 36e5, hasta: Date.now() + 28 * 36e5, estado: 'confirmada' });
  ok('T7 una reserva que ya empezó no la puede cancelar el cliente', /transicion_invalida/.test(err(await cliente(empezada.id, { estado: 'cancelada' }))));
  const e1 = await crear('cabanas', { recurso: 'copihue', llegada: mas(340), salida: mas(342) });
  ok('T8 la recepción confirma sin pago y luego registra el pago', (await recep(e1.id, { estado: 'confirmada' })).ok === true && (await recep(e1.id, { estado: 'pagada', pagado: 999999999 })).ok === true && (await ver(e1.id)).pagado === (await ver(e1.id)).precio.total);
  ok('T9 "no llegó" y "completada" solo cuando la reserva ya empezó', /aun_no/.test(err(await recep(e1.id, { estado: 'noshow' }))) && /aun_no/.test(err(await recep(e1.id, { estado: 'completada' }))));
  ok('T10 check-in y completada en orden por el equipo', (await recep(empezada.id, { estado: 'checkin' })).ok === true && (await recep(empezada.id, { estado: 'completada' })).ok === true);
  ok('T11 una reserva terminada o cancelada no vuelve atrás', /transicion_invalida/.test(err(await dueno(empezada.id, { estado: 'confirmada' }))) && /transicion_invalida/.test(err(await dueno(t.id, { estado: 'pagada' }))));
  const hist = (await ver(e1.id)).historial;
  ok('T12 el historial anota cada paso con quién lo hizo', hist.length === 3 && hist[0].por === 'cliente' && hist[1].por === 'recepcion' && hist[2].estado === 'pagada' && hist.every((h) => h.t > 0), hist);

  // ---------- 7. Avisos y lista de espera ----------
  const av = (await leer(NEG, 'avisos', { pin: DUENO })).filas.filter((f) => f.data.reserva === a.id);
  ok('A1 cada reserva programa su confirmación; la que está retenida espera al pago para programar recordatorio y opinión', av.length >= 2 && av.every((f) => /^(programado|enviado)/.test(f.data.estado) && f.data.texto.includes(pa.codigo)), av.length);
  const avCancel = (await leer(NEG, 'avisos', { pin: DUENO })).filas.filter((f) => f.data.reserva === t.id && f.data.tipo === 'cancelacion');
  ok('A2 al cancelar se programa el aviso de cancelación (con la devolución)', avCancel.length >= 1 && avCancel[0].data.texto.includes('cancelada'));
  ok('A3 un cliente no puede inventar avisos', err(await escribir(NEG, 'avisos', 'zzavisofalso', { texto: 'spam' }, { modo: 'poner' })) === 'sin permiso');
  const esp = await escribir(NEG, 'espera', 'zzesp1abc', { agenda: 'cabanas', sel: { recurso: 'copihue', llegada: mas(350), salida: mas(352) }, cliente: { nombre: 'Interesada', correo: 'esp@prueba.cl' }, avisado: true }, { modo: 'poner' });
  const pesp = (await leer(NEG, 'espera', { pin: DUENO })).filas.find((f) => f.id === 'zzesp1abc');
  ok('E1 el cliente se anota en la lista de espera (con datos limpios; no puede marcarse "avisada")', esp.ok === true && pesp.data.avisado === false && pesp.data.cliente.nombre === 'Interesada');
  ok('E2 sin contacto válido o sin agenda se rechaza, y el cliente no puede editar su anotación', /datos:contacto/.test(err(await escribir(NEG, 'espera', 'zzesp2abc', { agenda: 'cabanas', sel: {}, cliente: { nombre: 'Sin contacto' } }, { modo: 'poner' }))) && err(await escribir(NEG, 'espera', 'zzesp1abc', { avisado: true }, { modo: 'parchar' })) === 'sin permiso');
  const lib = await crear('cabanas', { recurso: 'copihue', llegada: mas(350), salida: mas(352) });
  await cliente(lib.id, { estado: 'cancelada' });
  const pesp2 = (await leer(NEG, 'espera', { pin: DUENO })).filas.find((f) => f.id === 'zzesp1abc');
  ok('E3 al liberarse esa fecha, la lista de espera queda avisada y se programa su aviso', pesp2.data.avisado === true && (await leer(NEG, 'avisos', { pin: DUENO })).filas.some((f) => f.data.tipo === 'espera' && f.data.para === 'esp@prueba.cl'));

  // ---------- 8. Qué ve cada persona ----------
  const lectura = await leer(NEG, 'reservas', { ids: [a.id] });
  ok('P1 el cliente ve solo su reserva completa; de las demás, solo la proyección pública (sin nombre, contacto, código ni precio)', (lectura.mios || []).length === 1 && lectura.mios[0].id === a.id && (lectura.pub || []).length > 3 && (lectura.pub || []).every((p) => Object.keys(p).sort().join() === 'd,e,h,m,n,r,u,x'), Object.keys((lectura.pub || [{}])[0]));
  ok('P2 sin su código secreto no se ve ninguna reserva ajena', (await leer(NEG, 'reservas', { ids: ['zzr0000none'] })).mios.length === 0);
  ok('P3 el equipo ve todo (con PIN)', (await leer(NEG, 'reservas', { pin: RECEP })).filas.length > 10 && (await leer(NEG, 'reservas', { pin: '000000' })).staff === false);

  // ---------- 9. Cotización pública ----------
  const cot = await rpc('reserva_cotizar', { p_neg: NEG, p_ag: 'cabanas', p_sel: { recurso: 'copihue', llegada: mas(250, llega), salida: mas(252, llega), personas: 2 }, p_codigo: 'BIENVENIDA10' });
  const cotLocal = Motor.precio({ config: copia(CABANAS), reservas: [], bloqueos: [] }, { recurso: 'copihue', llegada: mas(250, llega), salida: mas(252, llega), personas: 2 }, 'BIENVENIDA10');
  ok('Q1 el cliente ve el precio calculado por el servidor, con su código de descuento', cot.ok === true && cot.precio.total === cotLocal.total && cot.precio.promo && cot.precio.promo.codigo === 'BIENVENIDA10', [cot.precio && cot.precio.total, cotLocal.total]);
  ok('Q2 un código inventado no da descuento y avisa', (await rpc('reserva_cotizar', { p_neg: NEG, p_ag: 'cabanas', p_sel: { recurso: 'copihue', llegada: mas(250, llega), salida: mas(252, llega) }, p_codigo: 'INVENTADO' })).precio.promo.error === 'El código no existe o ya no está vigente.');
  ok('Q3 pedir el precio de algo ocupado devuelve el motivo', (await rpc('reserva_cotizar', { p_neg: NEG, p_ag: 'cabanas', p_sel: { recurso: 'copihue', llegada: l2, salida: s2 } })).error === 'ocupado');
  const conCod = await crear('cabanas', { recurso: 'copihue', llegada: mas(250, llega), salida: mas(252, llega), personas: 2 }, { codigo: 'bienvenida10' });
  ok('Q4 el código aplicado al reservar descuenta lo mismo que la cotización', (await ver(conCod.id)).precio.total === cot.precio.total);
  await publicar({ ...CABANAS, promos: [{ codigo: 'UNICA', tipo: 'monto', valor: 5000, minimo: 0, activa: true, usos: 0, usosMax: 1 }] });
  const u1 = await crear('cabanas', { recurso: 'araucaria', llegada: mas(10), salida: mas(11) }, { codigo: 'UNICA' }), u2 = await crear('cabanas', { recurso: 'araucaria', llegada: mas(12), salida: mas(13) }, { codigo: 'UNICA' });
  const pu1 = (await ver(u1.id)).precio, pu2 = (await ver(u2.id)).precio;
  ok('Q5 un código con 1 uso máximo funciona una sola vez', pu1.promo && pu1.promo.codigo === 'UNICA' && pu1.descuento >= 5000 && pu2.promo && !!pu2.promo.error, [pu1.promo, pu2.promo]);
  await publicar(CABANAS);

  // ---------- 10. Los otros tres modos ----------
  const dTour = proxDow(3, 25);
  const t1 = await crear('tours', { servicio: 'cerro', fecha: dTour, min: 540, personas: 5 }), t2 = await crear('tours', { servicio: 'cerro', fecha: dTour, min: 540, personas: 5 }), t3 = await crear('tours', { servicio: 'cerro', fecha: dTour, min: 540, personas: 5 });
  ok('U1 tour con 12 cupos: caben 5 + 5; las otras 5 se rechazan indicando cuántos quedan', t1.ok && t2.ok && err(t3) === 'cupos:2', [t1.ok, t2.ok, err(t3)]);
  ok('U2 un tour exige su mínimo de personas, una salida que existe y un día en que sale', /minimo_personas:2/.test(err(await crear('tours', { servicio: 'kayak', fecha: proxDow(4, 25), min: 600, personas: 1 }))) && /sin_salida/.test(err(await crear('tours', { servicio: 'cerro', fecha: dTour, min: 600, personas: 2 }))) && /sin_salida/.test(err(await crear('tours', { servicio: 'vino', fecha: proxDow(3, 25), min: 540, personas: 2 }))));
  const pt = Motor.precio({ config: copia(TOURS), reservas: [], bloqueos: [] }, { servicio: 'cerro', fecha: dTour, min: 540, personas: 5 });
  ok('U3 el precio del tour (por persona, con descuento por grupo o anticipación) coincide con el motor', (await ver(t1.id)).precio.total === pt.total && (await ver(t1.id)).precio.motivo === pt.motivo, [(await ver(t1.id)).precio.total, pt.total]);
  const dMed = proxDow(1, 10);
  const m = [];
  for (let i = 0; i < 3; i++) m.push(await crear('medico', { servicio: 'general', fecha: dMed, min: 600 }));
  const recursosAsignados = (await Promise.all(m.filter((x) => x.ok).map((x) => ver(x.id)))).map((x) => x.recurso);
  ok('H1 consulta general a la misma hora: la 1ª va al box 1, la 2ª al box 2 (pediatra que también atiende general) y la 3ª se rechaza', m[0].ok && m[1].ok && err(m[2]) === 'ocupado' && recursosAsignados.join() === 'box1,box2', recursosAsignados);
  ok('H2 una hora fuera del horario o fuera de la grilla se rechaza', /fuera_horario/.test(err(await crear('medico', { servicio: 'general', fecha: dMed, min: 7 * 60 }))) && /fuera_horario/.test(err(await crear('medico', { servicio: 'general', fecha: dMed, min: 600 + 7 }))) && /fuera_horario/.test(err(await crear('medico', { servicio: 'general', fecha: proxDow(0, 10), min: 600 }))));
  ok('H3 cerca de la hora de cierre no cabe una atención larga', /fuera_horario/.test(err(await crear('medico', { servicio: 'kine', fecha: dMed, min: 18 * 60 + 30 }))));
  ok('H4 la anticipación mínima de la política se respeta (reservar para dentro de 1 hora no)', /ya_paso/.test(err(await crear('medico', { servicio: 'general', fecha: hoyCL(), min: 23 * 60 }))) || /fuera_horario/.test(err(await crear('medico', { servicio: 'general', fecha: hoyCL(), min: 23 * 60 }))));
  const dEsp = proxDow(2, 15);
  const e2 = await crear('espacios', { recurso: 'taller', fecha: dEsp, min: 600, horas: 3, personas: 15 });
  const pe = Motor.precio({ config: copia(ESPACIOS), reservas: [], bloqueos: [] }, { recurso: 'taller', fecha: dEsp, min: 600, horas: 3, personas: 15 });
  ok('S1 arriendo de sala por bloques: precio por hora y descuento por duración igual al del motor', e2.ok && (await ver(e2.id)).precio.total === pe.total && (await ver(e2.id)).hasta - (await ver(e2.id)).desde === 3 * 36e5, [(await ver(e2.id)).precio.total, pe.total]);
  ok('S2 mínimo de horas, capacidad y empalme de horarios se controlan', /horas_min:2/.test(err(await crear('espacios', { recurso: 'taller', fecha: dEsp, min: 840, horas: 1, personas: 5 }))) && /capacidad:20/.test(err(await crear('espacios', { recurso: 'taller', fecha: dEsp, min: 840, horas: 2, personas: 30 }))) && err(await crear('espacios', { recurso: 'taller', fecha: dEsp, min: 660, horas: 2, personas: 5 })) === 'ocupado');
  const dSal = proxDow(2, 12);
  const s1 = await crear('salon', { servicio: 'corte', fecha: dSal, min: 660 }), s2b = await crear('salon', { servicio: 'corte', fecha: dSal, min: 660 }), s3b = await crear('salon', { servicio: 'corte', fecha: dSal, min: 660 });
  ok('S3 salón con dos estilistas para "corte": la tercera cita a la misma hora se rechaza; el margen entre citas (10 min) se respeta', s1.ok && s2b.ok && err(s3b) === 'ocupado' && err(await crear('salon', { servicio: 'corte', fecha: dSal, min: 705 })) === 'ocupado' && (await crear('salon', { servicio: 'corte', fecha: dSal, min: 720 })).ok === true);
  const sa = await ver(s1.id), sb = await ver(s2b.id);
  ok('S4 el servidor reparte las dos citas entre las dos estilistas y la cita guarda el margen', [sa.recurso, sb.recurso].sort().join() === 'est1,est2' && sa.hasta - sa.desde === (45 + 10) * 60000);

  // ---------- 11. Paridad del precio en muchas combinaciones ----------
  let iguales = 0, total = 0, dif = [];
  const base = proxDow(1, 40);
  const casos = [];
  for (let i = 0; i < 6; i++) casos.push(['cabanas', CABANAS, { recurso: ['copihue', 'araucaria', 'familiar'][i % 3], llegada: mas(i * 9, base), salida: mas(i * 9 + 2 + (i % 4), base), personas: 2, extras: i % 2 ? ['romantica', 'tinaja'] : [] }, i % 3 === 0 ? 'INVIERNO15' : '']);
  for (let i = 0; i < 4; i++) casos.push(['tours', TOURS, { servicio: 'cerro', fecha: proxDow([2, 4, 5, 6][i], 30 + i * 7), min: i % 2 ? 900 : 540, personas: 1 + i * 2 }, i === 1 ? 'AMIGOS' : '']);
  for (let i = 0; i < 3; i++) casos.push(['espacios', ESPACIOS, { recurso: ['reunion', 'taller', 'eventos'][i], fecha: proxDow(3, 20 + i), min: 540, horas: [1, 2, 4][i] + (i === 2 ? 1 : 0), personas: 5 }, i === 0 ? 'EMPRENDE20' : '']);
  for (let i = 0; i < 2; i++) casos.push(['salon', SALON, { servicio: ['color', 'peinado'][i], fecha: proxDow(4, 14 + i), min: 12 * 60 + i * 60 }, i === 0 ? 'PRIMERAVEZ' : '']);
  for (const [ag, cfg, sel, cod] of casos) {
    const res = await crear(ag, sel, { codigo: cod });
    if (!res.ok) { dif.push([ag, err(res)]); total++; continue; }
    const doc = await ver(res.id), loc = Motor.precio({ config: copia(cfg), reservas: [], bloqueos: [] }, sel, cod);
    total++; if (doc.precio.total === loc.total && doc.precio.descuento === loc.descuento && doc.precio.deposito === loc.deposito && doc.precio.motivo === loc.motivo) iguales++; else dif.push([ag, sel, doc.precio.total, loc.total]);
  }
  ok('X1 el precio del servidor y el del motor del navegador coinciden en ' + total + ' combinaciones de los 4 modos (con fines de semana, temporadas, extras, descuentos y códigos)', iguales === total, dif);

  // ---------- 12. Estados que el servidor cierra solo y cargas masivas ----------
  ok('Z1 las cargas masivas de datos de muestra no pasan por las reglas (solo con el PIN del jefe)', (await importar(NEG, 'reservas', RECEP, [{ id: 'zzrmasiva1', data: { x: 1 } }])).error === 'sin permiso');

  {
  // ---------- 13. Lo que usa el panel del negocio ----------
  const bq = await bl('zzbq1abc', 'familiar', mas(210), mas(213), RECEP);
  const ocupadoAntes = err(await crear('cabanas', { recurso: 'familiar', llegada: mas(210), salida: mas(212) })) === 'ocupado';
  const quitaCliente = err(await escribir(NEG, 'bloqueos', 'zzbq1abc', { quitado: true }, { modo: 'parchar' }));
  const quita = await escribir(NEG, 'bloqueos', 'zzbq1abc', { quitado: true }, { pin: RECEP, modo: 'parchar' });
  const librePues = await crear('cabanas', { recurso: 'familiar', llegada: mas(210), salida: mas(212) });
  const pubQ = (await leer(NEG, 'bloqueos', {})).pub || [];
  ok('Q1 quitar un bloqueo: antes bloqueaba, un cliente no puede quitarlo, la recepción sí, y las fechas vuelven a venderse y dejan de publicarse como bloqueadas', bq.ok === true && ocupadoAntes && quitaCliente === 'sin permiso' && quita.ok === true && librePues.ok === true && !pubQ.some((p) => p.e === 'bloqueo' && p.d === U.fdate(mas(210)).getTime()), [bq, ocupadoAntes, quitaCliente, quita, err(librePues)]);
  const cs = await crear('cabanas', { recurso: 'copihue', llegada: mas(230), salida: mas(232) });
  const pcs = await ver(cs.id), depS = pcs.precio.deposito, totS = pcs.precio.total;
  await recep(cs.id, { estado: 'pagada', pagado: depS });
  const saldoCli = await cliente(cs.id, { pagado: totS });
  const sinCambioCli = (await ver(cs.id)).pagado === depS;
  const saldoRec = await recep(cs.id, { pagado: totS });
  const pcs2 = await ver(cs.id);
  ok('S1 cobrar el saldo: el cliente no puede subir lo pagado; la recepción sí (sin cambiar el estado, nunca más que el total) y queda anotado en el historial', sinCambioCli && saldoRec.ok === true && pcs2.pagado === totS && pcs2.estado === 'pagada' && pcs2.historial.some((h) => h.cobro === totS && h.por === 'recepcion') && depS < totS, [depS, totS, pcs2.pagado, saldoCli]);
  const sobre = await recep(cs.id, { pagado: totS * 10 });
  ok('S2 aunque se pida más, lo pagado nunca supera el total', (await ver(cs.id)).pagado === totS, sobre);
  const PIN_R2 = '963852', gp = (rol, nom, pinN, act, pinA, pin = DUENO) => rpc('nube_personal_guardar', { p_neg: NEG, p_pin: pin, p_rol: rol, p_nombre: nom, p_pin_nuevo: pinN, p_activo: act, p_pin_actual: pinA });
  let alta = await gp('recepcion', 'Recepción 2', PIN_R2, true, null); if (/ya lo usa/.test(err(alta))) alta = await gp('recepcion', 'Recepción 2', PIN_R2, true, PIN_R2);
  const comoR2 = await leer(NEG, 'reservas', { pin: PIN_R2 });
  const r2NoCrea = err(await gp('recepcion', 'Otra', '147258', true, null, RECEP));
  const baja = await gp('recepcion', 'Recepción 2', PIN_R2, false, PIN_R2);
  const trasBaja = await leer(NEG, 'reservas', { pin: PIN_R2 });
  ok('P1 el jefe crea personal de recepción con su PIN (ve las reservas), la recepción no crea personal, y al desactivarlo deja de ver todo', alta.ok === true && comoR2.staff === true && r2NoCrea === 'sin permiso' && baja.ok === true && trasBaja.staff !== true, [alta, r2NoCrea, baja]);
  }
} catch (e) { r.ERROR = String(e && e.stack || e); }
finally {
  for (const c of ['reservas', 'avisos', 'espera', 'bloqueos', 'promos', 'config']) await vaciar(NEG, c, DUENO).catch(() => {});
}
console.log(JSON.stringify(r, null, 1));
process.exitCode = Object.values(r).every((v) => v === 'ok') ? 0 : 1;
