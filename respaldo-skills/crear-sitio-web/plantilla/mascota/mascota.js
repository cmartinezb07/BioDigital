// Motor de mascota reactiva: un personaje fijo en la esquina que cambia de cara, gira y habla
// según lo que hace la persona (scroll, secciones, mouse, formularios, salir, volver, inactividad).
// Los personajes, sus frases y la configuración van en otro archivo que define window.MascotaConfig
// y se carga ANTES que este (ver mascota-personajes.js).
// Uso: <link rel="stylesheet" href="mascota.css">
//      <script src="mascota-personajes.js"></script> <script src="mascota.js"></script>
// Imágenes en <ruta>/<personaje>/<reaccion>.<formato>. Animaciones cuadro a cuadro: <reaccion>-1, -2, …
// API para otras páginas:
//   Mascota.reaccionar('muyfeliz', '¡Listo!', 2500)
//   document.dispatchEvent(new CustomEvent('mascota', { detail: 'login-ok' }))   // login-ok, login-error, error, enviado, copiado
(function () {
  if (window.Mascota) return;
  var CFG0 = window.MascotaConfig || {};
  var RUTA = (document.currentScript && document.currentScript.dataset.ruta) || CFG0.ruta || 'mascotas/';
  var FORMATO = CFG0.formato || 'webp';
  var REACCIONES = CFG0.reacciones || ['feliz', 'negacion', 'triste', 'enojado', 'sorprendido', 'soberbio', 'pensativo', 'afirmando', 'miedo', 'guino', 'cansado', 'muyfeliz'];
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hora = new Date().getHours();
  var SALUDO = hora < 12 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

  var C = window.MascotaConfig || {};
  if (!C.personajes) { console.warn('mascota.js: falta window.MascotaConfig (carga antes el archivo de personajes)'); return; }
  var MIRA = C.mira || {};
  var PERSONAS = C.personajes;
  var ANIMACIONES = C.animaciones || {};
  var SEL = Object.assign({ cta: '.btn-main', destacado: '.pick', precio: '.price', tarjeta: '.plan, .svc' }, C.selectores || {});
  var NOMBRES = Object.keys(PERSONAS);

  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  var animal = leer('mascota-animal');
  if (!PERSONAS[animal]) animal = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];

  // Estructura
  var raiz = document.createElement('div');
  raiz.className = 'mascota';
  raiz.dataset.animal = animal;
  raiz.innerHTML =
    '<div class="m-controles">' +
      '<button type="button" data-m="cambiar" aria-label="Cambiar de personaje">↻</button>' +
      '<button type="button" data-m="ocultar" aria-label="Esconder personaje">×</button>' +
    '</div>' +
    '<div class="m-cuerpo">' +
      '<span class="m-sombra" aria-hidden="true"></span>' +
      '<button class="m-boton" type="button" aria-label="Personaje de ' + (C.marca || 'la marca') + '. Toca para saludar."><span class="m-giro"><img alt="" decoding="async"></span></button>' +
      '<p class="m-globo" aria-hidden="true"></p>' +
    '</div>';
  var volver = document.createElement('button');
  volver.type = 'button';
  volver.className = 'm-volver';
  volver.textContent = 'Mostrar personaje';
  document.body.appendChild(raiz);
  document.body.appendChild(volver);

  var img = raiz.querySelector('img');
  var giro = raiz.querySelector('.m-giro');
  var globo = raiz.querySelector('.m-globo');
  var cache = {};

  function src(a, r) { return RUTA + a + '/' + r + '.' + FORMATO; }
  function precargar(a) {
    var lista = REACCIONES.slice();
    Object.keys(ANIMACIONES).forEach(function (r) {
      if (!cuadrosDe(a, r)) return;
      cuadrosDe(a, r).forEach(function (c) { lista.push(c); });
    });
    lista.forEach(function (r) {
      if (cache[a + r]) return;
      cache[a + r] = new Image();
      cache[a + r].src = src(a, r);
    });
  }
  // Animación cuadro a cuadro: { cuadros: 3, ms: 110, vueltas: 2, personajes: ['gato'] } -> archivos reaccion-1, reaccion-2, reaccion-3
  function cuadrosDe(a, r) {
    var an = ANIMACIONES[r];
    if (!an || (an.personajes && an.personajes.indexOf(a) < 0)) return null;
    var n = an.cuadros, out = [];
    for (var k = 1; k <= n; k++) out.push(r + '-' + k);
    return out;
  }
  var tCuadro = 0;
  function reproducir(estado, al) {
    clearTimeout(tCuadro);
    var cuadros = cuadrosDe(animal, estado);
    if (!cuadros) return false;
    var an = ANIMACIONES[estado];
    if (calm) { img.src = src(animal, cuadros[cuadros.length - 1]); al(); return true; }
    var total = cuadros.length * (an.vueltas || 1), i = 0;
    (function paso() {
      if (actual !== estado) return;
      img.src = src(animal, cuadros[i % cuadros.length]);
      if (i === 0) al();
      i++;
      if (i < total) tCuadro = setTimeout(paso, an.ms || 110);
      else if (an.final) tCuadro = setTimeout(function () { if (actual === estado) img.src = src(animal, an.final === 'primero' ? cuadros[0] : an.final); }, an.ms || 110);
    })();
    return true;
  }

  function azar(lista, clave) {
    if (lista.length < 2) return lista[0];
    var i;
    do { i = Math.floor(Math.random() * lista.length); } while (lista[i] === azar[clave]);
    azar[clave] = lista[i];
    return lista[i];
  }

  // ---- Dirección de la mirada: 'd' (hacia el contenido) o 'i' (hacia afuera) ----
  var lado = 'd';
  var tMirar = 0;
  function orientar() {
    var m = MIRA[animal];
    var nat = m[actual] || m['*'] || 'f';
    var voltear = nat !== 'f' && nat !== lado;
    // Los dibujos de frente también se voltean al mirar hacia afuera, para que el giro se note
    if (nat === 'f') voltear = lado === 'i';
    giro.style.setProperty('--dir', voltear ? -1 : 1);
  }
  function mirar(hacia, ms) {
    lado = hacia;
    orientar();
    clearTimeout(tMirar);
    if (ms) tMirar = setTimeout(function () { lado = 'd'; orientar(); }, ms);
  }
  function ladoDe(el) {
    var r = el.getBoundingClientRect(), m = raiz.getBoundingClientRect();
    return r.left + r.width / 2 < m.left + m.width / 2 ? 'i' : 'd';
  }

  // ---- Estado: ánimo base por sección + reacciones cortas que lo interrumpen ----
  var base = 'sorprendido';
  var actual = null;
  var hastaT = 0;
  var prioridadActual = 0;
  var tVolver = 0, tGlobo = 0, tGesto = 0, tControles = 0;
  var ultimaFrase = 0;

  function mostrar(estado, gesto) {
    if (estado !== actual) {
      actual = estado;
      var pedido = src(animal, estado);
      var cambiar = function () {
        if (actual !== estado) return;
        var alMostrar = function () {
          orientar();
          if (!calm) { img.classList.remove('pop'); void img.offsetWidth; img.classList.add('pop'); }
        };
        if (!reproducir(estado, alMostrar)) { clearTimeout(tCuadro); img.src = pedido; alMostrar(); }
      };
      var pre = cache[animal + estado];
      if (pre && !pre.complete) pre.addEventListener('load', cambiar, { once: true }); else cambiar();
    }
    if (gesto && !calm) {
      raiz.classList.remove('sacude', 'salta', 'tiembla', 'asiente');
      void raiz.offsetWidth;
      raiz.classList.add(gesto);
      clearTimeout(tGesto);
      tGesto = setTimeout(function () { raiz.classList.remove(gesto); }, 700);
    }
  }
  function decir(texto, ms) {
    clearTimeout(tGlobo);
    if (!texto) { raiz.classList.remove('habla'); return; }
    globo.textContent = texto.replace('{s}', SALUDO);
    raiz.classList.add('habla');
    ultimaFrase = Date.now();
    tGlobo = setTimeout(function () { raiz.classList.remove('habla'); }, ms || 2600);
  }
  // prioridad: 1 ambiente (scroll, mirar), 2 interacción, 3 resultado (error, envío, toque)
  function reaccionar(estado, texto, ms, gesto, prioridad) {
    prioridad = prioridad || 2;
    var ahora = Date.now();
    if (ahora < hastaT && prioridad < prioridadActual) return false;
    ms = ms || 2200;
    hastaT = ahora + ms;
    prioridadActual = prioridad;
    mostrar(estado, gesto);
    if (texto) decir(texto, Math.max(ms, Math.min(1400 + texto.length * 45, 4200)));
    clearTimeout(tVolver);
    tVolver = setTimeout(function () { prioridadActual = 0; mostrar(base); }, ms);
    return true;
  }
  // Evento de personalidad: cara y frase del animal actual
  function evento(nombre, ms, prioridad, conFrase) {
    var e = PERSONAS[animal].ev[nombre];
    if (!e) return false;
    var frase = conFrase === false ? null : azar(e[1], animal + nombre);
    return reaccionar(e[0], frase, ms, e[2], prioridad);
  }
  function ponerBase(estado) {
    base = estado;
    if (Date.now() >= hastaT) mostrar(base);
  }
  function soltar() { hastaT = 0; prioridadActual = 0; mostrar(base); }

  // ---- Llegada ----
  var inicio = Date.now();
  precargar(animal);
  mostrar('sorprendido', 'salta');
  setTimeout(function () { evento('llegada', 3200, 3); }, 900);
  setTimeout(function () { ponerBase('feliz'); }, 4200);

  // ---- Controles: cambiar, esconder, tocar ----
  function cambiarAnimal() {
    animal = NOMBRES[(NOMBRES.indexOf(animal) + 1) % NOMBRES.length];
    raiz.dataset.animal = animal;
    guardar('mascota-animal', animal);
    precargar(animal);
    actual = null;
    reaccionar('muyfeliz', PERSONAS[animal].presentacion, 2600, 'salta', 3);
    reiniciarInactivo();
  }
  var toques = [];
  raiz.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.m === 'cambiar') { cambiarAnimal(); return; }
    if (b.dataset.m === 'ocultar') { raiz.classList.add('oculta'); volver.classList.add('ver'); guardar('mascota-oculta', '1'); return; }
    if (!fine) {
      raiz.classList.add('controles');
      clearTimeout(tControles);
      tControles = setTimeout(function () { raiz.classList.remove('controles'); }, 4000);
    }
    var ahora = Date.now();
    toques = toques.filter(function (t) { return ahora - t < 2000; });
    toques.push(ahora);
    evento(toques.length >= 4 ? 'muchosToques' : 'toque', 2400, 3);
  });
  volver.addEventListener('click', function () {
    raiz.classList.remove('oculta'); volver.classList.remove('ver'); guardar('mascota-oculta', '');
    evento('volver', 2000, 3);
  });
  if (leer('mascota-oculta') === '1') { raiz.classList.add('oculta'); volver.classList.add('ver'); }

  // ---- Scroll ----
  var P = function () { return PERSONAS[animal]; };
  var ultimoY = scrollY, ultimoT = performance.now(), tParo = 0, ticking = false, estuvoAbajo = false, dijoFinal = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = scrollY, t = performance.now();
      var vel = Math.abs(y - ultimoY) / Math.max(t - ultimoT, 1);
      var baja = y > ultimoY;
      ultimoY = y; ultimoT = t;
      var hablar = Date.now() - ultimaFrase > 14000 && Math.random() < .35;
      if (vel > P().miedoVel) evento('rapido', 1400, 1);
      else if (vel > .15) evento(baja ? 'bajar' : 'subir', 1000, 1, hablar);
      // Final de la página y regreso al inicio
      var fondo = document.documentElement.scrollHeight - innerHeight - y < 80;
      if (fondo && !dijoFinal) { dijoFinal = true; setTimeout(function () { evento('final', 3000, 2); }, 350); }
      if (y > innerHeight * 2) estuvoAbajo = true;
      if (y < 60 && estuvoAbajo) { estuvoAbajo = false; setTimeout(function () { evento('arriba', 2200, 2); }, 300); }
      clearTimeout(tParo);
      tParo = setTimeout(function () { if (prioridadActual <= 1) soltar(); }, 700);
    });
  }, { passive: true });

  // ---- Ánimo por sección (comenta una vez por sección) ----
  var SECCIONES = C.secciones || {};
  var BASES = C.bases || {};
  var dichas = {};
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var clave = SECCIONES[e.target.id];
        if (!clave) return;
        if (BASES[clave]) ponerBase(BASES[clave]);
        if (!dichas[clave] && Date.now() - inicio > 2500) {
          dichas[clave] = 1;
          evento(clave, 2800, 2);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(SECCIONES).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    var hero = document.querySelector('.hero, #home');
    if (hero) new IntersectionObserver(function (es) { if (es[0].isIntersecting && Date.now() - inicio > 4500) ponerBase('feliz'); }).observe(hero);
  }

  // ---- Mouse: mira hacia lo que señalas ----
  var CTA = SEL.cta;
  if (fine) {
    var ultimoHover = 0;
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest([CTA, SEL.tarjeta, SEL.precio].join(', '));
      if (!t || t.contains(e.relatedTarget) || raiz.contains(t)) return;
      mirar(ladoDe(t), 1600);
      var ahora = Date.now();
      var hablar = ahora - ultimoHover > 6000;
      if (t.matches(CTA)) { if (evento('botón', 1600, 2, hablar)) ultimoHover = ahora; }
      else if (t.matches(SEL.destacado)) { if (evento('pick', 1600, 2, hablar)) ultimoHover = ahora; }
      else if (t.matches(SEL.precio)) { if (evento('precio', 2000, 2, hablar)) ultimoHover = ahora; }
      else reaccionar('afirmando', null, 1000, 'asiente', 1);
    });
    // Mira de reojo: si el mouse pasa por la izquierda del personaje, se da vuelta
    document.addEventListener('pointermove', function (e) {
      if (Date.now() < hastaT && prioridadActual >= 2) return;
      var m = raiz.getBoundingClientRect();
      var hacia = e.clientX < m.left + m.width / 2 && e.clientY > m.top - 160 ? 'i' : 'd';
      if (hacia !== lado) mirar(hacia);
    }, { passive: true });
  }
  document.addEventListener('toggle', function (e) {
    if (e.target.matches && e.target.matches('.faq details') && e.target.open) evento('pregunta', 1800, 2);
  }, true);
  var temaBtn = document.querySelector('[data-theme-toggle]');
  if (temaBtn) temaBtn.addEventListener('click', function () {
    setTimeout(function () { evento(document.documentElement.dataset.theme === 'dark' ? 'oscuro' : 'claro', 2200, 3); }, 60);
  });
  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () { reaccionar('pensativo', null, 1400, 'asiente', 2); });
  document.addEventListener('copy', function () { evento('copiar', 1800, 2); });
  var tSel = 0;
  document.addEventListener('selectionchange', function () {
    clearTimeout(tSel);
    tSel = setTimeout(function () {
      var s = String(getSelection() || '');
      if (s.length > 25 && !document.activeElement.matches('input, textarea')) evento('seleccion', 1800, 1);
    }, 600);
  });
  var anchoPrevio = innerWidth, tAncho = 0;
  addEventListener('resize', function () {
    clearTimeout(tAncho);
    tAncho = setTimeout(function () {
      if (innerWidth < anchoPrevio - 120) evento('achicar', 1600, 1);
      anchoPrevio = innerWidth;
    }, 250);
  });

  // ---- Formularios ----
  // Datos personales: se da vuelta y mira hacia afuera. Error: enojado y "no". Envío: celebra dos veces.
  var SENSIBLES = 'input[type="email"], input[type="tel"], input[type="password"], input[autocomplete="email"], input[autocomplete="tel"], input[autocomplete*="cc-"]';
  var CAMPOS = 'form input, form select, form textarea';
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches(CAMPOS) || t.type === 'checkbox' || t.type === 'hidden') return;
    if (t.matches(SENSIBLES)) {
      mirar(ladoDe(t) === 'd' ? 'i' : 'd');
      evento('sensible', 60000, 3);
    } else {
      mirar(ladoDe(t));
      evento('campo', 60000, 2, !t.value && Date.now() - ultimaFrase > 5000);
    }
  });
  document.addEventListener('focusout', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches(CAMPOS) || t.type === 'checkbox') return;
    mirar('d');
    if (t.value && !t.checkValidity()) evento('malDato', 2400, 3);
    else if (t.value) reaccionar('afirmando', null, 900, 'asiente', 2);
    else soltar();
  });
  var letras = 0;
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches(CAMPOS) || t.matches(SENSIBLES) || t.type === 'checkbox') return;
    letras++;
    if (letras % 10 === 0) {
      raiz.classList.remove('asiente'); void raiz.offsetWidth; raiz.classList.add('asiente');
      setTimeout(function () { raiz.classList.remove('asiente'); }, 500);
    }
    if (t.value.length === 45 && t.matches('textarea')) {
      var ev = PERSONAS[animal].ev.tipeo;
      decir(azar(ev[1], animal + 'tipeo'), 2200);
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches && t.matches('[data-benefit-check]') && t.checked) evento('beneficioOk', 2000, 3);
  });
  var avisado = 0;
  document.addEventListener('invalid', function () {
    if (Date.now() - avisado < 600) return;
    avisado = Date.now();
    evento('incompleto', 2600, 3);
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.matches('[data-capture]')) { reaccionar('muyfeliz', '¡Vamos al formulario!', 1800, 'salta', 3); return; }
    var estado = f.querySelector('[role="status"]');
    if (!estado) return;
    evento('enviando', 60000, 3);
    var celebrar = function () {
      obs.disconnect();
      clearTimeout(tRespaldo);
      evento('enviado', 1900, 3);
      setTimeout(function () { evento('enviado', 2600, 3); ponerBase('feliz'); }, 1950);
    };
    var obs = new MutationObserver(function () { if (estado.textContent.trim()) celebrar(); });
    obs.observe(estado, { childList: true, characterData: true, subtree: true });
    var tRespaldo = setTimeout(function () { obs.disconnect(); soltar(); }, 8000);
  });

  // ---- Se aburre, se va, vuelve ----
  var tInactivo = 0, durmiendo = false;
  function reiniciarInactivo() {
    clearTimeout(tInactivo);
    if (durmiendo) { durmiendo = false; evento('despierta', 1800, 3); }
    tInactivo = setTimeout(function () {
      durmiendo = true;
      evento('cansado', 600000, 1);
    }, P().cansadoMs);
  }
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'].forEach(function (ev) { addEventListener(ev, reiniciarInactivo, { passive: true }); });
  if (fine) {
    var ultimoMov = 0;
    addEventListener('pointermove', function () {
      var ahora = Date.now();
      if (ahora - ultimoMov > 400) { ultimoMov = ahora; reiniciarInactivo(); }
    }, { passive: true });
  }
  reiniciarInactivo();

  // Mirar alrededor cuando no pasa nada
  setInterval(function () {
    if (Date.now() < hastaT || durmiendo || document.hidden || calm) return;
    if (Math.random() < .5) mirar(lado === 'd' ? 'i' : 'd', 1400);
  }, 7000);

  var ultimaSalida = 0;
  if (fine) document.addEventListener('mouseout', function (e) {
    if (e.relatedTarget || e.clientY > 0) return;
    if (Date.now() - ultimaSalida < 8000) return;
    ultimaSalida = Date.now();
    mirar('d');
    evento('irse', 3200, 3);
  });
  var tituloOriginal = document.title;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (!raiz.classList.contains('oculta')) document.title = PERSONAS[animal].titulo;
    } else {
      document.title = tituloOriginal;
      if (Date.now() - inicio > 4000) evento('volver', 2200, 3);
    }
  });

  // ---- Eventos con nombre desde otras partes del sitio ----
  var NOMBRADOS = { 'login-ok': 'loginOk', 'login-error': 'loginError', 'error': 'error', 'enviado': 'enviado', 'copiado': 'copiar' };
  document.addEventListener('mascota', function (e) {
    if (NOMBRADOS[e.detail]) evento(NOMBRADOS[e.detail], 2600, 3);
  });

  window.Mascota = {
    reaccionar: function (estado, texto, ms) { if (REACCIONES.indexOf(estado) > -1) reaccionar(estado, texto, ms, null, 3); },
    animal: function (a) {
      if (!PERSONAS[a]) return;
      animal = a; raiz.dataset.animal = a; guardar('mascota-animal', a); precargar(a); actual = null; decir(null); mostrar(base);
    },
    mirar: function (hacia, ms) { mirar(hacia === 'izquierda' || hacia === 'i' ? 'i' : 'd', ms); },
    evento: function (nombre) { return evento(nombre, 2600, 3); },
  };
})();
