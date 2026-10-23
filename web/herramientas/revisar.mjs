// Revisor automático de páginas con Chrome sin ventana (protocolo DevTools, sin instalar nada).
// Mide en cada ancho: desborde horizontal, textos menores a 12 px, áreas táctiles menores a 44 px, imágenes sin alt,
// enlaces "#", restos de prueba ([PENDIENTE], lorem), títulos, errores de consola, excepciones y recursos que fallan.
// Además guarda capturas: la primera pantalla y la página completa.
//
// Uso:  node web/herramientas/revisar.mjs <url> [--anchos 390,1440] [--salida carpeta] [--tag nombre] [--movimiento]
//   --probar archivo.js  ejecuta un guion de prueba en la página (cuerpo de una función async; puede usar await y devolver un objeto)
//                        después de medir el último ancho; su resultado sale en "prueba" y se guarda una captura "-prueba.png"
//   --movimiento  no fuerza "movimiento reducido" (por defecto se fuerza para que todo lo que aparece con scroll sea visible)
// Imprime un JSON con los hallazgos por ancho y la ruta de cada captura.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--') && !/^\d/.test(a) && args[args.indexOf(a) - 1] !== '--salida' && args[args.indexOf(a) - 1] !== '--tag');
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
if (!url) { console.error('Uso: node revisar.mjs <url> [--anchos 390,1440] [--salida carpeta] [--tag nombre]'); process.exit(1); }
const anchos = opt('anchos', '390,1440').split(',').map(Number);
const salida = resolve(opt('salida', join(process.cwd(), 'web/herramientas/capturas')));
const tag = opt('tag', (url.replace(/^https?:\/\/[^/]+\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'inicio').slice(0, 60));
const movimiento = args.includes('--movimiento');
const guion = opt('probar', null);
mkdirSync(salida, { recursive: true });

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
if (!CHROME) { console.error('No encuentro Chrome'); process.exit(1); }
const perfil = mkdtempSync(join(tmpdir(), 'revisar-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let puerto = null;
for (let i = 0; i < 100 && !puerto; i++) { await dormir(100); try { puerto = readFileSync(join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {} }
if (!puerto) { chrome.kill(); console.error('Chrome no abrió el puerto de depuración'); process.exit(1); }
const ver = await (await fetch(`http://127.0.0.1:${puerto}/json/version`)).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r, m) => { ws.onopen = r; ws.onerror = m; });
let id = 0; const pend = new Map(); const oyentes = [];
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const { ok, mal } = pend.get(m.id); pend.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); } else oyentes.forEach((f) => f(m)); };
const cdp = (method, params = {}, sessionId) => new Promise((ok, mal) => { const n = ++id; pend.set(n, { ok, mal }); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) })); });

const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
const { sessionId: s } = await cdp('Target.attachToTarget', { targetId, flatten: true });
const errores = [], fallidos = [];
oyentes.push((m) => {
  if (m.sessionId !== s) return;
  if (m.method === 'Runtime.exceptionThrown') errores.push('excepción: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push('consola: ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errores.push('log: ' + m.params.entry.text.slice(0, 200) + (m.params.entry.url ? ' ' + m.params.entry.url : ''));
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) fallidos.push(m.params.response.status + ' ' + m.params.response.url);
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) fallidos.push('falló ' + m.params.errorText + ' ' + (m.params.requestId || ''));
});
await cdp('Runtime.enable', {}, s); await cdp('Log.enable', {}, s); await cdp('Network.enable', {}, s); await cdp('Page.enable', {}, s);
if (!movimiento) await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, s);

