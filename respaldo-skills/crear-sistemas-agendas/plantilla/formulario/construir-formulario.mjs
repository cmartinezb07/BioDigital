// Arma el formulario del sistema de reservas (o cualquier otro) a partir del motor de la skill crear-sitio-web.
// Uso:
//   node construir-formulario.mjs --salida formulario-agenda.html --agencia "Bío Digital" --contacto "WhatsApp +56 9 …" \
//        [--whatsapp 569XXXXXXXX] [--supabase-url https://xxxx.supabase.co --supabase-key sb_publishable_…] [--motor ruta/formulario-cliente.html]
// El motor es plantilla/formulario/formulario-cliente.html de crear-sitio-web (una sola fuente para los dos formularios).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORM_AGENDA, META } from './preguntas-agenda.mjs';

const a = Object.fromEntries(process.argv.slice(2).reduce((acc, x, i, arr) => (x.startsWith('--') ? [...acc, [x.slice(2), arr[i + 1]]] : acc), []));
const aqui = dirname(fileURLToPath(import.meta.url));
const candidatos = [a.motor, join(homedir(), '.claude/skills/crear-sitio-web/plantilla/formulario/formulario-cliente.html'), join(aqui, '../../crear-sitio-web/plantilla/formulario/formulario-cliente.html'), join(aqui, 'motor/formulario-cliente.html')].filter(Boolean);
const motor = candidatos.find((p) => existsSync(p));
if (!motor) { console.error('No encuentro el motor del formulario (crear-sitio-web/plantilla/formulario/formulario-cliente.html). Usa --motor.'); process.exit(1); }
let h = readFileSync(motor, 'utf8');
const cambiar = (de, a2) => { if (!h.includes(de)) { console.error('El motor no tiene lo esperado:', de.slice(0, 50)); process.exit(1); } h = h.replace(de, a2); };
const reemplazarBloque = (ini, fin, nuevo) => { const i = h.indexOf(ini); const j = h.indexOf(fin, i); if (i < 0 || j < 0) { console.error('El motor no tiene el bloque', ini); process.exit(1); } h = h.slice(0, i) + nuevo + h.slice(j + fin.length); };

h = h.replace(/<title>[^<]*<\/title>/, `<title>${META.titulo}</title>`);
h = h.replace(/<h1>[^<]*<\/h1>/, `<h1>${META.titulo}</h1>`);
h = h.replace(/(<p class="lead">)[^<]*(<\/p>)/, `$1${META.lead}$2`);
h = h.replace(/<span class="tiempo">[^<]*<\/span>/, `<span class="tiempo">${META.tiempo}</span>`);
const agencia = { nombre: a.agencia || '[NOMBRE DE TU EMPRESA]', contacto: a.contacto || '[tu WhatsApp o correo]', whatsapp: a.whatsapp || '', envio: a['supabase-url'] ? { url: a['supabase-url'], llave: a['supabase-key'], tipo: META.tipo } : null, salida: META.salida };
reemplazarBloque('var AGENCIA = {', '};', `var AGENCIA = ${JSON.stringify(agencia, null, 2)};`);
reemplazarBloque('var FORM = [', '\n];', `var FORM = ${JSON.stringify(FORM_AGENDA, null, 2)};`);
const salida = a.salida || 'formulario-agenda.html';
writeFileSync(salida, h);
const preguntas = FORM_AGENDA.reduce((t, s) => t + s.p.length, 0);
console.log(`${salida}: ${FORM_AGENDA.length} bloques, ${preguntas} preguntas${agencia.envio ? ', envío al panel activo' : ''}`);
