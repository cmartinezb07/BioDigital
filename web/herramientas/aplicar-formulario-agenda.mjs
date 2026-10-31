// De las respuestas del formulario del cliente a un sistema de reservas funcionando (carpeta lista, agenda, accesos y prueba), en un solo paso.
//
// Uso:  node web/herramientas/aplicar-formulario-agenda.mjs respuestas.json [--id cabanas-sol] [--demo] [--url https://…] [--simple]
//   --simple         arma la RESERVA SIMPLE ($27.990, sin base de datos): lo ocupado sale del Google Calendar del dueño, la solicitud llega por
//                    WhatsApp con un enlace para agendar y confirmar en dos toques, y precios y servicios se editan en su planilla de Google.
//                    Solo para citas y alojamiento. Deja la carpeta lista, las plantillas CSV de la planilla y los pendientes (sin SQL ni PIN).
//   respuestas.json  las respuestas del cliente: o el JSON del formulario ({ "nombre": "Cabañas del Sol", "catalogo": "…", … }, el que llega
//                    al panel interno) o el texto que copia el formulario ("- ¿Cómo se llama tu negocio?: Cabañas del Sol"), guardado en un archivo.
//   --id             nombre corto del negocio en la base (por defecto sale del nombre del negocio)
//   --url            dirección definitiva del sitio (https://…): sin ella la página no se indexa
//   --demo           para demostraciones: muestra los PIN en la pantalla de entrada y deja el pago "de mentira"
//
// Hace, en orden:
//   1. Lee el formulario y arma la agenda del negocio: catálogo (alojamientos, tours, servicios, profesionales o espacios) con precios, capacidad y duración,
//      horarios, temporadas, depósito, política de cancelación, descuentos, códigos, avisos, marca y equipo. NO inventa nada: lo que falta o no se
//      entiende queda en la lista de pendientes (y los valores de partida que hubo que poner se avisan ahí).
//   2. Copia la plantilla (nuevo-agenda.mjs) con esa agenda y el nombre del negocio, y deja la carpeta sin nada de "demostración".
//   3. Escribe el SQL de accesos (jefe, recepción y el personal que nombró) y una prueba de humo, en web/herramientas/agendas/ (fuera de git: tiene los PIN).
// Después, a mano: ejecutar el SQL en Supabase, publicar la agenda (cargar-agendas.mjs), probar y publicar. La skill crear-sistemas-agendas lo explica.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORM_AGENDA } from '../../respaldo-skills/crear-sistemas-agendas/plantilla/formulario/preguntas-agenda.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const EJ = join(aqui, '../propuesta/ejemplos');
const args = process.argv.slice(2);
const archivo = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--id' && args[i - 1] !== '--url');
const opt = (k) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : undefined; };
if (!archivo || !existsSync(archivo)) { console.error('Uso: node web/herramientas/aplicar-formulario-agenda.mjs respuestas.json [--id cabanas-sol] [--demo] [--url https://…]'); process.exit(1); }

// ---------- 1. Leer las respuestas (JSON del formulario o el texto que copia) ----------
const preguntas = FORM_AGENDA.flatMap((s) => s.p);
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
  for (const p of preguntas) if (p.t === 'varios' && typeof r[p.id] === 'string') r[p.id] = r[p.id].split(/,\s*(?=[A-ZÁÉÍÓÚÑ])/);
  return r;
}
const R = leer(readFileSync(archivo, 'utf8'));
const txt = (k) => String(Array.isArray(R[k]) ? R[k].join(', ') : R[k] || '').trim();
const lista = (k) => (Array.isArray(R[k]) ? R[k] : txt(k) ? [txt(k)] : []);
const lineas = (k) => txt(k).split(/\n|;(?=\s*[A-ZÁÉÍÓÚÑ$])/).map((l) => l.replace(/^[\s•*\-–—]+/, '').replace(/^\d+[.)]\s+/, '').trim()).filter(Boolean);
const pendientes = [], falta = (m) => pendientes.push(m);

const nombre = txt('nombre');
if (!nombre) { console.error('Faltan las respuestas del formulario: no trae el nombre del negocio ("nombre").'); process.exit(1); }
const sinTildes = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const bajo = (s) => sinTildes(s).toLowerCase();
const slug = (s, max = 24) => bajo(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, max);
const id = opt('id') || slug(nombre, 20);
const demo = args.includes('--demo'), urlFinal = opt('url'), simple = args.includes('--simple');
const pad = (n) => String(n).padStart(2, '0');
const unico = (base, usados) => { let x = base || 'item', n = 2; while (usados.has(x)) x = (base || 'item').slice(0, 26) + '-' + n++; usados.add(x); return x; };

