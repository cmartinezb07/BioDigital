// Genera el menú digital de un negocio a partir de menu.json. Parte de la skill crear-sitio-web: cumple sus requisitos
// (SEO, datos estructurados, seguridad, accesibilidad, legal, analítica) adaptados a una carta de una sola página.
//
// Uso (desde la carpeta del menú):
//   node generar-menu.mjs [menu.json]              → el menú final (index.html y archivos de apoyo)
//   node generar-menu.mjs [menu.json] --opciones   → además una maqueta por estilo (opcion-<estilo>.html) y opciones.html
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const archivo = resolve(args.find((a) => !a.startsWith('--')) || 'menu.json');
const dir = dirname(archivo);
const cfg = JSON.parse(readFileSync(archivo, 'utf8'));
const OPCIONES = args.includes('--opciones');

// Visor 3D / realidad aumentada: model-viewer de Google, versión fija y con hash de integridad (SRI).
// Para producción es mejor tenerlo en el propio sitio: guarda el archivo como vendor/model-viewer.min.js y el generador lo usa solo.
const MV = { version: '3.5.0', url: 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js', sri: 'sha384-Ftcjj/GNLxPvzNDftO/oryXB9aGxsGZY9JGqsXG0uUKgQDl9RfDgsx9NJ/4IVNPe', local: 'vendor/model-viewer.min.js' };

const FUENTES = {
  'Playfair Display': { q: 'Playfair+Display:ital,wght@0,500..700;1,500..700', serif: true },
  'Cormorant Garamond': { q: 'Cormorant+Garamond:ital,wght@0,500..700;1,500..700', serif: true },
  Fraunces: { q: 'Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500..700', serif: true },
  'DM Serif Display': { q: 'DM+Serif+Display:ital', serif: true },
  Lora: { q: 'Lora:ital,wght@0,400..600;1,400..600', serif: true },
  Geist: { q: 'Geist:wght@400..700' }, Inter: { q: 'Inter:wght@400..700' }, 'DM Sans': { q: 'DM+Sans:wght@400..700' },
};
const ETIQUETAS = { vegetariano: 'Vegetariano', vegano: 'Vegano', 'sin-gluten': 'Sin gluten', picante: 'Picante', nuevo: 'Nuevo', favorito: 'Favorito de la casa' };
const DIETA = { vegetariano: 'VegetarianDiet', vegano: 'VeganDiet', 'sin-gluten': 'GlutenFreeDiet' };

// Estilos listos (la "estética" del menú). El cliente elige uno y se puede ajustar en menu.json → tema.
const ESTILOS = {
  cafe: { nombre: 'Café y dorado', sensacion: 'cálido, acogedor, de carta clásica', claro: false, bg: '#1a110c', bg2: '#241812', card: '#2a1d15', card2: '#33241a', fg: '#f4e8d7', fg2: '#d6c3a8', fg3: '#a48e76', c1: '#cf9b4a', c2: '#e9c98f', fuente: 'Playfair Display', cuerpo: 'DM Sans' },
  crema: { nombre: 'Crema y cobre', sensacion: 'luminoso, artesanal, de cafetería', claro: true, bg: '#f6efe3', bg2: '#efe5d3', card: '#fffaf0', card2: '#eadcc3', fg: '#2b1d12', fg2: '#5a4533', fg3: '#745f4a', c1: '#8a5519', c2: '#7a4a17', fuente: 'Cormorant Garamond', cuerpo: 'DM Sans' },
  nocturno: { nombre: 'Noche y oro', sensacion: 'elegante, de cena y coctelería', claro: false, bg: '#0f0f11', bg2: '#17171a', card: '#1a1a1e', card2: '#232328', fg: '#f3efe8', fg2: '#c9c3b8', fg3: '#9a948a', c1: '#c9a45c', c2: '#e8d3a0', fuente: 'Fraunces', cuerpo: 'Inter' },
  bistro: { nombre: 'Bistró vino', sensacion: 'fresco, europeo, de almuerzo', claro: true, bg: '#fbf8f3', bg2: '#f3ede4', card: '#ffffff', card2: '#efe7da', fg: '#1f1a17', fg2: '#4f453e', fg3: '#6f645a', c1: '#9b2c2c', c2: '#9b2c2c', fuente: 'DM Serif Display', cuerpo: 'DM Sans' },
  jardin: { nombre: 'Jardín', sensacion: 'natural, saludable, de verduras y campo', claro: false, bg: '#111a14', bg2: '#172119', card: '#1b271e', card2: '#233226', fg: '#eef3e6', fg2: '#c4d1b6', fg3: '#93a487', c1: '#a9c47f', c2: '#d3e4b0', fuente: 'Lora', cuerpo: 'DM Sans' },
};
const LEGADO = { cafe: 'cafe', oscuro: 'nocturno', claro: 'crema' };   // valores antiguos de tema.modo

const avisos = [];
const aviso = (t) => avisos.push(t);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clp = (n) => '$' + n.toLocaleString('es-CL');
const hex = /^#[0-9a-f]{6}$/i;
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => { const [r, g, b] = rgb(h).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const sobre = (h) => (contraste(h, '#111111') >= contraste(h, '#ffffff') ? '#111111' : '#ffffff');

// ---- datos del negocio y validación
const n = cfg.negocio || {};
if (!n.nombre) aviso('FALTA negocio.nombre');
if (n.whatsapp && !/^569\d{8}$/.test(n.whatsapp)) aviso('negocio.whatsapp debe ser 569XXXXXXXX (solo dígitos)');
const URL_PUBLICA = (cfg.url || '').replace(/\/+$/, '');
if (URL_PUBLICA && !/^https:\/\/[a-z0-9.-]+(\/.*)?$/i.test(URL_PUBLICA)) aviso('"url" debe empezar con https://');
if (!URL_PUBLICA && !cfg.demo) aviso('Falta "url" (la dirección pública final): sin ella no hay canonical, sitemap ni imagen de redes con dirección completa');
const DEMO = !!cfg.demo;
if (cfg.categorias == null || !cfg.categorias.length) aviso('No hay categorías');
const ids = new Set(); const hosts = new Set();
let conModelo = 0, total = 0, sinFoto = 0;
for (const c of cfg.categorias || []) {
  if (!c.id || !/^[a-z0-9-]+$/.test(c.id)) aviso(`Categoría "${c.nombre}": id inválido (a-z, 0-9, guion)`);
  for (const p of c.platos || []) {
    total++;
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) aviso(`Plato "${p.nombre}": id vacío, inválido o repetido`);
    ids.add(p.id);
    if (!p.nombre || !Number.isInteger(p.precio) || p.precio < 0) aviso(`Plato "${p.id}": falta nombre o el precio no es un entero`);
    if (/lorem|\[PENDIENTE/i.test(`${p.nombre} ${p.descripcion || ''}`)) aviso(`Plato "${p.id}": tiene texto de relleno o [PENDIENTE]`);
    if (!p.foto) sinFoto++; else if (!/^https?:/.test(p.foto) && !existsSync(join(dir, p.foto))) aviso(`Plato "${p.id}": no existe la foto ${p.foto}`);
    else if (!/^https?:/.test(p.foto) && statSync(join(dir, p.foto)).size > 150 * 1024) aviso(`Plato "${p.id}": la foto pesa ${(statSync(join(dir, p.foto)).size / 1024).toFixed(0)} KB; bájala a menos de 120 KB`);
    if (p.modelo) {
      conModelo++;
      if (/^https:\/\//.test(p.modelo)) { hosts.add(new URL(p.modelo).origin); aviso(`Plato "${p.id}": el modelo 3D está en otro servidor; para un cliente real guárdalo en modelos/ del propio menú`); }
      else if (!existsSync(join(dir, p.modelo))) aviso(`Plato "${p.id}": no existe el modelo ${p.modelo}`);
      else { const mb = statSync(join(dir, p.modelo)).size / 1048576; if (mb > 5) aviso(`Plato "${p.id}": el modelo pesa ${mb.toFixed(1)} MB; optimízalo a menos de 5 MB`); }
    }
    for (const e of p.etiquetas || []) if (!ETIQUETAS[e]) aviso(`Plato "${p.id}": etiqueta "${e}" no existe`);
  }
}
const libLocal = existsSync(join(dir, MV.local));
if (conModelo && !libLocal) aviso(`El visor 3D se carga desde el CDN de Google (con hash SRI). Para producción guarda ${MV.version} en ${MV.local} (el generador lo detecta solo)`);
if (cfg.analitica?.cloudflare && !/^[a-f0-9]{32}$/i.test(cfg.analitica.cloudflare)) aviso('analitica.cloudflare debe ser el token de 32 caracteres de Cloudflare Web Analytics');

// ---- estilo: preset + ajustes del cliente
function resolverEstilo(id, extra = {}) {
  const base = ESTILOS[id] || ESTILOS.cafe;
  const t = { ...base, ...extra };
  if (extra.fuente_cuerpo) t.cuerpo = extra.fuente_cuerpo;
  for (const k of ['fuente', 'cuerpo']) if (!FUENTES[t[k]]) { aviso(`Fuente "${t[k]}" no permitida; opciones: ${Object.keys(FUENTES).join(', ')}`); t[k] = k === 'fuente' ? base.fuente : base.cuerpo; }
  for (const k of ['c1', 'c2']) if (!hex.test(t[k])) { aviso(`tema.${k} debe ser #rrggbb`); t[k] = base[k]; }
  return t;
}
const T = cfg.tema || {};
const idPrincipal = T.estilo || LEGADO[T.modo] || 'cafe';
if (T.estilo && !ESTILOS[T.estilo]) aviso(`tema.estilo "${T.estilo}" no existe. Opciones: ${Object.keys(ESTILOS).join(', ')}`);
const ajustes = Object.fromEntries(['c1', 'c2', 'fuente', 'fuente_cuerpo'].filter((k) => T[k]).map((k) => [k, T[k]]));
const AUTO = T.auto && ESTILOS[T.auto.claro] && ESTILOS[T.auto.oscuro] ? { claro: resolverEstilo(T.auto.claro, ajustes), oscuro: resolverEstilo(T.auto.oscuro, ajustes) } : null;
if (T.auto && !AUTO) aviso('tema.auto debe ser {"claro": "<estilo>", "oscuro": "<estilo>"}');
const PRINCIPAL = AUTO ? AUTO.oscuro : resolverEstilo(idPrincipal, ajustes);

// Avisa si algún color de texto no llega al contraste AA (4,5:1)
function revisarContraste(nombre, e) {
  const pares = [['texto', e.fg, e.bg], ['texto secundario', e.fg2, e.bg], ['texto terciario', e.fg3, e.bg], ['color principal (etiquetas)', e.c1, e.bg], ['precios', e.c2, e.bg], ['texto en tarjeta', e.fg2, e.card], ['texto terciario en tarjeta', e.fg3, e.card]];
  for (const [que, a, b] of pares) { const c = contraste(a, b); if (c < 4.5) aviso(`Contraste bajo en "${nombre}": ${que} ${c.toFixed(1)}:1 (mínimo 4,5:1)`); }
}
if (AUTO) { revisarContraste(T.auto.claro, AUTO.claro); revisarContraste(T.auto.oscuro, AUTO.oscuro); } else revisarContraste(idPrincipal, PRINCIPAL);

const varsDe = (e) => `--bg:${e.bg};--bg-2:${e.bg2};--card:${e.card};--card-2:${e.card2};--fg:${e.fg};--fg-2:${e.fg2};--fg-3:${e.fg3};--line:${e.claro ? 'rgba(40,28,18,.2)' : 'rgba(244,232,215,.16)'};--c1:${e.c1};--c2:${e.c2};--sobre:${sobre(e.c1)};--serif:${pila(e.fuente)};--sans:${pila(e.cuerpo)}`;
function pila(nombre) { const f = FUENTES[nombre]; return `"${nombre}", ${f.serif ? 'Georgia, "Times New Roman", serif' : 'system-ui, -apple-system, "Segoe UI", sans-serif'}`; }
const familias = (e) => `family=${FUENTES[e.fuente].q}&family=${FUENTES[e.cuerpo].q}`;
const ruido = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";

// ---- piezas de la página
const ICONO_3D = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>';
const ICONO_TEMA = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
const ICONO_COMPARTIR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 12v7h14v-7"/></svg>';
const ICONO_WA = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z"/></svg>';
const ADORNO = '<svg class="adorno" viewBox="0 0 220 14" aria-hidden="true"><path d="M0 7h86M134 7h86" stroke="currentColor" stroke-width="1" opacity=".55"/><path d="M110 1.5 115.5 7 110 12.5 104.5 7Z" fill="currentColor"/><circle cx="96" cy="7" r="1.6" fill="currentColor"/><circle cx="124" cy="7" r="1.6" fill="currentColor"/></svg>';
let contadorImg = 0;
const imagen = (p, tam) => { const eager = contadorImg++ < 3; return `<img src="${esc(p.foto)}" alt="${esc(p.alt || `Foto de ${p.nombre}`)}" width="${tam}" height="${tam}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`; };
const etiquetas = (p) => (p.etiquetas || []).length ? `<p class="etq">${p.etiquetas.map((e) => `<span>${ETIQUETAS[e]}</span>`).join('')}</p>` : '';
const miniatura = (p) => !p.foto ? '' : p.modelo && !p.agotado
  ? `<button class="mini ver3d" type="button" data-id="${esc(p.id)}" aria-label="Ver ${esc(p.nombre)} en 3D">${imagen(p, 168)}</button>`
  : `<div class="mini">${imagen(p, 168)}</div>`;
const plato = (p) => `<article class="plato${p.foto ? ' con-foto' : ''}${p.agotado ? ' agotado' : ''}" data-id="${esc(p.id)}" data-texto="${esc(`${p.nombre} ${p.descripcion || ''}`.toLowerCase())}">
        ${miniatura(p)}
        <div class="txt">
          <div class="linea"><h3>${esc(p.nombre)}</h3><span class="puntos" aria-hidden="true"></span><span class="precio">${clp(p.precio)}</span></div>
          ${p.descripcion ? `<p class="desc">${esc(p.descripcion)}</p>` : ''}
          ${etiquetas(p)}
          ${p.agotado ? '<p class="agot">Agotado hoy</p>' : p.modelo ? `<button class="ver3d boton" type="button" data-id="${esc(p.id)}">${ICONO_3D}Ver en tu mesa</button>` : ''}
        </div>
      </article>`;
const favoritos = (cfg.categorias || []).flatMap((c) => c.platos).filter((p) => (p.etiquetas || []).includes('favorito') && p.foto && !p.agotado);
const tarjetaFav = (p) => `<${p.modelo ? `button type="button" class="fav ver3d" data-id="${esc(p.id)}"` : 'div class="fav"'}>
        ${imagen(p, 168)}
        <span class="fav-n">${esc(p.nombre)}</span><span class="fav-p">${clp(p.precio)}</span>${p.modelo ? `<span class="fav-v">${ICONO_3D}Ver en tu mesa</span>` : ''}
      </${p.modelo ? 'button' : 'div'}>`;

const wa = n.whatsapp ? `https://wa.me/${n.whatsapp}?text=${encodeURIComponent('Hola, quiero hacer un pedido.')}` : '';
const infoLinea = [n.direccion, ...(n.horario || [])].filter(Boolean);
const urlAbs = (ruta) => (URL_PUBLICA ? `${URL_PUBLICA}/${ruta.replace(/^\//, '')}` : ruta);
const ogRuta = n.og || (existsSync(join(dir, 'og.jpg')) ? 'og.jpg' : '');
if (!ogRuta) aviso('Falta la imagen para redes (og.jpg de 1200 x 630). Crea una con: python foto-a-modelo.py og ...');
const descripcion = n.descripcion || n.lema || `Carta digital de ${n.nombre}`;

// Datos estructurados (schema.org): solo con datos que entregó el cliente
function jsonLd() {
  const o = { '@context': 'https://schema.org', '@type': n.tipo_schema || 'Restaurant', name: n.nombre, description: descripcion };
  if (URL_PUBLICA) o.url = URL_PUBLICA + '/';
  if (ogRuta) o.image = urlAbs(ogRuta);
  if (n.whatsapp) o.telephone = '+' + n.whatsapp;
  if (n.direccion) o.address = { '@type': 'PostalAddress', streetAddress: n.direccion, addressCountry: 'CL', ...(n.comuna ? { addressLocality: n.comuna } : {}) };
  if (n.cocina) o.servesCuisine = n.cocina;
  if (n.rango_precios) o.priceRange = n.rango_precios;
  if (n.horario_estructurado?.length) o.openingHoursSpecification = n.horario_estructurado.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.dias, opens: h.abre, closes: h.cierra }));
  if (n.instagram) o.sameAs = [`https://www.instagram.com/${n.instagram.replace(/^@/, '')}/`];
  o.hasMenu = { '@type': 'Menu', name: `Carta de ${n.nombre}`, hasMenuSection: cfg.categorias.map((c) => ({ '@type': 'MenuSection', name: c.nombre, hasMenuItem: c.platos.filter((p) => !p.agotado).map((p) => ({ '@type': 'MenuItem', name: p.nombre, ...(p.descripcion ? { description: p.descripcion } : {}), offers: { '@type': 'Offer', price: p.precio, priceCurrency: 'CLP' }, ...((p.etiquetas || []).filter((e) => DIETA[e]).length ? { suitableForDiet: p.etiquetas.filter((e) => DIETA[e]).map((e) => `https://schema.org/${DIETA[e]}`) } : {}) })) })) };
  return JSON.stringify(o).replace(/</g, '\\u003c');
}

