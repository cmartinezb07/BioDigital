// Captura la primera pantalla de cada sitio de ejemplo (1440×900) para el carrusel de la portada.
// Usa Chrome sin ventana (protocolo DevTools) y la pasa a WebP con Pillow: <id>.webp (1200 px, visor) y <id>-chica.webp (720 px, carrusel).
// Uso (con el preview "maquetas" encendido):  node web/herramientas/capturar-ejemplos.mjs [slug …]
//   Sin slugs captura todos los de fuentes/maquetas.mjs. Salida: web/propuesta/ejemplos/<slug>.webp
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EJEMPLOS } from '../propuesta/fuentes/maquetas.mjs';
import { SEMILLAS } from './semillas-captura.mjs';
import { copiarCarpeta, sembrar as sembrarRestaurante, limpiar as limpiarRestaurante } from './semillas-restaurante.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const destino = resolve(aqui, '../propuesta/ejemplos');
const base = 'http://localhost:4321/ejemplos/';
const pedidos = process.argv.slice(2);
const lista = EJEMPLOS.filter((e) => !pedidos.length || pedidos.includes(e.id));

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const perfil = mkdtempSync(join(tmpdir(), 'capturar-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let puerto = null;
for (let i = 0; i < 100 && !puerto; i++) { await dormir(100); try { puerto = readFileSync(join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {} }
const ver = await (await fetch(`http://127.0.0.1:${puerto}/json/version`)).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r, m) => { ws.onopen = r; ws.onerror = m; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const { ok, mal } = pend.get(m.id); pend.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); } };
const cdp = (method, params = {}, sessionId) => new Promise((ok, mal) => { const n = ++id; pend.set(n, { ok, mal }); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) })); });

// Las pantallas del equipo leen de la nube: antes de capturarlas se siembran datos de ejemplo y al terminar se borran
const enPagina = async (ruta, fn) => {
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId: s } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  await cdp('Page.enable', {}, s); await cdp('Runtime.enable', {}, s);
  await cdp('Page.navigate', { url: base + ruta }, s); await dormir(3500);
  const r = await cdp('Runtime.evaluate', { expression: '(' + fn.toString() + ')()', awaitPromise: true, returnByValue: true }, s);
  await cdp('Target.closeTarget', { targetId }).catch(() => {});
  if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || 'falló el sembrado');
  return r.result.value;
};
// Cocina y panel del restaurante se capturan desde una copia de la plantilla con pedidos de muestra (no con los pedidos reales de la demo)
const usaRestaurante = lista.some((e) => ['restaurante-cocina', 'restaurante-panel'].includes(e.id));
if (usaRestaurante) { copiarCarpeta(); console.log('sembrando restaurante →', await sembrarRestaurante()); }
const usadas = Object.entries(SEMILLAS).filter(([, v]) => lista.some((e) => v.para.includes(e.id)));
try {
  for (const [k, v] of usadas) console.log('sembrando', k, '→', await enPagina(v.ruta, v.sembrar));
for (const e of lista) {
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId: s } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  await cdp('Page.enable', {}, s);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, s);
  // La cinta "Ejemplo de Bío Digital" no sale en la captura (en la portada ya se sabe que es un ejemplo)
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: 'document.addEventListener("DOMContentLoaded",function(){var s=document.createElement("style");s.textContent=".bd-demo,.bd-toast{display:none!important}";document.head.appendChild(s)})' }, s);
  await cdp('Page.navigate', { url: base + (e.capturaRuta || e.ruta || e.id + '/') }, s);
  await cdp('Runtime.enable', {}, s);
  if (e.preparar) {   // sistemas: datos de prueba antes de capturar (puede recargar la página)
    await dormir(2500);
    await cdp('Runtime.evaluate', { expression: '(async () => { ' + e.preparar + ' })()', awaitPromise: true }, s).catch(() => {});
  }
  await dormir(e.espera || 4500);   // deja terminar la entrada animada de la portada
  if (e.despues) { await cdp('Runtime.evaluate', { expression: '(async () => { ' + e.despues + ' })()', awaitPromise: true }, s).catch(() => {}); await dormir(1800); }
  const shot = await cdp('Page.captureScreenshot', { format: 'png' }, s);
  const png = join(perfil, e.id + '.png');
  writeFileSync(png, Buffer.from(shot.data, 'base64'));
  const webp = join(destino, e.id + '.webp');
  execFileSync('python', ['-I', '-c', 'import sys;from PIL import Image;im=Image.open(sys.argv[1]).convert("RGB").resize((1200,750),Image.LANCZOS);im.save(sys.argv[2],"WEBP",quality=78,method=6);im.resize((720,450),Image.LANCZOS).save(sys.argv[2][:-5]+"-chica.webp","WEBP",quality=74,method=6)', png, webp]);
  console.log(e.id, '→', webp);
  await cdp('Target.closeTarget', { targetId });
}
} finally {
  if (usaRestaurante) { try { console.log('limpiando restaurante →', await limpiarRestaurante()); } catch (e) { console.log('NO se pudo limpiar el restaurante', e.message); } }
  for (const [k, v] of usadas) { try { console.log('limpiando', k, '→', await enPagina(v.ruta, v.limpiar)); } catch (e) { console.log('NO se pudo limpiar', k, e.message); } }
}
ws.close(); chrome.kill();
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
