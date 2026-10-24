// Mis pedidos: el pedido activo (con su estado y, si todavía está "Nuevo", el botón para modificarlo) y el historial de los anteriores.
// Cada pedido se puede abrir para ver sus productos, precios, total, historial de estados y las versiones anteriores si se modificó.
// Los pedidos se encuentran por un código secreto guardado en este equipo (no hay cuentas): cada cliente solo ve los suyos.
(function () {
  'use strict';
  var P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  if (window.Carta) Carta.iniciar();

  function resumen(p) {
    var col = P.ESTADOS[p.estado].color;
    return '<span class="chip-est" style="--ec:' + col + '">' + esc(P.nombreEstado(p)) + '</span>';
  }
  function detalle(p) {
    var hist = (p.historial || []).map(function (h) { return '<li>' + esc(P.ESTADOS[h.estado] ? P.nombreEstado(p, h.estado) : h.estado) + ' · ' + P.hora(h.t) + '</li>'; }).join('');
    var eds = (p.ediciones || []).map(function (e) { return '<li>Versión ' + e.rev + ' (antes de modificar, ' + P.hora(e.t) + '): ' + e.items.map(function (i) { return i.cant + '× ' + esc(i.nombre); }).join(', ') + ' · ' + clp(e.total) + '</li>'; }).join('');
    return '<div class="detalle-ped">' + p.items.map(function (i) { return '<div class="fila"><span>' + P.lineaHtml(i) + '</span><span>' + clp(i.precio * i.cant) + '</span></div>'; }).join('') +
      (p.envio ? '<div class="fila"><span>Envío a ' + esc(p.cliente.comuna) + '</span><span>' + clp(p.envio) + '</span></div>' : '') +
      '<div class="fila tot"><span>Total</span><span>' + clp(p.total) + '</span></div></div>' +
      (p.nota ? '<p class="sis-nota">Nota: ' + esc(p.nota) + '</p>' : '') + (p.motivo ? '<p class="sis-nota">Motivo de la cancelación: ' + esc(p.motivo) + '</p>' : '') +
      '<p class="sis-nota" style="margin-top:8px"><b>Cambios de estado</b></p><ol class="sis-nota" style="margin:4px 0 0 18px">' + hist + '</ol>' +
      (eds ? '<p class="sis-nota" style="margin-top:8px"><b>Versiones anteriores</b> (el pedido se modificó ' + p.ediciones.length + (p.ediciones.length === 1 ? ' vez' : ' veces') + ')</p><ol class="sis-nota" style="margin:4px 0 0 18px">' + eds + '</ol>' : '');
  }
  function tarjeta(p) {
    var activo = P.ACTIVOS.indexOf(p.estado) > -1;
    return '<article class="caja" style="display:grid;gap:8px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between"><b style="font-size:18px">Pedido #' + esc(p.codigo) + '</b>' + resumen(p) + '</div>' +
      '<p class="sis-nota">' + P.fecha(p.creado) + ' · ' + P.hora(p.creado) + ' · ' + esc(P.tipoTxt(p)) + ' · ' + clp(p.total) + ' · ' + p.items.reduce(function (t, i) { return t + i.cant; }, 0) + ' productos</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' + (activo ? '<a class="btn-s prim" href="../pedido/?id=' + esc(p.id) + '">Seguir mi pedido</a>' : '<a class="btn-s" href="../pedido/?id=' + esc(p.id) + '">Ver seguimiento</a>') +
      (p.estado === 'recibido' ? '<a class="btn-s" href="../?editar=' + esc(p.id) + '">Modificar mi pedido</a>' : '') + '</div>' +
      '<details><summary>Ver detalle</summary>' + detalle(p) + '</details></article>';
  }
  function pintar() {
    var l = P.misPedidos(), act = l.filter(function (p) { return P.ACTIVOS.indexOf(p.estado) > -1; }), hist = l.filter(function (p) { return P.ACTIVOS.indexOf(p.estado) < 0; });
    app.innerHTML = '<h1 class="sis-h">Mis pedidos</h1><p class="sis-sub">Tus pedidos hechos desde este equipo. Mientras un pedido está <b>Nuevo</b> (el local no lo acepta) puedes modificarlo; después ya no.</p>' +
      '<div style="display:grid;gap:14px;max-width:620px">' +
      '<h2 style="font-size:18px;margin-top:6px">Pedido activo</h2>' + (act.length ? act.map(tarjeta).join('') : '<p class="sis-nota">No tienes pedidos en curso. <a href="../">Haz uno desde la carta</a>.</p>') +
      '<h2 style="font-size:18px;margin-top:14px">Historial</h2>' + (hist.length ? hist.map(tarjeta).join('') : '<p class="sis-nota">Todavía no tienes pedidos terminados.</p>') + '</div>';
  }
  var abiertos = {};
  function guardarAbiertos() { [].forEach.call(app.querySelectorAll('article'), function (a, i) { abiertos[a.querySelector('b').textContent] = a.querySelector('details').open; }); }
  function repintar() { guardarAbiertos(); pintar(); [].forEach.call(app.querySelectorAll('article'), function (a) { if (abiertos[a.querySelector('b').textContent]) a.querySelector('details').open = true; }); }
  P.esperar().then(function () { pintar(); P.escuchar(function (m) { if (m.tipo === 'cambio' || m.tipo === 'nuevo') repintar(); }); }, function () { app.innerHTML = '<div class="vacio-s"><p>No pudimos conectarnos. Revisa tu internet y recarga la página.</p></div>'; });
})();
