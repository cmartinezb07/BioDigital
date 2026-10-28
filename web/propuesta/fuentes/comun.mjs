import { WHATSAPP, WHATSAPP_VISIBLE, MAIL, DOMINIO_ANUAL, INSTAGRAM, SUPABASE_URL, SUPABASE_KEY } from './config.mjs';
// Contenido común de las opciones 3 a 8. Cada opción entrega su estética (o) y esto arma la página completa.
// o = { n, nombre, titulo, fuentes, css, hero, fondo, script, marca, tema, deco }
// Catálogo vigente desde el 11-oct-2026: seis productos con precio propio y un pack completo.

const ICONOS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-chev" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="3.3" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-book" viewBox="0 0 24 24"><path d="M5 4.5h9.5A3.5 3.5 0 0 1 18 8v11.5H8.5A3.5 3.5 0 0 1 5 16Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 9h5M9 12.5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-web" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 8.5h18M9 21h6M12 17.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m11 12 8-8m-3 3 2 2m-4 0 1.5 1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-walk" viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m9 21 2.5-6 2.5 2.5V21M8 12l3-4.5 3 1.5 2 3.5M11.5 15l-.5-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-learn" viewBox="0 0 24 24"><path d="m2.5 9 9.5-4.5L21.5 9 12 13.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11" fill="none" stroke="currentColor" stroke-width="1.5"/></symbol>
    <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.8 6.8a1.4 1.4 0 0 1-2 0Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/></symbol>
    <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
    <symbol id="i-send" viewBox="0 0 24 24"><path d="M4 12 20 4l-5 16-3.5-6.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24"><path d="M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-video" viewBox="0 0 24 24"><rect x="3" y="6" width="12.5" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m15.5 11.2 5.5-3.4v8.4l-5.5-3.4Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-qr" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5h3.2v3.2h-3.2zM20.5 13.5v7h-3.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 10.5h17M8 3.5v4M16 3.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="m9 15 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-card" viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="7.5" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><circle cx="16.5" cy="10" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 15h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
    <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.5 2.5 5 13.5h5.5L9.5 21.5 19 10h-5.8Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>
    <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
    <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
    <symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
    <symbol id="i-wa" viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.2 8.3c.3-.4.7-.3.9 0l.8 1.5c.1.3 0 .5-.2.7l-.5.5a5 5 0 0 0 2.2 2.2l.5-.5c.2-.2.5-.3.7-.2l1.5.8c.3.2.3.6 0 .9-.6.8-1.5 1.1-2.4.8a7.2 7.2 0 0 1-4.2-4.2c-.3-.9 0-1.8.7-2.5Z" fill="currentColor"/></symbol>
    <symbol id="i-ig" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></symbol>
    <symbol id="i-cart" viewBox="0 0 24 24"><path d="M3 4h2.5l2 11h10l2-8H7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.5" fill="currentColor"/><circle cx="17" cy="19" r="1.5" fill="currentColor"/></symbol>
    <symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5.5h16v11H11l-4.5 3.5v-3.5H4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></symbol>
  </defs>
