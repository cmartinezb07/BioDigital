// Datos de muestra para las capturas del sistema de reservas (resumen, calendario y reportes del panel con un negocio trabajando).
// NO se usa la demostración (negocio "reservas"): ahí prueba gente real. Se usa una copia de la plantilla con otro "negocio" en la base
// (captura-reservas, con los mismos PIN de la demo), se llena con reservas de muestra y al terminar se borran los datos y la copia de la carpeta.
// Las reservas entran con nube_importar (rol "sistema"), la vía para cargas masivas: las reglas del servidor no se saltan en uso normal.
// Requisito único (ya hecho): el negocio tiene sus accesos y permisos en la base (ver memoria/plantilla-agenda.md).
import vm from 'node:vm';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importar, vaciar, escribir } from './nube-node.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const ORIGEN = join(aqui, '../propuesta/ejemplos/reservas');
const COPIA = join(aqui, '../propuesta/ejemplos/captura-reservas');
export const NEGOCIO = 'captura-reservas';
const DUENO = '482916', DIA = 864e5, COLS = ['reservas', 'avisos', 'espera', 'bloqueos', 'config', 'promos'];

// Números repetibles: las capturas salen igual cada vez que se corren
let semilla = 20261026;
const rnd = (n) => { semilla = (semilla * 1664525 + 1013904223) % 4294967296; return Math.floor((semilla / 4294967296) * n); };
const pick = (a) => a[rnd(a.length)];

export function copiarCarpeta() {
  rmSync(COPIA, { recursive: true, force: true });
  cpSync(ORIGEN, COPIA, { recursive: true });
  // La copia habla con su propio negocio; el resto del código es el mismo
  const cfg = join(COPIA, 'agenda.config.js');
  const s = readFileSync(cfg, 'utf8').replace("negocio: 'reservas'", `negocio: '${NEGOCIO}'`);
  if (!s.includes(NEGOCIO)) throw new Error('No se pudo apuntar la copia al negocio de captura');
  writeFileSync(cfg, s);
}

