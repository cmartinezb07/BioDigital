// Panel del negocio (reservas): resumen, calendario, reservas en vivo, catálogo editable, horarios y temporadas, precios y promociones, políticas,
// avisos, integraciones, reportes, y negocio y equipo. Entra el JEFE (todo) o la RECEPCIÓN (el día a día), cada uno con su PIN.
// Lo que cambia el jefe queda en un borrador hasta que lo publica; las reservas las valida el servidor (motor.js).
(function () {
  'use strict';
  var R = window.Reservas, U = R.util, clp = U.clp, app = document.getElementById('app'), AG = R.AGENDA || {};
  var q = new URLSearchParams(location.search);
  var neg = q.get('negocio') || R.NEGOCIOS[0].id; if (!R.NEGOCIOS.some(function (n) { return n.id === neg; })) neg = R.NEGOCIOS[0].id;
  var NUBE = R.NUBE(), rol = 'recepcion', quien = '';
  var tab = 'resumen', rango = 30, filtro = { estado: '', texto: '' }, desdeCal = U.hoy(), filtroCli = { texto: '', grupo: '' };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var TABS = [['resumen', 'Resumen', 0], ['reservas', 'Reservas', 0], ['clientes', 'Clientes', 0], ['calendario', 'Calendario', 0], ['catalogo', 'Catálogo', 1], ['horarios', 'Horarios y temporadas', 1], ['promos', 'Promociones', 1], ['politicas', 'Políticas', 1], ['avisos', 'Avisos', 0], ['integraciones', 'Integraciones', 1], ['reportes', 'Reportes', 0], ['modulos', 'Módulos y formulario', 1], ['negocio', 'Negocio y equipo', 1]];
  var chip = function (e) { var x = R.ESTADOS[e] || [e, '#64748b']; return '<span class="chip" style="--ec:' + x[1] + '">' + x[0] + '</span>'; };
  var nombreDe = function (D, r) { var x = r.servicio ? R.servicio(D, r.servicio) : R.recurso(D, r.recurso); return x ? x.nombre : (r.servicio || r.recurso); };
  var dia = function (ms) { return new Date(ms).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }); };
  var hora = function (ms) { var t = new Date(ms); return U.pad(t.getHours()) + ':' + U.pad(t.getMinutes()); };
  var ACTIVAS = ['retenida', 'confirmada', 'pagada', 'checkin'];
  var copia = function (x) { return JSON.parse(JSON.stringify(x)); };
  function toast(x, malo) { var e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', malo ? 'alert' : 'status'); e.textContent = x; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 4200); }
  function bajar(nombre, txt, tipo) { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: tipo })); a.download = nombre; a.click(); }
  function csv(filas) { return '﻿' + filas.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(','); }).join('\n'); }
  var slug = function (t, usados) { var b = String(t || 'item').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'item', id = b, n = 2; while (usados.indexOf(id) > -1) id = b + '-' + n++; return id; };
  var esJefe = function () { return rol === 'dueno'; };

  // ---------- Avisos en vivo y sonido ----------
  var audio = null, vistas = null, alerta = null;
  function sonidoOn() { try { return localStorage.getItem('sonido-agenda-' + NUBE) !== '0'; } catch (e) { return true; } }
  function beep() {
    if (!sonidoOn()) return;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); [0, .2, .4].forEach(function (d, k) { var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = [784, 988, 1175][k]; g.gain.setValueAtTime(.14, audio.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + d + .17); o.connect(g); g.connect(audio.destination); o.start(audio.currentTime + d); o.stop(audio.currentTime + d + .18); }); } catch (e) {}
  }
  function nuevas() {
    if (!R.equipoVisto(neg)) return;   // hasta que no llegan todas las reservas al panel no se sabe cuáles son nuevas
    var D = R.leer(neg), propias = D.reservas.filter(function (r) { return !r._pub; });
    if (vistas === null) { vistas = {}; propias.forEach(function (r) { vistas[r.id] = r.rev || 1; }); return; }
    var avisos = [];
    propias.forEach(function (r) {
      if (vistas[r.id] === undefined) { vistas[r.id] = r.rev || 1; if (r.estado !== 'cancelada') avisos.push('Nueva reserva ' + r.codigo + ' · ' + nombreDe(D, r) + ' · ' + clp(r.precio.total)); }
      else if (vistas[r.id] !== (r.rev || 1)) { vistas[r.id] = r.rev || 1; avisos.push('El cliente modificó la reserva ' + r.codigo); }
    });
    if (!avisos.length) return;
    beep();
    alerta.hidden = false; alerta.innerHTML = '<span><b>' + esc(avisos[avisos.length - 1]) + '</b>' + (avisos.length > 1 ? ' y ' + (avisos.length - 1) + ' más' : '') + '</span><button class="btn chico" type="button" data-ver-nuevas>Ver reservas</button><button class="btn chico" type="button" data-cerrar-alerta aria-label="Cerrar aviso">×</button>';
  }

  app.innerHTML = '<div class="wrap"><aside class="alerta-nueva" data-alerta hidden role="status"></aside><div class="barra-pub" data-barra hidden></div><div class="negocios" role="group" aria-label="Negocio"></div><div class="adm"><nav class="menu-adm" aria-label="Secciones del panel"></nav><div data-vista></div></div></div>';
  alerta = app.querySelector('[data-alerta]');
  function tabsVisibles() { var c = R.leer(neg).config; return TABS.filter(function (t) { return (esJefe() || !t[2]) && !(t[0] === 'promos' && !R.modulo(c, 'promociones')); }); }
  function pintar() {
    R.automatico(neg);
    var D = R.leer(neg);
    document.documentElement.style.setProperty('--marca', D.config.color || '');
    var cont = app.querySelector('.negocios'); cont.hidden = R.NEGOCIOS.length < 2;
    cont.innerHTML = R.NEGOCIOS.length < 2 ? '' : R.NEGOCIOS.map(function (n) { return '<button type="button" data-neg="' + n.id + '" aria-pressed="' + (n.id === neg) + '">' + R.icono(n.icono, 18) + esc(n.nombre) + '</button>'; }).join('');
    if (!tabsVisibles().some(function (t) { return t[0] === tab; })) tab = 'resumen';
    var retenidas = D.reservas.filter(function (r) { return !r._pub && r.estado === 'retenida'; }).length;
    app.querySelector('.menu-adm').innerHTML = tabsVisibles().map(function (t) { return '<button type="button" data-tab="' + t[0] + '"' + (t[0] === tab ? ' aria-current="page"' : '') + '>' + t[1] + (t[0] === 'reservas' && retenidas ? ' <span class="num">' + retenidas + '</span>' : '') + '</button>'; }).join('') +
      '<button type="button" data-sonido aria-pressed="' + sonidoOn() + '">' + (sonidoOn() ? '🔔 Aviso sonoro' : '🔕 Sin sonido') + '</button>';
    var barra = app.querySelector('[data-barra]'), pendiente = esJefe() && R.configPendiente(neg), sinPub = esJefe() && !R.estaPublicada(neg);
    barra.hidden = !(pendiente || sinPub);
    barra.innerHTML = sinPub ? '<span><b>Esta agenda todavía no está publicada.</b> Tus clientes no pueden reservar hasta que la publiques.</span><button class="btn chico prim" type="button" data-publicar>Publicar agenda</button>'
      : pendiente ? '<span>Tienes cambios <b>sin publicar</b> en el catálogo, precios, horarios o políticas.</span><button class="btn chico prim" type="button" data-publicar>Publicar cambios</button><button class="btn chico" type="button" data-descartar>Descartar</button>' : '';
    app.querySelector('[data-vista]').innerHTML = VISTAS[tab](D);
    llenarUnidades();
    [].forEach.call(document.querySelectorAll('[data-cliente]'), function (a) { a.href = '../?negocio=' + neg; });
  }

  // Bloquear: elegir todas las unidades o una en particular del recurso elegido
  function llenarUnidades() {
    var sel = app.querySelector('#b-uni'), rec = app.querySelector('#b-rec'); if (!sel || !rec) return;
    var rr = R.recurso(R.leer(neg), rec.value), n = rr ? rr.unidades || 1 : 1, opts = '<option value="todas">' + (n > 1 ? 'Todas (' + n + ')' : 'Todas') + '</option>';
    for (var u = 1; u <= n && n > 1; u++) opts += '<option value="' + u + '">' + esc(R.nombreUnidad(rr, u)) + '</option>';
    sel.innerHTML = opts;
  }
  // ---------- Métricas compartidas por Resumen y Reportes ----------
  function metricas(D, dias) {
    var c = D.config, fin = U.fdate(U.sumaDias(U.hoy(), 1)).getTime(), ini = fin - dias * 864e5, todas = D.reservas.filter(function (r) { return !r._pub; });
    var en = todas.filter(function (r) { return r.desde < fin && r.hasta > ini; });
    var validas = en.filter(function (r) { return r.estado !== 'cancelada' && r.estado !== 'retenida'; });
    var creadas = todas.filter(function (r) { return r.creada >= ini && r.creada < fin && r.estado !== 'retenida'; });
    var ingresos = validas.reduce(function (s, r) { return s + r.precio.total; }, 0), cobrado = validas.reduce(function (s, r) { return s + (r.pagado || 0); }, 0);
    var ocup, capacidad = 0, vendido = 0;
    if (c.modo === 'noches') { capacidad = c.recursos.reduce(function (s, r) { return s + r.unidades; }, 0) * dias; vendido = validas.reduce(function (s, r) { return s + Math.round((Math.min(r.hasta, fin) - Math.max(r.desde, ini)) / 864e5); }, 0); }
    else if (c.modo === 'cupos') { for (var i = 0; i < dias; i++) { var f = U.sumaDias(U.hoy(), -dias + 1 + i); c.servicios.forEach(function (s) { if ((s.dias || []).indexOf(U.diaSem(f)) > -1) capacidad += s.capacidad * (s.salidas || []).length; }); } vendido = validas.reduce(function (s, r) { return s + r.personas; }, 0); }
    else { for (var j = 0; j < dias; j++) { var f2 = U.sumaDias(U.hoy(), -dias + 1 + j), hs = ((c.horario || {})[['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'][U.diaSem(f2)]] || []).reduce(function (s, tr) { return s + (U.minH(tr[1]) - U.minH(tr[0])) / 60; }, 0); capacidad += hs * c.recursos.length; } vendido = validas.reduce(function (s, r) { return s + (r.hasta - r.desde) / 36e5; }, 0); }
    ocup = capacidad ? Math.min(100, Math.round(vendido / capacidad * 100)) : 0;
    var canceladas = creadas.filter(function (r) { return r.estado === 'cancelada'; }).length, noshow = en.filter(function (r) { return r.estado === 'noshow'; }).length;
    var lead = creadas.filter(function (r) { return r.estado !== 'cancelada'; }).map(function (r) { return (r.desde - r.creada) / 864e5; });
    return { validas: validas, creadas: creadas, ingresos: ingresos, cobrado: cobrado, ocup: ocup, vendido: vendido, capacidad: capacidad, canceladas: canceladas, noshow: noshow,
      tasaCancel: creadas.length ? Math.round(canceladas / creadas.length * 100) : 0, lead: lead.length ? Math.round(lead.reduce(function (s, x) { return s + x; }, 0) / lead.length) : 0, ini: ini, fin: fin };
  }
  function kpi(t, v, s) { return '<div class="kpi"><span>' + t + '</span><b>' + v + '</b><small>' + (s || '') + '</small></div>'; }
  function lista(pares, fmt) { if (!pares.length) return '<p class="nota">Sin datos.</p>'; var max = Math.max.apply(null, pares.map(function (p) { return p[1]; })); return '<ul class="lista-b">' + pares.slice(0, 10).map(function (p) { return '<li><span>' + esc(p[0]) + '</span><b>' + (fmt ? fmt(p[1]) : p[1]) + '</b><span class="b"><i style="width:' + (max ? p[1] / max * 100 : 0) + '%"></i></span></li>'; }).join('') + '</ul>'; }
  function agrupar(arr, k, v) { var o = {}; arr.forEach(function (x) { var key = k(x); o[key] = (o[key] || 0) + (v ? v(x) : 1); }); return Object.keys(o).map(function (x) { return [x, o[x]]; }).sort(function (a, b) { return b[1] - a[1]; }); }
  var propias = function (D) { return D.reservas.filter(function (r) { return !r._pub; }); };
  // Ficha de clientes armada con las reservas: una persona = mismo celular (o correo, o nombre si no dejó contacto)
  function fichas(D) {
    var m = {}, ahora = Date.now(), c = D.config;
    propias(D).forEach(function (r) {
      var cl = r.cliente || {}, k = (cl.telefono || '').replace(/\D/g, '').slice(-9) || (cl.correo || '').toLowerCase() || (cl.nombre || '').toLowerCase(); if (!k) return;
      var x = m[k] = m[k] || { nombre: cl.nombre || '', telefono: cl.telefono || '', correo: cl.correo || '', visitas: 0, canceladas: 0, noshow: 0, gastado: 0, ultima: 0, proxima: 0, primera: Infinity, respuestas: '', pidioResena: false };
      if (!x.telefono && cl.telefono) x.telefono = cl.telefono; if (!x.correo && cl.correo) x.correo = cl.correo;
      var resp = Object.keys(r.respuestas || {}).map(function (q) { var cp = (c.campos || []).filter(function (z) { return z.id === q; })[0]; return (cp ? cp.etiqueta : q) + ': ' + r.respuestas[q]; }).join(' · '); if (resp) x.respuestas = resp;
      if (r.estado === 'cancelada') { x.canceladas++; return; }
      if (r.estado === 'noshow') { x.noshow++; return; }
      if (r.estado === 'retenida') return;
      if (r.desde <= ahora) { x.gastado += r.precio ? r.precio.total : 0; x.visitas++; x.ultima = Math.max(x.ultima, r.desde); x.primera = Math.min(x.primera, r.desde); if ((r.historial || []).some(function (h) { return h.resena; })) x.pidioResena = true; }
      else x.proxima = x.proxima ? Math.min(x.proxima, r.desde) : r.desde;
    });
    return Object.keys(m).map(function (k) {
      var x = m[k]; x.grupos = [];
      if (x.visitas >= 3) x.grupos.push('frecuente'); else if (x.visitas === 1) x.grupos.push('nuevo');
      if (x.ultima && !x.proxima && ahora - x.ultima > 60 * 864e5) x.grupos.push('perdido');
      if (x.proxima) x.grupos.push('proximo');
      return x;
    }).sort(function (a, b) { return b.visitas - a.visitas || b.gastado - a.gastado; });
  }
  var sitio = function () { return location.origin + location.pathname.replace(/admin\/?.*$/, '') + '?negocio=' + neg; };
  var waBtn = function (tel, txt, et) { return '<a class="btn chico" target="_blank" rel="noopener" href="https://wa.me/' + String(tel).replace(/\D/g, '') + '?text=' + encodeURIComponent(txt) + '">' + et + '</a>'; };

  var VISTAS = {
    resumen: function (D) {
      var c = D.config, m = metricas(D, 30), hoyI = U.fdate(U.hoy()).getTime(), hoyF = hoyI + 864e5, P = propias(D);
      var deHoy = P.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde < hoyF && r.hasta > hoyI; }).sort(function (a, b) { return a.desde - b.desde; });
      var prox = P.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde >= hoyF && r.desde < hoyF + 7 * 864e5; });
      var porCobrar = P.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde >= hoyI; }).reduce(function (s, r) { return s + Math.max(0, r.precio.total - r.pagado); }, 0);
      var ret = P.filter(function (r) { return r.estado === 'retenida'; }), esp = (D.espera || []).filter(function (e) { return !e.avisado; });
      return '<div class="marca-n" style="margin-bottom:14px">' + R.logo(c, 48) + '<div><h1 style="font-size:26px">' + esc(c.nombre) + '</h1><p class="nota">' + esc(c.rubro) + ' · <span class="vivo">En vivo</span> · ' + esc(quien || (esJefe() ? 'Jefe' : 'Recepción')) + ' · <a data-cliente href="../">Ver el sitio de reservas</a></p></div></div>' +
        '<div class="kpis">' + kpi(c.modo === 'noches' ? 'Llegadas y estadías hoy' : 'Reservas de hoy', deHoy.length) + kpi('Próximos 7 días', prox.length) + kpi('Ocupación (30 días)', m.ocup + ' %', c.modo === 'noches' ? m.vendido + ' de ' + m.capacidad + ' noches' : '') + kpi('Ingresos (30 días)', clp(m.ingresos), 'cobrado ' + clp(m.cobrado)) + kpi('Por cobrar', clp(porCobrar), 'saldos de reservas futuras') + kpi('Cancelaciones', m.tasaCancel + ' %', m.noshow + ' no llegaron') + '</div>' +
        '<div class="grid2"><section class="caja"><h2>Hoy</h2>' + (deHoy.length ? '<ul class="lista-b">' + deHoy.map(function (r) { return '<li><span>' + (c.modo === 'noches' ? '' : hora(r.desde) + ' · ') + esc(nombreDe(D, r)) + ' · ' + esc(r.cliente.nombre) + '</span>' + chip(r.estado) + '</li>'; }).join('') + '</ul>' : '<p class="nota">Nada para hoy.</p>') + '</section>' +
        '<section class="caja"><h2>Alertas</h2><ul class="lista-b">' + (ret.length ? ret.map(function (r) { return '<li><span>' + r.codigo + ' espera el pago de ' + clp(r.precio.deposito) + (r.expira ? ' (vence a las ' + hora(r.expira) + ')' : '') + '</span>' + chip('retenida') + '</li>'; }).join('') : '<li class="nota">Sin retenciones por vencer.</li>') +
        '<li><span>Lista de espera</span><b>' + esp.length + '</b></li><li><span>Avisos programados</span><b>' + D.avisos.filter(function (a) { return a.estado === 'programado'; }).length + '</b></li></ul>' +
        (esJefe() && AG.demo ? '<div class="acciones-r"><button class="btn chico peligro" type="button" data-reset>Borrar las reservas de prueba</button></div><p class="nota">Solo el jefe puede borrar. Esto vacía las reservas, avisos y bloqueos de este negocio.</p>' : '') + '</section></div>';
    },
    calendario: function (D) {
      var c = D.config, n = 14, dias = [], P = propias(D); for (var i = 0; i < n; i++) dias.push(U.sumaDias(desdeCal, i));
      var filas = [];
      c.modo === 'noches' ? c.recursos.forEach(function (r) { for (var u = 0; u < r.unidades; u++) filas.push({ rec: r.id, nom: r.nombre + (r.unidades > 1 ? ' ' + (u + 1) : ''), u: u }); }) : (c.modo === 'cupos' ? c.servicios : c.recursos).forEach(function (r) { filas.push({ rec: r.id, nom: r.nombre }); });
      var asign = {};
      if (c.modo === 'noches') c.recursos.forEach(function (r) { var unid = []; P.filter(function (x) { return x.recurso === r.id && x.estado !== 'cancelada' && x.unidad; }).forEach(function (x) { asign[x.id] = x.unidad - 1; }); P.filter(function (x) { return x.recurso === r.id && x.estado !== 'cancelada' && !x.unidad; }).sort(function (a, b) { return a.desde - b.desde; }).forEach(function (x) { for (var u = 0; u < r.unidades; u++) if (!unid[u] || unid[u] <= x.desde) { unid[u] = x.hasta; asign[x.id] = u; return; } asign[x.id] = 0; }); });
      var html = '<h1 style="font-size:24px;margin-bottom:10px">Calendario</h1><div class="acciones-r" style="justify-content:flex-start;margin:0 0 10px"><button class="btn chico" type="button" data-cal="-7">‹ Semana anterior</button><button class="btn chico" type="button" data-cal="0">Hoy</button><button class="btn chico" type="button" data-cal="7">Semana siguiente ›</button></div>' +
        '<div class="caja scroll"><div class="timeline"><div class="tl-fila cab" style="--n:' + n + '"><span class="nom"></span>' + dias.map(function (f) { return '<span>' + U.fdate(f).toLocaleDateString('es-CL', { weekday: 'narrow', day: 'numeric' }) + '</span>'; }).join('') + '</div>';
      filas.forEach(function (fi) {
        html += '<div class="tl-fila" style="--n:' + n + '"><span class="nom">' + esc(fi.nom) + '</span>';
        dias.forEach(function (f) {
          var a = U.fdate(f).getTime(), b = a + 864e5;
          var rs = P.filter(function (r) { return r.estado !== 'cancelada' && r.recurso === fi.rec && r.desde < b && r.hasta > a && (c.modo !== 'noches' || asign[r.id] === fi.u); });
          var bl = D.bloqueos.filter(function (x) { return x.recurso === fi.rec && !x.quitado && x.desde < b && x.hasta > a; });
          if (rs.length) { var r0 = rs[0]; html += '<span class="oc" style="--ec:' + R.ESTADOS[r0.estado][1] + '" title="' + esc(r0.codigo + ' · ' + r0.cliente.nombre + ' · ' + R.ESTADOS[r0.estado][0]) + '">' + (c.modo === 'noches' ? (r0.desde >= a ? r0.codigo.slice(0, 3) : '') : c.modo === 'cupos' ? rs.reduce(function (s, x) { return s + x.personas; }, 0) : rs.length) + '</span>'; }
          else if (bl.length && (c.modo !== 'noches' || bl.some(function (x) { return x.unidad ? x.unidad - 1 === fi.u : x.todas || (x.unidades || 1) > fi.u; }))) html += '<span class="bl" title="' + esc(bl[0].motivo) + '"></span>';
          else html += '<span></span>';
        });
        html += '</div>';
      });
      var manuales = D.bloqueos.filter(function (b) { return !b._pub && !b.quitado && b.hasta > Date.now(); }).sort(function (a, b) { return a.desde - b.desde; });
      html += '</div><p class="nota" style="margin-top:8px">' + (c.modo === 'noches' ? 'Cada fila es una unidad. Color = estado de la reserva; rayado = bloqueado (manual o sincronizado por iCal).' : c.modo === 'cupos' ? 'El número es la cantidad de personas reservadas ese día.' : 'El número es la cantidad de reservas del día.') + '</p></div>' +
        '<section class="caja"><h2>Bloquear fechas</h2><form class="form-l" data-bloq><div class="campo"><label for="b-rec">Recurso</label><select id="b-rec">' + (c.modo === 'cupos' ? c.servicios : c.recursos).map(function (r) { return '<option value="' + esc(r.id) + '">' + esc(r.nombre) + '</option>'; }).join('') + '</select></div>' + (c.modo !== 'cupos' && c.recursos.some(function (r) { return (r.unidades || 1) > 1; }) ? '<div class="campo"><label for="b-uni">Unidad</label><select id="b-uni"></select></div>' : '') + '<div class="campo"><label for="b-desde">Desde</label><input id="b-desde" type="date" value="' + U.hoy() + '"></div><div class="campo"><label for="b-hasta">Hasta</label><input id="b-hasta" type="date" value="' + U.sumaDias(U.hoy(), 1) + '"></div><div class="campo"><label for="b-mot">Motivo</label><input id="b-mot" value="Mantención"></div><button class="btn prim" type="submit">Bloquear</button></form>' +
        (manuales.length ? '<h3 style="margin:14px 0 6px;font-size:15px">Bloqueos vigentes</h3><ul class="lista-b">' + manuales.map(function (b) { var rr = R.recurso(D, b.recurso) || R.servicio(D, b.recurso) || {}; return '<li><span>' + esc(b.unidad ? R.nombreUnidad(rr, b.unidad) : (rr.nombre || b.recurso) + (b.todas ? ' (todas)' : '')) + ' · ' + dia(b.desde) + ' → ' + dia(b.hasta) + ' · ' + esc(b.motivo || '') + '</span><button class="btn chico" type="button" data-quitar-bloqueo="' + esc(b.id) + '">Quitar</button></li>'; }).join('') + '</ul>' : '') + '</section>';
      return html;
    },
    reservas: function (D) {
      var c = D.config, P = propias(D), conUnidades = function (r) { var rr = c.modo !== 'cupos' && R.recurso(D, r.recurso); return rr && (rr.unidades || 1) > 1; };
      var sinUnidad = P.filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.hasta > Date.now() && !r.unidad && r.rev && conUnidades(r); });
      var l = P.slice().sort(function (a, b) { return b.desde - a.desde; }).filter(function (r) { return (!filtro.estado || r.estado === filtro.estado) && (!filtro.texto || (r.codigo + ' ' + r.cliente.nombre + ' ' + r.canal).toLowerCase().indexOf(filtro.texto.toLowerCase()) > -1); });
      return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px"><h1 style="font-size:24px">Reservas</h1><button class="btn prim" type="button" data-nueva-res>+ Nueva reserva (teléfono o mostrador)</button></div>' +
        (sinUnidad.length ? '<p class="aviso-grande" role="status" style="font-size:14px"><span><b>' + sinUnidad.length + ' reserva(s) sin unidad fija</b> (' + sinUnidad.map(function (r) { return esc(r.codigo); }).join(', ') + '): ninguna unidad quedaba libre todas sus noches. Usa <b>Mover</b> para asignarla.</span></p>' : '') + '<div class="form-l" style="margin-bottom:12px"><div class="campo"><label for="f-txt">Buscar</label><input id="f-txt" value="' + esc(filtro.texto) + '" placeholder="Código, nombre o canal"></div><div class="campo"><label for="f-est">Estado</label><select id="f-est"><option value="">Todos</option>' + Object.keys(R.ESTADOS).map(function (k) { return '<option value="' + k + '"' + (filtro.estado === k ? ' selected' : '') + '>' + R.ESTADOS[k][0] + '</option>'; }).join('') + '</select></div><button class="btn" type="button" data-csv-res>Descargar CSV</button></div>' +
        '<div class="caja scroll"><table class="tabla"><thead><tr><th>Código</th><th>Cuándo</th><th>Qué</th><th>Cliente</th><th>Canal</th><th>Total</th><th>Pagado</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
        (l.slice(0, 80).map(function (r) {
          var acc = [], sale = r.desde <= Date.now();
          if (r.estado === 'retenida' || r.estado === 'confirmada') acc.push('<button class="btn chico" type="button" data-acc="pagada" data-id="' + r.id + '" data-monto="' + (r.precio.deposito || r.precio.total) + '">Registrar ' + (r.precio.deposito ? 'depósito ' + clp(r.precio.deposito) : 'pago') + '</button>');
          if (r.estado === 'pagada' && (r.pagado || 0) < r.precio.total) acc.push('<button class="btn chico" type="button" data-acc="pagada" data-id="' + r.id + '" data-monto="' + r.precio.total + '">Cobrar saldo ' + clp(r.precio.total - r.pagado) + '</button>');
          if (r.estado === 'retenida') acc.push('<button class="btn chico" type="button" data-acc="confirmada" data-id="' + r.id + '">Confirmar sin pago</button>');
          if (r.estado === 'confirmada' || r.estado === 'pagada') acc.push('<button class="btn chico" type="button" data-acc="checkin" data-id="' + r.id + '">' + (c.modo === 'noches' ? 'Check-in' : 'Llegó') + '</button>');
          if ((r.estado === 'confirmada' || r.estado === 'pagada') && sale) acc.push('<button class="btn chico" type="button" data-acc="noshow" data-id="' + r.id + '">No llegó</button>');
          if (r.estado === 'checkin') acc.push('<button class="btn chico" type="button" data-acc="completada" data-id="' + r.id + '">' + (c.modo === 'noches' ? 'Check-out' : 'Terminar') + '</button>');
          if (r.estado === 'completada' && c.resenaUrl && r.cliente.telefono) acc.push(waBtn(r.cliente.telefono, 'Hola ' + r.cliente.nombre.split(' ')[0] + ', gracias por venir a ' + c.nombre + '. ¿Nos dejas tu opinión en Google? Nos ayuda mucho: ' + c.resenaUrl, 'Pedir reseña'));
          if (ACTIVAS.indexOf(r.estado) > -1 && conUnidades(r) && r.hasta > Date.now()) acc.push('<button class="btn chico" type="button" data-mover="' + r.id + '">Mover</button>');
          if (ACTIVAS.indexOf(r.estado) > -1) acc.push('<button class="btn chico peligro" type="button" data-acc="cancelada" data-id="' + r.id + '">Cancelar</button>');
          var resp = Object.keys(r.respuestas || {}).map(function (k) { var cp = (c.campos || []).filter(function (x) { return x.id === k; })[0]; return (cp ? cp.etiqueta : k) + ': ' + r.respuestas[k]; }).join(' · ');
          return '<tr><td><b>' + esc(r.codigo) + '</b>' + ((r.rev || 1) > 1 ? '<br><small class="nota">v' + r.rev + ' modificada</small>' : '') + '</td><td>' + dia(r.desde) + (c.modo === 'noches' ? ' → ' + dia(r.hasta) : ' ' + hora(r.desde)) + '</td><td>' + esc(nombreDe(D, r)) + (r.personas > 1 ? ' · ' + r.personas + ' pers.' : '') + (r.unidadNombre && r.unidadNombre !== nombreDe(D, r) ? '<br><small><b>' + esc(r.unidadNombre) + '</b></small>' : '') + '</td><td>' + esc(r.cliente.nombre) + '<br><small class="nota">' + esc(r.cliente.telefono || r.cliente.correo || '') + '</small>' + (resp ? '<br><small class="nota">' + esc(resp) + '</small>' : '') + '</td><td>' + esc(r.canal) + '</td><td>' + clp(r.precio.total) + '</td><td>' + clp(r.pagado || 0) + '</td><td>' + chip(r.estado) + '</td><td style="display:flex;gap:4px;flex-wrap:wrap">' + acc.join('') + '</td></tr>';
        }).join('') || '<tr><td colspan="9" class="nota">Sin reservas con ese filtro. Aparecen aquí apenas un cliente reserva desde el sitio, con un aviso y sonido.</td></tr>') + '</tbody></table></div><p class="nota" style="margin-top:6px">Se muestran las 80 más recientes de ' + l.length + '.</p>';
    },
    catalogo: function (D) {
      var c = D.config, fila = function (x, tipo) {
        var det = [];
        if (x.precio != null) det.push(clp(x.precio) + ({ noches: ' / noche', cupos: ' / persona', horas: '', bloques: ' / hora' }[c.modo] && tipo === 'principal' ? { noches: ' / noche', cupos: ' / persona', horas: '', bloques: ' / hora' }[c.modo] : ''));
        if (x.unidades != null) det.push(x.unidades + (x.unidades === 1 ? ' unidad' : ' unidades')); if (x.capacidad) det.push((c.modo === 'cupos' ? x.capacidad + ' cupos por salida' : 'hasta ' + x.capacidad + ' personas')); if (x.duracion) det.push(x.duracion + ' min'); if (x.minHoras) det.push('mín. ' + x.minHoras + ' h'); if (x.salidas) det.push('salidas ' + x.salidas.join(', '));
        if (x.servicios) det.push('atiende: ' + x.servicios.map(function (s) { return (R.servicio(D, s) || {}).nombre || s; }).join(', '));
        return '<tr><td><b>' + esc(x.nombre) + '</b><br><small class="nota">' + esc(x.desc || '') + '</small></td><td>' + esc(det.join(' · ')) + '</td><td style="display:flex;gap:6px"><button class="btn chico prim" type="button" data-ed="' + esc(tipo) + ':' + esc(x.id) + '">Editar</button><button class="btn chico peligro" type="button" data-del="' + esc(tipo) + ':' + esc(x.id) + '">Quitar</button></td></tr>';
      };
      var bloque = function (titulo, lista, tipo, nota) { return '<section class="caja"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><h2>' + titulo + '</h2><button class="btn chico prim" type="button" data-nuevo="' + tipo + '">+ Agregar</button></div>' + (nota ? '<p class="nota" style="margin:4px 0 8px">' + nota + '</p>' : '') + '<div class="scroll"><table class="tabla"><thead><tr><th>Nombre</th><th>Datos</th><th></th></tr></thead><tbody>' + (lista.length ? lista.map(function (x) { return fila(x, tipo); }).join('') : '<tr><td colspan="3" class="nota">Todavía no hay nada. Agrega el primero.</td></tr>') + '</tbody></table></div></section>'; };
      var html = '<h1 style="font-size:24px;margin-bottom:6px">Catálogo</h1><p class="nota" style="margin-bottom:12px">Lo que tus clientes pueden reservar. Los cambios quedan en un borrador: se ven en el sitio cuando tocas <b>Publicar cambios</b>. Las reservas ya hechas conservan lo que compraron.</p>';
      if (c.modo === 'noches') html += bloque('Alojamientos', c.recursos, 'recurso') + bloque('Paquetes y extras', c.servicios, 'servicio', 'Se ofrecen como extras al reservar (tinaja, escapada romántica…).');
      else if (c.modo === 'cupos') html += bloque('Tours y salidas', c.servicios, 'servicio');
      else if (c.modo === 'horas') html += bloque('Servicios', c.servicios, 'servicio') + bloque('Profesionales, boxes o estilistas', c.recursos, 'recurso', 'Cada uno atiende los servicios que marques. Si dos atienden lo mismo, el sistema reparte las citas.');
      else html += bloque('Espacios', c.recursos, 'recurso');
      return html;
    },
    horarios: function (D) {
      var c = D.config, p = c.politicas, DIAS = [['lun', 'Lunes'], ['mar', 'Martes'], ['mie', 'Miércoles'], ['jue', 'Jueves'], ['vie', 'Viernes'], ['sab', 'Sábado'], ['dom', 'Domingo']];
      if (c.modo === 'cupos') return '<h1 style="font-size:24px;margin-bottom:8px">Horarios</h1><section class="caja"><p>En los tours los horarios son las <b>salidas</b> y los días de cada tour: se editan en <b>Catálogo</b>.</p></section>';
      if (c.modo === 'noches') return '<h1 style="font-size:24px;margin-bottom:6px">Temporadas y fin de semana</h1><p class="nota" style="margin-bottom:12px">El precio de cada noche se calcula solo con estos factores (por ejemplo ×1,3 en temporada alta).</p><form class="caja" data-temp><div class="scroll"><table class="tabla"><thead><tr><th>Temporada</th><th>Desde (mes-día)</th><th>Hasta (mes-día)</th><th>Factor</th><th></th></tr></thead><tbody>' +
        (c.temporadas || []).map(function (t, i) { return '<tr><td><input value="' + esc(t.nombre) + '" data-t="' + i + '" data-k="nombre" class="sel-s" aria-label="Nombre"></td><td><input value="' + esc(t.desde) + '" data-t="' + i + '" data-k="desde" class="sel-s" style="width:100px" placeholder="12-15" aria-label="Desde"></td><td><input value="' + esc(t.hasta) + '" data-t="' + i + '" data-k="hasta" class="sel-s" style="width:100px" placeholder="03-15" aria-label="Hasta"></td><td><input type="number" step="0.05" min="0.5" max="3" value="' + t.factor + '" data-t="' + i + '" data-k="factor" class="sel-s" style="width:90px" aria-label="Factor"></td><td><button class="btn chico peligro" type="button" data-quitar-temp="' + i + '">Quitar</button></td></tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="form-l" style="margin-top:12px"><div class="campo"><label for="h-finde">Factor viernes y sábado</label><input id="h-finde" type="number" step="0.05" min="0.5" max="3" value="' + (c.factorFinde || 1) + '"></div><div class="campo"><label for="h-in">Check-in</label><input id="h-in" value="' + esc(p.checkin || '15:00') + '" placeholder="15:00"></div><div class="campo"><label for="h-out">Check-out</label><input id="h-out" value="' + esc(p.checkout || '11:00') + '" placeholder="11:00"></div></div>' +
        '<div class="acciones-r"><button class="btn" type="button" data-nueva-temp>+ Temporada</button><button class="btn prim" type="submit">Guardar en el borrador</button></div></form>';
      return '<h1 style="font-size:24px;margin-bottom:6px">Horario de atención</h1><p class="nota" style="margin-bottom:12px">Uno o más tramos por día, separados por coma: <code>08:30-13:00, 14:30-19:00</code>. Vacío = cerrado.</p><form class="caja" data-horario><div class="form-l">' +
        DIAS.map(function (x) { return '<div class="campo"><label for="hd-' + x[0] + '">' + x[1] + '</label><input id="hd-' + x[0] + '" value="' + esc(((c.horario || {})[x[0]] || []).map(function (t) { return t.join('-'); }).join(', ')) + '" placeholder="Cerrado"><small class="campo-err" role="alert"></small></div>'; }).join('') +
        '</div><div class="form-l" style="margin-top:12px"><div class="campo"><label for="h-int">Intervalo entre horas (min)</label><input id="h-int" type="number" min="5" max="240" step="5" value="' + (c.intervalo || 30) + '"></div><div class="campo"><label for="h-buf">Margen entre citas (min)</label><input id="h-buf" type="number" min="0" max="120" step="5" value="' + (c.buffer || 0) + '"></div></div><div class="acciones-r"><span class="err" data-err-h role="alert"></span><button class="btn prim" type="submit">Guardar en el borrador</button></div></form>';
    },
    promos: function (D) {
      var c = D.config, P = propias(D), NR = { anticipada: function (g) { return 'Reserva anticipada: ' + g.dias + '+ días antes'; }, estadia: function (g) { return 'Estadía larga: ' + g.noches + '+ noches'; }, grupo: function (g) { return 'Grupo: ' + g.personas + '+ personas'; }, ultimo: function (g) { return 'Último minuto: menos de ' + g.horas + ' h antes'; }, duracion: function (g) { return 'Arriendo largo: ' + g.horas + '+ horas'; } };
      var usos = function (cod) { return P.filter(function (r) { return r.estado !== 'cancelada' && r.precio && r.precio.promo && r.precio.promo.codigo === cod && (r.precio.motivo || '').indexOf(cod) > -1; }).length; };
      return '<h1 style="font-size:24px;margin-bottom:12px">Promociones</h1><section class="caja"><h2>Descuentos automáticos</h2><p class="nota" style="margin-bottom:8px">Se aplican solos; si hay varios, se usa el mayor (no se suman).</p><ul class="lista-b">' + ((c.reglas || []).map(function (g, i) { return '<li><label class="chk" style="padding:0"><input type="checkbox" data-regla="' + i + '"' + (g.activa ? ' checked' : '') + '><span>' + NR[g.tipo](g) + '</span></label><b>−' + g.porcentaje + ' %</b></li>'; }).join('') || '<li class="nota">Sin reglas.</li>') + '</ul></section>' +
        '<section class="caja"><h2>Códigos de descuento</h2><p class="nota" style="margin-bottom:8px">Los códigos son privados: solo los ve tu equipo y quien los recibe de ti.</p><div class="scroll"><table class="tabla"><thead><tr><th>Código</th><th>Descuento</th><th>Mínimo</th><th>Usos</th><th>Activo</th></tr></thead><tbody>' + ((c.promos || []).map(function (p, i) { return '<tr><td><b>' + esc(p.codigo) + '</b></td><td>' + (p.tipo === 'porcentaje' ? p.valor + ' %' : clp(p.valor)) + '</td><td>' + clp(p.minimo) + '</td><td>' + usos(p.codigo) + ' / ' + (p.usosMax || '∞') + '</td><td><input type="checkbox" data-promo="' + i + '"' + (p.activa ? ' checked' : '') + ' aria-label="Activar ' + esc(p.codigo) + '" style="width:22px;height:22px"></td></tr>'; }).join('') || '<tr><td colspan="5" class="nota">Sin códigos.</td></tr>') + '</tbody></table></div>' +
        '<form class="form-l" data-nueva-promo style="margin-top:12px"><div class="campo"><label for="p-cod">Nuevo código</label><input id="p-cod" maxlength="16" placeholder="VERANO20"></div><div class="campo"><label for="p-tipo">Tipo</label><select id="p-tipo"><option value="porcentaje">Porcentaje</option><option value="monto">Monto fijo</option></select></div><div class="campo"><label for="p-val">Valor</label><input id="p-val" type="number" min="1" value="10"></div><div class="campo"><label for="p-min">Mínimo</label><input id="p-min" type="number" min="0" value="0"></div><div class="campo"><label for="p-max">Usos máximos</label><input id="p-max" type="number" min="1" value="100"></div><button class="btn prim" type="submit">Crear</button></form></section>';
    },
    politicas: function (D) {
      var p = D.config.politicas, c = D.config;
      return '<h1 style="font-size:24px;margin-bottom:12px">Políticas</h1><form class="caja" data-pol><div class="form-l">' +
        '<div class="campo"><label for="po-dep">Depósito para confirmar (%)</label><input id="po-dep" type="number" min="0" max="100" value="' + p.deposito + '"></div>' +
        '<div class="campo"><label for="po-ret">Minutos para pagar antes de liberar</label><input id="po-ret" type="number" min="2" max="120" value="' + p.retencionMin + '"></div>' +
        '<div class="campo"><label for="po-ant">Anticipación mínima (horas)</label><input id="po-ant" type="number" min="0" max="240" value="' + p.anticipacionHoras + '"></div>' +
        '<div class="campo"><label for="po-max">Reservar hasta (días adelante)</label><input id="po-max" type="number" min="7" max="730" value="' + p.maxDias + '"></div>' +
        '<div class="campo"><label for="po-mod">El cliente puede modificar hasta (horas antes)</label><input id="po-mod" type="number" min="0" max="720" value="' + (p.modificarHoras != null ? p.modificarHoras : 24) + '"></div>' +
        (c.modo === 'noches' ? '<div class="campo"><label for="po-min">Estadía mínima (noches)</label><input id="po-min" type="number" min="1" max="30" value="' + (p.estadiaMin || 1) + '"></div><div class="campo"><label for="po-mina">Estadía mínima en temporada alta</label><input id="po-mina" type="number" min="1" max="30" value="' + (p.estadiaMinAlta || 1) + '"></div>' : '') + '</div>' +
        '<h2 style="margin-top:16px">Cancelación</h2><p class="nota" style="margin-bottom:8px">Devolución de lo pagado según cuántas horas antes cancela el cliente. El servidor la calcula al cancelar.</p><div class="scroll"><table class="tabla"><thead><tr><th>Si cancela con al menos (horas)</th><th>Se devuelve (%)</th></tr></thead><tbody>' +
        p.cancelacion.map(function (t, i) { return '<tr><td><input type="number" min="0" max="2000" value="' + t.horas + '" data-can="' + i + '" data-k="horas" class="sel-s" style="width:110px" aria-label="Horas"></td><td><input type="number" min="0" max="100" value="' + t.reembolso + '" data-can="' + i + '" data-k="reembolso" class="sel-s" style="width:110px" aria-label="Porcentaje"></td></tr>'; }).join('') + '</tbody></table></div>' +
        '<p class="nota" style="margin-top:8px">No llegó: se conserva el depósito. Los textos legales los confirma el negocio.</p><div class="acciones-r"><span></span><button class="btn prim" type="submit">Guardar en el borrador</button></div></form>';
    },
    avisos: function (D) {
      var n = D.config.notif, NOM = { confirmacion: 'Confirmación (al reservar)', recordatorio: 'Recordatorio antes de la cita', resena: 'Pedir opinión después', cancelacion: 'Aviso de cancelación', espera: 'Se liberó un cupo (lista de espera)' };
      var l = D.avisos.slice().sort(function (a, b) { return b.cuando - a.cuando; }).slice(0, 40);
      return '<h1 style="font-size:24px;margin-bottom:6px">Avisos automáticos</h1><p class="nota" style="margin-bottom:12px">Se programan solos con cada reserva (el servidor los crea). <b>Correo:</b> costo $0 con un proveedor con cuota gratis (verificar límites). <b>WhatsApp:</b> la API de WhatsApp Business cobra por conversación (recurrente, se cotiza aparte). Hoy quedan registrados como "enviado (simulado)": el envío real se conecta aparte.</p>' +
        '<div class="caja scroll"><table class="tabla"><thead><tr><th>Aviso</th><th>Activo</th><th>Correo</th><th>WhatsApp</th></tr></thead><tbody>' + Object.keys(NOM).map(function (k) { return '<tr><td>' + NOM[k] + (k === 'recordatorio' ? ' (' + n[k].horas + ' h antes)' : '') + '</td>' + ['activo', 'correo', 'whatsapp'].map(function (c) { return '<td><input type="checkbox" data-notif="' + k + '" data-c="' + c + '"' + (n[k][c] ? ' checked' : '') + (esJefe() ? '' : ' disabled') + ' style="width:22px;height:22px" aria-label="' + NOM[k] + ': ' + c + '"></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
        '<section class="caja"><h2>Registro</h2><div class="scroll"><table class="tabla"><thead><tr><th>Cuándo</th><th>Reserva</th><th>Aviso</th><th>Canal</th><th>Estado</th><th>Texto</th></tr></thead><tbody>' + (l.map(function (a) { return '<tr><td>' + dia(a.cuando) + ' ' + hora(a.cuando) + '</td><td>' + esc(a.codigo) + '</td><td>' + esc(NOM[a.tipo] || a.tipo) + '</td><td>' + (a.canal === 'correo' ? 'Correo' : 'WhatsApp') + '</td><td>' + esc(a.estado) + '</td><td><small>' + esc(a.texto) + '</small></td></tr>'; }).join('') || '<tr><td colspan="6" class="nota">Aún no hay avisos. Haz una reserva en el sitio.</td></tr>') + '</tbody></table></div></section>';
    },
    integraciones: function (D) {
      var c = D.config, lista = c.modo === 'cupos' ? c.servicios : c.recursos;
      var tarjeta = function (t, est, txt, costo, extra) { return '<div class="caja"><h2 style="margin:0">' + t + '</h2><span class="estado-i ' + (est ? 'si">Funciona' : 'no">Se contrata aparte') + '</span><p class="nota">' + txt + '</p><p class="nota"><b>Costo:</b> ' + costo + '</p>' + (extra || '') + '</div>'; };
      return '<h1 style="font-size:24px;margin-bottom:6px">Integraciones</h1><p class="nota" style="margin-bottom:12px">Lo que se conecta sin costo funciona aquí mismo. Lo que tiene mensualidad o comisión se marca y se cotiza aparte: nunca va incluido en un precio único. Costos aproximados: verificar en la fuente.</p><div class="integ">' +
        tarjeta('Calendarios externos (iCal / Google Calendar)', true, 'Descarga el calendario de cada recurso y suscríbelo en Google Calendar, Outlook o Apple. El cliente recibe su reserva con recordatorio en su propio calendario.', '$0', '<div class="form-l"><div class="campo"><label for="ic-rec">Recurso</label><select id="ic-rec">' + lista.map(function (r) { return '<option value="' + esc(r.id) + '">' + esc(r.nombre) + '</option>'; }).join('') + '</select></div><button class="btn chico" type="button" data-ical-bajar>Descargar .ics</button></div>') +
        tarjeta('Airbnb, Booking y otros portales (sincronización iCal)', true, 'Pega aquí el calendario .ics que entrega el portal: esas fechas quedan bloqueadas y no se venden dos veces. En producción se lee cada cierto tiempo de forma automática.', '$0 por la sincronización; el portal cobra su comisión por reserva', '<textarea class="ics" data-ical-txt aria-label="Contenido del calendario .ics">BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:' + U.sumaDias(U.hoy(), 9).replace(/-/g, '') + '\nDTEND;VALUE=DATE:' + U.sumaDias(U.hoy(), 12).replace(/-/g, '') + '\nSUMMARY:Reserved\nEND:VEVENT\nEND:VCALENDAR</textarea><div class="form-l"><div class="campo"><label for="ic-orig">Portal</label><select id="ic-orig"><option>Airbnb</option><option>Booking</option><option>Otro portal</option></select></div><button class="btn chico" type="button" data-ical-subir>Importar al recurso elegido</button></div>') +
        tarjeta('Pasarela de pago (Mercado Pago)', false, 'Cobro del depósito o del total con tarjeta, débito o transferencia, con la cuenta del propio negocio. Hoy el negocio registra el pago a mano ("Registrar pago"). Alternativas en Chile: Webpay o Flow.', 'comisión por cada pago (del orden de 3 % + IVA según plazo; verificar en mercadopago.cl). Sin mensualidad.') +
        tarjeta('Channel manager', false, 'Para hoteles con muchos portales: actualiza precios y cupos en Booking, Expedia y otros al mismo tiempo. Para cabañas con 1 o 2 portales basta la sincronización iCal (arriba).', 'mensualidad del proveedor (del orden de decenas de dólares al mes; verificar)') +
        tarjeta('PMS (gestión hotelera)', false, 'Si el hotel ya usa un PMS, las reservas se envían a él por API o webhook. Este panel cubre lo básico de un PMS pequeño: unidades, check-in, check-out y saldos.', 'depende del PMS; la conexión se cotiza') +
        tarjeta('CRM (clientes)', true, 'Exporta los clientes con su historial para cargarlos en un CRM o en una planilla.', '$0 la exportación; el CRM puede tener mensualidad', '<button class="btn chico" type="button" data-crm>Descargar clientes (CSV)</button>') +
        tarjeta('ERP y contabilidad', true, 'Exporta las ventas y pagos para el contador o el ERP. La boleta electrónica (SII) la emite el negocio con su sistema actual.', '$0 la exportación', '<button class="btn chico" type="button" data-erp>Descargar ventas (CSV)</button>') +
        tarjeta('WhatsApp Business (API)', false, 'Confirmaciones y recordatorios automáticos por WhatsApp. Hoy quedan registrados en "Avisos".', 'cobro por conversación según la tarifa de Meta para Chile (verificar)') + '</div>';
    },
    clientes: function (D) {
      var lista = fichas(D), c = D.config, G = { frecuente: 'Frecuentes (3+ visitas)', nuevo: 'Nuevos (1 visita)', perdido: 'No han vuelto (60+ días)', proximo: 'Con reserva próxima' };
      var vis = lista.filter(function (x) { return (!filtroCli.grupo || x.grupos.indexOf(filtroCli.grupo) > -1) && (!filtroCli.texto || (x.nombre + ' ' + x.telefono + ' ' + x.correo).toLowerCase().indexOf(filtroCli.texto.toLowerCase()) > -1); });
      var cuenta = function (g) { return lista.filter(function (x) { return x.grupos.indexOf(g) > -1; }).length; };
      return '<h1 style="font-size:24px;margin-bottom:6px">Clientes</h1><p class="nota" style="margin-bottom:12px">Cada persona que ha reservado, con sus visitas y cuánto ha gastado. Sirve para premiar a los frecuentes y escribirle a quien no ha vuelto (el WhatsApp se abre con el mensaje escrito; lo envías tú).</p>' +
        '<div class="kpis">' + kpi('Clientes', lista.length) + Object.keys(G).map(function (g) { return kpi(G[g], cuenta(g)); }).join('') + '</div>' +
        '<div class="form-l" style="margin:12px 0"><div class="campo"><label for="cl-txt">Buscar</label><input id="cl-txt" value="' + esc(filtroCli.texto) + '" placeholder="Nombre, celular o correo"></div><div class="campo"><label for="cl-gr">Mostrar</label><select id="cl-gr"><option value="">Todos</option>' + Object.keys(G).map(function (g) { return '<option value="' + g + '"' + (filtroCli.grupo === g ? ' selected' : '') + '>' + G[g] + '</option>'; }).join('') + '</select></div><button class="btn" type="button" data-crm>Descargar CSV</button></div>' +
        '<div class="caja scroll"><table class="tabla"><thead><tr><th>Cliente</th><th>Visitas</th><th>Gastado</th><th>Última visita</th><th>Próxima</th><th></th></tr></thead><tbody>' +
        (vis.slice(0, 120).map(function (x) {
          var nom = x.nombre.split(' ')[0], acc = [];
          if (x.telefono) {
            if (x.grupos.indexOf('perdido') > -1) acc.push(waBtn(x.telefono, 'Hola ' + nom + ', ¡hace tiempo que no te vemos en ' + c.nombre + '! Si quieres volver, reserva aquí: ' + sitio(), 'Invitar a volver'));
            if (x.grupos.indexOf('frecuente') > -1) acc.push(waBtn(x.telefono, 'Hola ' + nom + ', gracias por preferirnos siempre en ' + c.nombre + '. ', 'Agradecer'));
            if (c.resenaUrl && x.ultima && !x.pidioResena) acc.push(waBtn(x.telefono, 'Hola ' + nom + ', gracias por venir a ' + c.nombre + '. ¿Nos dejas tu opinión en Google? Nos ayuda mucho: ' + c.resenaUrl, 'Pedir reseña'));
          }
          return '<tr><td><b>' + esc(x.nombre) + '</b>' + x.grupos.filter(function (g) { return g !== 'proximo'; }).map(function (g) { return ' <span class="chip" style="--ec:' + { frecuente: '#22c55e', nuevo: '#3b82f6', perdido: '#f59e0b' }[g] + '">' + { frecuente: 'Frecuente', nuevo: 'Nuevo', perdido: 'No ha vuelto' }[g] + '</span>'; }).join('') + '<br><small class="nota">' + esc([x.telefono, x.correo].filter(Boolean).join(' · ')) + '</small>' + (x.respuestas ? '<br><small class="nota">' + esc(x.respuestas) + '</small>' : '') + '</td><td>' + x.visitas + (x.canceladas ? '<br><small class="nota">' + x.canceladas + ' cancelada(s)</small>' : '') + (x.noshow ? '<br><small class="nota">' + x.noshow + ' no llegó</small>' : '') + '</td><td>' + clp(x.gastado) + '</td><td>' + (x.ultima ? dia(x.ultima) : '—') + '</td><td>' + (x.proxima ? dia(x.proxima) : '—') + '</td><td style="display:flex;gap:4px;flex-wrap:wrap">' + acc.join('') + '</td></tr>';
        }).join('') || '<tr><td colspan="6" class="nota">Sin clientes con ese filtro.</td></tr>') + '</tbody></table></div>' +
        (!c.resenaUrl && esJefe() ? '<p class="nota" style="margin-top:8px">Para pedir reseñas en Google, pega el enlace de tu ficha en <b>Negocio y equipo</b>.</p>' : '');
    },
    reportes: function (D) {
      var c = D.config, m = metricas(D, rango), dias = [];
      for (var i = 0; i < rango; i++) { var f = U.sumaDias(U.hoy(), -rango + 1 + i), a = U.fdate(f).getTime(), b = a + 864e5; dias.push(m.validas.filter(function (r) { return r.desde < b && r.hasta > a; }).length); }
      var ingDia = []; for (var j = 0; j < rango; j++) { var a2 = U.fdate(U.sumaDias(U.hoy(), -rango + 1 + j)).getTime(); ingDia.push(m.validas.filter(function (r) { return r.desde >= a2 && r.desde < a2 + 864e5; }).reduce(function (s, r) { return s + r.precio.total; }, 0)); }
      var barras = function (arr, fmt) { var mx = Math.max.apply(null, arr.concat([1])); return '<div class="barras" role="img" aria-label="' + esc(arr.map(fmt || String).join(', ')) + '">' + arr.map(function (v) { return '<div title="' + (fmt ? fmt(v) : v) + '"><i style="height:' + (v / mx * 100) + '%"></i></div>'; }).join('') + '</div><div class="barras-x"><span>hace ' + (rango - 1) + ' días</span><span>hoy</span></div>'; };
      var noches = c.modo === 'noches', adr = noches && m.vendido ? m.ingresos / m.vendido : 0;
      return '<h1 style="font-size:24px;margin-bottom:10px">Reportes</h1><div class="acciones-r" style="justify-content:flex-start;margin:0 0 12px">' + [7, 30, 90].map(function (x) { return '<button class="btn chico' + (x === rango ? ' prim' : '') + '" type="button" data-rango="' + x + '">' + x + ' días</button>'; }).join('') + '<button class="btn chico" type="button" data-csv-res>Descargar CSV</button></div>' +
        '<div class="kpis">' + kpi('Ocupación', m.ocup + ' %') + kpi('Ingresos', clp(m.ingresos)) + (noches ? kpi('Tarifa promedio por noche (ADR)', clp(adr)) + kpi('Ingreso por unidad disponible (RevPAR)', clp(m.capacidad ? m.ingresos / m.capacidad : 0)) : kpi('Reservas', m.validas.length)) + kpi('Cancelación', m.tasaCancel + ' %') + kpi('No llegaron', m.noshow) + kpi('Anticipación promedio', m.lead + ' días') + '</div>' +
        (!m.validas.length ? '<p class="nota" style="margin-top:12px">Todavía no hay reservas en este período. Las cifras se calculan con las reservas reales: aquí no se muestra nada de relleno.</p>' : '') +
        '<div class="grid2"><section class="caja"><h2>' + (noches ? 'Unidades ocupadas por día' : 'Reservas por día') + '</h2>' + barras(dias) + '</section><section class="caja"><h2>Ingresos por día de llegada</h2>' + barras(ingDia, clp) + '</section>' +
        '<section class="caja"><h2>Por canal</h2>' + lista(agrupar(m.validas, function (r) { return r.canal; })) + '</section><section class="caja"><h2>' + (noches ? 'Por alojamiento' : 'Por servicio') + '</h2>' + lista(agrupar(m.validas, function (r) { return nombreDe(D, r); }, function (r) { return r.precio.total; }), clp) + '</section>' +
        '<section class="caja"><h2>Por país del cliente</h2>' + lista(agrupar(m.validas, function (r) { return r.cliente.pais || 'Sin dato'; })) + '</section><section class="caja"><h2>Descuentos usados</h2>' + lista(agrupar(m.validas.filter(function (r) { return r.precio.descuento; }), function (r) { return r.precio.motivo; }, function (r) { return r.precio.descuento; }), clp) + '</section></div>';
    },
    modulos: function (D) {
      var c = D.config, P = propias(D), MODO = { noches: 'Por noches (alojamiento)', cupos: 'Salidas con cupos (tours y actividades)', horas: 'Citas por hora con profesional', bloques: 'Arriendo de espacios por horas' }[c.modo];
      var ret = P.filter(function (r) { return r.estado === 'retenida'; }).length, esp = (D.espera || []).filter(function (e) { return !e.avisado; }).length, prog = D.avisos.filter(function (a) { return a.estado === 'programado'; }).length;
      var M = [['pagos', 'Pagos y depósito', 'Pide un depósito para confirmar y guarda el cupo mientras el cliente paga.', ret ? ret + ' reserva(s) esperando pago se mantienen; las nuevas ya no pedirán depósito.' : ''],
        ['promociones', 'Promociones', 'Códigos de descuento y descuentos automáticos (anticipada, estadía larga, grupo, último minuto).', 'Las reservas ya hechas conservan su descuento.'],
        ['extras', 'Paquetes y extras', 'El cliente agrega extras al reservar (tinaja, escapada romántica…).', ''],
        ['avisos', 'Avisos automáticos', 'Confirmación, recordatorio y pedir opinión por correo o WhatsApp.', prog ? 'Los ' + prog + ' aviso(s) ya programados se mantienen; las reservas nuevas no programarán más.' : ''],
        ['espera', 'Lista de espera', 'Si no hay cupo, el cliente deja su contacto y se le avisa cuando se libera.', esp ? 'Hay ' + esp + ' persona(s) esperando: se conservan en la lista.' : ''],
        ['campos', 'Formulario propio', 'Preguntas del negocio al reservar (las de abajo).', ''],
        ['modificar', 'El cliente modifica online', 'Cambiar fecha u hora desde su enlace, hasta ' + (c.politicas.modificarHoras != null ? c.politicas.modificarHoras : 24) + ' h antes. Si se apaga, puede cancelar pero no cambiar.', '']]
        .filter(function (x) { return x[0] !== 'extras' || c.modo === 'noches'; });
      var TIPOS = { texto: 'Texto', numero: 'Número', opciones: 'Lista de opciones', si: 'Sí o no' }, campos = c.campos || [];
      return '<h1 style="font-size:24px;margin-bottom:6px">Módulos y formulario</h1><p class="nota" style="margin-bottom:12px">Tipo de agenda: <b>' + MODO + '</b> (lo define el rubro). Encima de eso, cada módulo se enciende o apaga sin perder nada: las reservas ya hechas conservan lo suyo. Los cambios quedan en el borrador hasta que tocas <b>Publicar cambios</b>.</p>' +
        '<section class="caja"><h2>Módulos</h2><ul class="lista-b">' + M.map(function (x) { var on = R.modulo(c, x[0]); return '<li style="align-items:flex-start"><label class="chk" style="padding:0"><input type="checkbox" data-modulo="' + x[0] + '"' + (on ? ' checked' : '') + ' data-impacto="' + esc(x[3]) + '"><span><b>' + x[1] + '</b><br><small class="nota">' + x[2] + '</small></span></label><span class="estado-i ' + (on ? 'si">Encendido' : 'no">Apagado') + '</span></li>'; }).join('') + '</ul></section>' +
        '<section class="caja"><h2>Formulario: preguntas propias</h2><p class="nota" style="margin-bottom:8px">Además de nombre, correo y celular. Ejemplos: patente del vehículo, alergias, edad de los niños, cómo nos conociste. Máximo 10.' + (R.modulo(c, 'campos') ? '' : ' <b>El módulo "Formulario propio" está apagado: no se muestran.</b>') + '</p>' +
        '<div class="scroll"><table class="tabla"><thead><tr><th>Pregunta</th><th>Tipo</th><th>Obligatoria</th><th></th></tr></thead><tbody>' + (campos.length ? campos.map(function (cp, i) { return '<tr><td><b>' + esc(cp.etiqueta) + '</b>' + (cp.ayuda ? '<br><small class="nota">' + esc(cp.ayuda) + '</small>' : '') + '</td><td>' + TIPOS[cp.tipo] + (cp.tipo === 'opciones' ? '<br><small class="nota">' + esc((cp.opciones || []).join(', ')) + '</small>' : '') + '</td><td><input type="checkbox" data-campo-obl="' + i + '"' + (cp.obligatorio ? ' checked' : '') + ' style="width:22px;height:22px" aria-label="Obligatoria"></td><td><button class="btn chico peligro" type="button" data-campo-quitar="' + i + '">Quitar</button></td></tr>'; }).join('') : '<tr><td colspan="4" class="nota">Sin preguntas propias.</td></tr>') + '</tbody></table></div>' +
        (campos.length < 10 ? '<form class="form-l" data-campo-nuevo style="margin-top:12px"><div class="campo"><label for="cf-et">Pregunta</label><input id="cf-et" maxlength="80" placeholder="Patente del vehículo"></div><div class="campo"><label for="cf-tipo">Tipo</label><select id="cf-tipo">' + Object.keys(TIPOS).map(function (k) { return '<option value="' + k + '">' + TIPOS[k] + '</option>'; }).join('') + '</select></div><div class="campo"><label for="cf-op">Opciones (si es lista, separadas por coma)</label><input id="cf-op" maxlength="400" placeholder="Instagram, Google, Un amigo"></div><div class="campo"><label for="cf-ay">Ayuda (opcional)</label><input id="cf-ay" maxlength="120"></div><label class="chk"><input type="checkbox" id="cf-obl"><span>Obligatoria</span></label><button class="btn prim" type="submit">Agregar</button></form>' : '') + '</section>';
    },
    negocio: function (D) {
      var c = D.config, COL = ['#2f6f4e', '#c2562b', '#1d6fb8', '#5b4bb7', '#b8437a', '#a16207'];
      return '<h1 style="font-size:24px;margin-bottom:6px">Negocio y equipo</h1><div class="grid2"><form class="caja" data-negocio><h2>Datos del negocio</h2><div style="display:grid;gap:12px">' +
        '<div class="campo"><label for="n-nombre">Nombre</label><input id="n-nombre" maxlength="60" value="' + esc(c.nombre) + '"></div><div class="campo"><label for="n-rubro">Rubro (como lo ve el cliente)</label><input id="n-rubro" maxlength="40" value="' + esc(c.rubro) + '"></div>' +
        '<div class="campo"><label for="n-dir">Dirección</label><input id="n-dir" maxlength="100" value="' + esc(c.direccion) + '"></div><div class="campo"><label for="n-sigla">Iniciales del logo (2 letras)</label><input id="n-sigla" maxlength="3" value="' + esc(c.sigla) + '" style="width:90px"></div>' +
        '<div><p class="lbl nota">Color</p><div class="swatches" role="group" aria-label="Color principal">' + COL.map(function (x) { return '<button type="button" data-color="' + x + '" style="background:' + x + '" aria-label="Color ' + x + '" aria-pressed="' + (x === c.color) + '"></button>'; }).join('') + '</div></div>' +
        '<div class="campo"><label for="n-resena">Enlace para dejar reseña en Google (opcional)</label><input id="n-resena" type="url" maxlength="300" placeholder="https://g.page/r/…/review" value="' + esc(c.resenaUrl || '') + '"><small class="nota">En tu ficha de Google: "Pedir reseñas" › copiar enlace. Se usa en el aviso después de la visita y en Clientes.</small></div>' +
        '<div class="campo"><label for="n-pago">Cómo paga el depósito el cliente (se muestra al reservar)</label><textarea id="n-pago" rows="3" maxlength="300" placeholder="Ejemplo: Transfiere a Banco X, cuenta Y, y envíanos el comprobante por WhatsApp. Confirmamos al recibirlo.">' + esc(c.pagoInstrucciones || '') + '</textarea></div>' +
        (AG.demo ? '<label class="chk"><input type="checkbox" id="n-demo"' + (c.pagoDemo ? ' checked' : '') + '><span>Pago "de mentira" para mostrar el sistema (solo demostraciones)</span></label>' : '') +
        '</div><div class="acciones-r"><span></span><button class="btn prim" type="submit">Guardar en el borrador</button></div></form>' +
        '<section class="caja"><h2>Equipo y PIN</h2><p class="nota">Cada persona entra con su PIN: la <b>recepción</b> maneja las reservas del día; solo el <b>jefe</b> cambia el catálogo, los precios y las políticas.</p><div class="scroll"><table class="tabla"><thead><tr><th>Nombre</th><th>Rol</th><th>PIN</th><th></th></tr></thead><tbody data-equipo><tr><td colspan="4" class="nota">Cargando…</td></tr></tbody></table></div>' +
        '<form class="form-l" data-persona style="margin-top:12px"><div class="campo"><label for="q-nombre">Nombre</label><input id="q-nombre" maxlength="30" autocomplete="off"></div><div class="campo"><label for="q-pin">PIN (4 a 8 números)</label><input id="q-pin" inputmode="numeric" maxlength="8" autocomplete="off"></div><button class="btn prim" type="submit">Agregar recepción</button></form><p class="err" data-msg-eq role="alert"></p></section></div>';
    }
  };

  // ---------- Equipo ----------
  var personal = [];
  function cargarEquipo() {
    if (!esJefe()) return;
    Nube.personalListar(NUBE, Nube.pin(NUBE)).then(function (r) {
      if (!r || !r.ok) return; personal = r.personal;
      var t = app.querySelector('[data-equipo]'); if (!t) return;
      t.innerHTML = personal.map(function (x) { var editable = x.rol === 'recepcion'; return '<tr data-pin="' + esc(x.pin) + '"><td>' + esc(x.nombre) + '</td><td>' + (x.rol === 'dueno' ? 'Jefe' : 'Recepción') + '</td><td><code>' + esc(x.pin) + '</code></td><td>' + (editable ? '<button class="btn chico" type="button" data-pin-cambia>Cambiar PIN</button> <button class="btn chico" type="button" data-persona-activo>' + (x.activo ? 'Desactivar' : 'Activar') + '</button>' : '') + '</td></tr>'; }).join('');
    });
  }

  // ---------- Editor de catálogo (diálogo) ----------
  function editor(tipo, id) {
    var D = R.leer(neg), c = D.config, lista = tipo === 'recurso' ? c.recursos : c.servicios, x = id ? lista.filter(function (q) { return q.id === id; })[0] : null, nuevo = !x;
    var e = x ? copia(x) : { id: '', nombre: '', desc: '', precio: 0 };
    var m = c.modo, esRec = tipo === 'recurso', DS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    var inp = function (idc, etq, val, extra) { return '<div class="campo"><label for="' + idc + '">' + etq + '</label><input id="' + idc + '" ' + (extra || '') + ' value="' + esc(val == null ? '' : val) + '"><small class="campo-err" role="alert"></small></div>'; };
    var dlg = document.createElement('dialog'); dlg.className = 'editor'; document.body.appendChild(dlg);
    dlg.innerHTML = '<form method="dialog" novalidate><div class="ed-cab"><h2>' + (nuevo ? 'Agregar' : 'Editar') + ' ' + (esRec ? ({ noches: 'alojamiento', bloques: 'espacio', horas: 'profesional o box', cupos: 'recurso' }[m]) : (m === 'cupos' ? 'tour' : m === 'noches' ? 'paquete o extra' : 'servicio')) + '</h2><button class="btn chico" type="button" data-cerrar aria-label="Cerrar">×</button></div><div class="ed-cuerpo">' +
      inp('e-nombre', 'Nombre', e.nombre, 'maxlength="60"') + '<div class="campo"><label for="e-desc">Descripción corta</label><textarea id="e-desc" rows="2" maxlength="160">' + esc(e.desc || '') + '</textarea></div>' +
      (!(esRec && m === 'horas') ? inp('e-precio', m === 'noches' && esRec ? 'Precio por noche ($)' : m === 'cupos' ? 'Precio por persona ($)' : m === 'bloques' ? 'Precio por hora ($)' : 'Precio ($)', e.precio, 'type="number" min="0" step="500" inputmode="numeric"') : '') +
      (esRec && (m === 'noches' || m === 'horas' || m === 'bloques') ? inp('e-unid', 'Unidades iguales (cuántas hay)', e.unidades == null ? 1 : e.unidades, 'type="number" min="1" max="50"') : '') +
      (esRec && m !== 'cupos' ? inp('e-nuni', 'Nombre de cada unidad (opcional, separados por coma)', (e.nombresUnidades || []).join(', '), 'placeholder="Copihue 1, Copihue 2… o Cabaña Roja, Cabaña Azul" maxlength="400"') : '') +
      (esRec && (m === 'noches' || m === 'bloques') ? inp('e-cap', 'Capacidad (personas)', e.capacidad || 2, 'type="number" min="1" max="500"') : '') +
      (esRec && m === 'bloques' ? inp('e-minh', 'Mínimo de horas', e.minHoras || 1, 'type="number" min="1" max="12"') : '') +
      (esRec && m === 'horas' ? '<div class="campo"><span class="lbl">Servicios que atiende</span>' + c.servicios.map(function (s) { return '<label class="chk"><input type="checkbox" data-atiende="' + esc(s.id) + '"' + ((e.servicios || []).indexOf(s.id) > -1 ? ' checked' : '') + '><span>' + esc(s.nombre) + '</span></label>'; }).join('') + '<small class="campo-err" role="alert"></small></div>' : '') +
      (!esRec && (m === 'horas' || m === 'cupos') ? inp('e-dur', 'Duración (minutos)', e.duracion || 30, 'type="number" min="5" max="720" step="5"') : '') +
      (!esRec && m === 'cupos' ? inp('e-cap', 'Cupos por salida', e.capacidad || 10, 'type="number" min="1" max="200"') + inp('e-minp', 'Mínimo de personas por reserva', e.minPersonas || 1, 'type="number" min="1" max="50"') + inp('e-sal', 'Horas de salida (separadas por coma)', (e.salidas || ['09:00']).join(', '), 'placeholder="09:00, 15:00"') +
        '<div class="campo"><span class="lbl">Días en que sale</span><div style="display:flex;gap:10px;flex-wrap:wrap">' + DS.map(function (d, k) { return '<label class="chk"><input type="checkbox" data-dia="' + k + '"' + ((e.dias || [1, 2, 3, 4, 5, 6, 0]).indexOf(k) > -1 ? ' checked' : '') + '><span>' + d + '</span></label>'; }).join('') + '</div><small class="campo-err" role="alert"></small></div>' : '') +
      '<div class="campo"><label for="e-inc">Qué incluye (uno por línea, opcional)</label><textarea id="e-inc" rows="3">' + esc((e.incluye || []).join('\n')) + '</textarea></div></div><div class="ed-pie"><span class="campo-err" data-err-general style="margin-right:auto"></span><button class="btn" type="button" data-cerrar>Cancelar</button><button class="btn prim" type="submit">Guardar en el borrador</button></div></form>';
    dlg.showModal(); dlg.addEventListener('close', function () { dlg.remove(); });
    dlg.addEventListener('click', function (ev) { if (ev.target.closest('[data-cerrar]')) dlg.close(); });
    dlg.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (i) { var el = dlg.querySelector('#' + i); return el ? el.value.trim() : ''; }, num = function (i, d) { var n = parseInt(v(i), 10); return isFinite(n) ? n : d; };
      [].forEach.call(dlg.querySelectorAll('.campo.mal'), function (cc) { cc.classList.remove('mal'); var s = cc.querySelector('.campo-err'); if (s) s.textContent = ''; });
      var fallos = [], mal = function (i, msg) { var el = dlg.querySelector('#' + i) || dlg.querySelector('[data-' + i + ']'); var cont = el && el.closest('.campo'); if (cont) { cont.classList.add('mal'); var s = cont.querySelector('.campo-err'); if (s) s.textContent = msg; } fallos.push(el); };
      if (!v('e-nombre')) mal('e-nombre', 'Escribe el nombre.');
      var pr = dlg.querySelector('#e-precio') ? num('e-precio', -1) : 0; if (dlg.querySelector('#e-precio') && pr < 0) mal('e-precio', 'Escribe el precio en pesos, sin decimales.');
      var sal = [];
      if (dlg.querySelector('#e-sal')) { sal = v('e-sal').split(/[,\s]+/).filter(Boolean); if (!sal.length || sal.some(function (h) { return !/^\d{1,2}:\d{2}$/.test(h); })) mal('e-sal', 'Escribe horas como 09:00, 15:00.'); }
      var dias = [].map.call(dlg.querySelectorAll('[data-dia]:checked'), function (z) { return +z.dataset.dia; }); if (dlg.querySelector('[data-dia]') && !dias.length) { var cd = dlg.querySelector('[data-dia]').closest('.campo'); cd.classList.add('mal'); cd.querySelector('.campo-err').textContent = 'Marca al menos un día.'; fallos.push(dlg.querySelector('[data-dia]')); }
      var atiende = [].map.call(dlg.querySelectorAll('[data-atiende]:checked'), function (z) { return z.dataset.atiende; });
      if (dlg.querySelector('[data-atiende]') && !atiende.length) { var ca = dlg.querySelector('[data-atiende]').closest('.campo'); ca.classList.add('mal'); ca.querySelector('.campo-err').textContent = 'Marca al menos un servicio.'; fallos.push(dlg.querySelector('[data-atiende]')); }
      if (fallos.length) { var f0 = fallos[0]; if (f0) { f0.scrollIntoView({ block: 'center' }); f0.focus(); } dlg.querySelector('[data-err-general]').textContent = 'Revisa los campos marcados en rojo.'; return; }
      var s = nuevo ? { id: slug(v('e-nombre'), lista.map(function (q) { return q.id; })) } : e;
      s.nombre = v('e-nombre').slice(0, 60); s.desc = v('e-desc').slice(0, 160); if (dlg.querySelector('#e-precio')) s.precio = pr;
      if (dlg.querySelector('#e-unid')) s.unidades = Math.max(1, num('e-unid', 1)); if (dlg.querySelector('#e-nuni')) { var nu = v('e-nuni').split(',').map(function (z) { return z.trim().slice(0, 40); }).filter(Boolean).slice(0, s.unidades || 1); if (nu.length) s.nombresUnidades = nu; else delete s.nombresUnidades; } if (dlg.querySelector('#e-cap')) s.capacidad = Math.max(1, num('e-cap', 2)); if (dlg.querySelector('#e-minh')) s.minHoras = Math.max(1, num('e-minh', 1));
      if (dlg.querySelector('#e-dur')) s.duracion = Math.max(5, num('e-dur', 30)); if (dlg.querySelector('#e-minp')) s.minPersonas = Math.max(1, num('e-minp', 1));
      if (dlg.querySelector('#e-sal')) { s.salidas = sal; s.dias = dias; } if (dlg.querySelector('[data-atiende]')) s.servicios = atiende;
      var inc = v('e-inc').split('\n').map(function (l) { return l.trim(); }).filter(Boolean).slice(0, 8); if (inc.length) s.incluye = inc; else delete s.incluye;
      R.guardarConfig(neg, function (cfg) { var l = tipo === 'recurso' ? cfg.recursos : cfg.servicios, i = -1; l.forEach(function (q, k) { if (q.id === s.id) i = k; }); if (i < 0) l.push(s); else l[i] = s; });
      dlg.close(); pintar(); toast('Guardado en el borrador. Tócalo "Publicar cambios" para que lo vean tus clientes.');
    });
  }

  // ---------- Reserva por teléfono, WhatsApp o mostrador (la crea el equipo; el servidor valida la disponibilidad igual que en el sitio) ----------
  function nuevaReserva() {
    var D = R.leer(neg), c = D.config, m = c.modo, efe = R.efectiva(c), lista = m === 'noches' || m === 'bloques' ? c.recursos : c.servicios;
    var hoyS = U.hoy(), sel = { personas: m === 'horas' ? 1 : 2 };
    var dlg = document.createElement('dialog'); dlg.className = 'editor'; document.body.appendChild(dlg);
    var campos = R.modulo(c, 'campos') ? (c.campos || []) : [];
    dlg.innerHTML = '<form method="dialog" novalidate><div class="ed-cab"><h2>Nueva reserva</h2><button class="btn chico" type="button" data-cerrar aria-label="Cerrar">×</button></div><div class="ed-cuerpo">' +
      '<p class="nota">Para reservas que llegan por teléfono, WhatsApp o en persona. El sistema revisa que haya cupo, igual que en el sitio.</p>' +
      '<div class="campo"><label for="nr-que">' + (m === 'noches' ? 'Alojamiento' : m === 'bloques' ? 'Espacio' : m === 'cupos' ? 'Tour' : 'Servicio') + '</label><select id="nr-que">' + lista.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.nombre) + '</option>'; }).join('') + '</select></div>' +
      (m === 'noches' ? '<div class="form-l"><div class="campo"><label for="nr-lleg">Llegada</label><input id="nr-lleg" type="date" min="' + hoyS + '" value="' + hoyS + '"></div><div class="campo"><label for="nr-sal">Salida</label><input id="nr-sal" type="date" min="' + U.sumaDias(hoyS, 1) + '" value="' + U.sumaDias(hoyS, 1) + '"></div></div>'
        : '<div class="campo"><label for="nr-fecha">Día</label><input id="nr-fecha" type="date" min="' + hoyS + '" value="' + hoyS + '"></div>') +
      (m === 'horas' ? '<div class="campo"><label for="nr-prof">Profesional</label><select id="nr-prof"></select></div>' : '') +
      (m === 'bloques' ? '<div class="campo"><label for="nr-hrs">Horas</label><input id="nr-hrs" type="number" min="1" max="12" value="1"></div>' : '') +
      (m !== 'noches' ? '<div class="campo"><label for="nr-hora">' + (m === 'cupos' ? 'Salida' : 'Hora') + '</label><select id="nr-hora"></select></div>' : '') +
      (m !== 'horas' ? '<div class="campo"><label for="nr-pers">Personas</label><input id="nr-pers" type="number" min="1" max="500" value="2"></div>' : '') +
      '<p class="nota" data-nr-disp role="status"></p>' +
      '<div class="campo"><label for="nr-nombre">Nombre y apellido</label><input id="nr-nombre" maxlength="60" autocomplete="off"><small class="campo-err" role="alert"></small></div>' +
      '<div class="form-l"><div class="campo"><label for="nr-tel">Celular</label><input id="nr-tel" type="tel" maxlength="20" placeholder="+56 9 1234 5678"><small class="campo-err" role="alert"></small></div><div class="campo"><label for="nr-correo">Correo (opcional)</label><input id="nr-correo" type="email" maxlength="120"><small class="campo-err" role="alert"></small></div></div>' +
      '<div class="campo"><label for="nr-canal">Llegó por</label><select id="nr-canal"><option>Teléfono</option><option>WhatsApp</option><option>Presencial</option></select></div>' +
      campos.map(function (cp) { return '<div class="campo"><label for="nr-c-' + esc(cp.id) + '">' + esc(cp.etiqueta) + ' <small class="nota">(opcional para el equipo)</small></label>' + (cp.tipo === 'opciones' || cp.tipo === 'si' ? '<select id="nr-c-' + esc(cp.id) + '" data-resp="' + esc(cp.id) + '"><option value=""></option>' + (cp.tipo === 'si' ? ['Sí', 'No'] : cp.opciones || []).map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select>' : '<input id="nr-c-' + esc(cp.id) + '" data-resp="' + esc(cp.id) + '" maxlength="300">') + '</div>'; }).join('') +
      (efe.politicas.deposito ? '<label class="chk"><input type="checkbox" id="nr-sinpago" checked><span>Confirmar sin esperar el depósito (paga al llegar o ya lo transfirió). Si lo desmarcas, queda retenida ' + efe.politicas.retencionMin + ' minutos esperando el pago.</span></label>' : '') +
      '</div><div class="ed-pie"><span class="campo-err" data-err-general style="margin-right:auto"></span><button class="btn" type="button" data-cerrar>Cancelar</button><button class="btn prim" type="submit">Crear reserva</button></div></form>';
    var $ = function (s) { return dlg.querySelector(s); }, val = function (s) { var el = $(s); return el ? el.value.trim() : ''; };
    function leerSel() {
      var k = m === 'noches' || m === 'bloques' ? 'recurso' : 'servicio'; sel = { personas: m === 'horas' ? 1 : Math.max(1, +val('#nr-pers') || 1) }; sel[k] = val('#nr-que');
      if (m === 'noches') { sel.llegada = val('#nr-lleg'); sel.salida = val('#nr-sal'); }
      else { sel.fecha = val('#nr-fecha'); var h = $('#nr-hora'); if (h && h.value !== '') sel.min = +h.value; }
      if (m === 'horas' && val('#nr-prof')) sel.recurso = val('#nr-prof');
      if (m === 'bloques') sel.horas = Math.max(1, +val('#nr-hrs') || 1);
      return sel;
    }
    // Horas o salidas libres del día elegido, y cuánto queda en las noches elegidas
    function refrescar(cambioHoras) {
      var D2 = R.leer(neg), s = leerSel(), disp = $('[data-nr-disp]');
      if (m === 'horas' && cambioHoras !== 'prof') { var profs = c.recursos.filter(function (r) { return (r.servicios || []).indexOf(s.servicio) > -1; }), pa = val('#nr-prof'); $('#nr-prof').innerHTML = '<option value="">Cualquiera</option>' + profs.map(function (r) { return '<option value="' + esc(r.id) + '"' + (r.id === pa ? ' selected' : '') + '>' + esc(r.nombre) + '</option>'; }).join(''); s = leerSel(); }
      if (m === 'noches') {
        if (!s.llegada || !s.salida || s.salida <= s.llegada) { disp.textContent = 'Elige la llegada y una salida posterior.'; return; }
        var rr = R.recurso(D2, s.recurso), min = rr.unidades;
        for (var f = s.llegada; f < s.salida; f = U.sumaDias(f, 1)) min = Math.min(min, R.libresNoche(D2, s.recurso, f));
        disp.innerHTML = min > 0 ? 'Quedan <b>' + min + ' de ' + rr.unidades + '</b> para esas noches.' : '<b style="color:var(--lleno)">No queda ninguna libre esas noches.</b>';
        return;
      }
      var hs = !s.fecha ? [] : m === 'cupos' ? R.salidas(D2, s).filter(function (x) { return x.quedan > 0; }) : R.horas(D2, s), sel0 = val('#nr-hora');
      $('#nr-hora').innerHTML = hs.length ? hs.map(function (h) { return '<option value="' + h.min + '"' + (String(h.min) === sel0 ? ' selected' : '') + '>' + h.hora + (m === 'cupos' ? ' · quedan ' + h.quedan : '') + '</option>'; }).join('') : '<option value="">Sin horas libres ese día</option>';
      disp.textContent = hs.length ? hs.length + (m === 'cupos' ? ' salida(s) con cupo.' : ' hora(s) libre(s) ese día.') : 'Ese día no queda nada libre (o está cerrado).';
    }
    refrescar();
    dlg.showModal(); dlg.addEventListener('close', function () { dlg.remove(); });
    dlg.addEventListener('click', function (ev) { if (ev.target.closest('[data-cerrar]')) dlg.close(); });
    dlg.addEventListener('change', function (ev) { if (ev.target.id === 'nr-hora') return; if (ev.target.id === 'nr-lleg' && val('#nr-sal') <= val('#nr-lleg')) $('#nr-sal').value = U.sumaDias(val('#nr-lleg'), 1); refrescar(ev.target.id === 'nr-prof' ? 'prof' : ''); });
    dlg.addEventListener('submit', function (ev) {
      ev.preventDefault();
      [].forEach.call(dlg.querySelectorAll('.campo.mal'), function (cc) { cc.classList.remove('mal'); var s0 = cc.querySelector('.campo-err'); if (s0) s0.textContent = ''; });
      var mal = function (id, msg) { var cont = $(id).closest('.campo'); cont.classList.add('mal'); cont.querySelector('.campo-err').textContent = msg; }, fallo = false;
      var tel = val('#nr-tel').replace(/[^\d+]/g, ''), cor = val('#nr-correo');
      if (val('#nr-nombre').length < 3) { mal('#nr-nombre', 'Escribe nombre y apellido.'); fallo = true; }
      if (!tel && !cor) { mal('#nr-tel', 'Escribe el celular o el correo.'); fallo = true; }
      if (tel && tel.replace(/\D/g, '').length < 8) { mal('#nr-tel', 'Celular con código de país, por ejemplo +56 9 1234 5678.'); fallo = true; }
      if (cor && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cor)) { mal('#nr-correo', 'Correo no válido.'); fallo = true; }
      var s = leerSel();
      if (m !== 'noches' && s.min == null) { $('[data-err-general]').textContent = 'Elige un día con horas libres.'; return; }
      if (fallo) { $('[data-err-general]').textContent = 'Revisa los campos marcados en rojo.'; return; }
      var resp = {}; [].forEach.call(dlg.querySelectorAll('[data-resp]'), function (el) { if (el.value.trim()) resp[el.dataset.resp] = el.value.trim(); });
      var btn = $('[type="submit"]'); btn.disabled = true; btn.textContent = 'Creando…'; $('[data-err-general]').textContent = '';
      Promise.resolve(R.crear(neg, s, { nombre: val('#nr-nombre'), correo: cor, telefono: tel, pais: 'Chile', idioma: 'es' }, { canal: val('#nr-canal'), sinPago: !!($('#nr-sinpago') && $('#nr-sinpago').checked), equipo: true, respuestas: resp })).then(function (o) {
        btn.disabled = false; btn.textContent = 'Crear reserva';
        if (!o || o.error) { $('[data-err-general]').textContent = (o && o.error) || 'No se pudo crear.'; refrescar(); return; }
        dlg.close(); tab = 'reservas'; pintar();
        toast('Reserva ' + o.reserva.codigo + ' creada' + (o.reserva.unidadNombre ? ' · ' + o.reserva.unidadNombre : '') + '. Dale el código al cliente.');
      });
    });
  }
  // Mover una reserva a otra unidad (cabaña, habitación, box) del mismo tipo
  function mover(id) {
    var D = R.leer(neg), r = D.reservas.filter(function (z) { return z.id === id; })[0]; if (!r) return;
    var us = R.unidadesDe(neg, id);
    var dlg = document.createElement('dialog'); dlg.className = 'editor'; document.body.appendChild(dlg);
    dlg.innerHTML = '<form method="dialog"><div class="ed-cab"><h2>Mover ' + esc(r.codigo) + '</h2><button class="btn chico" type="button" data-cerrar aria-label="Cerrar">×</button></div><div class="ed-cuerpo"><p class="nota">' + esc(nombreDe(D, r)) + ' · ' + dia(r.desde) + (D.config.modo === 'noches' ? ' → ' + dia(r.hasta) : ' ' + hora(r.desde)) + '. Hoy está en <b>' + esc(r.unidadNombre || 'sin unidad asignada') + '</b>. Elige a cuál moverla:</p><div style="display:grid;gap:8px">' +
      us.map(function (x) { return '<button class="btn' + (x.actual ? ' prim' : '') + '" type="button" data-u="' + x.u + '"' + (x.actual || x.ocupada ? ' disabled' : '') + '>' + esc(x.nombre) + (x.actual ? ' · aquí está ahora' : x.ocupada ? ' · ocupada' + (x.ocupada === 'bloqueo' ? ' (bloqueada)' : ' por ' + esc(x.ocupada)) : ' · libre') + '</button>'; }).join('') +
      '</div><p class="campo-err" data-err-general></p></div><div class="ed-pie"><button class="btn" type="button" data-cerrar>Cerrar</button></div></form>';
    dlg.showModal(); dlg.addEventListener('close', function () { dlg.remove(); });
    dlg.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-cerrar]')) { dlg.close(); return; }
      var b = ev.target.closest('[data-u]'); if (!b) return; b.disabled = true;
      R.moverUnidad(neg, id, +b.dataset.u).then(function (o) { if (!o || o.error) { dlg.querySelector('[data-err-general]').textContent = (o && o.error) || 'No se pudo mover.'; b.disabled = false; return; } dlg.close(); toast(r.codigo + ' ahora está en ' + (o.reserva && o.reserva.unidadNombre) + '.'); pintar(); });
    });
  }

  // ---------- Eventos ----------
  var BUS = function (p) { return Promise.resolve(p).then(function (o) { if (o && o.error) toast(o.error, true); return o; }); };
  app.addEventListener('click', function (e) {
    var x, D = R.leer(neg);
    if (e.target.closest('[data-cerrar-alerta]')) { alerta.hidden = true; return; }
    if (e.target.closest('[data-ver-nuevas]')) { tab = 'reservas'; alerta.hidden = true; pintar(); return; }
    if (e.target.closest('[data-sonido]')) { try { localStorage.setItem('sonido-agenda-' + NUBE, sonidoOn() ? '0' : '1'); } catch (er) {} beep(); pintar(); return; }
    if (e.target.closest('[data-publicar]')) { BUS(R.publicarConfig(neg)).then(function (o) { if (o && o.ok) toast('Publicado: tus clientes ya ven los cambios.'); pintar(); }); return; }
    if (e.target.closest('[data-descartar]')) { if (confirm('¿Descartar los cambios sin publicar?')) { R.descartarConfig(neg); toast('Cambios descartados.'); } return; }
    if ((x = e.target.closest('[data-neg]'))) { location.href = '?negocio=' + x.dataset.neg; return; }
    if ((x = e.target.closest('[data-tab]'))) { tab = x.dataset.tab; pintar(); if (tab === 'negocio') cargarEquipo(); return; }
    if (e.target.closest('[data-reset]') && confirm('¿Borrar todas las reservas, avisos y bloqueos de este negocio? No se puede deshacer.')) { R.restablecer(neg).then(function () { toast('Listo: se borraron las reservas.'); pintar(); }, function () { toast('Solo el jefe puede borrar las reservas.', true); }); return; }
    if ((x = e.target.closest('[data-cal]'))) { desdeCal = +x.dataset.cal === 0 ? U.hoy() : U.sumaDias(desdeCal, +x.dataset.cal); pintar(); return; }
    if ((x = e.target.closest('[data-rango]'))) { rango = +x.dataset.rango; pintar(); return; }
    if ((x = e.target.closest('[data-quitar-bloqueo]'))) { BUS(R.quitarBloqueo(neg, x.dataset.quitarBloqueo)).then(function (o) { if (o && o.ok) toast('Bloqueo quitado: esas fechas vuelven a estar disponibles.'); pintar(); }); return; }
    if ((x = e.target.closest('[data-acc]'))) {
      var id = x.dataset.id, r = D.reservas.filter(function (z) { return z.id === id; })[0], a = x.dataset.acc;
      if (a === 'cancelada') { var rb = R.reembolso(D, r); if (!confirm('Cancelar ' + r.codigo + '. Según la política se devuelve el ' + rb.porcentaje + ' % de lo pagado: ' + clp(rb.monto) + '. ¿Seguir?')) return; }
      x.disabled = true;
      BUS(R.estado(neg, id, a, a === 'pagada' ? { pagado: +x.dataset.monto || r.precio.total } : null)).then(function () { pintar(); });
      return;
    }
    if ((x = e.target.closest('[data-nuevo]'))) { editor(x.dataset.nuevo, null); return; }
    if (e.target.closest('[data-nueva-res]')) { nuevaReserva(); return; }
    if ((x = e.target.closest('[data-mover]'))) { mover(x.dataset.mover); return; }
    if ((x = e.target.closest('[data-ed]'))) { var p = x.dataset.ed.split(':'); editor(p[0], p[1]); return; }
    if ((x = e.target.closest('[data-del]'))) {
      var pd = x.dataset.del.split(':'), tipoD = pd[0], idD = pd[1], enUso = propias(D).filter(function (r) { return ACTIVAS.indexOf(r.estado) > -1 && r.desde > Date.now() && (tipoD === 'recurso' ? r.recurso === idD : r.servicio === idD); }).length;
      if (!confirm('¿Quitar este elemento del catálogo?' + (enUso ? ' Ojo: tiene ' + enUso + ' reserva(s) vigente(s) que se mantienen, pero ya no se podrá reservar.' : '') + ' (Queda en el borrador hasta que publiques.)')) return;
      R.guardarConfig(neg, function (cfg) { var l = tipoD === 'recurso' ? cfg.recursos : cfg.servicios; var i = l.findIndex(function (q) { return q.id === idD; }); if (i > -1) l.splice(i, 1); if (tipoD === 'servicio') (cfg.recursos || []).forEach(function (rr) { if (rr.servicios) rr.servicios = rr.servicios.filter(function (s) { return s !== idD; }); }); });
      pintar(); return;
    }
    if (e.target.closest('[data-nueva-temp]')) { R.guardarConfig(neg, function (cfg) { cfg.temporadas = cfg.temporadas || []; cfg.temporadas.push({ nombre: 'Nueva temporada', desde: '01-01', hasta: '01-31', factor: 1.2 }); }); pintar(); return; }
    if ((x = e.target.closest('[data-campo-quitar]'))) { if (!confirm('¿Quitar esta pregunta? Las respuestas ya guardadas en reservas se mantienen.')) return; R.guardarConfig(neg, function (cfg) { cfg.campos.splice(+x.dataset.campoQuitar, 1); }); pintar(); return; }
    if ((x = e.target.closest('[data-quitar-temp]'))) { R.guardarConfig(neg, function (cfg) { cfg.temporadas.splice(+x.dataset.quitarTemp, 1); }); pintar(); return; }
    if ((x = e.target.closest('[data-color]'))) { R.guardarConfig(neg, function (cfg) { cfg.color = x.dataset.color; }); pintar(); return; }
    if (e.target.closest('[data-ical-bajar]')) { var rec = app.querySelector('#ic-rec').value; bajar(neg + '-' + rec + '.ics', R.exportarIcal(neg, rec), 'text/calendar'); return; }
    if (e.target.closest('[data-ical-subir]')) { Promise.resolve(R.importarIcal(neg, app.querySelector('#ic-rec').value, app.querySelector('[data-ical-txt]').value, app.querySelector('#ic-orig').value)).then(function (n) { toast(n + ' periodo(s) bloqueado(s). Míralos en el Calendario.'); }); return; }
    if (e.target.closest('[data-crm]')) { var cli = {}; propias(D).forEach(function (r) { var k = r.cliente.correo || r.cliente.nombre + r.codigo; cli[k] = cli[k] || [r.cliente.nombre, r.cliente.correo, r.cliente.telefono, r.cliente.pais, 0, 0, '']; cli[k][4]++; cli[k][5] += r.estado !== 'cancelada' ? r.precio.total : 0; cli[k][6] = new Date(r.desde).toISOString().slice(0, 10); }); bajar('clientes-' + neg + '.csv', csv([['nombre', 'correo', 'telefono', 'pais', 'reservas', 'total_gastado', 'ultima_visita']].concat(Object.keys(cli).map(function (k) { return cli[k]; }))), 'text/csv'); return; }
    if (e.target.closest('[data-erp]') || e.target.closest('[data-csv-res]')) { bajar('reservas-' + neg + '.csv', csv([['codigo', 'creada', 'desde', 'hasta', 'recurso', 'servicio', 'personas', 'canal', 'pais', 'bruto', 'descuento', 'total', 'pagado', 'estado', 'reembolso', 'versiones']].concat(propias(D).map(function (r) { return [r.codigo, new Date(r.creada).toISOString(), new Date(r.desde).toISOString(), new Date(r.hasta).toISOString(), r.recurso, r.servicio || '', r.personas, r.canal, r.cliente.pais || '', r.precio.bruto, r.precio.descuento, r.precio.total, r.pagado, r.estado, r.reembolso ? r.reembolso.monto : '', r.rev || 1]; }))), 'text/csv'); return; }
    var fila = e.target.closest('[data-pin]'), pp = fila && personal.filter(function (z) { return z.pin === fila.dataset.pin; })[0];
    if (pp && e.target.closest('[data-pin-cambia]')) { var nuevoPin = prompt('Nuevo PIN para ' + pp.nombre + ' (4 a 8 números):', ''); if (nuevoPin === null) return; Nube.personalGuardar(NUBE, Nube.pin(NUBE), pp.rol, pp.nombre, nuevoPin.trim(), pp.activo, pp.pin).then(function (r) { app.querySelector('[data-msg-eq]').textContent = r && r.ok ? '' : (r && r.error) || 'No se pudo cambiar.'; if (r && r.ok) toast('PIN actualizado. Dáselo a ' + pp.nombre + '.'); cargarEquipo(); }); return; }
    if (pp && e.target.closest('[data-persona-activo]')) { if (pp.activo && !confirm(pp.nombre + ' ya no podrá entrar con su PIN. ¿Desactivar?')) return; Nube.personalGuardar(NUBE, Nube.pin(NUBE), pp.rol, pp.nombre, pp.pin, !pp.activo, pp.pin).then(function (r) { app.querySelector('[data-msg-eq]').textContent = r && r.ok ? '' : (r && r.error) || 'No se pudo cambiar.'; cargarEquipo(); }); return; }
  });
  app.addEventListener('change', function (e) {
    var t = e.target, ds = t.dataset;
    if (t.id === 'f-est') { filtro.estado = t.value; pintar(); }
    if (t.id === 'cl-gr') { filtroCli.grupo = t.value; pintar(); }
    if (t.id === 'b-rec') llenarUnidades();
    if (ds.modulo) {
      if (!t.checked && ds.impacto && !confirm('Apagar este módulo. ' + ds.impacto + ' ¿Seguir?')) { t.checked = true; return; }
      R.guardarConfig(neg, function (c) { c.modulos = c.modulos || {}; c.modulos[ds.modulo] = t.checked; }); pintar(); return;
    }
    if (ds.campoObl !== undefined) { R.guardarConfig(neg, function (c) { c.campos[+ds.campoObl].obligatorio = t.checked; }); pintar(); return; }
    if (ds.regla) { R.guardarConfig(neg, function (c) { c.reglas[+ds.regla].activa = t.checked; }); pintar(); }
    if (ds.promo) { R.guardarConfig(neg, function (c) { c.promos[+ds.promo].activa = t.checked; }); pintar(); }
    if (ds.notif) { R.guardarConfig(neg, function (c) { c.notif[ds.notif][ds.c] = t.checked; }); pintar(); }
    if (ds.t !== undefined) { R.guardarConfig(neg, function (c) { var tt = c.temporadas[+ds.t]; tt[ds.k] = ds.k === 'factor' ? Math.max(.5, Math.min(3, parseFloat(t.value) || 1)) : (ds.k === 'nombre' ? t.value.trim().slice(0, 40) : (/^\d{2}-\d{2}$/.test(t.value.trim()) ? t.value.trim() : tt[ds.k])); }); pintar(); }
  });
  app.addEventListener('input', function (e) { if (e.target.id === 'cl-txt') { filtroCli.texto = e.target.value; clearTimeout(app._c); app._c = setTimeout(function () { pintar(); var i = app.querySelector('#cl-txt'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 300); return; } if (e.target.id === 'f-txt') { filtro.texto = e.target.value; clearTimeout(app._b); app._b = setTimeout(function () { pintar(); var i = app.querySelector('#f-txt'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 300); } });
  app.addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target, v = function (id) { var el = f.querySelector('#' + id); return el ? el.value : ''; };
    if (f.matches('[data-bloq]')) { var a = U.fdate(v('b-desde')).getTime(), b = U.fdate(v('b-hasta')).getTime(); if (!(b > a)) return toast('La fecha "hasta" debe ser después de "desde".', true); BUS(R.bloquear(neg, v('b-rec'), a, b, v('b-mot').slice(0, 60), v('b-uni') || 'todas')).then(function (o) { if (o && !o.error) { toast('Fechas bloqueadas: ya no se pueden reservar.'); pintar(); } }); return; }
    if (f.matches('[data-campo-nuevo]')) {
      var et = v('cf-et').trim(), tp = v('cf-tipo'), ops = v('cf-op').split(',').map(function (z) { return z.trim().slice(0, 60); }).filter(Boolean).slice(0, 20);
      if (!et) return toast('Escribe la pregunta.', true); if (tp === 'opciones' && !ops.length) return toast('Escribe las opciones separadas por coma.', true);
      R.guardarConfig(neg, function (c) { c.campos = c.campos || []; var cp = { id: slug(et, c.campos.map(function (z) { return z.id; })), etiqueta: et.slice(0, 80), tipo: tp, obligatorio: f.querySelector('#cf-obl').checked }; if (tp === 'opciones') cp.opciones = ops; if (v('cf-ay').trim()) cp.ayuda = v('cf-ay').trim().slice(0, 120); c.campos.push(cp); });
      toast('Pregunta agregada al borrador.'); pintar(); return;
    }
    if (f.matches('[data-nueva-promo]')) { var cod = v('p-cod').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (cod.length < 3) return toast('El código debe tener al menos 3 letras o números.', true); if ((R.leer(neg).config.promos || []).some(function (p) { return p.codigo === cod; })) return toast('Ese código ya existe.', true); R.guardarConfig(neg, function (c) { c.promos = c.promos || []; c.promos.push({ codigo: cod, tipo: v('p-tipo'), valor: Math.max(1, +v('p-val') || 1), minimo: Math.max(0, +v('p-min') || 0), activa: true, usos: 0, usosMax: Math.max(1, +v('p-max') || 100) }); }); toast('Código ' + cod + ' creado en el borrador.'); pintar(); return; }
    if (f.matches('[data-pol]')) {
      R.guardarConfig(neg, function (c) {
        var p = c.politicas, n = function (id, mn, mx) { var el = f.querySelector('#' + id); return el ? Math.max(mn, Math.min(mx, parseInt(el.value, 10) || 0)) : null; };
        p.deposito = n('po-dep', 0, 100); p.retencionMin = n('po-ret', 2, 120); p.anticipacionHoras = n('po-ant', 0, 240); p.maxDias = n('po-max', 7, 730); p.modificarHoras = n('po-mod', 0, 720);
        if (f.querySelector('#po-min')) { p.estadiaMin = n('po-min', 1, 30); p.estadiaMinAlta = n('po-mina', 1, 30); }
        [].forEach.call(f.querySelectorAll('[data-can]'), function (el) { p.cancelacion[+el.dataset.can][el.dataset.k] = Math.max(0, parseInt(el.value, 10) || 0); });
      });
      toast('Políticas guardadas en el borrador.'); pintar(); return;
    }
    if (f.matches('[data-temp]')) { R.guardarConfig(neg, function (c) { c.factorFinde = Math.max(.5, Math.min(3, parseFloat(v('h-finde')) || 1)); c.politicas.checkin = v('h-in').trim() || '15:00'; c.politicas.checkout = v('h-out').trim() || '11:00'; }); toast('Guardado en el borrador.'); pintar(); return; }
    if (f.matches('[data-horario]')) {
      var hor = {}, ok = true, DS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
      DS.forEach(function (k) {
        var campo = f.querySelector('#hd-' + k).closest('.campo'), txt = f.querySelector('#hd-' + k).value.trim(), tr = [], mal = false;
        campo.classList.remove('mal'); campo.querySelector('.campo-err').textContent = '';
        if (txt) txt.split(',').forEach(function (par) { var m = /^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/.exec(par); if (!m || U.minH(m[2]) <= U.minH(m[1])) mal = true; else tr.push([U.hMin(U.minH(m[1])), U.hMin(U.minH(m[2]))]); });
        if (mal) { ok = false; campo.classList.add('mal'); campo.querySelector('.campo-err').textContent = 'Escribe tramos como 08:30-13:00, 14:30-19:00.'; }
        hor[k] = tr;
      });
      if (!ok) { f.querySelector('[data-err-h]').textContent = 'Revisa los días marcados en rojo.'; var m0 = f.querySelector('.campo.mal input'); if (m0) m0.focus(); return; }
      R.guardarConfig(neg, function (c) { c.horario = hor; c.intervalo = Math.max(5, Math.min(240, parseInt(v('h-int'), 10) || 30)); c.buffer = Math.max(0, Math.min(120, parseInt(v('h-buf'), 10) || 0)); });
      toast('Horario guardado en el borrador.'); pintar(); return;
    }
    if (f.matches('[data-negocio]')) {
      if (!v('n-nombre').trim()) return toast('Escribe el nombre del negocio.', true);
      R.guardarConfig(neg, function (c) { c.nombre = v('n-nombre').trim().slice(0, 60); c.rubro = v('n-rubro').trim().slice(0, 40); c.direccion = v('n-dir').trim().slice(0, 100); c.sigla = (v('n-sigla').trim() || c.nombre.slice(0, 2)).toUpperCase().slice(0, 3); c.pagoInstrucciones = v('n-pago').trim().slice(0, 300); var rs = v('n-resena').trim(); if (/^https:\/\/[^\s"<>]{8,290}$/.test(rs)) c.resenaUrl = rs; else delete c.resenaUrl; if (f.querySelector('#n-demo')) c.pagoDemo = f.querySelector('#n-demo').checked; });
      toast('Guardado en el borrador.'); pintar(); cargarEquipo(); return;
    }
    if (f.matches('[data-persona]')) {
      var nom = v('q-nombre').trim(), pn = v('q-pin').trim(), msg = f.parentNode.querySelector('[data-msg-eq]');
      if (nom.length < 2) { msg.textContent = 'Escribe el nombre de la persona.'; return; } if (!/^[0-9]{4,8}$/.test(pn)) { msg.textContent = 'El PIN debe tener de 4 a 8 números.'; return; }
      Nube.personalGuardar(NUBE, Nube.pin(NUBE), 'recepcion', nom, pn, true, null).then(function (r) { msg.textContent = r && r.ok ? '' : (r && r.error) || 'No se pudo agregar.'; if (r && r.ok) { toast(nom + ' ya puede entrar con su PIN.'); f.reset(); } cargarEquipo(); });
    }
  });
  window.addEventListener('beforeunload', function (e) { if (esJefe() && R.configPendiente(neg)) { e.preventDefault(); e.returnValue = ''; } });

  Nube.acceso({ negocio: NUBE, titulo: 'Panel del negocio · Reservas', texto: 'Escribe tu PIN. La recepción maneja las reservas del día; el jefe, además, el catálogo, los precios y las políticas.', aceptan: ['dueno', 'recepcion'], pistas: AG.demo ? AG.pistas : null }).then(function (qq) {
    rol = qq.rol; quien = qq.nombre || '';
    R.conectar(neg); R.entrarEquipo(neg);
    var sal = document.createElement('button'); sal.type = 'button'; sal.className = 'btn chico'; sal.textContent = 'Salir'; sal.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:50'; sal.addEventListener('click', function () { if (esJefe() && R.configPendiente(neg) && !confirm('Tienes cambios sin publicar. ¿Salir y perderlos?')) return; Nube.salir(NUBE); }); document.body.appendChild(sal);
    R.escuchar(function (m) {
      if (m.id !== neg) return; if (m.tipo === 'error') { toast(m.mensaje, true); return; }
      nuevas();
      var a = document.activeElement; if (a && a.matches && a.matches('input, select, textarea') && app.contains(a)) return;
      if (document.querySelector('dialog.editor[open]')) return;
      pintar(); if (tab === 'negocio') cargarEquipo();
    });
    setInterval(function () { R.automatico(neg); nuevas(); }, 5000);
    // Las reservas que ya existían al entrar no suenan: la primera lectura completa del equipo es la base (ver nuevas())
    pintar();
  });
})();