// ---------- Utilidades de lectura ----------
const NUM = (s) => parseInt(String(s).replace(/\./g, '').replace(/,/g, ''), 10);
const precioDe = (l) => { let m = /\$\s*([\d.]+)/.exec(l); if (m) return NUM(m[1]); m = /([\d.]{4,})\s*(?:clp|pesos)/i.exec(l); if (m) return NUM(m[1]); m = /(\d+)\s*mil\b/i.exec(l); return m ? +m[1] * 1000 : null; };
const SEG = /\s+[-–—|]\s+|\s*\|\s*|:\s*(?=\$)/;
const esDato = (s) => /\$|\d\s*(?:personas?|pers\b|hu[eé]spedes|pax|cupos?|plazas?|unidades?|iguales|horas?|hrs?|h\b|min)|salidas?|m[ií]nimo|m[aá]ximo|hasta\s*\d|\d{1,2}[:h]\d{2}|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bados?|domingos?|todos los d[ií]as|por (?:noche|persona|hora)/i.test(s);
const nombreYDesc = (l) => {
  const seg = l.split(SEG).map((x) => x.trim()).filter(Boolean);
  const nom = (seg[0] || '').replace(/[:.\s]+$/, '').slice(0, 50);
  const desc = seg.slice(1).filter((x) => !esDato(x)).join('. ').slice(0, 160);
  return [nom, desc];
};
const DIAS_N = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6, domingo: 0 };
const SEQ = [1, 2, 3, 4, 5, 6, 0], KEY = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const NOM_D = '(lunes|martes|miercoles|jueves|viernes|sabado|domingo)s?';
function parseDias(texto) {
  let t = bajo(texto); const set = new Set();
  if (/todos los dias|diario|cada dia|toda la semana|lunes a domingo/.test(t)) return [0, 1, 2, 3, 4, 5, 6];
  t = t.replace(new RegExp(NOM_D + '\\s*(?:a|hasta|al|-|–)\\s*' + NOM_D, 'g'), (_, a, b) => { let i = SEQ.indexOf(DIAS_N[a]); const f = SEQ.indexOf(DIAS_N[b]); for (let k = 0; k < 8; k++) { set.add(SEQ[i % 7]); if (i % 7 === f) break; i++; } return ' '; });
  if (/fines? de semana|finde/.test(t)) { set.add(6); set.add(0); }
  if (/dias habiles|dias de semana|entre semana/.test(t)) [1, 2, 3, 4, 5].forEach((d) => set.add(d));
  for (const m of t.matchAll(new RegExp(NOM_D, 'g'))) set.add(DIAS_N[m[1]]);
  return [...set].sort((a, b) => SEQ.indexOf(a) - SEQ.indexOf(b));
}
const hhmm = (h, m) => pad(Math.min(23, +h)) + ':' + pad(Math.min(59, +(m || 0)));
function tramos(linea) {
  const out = []; let resto = linea;
  resto = resto.replace(/(\d{1,2})[:h.](\d{2})\s*(?:-|–|—|a|hasta)\s*(\d{1,2})[:h.](\d{2})/gi, (_, a, b, c, d) => { out.push([hhmm(a, b), hhmm(c, d)]); return ' '; });
  resto = resto.replace(/(\d{1,2})\s*(?:h|hrs?)?\s*(?:-|–|—|a|hasta)\s*(\d{1,2})\s*(?:h|hrs?|horas)\b/gi, (_, a, c) => { out.push([hhmm(a, 0), hhmm(c, 0)]); return ' '; });
  return { tramos: out.filter(([a, b]) => b > a), resto };
}
function horario(texto) {
  const h = { dom: [], lun: [], mar: [], mie: [], jue: [], vie: [], sab: [] }; let n = 0;
  for (const l of texto.split(/\n|;/).map((x) => x.trim()).filter(Boolean)) {
    const { tramos: tr, resto } = tramos(l); const dias = parseDias(resto);
    if (!tr.length || !dias.length) { falta(`Horario no entendido: "${l.slice(0, 60)}" (debe ser "Lunes a viernes 08:30-19:00").`); continue; }
    for (const d of dias) { h[KEY[d]] = [...h[KEY[d]], ...tr]; n++; }
  }
  return n ? h : null;
}
const MESES = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, set: 9, oct: 10, nov: 11, dic: 12 };
function fechasMD(l) {
  const t = bajo(l), out = [];
  for (const m of t.matchAll(/(\d{1,2})\s*(?:de\s*)?(ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic)\w*/g)) out.push([m.index, pad(MESES[m[2]]) + '-' + pad(+m[1])]);
  for (const m of t.matchAll(/\b(\d{1,2})[\/-](\d{1,2})\b/g)) if (+m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) out.push([m.index, pad(+m[2]) + '-' + pad(+m[1])]);
  return out.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}
const pct = (l) => { const m = /([+\-−]?)\s*(\d+(?:[.,]\d+)?)\s*%/.exec(l); return m ? { signo: m[1] === '-' || m[1] === '−' ? -1 : 1, v: parseFloat(m[2].replace(',', '.')) } : null; };
const horasDe = (s) => { s = bajo(s); const d = /(\d+)\s*(?:dias?|d\b)/.exec(s), h = /(\d+)\s*(?:horas?|hrs?|h\b)/.exec(s), m = /(\d+)\s*(?:semanas?)/.exec(s), me = /(\d+)\s*mes/.exec(s), a = /(\d+)\s*a(?:n|ñ)o/.exec(s); return d ? +d[1] * 24 : h ? +h[1] : m ? +m[1] * 168 : me ? +me[1] * 720 : a ? +a[1] * 8760 : null; };