export async function sembrar() {
  const ctx = { console, crypto: globalThis.crypto, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, addEventListener() {}, setTimeout, setInterval, clearTimeout };
  ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(readFileSync(join(ORIGEN, 'motor.js'), 'utf8'), ctx);
  const Motor = ctx.Reservas, U = Motor.util;
  const cfgs = JSON.parse(JSON.stringify(Motor.NEGOCIOS)), cab = cfgs.find((c) => c.id === 'cabanas');
  // 1. La configuración publicada (solo el jefe puede): las cinco agendas de la demostración
  for (const c of cfgs) { const x = await escribir(NEGOCIO, 'config', 'cfg-' + c.id, { config: c }, { pin: DUENO, modo: 'poner' }); if (x.ok !== true) throw new Error('No se pudo publicar la agenda ' + c.id + ': ' + JSON.stringify(x)); }

  // 2. Reservas de muestra de las cabañas
  const ahora = Date.now(), hoy = U.hoy();
  const nombres = ['Andrea Fuentes', 'Rodrigo Pizarro', 'Carolina Soto', 'Familia Muñoz', 'Pablo Reyes', 'Lorena Araya', 'Felipe Tapia', 'Daniela Vera', 'Marcos Ibáñez', 'Paula Rojas', 'Ignacio Salas', 'Valeria Cortés', 'Sebastián Lagos', 'Javiera Núñez', 'Cristóbal Vega', 'Trinidad Gómez'];
  const paises = ['Chile', 'Chile', 'Chile', 'Chile', 'Argentina', 'Brasil', 'Estados Unidos', 'Perú'];
  const canales = ['Sitio web', 'Sitio web', 'Sitio web', 'WhatsApp', 'Airbnb (iCal)', 'Booking (iCal)', 'Presencial'];
  const ocupadas = Object.fromEntries(cab.recursos.map((r) => [r.id, Array.from({ length: r.unidades }, () => [])]));   // [unidad][[desde,hasta]]
  const libre = (rec, d, h) => ocupadas[rec].some((u) => !u.some(([a, b]) => a < h && b > d));
  const tomar = (rec, d, h) => { const u = ocupadas[rec].find((x) => !x.some(([a, b]) => a < h && b > d)); u.push([d, h]); };
  const filas = []; let n = 0;
  const hacer = (diasDesde, noches, estado, o = {}) => {
    const rec = o.recurso || pick(cab.recursos.map((r) => r.id)), r = cab.recursos.find((x) => x.id === rec);
    const llegada = U.sumaDias(hoy, diasDesde), salida = U.sumaDias(llegada, noches), desde = U.fdate(llegada).getTime(), hasta = U.fdate(salida).getTime();
    if (estado !== 'cancelada' && !libre(rec, desde, hasta)) return false;
    const personas = Math.min(r.capacidad, 1 + rnd(r.capacidad)) || 2, extras = rnd(5) === 0 ? ['tinaja'] : [];
    const sel = { recurso: rec, llegada, salida, personas, extras };
    const pr = Motor.precio({ config: JSON.parse(JSON.stringify(cab)), reservas: [], bloqueos: [] }, sel, '');
    if (estado !== 'cancelada') tomar(rec, desde, hasta);
    n++;
    const creada = Math.min(desde - (2 + rnd(25)) * DIA, ahora - 3600e3), nombre = pick(nombres), id = 'zzm' + String(100 + n) + rnd(9999).toString(36);
    const pagado = ['pagada', 'checkin', 'completada'].includes(estado) ? (estado === 'pagada' ? pr.deposito || pr.total : pr.total) : estado === 'noshow' ? pr.deposito : estado === 'cancelada' && o.devuelve ? 0 : 0;
    const hist = [{ estado: pr.deposito ? 'retenida' : 'confirmada', t: creada, por: 'cliente' }];
    if (!['retenida'].includes(estado)) hist.push({ estado: 'pagada', t: creada + 4 * 60e3, por: 'recepcion', quien: 'Recepción' });
    if (['checkin', 'completada'].includes(estado)) hist.push({ estado: 'checkin', t: desde + 15 * 36e5, por: 'sistema' });
    if (estado === 'completada') hist.push({ estado: 'completada', t: hasta + 11 * 36e5, por: 'sistema' });
    if (estado === 'noshow') hist.push({ estado: 'noshow', t: desde + 20 * 36e5, por: 'recepcion', quien: 'Recepción' });
    if (estado === 'cancelada') hist.push({ estado: 'cancelada', t: creada + 2 * DIA, por: 'cliente' });
    const data = {
      id, agenda: 'cabanas', neg: 'cabanas', codigo: ('ZZ' + id.slice(-4)).toUpperCase().replace(/[^A-Z0-9]/g, 'X').slice(0, 6).padEnd(6, 'K'), creada, modo: 'noches', recurso: rec, servicio: null, extras, desde, hasta, personas, horas: null, unidades: 1,
      cliente: { nombre, correo: 'zz-muestra-' + n + '@ejemplo.cl', telefono: '+569' + String(10000000 + rnd(89999999)), pais: pick(paises), idioma: 'es' }, precio: pr, pagado, moneda: 'CLP', estado, expira: estado === 'retenida' ? ahora + 8 * 60e3 : null,
      canal: o.canal || pick(canales), idioma: 'es', sel, codigoPromo: '', rev: 1, ediciones: [], historial: hist
    };
    if (estado === 'cancelada') data.reembolso = { porcentaje: 100, monto: pr.deposito || 0, horas: 200 };
    filas.push({ id, data, pub: { n: 'cabanas', m: 'n', r: 'cabanas:' + rec, d: desde, h: hasta, u: 1, e: estado, x: data.expira || 0 } });
    return true;
  };
  // En casa ahora y las próximas semanas
  hacer(-1, 2, 'checkin', { recurso: 'copihue' }); hacer(0, 2, 'checkin', { recurso: 'araucaria' }); hacer(-1, 3, 'checkin', { recurso: 'familiar' });
  hacer(0, 1, 'retenida', { recurso: 'copihue', canal: 'Sitio web' });
  for (const [d, e] of [[2, 'pagada'], [3, 'confirmada'], [5, 'pagada'], [8, 'pagada'], [9, 'confirmada'], [12, 'pagada'], [16, 'pagada'], [19, 'confirmada'], [23, 'pagada'], [27, 'pagada'], [33, 'pagada'], [40, 'confirmada']]) for (let t = 0; t < 4 && !hacer(d + t, 1 + rnd(3), e); t++);
  // Historia de las últimas semanas
  for (let d = 34; d >= 3; d--) { const cuantos = [0, 1, 1, 2, 2][rnd(5)]; for (let k = 0; k < cuantos; k++) hacer(-d, 1 + rnd(3), rnd(16) === 0 ? 'cancelada' : rnd(25) === 0 ? 'noshow' : 'completada'); }
  const r1 = await importar(NEGOCIO, 'reservas', DUENO, filas);
  if (!r1.ok) throw new Error('No se pudieron cargar las reservas de muestra: ' + JSON.stringify(r1));
  return filas.length + ' reservas de muestra';
}

export async function limpiar() {
  const r = await Promise.all(COLS.map((c) => vaciar(NEGOCIO, c, DUENO)));
  rmSync(COPIA, { recursive: true, force: true });
  return JSON.stringify(r);
}
