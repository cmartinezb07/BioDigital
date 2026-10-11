(function () {
  var root = document.documentElement;
  var light = matchMedia('(prefers-color-scheme: light)');

  var themeBtn = document.querySelector('[data-theme-toggle]');
  var bubbles = 0;
  if (themeBtn) {
    var use = themeBtn.querySelector('use');
    var current = function () {
      return root.dataset.theme || (light.matches ? 'light' : 'dark');
    };
    var paint = function () {
      var isLight = current() === 'light';
      use.setAttribute('href', isLight ? '#i-moon' : '#i-sun');
      themeBtn.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    };
    var wanted = null; // el cambio se aplica en diferido; un segundo clic rápido debe partir del tema ya pedido
    themeBtn.addEventListener('click', function () {
      var next = (wanted || current()) === 'light' ? 'dark' : 'light';
      wanted = next;
      var apply = function () {
        root.dataset.theme = next;
        try { localStorage.setItem('bd-theme', next); } catch (e) {}
        paint();
      };
      if (!document.startViewTransition) { apply(); wanted = null; return; }
      // Movimiento reducido: fundido simple entre temas, sin burbuja
      if (calm) {
        var fade = document.startViewTransition(apply);
        fade.ready.catch(function () {});
        fade.finished.catch(function () {}).finally(function () { if (wanted === next) wanted = null; });
        return;
      }
      // Burbuja: el tema nuevo crece como un círculo desde el botón hasta cubrir la pantalla
      var r = themeBtn.getBoundingClientRect();
      var x = r.left + r.width / 2;
      var y = r.top + r.height / 2;
      var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var at = 'px at ' + x + 'px ' + y + 'px)';
      var turn = ++bubbles;
      root.classList.add('theme-bubble');
      var vt = document.startViewTransition(apply);
      vt.ready.then(function () {
        root.animate(
          { clipPath: ['circle(' + r.width / 2 + at, 'circle(' + end + at] },
          { duration: 560, easing: 'cubic-bezier(.22, .61, .36, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () {}); // el navegador puede saltarse la transición (pestaña oculta, doble clic); el tema ya cambió
      // el navegador puede cancelar la transicion; eso no debe quedar como error en la consola
      vt.finished.catch(function () {}).finally(function () {
        if (turn !== bubbles) return;
        root.classList.remove('theme-bubble');
        wanted = null;
      });
    });
    light.addEventListener('change', paint);
    paint();
  }

  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  var toTop = document.querySelector('.to-top');
  if (toTop) {
    addEventListener('scroll', function () {
      toTop.classList.toggle('show', scrollY > 800);
    }, { passive: true });
    toTop.addEventListener('click', function () { scrollTo({ top: 0 }); });
  }

  var fine = matchMedia('(pointer: fine)').matches;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !calm) {
    document.querySelectorAll('[data-shine]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });
  }

  // Aparición al entrar en pantalla (ver .reveal en mundo.css)
  var reveals = document.querySelectorAll('.reveal');
  if (!calm && reveals.length && 'IntersectionObserver' in window) {
    root.classList.add('motion');
    var seen = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--ri', n++);
        e.target.classList.add('in');
        seen.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    reveals.forEach(function (el) { seen.observe(el); });
  }

  // Preguntas frecuentes: abren y cierran con altura animada (cerrar es más rápido que abrir)
  document.querySelectorAll('.faq details').forEach(function (d) {
    var sum = d.querySelector('summary');
    var body = sum && sum.nextElementSibling;
    if (!body || !d.animate) return;
    if (calm) {
      d.addEventListener('toggle', function () {
        if (d.open) body.animate({ opacity: [0, 1] }, { duration: 200 });
      });
      return;
    }
    var anim = null;
    var run = function (from, to, opening) {
      if (anim) anim.cancel();
      d.style.overflow = 'hidden';
      d.classList.toggle('closing', !opening);
      // Curva tipo iOS para paneles; cerrar responde más rápido que abrir
      anim = d.animate({ height: [from + 'px', to + 'px'] }, {
        duration: opening ? 360 : 240,
        easing: 'cubic-bezier(.32, .72, 0, 1)'
      });
      if (opening) {
        body.animate(
          { opacity: [0, 1], transform: ['translateY(-6px)', 'none'] },
          { duration: 300, delay: 50, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }
        );
      }
      anim.onfinish = function () {
        anim = null;
        d.open = opening;
        d.classList.remove('closing');
        d.style.overflow = '';
      };
    };
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      var from = d.offsetHeight;
      if (d.open && !d.classList.contains('closing')) {
        run(from, sum.offsetHeight, false);
      } else {
        d.open = true;
        run(from, sum.offsetHeight + body.offsetHeight, true);
      }
    });
  });
})();