const MEDIR = `(() => {
  const d = document, w = window, vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const textos = [...d.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && vis(e) && !e.closest('[aria-hidden="true"],.sr,.sr-only,.visually-hidden,script,style,noscript'));
  const chicos = textos.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 11.95).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).join('.') : '') + ' "' + e.textContent.trim().slice(0, 30) + '" ' + getComputedStyle(e).fontSize);
  const tactiles = [...d.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button]')].filter((e) => vis(e) && !e.closest('[aria-hidden="true"]') && !(e.tagName === 'A' && getComputedStyle(e).display === 'inline' && e.closest('p,li,dd,td,small,footer,label'))).filter((e) => { const l = e.matches('input[type=checkbox], input[type=radio]') && e.closest('label'); if (l && l.getBoundingClientRect().height >= 43.5) return false; const r = e.getBoundingClientRect(); return r.height < 43.5 || r.width < 24; }).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).join('.') : '') + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  const anchoV = d.documentElement.clientWidth;
  const culpables = [...d.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > anchoV + 1 && r.width > 0 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 6).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).join('.') : '') + ' right=' + Math.round(e.getBoundingClientRect().right));
  const html = d.body.innerHTML;
  return {
    titulo: d.title, descripcion: d.querySelector('meta[name=description]')?.content || null, lang: d.documentElement.lang || null,
    h1: d.querySelectorAll('h1').length, desborde: d.documentElement.scrollWidth - anchoV, culpables: d.documentElement.scrollWidth - anchoV > 0 ? culpables : [],
    textosChicos: [...new Set(chicos)].slice(0, 12), tactilesChicos: [...new Set(tactiles)].slice(0, 12),
    imgSinAlt: [...d.querySelectorAll('img:not([alt])')].map((i) => i.src.slice(-60)),
    enlacesVacios: [...d.querySelectorAll('a[href="#"], a[href=""]')].length,
    restos: ['[PENDIENTE', 'lorem', 'Lorem', 'TODO', 'undefined', 'NaN'].filter((t) => html.includes(t)),
    alto: d.documentElement.scrollHeight,
  };
})()`;

const resultado = { url, anchos: {}, errores: null, recursosFallidos: null };
for (const ancho of anchos) {
  const movil = ancho < 600, alto = movil ? 844 : 900;
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: movil }, s);
  const cargado = new Promise((r) => { const f = (m) => { if (m.sessionId === s && m.method === 'Page.loadEventFired') { oyentes.splice(oyentes.indexOf(f), 1); r(); } }; oyentes.push(f); });
  await cdp('Page.navigate', { url }, s);
  await Promise.race([cargado, dormir(15000)]);
  await dormir(1800);
  // baja hasta el final y vuelve, para que se carguen las imágenes diferidas y aparezcan los elementos con scroll
  await cdp('Runtime.evaluate', { expression: `(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0);})()`, awaitPromise: true }, s);
  await dormir(900);
  const { result } = await cdp('Runtime.evaluate', { expression: MEDIR, returnByValue: true }, s);
  const r = result.value;
  // primera pantalla
  const prim = await cdp('Page.captureScreenshot', { format: 'png' }, s);
  const fPrim = join(salida, `${tag}-${ancho}-pantalla.png`); writeFileSync(fPrim, Buffer.from(prim.data, 'base64'));
  // página completa (tope de 14.000 px; a 1440 se reduce a la mitad)
  const altoTotal = Math.min(r.alto, 14000), escala = movil ? 0.75 : 0.5;
  const comp = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: ancho, height: altoTotal, scale: escala } }, s);
  const fComp = join(salida, `${tag}-${ancho}-completa.png`); writeFileSync(fComp, Buffer.from(comp.data, 'base64'));
  resultado.anchos[ancho] = { ...r, capturas: { pantalla: fPrim, completa: fComp } };
}
if (guion) {
  const cuerpo = readFileSync(resolve(guion), 'utf8');
  const expr = `(async () => { const dormir = (ms) => new Promise((r) => setTimeout(r, ms)); const $ = (s) => document.querySelector(s); const $$ = (s) => [...document.querySelectorAll(s)]; try { ${cuerpo}
 } catch (e) { return { error: String(e && e.stack || e) }; } })()`;
  const { result, exceptionDetails } = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, s);
  resultado.prueba = exceptionDetails ? { error: exceptionDetails.text } : result.value;
  await dormir(500);
  const shot = await cdp('Page.captureScreenshot', { format: 'png' }, s);
  const fP = join(salida, `${tag}-prueba.png`); writeFileSync(fP, Buffer.from(shot.data, 'base64'));
  resultado.capturaPrueba = fP;
}
resultado.errores = [...new Set(errores)];
resultado.recursosFallidos = [...new Set(fallidos)];
console.log(JSON.stringify(resultado, null, 2));
try { ws.close(); } catch {}
chrome.kill();
await dormir(400);
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
process.exit(0);
