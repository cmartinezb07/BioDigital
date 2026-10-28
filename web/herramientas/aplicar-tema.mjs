// Cambia la paleta de un restaurante ya creado (la plantilla nace oscura, café y dorado) a otra: por ahora "claro-rosado" (blanco mate y rosado).
// Uso:  node web/herramientas/aplicar-tema.mjs <id> [--tema claro-rosado]
// Reemplaza los colores base en todas las páginas del local y en sistema.css, deja el color principal del local (marca.acento) como una de las
// opciones del panel y marca la página como clara. No toca el diseño ni la lógica: solo variables de color.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const id = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--tema');
const tema = args.includes('--tema') ? args[args.indexOf('--tema') + 1] : 'claro-rosado';
const dir = join(aqui, '../propuesta/ejemplos', id || '');
if (!id || !existsSync(dir)) { console.error('Uso: node web/herramientas/aplicar-tema.mjs <id> [--tema claro-rosado]'); process.exit(1); }

// c1 = color principal (botones, líneas, acentos de texto: con contraste suficiente sobre el fondo); c2 = su versión suave; sobre = texto encima de c1
const TEMAS = {
  'claro-rosado': { bg: '#f7f2ee', 'bg-2': '#efe7e2', card: '#fffdfb', 'card-2': '#f3ebe6', fg: '#2b2025', 'fg-2': '#5c4b54', 'fg-3': '#76646d', line: 'rgba(43,32,37,.14)', c1: '#c4457b', c2: '#cf5f93', sobre: '#ffffff', esquema: 'light', nombreAcento: 'Rosa', vacioFondo: '#f0e7e2', vacioTrazo: '#c8b4bd' }
};
const T = TEMAS[tema];
if (!T) { console.error('Tema desconocido. Disponibles: ' + Object.keys(TEMAS).join(', ')); process.exit(1); }

const archivos = [];
(function recorrer(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== 'fotos') recorrer(p); } else if (/\.(html|css|js)$/.test(f)) archivos.push(p); } })(dir);

let tocados = 0;
for (const p of archivos) {
  const antes = readFileSync(p, 'utf8');
  let s = antes;
  // variables de color base (bloque :root de cada página y .sis-pagina de sistema.css)
  for (const k of ['bg', 'bg-2', 'card', 'card-2', 'fg', 'fg-2', 'fg-3', 'c1', 'c2', 'sobre']) s = s.replace(new RegExp(`(--${k}:\\s*)#[0-9a-fA-F]{3,8}`, 'g'), `$1${T[k]}`);
  s = s.replace(/(--line:\s*)rgba\([^)]*\)/g, `$1${T.line}`);
  s = s.replace(/color-scheme:\s*dark/g, `color-scheme:${T.esquema}`);
  s = s.replace(/(<meta name="theme-color" content=")#[0-9a-fA-F]{3,8}"/g, `$1${T.bg}"`);
  // imagen de plato sin foto (carta.js): fondo y trazo claros
  if (/[\\/]carta\.js$/.test(p)) s = s.replace('fill="#2a1d15"', `fill="${T.vacioFondo}"`).replace('stroke="#a48e76"', `stroke="${T.vacioTrazo}"`);
  // pantalla de PIN (nube.js) y estados (pedidos.js, seguimiento.js): del dorado y el oscuro de la plantilla a la paleta nueva
  if (/[\\/]nube\.js$/.test(p)) for (const [x, y] of [['rgba(10,8,6,.92)', 'rgba(247,242,238,.94)'], ['background:#1c1713;color:#f4ead9;border:1px solid #3a3027;box-shadow:0 20px 60px rgba(0,0,0,.5)', `background:${T.card};color:${T.fg};border:1px solid rgba(43,32,37,.18);box-shadow:0 20px 60px rgba(43,32,37,.18)`], ['color:#cdbfa8', `color:${T['fg-2']}`], ['border:1px solid #5a4a3a;background:#120e0b;color:#fff', `border:1px solid rgba(43,32,37,.28);background:${T['card-2']};color:${T.fg}`], ['background:#cf9b4a;color:#1a110c', `background:${T.c1};color:${T.sobre}`], ['color:#ff9b8a!important', 'color:#b3261e!important'], ['border-top:1px dashed #3a3027', 'border-top:1px dashed rgba(43,32,37,.2)'], ['color:#a99b86', `color:${T['fg-3']}`], ['.nube-pista b{color:#f4ead9', `.nube-pista b{color:${T.fg}`]]) s = s.split(x).join(y);
  if (/[\\/](pedidos|seguimiento)\.js$/.test(p)) s = s.split("'#cf9b4a'").join(`'${T.c1}'`);
  // el color principal del local es una de las opciones permitidas (carta y panel)
  if (/[\\/]menu\.js$/.test(p) && !s.includes(`'${T.c1}'`)) s = s.replace("var ACENTOS = {", `var ACENTOS = { '${T.c1}': '${T.c2}',`);
  if (/[\\/]panel-negocio\.js$/.test(p) && !s.includes(`'${T.c1}'`)) s = s.replace("var ACENTOS = [", `var ACENTOS = [['${T.c1}', '${T.nombreAcento}'], `);
  if (s !== antes) { writeFileSync(p, s); tocados++; }
}
console.log(`Tema "${tema}" aplicado a ${id}: ${tocados} archivos. Recuerda marca.acento = ${T.c1} en carta-base.json y regenerar los enlaces con versión (node web/propuesta/fuentes/generar.mjs 8).`);
