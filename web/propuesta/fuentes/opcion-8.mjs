// Opción 8 · Final: mezcla de la 6 (Panel SaaS) y la 7 (Foco fintech), elegida por el equipo el 17-sep-2026.
// Portada: panel del proyecto (6) con las tarjetas flotantes (7) a los lados.
// Contenido que solo tenían otras opciones, integrado en las tarjetas: vista de la ficha de Google y catálogo (1),
// certificado a tu nombre con RUT y firmas (2).
// Toda la paleta sale de dos colores, --c1 (principal) y --c2 (luz), que cambia la rueda de paleta.js.
import { EJEMPLOS } from './maquetas.mjs';
const ok = '<svg width="14" height="14"><use href="#i-check"/></svg>';
export default {
  n: 8,
  archivo: 'index.html',
  nombre: 'Final (6 + 7)',
  titulo: 'Bío Digital · Opción 8: Final (6 + 7)',
  tema: 'dark',
  ejemplos: true,
  fuentes: 'family=Geist:wght@300..700&family=Geist+Mono:wght@400..600',
  // Logo de la marca: dos capas recortadas del logotipo original. La "B" se pinta con la paleta
  // (--c1 a --c2, lo que cambia la rueda) y el texto con el color de texto, así sirve en los dos temas.
  marcaTexto: false,   // el nombre ya está dibujado dentro del logotipo
  marca: `<span class="logo" role="img" aria-label="Bío Digital"><i class="l-marca"></i><i class="l-texto"></i></span>`,
  deco: {
    shine: true,
    entregasNota: 'Lo que ves en el panel de arriba es lo que te llevas.',
  },
  head: String.raw`<script>(function(){var r=document.documentElement,h=/^#?[0-9a-f]{6}$/i,q=new URLSearchParams(location.search),p={};try{p=JSON.parse(localStorage.getItem('bd-paleta'))||{}}catch(e){}var a=q.get('c1')||p.c1,b=q.get('c2')||p.c2;if(a&&h.test(a))r.style.setProperty('--c1','#'+a.replace('#',''));if(b&&h.test(b))r.style.setProperty('--c2','#'+b.replace('#',''))})()</script>
<link rel="stylesheet" href="movimiento.css">
<link rel="stylesheet" href="paleta.css">
<link rel="stylesheet" href="pagos.css">
<script src="movimiento.js" defer></script>
<script src="paleta.js" defer></script>`,
  // Mascota: el gato dibujado en SVG (gato.js, igual en todas las opciones), vestido con los colores de la paleta
  mascota: String.raw`
/* Mascota: el globo es una tarjeta del panel con filo del color principal; el gato no lleva contorno */
.mascota { --m-alto: 140px; --m-paper: var(--bg-3); --m-font: var(--body); --m-radio: 16px; --m-borde: 1px solid var(--line); --m-sombra: 0 -1px 0 color-mix(in srgb, var(--warm) 60%, transparent), 0 18px 40px -20px rgba(0, 0, 0, .7); --m-control: var(--bg-3); }
@media (min-width: 1500px) { .mascota { --m-alto: 164px; } }
@media (max-width: 860px) { .mascota { --m-alto: 86px; } }
:root[data-theme="light"] .mascota { --m-sombra: 0 -1px 0 color-mix(in srgb, var(--warm) 60%, transparent), 0 16px 34px -20px rgba(0, 0, 0, .3); }
.m-globo { background: radial-gradient(120% 100% at 0% 100%, color-mix(in srgb, var(--c2) 16%, transparent), transparent 65%), var(--m-paper); }
`,
  css: String.raw`
:root {
  /* Los dos colores de la marca, tomados del logo: azul del isotipo y cian del degradado */
  --c1: #0da5ff;
  --c2: #00e5d0;
  --bg: #0a0a0b;
  --bg-2: #111113;
  --bg-3: #19191c;
  --fg: #f5f3f1;
  --fg-2: #b1adab;
  --fg-3: #9b979d;
  --line: rgba(255, 255, 255, .1);
  --line-2: rgba(255, 255, 255, .06);
  --accent: #f5f3f1;
  --accent-fg: #0a0a0b;
  --warm: var(--c1);
  --warm-2: color-mix(in oklab, var(--c1), #fff 40%);
  --copper: color-mix(in oklab, var(--c1), var(--c2) 22%);
  --amber: color-mix(in oklab, var(--c1), #ffd27a 45%);
  --spot-1: color-mix(in srgb, var(--c2) 50%, transparent);
  --spot-2: color-mix(in srgb, color-mix(in oklab, var(--c2), var(--c1) 50%) 38%, transparent);
  --spot-3: color-mix(in srgb, var(--c1) 22%, transparent);
  --grid: rgba(255, 255, 255, .09);
  --side: #070708;
  --display: "Geist", system-ui, sans-serif;
  --body: "Geist", system-ui, sans-serif;
  --mono: "Geist Mono", ui-monospace, monospace;
  --r: 12px;
  --r-lg: 18px;
  --btn-r: 99px;
  --shadow: 0 30px 60px -30px rgba(0, 0, 0, .8);
  --glow: 0 0 0 1px color-mix(in srgb, var(--warm) 50%, transparent), 0 30px 80px -30px color-mix(in srgb, var(--warm) 45%, transparent);
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f8f6f4;
  --bg-2: #ffffff;
  --bg-3: #f1ede9;
  --fg: #141211;
  --fg-2: #57514d;
  --fg-3: #736d68;
  --line: rgba(20, 18, 17, .1);
  --line-2: rgba(20, 18, 17, .06);
  --accent: #141211;
  --accent-fg: #fff;
  --warm: color-mix(in oklab, var(--c1), #000 16%);
  --warm-2: color-mix(in oklab, var(--c1), #fff 18%);
  --copper: color-mix(in oklab, color-mix(in oklab, var(--c1), var(--c2) 22%), #000 14%);
  --amber: color-mix(in oklab, var(--c1), #a35f00 40%);
  --spot-1: color-mix(in srgb, var(--c2) 32%, transparent);
  --spot-2: color-mix(in srgb, color-mix(in oklab, var(--c2), var(--c1) 50%) 24%, transparent);
  --spot-3: color-mix(in srgb, var(--c1) 14%, transparent);
  --grid: rgba(20, 18, 17, .07);
  --side: #f1efec;
  --shadow: 0 30px 60px -34px rgba(60, 40, 30, .35);
  --glow: 0 0 0 1px color-mix(in srgb, var(--warm) 50%, transparent), 0 30px 70px -30px color-mix(in srgb, var(--warm) 32%, transparent);
  color-scheme: light;
}

/* Marco de la 6: columna central con filos y costados más oscuros */
html { background: var(--side); }
/* Columna del sitio: hasta 1440 px, pero siempre deja 150 px a cada lado para el gato, que vive fuera de la página */
:root { --col: 1280px; --maxw: calc(var(--col) - 80px); }
@media (min-width: 1100px) { :root { --col: min(1440px, 100vw - 300px); } }
body { font-size: 16px; letter-spacing: -.005em; background: linear-gradient(90deg, var(--side), var(--side) calc(50% - var(--col) / 2), var(--bg) calc(50% - var(--col) / 2), var(--bg) calc(50% + var(--col) / 2), var(--side) calc(50% + var(--col) / 2)); }
main, .top, .site-foot { border-inline: 1px solid var(--line-2); max-width: var(--col); margin-inline: auto; }
.top { background: color-mix(in srgb, var(--bg) 85%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nav { width: min(100% - 48px, var(--maxw)); }
.brand { gap: 0; }
.brand .logo { position: relative; display: block; width: 117px; height: 26px; }
.brand .logo i { position: absolute; inset: 0; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-size: 100% 100%; mask-size: 100% 100%; }
.brand .l-marca { -webkit-mask-image: url(marca/mascara-marca-540.png); mask-image: url(marca/mascara-marca-540.png); background: linear-gradient(115deg, var(--c1), var(--c2)) left center / 21.5% 100% no-repeat; }
.brand .l-texto { -webkit-mask-image: url(marca/mascara-texto-540.png); mask-image: url(marca/mascara-texto-540.png); background: var(--fg); }
@media (min-width: 900px) { .brand .logo { width: 135px; height: 30px; } }
.h2 { font-weight: 560; letter-spacing: -.04em; }
.h3 { font-weight: 560; font-size: 18px; }
.accent { background: linear-gradient(90deg, var(--warm), var(--copper) 55%, color-mix(in oklab, var(--c2), var(--fg) 25%)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.btn { font-weight: 500; }
.btn-main { color: #111; background: linear-gradient(180deg, #fafafa, #c9c6c3); box-shadow: inset 0 1px 0 #fff, inset 0 -2px 4px rgba(0, 0, 0, .15), 0 8px 24px -10px rgba(255, 255, 255, .3); }
:root[data-theme="light"] .btn-main { color: #fff; background: linear-gradient(180deg, #3a3633, #121110); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .2), 0 8px 22px -10px rgba(0, 0, 0, .5); }
.btn:not(.btn-main) { background: var(--bg-2); }
.check { color: var(--warm); }

/* Portada: foco de luz (7), titular centrado (6) */
.hero { padding: clamp(44px, 6vw, 76px) 0 0; overflow: clip; text-align: center; }
.spot { position: absolute; inset: 0 0 auto; height: 720px; z-index: -2; pointer-events: none; }
.spot i { position: absolute; top: -200px; width: 520px; height: 760px; border-radius: 50%; transform-origin: 50% 0; animation: sway 14s ease-in-out infinite alternate; }
.spot i:nth-child(1) { left: calc(50% - 560px); background: radial-gradient(closest-side, var(--spot-1), transparent); rotate: -18deg; }
.spot i:nth-child(2) { left: calc(50% - 240px); background: radial-gradient(closest-side, var(--spot-2), transparent); rotate: 6deg; animation-delay: -5s; }
.spot i:nth-child(3) { left: calc(50% + 120px); background: radial-gradient(closest-side, var(--spot-3), transparent); rotate: 22deg; animation-delay: -9s; }
@keyframes sway { to { rotate: 4deg; opacity: .75; } }
.hero-in { display: grid; justify-items: center; gap: 22px; }
.pill { display: inline-flex; align-items: center; gap: 10px; padding: 7px 16px; border: 1px solid color-mix(in srgb, var(--c2) 40%, transparent); border-radius: 99px; font-size: 13px; color: var(--fg-2); background: color-mix(in srgb, var(--c2) 8%, transparent); text-decoration: none; transition: border-color .25s ease, background-color .25s ease; }
.pill b { color: var(--fg); font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
.pill svg { transition: transform .3s var(--ease-out); }
@media (hover: hover) and (pointer: fine) { .pill:hover { border-color: color-mix(in srgb, var(--c2) 70%, transparent); } .pill:hover svg { transform: translateX(3px); } }
/* El título se ve desde el primer cuadro (solo se mueve y se enfoca): así cuenta como el contenido principal (LCP) sin esperar la animación */
.hero h1.enter { animation-name: enter-titulo; }
@keyframes enter-titulo { from { translate: 0 16px; filter: blur(6px); } }
/* "Mira tu página": rubros como fichas bajo el campo del nombre */
.tu-pagina { margin-top: 18px; display: grid; gap: 10px; justify-items: center; text-align: center; }
.tu-pagina p { font-size: 14px; color: var(--fg-2); }
.tu-pagina p b { color: var(--fg); font-weight: 600; }
.tu-rubros { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 760px; }
.tu-rubros button { min-height: 44px; padding: 0 16px; border: 1px solid var(--line); border-radius: 99px; background: color-mix(in srgb, var(--bg-2) 70%, transparent); color: var(--fg); font: inherit; font-size: 14px; cursor: pointer; transition: border-color .25s, background .25s, transform .3s var(--ease-out); }
.tu-rubros button:hover { border-color: var(--c1); background: color-mix(in srgb, var(--c1) 14%, transparent); transform: translateY(-2px); }
.tu-rubros button:active { transform: scale(.97); }
/* Áreas táctiles de 44 px y textos de 12 px o más en toda la portada (check de accesibilidad del 22-oct) */
.top .brand { min-height: 44px; }
.top .icon-btn { width: 44px; height: 44px; }
.nav-links a { min-height: 44px; display: inline-flex; align-items: center; }
.btn-sm { min-height: 44px; }
.alt-link { min-height: 44px; }
.hero .pill { min-height: 44px; }
.capture .btn, .capture input { min-height: 44px; }
.flash { font-size: 12px; }
.hero h1 { font-weight: 560; font-size: clamp(40px, 5.8vw, 78px); line-height: 1.03; letter-spacing: -.055em; max-width: 15ch; }
.hero h1 span { display: block; background: linear-gradient(180deg, var(--fg) 10%, color-mix(in srgb, var(--fg) 45%, var(--bg))); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero .lead { max-width: 34em; color: var(--fg); opacity: .8; }
.capture { display: flex; gap: 6px; width: min(100%, 470px); padding: 5px; border: 1px solid var(--line); border-radius: 99px; background: color-mix(in srgb, var(--bg-2) 80%, transparent); box-shadow: inset 0 1px 0 var(--line-2); transition: border-color .25s ease, box-shadow .3s ease; }
.capture input { flex: 1; min-width: 0; padding: 0 16px; border: 0; background: transparent; color: var(--fg); font-size: 15px; outline: none; }
.capture input::placeholder { color: var(--fg-3); }
.capture:focus-within { border-color: color-mix(in srgb, var(--warm) 60%, transparent); box-shadow: inset 0 1px 0 var(--line-2), 0 0 0 4px color-mix(in srgb, var(--warm) 14%, transparent); }
.capture .btn { min-height: 44px; }
.alt-link { font-size: 14px; color: var(--fg-2); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.alt-link svg { transition: transform .3s var(--ease-out); }
@media (hover: hover) and (pointer: fine) { .alt-link:hover { color: var(--fg); } .alt-link:hover svg { transform: translateX(3px); } }
.hero-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; font-size: 13px; color: var(--fg-3); }
.hero-meta span { display: inline-flex; align-items: center; gap: 6px; }
.hero-meta svg { color: var(--warm); }
.tg-sec { overflow: clip; }
.tg-head .h2 { font-size: clamp(26px, 3.4vw, 40px); }
.tg-head .muted { color: var(--fg-2); }
.tg { -webkit-mask: linear-gradient(transparent, #000 8%, #000 92%, transparent); mask: linear-gradient(transparent, #000 8%, #000 92%, transparent); }

/* Secciones: mezcla de 6 y 7 */
.svc, .tarifario, .pack, .promo, .rail, .dim, .step, .gift-box, .ask form, .faq details { box-shadow: inset 0 1px 0 var(--line-2); }
.svc, .tarifario, .promo { background: linear-gradient(170deg, var(--bg-3), var(--bg-2) 60%); }
@property --mx { syntax: "<percentage>"; inherits: false; initial-value: 50%; }
@property --my { syntax: "<percentage>"; inherits: false; initial-value: 0%; }
[data-shine]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(340px circle at var(--mx) var(--my), color-mix(in srgb, var(--warm) 13%, transparent), transparent 62%); opacity: 0; transition: opacity .4s ease; pointer-events: none; }
@media (hover: hover) and (pointer: fine) { [data-shine]:hover::after { opacity: 1; } .svc:hover { border-color: color-mix(in srgb, var(--warm) 45%, transparent); } }
.ico { color: var(--warm); border-radius: 12px; }
.pts b { color: var(--warm); }
.rec, .flash { background: var(--warm); color: #140800; }
.svc .tarifa b, .promo-save { color: var(--warm); }
.pack { background: radial-gradient(90% 60% at 50% 0%, color-mix(in srgb, var(--warm) 16%, transparent), transparent 70%), linear-gradient(170deg, var(--bg-3), var(--bg-2)); border-color: color-mix(in srgb, var(--warm) 60%, transparent); box-shadow: var(--glow), inset 0 1px 0 var(--line-2); }
.pack::before { content: ""; position: absolute; left: 18%; right: 18%; top: -1px; height: 1px; background: linear-gradient(90deg, transparent, var(--warm), transparent); }
@media (hover: hover) and (pointer: fine) { .promo:hover, .tarifario a.fila:hover { border-color: color-mix(in srgb, var(--warm) 45%, transparent); } }
.meter .m-fill { stroke: var(--warm); }
.rail ol a.on { box-shadow: inset 2px 0 0 var(--warm); }
.gift-ico { background: var(--warm); color: #140800; border-radius: 50%; }
.gift-box { background: radial-gradient(80% 140% at 0% 50%, color-mix(in srgb, var(--warm) 12%, transparent), transparent 60%), var(--bg-2); }
.final { background: var(--bg-2); border: 0; overflow: hidden; }
.final::before { content: ""; position: absolute; inset: -40% 10% auto; height: 120%; z-index: -1; background: radial-gradient(closest-side, var(--spot-1), transparent), radial-gradient(closest-side at 70% 40%, var(--spot-2), transparent); opacity: .7; }
.final::after { content: ""; position: absolute; left: 50%; bottom: -170px; width: 900px; height: 320px; translate: -50% 0; z-index: -1; background: radial-gradient(closest-side, color-mix(in srgb, var(--warm) 50%, transparent), transparent); }
.final .h2 { font-size: clamp(34px, 5vw, 62px); }
.site-foot { border-top: 1px solid var(--line-2); }
.dock .btn { white-space: nowrap; padding-inline: 14px; }
.card-head .ej { display: block; }

@media (max-width: 900px) {
  main, .top, .site-foot { border-inline: 0; }
  .spot i { width: 320px; }
}
@media (max-width: 600px) {
  .capture { flex-direction: column; border-radius: 24px; }
  .capture input { min-height: 44px; }
}
`,
  hero: String.raw`
  <div class="hero">
    <div class="spot" aria-hidden="true"><i data-par="40"></i><i data-par="-28"></i><i data-par="20"></i></div>
    <div class="wrap hero-in">
      <a class="pill enter" href="#beneficio">Pack completo a $69.990 para los primeros 5 clientes <b>Ver más <svg width="14" height="14"><use href="#i-arrow"/></svg></b></a>
      <h1 class="enter enter-2" data-par="6">Tu negocio, <span>listo para vender en internet</span></h1>
      <p class="lead enter enter-3">Página web, videos para redes, menú digital, fotos, reservas y tarjeta de fidelización. Armamos lo que te falta, te lo dejamos funcionando y queda todo a tu nombre.</p>
      <form class="capture enter enter-3" data-capture aria-label="Empezar tu diagnóstico gratis">
        <label class="sr" for="cap-negocio">Nombre de tu negocio</label>
        <input id="cap-negocio" name="negocio" autocomplete="organization" placeholder="Nombre de tu negocio" required>
        <button class="btn btn-main" type="submit">Pedir diagnóstico</button>
      </form>
      <div class="tu-pagina enter enter-4" aria-labelledby="t-tu-pagina">
        <p id="t-tu-pagina"><b>Mira tu página ahora:</b> escribe el nombre de tu negocio y toca tu rubro.</p>
        <div class="tu-rubros">${EJEMPLOS.map((e, i) => e.sistema ? '' : `<button type="button" data-tu-rubro="${i}">${e.rubro}</button>`).join('')}</div>
      </div>
      <a class="alt-link enter enter-4" href="#planes">o mira los precios <svg width="14" height="14"><use href="#i-arrow"/></svg></a>
      <p class="hero-meta enter enter-4">
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Diagnóstico gratis al primer contacto</span>
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Productos desde $4.990 · pack completo $79.990</span>
      </p>
    </div>
    <div class="tg-sec" id="ejemplos">
      <div class="wrap tg-head reveal">
        <h2 class="h2">Así se ven las páginas que hacemos</h2>
        <p class="muted">Negocios de ejemplo del Gran Concepción, cada uno con su estilo. Haz clic en uno para recorrerlo en vivo.</p>
      </div>
      <div class="tg" data-par="-12" data-tilt data-images='${JSON.stringify(EJEMPLOS.map((e) => ({ src: e.img, ph: e.grande, url: e.url, rubro: e.rubro, nombre: e.nombre, comuna: e.comuna, que: e.que }))).replace(/&/g, '&amp;').replace(/'/g, '&#39;')}' aria-label="Carrusel de ejemplos de páginas web por rubro"></div>
      <p class="tg-ver"><button class="btn btn-sm" type="button" data-tilt-open>Ver ejemplos en grande</button><a class="btn btn-sm" href="ejemplos/">Todos los ejemplos</a></p>
    </div>
  </div>`,
  script: String.raw`
<script>
  (function () {
    // El campo del inicio lleva el nombre al formulario completo
    // "Mira tu página": abre el ejemplo del rubro con el nombre que escribió el visitante
    document.addEventListener('click', function (e) {
      var r = e.target.closest('[data-tu-rubro]');
      if (!r || !window.BDVisor) return;
      var campo = document.getElementById('cap-negocio');
      var nombre = (campo && campo.value.trim()) || 'Tu negocio';
      window.BDVisor.abrir(Number(r.dataset.tuRubro), nombre);
    });
    var cap = document.querySelector('[data-capture]');
    var dest = document.querySelector('[data-negocio]');
    if (cap && dest) {
      cap.addEventListener('submit', function (e) {
        e.preventDefault();
        dest.value = cap.elements.negocio.value;
        document.getElementById('diagnostico').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        setTimeout(function () { document.querySelector('[data-pedido] input[name="nombre"]').focus({ preventScroll: true }); }, 700);
      });
    }
  })();
</script>`,
};
