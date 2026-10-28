// De las respuestas del formulario del cliente a un restaurante funcionando (carpeta lista, carta, accesos y prueba), en un solo paso.
//
// Uso:  node web/herramientas/aplicar-formulario.mjs respuestas.json [--id mirador] [--demo]
//   respuestas.json  las respuestas del cliente: o el JSON del formulario ({ "nombre": "El Mirador", "carta_envio": "…", … }, el que llega
//                    al panel interno) o el texto que copia el formulario ("- ¿Cómo se llama tu local?: El Mirador"), guardado en un archivo.
//   --id             nombre corto del negocio en la base (por defecto sale del nombre del local)
//   --url            dirección definitiva del sitio (https://…): se usa en los datos para buscadores y compartir; sin ella la página no se indexa
//   --demo           para demostraciones: muestra los PIN en la pantalla de entrada y deja la cinta de ejemplo
//
// Hace, en orden:
//   1. Copia la plantilla (nuevo-restaurante.mjs) y la deja con el nombre del local.
//   2. Arma la carta con lo que escribió el cliente: categorías, platos, precios, tiempos, opciones, favoritos, comunas y envíos,
//      horarios, mesas, mínimo de delivery, servicios que atiende y color. NO inventa nada: lo que falta queda en la lista de pendientes.
//   3. Quita las fotos de ejemplo (en un cliente real van las suyas, que sube él desde el panel).
//   4. Escribe el SQL de accesos (jefe, cocina, reparto y el personal que nombró) y un guion de prueba con esos accesos,
//      en web/herramientas/restaurantes/ (carpeta fuera de git: tiene los PIN).
// Después, a mano: ejecutar el SQL en Supabase, cargar la carta (cargar-carta-base.mjs), probar y publicar. La skill crear-menu-digital lo explica.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORM_MENU } from '../../respaldo-skills/crear-menu-digital/plantilla/formulario/preguntas-menu.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const EJ = join(aqui, '../propuesta/ejemplos');
const args = process.argv.slice(2);
const archivo = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--id' && args[i - 1] !== '--url');
const opt = (k) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : undefined; };
if (!archivo || !existsSync(archivo)) { console.error('Uso: node web/herramientas/aplicar-formulario.mjs respuestas.json [--id mirador] [--demo]'); process.exit(1); }

// ---------- 1. Leer las respuestas (JSON del formulario o el texto que copia) ----------
const preguntas = FORM_MENU.flatMap((s) => s.p);
function leer(txt) {
  try { const j = JSON.parse(txt); if (j && typeof j === 'object') return j.respuestas || j; } catch { /* es texto */ }
  const r = {}, ordenadas = [...preguntas].sort((x, y) => y.q.length - x.q.length);   // las preguntas pueden llevar ":" dentro; se reconocen por su texto completo
  let ultimo = null;
  for (const linea of txt.replace(/\r/g, '').split('\n')) {
    const p = linea.startsWith('- ') ? ordenadas.find((q) => linea.startsWith('- ' + q.q + ': ')) : null;
    if (p) { ultimo = p; r[p.id] = linea.slice(('- ' + p.q + ': ').length).trim(); }
    else if (ultimo && linea.trim() && !linea.startsWith('#') && !linea.startsWith('- ')) r[ultimo.id] += '\n' + linea.trim();   // respuestas largas con varias líneas
    else if (linea.startsWith('#') || linea.startsWith('- ')) ultimo = null;
  }
  for (const p of preguntas) if (p.t === 'varios' && typeof r[p.id] === 'string') r[p.id] = r[p.id].split(/,\s*/);
  return r;
}
const R = leer(readFileSync(archivo, 'utf8'));
const txt = (k) => String(Array.isArray(R[k]) ? R[k].join(', ') : R[k] || '').trim();
const lista = (k) => (Array.isArray(R[k]) ? R[k] : txt(k) ? [txt(k)] : []);
const lineas = (k) => txt(k).split(/\n|;(?=\s*[A-ZÁÉÍÓÚÑ])/).map((l) => l.replace(/^[\s•*\-–—\d.)]+(?=\D)/, '').trim()).filter(Boolean);
const pendientes = [];
const falta = (m) => pendientes.push(m);

const nombre = txt('nombre');
if (!nombre) { console.error('Faltan las respuestas del formulario: no trae el nombre del local ("nombre").'); process.exit(1); }
const sinTildes = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = (s, max = 24) => sinTildes(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, max);
const id = opt('id') || slug(nombre, 20);
const demo = args.includes('--demo');

