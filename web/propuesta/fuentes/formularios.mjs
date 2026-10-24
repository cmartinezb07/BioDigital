// Genera los dos formularios para clientes de Bío Digital a partir de las skills (copias en respaldo-skills/):
//   formulario.html       → página web (59 preguntas)
//   formulario-menu.html  → menú digital
// Ambos envían las respuestas al panel (Supabase) y ofrecen copiar / WhatsApp como respaldo.
// Uso (desde la raíz del proyecto):  node web/propuesta/fuentes/formularios.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WHATSAPP, WHATSAPP_VISIBLE, SUPABASE_URL, SUPABASE_KEY } from './config.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = join(aqui, '..', '..', '..');
const motor = join(raiz, 'respaldo-skills/crear-sitio-web/plantilla/formulario/formulario-cliente.html');
const salidaWeb = join(aqui, '..', 'formulario.html');
const salidaMenu = join(aqui, '..', 'formulario-menu.html');
const agencia = { nombre: 'Bío Digital', contacto: `WhatsApp ${WHATSAPP_VISIBLE} · biodigitalici@gmail.com`, whatsapp: WHATSAPP, envio: { url: SUPABASE_URL, llave: SUPABASE_KEY, tipo: 'web' }, salida: 'RESPUESTAS DEL CLIENTE' };

// Página web: el motor tal cual, con los datos de Bío Digital
let h = readFileSync(motor, 'utf8');
const i = h.indexOf('var AGENCIA = {'), j = h.indexOf('};', i);
if (i < 0 || j < 0) throw new Error('El motor no tiene el bloque AGENCIA');
h = h.slice(0, i) + 'var AGENCIA = ' + JSON.stringify(agencia, null, 2) + h.slice(j + 1);
writeFileSync(salidaWeb, h);
console.log('formulario.html listo');

// Menú digital
execFileSync('node', [join(raiz, 'respaldo-skills/crear-menu-digital/plantilla/formulario/construir-formulario.mjs'), '--motor', motor, '--salida', salidaMenu, '--agencia', agencia.nombre, '--contacto', agencia.contacto, '--whatsapp', WHATSAPP, '--supabase-url', SUPABASE_URL, '--supabase-key', SUPABASE_KEY], { stdio: 'inherit' });
