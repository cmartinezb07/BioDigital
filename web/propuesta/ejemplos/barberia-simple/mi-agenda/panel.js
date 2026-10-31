// Mi agenda: panel del dueño. Lee su Google Calendar (solo lectura) y muestra el día. Sin servidor.
// Todo lo que viene de Google se escribe con textContent. El token vive solo en memoria.
(function () {
  'use strict';
  var C = Object.assign({}, window.MI_AGENDA_BASE || {}, window.MI_AGENDA || {});
  var params = new URLSearchParams(location.search);
  var DEMO = !C.clientId || params.get('demo') === '1';
  var SCOPE = 'https://www.googleapis.com/auth/calendar.events.readonly';
  var $ = function (id) { return document.getElementById(id); };
  var token = null, tokenClient = null, dia = nuevoDia(1), cargando = false;

  function nuevoDia(delta) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + delta); return d; }
  function z(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(d) { return z(d.getHours()) + ':' + z(d.getMinutes()); }
  function iso(d) { return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  function mismoDia(a, b) { return iso(a) === iso(b); }
  function minutos(txt) { var p = txt.split(':'); return +p[0] * 60 + +p[1]; }
  function duracion(min) { min = Math.max(0, Math.round(min)); var h = Math.floor(min / 60), m = min % 60; return h ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min'; }
  function estado(txt, error) { var e = $('estado'); e.textContent = txt || ''; e.className = 'estado' + (error ? ' error' : ''); }

  // ---------- Interpretar el evento: título "Servicio · Nombre", descripción "Cel … · $ · …barbero…: X · …" ----------
  function interpretar(ev) {
    var titulo = String(ev.summary || '').trim(), desc = String(ev.description || '');
    var partes = titulo.split(' · ');
    var cel = /Cel\s+(\+?[\d][\d\s()\-]{6,})/i.exec(desc);
    var barb = /barbero[^:·]*:\s*([^·\n]+)/i.exec(desc);
    var ok = partes.length >= 2 && !!cel;
    return { ok: ok, servicio: ok ? partes[0] : titulo, nombre: ok ? partes.slice(1).join(' · ') : '', celular: cel ? cel[1].trim() : '', barbero: barb ? barb[1].trim() : '', titulo: titulo };
  }
  function waNumero(cel) {
    var d = String(cel).replace(/\D/g, '');
    if (d.length === 9 && d.charAt(0) === '9') d = '56' + d;
    else if (d.length === 8) d = '569' + d;
    return d;
  }
  function recordatorio(i, inicio) {
    var cuando = mismoDia(dia, nuevoDia(0)) ? 'hoy' : mismoDia(dia, nuevoDia(1)) ? 'mañana' : 'el ' + dia.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    return 'Hola ' + i.nombre.split(' ')[0] + ', te recuerdo tu hora en ' + (C.negocio || 'la barbería') + ' ' + cuando + ' a las ' + hhmm(inicio) + ' (' + i.servicio + '). ¡Te esperamos! Si no puedes venir, avísame por aquí.';
  }

  // ---------- Modo demostración ----------
  function citasDemo(d) {
    var lista = [['Fade', 'Matías Rojas', '+56 9 8765 4321', 'Cuervo', '10:00', 45], ['Corte + barba', 'Felipe Soto', '+56 9 7654 3210', 'Tiburón', '11:30', 60], ['Barba a navaja', 'Diego Pérez', '+56 9 6543 2109', 'Sin preferencia', '16:00', 30], ['Corte niño', 'Tomás Vega', '+56 9 5432 1098', 'Cuervo', '17:15', 30], ['Corte clásico', 'Javier Núñez', '+56 9 4321 0987', 'Tiburón', '18:30', 40]];
    return lista.map(function (x) {
      var p = x[4].split(':'), a = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +p[0], +p[1]), b = new Date(a.getTime() + x[5] * 6e4);
      return { summary: x[0] + ' · ' + x[1], description: 'Cel ' + x[2] + ' · $12.000 · ¿Con qué barbero te quieres cortar?: ' + x[3] + ' · Solicitud desde la página', start: { dateTime: a.toISOString() }, end: { dateTime: b.toISOString() } };
    });
  }

  // ---------- Modo real: Google Identity Services + API REST ----------
  function cargarGIS() {
    return new Promise(function (ok, mal) {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) return ok();
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () { ok(); };
      s.onerror = function () { mal(new Error('gis')); };
      document.head.appendChild(s);
    });
  }
  function iniciarGIS() {
    return cargarGIS().then(function () {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: C.clientId, scope: SCOPE,
        callback: function (r) {
          if (r && r.access_token) { token = r.access_token; $('sesion').hidden = true; cargar(); }
          else { sesion('No se pudo entrar con Google' + (r && r.error ? ' (' + r.error + ')' : '') + '. Inténtalo de nuevo.'); }
        },
        error_callback: function () { sesion('No se completó el ingreso con Google. Inténtalo de nuevo.'); }
      });
    });
  }
  function sesion(msg) { token = null; $('sesion-msg').textContent = msg; $('sesion').hidden = false; estado(''); mostrar([], false); }
  function pedirToken() { if (tokenClient) tokenClient.requestAccessToken(); else estado('Google todavía no carga. Revisa tu internet y recarga la página.', true); }

  function leerEventos(d) {
    var ini = new Date(d.getTime()), fin = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    var url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(C.calendarId || 'primary') + '/events?singleEvents=true&orderBy=startTime&maxResults=100&timeMin=' + encodeURIComponent(ini.toISOString()) + '&timeMax=' + encodeURIComponent(fin.toISOString());
    return fetch(url, { headers: { Authorization: 'Bearer ' + token } }).then(function (r) {
      if (r.status === 401) { var e = new Error('401'); e.codigo = 401; throw e; }
      if (r.status === 403) { var e3 = new Error('403'); e3.codigo = 403; throw e3; }
      if (r.status === 404) { var e4 = new Error('404'); e4.codigo = 404; throw e4; }
      if (!r.ok) { var e5 = new Error('http'); e5.codigo = r.status; throw e5; }
      return r.json();
    }).then(function (j) { return j.items || []; });
  }

  // ---------- Pantalla ----------
  function cargar() {
    if (cargando) return;
    var d = new Date(dia.getTime());
    titulo();
    var btn = $('actualizar');
    if (!DEMO && !token) { sesion('Entra con tu cuenta de Google para ver tu agenda.'); return; }
    cargando = true; btn.disabled = true; estado('Actualizando…');
    var p = DEMO ? Promise.resolve(citasDemo(d)) : leerEventos(d);
    p.then(function (evs) { if (mismoDia(d, dia)) { mostrar(evs, true); estado('Actualizado a las ' + hhmm(new Date()) + '.'); } })
      .catch(function (e) {
        if (e && e.codigo === 401) sesion('Tu sesión de Google venció. Vuelve a entrar para ver tu agenda.');
        else if (e && e.codigo === 403) { estado('Google no dio permiso para leer este calendario. Entra con la cuenta del negocio y acepta el permiso de ver eventos (o pide que te agreguen como usuario de prueba).', true); mostrar([], false); }
        else if (e && e.codigo === 404) { estado('No encontré ese calendario. Revisa el correo (calendarId) en la configuración.', true); mostrar([], false); }
        else if (e && e.codigo) { estado('Google respondió con un error (' + e.codigo + '). Inténtalo en unos minutos.', true); mostrar([], false); }
        else { estado('Sin conexión a internet. Revisa tu señal y toca Actualizar.', true); mostrar([], false); }
      })
      .then(function () { cargando = false; btn.disabled = false; });
  }
  function titulo() {
    var t = dia.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    $('titulo-dia').textContent = (mismoDia(dia, nuevoDia(0)) ? 'Hoy · ' : mismoDia(dia, nuevoDia(1)) ? 'Mañana · ' : '') + t;
    document.querySelector('[data-dia="hoy"]').setAttribute('aria-pressed', String(mismoDia(dia, nuevoDia(0))));
    document.querySelector('[data-dia="manana"]').setAttribute('aria-pressed', String(mismoDia(dia, nuevoDia(1))));
  }
  function mostrar(evs, valido) {
    var ul = $('lista'); ul.textContent = '';
    var con = evs.filter(function (e) { return e.start && e.start.dateTime && e.status !== 'cancelled'; })
      .map(function (e) { return { ev: e, ini: new Date(e.start.dateTime), fin: new Date((e.end && e.end.dateTime) || e.start.dateTime) }; })
      .sort(function (a, b) { return a.ini - b.ini; });
    var vacio = $('vacio'), res = $('resumen');
    if (!valido) { res.hidden = true; vacio.hidden = true; return; }
    if (!con.length) {
      res.hidden = true; vacio.hidden = false;
      vacio.textContent = (mismoDia(dia, nuevoDia(1)) ? 'Mañana' : mismoDia(dia, nuevoDia(0)) ? 'Hoy' : 'Ese día') + ' no tienes clientes agendados. ¡Día libre!';
      return;
    }
    vacio.hidden = true; res.hidden = false;
    $('r-n').textContent = String(con.length);
    $('r-ini').textContent = hhmm(con[0].ini);
    $('r-fin').textContent = hhmm(con.reduce(function (m, x) { return x.fin > m ? x.fin : m; }, con[0].fin));
    $('r-libre').textContent = libre(con);
    con.forEach(function (x) {
      var i = interpretar(x.ev), li = document.createElement('li'); li.className = 'cita';
      var h = document.createElement('div'); h.className = 'hora'; h.textContent = hhmm(x.ini);
      var sm = document.createElement('small'); sm.textContent = 'hasta ' + hhmm(x.fin); h.appendChild(sm); li.appendChild(h);
      var s = document.createElement('div'); s.className = 'serv'; s.textContent = i.servicio; li.appendChild(s);
      if (i.ok) {
        var m = document.createElement('div'); m.className = 'meta';
        m.textContent = [i.nombre, i.celular, i.barbero ? 'Barbero: ' + i.barbero : ''].filter(Boolean).join(' · '); li.appendChild(m);
        var a = document.createElement('a'); a.className = 'btn'; a.setAttribute('data-wa', ''); a.target = '_blank'; a.rel = 'noopener';
        a.href = 'https://wa.me/' + waNumero(i.celular) + '?text=' + encodeURIComponent(recordatorio(i, x.ini));
        a.textContent = 'Recordar por WhatsApp'; li.appendChild(a);
      }
      ul.appendChild(li);
    });
  }
  function libre(con) {
    var tramos = (C.jornada || {})[dia.getDay()] || [];
    if (!tramos.length) return '–';
    var tot = 0, ocu = 0;
    tramos.forEach(function (t) {
      var a = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, minutos(t[0])), b = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, minutos(t[1]));
      tot += (b - a) / 6e4;
      con.forEach(function (x) { var s = Math.max(a, x.ini), e = Math.min(b, x.fin); if (e > s) ocu += (e - s) / 6e4; });
    });
    return duracion(tot - ocu);
  }

  function enlaces() {
    var u = C.planillaPestanas || {};
    var pl = $('a-planilla'); if (C.planillaUrl) pl.href = C.planillaUrl; else pl.hidden = true;
    var D = window.BARBERIA_DEMO; if (D && D.activo && D.nota && DEMO) { var n = $('nota-demo'); n.textContent = D.nota; n.hidden = false; }
    [['a-servicios', u.servicios], ['a-horario', u.horario], ['a-barberos', u.barberos], ['a-aviso', u.aviso], ['a-pagina', C.paginaUrl]].forEach(function (p) {
      var a = $(p[0]); if (p[1]) a.href = p[1]; else a.hidden = true;
    });
  }
  function elegir(d) { dia = d; $('otro').value = iso(d); cargar(); }

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();
  var iniciado = false;
  function init() {
    if (iniciado) return; iniciado = true;
    $('negocio').textContent = C.negocio || 'Mi agenda';
    $('cinta').hidden = !DEMO;
    enlaces();
    document.querySelector('[data-dia="hoy"]').addEventListener('click', function () { elegir(nuevoDia(0)); });
    document.querySelector('[data-dia="manana"]').addEventListener('click', function () { elegir(nuevoDia(1)); });
    $('otro').addEventListener('change', function (e) { var p = e.target.value.split('-'); if (p.length === 3) elegir(new Date(+p[0], +p[1] - 1, +p[2])); });
    $('actualizar').addEventListener('click', cargar);
    $('entrar').addEventListener('click', pedirToken);
    $('otro').value = iso(dia);
    if (DEMO) cargar();
    else {
      titulo();
      iniciarGIS().then(function () { sesion('Entra con tu cuenta de Google para ver tu agenda.'); })
        .catch(function () { sesion('No pude cargar el acceso de Google. Revisa tu internet y recarga la página.'); });
    }
  }
})();