// ---------- 2. La plantilla ----------
const urlFinal = opt('url');
console.log(execFileSync('node', [join(aqui, 'nuevo-restaurante.mjs'), '--id', id, '--nombre', nombre, ...(demo ? ['--demo'] : []), ...(urlFinal ? ['--url', urlFinal] : []), ...(txt('telefono') ? ['--telefono', txt('telefono')] : [])], { encoding: 'utf8' }).trim());
if (!demo && !urlFinal) falta('Dirección definitiva del sitio (--url): sin ella la página no se indexa ni trae datos para compartir; volver a generar o editar index.html cuando exista el dominio.');
if (!txt('telefono')) falta('Teléfono o correo del local para la página de privacidad (queda como [TELÉFONO O CORREO DEL LOCAL]).');
falta('Política de privacidad: revisar con el negocio (responsable de los datos, plazo de conservación) antes de publicar.');
const dir = join(EJ, id);
const cartaF = join(dir, 'carta-base.json');
const carta = JSON.parse(readFileSync(cartaF, 'utf8'));

// ---------- 3. Datos del local ----------
const ACENTOS = [[/caf[eé]|dorado/i, '#cf9b4a'], [/cobre|crema|naranj|terracota/i, '#d9663b'], [/vino|granate|rojo|burdeo/i, '#b8484f'], [/verde|natural|oliva/i, '#7a9a52'], [/azul|mar/i, '#4f8aa6'], [/lila|morad|violeta/i, '#9a7bc2']];
const col = txt('colores') + ' ' + txt('colores_logo');
carta.marca.nombre = nombre;
carta.marca.lema = txt('frase') || '';
if (!txt('frase')) falta('Lema del local (pregunta "frase"): no lo escribió; la portada queda sin frase.');
carta.marca.sobre = txt('nombre_carta') || 'Carta';
carta.marca.acento = (ACENTOS.find(([re]) => re.test(col)) || [null, '#cf9b4a'])[1];
if (/logo|propónganme|no s[eé]/i.test(col) || !col.trim()) falta('Color principal: elegir con el cliente (el panel ofrece 6) y subir su logo desde Panel › Negocio y equipo.');
delete carta.marca.logo;
const zona = txt('zona');
carta.negocio = { direccion: [txt('direccion'), zona].filter(Boolean).join(', '), horarios: txt('horario').split(/\n|;/).map((x) => x.trim()).filter(Boolean).slice(0, 6) };
if (!txt('direccion')) falta('Dirección del local.');
if (!carta.negocio.horarios.length) falta('Horarios de atención.');
const mesas = parseInt(txt('mesas').replace(/\D+/g, ' ').trim().split(' ')[0], 10);
carta.config.mesas = mesas > 0 && mesas < 100 ? mesas : 10;
if (!(mesas > 0)) falta('Número de mesas (se dejó en 10).');

// Servicios que atiende
const serv = lista('servicios').join(' ').toLowerCase();
const servicios = [/mesa/.test(serv) && 'mesa', /retir/.test(serv) && 'retiro', /delivery|domicilio/.test(serv) && 'delivery'].filter(Boolean);
if (!servicios.length) { falta('Servicios: no eligió cómo recibir pedidos. Si solo quiere mostrar la carta, usar el menú simple (generar-menu.mjs) y no este sistema.'); servicios.push('mesa', 'retiro'); }
carta.config.servicios = servicios;
carta.config.pagoEnLinea = false;   // un local real no ofrece el pago de prueba; se activa aparte con su cuenta de pago

