// "Mis pedidos" del cliente: el pedido activo con su botón "Modificar mi pedido" mientras está Nuevo, y el historial cuando termina.
// Al aceptarlo el local, el botón desaparece solo (sin recargar) y el pedido sigue siendo el mismo.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const esperar = async (fn, ms = 12000) => { const t = Date.now(); while (Date.now() - t < ms) { try { const v = fn(); if (v) return v; } catch (e) {} await dormir(300); } return null; };
const limpiar = () => Nube.borrar('fogon', 'pedidos', '482916', { filtro: { cliente: { nombre: 'zz-mis' } } });
await limpiar();
ok('1 sin pedidos, la página lo dice y ofrece ir a la carta', /No tienes pedidos en curso/.test(document.body.innerText) && !!document.querySelector('a[href="../"]'));
localStorage.setItem('fogon-sesion-fogon', Nube.idNuevo());
const p = await Pedidos.crear({ tipo: 'retiro', cliente: { nombre: 'zz-mis', telefono: '+56912345678' }, items: [{ id: 'empanadas', nombre: 'Empanadas', precio: 5900, cant: 1, prep: 15 }], pago: { metodo: 'caja', pagado: false } });
const tarjeta = () => [...document.querySelectorAll('article')].find((a) => a.textContent.includes('#' + p.codigo));
ok('2 el pedido nuevo aparece como activo, con su estado', !!(await esperar(tarjeta)) && /Recibido/.test(tarjeta().textContent));
ok('2b mientras está Nuevo ofrece "Modificar mi pedido" (al mismo pedido)', !!tarjeta().querySelector('a[href*="editar=' + p.id + '"]'));
tarjeta().querySelector('details').open = true;
ok('2c el detalle muestra productos y total', /Empanadas/.test(tarjeta().textContent) && /\$5\.900/.test(tarjeta().textContent));
Nube.pin('fogon', '247135'); Pedidos.entrarEquipo(); await dormir(1500);
Pedidos.aceptar(p.id, 15); await Pedidos.guardado();
Nube.pin('fogon', null);
ok('3 aceptado, el botón de modificar desaparece solo y el detalle sigue abierto', !!(await esperar(() => tarjeta() && !tarjeta().querySelector('a[href*="editar="]'))), tarjeta() && tarjeta().textContent.slice(0, 160));
ok('3b sigue habiendo un solo pedido activo (no se duplicó)', document.querySelectorAll('article').length === 1);
await limpiar();
return r;
