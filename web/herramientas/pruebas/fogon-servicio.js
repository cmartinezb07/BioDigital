// Caso base conectado de Fogón del Sur: tres clientes (mesa, retiro y delivery) piden, la cocina y el repartidor los atienden con
// su PIN, el cliente sigue su pedido y el dueño ve todo. Se corre sobre el panel del dueño. Nada avanza solo: cada paso lo marca una persona.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const P = Pedidos;
Nube.pin('fogon', null);
// 0. Restos de una corrida anterior
for (const n of ['mesa', 'retiro', 'delivery', 'duplicado']) await Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-prueba ' + n } } });
// 1. Las pantallas del equipo piden PIN y rechazan los equivocados
ok('1 el panel del dueño pide PIN', !!document.querySelector('.nube-vel'));
ok('1b un PIN equivocado no entra', (await Nube.rol('fogon', '000000')) === null);
ok('1c cada PIN tiene su rol', (await Nube.rol('fogon', '247135')) === 'cocina' && (await Nube.rol('fogon', '913572')) === 'reparto' && (await Nube.rol('fogon', '482916')) === 'dueno');
// 2. Tres clientes piden desde su celular (cada uno con su propia sesión: un cliente solo puede tener un pedido "Nuevo" a la vez)
const nuevaSesion = () => localStorage.setItem('fogon-sesion-fogon', Nube.idNuevo());
const base = (tipo, nombre, extra) => Object.assign({ tipo, cliente: { nombre: 'zz-prueba ' + nombre, telefono: '+56912345678', direccion: 'Lincoyán 300', comuna: tipo === 'delivery' ? 'Concepción' : '' }, items: [{ id: 'lomo', nombre: 'Lomo', precio: 13900, cant: 2, prep: 25 }, { id: 'limonada', nombre: 'Limonada', precio: 3500, cant: 1, prep: 4 }], pago: { metodo: 'caja', pagado: false } }, extra || {});
nuevaSesion(); const mesa = await P.crear(base('mesa', 'mesa', { mesa: 5 }));
nuevaSesion(); const retiro = await P.crear(base('retiro', 'retiro', { pago: { metodo: 'linea', pagado: false } }));
nuevaSesion(); const deliv = await P.crear(base('delivery', 'delivery'));
ok('2 los tres pedidos nacen "recibidos" con su tiempo estimado', [mesa, retiro, deliv].every((p) => p.estado === 'recibido' && p.prepMin >= 25 && p.prepMin <= 45), JSON.stringify([mesa.prepMin, retiro.prepMin, deliv.prepMin]));
ok('2b mesa y retiro no llevan envío; el delivery sí, con destino y km', mesa.envio === 0 && retiro.envio === 0 && deliv.envio === 1500 && deliv.km > 0 && !!deliv.destino);
ok('2c el flujo del delivery tiene el paso "en camino"; los otros no', P.FLUJO.delivery.includes('camino') && !P.FLUJO.mesa.includes('camino') && !P.FLUJO.retiro.includes('camino'));
ok('2d los textos cambian según cómo se pidió', P.nombreEstado(Object.assign({}, mesa, { estado: 'listo' })) === 'Listo: va a tu mesa' && P.nombreEstado(Object.assign({}, retiro, { estado: 'listo' })) === 'Listo para retirar' && /repartidor/.test(P.nombreEstado(Object.assign({}, deliv, { estado: 'listo' }))));
nuevaSesion();
let dup = ''; try { await P.crear(base('retiro', 'duplicado')); await P.crear(base('retiro', 'duplicado')); } catch (e) { dup = e.message; }
ok('2e un cliente no puede tener dos pedidos "Nuevos" a la vez: el servidor lo rechaza y explica', /pendiente|Modificar/i.test(dup), dup);
// 3. La cocina acepta y marca cada paso (nada avanza solo, y no se puede saltar de "recibido" a "preparación")
Nube.pin('fogon', '247135'); P.entrarEquipo(); await dormir(300);
await dormir(2500);
ok('3 sin que nadie toque nada, siguen "recibidos"', [mesa, retiro, deliv].every((p) => P.obtener(p.id).estado === 'recibido'));
P.cambiar(mesa.id, 'listo'); await P.guardado(); await dormir(800);
ok('3a el servidor no deja saltarse pasos (recibido → listo)', (await Nube.leer('fogon', 'pedidos', { ids: [mesa.id] })).mios[0].data.estado === 'recibido');
[mesa, deliv].forEach((p) => P.aceptar(p.id, 30)); P.aceptar(retiro.id, 20);
await P.guardado(); await dormir(300);
[mesa, retiro, deliv].forEach((p) => P.cambiar(p.id, 'preparacion'));
await P.guardado(); await dormir(200);
[mesa, retiro, deliv].forEach((p) => P.cambiar(p.id, 'listo'));
P.cambiar(mesa.id, 'entregado', { pago: { metodo: 'caja', pagado: true, cuando: Date.now() } }); P.cambiar(retiro.id, 'entregado', { pago: { metodo: 'linea', pagado: true, cuando: Date.now() } });
await P.guardado();
ok('3b la cocina ajusta el tiempo estimado de un pedido al aceptarlo', P.obtener(retiro.id).prepMin === 20);
// 4. El repartidor toma el delivery y comparte su ubicación; el cliente lo ve
Nube.pin('fogon', '913572'); P.entrarEquipo(); await dormir(2500);
await P.tomarEntrega(deliv.id);
await dormir(2500);
let segundo = ''; Nube.pin('fogon', '913573'); try { await P.tomarEntrega(deliv.id); } catch (e) { segundo = e.message; } Nube.pin('fogon', '913572');
ok('4a el servidor no deja que un segundo repartidor tome el mismo pedido', segundo !== '', segundo);
await P.fijarRuta(deliv.id); await dormir(300);
const conRuta = P.obtener(deliv.id);
ok('4 el delivery sale con su ruta por calles', Array.isArray(conRuta.ruta) && conRuta.ruta.length > 1 && conRuta.rutaKm > 0, conRuta.rutaKm);
const pasos = conRuta.ruta.filter((_, i) => i % Math.ceil(conRuta.ruta.length / 4) === 0).slice(0, 4);
for (const [la, lo] of pasos) { P.ubicar(deliv.id, la, lo); await dormir(150); }
await P.guardado();
const cliente = (await Nube.leer('fogon', 'pedidos', { ids: [deliv.id] })).mios[0].data;
ok('4b el cliente ve al repartidor moverse (posición y hora)', cliente.estado === 'camino' && cliente.repartidor.lat === pasos[pasos.length - 1][0] && cliente.repartidor.t > 0);
const llegada = P.eta(P.obtener(deliv.id));
ok('4c el tiempo de llegada se recalcula con la distancia', llegada.minutos >= 1 && llegada.minutos < 90, llegada.minutos);
P.cambiar(deliv.id, 'entregado', { pago: { metodo: 'caja', pagado: true, cuando: Date.now() } }); await P.guardado();
// 5. El dueño ve todo: ventas, pagos y tiempos
const dueno = await Nube.leer('fogon', 'pedidos', { pin: '482916' });
const mios = dueno.filas.filter((f) => f.data.cliente && /^zz-prueba (mesa|retiro|delivery)$/.test(f.data.cliente.nombre)).map((f) => f.data);
ok('5 el dueño ve los tres pedidos entregados y pagados', dueno.staff && mios.length === 3 && mios.every((p) => p.estado === 'entregado' && p.pago.pagado), JSON.stringify(mios.map((p) => p.estado + ':' + p.pago.pagado)));
ok('5b cada pedido tiene su historial completo (mesa y retiro 5 pasos, delivery 6)', mios.filter((p) => p.tipo !== 'delivery').every((p) => p.historial.length === 5) && mios.find((p) => p.tipo === 'delivery').historial.length === 6, JSON.stringify(mios.map((p) => p.historial.length)));
const ventas = mios.reduce((s, p) => s + p.total, 0);
ok('5c las ventas suman lo cobrado', ventas === 2 * (13900 * 2 + 3500) + 13900 * 2 + 3500 + 1500, ventas);
// 6. Un cliente no ve los pedidos de otro
const solo = await Nube.leer('fogon', 'pedidos', { ids: [mesa.id] });
ok('6 un cliente solo ve el suyo, no el de otros', solo.mios.length === 1 && solo.pub.length === 0 && solo.mios[0].id === mesa.id);
// 7. Limpieza
const lim = await Nube.borrar('fogon', 'pedidos', '482916', { filtro: { tipo: 'mesa', cliente: { nombre: 'zz-prueba mesa' } } });
await Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-prueba retiro' } } });
await Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-prueba delivery' } } });
await Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-prueba duplicado' } } });
const resto = (await Nube.leer('fogon', 'pedidos', { pin: '482916' })).filas.filter((f) => f.data.cliente && /^zz-prueba/.test(f.data.cliente.nombre));
ok('7 limpieza de la prueba', lim.ok === true && resto.length === 0, resto.length);
Nube.pin('fogon', null);
return r;