// ---------- 2. El tipo de agenda ----------
const tipo = bajo(txt('tipo_negocio'));
const modo = /alojam/.test(tipo) ? 'noches' : /tour|experienc|clase/.test(tipo) ? 'cupos' : /cita|profesional/.test(tipo) ? 'horas' : /arriendo|espacio|equipo/.test(tipo) ? 'bloques' : null;
if (!modo) { console.error('No se entendió qué reservan los clientes ("tipo_negocio"): debe ser alojamiento, tours/experiencias, citas con profesionales o arriendo de espacios.'); process.exit(1); }
const agendaId = { noches: 'alojamiento', cupos: 'tours', horas: 'citas', bloques: 'espacios' }[modo];
const zona = txt('zona');
const belleza = /belleza|sal[oó]n|peluquer|est[eé]tica|barber|u[ñn]as|spa/.test(bajo(txt('rubro') + ' ' + nombre));
const cfg = {
  id: agendaId, nombre, rubro: txt('rubro') || { noches: 'Alojamiento', cupos: 'Tours y experiencias', horas: 'Citas', bloques: 'Arriendo de espacios' }[modo], modo,
  icono: { noches: 'cabana', cupos: 'tour', horas: belleza ? 'salon' : 'medico', bloques: 'espacio' }[modo],
  comuna: zona, direccion: txt('direccion') || zona, recursos: [], servicios: [], temporadas: [], factorFinde: 1,
};
if (!zona) falta('Comuna del negocio.');
if (!txt('direccion')) falta('Dirección o punto de encuentro (se usó la comuna).');
if (!txt('rubro')) falta(`Cómo describe su negocio ("rubro"): quedó "${cfg.rubro}".`);
const ini = nombre.split(/\s+/).filter((w) => !/^(de|del|la|las|los|el|y|e)$/i.test(w));
cfg.sigla = ((ini[0] || nombre)[0] + ((ini[1] || ini[0] || nombre)[ini[1] ? 0 : 1] || '')).toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ0-9]/g, '').slice(0, 2) || nombre.slice(0, 2).toUpperCase();
const PALETA = [[/verde|natural|oliva|bosque/, '#2f6f4e'], [/terracota|naranj|cobre|rojizo|rojo|ladrillo/, '#c2562b'], [/azul|mar|celeste|turquesa/, '#1d6fb8'], [/morad|lila|violeta|purpura/, '#5b4bb7'], [/rosa|fucsia|magenta|frambuesa/, '#b8437a'], [/cafe|dorado|ocre|amarill|mostaza|tierra/, '#a16207']];
const col = bajo(txt('colores'));
cfg.color = (PALETA.find(([re]) => re.test(col)) || [null, '#1d6fb8'])[1];
if (!PALETA.some(([re]) => re.test(col))) falta('Color principal: elegir con el cliente (el panel ofrece 6, en Negocio y equipo) y subir su logo si tiene.');
if (/s[ií]|tengo|mand/.test(bajo(txt('logo'))) && !/no tengo|^no\b/.test(bajo(txt('logo')))) falta('Logo del cliente: recibirlo y ponerlo (hoy el sistema muestra sus iniciales sobre su color).');
if (txt('frase')) cfg.lema = txt('frase').slice(0, 80);

// ---------- 3. Catálogo ----------
const usados = new Set(), usadosS = new Set();
const capMax = parseInt(txt('personas_max'), 10) || null;
const lineasCat = lineas('catalogo');
for (const l of lineasCat) {
  const [nom, desc] = nombreYDesc(l), precio = precioDe(l);
  if (!nom) { falta(`Línea del catálogo sin nombre: "${l.slice(0, 50)}".`); continue; }
  if (precio == null) { falta(`"${nom}": sin precio; no se cargó. Pedírselo al cliente.`); continue; }
  const cap = (/(\d+)\s*(?:cupos?|plazas?|lugares)/i.exec(l) || /(?:hasta\s*)?(\d+)\s*(?:personas?|pers\b|hu[eé]spedes|pax)/i.exec(l) || [])[1];
  const unid = (/(\d+)\s*(?:unidades?|iguales|caba(?:ñ|n)as?|habitaciones?|piezas?|departamentos?|salas?|boxes?)/i.exec(l) || [])[1];
  const dur = (() => { const h = /(\d+(?:[.,]\d)?)\s*(?:horas?|hrs?|h\b)/i.exec(l), m = /(\d+)\s*min/i.exec(l); return m ? +m[1] : h ? Math.round(parseFloat(h[1].replace(',', '.')) * 60) : null; })();
  const minH = (/m[ií]nimo\s*(?:de\s*)?(\d+)\s*(?:horas?|hrs?|h\b)/i.exec(l) || [])[1];
  const minP = (/m[ií]nimo\s*(?:de\s*)?(\d+)\s*(?:personas?|pers\b)?/i.exec(l) || [])[1];
  const base = { id: unico(slug(nom, 24) || 'item', modo === 'noches' || modo === 'bloques' ? usados : usadosS), nombre: nom, precio };
  if (desc) base.desc = desc;
  if (modo === 'noches') {
    const c = +cap || capMax || 2; if (!cap && !capMax) falta(`"${nom}": no dijo cuántas personas caben (se dejó en 2).`);
    cfg.recursos.push({ ...base, unidades: Math.max(1, +unid || 1), capacidad: c });
  } else if (modo === 'bloques') {
    const c = +cap || capMax || 10; if (!cap && !capMax) falta(`"${nom}": no dijo la capacidad de personas (se dejó en 10).`);
    cfg.recursos.push({ ...base, unidades: Math.max(1, +unid || 1), capacidad: c, minHoras: Math.max(1, +minH || 1) });
  } else if (modo === 'cupos') {
    const hs = [...l.matchAll(/(\d{1,2})[:h](\d{2})/g)].map((m) => hhmm(m[1], m[2])), dias = parseDias(l.replace(/\d{1,2}[:h]\d{2}/g, ' '));
    if (!dur) falta(`"${nom}": no dijo cuánto dura (se dejó en 2 horas).`);
    if (!cap) falta(`"${nom}": no dijo cuántos cupos tiene por salida (se dejó en 10).`);
    if (!hs.length) falta(`"${nom}": no dijo a qué hora sale (se dejó 09:00).`);
    if (!dias.length) falta(`"${nom}": no dijo qué días sale (se dejaron todos).`);
    cfg.servicios.push({ ...base, duracion: dur || 120, capacidad: +cap || 10, minPersonas: Math.max(1, +minP || 1), salidas: [...new Set(hs.length ? hs : ['09:00'])].sort(), dias: dias.length ? dias : [0, 1, 2, 3, 4, 5, 6] });
  } else {
    if (!dur) falta(`"${nom}": no dijo cuánto dura la atención (se dejó en 30 minutos).`);
    cfg.servicios.push({ ...base, duracion: dur || 30 });
  }
}
if (modo === 'noches') {
  for (const l of lineas('extras')) {
    const [nom, desc] = nombreYDesc(l), precio = precioDe(l);
    if (!nom || precio == null) { falta(`Extra sin precio o sin nombre: "${l.slice(0, 50)}".`); continue; }
    cfg.servicios.push({ id: unico(slug(nom, 24) || 'extra', usadosS), nombre: nom, precio, ...(desc ? { desc } : {}) });
  }
}
if (modo === 'horas') {
  const idsS = cfg.servicios.map((s) => s.id), nomS = cfg.servicios.map((s) => bajo(s.nombre));
  for (const l of lineas('profesionales')) {
    const seg = l.split(/\s+[-–—|]\s+|:\s*/); const nom = seg[0].trim().slice(0, 40); if (!nom) continue;
    const resto = bajo(seg.slice(1).join(' '));
    const atiende = resto ? idsS.filter((_, i) => resto.includes(nomS[i]) || nomS[i].split(/\s+/).filter((w) => w.length > 4).some((w) => resto.includes(w))) : idsS;
    if (resto && !atiende.length) { falta(`"${nom}": lo que atiende ("${seg.slice(1).join(' ').slice(0, 40)}") no coincide con ningún servicio del catálogo; se asignó a todos.`); }
    cfg.recursos.push({ id: unico(slug(nom, 24) || 'prof', usados), nombre: nom, unidades: 1, servicios: atiende.length ? atiende : idsS });
  }
  if (!cfg.recursos.length) { cfg.recursos.push({ id: 'atencion', nombre: 'Atención', unidades: 1, servicios: idsS }); falta('Profesionales o boxes: no nombró ninguno; se creó una sola agenda "Atención" que atiende todo. Cambiarlo desde Panel › Catálogo.'); }
}
if (!(cfg.recursos.length + cfg.servicios.length) || (modo === 'noches' || modo === 'bloques' ? !cfg.recursos.length : !cfg.servicios.length)) { console.error('No se pudo leer nada reservable con precio en "catalogo". Revisa el formato del ejemplo del formulario.'); process.exit(1); }

