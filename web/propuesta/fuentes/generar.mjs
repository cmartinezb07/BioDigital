// Genera el sitio de la empresa (index.html) a partir del contenido común. Solo queda la opción 8: las demás se eliminaron el 27-oct-2026.
// Uso (desde web/propuesta):  node fuentes/generar.mjs        → todas
//                             node fuentes/generar.mjs --publico 8   → el sitio listo para publicar
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pagina } from './comun.mjs';
import { PAYMENT_RETURN_ROUTES, paymentReturnPage } from './retornos.mjs';
import { LEGALES } from './legales.mjs';
import { ANTES } from './antes.mjs';
import { COMO } from './como-trabajamos.mjs';
import { escribirGaleria } from './maquetas.mjs';
import { SITIO, MAIL, WHATSAPP, INSTAGRAM } from './config.mjs';

// ---------- Buscadores: dirección canónica, datos de la empresa, robots.txt y sitemap.xml ----------
// Una sola dirección oficial (SITIO): la canónica le dice a Google cuál usar si el mismo contenido abre en otra (p. ej. biodigital-bgw.pages.dev).
const urlDe = (ruta) => SITIO + '/' + ruta;
const conCanonica = (html, ruta) => html.replace(/<link rel="canonical"[^>]*>\n?/, '').replace('</title>', `</title>\n<link rel="canonical" href="${urlDe(ruta)}">`);
const EMPRESA = {
  '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'Bío Digital', url: urlDe(''), inLanguage: 'es-CL',
  description: 'Páginas web, videos para redes, menús digitales, fotos, reservas y tarjetas de fidelización para micro y pequeñas empresas del Gran Concepción.',
  areaServed: { '@type': 'AdministrativeArea', name: 'Gran Concepción, Región del Biobío, Chile' },
  email: MAIL, telephone: '+' + WHATSAPP, sameAs: ['https://www.instagram.com/' + INSTAGRAM + '/'],
  makesOffer: ['Páginas web', 'Videos para redes sociales', 'Menú digital con pedidos', 'Registro fotográfico', 'Sistema de reservas', 'Tarjeta de fidelización'].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } }))
};
const paginaPrincipal = (html) => conCanonica(html, '')
  .replace(/<meta property="og:image" content="marca\/og\.jpg">/, `<meta property="og:image" content="${urlDe('marca/og.jpg')}">\n<meta property="og:url" content="${urlDe('')}">\n<meta property="og:site_name" content="Bío Digital">\n<meta property="og:locale" content="es_CL">`)
  .replace('</head>', `<script type="application/ld+json">${JSON.stringify(EMPRESA).replace(/</g, '\\u003c')}</script>\n</head>`);
const RUTAS_INDEXABLES = ['', 'ejemplos/', 'como-trabajamos/', 'antes-de-contratar/', 'privacidad/', 'terminos/'];

const aqui = dirname(fileURLToPath(import.meta.url));

// ---------- Versión de los CSS y JS ----------
// El dominio propio entrega los .css y .js con caché de 4 horas (la zona de Cloudflare lo impone): quien ya había abierto el sitio
// seguía viendo estilos viejos en el computador. Cada enlace lleva ?v=<huella del archivo>: si el archivo cambia, el enlace cambia.
const RAIZ = join(aqui, '..');
function versionar(archivo) {
  if (!existsSync(archivo)) return;
  const antes = readFileSync(archivo, 'utf8');
  const despues = antes.replace(/(<(?:link|script)[^>]*?(?:href|src)=")([^"#?:]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")/g, (m, a, ruta, c) => {
    const f = join(dirname(archivo), ruta);
    return existsSync(f) ? a + ruta + '?v=' + createHash('sha1').update(readFileSync(f)).digest('hex').slice(0, 8) + c : m;
  });
  if (despues !== antes) { writeFileSync(archivo, despues); console.log("versión →", archivo.slice(-30)); }
}
function versionarSitio() {
  const paginas = ['index.html', 'formulario.html', 'formulario-menu.html', 'formulario-reservas.html'].map((f) => join(RAIZ, f));
  for (const d of ['privacidad', 'terminos', 'antes-de-contratar', 'como-trabajamos']) paginas.push(join(RAIZ, d, 'index.html'));
  const pago = join(RAIZ, 'pago');
  if (existsSync(pago)) for (const r of readdirSync(pago)) paginas.push(join(pago, r, 'index.html'));
  const recorrer = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const r = join(d, e.name); if (e.isDirectory()) recorrer(r); else if (e.name.endsWith('.html')) paginas.push(r); } };
  recorrer(join(RAIZ, 'ejemplos'));
  [...new Set(paginas)].forEach(versionar);
}
const publico = process.argv.includes('--publico');   // versión para publicar: sin rueda de colores del equipo ni aviso de prototipo
const pedidas = process.argv.slice(2).filter((a) => a !== '--publico');
const todas = ['8'];   // las plantillas 3 a 7 se eliminaron del sitio (27-oct); sus fuentes siguen en fuentes/opcion-N.mjs, pero ya no se generan por defecto

for (const n of pedidas.length ? pedidas : todas) {
  let o;
  try { o = (await import(`./opcion-${n}.mjs`)).default; } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') { console.log(`opción ${n}: todavía no existe`); continue; }
    throw e;
  }
  // Las opciones 3 a 7 son plantillas ya hechas (archivo); la 8 es el sitio de la empresa
  const destino = n === '8' ? [aqui, '..', o.archivo] : [aqui, '..', 'plantillas', o.archivo];
  writeFileSync(join(...destino), n === '8' ? paginaPrincipal(pagina(o, publico)) : pagina(o, publico));
  console.log(`opción ${n} → ${o.archivo}`);
  if (n === '8') {
    for (const route of PAYMENT_RETURN_ROUTES) {
      const directory = join(aqui, '..', 'pago', route);
      mkdirSync(directory, { recursive: true });
      writeFileSync(join(directory, 'index.html'), paymentReturnPage(route));
      console.log(`retorno → pago/${route}/index.html`);
    }
    for (const l of [...LEGALES, ANTES, COMO]) {
      mkdirSync(join(aqui, '..', l.ruta), { recursive: true });
      writeFileSync(join(aqui, '..', l.ruta, 'index.html'), conCanonica(l.html(), l.ruta + '/'));
      console.log(`página → ${l.ruta}/index.html`);
    }
    escribirGaleria();
    const galeria = join(aqui, '..', 'ejemplos', 'index.html');
    writeFileSync(galeria, conCanonica(readFileSync(galeria, 'utf8'), 'ejemplos/'));
    const hoy = new Date().toISOString().slice(0, 10);
    writeFileSync(join(aqui, '..', 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /pago/\n\nSitemap: ${urlDe('sitemap.xml')}\n`);
    writeFileSync(join(aqui, '..', 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${RUTAS_INDEXABLES.map((r) => `  <url><loc>${urlDe(r)}</loc><lastmod>${hoy}</lastmod></url>`).join('\n')}\n</urlset>\n`);
    console.log('robots.txt y sitemap.xml');
    console.log('galería → ejemplos/index.html');
    versionarSitio();
    console.log('enlaces de CSS y JS con versión');
  }
}
