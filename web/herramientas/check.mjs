// Check completo del sitio: pasa el revisor por todas las páginas (390 y 1440 px) y sus guiones de prueba,
// y escribe memoria/CHECK.md con una tabla ✅/❌ y la lista de lo que se revisa a ojo.
// Uso: node web/herramientas/check.mjs [base]   (base por defecto: la vista previa publicada)
//      node web/herramientas/check.mjs http://localhost:4321   (con el preview "maquetas" encendido)
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const base = (process.argv[2] || 'https://ejemplos.biodigital-propuesta.pages.dev').replace(/\/$/, '');
const local = /localhost|127\.0\.0\.1/.test(base);
const salida = mkdtempSync(join(tmpdir(), 'check-'));
const P = 'web/herramientas/pruebas/';

const PAGINAS = [
  { nombre: 'Portada (carrusel y visor)', ruta: '/', prueba: 'carrusel.js', mov: true },
  { nombre: 'Portada · Mira tu página', ruta: '/', prueba: 'tu-pagina.js', mov: true },
  { nombre: 'Galería de ejemplos', ruta: '/ejemplos/' },
  { nombre: 'Política de privacidad', ruta: '/privacidad/' },
  { nombre: 'Términos del servicio', ruta: '/terminos/' },
  { nombre: 'Antes de contratar', ruta: '/antes-de-contratar/' },
  { nombre: 'Ejemplo · Estética (Forma)', ruta: '/ejemplos/estetica/', prueba: 'estetica.js' },
  { nombre: 'Ejemplo · Cabañas (Villa Aurelia)', ruta: '/ejemplos/cabanas/', prueba: 'cabanas.js', mov: true },
  { nombre: 'Ejemplo · Dental (Oris)', ruta: '/ejemplos/dental/', prueba: 'dental.js', mov: true },
  { nombre: 'Ejemplo · Contable (Taxo)', ruta: '/ejemplos/estudio-contable/', prueba: 'estudio-contable.js', mov: true },
  { nombre: 'Ejemplo · Técnico (Kyntra)', ruta: '/ejemplos/tecnico/', prueba: 'tecnico.js' },
  { nombre: 'Ejemplo · Barbería (DBC)', ruta: '/ejemplos/barberia/', prueba: 'barberia.js', mov: true },
  { nombre: 'Ejemplo · Pastelería (Boolka)', ruta: '/ejemplos/casa-dulce/', prueba: 'casa-dulce.js', mov: true },
  { nombre: 'Ejemplo · Restaurante (menú con pedidos)', ruta: '/ejemplos/fogon-del-sur/', prueba: 'fogon-del-sur.js' },
  { nombre: 'Restaurante · Pago del pedido', ruta: '/ejemplos/fogon-del-sur/pagar/' },
  { nombre: 'Restaurante · Tu pedido (ejemplo) y juegos de espera', ruta: '/ejemplos/fogon-del-sur/pedido/?demo', prueba: 'juegos.js' },
  { nombre: 'Restaurante · Cocina (pide PIN)', ruta: '/ejemplos/fogon-del-sur/cocina/' },
  { nombre: 'Restaurante · Repartidor (pide PIN)', ruta: '/ejemplos/fogon-del-sur/repartidor/' },
  { nombre: 'Restaurante · Mis pedidos (cliente)', ruta: '/ejemplos/fogon-del-sur/mis-pedidos/', prueba: 'mis-pedidos.js' },
  { nombre: 'Restaurante · Servicio completo (cliente, cocina, reparto y dueño)', ruta: '/ejemplos/fogon-del-sur/panel/', prueba: 'fogon-servicio.js' },
  { nombre: 'Restaurante · Panel del dueño (pedidos en vivo, carta, estadísticas)', ruta: '/ejemplos/fogon-del-sur/panel/', prueba: 'panel-dueno.js' },
  { nombre: 'Pastelería · Carta', ruta: '/ejemplos/casa-dulce/carta/' },
  { nombre: 'Sistema de reservas (cliente)', ruta: '/ejemplos/reservas/', prueba: 'reservas-sistema.js' },
  { nombre: 'Sistema de reservas (panel, pide PIN)', ruta: '/ejemplos/reservas/admin/' },
  { nombre: 'Fidelización (cliente)', ruta: '/ejemplos/fidelizacion/', prueba: 'fidelizacion.js' },
  { nombre: 'Fidelización (caja del local, pide PIN)', ruta: '/ejemplos/fidelizacion/local/' },
  { nombre: 'Cómo trabajamos', ruta: '/como-trabajamos/' },
  { nombre: 'Módulo de reservas (demo)', ruta: '/ejemplos/_compartido/reservas-demo.html', prueba: 'reservas.js' },
];