// ---------- 4. Horarios, temporadas y fines de semana ----------
if (modo === 'horas' || modo === 'bloques') {
  const h = horario(txt('horario'));
  if (h) cfg.horario = h; else { cfg.horario = { dom: [], lun: [['09:00', '18:00']], mar: [['09:00', '18:00']], mie: [['09:00', '18:00']], jue: [['09:00', '18:00']], vie: [['09:00', '18:00']], sab: [] }; falta('Horario de atención: no lo dijo o no se entendió; se dejó lunes a viernes 09:00-18:00. Confirmar con el cliente.'); }
  const iv = txt('intervalo'); cfg.intervalo = /15/.test(iv) ? 15 : /30/.test(iv) ? 30 : /hora/.test(iv) ? 60 : (modo === 'bloques' ? 60 : 30);
  if (!iv) falta(`Cada cuánto se ofrecen horas: no lo dijo; se dejó cada ${cfg.intervalo} minutos.`);
  const mg = txt('margen'); cfg.buffer = modo === 'horas' ? (/(\d+)/.exec(mg) || [0, 0])[1] * 1 : 0;
}
if (modo === 'noches') {
  for (const l of lineas('temporadas')) {
    const f = fechasMD(l), p = pct(l), nom = (l.split(':')[0] || 'Temporada').trim().slice(0, 40);
    if (f.length < 2 || !p) { falta(`Temporada no entendida: "${l.slice(0, 70)}" (debe ser "Temporada alta: 15 de diciembre a 15 de marzo, +30 %").`); continue; }
    cfg.temporadas.push({ nombre: nom, desde: f[0], hasta: f[1], factor: Math.max(0.5, Math.min(3, +(1 + p.signo * p.v / 100).toFixed(3))) });
  }
  const pf = pct(txt('finde')); if (pf) cfg.factorFinde = Math.max(0.5, Math.min(3, +(1 + pf.signo * pf.v / 100).toFixed(3))); else if (txt('finde') && !/^\s*(no|-|0)/i.test(txt('finde'))) falta(`Recargo de fin de semana no entendido: "${txt('finde').slice(0, 50)}".`);
}