</svg>`;

const chk = (w = 16) => `<svg class="check" width="${w}" height="${w}"><use href="#i-check"/></svg>`;
const ico = (id, w = 22) => `<span class="ico"><svg width="${w}" height="${w}"><use href="#i-${id}"/></svg></span>`;
const arrow = `<svg class="btn-ico" width="18" height="18"><use href="#i-arrow"/></svg>`;
const li = (items, w) => items.map((t) => `<li>${chk(w)}${t}</li>`).join('');
const agregar = (id, label = 'Agregar al carrito', main = true) => `<button class="btn ${main ? 'btn-main ' : ''}btn-sm" type="button" data-add="${id}" data-label="${label}" aria-pressed="false"><svg width="16" height="16" aria-hidden="true"><use href="#i-cart"/></svg><span class="add-t">${label}</span></button>`;
const clp = (n) => '$' + n.toLocaleString('es-CL');

// Los seis productos vigentes: id, ícono, nombre, precio, si el precio es "desde", qué es y qué recibes.
const SERVICIOS = [
  ['web', 'web', 'Página web', 49990, true, 'Un lugar propio en internet, rápido en el celular y con tu WhatsApp a la vista.',
    ['Hasta 5 secciones, hecha a tu medida', 'Botón de WhatsApp, mapa y horario', 'Se ve bien en el celular', 'Correo contacto@tunegocio.cl que llega a tu Gmail, sin mensualidad']],
  ['social-video', 'video', 'Videos para redes', 9990, true, 'Videos cortos para Instagram y TikTok, grabados y editados en tu local.',
    ['Video vertical de 15 a 30 segundos', 'Grabación, edición, música y textos', 'Quedan tuyos, para usarlos donde quieras']],
  ['interactive-menu', 'qr', 'Menú digital', 27990, true, 'Tu carta o lista de precios en un QR, sin cartas de papel.',
    ['QR impreso para las mesas o el mesón', 'Foto, descripción y precio por producto', 'Funciona en cualquier celular, sin instalar nada', 'Sin pedidos ni cocina: si los necesitas, mira el Menú digital PRO']],
  ['photography', 'camera', 'Registro fotográfico', 4990, false, 'Fotos reales de tu local y tus productos, listas para las redes, el menú y la web.',
    ['Sesión en tu local, sin estudio', '10 a 15 fotos editadas', 'Quedan tuyas, para usarlas donde quieras']],
  ['reservations', 'calendar', 'Sistema de reservas', 24990, true, 'Que te reserven hora desde el celular, sin llamadas ni mensajes cruzados.',
    ['Calendario con tus servicios y horarios', 'La solicitud te llega armada por WhatsApp y tú confirmas', 'Sin panel ni disponibilidad en vivo: si lo necesitas, mira el Sistema de reservas PRO']],
  ['loyalty-card', 'card', 'Tarjeta de fidelización', 9990, false, 'La tarjeta de sellos de toda la vida, pero en el celular del cliente.',
    ['QR con sellos, sin tarjetas de papel', 'Queda como acceso directo en el celular del cliente, sin instalar nada', 'Ves cuántos clientes están volviendo']],
];
const SUMA = SERVICIOS.reduce((t, s) => t + s[3], 0);   // 127.940
const PACK = 79990;
const PACK_5 = 69990;                                   // promoción para los primeros 5 clientes
const AHORRO = SUMA - PACK;                             // 47.950

// Versión PRO: sistemas con base de datos, panel y acceso por código. Llevan una mensualidad y el primer mes no se cobra.
const MENSUAL = 20000;
const PRO = [
  ['interactive-menu-pro', 'qr', 'Menú digital PRO', 99990, false, 'Tu carta que tú editas, con pedidos en la mesa, para retirar y con delivery, cocina y panel del jefe.',
    ['Carta editable por ti: fotos, precios, opciones y favoritos', 'Pedidos en la mesa, para retirar y con delivery', 'Pantalla de cocina y seguimiento del pedido para el cliente', 'Mapa con el repartidor en movimiento (delivery)', 'Panel del jefe con estadísticas; cada persona entra con su código']],
  ['reservations-pro', 'calendar', 'Sistema de reservas PRO', 99990, false, 'Calendario con disponibilidad en vivo: no se vende dos veces, y el cliente puede modificar o cancelar su reserva.',
    ['Calendario en vivo para alojamiento, tours, citas o arriendo por hora', 'El sistema calcula el precio, el depósito y la devolución según tu política', 'El cliente modifica o cancela su reserva', 'Panel con aviso sonoro de reserva nueva; entran el jefe y la recepción', 'Catálogo, horarios y promociones editables por ti, y reportes']],
];
const PACK_PRO = 150000, PACK_PRO_5 = 120000;            // pack con un sistema PRO (menú o reservas, a elección)
const precioDe = (id) => [...SERVICIOS, ...PRO].find((s) => s[0] === id)[3];
const SUMA_PRO = precioDe('web') + precioDe('interactive-menu-pro') + precioDe('loyalty-card') + precioDe('photography') + precioDe('social-video');   // 174.940
const AHORRO_PRO = SUMA_PRO - PACK_PRO;
const PACK_PRO_ITEMS = ['Página web', 'Menú digital PRO o Sistema de reservas PRO (a tu elección)', 'Tarjeta de fidelización', 'Registro fotográfico', '1 video para redes'];
// Orden en la lista de precios: cada PRO va justo después de su versión simple
const VISIBLES = SERVICIOS.flatMap((s) => s[0] === 'interactive-menu' ? [s, PRO[0]] : s[0] === 'reservations' ? [s, PRO[1]] : [s]);
const esPro = (id) => PRO.some((x) => x[0] === id);
// Precios de lanzamiento para los primeros 5 clientes: [sku, nombre, precio de lanzamiento, precio normal, mensualidad, "desde"]
const LANZ = [
  ['launch-web', 'Página web', 39990, precioDe('web'), false, true],
  ['launch-interactive-menu-pro', 'Menú digital PRO', 79990, precioDe('interactive-menu-pro'), true, false],
  ['launch-reservations-pro', 'Sistema de reservas PRO', 79990, precioDe('reservations-pro'), true, false],
  ['launch-loyalty-card', 'Tarjeta de fidelización', 5990, precioDe('loyalty-card'), false, false],
  ['launch-pack', 'Pack esencial (los seis)', PACK_5, PACK, false, false],
  ['launch-pro-pack', 'Pack PRO', PACK_PRO_5, PACK_PRO, true, false],
];
// Bloque de la mensualidad, en grande (lo usan el desglose de cada PRO y el pack PRO)
const mens = (corto) => corto ? `<div class="mens mens-corto" role="note"><b class="mens-grande"><svg width="22" height="22" aria-hidden="true"><use href="#i-bolt"/></svg>¡El primer mes no se paga mensualidad!</b><span>Después, <b class="num">${clp(MENSUAL)}</b> al mes (una sola por cliente).</span></div>` : `<div class="mens" role="note"><b class="mens-grande"><svg width="22" height="22" aria-hidden="true"><use href="#i-bolt"/></svg>¡El primer mes no se paga mensualidad!</b><span>Después son <b class="num">${clp(MENSUAL)}</b> al mes, una sola mensualidad aunque tengas más de un producto PRO. Incluye base de datos, hosting, soporte y los cambios de carta, precios y horarios.</span></div>`;

// Cómo funciona cada producto, en tres pasos (el flujo general está en PASOS).
const COMO = {
  web: ['Nos cuentas de tu negocio y elegimos las secciones', 'Armamos la página con tus fotos, textos y datos', 'La publicamos a tu nombre y la dejamos funcionando'],
  'social-video': ['Definimos contigo qué mostrar', 'Grabamos en tu local', 'Editamos y te lo entregamos listo para publicar'],
  'interactive-menu': ['Nos pasas tu carta y tus precios', 'Armamos el menú digital y el QR', 'Te entregamos el QR impreso, listo para usar'],
  photography: ['Coordinamos día y hora en tu local', 'Sacamos las fotos de tus productos y espacios', 'Editamos y te entregamos de 10 a 15 fotos'],
  reservations: ['Definimos tus horarios y servicios', 'Configuramos la agenda en línea', 'Tus clientes reservan solos, a cualquier hora'],
  'loyalty-card': ['Defines el premio y cuántos sellos lleva', 'Armamos la tarjeta con tu marca', 'Tus clientes la guardan en el celular y tú sumas sellos'],
  'interactive-menu-pro': ['Nos pasas tu carta, tus fotos, tus comunas y tus horarios', 'Dejamos andando la carta, los pedidos, la cocina y el panel, y probamos un pedido de cada tipo', 'Te damos los códigos de acceso y te enseñamos a usar el panel'],
  'reservations-pro': ['Nos cuentas qué reservan tus clientes y tus horarios, precios y políticas', 'Cargamos tu agenda, probamos una reserva completa y dejamos el panel listo', 'Te damos los códigos de acceso (jefe y recepción) y te enseñamos a usarlo'],
};
// Versión con más trabajo de un producto: se agrega aparte y se cotiza (hoy ninguna).
const EXTRA = {};
// Demos completas (páginas aparte) y su versión con más funciones: a cotizar, porque usan servicios con costo mensual o por uso.
const DEMO = {
  'interactive-menu-pro': ['ejemplos/fogon-del-sur/', 'Ver la demo del Menú digital PRO', 'Es el sistema real con datos de ejemplo: pide en la mesa, para retirar o con delivery, y entra al panel con los códigos de demostración. Con pedidos en línea reales, los pagos y mapas de terceros pueden tener costo aparte.'],
  'loyalty-card': ['ejemplos/fidelizacion/', 'Ver la tarjeta de ejemplo', 'Pruébala: crea tu tarjeta en tu celular y suma sellos desde la caja del local (con el PIN de demostración) en otro equipo.'],
  'reservations-pro': ['ejemplos/reservas/', 'Ver la demo del Sistema de reservas PRO', 'Es el sistema real con datos de ejemplo: reserva, modifica y cancela, y entra al panel con los códigos de demostración. Los avisos por WhatsApp y las pasarelas de pago cobran por uso, aparte.'],
};
const NOTA = { web: `Dominio .cl no incluido (${'$' + DOMINIO_ANUAL.toLocaleString('es-CL')} al año en NIC Chile). El hosting no tiene costo.` };

// Listas cerradas del formulario: no se aceptan valores fuera de ellas.
const RUBROS = ['Gastronomía', 'Belleza y peluquería', 'Taller o servicio técnico', 'Almacén o tienda', 'Salud', 'Otro'];
const COMUNAS_GC = ['Concepción', 'Talcahuano', 'Hualpén', 'San Pedro de la Paz', 'Chiguayante', 'Coronel', 'Lota', 'Penco', 'Tomé', 'Hualqui'];   // Gran Concepción: solo operamos aquí

const redes = (txt = 'Hola Bío Digital, quiero más información.') =>
  `<a class="btn btn-wa btn-solo" href="${wa(txt)}" target="_blank" rel="noopener" aria-label="Escribirnos por WhatsApp" title="WhatsApp"><svg width="22" height="22" aria-hidden="true"><use href="#i-wa"/></svg></a><a class="btn btn-ig btn-solo" href="https://www.instagram.com/${INSTAGRAM}/" target="_blank" rel="noopener" aria-label="Seguirnos en Instagram" title="Instagram"><svg width="22" height="22" aria-hidden="true"><use href="#i-ig"/></svg></a>`;
const wa = (txt) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`;

