// App del repartidor: toma un pedido listo, comparte su ubicación (GPS del celular) mientras va en camino y marca la entrega.
// Si no da permiso de ubicación, puede simular el recorrido por calles para la demostración.
(function () {
  'use strict';
  var P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var activo = null, vigilar = null;
  try { activo = sessionStorage.getItem('fogon-rep-activo'); } catch (e) {}
  app.innerHTML = '<h1 class="sis-h">Repartidor</h1><p class="sis-sub">Con el modo automático, cada pedido listo sale solo con un repartidor de turno y recorre la ruta por calles. Si tú lo tomas antes, puedes compartir tu GPS real y la entrega se marca sola al llegar.</p>' +
    '<div class="grid-p"><section class="caja"><h2>Listos para retirar en el local</h2><div data-listos style="display:grid;gap:10px"></div></section><section class="caja" data-mio><h2>Mi entrega</h2><div data-act></div></section></div>';

  function parar() { if (vigilar != null && navigator.geolocation) navigator.geolocation.clearWatch(vigilar); vigilar = null; }
  function pintar() {
    var l = P.todos().filter(function (p) { return !p.semilla && p.tipo === 'delivery'; });
    var listos = l.filter(function (p) { return p.estado === 'listo'; });
    app.querySelector('[data-listos]').innerHTML = listos.length ? listos.map(function (p) {
      return '<article class="comanda" style="--ec:' + P.ESTADOS.listo.color + '"><div class="cab"><b>#' + esc(p.codigo) + '</b><span class="tipo">' + esc(p.cliente.comuna) + ' · ' + p.km + ' km</span></div><p class="sis-nota">' + esc(p.cliente.direccion) + ' · ' + clp(p.total) + (p.pago.pagado ? ' · pagado' : ' · cobrar al entregar') + '</p><div class="acc"><button class="btn-s prim" type="button" data-tomar="' + p.id + '">Tomar y salir</button></div></article>';
    }).join('') : '<p class="sis-nota">No hay pedidos listos. Cuando la cocina marque uno como listo, aparece aquí.</p>';
    var p = activo && P.obtener(activo), box = app.querySelector('[data-act]');
    if (!p || p.estado !== 'camino') {
      if (p && p.estado === 'entregado') box.innerHTML = '<p>Entregaste el pedido #' + esc(p.codigo) + '. ¡Bien hecho!</p>'; else box.innerHTML = '<p class="sis-nota">No tienes una entrega en curso.</p>';
      parar(); return;
    }
    var r = p.repartidor || {}, km = r.lat ? P.distancia(r, p.destino) : p.km;
    box.innerHTML = '<p style="font-size:20px;font-weight:700">#' + esc(p.codigo) + ' · ' + esc(p.cliente.nombre) + '</p><p>' + esc(p.cliente.direccion) + ', ' + esc(p.cliente.comuna) + '</p>' +
      (p.cliente.telefono ? '<p><a class="btn-s" href="tel:' + esc(p.cliente.telefono) + '" data-demo="Demostración: aquí se llama al cliente.">Llamar al cliente</a></p>' : '') +
      '<p class="sis-nota" style="margin-top:8px">' + (r.lat ? 'Ubicación compartida a las ' + P.hora(r.t) + ' · faltan ' + km.toFixed(1) + ' km' : 'Todavía no se comparte tu ubicación.') + '</p>' +
      '<div class="acc" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' + (r.gps ? '<span class="pagado">GPS real activo: se entrega solo al llegar</span>' : '<span class="por-pagar">' + (P.auto().activo ? 'Recorrido automático en curso' : 'Modo automático apagado') + '</span><button class="btn-s" type="button" data-gps>Usar mi GPS real</button>') +
      '<button class="btn-s prim" type="button" data-entregar>Marcar entregado</button></div>' +
      '<p style="margin-top:10px"><a class="btn-s" href="https://www.google.com/maps/dir/?api=1&destination=' + p.destino.lat + ',' + p.destino.lng + '" target="_blank" rel="noopener">Abrir la ruta en Google Maps</a></p>';
  }
  app.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tomar]');
    if (t) { activo = t.dataset.tomar; try { sessionStorage.setItem('fogon-rep-activo', activo); } catch (x) {} P.cambiar(activo, 'camino', { repartidor: { nombre: 'Repartidor (tú)' }, salida: Date.now() }); }
    if (e.target.closest('[data-gps]') && navigator.geolocation) {
      // GPS real: el motor deja de simular el recorrido y marca la entrega sola al llegar a 60 m de la dirección
      P.actualizar(activo, function (x) { x.repartidor = Object.assign({}, x.repartidor, { gps: true }); });
      vigilar = navigator.geolocation.watchPosition(function (pos) { P.ubicar(activo, pos.coords.latitude, pos.coords.longitude); },
        function () { parar(); P.actualizar(activo, function (x) { x.repartidor.gps = false; }); alert('No se pudo usar el GPS. Revisa el permiso de ubicación; mientras tanto el recorrido se simula.'); pintar(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
      pintar();
    }
    if (e.target.closest('[data-entregar]')) { parar(); P.cambiar(activo, 'entregado'); }
  });
  P.escuchar(pintar);
  setInterval(function () { P.latido('repartidor'); }, 4000); P.latido('repartidor');
  pintar();
})();
