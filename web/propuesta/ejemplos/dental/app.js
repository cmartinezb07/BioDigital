// Clínica Dental Sonríe: barra sólida al bajar, pieza dental que sigue al mouse, frases que se iluminan palabra por
// palabra, contadores, carril con flechas, tarjetas apiladas que se achican, palabra gigante que se rellena y reservas.
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var nav = $('[data-nav]');
  var hero = $('[data-hero]');

  /* La pieza dental gira hacia el puntero */
  var diente = $('.diente');
  if (fino && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      diente.style.setProperty('--ry', (x * 30).toFixed(1) + 'deg');
      diente.style.setProperty('--rx', (-y * 18).toFixed(1) + 'deg');
    });
    hero.addEventListener('pointerleave', function () { diente.style.setProperty('--ry', '0deg'); diente.style.setProperty('--rx', '0deg'); });
  }

  /* Frases que se iluminan: se parten en palabras */
  var luces = $$('[data-luz]').map(function (p) {
    var palabras = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    palabras.forEach(function (w, i) { var s = document.createElement('span'); s.className = 'w'; s.textContent = w; p.appendChild(s); if (i < palabras.length - 1) p.appendChild(document.createTextNode(' ')); });
    return { el: p, ws: $$('.w', p) };
  });

  /* Todo lo que depende del scroll en un solo cuadro */
  var cartas = $$('.carta'), banda = $('[data-banda-img]'), gigante = $('[data-gigante]');
  var cuadro = function () {
    nav.classList.toggle('solida', window.scrollY > hero.offsetHeight * 0.5);
    if (reduce) return;
    luces.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      var k = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      var n = Math.round(k * l.ws.length);
      l.ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    });
    // Cada tarjeta se achica un poco cuando la siguiente la tapa
    cartas.forEach(function (c, i) {
      var sig = cartas[i + 1];
      if (!sig) return;
      var d = sig.getBoundingClientRect().top - c.getBoundingClientRect().top;
      var k = Math.min(1, Math.max(0, 1 - d / c.offsetHeight));
      c.style.transform = 'scale(' + (1 - k * 0.06).toFixed(3) + ')';
      c.style.filter = 'brightness(' + (1 - k * 0.25).toFixed(2) + ')';
    });
    var rb = banda.parentNode.getBoundingClientRect();
    if (rb.bottom > 0 && rb.top < innerHeight) banda.style.setProperty('--by', ((rb.top / innerHeight) * -80).toFixed(1) + 'px');
    var rg = gigante.getBoundingClientRect();
    if (rg.top < innerHeight && rg.bottom > 0) gigante.style.setProperty('--g', (Math.min(1, Math.max(0, (innerHeight - rg.top) / (innerHeight * 0.8))) * 100).toFixed(1) + '%');
  };
  var pedido = false;
  window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(function () { pedido = false; cuadro(); }); } }, { passive: true });
  window.addEventListener('resize', cuadro);
  cuadro();

  /* Apariciones y contadores */
  var cuenta = function (el) {
    var fin = +el.dataset.cuenta, t0 = null;
    if (reduce) return;
    var paso = function (t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 1000); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
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

  /* Carril con flechas */
  var carril = $('[data-carril]');
  $$('[data-carril-ir]').forEach(function (b) {
    b.addEventListener('click', function () {
      var paso = carril.querySelector('.paso').offsetWidth + 16;
      carril.scrollBy({ left: paso * +b.dataset.carrilIr, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Reservas (módulo compartido, demostración) */
  var mod = null;
  var montar = function () {
    if (!window.BDReservas) return;
    mod = window.BDReservas.montar('#reserva-mod', {
      demo: true, modo: 'horas', negocio: 'Clínica Dental Sonríe', comuna: 'Hualpén', titulo: 'Reservar una evaluación', nivelTitulo: 3,
      servicios: [
        { nombre: 'Evaluación general', duracion: 40, precio: 15000, descripcion: 'Revisión completa y plan de tratamiento.' },
        { nombre: 'Limpieza dental', duracion: 50, precio: 28000, descripcion: 'Limpieza, pulido y consejos de cuidado.' },
        { nombre: 'Evaluación por dolor', duracion: 30, precio: 20000, descripcion: 'Para saber qué te duele y cómo aliviarlo.' },
        { nombre: 'Evaluación de ortodoncia', duracion: 45, precio: 18000, descripcion: 'Mordida, posición de los dientes y opciones.' },
        { nombre: 'Evaluación de blanqueamiento', duracion: 30, precio: 12000, descripcion: 'Vemos si estás listo o lista y qué tono buscas.' },
        { nombre: 'Evaluación infantil', duracion: 30, precio: 12000, descripcion: 'Primera visita para niñas y niños, a su ritmo.' }
      ],
      profesionales: [
        { nombre: 'Valentina Rojas · Odontología general' },
        { nombre: 'Matías Soto · Ortodoncia', horario: { lun: ['09:00-13:00', '15:00-19:00'], mie: ['09:00-13:00', '15:00-19:00'], vie: ['09:00-13:00'] } },
        { nombre: 'Camila Fuentes · Endodoncia', horario: { mar: ['09:00-13:00', '15:00-19:00'], jue: ['09:00-13:00', '15:00-19:00'], sab: ['09:00-13:00'] } },
        { nombre: 'Ignacio Araya · Odontopediatría', horario: { mar: ['15:00-19:00'], jue: ['15:00-19:00'], sab: ['09:00-13:00'] } }
      ],
      horario: { lun: ['09:00-13:00', '15:00-19:00'], mar: ['09:00-13:00', '15:00-19:00'], mie: ['09:00-13:00', '15:00-19:00'], jue: ['09:00-13:00', '15:00-19:00'], vie: ['09:00-13:00', '15:00-19:00'], sab: ['09:00-13:00'] },
      intervalo: 30, anticipacionHoras: 3, diasAdelante: 45
    });
  };
  if (window.BDReservas) montar(); else window.addEventListener('load', montar);
  $$('[data-reservar]').forEach(function (b) {
    b.addEventListener('click', function () {
      var nombre = b.getAttribute('data-reservar');
      $('#reserva').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () {
        if (!mod || mod.ok === false) return;
        mod.reiniciar();
        var op = $$('#reserva-mod .res-op').filter(function (o) { var t = $('.res-op-t', o); return t && t.textContent.trim() === nombre; })[0];
        if (op) op.click();
      }, reduce ? 30 : 900);
    });
  });
})();
