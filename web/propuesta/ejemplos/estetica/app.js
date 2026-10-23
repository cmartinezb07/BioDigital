// Centro Aurora: barra que se vuelve sólida, título por palabras, apariciones al bajar, filtros de tratamientos,
// agenda de la semana (disponibilidad de ejemplo, siempre la misma para la misma fecha), tarjetas que se inclinan y reservas.
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fino = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* Barra superior */
  var nav = $('[data-nav]');
  var barra = function () { nav.classList.toggle('solida', window.scrollY > 40); };
  window.addEventListener('scroll', barra, { passive: true }); barra();

  /* Título que sube palabra por palabra */
  $$('.partir').forEach(function (h) {
    var i = 0;
    h.innerHTML = h.innerHTML.split(/(<br>)/).map(function (parte) {
      if (parte === '<br>') return parte;
      return parte.split(' ').filter(Boolean).map(function (p) { return '<span class="pal"><span style="--i:' + (i++) + '">' + p + '</span></span>'; }).join(' ');
    }).join('');
  });

  /* La foto de portada se desplaza más lento que la página */
  var foto = $('[data-parallax]');
  if (foto && !reduce.matches) {
    var pinta = function () { var y = Math.min(window.scrollY, 900); foto.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0)'; };
    window.addEventListener('scroll', function () { requestAnimationFrame(pinta); }, { passive: true });
  }

  /* Apariciones y contadores */
  var cuenta = function (el) {
    var fin = +el.dataset.cuenta, t0 = null;
    if (reduce.matches || fin < 2) return;
    var paso = function (t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  };
  if ('IntersectionObserver' in window && !reduce.matches) {
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

  /* Filtros de tratamientos */
  var filtros = $$('[data-filtro]');
  filtros.forEach(function (b) {
    b.addEventListener('click', function () {
      filtros.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      var f = b.dataset.filtro;
      $$('.trat').forEach(function (t, i) {
        var ver = f === 'todos' || t.dataset.tipo === f;
        t.classList.toggle('fuera', !ver);
        if (ver && !reduce.matches) t.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 30, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
    });
  });

  /* Reservas (módulo compartido, modo demostración) */
  var servicios = $$('.trat').map(function (t) {
    return { nombre: t.dataset.nombre, duracion: parseInt(t.dataset.dur, 10), precio: parseInt(t.dataset.precio, 10), descripcion: t.dataset.desc };
  });
  var horario = { mar: ['10:00-13:00', '15:00-19:00'], mie: ['10:00-13:00', '15:00-19:00'], jue: ['10:00-13:00', '15:00-19:00'], vie: ['10:00-13:00', '15:00-19:00'], sab: ['10:00-15:00'] };
  var rsv = null;
  var montar = function () {
    if (!window.BDReservas) return;
    rsv = window.BDReservas.montar('#reserva-modulo', {
      modo: 'horas', demo: true, negocio: 'Centro Aurora', comuna: 'Chiguayante', titulo: 'Reservar una hora en Centro Aurora', nivelTitulo: 3,
      servicios: servicios, horario: horario, intervalo: 30, anticipacionHoras: 3, diasAdelante: 45
    });
  };
  if (window.BDReservas) montar(); else window.addEventListener('load', montar);

  var elegir = function (nombre) {
    var destino = $('#reserva');
    destino.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () {
      if (!rsv || !rsv.ok || !nombre) return;
      rsv.reiniciar();
      var op = $$('#reserva-modulo .res-op').filter(function (o) { var t = $('.res-op-t', o); return t && t.textContent.trim() === nombre; })[0];
      if (op) op.click();
    }, reduce.matches ? 30 : 750);
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reservar]');
    if (!b) return;
    e.preventDefault();
    elegir(b.getAttribute('data-reservar'));
  });

  /* Agenda de la semana: horas de ejemplo calculadas a partir de la fecha (deterministas, sin azar) */
  var DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'], NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  var lunes = function (d) { var x = new Date(d); var w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); return x; };
  var base = lunes(hoy), semana = 0, elegido = null;
  var hash = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  var cajaDias = $('[data-dias]'), marca = $('.dias-marca'), cuerpo = $('[data-horas]'), rango = $('[data-rango]');
  var clp = function (n) { return '$' + n.toLocaleString('es-CL'); };

  var horasDe = function (d) {
    var tramos = horario[DIAS[d.getDay()]] || [], filas = [];
    tramos.forEach(function (tr) {
      var p = tr.split('-'), h = parseInt(p[0], 10), fin = parseInt(p[1], 10);
      for (; h < fin; h += 1) {
        var k = hash(d.toDateString() + h);
        if (k % 3 === 0) continue;
        var s = servicios[k % servicios.length];
        filas.push({ hora: (h < 10 ? '0' : '') + h + ':00', s: s, sala: s.nombre.indexOf('Masaje') === 0 || s.nombre === 'Piedras calientes' ? 'Sala de masajes' : 'Sala facial', cupos: k % 7 === 0 ? 0 : (k % 5 === 0 ? 1 : 2) });
      }
    });
    return filas;
  };
  var moverMarca = function (btn) {
    if (!btn) return;
    marca.style.width = btn.offsetWidth + 'px';
    marca.style.transform = 'translateX(' + (btn.offsetLeft - 4) + 'px)';
  };
  var pintarHoras = function (d) {
    var filas = horasDe(d);
    cuerpo.textContent = '';
    if (!filas.length) { cuerpo.innerHTML = '<tr><td colspan="6" class="vacio">Ese día el centro está cerrado.</td></tr>'; return; }
    filas.forEach(function (f, i) {
      var tr = document.createElement('tr'); tr.style.setProperty('--i', i);
      var lleno = f.cupos === 0;
      tr.innerHTML = '<td></td><td></td><td class="col-o"></td><td class="col-o"></td><td><span class="cupos"></span></td><td></td>';
      tr.children[0].textContent = f.hora;
      tr.children[1].textContent = f.s.nombre;
      tr.children[2].textContent = f.sala;
      tr.children[3].textContent = f.s.duracion + ' min';
      var c = tr.children[4].firstChild; c.textContent = lleno ? 'Completo' : (f.cupos === 1 ? 'Última hora' : 'Disponible'); if (lleno) c.classList.add('lleno'); else if (f.cupos === 1) c.classList.add('ultimo');
      if (!lleno) {
        var b = document.createElement('a'); b.className = 'pill pill-negro'; b.href = '#reserva'; b.setAttribute('data-reservar', f.s.nombre);
        b.innerHTML = 'Reservar <span class="flecha" aria-hidden="true">→</span>';
        b.setAttribute('aria-label', 'Reservar ' + f.s.nombre + ' a las ' + f.hora);
        tr.children[5].appendChild(b);
      }
      cuerpo.appendChild(tr);
    });
  };
  var pintarSemana = function () {
    var ini = new Date(base); ini.setDate(ini.getDate() + semana * 7);
    var fin = new Date(ini); fin.setDate(fin.getDate() + 6);
    rango.textContent = ini.getDate() + ' ' + MESES[ini.getMonth()] + ' – ' + fin.getDate() + ' ' + MESES[fin.getMonth()];
    $('[data-semana="-1"]').disabled = semana === 0;
    $('[data-semana="1"]').disabled = semana >= 4;
    $$('button', cajaDias).forEach(function (b) { b.remove(); });
    var primero = null;
    for (var i = 0; i < 7; i++) {
      var d = new Date(ini); d.setDate(ini.getDate() + i);
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab');
      b.innerHTML = '<small>' + NOMBRES[d.getDay()] + '</small><b>' + d.getDate() + '</b>';
      b.setAttribute('aria-label', NOMBRES[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]);
      var abierto = (horario[DIAS[d.getDay()]] || []).length && d >= hoy;
      if (!abierto) b.disabled = true;
      (function (d, b) { b.addEventListener('click', function () { elegir2(d, b); }); })(d, b);
      cajaDias.appendChild(b);
      if (abierto && !primero) primero = [d, b];
    }
    if (primero) elegir2(primero[0], primero[1]); else { cuerpo.innerHTML = '<tr><td colspan="6" class="vacio">No hay horas esta semana.</td></tr>'; marca.style.width = '0'; }
  };
  var elegir2 = function (d, b) {
    elegido = d;
    $$('button', cajaDias).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
    moverMarca(b);
    pintarHoras(d);
  };
  $$('[data-semana]').forEach(function (b) { b.addEventListener('click', function () { semana = Math.max(0, Math.min(4, semana + +b.dataset.semana)); pintarSemana(); }); });
  window.addEventListener('resize', function () { moverMarca($('[aria-selected="true"]', cajaDias)); });
  pintarSemana();

  /* Tarjetas de los planes: se inclinan siguiendo el puntero */
  if (fino.matches && !reduce.matches) {
    $$('[data-inclina]').forEach(function (t) {
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.classList.add('moviendo');
        t.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(2) + 'deg');
        t.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
        t.style.setProperty('--bx', (x * 100).toFixed(1) + '%');
        t.style.setProperty('--by', (y * 100).toFixed(1) + '%');
      });
      t.addEventListener('pointerleave', function () { t.classList.remove('moviendo'); t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
    });
  }
})();
