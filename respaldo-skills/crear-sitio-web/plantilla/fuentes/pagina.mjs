// Arma una landing completa a partir del contenido (c) y una estética (e).
// Las secciones con contenido null se omiten. "[PENDIENTE: algo]" en cualquier texto se muestra como aviso visible.
import { ICONOS } from './iconos.mjs';

const EXTRA = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 19 6v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M5 18.5 4 21l3.5-1.5A8.5 8.5 0 1 0 5 18.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
  <symbol id="i-share" viewBox="0 0 24 24"><path d="M12 15V4m-4 4 4-4 4 4M5 13v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>`;

const chk = (w = 16) => `<svg class="check" width="${w}" height="${w}"><use href="#i-check"/></svg>`;
export const ico = (id, w = 22) => `<span class="ico"><svg width="${w}" height="${w}"><use href="#i-${id}"/></svg></span>`;
export const arrow = `<svg class="btn-ico" width="18" height="18"><use href="#i-arrow"/></svg>`;
const li = (items, w) => items.map((t) => `<li>${chk(w)}${t}</li>`).join('');
const pad = (i) => String(i + 1).padStart(2, '0');
const esc = (t) => String(t).replace(/\[PENDIENTE[^\]]*\]/g, '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const pendientes = (html) => html.replace(/\[PENDIENTE(?::\s*([^\]]+))?\]/g, (m, q) => `<span class="note" title="Dato pendiente${q ? ': ' + q : ''}">por confirmar</span>`);
const titulo = (t, d) => (d && t.includes(d) ? t.replace(d, `<span class="accent">${d}</span>`) : t);

