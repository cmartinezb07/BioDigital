// Política de privacidad y términos del servicio (privacidad/index.html y terminos/index.html).
// Describen lo que el sitio hace HOY: si cambia un formulario, un proveedor o el cobro, hay que actualizar esto y regenerar.
// Lo que depende de una decisión del equipo (razón social, plazos) está marcado en memoria/decisiones.md.
import { MAIL, WHATSAPP_VISIBLE, INSTAGRAM, DOMINIO_ANUAL } from './config.mjs';

const VIGENCIA = '24 de octubre de 2026';
const clp = (n) => '$' + n.toLocaleString('es-CL');

const PRIVACIDAD = {
  titulo: 'Política de privacidad',
  resumen: 'Qué datos pedimos, para qué los usamos, con quién los compartimos y cómo puedes pedir que los cambiemos o los borremos.',
  secciones: [
    ['En simple', `<ul>
      <li>Solo pedimos los datos necesarios para responder tu solicitud y hacer tu página.</li>
      <li>No vendemos ni arrendamos tus datos, y no los usamos para publicidad.</li>
      <li>No usamos cookies de seguimiento ni herramientas de publicidad.</li>
      <li>Puedes pedirnos ver, corregir o borrar tus datos escribiendo a <a href="mailto:${MAIL}">${MAIL}</a>.</li>
    </ul>`],
    ['Quién es responsable', `<p>El responsable de los datos es <strong>Bío Digital</strong>, un emprendimiento de estudiantes de Concepción (Chile) que ofrece páginas web y presencia digital a micro y pequeñas empresas del Gran Concepción. Contacto: <a href="mailto:${MAIL}">${MAIL}</a> · WhatsApp ${WHATSAPP_VISIBLE}.</p>`],
    ['Qué datos recogemos', `<div class="lg-tabla"><table>
      <thead><tr><th>Dónde</th><th>Qué datos</th><th>Para qué</th></tr></thead>
      <tbody>
        <tr><td>Formulario de diagnóstico o pedido</td><td>Nombre, nombre y rubro del negocio, comuna, correo, celular (opcional), lo que te interesa y los productos del carrito.</td><td>Responder tu solicitud, hacerte el diagnóstico gratis y cotizar.</td></tr>
        <tr><td>Formularios de levantamiento (página web y menú digital)</td><td>Datos del negocio y sus preferencias: horarios, servicios, carta, colores, fotos, textos y datos de contacto públicos del negocio.</td><td>Diseñar y construir la página o el menú que contrataste.</td></tr>
        <tr><td>Pagos en línea (cuando estén habilitados)</td><td>Productos, montos y estado de la orden. Los datos de la tarjeta los recibe Mercado Pago, no Bío Digital.</td><td>Registrar y confirmar el pago.</td></tr>
        <tr><td>Datos técnicos</td><td>Dirección IP y datos del navegador que registran los servidores, y un control temporal por conexión que limita los envíos repetidos.</td><td>Seguridad del sitio y prevención de abuso.</td></tr>
      </tbody>
    </table></div>
    <p>No pedimos RUT, datos bancarios ni datos sensibles (salud, origen, creencias, etc.). Te pedimos que no los escribas en los formularios.</p>`],
    ['Base para usarlos', `<p>Usamos tus datos porque tú nos los entregas al enviar un formulario y aceptas esta política (consentimiento), y para cumplir el servicio que contrates. Puedes retirar tu consentimiento cuando quieras; eso no afecta lo que ya se hizo antes.</p>`],
    ['Con quién los compartimos', `<p>Solo con los proveedores que necesitamos para operar, que los procesan por encargo nuestro:</p>
    <ul>
      <li><strong>Supabase</strong>: base de datos donde llegan las solicitudes y formularios. Servidores en São Paulo, Brasil.</li>
      <li><strong>Cloudflare</strong>: aloja este sitio y protege de ataques.</li>
      <li><strong>Google Fonts</strong>: entrega las tipografías del sitio (recibe tu dirección IP al cargarlas).</li>
      <li><strong>Mercado Pago</strong>: procesa los pagos en línea cuando estén habilitados.</li>
      <li><strong>WhatsApp y tu proveedor de correo</strong>: si eliges enviarnos el pedido por ahí, el mensaje sale desde tu cuenta y se rige también por las políticas de esos servicios.</li>
    </ul>
    <p>Algunos de estos proveedores guardan datos fuera de Chile. Solo los entregaríamos a una autoridad si la ley lo exige.</p>`],
    ['Cuánto tiempo los guardamos', `<ul>
      <li>Solicitudes que no terminan en un contrato: hasta 12 meses desde el último contacto. Después se borran.</li>
      <li>Clientes: mientras dure el servicio y después por el tiempo que exijan las leyes tributarias y comerciales.</li>
      <li>Si pides que borremos tus datos antes, lo hacemos salvo que una ley nos obligue a guardarlos.</li>
    </ul>`],
    ['Lo que se guarda en tu navegador', `<p>El sitio guarda en tu propio navegador (almacenamiento local, no cookies) el contenido del carrito y si prefieres el tema claro u oscuro, para que no se pierdan al recargar. Al pagar, se guarda por esa sesión la referencia de la orden. Puedes borrarlos cuando quieras desde la configuración de tu navegador. Nada de eso se usa para seguirte entre sitios.</p>`],
    ['Tus derechos', `<p>Puedes pedir <strong>acceso</strong> a tus datos, su <strong>rectificación</strong>, <strong>supresión</strong>, <strong>oposición</strong> a que los usemos, su <strong>portabilidad</strong> y su <strong>bloqueo</strong> temporal. Escríbenos a <a href="mailto:${MAIL}">${MAIL}</a> con el asunto "Mis datos" y el correo o celular que usaste. Respondemos dentro de 15 días hábiles. Si no quedas conforme, puedes reclamar ante la autoridad que corresponda.</p>
    <p>Esta política se basa en la Ley N° 19.628 sobre protección de la vida privada y considera la Ley N° 21.719, que la reemplaza y crea la Agencia de Protección de Datos Personales.</p>`],
    ['Seguridad', `<p>El sitio funciona con conexión cifrada (HTTPS). En la base de datos, el público solo puede enviar solicitudes: leerlas exige ser del equipo, con contraseña y segundo factor. Limitamos los envíos por conexión para frenar el abuso. Ningún sistema es infalible: si detectamos una filtración que te afecte, te avisaremos.</p>`],
    ['Sitios de ejemplo', `<p>Las páginas de la sección de ejemplos son negocios ficticios hechos para mostrar nuestro trabajo. Sus formularios y reservas no envían datos a nadie: a lo más abren WhatsApp o descargan un archivo de calendario en tu equipo. Las fotos de esas páginas son referenciales.</p>`],
    ['Menores de edad', `<p>El servicio está dirigido a dueños y encargados de negocios. No pedimos datos de menores de 18 años a sabiendas.</p>`],
    ['Cambios a esta política', `<p>Si cambiamos lo que hacemos con tus datos, actualizaremos esta página y su fecha de vigencia. Si el cambio es importante y ya eres cliente, te avisaremos.</p>`],
  ],
};

