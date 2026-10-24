// Panel del dueño: todo el restaurante en un solo lugar. Este archivo trae el marco (PIN, pestañas, avisos de pedidos nuevos) y tres pestañas:
//  · Pedidos: los pedidos en vivo, aceptar o rechazar, asignar repartidor, ver quién está modificando y el historial de cada pedido.
//  · Estadísticas: ventas, productos más y menos pedidos, estados, historial de ventas (siempre con datos reales, nunca de relleno).
//  · Opiniones: lo que dicen los clientes y la respuesta del local.
// Las pestañas "Carta" y "Negocio y equipo" están en panel-carta.js y panel-negocio.js. Solo entra el dueño, con su PIN.
(function () {
  'use strict';
  var R = window.RESTAURANTE, P = window.Pedidos, C = window.Carta, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var Panel = window.Panel = { R: R, P: P, C: C, app: app, esc: esc, clp: clp, modulos: [], tab: 'pedidos', dueno: '', draft: null, sucio: false, repartidores: [], personal: [] };
  var ORDEN = ['pedidos', 'carta', 'estadisticas', 'opiniones', 'negocio'];
  Panel.registrar = function (m) { Panel.modulos.push(m); Panel.modulos.sort(function (a, b) { return ORDEN.indexOf(a.id) - ORDEN.indexOf(b.id); }); };
  Panel.copia = function (x) { return JSON.parse(JSON.stringify(x)); };
  Panel.toast = function (t, malo) { var d = document.createElement('div'); d.className = 'toast-s'; d.setAttribute('role', malo ? 'alert' : 'status'); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4200); };
  // La carta y los datos del local se editan sobre un borrador compartido entre pestañas y se publican juntos
  Panel.borrador = function () { if (!Panel.draft && C.modelo()) Panel.draft = Panel.copia(C.modelo()); return Panel.draft; };
  Panel.marcarSucio = function (v) { Panel.sucio = v !== false; var b = document.querySelector('[data-publicar-barra]'); if (b) b.hidden = !Panel.sucio; };
  Panel.publicar = function () { return C.guardar(Panel.draft).then(function (m) { Panel.sucio = false; Panel.draft = Panel.copia(m); Panel.marcarSucio(false); Panel.toast('Publicado: tus clientes ya ven los cambios.'); return m; }, function (e) { Panel.toast(e.message === 'sin permiso' ? 'No tienes permiso para publicar.' : 'No se pudo publicar. Revisa tu conexión.', true); throw e; }); };
  Panel.descartar = function () { Panel.draft = null; Panel.marcarSucio(false); };
  var vista, filtro = 'activos', dias = 7, anunciados = {}, audio = null, desde = 0, alerta = null;
  function sonidoOn() { try { return localStorage.getItem('sonido-panel-' + R.negocio) !== '0'; } catch (e) { return true; } }
  function beep() {
    if (!sonidoOn()) return;
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); [0, .2, .4].forEach(function (d, k) { var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = [784, 988, 1175][k]; g.gain.setValueAtTime(.14, audio.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + d + .17); o.connect(g); g.connect(audio.destination); o.start(audio.currentTime + d); o.stop(audio.currentTime + d + .18); }); } catch (e) {}
  }
  if (C) C.iniciar();

  Nube.acceso({ negocio: R.negocio, titulo: 'Panel del dueño · ' + R.nombre, aceptan: ['dueno'], pistas: P.CONFIG.pistas.panel }).then(function (q) {
    Panel.dueno = q.nombre || 'Dueño'; P.entrarEquipo(); desde = Date.now() + 4500;
    Nube.personalListar(R.negocio, Nube.pin(R.negocio)).then(function (r) { if (r && r.ok) { Panel.personal = r.personal; Panel.repartidores = r.personal.filter(function (x) { return x.rol === 'reparto' && x.activo; }).map(function (x) { return x.nombre; }); } });
    app.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:end;justify-content:space-between"><div><h1 class="sis-h">Panel del dueño</h1><p class="sis-sub">Pedidos, carta, ventas y opiniones de ' + esc(R.nombre) + ', en vivo y sin recargar.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="sis-nota" data-conexion role="status"></span><button class="btn-s" type="button" data-sonido></button><a class="btn-s" href="../" target="_blank" rel="noopener">Ver la carta</a><a class="btn-s" href="../cocina/">Cocina</a><a class="btn-s" href="../repartidor/">Reparto</a><button class="btn-s" type="button" data-salir>Salir</button></div></div>' +
      '<aside class="alerta-nuevo" data-alerta hidden role="status"></aside>' +
      '<div class="ed-resumen" data-publicar-barra hidden style="margin-top:12px"><span>Tienes cambios sin publicar en la carta o en los datos del local.</span><button class="btn-s prim" type="button" data-publicar>Publicar cambios</button><button class="btn-s" type="button" data-descartar>Descartar</button></div>' +
      '<nav class="pestanas" role="tablist" aria-label="Secciones del panel">' + Panel.modulos.map(function (m) { return '<button type="button" role="tab" data-tab="' + m.id + '" aria-selected="' + (m.id === Panel.tab) + '">' + m.titulo + (m.insignia ? '<span class="num" data-num="' + m.id + '" hidden></span>' : '') + '</button>'; }).join('') + '</nav>' +
      '<div id="vista" role="tabpanel" aria-live="polite"></div>';
    vista = document.getElementById('vista'); alerta = app.querySelector('[data-alerta]');
    var bs = app.querySelector('[data-sonido]'), pintarSonido = function () { bs.setAttribute('aria-pressed', String(sonidoOn())); bs.textContent = sonidoOn() ? 'Aviso sonoro: activado' : 'Aviso sonoro: apagado'; };
    bs.addEventListener('click', function () { try { localStorage.setItem('sonido-panel-' + R.negocio, sonidoOn() ? '0' : '1'); } catch (e) {} pintarSonido(); beep(); }); pintarSonido();
    app.querySelector('[data-salir]').addEventListener('click', function () { if (Panel.sucio && !confirm('Tienes cambios sin publicar. ¿Salir y perderlos?')) return; Nube.salir(R.negocio); });
    app.querySelector('[data-publicar]').addEventListener('click', function () { Panel.publicar(); });
    app.querySelector('[data-descartar]').addEventListener('click', function () { if (confirm('¿Descartar los cambios sin publicar?')) { Panel.descartar(); cambiarTab(Panel.tab, true); } });
    app.querySelector('.pestanas').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) cambiarTab(b.dataset.tab); });
    window.addEventListener('beforeunload', function (e) { if (Panel.sucio) { e.preventDefault(); e.returnValue = ''; } });
    P.escuchar(function (m) {
      if (m.tipo === 'conexion') { pintarConexion(); return; }
      if (m.tipo === 'error') { Panel.toast(m.mensaje, true); return; }
      insignias(); nuevos();
      var mod = modActual(); if (mod && mod.alEvento) mod.alEvento(vista, m);
    });
    C.escuchar(function () { var mod = modActual(); if (mod && mod.alCarta) mod.alCarta(vista); });
    pintarConexion(); cambiarTab(Panel.tab, true); setInterval(function () { var mod = modActual(); if (mod && mod.reloj) mod.reloj(vista); insignias(); }, 20000);
  });

  function modActual() { return Panel.modulos.filter(function (m) { return m.id === Panel.tab; })[0]; }
  function cambiarTab(id, forzar) {
    if (id === Panel.tab && !forzar) return;
    Panel.tab = id; [].forEach.call(app.querySelectorAll('[data-tab]'), function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === id)); });
    var mod = modActual(); vista.innerHTML = ''; if (mod) mod.pintar(vista); insignias();
  }
  Panel.irA = cambiarTab;
  function pintarConexion() { var e = app.querySelector('[data-conexion]'); if (e) e.textContent = P.enLinea() ? 'En vivo' : 'Sin conexión: reintentando…'; }
  function insignias() {
    var n = P.todos().filter(function (p) { return p.estado === 'recibido'; }).length, o = P.todos().filter(function (p) { return p.opinion && !p.opinion.respuesta; }).length;
    [['pedidos', n], ['opiniones', o]].forEach(function (x) { var e = app.querySelector('[data-num="' + x[0] + '"]'); if (e) { var antes = +e.textContent || 0; e.textContent = x[1]; e.hidden = !x[1]; if (x[1] > antes) { e.classList.remove('pulso'); void e.offsetWidth; e.classList.add('pulso'); } } });
  }
  // Aviso de pedido nuevo (o modificado antes de aceptarlo): banner y sonido una sola vez por cada uno
  function nuevos() {
    var avisos = [];
    P.todos().forEach(function (p) {
      if (p.estado !== 'recibido') { anunciados[p.id] = p.rev || 1; return; }
      var visto = anunciados[p.id], rev = p.rev || 1;
      if (visto === undefined) { if (Date.now() > desde) avisos.push('Nuevo pedido #' + p.codigo + ' · ' + P.tipoTxt(p) + ' · ' + clp(p.total)); anunciados[p.id] = rev; }
      else if (visto !== rev) { if (Date.now() > desde) avisos.push('El cliente modificó el pedido #' + p.codigo + ' (ahora ' + clp(p.total) + ')'); anunciados[p.id] = rev; }
    });
    if (!avisos.length) return;
    beep();
    alerta.hidden = false; alerta.innerHTML = '<span><b>' + esc(avisos[avisos.length - 1]) + '</b>' + (avisos.length > 1 ? ' y ' + (avisos.length - 1) + ' más' : '') + '</span><button class="btn-s" type="button" data-ver-nuevos>Ver pedidos</button><button class="btn-s" type="button" data-cerrar-alerta aria-label="Cerrar aviso">×</button>';
    alerta.onclick = function (e) { if (e.target.closest('[data-ver-nuevos]')) { filtro = 'nuevos'; cambiarTab('pedidos', true); alerta.hidden = true; } if (e.target.closest('[data-cerrar-alerta]')) alerta.hidden = true; };
  }

  // ======================= Pedidos =======================
  var FILTROS = [['activos', 'Activos'], ['nuevos', 'Nuevos (por aceptar)'], ['curso', 'En curso'], ['terminados', 'Terminados'], ['todos', 'Todos']];
  function pasa(p) { return filtro === 'todos' ? true : filtro === 'nuevos' ? p.estado === 'recibido' : filtro === 'curso' ? ['aceptado', 'preparacion', 'listo', 'camino'].indexOf(p.estado) > -1 : filtro === 'terminados' ? ['entregado', 'cancelado'].indexOf(p.estado) > -1 : P.ACTIVOS.indexOf(p.estado) > -1; }
  function chip(p) { return '<span class="chip-est" style="--ec:' + P.ESTADOS[p.estado].color + '">' + esc(P.nombreEstado(p)) + '</span>'; }
  function hace(p) { var m = Math.max(0, Math.floor((Date.now() - p.creado) / 60000)); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function historialHtml(p) {
    var h = (p.historial || []).map(function (x) { return '<li>' + esc(P.ESTADOS[x.estado] ? P.nombreEstado(p, x.estado) : x.estado) + ' · ' + P.fecha(x.t) + ' ' + P.hora(x.t) + (x.quien ? ' · ' + esc(x.quien) : x.por ? ' · ' + esc(x.por) : '') + '</li>'; }).join('');
    var e = (p.ediciones || []).map(function (x) { return '<li>Versión ' + x.rev + ' (antes del cambio de las ' + P.hora(x.t) + '): ' + x.items.map(function (i) { return i.cant + '× ' + esc(i.nombre); }).join(', ') + ' · ' + clp(x.total) + '</li>'; }).join('');
    return '<details><summary>Historial' + ((p.ediciones || []).length ? ' y versiones' : '') + '</summary><ol class="sis-nota" style="margin:4px 0 0 18px">' + h + '</ol>' + (e ? '<p class="sis-nota" style="margin-top:6px"><b>Versiones anteriores</b></p><ol class="sis-nota" style="margin:2px 0 0 18px">' + e + '</ol>' : '') + '</details>';
  }
  function cardPedido(p) {
    var mod = P.modificandoAhora(p), cli = p.cliente || {}, activo = P.ACTIVOS.indexOf(p.estado) > -1;
    return '<article class="pedido-card" style="--ec:' + P.ESTADOS[p.estado].color + '" data-id="' + esc(p.id) + '">' +
      '<div class="cab"><b style="font-size:18px">#' + esc(p.codigo) + '</b><span>' + esc(P.tipoTxt(p)) + '</span>' + chip(p) + '<span class="sis-nota">' + P.fecha(p.creado) + ' ' + P.hora(p.creado) + (activo ? ' · hace ' + hace(p) : '') + '</span></div>' +
      (mod ? '<p><span class="etiqueta-mod vivo">✎ El cliente está modificando este pedido</span></p>' : '') +
      ((p.rev || 1) > 1 ? '<p><span class="etiqueta-mod">Modificado · versión ' + p.rev + '</span></p>' : '') +
      '<ul>' + p.items.map(function (i) { return '<li>' + P.lineaHtml(i) + '</li>'; }).join('') + '</ul>' +
      (p.nota ? '<p class="sis-nota"><b>Observación:</b> ' + esc(p.nota) + '</p>' : '') +
      '<p class="sis-nota">' + esc(cli.nombre) + (cli.telefono ? ' · <a href="tel:' + esc(cli.telefono) + '">' + esc(cli.telefono) + '</a>' : '') + (p.tipo === 'delivery' ? '<br>' + esc(cli.direccion) + ', ' + esc(cli.comuna) + ' · ' + p.km + ' km' : '') + '</p>' +
      '<p><b>' + clp(p.total) + '</b> <span class="sis-nota">(productos ' + clp(p.subtotal) + (p.envio ? ' + envío ' + clp(p.envio) : '') + ')</span> <span class="' + (p.pago.pagado ? 'pagado">Pagado' : 'por-pagar">Por pagar') + '</span>' + (p.pago.metodo === 'linea' ? ' <span class="sis-nota">en línea</span>' : '') + '</p>' +
      (p.estado === 'cancelado' && p.motivo ? '<p class="sis-nota">Motivo: ' + esc(p.motivo) + '</p>' : '') +
      (p.tipo === 'delivery' && ['aceptado', 'preparacion', 'listo'].indexOf(p.estado) > -1 ? '<div class="campo"><label class="lbl" for="as-' + esc(p.id) + '">Repartidor asignado</label><select id="as-' + esc(p.id) + '" data-asignar><option value="">Sin asignar (lo toma quien esté libre)</option>' + Panel.repartidores.map(function (n) { return '<option' + (p.asignadoA === n ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join('') + '</select></div>' : (p.asignadoA ? '<p class="sis-nota">Repartidor: ' + esc(p.asignadoA) + '</p>' : '')) +
      '<div class="acc">' +
      (p.estado === 'recibido' ? '<select data-prep aria-label="Tiempo estimado" class="btn-s">' + [10, 15, 20, 25, 30, 40, 45, 60].map(function (x) { return '<option value="' + x + '"' + (Math.abs(x - p.prepMin) < 3 ? ' selected' : '') + '>' + x + ' min</option>'; }).join('') + '</select><button class="btn-s prim" type="button" data-aceptar>Aceptar</button><button class="btn-s peligro" type="button" data-rechazar>Rechazar</button>' : '') +
      (activo && p.estado !== 'recibido' ? '<button class="btn-s peligro" type="button" data-rechazar>Cancelar pedido</button>' : '') +
      (!p.pago.pagado && activo && p.estado !== 'recibido' ? '<button class="btn-s" type="button" data-pagado>Marcar cobrado</button>' : '') + '</div>' +
      historialHtml(p) + '</article>';
  }
  function pintarPedidos() {
    var l = P.todos().filter(pasa).sort(function (a, b) { return filtro === 'terminados' || filtro === 'todos' ? b.creado - a.creado : a.creado - b.creado; });
    var el = vista.querySelector('[data-lista]'); if (!el) return;
    var foco = document.activeElement && document.activeElement.matches && document.activeElement.matches('select'); if (foco) return;   // no se pisa una selección en curso
    el.innerHTML = l.length ? l.slice(0, 120).map(cardPedido).join('') : '<p class="sis-nota">' + (filtro === 'nuevos' ? 'No hay pedidos nuevos por aceptar. Cuando llegue uno, suena un aviso y aparece aquí.' : 'No hay pedidos en esta vista.') + '</p>';
    var n = P.todos().filter(function (p) { return p.estado === 'recibido'; }).length;
    vista.querySelector('[data-resumen]').textContent = P.todos().filter(function (p) { return P.ACTIVOS.indexOf(p.estado) > -1; }).length + ' pedidos activos · ' + n + ' por aceptar';
  }
  Panel.registrar({
    id: 'pedidos', titulo: 'Pedidos', insignia: true,
    pintar: function (cont) {
      cont.innerHTML = '<div class="filtros" role="group" aria-label="Filtrar pedidos">' + FILTROS.map(function (f) { return '<button class="btn-s" type="button" data-filtro="' + f[0] + '" aria-pressed="' + (f[0] === filtro) + '">' + f[1] + '</button>'; }).join('') + '</div><p class="sis-nota" data-resumen style="margin-top:8px"></p><div class="pedidos-lista" data-lista></div>';
      cont.onclick = function (e) {
        var f = e.target.closest('[data-filtro]'); if (f) { filtro = f.dataset.filtro; [].forEach.call(cont.querySelectorAll('[data-filtro]'), function (b) { b.setAttribute('aria-pressed', String(b === f)); }); pintarPedidos(); return; }
        var card = e.target.closest('[data-id]'); if (!card) return; var id = card.dataset.id, p = P.obtener(id); if (!p) return;
        if (e.target.closest('[data-aceptar]')) {
          if (P.modificandoAhora(p) && !confirm('El cliente está modificando este pedido. Si lo aceptas ahora, sus cambios no se guardarán. ¿Aceptar igual?')) return;
          var s = card.querySelector('[data-prep]'); P.aceptar(id, s ? +s.value : p.prepMin);
        }
        if (e.target.closest('[data-rechazar]')) { var m = prompt('Motivo para el cliente (por ejemplo: sin stock de un producto):', p.estado === 'recibido' ? 'Sin stock de un producto' : 'No podemos preparar el pedido'); if (m !== null) P.rechazar(id, m.trim() || 'El local no pudo atender el pedido'); }
        if (e.target.closest('[data-pagado]')) P.marcarPagado(id, true);
      };
      cont.onchange = function (e) { var a = e.target.closest('[data-asignar]'); if (a) { var id = a.closest('[data-id]').dataset.id; P.asignar(id, a.value); Panel.toast(a.value ? 'Pedido asignado a ' + a.value + '.' : 'El pedido quedó libre para cualquier repartidor.'); } };
      pintarPedidos();
    },
    alEvento: function () { pintarPedidos(); }, reloj: function () { pintarPedidos(); }
  });

  // ======================= Estadísticas =======================
  function desdeDia() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() - (dias - 1) * 864e5; }
  function contar(arr, f) { var o = {}; arr.forEach(function (x) { var k = f(x); if (k) o[k] = (o[k] || 0) + (x._n || 1); }); return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }); }
  function barras(pares, fmt) {
    var max = Math.max.apply(null, pares.map(function (x) { return x[1]; }).concat([1]));
    return '<div class="barras" role="img" aria-label="' + esc(pares.map(function (x) { return x[0] + ': ' + (fmt ? fmt(x[1]) : x[1]); }).join(', ')) + '">' + pares.map(function (x) { return '<div title="' + esc(x[0] + ': ' + (fmt ? fmt(x[1]) : x[1])) + '"><i style="height:' + (x[1] / max * 82) + '%"></i><small>' + esc(x[0]) + '</small></div>'; }).join('') + '</div>';
  }
  function lista(pares, fmt, vacio, colores) {
    if (!pares.length) return '<p class="sis-nota">' + (vacio || 'Sin datos todavía.') + '</p>';
    var max = Math.max.apply(null, pares.map(function (x) { return x[1]; }).concat([1]));
    return '<ul class="lista-p">' + pares.slice(0, 10).map(function (x) { return '<li><span>' + esc(x[0]) + '</span><b>' + (fmt ? fmt(x[1]) : x[1]) + '</b><span class="bar"><i style="width:' + (x[1] / max * 100) + '%' + (colores && colores[x[0]] ? ';background:' + colores[x[0]] : '') + '"></i></span></li>'; }).join('') + '</ul>';
  }
  var prom = function (a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; };
  function pintarStats(cont) {
    var t0 = desdeDia(), todos = P.todos(), vis = P.visitas().filter(function (v) { return v.t >= t0; });
    var ped = todos.filter(function (p) { return p.creado >= t0; }), validos = ped.filter(function (p) { return p.estado !== 'cancelado'; });
    var pagados = validos.filter(function (p) { return p.pago.pagado; }), ventas = pagados.reduce(function (s, p) { return s + p.total; }, 0);
    var tiempos = validos.map(function (p) { var a = P.cuando(p, 'preparacion') || P.cuando(p, 'aceptado'), b = P.cuando(p, 'listo'); return a && b ? (b - a) / 60000 : null; }).filter(function (x) { return x != null; });
    var ops = validos.filter(function (p) { return p.opinion; }), notas = ops.map(function (p) { return p.opinion.estrellas; });
    var recom = ops.filter(function (p) { return p.opinion.recomendaria != null; }), si = recom.filter(function (p) { return p.opinion.recomendaria; }).length;
    var kp = [['Pedidos recibidos', ped.length, (vis.length ? Math.round(ped.length / vis.length * 100) : 0) + ' % de las visitas'], ['Ventas', clp(ventas), pagados.length + ' pedidos pagados'], ['Valor promedio por pedido', clp(pagados.length ? ventas / pagados.length : 0), 'por pedido pagado'],
      ['Visitas a la carta', vis.length, 'personas que la abrieron'], ['Cancelados o rechazados', ped.length - validos.length, ped.length ? Math.round((ped.length - validos.length) / ped.length * 100) + ' % de los pedidos' : '—'], ['Tiempo de cocina', tiempos.length ? Math.round(prom(tiempos)) + ' min' : '—', 'promedio hasta "listo"'],
      ['Nota promedio', notas.length ? prom(notas).toFixed(1) + ' ★' : '—', notas.length + ' opiniones'], ['Recomendarían', recom.length ? Math.round(si / recom.length * 100) + ' %' : '—', validos.filter(function (p) { return p.invitadoPor; }).length + ' pedidos llegaron por invitación']];
    var porDia = [], dd = Math.min(dias, 30); for (var d = 0; d < dd; d++) { var ini = t0 + d * 864e5, fin = ini + 864e5, delDia = pagados.filter(function (p) { return p.creado >= ini && p.creado < fin; }); porDia.push({ ini: ini, etq: new Date(ini).toLocaleDateString('es-CL', dias > 7 ? { day: 'numeric' } : { weekday: 'short' }), ventas: delDia.reduce(function (s, p) { return s + p.total; }, 0), n: validos.filter(function (p) { return p.creado >= ini && p.creado < fin; }).length }); }
    var porHora = []; for (var h = 8; h <= 23; h++) porHora.push([String(h), validos.filter(function (p) { return new Date(p.creado).getHours() === h; }).length]);
    var items = []; validos.forEach(function (p) { p.items.forEach(function (i) { items.push({ n: i.nombre, id: i.id, _n: i.cant }); }); });
    var mas = contar(items, function (x) { return x.n; });
    var vendidos = {}; items.forEach(function (x) { vendidos[x.id] = (vendidos[x.id] || 0) + x._n; });
    var menos = (C.modelo() ? C.platos() : []).map(function (p) { return [p.nombre, vendidos[p.id] || 0]; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, 8);
    var estados = Object.keys(P.ESTADOS).map(function (e) { return [P.ESTADOS[e].nombre && typeof P.ESTADOS[e].nombre === 'string' ? P.ESTADOS[e].nombre : (e === 'listo' ? 'Listo' : 'Entregado / servido'), ped.filter(function (p) { return p.estado === e; }).length, P.ESTADOS[e].color]; });
    var colEst = {}; estados.forEach(function (x) { colEst[x[0]] = x[2]; });
    var CANAL = { mesa: 'En la mesa', retiro: 'Para retirar', delivery: 'Delivery' };
    cont.innerHTML = '<div class="filtros" role="group" aria-label="Período">' + [[1, 'Hoy'], [7, '7 días'], [30, '30 días']].map(function (x) { return '<button class="btn-s" type="button" data-dias="' + x[0] + '" aria-pressed="' + (x[0] === dias) + '">' + x[1] + '</button>'; }).join('') + '<button class="btn-s" type="button" data-csv>Descargar CSV</button></div>' +
      (!ped.length ? '<p class="sis-nota" style="margin-top:12px">Todavía no hay pedidos en este período. Las cifras se calculan con los pedidos reales: aquí no se muestra nada de relleno.</p>' : '') +
      '<div class="kpis">' + kp.map(function (k) { return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>'; }).join('') + '</div><div class="grid-p">' +
      '<section class="caja"><h2>Evolución de las ventas</h2>' + barras(porDia.map(function (x) { return [x.etq, x.ventas]; }), clp) + '</section>' +
      '<section class="caja"><h2>Pedidos por hora</h2>' + barras(porHora) + '</section>' +
      '<section class="caja"><h2>Productos más pedidos</h2>' + lista(mas, function (n) { return n + ' u.'; }, 'Sin pedidos todavía.') + '</section>' +
      '<section class="caja"><h2>Productos con menos demanda</h2>' + lista(menos.map(function (x) { return [x[0], x[1]]; }), function (n) { return n + ' u.'; }, 'Aún no hay carta publicada.') + '</section>' +
      '<section class="caja"><h2>Pedidos según su estado</h2>' + lista(estados.filter(function (x) { return x[1]; }).map(function (x) { return [x[0], x[1]]; }), function (n) { return n + ' pedidos'; }, 'Sin pedidos.', colEst) + '</section>' +
      '<section class="caja"><h2>Cómo piden</h2>' + lista(contar(validos, function (p) { return CANAL[p.tipo]; }), function (n) { return n + ' pedidos'; }) + '</section>' +
      '<section class="caja"><h2>De dónde llegan a la carta</h2>' + lista(contar(vis, function (v) { return v.origen; }), function (n) { return n + ' visitas'; }) + '</section>' +
      '<section class="caja"><h2>Cómo nos conocieron</h2>' + lista(contar(validos, function (p) { return p.referencia; }), function (n) { return n + ' clientes'; }, 'Aún nadie respondió.') + '</section>' +
      '<section class="caja" style="grid-column:1/-1"><h2>Historial de ventas por día</h2><div class="scroll-x"><table class="tabla-p"><thead><tr><th>Día</th><th>Pedidos</th><th>Ventas cobradas</th><th>Valor promedio</th></tr></thead><tbody>' +
        (porDia.slice().reverse().map(function (x) { return '<tr><td>' + new Date(x.ini).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) + '</td><td>' + x.n + '</td><td>' + clp(x.ventas) + '</td><td>' + (x.n ? clp(x.ventas / x.n) : '—') + '</td></tr>'; }).join('')) + '</tbody></table></div></section></div>';
    cont.onclick = function (e) {
      var b = e.target.closest('[data-dias]'); if (b) { dias = +b.dataset.dias; pintarStats(cont); return; }
      if (e.target.closest('[data-csv]')) {
        var f = [['codigo', 'fecha', 'tipo', 'mesa', 'comuna', 'productos', 'subtotal', 'envio', 'total', 'estado', 'pagado', 'metodo_pago', 'referencia', 'estrellas', 'recomendaria', 'versiones']];
        P.todos().forEach(function (p) { f.push([p.codigo, new Date(p.creado).toISOString(), p.tipo, p.mesa || '', p.cliente.comuna || '', p.items.map(function (i) { return P.lineaTxt(i); }).join(' | '), p.subtotal, p.envio, p.total, p.estado, p.pago.pagado ? 'si' : 'no', p.pago.metodo, p.referencia || '', p.opinion ? p.opinion.estrellas : '', p.opinion && p.opinion.recomendaria != null ? (p.opinion.recomendaria ? 'si' : 'no') : '', p.rev || 1]); });
        // Celdas que empiezan con = + - @ se anteponen con ' para que una planilla no las ejecute como fórmula
        var csv = f.map(function (r) { return r.map(function (c) { c = String(c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'pedidos-' + R.negocio + '.csv'; a.click();
      }
    };
  }
  Panel.registrar({ id: 'estadisticas', titulo: 'Estadísticas', pintar: pintarStats, alEvento: function (cont) { if (!cont.querySelector(':focus')) pintarStats(cont); }, reloj: function (cont) { pintarStats(cont); }, alCarta: function (cont) { pintarStats(cont); } });

  // ======================= Opiniones =======================
  var soloSin = false;
  function pintarOpiniones(cont) {
    var l = P.todos().filter(function (p) { return p.opinion; }).sort(function (a, b) { return (b.opinion.t || 0) - (a.opinion.t || 0); });
    var sin = l.filter(function (p) { return !p.opinion.respuesta; }), notas = l.map(function (p) { return p.opinion.estrellas; });
    var mostrar = soloSin ? sin : l;
    var foco = document.activeElement && document.activeElement.matches && document.activeElement.matches('textarea'); if (foco && cont.querySelector('[data-lista-op]')) return;
    cont.innerHTML = '<div class="filtros" role="group"><button class="btn-s" type="button" data-todas aria-pressed="' + !soloSin + '">Todas (' + l.length + ')</button><button class="btn-s" type="button" data-sinresp aria-pressed="' + soloSin + '">Sin responder (' + sin.length + ')</button></div>' +
      '<p class="sis-nota" style="margin-top:8px">' + (l.length ? 'Nota promedio ' + prom(notas).toFixed(1) + ' ★ · ' + Math.round(l.filter(function (p) { return p.opinion.recomendaria; }).length / l.length * 100) + ' % nos recomendaría · ' + l.length + ' opiniones reales.' : 'Todavía no hay opiniones. Aparecen aquí cuando un cliente califica un pedido entregado.') + '</p>' +
      '<div class="pedidos-lista" data-lista-op>' + mostrar.map(function (p) {
        var o = p.opinion;
        return '<article class="opinion-card" data-id="' + esc(p.id) + '"><div class="cab" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>' + '★'.repeat(o.estrellas) + '<span style="color:var(--fg-3)">' + '★'.repeat(5 - o.estrellas) + '</span></b><span class="sis-nota">Pedido #' + esc(p.codigo) + ' · ' + esc(p.cliente.nombre) + ' · ' + P.fecha(o.t || p.creado) + '</span></div>' +
          (o.texto ? '<p>“' + esc(o.texto) + '”</p>' : '<p class="sis-nota">Sin comentario.</p>') + (o.recomendaria != null ? '<p class="sis-nota">' + (o.recomendaria ? 'Nos recomendaría' : 'No nos recomendaría') + '</p>' : '') +
          (o.respuesta ? '<div class="respuesta-op"><b>Tu respuesta:</b> ' + esc(o.respuesta.texto) + '</div><button class="btn-s" type="button" data-editar-resp>Editar respuesta</button>' : '') +
          '<form data-resp' + (o.respuesta ? ' hidden' : '') + ' style="display:grid;gap:6px"><label class="lbl" for="rp-' + esc(p.id) + '">Responder al cliente (lo ve en su pedido)</label><textarea id="rp-' + esc(p.id) + '" rows="2" maxlength="300" style="min-height:60px;padding:8px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);color:var(--fg);font:inherit">' + esc(o.respuesta ? o.respuesta.texto : '') + '</textarea><div><button class="btn-s prim" type="submit">Publicar respuesta</button></div></form></article>';
      }).join('') + '</div>';
    cont.onclick = function (e) {
      if (e.target.closest('[data-todas]')) { soloSin = false; pintarOpiniones(cont); } if (e.target.closest('[data-sinresp]')) { soloSin = true; pintarOpiniones(cont); }
      var ed = e.target.closest('[data-editar-resp]'); if (ed) { var art = ed.closest('article'); art.querySelector('[data-resp]').hidden = false; ed.hidden = true; art.querySelector('textarea').focus(); }
    };
    cont.onsubmit = function (e) { e.preventDefault(); var art = e.target.closest('[data-id]'), t = art.querySelector('textarea').value.trim(); if (!t) { Panel.toast('Escribe tu respuesta.', true); return; } P.responderOpinion(art.dataset.id, t); Panel.toast('Respuesta publicada.'); setTimeout(function () { pintarOpiniones(cont); }, 600); };
  }
  Panel.registrar({ id: 'opiniones', titulo: 'Opiniones', insignia: true, pintar: pintarOpiniones, alEvento: function (cont) { pintarOpiniones(cont); } });
})();
