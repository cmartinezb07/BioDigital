// Carta pública: se dibuja desde los datos de carta.js (platos, fotos, precios, disponibilidad), con el mismo diseño de siempre.
// Incluye buscador, categorías que siguen el scroll, apariciones suaves y compartir. Si el dueño publica un cambio en su panel,
// la carta se vuelve a dibujar sola (sin recargar y sin perder el lugar donde está el cliente).
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clp = function (n) { return '$' + Math.round(n).toLocaleString('es-CL'); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var cont = $('#carta-contenido'), navCats = $('[data-cats]'), vacio = $('#sin-resultados'), primera = true, io = null, ioA = null;
  // Colores de acento permitidos para la identidad del local (el dueño elige uno; el diseño no cambia)
  var ACENTOS = { '#cf9b4a': '#e9c98f', '#d9663b': '#f0a37f', '#b8484f': '#e29a9f', '#7a9a52': '#b6cf8f', '#4f8aa6': '#9cc6db', '#9a7bc2': '#cdb9e8' };

  function platoHtml(p) {
    var etq = (p.etiquetas || []).slice(); if (p.destacado) etq.unshift('Favorito de la casa'); if (p.disponible === false) etq.push('Agotado por hoy');
    if ((p.grupos || []).length && p.disponible !== false) etq.push('Con opciones');
    var texto = (p.nombre + ' ' + (p.descripcion || '') + ' ' + (p.etiquetas || []).join(' ')).toLowerCase();
    return '<article class="plato con-foto' + (p.disponible === false ? ' agotado' : '') + '" data-id="' + esc(p.id) + '" data-texto="' + esc(texto) + '">' +
      '<div class="mini"><img src="' + esc(Carta.fotoSrc(p)) + '" data-fn="' + esc(Carta.claveFoto(p)) + '" alt="Foto de ' + esc(p.nombre) + '" width="168" height="168" loading="lazy" decoding="async"></div>' +
      '<div class="txt"><div class="linea"><h3>' + esc(p.nombre) + '</h3><span class="puntos" aria-hidden="true"></span><span class="precio">' + ((p.grupos || []).some(function (g) { return g.obligatorio; }) ? 'desde ' : '') + clp(p.precio) + '</span></div>' +
      (p.descripcion ? '<p class="desc">' + esc(p.descripcion) + '</p>' : '') +
      (etq.length ? '<p class="etq">' + etq.map(function (e) { return '<span>' + esc(e) + '</span>'; }).join('') + '</p>' : '') + '</div></article>';
  }
  function favHtml(p) {
    return '<div class="fav"><img src="' + esc(Carta.fotoSrc(p)) + '" data-fn="' + esc(Carta.claveFoto(p)) + '" alt="Foto de ' + esc(p.nombre) + '" width="168" height="168" decoding="async"><span class="fav-n">' + esc(p.nombre) + '</span><span class="fav-p">' + clp(p.precio) + '</span></div>';
  }

  function dibujar(m) {
    var marca = m.marca || {}, neg = m.negocio || {};
    document.title = (marca.nombre || 'Carta') + ' · Carta y precios';
    $$('[data-nombre], [data-nombre-pie]').forEach(function (e) { e.textContent = marca.nombre || ''; });
    var sobre = $('[data-sobre]'); if (sobre) sobre.textContent = marca.sobre || 'Carta';
    var lema = $('[data-lema]'); if (lema) { lema.textContent = marca.lema || ''; lema.hidden = !marca.lema; }
    var datos = [neg.direccion].concat(neg.horarios || []).filter(Boolean);
    var ul = $('[data-datos]'); if (ul) ul.innerHTML = datos.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('');
    var pie = $('[data-pie-datos]'); if (pie) pie.textContent = datos.join(' · ');
    var ac = ACENTOS[marca.acento] ? marca.acento : '#cf9b4a';
    document.documentElement.style.setProperty('--c1', ac); document.documentElement.style.setProperty('--c2', ACENTOS[ac]);
    var logo = $('[data-logo]');
    if (logo) { if (marca.logo && (marca.logo.id || marca.logo.src)) { logo.src = Carta.fotoSrc({ foto: marca.logo.src, fotoNube: marca.logo.id ? marca.logo : null }); logo.setAttribute('data-fn', marca.logo.id ? marca.logo.id + '@' + marca.logo.h : ''); logo.alt = 'Logo de ' + (marca.nombre || ''); logo.hidden = false; } else logo.hidden = true; }

    var cats = m.categorias.map(function (c) { return { c: c, ps: (c.platos || []).filter(function (p) { return p.activo !== false; }) }; }).filter(function (x) { return x.ps.length; });
    var favs = []; cats.forEach(function (x) { x.ps.forEach(function (p) { if (p.destacado && p.disponible !== false) favs.push(p); }); });
    var y = window.scrollY;
    cont.innerHTML = (favs.length ? '<section class="favs" aria-labelledby="h-favs"><h2 class="tit" id="h-favs"><span>Favoritos de la casa</span></h2><div class="favs-lista">' + favs.slice(0, 6).map(favHtml).join('') + '</div></section>' : '') +
      cats.map(function (x) {
        return '<section class="cat" id="' + esc(x.c.id) + '" aria-labelledby="h-' + esc(x.c.id) + '"><h2 class="tit" id="h-' + esc(x.c.id) + '"><span>' + esc(x.c.nombre) + '</span></h2>' + (x.c.sub ? '<p class="sub">' + esc(x.c.sub) + '</p>' : '') + '<div class="platos">' + x.ps.map(platoHtml).join('') + '</div></section>';
      }).join('');
    if (navCats) navCats.innerHTML = cats.map(function (x, i) { return '<a href="#' + esc(x.c.id) + '"' + (i === 0 ? ' aria-current="true"' : '') + '>' + esc(x.c.nombre) + '</a>'; }).join('');
    if (!primera) window.scrollTo(0, y);
    activar();
    var q = $('#buscar'); if (q && q.value) q.dispatchEvent(new Event('input'));
    document.dispatchEvent(new CustomEvent('carta:lista', { detail: { modelo: m, primera: primera } }));
    primera = false;
  }

  // Apariciones suaves y categoría activa según el scroll
  function activar() {
    if (io) io.disconnect(); if (ioA) ioA.disconnect();
    var aparecer = $$('.plato, .fav, .tit');
    if ('IntersectionObserver' in window && primera) {
      ioA = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ioA.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
      aparecer.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 50 + 'ms'; ioA.observe(el); });
    } else aparecer.forEach(function (el) { el.classList.add('in'); });
    var links = $$('.cats a'), barra = $('.cats');
    // Se mueve solo la barra de categorías (scrollLeft): scrollIntoView movía también la página y le peleaba el scroll al dedo.
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            var es2 = a.hash === '#' + e.target.id; a.setAttribute('aria-current', String(es2));
            if (es2 && barra && barra.scrollWidth > barra.clientWidth) barra.scrollLeft += a.getBoundingClientRect().left - barra.getBoundingClientRect().left - (barra.clientWidth - a.offsetWidth) / 2;
          });
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      $$('.cat').forEach(function (c) { io.observe(c); });
    }
  }

  // Buscador
  var q = $('#buscar');
  if (q) q.addEventListener('input', function () {
    var t = q.value.trim().toLowerCase(), hay = false, favs = $('.favs'); if (favs) favs.hidden = !!t;
    $$('.cat').forEach(function (c) {
      var visibles = 0;
      $$('.plato', c).forEach(function (el) { var ok = !t || el.dataset.texto.indexOf(t) > -1; el.hidden = !ok; if (ok) visibles++; });
      c.hidden = !visibles; if (visibles) hay = true;
    });
    if (vacio) vacio.hidden = hay;
  });

  // Tema claro/oscuro (solo cartas con modo automático): sigue al sistema y recuerda la elección
  var tb = $('.tema-btn');
  if (tb) tb.addEventListener('click', function () {
    var r = document.documentElement, actual = r.getAttribute('data-tema') || (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro');
    var nuevo = actual === 'claro' ? 'oscuro' : 'claro'; r.setAttribute('data-tema', nuevo);
    try { localStorage.setItem('menu-tema', nuevo); } catch (e) {}
  });
  // Compartir la carta (Web Share) o copiar el enlace
  var cp = $('[data-compartir]');
  if (cp) cp.addEventListener('click', function () {
    var datos = { title: document.title, url: location.href.split('#')[0].split('?')[0] };
    if (navigator.share) { navigator.share(datos).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(datos.url).then(function () { var t = cp.lastChild.textContent; cp.lastChild.textContent = 'Enlace copiado'; setTimeout(function () { cp.lastChild.textContent = t; }, 1800); });
  });
  // Vibración leve al tocar los botones principales (donde el teléfono lo permite)
  document.addEventListener('click', function (e) { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive && e.isTrusted && e.target.closest('.boton, .fav, .agregar, .chip')) navigator.vibrate(8); });

  // Las fotos que sube el dueño llegan después: se cambian en su lugar
  Carta.escucharFoto(function (k, src) { $$('img[data-fn="' + k + '"]').forEach(function (i) { i.src = src; }); });
  Carta.escuchar(function (m) { dibujar(m); });
  Carta.iniciar();
})();
