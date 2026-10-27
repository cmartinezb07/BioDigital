// App del repartidor: ve los delivery listos (los asignados a él y los libres), toma uno, comparte su ubicación (GPS del celular)
// mientras va en camino y marca la entrega. El cliente ve la moto moverse en su mapa y el dueño ve quién lleva cada pedido.
// Solo puede hacer lo del reparto: no ve ni cambia precios, carta ni ajustes. Entran los repartidores y el dueño, con PIN personal.
// Sin moto a mano se puede probar simulando el recorrido por calles. Nada se marca solo: la entrega la confirma el repartidor.
(function () {
  'use strict';
  var R = window.RESTAURANTE, P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var activo = null, vigilar = null, detener = null, ultimoEnvio = 0, yo = '', pantalla = null, tomando = {};
  try { activo = sessionStorage.getItem('fogon-rep-activo'); } catch (e) {}
  if (window.Carta) Carta.iniciar();
  if (!Nube.pin(R.negocio)) { location.replace('../panel/'); return; }   // sin código se entra por el panel del restaurante
  // Con el GPS compartido la pantalla no debe apagarse: los navegadores pausan el GPS de una pestaña dormida
  function mantenerPantalla() { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { pantalla = l; }).catch(function () {}); } catch (e) {} }
  document.addEventListener('visibilitychange', function () { if (vigilar != null && document.visibilityState === 'visible') mantenerPantalla(); });

  Nube.acceso({ negocio: R.negocio, titulo: 'Repartidor · ' + R.nombre, aceptan: ['reparto', 'dueno'], pistas: P.CONFIG.pistas.equipo }).then(function (q) {
    yo = q.nombre || ''; P.entrarEquipo();
    app.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;justify-content:space-between"><div><h1 class="sis-h">Repartidor</h1><p class="sis-sub">Sesión: <b>' + esc(yo || 'repartidor') + '</b>. Toma un pedido listo, comparte tu GPS y el cliente te sigue en su mapa. Al llegar, marca la entrega.</p></div><button class="btn-s" type="button" data-salir>Salir</button></div>' +
      '<div class="grid-p"><section class="caja"><h2>Listos para llevar</h2><div data-listos style="display:grid;gap:10px"></div><p class="sis-nota" data-otros style="margin-top:8px"></p></section><section class="caja" data-mio><h2>Mi entrega en curso</h2><div data-act></div></section></div>' +
      '<section class="caja" style="margin-top:14px"><h2>Mis entregas terminadas</h2><div data-hist class="sis-nota"></div></section>';
    app.querySelector('[data-salir]').addEventListener('click', function () { parar(); Nube.salir(R.negocio); });
    app.addEventListener('click', clic);
    P.escuchar(function (m) { if (m.tipo === 'error') alerta(m.mensaje); else pintar(); });
    pintar();
  });

  function alerta(t) { var d = document.createElement('div'); d.className = 'toast-s'; d.setAttribute('role', 'alert'); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4500); }
  function parar() { if (vigilar != null && navigator.geolocation) navigator.geolocation.clearWatch(vigilar); vigilar = null; if (detener) detener(); detener = null; if (pantalla) { try { pantalla.release(); } catch (e) {} pantalla = null; } }
  function mia(p) { return p.tipo === 'delivery' && p.estado === 'camino' && (p.asignadoA === yo || (p.repartidor && p.repartidor.nombre === yo)); }
  function miPedido() {
    var p = activo && P.obtener(activo);
    if (p && p.estado === 'camino' && mia(p)) return p;
    // Si recargó la página, retoma la entrega que dejó en camino
    var m = P.todos().filter(mia)[0];
    if (m) { activo = m.id; try { sessionStorage.setItem('fogon-rep-activo', activo); } catch (e) {} return m; }
    return p || null;
  }
  function lineas(p) { return '<ul style="margin:4px 0 6px 18px">' + p.items.map(function (i) { return '<li>' + P.lineaHtml(i) + '</li>'; }).join('') + '</ul>' + (p.nota ? '<p class="sis-nota"><b>Observación:</b> ' + esc(p.nota) + '</p>' : ''); }
  function pintar() {
    var l = P.todos().filter(function (p) { return p.tipo === 'delivery'; });
    var libres = l.filter(function (p) { return p.estado === 'listo' && (!p.asignadoA || p.asignadoA === yo); });
    var deOtros = l.filter(function (p) { return p.estado === 'listo' && p.asignadoA && p.asignadoA !== yo; });
    app.querySelector('[data-listos]').innerHTML = libres.length ? libres.map(function (p) {
      return '<article class="comanda" style="--ec:' + P.ESTADOS.listo.color + '"><div class="cab"><b>#' + esc(p.codigo) + '</b><span class="tipo">' + esc(p.cliente.comuna) + ' · ' + p.km + ' km</span>' + (p.asignadoA === yo ? '<span class="tipo">Asignado a ti</span>' : '') + '</div>' + lineas(p) +
        '<p class="sis-nota">' + esc(p.cliente.direccion) + ' · ' + clp(p.total) + (p.pago.pagado ? ' · pagado' : ' · cobrar al recibir') + '</p><div class="acc"><button class="btn-s prim" type="button" data-tomar="' + esc(p.id) + '"' + (tomando[p.id] ? ' disabled' : '') + '>Tomar y salir</button></div></article>';
    }).join('') : '<p class="sis-nota">No hay pedidos listos. Cuando la cocina marque uno como listo, aparece aquí.</p>';
    app.querySelector('[data-otros]').textContent = deOtros.length ? deOtros.length + (deOtros.length === 1 ? ' pedido listo está asignado a otro repartidor.' : ' pedidos listos están asignados a otros repartidores.') : '';
    var p = miPedido(), box = app.querySelector('[data-act]');
    if (!p || p.estado !== 'camino') {
      box.innerHTML = p && p.estado === 'entregado' ? '<p>Entregaste el pedido #' + esc(p.codigo) + '. ¡Bien hecho!</p>' : '<p class="sis-nota">No tienes una entrega en curso.</p>'; parar();
    } else {
      var r = p.repartidor || {}, km = r.lat ? P.distancia(r, p.destino) : p.km;
      box.innerHTML = '<p style="font-size:20px;font-weight:700">#' + esc(p.codigo) + ' · ' + esc(p.cliente.nombre) + '</p><p>' + esc(p.cliente.direccion) + ', ' + esc(p.cliente.comuna) + '</p>' + lineas(p) +
        (p.cliente.telefono ? '<p><a class="btn-s" href="tel:' + esc(p.cliente.telefono) + '">Llamar al cliente</a></p>' : '') +
        '<p class="sis-nota" style="margin-top:8px">' + (r.lat ? 'Ubicación compartida a las ' + P.hora(r.t) + ' · faltan ' + km.toFixed(1) + ' km' + (km < .06 ? ' · ¡ya llegaste! Marca la entrega.' : '') : 'Todavía no se comparte tu ubicación: el cliente no ve la moto en su mapa.') + '</p>' +
        '<div class="acc" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' +
        (vigilar != null ? '<span class="pagado">GPS real activo: el cliente te ve en su mapa</span>' : detener ? '<span class="por-pagar">Recorrido de prueba en curso</span>' : '<button class="btn-s prim" type="button" data-gps>Compartir mi ubicación (GPS)</button>' + (R.demo ? '<button class="btn-s" type="button" data-sim>Probar sin moto: simular recorrido</button>' : '')) +
        '<button class="btn-s prim" type="button" data-entregar>' + (p.pago.pagado ? 'Marcar entregado' : 'Entregado y cobrado (' + clp(p.total) + ')') + '</button></div>' +
        '<p style="margin-top:10px"><a class="btn-s" href="https://www.google.com/maps/dir/?api=1&destination=' + p.destino.lat + ',' + p.destino.lng + '" target="_blank" rel="noopener">Abrir la ruta en Google Maps</a></p>';
    }
    var hechas = l.filter(function (x) { return x.estado === 'entregado' && (x.asignadoA === yo || (x.repartidor && x.repartidor.nombre === yo)); }).sort(function (a, b) { return (P.cuando(b, 'entregado') || 0) - (P.cuando(a, 'entregado') || 0); });
    app.querySelector('[data-hist]').innerHTML = hechas.length ? '<p>' + hechas.length + (hechas.length === 1 ? ' entrega' : ' entregas') + ' · ' + clp(hechas.reduce(function (t, x) { return t + x.total; }, 0)) + ' en pedidos</p><ul style="margin:6px 0 0 18px">' + hechas.slice(0, 15).map(function (x) { return '<li>#' + esc(x.codigo) + ' · ' + esc(x.cliente.comuna) + ' · ' + clp(x.total) + ' · ' + P.fecha(P.cuando(x, 'entregado')) + ' ' + P.hora(P.cuando(x, 'entregado')) + '</li>'; }).join('') + '</ul>' : 'Todavía no has terminado entregas.';
  }
  function clic(e) {
    var t = e.target.closest('[data-tomar]');
    if (t) {
      var id = t.dataset.tomar; tomando[id] = true; t.disabled = true; t.textContent = 'Tomando…';
      P.tomarEntrega(id).then(function () { activo = id; try { sessionStorage.setItem('fogon-rep-activo', activo); } catch (x) {} P.fijarRuta(id); }).catch(function (er) { alerta(er.message); }).then(function () { delete tomando[id]; pintar(); });
      return;
    }
    var p = activo && P.obtener(activo);
    if (e.target.closest('[data-gps]')) {
      if (!navigator.geolocation) return alerta('Este celular no permite usar el GPS desde el navegador.');
      // GPS real del celular: se publica cada 4 segundos como mínimo
      mantenerPantalla();
      vigilar = navigator.geolocation.watchPosition(function (pos) {
        if (Date.now() - ultimoEnvio < 4000) return; ultimoEnvio = Date.now();
        P.actualizar(activo, function (x) { x.repartidor = Object.assign({}, x.repartidor, { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now(), gps: true }); });
      }, function () { parar(); alerta('No se pudo usar el GPS. Revisa el permiso de ubicación del navegador.'); pintar(); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
      pintar();
    }
    if (e.target.closest('[data-sim]') && p) {
      var el = e.target.closest('[data-sim]'); el.disabled = true; el.textContent = 'Calculando la ruta…';
      (p.ruta ? Promise.resolve(p.ruta) : P.ruta(P.CONFIG.local, p.destino)).then(function (r) { detener = P.recorrer(activo, r, 8); pintar(); });
    }
    if (e.target.closest('[data-entregar]') && p) {
      parar();
      P.cambiar(activo, 'entregado', p.pago.pagado ? null : { pago: Object.assign({}, p.pago, { pagado: true, cuando: Date.now() }) });
    }
  }
})();
