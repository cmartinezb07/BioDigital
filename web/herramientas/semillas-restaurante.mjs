// Datos de muestra para las capturas del restaurante (cocina con pedidos de cada tipo y panel con estadísticas).
// NO se usa el restaurante de la demostración (fogon): sus pedidos son de gente real probando. Se usa una copia de la plantilla
// con otro "negocio" en la base (captura-fogon, con los mismos PIN de la demo), se llena con pedidos de muestra para que las
// capturas muestren un local trabajando, y al terminar se borran los pedidos y la copia de la carpeta.
// Los pedidos entran con nube_importar (rol "sistema"), que es la vía para cargas masivas: las reglas del servidor no se saltan en uso normal.
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importar, vaciar, PIN } from './nube-node.mjs';

const aqui = dirname(fileURLToPath(import.meta.url));
const ORIGEN = join(aqui, '../propuesta/ejemplos/fogon-del-sur');
const COPIA = join(aqui, '../propuesta/ejemplos/captura-fogon');
export const NEGOCIO = 'captura-fogon';
const MIN = 6e4, DIA = 864e5;

// Números repetibles: las capturas salen igual cada vez que se corren
let semilla = 20261024;
const rnd = (n) => { semilla = (semilla * 1664525 + 1013904223) % 4294967296; return Math.floor((semilla / 4294967296) * n); };
const pick = (a) => a[rnd(a.length)];

export function copiarCarpeta() {
  rmSync(COPIA, { recursive: true, force: true });
  cpSync(ORIGEN, COPIA, { recursive: true });
  // La copia habla con su propio negocio; el resto del código es el mismo
  const cfg = join(COPIA, 'restaurante.config.js');
  const s = readFileSync(cfg, 'utf8').replace("negocio: 'fogon'", `negocio: '${NEGOCIO}'`);
  if (!s.includes(NEGOCIO)) throw new Error('No se pudo apuntar la copia al negocio de captura');
  writeFileSync(cfg, s);
}

