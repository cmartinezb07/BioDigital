// Pantalla de cocina (KDS): los pedidos llegan solos, se marcan "en preparación" y "listo", y el cliente ve el cambio al instante.
// Reloj por pedido con color (verde, amarillo a los 10 min, rojo a los 20), sonido al llegar uno nuevo y marca de pagado.
(function () {
  'use strict';
  var P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var COLS = [['recibido', 'Nuevos'], ['preparacion', 'En preparación'], ['listo', 'Listos'], ['camino', 'En reparto']];
  var vistos = {}, sonido = false, audio = null, primera = true;
  app.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;justify-content:space-between;margin-bottom:16px"><div><h1 class="sis-h">Cocina</h1><p class="sis-sub">Los pedidos de la carta llegan aquí solos. Al marcarlos, el cliente lo ve en su celular.</p></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-s" type="button" data-sonido aria-pressed="false">Activar sonido</button><a class="btn-s" href="../" target="_blank" rel="noopener">Abrir la carta para pedir</a></div></div><div class="kds" aria-live="polite"></div>' +
    '<h2 style="font-size:17px;margin:24px 0 10px">Entregados hoy</h2><div data-hechos class="sis-nota"></div>';
  var kds = app.querySelector('.kds');

  function beep() {
    if (!sonido) return;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); [0, .18].forEach(function (d) { var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 988; g.gain.setValueAtTime(.15, audio.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + d + .15); o.connect(g).connect(audio.destination); o.start(audio.currentTime + d); o.stop(audio.currentTime + d + .16); }); } catch (e) {}
  }
  app.querySelector('[data-sonido]').addEventListener('click', function () { sonido = !sonido; this.setAttribute('aria-pressed', String(sonido)); this.textContent = sonido ? 'Sonido activado ✓' : 'Activar sonido'; beep(); });

  function minutos(p) { return Math.floor((Date.now() - p.creado) / 60000); }
  function tarjeta(p) {
    var m = minutos(p), cls = m >= 20 ? 'rojo' : m >= 10 ? 'amarillo' : '', sig = P.siguiente(p);
    var accion = { recibido: 'Empezar', preparacion: 'Marcar listo', listo: p.tipo === 'delivery' ? 'Entregar al repartidor' : p.tipo === 'mesa' ? 'Servido en la mesa' : 'Entregado al cliente', camino: '' }[p.estado];
    return '<article class="comanda' + (!vistos[p.id] && !primera ? ' nueva' : '') + '" style="--ec:' + P.ESTADOS[p.estado].color + '" data-id="' + p.id + '">' +
      '<div class="cab"><b>#' + esc(p.codigo) + '</b><span class="tipo">' + esc(P.tipoTxt(p)) + '</span><span class="reloj ' + cls + '" title="Desde que llegó">' + m + ' min</span></div>' +
      '<ul>' + p.items.map(function (i) { return '<li><b>' + i.cant + '×</b> ' + esc(i.nombre) + '</li>'; }).join('') + '</ul>' +
      (p.nota ? '<p class="sis-nota">Nota: ' + esc(p.nota) + '</p>' : '') +
      '<p class="sis-nota">' + esc(p.cliente.nombre) + (p.tipo === 'delivery' ? ' · ' + esc(p.cliente.comuna) + ' · ' + p.km + ' km' : '') + ' · ' + clp(p.total) + ' <span class="' + (p.pago.pagado ? 'pagado">Pagado' : 'por-pagar">Por pagar') + '</span></p>' +
      (p.estado === 'recibido' ? '<div class="campo"><label class="lbl" for="pm-' + p.id + '">Tiempo de preparación</label><select id="pm-' + p.id + '" data-prep>' + [10, 15, 20, 25, 30, 40].map(function (x) { return '<option value="' + x + '"' + (Math.abs(x - p.prepMin) < 3 ? ' selected' : '') + '>' + x + ' min</option>'; }).join('') + '</select></div>' : '') +
      (p.estado === 'preparacion' ? '<p class="sis-nota">Listo estimado: ' + P.hora(P.eta(p).listo) + '</p>' : '') +
      '<div class="acc">' + (accion && sig ? '<button class="btn-s prim" type="button" data-avanzar>' + accion + '</button>' : '') +
      (!p.pago.pagado ? '<button class="btn-s" type="button" data-pagado>Marcar pagado</button>' : '') +
      (p.estado === 'recibido' ? '<button class="btn-s peligro" type="button" data-cancelar>Cancelar</button>' : '') + '</div></article>';
  }
  function pintar() {
    var l = P.todos().filter(function (p) { return !p.semilla; });
    var activos = l.filter(function (p) { return COLS.some(function (c) { return c[0] === p.estado; }); });
    var nuevos = activos.filter(function (p) { return !vistos[p.id] && p.estado === 'recibido'; });
    if (nuevos.length && !primera) beep();
    kds.innerHTML = COLS.map(function (c) {
      var de = activos.filter(function (p) { return p.estado === c[0]; });
      return '<section style="--ec:' + P.ESTADOS[c[0]].color + '" aria-label="' + c[1] + '"><h2>' + c[1] + '<span>' + de.length + '</span></h2>' + (de.length ? de.map(tarjeta).join('') : '<p class="sis-nota">Sin pedidos.</p>') + '</section>';
    }).join('');
    activos.forEach(function (p) { vistos[p.id] = true; });
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var hechos = l.filter(function (p) { return p.estado === 'entregado' && p.creado >= hoy.getTime(); });
    app.querySelector('[data-hechos]').textContent = hechos.length ? hechos.map(function (p) { return '#' + p.codigo + ' (' + P.tipoTxt(p) + ')'; }).join(' · ') : 'Todavía ninguno.';
    primera = false;
  }
  kds.addEventListener('click', function (e) {
    var card = e.target.closest('[data-id]'); if (!card) return;
    var id = card.dataset.id, p = P.obtener(id); if (!p) return;
    if (e.target.closest('[data-avanzar]')) {
      var sig = P.siguiente(p), extra = null;
      if (p.estado === 'recibido') { var s = card.querySelector('[data-prep]'); extra = { prepMin: s ? +s.value : p.prepMin, escala: 1 }; }
      if (sig === 'camino') extra = { repartidor: { nombre: 'Repartidor de turno' } };
      P.cambiar(id, sig, extra);
    }
    if (e.target.closest('[data-pagado]')) P.marcarPagado(id, true);
    if (e.target.closest('[data-cancelar]') && confirm('¿Cancelar el pedido #' + p.codigo + '? El cliente verá el aviso.')) P.cambiar(id, 'cancelado');
  });
  // Primera vez sin pedidos activos: 4 comandas de prueba en distintos estados, para ver la pantalla funcionando
  (function () {
    var ya = true; try { ya = !!localStorage.getItem('fogon-cocina-demo'); if (!ya) localStorage.setItem('fogon-cocina-demo', '1'); } catch (e) {}
    if (ya || P.todos().some(function (p) { return !p.semilla && p.estado !== 'entregado' && p.estado !== 'cancelado'; })) return;
    var it = function (id, n, pr, c) { return { id: id, nombre: n, precio: pr, cant: c }; };
    var cli = function (n, com) { return { nombre: n, telefono: '', direccion: 'Calle de prueba 100', comuna: com || '' }; };
    var a = P.crear({ tipo: 'mesa', mesa: 4, cliente: cli('Mesa 4'), items: [it('lomo', 'Lomo a la parrilla con papas y arroz', 13900, 2), it('vino', 'Copa de vino de la casa', 4500, 2)], pago: { metodo: 'caja', pagado: false } });
    var b = P.crear({ tipo: 'delivery', cliente: cli('Cliente de prueba', 'Concepción'), items: [it('pastel', 'Pastel de choclo', 9900, 1), it('sopaipillas', 'Sopaipillas con pebre', 3900, 1)], pago: { metodo: 'linea', pagado: true }, nota: 'Sin cilantro' });
    var c = P.crear({ tipo: 'retiro', cliente: cli('Cliente de prueba'), items: [it('empanadas', 'Empanadas de horno', 5900, 2)], pago: { metodo: 'linea', pagado: true } });
    P.crear({ tipo: 'mesa', mesa: 9, cliente: cli('Mesa 9'), items: [it('salmon', 'Salmón a la parrilla', 13900, 1), it('limonada', 'Limonada menta jengibre', 3500, 1)], pago: { metodo: 'caja', pagado: false } });
    P.cambiar(a.id, 'preparacion'); P.cambiar(b.id, 'preparacion'); P.cambiar(c.id, 'preparacion'); P.cambiar(c.id, 'listo');
  })();
  P.escuchar(pintar);
  setInterval(function () { P.latido('cocina'); }, 4000); P.latido('cocina');
  setInterval(pintar, 30000);   // refresca los relojes
  pintar();
})();
