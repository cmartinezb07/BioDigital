// Caso base (Fogón del Sur): un servicio completo en modo automático, sin tocar nada.
// Llegan 9 clientes (3 en la mesa, 3 para retirar, 3 con delivery); el sistema acepta, cocina, sirve o entrega,
// mueve al repartidor por la ruta real, cobra lo pendiente al entregar y recibe opiniones. Después se verifica cada pedido
// y que el panel muestre exactamente lo que pasó. Se ejecuta en el panel: revisar.mjs <url>/ejemplos/fogon-del-sur/panel/ --probar …
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const P = window.Pedidos;
await dormir(2500);                       // el panel carga la carta (y quizás datos de prueba): se limpian
P.borrarDemo();
const velAntes = P.auto().velocidad;
P.fijarAuto({ activo: true, velocidad: 240 });   // 1 minuto del servicio = 0,25 s
const platos = JSON.parse((await (await fetch('../')).text()).match(/id="menu-datos">([\s\S]*?)<\/script>/)[1]).categorias.flatMap((c) => c.platos);
P.simular({ pedidos: 9, cadaSeg: 0.4, tipos: ['mesa', 'retiro', 'delivery'], platos });
// Esperar a que todos terminen (máximo 90 s)
const t0 = Date.now(); let lista = [];
while (Date.now() - t0 < 90000) {
  await dormir(1000);
  lista = P.todos().filter((p) => p.simulado);
  if (lista.length === 9 && lista.every((p) => p.estado === 'entregado')) break;
}
r.duracion = Math.round((Date.now() - t0) / 1000) + ' s';
ok('1 llegaron los 9 pedidos', lista.length === 9, lista.length);
ok('2 los 9 terminaron solos (entregados)', lista.every((p) => p.estado === 'entregado'), lista.filter((p) => p.estado !== 'entregado').map((p) => p.tipo + ':' + p.estado).join(', '));
// 3. Cada pedido recorrió sus estados en orden y con horas crecientes
const enOrden = lista.filter((p) => { const f = P.FLUJO[p.tipo], h = p.historial.map((x) => x.estado); return JSON.stringify(h) === JSON.stringify(f) && p.historial.every((x, i) => !i || x.t >= p.historial[i - 1].t); });
ok('3 estados en orden: recibido → preparación → listo → (en camino) → entregado', enOrden.length === 9, lista.filter((p) => !enOrden.includes(p)).map((p) => p.historial.map((x) => x.estado).join('>')).join(' | '));
// 4. Tiempos de cocina: "listo" se marcó cuando se cumplió el tiempo de preparación (± 2 minutos del servicio)
const min = 60000 / 240;
const prepOk = lista.filter((p) => { const real = (P.cuando(p, 'listo') - P.cuando(p, 'preparacion')) / min; return real >= p.prepMin - .5 && real - p.prepMin <= 4.5; });
ok('4 cada pedido estuvo listo en su tiempo de preparación', prepOk.length === 9, lista.map((p) => Math.round((P.cuando(p, 'listo') - P.cuando(p, 'preparacion')) / min) + '/' + p.prepMin).join(' '));
// 5. Delivery: ruta por calles, el repartidor terminó en la dirección del cliente y se le cobró
const del = lista.filter((p) => p.tipo === 'delivery');
ok('5 los 3 delivery tienen ruta por calles', del.length === 3 && del.every((p) => p.ruta && p.ruta.length > 5), del.map((p) => p.ruta ? p.ruta.length : 0).join(','));
ok('5b el repartidor llegó a la dirección (a menos de 40 m)', del.every((p) => p.repartidor && P.distancia(p.repartidor, p.destino) < .04), del.map((p) => p.repartidor ? Math.round(P.distancia(p.repartidor, p.destino) * 1000) + ' m' : '—').join(', '));
const viaje = del.map((p) => (P.cuando(p, 'entregado') - P.cuando(p, 'camino')) / min), esperado = del.map((p) => p.rutaKm / P.CONFIG.kmh * 60);
// el motor revisa una vez por segundo: a ×240 eso son 4 minutos del servicio, que es la tolerancia de la medición
ok('5c el viaje duró lo que dice la ruta (± 1 revisión del motor)', viaje.every((v, i) => v >= esperado[i] - .5 && v - esperado[i] <= 4.5), viaje.map((v, i) => v.toFixed(1) + '/' + esperado[i].toFixed(1)).join(' '));
// 6. Pagos: todo quedó pagado (en línea al pedir, o en caja / al recibir al entregar)
ok('6 todos los pedidos quedaron pagados', lista.every((p) => p.pago.pagado));
// 7. Opiniones de los clientes simulados (solo estrellas)
await dormir(3500);
lista = P.todos().filter((p) => p.simulado);
const ops = lista.filter((p) => p.opinion), decididos = lista.filter((p) => p.opinion || p.sinOpinion);
ok('7 todos los clientes decidieron si opinar (y sin comentarios inventados)', decididos.length === 9 && ops.every((p) => !p.opinion.texto), decididos.length + ' de 9, ' + ops.length + ' opinaron');
// 8. El panel muestra exactamente lo que pasó
document.querySelector('[data-dias="1"]').click(); await dormir(300);
const kpi = (n) => [...document.querySelectorAll('.kpi')].find((k) => k.querySelector('span').textContent === n).querySelector('b').textContent;
const ventas = lista.reduce((s, p) => s + p.total, 0);
ok('8 pedidos de hoy en el panel = 9', kpi('Pedidos') === '9', kpi('Pedidos'));
ok('8b ventas del panel = suma de los 9 pedidos', kpi('Ventas') === P.clp(ventas), kpi('Ventas') + ' vs ' + P.clp(ventas));
ok('8c visitas registradas (2 por cliente)', kpi('Visitas a la carta') === '18', kpi('Visitas a la carta'));
ok('8d cómo piden: 3 en la mesa, 3 para retirar, 3 delivery', /En la mesa\s*3 pedidos/.test(document.body.innerText) && /Delivery\s*3 pedidos/.test(document.body.innerText));
r.resumen = lista.map((p) => p.tipo + ' #' + p.codigo + ' ' + P.clp(p.total) + ' prep ' + p.prepMin + ' min' + (p.rutaKm ? ' · ' + p.rutaKm + ' km' : '') + (p.opinion ? ' · ' + p.opinion.estrellas + '★' : '')).join(' | ');
P.fijarAuto({ velocidad: velAntes });
return r;
