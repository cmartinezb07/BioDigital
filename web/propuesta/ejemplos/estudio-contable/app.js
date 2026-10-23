// Ríos & Asociados: sombra del menú al bajar, enlace activo según la sección, foto con desplazamiento lento,
// apariciones, contadores, línea de avance de los pasos, cuartos de círculo que se juntan y agenda (demostración).
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nav = $('[data-nav]'), foto = $('[data-foto] img'), avance = $('[data-avance]'), pasos = $('.pasos'), cierre = $('.cierre');
  var enlaces = $$('[data-menu] a'), secciones = enlaces.map(function (a) { return $(a.getAttribute('href')); });

  var cuadro = function () {
    nav.classList.toggle('solida', window.scrollY > 60);
    // Enlace del menú según la sección visible
    var actual = 0;
    secciones.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 160) actual = i; });
    enlaces.forEach(function (a, i) { if (i === actual) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    if (reduce) return;
    var rf = foto.parentNode.getBoundingClientRect();
    if (rf.bottom > 0 && rf.top < innerHeight) foto.style.setProperty('--fy', (rf.top * -0.12).toFixed(1) + 'px');
    var rp = pasos.getBoundingClientRect();
    avance.style.setProperty('--p', Math.min(1, Math.max(0, (innerHeight * 0.8 - rp.top) / (rp.height + innerHeight * 0.3))).toFixed(3));
    var rc = cierre.getBoundingClientRect();
    if (rc.top < innerHeight) { var k = Math.min(1, (innerHeight - rc.top) / (rc.height + 100)); cierre.style.setProperty('--qx', ((1 - k) * -60).toFixed(1) + 'px'); cierre.style.setProperty('--qy', ((1 - k) * 60).toFixed(1) + 'px'); }
  };
  var pedido = false;
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; cuadro(); }); } }, { passive: true });
  window.addEventListener('resize', cuadro);
  cuadro();

  /* Apariciones y contadores */
  var cuenta = function (el) {
    var fin = +el.dataset.cuenta, t0 = null;
    var paso = function (t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
    el.textContent = '0'; requestAnimationFrame(paso);
  };
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        $$('[data-cuenta]', e.target).forEach(cuenta);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.revela').forEach(function (el) { io.observe(el); });
  } else $$('.revela').forEach(function (el) { el.classList.add('visto'); });

  /* Agenda (módulo compartido, demostración) */
  var montar = function () {
    if (!window.BDReservas) return;
    window.BDReservas.montar('#reserva', {
      modo: 'horas', demo: true, negocio: 'Ríos & Asociados', comuna: 'Concepción', titulo: 'Reservar una reunión', nivelTitulo: 3,
      servicios: [
        { nombre: 'Reunión inicial', duracion: 30, descripcion: 'Conversamos tu situación y te decimos cómo seguir.' },
        { nombre: 'Revisión tributaria', duracion: 60, precio: 45000, descripcion: 'Revisamos tus documentos y tu situación frente al SII.' }
      ],
      horario: { lun: ['09:00-13:00', '15:00-18:30'], mar: ['09:00-13:00', '15:00-18:30'], mie: ['09:00-13:00', '15:00-18:30'], jue: ['09:00-13:00', '15:00-18:30'], vie: ['09:00-13:00', '15:00-17:00'] },
      intervalo: 30, anticipacionHoras: 4, diasAdelante: 30
    });
  };
  if (window.BDReservas) montar(); else window.addEventListener('load', montar);
})();
