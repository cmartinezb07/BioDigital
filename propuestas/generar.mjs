// Propuesta comercial de una página (A4) para un cliente, en HTML y PDF.
// Uso:  node propuestas/generar.mjs <carpeta>      p. ej.  node propuestas/generar.mjs kairos-cafe
// Lee propuestas/<carpeta>/datos.json y deja propuesta.pdf en la misma carpeta. Lo que se manda es siempre el PDF.
// Precios, nombres y lo que incluye cada producto salen del sitio (web/propuesta/fuentes/comun.mjs):
// si el sitio cambia un precio, basta con volver a generar.
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SERVICIOS, SUMA, PACK, PACK_5, clp } from '../web/propuesta/fuentes/comun.mjs';
import { WHATSAPP_VISIBLE, MAIL, INSTAGRAM, DOMINIO_ANUAL } from '../web/propuesta/fuentes/config.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SITIO = 'https://biodigital-bgw.pages.dev';   // dirección de trabajo desde el 24-oct-2026 (la anterior redirige aquí)
// Chrome o Edge (los dos imprimen a PDF sin ventana). Se puede forzar con la variable CHROME.
const NAVEGADORES = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const CHROME = NAVEGADORES.find((r) => r && existsSync(r));

const carpeta = process.argv[2];
if (!carpeta) throw new Error('Falta la carpeta del cliente: node propuestas/generar.mjs <carpeta>');
const dir = join(AQUI, carpeta);
const d = JSON.parse(readFileSync(join(dir, 'datos.json'), 'utf8'));

const PRODUCTO = Object.fromEntries(SERVICIOS.map(([id, , nombre, precio, desde, , incluye]) => [id, { nombre, precio, desde, incluye }]));
const precio = (p) => (p.desde ? 'desde ' : '') + clp(p.precio);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fecha = new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

for (const f of d.filas) if (!PRODUCTO[f.producto]) throw new Error(`Producto desconocido: ${f.producto}. Válidos: ${Object.keys(PRODUCTO).join(', ')}`);

const filas = d.filas.map((f, i) => {
  const p = PRODUCTO[f.producto];
  const incluye = (f.incluye || p.incluye.slice(0, 2)).map((t) => `<li>${esc(t)}</li>`).join('');
  const ejemplo = f.ejemplo ? `<a class="ej" href="${SITIO}/${f.ejemplo}">Ver un ejemplo →</a>` : '';
  return `<div class="fila">
    <div class="hoy"><span class="n">0${i + 1}</span><p class="rot">Hoy</p><p>${esc(f.hoy)}</p></div>
    <div class="prop"><div class="cab"><p class="nom">${esc(p.nombre)}</p><p class="pre">${precio(p)}</p></div>
      <p>${esc(f.propuesta)}</p><ul>${incluye}</ul>${ejemplo}</div>
  </div>`;
}).join('');

const sueltos = d.filas.map((f) => PRODUCTO[f.producto]);
const totalSueltos = sueltos.reduce((t, p) => t + p.precio, 0);
const restantes = SERVICIOS.filter(([id]) => !d.filas.some((f) => f.producto === id)).map(([, , n]) => n.toLowerCase());
const lista = (xs) => xs.length > 1 ? xs.slice(0, -1).join(', ') + ' y ' + xs.at(-1) : xs[0];
const conWeb = d.pack || d.filas.some((f) => f.producto === 'web');

const pack = d.pack ? `<div class="op reco">
    <p class="rot">Recomendado</p>
    <p class="nom">Pack completo</p>
    <p class="grande">${clp(PACK_5)} <s>${clp(PACK)}</s></p>
    <p>Los seis productos: lo de arriba, más ${esc(lista(restantes))}.
    ${PACK_5 > totalSueltos ? `Por ${clp(PACK_5 - totalSueltos)} más que` : `Cuesta ${clp(totalSueltos - PACK_5)} menos que`} ${sueltos.length === 1 ? 'la pieza suelta' : `las ${sueltos.length} piezas sueltas`}.</p>
    <p class="chico">Precio de lanzamiento para los primeros 5 clientes. Por separado, los seis suman ${clp(SUMA)}.</p>
  </div>` : '';
