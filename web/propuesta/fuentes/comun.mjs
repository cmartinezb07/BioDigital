// Contenido común de las opciones 3 a 8. Cada opción entrega su estética (o) y esto arma la página completa.
// o = { n, nombre, titulo, fuentes, css, hero, fondo, script, marca, tema, deco }
// Catálogo vigente desde el 11-oct-2026: seis productos con precio propio y un pack completo.

const ICONOS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-chev" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="3.3" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-book" viewBox="0 0 24 24"><path d="M5 4.5h9.5A3.5 3.5 0 0 1 18 8v11.5H8.5A3.5 3.5 0 0 1 5 16Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 9h5M9 12.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-web" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 8.5h18M9 21h6M12 17.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m11 12 8-8m-3 3 2 2m-4 0 1.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-walk" viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m9 21 2.5-6 2.5 2.5V21M8 12l3-4.5 3 1.5 2 3.5M11.5 15l-.5-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-learn" viewBox="0 0 24 24"><path d="m2.5 9 9.5-4.5L21.5 9 12 13.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
    <symbol id="i-send" viewBox="0 0 24 24"><path d="M4 12 20 4l-5 16-3.5-6.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-video" viewBox="0 0 24 24"><rect x="3" y="6" width="12.5" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m15.5 11.2 5.5-3.4v8.4l-5.5-3.4Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-qr" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5h3.2v3.2h-3.2zM20.5 13.5v7h-3.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 10.5h17M8 3.5v4M16 3.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="m9 15 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-card" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><circle cx="16.5" cy="10" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 15h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.5 2.5 5 13.5h5.5L9.5 21.5 19 10h-5.8Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
    <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
    <symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
  </defs>
