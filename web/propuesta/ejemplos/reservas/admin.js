// Panel del negocio (sistema de reservas): resumen, calendario, reservas, inventario y capacidad, paquetes y precios,
// promociones, políticas, avisos automáticos, integraciones y reportes. Todo se actualiza en vivo con las reservas del sitio.
(function () {
  'use strict';
  var R = window.Reservas, U = R.util, clp = U.clp, app = document.getElementById('app');
  var q = new URLSearchParams(location.search);
  var neg = q.get('negocio') || 'cabanas'; if (!R.NEGOCIOS.some(function (n) { return n.id === neg; })) neg = 'cabanas';
  var tab = 'resumen', rango = 30, filtro = { estado: '', texto: '' }, desdeCal = U.hoy();
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var TABS = [['resumen', 'Resumen'], ['calendario', 'Calendario'], ['reservas', 'Reservas'], ['inventario', 'Inventario y capacidad'], ['precios', 'Paquetes y precios'], ['promos', 'Promociones'], ['politicas', 'Políticas'], ['avisos', 'Avisos automáticos'], ['integraciones', 'Integraciones'], ['reportes', 'Reportes']];
  var chip = function (e) { var x = R.ESTADOS[e]; return '<span class="chip" style="--ec:' + x[1] + '">' + x[0] + '</span>'; };
  var nombreDe = function (D, r) { return r.servicio ? (R.servicio(D, r.servicio) || {}).nombre : (R.recurso(D, r.recurso) || {}).nombre; };
  var dia = function (ms) { return new Date(ms).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }); };
  var hora = function (ms) { var t = new Date(ms); return U.pad(t.getHours()) + ':' + U.pad(t.getMinutes()); };
  var ACTIVAS = ['retenida', 'confirmada', 'pagada', 'checkin'];
  function toast(x) { var e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', 'status'); e.textContent = x; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3500); }
  function bajar(nombre, txt, tipo) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: tipo })); a.download = nombre; a.click(); }
  function csv(filas) { return '﻿' + filas.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(','); }).join('\n'); }

  app.innerHTML = '<div class="wrap"><div class="negocios" role="group" aria-label="Negocio"></div><div class="adm"><nav class="menu-adm" aria-label="Secciones del panel"></nav><div data-vista></div></div></div>';
  function pintar() {
    R.automatico(neg);
    var D = R.leer(neg);
    // Primera vez que se abre el panel de un negocio: se cargan datos de prueba para que no se vea vacío (marcados como prueba)
    var marca = 'bdres-sembrado-' + neg, ya = true; try { ya = !!localStorage.getItem(marca); if (!ya) localStorage.setItem(marca, '1'); } catch (e) {}
    if (!ya && !D.reservas.length) { R.sembrar(neg); return; }
    app.querySelector('.negocios').innerHTML = R.NEGOCIOS.map(function (n) { return '<button type="button" data-neg="' + n.id + '" aria-pressed="' + (n.id === neg) + '">' + R.icono(n.icono, 18) + esc(n.nombre) + '</button>'; }).join('');
    app.querySelector('.menu-adm').innerHTML = TABS.map(function (t) { return '<button type="button" data-tab="' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + '</button>'; }).join('');
    var v = app.querySelector('[data-vista]');
    v.innerHTML = VISTAS[tab](D);
    [].forEach.call(document.querySelectorAll('[data-cliente]'), function (a) { a.href = '../?negocio=' + neg; });
  }

  // ---------- Métricas compartidas por Resumen y Reportes ----------
  function metricas(D, dias) {
    var c = D.config, fin = U.fdate(U.sumaDias(U.hoy(), 1)).getTime(), ini = fin - dias * 864e5;
    var en = D.reservas.filter(function (r) { return r.desde < fin && r.hasta > ini; });
    var validas = en.filter(function (r) { return r.estado !== 'cancelada' && r.estado !== 'retenida'; });
    var creadas = D.reservas.filter(function (r) { return r.creada >= ini && r.creada < fin && r.estado !== 'retenida'; });
    var ingresos = validas.reduce(function (s, r) { return s + r.precio.total; }, 0), cobrado = validas.reduce(function (s, r) { return s + (r.pagado || 0); }, 0);
    var ocup, capacidad, vendido;
    if (c.modo === 'noches') { capacidad = c.recursos.reduce(function (s, r) { return s + r.unidades; }, 0) * dias; vendido = validas.reduce(function (s, r) { return s + Math.round((Math.min(r.hasta, fin) - Math.max(r.desde, ini)) / 864e5); }, 0); }
    else if (c.modo === 'cupos') { capacidad = 0; vendido = 0; for (var i = 0; i < dias; i++) { var f = U.sumaDias(U.hoy(), -dias + 1 + i); c.servicios.forEach(function (s) { if (s.dias.indexOf(U.diaSem(f)) > -1) capacidad += s.capacidad * s.salidas.length; }); } vendido = validas.reduce(function (s, r) { return s + r.personas; }, 0); }
    else { capacidad = 0; for (var j = 0; j < dias; j++) { var f2 = U.sumaDias(U.hoy(), -dias + 1 + j), hs = (c.horario[['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'][U.diaSem(f2)]] || []).reduce(function (s, tr) { return s + (U.minH(tr[1]) - U.minH(tr[0])) / 60; }, 0); capacidad += hs * c.recursos.length; } vendido = validas.reduce(function (s, r) { return s + (r.hasta - r.desde) / 36e5; }, 0); }
    ocup = capacidad ? Math.min(100, Math.round(vendido / capacidad * 100)) : 0;
    var canceladas = creadas.filter(function (r) { return r.estado === 'cancelada'; }).length, noshow = en.filter(function (r) { return r.estado === 'noshow'; }).length;
    var lead = creadas.filter(function (r) { return r.estado !== 'cancelada'; }).map(function (r) { return (r.desde - r.creada) / 864e5; });
    return { validas: validas, creadas: creadas, ingresos: ingresos, cobrado: cobrado, ocup: ocup, vendido: vendido, capacidad: capacidad, canceladas: canceladas, noshow: noshow,
      tasaCancel: creadas.length ? Math.round(canceladas / creadas.length * 100) : 0, lead: lead.length ? Math.round(lead.reduce(function (s, x) { return s + x; }, 0) / lead.length) : 0, ini: ini, fin: fin };
  }
  function kpi(t, v, s) { return '<div class="kpi"><span>' + t + '</span><b>' + v + '</b><small>' + (s || '') + '</small></div>'; }
  function lista(pares, fmt) { if (!pares.length) return '<p class="nota">Sin datos.</p>'; var max = Math.max.apply(null, pares.map(function (p) { return p[1]; })); return '<ul class="lista-b">' + pares.map(function (p) { return '<li><span>' + esc(p[0]) + '</span><b>' + (fmt ? fmt(p[1]) : p[1]) + '</b><span class="b"><i style="width:' + (max ? p[1] / max * 100 : 0) + '%"></i></span></li>'; }).join('') + '</ul>'; }
  function agrupar(arr, k, v) { var o = {}; arr.forEach(function (x) { var key = k(x); o[key] = (o[key] || 0) + (v ? v(x) : 1); }); return Object.keys(o).map(function (x) { return [x, o[x]]; }).sort(function (a, b) { return b[1] - a[1]; }); }

  var VISTAS = {
    resumen: function (D) {
      var c = D.config, m = metricas(D, 30), hoyI = U.fdate(U.hoy()).getTime(), hoyF = hoyI + 864e5;
      var deHoy = D.reservas.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde < hoyF && r.hasta > hoyI; }).sort(function (a, b) { return a.desde - b.desde; });
      var prox = D.reservas.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde >= hoyF && r.desde < hoyF + 7 * 864e5; });
      var porCobrar = D.reservas.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde >= hoyI; }).reduce(function (s, r) { return s + Math.max(0, r.precio.total - r.pagado); }, 0);
      var ret = D.reservas.filter(function (r) { return r.estado === 'retenida'; }), esp = (D.espera || []).filter(function (e) { return !e.avisado; });
      return '<div class="marca-n" style="margin-bottom:14px">' + R.logo(c, 48) + '<div><h1 style="font-size:26px">' + esc(c.nombre) + '</h1><p class="nota">' + esc(c.rubro) + ' · <span class="vivo">En vivo</span> · <a data-cliente href="../">Ver el sitio de reservas</a></p></div></div>' +
        '<div class="kpis">' + kpi(c.modo === 'noches' ? 'Llegadas y estadías hoy' : 'Reservas de hoy', deHoy.length) + kpi('Próximos 7 días', prox.length) + kpi('Ocupación (30 días)', m.ocup + ' %', c.modo === 'noches' ? m.vendido + ' de ' + m.capacidad + ' noches' : '') + kpi('Ingresos (30 días)', clp(m.ingresos), 'cobrado ' + clp(m.cobrado)) + kpi('Por cobrar', clp(porCobrar), 'saldos de reservas futuras') + kpi('Cancelaciones', m.tasaCancel + ' %', m.noshow + ' no llegaron') + '</div>' +
        '<div class="grid2"><section class="caja"><h2>Hoy</h2>' + (deHoy.length ? '<ul class="lista-b">' + deHoy.map(function (r) { return '<li><span>' + (c.modo === 'noches' ? '' : hora(r.desde) + ' · ') + esc(nombreDe(D, r)) + ' · ' + esc(r.cliente.nombre) + '</span>' + chip(r.estado) + '</li>'; }).join('') + '</ul>' : '<p class="nota">Nada para hoy.</p>') + '</section>' +
        '<section class="caja"><h2>Alertas</h2><ul class="lista-b">' + (ret.length ? ret.map(function (r) { return '<li><span>Retención ' + r.codigo + ' vence a las ' + hora(r.expira) + ' si no paga</span>' + chip('retenida') + '</li>'; }).join('') : '<li class="nota">Sin retenciones por vencer.</li>') +
        '<li><span>Lista de espera</span><b>' + esp.length + '</b></li><li><span>Avisos programados</span><b>' + D.avisos.filter(function (a) { return a.estado === 'programado'; }).length + '</b></li></ul>' +
        '<div class="acciones-r"><button class="btn chico" type="button" data-semilla>Cargar 60 días de prueba</button><button class="btn chico peligro" type="button" data-reset>Restablecer demo</button></div><p class="nota">Los datos de prueba se marcan como "Cliente de prueba".</p></section></div>';
    },
    calendario: function (D) {
      var c = D.config, n = 14, dias = []; for (var i = 0; i < n; i++) dias.push(U.sumaDias(desdeCal, i));
      var filas = [];
      c.modo === 'noches' ? c.recursos.forEach(function (r) { for (var u = 0; u < r.unidades; u++) filas.push({ rec: r.id, nom: r.nombre + (r.unidades > 1 ? ' ' + (u + 1) : ''), u: u }); }) : (c.modo === 'cupos' ? c.servicios : c.recursos).forEach(function (r) { filas.push({ rec: r.id, nom: r.nombre }); });
      // Asigna cada reserva por noches a una unidad libre (para dibujarla en su fila)
      var asign = {};
      if (c.modo === 'noches') c.recursos.forEach(function (r) { var unid = []; D.reservas.filter(function (x) { return x.recurso === r.id && x.estado !== 'cancelada'; }).sort(function (a, b) { return a.desde - b.desde; }).forEach(function (x) { for (var u = 0; u < r.unidades; u++) if (!unid[u] || unid[u] <= x.desde) { unid[u] = x.hasta; asign[x.id] = u; return; } asign[x.id] = 0; }); });
      var html = '<h1 style="font-size:24px;margin-bottom:10px">Calendario</h1><div class="acciones-r" style="justify-content:flex-start;margin:0 0 10px"><button class="btn chico" type="button" data-cal="-7">‹ Semana anterior</button><button class="btn chico" type="button" data-cal="0">Hoy</button><button class="btn chico" type="button" data-cal="7">Semana siguiente ›</button></div>' +
        '<div class="caja scroll"><div class="timeline"><div class="tl-fila cab" style="--n:' + n + '"><span class="nom"></span>' + dias.map(function (f) { return '<span>' + U.fdate(f).toLocaleDateString('es-CL', { weekday: 'narrow', day: 'numeric' }) + '</span>'; }).join('') + '</div>';
      filas.forEach(function (fi) {
        html += '<div class="tl-fila" style="--n:' + n + '"><span class="nom">' + esc(fi.nom) + '</span>';
        dias.forEach(function (f) {
          var a = U.fdate(f).getTime(), b = a + 864e5;
          var rs = D.reservas.filter(function (r) { return r.estado !== 'cancelada' && r.recurso === fi.rec && r.desde < b && r.hasta > a && (c.modo !== 'noches' || asign[r.id] === fi.u); });
          var bl = D.bloqueos.filter(function (x) { return x.recurso === fi.rec && x.desde < b && x.hasta > a; });
          if (rs.length) { var r0 = rs[0]; html += '<span class="oc" style="--ec:' + R.ESTADOS[r0.estado][1] + '" title="' + esc(r0.codigo + ' · ' + r0.cliente.nombre + ' · ' + R.ESTADOS[r0.estado][0]) + '">' + (c.modo === 'noches' ? (r0.desde >= a ? r0.codigo.slice(0, 3) : '') : c.modo === 'cupos' ? rs.reduce(function (s, x) { return s + x.personas; }, 0) : rs.length) + '</span>'; }
          else if (bl.length && (c.modo !== 'noches' || fi.u === 0)) html += '<span class="bl" title="' + esc(bl[0].motivo) + '"></span>';
          else html += '<span></span>';
        });
        html += '</div>';
      });
      html += '</div><p class="nota" style="margin-top:8px">' + (c.modo === 'noches' ? 'Cada fila es una unidad. Color = estado de la reserva; rayado = bloqueado (manual o sincronizado por iCal).' : c.modo === 'cupos' ? 'El número es la cantidad de personas reservadas ese día.' : 'El número es la cantidad de reservas del día.') + '</p></div>' +
        '<section class="caja"><h2>Bloquear fechas</h2><form class="form-l" data-bloq><div class="campo"><label for="b-rec">Recurso</label><select id="b-rec">' + (c.modo === 'cupos' ? c.servicios : c.recursos).map(function (r) { return '<option value="' + r.id + '">' + esc(r.nombre) + '</option>'; }).join('') + '</select></div><div class="campo"><label for="b-desde">Desde</label><input id="b-desde" type="date" value="' + U.hoy() + '"></div><div class="campo"><label for="b-hasta">Hasta</label><input id="b-hasta" type="date" value="' + U.sumaDias(U.hoy(), 1) + '"></div><div class="campo"><label for="b-mot">Motivo</label><input id="b-mot" value="Mantención"></div><button class="btn prim" type="submit">Bloquear</button></form></section>';
      return html;
    },
    reservas: function (D) {
      var l = D.reservas.slice().sort(function (a, b) { return b.desde - a.desde; }).filter(function (r) { return (!filtro.estado || r.estado === filtro.estado) && (!filtro.texto || (r.codigo + ' ' + r.cliente.nombre + ' ' + r.canal).toLowerCase().indexOf(filtro.texto.toLowerCase()) > -1); });
      var c = D.config;
      return '<h1 style="font-size:24px;margin-bottom:10px">Reservas</h1><div class="form-l" style="margin-bottom:12px"><div class="campo"><label for="f-txt">Buscar</label><input id="f-txt" value="' + esc(filtro.texto) + '" placeholder="Código, nombre o canal"></div><div class="campo"><label for="f-est">Estado</label><select id="f-est"><option value="">Todos</option>' + Object.keys(R.ESTADOS).map(function (k) { return '<option value="' + k + '"' + (filtro.estado === k ? ' selected' : '') + '>' + R.ESTADOS[k][0] + '</option>'; }).join('') + '</select></div><a class="btn" data-cliente href="../" target="_blank" rel="noopener">+ Nueva reserva (sitio)</a><button class="btn" type="button" data-csv-res>Descargar CSV</button></div>' +
        '<div class="caja scroll"><table class="tabla"><thead><tr><th>Código</th><th>Cuándo</th><th>Qué</th><th>Cliente</th><th>Canal</th><th>Total</th><th>Pagado</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
        (l.slice(0, 80).map(function (r) {
          var acc = [];
          if (r.estado === 'retenida' || r.estado === 'confirmada') acc.push('<button class="btn chico" type="button" data-acc="pagar" data-id="' + r.id + '">Registrar pago</button>');
          if (r.estado === 'confirmada' || r.estado === 'pagada') acc.push('<button class="btn chico" type="button" data-acc="checkin" data-id="' + r.id + '">' + (c.modo === 'noches' ? 'Check-in' : 'Llegó') + '</button>', '<button class="btn chico" type="button" data-acc="noshow" data-id="' + r.id + '">No llegó</button>');
          if (r.estado === 'checkin') acc.push('<button class="btn chico" type="button" data-acc="completada" data-id="' + r.id + '">' + (c.modo === 'noches' ? 'Check-out' : 'Terminar') + '</button>');
          if (ACTIVAS.indexOf(r.estado) > -1) acc.push('<button class="btn chico peligro" type="button" data-acc="cancelar" data-id="' + r.id + '">Cancelar</button>');
          return '<tr><td><b>' + r.codigo + '</b></td><td>' + dia(r.desde) + (c.modo === 'noches' ? ' → ' + dia(r.hasta) : ' ' + hora(r.desde)) + '</td><td>' + esc(nombreDe(D, r)) + (r.personas > 1 ? ' · ' + r.personas + ' pers.' : '') + '</td><td>' + esc(r.cliente.nombre) + '<br><small class="nota">' + esc(r.cliente.pais || '') + '</small></td><td>' + esc(r.canal) + '</td><td>' + clp(r.precio.total) + '</td><td>' + clp(r.pagado || 0) + '</td><td>' + chip(r.estado) + '</td><td style="display:flex;gap:4px;flex-wrap:wrap">' + acc.join('') + '</td></tr>';
        }).join('') || '<tr><td colspan="9" class="nota">Sin reservas con ese filtro. Prueba "Cargar 60 días de prueba" en Resumen.</td></tr>') + '</tbody></table></div><p class="nota" style="margin-top:6px">Se muestran las 80 más recientes de ' + l.length + '.</p>';
    },
    inventario: function (D) {
      var c = D.config, lista = c.modo === 'cupos' ? c.servicios : c.recursos;
      return '<h1 style="font-size:24px;margin-bottom:6px">Inventario y capacidad</h1><p class="nota" style="margin-bottom:12px">Al cambiar un valor, el sitio de reservas se actualiza al instante.</p><div class="caja scroll"><table class="tabla"><thead><tr><th>' + (c.modo === 'noches' ? 'Alojamiento' : c.modo === 'cupos' ? 'Tour' : c.modo === 'bloques' ? 'Espacio' : 'Profesional o box') + '</th>' +
        (c.modo === 'noches' ? '<th>Unidades</th><th>Capacidad</th>' : c.modo === 'cupos' ? '<th>Cupos por salida</th><th>Salidas</th>' : c.modo === 'bloques' ? '<th>Capacidad</th><th>Mínimo de horas</th>' : '<th>Servicios que atiende</th>') + '</tr></thead><tbody>' +
        lista.map(function (x) {
          return '<tr><td>' + esc(x.nombre) + '</td>' + (c.modo === 'noches' ? '<td><input type="number" min="0" max="50" value="' + x.unidades + '" data-inv="unidades" data-id="' + x.id + '" class="sel-s" style="width:90px" aria-label="Unidades de ' + esc(x.nombre) + '"></td><td><input type="number" min="1" max="30" value="' + x.capacidad + '" data-inv="capacidad" data-id="' + x.id + '" class="sel-s" style="width:90px" aria-label="Capacidad"></td>'
            : c.modo === 'cupos' ? '<td><input type="number" min="1" max="200" value="' + x.capacidad + '" data-inv="capacidad" data-id="' + x.id + '" class="sel-s" style="width:90px" aria-label="Cupos"></td><td><input value="' + esc(x.salidas.join(', ')) + '" data-inv="salidas" data-id="' + x.id + '" class="sel-s" aria-label="Salidas"></td>'
            : c.modo === 'bloques' ? '<td><input type="number" min="1" max="500" value="' + x.capacidad + '" data-inv="capacidad" data-id="' + x.id + '" class="sel-s" style="width:90px" aria-label="Capacidad"></td><td><input type="number" min="1" max="12" value="' + x.minHoras + '" data-inv="minHoras" data-id="' + x.id + '" class="sel-s" style="width:90px" aria-label="Mínimo de horas"></td>'
            : '<td>' + x.servicios.map(function (s) { return esc((R.servicio(D, s) || {}).nombre); }).join(', ') + '</td>') + '</tr>';
        }).join('') + '</tbody></table></div>' +
        (c.horario ? '<section class="caja"><h2>Horario de atención</h2><ul class="lista-b">' + ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].map(function (k) { return '<li><span>' + k + '</span><b>' + ((c.horario[k] || []).map(function (t) { return t.join('–'); }).join(', ') || 'Cerrado') + '</b></li>'; }).join('') + '</ul><p class="nota">Intervalo entre horas: ' + c.intervalo + ' min · margen entre reservas: ' + (c.buffer || 0) + ' min.</p></section>' : '');
    },
    precios: function (D) {
      var c = D.config, lista = c.modo === 'noches' || c.modo === 'bloques' ? c.recursos : c.servicios;
      var u = { noches: 'por noche', cupos: 'por persona', horas: 'por atención', bloques: 'por hora' }[c.modo];
      return '<h1 style="font-size:24px;margin-bottom:12px">Paquetes y precios</h1><div class="caja scroll"><table class="tabla"><thead><tr><th>Nombre</th><th>Precio ' + u + '</th>' + (c.modo === 'horas' || c.modo === 'cupos' ? '<th>Duración (min)</th>' : '') + '</tr></thead><tbody>' +
        lista.map(function (x) { return '<tr><td>' + esc(x.nombre) + '</td><td><input type="number" min="0" step="500" value="' + x.precio + '" data-pre="precio" data-id="' + x.id + '" data-lista="' + (lista === c.recursos ? 'recursos' : 'servicios') + '" class="sel-s" style="width:130px" aria-label="Precio"></td>' + (x.duracion ? '<td><input type="number" min="5" max="720" step="5" value="' + x.duracion + '" data-pre="duracion" data-id="' + x.id + '" data-lista="servicios" class="sel-s" style="width:100px" aria-label="Duración"></td>' : (c.modo === 'horas' || c.modo === 'cupos' ? '<td></td>' : '')) + '</tr>'; }).join('') + '</tbody></table></div>' +
        (c.modo === 'noches' ? '<section class="caja"><h2>Paquetes y extras</h2><ul class="lista-b">' + c.servicios.map(function (s) { return '<li><span>' + esc(s.nombre) + ' — ' + esc(s.desc) + '</span><b>' + clp(s.precio) + '</b></li>'; }).join('') + '</ul></section><section class="caja"><h2>Temporadas y fin de semana</h2><ul class="lista-b">' + c.temporadas.map(function (t) { return '<li><span>' + esc(t.nombre) + ' (' + t.desde + ' a ' + t.hasta + ')</span><b>×' + t.factor + '</b></li>'; }).join('') + '<li><span>Viernes y sábado</span><b>×' + c.factorFinde + '</b></li></ul><p class="nota">El precio de cada noche se calcula solo con estos factores.</p></section>' : '');
    },
    promos: function (D) {
      var c = D.config, NR = { anticipada: function (g) { return 'Reserva anticipada: ' + g.dias + '+ días antes'; }, estadia: function (g) { return 'Estadía larga: ' + g.noches + '+ noches'; }, grupo: function (g) { return 'Grupo: ' + g.personas + '+ personas'; }, ultimo: function (g) { return 'Último minuto: menos de ' + g.horas + ' h antes'; }, duracion: function (g) { return 'Arriendo largo: ' + g.horas + '+ horas'; } };
      return '<h1 style="font-size:24px;margin-bottom:12px">Promociones</h1><section class="caja"><h2>Descuentos automáticos</h2><p class="nota" style="margin-bottom:8px">Se aplican solos; si hay varios, se usa el mayor (no se suman).</p><ul class="lista-b">' + ((c.reglas || []).map(function (g, i) { return '<li><label class="chk" style="padding:0"><input type="checkbox" data-regla="' + i + '"' + (g.activa ? ' checked' : '') + '><span>' + NR[g.tipo](g) + '</span></label><b>−' + g.porcentaje + ' %</b></li>'; }).join('') || '<li class="nota">Sin reglas.</li>') + '</ul></section>' +
        '<section class="caja"><h2>Códigos de descuento</h2><div class="scroll"><table class="tabla"><thead><tr><th>Código</th><th>Descuento</th><th>Mínimo</th><th>Usos</th><th>Activo</th></tr></thead><tbody>' + (c.promos.map(function (p, i) { return '<tr><td><b>' + esc(p.codigo) + '</b></td><td>' + (p.tipo === 'porcentaje' ? p.valor + ' %' : clp(p.valor)) + '</td><td>' + clp(p.minimo) + '</td><td>' + p.usos + ' / ' + p.usosMax + '</td><td><input type="checkbox" data-promo="' + i + '"' + (p.activa ? ' checked' : '') + ' aria-label="Activar ' + esc(p.codigo) + '" style="width:22px;height:22px"></td></tr>'; }).join('') || '<tr><td colspan="5" class="nota">Sin códigos.</td></tr>') + '</tbody></table></div>' +
        '<form class="form-l" data-nueva-promo style="margin-top:12px"><div class="campo"><label for="p-cod">Nuevo código</label><input id="p-cod" maxlength="16" placeholder="VERANO20"></div><div class="campo"><label for="p-tipo">Tipo</label><select id="p-tipo"><option value="porcentaje">Porcentaje</option><option value="monto">Monto fijo</option></select></div><div class="campo"><label for="p-val">Valor</label><input id="p-val" type="number" min="1" value="10"></div><div class="campo"><label for="p-min">Mínimo</label><input id="p-min" type="number" min="0" value="0"></div><button class="btn prim" type="submit">Crear</button></form></section>';
    },
    politicas: function (D) {
      var p = D.config.politicas, c = D.config;
      return '<h1 style="font-size:24px;margin-bottom:12px">Políticas</h1><form class="caja" data-pol><div class="form-l">' +
        '<div class="campo"><label for="po-dep">Depósito para confirmar (%)</label><input id="po-dep" type="number" min="0" max="100" value="' + p.deposito + '"></div>' +
        '<div class="campo"><label for="po-ret">Minutos para pagar antes de liberar</label><input id="po-ret" type="number" min="2" max="120" value="' + p.retencionMin + '"></div>' +
        '<div class="campo"><label for="po-ant">Anticipación mínima (horas)</label><input id="po-ant" type="number" min="0" max="240" value="' + p.anticipacionHoras + '"></div>' +
        '<div class="campo"><label for="po-max">Reservar hasta (días adelante)</label><input id="po-max" type="number" min="7" max="730" value="' + p.maxDias + '"></div>' +
        (c.modo === 'noches' ? '<div class="campo"><label for="po-min">Estadía mínima (noches)</label><input id="po-min" type="number" min="1" max="30" value="' + p.estadiaMin + '"></div><div class="campo"><label for="po-mina">Estadía mínima en temporada alta</label><input id="po-mina" type="number" min="1" max="30" value="' + p.estadiaMinAlta + '"></div>' : '') + '</div>' +
        '<h2 style="margin-top:16px">Cancelación</h2><p class="nota" style="margin-bottom:8px">Devolución de lo pagado según cuántas horas antes cancela el cliente. Se calcula sola al cancelar.</p><div class="scroll"><table class="tabla"><thead><tr><th>Si cancela con al menos (horas)</th><th>Se devuelve (%)</th></tr></thead><tbody>' +
        p.cancelacion.map(function (t, i) { return '<tr><td><input type="number" min="0" max="2000" value="' + t.horas + '" data-can="' + i + '" data-k="horas" class="sel-s" style="width:110px" aria-label="Horas"></td><td><input type="number" min="0" max="100" value="' + t.reembolso + '" data-can="' + i + '" data-k="reembolso" class="sel-s" style="width:110px" aria-label="Porcentaje"></td></tr>'; }).join('') + '</tbody></table></div>' +
        '<p class="nota" style="margin-top:8px">No llegó: se conserva el depósito. Los textos legales los confirma el negocio.</p><div class="acciones-r"><span></span><button class="btn prim" type="submit">Guardar políticas</button></div></form>';
    },
    avisos: function (D) {
      var n = D.config.notif, NOM = { confirmacion: 'Confirmación (al reservar)', recordatorio: 'Recordatorio antes de la cita', resena: 'Pedir opinión después', cancelacion: 'Aviso de cancelación', espera: 'Se liberó un cupo (lista de espera)' };
      var l = D.avisos.slice().sort(function (a, b) { return b.cuando - a.cuando; }).slice(0, 40);
      return '<h1 style="font-size:24px;margin-bottom:6px">Avisos automáticos</h1><p class="nota" style="margin-bottom:12px">Se programan solos con cada reserva. <b>Correo:</b> costo $0 con un proveedor con cuota gratis (verificar límites). <b>WhatsApp:</b> la API de WhatsApp Business cobra por conversación (costo recurrente, cotizar aparte). En esta demo no sale ningún mensaje: quedan registrados.</p>' +
        '<div class="caja scroll"><table class="tabla"><thead><tr><th>Aviso</th><th>Activo</th><th>Correo</th><th>WhatsApp</th></tr></thead><tbody>' + Object.keys(NOM).map(function (k) { return '<tr><td>' + NOM[k] + (k === 'recordatorio' ? ' (' + n[k].horas + ' h antes)' : '') + '</td>' + ['activo', 'correo', 'whatsapp'].map(function (c) { return '<td><input type="checkbox" data-notif="' + k + '" data-c="' + c + '"' + (n[k][c] ? ' checked' : '') + ' style="width:22px;height:22px" aria-label="' + NOM[k] + ': ' + c + '"></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
        '<section class="caja"><h2>Registro</h2><div class="scroll"><table class="tabla"><thead><tr><th>Cuándo</th><th>Reserva</th><th>Aviso</th><th>Canal</th><th>Estado</th><th>Texto</th></tr></thead><tbody>' + (l.map(function (a) { return '<tr><td>' + dia(a.cuando) + ' ' + hora(a.cuando) + '</td><td>' + esc(a.codigo) + '</td><td>' + esc(NOM[a.tipo] || a.tipo) + '</td><td>' + (a.canal === 'correo' ? 'Correo' : 'WhatsApp') + '</td><td>' + esc(a.estado) + '</td><td><small>' + esc(a.texto) + '</small></td></tr>'; }).join('') || '<tr><td colspan="6" class="nota">Aún no hay avisos. Haz una reserva en el sitio.</td></tr>') + '</tbody></table></div></section>';
    },
    integraciones: function (D) {
      var c = D.config, lista = c.modo === 'cupos' ? c.servicios : c.recursos;
      var tarjeta = function (t, est, txt, costo, extra) { return '<div class="caja"><h2 style="margin:0">' + t + '</h2><span class="estado-i ' + (est ? 'si">Funciona en la demo' : 'no">Se contrata aparte') + '</span><p class="nota">' + txt + '</p><p class="nota"><b>Costo:</b> ' + costo + '</p>' + (extra || '') + '</div>'; };
      return '<h1 style="font-size:24px;margin-bottom:6px">Integraciones</h1><p class="nota" style="margin-bottom:12px">Lo que se conecta sin costo funciona aquí mismo. Lo que tiene mensualidad o comisión se marca y se cotiza aparte: nunca va incluido en un precio único. Costos aproximados: verificar en la fuente.</p><div class="integ">' +
        tarjeta('Calendarios externos (iCal / Google Calendar)', true, 'Descarga el calendario de cada recurso y suscríbelo en Google Calendar, Outlook o Apple. El cliente recibe su reserva con recordatorio en su propio calendario.', '$0', '<div class="form-l"><div class="campo"><label for="ic-rec">Recurso</label><select id="ic-rec">' + lista.map(function (r) { return '<option value="' + r.id + '">' + esc(r.nombre) + '</option>'; }).join('') + '</select></div><button class="btn chico" type="button" data-ical-bajar>Descargar .ics</button></div>') +
        tarjeta('Airbnb, Booking y otros portales (sincronización iCal)', true, 'Pega aquí el calendario .ics que entrega el portal: esas fechas quedan bloqueadas y no se venden dos veces. En producción se lee cada cierto tiempo de forma automática.', '$0 por la sincronización; el portal cobra su comisión por reserva', '<textarea class="ics" data-ical-txt aria-label="Contenido del calendario .ics">BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:' + U.sumaDias(U.hoy(), 9).replace(/-/g, '') + '\nDTEND;VALUE=DATE:' + U.sumaDias(U.hoy(), 12).replace(/-/g, '') + '\nSUMMARY:Reserved\nEND:VEVENT\nEND:VCALENDAR</textarea><div class="form-l"><div class="campo"><label for="ic-orig">Portal</label><select id="ic-orig"><option>Airbnb</option><option>Booking</option><option>Otro portal</option></select></div><button class="btn chico" type="button" data-ical-subir>Importar al recurso elegido</button></div>') +
        tarjeta('Pasarela de pago (Mercado Pago)', false, 'Cobro del depósito o del total con tarjeta, débito o transferencia. Bío Digital ya la tiene integrada en su propio sitio (apagada hasta terminar las pruebas). Alternativas en Chile: Webpay o Flow.', 'comisión por cada pago (del orden de 3 % + IVA según plazo; verificar en mercadopago.cl). Sin mensualidad.') +
        tarjeta('Channel manager', false, 'Para hoteles con muchos portales: actualiza precios y cupos en Booking, Expedia y otros al mismo tiempo. Para cabañas con 1 o 2 portales basta la sincronización iCal (arriba).', 'mensualidad del proveedor (del orden de decenas de dólares al mes; verificar)') +
        tarjeta('PMS (gestión hotelera)', false, 'Si el hotel ya usa un PMS, las reservas se envían a él por API o webhook. Este panel cubre lo básico de un PMS pequeño: unidades, check-in, check-out y saldos.', 'depende del PMS; la conexión se cotiza') +
        tarjeta('CRM (clientes)', true, 'Exporta los clientes con su historial para cargarlos en un CRM o en una planilla. En producción, cada reserva nueva se puede enviar al CRM por webhook.', '$0 la exportación; el CRM puede tener mensualidad', '<button class="btn chico" type="button" data-crm>Descargar clientes (CSV)</button>') +
        tarjeta('ERP y contabilidad', true, 'Exporta las ventas y pagos para el contador o el ERP. La boleta electrónica (SII) la emite el negocio con su sistema actual.', '$0 la exportación', '<button class="btn chico" type="button" data-erp>Descargar ventas (CSV)</button>') +
        tarjeta('Webhook (avisar a otro sistema)', true, 'Cada reserva genera un JSON como este, listo para enviarse a un CRM, ERP, PMS o una automatización (Zapier, Make, n8n).', '$0 el envío; la herramienta de automatización puede cobrar', '<textarea class="ics" readonly aria-label="Ejemplo de webhook">' + esc(JSON.stringify(ejemploWebhook(D), null, 1)) + '</textarea>') +
        tarjeta('WhatsApp Business (API)', false, 'Confirmaciones y recordatorios automáticos por WhatsApp. La demo los deja registrados en "Avisos automáticos".', 'cobro por conversación según la tarifa de Meta para Chile (verificar)') +
        '</div>';
    },
    reportes: function (D) {
      var c = D.config, m = metricas(D, rango), dias = [];
      for (var i = 0; i < rango; i++) { var f = U.sumaDias(U.hoy(), -rango + 1 + i), a = U.fdate(f).getTime(), b = a + 864e5; dias.push(m.validas.filter(function (r) { return r.desde < b && r.hasta > a; }).length); }
      var ingDia = []; for (var j = 0; j < rango; j++) { var a2 = U.fdate(U.sumaDias(U.hoy(), -rango + 1 + j)).getTime(); ingDia.push(m.validas.filter(function (r) { return r.desde >= a2 && r.desde < a2 + 864e5; }).reduce(function (s, r) { return s + r.precio.total; }, 0)); }
      var barras = function (arr, fmt) { var mx = Math.max.apply(null, arr.concat([1])); return '<div class="barras" role="img" aria-label="' + esc(arr.map(fmt || String).join(', ')) + '">' + arr.map(function (v) { return '<div title="' + (fmt ? fmt(v) : v) + '"><i style="height:' + (v / mx * 100) + '%"></i></div>'; }).join('') + '</div><div class="barras-x"><span>hace ' + (rango - 1) + ' días</span><span>hoy</span></div>'; };
      var noches = c.modo === 'noches', adr = noches && m.vendido ? m.ingresos / m.vendido : 0;
      return '<h1 style="font-size:24px;margin-bottom:10px">Reportes</h1><div class="acciones-r" style="justify-content:flex-start;margin:0 0 12px">' + [7, 30, 90].map(function (x) { return '<button class="btn chico' + (x === rango ? ' prim' : '') + '" type="button" data-rango="' + x + '">' + x + ' días</button>'; }).join('') + '<button class="btn chico" type="button" data-csv-res>Descargar CSV</button></div>' +
        '<div class="kpis">' + kpi('Ocupación', m.ocup + ' %') + kpi('Ingresos', clp(m.ingresos)) + (noches ? kpi('Tarifa promedio por noche (ADR)', clp(adr)) + kpi('Ingreso por unidad disponible (RevPAR)', clp(m.capacidad ? m.ingresos / m.capacidad : 0)) : kpi('Reservas', m.validas.length)) + kpi('Cancelación', m.tasaCancel + ' %') + kpi('No llegaron', m.noshow) + kpi('Anticipación promedio', m.lead + ' días') + '</div>' +
        '<div class="grid2"><section class="caja"><h2>' + (noches ? 'Unidades ocupadas por día' : 'Reservas por día') + '</h2>' + barras(dias) + '</section><section class="caja"><h2>Ingresos por día de llegada</h2>' + barras(ingDia, clp) + '</section>' +
        '<section class="caja"><h2>Por canal</h2>' + lista(agrupar(m.validas, function (r) { return r.canal; })) + '</section><section class="caja"><h2>' + (noches ? 'Por alojamiento' : 'Por servicio') + '</h2>' + lista(agrupar(m.validas, function (r) { return nombreDe(D, r); }, function (r) { return r.precio.total; }), clp) + '</section>' +
        '<section class="caja"><h2>Por país del cliente</h2>' + lista(agrupar(m.validas, function (r) { return r.cliente.pais || 'Sin dato'; })) + '</section><section class="caja"><h2>Descuentos usados</h2>' + lista(agrupar(m.validas.filter(function (r) { return r.precio.descuento; }), function (r) { return r.precio.motivo; }, function (r) { return r.precio.descuento; }), clp) + '</section></div>';
    }
  };
  function ejemploWebhook(D) { var r = D.reservas.filter(function (x) { return !x.semilla; }).pop() || D.reservas[0]; return r ? { evento: 'reserva.' + r.estado, negocio: D.config.id, codigo: r.codigo, desde: new Date(r.desde).toISOString(), hasta: new Date(r.hasta).toISOString(), recurso: r.recurso, servicio: r.servicio, personas: r.personas, total: r.precio.total, pagado: r.pagado, moneda: 'CLP', canal: r.canal, cliente: { nombre: r.cliente.nombre, pais: r.cliente.pais } } : { evento: 'reserva.confirmada', nota: 'Haz una reserva para ver un ejemplo real' }; }

  // ---------- Eventos ----------
  app.addEventListener('click', function (e) {
    var x, D = R.leer(neg);
    if ((x = e.target.closest('[data-neg]'))) { neg = x.dataset.neg; history.replaceState(null, '', '?negocio=' + neg); pintar(); return; }
    if ((x = e.target.closest('[data-tab]'))) { tab = x.dataset.tab; pintar(); return; }
    if (e.target.closest('[data-semilla]')) { R.sembrar(neg); toast('Se cargaron 60 días de reservas de prueba.'); return; }
    if (e.target.closest('[data-reset]') && confirm('¿Borrar todas las reservas y cambios de este negocio en la demo?')) { R.restablecer(neg); return; }
    if ((x = e.target.closest('[data-cal]'))) { desdeCal = +x.dataset.cal === 0 ? U.hoy() : U.sumaDias(desdeCal, +x.dataset.cal); pintar(); return; }
    if ((x = e.target.closest('[data-rango]'))) { rango = +x.dataset.rango; pintar(); return; }
    if ((x = e.target.closest('[data-acc]'))) {
      var id = x.dataset.id, r = D.reservas.filter(function (z) { return z.id === id; })[0], a = x.dataset.acc;
      if (a === 'pagar') R.pagar(neg, id, r.precio.total);
      else if (a === 'cancelar') { var rb = R.reembolso(D, r); if (confirm('Cancelar ' + r.codigo + '. Según la política se devuelve el ' + rb.porcentaje + ' % de lo pagado: ' + clp(rb.monto) + '. ¿Seguir?')) R.cancelar(neg, id, 'negocio'); }
      else R.estado(neg, id, a);
      return;
    }
    if (e.target.closest('[data-ical-bajar]')) { var rec = app.querySelector('#ic-rec').value; bajar(neg + '-' + rec + '.ics', R.exportarIcal(neg, rec), 'text/calendar'); return; }
    if (e.target.closest('[data-ical-subir]')) { var n = R.importarIcal(neg, app.querySelector('#ic-rec').value, app.querySelector('[data-ical-txt]').value, app.querySelector('#ic-orig').value); toast(n + ' periodo(s) bloqueado(s). Míralos en el Calendario.'); return; }
    if (e.target.closest('[data-crm]')) { var cli = {}; D.reservas.forEach(function (r) { var k = r.cliente.correo || r.cliente.nombre + r.codigo; cli[k] = cli[k] || [r.cliente.nombre, r.cliente.correo, r.cliente.telefono, r.cliente.pais, 0, 0, '']; cli[k][4]++; cli[k][5] += r.estado !== 'cancelada' ? r.precio.total : 0; cli[k][6] = new Date(r.desde).toISOString().slice(0, 10); }); bajar('clientes-' + neg + '.csv', csv([['nombre', 'correo', 'telefono', 'pais', 'reservas', 'total_gastado', 'ultima_visita']].concat(Object.keys(cli).map(function (k) { return cli[k]; }))), 'text/csv'); return; }
    if (e.target.closest('[data-erp]') || e.target.closest('[data-csv-res]')) { bajar('reservas-' + neg + '.csv', csv([['codigo', 'creada', 'desde', 'hasta', 'recurso', 'servicio', 'personas', 'canal', 'pais', 'bruto', 'descuento', 'total', 'pagado', 'estado', 'reembolso']].concat(D.reservas.map(function (r) { return [r.codigo, new Date(r.creada).toISOString(), new Date(r.desde).toISOString(), new Date(r.hasta).toISOString(), r.recurso, r.servicio || '', r.personas, r.canal, r.cliente.pais || '', r.precio.bruto, r.precio.descuento, r.precio.total, r.pagado, r.estado, r.reembolso ? r.reembolso.monto : '']; }))), 'text/csv'); return; }
  });
  app.addEventListener('change', function (e) {
    var t = e.target, ds = t.dataset;
    if (t.id === 'f-est') { filtro.estado = t.value; pintar(); }
    if (ds.inv) R.guardarConfig(neg, function (c) { (c.modo === 'cupos' ? c.servicios : c.recursos).forEach(function (x) { if (x.id === ds.id) x[ds.inv] = ds.inv === 'salidas' ? t.value.split(/[,\s]+/).filter(function (h) { return /^\d{1,2}:\d{2}$/.test(h); }) : Math.max(0, parseInt(t.value, 10) || 0); }); });
    if (ds.pre) R.guardarConfig(neg, function (c) { c[ds.lista].forEach(function (x) { if (x.id === ds.id) x[ds.pre] = Math.max(0, parseInt(t.value, 10) || 0); }); });
    if (ds.regla) R.guardarConfig(neg, function (c) { c.reglas[+ds.regla].activa = t.checked; });
    if (ds.promo) R.guardarConfig(neg, function (c) { c.promos[+ds.promo].activa = t.checked; });
    if (ds.notif) R.guardarConfig(neg, function (c) { c.notif[ds.notif][ds.c] = t.checked; });
  });
  app.addEventListener('input', function (e) { if (e.target.id === 'f-txt') { filtro.texto = e.target.value; clearTimeout(app._b); app._b = setTimeout(function () { pintar(); var i = app.querySelector('#f-txt'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 300); } });
  app.addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target, v = function (id) { return f.querySelector('#' + id).value; };
    if (f.matches('[data-bloq]')) { var a = U.fdate(v('b-desde')).getTime(), b = U.fdate(v('b-hasta')).getTime(); if (!(b > a)) return toast('La fecha "hasta" debe ser después de "desde".'); R.bloquear(neg, v('b-rec'), a, b, v('b-mot').slice(0, 60)); toast('Fechas bloqueadas: ya no se pueden reservar.'); }
    if (f.matches('[data-nueva-promo]')) { var cod = v('p-cod').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (cod.length < 3) return toast('El código debe tener al menos 3 letras o números.'); R.guardarConfig(neg, function (c) { if (c.promos.some(function (p) { return p.codigo === cod; })) return; c.promos.push({ codigo: cod, tipo: v('p-tipo'), valor: Math.max(1, +v('p-val') || 1), minimo: Math.max(0, +v('p-min') || 0), activa: true, usos: 0, usosMax: 100 }); }); toast('Código ' + cod + ' creado.'); }
    if (f.matches('[data-pol]')) {
      R.guardarConfig(neg, function (c) {
        var p = c.politicas, n = function (id, mn, mx) { var el = f.querySelector('#' + id); return el ? Math.max(mn, Math.min(mx, parseInt(el.value, 10) || 0)) : null; };
        p.deposito = n('po-dep', 0, 100); p.retencionMin = n('po-ret', 2, 120); p.anticipacionHoras = n('po-ant', 0, 240); p.maxDias = n('po-max', 7, 730);
        if (f.querySelector('#po-min')) { p.estadiaMin = n('po-min', 1, 30); p.estadiaMinAlta = n('po-mina', 1, 30); }
        [].forEach.call(f.querySelectorAll('[data-can]'), function (el) { p.cancelacion[+el.dataset.can][el.dataset.k] = Math.max(0, parseInt(el.value, 10) || 0); });
      });
      toast('Políticas guardadas. El sitio ya las aplica.');
    }
  });
  R.escuchar(function (m) { if (m.id !== neg) return; var a = document.activeElement; if (a && a.matches && a.matches('input, select, textarea')) return; pintar(); });
  setInterval(function () { R.automatico(neg); }, 5000);
  pintar();
})();