// En local no existen las funciones de pago de Cloudflare: ese 404 no cuenta
const ignorar = (t) => local && /\/api\/payments\//.test(t);
const revisar = (url, extra) => {
  try {
    const out = execFileSync('node', ['web/herramientas/revisar.mjs', url, '--salida', salida, '--tag', 'c', ...extra], { cwd: raiz, encoding: 'utf8', maxBuffer: 1 << 26, timeout: 240000 });
    return JSON.parse(out);
  } catch (e) { return { fallo: String(e.message || e).split('\n')[0] }; }
};

const solo = process.argv.slice(3);   // nombres parciales opcionales: check.mjs <base> dental reservas
const filas = [];
for (const p of PAGINAS.filter((x) => !solo.length || solo.some((t) => x.ruta.includes(t)))) {
  const url = base + p.ruta;
  process.stdout.write(p.nombre + ' … ');
  const r = revisar(url, []);
  const f = { ...p, url };
  if (r.fallo) { f.fallo = r.fallo; filas.push(f); console.log('no se pudo revisar'); continue; }
  const a = Object.values(r.anchos);
  f.desborde = Math.max(...a.map((x) => x.desborde));
  f.textos = a.reduce((s, x) => s + x.textosChicos.length, 0);
  f.tactiles = a.reduce((s, x) => s + x.tactilesChicos.length, 0);
  f.alt = a.reduce((s, x) => s + x.imgSinAlt.length, 0);
  f.errores = r.errores.filter((e) => !ignorar(e));
  f.fallidos = r.recursosFallidos.filter((e) => !ignorar(e));
  f.detalle = [...new Set(a.flatMap((x) => [...x.textosChicos, ...x.tactilesChicos]))].slice(0, 4);
  if (p.prueba) {
    const t = revisar(url, ['--anchos', '1440', '--probar', P + p.prueba, ...(p.mov ? ['--movimiento'] : [])]);
    const res = t.prueba || {};
    // Las pruebas pueden agrupar resultados en bloques: se recorren todos los niveles
    const vals = [];
    (function rec(o, pre) { for (const [k, v] of Object.entries(o || {})) { if (typeof v === 'string' && /^(ok|FALLÓ)/.test(v)) vals.push([pre + k, v]); else if (v && typeof v === 'object') rec(v, pre + k + ' › '); } })(res, '');
    f.pruebaOk = vals.filter(([, v]) => v === 'ok').length;
    f.pruebaTotal = vals.length;
    f.pruebaFallas = vals.filter(([, v]) => v !== 'ok').map(([k, v]) => k + ': ' + v);
    if (t.fallo) f.pruebaFallas = [t.fallo];
  }
  f.ok = !f.desborde && !f.textos && !f.tactiles && !f.alt && !f.errores.length && !f.fallidos.length && (!p.prueba || (f.pruebaTotal > 0 && f.pruebaOk === f.pruebaTotal));
  filas.push(f);
  console.log(f.ok ? 'ok' : 'revisar');
}

// Conexión en la nube: permisos por PIN, privacidad, cupos y reglas contra trampas (prueba directa contra la base)
const nube = { vals: [], fallo: '' };
if (!solo.length) {
  process.stdout.write('Conexión en la nube … ');
  let out = '';
  try { out = execFileSync('node', ['web/herramientas/nube-e2e.mjs'], { cwd: raiz, encoding: 'utf8', timeout: 240000, stdio: ['ignore', 'pipe', 'ignore'] }); } catch (e) { out = e.stdout || ''; nube.fallo = out ? '' : String(e.message || e).split('\n')[0]; }
  try { nube.vals = Object.entries(JSON.parse(out)); } catch (e) { nube.fallo = nube.fallo || 'no se pudo leer el resultado'; }
  console.log(nube.vals.length && nube.vals.every(([, v]) => v === 'ok') ? 'ok' : 'revisar');
}
const nubeOk = nube.vals.filter(([, v]) => v === 'ok').length;