// ---- una página completa con un estilo (o con modo automático claro/oscuro)
function pagina({ estilo, auto, archivoSalida, indexable }) {
  contadorImg = 0;
  const e = estilo;
  const css = auto
    ? `:root{${varsDe(auto.oscuro)};color-scheme:dark}@media (prefers-color-scheme:light){:root:not([data-tema]){${varsDe(auto.claro)};color-scheme:light}}:root[data-tema="claro"]{${varsDe(auto.claro)};color-scheme:light}:root[data-tema="oscuro"]{${varsDe(auto.oscuro)};color-scheme:dark}`
    : `:root{${varsDe(e)};color-scheme:${e.claro ? 'light' : 'dark'}}`;
  const fuentesCss = auto ? `family=${FUENTES[auto.oscuro.fuente].q}&family=${FUENTES[auto.oscuro.cuerpo].q}${auto.claro.fuente !== auto.oscuro.fuente ? `&family=${FUENTES[auto.claro.fuente].q}` : ''}` : familias(e);
  const titulo = `${n.nombre} · Carta y precios`;
  const canon = URL_PUBLICA && indexable ? `<link rel="canonical" href="${URL_PUBLICA}/">` : '';
  const robots = indexable && !DEMO ? '' : '<meta name="robots" content="noindex, nofollow">';
  const analitica = cfg.analitica?.cloudflare && /^[a-f0-9]{32}$/i.test(cfg.analitica.cloudflare) ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cfg.analitica.cloudflare}"}'></script>` : '';
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
${robots}
${canon}
<meta name="theme-color" content="${e.bg}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_CL">
<meta property="og:site_name" content="${esc(n.nombre)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
${ogRuta ? `<meta property="og:image" content="${esc(urlAbs(ogRuta))}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
${URL_PUBLICA ? `<meta property="og:url" content="${URL_PUBLICA}/">` : ''}
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fuentesCss}&display=swap">
<link rel="stylesheet" href="menu.css">
<style>${css}:root{--ruido:${ruido}}</style>
<script src="menu-tema.js"></script>
${indexable && !DEMO ? `<script type="application/ld+json">${jsonLd()}</script>` : ''}
</head>
<body>
<a class="saltar" href="#contenido">Saltar a la carta</a>
<header class="portada"><div class="wrap">
  ${auto ? `<button class="tema-btn" type="button" aria-label="Cambiar entre modo claro y oscuro">${ICONO_TEMA}</button>` : ''}
  <p class="sobre">Carta</p>
  ${n.logo ? `<img class="logo" src="${esc(n.logo)}" alt="" height="56">` : ''}
  <h1>${esc(n.nombre)}</h1>
  ${ADORNO}
  ${n.lema ? `<p class="lema">${esc(n.lema)}</p>` : ''}
  <ul class="datos">${infoLinea.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <p class="acciones"><button class="chip" type="button" data-compartir>${ICONO_COMPARTIR}Compartir carta</button>${wa ? `<a class="chip" href="${wa}" target="_blank" rel="noopener">${ICONO_WA}Escribir por WhatsApp</a>` : ''}</p>
  ${cfg.aviso ? `<p class="aviso">${esc(cfg.aviso)}</p>` : ''}
</div></header>
<div class="barra"><div class="wrap">
  <nav class="cats" aria-label="Categorías">${cfg.categorias.map((c, i) => `<a href="#${esc(c.id)}"${i === 0 ? ' aria-current="true"' : ''}>${esc(c.nombre)}</a>`).join('')}</nav>
  <div class="buscar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><label class="sr" for="buscar">Buscar en la carta</label><input id="buscar" type="search" placeholder="Buscar un plato o bebida" autocomplete="off" maxlength="40"></div>
</div></div>
<main class="wrap" id="contenido">
${favoritos.length ? `  <section class="favs" aria-labelledby="h-favs">
    <h2 class="tit" id="h-favs"><span>Favoritos de la casa</span></h2>
    <div class="favs-lista">
      ${favoritos.map(tarjetaFav).join('\n      ')}
    </div>
  </section>` : ''}
${cfg.categorias.map((c) => `  <section class="cat" id="${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
    <h2 class="tit" id="h-${esc(c.id)}"><span>${esc(c.nombre)}</span></h2>
    ${c.descripcion ? `<p class="sub">${esc(c.descripcion)}</p>` : ''}
    <div class="platos">
      ${c.platos.map(plato).join('\n      ')}
    </div>
  </section>`).join('\n')}
  <p class="vacio" id="sin-resultados" hidden>No encontramos eso en la carta. Prueba con otra palabra.</p>
</main>
<footer><div class="wrap">
  ${ADORNO}
  <p class="pie-n">${esc(n.nombre)}</p>
  ${infoLinea.length ? `<p>${infoLinea.map(esc).join(' · ')}</p>` : ''}
  ${conModelo ? '<p class="peq">Los platos con "Ver en tu mesa" se pueden ver en 3D y, desde un celular, sobre tu mesa con la cámara. La cámara solo se usa en tu teléfono: no se guarda ni se envía nada.</p>' : ''}
  <p class="peq"><a href="privacidad.html">Privacidad</a>${cfg.creditos ? ' · Menú digital hecho por <a href="https://biodigital-propuesta.pages.dev">Bío Digital</a>' : ''}</p>
</div></footer>
${wa && n.pedidos_whatsapp ? `<a class="pedir" href="${wa}" target="_blank" rel="noopener">Pedir por WhatsApp</a>` : ''}
${conModelo ? `<dialog id="visor" aria-label="Plato en 3D">
  <div class="visor-in">
    <button class="cerrar" type="button" aria-label="Cerrar">×</button>
    <model-viewer camera-controls auto-rotate touch-action="pan-y" shadow-intensity="1" exposure="1" ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor" ar-scale="fixed" interaction-prompt="auto">
      <button class="ar-oculto" slot="ar-button" tabindex="-1" aria-hidden="true"></button>
    </model-viewer>
    <p class="cargando">Cargando…</p>
    <div class="visor-info"><h2></h2><p class="visor-desc"></p><div class="visor-acc"><button class="btn-ar" type="button" hidden>Ver en tu mesa</button><span class="nota-ar"></span></div></div>
  </div>
</dialog>` : ''}
<script type="application/json" id="menu-datos">${JSON.stringify({ planilla: (cfg.negocio && cfg.negocio.planilla) || null, libreria3d: libLocal ? { url: MV.local } : { url: MV.url, sri: MV.sri }, categorias: cfg.categorias.map((c) => ({ platos: c.platos.map((p) => ({ id: p.id, nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio, foto: p.foto || null, modelo: p.modelo || null, escala: p.escala || null })) })) }).replace(/</g, '\\u003c')}</script>
${analitica}
<script src="menu.js"></script>
</body>
</html>
`;
}