// Comunas y envío: solo las de coordenadas conocidas (el mapa y el cálculo de ruta las necesitan)
const CONOCIDAS = carta.config.comunas;   // las 10 del Gran Concepción de la plantilla
const comunas = {};
if (servicios.includes('delivery')) {
  for (const l of lineas('comunas_envio')) {
    const m = /^(.+?)\s*[:\-–—$ ]\s*\$?\s*([\d.]+)\s*$/.exec(l);
    if (!m) { falta(`Comuna de envío ilegible: "${l}" (debe ser "Comuna: monto").`); continue; }
    const k = Object.keys(CONOCIDAS).find((c) => sinTildes(c).toLowerCase() === sinTildes(m[1]).toLowerCase().trim());
    if (!k) { falta(`Comuna "${m[1].trim()}": falta su ubicación en el mapa (la plantilla trae solo ${Object.keys(CONOCIDAS).join(', ')}). Agregarla a mano en carta-base.json (envio, lat, lng).`); continue; }
    comunas[k] = { ...CONOCIDAS[k], envio: parseInt(m[2].replace(/\./g, ''), 10) };
  }
  if (!Object.keys(comunas).length) falta('Delivery sin comunas válidas: no se podrá pedir delivery hasta cargarlas (Panel › Negocio y equipo no agrega comunas nuevas).');
}
carta.config.comunas = comunas;
const minimo = parseInt(txt('minimo_delivery').replace(/\./g, '').replace(/\D+/g, ' ').trim().split(' ')[0], 10);
carta.config.minimoDelivery = minimo >= 0 ? minimo : (/sin/i.test(txt('minimo_delivery')) ? 0 : 8000);
if (servicios.includes('delivery') && !(minimo >= 0) && !/sin/i.test(txt('minimo_delivery'))) falta('Pedido mínimo del delivery (se dejó en $8.000).');
// Ubicación del local: el centro de su comuna, hasta ubicarlo bien
const base = Object.keys(CONOCIDAS).find((c) => sinTildes(c).toLowerCase() === sinTildes(zona).toLowerCase());
carta.config.local = base ? { lat: CONOCIDAS[base].lat, lng: CONOCIDAS[base].lng } : carta.config.local;
falta(`Ubicación exacta del local en el mapa (config.local de carta-base.json): hoy es el centro de ${base || 'la plantilla (Concepción)'}; ajustarla para que la ruta y los kilómetros del delivery sean correctos.`);

// ---------- 4. La carta ----------
const seleccionadas = lista('categorias').filter((c) => c && c !== 'Otra').map((c) => sinTildes(c).toLowerCase());
const precioFin = /[\s:–—-]*\$?\s*(\d{1,3}(?:[.,]\d{3})+|\d{3,6})\s*(?:clp|pesos)?\s*\.?\s*$/i;
const categorias = [];
let actual = null;
const bonito = (t) => (t === t.toUpperCase() ? t.charAt(0) + t.slice(1).toLowerCase() : t);   // ENTRADAS → Entradas
const nuevaCat = (nom) => { actual = { id: slug(nom, 20) || 'carta', nombre: bonito(nom.replace(/[:.]+$/, '').trim()), sub: '', platos: [] }; categorias.push(actual); };
const idsPlatos = new Set();
for (const crudo of txt('carta_envio').replace(/\r/g, '').split('\n')) {
  const l = crudo.replace(/^[\s•*·]+/, '').trim();
  if (!l) continue;
  const m = precioFin.exec(l);
  if (m) {
    const resto = l.slice(0, m.index).replace(/[\s.…:–—-]+$/, '');
    const corte = /\s[-–—:]\s|:\s|\s\(|,\s/.exec(resto);
    let nom = (corte ? resto.slice(0, corte.index) : resto).replace(/[\s.:]+$/, '').trim();
    let desc = corte ? resto.slice(corte.index + corte[0].length - (corte[0].trim() === '(' ? 1 : 0)).replace(/^[-–—:,\s]+/, '').replace(/\)$/, '').trim() : '';
    if (!nom) { falta(`Línea de la carta sin nombre de plato: "${l}".`); continue; }
    if (!actual) nuevaCat(seleccionadas.length === 1 ? lista('categorias')[0] : 'Carta');
    let pid = slug(nom) || 'plato'; for (let n = 2; idsPlatos.has(pid); n++) pid = slug(nom, 20) + '-' + n; idsPlatos.add(pid);
    const bebida = /bebida|jugo|caf[eé]|t[eé]\b|cerveza|vino|c[oó]ctel|limonada|bebestible/i.test(actual.nombre + ' ' + nom), postre = /postre|dulce|torta|helado/i.test(actual.nombre);
    actual.platos.push({ id: pid, nombre: nom.slice(0, 50), descripcion: desc.slice(0, 160), precio: parseInt(m[1].replace(/[.,]/g, ''), 10), foto: '', prep: bebida ? 4 : postre ? 6 : 15, etiquetas: [], destacado: false, disponible: true, activo: true });
  } else if (l.length <= 40 && (/[:：]$/.test(l) || l === l.toUpperCase() || seleccionadas.some((c) => sinTildes(l).toLowerCase().replace(/[:.]+$/, '') === c || sinTildes(l).toLowerCase().startsWith(c)))) nuevaCat(l);
  else if (actual && actual.platos.length && l.length > 25 && !actual.platos.at(-1).descripcion) actual.platos.at(-1).descripcion = l.slice(0, 160);   // la línea de abajo es la descripción del plato anterior
  else falta(`Línea de la carta que no se entendió (sin precio): "${l}".`);
}
const platos = categorias.flatMap((c) => c.platos);
if (!platos.length) { console.error('No se pudo leer ningún plato con precio en "carta_envio". Revisa que cada línea termine en el precio.'); process.exit(1); }
carta.categorias = categorias.filter((c) => c.platos.length);
const buscar = (txtNombre) => { const s = slug(txtNombre, 60); return platos.find((p) => slug(p.nombre, 60) === s) || platos.find((p) => slug(p.nombre, 60).startsWith(s) || s.startsWith(slug(p.nombre, 60))) || platos.find((p) => sinTildes(p.nombre).toLowerCase().includes(sinTildes(txtNombre).toLowerCase())); };