const si = (v) => (v ? '❌ ' + v : '✅');
const fecha = new Date().toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Santiago' });
const total = filas.filter((f) => f.ok).length;
let md = `# Check del sitio · ${fecha}

Revisado en: ${base} · ${total} de ${filas.length} páginas sin observaciones${nube.vals.length ? ` · ${nubeOk} de ${nube.vals.length} pruebas de la conexión en la nube sin fallas` : ''}.
Para repetirlo: \`node web/herramientas/check.mjs\` (vista previa) o \`node web/herramientas/check.mjs http://localhost:4321\` (local).

## 1. Revisión automática (celular 390 px y escritorio 1440 px)

Criterios (de la skill crear-sitio-web): sin desborde horizontal, textos de 12 px o más, áreas táctiles de 44 px o más, imágenes con texto alternativo, consola sin errores, ningún recurso que falle y la prueba de interacción completa.

| Página | Resultado | Desborde | Textos < 12 px | Táctiles < 44 px | Img sin alt | Errores | Recursos fallidos | Prueba |
|---|---|---|---|---|---|---|---|---|
`;
for (const f of filas) {
  if (f.fallo) { md += `| [${f.nombre}](${f.url}) | ❌ | — | — | — | — | ${f.fallo.replace(/\|/g, '/')} | — | — |\n`; continue; }
  md += `| [${f.nombre}](${f.url}) | ${f.ok ? '✅' : '❌'} | ${si(f.desborde)} | ${si(f.textos)} | ${si(f.tactiles)} | ${si(f.alt)} | ${si(f.errores.length)} | ${si(f.fallidos.length)} | ${f.prueba ? (f.pruebaOk === f.pruebaTotal && f.pruebaTotal ? '✅ ' : '❌ ') + f.pruebaOk + '/' + f.pruebaTotal : '—'} |\n`;
}
if (nube.vals.length || nube.fallo) {
  md += '\n## 1b. Conexión en la nube (reservas, fidelización y pedidos)\n\nPermisos por PIN, privacidad del cliente, cupos que no se venden dos veces y reglas contra trampas, probados directo contra la base (`node web/herramientas/nube-e2e.mjs`). Lo que crea la prueba se borra al terminar.\n\n| Prueba | Resultado |\n|---|---|\n';
  if (nube.fallo) md += `| No se pudo correr | ❌ ${nube.fallo.replace(/\|/g, '/')} |\n`;
  for (const [k, v] of nube.vals) md += `| ${k.replace(/\|/g, '/')} | ${v === 'ok' ? '✅' : '❌ ' + v.replace(/\|/g, '/')} |\n`;
}
const obs = filas.filter((f) => !f.ok && !f.fallo);
if (obs.length) {
  md += '\n**Observaciones:**\n\n';
  for (const f of obs) md += `- ${f.nombre}: ${[...f.detalle, ...f.errores, ...f.fallidos, ...(f.pruebaFallas || [])].slice(0, 6).join(' · ')}\n`;
}
md += `
## 2. Revisión a ojo (marca cada casilla al verla)

- [ ] **Carrusel de la portada** ([abrir](${base}/#ejemplos)): las 8 tarjetas giran con la captura real de cada ejemplo.
- [ ] **Visor**: al hacer clic en una tarjeta se ve la página en vivo; cambia entre Escritorio y Celular; las flechas pasan de ejemplo; "Abrir la página completa ↗" abre otra pestaña; Esc cierra.
- [ ] **Antes de contratar** ([abrir](${base}/antes-de-contratar/)): no nombra marcas, cada falla tiene su fuente y las cifras dicen "aprox."; revisar cada 3 meses.
- [ ] **Fidelización** ([abrir](${base}/#planes)): ya no promete Google Wallet ni Apple Wallet a precio único.
- [ ] **Políticas** ([privacidad](${base}/privacidad/), [términos](${base}/terminos/)): el equipo leyó los plazos y el retracto propuestos.
- [ ] **Galería** ([abrir](${base}/ejemplos/)): cada ejemplo muestra su segmento y su matriz CREA.
- [ ] **Cada ejemplo frente a su plantilla** (tabla en \`memoria/ejemplos-matriz.md\`): la estructura y el movimiento se parecen y los colores no se repiten entre ejemplos.
- [ ] **En un celular real** (no solo en el emulador): portada, un ejemplo con reservas y el menú con pedidos.
- [ ] **Sistemas en dos pestañas**: un pedido en Fogón del Sur aparece en la cocina y el seguimiento avanza; una reserva en una pestaña baja la disponibilidad en la otra; un sello sumado en la caja aparece en la tarjeta.

## 3. Decisiones pendientes del equipo

Detalle y cifras en \`memoria/competencia.md\` (§9 y §10), \`memoria/menu-pedidos.md\` y \`memoria/reservas-sistema.md\`. Ya decidido el 23-oct: sin ficha de Google por ahora, sin garantía 50/50, fidelización QR hecha.

- [ ] Precio de la versión de restaurante con pedidos y delivery, y de las reservas completas (hoy "a cotizar"), separando instalación única de costos mensuales de terceros.
- [ ] ¿Plazo para la garantía de corrección de errores (hoy sin plazo en los términos)?
- [ ] ¿Qué se pide a los primeros 5 clientes (caso documentado y reseña)?
- [ ] Plazos de las políticas (12 meses de retención, 15 días hábiles de respuesta, retracto de 10 días) y razón social o RUT.
- [ ] Commit en git y, cuando termine la fase de pagos, publicación en Production con la versión pública (\`node fuentes/generar.mjs --publico 8\`).
`;
writeFileSync(join(raiz, 'memoria', 'CHECK.md'), md);
console.log(`\n${total}/${filas.length} sin observaciones → memoria/CHECK.md`);
