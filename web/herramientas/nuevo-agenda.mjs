// Crea el sistema de reservas (agenda) de un negocio nuevo a partir de la plantilla (la carpeta reservas).
// Separa la estructura (código, igual para todos) de los datos (catálogo, precios, horarios, políticas, personal), que viven en la base bajo un
// "negocio" propio: las reservas, la configuración y los PIN de un negocio no se mezclan con los de otro.
//
// Uso:  node web/herramientas/nuevo-agenda.mjs --id cabanas-sol --nombre "Cabañas del Sol" [--agendas agendas.json] [--origen reservas] [--demo] [--url https://…] [--telefono "+56 9 1111 2222"]
//   --agendas  JSON con la lista de agendas del negocio (lo escribe aplicar-formulario-agenda.mjs). Va dentro de agenda.config.js como base
//              y se publica en la base con cargar-agendas.mjs. Sin él, la plantilla trae las 5 agendas de demostración (no usar en un cliente).
//   Sin --demo es un negocio REAL: se quitan la cinta y las notas de "demostración de Bío Digital", el pago de mentira y los PIN en pantalla;
//   la carpeta queda autosuficiente (lleva su nube.js) y se publica sola con wrangler; se permite que los buscadores la encuentren solo si se da --url.
// Hace:
//   1. Copia la carpeta de la plantilla a web/propuesta/ejemplos/<id>/
//   2. Escribe agenda.config.js (negocio, nombre, PIN al azar, agendas) y cambia los textos con el nombre del negocio.
//   3. Escribe web/herramientas/agendas/<id>-instalar.sql (fuera de la carpeta publicada: tiene los PIN): crea los accesos (jefe y recepción) y los permisos.
// Después: ejecutar ese SQL en Supabase (proyecto biodigital-demos), publicar las agendas (cargar-agendas.mjs), entrar a <id>/admin/ con el PIN del jefe.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomInt } from 'node:crypto';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', 'propuesta', 'ejemplos');
const arg = (n, def) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : def; };
const id = arg('id'), nombre = arg('nombre'), origen = arg('origen', 'reservas'), demo = process.argv.includes('--demo'), urlFinal = arg('url', ''), telefono = arg('telefono', ''), archivoAgendas = arg('agendas', '');
if (!id || !/^[a-z0-9-]{3,20}$/.test(id) || !nombre) { console.error('Uso: node web/herramientas/nuevo-agenda.mjs --id cabanas-sol --nombre "Cabañas del Sol" [--agendas agendas.json] [--demo]\n  --id: 3 a 20 letras minúsculas, números o guion (es el "negocio" en la base)'); process.exit(1); }
if (['fogon', 'reservas', 'fidelizacion', 'zz-agenda'].includes(id)) { console.error('Ese id ya lo usa una demostración o las pruebas.'); process.exit(1); }
const dir0 = join(RAIZ, origen), dir1 = join(RAIZ, id);
if (!existsSync(dir0)) { console.error('No existe la plantilla', dir0); process.exit(1); }
if (existsSync(dir1)) { console.error('Ya existe', dir1, '— no se sobrescribe.'); process.exit(1); }
if (nombre.length > 40 || /['"<>\\]/.test(nombre)) { console.error('El nombre no puede pasar de 40 letras ni llevar comillas, < > o \\.'); process.exit(1); }
let agendas = null;
if (archivoAgendas) { agendas = JSON.parse(readFileSync(archivoAgendas, 'utf8')); if (!Array.isArray(agendas) || !agendas.length || agendas.some((a) => !/^[a-z0-9-]{2,30}$/.test(a.id))) { console.error('--agendas debe ser una lista de agendas con id de 2 a 30 letras minúsculas, números o guion.'); process.exit(1); } }
if (!agendas && !demo) { console.error('Un negocio real necesita sus agendas (--agendas agendas.json); sin ellas mostraría las de demostración. Usa aplicar-formulario-agenda.mjs.'); process.exit(1); }

const pin = () => String(randomInt(100000, 999999));
const pins = { dueno: pin(), recepcion: pin() };
while (pins.recepcion === pins.dueno) pins.recepcion = pin();
cpSync(dir0, dir1, { recursive: true });
const recorrer = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? recorrer(p) : [p]; });