// Platos estrella (favoritos de la casa)
for (const e of txt('estrella').split(/\n|,|;| y (?=[A-ZÁÉÍÓÚÑ])/).map((x) => x.replace(/^[\s\-–•*\d.)]+/, '').trim()).filter(Boolean)) {
  const p = buscar(e); if (p) p.destacado = true; else falta(`Plato estrella "${e}": no coincide con ningún plato de la carta.`);
}
if (!platos.some((p) => p.destacado)) falta('Sin platos estrella reconocidos: "Favoritos de la casa" queda vacío.');
// Tiempos de preparación
for (const l of lineas('tiempos')) {
  const m = /^(.+?)\s*[:\-–—]\s*(\d{1,2})\s*(?:min\w*)?\s*$/i.exec(l); const p = m && buscar(m[1]);
  if (p) p.prep = Math.min(90, Math.max(1, +m[2])); else if (l) falta(`Tiempo de preparación no entendido: "${l}".`);
}
if (!txt('tiempos')) falta('Tiempos de preparación: se usaron tiempos típicos (bebidas 4 min, postres 6, platos 15). Ajustar plato por plato en el panel.');
// Opciones (tamaño, término, extras)
for (const l of lineas('opciones_platos')) {
  const i = l.indexOf(':'); const p = i > 0 && buscar(l.slice(0, i)); if (!p) { falta(`Opciones de un plato que no está en la carta: "${l.slice(0, 40)}".`); continue; }
  p.grupos = [];
  for (const g of l.slice(i + 1).split(';').map((x) => x.trim()).filter(Boolean)) {
    const j = g.indexOf(':'); if (j < 1) { falta(`Opciones de "${p.nombre}" mal escritas ("Grupo: opción, opción"): "${g.slice(0, 40)}".`); continue; }
    const cab = g.slice(0, j).trim(), mod = /\(([^)]*)\)/.exec(cab)?.[1] || '', nomG = cab.replace(/\([^)]*\)/, '').trim(), hasta = /hasta\s*(\d+)/i.exec(mod);
    const opciones = g.slice(j + 1).split(',').map((x) => x.trim()).filter(Boolean).map((o) => { const mm = /^(.*?)\s*\+\s*\$?\s*([\d.]+)\s*$/.exec(o); return { id: slug(mm ? mm[1] : o, 20) || 'op', nombre: (mm ? mm[1] : o).trim(), extra: mm ? parseInt(mm[2].replace(/\./g, ''), 10) : 0 }; });
    if (opciones.length) p.grupos.push({ id: slug(nomG, 20) || 'grupo', nombre: nomG, tipo: hasta ? 'varios' : 'uno', max: hasta ? +hasta[1] : 1, obligatorio: /obligator/i.test(mod), opciones });
  }
  if (!p.grupos.length) delete p.grupos;
}
if (lista('etiquetas').length) falta('Etiquetas dietéticas que pidió (' + lista('etiquetas').join(', ') + '): el formulario no dice qué plato lleva cada una. NO se pusieron; cargarlas en el panel solo con lo que el cliente confirme.');
if (txt('alergenos')) falta('Alérgenos que informó ("' + txt('alergenos').slice(0, 80) + '"): no se pusieron; confirmar plato por plato antes de publicarlos.');
if (/pago en l[ií]nea|quiero/i.test(txt('pago_online')) && /l[ií]nea/i.test(txt('pago_online'))) falta('Quiere pago en línea: se activa aparte con su propia cuenta de Mercado Pago (la comisión la paga el local). Hoy todo pedido queda "por pagar" en caja o al recibir.');
if (/ingl/i.test(txt('idioma'))) falta('Pidió carta en inglés: la plantilla es solo en español.');
falta('Fotos de los platos: la carta parte con una imagen genérica. El dueño sube las suyas desde Panel › Carta (o las subimos nosotros en la visita).');

