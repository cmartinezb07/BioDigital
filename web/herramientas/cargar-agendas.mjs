// Publica en la base las agendas de un negocio de reservas (catálogo, precios, horarios y políticas), como si el jefe apretara "Publicar".
// Sin --archivo carga las cinco agendas de demostración del motor (cabañas, tours, centro médico, espacios, salón). Con --archivo carga un JSON
// con una lista de agendas (así lo usa aplicar-formulario-agenda.mjs para un cliente real).
// Uso: node web/herramientas/cargar-agendas.mjs --negocio reservas --pin 482916 [--archivo agendas.json] [--solo cabanas,tours]
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { escribir } from './nube-node.mjs';

const arg = (k) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : null; };
const neg = arg('negocio'), pin = arg('pin'), archivo = arg('archivo'), solo = (arg('solo') || '').split(',').filter(Boolean);
if (!neg || !pin) { console.error('Faltan --negocio y --pin (el PIN del jefe de ese negocio).'); process.exit(2); }

let agendas;
if (archivo) agendas = JSON.parse(readFileSync(archivo, 'utf8'));
else {
  const aqui = dirname(fileURLToPath(import.meta.url));
  const ctx = { console, crypto: globalThis.crypto, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, addEventListener() {}, setTimeout, setInterval, clearTimeout };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(readFileSync(join(aqui, '../propuesta/ejemplos/reservas/motor.js'), 'utf8'), ctx);
  agendas = JSON.parse(JSON.stringify(ctx.Reservas.NEGOCIOS));
}
if (solo.length) agendas = agendas.filter((a) => solo.includes(a.id));

let fallo = 0;
for (const c of agendas) {
  const x = await escribir(neg, 'config', 'cfg-' + c.id, { config: c }, { pin, modo: 'poner' });
  const bien = x && x.ok === true;
  if (!bien) fallo++;
  console.log((bien ? 'ok     ' : 'FALLÓ  ') + c.id + (bien ? '' : ' → ' + JSON.stringify(x)));
}
process.exit(fallo ? 1 : 0);