const PASOS = [
  ['search', 'Diagnóstico', 'Vemos juntos qué te falta', 'En el primer contacto revisamos tu negocio y te damos tu puntaje. Gratis y sin compromiso.'],
  ['send', 'Propuesta', 'Te decimos el precio', 'Eliges productos sueltos o el pack completo. El precio queda acordado antes de empezar.'],
  ['walk', 'Producción', 'Vamos a tu local', 'Fotos, videos y todo lo que necesite tu proyecto, en 3 a 7 días hábiles.'],
  ['key', 'Entrega', 'Todo queda a tu nombre', 'Te entregamos los accesos, con acta de entrega.'],
];

// Promociones de lanzamiento. La de los primeros 5 clientes va en su propio bloque.
// Ofertas relámpago: [ícono, nombre, precio, precio suelto, texto, sku, ¿PRO?, ¿precio "desde"?]. Siempre entre el precio normal y el de lanzamiento.
const PROMOS = [
  ['web', 'Página web + video', 52990, precioDe('web') + precioDe('social-video'), 'La web y un video para arrancar con presencia.', 'web-video', false, true],
  ['qr', 'Menú digital PRO + fotos', 89990, precioDe('interactive-menu-pro') + precioDe('photography'), 'El menú se ve mucho mejor con fotos tuyas.', 'menu-photography', true, false],
  ['calendar', 'Reservas PRO + fidelización', 94990, precioDe('reservations-pro') + precioDe('loyalty-card'), 'Que reserven solos y que además vuelvan.', 'reservations-loyalty', true, false],
  ['video', '2 videos para redes', 17990, 9990 * 2, 'Dos videos distintos, grabados el mismo día.', 'social-video-2', false, false],
  ['video', '3 videos para redes', 24990, 9990 * 3, 'Un mes de contenido resuelto en una sola visita.', 'social-video-3', false, false],
];

