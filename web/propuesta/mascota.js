// Motor de mascota reactiva: un personaje fijo en la esquina que cambia de cara, gira y habla
// según lo que hace la persona (scroll, secciones, mouse, formularios, salir, volver, inactividad).
// Los personajes, sus frases y la configuración van en otro archivo que define window.MascotaConfig
// y se carga ANTES que este (ver mascota-personajes.js).
// Uso: <link rel="stylesheet" href="mascota.css">
//      <script src="mascota-personajes.js"></script> <script src="mascota.js"></script>
// Imágenes en <ruta>/<personaje>/<reaccion>.<formato>. Animaciones cuadro a cuadro: <reaccion>-1, -2, …
// Personaje dibujado en SVG (gato.js): si la configuración trae rig: true y existe window.MascotaRig,
// el motor no cambia imágenes: le pide poses y gestos al dibujo, que se anima solo a 60 cuadros por segundo.
// Cuidados contra usos raros: el scroll provoca una reacción por tramo (no una por cuadro), el mouse solo provoca
// reacciones si se detiene encima de algo, un globo recién aparecido no se tapa y ninguno queda pegado, y un mouse
// sacudido no dispara reacciones (si se sostiene, el gato se marea, con pausa larga entre mareos).
// API para otras páginas:
//   bdMascota.reaccionar('muyfeliz', '¡Listo!', 2500)
//   document.dispatchEvent(new CustomEvent('mascota', { detail: 'login-ok' }))   // login-ok, login-error, error, enviado, copiado
(function () {
  if (window.bdMascota) return;
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
  var RIG = C.rig && window.MascotaRig ? window.MascotaRig.crear() : null;

  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  var animal = leer('mascota-animal');
  if (!PERSONAS[animal]) animal = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];

  // Estructura
  var raiz = document.createElement('div');
  raiz.className = 'mascota' + (RIG ? ' rig' : '') + (NOMBRES.length < 2 ? ' solo' : '');
  raiz.dataset.animal = animal;
  raiz.innerHTML =
    '<div class="m-controles">' +
      (NOMBRES.length > 1 ? '<button type="button" data-m="cambiar" aria-label="Cambiar de personaje">↻</button>' : '') +
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
  if (RIG) { giro.replaceChild(RIG.el, img); img = null; }
  var globo = raiz.querySelector('.m-globo');
  var cache = {};

  function src(a, r) { return RUTA + a + '/' + r + '.' + FORMATO; }
  function precargar(a) {
    if (RIG) return;
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
    var cuadros = RIG ? null : cuadrosDe(animal, estado);
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
  var lado = 'd', completo = false;
  var tMirar = 0;
  function orientar() {
    if (RIG) { RIG.mirar(lado, completo); return; }
    var m = MIRA[animal] || {};
    var nat = m[actual] || m['*'] || 'f';
    var voltear = nat !== 'f' && nat !== lado;
    // Los dibujos de frente también se voltean al mirar hacia afuera, para que el giro se note
    if (nat === 'f') voltear = lado === 'i';
    giro.style.setProperty('--dir', voltear ? -1 : 1);
  }
  // entero = true: con el dibujo SVG se da vuelta del todo (de perfil) en vez de solo girar la cabeza
  function mirar(hacia, ms, entero) {
    lado = hacia;
    completo = !!(RIG && entero);
    orientar();
    clearTimeout(tMirar);
    if (ms) tMirar = setTimeout(function () { lado = 'd'; completo = false; orientar(); }, ms);
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
  var ultimaFrase = 0, cambioPose = 0;
  // deScroll: la reacción actual la puso el scroll (al parar el scroll se suelta solo esa, no un gesto del mouse)
  var deScroll = false;
  var ultimoScroll = 0, ultimoMovReal = 0, agitadoHasta = 0, hoverEl = null;

  function mostrar(estado, gesto) {
    if (RIG) {
      if (estado !== actual) { actual = estado; cambioPose = Date.now(); RIG.pose(estado); }
      if (gesto) RIG.gesto(gesto);
      return;
    }
    if (estado !== actual) {
      actual = estado;
      cambioPose = Date.now();
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

  // ---- Control de comentarios ----
  // Un globo recién aparecido no se tapa: 2,2 s si lo nuevo es igual o menos importante, 1 s si es más importante
  // (así no hay globos que duran una fracción de segundo). Los de ambiente (scroll, sueltos) esperan 6 s desde el
  // último globo, y hay un tope de 5 comentarios por minuto. Los importantes (prioridad 3: toques, errores, envío,
  // aviso de scroll) siempre hablan.
  var globoPrio = 0, frasesMin = [];
  function puedeHablar(prioridad) {
    if (prioridad >= 3) return true;
    var ahora = Date.now();
    if (raiz.classList.contains('habla') && ahora - ultimaFrase < (prioridad > globoPrio ? 1000 : 2200)) return false;
    if (prioridad === 1 && ahora - ultimaFrase < 15000) return false;
    frasesMin = frasesMin.filter(function (t) { return ahora - t < 60000; });
    return frasesMin.length < 5;
  }
  // Tiempo de lectura de un globo: 2,2 a 4,2 s según el largo del texto
  function lectura(texto) { return Math.max(2200, Math.min(1400 + texto.length * 45, 4200)); }
  function decir(texto, ms, prioridad) {
    clearTimeout(tGlobo);
    if (!texto) { raiz.classList.remove('habla'); return; }
    globo.textContent = texto.replace('{s}', SALUDO);
    raiz.classList.add('habla');
    if (RIG) RIG.hablar(Math.min(2600, 500 + texto.length * 48));
    ultimaFrase = Date.now();
    globoPrio = prioridad || 2;
    frasesMin.push(ultimaFrase);
    tGlobo = setTimeout(function () { raiz.classList.remove('habla'); }, ms || 2600);
  }
  // prioridad: 1 ambiente (scroll, mirar), 2 interacción, 3 resultado (error, envío, toque)
  function reaccionar(estado, texto, ms, gesto, prioridad) {
    prioridad = prioridad || 2;
    var ahora = Date.now();
    if (ahora < hastaT && prioridad < prioridadActual) return false;
    // Ambiente: no cambia una cara que lleva menos de 0,8 s (evita que empiece un movimiento y salte a otro)
    if (prioridad === 1 && estado !== actual && ahora - cambioPose < 800) return false;
    ms = ms || 2200;
    hastaT = ahora + ms;
    prioridadActual = prioridad;
    deScroll = false;
    mostrar(estado, gesto);
    // El globo dura lo que se tarda en leerlo (como máximo 1,2 s más), aunque la pose se mantenga más tiempo:
    // antes una reacción larga (scroll, campo, enviando, dormido) dejaba su globo pegado hasta 60 s
    if (texto && puedeHablar(prioridad)) decir(texto, Math.min(Math.max(ms, lectura(texto)), lectura(texto) + 1200), prioridad);
    clearTimeout(tVolver);
    // Al terminar vuelve a la pose de la sección; si la página se está moviendo, espera a que pare el scroll
    tVolver = setTimeout(function () { prioridadActual = 0; if (Date.now() - ultimoScroll > 300) mostrar(base); }, ms);
    return true;
  }
  // Evento de personalidad: cara y frase del animal actual
  function evento(nombre, ms, prioridad, conFrase) {
    var e = PERSONAS[animal].ev[nombre];
    if (!e) return false;
    var frase = conFrase === false ? null : azar(e[1], animal + nombre);
    var cara = Array.isArray(e[0]) ? azar(e[0], animal + nombre + 'cara') : e[0];
    return reaccionar(cara, frase, ms, e[2], prioridad);
  }
  // Pose de fondo: mientras la página se está moviendo no se aplica (se aplica al parar el scroll)
  function ponerBase(estado) {
    base = estado;
    if (Date.now() >= hastaT && Date.now() - ultimoScroll > 300) mostrar(base);
  }
  function soltar() { hastaT = 0; prioridadActual = 0; deScroll = false; mostrar(base); }
  // Comentario que no se debe perder: si en ese momento no puede hablar, reintenta cada 0,5 s durante 3 s
  function comentar(nombre, ms, prioridad, demora) {
    var hasta = Date.now() + (demora || 0) + 3000;
    setTimeout(function intentar() {
      if (puedeHablar(prioridad) && evento(nombre, ms, prioridad)) return;
      if (Date.now() < hasta) setTimeout(intentar, 500);
    }, demora || 0);
  }

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
  // Toques: uno cada 0,9 s como máximo cambia la cara; 4 seguidos lo enojan y durante 3 s ignora más clics
  var toques = [], ultimoToque = 0, enojoHasta = 0;
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
    if (ahora < enojoHasta) return;
    if (toques.length >= 4) { enojoHasta = ahora + 3000; evento('muchosToques', 2400, 3); return; }
    if (ahora - ultimoToque < 900) return;
    ultimoToque = ahora;
    evento('toque', 2400, 3);
  });
  volver.addEventListener('click', function () {
    raiz.classList.remove('oculta'); volver.classList.remove('ver'); guardar('mascota-oculta', '');
    evento('volver', 2000, 3);
  });
  if (leer('mascota-oculta') === '1') { raiz.classList.add('oculta'); volver.classList.add('ver'); }

  // ---- Scroll ----
  var P = function () { return PERSONAS[animal]; };
  var ultimoY = scrollY, ultimoT = performance.now(), tParo = 0, ticking = false, estuvoAbajo = false, dijoFinal = false;
  // Una reacción por tramo de scroll, no una por cuadro. El sentido cambia solo después de recorrer 60 % de
  // pantalla seguido hacia el otro lado: los tirones cortos de la rueda (leer, dudar, subir y bajar) no cuentan.
  // Si el scroll va rápido (más de 2,5 pantallas por segundo) no hay reacción de ambiente: solo el aviso de "muy rápido".
  var sentido = 0, signo = 0, recorrido = 0, reaccionScroll = 0, velS = 0, tramoT0 = 0, reaccionoTramo = false;
  // "Muy rápido" = más de N pantallas por segundo sostenido durante medio segundo (no un tirón suelto),
  // sin contar los saltos de los enlaces del menú, el botón de subir ni las teclas Inicio/Fin/AvPág.
  var RAP = Object.assign({ pantallas: 4, ventanaMs: 500, pausaMs: 20000 }, C.rapido || {});
  var muestras = [], saltoHasta = 0, ultimoRapido = 0;
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a[href^="#"], .to-top, [data-capture] button')) saltoHasta = Date.now() + 1800;
  }, true);
  addEventListener('keydown', function (e) {
    if (['Home', 'End', 'PageDown', 'PageUp', ' '].indexOf(e.key) > -1) saltoHasta = Date.now() + 1400;
  });
  function muyRapido(y, t) {
    muestras.push([t, y]);
    while (muestras.length > 2 && t - muestras[1][0] >= RAP.ventanaMs) muestras.shift();
    var m = muestras[0];
    if (t - m[0] < RAP.ventanaMs || t - m[0] > RAP.ventanaMs * 2) return false;
    var pps = Math.abs(y - m[1]) / (t - m[0]) * 1000 / innerHeight;
    if (pps < RAP.pantallas || Date.now() < saltoHasta || Date.now() - ultimoRapido < RAP.pausaMs) return false;
    ultimoRapido = Date.now();
    muestras = [];
    return true;
  }
  addEventListener('scroll', function () {
    ultimoScroll = Date.now();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = scrollY, t = performance.now(), ahora = Date.now();
      var dy = y - ultimoY, vel = Math.abs(dy) / Math.max(t - ultimoT, 1);
      ultimoY = y; ultimoT = t;
      var s = dy > 0 ? 1 : dy < 0 ? -1 : 0;
      if (s) { if (s === signo) recorrido += Math.abs(dy); else { signo = s; recorrido = Math.abs(dy); tramoT0 = t - 16; } }
      // Velocidad del tramo actual (recorrido desde que empezó en este sentido), en pantallas por segundo
      velS = recorrido / Math.max(16, t - tramoT0) * 1000 / innerHeight;
      // Primer cambio de sentido del tramo: 60 % de pantalla; los siguientes (subir y bajar sin parar): 1,2 pantallas
      var umbral = innerHeight * (reaccionoTramo ? 1.2 : 0.6);
      if (RIG ? muyRapido(y, t) : vel > P().miedoVel) evento('rapido', 2000, RIG ? 3 : 1);
      else if (signo && signo !== sentido && recorrido >= umbral && ahora >= saltoHasta) {
        sentido = signo;
        // Se mantiene mientras siga el scroll (lo suelta la pausa de abajo); como máximo una cada 2,5 s
        if (ahora - reaccionScroll > 2500 && velS < 2.5) {
          reaccionScroll = ahora;
          reaccionoTramo = true;
          if (evento(sentido > 0 ? 'bajar' : 'subir', 60000, 1, Math.random() < .5)) deScroll = true;
        }
      }
      if (campoFoco) seguirCampo();
      // Final de la página y regreso al inicio
      var fondo = document.documentElement.scrollHeight - innerHeight - y < 80;
      if (fondo && !dijoFinal) { dijoFinal = true; comentar('final', 3000, 2, 350); }
      if (y > innerHeight * 2) estuvoAbajo = true;
      if (y < 60 && estuvoAbajo) { estuvoAbajo = false; comentar('arriba', 2200, 2, 300); }
      // Paró 0,7 s: termina el tramo y vuelve a la pose de la sección donde quedó
      clearTimeout(tParo);
      tParo = setTimeout(function () {
        muestras = []; sentido = 0; signo = 0; recorrido = 0; velS = 0; reaccionoTramo = false;
        if (deScroll || Date.now() >= hastaT) soltar();
      }, 700);
    });
  }, { passive: true });

  // ---- Ánimo por sección (comenta una vez por sección) ----
  var SECCIONES = C.secciones || {};
  var BASES = C.bases || {};
  var dichas = {};
  function escribiendo() { var f = document.activeElement; return !!(f && f.matches && f.matches('input, textarea, select')); }
  if ('IntersectionObserver' in window) {
    // Comenta cuando la sección lleva 0,65 s al centro de la pantalla, aunque la persona siga bajando despacio
    // (si pasa de largo rápido, no). Si justo hay un globo recién aparecido o un aviso importante, reintenta cada 0,5 s
    // mientras siga en la sección.
    var espera = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var clave = SECCIONES[e.target.id];
        if (!clave) return;
        if (!e.isIntersecting) { clearTimeout(espera[clave]); return; }
        if (BASES[clave]) ponerBase(BASES[clave]);
        if (dichas[clave]) return;
        clearTimeout(espera[clave]);
        espera[clave] = setTimeout(function intentar() {
          if (dichas[clave] || Date.now() - inicio < 2500) return;
          var ocupado = (Date.now() < hastaT && prioridadActual > 2) || escribiendo() || !puedeHablar(2);
          if (ocupado || !evento(clave, 2800, 2)) { espera[clave] = setTimeout(intentar, 500); return; }
          dichas[clave] = 1;
        }, 650);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(SECCIONES).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
    var hero = document.querySelector('.hero, #home');
    if (hero) new IntersectionObserver(function (es) { if (es[0].isIntersecting && Date.now() - inicio > 4500) ponerBase('feliz'); }).observe(hero);
  }

  // ---- Mouse ----
  // Los ojos siguen al puntero (gato.js suaviza los movimientos bruscos). Las reacciones al pasar por botones y
  // tarjetas solo ocurren si el mouse se detiene encima: no si pasa volando, ni si está agitado, ni si fue la
  // página la que se movió bajo el puntero (scroll).
  var CTA = SEL.cta, SEL_HOVER = [CTA, SEL.tarjeta, SEL.precio].join(', ');
  var px = -1, py = -1, movs = [];
  var MAREO = Object.assign({ pausaMs: 45000, max: 2 }, C.mareo || {});
  var mareos = 0, ultimoMareo = 0, agitadoDesde = 0;
  // Mouse agitado: muchos cambios de sentido amplios (más de 50 px) y rápidos en el último segundo (sacudirlo,
  // "buscar" el cursor, zigzag). Mientras dura no hay reacciones de hover; si es fuerte, el gato se marea.
  function agitacion(ahora, x, y) {
    movs.push([ahora, x, y]);
    while (movs.length && ahora - movs[0][0] > 1000) movs.shift();
    if (movs.length < 6) return;
    var giros = 0, largo = 0, sx = 0, sy = 0, ax = 0, ay = 0;
    for (var i = 1; i < movs.length; i++) {
      var dx = movs[i][1] - movs[i - 1][1], dy = movs[i][2] - movs[i - 1][2];
      largo += Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dx) >= 3) { var s1 = dx > 0 ? 1 : -1; if (s1 !== sx) { if (sx && ax > 50) giros++; sx = s1; ax = 0; } }
      ax += Math.abs(dx);
      if (Math.abs(dy) >= 3) { var s2 = dy > 0 ? 1 : -1; if (s2 !== sy) { if (sy && ay > 50) giros++; sy = s2; ay = 0; } }
      ay += Math.abs(dy);
    }
    var vel = largo / Math.max(0.3, (ahora - movs[0][0]) / 1000);
    if (giros >= 4 && vel > 1200) {
      if (ahora > agitadoHasta) agitadoDesde = ahora;
      agitadoHasta = ahora + 900;
      // Se marea solo si la sacudida fuerte se sostiene más de un segundo
      if (giros >= 7 && vel > 1800 && ahora - agitadoDesde > 1000) marear(ahora);
    }
  }
  function marear(ahora) {
    if (!PERSONAS[animal].ev.mareo || mareos >= MAREO.max || ahora - ultimoMareo < MAREO.pausaMs || ahora - inicio < 3000 || escribiendo()) return;
    if (evento('mareo', 2800, 2)) { ultimoMareo = ahora; mareos++; }
  }
  function velPuntero() {
    var n = movs.length;
    if (n < 2 || Date.now() - movs[n - 1][0] > 120) return 0;
    var a = movs[Math.max(0, n - 6)], b = movs[n - 1];
    return Math.sqrt((b[1] - a[1]) * (b[1] - a[1]) + (b[2] - a[2]) * (b[2] - a[2])) / Math.max(16, b[0] - a[0]) * 1000;
  }
  if (fine) {
    var tHover = 0, hoverHecho = null, ultimoHover = 0, ultimoAsiente = 0;
    var intencion = function (el) {
      tHover = 0;
      if (hoverEl !== el) return;
      var ahora = Date.now();
      // Espera a que el mouse se calme (va rápido, está agitado o la página se está moviendo)
      if (ahora < agitadoHasta || ahora - ultimoScroll < 350 || velPuntero() > 900) { tHover = setTimeout(function () { intencion(el); }, 200); return; }
      hoverHecho = el;
      var cta = el.matches(CTA);
      // Al botón principal lo mira de perfil, de frente a él; al resto, solo gira la cabeza
      mirar(ladoDe(el), 1800, cta);
      var hablar = ahora - ultimoHover > 6000;
      if (cta) { if (evento('botón', 1800, 2, hablar)) ultimoHover = ahora; }
      else if (el.matches(SEL.destacado)) { if (evento('pick', 1800, 2, hablar)) ultimoHover = ahora; }
      else if (el.matches(SEL.precio)) { if (evento('precio', 2000, 2, hablar)) ultimoHover = ahora; }
      else if (ahora - ultimoAsiente > 3000) { ultimoAsiente = ahora; reaccionar('afirmando', null, 1100, 'asiente', 1); }
    };
    var armarHover = function (el) {
      clearTimeout(tHover);
      tHover = setTimeout(function () { intencion(el); }, el.matches(CTA) ? 260 : 380);
    };
    document.addEventListener('pointerover', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      var el = e.target.closest && e.target.closest(SEL_HOVER);
      if (!el || el === hoverEl || raiz.contains(el)) return;
      hoverEl = el; hoverHecho = null;
      clearTimeout(tHover); tHover = 0;
      // Si fue la página la que se movió bajo el puntero, espera a que la persona mueva el mouse
      if (Date.now() - ultimoMovReal < 200) armarHover(el);
    });
    document.addEventListener('pointerout', function (e) {
      if (!hoverEl || (e.relatedTarget && hoverEl.contains(e.relatedTarget))) return;
      hoverEl = null; clearTimeout(tHover); tHover = 0;
    });
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      var x = e.clientX, y = e.clientY;
      // Mismo punto que antes = la página se movió bajo el puntero; no es un movimiento de la persona
      if (x === px && y === py) return;
      px = x; py = y;
      var ahora = Date.now();
      ultimoMovReal = ahora;
      agitacion(ahora, x, y);
      if (RIG) RIG.seguir(x, y);
      else if (!(ahora < hastaT && prioridadActual >= 2)) {
        // Mira de reojo: si el mouse pasa por la izquierda del personaje, se da vuelta
        var m = raiz.getBoundingClientRect();
        var hacia = x < m.left + m.width / 2 && y > m.top - 160 ? 'i' : 'd';
        if (hacia !== lado) mirar(hacia);
      }
      if (hoverEl && !tHover && hoverHecho !== hoverEl) armarHover(hoverEl);
    }, { passive: true });
    // El puntero salió de la ventana o la ventana perdió el foco: deja de seguirlo
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && RIG) { RIG.seguir(null); px = py = -1; } });
    addEventListener('blur', function () { if (RIG) RIG.seguir(null); });
  } else if (RIG) {
    // Pantallas táctiles: al tocar, mira un momento hacia donde se tocó
    var tMiraToque = 0;
    document.addEventListener('pointerdown', function (e) {
      if (raiz.contains(e.target)) return;
      RIG.seguir(e.clientX, e.clientY);
      clearTimeout(tMiraToque);
      tMiraToque = setTimeout(function () { RIG.seguir(null); }, 1500);
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
      if (s.length > 25 && !escribiendo()) evento('seleccion', 1800, 1);
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
  // Datos personales: se da vuelta y mira hacia afuera. Otros campos: los mira fijo mientras se llenan.
  // Error: enojado y "no". Envío: celebra dos veces.
  var SENSIBLES = 'input[type="email"], input[type="tel"], input[type="password"], input[autocomplete="email"], input[autocomplete="tel"], input[autocomplete*="cc-"]';
  var CAMPOS = 'form input, form select, form textarea';
  var campoFoco = null;
  function seguirCampo() {
    if (!RIG || !campoFoco) return;
    var r = campoFoco.getBoundingClientRect();
    RIG.foco(r.left + Math.min(r.width / 2, 160), r.top + r.height / 2);
  }
  document.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches(CAMPOS) || t.type === 'checkbox' || t.type === 'hidden') return;
    if (t.matches(SENSIBLES)) {
      campoFoco = null; if (RIG) RIG.foco(null);
      mirar(ladoDe(t) === 'd' ? 'i' : 'd');
      evento('sensible', 60000, 3);
    } else {
      campoFoco = t; seguirCampo();
      mirar(ladoDe(t));
      evento('campo', 60000, 2, !t.value && Date.now() - ultimaFrase > 5000);
    }
  });
  document.addEventListener('focusout', function (e) {
    var t = e.target;
    if (!t.matches || !t.matches(CAMPOS) || t.type === 'checkbox') return;
    campoFoco = null; if (RIG) RIG.foco(null);
    mirar('d');
    if (t.value && !t.checkValidity()) evento('malDato', 2400, 3);
    else if (t.value) reaccionar('afirmando', null, 900, 'asiente', 2);
    else soltar();
  });
  var letras = 0;
  document.addEventListener('input', function (e) {
    var t = e.target;
    // En un campo de datos personales solo mueve una oreja (no lee lo que se escribe)
    if (RIG && t.matches && t.matches(SENSIBLES)) { if (Math.random() < 0.3) RIG.oreja(); return; }
    if (!t.matches || !t.matches(CAMPOS) || t.matches(SENSIBLES) || t.type === 'checkbox') return;
    letras++;
    if (letras % 10 === 0 && RIG) RIG.gesto('asiente');
    else if (letras % 10 === 0) {
      raiz.classList.remove('asiente'); void raiz.offsetWidth; raiz.classList.add('asiente');
      setTimeout(function () { raiz.classList.remove('asiente'); }, 500);
    }
    if (t.value.length === 45 && t.matches('textarea') && puedeHablar(2)) {
      var ev = PERSONAS[animal].ev.tipeo;
      decir(azar(ev[1], animal + 'tipeo'), 2200, 2);
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
  var tInactivo = 0, durmiendo = false, ultimaActividad = Date.now();
  function reiniciarInactivo() {
    ultimaActividad = Date.now();
    clearTimeout(tInactivo);
    if (durmiendo) { durmiendo = false; evento('despierta', 1800, 3); }
    // Se duerme con prioridad 2: nada de ambiente lo despierta, solo la persona (scroll, mouse, teclado, toque)
    tInactivo = setTimeout(function () {
      durmiendo = true;
      evento('cansado', 600000, 2);
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

  // Comentarios sueltos: la persona está leyendo (activa, sin escribir) y el personaje lleva rato callado
  var ocios = 0;
  if (PERSONAS[animal].ev.ocio) setInterval(function () {
    var ahora = Date.now();
    if (ocios >= (C.ocioMax || 5) || durmiendo || document.hidden || raiz.classList.contains('oculta')) return;
    if (ahora < hastaT || ahora - ultimaFrase < 26000 || ahora - ultimaActividad > 15000 || ahora - inicio < 20000) return;
    if (escribiendo() || ahora < agitadoHasta || ahora - ultimoScroll < 1500) return;
    if (evento('ocio', 3600, 1)) ocios++;
  }, 9000);

  // Mirar alrededor cuando no pasa nada (si la persona mueve el mouse, los ojos ya la siguen: no mira a otro lado)
  setInterval(function () {
    var ahora = Date.now();
    if (ahora < hastaT || durmiendo || document.hidden || calm) return;
    if (ahora - ultimoMovReal < 4000 || ahora - ultimoScroll < 1500 || hoverEl || campoFoco) return;
    if (Math.random() >= .55) return;
    // A veces se da vuelta del todo hacia un lado (de perfil) y a veces solo gira la cabeza
    if (RIG && Math.random() < .6) mirar(Math.random() < .5 ? 'i' : 'd', 1900, true);
    else mirar(lado === 'd' ? 'i' : 'd', 1400);
  }, 7000);

  // Se va por arriba de la ventana: se burla (no si el mouse venía agitado, y como máximo una vez cada 20 s)
  var ultimaSalida = 0;
  if (fine) document.addEventListener('mouseout', function (e) {
    if (e.relatedTarget || e.clientY > 0) return;
    if (Date.now() - ultimaSalida < 20000 || Date.now() < agitadoHasta) return;
    ultimaSalida = Date.now();
    mirar('d');
    evento('irse', 3200, 3);
  });
  var tituloOriginal = document.title;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (!raiz.classList.contains('oculta')) document.title = PERSONAS[animal].titulo;
      if (RIG) RIG.seguir(null);
    } else {
      document.title = tituloOriginal;
      if (Date.now() - inicio > 4000) evento('volver', 2200, 3);
    }
  });

  // ---- Eventos con nombre desde otras partes del sitio ----
  var NOMBRADOS = { 'login-ok': 'loginOk', 'login-error': 'loginError', 'error': 'error', 'enviado': 'enviado', 'copiado': 'copiar', 'paleta': 'paleta' };
  var ultimaPaleta = 0;
  document.addEventListener('mascota', function (e) {
    if (e.detail === 'paleta') { if (Date.now() - ultimaPaleta < 9000) return; ultimaPaleta = Date.now(); }
    if (NOMBRADOS[e.detail]) evento(NOMBRADOS[e.detail], 2600, 3);
  });

  window.Mascota = window.bdMascota = {
    reaccionar: function (estado, texto, ms) { if (REACCIONES.indexOf(estado) > -1 || (RIG && RIG.poses().indexOf(estado) > -1)) reaccionar(estado, texto, ms, null, 3); },
    gesto: function (nombre) { if (RIG) RIG.gesto(nombre); },
    estado: function () { return actual; },
    animal: function (a) {
      if (!PERSONAS[a]) return;
      animal = a; raiz.dataset.animal = a; guardar('mascota-animal', a); precargar(a); actual = null; decir(null); mostrar(base);
    },
    mirar: function (hacia, ms) { mirar(hacia === 'izquierda' || hacia === 'i' ? 'i' : 'd', ms); },
    evento: function (nombre) { return evento(nombre, 2600, 3); },
  };
})();
