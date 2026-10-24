// Prueba de scroll real: recorre cada página como una persona (gestos de dedo a 390 px, rueda del mouse a 1440 px),
// con el movimiento normal activado, y detecta si el scroll retrocede solo, se queda pegado, salta después de soltar
// o no llega al final. Las páginas salen de la lista de check.mjs.
// Uso (con el servidor local encendido):  node web/herramientas/scroll.mjs [http://localhost:4321] [ruta …]
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:4321').replace(/\/$/, '');
const pedidas = args.filter((a) => !/^https?:/.test(a)).map((a) => '/' + a.replace(/^.*?(ejemplos|como-trabajamos|antes-de-contratar|privacidad|terminos)/, '$1').replace(/^\/+/, ''));   // Git Bash convierte "/ruta" en una ruta de Windows: se recorta hasta la carpeta del sitio
const parte = (args.find((a) => /^\d+\/\d+$/.test(a)) || '1/1').split('/').map(Number);   // "2/4": segunda de cuatro partes
const todas = pedidas.filter((a) => !/^\/\d+\/\d+$/.test(a)).length ? pedidas.filter((a) => !/^\/\d+\/\d+$/.test(a)) : [...new Set([...readFileSync(join(aqui, 'check.mjs'), 'utf8').matchAll(/ruta: '([^']+)'/g)].map((m) => m[1]))];
const rutas = todas.filter((_, i) => i % parte[1] === parte[0] - 1);

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].find((p) => existsSync(p));
const perfil = mkdtempSync(join(tmpdir(), 'scroll-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run', '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
let puerto = null;
for (let i = 0; i < 100 && !puerto; i++) { await dormir(100); try { puerto = readFileSync(join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {} }
const ver = await (await fetch(`http://127.0.0.1:${puerto}/json/version`)).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((r, m) => { ws.onopen = r; ws.onerror = m; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const { ok, mal } = pend.get(m.id); pend.delete(m.id); m.error ? mal(new Error(m.error.message)) : ok(m.result); } };
const cdp = (method, params = {}, sessionId) => new Promise((ok, mal) => { const n = ++id; pend.set(n, { ok, mal }); ws.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) })); setTimeout(() => { if (pend.has(n)) { pend.delete(n); mal(new Error('Chrome no respondió a ' + method)); } }, 15000); });
const valor = async (s, expr) => (await cdp('Runtime.evaluate', { expression: expr, returnByValue: true }, s)).result.value;

const filas = [];
for (const ruta of rutas) {
  for (const ancho of [390, 1440]) {
    const movil = ancho < 600, alto = movil ? 844 : 900;
    const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
    try {
    const { sessionId: s } = await cdp('Target.attachToTarget', { targetId, flatten: true });
    await cdp('Page.enable', {}, s); await cdp('Runtime.enable', {}, s);
    await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: movil }, s);
    if (movil) await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, s);
    const resp = await fetch(base + ruta).catch(() => null);
    if (!resp || !resp.ok) throw new Error('la página no responde (' + (resp ? resp.status : 'servidor apagado') + ')');
    await cdp('Page.navigate', { url: base + ruta }, s);
    await dormir(3500);
    if (await valor(s, 'document.documentElement.scrollHeight - innerHeight') < 50) throw new Error('la página cargó sin contenido para hacer scroll');
    const problemas = []; let pasos = 0, y = await valor(s, 'scrollY'), llego = false, atascos = 0;
    for (; pasos < 80; pasos++) {
      const max = await valor(s, 'document.documentElement.scrollHeight - innerHeight');
      if (y >= max - 4) { llego = true; break; }
      if (movil) {   // arrastre con el dedo: tocar, deslizar hacia arriba y soltar
        const x = Math.round(ancho / 2), y0 = Math.round(alto * .75), y9 = Math.round(alto * .3);
        await cdp('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] }, s);
        for (let k = 1; k <= 10; k++) { await cdp('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: Math.round(y0 + (y9 - y0) * k / 10) }] }, s); await dormir(16); }
        await cdp('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, s);
      }
      else { for (let k = 0; k < 4; k++) { await cdp('Input.dispatchMouseEvent', { type: 'mouseWheel', x: ancho / 2, y: alto / 2, deltaX: 0, deltaY: 120 }, s); await dormir(40); } }
      await dormir(450);
      const y1 = await valor(s, 'scrollY');
      await dormir(700);   // sin tocar nada: el scroll no debería moverse solo
      const y2 = await valor(s, 'scrollY');
      if (y1 < y - 5) problemas.push(`retrocede de ${Math.round(y)} a ${Math.round(y1)}`);
      if (Math.abs(y2 - y1) > 40) problemas.push(`se mueve solo después de soltar: ${Math.round(y1)} → ${Math.round(y2)}`);
      if (y2 <= y + 2) { atascos++; if (atascos >= 3) { problemas.push(`se queda pegado en ${Math.round(y2)} de ${Math.round(max)}`); break; } } else atascos = 0;
      y = y2;
    }
    const fila = { ruta, ancho, pasos, llego, problemas: [...new Set(problemas)].slice(0, 4) };
    filas.push(fila);
    console.log(`${fila.llego && !fila.problemas.length ? 'OK ' : 'MAL'} ${ancho} ${ruta} · ${pasos} gestos${fila.problemas.length ? ' · ' + fila.problemas.join(' | ') : ''}${fila.llego ? '' : ' · no llegó al final'}`);
    } catch (err) { filas.push({ ruta, ancho, pasos: 0, llego: false, problemas: ['la prueba no pudo terminar: ' + err.message] }); console.log(`MAL ${ancho} ${ruta} · ${err.message}`); }
    await cdp('Target.closeTarget', { targetId }).catch(() => {});
  }
}
ws.close(); chrome.kill();
try { rmSync(perfil, { recursive: true, force: true }); } catch {}
const malas = filas.filter((f) => !f.llego || f.problemas.length);
console.log(`\n${filas.length - malas.length}/${filas.length} recorridos sin problemas de scroll`);
process.exitCode = malas.length ? 1 : 0;
