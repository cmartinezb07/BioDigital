// Comportamiento de la capa de movimiento (opción 8). Se carga con defer, después de mundo.js y secciones.js.
(function () {
  var root = document.documentElement;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var wide = matchMedia('(min-width: 1201px)');
  var hasIO = 'IntersectionObserver' in window;
  var scrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');
  var viewTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');

  // Barra de lectura y cabecera asentada
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  var top = document.querySelector('.top');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (top) top.classList.toggle('scrolled', scrollY > 24);
      if (!scrollTimeline) {
        var max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
      }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cuenta con formato chileno ($250.000); la última cuenta pedida manda
  function count(el, ms, delay) {
    var raw = el.dataset.final || el.textContent;
    el.dataset.final = raw;
    var to = Number(raw.replace(/\D/g, ''));
    var money = raw.indexOf('$') === 0;
    var fmt = function (n) { return (money ? '$' : '') + n.toLocaleString('es-CL'); };
    if (calm || !to) { el.textContent = raw; return; }
    var token = el.dataset.run = String(Math.random());
    var t0 = performance.now() + (delay || 0);
    el.textContent = fmt(0);
    var step = function (now) {
      if (el.dataset.run !== token) return;
      var t = Math.min(Math.max((now - t0) / ms, 0), 1);
      el.textContent = t < 1 ? fmt(Math.round(to * (1 - Math.pow(1 - t, 4)) / (money ? 1000 : 1)) * (money ? 1000 : 1)) : raw;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if (!hasIO) return;

  // Elementos que se animan al aparecer, fuera del .reveal común
  var seen = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (!el.classList.contains('reveal')) el.style.setProperty('--ri', n++);
      el.classList.add('in');
      seen.unobserve(el);
      if (el.classList.contains('dim')) { var p = el.querySelector('.pts b'); if (p) count(p, 1200, 250); }
      if (el.classList.contains('plan')) { var pr = el.querySelector('.price b'); if (pr) count(pr, 1400, 300); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  document.querySelectorAll('.steps, .card, .dim, .plan').forEach(function (el) { seen.observe(el); });

  // Sin scroll-driven: el panel se endereza al aparecer
  var dash = document.querySelector('[data-dash]');
  if (dash && !viewTimeline) {
    var flat = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      flat.disconnect();
      setTimeout(function () { dash.classList.add('flat'); }, 500);
    }, { threshold: .25 });
    flat.observe(dash);
  }

  // Efectos en bucle en pausa fuera de pantalla
  var loops = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('off', !e.isIntersecting); });
  }, { rootMargin: '120px 0px' });
  document.querySelectorAll('.hero, .final').forEach(function (el) { loops.observe(el); });

  // Panel: la selección recorre las secciones del proyecto
  var side = dash && dash.querySelector('.dash-side');
  if (side && !calm) {
    var items = [].slice.call(side.querySelectorAll('span'));
    var sel = side.querySelector('.sel');
    var i = 0, timer = null;
    var place = function () {
      items.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      sel.style.height = items[i].offsetHeight + 'px';
      sel.style.translate = '0 ' + items[i].offsetTop + 'px';
    };
    var run = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        if (document.hidden || dash.closest('.hero').classList.contains('off')) return;
        i = (i + 1) % items.length;
        place();
      }, 2600);
    };
    place();
    run();
    addEventListener('resize', place, { passive: true });
  } else if (side) {
    var s0 = side.querySelector('span');
    var sel0 = side.querySelector('.sel');
    sel0.style.height = s0.offsetHeight + 'px';
    sel0.style.translate = '0 ' + s0.offsetTop + 'px';
  }

  // Tarjetas del inicio: se desplazan un poco con el mouse, cada una a su profundidad
  if (fine && !calm) {
    var hero = document.querySelector('.hero');
    var cards = [].slice.call(document.querySelectorAll('[data-par]'));
    var px = 0, py = 0, queued = false;
    hero.addEventListener('pointermove', function (e) {
      if (!wide.matches) return;
      px = e.clientX / innerWidth - .5;
      py = e.clientY / innerHeight - .5;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        cards.forEach(function (c) {
          var k = Number(c.dataset.par);
          c.style.setProperty('--px', (px * k).toFixed(1) + 'px');
          c.style.setProperty('--py', (py * k).toFixed(1) + 'px');
        });
      });
    });
  }
})();
