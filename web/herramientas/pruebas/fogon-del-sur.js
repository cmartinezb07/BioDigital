// Guion de prueba de Fogón del Sur (menú digital con pedidos): scroll, carrito, validación visible, opciones, y un pedido real en la nube
// con su tiempo estimado, su recorrido de estados, la modificación del MISMO pedido mientras está "Nuevo" y lo que el cliente puede (y no puede) ver.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const nuevaSesion = () => localStorage.setItem('fogon-sesion-fogon', Nube.idNuevo());   // cada pedido de la prueba como si viniera de otro celular
sessionStorage.removeItem('fogon-carro-2');
await dormir(1200);
// 1. El scroll baja sin que la barra de categorías lo devuelva
const meta = document.getElementById('bebestibles').getBoundingClientRect().top + scrollY - 200;
window.scrollTo({ top: meta, behavior: 'instant' }); await dormir(900);
ok('1 el scroll llega abajo y se queda', Math.abs(scrollY - meta) < 40, scrollY + ' vs ' + Math.round(meta));
ok('1b la categoría activa sigue el scroll', $('.cats a[aria-current="true"]') && /Bebestibles|Postres/.test($('.cats a[aria-current="true"]').textContent));
window.scrollTo({ top: 0, behavior: 'instant' }); await dormir(300);
// 2. La carta sale de los datos: 24 platos con foto, uno agotado, y el carrito suma
const platos = document.querySelectorAll('article.plato');
ok('2 la carta trae los 24 platos, cada uno con su foto real', platos.length === 24 && [...platos].every((a) => { const i = a.querySelector('img'); return i && i.complete && i.naturalWidth > 100; }), platos.length);
ok('2b un solo plato agotado y sin botón para pedirlo', document.querySelectorAll('article.plato.agotado').length === 1 && !document.querySelector('article.plato.agotado .agregar, article.plato.agotado [data-mas]'));
document.querySelector('[data-mas="empanadas"]').click(); document.querySelector('[data-mas="empanadas"]').click(); await dormir(200);
ok('2c el carrito suma', /2.*\$11\.800/.test($('.carrito-btn').textContent), $('.carrito-btn').textContent);
ok('2d no queda nada del 3D en la carta', !document.querySelector('.ver3d, model-viewer, #visor') && !/en tu mesa/i.test(document.body.textContent));
// 3. Validación del formulario de delivery: campos rojos, mensaje claro, cursor en el primero y nada se borra
$('.carrito-btn').click(); await dormir(300);
$('dialog.carrito [data-modo="delivery"]').click(); await dormir(200);
const nom = $('dialog.carrito #c-nombre');
nom.value = 'Prueba'; nom.dispatchEvent(new Event('input', { bubbles: true }));
$('dialog.carrito #c-nombre').value = '';
$('dialog.carrito form').requestSubmit(); await dormir(300);
const cn = getComputedStyle(nom);
ok('3 sin datos no se envía y el mensaje dice qué falta', /nombre|celular|direcci|comuna/i.test($('dialog.carrito .carrito-pie .err').textContent), $('dialog.carrito .carrito-pie .err').textContent);
ok('3b lo que se escribe en el nombre se ve (no es negro sobre fondo oscuro)', cn.color !== 'rgb(0, 0, 0)' && cn.color !== cn.backgroundColor, cn.color + ' sobre ' + cn.backgroundColor);
ok('3c el campo queda marcado en rojo, con su mensaje y el cursor', nom.getAttribute('aria-invalid') === 'true' && nom.closest('.campo').classList.contains('mal') && !!nom.closest('.campo').querySelector('.campo-err').textContent && document.activeElement === nom);
$('dialog.carrito #c-dir').value = 'Calle 1'; $('dialog.carrito #c-dir').dispatchEvent(new Event('input', { bubbles: true }));
nom.value = 'Ana'; nom.dispatchEvent(new Event('input', { bubbles: true })); await dormir(200);
ok('3d al corregir el campo, el error desaparece y lo escrito en otros campos se conserva', !nom.closest('.campo').classList.contains('mal') && $('dialog.carrito #c-dir').value === 'Calle 1');
$('dialog.carrito').close();
// 3e. Un plato con opciones obligatorias pide elegirlas antes de agregarse
const jugo = document.querySelector('[data-id="jugo"] .agregar, [data-id="jugo"] [data-mas], [data-id="jugo"] button');
jugo.click(); await dormir(300);
const dlgOp = document.querySelector('dialog.opciones-dlg');
ok('3e el jugo abre sus opciones (sabor obligatorio)', !!dlgOp && dlgOp.open, !!dlgOp);
if (dlgOp) dlgOp.close();
// 4. Pedido real: viaja a la nube, nace "recibido", con tiempo del plato (lomo 25 min) y envío por comuna
nuevaSesion();
const p = await Pedidos.crear({ tipo: 'delivery', cliente: { nombre: 'zz-prueba', telefono: '+56987654321', direccion: 'Calle 1', comuna: 'Concepción' }, items: [{ id: 'lomo', nombre: 'Lomo a lo pobre', precio: 13900, cant: 1, prep: 25 }], pago: { metodo: 'caja', pagado: false } });
ok('4 el pedido nace "recibido" con envío por comuna y tiempo del plato', p.estado === 'recibido' && p.envio === 1500 && p.total === 15400 && p.prepMin === 25 && p.rev === 1, JSON.stringify([p.estado, p.envio, p.total, p.prepMin, p.rev]));
const e1 = Pedidos.eta(p);
ok('4b tiene tiempo estimado de llegada', e1.minutos > 20 && e1.minutos < 60, e1.minutos);
const mio = await Nube.leer('fogon', 'pedidos', { ids: [p.id] });
const ajeno = await Nube.leer('fogon', 'pedidos', {});
ok('4c el cliente ve su pedido por su código', !mio.staff && mio.mios.length === 1 && mio.mios[0].data.cliente.nombre === 'zz-prueba');
ok('4d sin código no ve ningún pedido', ajeno.mios.length === 0 && ajeno.pub.length === 0 && !ajeno.staff);
// 4e. Modificar el MISMO pedido mientras está "Nuevo": mismo id, versión 2, la anterior queda guardada
const mod = await Pedidos.modificar(p.id, { items: [{ id: 'lomo', nombre: 'Lomo a lo pobre', precio: 13900, cant: 2, prep: 25 }] });
ok('4e modificar cambia el mismo pedido (mismo id, versión 2, total nuevo, versión anterior guardada)', mod.id === p.id && mod.rev === 2 && mod.total === 29300 && mod.ediciones.length === 1 && mod.ediciones[0].total === 15400, JSON.stringify([mod.rev, mod.total, (mod.ediciones || []).length]));
// 4f. La cocina entra con su PIN: acepta y avanza; el cliente ve cada cambio
Nube.pin('fogon', '247135'); Pedidos.entrarEquipo(); await dormir(300);
Pedidos.aceptar(p.id, 25); await Pedidos.guardado();
let rechazo = '';
try { await Pedidos.modificar(p.id, { items: [{ id: 'lomo', nombre: 'Lomo a lo pobre', precio: 13900, cant: 3, prep: 25 }] }); } catch (e) { rechazo = e.message; }
ok('4f aceptado el pedido, ya no se puede modificar (el servidor lo rechaza y lo explica)', /aceptó|ya no|no se puede/i.test(rechazo), rechazo);
Pedidos.cambiar(p.id, 'preparacion'); Pedidos.cambiar(p.id, 'listo'); await Pedidos.guardado();
const vistoCocina = await Nube.leer('fogon', 'pedidos', { pin: '247135' });
const miLeido = await Nube.leer('fogon', 'pedidos', { ids: [p.id] });
ok('4g la cocina ve el pedido y el cliente ve "listo"', vistoCocina.staff && vistoCocina.filas.some((f) => f.id === p.id) && miLeido.mios[0].data.estado === 'listo');
const noVisitas = await Nube.leer('fogon', 'visitas', { pin: '247135' });
const noVaciar = await Nube.vaciar('fogon', 'pedidos', '247135');
ok('4h la cocina no ve las visitas ni puede borrar', !noVisitas.staff && noVaciar.error === 'sin permiso');
// 4i. El repartidor toma el pedido y comparte su ubicación; el cliente la ve
Nube.pin('fogon', '913572');
await Pedidos.tomarEntrega(p.id);
Pedidos.ubicar(p.id, -36.82, -73.05); await Pedidos.guardado();
const enRuta = (await Nube.leer('fogon', 'pedidos', { ids: [p.id] })).mios[0].data;
ok('4i el cliente ve al repartidor en camino con su ubicación', enRuta.estado === 'camino' && enRuta.repartidor && enRuta.repartidor.lat === -36.82, JSON.stringify(enRuta.repartidor));
Pedidos.cambiar(p.id, 'entregado', { pago: { metodo: 'caja', pagado: true, cuando: Date.now() } }); await Pedidos.guardado();
// el historial lo escribe el servidor: se lee desde allí (no del caché de este celular)
const p2 = (await Nube.leer('fogon', 'pedidos', { pin: '482916' })).filas.find((f) => f.id === p.id).data;
ok('4j recorre los 6 estados con su hora y quién lo hizo, y queda pagado', p2.historial.length === 6 && p2.historial.map((h) => h.estado).join() === 'recibido,aceptado,preparacion,listo,camino,entregado' && p2.pago.pagado === true && p2.historial.every((h, i, a) => (!i || h.t >= a[i - 1].t) && h.por), JSON.stringify(p2.historial.map((h) => h.estado + ':' + h.por)));
// 4k. El cliente opina (solo en su pedido) y el dueño lo lee
Nube.pin('fogon', null);
Pedidos.opinar(p.id, { estrellas: 5, recomendaria: true, texto: '' }); await Pedidos.guardado();
const dueno = await Nube.leer('fogon', 'pedidos', { pin: '482916' });
const fila = dueno.filas.find((f) => f.id === p.id);
ok('4k el dueño ve el pedido completo con la opinión del cliente', dueno.staff && fila && fila.data.opinion && fila.data.opinion.estrellas === 5 && fila.data.estado === 'entregado');
// 5. Limpieza: se borran solo los pedidos de esta prueba
const lim = await Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-prueba' } } });
ok('5 limpieza de la prueba', lim.ok === true && lim.borrados >= 1, JSON.stringify(lim));
sessionStorage.removeItem('fogon-carro-2');
return r;
