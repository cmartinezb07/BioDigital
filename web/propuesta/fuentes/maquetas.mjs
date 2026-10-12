// Maquetas en imagen (SVG) de ejemplo para el carrusel de la portada: una por rubro, en español.
// Son ilustraciones, no páginas reales. Cuando exista la página completa de cada una, se pone su dirección en `url`
// y la imagen pasa a abrirla en una pestaña nueva. Regenerar con: node fuentes/generar.mjs 8
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const EJEMPLOS = [
  {
    id: 'restaurante', rubro: 'Restaurantes', url: '', disenio: 'gigante',
    nombre: 'Fogón del Sur', links: ['Carta', 'Reservas', 'Cómo llegar'], boton: 'Reservar mesa',
    titular: ['Fogón', 'del Sur'], sub: ['Cocina a las brasas en el centro de Concepción.', 'Almuerzo de lunes a sábado, cena de miércoles a sábado.'],
    c: { bg: '#141414', fg: '#fdeee3', ac: '#e8823f', ac2: '#f6b98a', card: '#201d1b' }, tarjetas: ['Nuestra carta', 'Reserva tu mesa', 'Cómo llegar'],
  },
  {
    id: 'peluqueria', rubro: 'Peluquerías', url: '', disenio: 'izq',
    nombre: 'Estudio Alma', links: ['Servicios', 'Equipo', 'Agenda'], boton: 'Reservar hora',
    titular: ['Tu mejor versión,', 'con hora agendada'], sub: ['Corte, color y tratamientos en el centro.', 'Agenda en línea, sin llamadas.'],
    c: { bg: '#fbf1ec', fg: '#3d1f1a', ac: '#d9644a', ac2: '#f2b8a8', card: '#ffffff' }, tarjetas: ['Corte y peinado', 'Color y mechas', 'Tratamientos'], serif: true,
  },
  {
    id: 'tecnico', rubro: 'Servicio técnico', url: '', disenio: 'centro',
    nombre: 'TecnoRápido', links: ['Servicios', 'Cotizar', 'Contacto'], boton: 'Cotizar ahora',
    titular: ['Reparamos tu notebook', 'y tu celular, sin vueltas'], sub: ['Cuéntanos qué le pasa a tu equipo y te respondemos hoy.'],
    c: { bg: '#f3f4f6', fg: '#14161a', ac: '#0b5cff', ac2: '#9dbcff', card: '#ffffff' }, tarjetas: ['Presupuesto sin costo', 'Retiro a domicilio', 'Seguimiento por WhatsApp'], caja: '¿Qué equipo tienes?',
  },
  {
    id: 'cabanas', rubro: 'Cabañas y arriendos', url: '', disenio: 'izq',
    nombre: 'Cabañas Los Copihues', links: ['Cabañas', 'Tarifas', 'Cómo llegar'], boton: 'Ver disponibilidad',
    titular: ['Tu escape al sur,', 'con reserva directa'], sub: ['Cabañas equipadas entre el bosque y el río.', 'Consulta fechas y reserva sin intermediarios.'],
    c: { bg: '#e8ede8', fg: '#232a1d', ac: '#4f5b34', ac2: '#a9b48a', card: '#f6f8f5' }, tarjetas: ['Fotos de las cabañas', 'Tarifas por noche', 'Cómo llegar'],
  },
  {
    id: 'almuerzos', rubro: 'Delivery y cafeterías', url: '', disenio: 'centro',
    nombre: 'Casa Dulce', links: ['Menú', 'Pedidos', 'Local'], boton: 'Hacer pedido',
    titular: ['Almuerzos y café,', 'ahora con pedidos en línea'], sub: ['Elige tu menú del día y retíralo o te lo llevamos.'],
    c: { bg: '#f04e23', fg: '#fff7f0', ac: '#fff7f0', ac2: '#ffd3c2', card: '#fff1ea', acTexto: '#c23a14' }, tarjetas: ['Menú del día', 'Pedidos para oficinas', 'Retiro en local'], caja: '¿Dónde lo recibes?',
  },
  {
    id: 'estetica', rubro: 'Estética y bienestar', url: '', disenio: 'izq',
    nombre: 'Centro Aurora', links: ['Tratamientos', 'Planes', 'Agenda'], boton: 'Reservar sesión',
    titular: ['Tu pausa del día,', 'cuando tú quieras'], sub: ['Masajes y tratamientos faciales con hora confirmada.', 'Agenda en línea en un minuto.'],
    c: { bg: '#2a1a14', fg: '#fdeee3', ac: '#e89a5c', ac2: '#6d3a24', card: '#3a251c', grad: ['#7a4126', '#2a1a14'] }, tarjetas: ['Masajes', 'Faciales', 'Packs de sesiones'], serif: true,
  },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (x, y, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.s || 14}" fill="${o.f}" font-weight="${o.w || 400}" text-anchor="${o.a || 'start'}" font-family="${o.fam}" ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(txt)}</text>`;

// Panel que hace de foto: degradado con círculos y la marca "Aquí va tu foto" (no hay fotos reales todavía)
function foto(id, x, y, w, h, c, r = 14, etiqueta = false) {
  const g = c.grad || [c.ac, c.ac2];
  return `<defs><linearGradient id="g-${id}-${x}-${y}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></linearGradient><clipPath id="k-${id}-${x}-${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>
  <g clip-path="url(#k-${id}-${x}-${y})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#g-${id}-${x}-${y})"/>
  <circle cx="${x + w * .72}" cy="${y + h * .3}" r="${h * .32}" fill="#fff" opacity=".18"/><circle cx="${x + w * .3}" cy="${y + h * .78}" r="${h * .4}" fill="#000" opacity=".12"/></g>
  ${etiqueta ? `<rect x="${x + 12}" y="${y + h - 34}" width="108" height="22" rx="11" fill="#000" opacity=".35"/>
  <text x="${x + 66}" y="${y + h - 19}" font-size="11" fill="#fff" text-anchor="middle" font-family="sans-serif">Aquí va tu foto</text>` : ''}`;
}

export function svg(e) {
  const c = e.c, fam = e.serif ? 'Georgia, \'Times New Roman\', serif' : 'Arial, Helvetica, sans-serif', sans = 'Arial, Helvetica, sans-serif';
  const btnTxt = c.acTexto || (e.id === 'estetica' || e.id === 'restaurante' ? '#1a0f0a' : '#ffffff');
  const o = (f, extra = {}) => ({ f, fam, ...extra });
  let h = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Ejemplo ilustrativo de página para ${esc(e.rubro.toLowerCase())}: ${esc(e.nombre)}">
  <rect width="800" height="500" fill="${c.bg}"/>`;
  // Barra de navegación
  h += T(36, 46, e.nombre, o(c.fg, { s: 20, w: 700 }));
  e.links.forEach((l, i) => { h += T(430 + i * 92, 45, l, o(c.fg, { s: 13, fam: sans })).replace('<text', '<text opacity=".75"'); });
  h += `<rect x="676" y="28" width="88" height="26" rx="13" fill="${c.ac}"/>` + T(720, 45, 'Contacto', { f: btnTxt, fam: sans, s: 12, w: 700, a: 'middle' });
  const boton = (x, y) => `<rect x="${x}" y="${y}" width="170" height="42" rx="21" fill="${c.ac}"/>` + T(x + 85, y + 26, e.boton, { f: btnTxt, fam: sans, s: 14, w: 700, a: 'middle' });
  if (e.disenio === 'gigante') {
    h += T(36, 190, e.titular[0], o(c.fg, { s: 128, w: 700, fam: 'Georgia, serif' })).replace('<text', '<text font-style="italic"');
    h += T(36, 290, e.titular[1], o(c.ac2, { s: 96, w: 700, fam: 'Georgia, serif' })).replace('<text', '<text font-style="italic"');
    e.sub.forEach((s, i) => { h += T(36, 330 + i * 20, s, o(c.fg, { s: 13, fam: 'Courier New, monospace' })).replace('<text', '<text opacity=".8"'); });
    h += boton(36, 384);
    h += foto(e.id, 430, 316, 334, 150, c);
  } else if (e.disenio === 'izq') {
    e.titular.forEach((l, i) => { h += T(36, 140 + i * 50, l, o(c.fg, { s: 42, w: 700 })); });
    e.sub.forEach((s, i) => { h += T(36, 252 + i * 22, s, o(c.fg, { s: 15, fam: sans })).replace('<text', '<text opacity=".8"'); });
    h += boton(36, 304);
    h += foto(e.id, 450, 84, 314, 246, c, 18);
    h += T(36, 390, 'Lo más pedido', o(c.fg, { s: 12, w: 700, fam: sans, ls: 1 })).replace('<text', '<text opacity=".6"');
    e.tarjetas.forEach((t, i) => {
      const x = 36 + i * 244;
      h += `<rect x="${x}" y="402" width="228" height="68" rx="14" fill="${c.card}"/><circle cx="${x + 30}" cy="436" r="14" fill="${c.ac}" opacity=".9"/>` + T(x + 54, 441, t, { f: e.id === 'estetica' ? c.fg : '#1c1c1c', fam: sans, s: 14, w: 700 });
    });
  } else {
    e.titular.forEach((l, i) => { h += T(400, 130 + i * 48, l, o(c.fg, { s: 40, w: 700, a: 'middle' })); });
    e.sub.forEach((s, i) => { h += T(400, 224 + i * 22, s, o(c.fg, { s: 15, fam: sans, a: 'middle' })).replace('<text', '<text opacity=".8"'); });
    const claro = e.id === 'almuerzos';
    h += `<rect x="220" y="256" width="360" height="52" rx="26" fill="${claro ? '#fff7f0' : '#ffffff'}" ${claro ? '' : `stroke="${c.ac2}"`}/>`;
    h += T(246, 287, e.caja, { f: '#6b6b6b', fam: sans, s: 14 });
    h += `<rect x="458" y="262" width="114" height="40" rx="20" fill="${claro ? '#c23a14' : c.ac}"/>` + T(515, 287, e.boton.split(' ')[0], { f: '#fff', fam: sans, s: 13, w: 700, a: 'middle' });
    e.tarjetas.forEach((t, i) => {
      const x = 36 + i * 244;
      h += `<rect x="${x}" y="344" width="228" height="126" rx="16" fill="${c.card}"/>` + foto(e.id + i, x + 10, 354, 208, 62, { ...c, ac: c.ac === '#fff7f0' ? '#f7a07f' : c.ac }, 10, false);
      h += T(x + 16, 442, t, { f: '#1c1c1c', fam: sans, s: 14, w: 700 });
      h += `<rect x="${x + 16}" y="452" width="${60 + i * 14}" height="6" rx="3" fill="${c.ac2}" opacity=".7"/>`;
    });
  }
  h += '</svg>';
  return h;
}

export function escribirMaquetas() {
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'ejemplos');
  mkdirSync(dir, { recursive: true });
  for (const e of EJEMPLOS) writeFileSync(join(dir, `${e.id}.svg`), svg(e));
}
