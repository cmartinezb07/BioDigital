// Crea la tarjeta de fidelización con QR de un local nuevo a partir de la demostración (ejemplos/fidelizacion/). Sin mensualidad.
// Cada local es un "negocio" propio en la base: sus tarjetas, sellos y PIN no se mezclan con los de otro.
//
// Uso:  node web/herramientas/nuevo-fidelizacion.mjs --id cafe-sol --nombre "Café del Sol" --premio "Un café gratis" [--sellos 8] [--sigla CS]
//         [--color "#6b4226"] [--comuna Concepción] [--minutos 1] [--url https://…]
//   --sellos   cuántos sellos completan la tarjeta (4 a 20)        --minutos  tiempo mínimo entre dos sellos de una misma tarjeta (evita sellos dobles)
// Hace:
//   1. Copia la demostración a web/propuesta/ejemplos/<id>/ (carpeta autosuficiente: lleva su nube.js; se publica sola con wrangler).
//   2. Escribe fidelizacion.config.js (negocio, programa, color) y los textos con el nombre del local.
//   3. Escribe web/herramientas/fidelizaciones/<id>-instalar.sql (fuera de git: tiene los PIN): accesos del dueño y de la caja y permisos del negocio.
// Después: ejecutar ese SQL en Supabase (biodigital-demos) — y, una sola vez para todos los locales, nube-sql/007 (protege los sellos de cualquier negocio) —,
// probar con revisar.mjs y publicar. La caja entra en <id>/local/ con su PIN; el QR para que los clientes saquen su tarjeta apunta a <id>/.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';

const aqui = dirname(fileURLToPath(import.meta.url)), EJ = join(aqui, '..', 'propuesta', 'ejemplos');
const arg = (n, def) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : def; };
const id = arg('id'), nombre = arg('nombre'), premio = arg('premio'), sellos = +arg('sellos', 8), minutos = +arg('minutos', 1), comuna = arg('comuna', ''), urlFinal = arg('url', '');
const color = arg('color', '#6b4226'), sigla = (arg('sigla') || (nombre || '').split(/\s+/).filter((w) => !/^(de|del|la|las|los|el|y)$/i.test(w)).map((w) => w[0]).join('').slice(0, 2)).toUpperCase();
const mal = (m) => { console.error(m); process.exit(1); };
if (!id || !/^[a-z0-9-]{3,20}$/.test(id) || !nombre || !premio) mal('Uso: node web/herramientas/nuevo-fidelizacion.mjs --id cafe-sol --nombre "Café del Sol" --premio "Un café gratis" [--sellos 8] [--color "#6b4226"]\n  --id: 3 a 20 letras minúsculas, números o guiones.');
if (['fidelizacion', 'reservas', 'fogon'].includes(id)) mal('Ese id ya lo usa una demostración.');
if (nombre.length > 40 || premio.length > 80 || /['"<>\\]/.test(nombre + premio)) mal('Nombre (40) y premio (80) sin comillas, < > ni \\.');
if (!(sellos >= 4 && sellos <= 20)) mal('--sellos entre 4 y 20.');
if (!/^#[0-9a-f]{6}$/i.test(color)) mal('--color como #6b4226.');
const dir0 = join(EJ, 'fidelizacion'), dir1 = join(EJ, id);
if (existsSync(dir1)) mal('Ya existe ' + dir1 + ' — no se sobrescribe.');

cpSync(dir0, dir1, { recursive: true });
cpSync(join(EJ, '_compartido', 'nube.js'), join(dir1, 'nube.js'));
const recorrer = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? recorrer(p) : [p]; });
for (const f of recorrer(dir1)) {
  if (!['.html', '.webmanifest'].includes(extname(f))) continue;
  let h = readFileSync(f, 'utf8').split('Café Mirador').join(nombre);
  if (extname(f) === '.html') {
    h = h.replace(/<link rel="stylesheet" href="[./]*_compartido\/demo\.css(\?v=[0-9a-f]+)?">\n?/g, '').replace(/<script src="[./]*_compartido\/demo\.js(\?v=[0-9a-f]+)?" defer><\/script>\n?/g, '')
      .replace(/ data-ejemplo="[^"]*"/, '').split('../../_compartido/nube.js').join('../nube.js').split('../_compartido/nube.js').join('nube.js')
      .replace(/(<script src="(?:\.\.\/)?)fidelizacion\.js/, '$1fidelizacion.config.js"></script>\n$1fidelizacion.js');
    if (urlFinal && !f.includes(join(dir1, 'local'))) h = h.replace(/<meta name="robots" content="[^"]*">\n?/, '<link rel="canonical" href="' + urlFinal + '">\n');
  } else h = h.replace(/"short_name":\s*"[^"]*"/, '"short_name": "' + nombre.slice(0, 12) + '"');
  writeFileSync(f, h);
}
writeFileSync(join(dir1, 'fidelizacion.config.js'), `// Tarjeta de fidelización de ${nombre} (negocio '${id}' en la base). Es lo único del código que cambia de un local a otro.
// Sin mensualidad. La caja entra en local/ con su PIN (no se muestra en pantalla: se entrega al dueño por un canal privado).
window.FIDELIZACION = {
  negocio: '${id}',
  programa: ${JSON.stringify({ negocio: nombre, sigla, comuna, sellos, premio, minutosEntreSellos: minutos, color })}
};
`);
const pin = () => String(randomInt(100000, 999999)), pins = { dueno: pin(), caja: pin() };
const sql = `-- Accesos y permisos de la tarjeta de fidelización de "${nombre}" (negocio '${id}'). Ejecutar una vez en el proyecto Supabase biodigital-demos.
-- Requisito (una sola vez para todos los locales): nube-sql/007-fidelizacion-cualquier-negocio.sql, que impide que un cliente se sume sellos.
insert into demo.roles (negocio, rol, nombre, pin, cols) values
  ('${id}', 'dueno', 'Dueño', '${pins.dueno}', '{*}'),
  ('${id}', 'caja',  'Caja',  '${pins.caja}',  '{tarjetas,eventos}')
on conflict do nothing;
-- Sin PIN, un cliente solo puede sacar su tarjeta (sin sellos) y registrar su alta.
insert into demo.cols (negocio, col, cliente_crea, cliente_edita, maximo) values
  ('${id}', 'tarjetas', true, false, 3000),
  ('${id}', 'eventos', true, false, 20000)
on conflict do nothing;
`;
const dirSql = join(aqui, 'fidelizaciones'); mkdirSync(dirSql, { recursive: true });
writeFileSync(join(dirSql, id + '-instalar.sql'), sql);
console.log(`Listo: web/propuesta/ejemplos/${id}/ (${sellos} sellos → ${premio})
  PIN dueño ${pins.dueno} · caja ${pins.caja} (entregarlos por un canal privado)
  SQL de accesos: web/herramientas/fidelizaciones/${id}-instalar.sql
Siguiente: (1) ejecutar nube-sql/007 si aún no está y ese SQL en Supabase, (2) probar http://localhost:4321/ejemplos/${id}/ y /local/,
(3) publicar: npx wrangler pages deploy web/propuesta/ejemplos/${id} --project-name=${id} --branch=main --commit-dirty=true, (4) imprimir el QR que lleva a la tarjeta.`);
