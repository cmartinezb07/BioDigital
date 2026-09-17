// Genera una maqueta por estética + la galería index.html, a partir de contenido.mjs.
// Uso (desde la carpeta de maquetas):
//   node fuentes/generar.mjs                 → todas las estéticas de fuentes/esteticas/
//   node fuentes/generar.mjs metal foco      → solo esas (el número de opción sigue el orden pedido)
import { writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { pagina } from './pagina.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const c = (await import(pathToFileURL(join(aqui, 'contenido.mjs')).href)).default;
const disponibles = readdirSync(join(aqui, 'esteticas')).filter((f) => f.endsWith('.mjs')).map((f) => f.replace('.mjs', ''));
const pedidas = process.argv.slice(2).length ? process.argv.slice(2) : disponibles;

const hechas = [];
let n = Number(process.env.DESDE || 1);
for (const id of pedidas) {
  if (!disponibles.includes(id)) { console.log(`estética "${id}" no existe (hay: ${disponibles.join(', ')})`); continue; }
  const e = (await import(pathToFileURL(join(aqui, 'esteticas', id + '.mjs')).href)).default;
  const archivo = `opcion-${n}-${id}.html`;
  writeFileSync(join(aqui, '..', archivo), pagina(c, e, n));
  hechas.push({ n, archivo, e });
  console.log(`opción ${n} → ${archivo}`);
  n++;
}

// Galería para que el cliente o el equipo compare
const tarjetas = hechas.map(({ n, archivo, e }) => `<li><a class="opt" href="${archivo}"><span>${String(n).padStart(2, '0')}</span><h2>${e.nombre}</h2><p>Tema por defecto: ${e.tema === 'dark' ? 'oscuro' : 'claro'}</p></a></li>`).join('\n    ');
writeFileSync(join(aqui, '..', 'index.html'), `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Opciones de diseño · ${c.marca.replace(/\[.*?\]/g, 'Maquetas')}</title><meta name="robots" content="noindex">
<style>
  :root { color-scheme: dark; --bg: #0c0c0d; --fg: #f4f4f5; --mut: #a1a1aa; --line: rgba(255,255,255,.12); }
  body { margin: 0; font: 16px/1.6 system-ui, sans-serif; background: var(--bg); color: var(--fg); }
  main { width: min(100% - 32px, 1100px); margin: 0 auto; padding: 56px 0; }
  h1 { font-size: clamp(30px, 5vw, 48px); letter-spacing: -.03em; margin: 0 0 8px; }
  p { color: var(--mut); margin: 0; }
  ul { list-style: none; padding: 0; margin: 32px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .opt { display: grid; gap: 6px; padding: 22px; border: 1px solid var(--line); border-radius: 16px; color: inherit; text-decoration: none; transition: transform .3s cubic-bezier(.23,1,.32,1), border-color .3s; }
  .opt:active { transform: scale(.98); }
  @media (hover: hover) and (pointer: fine) { .opt:hover { transform: translateY(-3px); border-color: var(--mut); } }
  .opt span { font-family: ui-monospace, monospace; color: var(--mut); font-size: 13px; }
  .opt h2 { margin: 0; font-size: 21px; }
</style></head>
<body><main>
  <h1>Opciones de diseño</h1>
  <p>Mismo contenido, distinta estética. Ábranlas en computador y celular, y prueben el modo claro u oscuro.</p>
  <ul>
    ${tarjetas}
  </ul>
</main></body></html>
`);
console.log('galería → index.html');
