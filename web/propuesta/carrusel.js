// Carrusel curvo de ejemplos (adaptado de "Tilted Grid Hero" a JS puro, sin React ni Tailwind).
// Una fila de imágenes corre de derecha a izquierda por dentro de un cilindro: el centro mira de frente,
// los extremos se curvan hacia ti y se desvanecen. Cada imagen se corta en tiras verticales (facetas del cilindro).
// Uso: <div class="tg" data-tilt data-images='[{"src":"…","alt":"…","url":""}]'></div>
// Al hacer clic se abre un visor con la página en vivo (`url`) y un botón para abrirla completa en otra pestaña.
(function () {
  var SLICES = 16, CAMERA = 1.6, MAX_WIDTH = 55;
  var arc = function (bend) { return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend)); };
  var round = function (n) { return +n.toFixed(4); };

  function measure(width, height, o, bend) {
    var h = Math.min((o.tileHeight / 100) * height, ((MAX_WIDTH / 100) * width) / o.aspect);
    var radius = width * arc(bend);
    if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
    var deg = function (r) { return (r * 180) / Math.PI; };
    var unit = deg(h / radius);
    var pitch = (o.aspect + o.gap / 100) * unit;
    var limit = deg(bend) + (o.aspect * unit) / 2;
    var columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
    var sweep = round((columns * pitch) / 2);
    return { columns: columns, sweep: sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
  }

  function init(root) {
    var images;
    try { images = JSON.parse(root.dataset.images || '[]'); } catch (e) { images = []; }
    if (!images.length) return;
    var d = root.dataset;
    var o = {
      speed: +d.speed || 4, tileHeight: +d.tileHeight || 40, aspect: +d.aspect || 1.6,
      gap: d.gap !== undefined ? +d.gap : 8, axis: +d.axis || 50, curve: +d.curve || 70, fade: d.fade !== undefined ? +d.fade : 14
    };
    var bend = (Math.min(85, Math.max(5, o.curve)) * Math.PI) / 180;
    var id = Math.random().toString(36).slice(2, 8);
    var orbit = 'tgh-o-' + id, tile = 'tgh-t-' + id;
    var r = 100 * arc(bend), radius = round(r) + 'cqw';
    var turn = function (g) { return 'translateZ(' + radius + ') rotateY(' + round(g) + 'deg) translateZ(-' + radius + ')'; };
    var u = function (n) { return 'calc(' + round(n) + ' * min(' + o.tileHeight + 'cqh, ' + round(MAX_WIDTH / o.aspect) + 'cqw))'; };
    var mask = 'linear-gradient(90deg,transparent,#000 ' + o.fade + '%,#000 ' + (100 - o.fade) + '%,transparent)';

    var style = document.createElement('style');
    var band = document.createElement('div');
    band.className = 'tg-band';
    band.setAttribute('aria-hidden', 'true');
    band.style.perspective = round(r * CAMERA) + 'cqw';
    band.style.perspectiveOrigin = '50% ' + o.axis + '%';
    band.style.maskImage = band.style.webkitMaskImage = mask;
    root.append(style, band);
    root.style.containerType = 'size';

    images.forEach(function (im) { new Image().src = im.src; });   // se cargan todas antes de que den la vuelta

    var key = '';
    function build(l) {
      var hide = round(((l.sweep - l.limit) / (2 * l.sweep || 1)) * 100);
      var duration = l.columns * o.speed, share = o.aspect / SLICES;
      style.textContent =
        '@keyframes ' + orbit + '{from{transform:' + turn(-l.sweep) + '}to{transform:' + turn(l.sweep) + '}' +
        '0%,' + hide + '%,' + (100 - hide) + '%,100%{visibility:hidden}' +
        (hide + 0.001) + '%,' + (100 - hide - 0.001) + '%{visibility:visible}}' +
        '@media(prefers-reduced-motion:reduce){.' + tile + '{animation-play-state:paused}}' +
        '.tg-band:hover .' + tile + '{animation-play-state:paused}';
      band.textContent = '';
      for (var t = 0; t < l.columns; t++) (function (t) {
        var first = l.columns - 1 - t;
        var pick = function (n) { return images[((n % images.length) + images.length) % images.length]; };
        var cur = pick(first);
        var el = document.createElement('div');
        el.className = tile + ' tg-tile';
        el.dataset.i = first % images.length;
        el.style.cssText = 'left:calc(50% - ' + u(o.aspect / 2) + ');top:calc(' + o.axis + '% - ' + u(0.5) + ');width:' + u(o.aspect) +
          ';height:' + u(1) + ';animation:' + orbit + ' ' + duration + 's linear ' + (-t * o.speed) + 's infinite';
        var imgs = [];
        for (var k = 0; k < SLICES; k++) {
          var s = document.createElement('div');
          s.className = 'tg-slice' + (k === 0 ? ' tg-first' : '') + (k === SLICES - 1 ? ' tg-last' : '');
          s.style.left = u((o.aspect - share) / 2);
          s.style.width = k === SLICES - 1 ? u(share) : 'calc(' + u(share) + ' + 1px)';
          s.style.height = u(1);
          s.style.transform = turn((o.aspect / 2 - (k + 0.5) * share) * l.unit);
          var img = document.createElement('img');
          img.alt = ''; img.draggable = false; img.src = cur.src;
          img.style.left = u(-k * share); img.style.width = u(o.aspect); img.style.height = u(1);
          s.appendChild(img); el.appendChild(s); imgs.push(img);
        }
        // Al dar la vuelta (fuera de pantalla) la tarjeta toma la imagen que sigue
        el.addEventListener('animationiteration', function (e) {
          var an = el.getAnimations()[0];
          var lap = an ? an.effect.getComputedTiming().currentIteration : Math.round(e.elapsedTime / duration);
          var next = pick(lap * l.columns + first);
          imgs.forEach(function (im) { if (im.getAttribute('src') !== next.src) im.src = next.src; });
          el.dataset.i = images.indexOf(next);
        });
        band.appendChild(el);
      })(t);
      cycle = duration * 1000;
    }

    // Arrastre con dedo o mouse: mueve el carrusel a gusto; al soltar sigue con la inercia y vuelve solo al movimiento de siempre.
    var cycle = 0, drag = null, inercia = 0, arrastro = false;
    function anims() { return band.getAnimations({ subtree: true }); }
    function pxPorSeg() {
      var u = Math.min(o.tileHeight / 100 * root.clientHeight, MAX_WIDTH / o.aspect / 100 * root.clientWidth);
      return ((o.aspect + o.gap / 100) * u) / o.speed;   // píxeles que recorre una tira por segundo en el centro
    }
    function mover(ms) {
      // Se adelanta un múltiplo de la cantidad de imágenes (la imagen de cada tira no cambia) para poder arrastrar hacia atrás sin tiempos negativos
      var salto = cycle * images.length * 20;
      anims().forEach(function (a) { var t = (a.currentTime || 0) + ms; a.currentTime = t < cycle * 2 ? t + salto : t; });
    }
    function soltar(v0, ppS) {
      // v0 en px/ms (positivo = hacia la derecha). El movimiento normal es hacia la izquierda: ppS/1000 px/ms.
      var v = v0, normal = ppS / 1000, last = performance.now();
      function paso(now) {
        var dt = Math.min(48, now - last); last = now;
        v *= Math.exp(-dt / 420);
        mover(((normal - v) * dt) / ppS * 1000);
        if (Math.abs(v) < 0.02) { inercia = 0; anims().forEach(function (a) { a.play(); }); band.classList.remove('arrastrando'); return; }
        inercia = requestAnimationFrame(paso);
      }
      inercia = requestAnimationFrame(paso);
    }
    band.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (inercia) { cancelAnimationFrame(inercia); inercia = 0; }
      drag = { id: e.pointerId, x0: e.clientX, x: e.clientX, t: performance.now(), v: 0, activo: false };
    });
    band.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, now = performance.now();
      if (!drag.activo) {
        if (Math.abs(e.clientX - drag.x0) < 6) return;
        drag.activo = true; arrastro = true; band.classList.add('arrastrando');
        try { band.setPointerCapture(e.pointerId); } catch (er) {}
        anims().forEach(function (a) { a.pause(); });
      }
      var dt = Math.max(1, now - drag.t);
      drag.v = 0.8 * (dx / dt) + 0.2 * drag.v;   // velocidad suavizada, px/ms
      drag.x = e.clientX; drag.t = now;
      mover(-dx / pxPorSeg() * 1000);              // arrastrar a la izquierda = avanzar
    });
    function fin(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.activo) return;
      var quieto = performance.now() - d.t > 90;
      soltar(quieto ? 0 : Math.max(-3, Math.min(3, d.v)), pxPorSeg());   // tope de velocidad: un salto brusco no lanza el carrusel por los aires
      setTimeout(function () { arrastro = false; }, 0);
    }
    band.addEventListener('pointerup', fin);
    band.addEventListener('pointercancel', fin);

    // Clic en un ejemplo (o en "Ver ejemplos en grande", que también sirve con teclado): se abre el visor con la página en vivo.
    // La página corre dentro de un marco a su ancho real (1440 escritorio, 390 celular) y se escala para caber.
    var lb = null, at = 0, back = null, modo = window.innerWidth < 760 ? 'cel' : 'pc', propio = '';
    var ANCHO = { pc: 1440, cel: 390 }, ALTO = { pc: 900, cel: 844 };
    function ajustar() {
      if (!lb || lb.hidden) return;
      var caja = lb.querySelector('.tg-lb-vista'), fr = lb.querySelector('iframe');
      var w = ANCHO[modo], h = ALTO[modo];
      var disp = caja.clientWidth, maxH = Math.max(240, window.innerHeight - 230);
      var k = Math.min(disp / w, maxH / h, 1);
      fr.style.width = w + 'px'; fr.style.height = h + 'px'; fr.style.transform = 'scale(' + k + ')';
      caja.style.height = (Math.round(h * k) + (modo === 'cel' ? 26 : 30)) + 'px';
      lb.querySelector('.tg-lb-pantalla').style.width = Math.round(w * k) + 'px';
    }
    function cargar() {
      var im = images[at], fr = lb.querySelector('iframe'), ph = lb.querySelector('.tg-lb-ph');
      ph.src = im.ph || im.src; ph.hidden = false; lb.classList.add('cargando');
      fr.onload = function () { if (fr.dataset.k === String(at) + modo) { ph.hidden = true; lb.classList.remove('cargando'); } };
      fr.dataset.k = String(at) + modo;
      fr.src = im.url ? im.url + (propio ? '?negocio=' + encodeURIComponent(propio) : '') : 'about:blank';
      fr.title = 'Vista en vivo: ' + (im.nombre || 'ejemplo');
    }
    function show(n) {
      at = (n + images.length) % images.length;
      var im = images[at];
      lb.querySelector('b').textContent = propio ? propio + ' · así se vería tu página' : (im.nombre || '');
      lb.querySelector('.tg-lb-meta').textContent = [im.rubro, im.comuna, im.que].filter(Boolean).join(' · ');
      lb.querySelector('.tg-lb-dir').textContent = (propio || im.nombre || 'ejemplo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '') + '.cl';
      var a = lb.querySelector('.tg-lb-abrir');
      a.href = im.url ? im.url + (propio ? '?negocio=' + encodeURIComponent(propio) : '') : '#'; a.hidden = !im.url;
      lb.querySelector('.tg-lb-n').textContent = (at + 1) + ' de ' + images.length;
      cargar(); ajustar();
    }
    function setModo(m, soloMarcar) {
      modo = m;
      [].forEach.call(lb.querySelectorAll('[data-modo]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.modo === m)); });
      lb.classList.toggle('es-cel', m === 'cel');
      if (!soloMarcar) { cargar(); ajustar(); }
    }
    function open(n) {
      if (!lb) {
        lb = document.createElement('div');
        lb.className = 'tg-lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Ejemplo de página en vivo');
        lb.innerHTML = '<div class="tg-lb-in"><button class="tg-lb-x" type="button" aria-label="Cerrar">×</button>' +
          '<div class="tg-lb-cab"><div><b></b><small class="tg-lb-meta"></small></div>' +
          '<div class="tg-lb-modo" role="group" aria-label="Tamaño de pantalla"><button type="button" data-modo="pc" aria-pressed="true">Escritorio</button><button type="button" data-modo="cel" aria-pressed="false">Celular</button></div></div>' +
          '<div class="tg-lb-vista"><div class="tg-lb-pantalla"><div class="tg-lb-barra" aria-hidden="true"><i></i><i></i><i></i><span class="tg-lb-dir"></span></div>' +
          '<div class="tg-lb-marco"><img class="tg-lb-ph" alt=""><iframe loading="lazy" referrerpolicy="no-referrer"></iframe></div></div></div>' +
          '<div class="tg-lb-pie"><small>Negocio ficticio, hecho por Bío Digital · <span class="tg-lb-n"></span><span class="tg-lb-desliza"> · desliza para cambiar</span></small>' +
          '<a class="btn btn-main btn-sm tg-lb-abrir" target="_blank" rel="noopener">Abrir la página completa ↗</a>' +
          '<span class="tg-lb-nav"><button type="button" class="btn btn-sm" data-d="-1" aria-label="Ejemplo anterior">←</button><button type="button" class="btn btn-sm" data-d="1" aria-label="Ejemplo siguiente">→</button></span></div></div>';
        lb.addEventListener('click', function (e) {
          var d = e.target.closest('[data-d]'), m = e.target.closest('[data-modo]');
          if (d) show(at + Number(d.dataset.d));
          else if (m) setModo(m.dataset.modo);
          else if (e.target === lb || e.target.closest('.tg-lb-x')) close();
        });
        window.addEventListener('resize', ajustar);
        deslizar(lb.querySelector('.tg-lb-in'));
        document.body.appendChild(lb);
      }
      back = document.activeElement;
      lb.hidden = false;
      document.documentElement.classList.add('tg-lb-abierto');
      setModo(window.innerWidth < 760 ? 'cel' : modo, true);
      show(n);
      lb.querySelector('.tg-lb-x').focus();
    }
    // Deslizar a los lados cambia de ejemplo: en el marco del visor y también dentro de la página en vivo (es del mismo sitio)
    function deslizar(el) {
      var g = null;
      function ini(e) { var t = e.touches ? e.touches[0] : e; g = { x: t.clientX, y: t.clientY, t: Date.now() }; }
      function fin(e) {
        if (!g) return;
        var t = e.changedTouches ? e.changedTouches[0] : e, dx = t.clientX - g.x, dy = t.clientY - g.y, dt = Date.now() - g.t; g = null;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8 && dt < 700) show(at + (dx < 0 ? 1 : -1));
      }
      el.addEventListener('touchstart', ini, { passive: true });
      el.addEventListener('touchend', fin, { passive: true });
      var fr = el.querySelector('iframe');
      fr.addEventListener('load', function () {
        try {
          var d = fr.contentDocument;
          if (!d || d.location.href === 'about:blank') return;
          d.addEventListener('touchstart', ini, { passive: true });
          d.addEventListener('touchend', fin, { passive: true });
        } catch (er) { /* otra dirección: solo el marco del visor */ }
      });
    }
    function close() {
      lb.hidden = true; propio = '';
      lb.querySelector('iframe').src = 'about:blank';   // la página deja de correr al cerrar
      document.documentElement.classList.remove('tg-lb-abierto');
      if (back && back.focus) back.focus();
    }
    document.addEventListener('keydown', function (e) {
      if (!lb || lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'Tab') {
        var f = [].slice.call(lb.querySelectorAll('button, a[href]:not([hidden]), iframe'));
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    // En 3D el navegador no siempre entrega el clic a la tarjeta: se busca la tira que queda bajo el puntero
    band.addEventListener('click', function (e) {
      if (arrastro) return;
      var t = e.target.closest('.tg-tile');
      if (!t) [].some.call(band.querySelectorAll('.tg-tile'), function (el) {
        if (getComputedStyle(el).visibility === 'hidden') return false;
        return [].some.call(el.children, function (sl) {
          var r = sl.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) { t = el; return true; }
        });
      });
      if (t) open(Number(t.dataset.i) || 0);
    });
    [].forEach.call(document.querySelectorAll('[data-tilt-open]'), function (b) { b.addEventListener('click', function () { open(0); }); });
    // "Mira tu página": abre el ejemplo de un rubro con el nombre del negocio del visitante
    window.BDVisor = { abrir: function (i, negocio) { propio = String(negocio || '').trim().slice(0, 40); open(i); }, rubros: images.map(function (im) { return im.rubro; }) };

    var ro = new ResizeObserver(function (es) {
      var cr = es[0].contentRect;
      if (!cr.width || !cr.height) return;
      var l = measure(cr.width, cr.height, o, bend);
      var k2 = l.columns + '|' + l.sweep + '|' + l.unit;
      if (k2 === key) return;
      key = k2;
      build(l);
      band.style.opacity = 1;
    });
    ro.observe(root);
  }

  document.querySelectorAll('[data-tilt]').forEach(init);
})();
