// Página "Antes de contratar" (antes-de-contratar/index.html): las fallas que se repiten en el mercado y cómo las evitamos.
// No nombra marcas: las fuentes con nombre y las cifras están en memoria/competencia.md (§10). Revisar cada 3 meses.
import { DOMINIO_ANUAL } from './config.mjs';
import { plantilla } from './legales.mjs';

const clp = (n) => '$' + n.toLocaleString('es-CL');
const REVISADO = '23 de octubre de 2026';

// Una falla: lo que vimos (con su fuente) frente a cómo lo hacemos.
const fx = (mal, fuente, bien, nuevo = false) => `<div class="fx">
      <div class="fx-mal"><p class="fx-eti">Lo que vimos</p><p>${mal}</p><p class="fx-fuente">Fuente: ${fuente}</p></div>
      <div class="fx-bien"><p class="fx-eti">Cómo lo hacemos${nuevo ? ' <span class="fx-nuevo">Nuevo</span>' : ''}</p><p>${bien}</p></div>
    </div>`;

const ANTES_DOC = {
  titulo: 'Antes de contratar',
  etiqueta: 'Compara antes de elegir',
  resumen: 'Revisamos reclamos, reseñas y letra chica de quienes hacen páginas, menús y reservas para pymes. Estas son las fallas que más se repiten y cómo las evitamos.',
  vigencia: `Revisado el ${REVISADO}. No nombramos marcas: la idea es que sepas qué preguntar, no apuntar a nadie.`,
  secciones: [
    ['En simple', `<ul>
      <li>El dominio de tu negocio tiene que quedar <strong>a tu nombre</strong>, no al de quien te hace la página.</li>
      <li>Antes de pagar un anticipo, pide <strong>por escrito</strong> qué incluye, cuánto cuesta y en qué plazo.</li>
      <li>Pregunta qué vas a pagar <strong>cada mes o cada año</strong>, y a quién. "Pago único" no siempre lo es.</li>
      <li>Tu página tiene que poder <strong>irse contigo</strong> si cambias de proveedor.</li>
    </ul>`],
    ['El dominio queda a nombre de otro', fx(
      'Clientes que pagaron una página y nunca recibieron las claves, o que quedaron con el dominio inscrito a nombre del desarrollador. Para recuperarlo tenían que pagar una página nueva y perder la dirección que sus clientes ya conocían.',
      'reclamos publicados por clientes en sitios de reclamos chilenos (2023 a 2025).',
      'El dominio .cl se inscribe en NIC Chile a nombre de tu negocio, y lo puedes comprobar tú mismo en nic.cl. Las claves y accesos te los entregamos con un acta de entrega firmada.')],
    ['Pagas el anticipo sin nada por escrito', fx(
      'Proveedores que piden el 50 % por adelantado sin un presupuesto formal ni condiciones por escrito. Cuando el trabajo no llega, no hay cómo reclamar qué se había prometido.',
      'reclamos publicados por clientes en sitios de reclamos chilenos (2025).',
      'Primero te mandamos una propuesta con lo que incluye, el precio final y el plazo. El contrato se cierra cuando la aceptas por escrito. El saldo lo pagas cuando todo funciona y firmamos el acta.')],
    ['El pago único que se renueva cada año', fx(
      'Agencias que cobran el diseño una sola vez, pero la página vive en su alojamiento: un plan que se renueva cada año (para pymes, del orden de $60.000 + IVA al año, aprox.). El dominio suele venir gratis solo el primer año.',
      'precios publicados por agencias chilenas, revisados en octubre de 2026 (valores aproximados).',
      `La página se aloja en Cloudflare, sin costo para ti (según sus condiciones vigentes). Lo único que se paga cada año es el dominio, cerca de ${clp(DOMINIO_ANUAL)}, directo a NIC Chile y no a nosotros (verifica el valor en nic.cl). No cobramos mensualidad.`)],
    ['Tu página no se puede ir de la plataforma', fx(
      'Los constructores de sitios por suscripción no permiten llevar la página a otro alojamiento: según su propio soporte, tiene que seguir en sus servidores. Si dejas de pagar la mensualidad, la página se cae, y para irte hay que hacerla de nuevo.',
      'centro de ayuda oficial de un constructor de sitios conocido (octubre de 2026).',
      'La página web la hacemos con archivos estándar (HTML) que funcionan en cualquier alojamiento. Si un día quieres cambiarte, te la llevas: es tuya.')],
    ['Cada función extra se cobra aparte', fx(
      'En las apps de reservas por suscripción, usuarios reclaman que los mensajes de WhatsApp se compran aparte y vienen pocos incluidos, que cada función adicional se paga, y que el precio sube cada cierto tiempo.',
      'reseñas de usuarios de una app de reservas en un sitio de reseñas de software (2025 y 2026).',
      'Las reservas se pagan una vez. El recordatorio queda en el calendario del celular de tu cliente (1 hora antes de una cita y 1 día antes de una reserva por noche), sin pagar por mensaje.')],
    ['La carta es un PDF que hay que agrandar con los dedos', fx(
      'Muchos menús QR son el mismo PDF de la carta impresa: el cliente escanea, espera, agranda con los dedos, se pierde buscando y termina preguntándole al garzón. Los locales que volvieron a la carta de papel no dejaron una mala idea: dejaron una mala ejecución.',
      '<a href="https://restauranttechnologynews.com/2026/08/why-restaurant-qr-menus-have-an-execution-problem-not-a-concept-problem/" target="_blank" rel="noopener">Restaurant Technology News, agosto de 2026</a>.',
      'Tu menú es una carta hecha para el celular: categorías, buscador, favoritos, foto y precio de cada plato. Y si quieres, el plato en 3D sobre la mesa del cliente con la cámara.')],
    ['Páginas pesadas y llenas de terceros', fx(
      'Una app de reservas por suscripción carga 153 archivos desde 32 servicios distintos para mostrar una página. Cada servicio externo hace más lenta la carga en el celular y suma rastreo.',
      'medición propia el 22 de octubre de 2026, con el mismo método para todos los sitios (Chrome, ancho de celular).',
      'Nuestras páginas de ejemplo cargan con 9 a 14 archivos desde 2 servicios externos. Sin cookies de seguimiento ni publicidad.')],
    ['El correo con tu dominio, solo con plan mensual', fx(
      'Las agencias incluyen cuentas de correo con el dominio del negocio (contacto@tunegocio.cl), pero dentro del plan de alojamiento que se renueva cada año. Sin ese plan, el negocio sigue atendiendo con un Gmail personal.',
      'precios publicados por agencias chilenas, revisados en octubre de 2026.',
      'Con la página web te configuramos contacto@tunegocio.cl: los mensajes llegan a tu Gmail de siempre y respondes desde esa misma dirección. Usa el reenvío gratuito de Cloudflare y tu cuenta de Gmail, sin mensualidad (según sus condiciones vigentes). Es un reenvío, no un buzón aparte, y necesita que tengas tu dominio .cl.', true)],
    ['6 preguntas antes de pagarle a cualquiera', `<p>Hazlas a cualquier proveedor, también a nosotros. Si alguna respuesta no te convence, pídela por escrito.</p>
    <ol class="fx-preg">
      <li><strong>¿A nombre de quién queda el dominio?</strong> Tiene que ser el tuyo o el de tu negocio. Lo puedes revisar en nic.cl.</li>
      <li><strong>¿Qué voy a pagar cada mes o cada año, y a quién?</strong> Suma todo: alojamiento, dominio, plan, mensajes y funciones extra.</li>
      <li><strong>¿Qué incluye exactamente y en qué plazo?</strong> Por escrito, antes del anticipo.</li>
      <li><strong>¿Me entregan las claves y los accesos?</strong> ¿Con qué documento?</li>
      <li><strong>Si me cambio de proveedor, ¿me llevo la página?</strong> ¿O hay que hacerla de nuevo?</li>
      <li><strong>¿Puedo ver páginas suyas funcionando en el celular?</strong> No capturas: páginas que se puedan abrir.</li>
    </ol>
    <p class="fx-cta"><a class="fx-btn" href="../#diagnostico">Pide tu diagnóstico gratis</a><a class="fx-btn fx-btn-2" href="../ejemplos/">Ver páginas de ejemplo</a></p>`],
    ['Cómo revisamos esto', `<p>Leímos reclamos públicos de clientes, reseñas de usuarios en sitios de reseñas de software, precios y condiciones publicados por los mismos proveedores, y el centro de ayuda de las plataformas. La velocidad la medimos nosotros, con el mismo método para todos los sitios. Los valores en pesos son aproximados y cambian: revisa siempre el precio vigente en la fuente antes de decidir. Actualizamos esta página cada 3 meses.</p>`],
  ],
  css: `.fx { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:4px; --mal:#ff8f8f; --bien:var(--c2); }
:root[data-theme="light"] .fx { --mal:#b42318; --bien:color-mix(in srgb, var(--c2) 40%, #000); }
.fx > div { border:1px solid var(--line); border-radius:16px; padding:16px 18px; background:var(--bg-2); }
.fx-mal { border-color:color-mix(in srgb, var(--mal) 35%, var(--line)) !important; background:color-mix(in srgb, var(--mal) 6%, var(--bg-2)) !important; }
.fx-bien { border-color:color-mix(in srgb, var(--bien) 40%, var(--line)) !important; background:color-mix(in srgb, var(--bien) 7%, var(--bg-2)) !important; }
.lg-txt .fx p { margin:0 0 10px; font-size:15px; }
.lg-txt .fx p:last-child { margin-bottom:0; }
.lg-txt .fx .fx-eti { display:flex; align-items:center; gap:8px; margin-bottom:8px; font-family:"Geist Mono",monospace; font-size:12px; letter-spacing:.08em; text-transform:uppercase; }
.fx-mal .fx-eti { color:var(--mal) !important; }
.fx-bien .fx-eti { color:var(--bien) !important; }
.fx-nuevo { padding:2px 8px; border-radius:99px; background:var(--bien); color:var(--bg); letter-spacing:.04em; }
.lg-txt .fx .fx-fuente { font-size:13px; color:var(--fg-3); }
.lg-txt .fx-preg { gap:12px; }
.fx-cta { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }
.lg-txt a.fx-btn { display:inline-flex; align-items:center; min-height:44px; padding:0 20px; border-radius:99px; background:linear-gradient(90deg, var(--c1), var(--c2)); color:#04121c; font-weight:600; text-decoration:none; }
.lg-txt a.fx-btn-2 { background:transparent; border:1px solid var(--line); color:var(--fg); }
.lg-txt a.fx-btn-2:hover { border-color:var(--c1); }
@media (max-width: 820px) { .fx { grid-template-columns:1fr; } }`,
};

export const ANTES = { ruta: 'antes-de-contratar', html: () => plantilla(ANTES_DOC, { ruta: 'terminos', titulo: 'Términos del servicio' }) };