// ---- archivos de apoyo
const inicial = (n.nombre || 'M').trim().charAt(0).toUpperCase();
const E = PRINCIPAL;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${E.bg}"/><circle cx="32" cy="32" r="26" fill="none" stroke="${E.c1}" stroke-width="2.5"/><text x="32" y="43" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="700" fill="${E.c2}">${esc(inicial)}</text></svg>\n`;
const manifest = JSON.stringify({ name: `${n.nombre} · Carta`, short_name: n.nombre.slice(0, 12), start_url: './', display: 'standalone', background_color: E.bg, theme_color: E.bg, lang: 'es-CL', icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2) + '\n';
const robotsTxt = DEMO || !URL_PUBLICA
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${URL_PUBLICA}/sitemap.xml\n`;
const sitemap = URL_PUBLICA && !DEMO ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${URL_PUBLICA}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n  <url><loc>${URL_PUBLICA}/privacidad</loc></url>\n</urlset>\n` : null;
const llms = `# ${n.nombre}\n\n> ${descripcion}\n\n${infoLinea.length ? infoLinea.map((x) => `- ${x}`).join('\n') + '\n\n' : ''}## Carta\n${cfg.categorias.map((c) => `- ${c.nombre}: ${c.platos.length} platos`).join('\n')}\n\n## Enlaces\n- [Carta digital](${URL_PUBLICA || '/'})\n- [Privacidad](${urlAbs('privacidad')})\n`;
const base404 = (titulo, cuerpo) => `<!doctype html>\n<html lang="es-CL"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(titulo)}</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="menu.css"><style>:root{${varsDe(E)};color-scheme:${E.claro ? 'light' : 'dark'}}</style></head><body><main class="wrap pagina-texto">${cuerpo}</main></body></html>\n`;
const pag404 = base404(`No encontramos esa página · ${n.nombre}`, `<p class="sobre">Error 404</p><h1>No encontramos esa página</h1><p class="lema">Puede que el enlace esté mal escrito o que la página ya no exista.</p><p class="acciones"><a class="chip" href="./">Ir a la carta de ${esc(n.nombre)}</a>${wa ? `<a class="chip" href="${wa}" target="_blank" rel="noopener">Escribir por WhatsApp</a>` : ''}</p>`);
const hayAnalitica = !!cfg.analitica?.cloudflare;
const pagPriv = base404(`Privacidad · ${n.nombre}`, `<p class="sobre">Privacidad</p><h1>Cómo cuidamos tus datos</h1>
<p>Esta carta es informativa: <strong>no tiene formularios, no pide datos personales y no usa cookies de seguimiento</strong>.</p>
<h2>Qué se guarda</h2>
<ul><li>${hayAnalitica ? 'Contamos visitas con Cloudflare Web Analytics, que no usa cookies ni te identifica. Solo vemos totales (por ejemplo, cuántas personas abrieron la carta).' : 'No contamos visitas ni recogemos estadísticas de uso.'}</li>
<li>Si tocas "Ver en tu mesa", la cámara de tu teléfono se usa solo en tu equipo para mostrar el plato sobre tu mesa. No se graba, no se guarda y no se envía a ningún servidor.</li>
<li>Si nos escribes por WhatsApp, la conversación queda en WhatsApp y ${esc(n.nombre)} la usa solo para responderte.</li></ul>
<h2>Servicios de terceros</h2>
<ul><li>Las tipografías se cargan desde Google Fonts y el visor 3D desde Google; al hacerlo, Google recibe tu dirección IP como en cualquier página web.</li><li>El sitio se aloja en Cloudflare.</li></ul>
<h2>Tus derechos</h2>
<p>Si quieres saber qué datos tenemos de ti o pedir que los borremos, escríbenos${n.whatsapp ? ` al WhatsApp +${esc(n.whatsapp)}` : ''}${n.correo ? ` o a ${esc(n.correo)}` : ''}. <span class="nota">[PENDIENTE: confirmar con el negocio el responsable de los datos y sus medios de contacto]</span></p>
<p class="acciones"><a class="chip" href="./">Volver a la carta</a></p>`);
const headers = (() => {
  const mv = conModelo ? ` ${libLocal ? '' : 'https://ajax.googleapis.com '}https://www.gstatic.com` : '';
  const cf = hayAnalitica ? ' https://static.cloudflareinsights.com' : '';
  const conPlanilla = !!(cfg.negocio && cfg.negocio.planilla);   // la planilla de Google del dueño (precios y agotados), publicada como CSV
  const connect = ["'self'", ...hosts, ...(conPlanilla ? ['https://docs.google.com', 'https://*.googleusercontent.com'] : []), ...(conModelo ? ['https://www.gstatic.com', 'blob:', 'data:'] : []), ...(hayAnalitica ? ['https://cloudflareinsights.com'] : [])].join(' ');
  return `/*
  Content-Security-Policy: default-src 'none'; script-src 'self'${mv}${cf} 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src ${connect}; worker-src blob:; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  Cross-Origin-Opener-Policy: same-origin
`;
})();

writeFileSync(join(dir, 'index.html'), pagina({ estilo: PRINCIPAL, auto: AUTO, indexable: true }));
writeFileSync(join(dir, 'favicon.svg'), favicon);
writeFileSync(join(dir, 'manifest.webmanifest'), manifest);
writeFileSync(join(dir, 'robots.txt'), robotsTxt);
if (sitemap) writeFileSync(join(dir, 'sitemap.xml'), sitemap);
writeFileSync(join(dir, 'llms.txt'), llms);
writeFileSync(join(dir, '404.html'), pag404);
writeFileSync(join(dir, 'privacidad.html'), pagPriv);
writeFileSync(join(dir, '_headers'), headers);

let extra = '';
if (OPCIONES) {
  const lista = Object.entries(ESTILOS);
  for (const [id] of lista) writeFileSync(join(dir, `opcion-${id}.html`), pagina({ estilo: resolverEstilo(id, ajustes), indexable: false }));
  const idx = `<!doctype html>\n<html lang="es-CL"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Estilos de carta · ${esc(n.nombre)}</title><link rel="stylesheet" href="menu.css"><style>:root{${varsDe(ESTILOS.cafe)};color-scheme:dark}.opc{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));margin-top:20px}.opc a{display:grid;gap:8px;padding:18px;border:1px solid var(--line);border-radius:16px;text-decoration:none;background:var(--card)}.opc i{display:flex;gap:6px}.opc i b{width:26px;height:26px;border-radius:50%;border:1px solid var(--line)}.opc strong{font-family:var(--serif);font-size:22px}.opc span{color:var(--fg-2);font-size:14px}</style></head><body><main class="wrap pagina-texto"><p class="sobre">Opciones</p><h1>Elige el estilo de tu carta</h1><p class="lema">Es la misma carta con distintas ropas. Ábrelas en tu celular y dinos cuál te gusta; después ajustamos los colores.</p><div class="opc">${lista.map(([id, e]) => `<a href="opcion-${id}.html"><i><b style="background:${e.bg}"></b><b style="background:${e.c1}"></b><b style="background:${e.c2}"></b></i><strong>${esc(e.nombre)}</strong><span>${esc(e.sensacion)}</span></a>`).join('')}</div></main></body></html>\n`;
  writeFileSync(join(dir, 'opciones.html'), idx);
  extra = ` + ${lista.length} estilos (opciones.html)`;
}

console.log(`Menú de "${n.nombre}": ${cfg.categorias.length} categorías, ${total} platos, ${conModelo} con 3D, estilo ${AUTO ? `automático (${T.auto.claro}/${T.auto.oscuro})` : idPrincipal}${extra}${DEMO ? ' · DEMO (noindex)' : ''}`);
if (avisos.length) console.log('\nRevisar:\n' + [...new Set(avisos)].map((a) => '  - ' + a).join('\n'));