// ---------- 5. Guardar, sin fotos de ejemplo ----------
carta.version = 2; carta.publicada = Date.now();
writeFileSync(cartaF, JSON.stringify(carta, null, 1));
const fotos = join(dir, 'fotos');
if (!demo && existsSync(fotos)) for (const f of readdirSync(fotos)) rmSync(join(fotos, f));

// ---------- 6. Accesos (SQL) y guion de prueba ----------
const out = join(aqui, 'restaurantes');
const sqlF = join(out, id + '-instalar.sql');
let sql = readFileSync(sqlF, 'utf8');
const cfg = readFileSync(join(dir, 'restaurante.config.js'), 'utf8');
const pinDe = (rol) => new RegExp(`'${id}', '${rol}'.*?'(\\d{6})'`).exec(sql)?.[1];
const pins = { dueno: pinDe('dueno'), cocina: pinDe('cocina'), reparto: pinDe('reparto') };
const usados = new Set(Object.values(pins));
const personas = [];
for (const l of lineas('equipo')) {
  const m = /^(.+?)\s*[-–—:,]\s*(cocin\w*|reparto|repartidor\w*|delivery)\s*$/i.exec(l);
  if (/^(.+?)\s*[-–—:,]\s*(garz[oó]n|mesero|mesera)\s*$/i.test(l)) { falta(`Garzón "${l}": el rol de garzón todavía no existe en el sistema (hoy solo cocina, reparto y jefe). Anotado para cuando se construya el modo garzón; mientras tanto no recibe código.`); continue; }
  if (!m) { falta(`Persona del equipo no entendida: "${l}" (debe ser "Nombre - cocina" o "Nombre - reparto").`); continue; }
  let pin; do { pin = String(100000 + Math.floor(Math.random() * 899999)); } while (usados.has(pin)); usados.add(pin);
  const rol = /cocin/i.test(m[2]) ? 'cocina' : 'reparto';
  personas.push({ nombre: m[1].trim().slice(0, 30), rol, pin });
}
if (personas.length) sql += `-- Personal que nombró el cliente (cada uno entra con su PIN a lo suyo)\ninsert into demo.roles (negocio, rol, nombre, pin, cols) values\n${personas.map((p) => `  ('${id}', '${p.rol}', '${p.nombre.replace(/'/g, "''")}', '${p.pin}', '{pedidos}')`).join(',\n')}\non conflict do nothing;\n`;
writeFileSync(sqlF, sql);

