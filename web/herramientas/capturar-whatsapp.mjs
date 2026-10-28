// Capturas en bruto para armar imágenes de WhatsApp del menú digital (Fogón del Sur) y de una pastelería de ejemplo (Casa Dulce).
// Usa Chrome sin ventana; las pantallas del equipo (cocina y panel) se capturan desde una copia con pedidos de muestra (captura-fogon), igual que la galería.
// Uso (con el preview "maquetas" encendido):  node web/herramientas/capturar-whatsapp.mjs <carpeta-de-salida>
// Después: python web/herramientas/componer-whatsapp.py <carpeta-de-salida>  (agrega títulos, marco de celular y pie de Bío Digital).
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { copiarCarpeta, sembrar, limpiar } from './semillas-restaurante.mjs';

const salida = resolve(process.argv[2] || 'capturas-whatsapp');
mkdirSync(salida, { recursive: true });
const base = 'http://localhost:4321/ejemplos/';
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => { try { readFileSync(p); return true; } catch { return false; } });
const perfil = mkdtempSync(join(tmpdir(), 'wa-'));
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

const MOVIL = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true };
const ESCRITORIO = { width: 1280, height: 800, deviceScaleFactor: 1.5, mobile: false };
const OCULTAR_CINTA = 'document.addEventListener("DOMContentLoaded",function(){var s=document.createElement("style");s.textContent=".bd-demo,.bd-toast{display:none!important}";document.head.appendChild(s)})';

// Cada captura: nombre, ruta, formato, y pasos antes de fotografiar (código que corre en la página)
const CAPTURAS = [
  { n: 'm-carta', ruta: 'fogon-del-sur/', f: MOVIL, espera: 4500 },
  { n: 'm-carta-platos', ruta: 'fogon-del-sur/', f: MOVIL, espera: 4000, despues: "var f=document.querySelector('.favs')||document.querySelector('main'); window.scrollTo(0, f.getBoundingClientRect().top + scrollY - 70);", tras: 1800 },
  { n: 'm-carrito', ruta: 'fogon-del-sur/', f: MOVIL, espera: 4000, despues: "var b=document.querySelector('article.plato .agregar'); if(b) b.click(); await new Promise(r=>setTimeout(r,700)); var c=document.querySelector('.carrito-btn'); if(c) c.click();", tras: 1500 },
  { n: 'm-seguimiento', ruta: 'fogon-del-sur/pedido/?demo', f: MOVIL, espera: 9000 },
  { n: 'd-cocina', ruta: 'captura-fogon/cocina/', f: ESCRITORIO, espera: 7000, antes: "sessionStorage.setItem('nube-pin-captura-fogon', '247135'); location.reload();" },
  { n: 'd-panel-pedidos', ruta: 'captura-fogon/panel/', f: ESCRITORIO, espera: 8000, antes: "sessionStorage.setItem('nube-pin-captura-fogon', '482916'); location.reload();" },
  { n: 'd-panel-estadisticas', ruta: 'captura-fogon/panel/', f: ESCRITORIO, espera: 8000, antes: "sessionStorage.setItem('nube-pin-captura-fogon', '482916'); location.reload();", despues: "document.querySelector('[data-tab=estadisticas]').click();", tras: 2500 },
  { n: 'd-casadulce', ruta: 'casa-dulce/', f: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, espera: 5000 },
  { n: 'm-casadulce', ruta: 'casa-dulce/', f: MOVIL, espera: 5000 },
  { n: 'm-casadulce-carta', ruta: 'casa-dulce/carta/', f: MOVIL, espera: 4000 },
];

copiarCarpeta();
console.log('sembrando restaurante de muestra →', await sembrar());
try {
  for (const c of CAPTURAS) {
    const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
    const { sessionId: s } = await cdp('Target.attachToTarget', { targetId, flatten: true });
    await cdp('Page.enable', {}, s); await cdp('Runtime.enable', {}, s);
    await cdp('Emulation.setDeviceMetricsOverride', c.f, s);
    await cdp('Page.addScriptToEvaluateOnNewDocument', { source: OCULTAR_CINTA }, s);
    await cdp('Page.navigate', { url: base + c.ruta }, s);
    if (c.antes) { await dormir(2500); await cdp('Runtime.evaluate', { expression: '(async () => { ' + c.antes + ' })()', awaitPromise: true }, s).catch(() => {}); }
    await dormir(c.espera);
    if (c.despues) { await cdp('Runtime.evaluate', { expression: '(async () => { ' + c.despues + ' })()', awaitPromise: true }, s).catch(() => {}); await dormir(c.tras || 1500); }
    const shot = await cdp('Page.captureScreenshot', { format: 'png' }, s);
    writeFileSync(join(salida, c.n + '.png'), Buffer.from(shot.data, 'base64'));
    console.log(c.n, '→', join(salida, c.n + '.png'));
    await cdp('Target.closeTarget', { targetId });
  }
} finally {
  try { console.log('limpiando restaurante de muestra →', await limpiar()); } catch (e) { console.log('NO se pudo limpiar', e.message); }
}
ws.close(); chrome.kill();
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
