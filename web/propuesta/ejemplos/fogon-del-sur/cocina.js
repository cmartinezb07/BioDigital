// Pantalla de cocina (KDS): los pedidos llegan solos desde la carta. La cocina (o el dueño) acepta o rechaza el pedido nuevo, lo prepara,
// lo marca listo y, en mesa y retiro, lo entrega. Cada paso es un toque y el cliente lo ve al instante. Nada avanza solo.
// Muestra qué pidió cada cliente (con opciones y notas), a qué hora llegó y cuánto lleva esperando, y avisa si el cliente está
// modificando un pedido que todavía no se acepta. Entran el equipo de cocina y el dueño, con PIN.
(function () {
  'use strict';
  var R = window.RESTAURANTE, P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var COLS = [['recibido', 'Nuevos · por aceptar'], ['aceptado', 'Aceptados'], ['preparacion', 'En preparación'], ['listo', 'Listos'], ['camino', 'En reparto']];
  var anunciados = {}, audio = null, primera = true, kds = null, yo = '';
  function sonidoOn() { try { return localStorage.getItem('sonido-cocina-' + R.negocio) !== '0'; } catch (e) { return true; } }
  if (window.Carta) Carta.iniciar();
  if (!Nube.pin(R.negocio)) { location.replace('../panel/'); return; }   // sin código se entra por el panel del restaurante

  Nube.acceso({ negocio: R.negocio, titulo: 'Cocina · ' + R.nombre, aceptan: ['cocina', 'dueno'], pistas: P.CONFIG.pistas.equipo }).then(function (q) {
    yo = q.nombre || ''; P.entrarEquipo();
    app.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;justify-content:space-between;margin-bottom:16px"><div><h1 class="sis-h">Cocina</h1><p class="sis-sub">Los pedidos llegan solos desde la carta. Acepta o rechaza los nuevos y marca cada paso con un toque: el cliente lo ve al instante. Sesión: ' + esc(yo || 'cocina') + '.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="sis-nota" data-conexion role="status"></span><button class="btn-s" type="button" data-sonido aria-pressed="true"></button><button class="btn-s" type="button" data-salir>Salir</button></div></div>' +
      '<div class="kds"></div><h2 style="font-size:17px;margin:24px 0 10px">Entregados hoy</h2><div data-hechos class="sis-nota"></div>';
    kds = app.querySelector('.kds');
    var bs = app.querySelector('[data-sonido]');
    var pintarSonido = function () { var on = sonidoOn(); bs.setAttribute('aria-pressed', String(on)); bs.textContent = on ? 'Sonido: activado' : 'Sonido: apagado'; };
    bs.addEventListener('click', function () { try { localStorage.setItem('sonido-cocina-' + R.negocio, sonidoOn() ? '0' : '1'); } catch (e) {} pintarSonido(); beep(); });
    pintarSonido();
    app.querySelector('[data-salir]').addEventListener('click', function () { Nube.salir(R.negocio); });
    kds.addEventListener('click', clic);
    P.escuchar(function (m) {
      if (m.tipo === 'conexion') pintarConexion();
      else if (m.tipo === 'error') alerta(m.mensaje);
      else pintar();
    });
    setInterval(pintar, 20000);   // refresca los relojes
    pintarConexion(); pintar();
  });

  function alerta(t) { var d = document.createElement('div'); d.className = 'toast-s'; d.setAttribute('role', 'alert'); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4500); }
  function pintarConexion() { var e = app.querySelector('[data-conexion]'); if (e) e.textContent = P.enLinea() ? 'En vivo' : 'Sin conexión: reintentando…'; }
  // Un solo aviso por pedido nuevo (y otro si se modifica antes de aceptarlo), nunca repetido
  function beep() {
    if (!sonidoOn()) return;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); [0, .18].forEach(function (d) { var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 988; g.gain.setValueAtTime(.15, audio.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + d + .15); o.connect(g); g.connect(audio.destination); o.start(audio.currentTime + d); o.stop(audio.currentTime + d + .16); }); } catch (e) {}
  }

  // Quién aceptó el pedido lo anota el servidor en el historial
  function quienAcepto(p) { var h = (p.historial || []).filter(function (x) { return x.estado === 'aceptado'; })[0]; return h ? h.quien : ''; }
  function minutos(p) { return Math.floor((Date.now() - p.creado) / 60000); }
  function tarjeta(p) {
    var m = minutos(p), cls = m >= 20 ? 'rojo' : m >= 10 ? 'amarillo' : '', mod = P.modificandoAhora(p), ed = (p.ediciones || []).length;
    var accion = { aceptado: 'Empezar a preparar', preparacion: 'Marcar listo', listo: p.tipo === 'mesa' ? 'Servido en la mesa' : p.tipo === 'retiro' ? 'Entregado al cliente' : '' }[p.estado];
    var ultima = ed ? p.ediciones[ed - 1] : null;
    return '<article class="comanda' + (p.estado === 'recibido' && !anunciados[p.id] && !primera ? ' nueva' : '') + '" style="--ec:' + P.ESTADOS[p.estado].color + '" data-id="' + esc(p.id) + '">' +
      '<div class="cab"><b>#' + esc(p.codigo) + '</b><span class="tipo">' + esc(P.tipoTxt(p)) + '</span><span class="reloj ' + cls + '" title="Desde que llegó">' + m + ' min</span></div>' +
      '<p class="sis-nota">Llegó a las ' + P.hora(p.creado) + (quienAcepto(p) ? ' · aceptado por ' + esc(quienAcepto(p)) : '') + '</p>' +
      (mod ? '<p class="banda mal" role="status">✎ El cliente está modificando este pedido. Conviene esperar unos segundos antes de aceptar.</p>' : '') +
      (ed && p.estado === 'recibido' ? '<p class="banda">Pedido modificado (versión ' + p.rev + ').' + (ultima ? ' <small>Antes: ' + ultima.items.map(function (i) { return i.cant + '× ' + esc(i.nombre); }).join(', ') + '</small>' : '') + '</p>' : '') +
      '<ul>' + p.items.map(function (i) { return '<li>' + P.lineaHtml(i) + (i.prep ? ' <small>(' + i.prep + ' min)</small>' : '') + '</li>'; }).join('') + '</ul>' +
      (p.nota ? '<p class="sis-nota"><b>Observación:</b> ' + esc(p.nota) + '</p>' : '') +
      '<p class="sis-nota">' + esc(p.cliente.nombre) + (p.tipo === 'delivery' ? ' · ' + esc(p.cliente.comuna) + ' · ' + p.km + ' km' : '') + ' · ' + clp(p.total) + ' <span class="' + (p.pago.pagado ? 'pagado">Pagado' : 'por-pagar">Por pagar') + '</span></p>' +
      (p.estado === 'recibido' ? '<div class="campo"><label class="lbl" for="pm-' + esc(p.id) + '">Tiempo que verá el cliente al aceptar</label><select id="pm-' + esc(p.id) + '" data-prep>' + [10, 15, 20, 25, 30, 40, 45, 60].map(function (x) { return '<option value="' + x + '"' + (Math.abs(x - p.prepMin) < 3 ? ' selected' : '') + '>' + x + ' min</option>'; }).join('') + '</select></div>' : '') +
      (p.estado === 'aceptado' || p.estado === 'preparacion' ? '<p class="sis-nota">Listo estimado: ' + P.hora(P.eta(p).listo) + ' <button class="btn-s" type="button" data-mas5 style="margin-left:6px">+5 min</button></p>' : '') +
      (p.estado === 'listo' && p.tipo === 'delivery' ? '<p class="sis-nota">Esperando al repartidor' + (p.asignadoA ? ' (asignado a ' + esc(p.asignadoA) + ')' : '') + '.</p>' : '') +
      (p.estado === 'camino' ? '<p class="sis-nota">' + esc((p.repartidor && p.repartidor.nombre) || p.asignadoA || 'Repartidor') + ' va en camino.</p>' : '') +
      '<div class="acc">' +
      (p.estado === 'recibido' ? '<button class="btn-s prim" type="button" data-aceptar>Aceptar pedido</button><button class="btn-s peligro" type="button" data-rechazar>Rechazar</button>' : '') +
      (accion ? '<button class="btn-s prim" type="button" data-avanzar>' + accion + '</button>' : '') +
      (!p.pago.pagado && p.estado !== 'camino' && p.estado !== 'recibido' ? '<button class="btn-s" type="button" data-pagado>' + (p.tipo === 'delivery' ? 'Cobrado' : 'Cobrado en caja') + '</button>' : '') +
      (p.estado === 'aceptado' || p.estado === 'preparacion' ? '<button class="btn-s peligro" type="button" data-rechazar>Cancelar pedido</button>' : '') + '</div></article>';
  }
  function pintar() {
    if (!kds) return;
    var l = P.todos();
    var activos = l.filter(function (p) { return COLS.some(function (c) { return c[0] === p.estado; }); });
    // Aviso sonoro: una vez por pedido nuevo y una vez más si el cliente lo modifica antes de aceptarlo
    var suena = false;
    activos.forEach(function (p) { if (p.estado !== 'recibido') { anunciados[p.id] = p.rev || 1; return; } if (anunciados[p.id] !== (p.rev || 1)) { if (!primera) suena = true; anunciados[p.id] = p.rev || 1; } });
    if (suena) beep();
    // No se redibuja mientras alguien elige el tiempo: se perdería la selección
    if (document.activeElement && document.activeElement.matches && document.activeElement.matches('[data-prep]')) return;
    kds.innerHTML = COLS.map(function (c) {
      var de = activos.filter(function (p) { return p.estado === c[0]; }).sort(function (a, b) { return a.creado - b.creado; });
      return '<section style="--ec:' + P.ESTADOS[c[0]].color + '" aria-label="' + c[1] + '"><h2>' + c[1] + '<span>' + de.length + '</span></h2>' + (de.length ? de.map(tarjeta).join('') : '<p class="sis-nota">Sin pedidos.</p>') + '</section>';
    }).join('');
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var hechos = l.filter(function (p) { return p.estado === 'entregado' && p.creado >= hoy.getTime(); });
    app.querySelector('[data-hechos]').textContent = hechos.length ? hechos.map(function (p) { return '#' + p.codigo + ' (' + P.tipoTxt(p) + ')'; }).join(' · ') : 'Todavía ninguno.';
    primera = false;
  }
  function clic(e) {
    var card = e.target.closest('[data-id]'); if (!card) return;
    var id = card.dataset.id, p = P.obtener(id); if (!p) return;
    if (e.target.closest('[data-aceptar]')) {
      if (P.modificandoAhora(p) && !confirm('El cliente está modificando este pedido. Si lo aceptas ahora, sus cambios no se guardarán. ¿Aceptar igual?')) return;
      var s = card.querySelector('[data-prep]'); P.aceptar(id, s ? +s.value : p.prepMin);
    }
    if (e.target.closest('[data-rechazar]')) {
      var motivo = prompt('¿Por qué no se puede aceptar el pedido #' + p.codigo + '? El cliente verá este motivo.', 'Sin stock de un producto');
      if (motivo !== null) P.rechazar(id, motivo.trim() || 'El local no pudo aceptar el pedido');
    }
    if (e.target.closest('[data-avanzar]')) {
      var sig = P.siguiente(p), extra = null;
      if (sig === 'entregado' && !p.pago.pagado) extra = { pago: Object.assign({}, p.pago, { pagado: true, cuando: Date.now() }) };   // en mesa y retiro, al entregar se da por cobrado
      P.cambiar(id, sig, extra);
    }
    if (e.target.closest('[data-mas5]')) P.actualizar(id, function (x) { x.prepMin += 5; });
    if (e.target.closest('[data-pagado]')) P.marcarPagado(id, true);
  }
})();