const solos = `<div class="op">
    <p class="rot">${!d.pack ? 'Inversión' : totalSueltos > PACK_5 ? 'Por separado' : 'O solo lo que necesitas hoy'}</p>
    <p class="nom">${sueltos.length === 1 ? sueltos[0].nombre : `Las ${sueltos.length} piezas`}</p>
    <p class="grande">${sueltos.some((p) => p.desde) ? '<span>desde</span> ' : ''}${clp(totalSueltos)}</p>
    <ul class="suma">${sueltos.map((p) => `<li><span>${esc(p.nombre)}</span><span>${precio(p)}</span></li>`).join('')}</ul>
  </div>`;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<title>Propuesta Bío Digital · ${esc(d.negocio)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
:root { --c1: #0da5ff; --c2: #00e5d0; --tinta: #151517; --t2: #4a4748; --t3: #6b676a; --fondo: #f7f6f4; --carta: #ffffff; --linea: #e4e1dd; }
html, body { background: var(--fondo); }
body { width: 210mm; height: 297mm; overflow: hidden; font: 400 9.4pt/1.42 Geist, system-ui, sans-serif; color: var(--tinta);
  padding: 11mm 14mm 9mm; display: flex; flex-direction: column; gap: 4.2mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.rot { font: 500 7pt/1 'Geist Mono', monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--t3); }
header { display: flex; justify-content: space-between; align-items: flex-start; }
header img { height: 9mm; }
header .rot { text-align: right; line-height: 1.6; }
h1 { font-weight: 560; font-size: 22pt; line-height: 1.05; letter-spacing: -.04em; }
h1 b { font-weight: 560; color: #0a93e6; }  /* el degradé en texto se rompe al imprimir */
.intro { font-size: 10pt; color: var(--t2); max-width: 165mm; margin-top: 2.2mm; }
h2 { font: 500 7.5pt/1 'Geist Mono', monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--tinta);
  display: flex; align-items: center; gap: 3mm; margin-bottom: 2.6mm; }
h2::after { content: ''; flex: 1; height: 1px; background: var(--linea); }
.filas { display: flex; flex-direction: column; gap: 2mm; }
.fila { display: grid; grid-template-columns: 62mm 1fr; background: var(--carta); border: 1px solid var(--linea); border-radius: 3mm; overflow: hidden; }
.hoy { background: #efedea; padding: 2.8mm 4mm; position: relative; color: var(--t2); }
.hoy .rot { margin-bottom: 1.4mm; }
.hoy .n { position: absolute; right: 3.5mm; top: 3mm; font: 500 7pt 'Geist Mono', monospace; color: var(--t3); }
.prop { padding: 2.8mm 4.4mm; }
.cab { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
.nom { font-weight: 600; font-size: 11pt; letter-spacing: -.02em; }
.pre { font: 500 8.6pt 'Geist Mono', monospace; color: var(--tinta); }
.prop ul { list-style: none; margin-top: 1.4mm; display: flex; flex-wrap: wrap; gap: 1mm 4mm; color: var(--t2); font-size: 8.6pt; }
.prop li::before { content: '✓ '; color: var(--c1); font-weight: 700; }
.ej { display: inline-block; margin-top: 1.4mm; font-size: 8.4pt; color: #0b7fc4; text-decoration: none; font-weight: 500; }
.ops { display: grid; grid-template-columns: ${d.pack ? '1.15fr 1fr' : '1fr'}; gap: 3mm; }
.op { background: var(--carta); border: 1px solid var(--linea); border-radius: 3mm; padding: 3.2mm 4.6mm; display: flex; flex-direction: column; gap: 1.3mm; }
.op.reco { border: 1.6px solid transparent; background: linear-gradient(var(--carta), var(--carta)) padding-box, linear-gradient(120deg, var(--c1), var(--c2)) border-box; }
.op.reco .rot { color: #0b7fc4; }
.grande { font-weight: 560; font-size: 21pt; letter-spacing: -.04em; line-height: 1.1; }
.grande s { font-size: 11pt; color: var(--t3); font-weight: 400; letter-spacing: 0; }
.grande span { font-size: 10pt; font-weight: 400; color: var(--t3); letter-spacing: 0; }
.chico { font-size: 7.8pt; color: var(--t3); }
.suma { list-style: none; font-size: 8.8pt; color: var(--t2); }
.suma li { display: flex; justify-content: space-between; border-top: 1px dashed var(--linea); padding: 1mm 0; }
.suma li span:last-child { font-family: 'Geist Mono', monospace; font-size: 8.2pt; }
.nota { font-size: 7.8pt; color: var(--t3); margin-top: 2mm; }
.pasos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; counter-reset: p; }
.pasos p { padding-left: 7mm; position: relative; color: var(--t2); font-size: 8.8pt; }
.pasos p::before { counter-increment: p; content: counter(p); position: absolute; left: 0; top: -.2mm; width: 5mm; height: 5mm; border-radius: 50%;
  background: linear-gradient(135deg, var(--c1), var(--c2)); color: #04121c; font: 600 7.5pt/5mm 'Geist Mono', monospace; text-align: center; }
.pasos b { color: var(--tinta); font-weight: 600; }
footer { margin-top: auto; border-top: 1px solid var(--linea); padding-top: 3.4mm; display: flex; justify-content: space-between; align-items: center; font-size: 8.4pt; color: var(--t2); }
footer a { color: var(--tinta); text-decoration: none; font-weight: 500; }
footer .quien { font-size: 7.6pt; color: var(--t3); max-width: 70mm; text-align: right; }
</style></head>
<body>
<header><img src="${pathToFileURL(join(AQUI, '../web/propuesta/marca/logotipo-tinta-240.png')).href}" alt="Bío Digital">
  <p class="rot">Propuesta para ${esc(d.negocio)}<br>${fecha}</p></header>
<section><h1>${esc(d.titulo).replace(/\*(.+?)\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</h1><p class="intro">${esc(d.intro)}</p></section>
<section><h2>Lo que vimos y lo que haríamos</h2><div class="filas">${filas}</div></section>
<section><h2>Inversión</h2><div class="ops">${pack}${solos}</div>
  <p class="nota">Pago único, sin mensualidad de Bío Digital.${conWeb ? ` Si se hace la página web, el dominio .cl se paga aparte a NIC Chile (aprox. ${clp(DOMINIO_ANUAL)} al año, verificar en nic.cl) y queda a tu nombre.` : ''}</p></section>
<section><h2>Cómo seguimos</h2><div class="pasos">
  <p><b>Nos dices qué opción te acomoda.</b> El precio queda acordado antes de empezar.</p>
  <p><b>Vamos a tu local.</b> Tomamos fotos y los datos que hacen falta.</p>
  <p><b>Te lo entregamos funcionando</b> en 3 a 7 días hábiles desde que tenemos tus fotos, textos y accesos, todo a tu nombre.</p>
</div></section>
<footer><div><a href="https://wa.me/${WHATSAPP_VISIBLE.replace(/\D/g, '')}">WhatsApp ${WHATSAPP_VISIBLE}</a> · <a href="mailto:${MAIL}">${MAIL}</a><br>
  <a href="${SITIO}">${SITIO.replace('https://', '')}</a> · <a href="https://www.instagram.com/${INSTAGRAM}/">@${INSTAGRAM}</a></div>
  <p class="quien">Bío Digital: cinco estudiantes de Ingeniería Civil Industrial de la Universidad de Concepción. Trabajamos en el Gran Concepción.</p></footer>
</body></html>`;

if (!CHROME) {
  console.error('No encontré Chrome ni Edge, que hacen falta para crear el PDF. Instala Google Chrome (google.com/chrome)'
    + ' o indica dónde está: CHROME="<ruta>" node propuestas/generar.mjs ' + carpeta);
  process.exit(1);
}
// El HTML es solo un paso intermedio: se arma en una carpeta temporal y se borra, para que en la carpeta del cliente
// quede únicamente el PDF que se envía.
const tmp = mkdtempSync(join(tmpdir(), 'propuesta-'));
const salida = join(tmp, 'propuesta.html');
writeFileSync(salida, html);
const pdf = join(dir, 'propuesta.pdf');
try {
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf-no-header',
    '--virtual-time-budget=8000', '--allow-file-access-from-files', `--print-to-pdf=${pdf}`, pathToFileURL(salida).href],
    { stdio: 'ignore' });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (!existsSync(pdf)) throw new Error('Chrome no generó el PDF. Prueba de nuevo o revisa datos.json.');
console.log(`${join(carpeta, 'propuesta.pdf')} · ${d.filas.length} piezas, sueltas ${clp(totalSueltos)}${d.pack ? `, pack ${clp(PACK_5)}` : ''}`);
