// Prueba de la conexión en la nube (reservas, fidelización y pedidos): permisos por PIN, privacidad del cliente, cupos que no se
// venden dos veces y reglas contra trampas. Habla directo con las funciones de la base, igual que las pantallas.
// Los datos de prueba llevan el prefijo "zz" y se borran al final.
// Uso: node web/herramientas/nube-e2e.mjs        (imprime un JSON; sale con código 1 si algo falla)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const fuente = readFileSync(join(aqui, '../propuesta/ejemplos/_compartido/nube.js'), 'utf8');
const URL_API = /var URL_API = '([^']+)'/.exec(fuente)[1], LLAVE = /var LLAVE = '([^']+)'/.exec(fuente)[1];
const rpc = (fn, cuerpo) => fetch(URL_API + fn, { method: 'POST', headers: { apikey: LLAVE, Authorization: 'Bearer ' + LLAVE, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) }).then((r) => r.json());
const leer = (neg, col, o = {}) => rpc('nube_leer', { p_neg: neg, p_col: col, p_pin: o.pin || null, p_ids: o.ids || null, p_desde: null });
const escribir = (neg, col, id, data, o = {}) => rpc('nube_escribir', { p_neg: neg, p_col: col, p_id: id, p_data: data, p_pub: o.pub || null, p_pin: o.pin || null, p_modo: o.modo || 'poner', p_cupo: o.cupo || null });
const borrar = (neg, col, prefijo) => rpc('nube_borrar', { p_neg: neg, p_col: col, p_pin: '482916', p_prefijo: prefijo, p_filtro: null });

const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + JSON.stringify(extra) : ''); };
const DIA = 864e5, base = Date.now() + 200 * DIA;
const pubRes = (rec, d, h, e = 'confirmada', x = 0, u = 1) => ({ n: 'zz', m: 'n', r: 'zz:' + rec, d, h, u, e, x });
const cupo = (rec, d, h, max, paso = DIA) => ({ r: 'zz:' + rec, d, h, u: 1, max, paso });