const TERMINOS = {
  titulo: 'Términos del servicio',
  resumen: 'Las reglas para usar este sitio y contratar con Bío Digital: precios, pagos, plazos, cambios y qué pasa al entregar.',
  secciones: [
    ['En simple', `<ul>
      <li>El precio que ves es un pago único, salvo los productos <strong>PRO</strong> (menú digital PRO, sistema de reservas PRO y el pack PRO): llevan una mensualidad de $20.000 y <strong>el primer mes no se cobra</strong>. Es una sola mensualidad aunque tengas más de un producto PRO.</li>
      <li>El dominio .cl y el alojamiento no están incluidos, y los dominios quedan a tu nombre.</li>
      <li>Antes de empezar acordamos por escrito qué incluye tu pedido; al terminar te entregamos todo funcionando, con acta.</li>
      <li>Los cambios posteriores los hace Bío Digital, no tú.</li>
    </ul>`],
    ['Quiénes somos', `<p><strong>Bío Digital</strong> es un emprendimiento de estudiantes de Concepción que hace páginas web, menús digitales, reservas, videos para redes, registro fotográfico y tarjetas de fidelización para micro y pequeñas empresas. Trabajamos solo en el Gran Concepción: Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Coronel, Lota, Penco, Tomé y Hualqui.</p>`],
    ['Uso del sitio', `<p>Puedes navegar, armar tu carrito y pedirnos un diagnóstico gratis sin compromiso. Te pedimos datos reales y no usar los formularios para enviar publicidad, contenido ilegal o envíos automáticos. Los textos, diseños y el gato de este sitio son de Bío Digital; los sitios de ejemplo son ficticios.</p>`],
    ['Precios', `<ul>
      <li>Los precios están en pesos chilenos y se muestran en la sección de precios. Los que dicen "desde" o "a cotizar" se confirman después del diagnóstico, según lo que necesite tu negocio.</li>
      <li>Las promociones valen en las condiciones y fechas que indica cada una, y no se suman entre sí salvo que se diga lo contrario.</li>
      <li>No incluyen el dominio .cl (en NIC Chile cuesta cerca de ${clp(DOMINIO_ANUAL)} al año; el valor vigente está en nic.cl) ni servicios de terceros que el cliente decida contratar.</li>
      <li>La página web se aloja en Cloudflare sin costo para el cliente mientras sus condiciones lo permitan. Si un servicio necesita un alojamiento pagado, lo diremos antes de cotizar.</li>
    </ul>`],
    ['Cómo se contrata', `<ol>
      <li>Nos envías tu solicitud por el sitio, correo o WhatsApp.</li>
      <li>Te hacemos el diagnóstico gratis y te mandamos una propuesta con lo que incluye, el precio final y el plazo.</li>
      <li>El contrato queda cerrado cuando aceptas la propuesta por escrito (correo o WhatsApp) y se registra el pago acordado.</li>
    </ol>`],
    ['Pagos', `<p>Los productos con precio cerrado pueden ofrecer un enlace de Mercado Pago por el importe publicado. Los servicios con precio "desde" o "a cotizar", y los pedidos con varios productos, se confirman antes de enviar el enlace por el total acordado. La forma y las fechas de pago quedan en la propuesta.</p>
      <p>El enlace abre Mercado Pago, que recibe los datos de la tarjeta; Bío Digital no los recibe ni guarda. El equipo comprueba la operación en la cuenta receptora antes de comenzar el trabajo. Un pago pendiente o en revisión todavía no está confirmado. El sitio no actualiza automáticamente el estado de los pagos realizados por enlace.</p>`],
    ['Lo que nos toca a cada uno', `<p><strong>Bío Digital</strong> hace lo acordado en la propuesta, en el plazo acordado, y te mantiene al tanto del avance.</p>
    <p><strong>El cliente</strong> entrega a tiempo la información, los textos, las fotos y los logos, y confirma que tiene derecho a usarlos. Si el material llega tarde, el plazo se corre en la misma medida.</p>`],
    ['Revisiones y cambios', `<p>Cada trabajo incluye revisiones antes de la entrega para ajustar textos, colores y detalles. Lo que cambie el alcance (más secciones, más productos o un servicio nuevo) se cotiza aparte. Después de la entrega, los cambios los hace Bío Digital, no el cliente.</p>`],
    ['Entrega y propiedad', `<ul>
      <li>Entregamos el trabajo funcionando, con un acta de entrega.</li>
      <li>El dominio se registra a nombre del cliente. Los textos, fotos y logos del cliente siguen siendo suyos.</li>
      <li>Al pagar el total, el cliente puede usar el diseño hecho para su negocio. Bío Digital puede mostrarlo en su portafolio, salvo que el cliente pida lo contrario.</li>
    </ul>`],
    ['Retracto y devoluciones', `<p>Si contrataste por medios electrónicos, puedes retractarte dentro de 10 días desde que aceptaste la propuesta, siempre que no hayamos empezado el trabajo, y te devolvemos lo pagado. Si el trabajo ya empezó, se devuelve la parte que no se ha hecho. Esto no limita los derechos que te da la Ley N° 19.496 de protección de los derechos de los consumidores.</p>`],
    ['Garantía', `<p>Si después de la entrega algo de lo acordado no funciona por un error nuestro, lo corregimos sin costo. No cubre fallas de servicios de terceros (Cloudflare, NIC Chile, Instagram, WhatsApp, Google, Mercado Pago u otros) ni cambios hechos por otras personas.</p>`],
    ['Responsabilidad', `<p>Hacemos nuestro trabajo con cuidado, pero no podemos garantizar un número de visitas, ventas o una posición en Google, porque dependen de factores fuera de nuestro control.</p>`],
    ['Datos personales', `<p>El uso de tus datos se explica en la <a href="../privacidad/">política de privacidad</a>.</p>`],
    ['Ley y reclamos', `<p>Estos términos se rigen por las leyes de Chile. Antes de cualquier reclamo, escríbenos a <a href="mailto:${MAIL}">${MAIL}</a> y buscaremos una solución. Si no hay acuerdo, el caso lo verán los tribunales de Concepción, sin perjuicio de tus derechos como consumidor.</p>`],
    ['Cambios a estos términos', `<p>Podemos actualizar estos términos; la versión vigente es la que aparece en esta página con su fecha. Lo que ya contrataste se rige por los términos vigentes al aceptar tu propuesta.</p>`],
  ],
};

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function plantilla(doc, otro) {
  const indice = doc.secciones.map(([t]) => `<li><a href="#${slug(t)}">${t}</a></li>`).join('');
  const cuerpo = doc.secciones.map(([t, html]) => `<section id="${slug(t)}"><h2>${t}</h2>${html}</section>`).join('\n');
  return `<!doctype html>
<html lang="es-CL" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${doc.titulo} · Bío Digital</title>
<meta name="description" content="${doc.resumen}">
<link rel="icon" href="../marca/favicon-32.png" sizes="32x32">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap">
<link rel="stylesheet" href="../nucleo.css">
<link rel="stylesheet" href="../kit.css">
<script>var t;try{t=localStorage.getItem('bd-theme')}catch(e){}if(t==='light'||t==='dark')document.documentElement.dataset.theme=t</script>
<style>
:root { --c1:#0da5ff; --c2:#00e5d0; --bg:#0a0a0b; --bg-2:#111113; --bg-3:#19191c; --fg:#f5f3f1; --fg-2:#b1adab; --fg-3:#9b979d; --line:rgba(255,255,255,.1); --display:"Geist",system-ui,sans-serif; --body:"Geist",system-ui,sans-serif; color-scheme:dark; }
:root[data-theme="light"] { --bg:#f7f6f4; --bg-2:#ffffff; --bg-3:#efedea; --fg:#151517; --fg-2:#4a4748; --fg-3:#6b676a; --line:rgba(0,0,0,.1); color-scheme:light; }
body { margin:0; background:var(--bg); color:var(--fg); font-family:var(--body); line-height:1.65; }
.lg-top { position:sticky; top:0; z-index:5; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px max(16px, calc(50% - 560px)); background:color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter:blur(12px); border-bottom:1px solid var(--line); }
.lg-marca { display:inline-flex; align-items:center; gap:10px; min-height:44px; color:var(--fg); text-decoration:none; font-weight:600; }
.lg-marca img { width:28px; height:28px; }
.lg-top a.lg-volver { display:inline-flex; align-items:center; min-height:44px; padding:0 16px; border:1px solid var(--line); border-radius:99px; color:var(--fg); text-decoration:none; font-size:14px; transition:border-color .2s, background .2s; }
.lg-top a.lg-volver:hover { border-color:var(--c1); background:color-mix(in srgb, var(--c1) 10%, transparent); }
.lg { display:grid; grid-template-columns:220px minmax(0, 1fr); gap:56px; max-width:1120px; margin:0 auto; padding:56px 16px 96px; }
.lg-cab { grid-column:1 / -1; max-width:44em; }
.lg-cab p.lg-eti { margin:0 0 10px; font-family:"Geist Mono",monospace; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--c2); }
.lg-cab h1 { margin:0 0 14px; font-size:clamp(36px, 5vw, 56px); line-height:1.05; letter-spacing:-.03em; font-weight:600; background:linear-gradient(90deg, var(--fg), color-mix(in srgb, var(--fg) 55%, var(--c1))); -webkit-background-clip:text; background-clip:text; color:transparent; }
.lg-cab .lg-res { margin:0; font-size:18px; color:var(--fg-2); }
.lg-cab .lg-vig { margin:16px 0 0; font-size:13px; color:var(--fg-3); }
.lg-ind { position:sticky; top:88px; align-self:start; }
.lg-ind p { margin:0 0 10px; font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--fg-3); }
.lg-ind ol { margin:0; padding:0; list-style:none; display:grid; gap:0; border-left:1px solid var(--line); }
.lg-ind a { display:flex; align-items:center; min-height:44px; padding:4px 0 4px 14px; margin-left:-1px; border-left:2px solid transparent; color:var(--fg-2); text-decoration:none; font-size:14px; line-height:1.35; transition:color .2s, border-color .2s; }
.lg-ind a:hover, .lg-ind a[aria-current="true"] { color:var(--fg); border-left-color:var(--c1); }
.lg-txt { max-width:44em; }
.lg-txt section { padding:28px 0; border-top:1px solid var(--line); scroll-margin-top:84px; }
.lg-txt section:first-child { border-top:0; padding-top:0; }
.lg-txt h2 { margin:0 0 12px; font-size:22px; letter-spacing:-.01em; font-weight:600; }
.lg-txt p, .lg-txt li { color:var(--fg-2); font-size:16px; }
.lg-txt strong { color:var(--fg); font-weight:600; }
.lg-txt a { color:var(--c1); text-underline-offset:3px; }
.lg-txt ul, .lg-txt ol { padding-left:1.2em; display:grid; gap:6px; }
.lg-tabla { overflow-x:auto; }
.lg-txt table { width:100%; border-collapse:collapse; font-size:14px; }
.lg-txt th, .lg-txt td { padding:12px 10px; text-align:left; vertical-align:top; border-bottom:1px solid var(--line); color:var(--fg-2); }
.lg-txt th { color:var(--fg); font-weight:600; font-size:13px; }
.lg-pie { max-width:1120px; margin:0 auto; padding:24px 16px 48px; display:flex; flex-wrap:wrap; gap:8px 24px; justify-content:space-between; border-top:1px solid var(--line); font-size:14px; color:var(--fg-3); }
.lg-pie a { color:var(--fg-2); display:inline-flex; align-items:center; min-height:44px; }
@media (max-width: 820px) { .lg { grid-template-columns:1fr; gap:24px; padding-top:36px; } .lg-ind { position:static; } .lg-txt table, .lg-txt thead, .lg-txt tbody, .lg-txt tr, .lg-txt td { display:block; } .lg-txt thead { display:none; } .lg-txt tr { padding:10px 0; border-bottom:1px solid var(--line); } .lg-txt td { border:0; padding:3px 0; } .lg-txt td:first-child { color:var(--fg); font-weight:600; } }
@media (prefers-reduced-motion: no-preference) { .lg-txt section { animation:lg-in .6s cubic-bezier(.23,1,.32,1) both; animation-timeline:view(); animation-range:entry 0% entry 40%; } @keyframes lg-in { from { opacity:0; translate:0 18px; } } }
${doc.css || ''}</style>
</head>
<body>
<header class="lg-top">
  <a class="lg-marca" href="../"><img src="../marca/icono-192.png" alt="">Bío Digital</a>
  <a class="lg-volver" href="../">Volver al sitio</a>
</header>
<main class="lg">
  <div class="lg-cab">
    <p class="lg-eti">Bío Digital · ${doc.etiqueta || 'Documento legal'}</p>
    <h1>${doc.titulo}</h1>
    <p class="lg-res">${doc.resumen}</p>
    <p class="lg-vig">${doc.vigencia || `Vigente desde el ${VIGENCIA}.`}</p>
  </div>
  <nav class="lg-ind" aria-label="Contenido"><p>Contenido</p><ol>${indice}</ol></nav>
  <article class="lg-txt">
${cuerpo}
  </article>
</main>
<footer class="lg-pie">
  <span>© 2026 Bío Digital · ${MAIL} · @${INSTAGRAM}</span>
  <span><a href="../${otro.ruta}/">${otro.titulo}</a></span>
</footer>
<script src="../legal.js"></script>
</body>
</html>`;
}

export const LEGALES = [
  { ruta: 'privacidad', html: () => plantilla(PRIVACIDAD, { ruta: 'terminos', titulo: TERMINOS.titulo }) },
  { ruta: 'terminos', html: () => plantilla(TERMINOS, { ruta: 'privacidad', titulo: PRIVACIDAD.titulo }) },
];
