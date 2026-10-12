// Comportamiento común de las opciones 2 a 5: puntaje del informe, beneficio y formulario de maqueta.
// Cada opción dibuja el puntaje a su manera leyendo la variable --p (0 a 100) del elemento [data-score].
(function () {
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cuenta suave de un número a otro; la última cuenta pedida manda
  function countTo(el, to, ms, delay) {
    if (!el) return;
    var from = Number(el.dataset.shown || el.textContent) || 0;
    el.dataset.shown = to;
    if (calm) { el.textContent = to; return; }
    var t0 = performance.now() + (delay || 0);
    var step = function (now) {
      if (Number(el.dataset.shown) !== to) return;
      var t = Math.min(Math.max((now - t0) / ms, 0), 1);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  window.bdCountTo = countTo;

  // Números que suben al aparecer: [data-count="42"]
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var to = Number(el.dataset.count);
    if (calm || !('IntersectionObserver' in window)) { el.textContent = to; return; }
    el.textContent = '0';
    el.dataset.shown = 0;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      countTo(el, to, 1600, Number(el.dataset.countDelay || 200));
    }, { threshold: .4 });
    io.observe(el);
  });

  // Informe: el puntaje suma los aspectos que ya leíste (también los que pasaste rápido)
  var rail = document.querySelector('[data-rail]');
  if (rail && 'IntersectionObserver' in window) {
    var links = [].slice.call(rail.querySelectorAll('a[data-pts]'));
    var meter = rail.querySelector('[data-score]');
    var out = rail.querySelector('[data-score-out]');
    var reached = -1;
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = links.findIndex(function (a) { return a.hash === '#' + e.target.id; });
        reached = Math.max(reached, idx);
        var total = 0;
        links.forEach(function (a, i) {
          if (i <= reached) total += Number(a.dataset.pts);
          a.classList.toggle('done', i <= reached);
          a.classList.toggle('on', i === idx);
          if (i === idx) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
        });
        if (meter) meter.style.setProperty('--p', total);
        countTo(out, total, 1200, 0);
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    links.forEach(function (a) {
      var target = document.querySelector(a.hash);
      if (target) io2.observe(target);
    });
  }

  // "Quiero participar" marca el beneficio en el formulario
  var benefit = document.querySelector('[data-benefit-check]');
  document.querySelectorAll('[data-benefit]').forEach(function (a) {
    a.addEventListener('click', function () { if (benefit) benefit.checked = true; });
  });
})();
