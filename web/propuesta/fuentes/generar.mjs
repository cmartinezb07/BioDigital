// Genera las opciones 3 a 8 a partir del contenido común.
// La 8 es el sitio de la empresa (index.html); las 3 a 7 son plantillas ya hechas y se escriben en plantillas/.
// Uso (desde web/propuesta):  node fuentes/generar.mjs        → todas
//                             node fuentes/generar.mjs 3 5    → solo esas
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pagina } from './comun.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const pedidas = process.argv.slice(2);
const todas = ['3', '4', '5', '6', '7', '8'];

for (const n of pedidas.length ? pedidas : todas) {
  let o;
  try { o = (await import(`./opcion-${n}.mjs`)).default; } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') { console.log(`opción ${n}: todavía no existe`); continue; }
    throw e;
  }
  // Las opciones 3 a 7 son plantillas ya hechas (archivo); la 8 es el sitio de la empresa
  const destino = n === '8' ? [aqui, '..', o.archivo] : [aqui, '..', 'plantillas', o.archivo];
  writeFileSync(join(...destino), pagina(o));
  console.log(`opción ${n} → ${o.archivo}`);
}
