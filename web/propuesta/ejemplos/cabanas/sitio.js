// Cabañas Los Copihues: modo día/noche, menú a pantalla completa, escenas que avanzan con el scroll
// (la llegada y las cabañas por dentro), contadores, barras de distancia y reserva por noches (demostración).
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;

  /* Día / noche (se recuerda en este navegador) */
  var btnModo = $('[data-modo-btn]'), txtModo = $('[data-modo-txt]');
  var ponerModo = function (m) {
    raiz.dataset.modo = m;
    txtModo.textContent = m === 'noche' ? 'Noche' : 'Día';
    btnModo.setAttribute('aria-pressed', String(m === 'noche'));
    btnModo.setAttribute('aria-label', 'Cambiar a modo ' + (m === 'noche' ? 'día' : 'noche'));
  };
  try { ponerModo(localStorage.getItem('copihues-modo') === 'noche' ? 'noche' : 'dia'); } catch (e) { ponerModo('dia'); }
  btnModo.addEventListener('click', function () {
    var m = raiz.dataset.modo === 'noche' ? 'dia' : 'noche';
    ponerModo(m);
    try { localStorage.setItem('copihues-modo', m); } catch (e) {}
  });

  /* Menú */
  var menu = $('[data-menu]'), btnMenu = $('[data-menu-btn]');
  var abrir = function (si) {
    btnMenu.setAttribute('aria-expanded', String(si));
    raiz.classList.toggle('bloq', si);
    if (si) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('abierto'); $('a', menu).focus(); }); }
    else { menu.classList.remove('abierto'); setTimeout(function () { if (!menu.classList.contains('abierto')) menu.hidden = true; }, reduce ? 0 : 700); btnMenu.focus(); }
  };
  btnMenu.addEventListener('click', function () { abrir(btnMenu.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { abrir(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btnMenu.getAttribute('aria-expanded') === 'true') abrir(false); });

  /* Barra sólida fuera de las escenas oscuras */
  var nav = $('[data-nav]'), hero = $('#inicio'), llegada = $('[data-llegada]'), adentro = $('[data-adentro]'), reserva = $('#reserva');
  var sobreOscuro = function () {
    var y = 70;
    return [hero, llegada, adentro, reserva].some(function (s) { var r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  };

  /* Escenas con scroll */
  var ventana = $('.llegada-fija'), cuartos = $$('[data-cuarto]'), fichas = $$('[data-ficha]'), tabs = $$('[data-ir]'), barra = $('.adentro-barra');
  var activo = 0, heroImg = $('[data-hero-img]'), foto = $('.casa-foto img'), gigante = $('[data-gigante]');
  var avance = function (sec) { var r = sec.getBoundingClientRect(); return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); };
  var verCuarto = function (n) {
    if (n === activo) return;
    activo = n;
    cuartos.forEach(function (c, i) { c.classList.toggle('activo', i === n); });
    fichas.forEach(function (f, i) { f.classList.toggle('activo', i === n); });
    tabs.forEach(function (t, i) { t.setAttribute('aria-selected', String(i === n)); });
  };
  var cuadro = function () {
    nav.classList.toggle('solida', !sobreOscuro());
    if (reduce) return;
    var p = avance(llegada);
    ventana.style.setProperty('--p', p.toFixed(3));
    ventana.style.setProperty('--c', (1 - Math.min(1, p * 1.25)).toFixed(3));
    var q = avance(adentro);
    barra.style.setProperty('--p', q.toFixed(3));
    verCuarto(Math.min(2, Math.floor(q * 3)));
    if (window.scrollY < innerHeight) heroImg.style.transform = 'translate3d(0,' + (window.scrollY * 0.3) + 'px,0)';
    var rf = foto.getBoundingClientRect();
    if (rf.bottom > 0 && rf.top < innerHeight) foto.style.setProperty('--py', (((rf.top + rf.height / 2) / innerHeight - 0.5) * -60).toFixed(1) + 'px');
    var rg = gigante.getBoundingClientRect();
    if (rg.top < innerHeight) { var k = Math.min(1, (innerHeight - rg.top) / (rg.height + 160)); gigante.style.setProperty('--gy', ((1 - k) * 60).toFixed(1) + 'px'); gigante.style.setProperty('--go', (0.2 + k * 0.8).toFixed(2)); }
  };
  var pedido = false;
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; cuadro(); }); } }, { passive: true });
  window.addEventListener('resize', cuadro);
  cuadro();

  // Las pestañas llevan a la parte de la escena de esa cabaña (sin scroll fijo: solo cambian)
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      if (reduce) { verCuarto(i); return; }
      var top = adentro.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (adentro.offsetHeight - innerHeight) * (i + 0.5) / 3, behavior: 'smooth' });
    });
  });

  /* Apariciones y contadores */
  var cuenta = function (el) {
    var fin = +el.dataset.cuenta, t0 = null;
    if (reduce || fin < 3) return;
    var paso = function (t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  };
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        $$('[data-cuenta]', e.target).forEach(cuenta);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.revela').forEach(function (el) { io.observe(el); });
  } else $$('.revela').forEach(function (el) { el.classList.add('visto'); });

  /* Reserva por noches (módulo compartido, demostración) */
  var cont = $('#reserva-modulo'), modulo = null;
  var montar = function () {
    if (!window.BDReservas) { cont.innerHTML = '<p>No se pudo cargar el módulo de reservas. Recarga la página.</p>'; return; }
    modulo = window.BDReservas.montar(cont, {
      modo: 'noches', demo: true, negocio: 'Cabañas Los Copihues', comuna: 'Hualqui', titulo: 'Reservar una cabaña', nivelTitulo: 3,
      alojamientos: [
        { nombre: 'Cabaña Lingue', capacidad: 2, precioNoche: 48000, descripcion: 'Un dormitorio, estufa a leña y ventanal al bosque.' },
        { nombre: 'Cabaña Boldo', capacidad: 4, precioNoche: 72000, descripcion: 'Dos dormitorios, cocina equipada y terraza al río.' },
        { nombre: 'Cabaña Canelo', capacidad: 6, precioNoche: 96000, descripcion: 'Tres dormitorios, living amplio y terraza larga.' }
      ],
      minNoches: 2, maxNoches: 14, diasAdelante: 240, anticipacionDias: 1
    });
  };
  if (window.BDReservas) montar(); else window.addEventListener('load', montar);
  var nombres = ['Cabaña Lingue', 'Cabaña Boldo', 'Cabaña Canelo'];
  $('[data-reservar-activo]').addEventListener('click', function (e) {
    e.preventDefault();
    var nombre = nombres[activo];
    reserva.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () {
      if (!modulo || modulo.ok === false) return;
      modulo.reiniciar();
      var op = $$('.res-op', cont).filter(function (x) { return x.textContent.indexOf(nombre) > -1; })[0];
      if (op) op.click();
    }, reduce ? 30 : 800);
  });
})();
