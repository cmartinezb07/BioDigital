// Panel del dueño: visitas a la carta, pedidos, conversión, pagados, ventas, ticket promedio, tiempos de cocina,
// platos más vendidos, canales, de dónde llegan, opiniones y recomendaciones. Se actualiza en vivo.
(function () {
  'use strict';
  var P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var dias = 7, platos = [];
  fetch('../').then(function (r) { return r.text(); }).then(function (h) {
    var m = h.match(/<script type="application\/json" id="menu-datos">([\s\S]*?)<\/script>/);
    if (m) JSON.parse(m[1]).categorias.forEach(function (c) { c.platos.forEach(function (p) { platos.push(p); }); });
    // Primera vez que se abre el panel sin datos: 7 días de prueba (marcados) para que no se vea vacío
    var ya = true; try { ya = !!localStorage.getItem('fogon-sembrado'); if (!ya) localStorage.setItem('fogon-sembrado', '1'); } catch (e) {}
    if (!ya && !P.todos().some(function (x) { return x.semilla; }) && platos.length) P.sembrar(platos);
  }).catch(function () {});

  app.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;justify-content:space-between"><div><h1 class="sis-h">Panel del dueño</h1><p class="sis-sub">Cómo le va a tu carta digital, en vivo.</p></div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-s prim" type="button" data-simular>Simular un servicio</button><button class="btn-s" type="button" data-semilla>Cargar 7 días de prueba</button><button class="btn-s" type="button" data-csv>Descargar CSV</button><button class="btn-s peligro" type="button" data-borrar>Borrar datos</button></div></div>' +
    '<div class="filtros" role="group" aria-label="Período">' + [[1, 'Hoy'], [7, '7 días'], [30, '30 días']].map(function (d) { return '<button class="btn-s" type="button" data-dias="' + d[0] + '" aria-pressed="' + (d[0] === dias) + '">' + d[1] + '</button>'; }).join('') + '</div>' +
    '<p class="sis-nota" data-sim style="margin-top:8px"></p><p class="sis-nota" data-aviso style="margin-top:8px"></p><div class="kpis" data-kpis></div><div class="grid-p" data-graf></div>';

  function desde() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() - (dias - 1) * 864e5; }
  function contar(arr, f) { var o = {}; arr.forEach(function (x) { var k = f(x); if (k) o[k] = (o[k] || 0) + (x._n || 1); }); return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }); }
  function barras(pares, fmt) {
    var max = Math.max.apply(null, pares.map(function (x) { return x[1]; }).concat([1]));
    return '<div class="barras" role="img" aria-label="' + esc(pares.map(function (x) { return x[0] + ': ' + (fmt ? fmt(x[1]) : x[1]); }).join(', ')) + '">' + pares.map(function (x) { return '<div title="' + esc(x[0] + ': ' + (fmt ? fmt(x[1]) : x[1])) + '"><i style="height:' + (x[1] / max * 82) + '%"></i><small>' + esc(x[0]) + '</small></div>'; }).join('') + '</div>';
  }
  function lista(pares, fmt, vacio) {
    if (!pares.length) return '<p class="sis-nota">' + (vacio || 'Sin datos todavía.') + '</p>';
    var max = pares[0][1];
    return '<ul class="lista-p">' + pares.slice(0, 8).map(function (x) { return '<li><span>' + esc(x[0]) + '</span><b>' + (fmt ? fmt(x[1]) : x[1]) + '</b><span class="bar"><i style="width:' + (x[1] / max * 100) + '%"></i></span></li>'; }).join('') + '</ul>';
  }
  function pintar() {
    var t0 = desde(), todos = P.todos(), vis = P.visitas().filter(function (v) { return v.t >= t0; });
    var ped = todos.filter(function (p) { return p.creado >= t0; }), validos = ped.filter(function (p) { return p.estado !== 'cancelado'; });
    var pagados = validos.filter(function (p) { return p.pago.pagado; }), ventas = pagados.reduce(function (s, p) { return s + p.total; }, 0);
    var tiempos = validos.map(function (p) { var a = P.cuando(p, 'preparacion') || P.cuando(p, 'recibido'), b = P.cuando(p, 'listo'); return a && b ? (b - a) / 60000 * (p.escala || 1) : null; }).filter(function (x) { return x != null; });
    var ops = validos.filter(function (p) { return p.opinion; }), notas = ops.map(function (p) { return p.opinion.estrellas; });
    var recom = ops.filter(function (p) { return p.opinion.recomendaria != null; }), si = recom.filter(function (p) { return p.opinion.recomendaria; }).length;
    var invitados = validos.filter(function (p) { return p.invitadoPor; }).length;
    var prom = function (a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; };
    app.querySelector('[data-aviso]').textContent = todos.some(function (p) { return p.semilla; }) ? 'Incluye datos de prueba generados para la demostración (marcados como "Cliente de demostración"). Las opiniones de prueba solo tienen estrellas, sin comentarios inventados.' : '';
    app.querySelector('[data-kpis]').innerHTML = [
      ['Visitas a la carta', vis.length, 'personas que la abrieron'],
      ['Pedidos', ped.length, (vis.length ? Math.round(ped.length / vis.length * 100) : 0) + ' % de las visitas'],
      ['Pagados', pagados.length, (validos.length ? Math.round(pagados.length / validos.length * 100) : 0) + ' % de los pedidos'],
      ['Ventas', clp(ventas), 'pedidos pagados'],
      ['Ticket promedio', clp(pagados.length ? ventas / pagados.length : 0), 'por pedido pagado'],
      ['Tiempo de cocina', Math.round(prom(tiempos)) + ' min', 'promedio hasta "listo"'],
      ['Nota promedio', notas.length ? prom(notas).toFixed(1) + ' ★' : '—', notas.length + ' opiniones'],
      ['Recomendarían', recom.length ? Math.round(si / recom.length * 100) + ' %' : '—', invitados + ' pedidos llegaron por invitación']
    ].map(function (k) { return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>'; }).join('');

    var porDia = []; for (var d = 0; d < Math.min(dias, 30); d++) { var ini = t0 + d * 864e5, fin = ini + 864e5; porDia.push([new Date(ini).toLocaleDateString('es-CL', dias > 7 ? { day: 'numeric' } : { weekday: 'short' }), pagados.filter(function (p) { return p.creado >= ini && p.creado < fin; }).reduce(function (s, p) { return s + p.total; }, 0)]); }
    var porHora = []; for (var h = 12; h <= 23; h++) porHora.push([String(h), validos.filter(function (p) { return new Date(p.creado).getHours() === h; }).length]);
    var items = []; validos.forEach(function (p) { p.items.forEach(function (i) { items.push({ n: i.nombre, _n: i.cant }); }); });
    var CANAL = { mesa: 'En la mesa', retiro: 'Para retirar', delivery: 'Delivery' };
    var recientes = ped.slice(-12).reverse();
    app.querySelector('[data-graf]').innerHTML =
      '<section class="caja"><h2>Ventas por día</h2>' + barras(dias === 1 ? porHora.map(function (x) { return [x[0], pagados.filter(function (p) { return new Date(p.creado).getHours() === +x[0]; }).reduce(function (s, p) { return s + p.total; }, 0)]; }) : porDia, clp) + '</section>' +
      '<section class="caja"><h2>Pedidos por hora</h2>' + barras(porHora) + '</section>' +
      '<section class="caja"><h2>Platos más pedidos</h2>' + lista(contar(items, function (x) { return x.n; }), function (n) { return n + ' u.'; }) + '</section>' +
      '<section class="caja"><h2>Cómo piden</h2>' + lista(contar(validos, function (p) { return CANAL[p.tipo]; }), function (n) { return n + ' pedidos'; }) + '</section>' +
      '<section class="caja"><h2>De dónde llegan a la carta</h2>' + lista(contar(vis, function (v) { return v.origen; }), function (n) { return n + ' visitas'; }) + '</section>' +
      '<section class="caja"><h2>Cómo nos conocieron</h2>' + lista(contar(validos, function (p) { return p.referencia; }), function (n) { return n + ' clientes'; }, 'Aún nadie respondió.') + '</section>' +
      '<section class="caja"><h2>Opiniones recientes</h2>' + (ops.length ? '<ul class="lista-p">' + ops.slice(-8).reverse().map(function (p) { return '<li><span>' + '★'.repeat(p.opinion.estrellas) + '<span style="color:var(--fg-3)">' + '★'.repeat(5 - p.opinion.estrellas) + '</span>' + (p.opinion.texto ? ' · ' + esc(p.opinion.texto) : '') + '</span><small class="sis-nota">#' + esc(p.codigo) + (p.semilla ? ' · prueba' : '') + '</small></li>'; }).join('') + '</ul>' : '<p class="sis-nota">Las opiniones llegan cuando el cliente recibe su pedido.</p>') + '</section>' +
      '<section class="caja"><h2>Últimos pedidos</h2><div class="scroll-x"><table class="tabla-p"><thead><tr><th>#</th><th>Hora</th><th>Cómo</th><th>Total</th><th>Estado</th><th>Pago</th></tr></thead><tbody>' +
        (recientes.length ? recientes.map(function (p) { return '<tr><td>' + esc(p.codigo) + '</td><td>' + P.hora(p.creado) + '</td><td>' + esc(P.tipoTxt(p)) + '</td><td>' + clp(p.total) + '</td><td><span class="chip-est" style="--ec:' + P.ESTADOS[p.estado].color + '">' + esc(P.nombreEstado(p)) + '</span></td><td>' + (p.pago.pagado ? 'Pagado' : 'Pendiente') + '</td></tr>'; }).join('') : '<tr><td colspan="6" class="sis-nota">Sin pedidos en este período.</td></tr>') +
      '</tbody></table></div></section>';
  }
  app.addEventListener('click', function (e) {
    var d = e.target.closest('[data-dias]');
    if (d) { dias = +d.dataset.dias; [].forEach.call(app.querySelectorAll('[data-dias]'), function (b) { b.setAttribute('aria-pressed', String(b === d)); }); pintar(); }
    if (e.target.closest('[data-simular]')) {
      if (!platos.length) return alert('No se pudo leer la carta. Recarga la página.');
      P.fijarAuto({ activo: true }); P.simular({ pedidos: 10, cadaSeg: 6, platos: platos });
      app.querySelector('[data-sim]').textContent = 'Simulación en curso: llegan 10 clientes, uno cada 6 segundos, y todo avanza solo (velocidad ×' + P.auto().velocidad + '). Abre la cocina o el seguimiento en otra pestaña para verlo.';
    }
    if (e.target.closest('[data-semilla]')) { if (platos.length) P.sembrar(platos); else alert('No se pudo leer la carta. Recarga la página.'); }
    if (e.target.closest('[data-borrar]') && confirm('¿Borrar todos los pedidos y visitas de esta demostración?')) P.borrarDemo();
    if (e.target.closest('[data-csv]')) {
      var f = [['codigo', 'fecha', 'tipo', 'mesa', 'comuna', 'items', 'subtotal', 'envio', 'total', 'estado', 'pagado', 'metodo_pago', 'referencia', 'estrellas', 'recomendaria']];
      P.todos().forEach(function (p) { f.push([p.codigo, new Date(p.creado).toISOString(), p.tipo, p.mesa || '', p.cliente.comuna || '', p.items.map(function (i) { return i.cant + 'x ' + i.nombre; }).join(' | '), p.subtotal, p.envio, p.total, p.estado, p.pago.pagado ? 'si' : 'no', p.pago.metodo, p.referencia || '', p.opinion ? p.opinion.estrellas : '', p.opinion ? p.opinion.recomendaria : '']); });
      // Celdas que empiezan con = + - @ se anteponen con ' para que una planilla no las ejecute como fórmula
      var csv = f.map(function (r) { return r.map(function (c) { c = String(c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'pedidos-fogon-del-sur.csv'; a.click();
    }
  });
  P.escuchar(pintar);
  pintar();
})();