// ---------- 5. Políticas ----------
const dep = bajo(txt('deposito')), depN = /sin/.test(dep) ? 0 : (/(\d+)\s*%/.exec(dep) || [])[1];
const politicas = { retencionMin: 10, cancelacion: [] };
if (depN === undefined && /100/.test(dep)) politicas.deposito = 100; else if (depN === undefined) { politicas.deposito = 30; falta(`Depósito: no se entendió ("${txt('deposito').slice(0, 40)}"); se dejó en 30 %. Confirmar con el cliente.`); } else politicas.deposito = Math.min(100, +depN);
if (!txt('deposito')) falta('Depósito: no respondió; se dejó en 30 %.');
const ret = bajo(txt('retencion')); politicas.retencionMin = /2 horas/.test(ret) ? 120 : /1 hora/.test(ret) ? 60 : (/(\d+)\s*min/.exec(ret) || [])[1] ? +(/(\d+)\s*min/.exec(ret))[1] : 10;
const ant = txt('anticipacion'); politicas.anticipacionHoras = !ant || /sin|no hay|ning/i.test(ant) ? 0 : (horasDe(ant) ?? 0);
if (ant && !/sin|no hay|ning/i.test(ant) && horasDe(ant) == null) falta(`Anticipación mínima no entendida: "${ant.slice(0, 40)}" (quedó sin mínimo).`);
const hor = txt('horizonte'); const hz = horasDe(hor);
const hzDef = { noches: 365, cupos: 120, horas: 60, bloques: 180 }[modo];
politicas.maxDias = hz ? Math.max(7, Math.min(730, Math.round(hz / 24))) : hzDef; if (!hz) falta(`Hasta cuánto tiempo adelante se reserva: ${hor ? 'no se entendió' : 'no lo dijo'}; se dejó en ${hzDef} días.`);
const mod = horasDe(txt('modificar')); politicas.modificarHoras = mod != null ? Math.min(720, mod) : 24; if (mod == null) falta('Hasta cuándo puede el cliente cambiar su reserva: no lo dijo; se dejó 24 horas antes.');
const can = bajo(txt('cancelacion'));
if (/propia/.test(can)) {
  const filas = [];
  for (const l of lineas('cancelacion_propia')) { const h = horasDe(l), p = (/(\d+)\s*%/.exec(l) || [])[1]; if (h != null && p != null) filas.push({ horas: h, reembolso: Math.min(100, +p) }); else falta(`Tramo de cancelación no entendido: "${l.slice(0, 60)}".`); }
  if (filas.length) politicas.cancelacion = [...filas.sort((a, b) => b.horas - a.horas), { horas: 0, reembolso: 0 }];
  else { politicas.cancelacion = [{ horas: 168, reembolso: 100 }, { horas: 48, reembolso: 50 }, { horas: 0, reembolso: 0 }]; falta('Política de cancelación propia: no se pudo leer; se dejó la moderada. Confirmar con el cliente.'); }
} else if (/flexible/.test(can)) politicas.cancelacion = [{ horas: 24, reembolso: 100 }, { horas: 0, reembolso: 0 }];
else if (/estricta/.test(can)) politicas.cancelacion = [{ horas: 0, reembolso: 0 }];
else if (/moderada/.test(can)) politicas.cancelacion = [{ horas: 168, reembolso: 100 }, { horas: 48, reembolso: 50 }, { horas: 0, reembolso: 0 }];
else { politicas.cancelacion = [{ horas: 168, reembolso: 100 }, { horas: 48, reembolso: 50 }, { horas: 0, reembolso: 0 }]; falta('Política de cancelación: no eligió; se dejó la moderada (total hasta 7 días antes, 50 % hasta 48 horas). Confirmar con el cliente.'); }
if (modo === 'noches') {
  const t = bajo(txt('checkin')), hs = [...t.matchAll(/(\d{1,2})[:h](\d{2})/g)].map((m) => hhmm(m[1], m[2]));
  politicas.checkin = hs[0] || '15:00'; politicas.checkout = hs[1] || '11:00'; if (hs.length < 2) falta('Hora de llegada y de salida: no las dijo bien; se dejaron 15:00 y 11:00.');
  const m1 = bajo(txt('estadia_min')), n1 = (/(\d+)\s*noche/.exec(m1) || /(\d+)/.exec(m1) || [])[1], nA = (/(\d+)\s*noches?\s*(?:en|durante)?\s*(?:temporada\s*)?alta/.exec(m1) || /alta\D*(\d+)/.exec(m1) || [])[1];
  politicas.estadiaMin = Math.max(1, +n1 || 1); politicas.estadiaMinAlta = Math.max(politicas.estadiaMin, +nA || politicas.estadiaMin);
}
cfg.politicas = politicas;
cfg.pagoInstrucciones = txt('pago_instrucciones').slice(0, 300);
cfg.pagoDemo = demo;
if (politicas.deposito > 0 && !cfg.pagoInstrucciones) falta('Cómo se paga el depósito: no lo dijo. Sin esto el cliente no sabe cómo pagar (completarlo en Panel › Negocio y equipo).');
if (/\b(clave|contrase|tarjeta n|cvv)/i.test(txt('pago_instrucciones'))) falta('Las instrucciones de pago mencionan claves o tarjetas: NO deben llevar datos sensibles. Revisar el texto.');

// ---------- 6. Descuentos y códigos ----------
cfg.reglas = []; cfg.promos = [];
const elegidos = lista('descuentos').map(bajo);
for (const l of lineas('descuentos_detalle')) {
  const p = (/(\d+(?:[.,]\d+)?)\s*%/.exec(l) || [])[1], t = bajo(l); if (!p) { falta(`Descuento sin porcentaje: "${l.slice(0, 60)}".`); continue; }
  const porcentaje = Math.max(1, Math.min(90, Math.round(parseFloat(p.replace(',', '.')))));
  let r = null; const n = (re) => (re.exec(t) || [])[1];
  if (/anticipaci|con \d+ dias de/.test(t) && n(/(\d+)\s*d[ií]as/)) r = { tipo: 'anticipada', dias: +n(/(\d+)\s*d[ií]as/), porcentaje };
  else if (/noches/.test(t) && n(/(\d+)\s*noches/)) r = { tipo: 'estadia', noches: +n(/(\d+)\s*noches/), porcentaje };
  else if (/grupo/.test(t) && n(/(\d+)\s*(?:o m[aá]s|personas|pers)/)) r = { tipo: 'grupo', personas: +n(/(\d+)\s*(?:o m[aá]s|personas|pers)/), porcentaje };
  else if (/ultimo minuto|menos de/.test(t)) { const h = horasDe(t.replace(/.*menos de/, '')) ?? horasDe(t); if (h) r = { tipo: 'ultimo', horas: h, porcentaje }; }
  else if (/arriendo|horas o mas|horas de/.test(t) && n(/(\d+)\s*horas/)) r = { tipo: 'duracion', horas: +n(/(\d+)\s*horas/), porcentaje };
  if (r) cfg.reglas.push({ ...r, activa: true }); else falta(`Descuento no entendido: "${l.slice(0, 70)}".`);
}
if (elegidos.length && !elegidos.every((x) => /ninguno/.test(x)) && !cfg.reglas.length) falta('Marcó descuentos automáticos pero no escribió el porcentaje y la condición de ninguno: no se creó ninguno.');
if (cfg.reglas.some((r) => r.tipo === 'estadia') && modo !== 'noches') falta('Descuento por estadía larga solo existe en alojamiento: se ignorará en esta agenda.');
for (const l of lineas('codigos')) {
  const cod = (/^\W*([A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]{3,16})\b/.exec(l) || [])[1], p = /(\d+(?:[.,]\d+)?)\s*%/.exec(l), m = precioDe(l.replace(/m[ií]nimo\s*\$?\s*[\d.]+/i, '').replace(/m[aá]ximo\s*\d+/i, ''));
  if (!cod || !/^[A-Za-z0-9]+$/.test(cod) || (!p && m == null)) { falta(`Código de descuento no entendido: "${l.slice(0, 60)}" (debe ser "VERANO15 - 15 %" o "PRIMERAVEZ - $3.000").`); continue; }
  const minimo = (/m[ií]nimo\s*\$?\s*([\d.]+)/i.exec(l) || [])[1], max = (/m[aá]ximo\s*(\d+)/i.exec(l) || [])[1];
  cfg.promos.push({ codigo: cod.toUpperCase(), tipo: p ? 'porcentaje' : 'monto', valor: p ? Math.min(90, Math.round(parseFloat(p[1].replace(',', '.')))) : m, minimo: minimo ? NUM(minimo) : 0, activa: true, usos: 0, usosMax: max ? +max : 100 });
}
if (cfg.promos.some((p) => !p.usosMax)) falta('Códigos sin límite de usos.');

