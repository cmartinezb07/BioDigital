// Reglas de los pedidos del restaurante, probadas directo contra la base (no solo en la pantalla): validación de datos y precios,
// un único pedido nuevo por sesión, modificar el pedido original (sin duplicarlo) solo mientras está "Nuevo", transiciones de estado
// por rol, asignación de repartidores, historial que no se pisa, opiniones y carreras entre acciones simultáneas.
// Los datos de la prueba usan nombres "zz-reglas" y se borran al final.
// Uso: node web/herramientas/pedidos-reglas-e2e.mjs        (imprime un JSON; sale con código 1 si algo falla)
import { leer, escribir, borrar, PIN, rpc } from './nube-node.mjs';

const NEG = 'fogon', r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra !== undefined ? ' → ' + JSON.stringify(extra) : ''); };
const err = (x) => (x && x.error) || '';
const uid = () => 'zzp' + Math.random().toString(36).slice(2, 12);
const sesion = () => 'zzs' + Math.random().toString(36).slice(2, 10);
const lomo = (cant = 1, extra = {}) => ({ id: 'lomo', nombre: 'x', precio: 13900, cant, ...extra });
const limo = (cant = 1) => ({ id: 'limonada', nombre: 'x', precio: 3500, cant });
const base = (o = {}) => ({ tipo: 'retiro', cliente: { nombre: 'zz-reglas', telefono: '+56912345678', direccion: '', comuna: '' }, items: [lomo(1), limo(2)], nota: '', pago: { metodo: 'caja', pagado: false }, sesion: sesion(), referencia: '', ...o });
const crear = (d, id = uid()) => escribir(NEG, 'pedidos', id, d, { modo: 'poner' }).then((x) => ({ ...x, id }));
const ver = async (id, pin) => { const x = await leer(NEG, 'pedidos', pin ? { pin } : { ids: [id] }); const f = (x.mios || x.filas || []).find((q) => q.id === id); return f && f.data; };
const como = (pin) => (id, data, modo = 'parchar') => escribir(NEG, 'pedidos', id, data, { pin, modo });
const cliente = (id, data) => escribir(NEG, 'pedidos', id, data, { modo: 'parchar' });
const cocina = como(PIN.cocina), reparto1 = como(PIN.reparto), reparto2 = como(PIN.reparto2), dueno = como(PIN.dueno);

