// Sitios de ejemplo del carrusel de la portada y de la galería ejemplos/index.html: negocios ficticios del Gran Concepción.
// Cada uno vive en ejemplos/<id>/ y su imagen es la captura real de su primera pantalla (ejemplos/<id>.webp).
// `ref`  plantilla de la que se tomó la estructura y el movimiento (registro interno).
// `seg`  segmento al que le habla la página (segmento no atendido, Taller de Emprendimiento: innovación de valor).
// `crea` matriz CREA del rubro: lo que la página Crea, Aumenta, Reduce y Elimina frente a la oferta típica.
// Al cambiar un ejemplo: node ../herramientas/capturar-ejemplos.mjs <id>  y después  node fuentes/generar.mjs 8
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { WHATSAPP } from './config.mjs';

export const EJEMPLOS = [
  { id: 'fogon-del-sur', rubro: 'Restaurantes', nombre: 'Fogón del Sur', comuna: 'Concepción', que: 'Menú digital con 3D, pedidos y delivery', ref: 'Diseño propio (skill crear-menu-digital)',
    seg: 'Comensal que no conoce el local y duda qué pedir.',
    crea: { C: 'Ver el plato en 3D sobre tu mesa y seguir el delivery en el mapa', A: 'Pedidos desde la mesa, para retirar o a domicilio', R: 'Preguntas al garzón y llamadas para pedir', E: 'La carta en PDF que no se lee en el celular' } },
  { id: 'estetica', rubro: 'Estética y bienestar', nombre: 'Centro Aurora', comuna: 'Chiguayante', que: 'Reservas por hora', ref: '21st.dev · Forma pilates studio',
    seg: 'Persona que trabaja todo el día y quiere una pausa sin coordinar por mensajes.',
    crea: { C: 'Agenda de la semana con las horas libres a la vista', A: 'Privacidad: una persona por sala', R: 'Dudas de precio y duración', E: 'Llamar para pedir hora' } },
  { id: 'tecnico', rubro: 'Servicio técnico', nombre: 'TecnoRápido', comuna: 'Concepción', que: 'Cotizador y seguimiento', ref: '21st.dev · Kyntra (con el verde de la marca)',
    seg: 'Persona que depende de su notebook o celular para trabajar y no sabe cuánto le costará.',
    crea: { C: 'Cotizador por falla y seguimiento de la reparación con código', A: 'Transparencia: nada se repara sin aprobar', R: 'Incertidumbre del precio', E: 'Llamar para preguntar cómo va' } },
  { id: 'cabanas', rubro: 'Cabañas y arriendos', nombre: 'Cabañas Los Copihues', comuna: 'Hualqui', que: 'Reservas por noche', ref: '21st.dev · Villa Aurelia',
    seg: 'Familia de Concepción que busca escaparse un fin de semana cerca.',
    crea: { C: 'Reserva directa con el total por noches calculado', A: 'Sensación del lugar: escenas y fotos grandes', R: 'Ida y vuelta de mensajes', E: 'Comisión de plataformas intermediarias' } },
  { id: 'barberia', rubro: 'Barberías', nombre: 'El Filo', comuna: 'Talcahuano', que: 'Reservas por hora', ref: 'Framer · DBC Dallas Barber Club (plantilla gratuita)',
    seg: 'Hombre joven que no quiere hacer fila un sábado.',
    crea: { C: 'Elegir barbero y hora desde el celular', A: 'Identidad de barrio y estilo', R: 'Espera en el local', E: 'La fila por orden de llegada' } },
  { id: 'dental', rubro: 'Clínicas dentales', nombre: 'Clínica Sonríe', comuna: 'Hualpén', que: 'Agenda de evaluación', ref: '21st.dev · Oris Dental',
    seg: 'Adulto que posterga el dentista por miedo o por no saber cuánto costará.',
    crea: { C: 'Sección "Sin miedo" y reserva por especialista', A: 'Explicación de cada tratamiento', R: 'Sorpresas en la cuenta: precio de evaluación visible', E: 'Llamar a la recepción para pedir hora' } },
  { id: 'casa-dulce', rubro: 'Pastelerías y cafeterías', nombre: 'Casa Dulce', comuna: 'San Pedro de la Paz', que: 'Encargo de tortas y carta', ref: 'Framer · Boolka (con el frambuesa de la marca)',
    seg: 'Familia que necesita una torta para un cumpleaños y no sabe a quién encargarla.',
    crea: { C: 'Armar el encargo de la torta en línea', A: 'Calidez y cercanía de barrio', R: 'Coordinación por chat', E: 'Ir al local solo para preguntar' } },
  { id: 'estudio-contable', rubro: 'Estudios contables', nombre: 'Ríos & Asociados', comuna: 'Concepción', que: 'Agenda de reuniones', ref: '21st.dev · Taxo',
    seg: 'Pyme que recién parte o está atrasada con el SII y no entiende la jerga.',
    crea: { C: 'Reunión inicial de 30 minutos agendable en línea', A: 'Claridad: pasos y precio fijo mensual', R: 'Trámites presenciales', E: 'Jerga contable y letra chica' } },
  // Sistemas completos (no son páginas de un rubro): `ruta` es la pantalla que se muestra y `preparar` deja datos de prueba
  // antes de capturarla (capturar-ejemplos.mjs). No salen en "Mira tu página".
  { id: 'restaurante-seguimiento', sistema: true, ruta: 'fogon-del-sur/pedido/?demo', rubro: 'Seguimiento del pedido', nombre: 'Fogón del Sur · Tu pedido', comuna: 'Concepción', que: 'Estado con color, tiempo estimado y repartidor en el mapa', ref: 'Diseño propio', espera: 9000,
    preparar: "await new Promise((r) => setTimeout(r, 1500)); const id = new URLSearchParams(location.search).get('id'); Pedidos.cambiar(id, 'preparacion'); Pedidos.cambiar(id, 'listo'); Pedidos.actualizar(id, (x) => { x.escala = 20; }); Pedidos.cambiar(id, 'camino', { repartidor: { nombre: 'Repartidor de prueba' } });",
    seg: 'Cliente que pidió delivery y quiere saber cuánto falta.',
    crea: { C: 'Ver al repartidor en el mapa y jugar mientras espera', A: 'Certeza: estado con color y tiempo estimado', R: 'Llamadas al local preguntando por el pedido', E: 'La espera a ciegas' } },
  { id: 'restaurante-cocina', sistema: true, ruta: 'fogon-del-sur/cocina/', rubro: 'Pantalla de cocina', nombre: 'Fogón del Sur · Cocina', comuna: 'Concepción', que: 'Pedidos en vivo por estado, con reloj', ref: 'Diseño propio',
    seg: 'Cocina que recibe pedidos de la mesa, del mesón y del delivery al mismo tiempo.',
    crea: { C: 'Comandas que llegan solas y avisan al cliente al marcarlas', A: 'Orden: reloj por pedido en verde, amarillo y rojo', R: 'Comandas de papel perdidas', E: 'Gritar los pedidos a la cocina' } },
  { id: 'restaurante-panel', sistema: true, ruta: 'fogon-del-sur/panel/', rubro: 'Panel del restaurante', nombre: 'Fogón del Sur · Panel', comuna: 'Concepción', que: 'Visitas, pedidos, ventas y opiniones', ref: 'Diseño propio', espera: 6000,
    seg: 'Dueño que quiere saber cuánto vende la carta digital sin revisar cuadernos.',
    crea: { C: 'Ver cuántos abren la carta, cuántos piden y cuántos pagan', A: 'Opiniones y recomendaciones de clientes', R: 'Cálculos a mano al cierre', E: 'Decidir sin datos' } },
  { id: 'reservas', sistema: true, ruta: 'reservas/', rubro: 'Sistema de reservas', nombre: 'Reservas en línea', comuna: 'Gran Concepción', que: 'Cabañas, tours, centro médico, espacios y salones', ref: 'Diseño propio',
    seg: 'Negocio que hoy coordina reservas por WhatsApp y pierde clientes fuera de horario.',
    crea: { C: 'Calendario con disponibilidad en vivo, depósito y código de reserva', A: 'Idiomas, monedas y promociones', R: 'Mensajes de ida y vuelta', E: 'Las reservas dobles' } },
  { id: 'reservas-panel', sistema: true, ruta: 'reservas/admin/', rubro: 'Panel de reservas', nombre: 'Panel del negocio', comuna: 'Gran Concepción', que: 'Ocupación, calendario, políticas y reportes', ref: 'Diseño propio', espera: 6000,
    seg: 'Dueño que quiere ver su ocupación y sus ingresos sin planillas.',
    crea: { C: 'Avisos automáticos y calendario sincronizado con Airbnb y Booking', A: 'Control: depósitos, cancelaciones y capacidad', R: 'Planillas y cuadernos', E: 'Pagar comisión por cada reserva' } },
  { id: 'fidelizacion', sistema: true, ruta: 'fidelizacion/', rubro: 'Tarjeta de fidelización', nombre: 'Café Mirador', comuna: 'Concepción', que: 'Sellos con QR en el celular, sin mensualidad', ref: 'Diseño propio',
    preparar: "localStorage.setItem('bdfid-v1', JSON.stringify({ tarjetas: [{ codigo: 'K7M2QX9A', nombre: 'Camila', telefono: '', sellos: 5, creada: Date.now(), visitas: 5, premios: 1 }], eventos: [] })); localStorage.setItem('bdfid-mi', 'K7M2QX9A'); location.reload();",
    seg: 'Cliente frecuente que pierde la tarjeta de papel.',
    crea: { C: 'La tarjeta de sellos en el celular, con QR', A: 'Ver cuántos clientes vuelven', R: 'Tarjetas de papel impresas', E: 'La mensualidad de las apps de fidelización' } },
].map((e) => ({ ...e, url: `ejemplos/${e.ruta || e.id + '/'}`, img: `ejemplos/${e.id}-chica.webp`, grande: `ejemplos/${e.id}.webp` }));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Galería con todos los ejemplos (ejemplos/index.html)
export function escribirGaleria() {
  const tarjetas = EJEMPLOS.map((e, i) => `
    <article class="gx" style="--i:${i}">
      <a class="gx-img" href="${e.ruta || e.id + '/'}"><img src="${e.id}.webp" alt="Primera pantalla de ${esc(e.nombre)}" width="1200" height="750" loading="${i < 2 ? 'eager' : 'lazy'}"></a>
      <div class="gx-txt">
        <p class="gx-eti">${esc(e.rubro)} · ${esc(e.comuna)}</p>
        <h2>${esc(e.nombre)}</h2>
        <p class="gx-seg">${esc(e.seg)}</p>
        <dl class="gx-crea">
          <div><dt>Crea</dt><dd>${esc(e.crea.C)}</dd></div>
          <div><dt>Aumenta</dt><dd>${esc(e.crea.A)}</dd></div>
          <div><dt>Reduce</dt><dd>${esc(e.crea.R)}</dd></div>
          <div><dt>Elimina</dt><dd>${esc(e.crea.E)}</dd></div>
        </dl>
        <a class="gx-ir" href="${e.ruta || e.id + '/'}">${e.sistema ? 'Ver la pantalla' : 'Ver la página'} <span aria-hidden="true">↗</span></a>
      </div>
    </article>`).join('');
  const html = `<!doctype html>
<html lang="es-CL" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ejemplos de páginas · Bío Digital</title>
<meta name="description" content="Páginas de ejemplo hechas por Bío Digital para negocios del Gran Concepción: restaurante, estética, servicio técnico, cabañas, barbería, clínica dental, pastelería y estudio contable.">
<link rel="icon" href="../marca/favicon-32.png" sizes="32x32">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400..600&display=swap">
<script>var t;try{t=localStorage.getItem('bd-theme')}catch(e){}if(t==='light'||t==='dark')document.documentElement.dataset.theme=t</script>
<style>
:root { --c1:#0da5ff; --c2:#00e5d0; --bg:#0a0a0b; --bg-2:#111113; --bg-3:#19191c; --fg:#f5f3f1; --fg-2:#b1adab; --fg-3:#9b979d; --line:rgba(255,255,255,.1); color-scheme:dark; }
:root[data-theme="light"] { --bg:#f7f6f4; --bg-2:#fff; --bg-3:#efedea; --fg:#151517; --fg-2:#4a4748; --fg-3:#6b676a; --line:rgba(0,0,0,.1); color-scheme:light; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:400 16px/1.6 "Geist",system-ui,sans-serif; }
a { color:inherit; }
.top { position:sticky; top:0; z-index:5; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px max(16px, calc(50% - 600px)); background:color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter:blur(12px); border-bottom:1px solid var(--line); }
.top a { display:inline-flex; align-items:center; gap:10px; min-height:44px; text-decoration:none; font-weight:600; }
.top img { width:28px; height:28px; }
.top .volver { padding:0 16px; border:1px solid var(--line); border-radius:99px; font-weight:400; font-size:14px; transition:border-color .2s; }
.top .volver:hover { border-color:var(--c1); }
main { max-width:1200px; margin:0 auto; padding:56px 16px 96px; }
.cab p:first-child { margin:0 0 10px; font:500 12px "Geist Mono",monospace; letter-spacing:.08em; text-transform:uppercase; color:var(--c2); }
.cab h1 { margin:0; font-size:clamp(36px,5vw,60px); line-height:1.05; letter-spacing:-.03em; font-weight:600; }
.cab .bajada { max-width:44em; margin:16px 0 0; font-size:18px; color:var(--fg-2); }
.lista { display:grid; gap:20px; margin-top:48px; }
.gx { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr); gap:28px; align-items:center; padding:18px; border:1px solid var(--line); border-radius:22px; background:var(--bg-2); animation:entra .8s cubic-bezier(.22,1,.36,1) both; animation-delay:calc(var(--i) * 70ms); }
@keyframes entra { from { opacity:0; transform:translateY(24px); } }
.gx:nth-child(even) .gx-img { order:2; }
.gx-img { display:block; overflow:hidden; border-radius:14px; border:1px solid var(--line); aspect-ratio:1.6; }
.gx-img img { display:block; width:100%; height:100%; object-fit:cover; transition:transform .8s cubic-bezier(.22,1,.36,1); }
.gx:hover .gx-img img { transform:scale(1.04); }
.gx-eti { margin:0; font-size:13px; color:var(--fg-3); }
.gx h2 { margin:4px 0 10px; font-size:clamp(26px,3vw,34px); letter-spacing:-.02em; font-weight:600; }
.gx-seg { margin:0; color:var(--fg-2); }
.gx-crea { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:18px 0; }
.gx-crea div { padding:10px 12px; border-radius:12px; background:var(--bg-3); }
.gx-crea div:first-child { grid-column:1 / -1; background:linear-gradient(115deg, color-mix(in srgb, var(--c1) 22%, var(--bg-3)), color-mix(in srgb, var(--c2) 16%, var(--bg-3))); }
.gx-crea dt { font:600 12px "Geist Mono",monospace; letter-spacing:.06em; text-transform:uppercase; color:var(--c2); }
.gx-crea dd { margin:2px 0 0; font-size:14px; color:var(--fg); }
.gx-ir { display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:0 18px; border-radius:99px; background:var(--fg); color:var(--bg); text-decoration:none; font-weight:600; font-size:14px; transition:transform .3s; }
.gx-ir:hover { transform:translateY(-2px); }
.sis { margin-top:56px; }
.sis h2 { margin:0 0 6px; font-size:28px; letter-spacing:-.02em; }
.sis > p { margin:0; color:var(--fg-2); }
.sis-l { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap:16px; margin-top:18px; }
.sis-l > div { padding:22px; border:1px solid var(--line); border-radius:22px; background:var(--bg-2); }
.sis-l h3 { margin:0 0 8px; font-size:20px; letter-spacing:-.01em; }
.sis-l p { margin:0; color:var(--fg-2); font-size:15px; }
.sis-a { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px !important; }
.sis-a a { display:inline-flex; align-items:center; min-height:44px; padding:0 16px; border-radius:99px; border:1px solid var(--line); text-decoration:none; font-weight:600; font-size:14px; color:var(--fg); }
.sis-a a:first-child { background:var(--fg); color:var(--bg); border-color:var(--fg); }
.cta { margin-top:56px; padding:32px; border-radius:22px; border:1px solid var(--line); background:var(--bg-2); text-align:center; }
.cta h2 { margin:0 0 8px; font-size:28px; letter-spacing:-.02em; }
.cta p { margin:0 0 20px; color:var(--fg-2); }
.cta a { display:inline-flex; align-items:center; min-height:48px; padding:0 22px; border-radius:99px; background:linear-gradient(115deg,var(--c1),var(--c2)); color:#04121a; font-weight:700; text-decoration:none; }
footer { max-width:1200px; margin:0 auto; padding:24px 16px 48px; display:flex; flex-wrap:wrap; gap:8px 24px; justify-content:space-between; border-top:1px solid var(--line); font-size:14px; color:var(--fg-3); }
footer a { display:inline-flex; align-items:center; min-height:44px; color:var(--fg-2); }
@media (max-width:820px) { .gx { grid-template-columns:1fr; } .gx:nth-child(even) .gx-img { order:0; } .gx-crea { grid-template-columns:1fr; } }
@media (prefers-reduced-motion:reduce) { .gx { animation:none; } .gx-img img { transition:none; } }
</style>
</head>
<body>
<header class="top"><a href="../"><img src="../marca/icono-192.png" alt="">Bío Digital</a><a class="volver" href="../#ejemplos">Volver al sitio</a></header>
<main>
  <div class="cab">
    <p>Ejemplos · Gran Concepción</p>
    <h1>Una página distinta para cada negocio</h1>
    <p class="bajada">Son negocios ficticios. Cada página le habla a un cliente concreto de su rubro y muestra algo que la competencia típica no ofrece. Abajo va lo que cada una crea, aumenta, reduce y elimina.</p>
  </div>
  <div class="lista">${tarjetas}
  </div>
  <section class="sis" aria-labelledby="t-sis"><h2 id="t-sis">Sistemas completos para probar</h2><p>Ábrelos en pestañas distintas del mismo navegador: lo que haces en una aparece al instante en la otra.</p>
    <div class="sis-l">
      <div><h3>Restaurante: pedidos, cocina y delivery</h3><p>Pedir en la mesa, para retirar o a domicilio; estado del pedido con su color, tiempo estimado, repartidor en el mapa y un juego mientras esperas. Pantalla de cocina y panel del dueño.</p><p class="sis-a"><a href="fogon-del-sur/">Carta</a><a href="fogon-del-sur/cocina/">Cocina</a><a href="fogon-del-sur/repartidor/">Repartidor</a><a href="fogon-del-sur/panel/">Panel</a></p></div>
      <div><h3>Reservas: cabañas, tours, centro médico, espacios y salones</h3><p>Calendario con disponibilidad en vivo, depósito y política de cancelación, promociones, idiomas y monedas. Panel con inventario, avisos automáticos, iCal y reportes.</p><p class="sis-a"><a href="reservas/">Reservar</a><a href="reservas/admin/">Panel del negocio</a></p></div>
      <div><h3>Tarjeta de fidelización con QR</h3><p>La tarjeta de sellos en el celular del cliente, sin papel ni aplicación. El local escanea el QR, suma el sello y ve cuántos clientes vuelven. Sin mensualidad.</p><p class="sis-a"><a href="fidelizacion/">Tarjeta del cliente</a><a href="fidelizacion/local/">Caja del local</a></p></div>
    </div></section>
  <section class="cta"><h2>¿Quieres una así para tu negocio?</h2><p>El diagnóstico es gratis en el primer contacto.</p><a href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola Bío Digital, vi los ejemplos y quiero una página para mi negocio.')}" target="_blank" rel="noopener">Escríbenos por WhatsApp</a></section>
</main>
<footer><span>© 2026 Bío Digital · Negocios ficticios hechos para mostrar nuestro trabajo</span><span><a href="../privacidad/">Privacidad</a> · <a href="../terminos/">Términos</a></span></footer>
</body>
</html>`;
  writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'ejemplos', 'index.html'), html);
}
