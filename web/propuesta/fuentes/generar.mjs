// Genera las opciones 3 a 7 a partir del contenido común.
// Uso (desde web/propuesta):  node fuentes/generar.mjs        → todas
//                             node fuentes/generar.mjs 3 5    → solo esas
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pagina } from './comun.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const pedidas = process.argv.slice(2);
const todas = ['3', '4', '5', '6', '7'];

for (const n of pedidas.length ? pedidas : todas) {
  let o;
  try { o = (await import(`./opcion-${n}.mjs`)).default; } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') { console.log(`opción ${n}: todavía no existe`); continue; }
    throw e;
  }
  writeFileSync(join(aqui, '..', o.archivo), pagina(o));
  console.log(`opción ${n} → ${o.archivo}`);
}
