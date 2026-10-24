// Barbería El Filo: entrada en tres paneles, menú a pantalla completa, pestañas de servicios, polaroids que suben a
// distinto ritmo, fotos con desplazamiento lento, apariciones y reservas con barbero (demostración).
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;

  /* Entrada: se quita al terminar (una vez por sesión) */
  var intro = $('[data-intro]');
  var vista = false;
  try { vista = sessionStorage.getItem('filo-intro') === '1'; sessionStorage.setItem('filo-intro', '1'); } catch (e) {}
  if (reduce || vista) { intro.classList.add('listo'); $$('.hero-titulo .ln > span').forEach(function (s) { s.style.animationDelay = '.1s'; }); }
  else setTimeout(function () { intro.classList.add('listo'); }, 2700);

  /* Menú */
  var menu = $('[data-menu]'), btn = $('[data-menu-btn]');
  var abrir = function (si) {
    btn.setAttribute('aria-expanded', String(si));
    raiz.classList.toggle('bloq', si);
    if (si) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('abierto'); }); }
    else { menu.classList.remove('abierto'); setTimeout(function () { if (!menu.classList.contains('abierto')) menu.hidden = true; }, reduce ? 0 : 700); }
  };
  btn.addEventListener('click', function () { abrir(btn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { abrir(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { abrir(false); btn.focus(); } });

  /* Pestañas de servicios */
  var tabs = $$('[role="tab"]');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) {
        var si = x === t; x.setAttribute('aria-selected', String(si));
        var p = $('#' + x.getAttribute('aria-controls')); p.hidden = !si;
        if (si && !reduce) { p.classList.remove('entra'); void p.offsetWidth; p.classList.add('entra'); }
      });
    });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t), n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null) return;
      var d = tabs[(n + tabs.length) % tabs.length]; d.focus(); d.click();
    });
  });

  /* Scroll: fotos lentas y polaroids */
  var heroImg = $('[data-hero-img]'), banda = $('[data-banda-img]'), collage = $('[data-collage]');
  // Se mide todo antes de escribir y solo se escribe lo que cambió (mezclar lecturas y escrituras recalcula el diseño
  // varias veces por cuadro y en celulares frena el scroll después de soltar). Las polaroids heredan --py del collage.
  var previo = {};
  var poner = function (el, prop, v) { if (previo[prop] === v) return; previo[prop] = v; el.style.setProperty(prop, v); };
  var cuadro = function () {
    if (reduce) return;
    var y = window.scrollY, h = innerHeight, rb = banda.parentNode.getBoundingClientRect(), rc = collage.getBoundingClientRect();
    if (y < h * 1.2) poner(heroImg, '--hy', (y * 0.18).toFixed(1) + 'px');
    if (rb.bottom > 0 && rb.top < h) poner(banda, '--by', (rb.top / h * -60).toFixed(1) + 'px');
    if (rc.bottom > 0 && rc.top < h) poner(collage, '--py', (rc.top * 0.35).toFixed(1) + 'px');
  };
  var pedido = false;
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; cuadro(); }); } }, { passive: true });
  cuadro();

  /* Apariciones */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.revela').forEach(function (el) { io.observe(el); });
  } else $$('.revela').forEach(function (el) { el.classList.add('visto'); });

  /* Reservas (módulo compartido, demostración) */
  var cont = $('#reserva-modulo'), reserva = null;
  var montar = function () {
    if (!window.BDReservas) return;
    reserva = window.BDReservas.montar(cont, {
      modo: 'horas', demo: true, negocio: 'Barbería El Filo', comuna: 'Talcahuano', titulo: 'Reservar hora en Barbería El Filo', nivelTitulo: 3,
      servicios: [
        { nombre: 'Fade', duracion: 45, precio: 12000, descripcion: 'Degradado a máquina, remate a tijera.' },
        { nombre: 'Corte clásico', duracion: 40, precio: 10000, descripcion: 'Tijera y peine, a tu pinta.' },
        { nombre: 'Barba a navaja', duracion: 30, precio: 7000, descripcion: 'Toalla caliente, espuma y filo.' },
        { nombre: 'Corte + barba', duracion: 60, precio: 16000, descripcion: 'El combo completo.' },
        { nombre: 'Corte niño', duracion: 30, precio: 8000 },
        { nombre: 'Perfilado', duracion: 15, precio: 4000, descripcion: 'Cuello, patillas y cejas.' }
      ],
      profesionales: [
        { nombre: 'Cuervo' }, { nombre: 'Tiburón' },
        { nombre: 'Fideo', horario: { mie: ['12:00-20:00'], jue: ['12:00-20:00'], vie: ['12:00-20:00'], sab: ['10:00-17:00'] } }
      ],
      horario: { mar: ['10:00-13:30', '15:00-20:00'], mie: ['10:00-13:30', '15:00-20:00'], jue: ['10:00-13:30', '15:00-20:00'], vie: ['10:00-13:30', '15:00-20:00'], sab: ['10:00-17:00'] },
      intervalo: 30, anticipacionHoras: 2, diasAdelante: 30
    });
  };
  if (window.BDReservas) montar(); else window.addEventListener('load', montar);
  $$('[data-reservar]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var nombre = a.getAttribute('data-reservar');
      $('#reserva').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () {
        if (!reserva || reserva.ok === false) return;
        reserva.reiniciar();
        var op = $$('.res-op', cont).filter(function (o) { var t = $('.res-op-t', o); return t && t.textContent.trim() === nombre; })[0];
        if (op) op.click();
      }, reduce ? 30 : 900);
    });
  });
})();