</svg>`;

const chk = (w = 16) => `<svg class="check" width="${w}" height="${w}"><use href="#i-check"/></svg>`;
const ico = (id, w = 22) => `<span class="ico"><svg width="${w}" height="${w}"><use href="#i-${id}"/></svg></span>`;
const arrow = `<svg class="btn-ico" width="18" height="18"><use href="#i-arrow"/></svg>`;
const li = (items, w) => items.map((t) => `<li>${chk(w)}${t}</li>`).join('');
const clp = (n) => '$' + n.toLocaleString('es-CL');

// Los seis productos vigentes: id, ícono, nombre, precio, si el precio es "desde", qué es y qué recibes.
const SERVICIOS = [
  ['web', 'web', 'Página web', 49990, true, 'Un lugar propio en internet, rápido en el celular y con tu WhatsApp a la vista.',
    ['Hasta 5 secciones, hecha a tu medida', 'Botón de WhatsApp, mapa y horario', 'Queda a tu nombre y te enseñamos a editarla']],
  ['videos', 'video', 'Videos para redes', 9990, true, 'Videos cortos para Instagram y TikTok, grabados y editados en tu local.',
    ['Video vertical de 15 a 30 segundos', 'Grabación, edición, música y textos', 'Te lo entregamos listo para publicar']],
  ['menu', 'qr', 'Menú digital', 27990, true, 'Tu carta o lista de precios en un QR que cambias cuando quieras, sin reimprimir nada.',
    ['QR impreso para las mesas o el mesón', 'Foto, descripción y precio por producto', 'Cambias un precio en dos minutos']],
  ['fotos', 'camera', 'Registro fotográfico', 4990, false, 'Fotos reales de tu local y tus productos, listas para las redes, el menú y la web.',
    ['Sesión en tu local, sin estudio', '10 a 15 fotos editadas', 'Quedan tuyas, para usarlas donde quieras']],
  ['reservas', 'calendar', 'Sistema de reservas', 24990, true, 'Que te reserven hora desde el celular, sin llamadas ni mensajes cruzados.',
    ['Agenda en línea con tus horarios', 'Confirmación automática al cliente', 'Ves las reservas del día en tu teléfono']],
  ['fidelizacion', 'card', 'Tarjeta de fidelización', 9990, false, 'La tarjeta de sellos de toda la vida, pero en el celular del cliente.',
    ['QR con sellos, sin tarjetas de papel', 'Se guarda en Google Wallet y Apple Wallet', 'Ves cuántos clientes están volviendo']],
];
const SUMA = SERVICIOS.reduce((t, s) => t + s[3], 0);   // 127.940
const PACK = 79990;
const PACK_5 = 69990;                                   // promoción para los primeros 5 clientes
const AHORRO = SUMA - PACK;                             // 47.950

// Diagnóstico gratis: cinco aspectos que suman 100 puntos y miden qué tan digitalizado está el negocio.
const ASPECTOS = [
  ['Tu sitio propio', 25, 'web', 'web', '¿Tienes una página tuya, que se vea bien en el celular?', 'Lo resolvemos con tu página web'],
  ['Cómo se ve tu negocio', 20, 'fotos', 'camera', '¿Las fotos y los videos que te representan son tuyos y actuales?', 'Lo resolvemos con fotos y videos'],
  ['Qué vendes', 20, 'menu', 'qr', '¿Un cliente puede ver tu carta y tus precios sin preguntar?', 'Lo resolvemos con el menú digital'],
  ['Cómo te reservan', 20, 'reservas', 'calendar', '¿Se puede reservar o pedir sin llamarte por teléfono?', 'Lo resolvemos con el sistema de reservas'],
  ['Si el cliente vuelve', 15, 'fidelizacion', 'card', '¿Tienes alguna forma de premiar al que vuelve?', 'Lo resolvemos con la tarjeta de fidelización'],
];
const RIEL = ASPECTOS.map((a) => a[0]);

const PASOS = [
  ['search', 'Diagnóstico', 'Vemos juntos qué te falta', 'En el primer contacto revisamos tu negocio y te damos tu puntaje. Gratis y sin compromiso.'],
  ['send', 'Propuesta', 'Te decimos el precio', 'Eliges productos sueltos o el pack completo. El precio queda acordado antes de empezar.'],
  ['walk', 'Producción', 'Vamos a tu local', 'Fotos, videos y todo lo que necesite tu proyecto, en 3 a 7 días hábiles.'],
  ['key', 'Entrega', 'Todo queda a tu nombre', 'Te capacitamos y te entregamos los accesos, con acta de entrega.'],
];

// Promociones de lanzamiento. La de los primeros 5 clientes va en su propio bloque.
const PROMOS = [
  ['video', '2 videos para redes', 17990, 9990 * 2, 'Dos videos distintos, grabados el mismo día.'],
  ['video', '3 videos para redes', 24990, 9990 * 3, 'Un mes de contenido resuelto en una sola visita.'],
  ['card', 'Tarjeta de fidelización', 7990, 9990, 'Precio de lanzamiento del primer programa de sellos.'],
  ['qr', 'Menú digital + fotos', 29990, 27990 + 4990, 'El menú se ve mucho mejor con fotos tuyas.'],
  ['calendar', 'Reservas + fidelización', 29990, 24990 + 9990, 'Que reserven solos y que además vuelvan.'],
];

const PROMESAS = [
  ['key', 'Todo a tu nombre', 'La web, el menú y las cuentas quedan tuyas.'],
  ['walk', 'Vamos a tu local', 'Fotos, videos y capacitación presencial en el Gran Concepción.'],
  ['learn', 'Te enseñamos a usarlo', 'Cambiar precios, subir fotos y ver tus reservas.'],
  ['tag', 'Sabes cuánto pagas', 'Precio por producto, sin mensualidades escondidas.'],
];

const FAQ = [
  ['¿Cuánto cuesta?', `Cada producto tiene su precio: la página web parte en ${clp(49990)} y los videos en ${clp(9990)}. Los seis por separado suman ${clp(SUMA)}; el pack completo queda en ${clp(PACK)}.`],
  ['¿Puedo llevar un solo producto?', `Sí. Cada uno funciona por su cuenta. El pack conviene cuando quieres varios: te ahorras ${clp(AHORRO)}.`],
  ['¿De verdad es gratis el diagnóstico?', 'Sí. Es nuestra primera conversación: revisamos juntos qué tiene tu negocio y qué le falta, y te decimos tu puntaje. No tienes que contratar nada después.'],
  ['¿Cuánto se demora?', 'Entre 3 y 7 días hábiles de trabajo desde que tenemos tus fotos, textos y accesos. Por eso tomamos casi todo en la visita.'],
  ['¿El dominio y el hosting están incluidos?', 'No. El dominio .cl y el hosting se pagan una vez al año y quedan a nombre del negocio. <span class="note">por confirmar</span> Te decimos el valor exacto antes de empezar; nosotros no cobramos mensualidad.'],
  ['¿Por qué cobran anticipo?', 'Porque reservamos tiempo del equipo y vamos a tu local. El saldo lo pagas cuando todo está funcionando y firmamos el acta.'],
  ['¿La tarjeta de fidelización funciona en cualquier celular?', 'Sí. Se guarda en Google Wallet en Android y en Apple Wallet en iPhone. Tu cliente no instala ninguna aplicación nueva.'],
  ['¿Qué pasa si me demoro en mandar mis fotos o textos?', 'El plazo de producción se corre los mismos días y te avisamos.'],
  ['¿Tengo que saber de tecnología?', 'No. Nosotros hacemos todo y al final te enseñamos solo lo que vas a usar.'],
  ['¿Atienden fuera de Concepción?', 'La página web, el menú digital, las reservas y la tarjeta de fidelización se pueden hacer a distancia en todo Chile. Las fotos, los videos y la capacitación presencial son en el Gran Concepción.'],
  ['¿Qué hacen con mis datos?', 'Solo los usamos para hacer tu diagnóstico y contactarte por él.'],
  ['¿Quiénes son?', 'Somos una startup formada por cinco estudiantes de Ingeniería Civil Industrial de la Universidad de Concepción.'],
];

const MAIL = 'biodigitalici@gmail.com';
const pad = (i) => String(i + 1).padStart(2, '0');

export { SERVICIOS, SUMA, PACK, PACK_5, AHORRO, clp };

export function pagina(o) {
  const d = o.deco || {};
  const numAspecto = d.aspecto || ((i) => `Aspecto ${pad(i)}`);
  const b = o.n === 8 ? '' : '../';   // prefijo de los archivos compartidos (css, js, marca)
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${o.titulo}</title>
<meta name="description" content="Bío Digital: páginas web, videos para redes, menús digitales, fotos, reservas y tarjetas de fidelización para micro y pequeñas empresas del Gran Concepción.">
<link rel="icon" href="${b}marca/favicon-32.png" sizes="32x32">
<link rel="icon" href="${b}marca/icono-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="${b}marca/apple-touch-icon.png">
<meta property="og:title" content="${o.titulo}">
<meta property="og:description" content="Páginas web, videos para redes, menús digitales, fotos, reservas y tarjetas de fidelización para micro y pequeñas empresas del Gran Concepción.">
<meta property="og:image" content="${b}marca/og.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<script>var t,q=location.search.match(/tema=(dark|light)/);try{t=localStorage.getItem('bd-theme')}catch(e){}if(q)t=q[1];document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'${o.tema}'</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${o.fuentes}&display=swap">
<link rel="stylesheet" href="${b}nucleo.css">
<link rel="stylesheet" href="${b}kit.css">
<link rel="stylesheet" href="${b}mascota.css">
<link rel="stylesheet" href="${b}gato.css">
${o.head || ''}
<style>
${o.css.trim()}
${(o.mascota || '').trim()}
</style>
</head>
<body>
${o.fondo || ''}
<a class="skip" href="#contenido">Saltar al contenido</a>
${ICONOS}

${o.n === 8 ? '<p class="proto">Sitio de Bío Digital · <a href="plantillas/index.html">ver las plantillas ya hechas</a></p>' : `<p class="proto">Plantilla ${o.n} · ${o.nombre} · <a href="index.html">ver todas las plantillas</a> · <a href="../index.html">ir al sitio</a></p>`}

<header class="top">
  <nav class="nav" aria-label="Principal">
    <a class="brand" href="#" aria-label="Bío Digital, inicio">${o.marca}${o.marcaTexto === false ? '' : '<b>Bío Digital</b>'}</a>
    <ul class="nav-links" id="menu">
      <li><a href="#" aria-current="page">Inicio</a></li>
      <li><a href="#servicios">Servicios</a></li>
      <li><a href="#planes">Precios</a></li>
      <li><a href="#promos">Promociones</a></li>
      <li><a href="#contacto">Contacto</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Cambiar tema"><svg width="20" height="20"><use href="#i-sun"/></svg></button>
      <button class="icon-btn menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Abrir menú"><svg width="20" height="20"><use href="#i-menu"/></svg></button>
      <a class="btn btn-main btn-sm" href="#diagnostico">Diagnóstico gratis</a>
    </div>
  </nav>
</header>

<main id="contenido">
${o.hero.trim()}

  <section id="servicios" aria-labelledby="t-serv">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-serv" class="h2">Todo lo que tu negocio necesita</h2>
        <p class="muted">Seis productos con precio propio. Llevas el que te falta, o los seis juntos en el pack y te ahorras ${clp(AHORRO)}.</p>
      </div>
      <div class="cards six">
        ${SERVICIOS.map(([id, ic, t, precio, desde, p, items]) => `<a class="svc reveal" id="svc-${id}" href="#diagnostico"${d.shine ? ' data-shine' : ''}>
          <div class="svc-head">${ico(ic, 22)}<h3 class="h3">${t}</h3></div>
          <p class="tarifa">${desde ? '<small>desde</small>' : ''}<b class="num">${clp(precio)}</b></p>
          <p>${p}</p>
          <ul class="svc-list" data-seq>${li(items, 15)}</ul>
          <span class="go">Lo quiero <svg width="14" height="14"><use href="#i-arrow"/></svg></span>
        </a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="informe" aria-labelledby="t-informe">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-informe" class="h2">¿Qué tan digitalizado está tu negocio?</h2>
        <p class="muted">Es lo primero que hacemos cuando nos contactas: revisamos cinco aspectos que suman 100 puntos y te decimos cuál te conviene resolver primero. Gratis y sin compromiso.</p>
      </div>
      <div class="report">
        <aside class="rail" data-rail aria-label="Recorrido del diagnóstico">
          <div class="meter" data-score>
            ${d.medidor || '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="m-track" cx="50" cy="50" r="44"/><circle class="m-fill" cx="50" cy="50" r="44" pathLength="100"/></svg>'}
            <div class="m-read"><b class="num" data-score-out>0</b><small>de 100<br>revisados</small></div>
          </div>
          <p>Así avanza tu diagnóstico</p>
          <ol>
            ${RIEL.map((t, i) => `<li><a href="#d${i + 1}" data-pts="${ASPECTOS[i][1]}"><span>${t}</span><span class="num">${ASPECTOS[i][1]}</span></a></li>`).join('\n            ')}
          </ol>
          <a class="btn btn-sm" href="#diagnostico">Pedir el mío</a>
        </aside>
        <div class="dims">
          ${ASPECTOS.map(([t, pts, svc, ic, q, fix], i) => `<article class="dim corta reveal" id="d${i + 1}">
            <div class="dim-head"><div><h3 class="h2">${t}</h3><span class="tag">${numAspecto(i)}</span></div><p class="pts"><b class="num">${pts}</b><span>puntos</span></p></div>
            <p class="low"><q>${q}</q></p>
            <a class="fix-svc" href="#svc-${svc}">${ico(ic)}<div><b>${fix}</b><span>Ver qué incluye</span></div></a>
          </article>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>

  <section id="proceso" aria-labelledby="t-como">
    <div class="wrap sec-grid">
      <div class="reveal">
        <h2 id="t-como" class="h2">Así te vamos avisando</h2>
        <p class="lead">Del diagnóstico a la entrega, sabes en qué va tu proyecto. Todo termina a tu nombre y con capacitación.</p>
      </div>
      <ol class="steps" aria-label="Ejemplo de avisos del proceso">
        ${PASOS.map(([ic, etapa, t, p], i) => `<li class="step reveal">${ico(ic)}<div><header><span>${etapa}</span><span>Paso ${i + 1}</span></header><b>${t}</b><p>${p}</p></div></li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section id="planes" aria-labelledby="t-planes">
    <div class="wrap">
      <div class="sec-head center reveal">
        <h2 id="t-planes" class="h2">Precios claros, producto por producto</h2>
        <p class="muted">Sin mensualidades. Pagas una vez por lo que te hacemos y queda a tu nombre.</p>
      </div>
      <div class="precios">
        <div class="tarifario reveal" data-seq>
          ${SERVICIOS.map(([id, ic, t, precio, desde]) => `<a class="fila" href="#svc-${id}">${ico(ic, 18)}<b>${t}</b><span class="num">${desde ? '<small>desde</small> ' : ''}${clp(precio)}</span></a>`).join('\n          ')}
          <p class="fila total"><b>Los seis por separado</b><span class="num">${clp(SUMA)}</span></p>
        </div>
        <article class="pack reveal"${d.shine ? ' data-shine' : ''}>
          <div class="plan-top"><h3 class="h3">Pack completo</h3><span class="rec">Lo que más conviene</span></div>
          <p class="price"><small>los seis productos</small><b class="num">${clp(PACK)}</b></p>
          <p class="ahorro">Te ahorras <b>${clp(AHORRO)}</b> frente a comprarlos sueltos</p>
          <ul data-seq>${li(SERVICIOS.map((s) => s[2]))}</ul>
          <a class="btn btn-main" href="#diagnostico">Quiero el pack completo</a>
          <small class="pack-note">Los primeros 5 clientes lo llevan en ${clp(PACK_5)}.</small>
        </article>
      </div>
      <ul class="promises reveal" data-seq aria-label="Lo que viene con cualquier producto">
        ${PROMESAS.map(([ic, bb, s]) => `<li>${ico(ic, 20)}<div><b>${bb}</b><span>${s}</span></div></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section id="promos" aria-labelledby="t-promos">
    <div class="wrap">
      <div class="gift-box reveal" id="beneficio">
        <div class="gift-text">
          <span class="gift-ico"><svg class="gift" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5v7h14v-7M12 12.5v7"/><g class="lid"><rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M12 8v4.5M12 8c-1.5-3.5-5.5-3.5-5.5-1 0 1 1 1 5.5 1Zm0 0c1.5-3.5 5.5-3.5 5.5-1 0 1-1 1-5.5 1Z"/></g></svg></span>
          <div>
            <h2 id="t-promos">Precio de lanzamiento para los primeros 5 clientes</h2>
            <p>El pack completo queda en <b class="num">${clp(PACK_5)}</b> en vez de ${clp(PACK)}. Y si prefieres armar tu propia combinación, te hacemos un 10&nbsp;% de descuento sobre cualquier compra desde ${clp(30000)}. Cupos limitados a los primeros 5 clientes.</p>
          </div>
        </div>
        <a class="btn btn-main" href="#diagnostico" data-benefit>Quiero participar ${arrow}</a>
      </div>

      <div class="sec-head reveal promo-head">
        <h2 class="h2">Promociones fugaces</h2>
        <p class="muted">Combinaciones a precio rebajado mientras dure el lanzamiento.</p>
      </div>
      <div class="promos">
        ${PROMOS.map(([ic, t, precio, normal, p]) => `<article class="promo reveal"${d.shine ? ' data-shine' : ''}>
          <div class="promo-top">${ico(ic, 20)}<span class="flash"><svg width="13" height="13"><use href="#i-bolt"/></svg>Lanzamiento</span></div>
          <h3 class="h3">${t}</h3>
          <p class="promo-price"><b class="num">${clp(precio)}</b><s class="num">${clp(normal)}</s></p>
          <p class="promo-save">Ahorras ${clp(normal - precio)}</p>
          <p class="promo-txt">${p}</p>
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section aria-labelledby="t-pedir">
    <div class="wrap">
      <div class="ask reveal" id="diagnostico">
        <div>
          <h2 id="t-pedir" class="h2">Pide tu <span class="accent">diagnóstico gratis</span></h2>
          <p class="muted">Te escribimos, revisamos tu negocio contigo y te damos tu puntaje de 100. Recién ahí hablamos de precios. Hacemos un solo seguimiento y no insistimos.</p>
          <div class="ask-alt">
            <b>¿Prefieres escribirnos?</b>
            <p><a href="mailto:${MAIL}">${MAIL}</a> · Recibimos solicitudes 24/7 y respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
          </div>
        </div>
        <form data-demo-form data-seq data-done="&lt;b&gt;Solicitud registrada.&lt;/b&gt; Así se verá la confirmación: te escribiremos a tu correo. Esta maqueta no envía datos." aria-label="Solicitud de diagnóstico (maqueta, no envía datos)">
          <label>Tu nombre<input name="nombre" autocomplete="name" placeholder="Ej.: Carolina" required></label>
          <label>Nombre del negocio<input name="negocio" autocomplete="organization" placeholder="Ej.: Panadería del Cerro" required data-negocio></label>
          <label>Rubro<select name="rubro" required><option value="" selected disabled>Elige tu rubro</option><option>Gastronomía</option><option>Belleza y peluquería</option><option>Taller o servicio técnico</option><option>Almacén o tienda</option><option>Salud</option><option>Otro</option></select></label>
          <label>Comuna<input name="comuna" autocomplete="address-level2" placeholder="Ej.: San Pedro de la Paz" required></label>
          <label>Correo<input name="correo" type="email" autocomplete="email" placeholder="tu@correo.cl" required></label>
          <label><span>Teléfono <small>(opcional)</small></span><input name="telefono" type="tel" autocomplete="tel" placeholder="+56 9"></label>
          <label class="full"><span>¿Qué te interesa? <small>(opcional)</small></span><select name="interes"><option value="" selected>Todavía no lo sé</option>${SERVICIOS.map((s) => `<option>${s[2]}</option>`).join('')}<option>El pack completo</option></select></label>
          <label class="check-row"><input type="checkbox" name="beneficio" data-benefit-check>Me interesa el precio de lanzamiento para los primeros 5 clientes.</label>
          <label class="check-row"><input type="checkbox" name="acepto" required>Acepto la política de privacidad y que me contacten por este diagnóstico.</label>
          <button class="btn btn-main" type="submit"><span class="btn-label">Enviar solicitud</span>${arrow}</button>
          <p class="form-status" role="status"></p>
        </form>
      </div>
    </div>
  </section>

  <section id="preguntas" aria-labelledby="t-faq">
    <div class="wrap faq-grid">
      <div class="faq-side reveal">
        <h2 id="t-faq" class="h2">Preguntas frecuentes</h2>
        <p class="muted">¿No está tu duda? Escríbenos a <a href="mailto:${MAIL}">${MAIL}</a>.</p>
      </div>
      <div class="faq">
        ${FAQ.map(([q, a], i) => `<details class="reveal"><summary><span class="n">${pad(i)}</span><span>${q}</span><svg class="faq-i" width="20" height="20" aria-hidden="true"><use href="#i-plus"/></svg></summary><p>${a}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="contacto" aria-labelledby="t-final">
    <div class="wrap">
      <div class="final reveal">
        ${d.final || ''}
        <h2 id="t-final" class="h2">¿Tu negocio está listo <span class="accent">para vender en internet?</span></h2>
        <p>Te lo decimos gratis en la primera conversación. Recibimos solicitudes 24/7 y respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
        <div class="cta-row">
          <a class="btn btn-main" href="#diagnostico">Pide tu diagnóstico gratis ${arrow}</a>
          <a class="btn" href="mailto:${MAIL}">${MAIL}</a>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="site-foot">
  <div class="wrap">
    <div class="foot reveal">
      <div><strong>Bío Digital</strong><br>Presencia digital para micro y pequeñas empresas.<br>Presencial en el Gran Concepción · Remoto en todo Chile</div>
      <nav aria-label="Pie de página"><ul><li><a href="#servicios">Servicios</a></li><li><a href="#planes">Precios</a></li><li><a href="#promos">Promociones</a></li><li><a href="#contacto">Contacto</a></li><li><a href="#">Privacidad</a></li><li><a href="#">Términos</a></li></ul></nav>
      <div>${MAIL}<br>© 2026 Bío Digital</div>
    </div>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Volver arriba"><svg width="20" height="20"><use href="#i-up"/></svg></button>
<div class="dock" role="region" aria-label="Acciones rápidas">
  <a class="btn btn-main" href="#diagnostico">Diagnóstico gratis</a>
  <a class="btn" href="mailto:${MAIL}">Escríbenos</a>
</div>
<script src="${b}mundo.js"></script>
<script src="${b}secciones.js"></script>
${(o.mascotaJs || ['gato.js', 'mascota-gato.js', 'mascota.js']).map((f) => `<script src="${b}${f}"></script>`).join('\n')}
${o.script ? o.script.trim() : ''}
</body>
</html>
`;
}