const PROMESAS = [
  ['key', 'Todo a tu nombre', 'La web, el menú y las cuentas quedan tuyas.'],
  ['check', 'Tu negocio funcionando', 'Lo probamos todo y te lo entregamos funcionando, con acta de entrega.'],
  ['walk', 'Vamos a tu local', 'Fotos y videos en tu local, en el Gran Concepción.'],
  ['bolt', 'Entrega rápida', 'De 3 a 7 días hábiles desde que tenemos tus fotos, textos y accesos.'],
];

const FAQ = [
  ['¿De verdad es gratis el diagnóstico?', 'Sí. Es nuestra primera conversación: revisamos juntos qué tiene tu negocio y qué le falta, y te decimos tu puntaje. No tienes que contratar nada después.'],
  ['¿Cuánto se demora?', 'Entre 3 y 7 días hábiles de trabajo desde que tenemos tus fotos, textos y accesos. Por eso tomamos casi todo en la visita.'],
  ['¿El dominio y el hosting están incluidos?', `El dominio .cl no está incluido: lo registra NIC Chile, cuesta ${clp(DOMINIO_ANUAL)} al año y queda a nombre del negocio. El hosting de la página web va en Cloudflare, sin costo para ti. Nosotros solo cobramos mensualidad en los productos PRO (menú digital y reservas con panel): $20.000 al mes, y el primer mes no se paga.`],
  ['¿Cuándo pago?', 'No cobramos anticipo. Pagas una sola vez, cuando tu trabajo está funcionando y firmamos el acta de entrega. Si contratas un producto PRO, la mensualidad parte recién el segundo mes.'],
  ['¿La tarjeta de fidelización funciona en cualquier celular?', 'Sí. Se abre en el navegador de cualquier celular y queda como acceso directo, sin instalar ninguna aplicación. Si quieres que además se guarde en Google Wallet o Apple Wallet, eso se cotiza aparte, porque esas plataformas cobran una mensualidad.'],
  ['¿Qué pasa si me demoro en mandar mis fotos o textos?', 'El plazo de producción se corre los mismos días y te avisamos.'],
  ['¿Tengo que saber de tecnología?', 'No. Nosotros hacemos todo y te lo dejamos funcionando.'],
  ['¿Dónde atienden?', 'Solo en el Gran Concepción: Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Coronel, Lota, Penco, Tomé y Hualqui. Vamos a tu local para las fotos y los videos.'],
  ['¿Qué hacen con mis datos?', 'Solo los usamos para hacer tu diagnóstico y contactarte por él.'],
  ['¿Quiénes son?', 'Somos una startup formada por cinco estudiantes de Ingeniería Civil Industrial de la Universidad de Concepción.'],
];

const pad = (i) => String(i + 1).padStart(2, '0');

export { SERVICIOS, SUMA, PACK, PACK_5, AHORRO, clp };
export { PRO, MENSUAL, LANZ, PACK_PRO, PACK_PRO_5, PACK_PRO_ITEMS };   // los usa propuestas/generar.mjs

