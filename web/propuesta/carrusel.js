// Carrusel curvo de ejemplos (adaptado de "Tilted Grid Hero" a JS puro, sin React ni Tailwind).
// Una fila de imágenes corre de derecha a izquierda por dentro de un cilindro: el centro mira de frente,
// los extremos se curvan hacia ti y se desvanecen. Cada imagen se corta en tiras verticales (facetas del cilindro).
// Uso: <div class="tg" data-tilt data-images='[{"src":"…","alt":"…","url":""}]'></div>
// Si una imagen trae `url`, la tarjeta abre esa página en una pestaña nueva; si no, es solo imagen.
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
        var pick = function (n) { return images[n % images.length]; };
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
          var lap = Math.round(e.elapsedTime / duration);
          var next = pick(lap * l.columns + first);
          imgs.forEach(function (im) { if (im.getAttribute('src') !== next.src) im.src = next.src; });
          el.dataset.i = (lap * l.columns + first) % images.length;
        });
        band.appendChild(el);
      })(t);
    }

    // Clic en una maqueta (o en el botón "Ver ejemplos en grande", que también sirve con teclado): se abre en grande
    var lb = null, at = 0, back = null;
    function show(n) {
      at = (n + images.length) % images.length;
      var im = images[at];
      lb.querySelector('img').src = im.src;
      lb.querySelector('img').alt = 'Ejemplo ilustrativo de página para ' + (im.rubro || 'tu rubro').toLowerCase();
      lb.querySelector('b').textContent = (im.rubro || '') + (im.nombre ? ' · ' + im.nombre : '');
      var act = lb.querySelector('.tg-lb-act');
      act.textContent = '';
      if (im.url) {
        var a = document.createElement('a'); a.className = 'btn btn-main btn-sm'; a.href = im.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Abrir la página completa';
        act.appendChild(a);
      } else { act.textContent = 'La página completa estará disponible pronto.'; }
      lb.querySelector('.tg-lb-n').textContent = (at + 1) + ' de ' + images.length;
    }
    function open(n) {
      if (!lb) {
        lb = document.createElement('div');
        lb.className = 'tg-lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Ejemplo de página');
        lb.innerHTML = '<div class="tg-lb-in"><button class="tg-lb-x" type="button" aria-label="Cerrar">×</button>' +
          '<img alt=""><div class="tg-lb-pie"><div><b></b><small>Ilustración de ejemplo · <span class="tg-lb-n"></span></small></div><span class="tg-lb-act"></span>' +
          '<span class="tg-lb-nav"><button type="button" class="btn btn-sm" data-d="-1" aria-label="Anterior">←</button><button type="button" class="btn btn-sm" data-d="1" aria-label="Siguiente">→</button></span></div></div>';
        lb.addEventListener('click', function (e) {
          var d = e.target.closest('[data-d]');
          if (d) show(at + Number(d.dataset.d));
          else if (e.target === lb || e.target.closest('.tg-lb-x')) close();
        });
        document.body.appendChild(lb);
      }
      back = document.activeElement;
      show(n);
      lb.hidden = false;
      document.documentElement.classList.add('tg-lb-abierto');
      lb.querySelector('.tg-lb-x').focus();
    }
    function close() {
      lb.hidden = true;
      document.documentElement.classList.remove('tg-lb-abierto');
      if (back && back.focus) back.focus();
    }
    document.addEventListener('keydown', function (e) {
      if (!lb || lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'Tab') {
        var f = [].slice.call(lb.querySelectorAll('button, a[href]'));
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    band.addEventListener('click', function (e) {
      var t = e.target.closest('.tg-tile');
      if (t) open(Number(t.dataset.i) || 0);
    });
    [].forEach.call(document.querySelectorAll('[data-tilt-open]'), function (b) { b.addEventListener('click', function () { open(0); }); });

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