const primero = platos.find((p) => !p.grupos) || platos[0];
writeFileSync(join(out, id + '-prueba.js'), `// Prueba de humo de ${nombre} (negocio ${id}): corre sobre su página de carta, DESPUÉS de ejecutar el SQL y cargar la carta.
// Uso: node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/${id}/ --anchos 1440 --probar web/herramientas/restaurantes/${id}-prueba.js
const r = {}; const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const N = '${id}', DUENO = '${pins.dueno}', COCINA = '${pins.cocina}';
await dormir(4000);
ok('1 la carta carga con sus platos y precios', document.querySelectorAll('article.plato').length === ${platos.length}, document.querySelectorAll('article.plato').length);
ok('2 la carta ya está publicada en la base (el servidor valida los precios)', ((await Nube.leer(N, 'carta', { ids: ['carta'] })).mios || []).some((f) => f.id === 'carta'));
ok('3 cada PIN entra a lo suyo', (await Nube.rol(N, DUENO)) === 'dueno' && (await Nube.rol(N, COCINA)) === 'cocina' && (await Nube.rol(N, '000000')) === null);
localStorage.setItem('fogon-sesion-' + N, Nube.idNuevo());
const mal = await Pedidos.crear({ tipo: 'retiro', cliente: { nombre: 'zz-prueba', telefono: '+56912345678' }, items: [{ id: '${primero.id}', nombre: 'x', precio: 1, cant: 1 }], pago: { metodo: 'caja', pagado: false } }).then(() => 'aceptó', (e) => e.message);
ok('4 un precio manipulado se rechaza', mal !== 'aceptó', mal);
localStorage.setItem('fogon-sesion-' + N, Nube.idNuevo());
const p = await Pedidos.crear({ tipo: 'retiro', cliente: { nombre: 'zz-prueba', telefono: '+56912345678' }, items: [{ id: '${primero.id}', nombre: '${primero.nombre.replace(/'/g, "\\'")}', precio: ${primero.precio}, cant: 1, prep: ${primero.prep} }], pago: { metodo: 'caja', pagado: false } });
ok('5 un pedido real nace "recibido"', p.estado === 'recibido' && p.total === ${primero.precio}, JSON.stringify([p.estado, p.total]));
Nube.pin(N, COCINA); Pedidos.entrarEquipo(); await dormir(500);
Pedidos.aceptar(p.id, 15); await Pedidos.guardado();
ok('6 la cocina lo acepta y el cliente lo ve', (await Nube.leer(N, 'pedidos', { ids: [p.id] })).mios[0].data.estado === 'aceptado');
const lim = await Nube.borrar(N, 'pedidos', DUENO, { filtro: { cliente: { nombre: 'zz-prueba' } } });
ok('7 limpieza de la prueba', lim.ok === true, JSON.stringify(lim));
Nube.pin(N, null);
return r;
`);
// Cómo trabaja el local hoy (bloque "Cómo trabajan hoy" del formulario): no cambia la carta, pero define qué se le ofrece. Se deja escrito para no perderlo.
const OPERACION = [['hoy_toma_pedido', 'Cómo se toma el pedido hoy'], ['pedido_llega_cocina', 'Cómo llega a la cocina'], ['quien_cocina', 'Quién maneja la cocina'], ['garzones_turno', 'Garzones por turno'], ['horas_punta', 'Cuándo se llena'], ['dolor', 'Lo que más cuesta en hora punta'], ['quien_pide', 'Cómo prefiere que se pida'], ['cliente_ve', 'Que el cliente vea su pedido en vivo'], ['cocina_modo', 'Cómo manejar la cocina'], ['dispositivos', 'Aparatos disponibles'], ['wifi', 'WiFi o señal'], ['cobro', 'Cómo cobran hoy'], ['reservas_hoy', 'Reservas de mesa'], ['reservas_como', 'Cómo toman las reservas'], ['google_resenas', 'Invitar a reseñar en Google'], ['maps_link', 'Enlace en Google Maps']];
const operacion = OPERACION.filter(([k]) => txt(k)).map(([k, t]) => `- ${t}: ${txt(k).replace(/\|[^,\n]*/g, '')}`).join('\n');
if (/garz[oó]n/i.test(txt('quien_pide') + ' ' + txt('cocina_modo') + ' ' + lista('servicios').join(' '))) pendientes.push('Pidió que el garzón anote los pedidos o maneje la cocina: ese modo (rol garzón, "Tomar pedido" y "Mi mesa" para el cliente) todavía no está construido. Ver memoria/cliente-la-joya-del-sur.md.');
if (/^s[ií]/i.test(txt('google_resenas'))) pendientes.push('Quiere invitar a reseñar en Google: falta el enlace de reseñas (identificador de lugar de su ficha). La reseña la publica el cliente; nunca se sube desde nuestro sistema.');
writeFileSync(join(out, id + '-pendientes.md'), `# Pendientes de ${nombre} (${id})\n\n${pendientes.map((p) => '- [ ] ' + p).join('\n')}\n\n## Cómo trabaja el local hoy (respuestas del formulario)\n\n${operacion || '(no respondió ese bloque)'}\n\n## Accesos (privados: entregar por un canal seguro)\n\n- Jefe (dueño): \`${pins.dueno}\`\n- Cocina: \`${pins.cocina}\`\n- Reparto: \`${pins.reparto}\`\n${personas.map((p) => `- ${p.nombre} (${p.rol}): \`${p.pin}\``).join('\n')}\n`);

console.log(`\n${nombre} (${id}): ${carta.categorias.length} categorías, ${platos.length} platos, servicios: ${servicios.join(', ')}, ${Object.keys(comunas).length} comunas con envío.`);
console.log(`Pendientes (${pendientes.length}) en web/herramientas/restaurantes/${id}-pendientes.md:`); pendientes.forEach((p) => console.log('  · ' + p));
console.log(`\nSiguiente:\n  1. Ejecutar web/herramientas/restaurantes/${id}-instalar.sql en Supabase (proyecto biodigital-demos).\n  2. node web/herramientas/cargar-carta-base.mjs ${id} ${pins.dueno} ${id}\n  3. node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/${id}/ --anchos 1440 --probar web/herramientas/restaurantes/${id}-prueba.js\n  4. Entrar a .../ejemplos/${id}/panel/ con el PIN del jefe, subir fotos y logo, y publicar.`);