export function pagina(o, publico = false) {
  if (publico && o.head) o = { ...o, head: o.head.split(String.fromCharCode(10)).filter((l) => !/paleta\.(css|js)/.test(l)).join(String.fromCharCode(10)) };
  const d = o.deco || {};
  const b = o.n === 8 ? '' : '../';   // prefijo de los archivos compartidos (css, js, marca)
  return `<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${o.titulo}</title>
<meta name="description" content="Bío Digital: páginas web, videos para redes, menús digitales, fotos, reservas y tarjetas de fidelización para micro y pequeñas empresas del Gran Concepción.">
<link rel="icon" href="${b}marca/favicon-32.png" sizes="32x32">
<link rel="icon" href="${b}marca/icono-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="${b}marca/apple-touch-icon.png">
<meta property="og:title" content="${o.titulo}">
<meta property="og:description" content="Páginas web, videos para redes, menús digitales, fotos, reservas y tarjetas de fidelización para micro y pequeñas empresas del Gran Concepción.">
<meta property="og:image" content="${b}marca/og.jpg">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<script>var t,q=location.search.match(/tema=(dark|light)/);try{t=localStorage.getItem('bd-theme')}catch(e){}if(q)t=q[1];document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'${o.tema}'</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${o.fuentes}&display=swap">
<link rel="stylesheet" href="${b}nucleo.css">
<link rel="stylesheet" href="${b}kit.css">
<link rel="stylesheet" href="${b}mascota.css">
<link rel="stylesheet" href="${b}gato.css">
<link rel="stylesheet" href="${b}tienda.css">
<link rel="stylesheet" href="${b}carrusel.css">
${o.head || ''}
<style>
${o.css.trim()}
${(o.mascota || '').trim()}
</style>
</head>
<body>
${o.fondo || ''}
<a class="skip" href="#contenido">Saltar al contenido</a>
${ICONOS}

${o.n === 8 ? (publico ? '' : '<p class="proto">Sitio de Bío Digital</p>') : `<p class="proto">Plantilla ${o.n} · ${o.nombre} · <a href="index.html">ver todas las plantillas</a> · <a href="../index.html">ir al sitio</a></p>`}

<header class="top">
  <nav class="nav" aria-label="Principal">
    <a class="brand" href="#" aria-label="Bío Digital, inicio">${o.marca}${o.marcaTexto === false ? '' : '<b>Bío Digital</b>'}</a>
    <ul class="nav-links" id="menu">
      <li><a href="#" aria-current="page">Inicio</a></li>
      ${o.ejemplos ? '<li><a href="#ejemplos">Ejemplos</a></li>' : ''}
      <li><a href="#planes">Precios</a></li>
      <li><a href="#promos">Promociones</a></li>
      <li><a href="#contacto">Contacto</a></li>
    </ul>
    <div class="nav-actions">
      <button class="icon-btn cart-btn" type="button" data-cart-open aria-label="Abrir el carrito"><svg width="20" height="20"><use href="#i-cart"/></svg><span data-cart-count hidden>0</span></button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Cambiar tema"><svg width="20" height="20"><use href="#i-sun"/></svg></button>
      <button class="icon-btn menu-btn" type="button" aria-controls="menu" aria-expanded="false" aria-label="Abrir menú"><svg width="20" height="20"><use href="#i-menu"/></svg></button>
      <a class="btn btn-main btn-sm" href="#diagnostico">Diagnóstico gratis</a>
    </div>
  </nav>
</header>

<main id="contenido">
${o.hero.trim()}

  <section id="proceso" aria-labelledby="t-como">
    <div class="wrap sec-grid">
      <div class="reveal">
        <h2 id="t-como" class="h2">Así te vamos avisando</h2>
        <p class="lead">Del diagnóstico a la entrega, siempre sabes en qué va tu proyecto.</p>
        <p class="antes-link" style="text-align:left"><a href="${b}como-trabajamos/">Mira el cronograma real de un proyecto, día por día ${arrow}</a></p>
      </div>
      <ol class="steps" aria-label="Ejemplo de avisos del proceso">
        ${PASOS.map(([ic, etapa, t, p], i) => `<li class="step reveal"${d.shine ? ' data-shine' : ''}>${ico(ic)}<div><header><span>${etapa}</span><span>Paso ${i + 1}</span></header><b>${t}</b><p>${p}</p></div></li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section id="planes" aria-labelledby="t-planes">
    <div class="wrap">
      <div class="sec-head center reveal">
        <h2 id="t-planes" class="h2">Precios claros, producto por producto</h2>
        <p class="muted">Pagas una vez por lo que te hacemos y queda a tu nombre. Solo los productos <b class="pro-txt">PRO</b> llevan <b class="num">${clp(MENSUAL)}</b> al mes, y <b>el primer mes no se paga</b>.</p>
      </div>
      <div class="precios">
        <div class="tarifario reveal" data-seq>
          ${VISIBLES.map(([id, ic, t, precio, desde, p, items]) => `<div class="item${esPro(id) ? ' item-pro' : ''}" id="svc-${id}"${d.shine ? ' data-shine' : ''}>
            <button class="fila" type="button" aria-expanded="false" aria-controls="det-${id}"${esPro(id) ? ' data-gato="pro"' : ''}>${ico(ic, 18)}<b>${esPro(id) ? t.replace(/ PRO$/, '') + '<span class="pro">PRO</span>' : t}</b><span class="num">${desde ? '<small>desde</small> ' : ''}${clp(precio)}${esPro(id) ? '<small class="mes-fila">+ ' + clp(MENSUAL) + '/mes</small>' : ''}</span><svg class="chev" width="18" height="18" aria-hidden="true"><use href="#i-chev"/></svg></button>
            <div class="det" id="det-${id}" hidden>
              <p>${p}</p>
              <div class="det-cols">
                <div><h4>Qué incluye</h4><ul>${li(items, 15)}</ul></div>
                <div><h4>Cómo funciona</h4><ol>${COMO[id].map((x) => `<li>${x}</li>`).join('')}</ol></div>
              </div>
              ${EXTRA[id] ? `<div class="det-extra"><div><h4>${EXTRA[id].titulo} <span class="rec">${EXTRA[id].cuesta}</span></h4><p>${EXTRA[id].texto}</p><small>${EXTRA[id].precio}</small></div>${agregar(EXTRA[id].id, 'Agregar la versión interactiva', false)}</div>` : ''}
              ${DEMO[id] ? `<p class="det-demo"><a href="${b}${DEMO[id][0]}">${DEMO[id][1]} ↗</a><small>${DEMO[id][2]}</small></p>` : ''}
              ${esPro(id) ? mens() : ''}
              <div class="det-foot"><span class="num">${desde ? '<small>desde</small> ' : ''}${clp(precio)}${esPro(id) ? `<small>Instalación única. Mensualidad ${clp(MENSUAL)} desde el 2.º mes</small>` : ''}${NOTA[id] ? `<small>${NOTA[id]}</small>` : ''}</span>${agregar(id)}</div>
            </div>
          </div>`).join('\n          ')}
          <p class="fila total"><b>Los seis simples por separado</b><span class="num">${clp(SUMA)}</span></p>
        </div>
        <div class="packs">
          <article class="pack reveal"${d.shine ? ' data-shine' : ''}>
            <div class="plan-top"><h3 class="h3">Pack esencial</h3><span class="rec">Sin mensualidad</span></div>
            <p class="price"><small>los seis productos simples</small><b class="num">${clp(PACK)}</b></p>
            <p class="ahorro">Te ahorras <b>${clp(AHORRO)}</b> frente a comprarlos sueltos</p>
            <ul data-seq>${li(SERVICIOS.map((s) => s[2]))}</ul>
            <div class="mens mens-corto mens-sin" role="note"><b class="mens-grande"><svg width="22" height="22" aria-hidden="true"><use href="#i-check"/></svg>Sin mensualidad</b><span>Pagas una vez y queda a tu nombre.</span></div>
            ${agregar('full-pack', 'Agregar el pack esencial')}
          </article>
          <article class="pack pack-pro reveal"${d.shine ? ' data-shine' : ''}>
            <div class="plan-top"><h3 class="h3">Pack PRO</h3><span class="rec">Lo más completo</span></div>
            <p class="price"><small>con un sistema PRO</small><b class="num">${clp(PACK_PRO)}</b></p>
            <p class="ahorro">Te ahorras <b>${clp(AHORRO_PRO)}</b> frente a comprarlos sueltos</p>
            <ul data-seq>${li(PACK_PRO_ITEMS)}</ul>
            ${mens(true)}
            ${agregar('pro-pack', 'Agregar el pack PRO')}
          </article>
        </div>
      </div>
      <ul class="promises reveal" data-seq aria-label="Lo que viene con cualquier producto">
        ${PROMESAS.map(([ic, bb, s]) => `<li>${ico(ic, 20)}<div><b>${bb}</b><span>${s}</span></div></li>`).join('\n        ')}
      </ul>
      <p class="antes-link reveal">¿Estás comparando? <a href="${b}antes-de-contratar/">Mira las fallas que más se repiten en el mercado y qué preguntar antes de pagar ${arrow}</a></p>
    </div>
  </section>

  <section id="promos" aria-labelledby="t-promos">
    <div class="wrap">
      <div class="gift-box reveal" id="beneficio">
        <div class="gift-text">
          <span class="gift-ico"><svg class="gift" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5v7h14v-7M12 12.5v7"/><g class="lid"><rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M12 8v4.5M12 8c-1.5-3.5-5.5-3.5-5.5-1 0 1 1 1 5.5 1Zm0 0c1.5-3.5 5.5-3.5 5.5-1 0 1-1 1-5.5 1Z"/></g></svg></span>
          <div>
            <h2 id="t-promos">Precio de lanzamiento para los primeros 5 clientes</h2>
            <p>Los primeros 5 clientes pagan menos en cada producto. Cupos limitados. Los productos PRO llevan ${clp(MENSUAL)} al mes desde el segundo mes: <b>el primer mes no se paga</b>.</p>
          </div>
        </div>
        <ul class="lanz">
          ${LANZ.map(([sku, t, precio, normal, mensual, desde]) => `<li><span class="lanz-t">${t}${mensual ? '<span class="pro">PRO</span>' : ''}</span><span class="lanz-p"><b class="num">${desde ? '<small>desde</small> ' : ''}${clp(precio)}</b><s class="num">${clp(normal)}</s></span>${agregar(sku, 'Agregar', false)}</li>`).join('\n          ')}
        </ul>
        <p class="lanz-nota">Las ofertas relámpago de abajo no se suman al precio de lanzamiento.</p>
      </div>

      <div class="sec-head reveal promo-head" id="relampago">
        <h2 class="h2">Ofertas relámpago</h2>
        <p class="muted">Combinaciones a precio rebajado por tiempo limitado: llegan, brillan y se van.</p>
      </div>
      <div class="promos">
        ${PROMOS.map(([ic, t, precio, normal, p, sku, pro, desde], i) => `<article class="promo promo-rayo reveal"${d.shine ? ' data-shine' : ''} style="--i:${i}">
          <svg class="rayo" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2.5 5 13.5h5.5L9.5 21.5 19 10h-5.8Z"/></svg>
          <div class="promo-top">${ico(ic, 20)}<span class="flash"><svg width="13" height="13"><use href="#i-bolt"/></svg>Relámpago</span></div>
          <h3 class="h3">${t}${pro ? '<span class="pro">PRO</span>' : ''}</h3>
          <p class="promo-price"><b class="num">${desde ? '<small>desde</small> ' : ''}${clp(precio)}</b><s class="num">${clp(normal)}</s></p>
          <p class="promo-save">Ahorras ${clp(normal - precio)}</p>
          <p class="promo-txt">${p}</p>
          ${pro ? `<p class="promo-mens">+ ${clp(MENSUAL)}/mes · <b>primer mes gratis</b></p>` : ''}
          ${agregar(sku, 'Agregar al carrito', false)}
        </article>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section aria-labelledby="t-pedir">
    <div class="wrap">
      <div class="ask reveal" id="diagnostico">
        <div>
          <h2 id="t-pedir" class="h2">Pide tu <span class="accent">diagnóstico gratis</span></h2>
          <p class="muted">Revisamos tu negocio contigo y te damos tu puntaje de 100. Recién ahí hablamos de precios.</p>
          <div class="ask-alt">
            <b>¿Prefieres escribirnos?</b>
            <p><a href="mailto:${MAIL}">${MAIL}</a></p>
            <span class="redes">${redes()}<small>${WHATSAPP_VISIBLE} · @${INSTAGRAM}</small></span>
          </div>
        </div>
        <form data-pedido data-seq novalidate data-mail="${MAIL}" data-wa="${WHATSAPP}" data-sb-url="${SUPABASE_URL}" data-sb-key="${SUPABASE_KEY}" aria-label="Pedido y solicitud de diagnóstico">
          <div class="hp" aria-hidden="true"><label>No llenar<input name="sitio" tabindex="-1" autocomplete="off"></label></div>
          <p class="pedido-resumen"><b>Tu pedido:</b> <span data-pedido-resumen></span></p>
          <label>Tu nombre<input name="nombre" autocomplete="name" placeholder="Ej.: Carolina Pérez" maxlength="60" required aria-describedby="e-nombre"><span class="err" id="e-nombre" data-err="nombre" role="alert"></span></label>
          <label>Nombre del negocio<input name="negocio" autocomplete="organization" placeholder="Ej.: Panadería del Cerro" maxlength="60" required data-negocio aria-describedby="e-negocio"><span class="err" id="e-negocio" data-err="negocio" role="alert"></span></label>
          <label>Rubro<select name="rubro" required aria-describedby="e-rubro"><option value="" selected disabled>Elige tu rubro</option>${RUBROS.map((r) => `<option>${r}</option>`).join('')}</select><span class="err" id="e-rubro" data-err="rubro" role="alert"></span></label>
          <label>Comuna<select name="comuna" required aria-describedby="e-comuna"><option value="" selected disabled>Elige tu comuna</option>${COMUNAS_GC.map((c) => `<option>${c}</option>`).join('')}</select><span class="err" id="e-comuna" data-err="comuna" role="alert"></span></label>
          <label>Correo<input name="correo" type="email" autocomplete="email" placeholder="tu@correo.cl" maxlength="80" required aria-describedby="e-correo"><span class="err" id="e-correo" data-err="correo" role="alert"></span></label>
          <label><span>Celular <small>(opcional)</small></span><input name="telefono" type="tel" autocomplete="tel" placeholder="+56 9 1234 5678" maxlength="16" inputmode="tel" aria-describedby="e-telefono"><span class="err" id="e-telefono" data-err="telefono" role="alert"></span></label>
          <label class="full" data-interes><span>¿Qué te interesa? <small>(opcional)</small></span><select name="interes" aria-describedby="e-interes"><option value="" selected>Todavía no lo sé</option>${VISIBLES.map((s) => `<option>${s[2]}</option>`).join('')}<option>El pack esencial</option><option>El pack PRO</option></select><span class="err" id="e-interes" data-err="interes" role="alert"></span></label>
          <label class="check-row"><input type="checkbox" name="beneficio" data-benefit-check>Me interesa el precio de lanzamiento para los primeros 5 clientes.</label>
          <label class="check-row"><input type="checkbox" name="acepto" required aria-describedby="e-acepto"><span>Acepto la <a href="${b}privacidad/" target="_blank" rel="noopener">política de privacidad</a> y que me contacten por este pedido.</span></label>
          <span class="err full" id="e-acepto" data-err="acepto" role="alert"></span>
          <div class="envios">
            <button class="btn btn-main" type="button" data-enviar="correo"><svg width="18" height="18" aria-hidden="true"><use href="#i-mail"/></svg>Enviar por correo</button>
            <button class="btn btn-wa btn-solo" type="button" data-enviar="whatsapp" aria-label="Enviar por WhatsApp" title="Enviar por WhatsApp"><svg width="22" height="22" aria-hidden="true"><use href="#i-wa"/></svg></button>
          </div>
          <p class="pedido-aviso">Se abre tu correo o WhatsApp con el pedido ya escrito; solo falta que presiones enviar. Confirmaremos el servicio y el monto antes de enviarte un enlace de pago.</p>
          <p class="form-status" role="status"></p>
        </form>
      </div>
    </div>
  </section>

  <section id="preguntas" aria-labelledby="t-faq">
    <div class="wrap faq-grid">
      <div class="faq-side reveal">
        <h2 id="t-faq" class="h2">Preguntas frecuentes</h2>
        <p class="muted">¿No está tu duda? Escríbenos a <a href="mailto:${MAIL}">${MAIL}</a>.</p>
      </div>
      <div class="faq">
        ${FAQ.map(([q, a], i) => `<details class="reveal"${d.shine ? ' data-shine' : ''}><summary><span class="n">${pad(i)}</span><span>${q}</span><svg class="faq-i" width="20" height="20" aria-hidden="true"><use href="#i-plus"/></svg></summary><p>${a}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section id="contacto" aria-labelledby="t-final">
    <div class="wrap">
      <div class="final reveal">
        ${d.final || ''}
        <h2 id="t-final" class="h2">¿Tu negocio está listo <span class="accent">para vender en internet?</span></h2>
        <p>Te lo decimos gratis en la primera conversación. Recibimos solicitudes 24/7 y respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
        <div class="cta-row">
          <a class="btn btn-main" href="#diagnostico">Pide tu diagnóstico gratis ${arrow}</a>
          ${redes()}
          <a class="btn" href="mailto:${MAIL}">${MAIL}</a>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="site-foot">
  <div class="wrap">
    <div class="foot reveal">
      <div><strong>Bío Digital</strong><br>Presencia digital para micro y pequeñas empresas.<br>Atendemos en el Gran Concepción</div>
      <nav aria-label="Pie de página"><ul><li><a href="#planes">Precios</a></li><li><a href="#promos">Promociones</a></li><li><a href="${b}como-trabajamos/">Cómo trabajamos</a></li><li><a href="${b}antes-de-contratar/">Antes de contratar</a></li><li><a href="#contacto">Contacto</a></li><li><a href="${b}privacidad/">Privacidad</a></li><li><a href="${b}terminos/">Términos</a></li></ul></nav>
      <div>${MAIL}<br>© 2026 Bío Digital</div>
    </div>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Volver arriba"><svg width="20" height="20"><use href="#i-up"/></svg></button>
<div class="dock" role="region" aria-label="Acciones rápidas">
  <a class="btn btn-main" href="#diagnostico">Diagnóstico gratis</a>
  ${redes()}
</div>
<script src="${b}mundo.js"></script>
<div class="cart-fondo" hidden></div>
<aside class="cart" id="carrito" role="dialog" aria-modal="true" aria-label="Tu carrito" data-cart-checkout hidden>
  <header><h2>Tu carrito</h2><button class="cart-x" type="button" aria-label="Cerrar el carrito">×</button></header>
  <div class="cart-cuerpo">
    <p class="cart-vacio" data-cart-vacio>Todavía no agregas nada. Abre un producto en la sección de precios y presiona "Agregar al carrito".</p>
    <ul data-cart-list></ul>
  </div>
  <div class="cart-pie" data-cart-pie hidden>
    <p class="cart-total"><span>Total</span><b data-cart-total>$0</b></p>
    <p class="cart-tip" data-cart-tip hidden></p>
    <p class="cart-mens" data-cart-mensual hidden></p>
    <p class="cart-nota">Los precios "desde" se confirman en el diagnóstico gratis. Dominio .cl no incluido ($10.000 al año en NIC Chile).</p>
    <p class="cart-payment-state" data-cart-payment-state role="status" aria-live="polite"></p>
    <button class="btn btn-main cart-pay" type="button" data-cart-pay data-mp-checkout-cta="checkout-pro" hidden disabled><span class="btn-label">Pagar con Mercado Pago</span></button>
    <a class="btn btn-main cart-pay" data-cart-manual-pay target="_blank" rel="noopener noreferrer" hidden>Abrir pago en Mercado Pago ↗</a>
    <button class="btn cart-quote" type="button" data-cart-pedir>Continuar para cotizar</button>
    <button class="cart-link" type="button" data-cart-seguir>Seguir mirando</button>
    <button class="cart-link" type="button" data-cart-vaciar>Vaciar carrito</button>
  </div>
</aside>
<script type="application/json" id="catalogo">${JSON.stringify([
  ...SERVICIOS.map((x) => ({ id: x[0], nombre: x[2], precio: x[3], desde: x[4], promocion: false })),
  ...PRO.map((x) => ({ id: x[0], nombre: x[2], precio: x[3], desde: false, promocion: false, mensual: MENSUAL })),
  { id: 'full-pack', nombre: 'Pack esencial', precio: PACK, desde: false, promocion: false },
  { id: 'pro-pack', nombre: 'Pack PRO', precio: PACK_PRO, desde: false, promocion: false, mensual: MENSUAL },
  ...LANZ.map((x) => ({ id: x[0], nombre: x[1] + ' (lanzamiento)', precio: x[2], desde: x[5], promocion: true, ...(x[4] ? { mensual: MENSUAL } : {}) })),
  ...PROMOS.map((x) => ({ id: x[5], nombre: x[1], precio: x[2], desde: !!x[7], promocion: true, ...(x[6] ? { mensual: MENSUAL } : {}) }))
])}</script>
<script src="${b}secciones.js"></script>
<script src="${b}tienda.js"></script>
<script src="${b}carrusel.js"></script>
${(o.mascotaJs || ['gato.js', 'mascota-gato.js', 'mascota.js']).map((f) => `<script src="${b}${f}"></script>`).join('\n')}
${o.n === 8 ? '<script type="module" src="fuentes/pagos.mjs"></script>\n' : ''}${o.script ? o.script.trim() : ''}
</body>
</html>
`;
}
