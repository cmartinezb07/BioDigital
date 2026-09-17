// Contenido común de las opciones 3 a 7. Cada opción entrega su estética (o) y esto arma la página completa.
// o = { n, nombre, titulo, fuentes, css, hero, fondo, script, marca, tema, deco }

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

const SERVICIOS = [
  ['ficha', 'pin', 'Ficha de Google Business', 'Que te encuentren en Google Maps cuando buscan tu rubro cerca.'],
  ['fotos', 'camera', 'Fotografía para negocios', 'Que el cliente sepa cómo es tu local antes de ir.'],
  ['catalogo', 'book', 'Catálogo digital', 'Que vean qué vendes y a qué precio sin tener que preguntar.'],
  ['web', 'web', 'Diseño web', 'Un lugar propio en internet, claro y rápido en el celular.'],
  ['dominio', 'mail', 'Dominio y correo', 'Una dirección con tu nombre que da confianza al escribirte.'],
];
const ENTREGAS = [
  ['Creación o recuperación, verificación y optimización de tu ficha.', 'Todos los planes'],
  ['10 a 15 fotos reales de tu local y tus productos.', 'Todos los planes'],
  ['Tu menú o lista de productos en PDF, o dentro de tu web en Premium.', 'Todos los planes'],
  ['Una sección en Estándar; de 3 a 5 secciones en Premium.', 'Estándar y Premium'],
  ['tunegocio.cl y contacto@tunegocio.cl a tu nombre, con el primer año incluido.', 'Estándar y Premium'],
];
const ASPECTOS = [
  ['Te encuentran', 30, ['Si apareces al buscar tu rubro en tu comuna', 'Si tu ficha de Google está verificada', 'Si la ficha es tuya o la creó otra persona'], 'Busqué y no apareció. Me fui al de al lado.', 'ficha', 'pin', 'Lo resolvemos con la ficha de Google Business', 'Creación o recuperación, verificación y optimización', null],
  ['Información completa', 20, ['Horario actualizado, incluso festivos', 'Teléfono, dirección y enlace correctos', 'Categoría principal y secundarias'], 'Decía abierto y llegué a una cortina cerrada.', 'ficha', 'pin', 'Lo resolvemos en tu ficha de Google', 'Datos completos y te enseñamos a mantenerlos', null],
  ['Imagen', 20, ['Cuántas fotos tienes y de qué', 'Si son tuyas o las subieron clientes', 'Fachada, interior, productos y equipo'], 'No sé cómo es por dentro. Mejor voy a uno que conozco.', 'fotos', 'camera', 'Lo resolvemos con fotografía para negocios', '10 a 15 fotos reales tomadas en tu local', null],
  ['Reputación', 15, ['Cuántas reseñas tienes y tu nota', 'Si respondes las reseñas, también las malas'], 'Nadie contestó ese reclamo. ¿Les importará?', null, 'star', 'Te enseñamos a responder reseñas', 'Plantillas y capacitación incluidas; no borramos ni compramos reseñas', null],
  ['Contacto', 15, ['Si tienes página web propia', 'Si tu WhatsApp o teléfono está a la vista', 'Si tu catálogo es fácil de encontrar'], 'Quería preguntar un precio y no encontré dónde.', 'web', 'web', 'Lo resolvemos con web, dominio, correo y catálogo', 'tunegocio.cl a tu nombre', 'base'],
];
const RIEL = ['Te encuentran', 'Información', 'Imagen', 'Reputación', 'Contacto'];
const PASOS = [
  ['search', 'Diagnóstico', 'Tu diagnóstico está listo', 'Revisamos gratis cómo te ve un cliente en Google.'],
  ['send', 'Propuesta', 'Te enviamos tu plan', 'En menos de 48 horas, con el precio acordado antes de empezar.'],
  ['walk', 'Implementación', 'Vamos a tu local', 'Fotos, ficha y web listas en 3 a 7 días hábiles desde que tenemos tu material.'],
  ['key', 'Entrega', 'Todo queda a tu nombre', 'Te capacitamos y te entregamos accesos, dominio y ficha, con acta de entrega.'],
];
const PLANES = [
  ['Base', '$150.000', ['Ficha de Google Business', '10 a 15 fotos profesionales', 'Catálogo en PDF', '1 capacitación · 7 días de soporte'], false],
  ['Estándar', '$250.000', ['Todo lo del plan Base', 'Página web de una sección', 'Dominio .cl y correo (1er año)', '1 capacitación · 14 días de soporte'], true],
  ['Premium', '$380.000', ['Todo lo del plan Estándar', 'Página web de 3 a 5 secciones', 'Catálogo dentro de tu web', '2 capacitaciones · 30 días de soporte'], false],
];
const PROMESAS = [
  ['key', 'Todo a tu nombre', 'Dominio, ficha y cuentas son tuyas.'],
  ['walk', 'Vamos a tu local', 'Fotos y capacitación presencial en el Gran Concepción.'],
  ['learn', 'Te enseñamos a usarlo', 'Responder reseñas, cambiar horario y subir fotos.'],
  ['tag', 'Sabes cuánto pagas', 'Precio acordado antes de empezar, sin cobros mensuales escondidos.'],
];
const FAQ = [
  ['¿Cuánto cuesta?', 'Los planes parten en $150.000. El precio final se confirma después del diagnóstico gratis, antes de que pagues nada.'],
  ['¿De verdad es gratis el diagnóstico?', 'Sí. Es la forma en que te mostramos cómo trabajamos. El informe es tuyo aunque no contrates nada.'],
  ['¿Cuánto se demora?', 'Entre 3 y 7 días hábiles de trabajo desde que tenemos tus fotos, textos y accesos. La verificación de Google puede sumar algunos días, y ese plazo lo pone Google.'],
  ['¿Por qué cobran anticipo?', 'Porque reservamos tiempo del equipo y vamos a tu local. El saldo lo pagas cuando todo está funcionando y firmamos el acta.'],
  ['¿Qué pasa si me demoro en mandar mis fotos o textos?', 'El plazo de producción se corre los mismos días y te avisamos. Por eso tomamos casi todo en la visita.'],
  ['¿Tengo que saber de tecnología?', 'No. Nosotros hacemos todo y al final te enseñamos solo lo que vas a usar.'],
  ['¿Sirve si mi negocio no está en internet?', 'Sí. En ese caso el informe te dice por dónde empezar.'],
  ['¿Me garantizan el primer lugar en Google Maps?', 'No. Nadie puede garantizarlo honestamente. Dejamos tu ficha completa y verificada, que es la base para competir.'],
  ['¿Atienden fuera de Concepción?', 'Sí: la ficha, la página web, el dominio y el correo se pueden hacer a distancia en todo Chile. Las fotos y la capacitación presencial son en el Gran Concepción.'],
  ['¿Qué hacen con mis datos?', 'Solo los usamos para hacer tu diagnóstico y contactarte por él.'],
  ['¿Quiénes son?', 'Somos una startup formada por cinco estudiantes de Ingeniería Civil Industrial de la Universidad de Concepción.'],
];

