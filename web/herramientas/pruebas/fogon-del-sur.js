// Guion de prueba de Fogón del Sur (menú digital con pedidos): scroll, carrito, validación, estados, tiempo estimado y panel.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
localStorage.removeItem('fogon-pedidos'); sessionStorage.removeItem('fogon-carro');
await dormir(800);
// 1. El scroll baja sin que la barra de categorías lo devuelva
const meta = document.getElementById('bebestibles').getBoundingClientRect().top + scrollY - 200;
window.scrollTo({ top: meta, behavior: 'instant' }); await dormir(900);
ok('1 el scroll llega abajo y se queda', Math.abs(scrollY - meta) < 40, scrollY + ' vs ' + Math.round(meta));
ok('1b la categoría activa sigue el scroll', $('.cats a[aria-current="true"]') && /Bebestibles|Postres/.test($('.cats a[aria-current="true"]').textContent));
window.scrollTo({ top: 0, behavior: 'instant' }); await dormir(300);
// 2. Agregar al carrito
const n = document.querySelectorAll('.agregar').length;
ok('2 cada plato disponible tiene "Agregar" (23 de 24, uno agotado)', n === 23, n);
document.querySelector('[data-mas="lomo"]').click(); document.querySelector('[data-mas="lomo"]').click(); await dormir(200);
ok('2b el carrito suma', /2.*\$27\.800/.test($('.carrito-btn').textContent), $('.carrito-btn').textContent);
// 3. Validación del formulario de delivery
$('.carrito-btn').click(); await dormir(300);
$('dialog.carrito [data-modo="delivery"]').click(); await dormir(200);
$('dialog.carrito form').requestSubmit(); await dormir(200);
ok('3 sin datos no se envía', /nombre/i.test($('dialog.carrito .err').textContent), $('dialog.carrito .err').textContent);
$('dialog.carrito').close();
// 4. Estados, tiempo estimado y flujo (con la misma capa de datos que usan la cocina y el seguimiento)
const p = Pedidos.crear({ tipo: 'delivery', cliente: { nombre: 'Prueba', telefono: '+56987654321', direccion: 'Calle 1', comuna: 'Concepción' }, items: [{ id: 'lomo', nombre: 'Lomo', precio: 13900, cant: 1 }], pago: { metodo: 'caja', pagado: false } });
ok('4 el pedido nace "recibido" con envío por comuna', p.estado === 'recibido' && p.envio === 1500 && p.total === 15400);
const e1 = Pedidos.eta(p);
ok('4b tiene tiempo estimado de llegada', e1.minutos > 10 && e1.minutos < 60, e1.minutos);
['preparacion', 'listo', 'camino', 'entregado'].forEach((x) => Pedidos.cambiar(p.id, x));
const p2 = Pedidos.obtener(p.id);
ok('4c recorre los 5 estados con su hora', p2.historial.length === 5 && Pedidos.siguiente(p2) === null);
Pedidos.opinar(p.id, { estrellas: 5, recomendaria: true, texto: '' });
ok('4d guarda la opinión', Pedidos.obtener(p.id).opinion.estrellas === 5);
// 5. Botón "Mi pedido" desaparece al entregar; datos de demostración para el panel
ok('5 sin pedido en curso no hay botón "Mi pedido"', !$('.mi-pedido'));
const platos = JSON.parse($('#menu-datos').textContent).categorias.flatMap((c) => c.platos);
Pedidos.sembrar(platos);
ok('5b el panel recibe 7 días de prueba', Pedidos.todos().filter((x) => x.semilla).length > 30 && Pedidos.visitas().length > 100);
Pedidos.borrarDemo(); sessionStorage.removeItem('fogon-carro');
return r;