try {
  // ---------- 1. Validación de datos y precios (en el servidor) ----------
  const a = await crear(base({ total: 1, subtotal: 1, envio: 99999 }));
  const pa = await ver(a.id);
  ok('V1 el pedido nace "recibido" con id único, historial y versión 1', a.ok === true && pa.estado === 'recibido' && pa.rev === 1 && pa.historial.length === 1 && pa.historial[0].estado === 'recibido' && Array.isArray(pa.ediciones) && pa.ediciones.length === 0, pa);
  ok('V2 los totales los calcula el servidor (se ignora un total inventado por el cliente)', pa.subtotal === 20900 && pa.envio === 0 && pa.total === 20900, [pa.subtotal, pa.envio, pa.total]);
  ok('V3 cada línea guarda nombre y precio de la carta en ese momento', pa.items[0].nombre === 'Lomo a la parrilla con papas y arroz' && pa.items[0].precio === 13900 && pa.items[1].nombre.startsWith('Limonada'), pa.items);
  ok('V4 un precio manipulado se rechaza', /precio_cambio/.test(err(await crear(base({ items: [lomo(1, { precio: 100 })] })))));
  ok('V5 un plato que no existe se rechaza', /plato_inexistente/.test(err(await crear(base({ items: [{ id: 'noexiste', nombre: 'x', precio: 100, cant: 1 }] })))));
  ok('V6 un plato agotado no se puede pedir', /plato_agotado/.test(err(await crear(base({ items: [{ id: 'mote', nombre: 'x', precio: 3500, cant: 1 }] })))));
  ok('V7 una cantidad fuera de rango se rechaza', /cantidad_invalida/.test(err(await crear(base({ items: [lomo(0)] })))) && /cantidad_invalida/.test(err(await crear(base({ items: [lomo(99)] })))));
  ok('V8 una opción obligatoria sin elegir se rechaza', /opcion_invalida/.test(err(await crear(base({ items: [{ id: 'cerveza', nombre: 'x', precio: 4200, cant: 1 }] })))));
  const conOpc = await crear(base({ items: [{ id: 'cerveza', nombre: 'x', precio: 8700, cant: 1, opc: ['tam:jarro'] }, { id: 'cesar', nombre: 'x', precio: 9400, cant: 1, opc: ['extras:palta'] }] }));
  const pco = conOpc.ok && await ver(conOpc.id);
  ok('V9 las opciones suman su extra y quedan escritas en la línea', conOpc.ok === true && pco.total === 18100 && pco.items[0].opciones[0].opcion === 'Jarro 1 litro', pco);
  ok('V10 una opción inventada o un precio sin su extra se rechaza', /opcion_invalida|precio_cambio/.test(err(await crear(base({ items: [{ id: 'cerveza', nombre: 'x', precio: 4200, cant: 1, opc: ['tam:jarro'] }] })))) && /opcion_invalida/.test(err(await crear(base({ items: [{ id: 'cerveza', nombre: 'x', precio: 4200, cant: 1, opc: ['tam:gigante'] }] })))));
  ok('V11 faltan datos: nombre, celular, mesa, dirección y comuna se piden uno a uno', /falta:nombre/.test(err(await crear(base({ cliente: { nombre: '', telefono: '+56912345678' } })))) && /falta:telefono/.test(err(await crear(base({ cliente: { nombre: 'zz-reglas', telefono: '12345' } })))) && /falta:mesa/.test(err(await crear(base({ tipo: 'mesa', mesa: 99 })))) && /falta:direccion/.test(err(await crear(base({ tipo: 'delivery', items: [lomo(1)], cliente: { nombre: 'zz-reglas', telefono: '+56912345678', direccion: '', comuna: 'Concepción' } })))) && /falta:comuna/.test(err(await crear(base({ tipo: 'delivery', items: [lomo(1)], cliente: { nombre: 'zz-reglas', telefono: '+56912345678', direccion: 'Calle 1', comuna: 'Marte' } })))));
  ok('V12 el delivery respeta el pedido mínimo y suma el envío de la comuna', /minimo_delivery/.test(err(await crear(base({ tipo: 'delivery', items: [limo(1)], cliente: { nombre: 'zz-reglas', telefono: '+56912345678', direccion: 'Calle 1', comuna: 'Concepción' } })))));

  // ---------- 2. Un solo pedido nuevo por sesión; sin duplicados ----------
  const s1 = sesion();
  const p1 = await crear(base({ sesion: s1 }));
  const p1b = await crear(base({ sesion: s1 }));
  ok('S1 un segundo pedido nuevo de la misma sesión se rechaza (hay que modificar el que está pendiente)', p1.ok === true && /pedido_activo/.test(err(p1b)), p1b);
  const reintento = await escribir(NEG, 'pedidos', p1.id, base({ sesion: s1 }), { modo: 'poner' });
  const filas = (await leer(NEG, 'pedidos', { pin: PIN.dueno })).filas.filter((f) => f.data.sesion === s1);
  ok('S2 reenviar el mismo pedido (doble clic) no lo duplica ni lo pisa', reintento.ok === true && filas.length === 1 && filas[0].data.rev === 1, filas.length);
  const s2 = sesion();
  const carrera = await Promise.all(Array.from({ length: 5 }, () => crear(base({ sesion: s2 }))));
  const nuevos = (await leer(NEG, 'pedidos', { pin: PIN.dueno })).filas.filter((f) => f.data.sesion === s2);
  ok('S3 cinco pedidos de la misma sesión al mismo tiempo: queda uno solo', carrera.filter((x) => x.ok).length === 1 && nuevos.length === 1, [carrera.filter((x) => x.ok).length, nuevos.length]);

  // ---------- 3. Modificar el pedido original mientras es "Nuevo" ----------
  const nuevoItems = [lomo(2), limo(2), { id: 'cesar', nombre: 'x', precio: 9400, cant: 1, opc: ['extras:palta'] }];
  const m1 = await cliente(p1.id, { items: nuevoItems, nota: 'sin ají', baseRev: 1 });
  const pm = await ver(p1.id);
  ok('M1 modificar actualiza el MISMO pedido (mismo id, versión 2, total recalculado, historial intacto)', m1.ok === true && pm.rev === 2 && pm.total === 27800 + 7000 + 9400 && pm.items.length === 3 && pm.nota === 'sin ají' && pm.historial.length === 1, [m1, pm.rev, pm.total]);
  ok('M2 se guarda la versión anterior en "ediciones" (nada se borra)', pm.ediciones.length === 1 && pm.ediciones[0].rev === 1 && pm.ediciones[0].total === 20900 && pm.ediciones[0].items.length === 2, pm.ediciones);
  const todos = (await leer(NEG, 'pedidos', { pin: PIN.dueno })).filas.filter((f) => f.data.sesion === s1);
  ok('M3 después de modificar sigue habiendo un solo pedido', todos.length === 1);
  const m2 = await cliente(p1.id, { items: [lomo(1)], baseRev: 1 });
  ok('M4 guardar sobre una versión vieja da conflicto y no pisa nada', /conflicto/.test(err(m2)) && (await ver(p1.id)).rev === 2, m2);
  const m3 = await cliente(p1.id, { items: [{ id: 'lomo', nombre: 'x', precio: 1, cant: 1 }], baseRev: 2 });
  ok('M5 al modificar también se revisan los precios', /precio_cambio/.test(err(m3)));
  const vacio = await cliente(p1.id, { items: [], baseRev: 2 });
  ok('M6 un pedido no puede quedar sin productos', /items_invalidos/.test(err(vacio)));
  // la línea que ya estaba se conserva aunque el plato cambie de precio después
  const cartaOrig = (await leer(NEG, 'carta', { ids: ['carta'] })).mios[0].data;
  const cartaCara = JSON.parse(JSON.stringify(cartaOrig)); cartaCara.categorias.forEach((c) => c.platos.forEach((p) => { if (p.id === 'lomo') p.precio = 15900; }));
  await rpc('nube_importar', { p_neg: NEG, p_col: 'carta', p_pin: PIN.dueno, p_filas: [{ id: 'carta', data: cartaCara }] });
  const m7 = await cliente(p1.id, { items: [lomo(3), limo(2), { id: 'cesar', nombre: 'x', precio: 9400, cant: 1, opc: ['extras:palta'] }], baseRev: 2 });
  const p7 = await ver(p1.id);
  ok('M7 si el precio del plato sube después, el pedido conserva el precio con el que se pidió', m7.ok === true && p7.items[0].precio === 13900 && p7.items[0].cant === 3, [m7, p7.items[0]]);
  const m8 = await cliente(p1.id, { items: [lomo(3), limo(2), { id: 'cesar', nombre: 'x', precio: 9400, cant: 1, opc: ['extras:palta'] }, { id: 'lomo', nombre: 'x', precio: 15900, cant: 1, opc: ['termino:jugoso'] }], baseRev: 3 });
  const p8 = await ver(p1.id);
  ok('M8 un producto nuevo se cobra al precio vigente y el anterior conserva el suyo', m8.ok === true && p8.subtotal === 13900 * 3 + 7000 + 9400 + 15900, [m8, p8 && p8.subtotal]);
  await rpc('nube_importar', { p_neg: NEG, p_col: 'carta', p_pin: PIN.dueno, p_filas: [{ id: 'carta', data: cartaOrig }] });

  // ---------- 4. Indicador "el cliente está modificando" ----------
  const f1 = await cliente(p1.id, { modificando: true });
  const pf = await ver(p1.id, PIN.dueno);
  ok('F1 el dueño ve que el cliente está modificando su pedido', f1.ok === true && pf.modificando === true && pf.modificandoDesde > 0, pf);
  const f2 = await cliente(p1.id, { modificando: false });
  ok('F2 al terminar el indicador se apaga', f2.ok === true && (await ver(p1.id)).modificando === false);

  // ---------- 5. Estados: quién puede cambiar qué ----------
  ok('E1 el cliente no puede cambiar el estado de su pedido', /sin permiso/.test(err(await cliente(p1.id, { estado: 'preparacion' }))) && /sin permiso/.test(err(await cliente(p1.id, { estado: 'cancelado' }))));
  ok('E2 el cliente no puede tocar precios, totales, historial ni repartidor', /sin permiso/.test(err(await cliente(p1.id, { historial: [] }))) && /sin permiso/.test(err(await cliente(p1.id, { repartidor: { nombre: 'yo' } }))));
  await cliente(p1.id, { modificando: true });
  const aceptar = await cocina(p1.id, { estado: 'aceptado' });
  const pac = await ver(p1.id);
  ok('E3 la cocina acepta: queda "aceptado", se apaga "modificando" y el historial lo escribe el servidor', aceptar.ok === true && pac.estado === 'aceptado' && pac.modificando === false && pac.historial.length === 2 && pac.historial[1].por === 'cocina' && pac.historial[1].t >= pac.historial[0].t, pac.historial);
  const tarde = await cliente(p1.id, { items: [lomo(5)], baseRev: pac.rev });
  ok('E4 aceptado el pedido, el cliente ya no puede modificarlo', /no_modificable/.test(err(tarde)) && (await ver(p1.id)).items[0].cant === 3, tarde);
  ok('E5 ni siquiera puede marcar que está modificando', /no_modificable/.test(err(await cliente(p1.id, { modificando: true }))));
  ok('E6 un estado no se puede saltar (aceptado no pasa a listo)', /transicion_invalida/.test(err(await cocina(p1.id, { estado: 'listo' }))));
  ok('E7 el repartidor no puede mover un pedido en cocina', /transicion_invalida|sin permiso/.test(err(await reparto1(p1.id, { estado: 'preparacion' }))));
  ok('E8 la cocina no puede cambiar precios ni cantidades', /sin permiso/.test(err(await cocina(p1.id, { items: [lomo(1)] }))) && /sin permiso/.test(err(await cocina(p1.id, { total: 1 }))));
  ok('E9 la cocina empieza a preparar y ajusta el tiempo estimado', (await cocina(p1.id, { estado: 'preparacion', prepMin: 30 })).ok === true && (await ver(p1.id)).prepMin === 30);
  const reab = await cocina(p1.id, { estado: 'recibido' });
  ok('E10 un pedido no vuelve atrás', /transicion_invalida/.test(err(reab)));
  ok('E11 la cocina marca listo y en un retiro lo entrega', (await cocina(p1.id, { estado: 'listo' })).ok === true && (await cocina(p1.id, { estado: 'entregado', pago: { metodo: 'caja', pagado: true } })).ok === true);
  const fin = await ver(p1.id);
  ok('E12 el historial queda completo, en orden y sin pisarse', fin.historial.map((h) => h.estado).join() === 'recibido,aceptado,preparacion,listo,entregado' && fin.historial.every((h, i, l) => !i || h.t >= l[i - 1].t), fin.historial);
  ok('E13 un pedido entregado ya no se modifica', /terminal|no_modificable/.test(err(await cliente(p1.id, { items: [lomo(1)], baseRev: fin.rev }))) && /terminal/.test(err(await cocina(p1.id, { estado: 'preparacion' }))) && /terminal/.test(err(await dueno(p1.id, { estado: 'cancelado' }))));

  // ---------- 6. Delivery: asignación y reparto ----------
  const mkDel = async () => { const x = await crear(base({ tipo: 'delivery', items: [lomo(1)], cliente: { nombre: 'zz-reglas', telefono: '+56912345678', direccion: 'Lincoyán 300', comuna: 'Concepción' } })); await cocina(x.id, { estado: 'preparacion' }); await cocina(x.id, { estado: 'listo' }); return x.id; };
  const d1 = await mkDel();
  ok('D1 el delivery nace con envío de su comuna', (await ver(d1)).envio === 1500 && (await ver(d1)).total === 15400);
  ok('D2 la cocina no puede entregar un delivery sin repartidor', /transicion_invalida/.test(err(await cocina(d1, { estado: 'entregado' }))));
  const asig = await dueno(d1, { asignadoA: 'Repartidor 2' });
  ok('D3 el dueño asigna un repartidor', asig.ok === true && (await ver(d1)).asignadoA === 'Repartidor 2');
  ok('D4 otro repartidor no puede tomar un pedido asignado a alguien más', /asignado_a_otro/.test(err(await reparto1(d1, { estado: 'camino' }))));
  const sale = await reparto2(d1, { estado: 'camino', tomar: true, salida: Date.now() });
  const pd = await ver(d1);
  ok('D5 el repartidor asignado sale: queda "camino" con su nombre', sale.ok === true && pd.estado === 'camino' && pd.asignadoA === 'Repartidor 2' && pd.repartidor.nombre === 'Repartidor 2', pd);
  ok('D6 el repartidor comparte su ubicación', (await reparto2(d1, { repartidor: { nombre: 'Repartidor 2', lat: -36.82, lng: -73.05, t: Date.now(), gps: true } })).ok === true && (await ver(d1)).repartidor.lat === -36.82);
  ok('D7 el repartidor no puede editar precios, cantidades ni la carta', /sin permiso/.test(err(await reparto2(d1, { total: 1 }))) && /sin permiso/.test(err(await reparto2(d1, { items: [] }))) && /sin permiso/.test(err(await rpc('nube_escribir', { p_neg: NEG, p_col: 'carta', p_id: 'carta', p_data: { x: 1 }, p_pin: PIN.reparto2, p_modo: 'parchar' }))));
  ok('D8 el repartidor no entrega pedidos de otro rol ni cambia la asignación de otro', /sin permiso/.test(err(await reparto1(d1, { asignadoA: 'Repartidor 1' }))));
  ok('D9 el repartidor marca entregado y cobrado', (await reparto2(d1, { estado: 'entregado', pago: { metodo: 'caja', pagado: true } })).ok === true && (await ver(d1)).estado === 'entregado');
  const d2 = await mkDel();
  ok('D10 un repartidor libre toma un pedido sin asignar y queda asignado a él', (await reparto1(d2, { estado: 'camino', tomar: true })).ok === true && (await ver(d2)).asignadoA === 'Repartidor 1');
  const d3 = await mkDel();
  const dobleToma = await Promise.all([reparto1(d3, { estado: 'camino', tomar: true }), reparto2(d3, { estado: 'camino', tomar: true })]);
  const pd3 = await ver(d3);
  ok('D11 dos repartidores tomando el mismo pedido a la vez: solo uno lo logra', dobleToma.filter((x) => x.ok).length === 1 && pd3.asignadoA === (dobleToma[0].ok ? 'Repartidor 1' : 'Repartidor 2'), [dobleToma, pd3.asignadoA]);

  // ---------- 7. Opiniones y cancelaciones ----------
  const op1 = await cliente(p1.id, { opinion: { estrellas: 5, recomendaria: true, texto: 'Rico' } });
  const op2 = await cliente(p1.id, { opinion: { estrellas: 1, recomendaria: false, texto: 'otra' } });
  ok('O1 el cliente opina una vez, en un pedido entregado', op1.ok === true && (await ver(p1.id)).opinion.estrellas === 5 && /terminal/.test(err(op2)), [op1, op2]);
  ok('O2 una opinión inválida o en un pedido sin entregar se rechaza', /opinion_invalida|terminal|sin permiso/.test(err(await cliente(d3, { opinion: { estrellas: 5 } }))));
  const resp = await dueno(p1.id, { opinion: { ...(await ver(p1.id)).opinion, respuesta: { texto: 'Gracias por venir' } } });
  ok('O3 el dueño responde la opinión sin poder cambiarla', resp.ok === true && (await ver(p1.id)).opinion.respuesta.texto === 'Gracias por venir' && (await ver(p1.id)).opinion.estrellas === 5);
  ok('O4 el dueño no puede cambiar las estrellas del cliente', /sin permiso/.test(err(await dueno(p1.id, { opinion: { estrellas: 1, respuesta: { texto: 'x' } } }))));
  const c1 = await crear(base());
  const rech = await cocina(c1.id, { estado: 'cancelado', motivo: 'Sin stock' });
  const pc = await ver(c1.id);
  ok('O5 rechazar un pedido nuevo: queda "cancelado" con su motivo y no se puede modificar', rech.ok === true && pc.estado === 'cancelado' && pc.motivo === 'Sin stock' && /terminal/.test(err(await cliente(c1.id, { items: [lomo(1)], baseRev: pc.rev }))), pc);
  const nuevoTrasCancel = await crear(base({ sesion: pc.sesion }));
  ok('O6 después de un pedido cancelado, el cliente puede hacer uno nuevo', nuevoTrasCancel.ok === true);
  const sA = sesion(); const x1 = await crear(base({ sesion: sA })); await cocina(x1.id, { estado: 'aceptado' });
  const x2 = await crear(base({ sesion: sA }));
  ok('O7 aceptado el pedido, una compra nueva de la misma sesión es otro pedido (el anterior no se toca)', x2.ok === true && x2.id !== x1.id && (await ver(x1.id)).items.length === 2);

  // ---------- 8. Carreras: el cliente guarda justo cuando la cocina acepta ----------
  let incoherentes = 0, exitos = 0, bloqueados = 0;
  for (let i = 0; i < 8; i++) {
    const ss = sesion(), y = await crear(base({ sesion: ss }));
    const [mo, ac] = await Promise.all([cliente(y.id, { items: [lomo(4)], baseRev: 1 }), cocina(y.id, { estado: 'aceptado' })]);
    const py = await ver(y.id);
    const modificado = py.items[0].cant === 4;
    if (mo.ok) exitos++; else bloqueados++;
    if (py.estado !== 'aceptado' || ac.ok !== true || modificado !== (mo.ok === true) || (mo.ok && py.rev !== 2) || (!mo.ok && !/no_modificable/.test(err(mo)))) incoherentes++;
    // si la modificación entró, ocurrió ANTES de aceptar (la versión guardada es la que cocinan)
    if (mo.ok && py.historial[1].t < py.ediciones[0].t) incoherentes++;
  }
  ok('R1 guardar y aceptar a la vez nunca deja un pedido a medias (8 intentos: ' + exitos + ' entraron antes, ' + bloqueados + ' se bloquearon)', incoherentes === 0, incoherentes);
  let dobles = 0;
  for (let i = 0; i < 5; i++) {
    const ss = sesion(), y = await crear(base({ sesion: ss }));
    const res = await Promise.all([cliente(y.id, { items: [lomo(2)], baseRev: 1 }), cliente(y.id, { items: [lomo(3)], baseRev: 1 })]);
    const py = await ver(y.id);
    if (res.filter((q) => q.ok).length !== 1 || py.rev !== 2 || py.ediciones.length !== 1) dobles++;
  }
  ok('R2 dos modificaciones a la vez desde la misma versión: solo una entra (la otra da conflicto)', dobles === 0, dobles);

  // ---------- 9. Aislamiento entre restaurantes ----------
  ok('A1 el PIN de un restaurante no sirve en otro', (await leer('otro', 'pedidos', { pin: PIN.dueno })).staff === false && /sin permiso/.test(err(await rpc('nube_importar', { p_neg: 'otro', p_col: 'carta', p_pin: PIN.dueno, p_filas: [{ id: 'carta', data: {} }] }))));
  ok('A2 no se pueden crear pedidos en un restaurante que no existe', /sin permiso/.test(err(await escribir('zzinexistente', 'pedidos', uid(), base(), { modo: 'poner' }))));
  const mio = await leer(NEG, 'pedidos', { ids: [p1.id] });
  ok('A3 un cliente solo ve su pedido, no los demás', mio.mios.length === 1 && mio.pub.length === 0 && !mio.staff);
} catch (e) {
  r['ERROR de la prueba'] = 'FALLÓ → ' + e.message;
} finally {
  const lim = await borrar(NEG, 'pedidos', PIN.dueno, { filtro: { cliente: { nombre: 'zz-reglas' } } });
  await rpc('nube_importar', { p_neg: NEG, p_col: 'carta', p_pin: PIN.dueno, p_filas: [{ id: 'carta', data: (await leer(NEG, 'carta', { ids: ['carta'] })).mios[0].data }] }).catch(() => {});
  const quedan = (await leer(NEG, 'pedidos', { pin: PIN.dueno })).filas.filter((f) => f.data.cliente && f.data.cliente.nombre === 'zz-reglas');
  ok('Z limpieza: no queda nada de la prueba', lim.ok === true && quedan.length === 0, [lim, quedan.length]);
}
console.log(JSON.stringify(r, null, 2));
const malas = Object.entries(r).filter(([, v]) => v !== 'ok');
console.error(`${Object.keys(r).length - malas.length}/${Object.keys(r).length} reglas de pedidos sin fallas`);
process.exitCode = malas.length ? 1 : 0;
