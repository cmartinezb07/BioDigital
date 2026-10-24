// Crea el sistema de menú digital para un restaurante nuevo a partir de la plantilla (la carpeta fogon-del-sur).
// Separa la estructura (código, igual para todos) de los datos (carta, fotos, precios, comunas, personal), que viven en la base bajo un "negocio" propio:
// los pedidos, la carta, las fotos y los PIN de un restaurante no se mezclan con los de otro.
//
// Uso:  node web/herramientas/nuevo-restaurante.mjs --id mirador --nombre "El Mirador" [--origen fogon-del-sur] [--demo]
// Hace:
//   1. Copia la carpeta de la plantilla a web/propuesta/ejemplos/<id>/
//   2. Cambia restaurante.config.js (negocio, nombre, PIN al azar) y los textos con el nombre del local.
//   3. Escribe web/herramientas/restaurantes/<id>-instalar.sql (fuera de la carpeta publicada, tiene los PIN): crea los accesos (dueño, cocina, repartidor) y los permisos de ese negocio en la base.
// Después: ejecutar ese SQL en Supabase (proyecto biodigital-demos), entrar a <id>/panel/ con el PIN del dueño y cargar la carta,
// fotos, comunas y horarios del cliente. La carta de ejemplo trae fotos con licencia (ver fotos/CREDITOS.md): se reemplazan por las del local.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'propuesta', 'ejemplos');
const arg = (n, def) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : def; };
const id = arg('id'), nombre = arg('nombre'), origen = arg('origen', 'fogon-del-sur'), demo = process.argv.includes('--demo');
if (!id || !/^[a-z0-9-]{3,20}$/.test(id) || !nombre) { console.error('Uso: node web/herramientas/nuevo-restaurante.mjs --id mirador --nombre "El Mirador" [--origen fogon-del-sur] [--demo]\n  --id: 3 a 20 letras minúsculas, números o guiones (es el "negocio" en la base).'); process.exit(1); }
if (['fogon', 'reservas', 'fidelizacion'].includes(id)) { console.error('Ese id ya lo usa una demostración.'); process.exit(1); }
const dir0 = join(RAIZ, origen), dir1 = join(RAIZ, id);
if (!existsSync(dir0)) { console.error('No existe la plantilla', dir0); process.exit(1); }
if (existsSync(dir1)) { console.error('Ya existe', dir1, '— no se sobrescribe.'); process.exit(1); }
if (nombre.length > 40 || /['"<>\\]/.test(nombre)) { console.error('El nombre no puede pasar de 40 letras ni llevar comillas, < > o \\.'); process.exit(1); }

const pin = () => String(randomInt(100000, 999999));
const pins = { dueno: pin(), cocina: pin(), reparto: pin() };
cpSync(dir0, dir1, { recursive: true });

// Nombre del local en todas las páginas y textos
const nombreOrigen = /data-ejemplo="([^"]+)"/.exec(readFileSync(join(dir1, 'index.html'), 'utf8'))?.[1] || 'Fogón del Sur';
const recorrer = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === 'fotos' ? [] : recorrer(p)) : [p]; });
let tocados = 0;
for (const f of recorrer(dir1)) {
  if (!['.html', '.js', '.json', '.webmanifest', '.css'].includes(extname(f))) continue;
  const a = readFileSync(f, 'utf8'), b = a.split(nombreOrigen).join(nombre);
  if (a !== b) { writeFileSync(f, b); tocados++; }
}

// El manifest de la app trae un nombre corto (12 letras) que no es el nombre completo
const man = join(dir1, 'manifest.webmanifest');
if (existsSync(man)) writeFileSync(man, readFileSync(man, 'utf8').replace(/"short_name":\s*"[^"]*"/, `"short_name": "${nombre.slice(0, 12)}"`));

writeFileSync(join(dir1, 'restaurante.config.js'), `// Configuración de ESTE restaurante (${nombre}). Es lo único del código que cambia al copiar la plantilla:
// el resto (carta, fotos, precios, horarios, comunas de envío, marca, personal) se administra desde el panel del dueño y vive en la base.
window.RESTAURANTE = {
  negocio: '${id}',
  nombre: '${nombre}',
  // ${demo ? 'Demostración: los PIN se muestran en la pantalla de entrada.' : 'Local real: los PIN NO se muestran. Entrégaselos al dueño por un canal privado.'}
  demo: ${demo},
  pistas: ${demo ? `{
    equipo: [{ rol: 'Cocinero', pin: '${pins.cocina}' }, { rol: 'Repartidor', pin: '${pins.reparto}' }, { rol: 'Jefe (dueño)', pin: '${pins.dueno}' }]
  }` : '{ equipo: [] }'}
};
`);

const sql = `-- Accesos y permisos del restaurante "${nombre}" (negocio '${id}'). Ejecutar una vez en el proyecto Supabase biodigital-demos.
-- Los PIN de abajo son provisorios: el dueño debe cambiarlos y los del personal se administran desde su panel (pestaña Negocio y equipo).
insert into demo.roles (negocio, rol, nombre, pin, cols) values
  ('${id}', 'dueno',   'Dueño',      '${pins.dueno}',   '{*}'),
  ('${id}', 'cocina',  'Cocina',     '${pins.cocina}',  '{pedidos}'),
  ('${id}', 'reparto', 'Repartidor', '${pins.reparto}', '{pedidos}')
on conflict do nothing;
-- Lo que los clientes pueden hacer sin PIN: crear y modificar su pedido (con las reglas del servidor) y dejar una visita.
insert into demo.cols (negocio, col, cliente_crea, cliente_edita, maximo) values
  ('${id}', 'pedidos', true, true, 3000),
  ('${id}', 'visitas', true, false, 20000)
on conflict do nothing;
`;
const dirSql = join(dirname(fileURLToPath(import.meta.url)), 'restaurantes'); mkdirSync(dirSql, { recursive: true });
const archivoSql = join(dirSql, id + '-instalar.sql'); writeFileSync(archivoSql, sql);
console.log(`Listo: ${dir1}\n  ${tocados} archivos con el nombre cambiado.\n  PIN dueño ${pins.dueno} · cocina ${pins.cocina} · reparto ${pins.reparto}  \n  SQL de accesos: ${archivoSql}\nSiguiente: ejecutar ese SQL en Supabase (biodigital-demos) y abrir ${id}/panel/.`);