export async function sembrar() {
  const carta = JSON.parse(readFileSync(join(ORIGEN, 'carta-base.json'), 'utf8'));
  const platos = carta.categorias.flatMap((c) => c.platos).filter((p) => p.activo !== false && p.disponible !== false);
  const comunas = carta.config.comunas, local = carta.config.local;
  const nombres = ['Camila R.', 'Matías S.', 'Fernanda L.', 'Diego P.', 'Valentina A.', 'Joaquín M.', 'Sofía C.', 'Benjamín T.', 'Isidora V.', 'Tomás G.', 'Antonia H.', 'Vicente O.'];
  const calles = ['Barros Arana', 'O\'Higgins', 'Chacabuco', 'Los Carrera', 'Paicaví', 'Maipú', 'Freire', 'Colo Colo'];
  const ahora = Date.now();
  const km = (a, b) => { const R = 6371, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r, x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2; return +(R * 2 * Math.asin(Math.sqrt(x)) * 1.3).toFixed(1); };
  const filas = []; let n = 0;
  const hacer = (tipo, haceMin, estado, extra = {}) => {
    n++;
    const items = []; for (let i = 0, k = 1 + rnd(3); i < k; i++) { const p = pick(platos); if (!items.some((x) => x.id === p.id)) items.push({ id: p.id, nombre: p.nombre, precio: p.precio, cant: 1 + rnd(2), prep: p.prep || 0, opc: [], opciones: [], nota: '' }); }
    if (tipo === 'delivery') while (items.reduce((t, x) => t + x.precio * x.cant, 0) < carta.config.minimoDelivery) items[0].cant++;
    const comuna = tipo === 'delivery' ? pick(['Concepción', 'Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Hualpén']) : '';
    const destino = comuna ? { lat: comunas[comuna].lat + (rnd(80) - 40) / 10000, lng: comunas[comuna].lng + (rnd(80) - 40) / 10000 } : null;
    const envio = comuna ? comunas[comuna].envio : 0, subtotal = items.reduce((t, x) => t + x.precio * x.cant, 0);
    const t0 = ahora - haceMin * MIN, prep = Math.min(45, Math.max(...items.map((x) => x.prep), 10) + 5);
    const orden = { mesa: ['recibido', 'aceptado', 'preparacion', 'listo', 'entregado'], retiro: ['recibido', 'aceptado', 'preparacion', 'listo', 'entregado'], delivery: ['recibido', 'aceptado', 'preparacion', 'listo', 'camino', 'entregado'] }[tipo];
    const hasta = estado === 'cancelado' ? 0 : orden.indexOf(estado);
    const historial = [{ estado: 'recibido', t: t0, por: 'cliente' }];
    for (let i = 1; i <= hasta; i++) historial.push({ estado: orden[i], t: t0 + (i < 4 ? [0, 2, 3, 3 + prep][i] : i === 4 ? 5 + prep : 20 + prep) * MIN, por: i === 4 && tipo === 'delivery' ? 'reparto' : 'cocina', quien: i === 4 && tipo === 'delivery' ? 'Repartidor 1' : 'Cocina' });
    if (estado === 'cancelado') historial.push({ estado: 'cancelado', t: t0 + 4 * MIN, por: 'dueno', quien: 'Dueño' });
    const online = rnd(10) < 4, pagado = estado === 'entregado' || (online && estado !== 'cancelado');
    const p = {
      id: 'zz' + String(1000 + n) + 'a' + rnd(99999).toString(36), codigo: String(100 + rnd(900)), creado: t0, tipo, mesa: tipo === 'mesa' ? 1 + rnd(carta.config.mesas) : null,
      cliente: { nombre: pick(nombres), telefono: tipo === 'mesa' ? '' : '+569' + String(10000000 + rnd(89999999)), direccion: comuna ? pick(calles) + ' ' + (100 + rnd(900)) : '', comuna },
      items, nota: '', subtotal, envio, total: subtotal + envio, pago: { metodo: online ? 'linea' : 'caja', pagado, cuando: pagado ? t0 + 3 * MIN : undefined },
      referencia: pick(['Instagram', 'Pasaba por fuera', 'Me lo recomendaron', 'Google Maps', 'TikTok', '']), invitadoPor: '',
      estado, historial, prepMin: prep, escala: 1, sesion: 'zzs' + n, rev: 1, ediciones: [], muestra: true, ...extra
    };
    if (destino) { p.destino = destino; p.km = km(local, destino); }
    if (estado === 'camino') p.repartidor = { nombre: 'Repartidor 1', lat: destino.lat + 0.004, lng: destino.lng - 0.003, t: ahora - 20000, gps: true };
    if (['listo', 'camino', 'preparacion', 'aceptado'].includes(estado) && tipo === 'delivery') p.asignadoA = 'Repartidor 1';
    if (estado === 'entregado' && rnd(10) < 6) p.opinion = { estrellas: pick([5, 5, 5, 4, 4, 3]), recomendaria: rnd(10) < 8, texto: pick(['', '', 'Muy rico todo', 'Llegó calentito', 'Buena atención', 'El lomo, increíble']), t: t0 + 45 * MIN };
    filas.push({ id: p.id, data: p });
  };
  // En curso ahora: de cada tipo y en cada estado, para que la cocina se vea trabajando
  hacer('delivery', 6, 'recibido'); hacer('mesa', 3, 'recibido'); hacer('retiro', 2, 'recibido');
  hacer('delivery', 14, 'aceptado'); hacer('mesa', 11, 'aceptado');
  hacer('mesa', 19, 'preparacion'); hacer('retiro', 22, 'preparacion'); hacer('delivery', 24, 'preparacion');
  hacer('delivery', 41, 'listo'); hacer('mesa', 33, 'listo'); hacer('retiro', 30, 'listo');
  hacer('delivery', 52, 'camino');
  // Historia de la semana para el panel del dueño (con horas de almuerzo y cena, y algo más los fines de semana)
  const tipos = ['mesa', 'mesa', 'retiro', 'delivery', 'delivery'];
  for (let d = 6; d >= 0; d--) {
    const hoy0 = new Date(ahora); hoy0.setHours(0, 0, 0, 0);
    const base = hoy0.getTime() - d * DIA, dow = new Date(base).getDay(), cuantos = (dow === 5 || dow === 6 ? 9 : 5) + rnd(3);
    for (let k = 0; k < cuantos; k++) {
      const hora = rnd(10) < 5 ? 12.5 + rnd(30) / 10 : 19.5 + rnd(30) / 10;
      const haceMin = Math.round((ahora - (base + hora * 3600e3)) / MIN);
      if (haceMin > 90) hacer(pick(tipos), haceMin, rnd(14) === 0 ? 'cancelado' : 'entregado');
    }
  }
  const r1 = await importar(NEGOCIO, 'pedidos', PIN.dueno, filas.slice(0, 250));
  const r2 = filas.length > 250 ? await importar(NEGOCIO, 'pedidos', PIN.dueno, filas.slice(250)) : { ok: true };
  const visitas = Array.from({ length: 140 }, (_, i) => ({ id: 'zzv' + i, data: { t: ahora - rnd(7 * DIA - 3600e3), origen: pick(['QR de mesa', 'QR de mesa', 'QR de mesa', 'Directo', 'Otro sitio', 'Invitación de un cliente']) } }));
  const r3 = await importar(NEGOCIO, 'visitas', PIN.dueno, visitas);
  if (!r1.ok || !r2.ok || !r3.ok) throw new Error('No se pudieron cargar los datos de muestra: ' + JSON.stringify([r1, r2, r3]));
  return filas.length + ' pedidos y ' + visitas.length + ' visitas de muestra';
}

export async function limpiar() {
  const r = await Promise.all([vaciar(NEGOCIO, 'pedidos', PIN.dueno), vaciar(NEGOCIO, 'visitas', PIN.dueno)]);
  rmSync(COPIA, { recursive: true, force: true });
  return JSON.stringify(r);
}
