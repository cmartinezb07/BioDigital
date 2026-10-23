/* TecnoRápido · sitio de ejemplo de Bío Digital (estructura de "Kyntra"). Todo es simulado: no se envía nada. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- barra, fondo de la portada, frase que se ilumina y foto ---------- */
  var nav = $('[data-nav]'), hero = $('[data-hero]'), fondo = $('[data-fondo]'), tel = $('[data-telefono]'), conf = $('[data-conf-img]');
  var frase = $('[data-luz]'), palabras = [];
  if (frase) {
    var ws = frase.textContent.trim().split(/\s+/);
    frase.textContent = '';
    ws.forEach(function (w, i) { var s = document.createElement('span'); s.className = 'w'; s.textContent = w; frase.appendChild(s); if (i < ws.length - 1) frase.appendChild(document.createTextNode(' ')); palabras.push(s); });
  }
  function cuadro() {
    nav.classList.toggle('solida', window.scrollY > hero.offsetHeight - 80);
    if (reducido) return;
    if (window.scrollY < hero.offsetHeight) fondo.style.setProperty('--fy', (window.scrollY * 0.35).toFixed(1) + 'px');
    var r = frase.getBoundingClientRect();
    var k = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1), n = Math.round(k * palabras.length);
    palabras.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    var rc = conf.parentNode.getBoundingClientRect();
    if (rc.bottom > 0 && rc.top < innerHeight) conf.style.setProperty('--cy', (rc.top / innerHeight * -70).toFixed(1) + 'px');
  }
  var pedido = false;
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; cuadro(); }); } }, { passive: true });
  window.addEventListener('resize', cuadro);
  cuadro();

  /* El teléfono se inclina con el puntero */
  if (fino && !reducido) {
    hero.addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      tel.style.transform = 'translateY(18%) rotate(' + (-4 + x * 6).toFixed(2) + 'deg) translate(' + (x * 14).toFixed(1) + 'px,' + (y * 10).toFixed(1) + 'px)';
    });
  }
  /* El avance del teléfono se llena al cargar */
  var pct = $('[data-tel-pct]');
  if (pct && !reducido) { var t0 = null; (function paso(t) { t0 = t0 || t; var u = clamp((t - t0 - 900) / 1400, 0, 1); pct.textContent = Math.round(60 * (1 - Math.pow(1 - u, 3))) + '%'; if (u < 1) requestAnimationFrame(paso); })(performance.now()); }

  /* ---------- apariciones ---------- */
  if ('IntersectionObserver' in window && !reducido) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.revela').forEach(function (el) { io.observe(el); });
  } else $$('.revela').forEach(function (el) { el.classList.add('visto'); });

  /* ---------- cotizador (precios de ejemplo) ---------- */
  var DATA = {
    nb: { nombre: 'Notebook', fallas: [
      ['Pantalla quebrada o sin imagen', 60000, 120000], ['No enciende', 35000, 90000], ['Batería que dura poco', 30000, 60000],
      ['Va lento o se queda pegado', 20000, 40000], ['Teclado o trackpad con fallas', 25000, 55000], ['Se calienta de más', 20000, 35000]] },
    cel: { nombre: 'Celular', fallas: [
      ['Pantalla quebrada o sin imagen', 35000, 110000], ['Batería que dura poco', 20000, 45000], ['No carga', 20000, 40000],
      ['Se mojó o tiene humedad', 30000, 80000], ['Cámara con problemas', 25000, 70000], ['Parlante o micrófono', 18000, 35000]] }
  };
  var TOPE = 150000;
  var clp = function (n) { return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var st = { paso: 1, eq: null, falla: null };
  var pasosEl = $$('.paso'), pasoBtns = $$('#pasos-cot button'), lista = $('#lista-fallas'), modelo = $('#modelo');
  var mEls = { eq: $('[data-m="eq"]'), falla: $('[data-m="falla"]'), modelo: $('[data-m="modelo"]'), rango: $('[data-m="rango"]') };
  function setM(k, v) {
    var el = mEls[k]; if (el.textContent === v) return;
    el.textContent = v; el.classList.remove('nuevo'); void el.offsetWidth; if (!reducido) el.classList.add('nuevo');
  }
  function ir(n, foco) {
    st.paso = n;
    pasosEl.forEach(function (p) {
      var es = +p.getAttribute('data-paso') === n;
      p.hidden = !es;
      if (es && !reducido) { p.classList.remove('entra'); void p.offsetWidth; p.classList.add('entra'); }
    });
    pasoBtns.forEach(function (b, i) {
      var k = i + 1;
      b.classList.toggle('act', k === n); b.classList.toggle('hecho', k < n);
      if (k === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.disabled = k === 1 ? false : (k === 2 ? !st.eq : !st.falla);
    });
    $('#num-paso').textContent = n;
    if (foco) { var h = $('.paso[data-paso="' + n + '"] h3'); if (h) h.focus({ preventScroll: true }); }
  }
  function listaFallas() {
    lista.textContent = '';
    DATA[st.eq].fallas.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opcion'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-i', i);
      var k = document.createElement('span'); k.className = 'k'; k.textContent = String.fromCharCode(65 + i);
      var t = document.createElement('b'); t.textContent = f[0];
      b.appendChild(k); b.appendChild(t); lista.appendChild(b);
    });
  }
  $$('.opcion.eq').forEach(function (b) {
    b.addEventListener('click', function () {
      st.eq = b.getAttribute('data-eq'); st.falla = null;
      $$('.opcion.eq').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      setM('eq', DATA[st.eq].nombre); setM('falla', '—'); setM('rango', '—');
      listaFallas(); ir(2, true);
    });
  });
  lista.addEventListener('click', function (e) {
    var b = e.target.closest('.opcion'); if (!b) return;
    st.falla = +b.getAttribute('data-i');
    var f = DATA[st.eq].fallas[st.falla];
    $$('.opcion', lista).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    setM('falla', f[0]); setM('rango', clp(f[1]) + ' – ' + clp(f[2]) + ' (ejemplo)');
    resultado(f); ir(3, true);
  });
  var contar = 0;
  function resultado(f) {
    var chips = $('#res-chips'); chips.textContent = '';
    [DATA[st.eq].nombre, f[0]].forEach(function (t) { var s = document.createElement('span'); s.className = 'tag'; s.textContent = t; chips.appendChild(s); });
    var fin = clp(f[1]) + ' – ' + clp(f[2]), vEl = $('#rango-v'), barra = $('#barra');
    $('#rango-sr').textContent = 'Precio de ejemplo: entre ' + clp(f[1]) + ' y ' + clp(f[2]) + ' pesos chilenos.';
    var token = ++contar;
    barra.style.setProperty('--a', 0); barra.style.setProperty('--b', 0);
    requestAnimationFrame(function () {
      barra.style.setProperty('--a', (f[1] / TOPE * 100).toFixed(2));
      barra.style.setProperty('--b', ((f[2] - f[1]) / TOPE * 100).toFixed(2));
    });
    if (reducido) { vEl.textContent = fin; return; }
    var t0 = performance.now(), dur = 800;
    (function paso(t) {
      if (token !== contar) return;
      var u = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - u, 4);
      vEl.textContent = clp(f[1] * e) + ' – ' + clp(f[2] * e);
      if (u < 1) requestAnimationFrame(paso); else vEl.textContent = fin;
    })(t0);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ir]'); if (!b || b.disabled) return;
    ir(+b.getAttribute('data-ir'), true);
  });
  modelo.addEventListener('input', function () { setM('modelo', modelo.value.trim() || '—'); });
  $('#reiniciar').addEventListener('click', function () {
    st.eq = null; st.falla = null; modelo.value = '';
    $$('.opcion.eq').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    ['eq', 'falla', 'modelo', 'rango'].forEach(function (k) { setM(k, '—'); });
    ir(1, true);
  });

  /* ---------- seguimiento simulado ---------- */
  var ETAPAS = ['Recibido', 'Diagnóstico', 'Aprobación', 'Reparación', 'Listo para retiro'];
  var ORDENES = {
    'TR-2048': { eq: 'Notebook', falla: 'No enciende', hechos: 3, actual: 4, estado: 'En reparación', cl: '', pieza: 'Batería y ventilador',
      log: [['recibido', 'el notebook ingresó con la falla: no enciende'], ['diagnóstico', 'no carga y la batería no entrega energía'], ['aprobación', 'presupuesto aprobado por el cliente'], ['reparación', 'cambiando la batería y probando la carga'], ['pendiente', 'prueba final y aviso para retiro']] },
    'TR-1032': { eq: 'Celular', falla: 'Pantalla quebrada', hechos: 5, actual: 0, estado: 'Listo para retiro', cl: 'ok', pieza: 'Pantalla',
      log: [['recibido', 'el celular ingresó con la pantalla quebrada'], ['diagnóstico', 'vidrio y panel dañados, el resto funciona'], ['aprobación', 'presupuesto aprobado por el cliente'], ['reparación', 'pantalla cambiada y probada'], ['entrega', 'listo para retirar con garantía por escrito']] },
    'TR-3071': { eq: 'Notebook', falla: 'Se calienta de más', hechos: 1, actual: 2, estado: 'En diagnóstico', cl: 'dx', pieza: 'Batería y ventilador',
      log: [['recibido', 'el notebook ingresó con la falla: se calienta de más'], ['diagnóstico', 'revisando ventilador y pasta térmica'], ['pendiente', 'presupuesto para tu aprobación'], ['pendiente', 'reparación y entrega']] }
  };
  var form = $('#form-seg'), inp = $('#codigo'), err = $('#codigo-err'), orden = $('#orden'), tokenSeg = 0, timers = [];
  var CHECK = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function error(msg) { err.textContent = msg; inp.setAttribute('aria-invalid', 'true'); }
  function limpiar() { err.textContent = ''; inp.removeAttribute('aria-invalid'); }
  function buscar(raw) {
    limpiar();
    var txt = (raw || '').trim();
    if (!txt) { error('Escribe el código de tu orden, por ejemplo TR-2048.'); return; }
    var m = /^tr[\s\-_]?(\d{3,5})$/i.exec(txt);
    if (!m) { error('El código se ve así: TR-2048. Revisa las letras y los números.'); return; }
    var cod = 'TR-' + m[1], o = ORDENES[cod];
    if (!o) { error('No encontramos la orden ' + cod + '. En este ejemplo prueba con TR-2048, TR-1032 o TR-3071.'); return; }
    inp.value = cod;
    var tk = ++tokenSeg; timers.forEach(clearTimeout); timers = [];
    orden.innerHTML = '<div class="orden-buscando"><p class="mono">&gt; buscando orden ' + cod + ' ...</p></div>';
    timers.push(setTimeout(function () { if (tk === tokenSeg) mostrar(cod, o); }, reducido ? 0 : 650));
  }
  function mostrar(cod, o) {
    var li = ETAPAS.map(function (n, i) {
      var k = i + 1, cl = k <= o.hechos ? 'hecho' : (k === o.actual ? 'actual' : ''), et = k <= o.hechos ? 'Hecho' : (k === o.actual ? 'En curso' : 'Pendiente');
      return '<li class="' + cl + '"><span class="nodo">' + (k <= o.hechos ? CHECK : k) + '</span><div><b>' + n + '</b><small>' + et + '</small></div></li>';
    }).join('');
    orden.innerHTML =
      '<div class="orden-cab"><div><div class="cod-or">' + cod + '</div><p>' + o.eq + ' · ' + o.falla + '</p></div><span class="estado ' + o.cl + '">' + o.estado + '</span></div>' +
      '<ol class="linea" aria-label="Etapas de la reparación">' + li + '</ol>' +
      '<p class="pieza">Zona del equipo en trabajo: <b>' + o.pieza + '</b></p>' +
      '<div class="bitacora" aria-label="Bitácora de la orden"></div>' +
      '<p class="orden-nota">Seguimiento simulado de ejemplo. No es una orden real.</p>';
    var bit = $('.bitacora', orden), tk = tokenSeg;
    o.log.forEach(function (l, i) {
      function poner() {
        if (tk !== tokenSeg) return;
        var p = document.createElement('p'); p.className = (l[0] === 'pendiente' ? 'pend ' : '') + (reducido ? '' : 'nuevo');
        var b = document.createElement('b'); b.textContent = l[0] === 'pendiente' ? '… ' : '> ' + l[0] + ': ';
        p.appendChild(b); p.appendChild(document.createTextNode(l[0] === 'pendiente' ? 'pendiente: ' + l[1] : l[1])); bit.appendChild(p);
      }
      if (reducido) poner(); else timers.push(setTimeout(poner, 220 * (i + 1)));
    });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); buscar(inp.value); });
  inp.addEventListener('input', limpiar);
  $$('.chip[data-cod]').forEach(function (c) {
    c.addEventListener('click', function () { inp.value = c.getAttribute('data-cod'); buscar(inp.value); });
  });

  /* ---------- preguntas con altura animada ---------- */
  $$('.q').forEach(function (d) {
    var s = $('summary', d), c = $('.resp', d), anim = null;
    s.addEventListener('click', function (e) {
      if (reducido) return;
      e.preventDefault();
      if (anim) anim.cancel();
      if (!d.open) {
        d.open = true; d.classList.remove('cerrando');
        anim = c.animate([{ height: '0px' }, { height: c.scrollHeight + 'px' }], { duration: 360, easing: 'cubic-bezier(.32,.72,0,1)' });
        anim.onfinish = function () { anim = null; };
      } else {
        d.classList.add('cerrando');
        anim = c.animate([{ height: c.offsetHeight + 'px' }, { height: '0px' }], { duration: 240, easing: 'cubic-bezier(.32,.72,0,1)' });
        anim.onfinish = function () { d.open = false; d.classList.remove('cerrando'); anim = null; };
      }
    });
  });

  /* ---------- "Cotizar" en cada bloque: abre el cotizador con ese equipo y esa falla ---------- */
  $$('[data-cotizar]').forEach(function (a) {
    a.addEventListener('click', function () {
      var falla = a.getAttribute('data-cotizar');
      setTimeout(function () {
        $('.opcion.eq[data-eq="' + (a.getAttribute('data-eq-cot') || 'nb') + '"]').click();
        var op = $$('#lista-fallas .opcion').filter(function (o) { return o.textContent.indexOf(falla) > -1; })[0];
        if (op) op.click();
      }, reducido ? 0 : 500);
    });
  });
})();