// Un negocio real no es "una demostración de Bío Digital": se quita todo lo de la demo
if (!demo) {
  for (const f of recorrer(dir1)) {
    if (extname(f) !== '.html') continue;
    let h = readFileSync(f, 'utf8');
    h = h.replace(/<link rel="stylesheet" href="[./]*_compartido\/demo\.css">\n?/g, '').replace(/<script src="[./]*_compartido\/demo\.js" defer><\/script>\n?/g, '')
      .replace(/ data-ejemplo="[^"]*"/, '').replace(/<link rel="icon"[^>]*>\n?/g, '')
      .replace('Reservas en línea · Demostración de Bío Digital', 'Reservas · ' + nombre).replace('Panel del negocio · Reservas · Bío Digital', 'Panel · ' + nombre)
      .replace('>Reservas en línea</a>', '>' + nombre + '</a>').replace('>Panel del negocio</a>', '>' + nombre + ' · Panel</a>')
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="Reserva en línea en ${nombre}: elige fecha y hora, ve el precio al instante y recibe la confirmación.">`)
      .replace(/Reservas<\/title>/, 'Reservas</title>');
    h = h.replace(/\[TELÉFONO O CORREO DEL NEGOCIO\]/g, telefono || '[TELÉFONO O CORREO DEL NEGOCIO]').replace('<title>Privacidad · Reservas</title>', '<title>Privacidad · ' + nombre + '</title>');
    if (urlFinal) h = h.replace(/<meta name="robots" content="noindex, nofollow">\n?/, '').replace(/<meta name="robots" content="noindex">/, '<meta name="robots" content="index, follow">');   // con dirección definitiva, los buscadores pueden encontrarla (la página del panel sigue noindex)
    writeFileSync(f, h);
  }
  const adm = join(dir1, 'admin', 'index.html');   // el panel nunca se indexa
  writeFileSync(adm, readFileSync(adm, 'utf8').replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">'));
  // Carpeta autosuficiente: publicable sola en el proyecto de Cloudflare del cliente (sin depender de ../_compartido)
  cpSync(join(RAIZ, '_compartido', 'nube.js'), join(dir1, 'nube.js'));
  for (const f of recorrer(dir1)) {
    if (extname(f) !== '.html') continue;
    const h = readFileSync(f, 'utf8'), n = h.split('../../_compartido/nube.js').join('../nube.js').split('../_compartido/nube.js').join('nube.js');
    if (n !== h) writeFileSync(f, n);
  }
}

const cfg = `// Configuración de ESTE sistema de reservas (${nombre}). Es lo único del código que cambia al copiar la plantilla:
// el catálogo (alojamientos, servicios, horarios, precios, políticas) se administra desde el panel del jefe y vive en la base.
// "negocios" es la base de partida de cada agenda (la que publicó Bío Digital); lo que el jefe publica desde su panel la reemplaza.
window.AGENDA = {
  negocio: '${id}',
  // ${demo ? 'Demostración: los PIN se muestran en la pantalla de entrada y el depósito se puede pagar "de mentira".' : 'Negocio real: los PIN NO se muestran y no hay pago de mentira. Entrégaselos al jefe por un canal privado.'}
  demo: ${demo},
  pistas: ${demo ? `[{ rol: 'Recepción', pin: '${pins.recepcion}' }, { rol: 'Jefe (dueño)', pin: '${pins.dueno}' }]` : '[]'}${agendas ? `,\n  negocios: ${JSON.stringify(agendas, null, 2).replace(/\n/g, '\n  ')}` : ''}
};
`;
writeFileSync(join(dir1, 'agenda.config.js'), cfg);

const sql = `-- Accesos y permisos del negocio "${nombre}" (negocio '${id}'). Ejecutar una vez en el proyecto Supabase biodigital-demos.
-- Los PIN de abajo son provisorios: el jefe debe cambiarlos y los de la recepción se administran desde su panel (pestaña Negocio y equipo).
insert into demo.roles (negocio, rol, nombre, pin, cols) values
  ('${id}', 'dueno',     'Jefe',      '${pins.dueno}',     '{*}'),
  ('${id}', 'recepcion', 'Recepción', '${pins.recepcion}', '{reservas,avisos,espera,bloqueos}')
on conflict do nothing;
-- Lo que los clientes pueden hacer sin PIN: reservar y modificar su reserva (con las reglas del servidor) y anotarse en la lista de espera.
insert into demo.cols (negocio, col, cliente_crea, cliente_edita, maximo) values
  ('${id}', 'reservas', true, true, 3000),
  ('${id}', 'espera', true, false, 500)
on conflict do nothing;
`;
const dirSql = join(dirname(fileURLToPath(import.meta.url)), 'agendas'); mkdirSync(dirSql, { recursive: true });
const archivoSql = join(dirSql, id + '-instalar.sql'); writeFileSync(archivoSql, sql);
console.log(`Listo: ${dir1}\n  PIN jefe ${pins.dueno} · recepción ${pins.recepcion}\n  SQL de accesos: ${archivoSql}\nSiguiente: ejecutar ese SQL en Supabase (biodigital-demos), node web/herramientas/cargar-agendas.mjs --negocio ${id} --pin ${pins.dueno}${archivoAgendas ? ' --archivo ' + archivoAgendas : ''} y abrir ${id}/admin/.`);
