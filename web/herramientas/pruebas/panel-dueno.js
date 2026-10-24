// Panel del dueño de Fogón del Sur, usado como lo usaría el dueño: entra con su PIN, ve llegar un pedido sin recargar, ve que el cliente
// lo está modificando, lo acepta (y desde ahí ya no se puede modificar), asigna repartidor, mira estadísticas y edita la carta
// (agregar un plato, publicarlo y ver que la carta pública lo recibe). Al final deja la carta de ejemplo como estaba.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const esperar = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await dormir(300); } return null; };
const limpiar = () => Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-panel' } } });
Nube.pin('fogon', null);
await limpiar();
// 1. Entrar con el PIN del dueño
const inp = document.querySelector('.nube-vel input');
inp.value = '482916'; inp.form.requestSubmit();
ok('1 con el PIN del dueño se abre el panel con sus 5 secciones', !!(await esperar(() => document.querySelectorAll('.pestanas [data-tab]').length === 5)), document.body.innerText.slice(0, 80));
ok('1b no hay cambios sin publicar al abrir', document.querySelector('[data-publicar-barra]').hidden);
await dormir(5500);   // el aviso de "pedido nuevo" ignora lo que ya estaba antes de entrar
// 2. Un cliente pide y el dueño lo ve llegar sin recargar la página
localStorage.setItem('fogon-sesion-fogon', Nube.idNuevo());
const ped = await Pedidos.crear({ tipo: 'delivery', cliente: { nombre: 'zz-panel', telefono: '+56912345678', direccion: 'Calle 2', comuna: 'Concepción' }, items: [{ id: 'lomo', nombre: 'Lomo', precio: 13900, cant: 1, prep: 25 }], pago: { metodo: 'caja', pagado: false } });
const card = () => document.querySelector('.pedido-card[data-id="' + ped.id + '"]');
ok('2 el pedido aparece en el panel solo, sin recargar', !!(await esperar(card)));
ok('2b suena/aparece el aviso de pedido nuevo con su monto', !document.querySelector('[data-alerta]').hidden && /Nuevo pedido/.test(document.querySelector('[data-alerta]').textContent), document.querySelector('[data-alerta]').textContent);
ok('2c la pestaña Pedidos muestra la insignia con los pendientes', !document.querySelector('[data-num="pedidos"]').hidden && +document.querySelector('[data-num="pedidos"]').textContent >= 1);
// 3. El cliente modifica su pedido: el dueño lo ve y aparece la versión nueva
await Pedidos.marcarModificando(ped.id, true);
ok('3 el dueño ve "el cliente está modificando este pedido"', !!(await esperar(() => card() && card().querySelector('.etiqueta-mod.vivo'))));
await Pedidos.modificar(ped.id, { items: [{ id: 'lomo', nombre: 'Lomo', precio: 13900, cant: 2, prep: 25 }] });
await Pedidos.marcarModificando(ped.id, false);
ok('3b el cambio llega al panel (versión 2, total nuevo, mismo pedido)', !!(await esperar(() => card() && /versión 2/.test(card().textContent) && /\$29\.300/.test(card().textContent))), card() && card().textContent.slice(0, 120));
ok('3c sigue siendo un solo pedido de este cliente', document.querySelectorAll('.pedido-card').length >= 1 && [...document.querySelectorAll('.pedido-card')].filter((c) => /zz-panel/.test(c.textContent)).length === 1);
// 4. El dueño acepta: desde ahí el cliente ya no puede modificar
window.confirm = () => true;
card().querySelector('[data-aceptar]').click();
ok('4 aceptar cambia el estado y la tarjeta ya no muestra "Aceptar"', !!(await esperar(() => Pedidos.obtener(ped.id).estado === 'aceptado' && card() && !card().querySelector('[data-aceptar]'))));
let rechazo = ''; try { await Pedidos.modificar(ped.id, { nota: 'tarde' }); } catch (e) { rechazo = e.message; }
ok('4b el cliente ya no puede modificar un pedido aceptado', rechazo !== '', rechazo);
// 5. Asignar repartidor
const sel = await esperar(() => card() && card().querySelector('[data-asignar]'));
ok('5 un delivery aceptado ofrece asignar repartidor, con los repartidores del equipo', !!sel && [...sel.options].some((o) => /Repartidor 1/.test(o.textContent)), sel && sel.innerText);
if (sel) { sel.value = 'Repartidor 1'; sel.dispatchEvent(new Event('change', { bubbles: true })); await dormir(1500); }
ok('5b queda asignado', Pedidos.obtener(ped.id).asignadoA === 'Repartidor 1');
// 6. Estadísticas con datos reales
document.querySelector('[data-tab="estadisticas"]').click(); await dormir(600);
const est = document.getElementById('vista').innerText;
ok('6 estadísticas muestra ventas, pedidos por hora y productos más pedidos', /Ventas/.test(est) && /Pedidos por hora/.test(est) && /Productos más pedidos/.test(est) && /Lomo/.test(est));
// 7. Opiniones y equipo
document.querySelector('[data-tab="opiniones"]').click(); await dormir(400);
ok('7 opiniones carga (con o sin opiniones)', /Todas \(/.test(document.getElementById('vista').innerText));
document.querySelector('[data-tab="negocio"]').click(); await dormir(1500);
ok('7b negocio y equipo muestra el personal con sus roles', /Cocina/.test(document.querySelector('[data-equipo]').innerText) && /Repartidor 1/.test(document.querySelector('[data-equipo]').innerText));
// 8. Carta: agregar un plato, publicar, y la carta pública lo recibe
document.querySelector('[data-tab="carta"]').click(); await dormir(600);
// 8-pre. Todos los platos (con y sin opciones) abren su editor
const fallan = []; const total = document.querySelectorAll('.ed-plato').length;
for (let k = 0; k < total; k++) { const fila = document.querySelectorAll('.ed-plato')[k]; const nombre = fila.querySelector('b').textContent; fila.querySelector('[data-edita]').click(); await dormir(120); const ds = document.querySelectorAll('dialog.editor'); const dd = ds[ds.length - 1]; if (!(dd && dd.open && dd.querySelector('#e-nombre').value === nombre)) fallan.push(nombre); if (dd) { dd.close(); await dormir(50); } }
ok('8-pre cada uno de los platos de la carta se puede editar (con y sin opciones)', total >= 24 && !fallan.length, fallan.join(', '));
document.querySelector('[data-plato-nuevo]').click(); await dormir(300);
const d = document.querySelector('dialog.editor');
d.querySelector('form').requestSubmit(); await dormir(200);
ok('8 un plato sin nombre ni precio no se guarda y marca los campos', d.open && d.querySelectorAll('.campo.mal').length >= 2);
d.querySelector('#e-nombre').value = 'zz Plato del panel'; d.querySelector('#e-precio').value = '6100';
d.querySelector('[data-grupo-nuevo]').click(); await dormir(100);
d.querySelector('[data-gn]').value = 'Tamaño'; d.querySelector('[data-on]').value = 'Grande'; d.querySelector('[data-oe]').value = '900';
d.querySelector('form').requestSubmit(); await dormir(500);
ok('8b el plato queda en el borrador y avisa que falta publicar', !document.querySelector('[data-publicar-barra]').hidden && /zz Plato del panel/.test(document.getElementById('vista').innerText));
ok('8c antes de publicar la carta pública no lo tiene', !Carta.plato('zz-plato-del-panel'));
document.querySelector('[data-publicar]').click();
ok('8d al publicar, la carta lo recibe con su precio y opciones', !!(await esperar(() => { const p = Carta.plato('zz-plato-del-panel'); return p && p.precio === 6100 && p.grupos.length === 1; })) && document.querySelector('[data-publicar-barra]').hidden);
// 9. Un plato nuevo se puede pedir y el servidor lo reconoce (precio y opciones de la carta publicada)
localStorage.setItem('fogon-sesion-fogon', Nube.idNuevo());
const nuevo = await Pedidos.crear({ tipo: 'retiro', cliente: { nombre: 'zz-panel', telefono: '+56912345678' }, items: [{ id: 'zz-plato-del-panel', nombre: 'zz Plato del panel', precio: 7000, cant: 1, prep: 15, opc: [Carta.plato('zz-plato-del-panel').grupos[0].id + ':' + Carta.plato('zz-plato-del-panel').grupos[0].opciones[0].id] }], pago: { metodo: 'caja', pagado: false } }).catch((e) => e);
ok('9 el servidor acepta pedir un plato nuevo con el precio de la carta (6.100 + 900)', nuevo && nuevo.id && nuevo.subtotal === 7000, nuevo && (nuevo.message || nuevo.subtotal));
// 10. Se deja todo como estaba
await Carta.restablecerBase();
ok('10 se restaura la carta de ejemplo', !!(await esperar(() => !Carta.plato('zz-plato-del-panel'))));
await limpiar();
const resto = (await Nube.leer('fogon', 'pedidos', { pin: '482916' })).filas.filter((f) => f.data.cliente && f.data.cliente.nombre === 'zz-panel');
ok('11 limpieza de la prueba', resto.length === 0, resto.length);
Nube.pin('fogon', null);
return r;
