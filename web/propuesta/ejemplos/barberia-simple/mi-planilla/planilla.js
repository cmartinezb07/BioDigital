/* Planilla SIMULADA del dueño (solo demostración). Datos iniciales: los CSV de ejemplo de la barbería.
   Lo que se edita se guarda únicamente en el navegador (localStorage, clave bio_demo_planilla_barberia).
   Contenido NO confiable: todo se escribe con textContent / value, nunca con innerHTML. Funciona sin localStorage. */
(function () {
  'use strict';
  var CLAVE = 'bio_demo_planilla_barberia';
  var BASE = '../../reservas-simple/planilla-ejemplo/barberia-';
  var MAXF = 200;
  var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  var CATS = ['Cortes', 'Barba', 'Otros'];
  var SINO = ['Sí', 'No'];
  var HORAS = (function () { var r = []; for (var m = 360; m < 1440; m += 15) r.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); return r; })();

  /* t=texto, n=número, l=lista desplegable; ancho=celda ancha; activo=columna Sí/No */
  var HOJAS = [
    { id: 'servicios', nombre: 'Servicios', cols: [
      { h: 'Servicio', t: 't', ancho: 1 }, { h: 'Categoría', t: 'l', op: CATS }, { h: 'Precio', t: 'n' }, { h: 'Duración (min)', t: 'n' },
      { h: 'Descripción', t: 't', ancho: 1 }, { h: 'Activo', t: 'l', op: SINO, activo: 1 }] },
    { id: 'horario', nombre: 'Horario', cols: [
      { h: 'Día', t: 'l', op: DIAS }, { h: 'Abre', t: 'l', op: HORAS }, { h: 'Cierra', t: 'l', op: HORAS }] },
    { id: 'barberos', nombre: 'Barberos', cols: [
      { h: 'Barbero', t: 't', ancho: 1 }, { h: 'Activo', t: 'l', op: SINO, activo: 1 }] },
    { id: 'aviso', nombre: 'Aviso', cols: [
      { h: 'Título', t: 't', ancho: 1 }, { h: 'Texto', t: 't', ancho: 1 }, { h: 'Desde', t: 't' }, { h: 'Hasta', t: 't' }, { h: 'Activo', t: 'l', op: SINO, activo: 1 }] }
  ];

  var $ = function (s) { return document.querySelector(s); };
  var datos = {};          // id de hoja -> filas (arreglo de arreglos, sin encabezado)
  var actual = 0;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function estado(msg) { $('#estado').textContent = msg || ''; }

  /* ---------- CSV -> filas ---------- */
  function parsearCSV(t) {
    t = String(t).replace(/^﻿/, '');
    var filas = [], fila = [], c = '', q = false, i, ch;
    for (i = 0; i < t.length; i++) {
      ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
      else if (ch === '"') q = true;
      else if (ch === ',') { fila.push(c); c = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; fila.push(c); c = ''; filas.push(fila); fila = []; }
      else c += ch;
    }
    if (c !== '' || fila.length) { fila.push(c); filas.push(fila); }
    return filas.filter(function (f) { return f.some(function (x) { return x.trim() !== ''; }); });
  }
  function normalizar(filas, n) {
    return filas.map(function (f) { var o = []; for (var i = 0; i < n; i++) o.push(String(f[i] == null ? '' : f[i])); return o; });
  }

  /* ---------- almacenamiento (puede fallar: se sigue en memoria) ---------- */
  function leerGuardado() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE));
      if (!d || typeof d !== 'object') return null;
      var out = {};
      for (var i = 0; i < HOJAS.length; i++) {
        var h = HOJAS[i], t = d[h.id];
        if (!Array.isArray(t) || !t.length || !t.every(Array.isArray)) return null;
        out[h.id] = normalizar(t.slice(1), h.cols.length);
      }
      return out;
    } catch (e) { return null; }
  }
  function guardar() {
    var d = {}, ok = true;
    HOJAS.forEach(function (h) {
      d[h.id] = [h.cols.map(function (c) { return c.h; })].concat(datos[h.id].filter(function (f) { return f.some(function (x) { return x.trim() !== ''; }); }));
    });
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { ok = false; }
    estado(ok ? 'Guardado en tu navegador.' : 'No se pudo guardar en este navegador: los cambios valen solo mientras tengas esta pestaña abierta.');
  }
  function olvidar() { try { localStorage.removeItem(CLAVE); } catch (e) {} }

  function cargarEjemplo() {
    return Promise.all(HOJAS.map(function (h) {
      return fetch(BASE + h.id + '.csv', { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (t) { return normalizar(parsearCSV(t).slice(1), h.cols.length); });
    })).then(function (r) { var o = {}; HOJAS.forEach(function (h, i) { o[h.id] = r[i]; }); return o; });
  }

  /* ---------- avisos (mismas reglas que la plantilla Excel): 'rojo' = corregir, 'amarillo' = revisar ---------- */
  function num(v) { v = String(v).trim(); return v !== '' && isFinite(Number(v)) ? Number(v) : NaN; }
  function minutos(v) { var m = /^(\d{1,2}):(\d{2})$/.exec(String(v).trim()); return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : -1; }
  function fecha(v) {
    var m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(String(v).trim());
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    return d.getFullYear() === +m[3] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d.getTime() : null;
  }
  var vacioF = function (v) { return String(v).trim() === ''; };
  function avisos(h) {
    var f = datos[h.id], r = f.map(function () { return h.cols.map(function () { return ''; }); });
    function poner(i, j, c) { if (c === 'rojo' || !r[i][j]) r[i][j] = c; }
    f.forEach(function (x, i) {
      if (x.every(vacioF)) return;
      if (h.id === 'servicios') {
        var nombre = x[0].trim(), p = num(x[2]);
        if ((nombre && vacioF(x[2])) || (!nombre && !vacioF(x[2]))) { poner(i, 0, 'rojo'); poner(i, 2, 'rojo'); }
        if (nombre && f.filter(function (y) { return y[0].trim().toLowerCase() === nombre.toLowerCase(); }).length > 1) poner(i, 0, 'rojo');
        if (!vacioF(x[2])) { if (isNaN(p) || p < 0 || p > 500000) poner(i, 2, 'rojo'); else if (p > 100000) poner(i, 2, 'amarillo'); }
        if (!vacioF(x[3])) { var dn = num(x[3]); if (isNaN(dn) || dn < 5 || dn > 720 || dn % 1) poner(i, 3, 'rojo'); }
        if (x[4].length > 150) poner(i, 4, 'amarillo');
      } else if (h.id === 'horario') {
        var a = minutos(x[1]), c = minutos(x[2]);
        if (vacioF(x[1]) || vacioF(x[2]) || a < 0 || c < 0 || c <= a) { poner(i, 1, 'rojo'); poner(i, 2, 'rojo'); }
        if (x[0].trim() && f.filter(function (y) { return y[0] === x[0] && y[1] === x[1]; }).length > 1) { poner(i, 0, 'amarillo'); poner(i, 1, 'amarillo'); poner(i, 2, 'amarillo'); }
      } else if (h.id === 'barberos') {
        var b = x[0].trim().toLowerCase();
        if (b && f.filter(function (y) { return y[0].trim().toLowerCase() === b; }).length > 1) poner(i, 0, 'rojo');
      } else if (h.id === 'aviso') {
        var d1 = fecha(x[2]), d2 = fecha(x[3]);
        if (d1 != null && d2 != null && d2 < d1) { poner(i, 2, 'rojo'); poner(i, 3, 'rojo'); }
        if (x[0].length > 60) poner(i, 0, 'rojo');
        if (x[1].length > 200) poner(i, 1, 'amarillo');
      }
    });
    return r;
  }

  function pintarCelda(td, j, h, clase, valor) {
    var col = h.cols[j];
    td.className = (col.ancho ? 'ancho ' : '') + (clase || '');
    if (col.activo && !clase) { var v = String(valor).trim().toLowerCase(); td.className += v === 'no' ? ' no' : (v === 'sí' || v === 'si') ? ' si' : ''; }
  }
  function refrescar() {
    var h = HOJAS[actual], tr = $('#hoja tbody').children, av = avisos(h);
    datos[h.id].forEach(function (x, i) {
      var fila = tr[i]; if (!fila) return;
      var apagada = h.cols.some(function (c, j) { return c.activo && String(x[j]).trim().toLowerCase() === 'no'; });
      fila.className = apagada ? 'apagada' : '';
      h.cols.forEach(function (c, j) { pintarCelda(fila.children[j + 1], j, h, av[i][j], x[j]); });
    });
  }

  /* ---------- tabla ---------- */
  function celda(h, i, j) {
    var col = h.cols[j], td = el('td'), valor = datos[h.id][i][j], campo;
    if (col.t === 'l') {
      campo = el('select');
      var ops = col.op.slice();
      if (valor && ops.indexOf(valor) < 0) ops.push(valor);     // valor propio de la planilla: se conserva
      var vacia = el('option', null, ''); vacia.value = ''; campo.appendChild(vacia);
      ops.forEach(function (o) { var op = el('option', null, o); op.value = o; campo.appendChild(op); });
      campo.value = valor;
    } else {
      campo = el('input'); campo.type = 'text'; campo.value = valor; campo.autocomplete = 'off';
      if (col.t === 'n') campo.inputMode = 'numeric';
    }
    campo.setAttribute('aria-label', col.h + ', fila ' + (i + 2));
    var cambio = function () { datos[h.id][i][j] = campo.value; refrescar(); guardar(); };
    campo.addEventListener('input', cambio);
    campo.addEventListener('change', cambio);
    td.appendChild(campo);
    return td;
  }
  function fila(h, i) {
    var tr = el('tr'), n = el('th', 'n', String(i + 2)); n.scope = 'row'; tr.appendChild(n);
    for (var j = 0; j < h.cols.length; j++) tr.appendChild(celda(h, i, j));
    return tr;
  }
  function dibujar() {
    var h = HOJAS[actual], hoja = $('#hoja');
    while (hoja.firstChild) hoja.removeChild(hoja.firstChild);
    var tabla = el('table'), thead = el('thead'), trh = el('tr');
    tabla.setAttribute('aria-label', 'Pestaña ' + h.nombre);
    trh.appendChild(el('th', 'n', '1'));
    h.cols.forEach(function (c) { var th = el('th', null, c.h); th.scope = 'col'; trh.appendChild(th); });   // encabezado bloqueado: no es editable
    thead.appendChild(trh); tabla.appendChild(thead);
    var tb = el('tbody');
    datos[h.id].forEach(function (_, i) { tb.appendChild(fila(h, i)); });
    tabla.appendChild(tb); hoja.appendChild(tabla);
    refrescar();
    Array.prototype.forEach.call($('#pestanas').children, function (b, k) { b.setAttribute('aria-selected', String(k === actual)); });
  }
  function pestanas() {
    var nav = $('#pestanas');
    HOJAS.forEach(function (h, k) {
      var b = el('button', 'pestana', h.nombre); b.type = 'button'; b.setAttribute('role', 'tab');
      b.addEventListener('click', function () { actual = k; dibujar(); });
      nav.appendChild(b);
    });
  }

  function iniciar() {
    pestanas();
    $('#agregar').addEventListener('click', function () {
      var h = HOJAS[actual];
      if (datos[h.id].length >= MAXF) { estado('Máximo ' + MAXF + ' filas en esta pestaña.'); return; }
      datos[h.id].push(h.cols.map(function () { return ''; }));
      dibujar();
      var ins = document.querySelectorAll('#hoja tbody tr:last-child input, #hoja tbody tr:last-child select');
      if (ins[0]) ins[0].focus();
    });
    $('#restablecer').addEventListener('click', function () {
      olvidar();
      cargarEjemplo().then(function (d) { datos = d; dibujar(); estado('Planilla restablecida al ejemplo original.'); })
        .catch(function () { estado('No se pudo cargar el ejemplo. Recarga la página.'); });
    });
    var g = leerGuardado();
    if (g) { datos = g; dibujar(); return; }
    cargarEjemplo().then(function (d) { datos = d; dibujar(); })
      .catch(function () { $('#hoja').appendChild(el('p', 'vacio', 'No se pudo cargar la planilla de ejemplo. Recarga la página.')); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
