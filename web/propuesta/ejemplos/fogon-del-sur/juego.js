// Juegos para mientras esperas el pedido: Zip, Queens, Tango y Sudoku mini. Mismas reglas que los juegos de lógica de LinkedIn,
// con diseño propio. Cada puzzle se genera al azar en el celular y se valida por las reglas (no contra una solución guardada).
// Uso: window.JuegoEspera(elemento).
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var CSS = '.jg{display:grid;gap:12px}.jg-tabs{display:flex;gap:6px;flex-wrap:wrap}.jg-tabs button{min-height:44px;padding:0 14px;border-radius:99px;border:1px solid var(--line,#4a3b2e);background:transparent;color:inherit;font:600 14px/1 inherit;cursor:pointer}' +
    '.jg-tabs button[aria-pressed="true"]{background:var(--c1,#cf9b4a);border-color:var(--c1,#cf9b4a);color:#1a110c}.jg-info{font-size:14px;line-height:1.45;opacity:.85}.jg-barra{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}' +
    '.jg-barra button{min-height:44px;padding:0 14px;border-radius:10px;border:1px solid var(--line,#4a3b2e);background:transparent;color:inherit;font:600 14px/1 inherit;cursor:pointer}.jg-tiempo{font:600 15px ui-monospace,Consolas,monospace}.jg-msg{min-height:22px;font-weight:700;color:var(--c1,#cf9b4a)}' +
    '.jg-tab{position:relative;display:grid;width:min(100%,360px);margin:0 auto;touch-action:manipulation;user-select:none;-webkit-user-select:none;border-radius:12px;overflow:hidden;border:2px solid #2a2118;background:#2a2118;gap:2px}' +
    '.jg-c{position:relative;display:grid;place-items:center;aspect-ratio:1;background:#f4ead9;color:#1a110c;font:700 clamp(15px,4.4vw,20px)/1 system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}.jg-c:focus-visible{outline:3px solid #3b82f6;outline-offset:-3px;z-index:3}' +
    '.jg-c.mal{box-shadow:inset 0 0 0 3px #dc2626}.jg-c.fija{background:#e6d8c0}.jg-c.sel{box-shadow:inset 0 0 0 3px #3b82f6}.jg-c svg{width:68%;height:68%}' +
    '.jg-num{position:absolute;z-index:2;display:grid;place-items:center;width:62%;height:62%;border-radius:50%;background:#1a110c;color:#fff;font-weight:800}.jg-zip .jg-c{background:#f4ead9}.jg-zip .jg-c.en{background:#fde8c0}' +
    '.jg-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}.jg-pad{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:min(100%,360px);margin:0 auto}.jg-pad button{min-height:44px;border-radius:10px;border:1px solid var(--line,#4a3b2e);background:transparent;color:inherit;font:700 17px/1 inherit;cursor:pointer}' +
    '.jg-lazo{position:absolute;z-index:2;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#1a110c;color:#f4ead9;font:800 13px/1 system-ui,sans-serif;pointer-events:none}.jg-lazo.h{right:-12px;top:calc(50% - 11px)}.jg-lazo.v{bottom:-12px;left:calc(50% - 11px)}';
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var barajar = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var h = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  var fmt = function (s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };

  // ---------- ZIP: una línea continua pasa por todas las casillas, tocando los números en orden ----------
  function hamilton(n) {
    var tot = n * n, pasos = 0;
    function vec(c) { var f = Math.floor(c / n), k = c % n, r = []; if (f > 0) r.push(c - n); if (f < n - 1) r.push(c + n); if (k > 0) r.push(c - 1); if (k < n - 1) r.push(c + 1); return r; }
    for (var intento = 0; intento < 30; intento++) {
      var vis = {}, ruta = [], ini = rnd(tot); pasos = 0;
      var ir = function (c) {
        ruta.push(c); vis[c] = 1; if (ruta.length === tot) return true;
        if (++pasos > 4000) return false;
        var sig = barajar(vec(c).filter(function (x) { return !vis[x]; })).sort(function (a, b) { return vec(a).filter(function (x) { return !vis[x]; }).length - vec(b).filter(function (x) { return !vis[x]; }).length; });
        for (var i = 0; i < sig.length; i++) if (ir(sig[i])) return true;
        ruta.pop(); delete vis[c]; return false;
      };
      if (ir(ini)) return ruta;
    }
    var s = []; for (var f = 0; f < n; f++) for (var k = 0; k < n; k++) s.push(f * n + (f % 2 ? n - 1 - k : k)); return s;
  }
  function zip(cont, info) {
    var n = 6, tot = n * n, sol = hamilton(n), marcas = {}, muros = {}, pos = {};
    sol.forEach(function (c, i) { pos[c] = i; });
    var cuantos = 6, idx = [0]; for (var k = 1; k < cuantos - 1; k++) idx.push(Math.round(k * (tot - 1) / (cuantos - 1)) + rnd(3) - 1); idx.push(tot - 1);
    idx.forEach(function (i, k) { marcas[sol[Math.max(0, Math.min(tot - 1, i))]] = k + 1; });
    var maxN = Object.keys(marcas).length, clave = function (a, b) { return Math.min(a, b) + '|' + Math.max(a, b); };
    // Muros entre casillas vecinas que la solución no recorre seguidas: dan pistas y achican las opciones
    var cand = []; for (var c = 0; c < tot; c++) { [c + 1, c + n].forEach(function (d) { if (d >= tot || (d === c + 1 && d % n === 0)) return; if (Math.abs(pos[c] - pos[d]) !== 1) cand.push([c, d]); }); }
    barajar(cand).slice(0, 7).forEach(function (p) { muros[clave(p[0], p[1])] = p; });
    info.textContent = 'Dibuja una línea continua desde el 1 hasta el ' + maxN + ', pasando por los números en orden y por todas las casillas. Las líneas gruesas son muros.';
    var tab = h('div', 'jg-tab jg-zip'); tab.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; tab.setAttribute('role', 'application'); tab.setAttribute('aria-label', 'Tablero de Zip');
    var celdas = []; for (var i = 0; i < tot; i++) { var d = h('div', 'jg-c'); d.dataset.i = i; if (marcas[i]) { d.appendChild(h('span', 'jg-num', marcas[i])); d.setAttribute('aria-label', 'Casilla con el número ' + marcas[i]); } celdas.push(d); tab.appendChild(d); }
    Object.keys(muros).forEach(function (k) { var p = muros[k], a = celdas[p[0]], horiz = p[1] === p[0] + 1; var m = h('i'); m.style.cssText = 'position:absolute;background:#1a110c;z-index:3;' + (horiz ? 'top:0;bottom:0;right:-3px;width:5px' : 'left:0;right:0;bottom:-3px;height:5px'); a.appendChild(m); });
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'jg-svg'); svg.setAttribute('viewBox', '0 0 ' + n + ' ' + n); var pl = document.createElementNS(NS, 'polyline'); pl.setAttribute('fill', 'none'); pl.setAttribute('stroke', '#e8851a'); pl.setAttribute('stroke-width', '.34'); pl.setAttribute('stroke-linecap', 'round'); pl.setAttribute('stroke-linejoin', 'round'); svg.appendChild(pl); tab.appendChild(svg);
    cont.appendChild(tab);
    var ruta = [], listo = false, dib = false;
    var sigNum = function () { var m = 0; ruta.forEach(function (c) { if (marcas[c]) m = Math.max(m, marcas[c]); }); return m + 1; };
    // Solo las casillas desde donde se puede empezar a dibujar (el 1, o la línea ya trazada) capturan el dedo; en el resto el dedo sigue moviendo la página
    function capturar() { var uno = +Object.keys(marcas).filter(function (k) { return marcas[k] === 1; })[0]; celdas.forEach(function (c, i) { c.style.touchAction = (ruta.length ? ruta.indexOf(i) > -1 : i === uno) ? 'none' : 'auto'; }); }
    function pintar() {
      capturar();
      celdas.forEach(function (c, i) { c.classList.toggle('en', ruta.indexOf(i) > -1); });
      pl.setAttribute('points', ruta.map(function (c) { return (c % n + .5) + ',' + (Math.floor(c / n) + .5); }).join(' '));
      if (ruta.length === tot && marcas[ruta[tot - 1]] === maxN && !listo) { listo = true; cont.dispatchEvent(new CustomEvent('ganó')); }
    }
    function mover(c) {
      if (listo) return;
      var u = ruta[ruta.length - 1];
      if (!ruta.length) { if (marcas[c] === 1) { ruta.push(c); pintar(); } return; }
      if (c === u) return;
      if (c === ruta[ruta.length - 2]) { ruta.pop(); pintar(); return; }
      var vecino = Math.abs(c - u) === n || (Math.abs(c - u) === 1 && Math.floor(c / n) === Math.floor(u / n));
      if (!vecino || ruta.indexOf(c) > -1 || muros[clave(c, u)]) return;
      if (marcas[c] && marcas[c] !== sigNum()) return;
      ruta.push(c); pintar();
    }
    var bajo = function (ev) { var e = document.elementFromPoint(ev.clientX, ev.clientY), c = e && e.closest && e.closest('.jg-c'); return c && tab.contains(c) ? +c.dataset.i : null; };
    tab.addEventListener('pointerdown', function (ev) { var c = bajo(ev); if (c == null) return; dib = true; try { tab.setPointerCapture(ev.pointerId); } catch (e) {} if (ruta.indexOf(c) > -1 && c !== ruta[ruta.length - 1] && !listo) { ruta.length = ruta.indexOf(c) + 1; pintar(); } else mover(c); });
    tab.addEventListener('pointermove', function (ev) { if (!dib) return; var c = bajo(ev); if (c != null) mover(c); });
    var fin = function () { dib = false; }; tab.addEventListener('pointerup', fin); tab.addEventListener('pointercancel', fin);
    // Teclado: foco en el tablero y flechas para alargar o acortar la línea
    tab.tabIndex = 0;
    tab.addEventListener('keydown', function (ev) {
      var d = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[ev.key]; if (!d) return; ev.preventDefault();
      if (!ruta.length) { var uno = +Object.keys(marcas).filter(function (k) { return marcas[k] === 1; })[0]; mover(uno); return; }
      var u = ruta[ruta.length - 1], t = u + d; if ((d === 1 && t % n === 0) || (d === -1 && u % n === 0) || t < 0 || t >= tot) return; mover(t);
    });
    pintar();
    return { reiniciar: function () { ruta = []; listo = false; pintar(); } };
  }

  // ---------- QUEENS: una reina por fila, columna y color, sin tocarse ----------
  function queens(cont, info) {
    var n = 7, q;
    (function () { var cols = []; var ok = function (f) { if (f === n) return true; var o = barajar([0, 1, 2, 3, 4, 5, 6]); for (var i = 0; i < o.length; i++) { var c = o[i]; if (cols.indexOf(c) > -1) continue; if (f > 0 && Math.abs(cols[f - 1] - c) < 2) continue; cols[f] = c; if (ok(f + 1)) return true; cols.length = f; } return false; }; ok(0); q = cols.slice(); })();
    var reg = []; for (var i = 0; i < n * n; i++) reg.push(-1);
    q.forEach(function (c, f) { reg[f * n + c] = f; });
    var libres = n * n - n;
    while (libres > 0) {
      var cand = []; for (var c = 0; c < n * n; c++) { if (reg[c] > -1) continue; var f = Math.floor(c / n), k = c % n, vs = []; if (f > 0) vs.push(c - n); if (f < n - 1) vs.push(c + n); if (k > 0) vs.push(c - 1); if (k < n - 1) vs.push(c + 1); vs = vs.filter(function (x) { return reg[x] > -1; }); if (vs.length) cand.push([c, reg[vs[rnd(vs.length)]]]); }
      var e = cand[rnd(cand.length)]; reg[e[0]] = e[1]; libres--;
    }
    var COL = ['#f4a6a0', '#f7d58a', '#a8d8a0', '#9cc8ee', '#c9b0ec', '#f2b68a', '#a5dcd6'];
    info.textContent = 'Pon una reina en cada color: una por fila, una por columna y ninguna tocándose, ni en diagonal. Toca una vez para marcar con una cruz y dos veces para poner la reina.';
    var est = []; for (i = 0; i < n * n; i++) est.push(0);   // 0 vacío, 1 marca, 2 reina
    var tab = h('div', 'jg-tab'); tab.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; tab.setAttribute('role', 'grid'); tab.setAttribute('aria-label', 'Tablero de Queens');
    var celdas = est.map(function (_, i) { var d = h('div', 'jg-c'); d.dataset.i = i; d.style.background = COL[reg[i]]; d.tabIndex = i === 0 ? 0 : -1; d.setAttribute('role', 'gridcell'); tab.appendChild(d); return d; });
    cont.appendChild(tab);
    var CORONA = '<svg viewBox="0 0 24 24" fill="#1a110c" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5Z"/></svg>', EQUIS = '<svg viewBox="0 0 24 24" fill="none" stroke="#1a110c" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" style="width:40%;height:40%"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    var listo = false;
    function revisar() {
      var rs = []; est.forEach(function (v, i) { if (v === 2) rs.push(i); });
      var mal = {}; rs.forEach(function (a) { rs.forEach(function (b) { if (a >= b) return; var fa = Math.floor(a / n), fb = Math.floor(b / n), ca = a % n, cb = b % n; if (fa === fb || ca === cb || reg[a] === reg[b] || (Math.abs(fa - fb) <= 1 && Math.abs(ca - cb) <= 1)) { mal[a] = mal[b] = 1; } }); });
      celdas.forEach(function (c, i) { c.classList.toggle('mal', !!mal[i]); c.innerHTML = est[i] === 2 ? CORONA : est[i] === 1 ? EQUIS : ''; c.setAttribute('aria-label', 'Fila ' + (Math.floor(i / n) + 1) + ', columna ' + (i % n + 1) + ', color ' + (reg[i] + 1) + ': ' + ['vacía', 'marcada', 'reina'][est[i]]); });
      if (rs.length === n && !Object.keys(mal).length && !listo) { listo = true; cont.dispatchEvent(new CustomEvent('ganó')); }
    }
    function tocar(i) { if (listo) return; est[i] = (est[i] + 1) % 3; revisar(); }
    tab.addEventListener('click', function (ev) { var c = ev.target.closest('.jg-c'); if (c) tocar(+c.dataset.i); });
    tab.addEventListener('keydown', function (ev) {
      var c = ev.target.closest('.jg-c'); if (!c) return; var i = +c.dataset.i;
      if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); tocar(i); return; }
      var d = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[ev.key]; if (!d) return; ev.preventDefault();
      var t = i + d; if (t < 0 || t >= n * n || (d === 1 && t % n === 0) || (d === -1 && i % n === 0)) return; celdas[i].tabIndex = -1; celdas[t].tabIndex = 0; celdas[t].focus();
    });
    revisar();
    return {};
  }

  // ---------- TANGO: soles y lunas; no más de dos iguales seguidos; igual cantidad por fila y columna; = y × entre vecinas ----------
  var SOL = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#f5a623"/><g stroke="#f5a623" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/></g></svg>';
  var LUNA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5Z" fill="#3b6fd8"/></svg>';
  function tango(cont, info) {
    var n = 6, sol = [];
    function pone(i) {
      if (i === n * n) return true;
      var f = Math.floor(i / n), c = i % n, o = barajar([1, 2]);
      for (var k = 0; k < 2; k++) {
        var v = o[k]; sol[i] = v;
        if (c >= 2 && sol[i - 1] === v && sol[i - 2] === v) continue;
        if (f >= 2 && sol[i - n] === v && sol[i - 2 * n] === v) continue;
        var enF = 0; for (var x = 0; x <= c; x++) if (sol[f * n + x] === v) enF++; if (enF > n / 2) continue;
        var enC = 0; for (var y = 0; y <= f; y++) if (sol[y * n + c] === v) enC++; if (enC > n / 2) continue;
        if (pone(i + 1)) return true;
      }
      sol[i] = 0; return false;
    }
    pone(0);
    var fijas = {}; barajar(Array.apply(null, { length: n * n }).map(function (_, i) { return i; })).slice(0, 8).forEach(function (i) { fijas[i] = sol[i]; });
    var rel = []; var pares = []; for (var i = 0; i < n * n; i++) { if (i % n < n - 1) pares.push([i, i + 1]); if (i < n * (n - 1)) pares.push([i, i + n]); }
    barajar(pares).slice(0, 8).forEach(function (p) { rel.push([p[0], p[1], sol[p[0]] === sol[p[1]] ? '=' : '×']); });
    info.textContent = 'Llena el tablero con soles y lunas. No puede haber más de dos iguales seguidos, cada fila y columna lleva 3 de cada uno, y el = y la × entre dos casillas indican si son iguales o distintas.';
    var est = []; for (i = 0; i < n * n; i++) est.push(fijas[i] || 0);
    var tab = h('div', 'jg-tab'); tab.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; tab.setAttribute('role', 'grid'); tab.setAttribute('aria-label', 'Tablero de Tango');
    var celdas = est.map(function (_, i) { var d = h('div', 'jg-c' + (fijas[i] ? ' fija' : '')); d.dataset.i = i; d.tabIndex = i === 0 ? 0 : -1; d.setAttribute('role', 'gridcell'); tab.appendChild(d); return d; });
    rel.forEach(function (r) { var a = celdas[r[0]], hor = r[1] === r[0] + 1; a.appendChild(h('span', 'jg-lazo ' + (hor ? 'h' : 'v'), r[2])); });
    cont.appendChild(tab);
    var listo = false;
    function revisar() {
      var mal = {};
      for (var f = 0; f < n; f++) for (var c = 0; c < n; c++) {
        var i = f * n + c, v = est[i]; if (!v) continue;
        if (c >= 2 && est[i - 1] === v && est[i - 2] === v) mal[i] = mal[i - 1] = mal[i - 2] = 1;
        if (f >= 2 && est[i - n] === v && est[i - 2 * n] === v) mal[i] = mal[i - n] = mal[i - 2 * n] = 1;
      }
      var completa = est.every(function (v) { return v; });
      for (var a = 0; a < n; a++) { var fs = 0, cs = 0, fl = 0, cl = 0; for (var b = 0; b < n; b++) { if (est[a * n + b] === 1) fs++; if (est[a * n + b] === 2) fl++; if (est[b * n + a] === 1) cs++; if (est[b * n + a] === 2) cl++; }
        if (fs > n / 2 || fl > n / 2) for (b = 0; b < n; b++) mal[a * n + b] = 1; if (cs > n / 2 || cl > n / 2) for (b = 0; b < n; b++) mal[b * n + a] = 1; }
      rel.forEach(function (r) { var x = est[r[0]], y = est[r[1]]; if (x && y && ((r[2] === '=') !== (x === y))) { mal[r[0]] = mal[r[1]] = 1; } });
      celdas.forEach(function (c, i) { c.classList.toggle('mal', !!mal[i]); var s = c.querySelector('svg'); if (s) s.remove(); if (est[i]) c.insertAdjacentHTML('afterbegin', est[i] === 1 ? SOL : LUNA); c.setAttribute('aria-label', 'Fila ' + (Math.floor(i / n) + 1) + ', columna ' + (i % n + 1) + ': ' + ['vacía', 'sol', 'luna'][est[i]]); });
      if (completa && !Object.keys(mal).length && !listo) { listo = true; cont.dispatchEvent(new CustomEvent('ganó')); }
    }
    function tocar(i) { if (listo || fijas[i]) return; est[i] = (est[i] + 1) % 3; revisar(); }
    tab.addEventListener('click', function (ev) { var c = ev.target.closest('.jg-c'); if (c) tocar(+c.dataset.i); });
    tab.addEventListener('keydown', function (ev) {
      var c = ev.target.closest('.jg-c'); if (!c) return; var i = +c.dataset.i;
      if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); tocar(i); return; }
      var d = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[ev.key]; if (!d) return; ev.preventDefault();
      var t = i + d; if (t < 0 || t >= n * n || (d === 1 && t % n === 0) || (d === -1 && i % n === 0)) return; celdas[i].tabIndex = -1; celdas[t].tabIndex = 0; celdas[t].focus();
    });
    revisar();
    return {};
  }

  // ---------- SUDOKU MINI: 6 × 6 con cajas de 2 × 3; los números del 1 al 6 sin repetirse ----------
  function sudoku(cont, info) {
    var n = 6, g = [];
    function ok(i, v) { var f = Math.floor(i / n), c = i % n; for (var k = 0; k < n; k++) { if (g[f * n + k] === v || g[k * n + c] === v) return false; } var f0 = f - f % 2, c0 = c - c % 3; for (var a = 0; a < 2; a++) for (var b = 0; b < 3; b++) if (g[(f0 + a) * n + c0 + b] === v) return false; return true; }
    function llena(i) { if (i === n * n) return true; var o = barajar([1, 2, 3, 4, 5, 6]); for (var k = 0; k < 6; k++) if (ok(i, o[k])) { g[i] = o[k]; if (llena(i + 1)) return true; g[i] = 0; } return false; }
    for (var z = 0; z < n * n; z++) g[z] = 0; llena(0);
    var fijas = {}; barajar(Array.apply(null, { length: n * n }).map(function (_, i) { return i; })).slice(0, 15).forEach(function (i) { fijas[i] = g[i]; });
    info.textContent = 'Llena cada fila, columna y caja de 2 × 3 con los números del 1 al 6, sin repetir. Toca una casilla y elige el número.';
    var est = g.map(function (_, i) { return fijas[i] || 0; }), sel = -1, listo = false;
    var tab = h('div', 'jg-tab'); tab.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; tab.setAttribute('role', 'grid'); tab.setAttribute('aria-label', 'Tablero de Sudoku mini');
    var celdas = est.map(function (_, i) { var d = h('div', 'jg-c' + (fijas[i] ? ' fija' : '')); d.dataset.i = i; d.tabIndex = i === 0 ? 0 : -1; d.setAttribute('role', 'gridcell'); if (i % n === 2) d.style.marginRight = '3px'; if (Math.floor(i / n) % 2 === 1 && Math.floor(i / n) < n - 1) d.style.marginBottom = '3px'; tab.appendChild(d); return d; });
    cont.appendChild(tab);
    var pad = h('div', 'jg-pad'); [1, 2, 3, 4, 5, 6].forEach(function (v) { var b = h('button', '', v); b.type = 'button'; b.dataset.v = v; b.setAttribute('aria-label', 'Poner el ' + v); pad.appendChild(b); }); var bx = h('button', '', '⌫'); bx.type = 'button'; bx.dataset.v = 0; bx.setAttribute('aria-label', 'Borrar'); pad.appendChild(bx); cont.appendChild(pad);
    function revisar() {
      var mal = {};
      for (var i = 0; i < n * n; i++) { var v = est[i]; if (!v) continue; for (var j = i + 1; j < n * n; j++) { if (est[j] !== v) continue; var fi = Math.floor(i / n), fj = Math.floor(j / n), ci = i % n, cj = j % n; if (fi === fj || ci === cj || (Math.floor(fi / 2) === Math.floor(fj / 2) && Math.floor(ci / 3) === Math.floor(cj / 3))) mal[i] = mal[j] = 1; } }
      celdas.forEach(function (c, i) { c.textContent = est[i] || ''; c.classList.toggle('mal', !!mal[i]); c.classList.toggle('sel', i === sel); c.setAttribute('aria-label', 'Fila ' + (Math.floor(i / n) + 1) + ', columna ' + (i % n + 1) + ': ' + (est[i] || 'vacía')); });
      if (est.every(function (v) { return v; }) && !Object.keys(mal).length && !listo) { listo = true; cont.dispatchEvent(new CustomEvent('ganó')); }
    }
    function poner(v) { if (listo || sel < 0 || fijas[sel]) return; est[sel] = v; revisar(); }
    tab.addEventListener('click', function (ev) { var c = ev.target.closest('.jg-c'); if (!c) return; sel = +c.dataset.i; revisar(); });
    pad.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) poner(+b.dataset.v); });
    tab.addEventListener('keydown', function (ev) {
      var c = ev.target.closest('.jg-c'); if (!c) return; var i = +c.dataset.i; sel = i;
      if (/^[1-6]$/.test(ev.key)) { poner(+ev.key); return; } if (ev.key === 'Backspace' || ev.key === 'Delete' || ev.key === '0') { poner(0); return; }
      var d = { ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 }[ev.key]; if (!d) return; ev.preventDefault();
      var t = i + d; if (t < 0 || t >= n * n || (d === 1 && t % n === 0) || (d === -1 && i % n === 0)) return; celdas[i].tabIndex = -1; celdas[t].tabIndex = 0; celdas[t].focus(); sel = t; revisar();
    });
    revisar();
    return {};
  }

  var JUEGOS = [['Zip', zip], ['Queens', queens], ['Tango', tango], ['Sudoku mini', sudoku]];
  window.JuegoEspera = function (raiz) {
    if (!document.getElementById('jg-css')) { var st = document.createElement('style'); st.id = 'jg-css'; st.textContent = CSS; document.head.appendChild(st); }
    var actual = 0, t0 = Date.now(), reloj = null, hecho = false;
    var caja = h('div', 'jg'), tabs = h('div', 'jg-tabs'), info = h('p', 'jg-info'), barra = h('div', 'jg-barra'), area = h('div'), msg = h('p', 'jg-msg');
    tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Elige un juego');
    JUEGOS.forEach(function (j, i) { var b = h('button', '', j[0]); b.type = 'button'; b.dataset.i = i; tabs.appendChild(b); });
    var tiempo = h('span', 'jg-tiempo', '0:00'), nuevo = h('button', '', 'Nuevo juego'); nuevo.type = 'button'; msg.setAttribute('role', 'status');
    barra.appendChild(tiempo); barra.appendChild(nuevo);
    var nota = h('p', 'jg-info', 'Juegos de lógica con las mismas reglas de los populares de LinkedIn, hechos para esperar tu pedido.'); nota.style.fontSize = '12px';
    [tabs, info, barra, msg, area, nota].forEach(function (e) { caja.appendChild(e); }); raiz.appendChild(caja);
    function empezar(i) {
      actual = i; hecho = false; msg.textContent = ''; area.innerHTML = ''; t0 = Date.now(); tiempo.textContent = '0:00';
      [].forEach.call(tabs.children, function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
      JUEGOS[i][1](area, info);
      area.addEventListener('ganó', function () { hecho = true; var s = Math.round((Date.now() - t0) / 1000); msg.textContent = '¡Resuelto en ' + fmt(s) + '! Prueba con otro.'; }, { once: true });
    }
    tabs.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) empezar(+b.dataset.i); });
    nuevo.addEventListener('click', function () { empezar(actual); });
    clearInterval(reloj); reloj = setInterval(function () { if (!hecho && document.body.contains(raiz)) tiempo.textContent = fmt(Math.round((Date.now() - t0) / 1000)); }, 1000);
    empezar(0);
  };
})();
