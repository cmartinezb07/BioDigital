// Carga la carta base (carta-base.json) a la base de datos de un restaurante, como carta publicada. La carga el dueño con su PIN.
// Uso: node web/herramientas/cargar-carta-base.mjs [negocio] [pin-del-dueño] [carpeta]   (por defecto: fogon, el PIN de la demostración y la carpeta fogon-del-sur;
//      para un restaurante nuevo: negocio, su PIN de jefe y su carpeta dentro de web/propuesta/ejemplos/)
// También sirve para volver a la carta original de la plantilla. El panel del dueño tiene el mismo botón ("Restablecer la carta base").
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importar } from './nube-node.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const [negocio = 'fogon', pin = '482916', carpeta = 'fogon-del-sur'] = process.argv.slice(2);
const carta = JSON.parse(readFileSync(join(aqui, '../propuesta/ejemplos', carpeta, 'carta-base.json'), 'utf8'));
carta.publicada = Date.now();
const r = await importar(negocio, 'carta', pin, [{ id: 'carta', data: carta }]);
console.log(JSON.stringify(r));
process.exitCode = r.ok ? 0 : 1;