const MAIL = 'biodigitalici@gmail.com';
const pad = (i) => String(i + 1).padStart(2, '0');

export function pagina(o) {
  const d = o.deco || {};
  const numAspecto = d.aspecto || ((i) => `Aspecto ${pad(i)}`);
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${o.titulo}</title>
<meta name="description" content="Maqueta de propuesta de Bío Digital: presencia digital para micro y pequeñas empresas del Gran Concepción.">
<script>var t,q=location.search.match(/tema=(dark|light)/);try{t=localStorage.getItem('bd-theme')}catch(e){}if(q)t=q[1];document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'${o.tema}'</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${o.fuentes}&display=swap">
<link rel="stylesheet" href="nucleo.css">
<link rel="stylesheet" href="kit.css">
<link rel="stylesheet" href="mascota.css">
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

<p class="proto">Opción ${o.n} · ${o.nombre} · <a href="index.html">ver todas las opciones</a></p>

<header class="top">
  <nav class="nav" aria-label="Principal">
    <a class="brand" href="#" aria-label="Bío Digital, inicio">${o.marca}<b>Bío Digital</b></a>
    <ul class="nav-links" id="menu">
      <li><a href="#" aria-current="page">Inicio</a></li>
      <li><a href="#servicios">Servicios</a></li>
      <li><a href="#planes">Planes</a></li>
      <li><a href="#">Nosotros</a></li>
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

  <section aria-labelledby="t-tldr">
    <div class="wrap">
      <div class="tldr reveal">
        <h2 id="t-tldr">En 30 segundos</h2>
        <ul data-seq>${li(['Te dejamos visible en Google y Maps con una ficha completa.', 'Tomamos fotos reales de tu local y tus productos.', 'Armamos tu catálogo y, si lo necesitas, tu web con dominio .cl.', 'Todo queda a tu nombre, con capacitación y acta de entrega.', 'Planes desde $150.000, con diagnóstico gratis antes.'])}</ul>
      </div>
    </div>
  </section>

  <section id="servicios" aria-labelledby="t-serv">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-serv" class="h2">Todo lo que tu negocio necesita</h2>
        <p class="muted">Cinco servicios que se combinan en un plan para que un cliente te encuentre, confíe y te contacte.</p>
      </div>
      <div class="cards">
        ${SERVICIOS.map(([id, ic, t, p]) => `<a class="svc reveal" href="#svc-${id}"${d.shine ? ' data-shine' : ''}><div class="svc-head">${ico(ic, 22)}<h3 class="h3">${t}</h3></div><p>${p}</p><span class="go">Ver detalle <svg width="14" height="14"><use href="#i-arrow"/></svg></span></a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="entregables" aria-labelledby="t-entregas">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-entregas" class="h2">Cada cosa que te entregamos</h2>
        <p class="muted">Todos los planes incluyen la ficha de Google, las fotos y el catálogo; la web y el dominio vienen desde el plan Estándar.</p>
      </div>
      <div class="ledger reveal" data-seq>
        <div class="ledger-head" aria-hidden="true"><span>Nº</span><span>Servicio</span><span>Qué recibes</span><span>Viene en</span><span></span></div>
        ${SERVICIOS.map(([id, , t], i) => `<a class="entry" id="svc-${id}" href="#"><span class="n">${pad(i)}</span><b>${t}</b><span class="d">${ENTREGAS[i][0]}</span><span class="inc">${ENTREGAS[i][1]}</span><svg class="chev" width="18" height="18"><use href="#i-chev"/></svg></a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="informe" aria-labelledby="t-informe">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-informe" class="h2">¿Cuántos puntos saca tu negocio en Google?</h2>
        <p class="muted">Así es el diagnóstico gratis: revisamos cómo te ve un cliente que te busca en Google y en Maps, en cinco aspectos que suman 100 puntos. Te entregamos un informe de una página con tu puntaje y las tres mejoras que más te convienen.</p>
      </div>
      <div class="report">
        <aside class="rail" data-rail aria-label="Recorrido del informe">
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
          ${ASPECTOS.map(([t, pts, rev, q, svc, ic, fb, fs, base], i) => `<article class="dim reveal" id="d${i + 1}">
            <div class="dim-head"><div><h3 class="h2">${t}</h3><span class="tag">${numAspecto(i)}</span></div><p class="pts"><b class="num">${pts}</b><span>puntos</span></p></div>
            <div class="dim-body">
              <div><h4>Qué revisamos</h4><ul class="checks" data-seq>${li(rev, 15)}</ul></div>
              <p class="low">Cuando este puntaje es bajo, el cliente piensa:<q>${q}</q></p>
            </div>
            <div class="fix">
              <a class="fix-svc" href="${svc ? '#svc-' + svc : '#proceso'}">${ico(ic)}<div><b>${fb}</b><span>${fs}</span></div></a>
              <div class="in-plans">${base ? '<span>Base: catálogo</span>' : '<span class="y">Base</span>'}<span class="y">Estándar</span><span class="y">Premium</span></div>
            </div>
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
        <h2 id="t-planes" class="h2">Planes claros, desde <span class="num">$150.000</span></h2>
        <p class="muted">El precio final se confirma después del diagnóstico gratis, antes de que pagues nada.</p>
      </div>
      <div class="plans">
        ${PLANES.map(([nom, precio, items, pick]) => `<article class="plan${pick ? ' pick' : ''} reveal"${d.shine ? ' data-shine' : ''}>
          <div class="plan-top"><h3 class="h3">${nom}</h3>${pick ? '<span class="rec">Recomendado</span>' : ''}</div>
          <p class="price"><small>desde</small><b class="num">${precio}</b></p>
          <ul data-seq>${li(items)}</ul>
          <a class="btn${pick ? ' btn-main' : ''}" href="#diagnostico">Empezar con ${nom}</a>
        </article>`).join('\n        ')}
      </div>
      <ul class="promises reveal" data-seq aria-label="Lo que viene en todos los planes">
        ${PROMESAS.map(([ic, b, s]) => `<li>${ico(ic, 20)}<div><b>${b}</b><span>${s}</span></div></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section aria-labelledby="t-launch">
    <div class="wrap">
      <div class="gift-box reveal" id="beneficio">
        <div class="gift-text">
          <span class="gift-ico"><svg class="gift" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5v7h14v-7M12 12.5v7"/><g class="lid"><rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M12 8v4.5M12 8c-1.5-3.5-5.5-3.5-5.5-1 0 1 1 1 5.5 1Zm0 0c1.5-3.5 5.5-3.5 5.5-1 0 1-1 1-5.5 1Z"/></g></svg></span>
          <div>
            <h2 id="t-launch">Beneficio para nuestros primeros 5 clientes</h2>
            <p>Si nos autorizas a publicar tu caso y tu opinión, te damos el doble de soporte después de la entrega. Cupos limitados a los primeros 5 clientes.</p>
          </div>
        </div>
        <a class="btn btn-main" href="#diagnostico" data-benefit>Quiero participar ${arrow}</a>
      </div>
    </div>
  </section>

  <section aria-labelledby="t-pedir">
    <div class="wrap">
      <div class="ask reveal" id="diagnostico">
        <div>
          <h2 id="t-pedir" class="h2">Pide tu <span class="accent">diagnóstico gratis</span></h2>
          <p class="muted">Te lo entregamos por correo, o en tu local si estás en el Gran Concepción. Hacemos un solo seguimiento y no insistimos.</p>
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
          <label class="full"><span>Enlace a tu Instagram o ficha de Maps <small>(opcional)</small></span><input name="enlace" type="url" placeholder="https://"></label>
          <label class="check-row"><input type="checkbox" name="beneficio" data-benefit-check>Me interesa el beneficio para los primeros 5 clientes.</label>
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
        <h2 id="t-final" class="h2">¿Tu negocio aparece <span class="accent">cuando te buscan?</span></h2>
        <p>Te lo decimos gratis. Recibimos solicitudes 24/7 y respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
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
      <nav aria-label="Pie de página"><ul><li><a href="#servicios">Servicios</a></li><li><a href="#planes">Planes</a></li><li><a href="#">Nosotros</a></li><li><a href="#contacto">Contacto</a></li><li><a href="#">Privacidad</a></li><li><a href="#">Términos</a></li></ul></nav>
      <div>${MAIL}<br>© 2026 Bío Digital</div>
    </div>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Volver arriba"><svg width="20" height="20"><use href="#i-up"/></svg></button>
<div class="dock" role="region" aria-label="Acciones rápidas">
  <a class="btn btn-main" href="#diagnostico">Diagnóstico gratis</a>
  <a class="btn" href="mailto:${MAIL}">Escríbenos</a>
</div>
<script src="mundo.js"></script>
<script src="secciones.js"></script>
<script src="mascota-personajes.js"></script>
<script src="mascota.js"></script>
${o.script ? o.script.trim() : ''}
</body>
</html>
`;
}
