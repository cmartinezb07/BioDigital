// Menú digital: buscador, categorías que siguen el scroll y visor 3D / realidad aumentada.
// La librería del visor (model-viewer, de Google) se carga solo cuando alguien abre un plato en 3D, para que la carta cargue rápido.
(function () {
  'use strict';
  var cfg = JSON.parse(document.getElementById('menu-datos').textContent);
  var platos = {}; cfg.categorias.forEach(function (c) { c.platos.forEach(function (p) { platos[p.id] = p; }); });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clp = function (n) { return '$' + n.toLocaleString('es-CL'); };

  // Planilla de Google del dueño (opcional, sin mensualidad): cambia precios, marca agotados y corrige descripciones desde su celular.
  // Columnas: Plato · Precio · Disponible (Sí/No) · Descripción. Se reconoce el plato por su nombre; una fila que no calza o sin precio válido se ignora.
  // Platos nuevos no aparecen solos (la carta es una página fija, buena para Google): se agregan al regenerarla.
  if (cfg.planilla && window.fetch) {
    var norm = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); };
    var porNombre = {}; Object.keys(platos).forEach(function (id) { porNombre[norm(platos[id].nombre)] = id; });
    fetch(cfg.planilla, { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      var filas = [], f = [], v = '', dentro = false;
      for (var i = 0; i < t.length; i++) { var ch = t[i]; if (dentro) { if (ch === '"') { if (t[i + 1] === '"') { v += '"'; i++; } else dentro = false; } else v += ch; } else if (ch === '"') dentro = true; else if (ch === ',') { f.push(v); v = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; f.push(v); filas.push(f); f = []; v = ''; } else v += ch; }
      if (v || f.length) { f.push(v); filas.push(f); }
      var cab = (filas.shift() || []).map(norm), col = function (x, k) { var j = cab.findIndex(function (c) { return c.indexOf(k) === 0; }); return j > -1 ? String(x[j] || '').trim() : ''; };
      filas.forEach(function (x) {
        var id = porNombre[norm(col(x, 'plato') || col(x, 'nombre'))], el = id && $('.plato[data-id="' + id + '"]'); if (!el) return;
        var pr = col(x, 'precio').replace(/[$\s.]/g, ''); if (/^\d{1,7}$/.test(pr)) { platos[id].precio = +pr; $('.precio', el).textContent = clp(+pr); }
        var d = col(x, 'descrip'); if (d && $('.desc', el)) { $('.desc', el).textContent = d.slice(0, 200); platos[id].descripcion = d.slice(0, 200); }
        var agot = /^(no|agotado|n)$/.test(norm(col(x, 'disponible'))); el.classList.toggle('agotado', agot);
        var ag = $('.agot', el); if (agot && !ag) { $('.txt', el).insertAdjacentHTML('beforeend', '<p class="agot">Agotado hoy</p>'); } else if (!agot && ag) ag.remove();
        var b3 = $('.ver3d', el); if (b3) b3.hidden = agot;
      });
    }).catch(function () { /* sin planilla se ve la carta tal como se publicó */ });
  }

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
  var links = $$('.cats a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', String(a.hash === '#' + e.target.id)); if (a.hash === '#' + e.target.id) a.scrollIntoView({ inline: 'center', block: 'nearest' }); });
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
  document.addEventListener('click', function (e) { if (navigator.vibrate && e.target.closest('.boton, .btn-ar, .fav, .mini')) navigator.vibrate(10); });

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