// ---------- 7. Avisos ----------
const av = lista('avisos').map(bajo), hay = (re) => av.some((x) => re.test(x));
const rh = parseInt((/(\d+)/.exec(txt('recordatorio_horas')) || [])[1], 10);
const horasRec = txt('recordatorio_horas') && /d[ií]a/.test(bajo(txt('recordatorio_horas'))) && rh ? rh * 24 : (rh || 24);
const nota = (activo, extra = {}) => ({ activo, correo: true, whatsapp: false, ...extra });
cfg.notif = av.length ? { confirmacion: nota(hay(/confirmaci/)), recordatorio: nota(hay(/recordatorio/), { horas: horasRec }), resena: nota(hay(/opini/)), cancelacion: nota(hay(/cancelaci/)), espera: nota(hay(/libera|espera/)) }
  : { confirmacion: nota(true), recordatorio: nota(true, { horas: horasRec }), resena: nota(false), cancelacion: nota(true), espera: nota(true) };
if (!av.length) falta('Avisos automáticos: no eligió; se activaron confirmación, recordatorio, cancelación y lista de espera por correo (sin WhatsApp automático, que se cotiza aparte).');
if (txt('calendarios')) falta('Calendarios externos (Airbnb, Booking, Google): "' + txt('calendarios').slice(0, 80) + '". Importarlos desde Panel › Integraciones; hoy se pegan a mano (la lectura automática es recurrente y se cotiza aparte).');
if (/ingl/i.test(txt('observaciones'))) falta('Pidió el sitio en inglés: el sistema ya trae español, inglés y portugués para el cliente final.');
if (txt('observaciones')) falta('Observaciones del cliente por revisar a mano: "' + txt('observaciones').slice(0, 120) + '".');
if (!txt('web_actual') || /no/i.test(bajo(txt('web_actual')).slice(0, 3))) { /* sin sistema anterior */ } else falta('Ya tenía un sistema o planilla de reservas: acordar cómo migrar las reservas existentes (no se importan solas).');

// ---------- 8. Plantilla, accesos y prueba ----------
if (simple) { crearSimple(); process.exit(0); }
mkdirSync(join(aqui, 'agendas'), { recursive: true });
const archivoAg = join(aqui, 'agendas', id + '-agendas.json');
writeFileSync(archivoAg, JSON.stringify([cfg], null, 1));
if (!demo && !urlFinal) falta('Dirección definitiva del sitio (--url): sin ella la página no se indexa; volver a generar o editar index.html cuando exista el dominio.');
if (!txt('telefono')) falta('Teléfono o correo del negocio para la página de privacidad (queda como [TELÉFONO O CORREO DEL NEGOCIO]).');
falta('Política de privacidad (privacidad.html): revisar con el negocio (responsable de los datos, plazo de conservación) antes de publicar.');
falta('Textos legales de la política de cancelación: los confirma el negocio. El sistema solo aplica lo que el jefe publicó.');
console.log(execFileSync('node', [join(aqui, 'nuevo-agenda.mjs'), '--id', id, '--nombre', nombre, '--agendas', archivoAg, ...(demo ? ['--demo'] : []), ...(urlFinal ? ['--url', urlFinal] : []), ...(txt('telefono') ? ['--telefono', txt('telefono')] : [])], { encoding: 'utf8' }).trim());

const sqlF = join(aqui, 'agendas', id + '-instalar.sql');
let sql = readFileSync(sqlF, 'utf8');
const pinDe = (rol) => new RegExp(`'${id}', '${rol}'.*?'(\\d{6})'`).exec(sql)?.[1];
const pins = { dueno: pinDe('dueno'), recepcion: pinDe('recepcion') };
const usadosPin = new Set(Object.values(pins)), personas = [];
for (const l of lineas('equipo')) {
  const m = /^(.+?)\s*[-–—:,]\s*(recepci\p{L}*|atenci\p{L}*|reservas?)\s*$/iu.exec(l);
  if (!m) { falta(`Persona del equipo no entendida: "${l.slice(0, 50)}" (debe ser "Nombre - recepción").`); continue; }
  let pin; do { pin = String(100000 + Math.floor(Math.random() * 899999)); } while (usadosPin.has(pin)); usadosPin.add(pin);
  personas.push({ nombre: m[1].trim().slice(0, 30), pin });
}
if (personas.length) sql += `-- Personal que nombró el cliente (cada uno entra con su PIN a lo suyo)\ninsert into demo.roles (negocio, rol, nombre, pin, cols) values\n${personas.map((p) => `  ('${id}', 'recepcion', '${p.nombre.replace(/'/g, "''")}', '${p.pin}', '{reservas,avisos,espera,bloqueos}')`).join(',\n')}\non conflict do nothing;\n`;
writeFileSync(sqlF, sql);