try {
  // (1-nov-2026) El bloque de Reservas de esta prueba era anterior a las reglas 006 y daba "sin_agenda"; lo cubre reservas-reglas-e2e.mjs.
  // ---------- Fidelización ----------
  const t1 = await escribir('fidelizacion', 'tarjetas', 'ZZTARJ01', { codigo: 'ZZTARJ01', nombre: 'zz', sellos: 0, visitas: 0, premios: 0 });
  ok('F1 el cliente abre su tarjeta en cero', t1.ok === true, t1);
  const trampa = await escribir('fidelizacion', 'tarjetas', 'ZZTARJ02', { codigo: 'ZZTARJ02', nombre: 'zz', sellos: 5, visitas: 0, premios: 0 });
  ok('F2 no puede abrir una tarjeta con sellos', trampa.error === 'sin permiso', trampa);
  const editar = await escribir('fidelizacion', 'tarjetas', 'ZZTARJ01', { codigo: 'ZZTARJ01', nombre: 'zz', sellos: 8 });
  ok('F3 no puede sumarse sellos a sí mismo', editar.error === 'sin permiso', editar);
  const caja = await escribir('fidelizacion', 'tarjetas', 'ZZTARJ01', { codigo: 'ZZTARJ01', nombre: 'zz', sellos: 1, visitas: 1, premios: 0 }, { pin: '764193' });
  const leida = await leer('fidelizacion', 'tarjetas', { ids: ['ZZTARJ01'] });
  ok('F4 la caja suma el sello y el cliente lo ve', caja.ok === true && leida.mios[0].data.sellos === 1, [caja, leida.mios]);
  const evFalso = await escribir('fidelizacion', 'eventos', 'zzevento01', { id: 'zzevento01', tipo: 'sello', codigo: 'ZZTARJ01', t: Date.now() });
  const evAlta = await escribir('fidelizacion', 'eventos', 'zzevento02', { id: 'zzevento02', tipo: 'alta', codigo: 'ZZTARJ01', t: Date.now() });
  ok('F5 el cliente solo registra su alta, no sellos', evFalso.error === 'sin permiso' && evAlta.ok === true, [evFalso, evAlta]);
  const todas = await leer('fidelizacion', 'tarjetas', { pin: '764193' }), sinPin = await leer('fidelizacion', 'tarjetas');
  ok('F6 la caja ve todas las tarjetas; un cliente sin código ve ninguna', todas.staff && todas.filas.some((f) => f.id === 'ZZTARJ01') && sinPin.mios.length === 0 && sinPin.pub.length === 0);
  const cajaReservas = await leer('reservas', 'reservas', { pin: '764193' });
  ok('F7 el PIN de la caja no abre las reservas', cajaReservas.staff === false);

  // ---------- Pedidos (el detalle de las reglas está en pedidos-reglas-e2e.mjs) ----------
  const ped = { tipo: 'retiro', cliente: { nombre: 'zz-e2e', telefono: '+56912345678' }, items: [{ id: 'limonada', nombre: 'x', precio: 3500, cant: 1 }], pago: { metodo: 'caja', pagado: false } };
  const nuevo = await escribir('fogon', 'pedidos', 'zzpedido01', ped);
  const otroCliente = await leer('fogon', 'pedidos', { ids: ['zzpedido99'] });
  ok('P1 otro cliente no ve el pedido ajeno', nuevo.ok === true && otroCliente.mios.length === 0 && otroCliente.pub.length === 0);
  const clienteCambia = await escribir('fogon', 'pedidos', 'zzpedido01', { estado: 'entregado' }, { modo: 'parchar' });
  const clientePaga = await escribir('fogon', 'pedidos', 'zzpedido01', { pago: { metodo: 'linea', pagado: true } }, { modo: 'parchar' });
  const clienteReemplaza = await escribir('fogon', 'pedidos', 'zzpedido01', { ...ped, estado: 'entregado' }, { modo: 'poner' });
  ok('P2 el cliente no puede cambiar el estado de su pedido (ni reemplazarlo); solo agregar su pago', clienteCambia.error === 'sin permiso' && clienteReemplaza.duplicado === true && (await leer('fogon', 'pedidos', { ids: ['zzpedido01'] })).mios[0].data.estado === 'recibido' && clientePaga.ok === true, [clienteCambia, clienteReemplaza, clientePaga]);
  const nacerEntregado = await escribir('fogon', 'pedidos', 'zzpedido02', { ...ped, estado: 'entregado' });
  ok('P2b un pedido nuevo no puede nacer ya entregado', nacerEntregado.error === 'sin permiso', nacerEntregado);
  const cocinaVe = await leer('fogon', 'pedidos', { pin: '247135' });
  ok('P3 la cocina ve los pedidos con sus datos', cocinaVe.staff && cocinaVe.filas.some((f) => f.id === 'zzpedido01'));
  const repartoVisitas = await leer('fogon', 'visitas', { pin: '913572' });
  ok('P4 el repartidor no ve las visitas (solo el dueño)', repartoVisitas.staff === false);
  const spam = await Promise.all(Array.from({ length: 3 }, (_, i) => escribir('fogon', 'visitas', 'zzvisita0' + i, { t: Date.now(), origen: 'zz' })));
  ok('P5 las visitas se registran sin PIN', spam.every((x) => x.ok === true));
} catch (e) {
  r['ERROR de la prueba'] = 'FALLÓ → ' + e.message;
} finally {
  const lims = await Promise.all([['reservas', 'reservas'], ['reservas', 'config'], ['fidelizacion', 'tarjetas'], ['fidelizacion', 'eventos'], ['fogon', 'pedidos'], ['fogon', 'visitas']].map(([n, c]) => borrar(n, c, n === 'fidelizacion' && c === 'tarjetas' ? 'ZZ' : c === 'config' ? 'cfg-zz' : 'zz')));
  const quedan = await leer('reservas', 'reservas', { pin: '482916' });
  ok('Z limpieza: no queda nada de la prueba', lims.every((l) => l.ok) && !quedan.filas.some((f) => /^zz/.test(f.id)), lims);
}
console.log(JSON.stringify(r, null, 2));
const malas = Object.values(r).filter((v) => v !== 'ok');
console.error(`${Object.keys(r).length - malas.length}/${Object.keys(r).length} pruebas de la nube sin fallas`);
process.exitCode = malas.length ? 1 : 0;
