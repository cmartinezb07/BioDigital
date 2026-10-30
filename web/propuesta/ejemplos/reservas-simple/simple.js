// Reserva simple de Bío Digital: el cliente elige qué, cuándo y deja sus datos; la página arma la SOLICITUD y la envía por WhatsApp al negocio, que confirma a mano.
// Sin base de datos ni mensualidad. Lo que el dueño cambia (precios, descripciones, servicios del mismo tipo, horario y horas ocupadas) vive en SU planilla
// de Google: cada pestaña publicada como CSV (simple.config.js → planilla). La planilla manda; si no carga, se usa el catálogo de simple.config.js.
// Usa el motor del sistema PRO (motor.js) solo en este navegador: calendario, horas posibles, motivos de cada día y precio con temporadas.
(function () {
  'use strict';
  var S = window.SIMPLE || { negocios: [] }, q = new URLSearchParams(location.search), app = document.getElementById('app');
  var yo = document.currentScript, MOTOR = (yo && yo.dataset.motor) || 'motor.js';
  var neg = S.negocios.filter(function (n) { return n.id === q.get('negocio'); })[0] || S.negocios[0];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); };
  var slug = function (s, usados) { var b = norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'item', id = b, n = 2; while (usados.indexOf(id) > -1) id = b + '-' + n++; usados.push(id); return id; };
  var avisos = [];   // filas de la planilla que no se entendieron (se ven con ?revisar=1, para el dueño o el equipo)
  var copia = function (x) { return JSON.parse(JSON.stringify(x)); };

  // ---------- Planilla de Google (CSV publicado) ----------
  function csv(t) {
    var filas = [], f = [], v = '', dentro = false;
    t = String(t || '').replace(/^﻿/, '');
    for (var i = 0; i < t.length; i++) {
      var ch = t[i];
      if (dentro) { if (ch === '"') { if (t[i + 1] === '"') { v += '"'; i++; } else dentro = false; } else v += ch; }
      else if (ch === '"') dentro = true;
      else if (ch === ',') { f.push(v); v = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; f.push(v); filas.push(f); f = []; v = ''; }
      else v += ch;
    }
    if (v !== '' || f.length) { f.push(v); filas.push(f); }
    if (!filas.length) return [];
    var cab = filas[0].map(norm);
    return filas.slice(1).filter(function (x) { return x.some(function (y) { return String(y).trim(); }); }).map(function (x, k) { var o = { _fila: k + 2 }; cab.forEach(function (c, i) { o[c] = String(x[i] || '').trim(); }); return o; });
  }
  var col = function (o) { var ks = [].slice.call(arguments, 1), k = Object.keys(o).filter(function (c) { return ks.some(function (p) { return c.indexOf(p) === 0; }); })[0]; return k ? o[k] : ''; };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var hoyS = function () { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  function fecha(s) {
    s = norm(s); var m;
    if ((m = /^hoy\s*\+\s*(\d{1,3})$/.exec(s))) { var d = new Date(); d.setDate(d.getDate() + +m[1]); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }   // solo para la demostración
    if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s))) return m[1] + '-' + pad(+m[2]) + '-' + pad(+m[3]);
    if ((m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(s))) return (m[3].length === 2 ? '20' + m[3] : m[3]) + '-' + pad(+m[2]) + '-' + pad(+m[1]);
    return null;
  }
  function hora(s) { var m = /^(\d{1,2})(?:[:.h](\d{2}))?\s*(?:hrs?|h)?$/i.exec(String(s || '').trim()); return m && +m[1] < 24 && +(m[2] || 0) < 60 ? +m[1] * 60 + +(m[2] || 0) : null; }
  var hm = function (m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  var numero = function (s) { var t = String(s || '').replace(/[$\s.]/g, '').replace(/,\d{1,2}$/, ''); return /^\d{1,8}$/.test(t) ? +t : null; };
  var activo = function (o) { var a = norm(col(o, 'activo', 'disponible')); return !/^(no|n|0|false)$/.test(a); };
  var DIAS = { lunes: 'lun', martes: 'mar', miercoles: 'mie', jueves: 'jue', viernes: 'vie', sabado: 'sab', domingo: 'dom', lun: 'lun', mar: 'mar', mie: 'mie', jue: 'jue', vie: 'vie', sab: 'sab', dom: 'dom' };

  // Solo se cambia lo del mismo tipo: en citas, la lista de servicios; en alojamiento, la de cabañas. El tipo de agenda (modo) no se toca desde la planilla.
  function aplicarCatalogo(c, filas) {
    var horas = c.modo === 'horas', base = horas ? c.servicios : c.recursos, usados = [], lista = [];
    filas.forEach(function (o) {
      var nombre = col(o, 'servicio', 'cabana', 'alojamiento', 'nombre').slice(0, 60), precio = numero(col(o, 'precio'));
      if (!nombre) return;
      if (precio == null) { avisos.push('Fila ' + o._fila + ' (' + nombre + '): falta el precio o no es un número. No se muestra.'); return; }
      if (!activo(o)) return;
      var previo = base.filter(function (x) { return norm(x.nombre) === norm(nombre); })[0];
      var x = previo ? copia(previo) : { id: '' };
      x.id = previo && usados.indexOf(previo.id) < 0 ? (usados.push(previo.id), previo.id) : slug(nombre, usados);
      x.nombre = nombre; x.precio = precio;
      var desc = col(o, 'descrip'); if (desc) x.desc = desc.slice(0, 200); else if (!previo) delete x.desc;
      if (horas) { var dur = numero(col(o, 'duracion', 'minutos')); x.duracion = dur && dur >= 5 && dur <= 720 ? dur : (x.duracion || 30); if (!dur) avisos.push('Fila ' + o._fila + ' (' + nombre + '): sin duración; se usan ' + x.duracion + ' minutos.'); }
      else { var cap = numero(col(o, 'personas', 'capacidad')), can = numero(col(o, 'cantidad', 'unidades')); x.capacidad = cap && cap > 0 ? cap : (x.capacidad || 2); x.unidades = can && can > 0 && can <= 50 ? can : (x.unidades || 1); }
      lista.push(x);
    });
    if (!lista.length) { avisos.push('La planilla no trae ningún ' + (horas ? 'servicio' : 'alojamiento') + ' válido: se usa el catálogo guardado.'); return; }
    if (horas) { c.servicios = lista; c.recursos.forEach(function (r) { r.servicios = lista.map(function (s) { return s.id; }); }); }
    else c.recursos = lista;
  }
  function aplicarHorario(c, filas) {
    var h = { lun: [], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [] }, alguno = false;
    filas.forEach(function (o) {
      var d = DIAS[norm(col(o, 'dia')).replace(/[^a-z]/g, '')], a = hora(col(o, 'abre', 'desde')), b = hora(col(o, 'cierra', 'hasta'));
      if (!d || a == null || b == null || b <= a) { avisos.push('Horario, fila ' + o._fila + ': escribe el día y las horas como "Lunes, 10:00, 14:00".'); return; }
      h[d].push([hm(a), hm(b)]); alguno = true;
    });
    if (alguno) c.horario = h;
  }
  // "Ocupado": lo que el dueño ya confirmó o cerró. Sin hora = el día completo (o, en cabañas, las noches de llegada a salida)
  function aplicarOcupado(c, filas) {
    var bl = [], oc = [], ms = function (f, min) { var p = f.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 0, min || 0).getTime(); };
    filas.forEach(function (o) {
      var d = fecha(col(o, 'desde', 'fecha', 'llegada')), h = fecha(col(o, 'hasta', 'salida')) || null, hd = hora(col(o, 'hora desde', 'hora inicio')), hh = hora(col(o, 'hora hasta', 'hora fin')), que = norm(col(o, 'que', 'cabana', 'servicio'));
      if (!d) { avisos.push('Ocupado, fila ' + o._fila + ': falta la fecha o no se entiende (usa 16-11-2026).'); return; }
      var a, b;
      if (c.modo === 'noches') { a = ms(d); b = h && h > d ? ms(h) : a + 864e5; }
      else if (hd != null) { a = ms(d, hd); b = hh != null && hh > hd ? ms(d, hh) : a + 60 * 6e4; }
      else { a = ms(d); b = ms(h && h >= d ? h : d) + 864e5; }
      var recs = c.recursos.filter(function (r) { return que && (norm(r.nombre) === que || norm(r.nombre).indexOf(que) > -1); });
      var todas = !recs.length;
      if (todas && que && c.modo === 'noches') { avisos.push('Ocupado, fila ' + o._fila + ': no hay una cabaña llamada "' + col(o, 'que', 'cabana') + '"; se cerraron todas esas fechas.'); }
      // con hora o con una cabaña nombrada = algo ya reservado ("Completo"); sin nada = el negocio cerró ("No disponible")
      var cierre = todas && (hd == null || c.modo === 'noches');
      (todas ? c.recursos : recs).forEach(function (r) { (cierre ? bl : oc).push({ id: 'p' + o._fila + r.id, estado: 'confirmada', recurso: r.id, desde: a, hasta: b, motivo: col(o, 'nota') || 'Ocupado', personas: 1, unidades: cierre || (todas && hd == null) ? r.unidades || 1 : 1 }); });
    });
    c.bloqueos = bl; c.ocupadas = oc;
  }
  function traer(url) {
    if (!url) return Promise.resolve(null);
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    return fetch(url, { cache: 'no-store', signal: ctl && ctl.signal }).then(function (r) { clearTimeout(t); return r.ok ? r.text() : null; }).catch(function () { clearTimeout(t); return null; });
  }

  // ---------- Google Calendar del dueño: de ahí salen las horas ocupadas (solo "libre/ocupado", nunca nombres ni detalles) ----------
  // simple.config.js → calendario: { id: 'correo@gmail.com', llave: 'AIza…' } (el calendario se comparte como "público: ver solo libre/ocupado"; la llave es de
  // Bío Digital, gratis y limitada a nuestros dominios). Cada cabaña o profesional puede tener su propio calendario (recurso.calendario); si no, usa el del negocio.
  // Una cita o evento de día completo en el calendario = esa hora o esos días ocupados. Se leen los próximos días en tramos de 30 (consulta freeBusy).
  var calEstado = { ok: true, leido: false };
  function traerCalendario(c) {
    var K = c.calendario || {}, ids = {}, dias = Math.min(c.politicas.maxDias || 180, 180), ini = new Date(); ini.setHours(0, 0, 0, 0);
    c.recursos.forEach(function (r) { var id = r.calendario || K.id; if (id) (ids[id] = ids[id] || []).push(r.id); });
    if (K.demo) {   // demostración: ocupados de ejemplo relativos a hoy ([días desde hoy, hora desde, hora hasta, recurso] ; sin horas = día completo)
      calEstado.leido = true;
      return Promise.resolve(K.demo.map(function (o) { var d = new Date(ini); d.setDate(d.getDate() + o[0]); var a = new Date(d), b; if (o[1]) { var p = o[1].split(':'), q = o[2].split(':'); a.setHours(+p[0], +p[1]); b = new Date(d); b.setHours(+q[0], +q[1]); } else { b = new Date(d); b.setDate(b.getDate() + (o[4] || 1)); } return { recursos: o[3] ? [o[3]] : c.recursos.map(function (r) { return r.id; }), desde: a.getTime(), hasta: b.getTime() }; }));
    }
    if (!Object.keys(ids).length || !K.llave) return Promise.resolve([]);
    var tramos = []; for (var k = 0; k < dias; k += 30) { var a = new Date(ini); a.setDate(a.getDate() + k); var b = new Date(ini); b.setDate(b.getDate() + Math.min(dias, k + 30) + 1); tramos.push([a, b]); }
    return Promise.all(tramos.map(function (t) {
      return fetch('https://www.googleapis.com/calendar/v3/freeBusy?key=' + encodeURIComponent(K.llave), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeMin: t[0].toISOString(), timeMax: t[1].toISOString(), items: Object.keys(ids).map(function (id) { return { id: id }; }) }) })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); });
    })).then(function (res) {
      var out = [];
      res.forEach(function (j) { Object.keys(j.calendars || {}).forEach(function (id) { var x = j.calendars[id]; if (x.errors && x.errors.length) { calEstado.ok = false; avisos.push('Calendario ' + id + ': ' + x.errors[0].reason + ' (¿está compartido como público, "ver solo libre/ocupado"?)'); } (x.busy || []).forEach(function (b) { out.push({ recursos: ids[id] || [], desde: Date.parse(b.start), hasta: Date.parse(b.end) }); }); }); });
      calEstado.leido = true; return out;
    }).catch(function (e) { calEstado.ok = false; avisos.push('No se pudo leer el Google Calendar (' + e + '). Se muestran todas las horas del horario; el negocio confirma.'); return []; });
  }

  // ---------- Arranque: planilla → configuración → motor → pantalla ----------
  if (!neg) { app.innerHTML = '<p class="wrap">Falta configurar la agenda.</p>'; return; }
  var cfg = copia(neg), P = cfg.planilla || {};
  cfg.politicas = Object.assign({ deposito: 0, anticipacionHoras: 0, maxDias: 365, cancelacion: [] }, cfg.politicas);
  cfg.promos = []; cfg.reglas = []; cfg.temporadas = cfg.temporadas || []; cfg.factorFinde = cfg.factorFinde || 1;
  Promise.all([traer(P.servicios), traer(P.horario), traer(P.ocupado)]).then(function (t) {
    if (P.servicios && t[0] == null) avisos.push('No se pudo leer la planilla de servicios: se usa el catálogo guardado.');
    if (t[0]) aplicarCatalogo(cfg, csv(t[0]));
    if (t[1] && cfg.modo === 'horas') aplicarHorario(cfg, csv(t[1]));
    cfg.bloqueos = []; cfg.ocupadas = []; if (t[2]) aplicarOcupado(cfg, csv(t[2]));
    return traerCalendario(cfg);
  }).then(function (busy) {
    // cada evento del calendario ocupa por completo el recurso (todas sus unidades) en ese rato
    busy.forEach(function (b, i) { b.recursos.forEach(function (rid) { var r = cfg.recursos.filter(function (x) { return x.id === rid; })[0]; if (r && b.hasta > b.desde) cfg.ocupadas.push({ id: 'gc' + i + rid, estado: 'confirmada', recurso: rid, desde: b.desde, hasta: b.hasta, personas: 1, unidades: r.unidades || 1 }); }); });
    if (cfg.calendario && !cfg.calendario.demo) cfg.politicas.maxDias = Math.min(cfg.politicas.maxDias || 180, 180);   // más allá no se leyó el calendario
    window.AGENDA = { negocio: 'simple-' + neg.id, sinCache: true, negocios: [cfg] };
    var s = document.createElement('script'); s.src = MOTOR; s.onload = iniciar; s.onerror = function () { app.innerHTML = '<p class="wrap">No se pudo cargar la agenda. Recarga la página.</p>'; }; document.body.appendChild(s);
  });

  function iniciar() {
    var R = window.Reservas, U = R.util, clp = U.clp, ID = cfg.id;
    var OFF = { pasado: 1, lejos: 1, cerrado: 1, lleno: 1, bloqueado: 1, corte: 1, min: 1 };
    var st = { paso: 1, sel: { personas: cfg.modo === 'noches' ? 2 : 1 }, lista: [], vista: null, motivo: null, cli: {}, resp: {} };
    var D = function () { return R.leer(ID); }, c = function () { return D().config; };
    var nombreSel = function () { var x = cfg.modo === 'horas' ? R.servicio(D(), st.sel.servicio) : R.recurso(D(), st.sel.recurso); return x ? x.nombre : ''; };
    var completa = function () { var s = st.sel; return cfg.modo === 'noches' ? !!(s.recurso && s.llegada && s.salida) : !!(s.servicio && s.fecha && s.min != null); };
    var cuando = function () { var s = st.sel; if (cfg.modo === 'noches') { var n = U.difDias(s.llegada, s.salida); return R.fechaHora(D(), { desde: U.fdate(s.llegada).getTime(), hasta: U.fdate(s.salida).getTime() }) + ' (' + n + (n === 1 ? ' noche' : ' noches') + ')'; } return R.fechaHora(D(), { desde: U.fdate(s.fecha, s.min).getTime() }); };
    // Varios servicios en una solicitud (corte + barba): se arma un servicio "combo" con la suma de duración y precio, que el motor agenda como una sola cita
    function armarCombo() {
      cfg.servicios = cfg.servicios.filter(function (x) { return x.id !== 'combo'; }); cfg.recursos.forEach(function (r) { r.servicios = (r.servicios || []).filter(function (x) { return x !== 'combo'; }); });
      st.sel.min = null;
      if (st.lista.length < 2) { st.sel.servicio = st.lista[0] || null; return; }
      var xs = st.lista.map(function (id) { return cfg.servicios.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
      cfg.servicios.push({ id: 'combo', nombre: xs.map(function (x) { return x.nombre; }).join(' + '), precio: xs.reduce(function (t, x) { return t + x.precio; }, 0), duracion: xs.reduce(function (t, x) { return t + (x.duracion || 30); }, 0) });
      cfg.recursos.forEach(function (r) { if (st.lista.every(function (id) { return (r.servicios || []).indexOf(id) > -1; })) r.servicios.push('combo'); });
      st.sel.servicio = 'combo';
    }
    document.documentElement.style.setProperty('--marca', cfg.color || '');
    if (q.get('widget') && window.parent !== window && window.ResizeObserver) new ResizeObserver(function () { parent.postMessage({ bdres: 'alto', alto: document.documentElement.scrollHeight }, '*'); }).observe(document.body);

    function pintar() {
      var cc = c(), mapa = cfg.mapa || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(cfg.direccion + ', ' + (cfg.comuna || ''));
      var negs = S.demo && S.negocios.length > 1 ? '<div class="negocios" role="group" aria-label="Negocio de ejemplo">' + S.negocios.map(function (n) { return '<a class="btn chico" href="?negocio=' + n.id + '" aria-pressed="' + (n.id === neg.id) + '">' + R.icono(n.icono, 18) + esc(n.rubro) + '</a>'; }).join('') + '</div>' : '';
      var pasos = ['Qué', 'Cuándo', 'Tus datos', 'Enviar'];
      app.innerHTML = '<div class="wrap">' + negs + '<header class="cab"><div class="marca-n">' + R.logo(cc) + '<div><h1>' + esc(cc.nombre) + '</h1><p>' + esc(cc.rubro) + ' · ' + esc(cc.direccion) + '</p></div></div>' +
        '<p class="acciones-r" style="justify-content:flex-start;margin-top:8px"><a class="btn chico" href="' + esc(mapa) + '" target="_blank" rel="noopener">Cómo llegar</a><a class="btn chico" href="https://wa.me/' + esc(cfg.whatsapp) + '" target="_blank" rel="noopener">Escribir por WhatsApp</a></p></header>' +
        '<div class="motor"><div><ol class="pasos-r">' + pasos.map(function (n, i) { return '<li class="' + (i + 1 < st.paso ? 'hecho' : i + 1 === st.paso ? 'actual' : '') + '"' + (i + 1 === st.paso ? ' aria-current="step"' : '') + '>' + n + '</li>'; }).join('') + '</ol><div data-paso></div></div><aside class="resumen-lat caja" aria-label="Resumen"></aside></div>' +
        (q.get('revisar') && avisos.length ? '<details class="caja" open style="margin-top:14px"><summary><b>Revisión de la planilla</b> (' + avisos.length + ')</summary><ul class="nota">' + avisos.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></details>' : '') + '</div>';
      [paso1, paso2, paso3, paso4][st.paso - 1](app.querySelector('[data-paso]'), cc);
      resumen(cc);
    }
    function paso1(p, cc) {
      var noches = cfg.modo === 'noches', lista = noches ? cc.recursos : cc.servicios.filter(function (x) { return x.id !== 'combo'; }), k = noches ? 'recurso' : 'servicio';
      p.innerHTML = '<section class="caja"><h2>' + (noches ? '¿Dónde quieres quedarte?' : '¿Qué quieres reservar?') + '</h2>' + (noches ? '' : '<p class="nota" style="margin:-4px 0 10px">Puedes elegir más de uno: se agendan seguidos.</p>') + '<div class="opciones-r">' + lista.map(function (x) {
        return '<button type="button" class="opcion" data-elige="' + esc(x.id) + '" aria-pressed="' + (noches ? st.sel[k] === x.id : st.lista.indexOf(x.id) > -1) + '"><b>' + esc(x.nombre) + '</b><span class="p">' + clp(x.precio) + (noches ? ' / noche' : '') + '</span><small>' + esc(noches ? 'hasta ' + x.capacidad + ' personas' : x.duracion + ' min') + '</small>' + (x.desc ? '<small>' + esc(x.desc) + '</small>' : '') + '</button>';
      }).join('') + '</div>' + (noches ? '<div class="fila-ctl"><span>Personas</span><div class="contador"><button type="button" data-pers="-1" aria-label="Menos">−</button><span>' + st.sel.personas + '</span><button type="button" data-pers="1" aria-label="Más">+</button></div></div>' : '') +
        '<p class="err" role="alert"></p><div class="acciones-r"><span></span><button class="btn prim" type="button" data-sig>Continuar</button></div></section>';
    }
    function paso2(p, cc) {
      var noches = cfg.modo === 'noches', hoy = U.hoy();
      if (!st.vista) { var f0 = U.fdate(st.sel.llegada || st.sel.fecha || hoy); st.vista = { y: f0.getFullYear(), m: f0.getMonth() }; }
      var est = R.mes(D(), st.sel, st.vista.y, st.vista.m), nom = new Date(st.vista.y, st.vista.m, 1).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
      var primero = (new Date(st.vista.y, st.vista.m, 1).getDay() + 6) % 7, celdas = '';
      for (var i = 0; i < primero; i++) celdas += '<span></span>';
      Object.keys(est).forEach(function (f) {
        var e = est[f], cls = [e.estado];
        if (f === hoy) cls.push('hoy');
        if (noches) { if (f === st.sel.llegada || f === st.sel.salida) cls.push('borde'); else if (st.sel.llegada && st.sel.salida && f > st.sel.llegada && f < st.sel.salida) cls.push('rango'); } else if (f === st.sel.fecha) cls.push('sel');
        if (st.motivo && st.motivo.f === f) cls.push('elegido-off');
        celdas += '<button type="button" class="' + cls.join(' ') + '" data-f="' + f + '"' + (OFF[e.estado] ? ' aria-disabled="true"' : '') + ' title="' + esc(e.motivo || '') + '" aria-label="' + esc(f + ' · ' + (e.motivo || e.estado)) + '">' + (+f.slice(8)) + '<i aria-hidden="true"></i></button>';
      });
      var html = '<section class="caja"><h2>¿Cuándo?</h2><p class="nota" style="margin-bottom:10px">' + (noches ? (!st.sel.llegada || st.sel.salida ? 'Elige el día de llegada' : 'Ahora elige el día de salida') : 'Elige un día') + '</p>' +
        '<div class="cal-cab"><button class="btn chico" type="button" data-mes="-1" aria-label="Mes anterior">‹</button><b>' + nom + '</b><button class="btn chico" type="button" data-mes="1" aria-label="Mes siguiente">›</button></div>' +
        '<div class="cal">' + ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'].map(function (x) { return '<span class="dn">' + x + '</span>'; }).join('') + celdas + '</div>' +
        '<p class="leyenda"><span style="--c:var(--ok)">Disponible</span><span style="--c:var(--pocos)">' + (noches ? 'Quedan pocas' : 'Quedan pocas horas') + '</span><span style="--c:var(--lleno)">Ocupado</span><span style="--c:transparent">Toca un día gris para saber por qué</span></p>';
      html += calEstado.leido && calEstado.ok ? '<p class="nota" style="margin-top:6px">✓ Horas revisadas con la agenda del negocio.</p>' : cfg.calendario && !calEstado.ok ? '<p class="nota" style="margin-top:6px">No pudimos revisar la agenda del negocio en este momento: te confirma por WhatsApp.</p>' : '';
      if (st.motivo) html += '<div class="motivo-dia" role="status"><span><b>' + esc(U.fdate(st.motivo.f).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })) + ':</b> ' + esc(st.motivo.texto) + '</span></div>';
      if (!noches && st.sel.fecha) {
        var hs = R.horas(D(), st.sel);
        html += '<p class="nota" style="margin-top:12px">Elige una hora</p><div class="horas-r">' + (hs.length ? hs.map(function (h) { return '<button type="button" data-min="' + h.min + '" aria-pressed="' + (st.sel.min === h.min) + '">' + h.hora + '</button>'; }).join('') : '<p class="nota">Ese día ya no quedan horas libres.</p>') + '</div>';
      }
      p.innerHTML = html + '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-atras>Atrás</button><button class="btn prim" type="button" data-sig>Continuar</button></div></section>';
    }
    function paso3(p, cc) {
      var campo = function (id, et, v, extra) { return '<div class="campo"><label for="' + id + '">' + et + '</label><input id="' + id + '" ' + (extra || '') + ' value="' + esc(v || '') + '"><small class="campo-err" role="alert"></small></div>'; };
      var propios = (cc.campos || []).map(function (cp) {
        var id = 'sc-' + cp.id, v = st.resp[cp.id] || '', et = esc(cp.etiqueta) + (cp.obligatorio ? '' : ' <small class="nota">(opcional)</small>');
        var ctl = cp.tipo === 'opciones' || cp.tipo === 'si' ? '<select id="' + id + '" data-resp="' + esc(cp.id) + '"><option value="">Elige…</option>' + (cp.tipo === 'si' ? ['Sí', 'No'] : cp.opciones || []).map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>' : '<input id="' + id + '" data-resp="' + esc(cp.id) + '"' + (cp.tipo === 'numero' ? ' inputmode="numeric" maxlength="6"' : ' maxlength="200"') + ' value="' + esc(v) + '">';
        return '<div class="campo"><label for="' + id + '">' + et + '</label>' + ctl + '<small class="campo-err" role="alert"></small></div>';
      }).join('');
      p.innerHTML = '<form class="caja" novalidate data-form><h2>Tus datos</h2><div class="campos">' + campo('s-nombre', 'Nombre y apellido', st.cli.nombre, 'autocomplete="name" maxlength="60"') + campo('s-tel', 'Celular (WhatsApp)', st.cli.telefono, 'type="tel" autocomplete="tel" maxlength="20" placeholder="+56 9 1234 5678"') + propios + '</div>' +
        '<p class="nota" style="margin-top:12px">Al continuar se arma tu <b>solicitud</b> para enviarla por WhatsApp. <b>Todavía no es una reserva:</b> ' + esc(cc.nombre) + ' revisa si está disponible y te confirma por WhatsApp.</p>' +
        '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-atras>Atrás</button><button class="btn prim" type="submit">Continuar</button></div></form>';
    }
    function mensaje(cc) {
      var pr = R.precio(D(), st.sel), l = ['Hola, quiero solicitar una reserva en ' + cc.nombre + ':', '• ' + nombreSel(), '• ' + cuando()];
      if (cfg.modo === 'noches') l.push('• Personas: ' + st.sel.personas);
      l.push('• Total estimado: ' + clp(pr.total), '', 'Nombre: ' + st.cli.nombre, 'Celular: ' + st.cli.telefono);
      (cc.campos || []).forEach(function (cp) { if (st.resp[cp.id]) l.push(cp.etiqueta.replace(/[¿?]/g, '') + ': ' + st.resp[cp.id]); });
      l.push('', '¿Me confirman si está disponible?');
      l.push('', 'Para el negocio (agendar y confirmar en 2 toques): ' + enlaceGestion());
      return l.join('\n');
    }
    // Todo lo de la solicitud va en el enlace (después de #, no llega a ningún servidor): así el negocio la abre sin base de datos
    function enlaceGestion() {
      var s = st.sel, x = { v: 1, q: nombreSel(), n: st.cli.nombre, t: st.cli.telefono, r: {} };
      if (cfg.modo === 'noches') { x.l = s.llegada; x.s = s.salida; x.p = s.personas; x.rec = s.recurso; } else { x.f = s.fecha; x.m = s.min; x.d = (R.servicio(D(), s.servicio) || {}).duracion || 30; x.svc = s.servicio === 'combo' ? st.lista.slice() : [s.servicio]; }
      x.tot = R.precio(D(), s).total;
      (cfg.campos || []).forEach(function (cp) { if (st.resp[cp.id]) x.r[cp.etiqueta.replace(/[¿?]/g, '')] = st.resp[cp.id]; });
      var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(x)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return location.origin + location.pathname + '?negocio=' + neg.id + '#g=' + b64;
    }
    function paso4(p, cc) {
      var url = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(mensaje(cc));
      p.innerHTML = '<section class="caja ok-hero"><h2 style="font-size:22px">Tu solicitud está lista</h2><p>' + esc(nombreSel()) + ' · ' + esc(cuando()) + '</p>' +
        '<p class="aviso-grande info" style="text-align:left"><span><b>Falta un paso:</b> envíala por WhatsApp. <b>Es una solicitud, no una reserva confirmada:</b> ' + esc(cc.nombre) + ' revisa la disponibilidad y te responde por WhatsApp.</span></p>' +
        '<p><a class="btn prim" style="font-size:17px;padding:14px 22px" href="' + esc(url) + '" target="_blank" rel="noopener" data-enviar>Enviar solicitud por WhatsApp</a></p>' +
        '<p class="nota">Se abre WhatsApp con el mensaje ya escrito: solo toca enviar.</p><p><button class="btn chico" type="button" data-atras>Cambiar algo</button> <button class="btn chico" type="button" data-otra>Hacer otra solicitud</button></p></section>';
    }
    function resumen(cc) {
      var box = app.querySelector('.resumen-lat');
      if (!completa()) { box.innerHTML = '<h2>Resumen</h2><p class="nota">' + (st.paso === 1 ? 'Elige qué quieres reservar.' : 'Elige ' + (cfg.modo === 'noches' ? 'las fechas.' : 'el día y la hora.')) + '</p>'; return; }
      var pr = R.precio(D(), st.sel);
      box.innerHTML = '<h2>Resumen</h2>' + pr.lineas.map(function (l) { return '<div class="fila"><span>' + esc(l[0]) + '</span><span>' + clp(l[1]) + '</span></div>'; }).join('') + '<div class="fila total"><span>Total estimado</span><span>' + clp(pr.total) + '</span></div><p class="nota" style="margin-top:8px">' + esc(cuando()) + '</p><p class="nota">El negocio confirma el precio final al responderte.</p>';
    }
    function recordar() { var g = function (id) { var e = app.querySelector('#' + id); return e ? e.value.trim() : ''; }; st.cli = { nombre: g('s-nombre'), telefono: g('s-tel') }; [].forEach.call(app.querySelectorAll('[data-resp]'), function (e) { st.resp[e.dataset.resp] = e.value.trim(); }); }

    app.addEventListener('click', function (e) {
      var x, noches = cfg.modo === 'noches';
      if ((x = e.target.closest('[data-elige]'))) { if (noches) st.sel.recurso = x.dataset.elige; else { var ix = st.lista.indexOf(x.dataset.elige); if (ix > -1) st.lista.splice(ix, 1); else st.lista.push(x.dataset.elige); armarCombo(); } st.sel.min = null; if (noches) { var r = R.recurso(D(), x.dataset.elige); st.sel.personas = Math.min(st.sel.personas, r.capacidad); } pintar(); }
      else if ((x = e.target.closest('[data-pers]'))) { var cap = st.sel.recurso ? R.recurso(D(), st.sel.recurso).capacidad : 20; st.sel.personas = Math.max(1, Math.min(cap, st.sel.personas + +x.dataset.pers)); pintar(); }
      else if ((x = e.target.closest('[data-mes]'))) { st.vista.m += +x.dataset.mes; if (st.vista.m < 0) { st.vista.m = 11; st.vista.y--; } if (st.vista.m > 11) { st.vista.m = 0; st.vista.y++; } st.motivo = null; pintar(); }
      else if ((x = e.target.closest('[data-f]'))) {
        var f = x.dataset.f;
        if (x.getAttribute('aria-disabled')) { var ev = R.mes(D(), st.sel, +f.slice(0, 4), +f.slice(5, 7) - 1)[f] || {}; st.motivo = st.motivo && st.motivo.f === f ? null : { f: f, texto: (ev.estado === 'lleno' && !noches ? 'Ya no quedan horas libres ese día.' : ev.motivo) || 'No disponible.' }; pintar(); return; }
        st.motivo = null;
        if (noches) { if (!st.sel.llegada || st.sel.salida || f <= st.sel.llegada) { st.sel.llegada = f; st.sel.salida = null; } else st.sel.salida = f; } else { st.sel.fecha = f; st.sel.min = null; }
        pintar();
      }
      else if ((x = e.target.closest('[data-min]'))) { st.sel.min = +x.dataset.min; pintar(); }
      else if (e.target.closest('[data-sig]')) {
        var err = st.paso === 1 ? (!(st.sel.recurso || st.sel.servicio) ? 'Elige una opción.' : '') : !completa() ? (noches ? 'Elige la llegada y la salida.' : 'Elige el día y la hora.') : R.validar(D(), st.sel);
        if (err) { app.querySelector('.err').textContent = err; return; }
        st.paso++; pintar(); app.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      else if (e.target.closest('[data-atras]')) { if (st.paso === 3) recordar(); st.paso--; pintar(); }
      else if (e.target.closest('[data-otra]')) { st = { paso: 1, sel: { personas: noches ? 2 : 1 }, lista: [], vista: null, motivo: null, cli: st.cli, resp: {} }; armarCombo(); pintar(); }
    });
    app.addEventListener('submit', function (e) {
      e.preventDefault(); recordar();
      var malos = [], tel = st.cli.telefono.replace(/[^\d+]/g, '');
      if (st.cli.nombre.length < 3) malos.push(['s-nombre', 'Escribe tu nombre y apellido.']);
      if (tel.replace(/\D/g, '').length < 8) malos.push(['s-tel', 'Escribe un celular válido, por ejemplo +56 9 1234 5678.']);
      (c().campos || []).forEach(function (cp) { var v = st.resp[cp.id] || ''; if ((cp.obligatorio && !v) || (cp.tipo === 'numero' && v && !/^\d{1,6}$/.test(v))) malos.push(['sc-' + cp.id, cp.tipo === 'numero' && v ? 'Escribe solo números.' : 'Completa este dato.']); });
      [].forEach.call(app.querySelectorAll('.campo.mal'), function (x) { x.classList.remove('mal'); x.querySelector('.campo-err').textContent = ''; });
      if (malos.length) { malos.forEach(function (m) { var cont = app.querySelector('#' + m[0]).closest('.campo'); cont.classList.add('mal'); cont.querySelector('.campo-err').textContent = m[1]; }); app.querySelector('.err').textContent = 'Revisa los campos marcados en rojo.'; app.querySelector('#' + malos[0][0]).focus(); return; }
      st.cli.telefono = tel; st.paso = 4; pintar(); app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // ---------- Pantalla del negocio: abre el enlace del WhatsApp y agenda, confirma, propone otra hora o rechaza ----------
    function gestion(x) {
      var cc = c(), noches = cfg.modo === 'noches', ini, fin, gcal, cuandoTxt;
      if (noches) { ini = U.fdate(x.l); fin = U.fdate(x.s); cuandoTxt = R.fechaHora(D(), { desde: ini.getTime(), hasta: fin.getTime() }); }
      else { ini = U.fdate(x.f, x.m); fin = new Date(ini.getTime() + x.d * 6e4); cuandoTxt = R.fechaHora(D(), { desde: ini.getTime() }); }
      var z = function (dt) { return dt.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; }, dia = function (f) { return f.replace(/-/g, ''); };
      var fechas = noches ? dia(x.l) + '/' + dia(x.s) : z(ini) + '/' + z(fin);
      var det = 'Cel ' + x.t + (noches ? ' · ' + x.p + ' personas' : '') + ' · ' + clp(x.tot) + Object.keys(x.r || {}).map(function (k) { return ' · ' + k + ': ' + x.r[k]; }).join('') + ' · Solicitud desde la página';
      gcal = function (titulo, d) { return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(titulo) + '&dates=' + fechas + '&details=' + encodeURIComponent(d) + '&location=' + encodeURIComponent(cc.direccion); };
      var mapa = cfg.mapa || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(cc.direccion + ', ' + (cc.comuna || ''));
      var wa = function (t) { return 'https://wa.me/' + String(x.t).replace(/\D/g, '') + '?text=' + encodeURIComponent(t); };
      var conf = 'Hola ' + x.n.split(' ')[0] + ', ¡te confirmo! ' + x.q + ' · ' + cuandoTxt + ' en ' + cc.nombre + '.\nDirección: ' + cc.direccion + ' · ' + mapa + '\nAgrégalo a tu calendario (te avisa antes): ' + gcal(x.q + ' · ' + cc.nombre, 'Reserva confirmada por WhatsApp. ' + cc.direccion) + '\n¡Te esperamos!';
      var otras = [];
      if (!noches && x.svc) { var s0 = x.svc.length === 1 ? x.svc[0] : null; if (s0) otras = R.horas(D(), { servicio: s0, fecha: x.f }).filter(function (h) { return h.min !== x.m; }).slice(0, 6); }
      var tomada = noches ? !!R.validar(D(), { recurso: x.rec, llegada: x.l, salida: x.s, personas: x.p }) : !!(x.svc && x.svc.length === 1 && R.servicio(D(), x.svc[0]) && !R.horas(D(), { servicio: x.svc[0], fecha: x.f }).some(function (h) { return h.min === x.m; }));
      app.innerHTML = '<div class="wrap" style="max-width:640px"><header class="cab"><div class="marca-n">' + R.logo(cc) + '<div><h1>Solicitud para ' + esc(cc.nombre) + '</h1><p>Para el negocio · nada de esto se guarda en internet</p></div></div></header>' +
        '<section class="caja"><h2>' + esc(x.n) + '</h2><p><b>' + esc(x.q) + '</b><br>' + esc(cuandoTxt) + (noches ? ' · ' + x.p + ' personas' : '') + '<br>Total estimado: ' + clp(x.tot) + '<br>Celular: ' + esc(x.t) + Object.keys(x.r || {}).map(function (k) { return '<br>' + esc(k) + ': ' + esc(x.r[k]); }).join('') + '</p>' +
        (tomada ? '<p class="aviso-grande" role="status" style="margin-top:10px"><span><b>Ojo:</b> en tu Google Calendar ya hay algo a esa hora. Revisa antes de confirmar.</span></p>' : '') + '</section>' +
        '<section class="caja"><h2>Si puedes</h2><ol style="margin:0;padding:0;list-style:none;display:grid;gap:12px"><li><a class="btn prim" href="' + esc(gcal(x.q + ' · ' + x.n, det)) + '" target="_blank" rel="noopener">1. Agendar en mi Google Calendar</a><br><small class="nota">Se abre con todo escrito: toca Guardar. Esa hora deja de ofrecerse en tu página.</small></li>' +
        '<li><a class="btn prim" href="' + esc(wa(conf)) + '" target="_blank" rel="noopener">2. Confirmar a ' + esc(x.n.split(' ')[0]) + ' por WhatsApp</a><br><small class="nota">Le llega la confirmación con la dirección y un botón para agregarlo a su calendario (le avisa antes).</small></li></ol></section>' +
        '<section class="caja"><h2>Si no puedes</h2>' + (otras.length ? '<p class="nota">Proponle otra hora ese mismo día:</p><div class="horas-r">' + otras.map(function (h) { return '<a class="btn chico" target="_blank" rel="noopener" href="' + esc(wa('Hola ' + x.n.split(' ')[0] + ', a las ' + U.hMin(x.m) + ' no me queda hora. ¿Te sirve a las ' + h.hora + ' el mismo día? ' + x.q + ' en ' + cc.nombre + '.')) + '">' + h.hora + '</a>'; }).join('') + '</div>' : '') +
        '<p style="margin-top:10px"><a class="btn" target="_blank" rel="noopener" href="' + esc(wa('Hola ' + x.n.split(' ')[0] + ', lo siento: ' + (noches ? 'esas fechas ya no están disponibles' : 'ese día no me quedan horas') + '. Puedes ver lo que sí queda libre aquí: ' + location.origin + location.pathname + '?negocio=' + neg.id)) + '">Avisar que no hay disponibilidad</a></p></section></div>';
    }
    var g = /^#g=([A-Za-z0-9_-]+)$/.exec(location.hash);
    if (g) { try { var gx = JSON.parse(decodeURIComponent(escape(atob(g[1].replace(/-/g, '+').replace(/_/g, '/'))))); if (gx && gx.n && gx.t && (gx.f || gx.l)) return gestion(gx); } catch (e) { /* enlace dañado: se muestra la página normal */ } }
    pintar();
  }
})();