const cuerpo = readFileSync(join(aqui, 'pruebas', 'agenda-cliente.js'), 'utf8');
writeFileSync(join(aqui, 'agendas', id + '-prueba.js'), `// Prueba de humo de ${nombre} (negocio ${id}): corre sobre su página de reservas, DESPUÉS de ejecutar el SQL y publicar la agenda.
// Uso: node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/${id}/ --anchos 1440 --probar web/herramientas/agendas/${id}-prueba.js
const PRUEBA = { N: '${id}', AGENDA: '${agendaId}', DUENO: '${pins.dueno}', RECEP: '${pins.recepcion}' };
${cuerpo}`);
writeFileSync(join(aqui, 'agendas', id + '-pendientes.md'), `# Pendientes de ${nombre} (${id})\n\n${pendientes.map((p) => '- [ ] ' + p).join('\n')}\n\n## Accesos (privados: entregar por un canal seguro)\n\n- Jefe (dueño): \`${pins.dueno}\`\n- Recepción: \`${pins.recepcion}\`\n${personas.map((p) => `- ${p.nombre} (recepción): \`${p.pin}\``).join('\n')}\n\nCambiar los PIN provisorios en Panel › Negocio y equipo.\n`);

const catalogo = [...cfg.recursos, ...cfg.servicios];
console.log(`\n${nombre} (${id}): agenda "${modo}", ${cfg.recursos.length} recursos y ${cfg.servicios.length} servicios, ${cfg.reglas.length} descuentos automáticos, ${cfg.promos.length} códigos.`);
console.log(`Pendientes (${pendientes.length}) en web/herramientas/agendas/${id}-pendientes.md:`); pendientes.forEach((p) => console.log('  · ' + p));
console.log(`\nSiguiente:\n  1. Ejecutar web/herramientas/agendas/${id}-instalar.sql en Supabase (proyecto biodigital-demos).\n  2. node web/herramientas/cargar-agendas.mjs --negocio ${id} --pin ${pins.dueno} --archivo web/herramientas/agendas/${id}-agendas.json\n  3. node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/${id}/ --anchos 390,1440 --probar web/herramientas/agendas/${id}-prueba.js\n  4. Entrar a ${id}/admin/ con el PIN del jefe y revisar catálogo, horarios y políticas con el cliente.`);
void catalogo;

// ---------- Reserva simple: carpeta autosuficiente, sin base de datos ----------
function crearSimple() {
  if (modo !== 'horas' && modo !== 'noches') { console.error('La reserva simple es para citas o alojamiento. Para tours o arriendo de espacios usa el sistema PRO (sin --simple).'); process.exit(1); }
  const BASE = join(EJ, 'reservas-simple'), DEST = join(EJ, id);
  if (existsSync(DEST)) { console.error('Ya existe ' + DEST + ': elige otro --id o bórrala primero.'); process.exit(1); }
  mkdirSync(join(DEST, 'planilla-plantilla'), { recursive: true }); mkdirSync(join(aqui, 'agendas'), { recursive: true });
  const dig = txt('telefono').replace(/\D/g, ''), wa = dig.length === 9 && dig[0] === '9' ? '56' + dig : dig;
  if (wa.length < 10) falta('WhatsApp del negocio: no se entendió "' + txt('telefono') + '". Escríbelo en simple.config.js (whatsapp: "569XXXXXXXX").');
  const neg = { ...cfg, id: agendaId, whatsapp: wa, politicas: { ...cfg.politicas, deposito: 0 }, promos: [], reglas: [], planilla: {}, calendario: { id: txt('correo') || '', llave: '' } };
  delete neg.notif;
  if (modo === 'horas') { const todos = cfg.servicios.map((x) => x.id); neg.recursos = cfg.recursos.length ? cfg.recursos.map((r) => ({ ...r, servicios: r.servicios && r.servicios.length ? r.servicios : todos })) : [{ id: 'agenda', nombre, unidades: 1, servicios: todos }]; }
  writeFileSync(join(DEST, 'simple.config.js'), '// Reserva simple de ' + nombre + ': la solicitud llega por WhatsApp y el negocio confirma. Armada con aplicar-formulario-agenda.mjs --simple.\n// planilla: pegar los enlaces CSV publicados de cada pestaña de la planilla de Google del dueño (ver PLANILLA.md). Sin planilla se usa este catálogo.\nwindow.SIMPLE = ' + JSON.stringify({ demo: false, negocios: [neg] }, null, 1) + ';\n');
  for (const [de, a] of [['reservas-simple/simple.js', 'simple.js'], ['reservas/motor.js', 'motor.js'], ['reservas/estilo.css', 'estilo.css'], ['reservas-simple/widget.js', 'widget.js']]) writeFileSync(join(DEST, a), readFileSync(join(EJ, de), 'utf8'));
  let html = readFileSync(join(BASE, 'index.html'), 'utf8')
    .replace(/<html lang="es" data-ejemplo="[^"]*">/, '<html lang="es">').replace('../reservas/estilo.css', 'estilo.css').replace(/\s*<link rel="stylesheet" href="\.\.\/_compartido\/demo\.css[^"]*">/, '')
    .replace(/\s*<script src="\.\.\/_compartido\/demo\.js[^"]*" defer><\/script>/, '').replace(/data-motor="\.\.\/reservas\/motor\.js[^"]*"/, 'data-motor="motor.js"').replace(/href="\.\.\/\.\.\/marca\/favicon-32\.png[^"]*"/, 'href="data:,"')
    .replace(/<title>[^<]*<\/title>/, '<title>Reserva tu hora · ' + nombre + '</title>').replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Pide tu reserva en ' + nombre + ' por WhatsApp: elige el día y la hora.">');
  if (urlFinal) html = html.replace('<meta name="robots" content="noindex, nofollow">', '<link rel="canonical" href="' + urlFinal + '">');
  writeFileSync(join(DEST, 'index.html'), html);
  const c = (v) => { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const cat = modo === 'horas' ? ['Servicio,Precio,Duración (min),Descripción,Activo', ...cfg.servicios.map((x) => [x.nombre, x.precio, x.duracion || 30, x.desc || '', 'Sí'].map(c).join(','))]
    : ['Cabaña,Precio por noche,Personas,Cantidad,Descripción,Activo', ...cfg.recursos.map((x) => [x.nombre, x.precio, x.capacidad || 2, x.unidades || 1, x.desc || '', 'Sí'].map(c).join(','))];
  writeFileSync(join(DEST, 'planilla-plantilla', modo === 'horas' ? 'servicios.csv' : 'cabanas.csv'), cat.join('\n') + '\n');
  if (modo === 'horas') { const NOM = { lun: 'Lunes', mar: 'Martes', mie: 'Miércoles', jue: 'Jueves', vie: 'Viernes', sab: 'Sábado', dom: 'Domingo' }; writeFileSync(join(DEST, 'planilla-plantilla', 'horario.csv'), ['Día,Abre,Cierra', ...Object.keys(NOM).flatMap((k) => ((cfg.horario || {})[k] || []).map((t) => [NOM[k], t[0], t[1]].join(',')))].join('\n') + '\n'); }
  const tipoCat = modo === 'horas' ? 'Servicios' : 'Cabañas';
  writeFileSync(join(DEST, 'CONFIGURAR.md'), ['# Configurar la reserva simple de ' + nombre, '',
    '## 1. Google Calendar (las horas ocupadas) — obligatorio',
    'La página no ofrece lo que esté ocupado en el Google Calendar del dueño. Solo lee "libre/ocupado": nunca nombres ni detalles.',
    '1. En el Google Calendar del dueño (en el computador): Configuración › su calendario › Permisos de acceso › marcar **"Disponible públicamente"** con **"Ver solo libre/ocupado (ocultar detalles)"**.',
    '2. En `simple.config.js` → `calendario.id`: el correo de Gmail del dueño (o el "ID del calendario" que aparece en Integrar el calendario).',
    '3. `calendario.llave`: la llave de la API de Google Calendar de Bío Digital (gratis; restringida a nuestros dominios; la guarda el equipo).',
    ...(modo === 'noches' ? ['4. Si cada cabaña tiene su propio calendario, poner su ID en la cabaña (`recursos[].calendario`). Si no, un evento en el calendario ocupa todas.'] : []),
    '', '**Cómo lo usa el dueño:** cada solicitud le llega por WhatsApp con un enlace. Lo toca y: "Agendar en mi Google Calendar" (guardar) → esa hora deja de ofrecerse; "Confirmar por WhatsApp" → le llega al cliente la confirmación con la dirección y su recordatorio. Si no puede, propone otra hora o avisa con un toque. Lo que agende a mano en su calendario (vacaciones, horas por teléfono) también queda ocupado.', '',
    '## 2. Planilla de Google (precios y servicios) — opcional',
    '1. Crear la planilla en la cuenta del negocio con una pestaña por cada archivo de `planilla-plantilla/` (Archivo › Importar › Subir › "Insertar hojas nuevas").',
    '2. Archivo › Compartir › **Publicar en la Web**: cada pestaña en formato **CSV**; copiar los enlaces.',
    "3. Pegarlos en `simple.config.js` → `planilla: { servicios: '…'" + (modo === 'horas' ? ", horario: '…'" : '') + " }` y publicar la página una vez.",
    '- **' + (modo === 'horas' ? 'Servicios' : 'Cabañas') + '**: cambiar precio o descripción, agregar uno nuevo (una fila) o poner "No" en Activo para ocultarlo. Una fila sin precio no se muestra.',
    ...(modo === 'horas' ? ['- **Horario**: una fila por tramo (Lunes, 10:00, 14:00 y Lunes, 15:00, 20:00 para cerrar a almorzar). Un día sin filas queda cerrado.'] : []),
    '- Desde la planilla no se cambia el tipo de agenda (' + (modo === 'horas' ? 'citas' : 'alojamiento') + ').', '',
    'Probar con `?revisar=1` al final de la dirección: muestra lo que no se pudo leer (planilla o calendario).', '',
    '## 3. Cartel con código QR', 'Para el mesón, la puerta y la bio de Instagram: https://biodigitales.cl/ejemplos/_compartido/cartel.html?url=' + encodeURIComponent(urlFinal || 'https://DIRECCION-DE-LA-PAGINA/') + '&titulo=' + encodeURIComponent(modo === 'horas' ? 'Reserva tu hora' : 'Reserva tu estadía') + '&sub=' + encodeURIComponent(nombre) + '&color=' + encodeURIComponent(cfg.color) + ' (si aún no hay dirección publicada, cambiar la url).', ''].join('\n'));
  writeFileSync(join(aqui, 'agendas', id + '-pendientes.md'), '# Pendientes de ' + nombre + ' (' + id + ', reserva simple)\n\n' + pendientes.map((p) => '- [ ] ' + p).join('\n') + '\n- [ ] Compartir el Google Calendar del dueño como "ver solo libre/ocupado" y poner su ID y la llave de Bío Digital en simple.config.js (ver web/propuesta/ejemplos/' + id + '/CONFIGURAR.md).\n- [ ] Opcional: planilla de Google para precios y servicios (mismo archivo).\n- [ ] Probar: node web/herramientas/revisar.mjs "http://localhost:4321/ejemplos/' + id + '/?revisar=1" --anchos 390,1440\n');
  console.log('\n' + nombre + ' (' + id + '): reserva simple "' + modo + '" con ' + (modo === 'horas' ? cfg.servicios.length + ' servicios' : cfg.recursos.length + ' alojamientos') + '. WhatsApp: ' + (wa || '(falta)') + '.\nCarpeta: web/propuesta/ejemplos/' + id + '/ · configurar: CONFIGURAR.md (calendario y planilla)\nPendientes (' + (pendientes.length + 2) + ') en web/herramientas/agendas/' + id + '-pendientes.md');
}
