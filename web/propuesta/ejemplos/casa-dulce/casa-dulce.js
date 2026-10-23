// Casa Dulce (estructura de "Boolka"): menú a pantalla completa, foto con desplazamiento lento, garabatos que se
// dibujan, apariciones, galería con miniaturas, horario de hoy, confeti y encargo de tortas en cuatro pasos (demostración).
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pesos = function (n) { return '$' + Math.round(n).toLocaleString('es-CL'); };
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raiz = document.documentElement;

  /* ---------- Menú ---------- */
  var menu = $('[data-menu]'), btn = $('[data-menu-btn]');
  var abrir = function (si) {
    btn.setAttribute('aria-expanded', String(si));
    raiz.classList.toggle('bloq', si);
    if (si) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('abierto'); }); }
    else { menu.classList.remove('abierto'); setTimeout(function () { if (!menu.classList.contains('abierto')) menu.hidden = true; }, mqReduce.matches ? 0 : 800); }
  };
  btn.addEventListener('click', function () { abrir(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { abrir(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { abrir(false); btn.focus(); } });

  /* ---------- Scroll: cabecera, foto de portada ---------- */
  var cab = $('[data-cab]'), heroImg = $('[data-hero-img]');
  var cuadro = function () {
    cab.classList.toggle('solida', window.scrollY > 30);
    if (!mqReduce.matches && window.scrollY < innerHeight * 1.3) heroImg.style.setProperty('--hy', (window.scrollY * 0.2).toFixed(1) + 'px');
  };
  window.addEventListener('scroll', function () { requestAnimationFrame(cuadro); }, { passive: true });
  cuadro();

  /* ---------- Apariciones (también dibujan los garabatos y el pie) ---------- */
  var extras = [$('.favoritos'), $('.pie')];
  if ('IntersectionObserver' in window && !mqReduce.matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.classList.contains('favoritos') ? 'visto-g' : 'visto');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.revela').concat(extras).forEach(function (el) { io.observe(el); });
  } else { $$('.revela').forEach(function (el) { el.classList.add('visto'); }); extras[0].classList.add('visto-g'); extras[1].classList.add('visto'); }

  /* ---------- Galería del local ---------- */
  var gImg = $('[data-gal-img]'), gTxt = $('[data-gal-txt]'), minis = $$('[data-foto]');
  minis.forEach(function (b) {
    b.addEventListener('click', function () {
      minis.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      var poner = function () {
        gImg.src = b.dataset.foto; gImg.alt = b.dataset.t;
        $('b', gTxt).textContent = b.dataset.t; $('span', gTxt).textContent = b.dataset.s;
        gImg.classList.remove('cambia');
      };
      if (mqReduce.matches) { poner(); return; }
      gImg.classList.add('cambia'); setTimeout(poner, 300);
    });
  });

  /* ---------- Horario: marca el día de hoy ---------- */
  var dia = new Date().getDay(), fila = null;
  $$('[data-horas] [data-dia]').forEach(function (f) { var d = +f.dataset.dia; if (d === dia || (d === 2 && dia >= 2 && dia <= 5)) fila = f; });
  if (fila) fila.classList.add('hoy');

  /* ---------- Confeti suave ---------- */
  var confeti = (function () {
    var cv = $('#confeti'), ctx = cv && cv.getContext && cv.getContext('2d'), parts = [], corriendo = false, t0 = 0, dpr = 1, W = 0, H = 0;
    var colores = ['#D7385E', '#F6D776', '#93C47D', '#FFFBF3', '#8B4A3A', '#F59AAE'];
    function medir() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function frame(t) {
      if (!corriendo) return;
      var dt = Math.min(32, t - t0) / 16.7; t0 = t;
      ctx.clearRect(0, 0, W, H);
      var vivas = 0;
      parts.forEach(function (p) {
        p.vy += 0.16 * dt; p.vx *= 0.992; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.vida -= dt;
        if (p.vida <= 0 || p.y > H + 20) return;
        vivas++;
        ctx.save(); ctx.globalAlpha = Math.min(1, p.vida / 40); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.strokeStyle = '#4A2C2A'; ctx.lineWidth = 1.6;
        if (p.forma === 0) { ctx.beginPath(); ctx.arc(0, 0, p.s * 0.55, 0, 6.283); ctx.fill(); ctx.stroke(); }
        else { var w = p.s * 1.5, h = p.s * 0.7, r = h / 2; ctx.beginPath(); ctx.moveTo(-w / 2 + r, -h / 2); ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, r); ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, r); ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, r); ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, r); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      });
      if (vivas) requestAnimationFrame(frame); else { corriendo = false; ctx.clearRect(0, 0, W, H); }
    }
    return function (x, y) {
      if (!ctx || mqReduce.matches) return;
      medir();
      parts = [];
      for (var i = 0; i < 70; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 5 + Math.random() * 6;
        parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25, s: 7 + Math.random() * 6, c: colores[i % colores.length], forma: i % 3 === 0 ? 0 : 1, vida: 90 + Math.random() * 60 });
      }
      if (!corriendo) { corriendo = true; t0 = performance.now(); requestAnimationFrame(frame); }
    };
  })();

  /* ---------- Encargo de tortas ---------- */
  (function () {
    var form = $('#form-encargo');
    if (!form) return;
    var avisoDemo = form.getAttribute('data-demo');
    var inpFecha = $('#fecha'), selHora = $('#hora'), inpNombre = $('#nombre'), inpDed = $('#dedicatoria');
    var errFecha = $('#err-fecha'), estado = $('#estado-form'), banner = $('#hecho-banner');
    var mini = $('#mini'), miniCuerpo = $('#mini-cuerpo');
    var esc = { '10': 0.82, '15': 1, '20': 1.16 };

    // Fecha mínima: dentro de dos días
    function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    var hoy = new Date(); hoy.setHours(12, 0, 0, 0);
    var minimo = new Date(hoy); minimo.setDate(minimo.getDate() + 2);
    var maximo = new Date(hoy); maximo.setDate(maximo.getDate() + 90);
    inpFecha.min = iso(minimo); inpFecha.max = iso(maximo);

    function leer(nombre) { var el = $('input[name="' + nombre + '"]:checked', form); return el || null; }
    function fechaObj() { if (!inpFecha.value) return null; var p = inpFecha.value.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
    function fechaLarga(d) { return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }); }
    function poner(id, txt, vacio) { var el = $(id); el.textContent = txt; el.classList.toggle('vacio', !!vacio); }

    function validarFecha() {
      var d = fechaObj(), msg = '';
      if (d) {
        if (d < minimo) msg = 'Necesitamos dos días de anticipación. Elige un día más adelante.';
        else if (d > maximo) msg = 'Elige un día dentro de los próximos tres meses.';
        else if (d.getDay() === 1) msg = 'Los lunes descansamos. Elige otro día.';
      }
      errFecha.textContent = msg; errFecha.classList.toggle('ver', !!msg);
      inpFecha.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return { ok: !!d && !msg, msg: msg };
    }

    function actualizar() {
      var t = leer('tamano'), s = leer('sabor'), f = validarFecha(), h = selHora.value, nombre = inpNombre.value.trim(), ded = inpDed.value.trim();
      var listo = { tamano: !!t, sabor: !!s, retiro: f.ok && !!h, datos: nombre.length > 1 };

      if (t) poner('#r-tamano', t.dataset.nombre); else poner('#r-tamano', 'Sin elegir', true);
      if (s) poner('#r-sabor', s.dataset.nombre); else poner('#r-sabor', 'Sin elegir', true);
      var d = fechaObj();
      if (d && f.ok && h) poner('#r-retiro', fechaLarga(d) + ', ' + h);
      else if (d && f.ok) poner('#r-retiro', fechaLarga(d), false);
      else poner('#r-retiro', 'Sin elegir', true);
      if (nombre) poner('#r-nombre', nombre); else poner('#r-nombre', 'Sin completar', true);
      if (ded) poner('#r-ded', '“' + ded + '”'); else poner('#r-ded', 'Sin mensaje', true);

      var total = t ? parseInt(t.dataset.precio, 10) + (s ? parseInt(s.dataset.extra, 10) : 0) : 0;
      $('#r-total').textContent = pesos(total);

      var msg = 'Hola Casa Dulce, quiero encargar una torta';
      if (t) msg += ' de ' + t.value + ' porciones';
      if (s) msg += ', sabor ' + s.dataset.nombre.toLowerCase();
      if (d && f.ok) msg += ', para retirar el ' + fechaLarga(d) + (h ? ' a las ' + h : '');
      msg += '.';
      if (ded) msg += ' Mensaje en la torta: “' + ded + '”.';
      if (nombre) msg += ' Mi nombre es ' + nombre + '.';
      if (t && s && listo.retiro && listo.datos) msg += ' Total de ejemplo: ' + pesos(total) + '. ¡Gracias!';
      $('#r-mensaje').textContent = (t || s || d || nombre) ? msg : 'Elige un tamaño, un sabor y un día para armar el mensaje.';

      var n = 0;
      $$('.paso', form).forEach(function (p) { var ok = listo[p.dataset.paso]; p.classList.toggle('listo', ok); if (ok) n++; });
      $('#txt-avance').textContent = n === 4 ? '¡Listo! Los cuatro pasos están completos' : 'Llevas ' + n + ' de 4 pasos';
      $('#barra-avance').parentNode.style.setProperty('--av', n / 4);
      $('#barra-avance').style.setProperty('--av', n / 4);
      form.dataset.completo = n === 4 ? 'si' : 'no';
      // El aviso de demostración solo salta cuando el encargo está completo
      if (n === 4) form.setAttribute('data-demo', avisoDemo); else form.removeAttribute('data-demo');

      if (s) mini.setAttribute('data-sabor', s.value);
      if (t) miniCuerpo.style.setProperty('--esc', esc[t.value] || 1);
      return { n: n, listo: listo };
    }

    function rebote() { mini.classList.remove('salta'); void mini.getBoundingClientRect(); mini.classList.add('salta'); }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'tamano' || e.target.name === 'sabor') { if (!mqReduce.matches) rebote(); }
      estado.textContent = ''; estado.className = 'estado-form'; banner.classList.remove('ver');
      actualizar();
    });
    form.addEventListener('input', function () { estado.textContent = ''; estado.className = 'estado-form'; banner.classList.remove('ver'); actualizar(); });

    form.addEventListener('submit', function (e) {
      var r = actualizar();
      if (r.n < 4) {
        e.preventDefault();
        var falta = ['tamano', 'sabor', 'retiro', 'datos'].filter(function (k) { return !r.listo[k]; })[0];
        var textos = { tamano: 'Te falta elegir el tamaño.', sabor: 'Te falta elegir el sabor.', retiro: 'Te falta elegir el día y la hora de retiro.', datos: 'Te falta tu nombre.' };
        estado.textContent = textos[falta]; estado.className = 'estado-form mal';
        var fs = $('.paso[data-paso="' + falta + '"]', form);
        var foco = $('input, select', fs);
        if (fs) { fs.scrollIntoView({ block: 'center', behavior: mqReduce.matches ? 'auto' : 'smooth' }); }
        if (foco) foco.focus({ preventScroll: true });
        return;
      }
      // Encargo completo: confeti y mensaje. El aviso de "esto es un ejemplo" lo muestra la cinta compartida.
      var b = $('button[type="submit"]', form).getBoundingClientRect();
      confeti(b.left + b.width / 2, b.top + b.height / 2);
      estado.textContent = ''; estado.className = 'estado-form';
      banner.classList.add('ver');
    });

    actualizar();
  })();
})();
