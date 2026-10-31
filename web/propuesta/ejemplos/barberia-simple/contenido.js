/* Lee 4 CSV (planilla del dueño) y actualiza servicios, barberos, horario y aviso.
   El contenido de la planilla NO es confiable: todo se escribe con textContent / createElement.
   Si algo falla, la sección conserva su HTML estático. Con ?revisar=1 se informa qué falló. */
(function () {
  'use strict';
  var cfg = window.CONTENIDO_BARBERIA;
  if (!cfg) return;
  var revisar = /[?&]revisar=1/.test(location.search);
  var fallas = [];
  function falla(parte, msg) {
    fallas.push(parte + ': ' + msg);
    try { console.warn('[contenido] ' + parte + ': ' + msg); } catch (e) {}
  }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase(); }
  function parsearCSV(t) {
    t = String(t).replace(/^﻿/, '');
    var filas = [], fila = [], c = '', q = false, i, ch;
    for (i = 0; i < t.length; i++) {
      ch = t[i];
      if (q) {
        if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { fila.push(c); c = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && t[i + 1] === '\n') i++;
        fila.push(c); c = ''; filas.push(fila); fila = [];
      } else c += ch;
    }
    if (c !== '' || fila.length) { fila.push(c); filas.push(fila); }
    filas = filas.filter(function (f) { return f.some(function (x) { return x.trim() !== ''; }); });
    if (q || filas.length < 2) throw new Error('CSV vacío o mal formado');
    var enc = filas[0].map(norm);
    return filas.slice(1).map(function (f) {
      var o = {};
      enc.forEach(function (h, k) { o[h] = (f[k] || '').trim(); });
      return o;
    });
  }
  function campo(o, nombre) {
    if (nombre in o) return o[nombre];
    for (var k in o) if (k.indexOf(nombre) === 0) return o[k];
    return '';
  }
  function inactivo(v) { return ['no', 'n', 'false', '0', 'inactivo'].indexOf(norm(v)) !== -1; }
  function afirmativo(v) { return ['si', 's', 'yes', 'true', '1', 'activo', 'x'].indexOf(norm(v)) !== -1; }

  /* DEMO: con demoPlanilla:true y datos guardados por mi-planilla/ en localStorage se usan en vez del CSV (convertidos a texto CSV y pasados por el mismo parser). Si falta o está dañado, se lee el CSV. */
  function demoCSV(parte) {
    try {
      var d = JSON.parse(localStorage.getItem('bio_demo_planilla_barberia')), t = d && d[parte];
      if (!Array.isArray(t) || !t.length || !t.every(Array.isArray)) return null;
      return t.map(function (f) { return f.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    } catch (e) { return null; }
  }
  function cargar(parte) {
    var demo = cfg.demoPlanilla ? demoCSV(parte) : null;
    if (demo != null) return Promise.resolve().then(function () { return parsearCSV(demo); });
    var url = cfg[parte];
    if (!url) return Promise.reject(new Error('sin URL'));
    var u = url + (url.indexOf('?') === -1 ? '?' : '&') + '_=' + Date.now();
    return fetch(u, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(parsearCSV);
  }
  function hacer(parte, fn) {
    return cargar(parte).then(fn).catch(function (e) { falla(parte, (e && e.message) || String(e)); });
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  /* Servicios: una pestaña por categoría */
  /* Misma lógica que simple.js: '.dd' o ',dd' final = decimales (se descartan); el resto son miles */
  function numero(s) { var t = String(s == null ? '' : s).replace(/[$\s]/g, '').replace(/[.,]\d{1,2}$/, '').replace(/[.,]/g, ''); return /^\d{1,8}$/.test(t) ? +t : null; }
  /* Rangos de seguridad (misma regla que la plantilla Excel y que reservas-simple/simple.js): fuera de rango se descarta y se usa el respaldo estático. */
  var PRECIO_MAX = 500000, PRECIO_AVISO = 100000, DUR_MIN = 5, DUR_MAX = 720;
  function pesos(n) { return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function servicios(rows) {
    var grupos = [], idx = {}, resp = {};
    $$('#servicios [data-reservar]').forEach(function (a) {   // respaldo estático, leído antes de reescribir
      var sp = $$('span', a), k = norm(a.getAttribute('data-reservar'));
      if (!resp[k]) resp[k] = { precio: numero((sp[1] || {}).textContent), dur: parseInt((sp[0] || {}).textContent, 10) };
    });
    rows.forEach(function (r) {
      var nombre = campo(r, 'servicio');
      if (!nombre || inactivo(campo(r, 'activo'))) return;
      var precio = numero(campo(r, 'precio'));
      var rs = resp[norm(nombre)];
      if (precio > PRECIO_MAX) {
        falla('servicios', 'Precio fuera de rango en ' + nombre + ': revisa los ceros');
        if (!rs || !rs.precio) return;
        precio = rs.precio;
      } else if (precio > PRECIO_AVISO) falla('servicios', 'Precio alto en ' + nombre + ' ($' + precio + '): revisa los ceros si no es correcto');
      if (!precio) { if (precio === null) falla('servicios', nombre + ': precio no válido'); return; }
      var dur = parseInt(campo(r, 'duracion'), 10);
      if (dur && !(dur >= DUR_MIN && dur <= DUR_MAX)) {
        falla('servicios', 'Duración fuera de rango en ' + nombre + ' (' + DUR_MIN + '-' + DUR_MAX + ' min)');
        dur = rs && rs.dur >= DUR_MIN ? rs.dur : NaN;
      }
      var cat = campo(r, 'categoria') || 'Servicios';
      if (!Object.prototype.hasOwnProperty.call(idx, cat)) { idx[cat] = grupos.length; grupos.push({ cat: cat, items: [] }); }
      grupos[idx[cat]].items.push({ nombre: nombre, precio: precio, dur: dur });
    });
    if (!grupos.length) throw new Error('ningún servicio válido');
    var tabs = $('#servicios .tabs'), nota = $('#servicios .nota');
    if (!tabs || !nota) throw new Error('falta .tabs o .nota');
    var botones = $$('[role="tab"]', tabs), paneles = botones.map(function (b) { return $('#' + b.getAttribute('aria-controls')); });
    while (botones.length < grupos.length) {
      var n = botones.length + 1;
      var b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'b-cat' + n; b.setAttribute('aria-controls', 'tab-cat' + n);
      var p = el('div', 'tabla'); p.setAttribute('role', 'tabpanel'); p.id = 'tab-cat' + n; p.setAttribute('aria-labelledby', b.id);
      tabs.appendChild(b); nota.parentNode.insertBefore(p, nota);
      botones.push(b); paneles.push(p);
    }
    botones.forEach(function (b, i) {
      var g = grupos[i], p = paneles[i];
      if (!g) { b.hidden = true; b.setAttribute('aria-selected', 'false'); p.hidden = true; return; }
      b.hidden = false; b.textContent = g.cat;
      while (p.firstChild) p.removeChild(p.firstChild);
      g.items.forEach(function (s, k) {
        var a = el('a', 'fila'); a.href = '#reserva'; a.setAttribute('data-reservar', s.nombre);
        a.appendChild(el('i', null, String(k + 1).padStart(2, '0')));
        a.appendChild(el('b', null, s.nombre));
        a.appendChild(el('span', null, s.dur > 0 ? s.dur + ' min' : ''));
        a.appendChild(el('span', null, pesos(s.precio)));
        var f = el('em', null, '↗'); f.setAttribute('aria-hidden', 'true'); a.appendChild(f);
        p.appendChild(a);
      });
    });
    botones.filter(function (b) { return !b.hidden; }).forEach(function (b, i) {
      b.setAttribute('aria-selected', String(i === 0));
      $('#' + b.getAttribute('aria-controls')).hidden = i !== 0;
    });
  }

  /* Barberos: solo se ocultan los marcados Activo=No */
  function barberos(rows) {
    var ocultos = {};
    rows.forEach(function (r) { var n = campo(r, 'barbero'); if (n && inactivo(campo(r, 'activo'))) ocultos[norm(n)] = true; });
    $$('#barberos .equipo figure').forEach(function (f) {
      var b = $('figcaption b', f);
      if (b && ocultos[norm(b.textContent)]) { f.hidden = true; f.style.display = 'none'; }
    });
  }

  /* Horario */
  var DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  var NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  function horaMin(s) {   // misma lógica que simple.js; devuelve minutos del día
    s = String(s == null ? '' : s).trim().toLowerCase(); var m, x;
    if (/^0?[.,]\d+$/.test(s)) { x = parseFloat(s.replace(',', '.')); if (x > 0 && x < 1) { x = Math.round(x * 1440); return x < 1440 ? x : null; } }   // fracción de día de Excel
    if ((m = /^(\d{1,2})(?:[:.h](\d{2}))?(?::\d{2})?\s*([ap])\.?\s*m\.?$/.exec(s))) return +m[1] >= 1 && +m[1] <= 12 && +(m[2] || 0) < 60 ? (+m[1] % 12 + (m[3] === 'p' ? 12 : 0)) * 60 + +(m[2] || 0) : null;
    m = /^(\d{1,2})(?:[:.h](\d{2})(?::\d{2})?)?\s*(?:hrs?|h)?$/.exec(s); return m && +m[1] < 24 && +(m[2] || 0) < 60 ? +m[1] * 60 + +(m[2] || 0) : null;
  }
  function hora(h) { var n = horaMin(h); return n == null ? null : String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0'); }
  function lista(n) { return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1]; }
  function horario(rows) {
    var tramos = DIAS.map(function () { return []; });
    rows.forEach(function (r) {
      var d = DIAS.indexOf(norm(campo(r, 'dia'))), a = hora(campo(r, 'abre')), c = hora(campo(r, 'cierra'));
      if (d !== -1 && a && c && a < c) tramos[d].push(a + ' – ' + c);
    });
    var textos = tramos.map(function (t) { return t.sort().join(' y '); });
    var abiertos = [];
    textos.forEach(function (t, i) { if (t) abiertos.push(i); });
    if (!abiertos.length) throw new Error('ningún día con horario válido');
    var dl = $('#horario dl.horas');
    if (!dl) throw new Error('falta dl.horas');
    var salida = [], i = 0, j;
    while (i < 7) {
      if (!textos[i]) { i++; continue; }
      j = i;
      while (j + 1 < 7 && textos[j + 1] === textos[i]) j++;
      var et = j === i ? NOMBRES[i] : j === i + 1 ? NOMBRES[i] + ' y ' + NOMBRES[j].toLowerCase() : NOMBRES[i] + ' a ' + NOMBRES[j].toLowerCase();
      salida.push([et, textos[i]]);
      i = j + 1;
    }
    var ult = abiertos[abiertos.length - 1];
    var cerrados = [0, 1, 2, 3, 4, 5, 6].filter(function (k) { return !textos[k]; })
      .sort(function (a, b) { return ((a - ult - 1 + 14) % 7) - ((b - ult - 1 + 14) % 7); })
      .map(function (k, n) { return n === 0 ? NOMBRES[k] : NOMBRES[k].toLowerCase(); });
    if (cerrados.length) salida.push([lista(cerrados), 'Cerrado']);
    while (dl.firstChild) dl.removeChild(dl.firstChild);
    salida.forEach(function (s) {
      var d = el('div'); d.appendChild(el('dt', null, s[0])); d.appendChild(el('dd', null, s[1])); dl.appendChild(d);
    });
  }

  /* Aviso con vigencia */
  function fecha(s) {
    s = String(s).trim();
    var m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s), y, mo, d;
    if (m) { d = +m[1]; mo = +m[2]; y = +m[3]; }
    else if ((m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T].*)?$/.exec(s))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = /^(\d{5})(?:[.,]\d+)?$/.exec(s))) { var e = new Date(Date.UTC(1899, 11, 30) + +m[1] * 86400000); y = e.getUTCFullYear(); mo = e.getUTCMonth() + 1; d = e.getUTCDate(); }   // número de serie de Excel
    else return null;
    var t = new Date(y, mo - 1, d);
    return t.getFullYear() === y && t.getMonth() === mo - 1 && t.getDate() === d ? t : null;   // descarta fechas imposibles (p. ej. 10/28/2026 en formato americano)
  }
  function aviso(rows) {
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var r = rows.filter(function (x) {
      var d = fecha(campo(x, 'desde')), h = fecha(campo(x, 'hasta'));
      if (campo(x, 'titulo') && (!d || !h)) falla('aviso', campo(x, 'titulo') + ': fecha no válida (usa 16-11-2026)');
      return afirmativo(campo(x, 'activo')) && campo(x, 'titulo') && d && h && hoy >= d && hoy <= h;
    })[0];
    if (!r) return;
    var clave = 'aviso:' + campo(r, 'titulo') + '|' + campo(r, 'desde');
    try { if (sessionStorage.getItem(clave)) return; } catch (e) {}
    var viejo = $('#aviso-planilla'); if (viejo) viejo.remove();
    var b = el('section', 'aviso'); b.id = 'aviso-planilla'; b.setAttribute('aria-label', 'Aviso');
    var txt = el('div', 'aviso-txt');
    txt.appendChild(el('b', null, campo(r, 'titulo')));
    if (campo(r, 'texto')) txt.appendChild(el('span', null, campo(r, 'texto')));
    var x = el('button', 'aviso-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Cerrar aviso');
    x.addEventListener('click', function () { b.remove(); try { sessionStorage.setItem(clave, '1'); } catch (e) {} });
    b.appendChild(txt); b.appendChild(x);
    var main = $('main');
    main.parentNode.insertBefore(b, main);
  }

  function informe() {
    if (!revisar) return;
    var d = el('aside', 'revisar'); d.id = 'revisar-contenido'; d.setAttribute('role', 'status');
    d.textContent = fallas.length ? 'Contenido de la planilla con problemas: ' + fallas.join(' | ') : 'Contenido de la planilla cargado sin problemas.';
    document.body.appendChild(d);
  }

  Promise.all([
    hacer('servicios', servicios), hacer('barberos', barberos), hacer('horario', horario), hacer('aviso', aviso)
  ]).then(informe);
})();
