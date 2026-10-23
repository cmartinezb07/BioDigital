// Menú digital: buscador, categorías que siguen el scroll y visor 3D / realidad aumentada.
// La librería del visor (model-viewer, de Google) se carga solo cuando alguien abre un plato en 3D, para que la carta cargue rápido.
(function () {
  'use strict';
  var cfg = JSON.parse(document.getElementById('menu-datos').textContent);
  var platos = {}; cfg.categorias.forEach(function (c) { c.platos.forEach(function (p) { platos[p.id] = p; }); });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clp = function (n) { return '$' + n.toLocaleString('es-CL'); };

  // Buscador
  var q = $('#buscar'), vacio = $('#sin-resultados');
  if (q) q.addEventListener('input', function () {
    var t = q.value.trim().toLowerCase(), hay = false;
    var favs = $('.favs'); if (favs) favs.hidden = !!t;
    $$('.cat').forEach(function (c) {
      var visibles = 0;
      $$('.plato', c).forEach(function (el) {
        var ok = !t || el.dataset.texto.indexOf(t) > -1;
        el.hidden = !ok; if (ok) visibles++;
      });
      c.hidden = !visibles; if (visibles) hay = true;
    });
    vacio.hidden = hay;
  });

  // Aparición suave de cada plato al llegar a la pantalla
  var aparecer = $$('.plato, .fav, .tit');
  if ('IntersectionObserver' in window) {
    var ioA = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ioA.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    aparecer.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 50 + 'ms'; ioA.observe(el); });
  } else aparecer.forEach(function (el) { el.classList.add('in'); });

  // La categoría activa sigue el scroll
  // Se mueve solo la barra de categorías (scrollLeft): scrollIntoView movía también la página y le peleaba el scroll al dedo.
  var links = $$('.cats a'), barraCats = $('.cats');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var es = a.hash === '#' + e.target.id; a.setAttribute('aria-current', String(es));
          if (es && barraCats && barraCats.scrollWidth > barraCats.clientWidth) barraCats.scrollLeft += a.getBoundingClientRect().left - barraCats.getBoundingClientRect().left - (barraCats.clientWidth - a.offsetWidth) / 2;
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.cat').forEach(function (c) { io.observe(c); });
  }

  // Tema claro/oscuro (solo cartas con modo automático): sigue al sistema y recuerda la elección
  var tb = $('.tema-btn');
  if (tb) tb.addEventListener('click', function () {
    var r = document.documentElement, actual = r.getAttribute('data-tema') || (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro');
    var nuevo = actual === 'claro' ? 'oscuro' : 'claro';
    r.setAttribute('data-tema', nuevo);
    try { localStorage.setItem('menu-tema', nuevo); } catch (e) {}
  });

  // Compartir la carta (Web Share) o copiar el enlace
  var cp = $('[data-compartir]');
  if (cp) cp.addEventListener('click', function () {
    var datos = { title: document.title, url: location.href.split('#')[0] };
    if (navigator.share) { navigator.share(datos).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(datos.url).then(function () { var t = cp.textContent; cp.lastChild.textContent = 'Enlace copiado'; setTimeout(function () { cp.lastChild.textContent = 'Compartir carta'; }, 1800); });
  });

  // Vibración leve al tocar los botones principales (donde el teléfono lo permite)
  document.addEventListener('click', function (e) { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive && e.isTrusted && e.target.closest('.boton, .btn-ar, .fav, .mini, .agregar')) navigator.vibrate(10); });

  // Visor
  var dlg = $('#visor'); if (!dlg) return;
  var mv = $('model-viewer', dlg), btnAr = $('.btn-ar', dlg), nota = $('.nota-ar', dlg), cargando = $('.cargando', dlg);
  var libCargada = null, abierto = null, volver = null;
  function cargarLib() {
    if (libCargada) return libCargada;
    libCargada = new Promise(function (ok, mal) {
      var l = cfg.libreria3d, s = document.createElement('script'); s.type = 'module'; s.src = l.url;
      if (l.sri) { s.integrity = l.sri; s.crossOrigin = 'anonymous'; }   // si el archivo cambia, el navegador lo rechaza
      s.onload = function () { customElements.whenDefined('model-viewer').then(ok); }; s.onerror = mal;
      document.head.appendChild(s);
    });
    return libCargada;
  }
  function abrir(id, origen) {
    var p = platos[id]; if (!p || !p.modelo) return;
    abierto = p; volver = origen;
    $('h2', dlg).textContent = p.nombre; $('.visor-desc', dlg).textContent = p.descripcion + ' · ' + clp(p.precio);
    nota.textContent = ''; btnAr.hidden = true; cargando.hidden = false; cargando.textContent = 'Cargando el plato en 3D…';
    mv.removeAttribute('src'); if (p.foto) mv.setAttribute('poster', p.foto); else mv.removeAttribute('poster'); mv.setAttribute('alt', 'Modelo 3D de ' + p.nombre);
    if (p.escala) mv.setAttribute('scale', p.escala); else mv.removeAttribute('scale');
    dlg.showModal();
    cargarLib().then(function () { mv.setAttribute('src', p.modelo); }).catch(function () { cargando.textContent = 'No pudimos cargar el 3D. Revisa tu conexión.'; });
  }
  mv.addEventListener('load', function () {
    cargando.hidden = true;
    if (mv.canActivateAR) btnAr.hidden = false; else nota.textContent = 'Para verlo sobre tu mesa, abre este menú desde tu celular.';
  });
  mv.addEventListener('error', function () { cargando.hidden = false; cargando.textContent = 'No pudimos cargar el 3D de este plato.'; });
  btnAr.addEventListener('click', function () { mv.activateAR(); });
  $('.cerrar', dlg).addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { mv.removeAttribute('src'); if (volver) volver.focus(); });
  $$('.ver3d').forEach(function (b) { b.addEventListener('click', function () { abrir(b.dataset.id, b); }); });
})();