function secciones(c, d) {
  const out = [];
  if (c.resumen) out.push(`
  <section aria-labelledby="t-tldr">
    <div class="wrap">
      <div class="tldr reveal">
        <h2 id="t-tldr">${c.resumen.titulo || 'En 30 segundos'}</h2>
        <ul data-seq>${li(c.resumen.puntos)}</ul>
      </div>
    </div>
  </section>`);

  const S = c.servicios;
  if (S) out.push(`
  <section id="servicios" aria-labelledby="t-serv">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-serv" class="h2">${S.titulo}</h2>
        <p class="muted">${S.bajada}</p>
      </div>
      <div class="cards">
        ${S.items.map((s) => `<a class="svc reveal" href="#svc-${s.id}"${d.shine ? ' data-shine' : ''}><div class="svc-head">${ico(s.icono)}<h3 class="h3">${s.nombre}</h3></div><p>${s.texto}</p><span class="go">Ver detalle <svg width="14" height="14"><use href="#i-arrow"/></svg></span></a>`).join('\n        ')}
      </div>
    </div>
  </section>
  <section id="detalle" aria-labelledby="t-detalle">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-detalle" class="h2">${S.detalleTitulo || 'Qué recibes en cada servicio'}</h2>
        ${S.detalleBajada ? `<p class="muted">${S.detalleBajada}</p>` : ''}
      </div>
      <div class="ledger reveal" data-seq>
        <div class="ledger-head" aria-hidden="true"><span>Nº</span><span>Servicio</span><span>Qué recibes</span><span>${S.columnaIncluye || 'Viene en'}</span><span></span></div>
        ${S.items.map((s, i) => `<a class="entry" id="svc-${s.id}" href="${s.href || '#contacto'}"><span class="n">${pad(i)}</span><b>${s.nombre}</b><span class="d">${s.detalle}</span><span class="inc">${s.incluye || ''}</span><svg class="chev" width="18" height="18"><use href="#i-chev"/></svg></a>`).join('\n        ')}
      </div>
    </div>
  </section>`);

  const P = c.puntaje;
  if (P) out.push(`
  <section id="puntaje" aria-labelledby="t-puntaje">
    <div class="wrap">
      <div class="sec-head reveal">
        <h2 id="t-puntaje" class="h2">${P.titulo}</h2>
        <p class="muted">${P.bajada}</p>
      </div>
      <div class="report">
        <aside class="rail" data-rail aria-label="Recorrido">
          <div class="meter" data-score>
            ${d.medidor || '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="m-track" cx="50" cy="50" r="44"/><circle class="m-fill" cx="50" cy="50" r="44" pathLength="100"/></svg>'}
            <div class="m-read"><b class="num" data-score-out>0</b><small>${P.etiquetaMedidor || 'de 100<br>revisados'}</small></div>
          </div>
          <p>${P.rielTitulo || 'Así avanza tu revisión'}</p>
          <ol>
            ${P.aspectos.map((a, i) => `<li><a href="#d${i + 1}" data-pts="${a.pts}"><span>${a.corto || a.nombre}</span><span class="num">${a.pts}</span></a></li>`).join('\n            ')}
          </ol>
          <a class="btn btn-sm" href="#contacto">${P.cta || 'Pedir el mío'}</a>
        </aside>
        <div class="dims">
          ${P.aspectos.map((a, i) => `<article class="dim reveal" id="d${i + 1}">
            <div class="dim-head"><div><h3 class="h2">${a.nombre}</h3><span class="tag">${(d.aspecto || ((k) => `Aspecto ${pad(k)}`))(i)}</span></div><p class="pts"><b class="num">${a.pts}</b><span>puntos</span></p></div>
            <div class="dim-body">
              <div><h4>Qué revisamos</h4><ul class="checks" data-seq>${li(a.revisa, 15)}</ul></div>
              ${a.cita ? `<p class="low">${P.citaIntro || 'Cuando este puntaje es bajo, el cliente piensa:'}<q>${a.cita}</q></p>` : ''}
            </div>
            <div class="fix">
              <a class="fix-svc" href="${a.servicio ? '#svc-' + a.servicio : '#proceso'}">${ico(a.icono || 'check')}<div><b>${a.solucion}</b><span>${a.solucionDetalle || ''}</span></div></a>
              ${a.enPlanes ? `<div class="in-plans">${a.enPlanes.map((p) => `<span class="${p.startsWith('~') ? '' : 'y'}">${p.replace(/^~/, '')}</span>`).join('')}</div>` : ''}
            </div>
          </article>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>`);

  const R = c.proceso;
  if (R) out.push(`
  <section id="proceso" aria-labelledby="t-como">
    <div class="wrap sec-grid">
      <div class="reveal">
        <h2 id="t-como" class="h2">${R.titulo}</h2>
        <p class="lead">${R.bajada}</p>
      </div>
      <ol class="steps">
        ${R.pasos.map((p, i) => `<li class="step reveal">${ico(p.icono)}<div><header><span>${p.etapa}</span><span>Paso ${i + 1}</span></header><b>${p.titulo}</b><p>${p.texto}</p></div></li>`).join('\n        ')}
      </ol>
    </div>
  </section>`);

  const L = c.planes;
  if (L) out.push(`
  <section id="planes" aria-labelledby="t-planes">
    <div class="wrap">
      <div class="sec-head center reveal">
        <h2 id="t-planes" class="h2">${L.titulo}</h2>
        <p class="muted">${L.bajada}</p>
      </div>
      <div class="plans">
        ${L.items.map((p) => `<article class="plan${p.destacado ? ' pick' : ''} reveal"${d.shine ? ' data-shine' : ''}>
          <div class="plan-top"><h3 class="h3">${p.nombre}</h3>${p.destacado ? `<span class="rec">${L.etiquetaDestacado || 'Recomendado'}</span>` : ''}</div>
          <p class="price"><small>${p.prefijo ?? 'desde'}</small><b class="num">${p.precio}</b></p>
          <ul data-seq>${li(p.incluye)}</ul>
          <a class="btn${p.destacado ? ' btn-main' : ''}" href="#contacto">${p.cta || 'Empezar con ' + p.nombre}</a>
        </article>`).join('\n        ')}
      </div>
      ${L.promesas ? `<ul class="promises reveal" data-seq aria-label="Incluido en todos los planes">
        ${L.promesas.map((p) => `<li>${ico(p.icono, 20)}<div><b>${p.titulo}</b><span>${p.texto}</span></div></li>`).join('\n        ')}
      </ul>` : ''}
    </div>
  </section>`);

  const B = c.beneficio;
  if (B) out.push(`
  <section aria-labelledby="t-launch">
    <div class="wrap">
      <div class="gift-box reveal" id="beneficio">
        <div class="gift-text">
          <span class="gift-ico"><svg class="gift" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5v7h14v-7M12 12.5v7"/><g class="lid"><rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M12 8v4.5M12 8c-1.5-3.5-5.5-3.5-5.5-1 0 1 1 1 5.5 1Zm0 0c1.5-3.5 5.5-3.5 5.5-1 0 1-1 1-5.5 1Z"/></g></svg></span>
          <div><h2 id="t-launch">${B.titulo}</h2><p>${B.texto}</p></div>
        </div>
        <a class="btn btn-main" href="#contacto" data-benefit>${B.cta || 'Quiero participar'} ${arrow}</a>
      </div>
    </div>
  </section>`);

  const F = c.formulario;
  out.push(`
  <section aria-labelledby="t-pedir">
    <div class="wrap">
      <div class="ask reveal" id="contacto">
        <div>
          <h2 id="t-pedir" class="h2">${titulo(F.titulo, F.destacado)}</h2>
          <p class="muted">${F.bajada}</p>
          <div class="ask-alt">
            <b>¿Prefieres escribirnos?</b>
            <p><a href="mailto:${c.correo}">${c.correo}</a>${c.telefono ? ` · <a href="tel:${c.telefono.replace(/\s/g, '')}">${c.telefono}</a>` : ''}${c.promesaRespuesta ? ` · ${c.promesaRespuesta}` : ''}</p>
          </div>
        </div>
        <form data-demo-form data-seq data-done="${esc(F.confirmacion || '<b>Mensaje recibido.</b> Así se verá la confirmación. Esta maqueta no envía datos.')}" aria-label="${esc(F.titulo)} (maqueta, no envía datos)">
          <label>Tu nombre<input name="nombre" autocomplete="name" placeholder="${F.ejemploNombre || 'Ej.: Carolina'}" required></label>
          ${F.campoEmpresa === false ? '' : `<label>${F.campoEmpresa || 'Empresa o negocio'}<input name="empresa" autocomplete="organization" placeholder="${F.ejemploEmpresa || ''}" required data-negocio></label>`}
          <label>Correo<input name="correo" type="email" autocomplete="email" placeholder="tu@correo.cl" required></label>
          <label><span>Teléfono <small>(opcional)</small></span><input name="telefono" type="tel" autocomplete="tel" placeholder="+56 9"></label>
          ${S ? `<label class="full">¿Qué te interesa?<select name="servicio" required><option value="" selected disabled>Elige una opción</option>${S.items.map((s) => `<option>${s.nombre}</option>`).join('')}<option>Aún no lo sé</option></select></label>` : ''}
          <label class="full"><span>Cuéntanos más <small>(opcional)</small></span><textarea name="mensaje" rows="3"></textarea></label>
          ${B ? `<label class="check-row"><input type="checkbox" name="beneficio" data-benefit-check>${B.casilla || 'Me interesa el beneficio.'}</label>` : ''}
          <label class="check-row"><input type="checkbox" name="acepto" required>Acepto la política de privacidad y que me contacten por esta solicitud.</label>
          <button class="btn btn-main" type="submit"><span class="btn-label">${F.boton || 'Enviar'}</span>${arrow}</button>
          <p class="form-status" role="status"></p>
        </form>
      </div>
    </div>
  </section>`);

  if (c.faq) out.push(`
  <section id="preguntas" aria-labelledby="t-faq">
    <div class="wrap faq-grid">
      <div class="faq-side reveal">
        <h2 id="t-faq" class="h2">Preguntas frecuentes</h2>
        <p class="muted">¿No está tu duda? Escríbenos a <a href="mailto:${c.correo}">${c.correo}</a>.</p>
      </div>
      <div class="faq">
        ${c.faq.map(([q, a], i) => `<details class="reveal"><summary><span class="n">${pad(i)}</span><span>${q}</span><svg class="faq-i" width="20" height="20" aria-hidden="true"><use href="#i-plus"/></svg></summary><p>${a}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>`);

  const Z = c.cierre;
  out.push(`
  <section id="cierre" aria-labelledby="t-final">
    <div class="wrap">
      <div class="final reveal">
        ${d.final || ''}
        <h2 id="t-final" class="h2">${titulo(Z.titulo, Z.destacado)}</h2>
        <p>${Z.texto}</p>
        <div class="cta-row">
          <a class="btn btn-main" href="#contacto">${c.hero.cta} ${arrow}</a>
          <a class="btn" href="mailto:${c.correo}">${c.correo}</a>
        </div>
      </div>
    </div>
  </section>`);
  return out.join('\n');
}

export function pagina(c, e, n) {
  const d = e.deco || {};
  const nav = c.nav || [['Inicio', '#'], c.servicios && ['Servicios', '#servicios'], c.planes && ['Planes', '#planes'], c.faq && ['Preguntas', '#preguntas'], ['Contacto', '#contacto']].filter(Boolean);
  const html = `<!doctype html>
<html lang="${c.idioma || 'es'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.marca} · Opción ${n}: ${e.nombre}</title>
<meta name="description" content="${esc(c.descripcion)}">
<meta name="robots" content="noindex">
<script>var t,q=location.search.match(/tema=(dark|light)/);try{t=localStorage.getItem('tema')}catch(x){}if(q)t=q[1];document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'${e.tema || 'dark'}'</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${e.fuentes}&display=swap">
<link rel="stylesheet" href="nucleo.css">
<link rel="stylesheet" href="kit.css">
<style>
${e.css.trim()}
${c.cssExtra || ''}
</style>
</head>
<body>
${e.fondo || ''}
<a class="skip" href="#contenido">Saltar al contenido</a>
${ICONOS}${EXTRA}

<p class="proto">Opción ${n} · ${e.nombre} · <a href="index.html">ver todas las opciones</a></p>

<header class="top">
  <nav class="nav" aria-label="Principal">
    <a class="brand" href="#" aria-label="${esc(c.marca)}, inicio">${typeof e.marca === 'function' ? e.marca(c) : e.marca}<b>${c.marca}</b></a>
    <ul class="nav-links" id="menu">
      ${nav.map(([t, h], i) => `<li><a href="${h}"${i === 0 ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n      ')}
    </ul>
    <div class="nav-actions">
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Cambiar tema"><svg width="20" height="20"><use href="#i-sun"/></svg></button>
      <button class="icon-btn menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Abrir menú"><svg width="20" height="20"><use href="#i-menu"/></svg></button>
      <a class="btn btn-main btn-sm" href="#contacto">${c.ctaCorto || c.hero.cta}</a>
    </div>
  </nav>
</header>

<main id="contenido">
${e.hero(c, { ico, arrow }).trim()}
${secciones(c, d)}
</main>

<footer class="site-foot">
  <div class="wrap">
    <div class="foot reveal">
      <div><strong>${c.marca}</strong><br>${(c.pie || [c.descripcion]).join('<br>')}</div>
      <nav aria-label="Pie de página"><ul>${nav.slice(1).map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('')}<li><a href="#">Privacidad</a></li></ul></nav>
      <div>${c.correo}<br>© ${new Date().getFullYear()} ${c.marca}</div>
    </div>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Volver arriba"><svg width="20" height="20"><use href="#i-up"/></svg></button>
<div class="dock" role="region" aria-label="Acciones rápidas">
  <a class="btn btn-main" href="#contacto">${c.ctaCorto || 'Contactar'}</a>
  ${c.whatsapp ? `<a class="btn" href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}">WhatsApp</a>` : `<a class="btn" href="mailto:${c.correo}">Escríbenos</a>`}
</div>
<script src="mundo.js"></script>
<script src="secciones.js"></script>
${e.script ? e.script.trim() : ''}
</body>
</html>
`;
  return pendientes(html);
}
