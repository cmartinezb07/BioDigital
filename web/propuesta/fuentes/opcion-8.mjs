// Opción 8 · Final: mezcla de la 6 (Panel SaaS) y la 7 (Foco fintech), elegida por el equipo el 17-sep-2026.
// Portada: panel del proyecto (6) con las tarjetas flotantes (7) a los lados.
// Contenido que solo tenían otras opciones, integrado en las tarjetas: vista de la ficha de Google y catálogo (1),
// certificado a tu nombre con RUT y firmas (2).
// Toda la paleta sale de dos colores, --c1 (principal) y --c2 (luz), que cambia la rueda de paleta.js.
const ok = '<svg width="14" height="14"><use href="#i-check"/></svg>';
export default {
  n: 8,
  archivo: 'index.html',
  nombre: 'Final (6 + 7)',
  titulo: 'Bío Digital · Opción 8: Final (6 + 7)',
  tema: 'dark',
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
body { font-size: 16px; letter-spacing: -.005em; background: linear-gradient(90deg, var(--side), var(--side) calc(50% - 640px), var(--bg) calc(50% - 640px), var(--bg) calc(50% + 640px), var(--side) calc(50% + 640px)); }
main, .top, .site-foot { border-inline: 1px solid var(--line-2); max-width: 1280px; margin-inline: auto; }
.top { background: color-mix(in srgb, var(--bg) 85%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nav { width: min(100% - 48px, 1180px); }
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
.hero h1 { font-weight: 560; font-size: clamp(40px, 5.8vw, 78px); line-height: 1.03; letter-spacing: -.055em; max-width: 15ch; }
.hero h1 span { display: block; background: linear-gradient(180deg, var(--fg) 10%, color-mix(in srgb, var(--fg) 45%, var(--bg))); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero .lead { max-width: 34em; color: var(--fg); opacity: .8; }
.capture { display: flex; gap: 6px; width: min(100%, 470px); padding: 5px; border: 1px solid var(--line); border-radius: 99px; background: color-mix(in srgb, var(--bg-2) 80%, transparent); box-shadow: inset 0 1px 0 var(--line-2); transition: border-color .25s ease, box-shadow .3s ease; }
.capture input { flex: 1; min-width: 0; padding: 0 16px; border: 0; background: transparent; color: var(--fg); font-size: 15px; outline: none; }
.capture input::placeholder { color: var(--fg-3); }
.capture:focus-within { border-color: color-mix(in srgb, var(--warm) 60%, transparent); box-shadow: inset 0 1px 0 var(--line-2), 0 0 0 4px color-mix(in srgb, var(--warm) 14%, transparent); }
.capture .btn { min-height: 42px; }
.alt-link { font-size: 14px; color: var(--fg-2); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.alt-link svg { transition: transform .3s var(--ease-out); }
@media (hover: hover) and (pointer: fine) { .alt-link:hover { color: var(--fg); } .alt-link:hover svg { transform: translateX(3px); } }
.hero-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; font-size: 13px; color: var(--fg-3); }
.hero-meta span { display: inline-flex; align-items: center; gap: 6px; }
.hero-meta svg { color: var(--warm); }
.horizon { position: relative; height: 130px; margin-top: 8px; pointer-events: none; }
.horizon::before { content: ""; position: absolute; left: 50%; bottom: 0; width: min(900px, 110vw); height: 220px; translate: -50% 40%; background: radial-gradient(closest-side, color-mix(in srgb, var(--warm) 70%, transparent), color-mix(in srgb, var(--warm) 22%, transparent) 45%, transparent); animation: breathe 7s ease-in-out infinite alternate; }
@keyframes breathe { to { opacity: .7; scale: 1.06 1; } }

/* Escenario: panel (6) al centro, tarjetas (7) a los lados, piso con grilla detrás */
.stage { position: relative; perspective: 1400px; margin-top: -40px; min-height: 500px; }
.stage::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 90px; background: linear-gradient(transparent, var(--bg)); pointer-events: none; z-index: 2; }
.floor { position: absolute; left: 50%; top: 40px; width: 1600px; height: 560px; translate: -50% 0; z-index: -1; perspective: 520px; pointer-events: none; overflow: hidden; -webkit-mask: radial-gradient(60% 70% at 50% 0%, #000 30%, transparent 75%); mask: radial-gradient(60% 70% at 50% 0%, #000 30%, transparent 75%); }
.floor::before { content: ""; position: absolute; inset: -72px 0 -300px; background: linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 60px 36px, linear-gradient(90deg, var(--grid) 1px, transparent 1px) 50% 0 / 60px 36px; transform-origin: 50% 0; transform: rotateX(62deg) translateY(0); animation: drift 6s linear infinite; }
@keyframes drift { to { transform: rotateX(62deg) translateY(36px); } }
.dash { position: relative; z-index: 1; width: min(100% - 48px, 800px); margin-inline: auto; display: grid; grid-template-columns: 172px minmax(0, 1fr); text-align: left; border: 1px solid var(--line); border-bottom: 0; border-radius: 16px 16px 0 0; background: var(--bg-2); box-shadow: 0 -1px 0 color-mix(in srgb, var(--warm) 60%, transparent), 0 -30px 80px -40px var(--warm); transform-origin: 50% 0; }
.dash-side { position: relative; padding: 18px 12px; border-right: 1px solid var(--line-2); display: grid; align-content: start; gap: 4px; font-size: 13px; }
.dash-side b { display: flex; align-items: center; gap: 8px; padding: 4px 8px 16px; font-weight: 600; font-size: 14px; }
.dash-side span { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; color: var(--fg-2); transition: color .3s ease; }
.dash-side span.on { color: var(--fg); }
.dash-side .sel { position: absolute; left: 12px; right: 12px; top: 0; height: 34px; border-radius: 8px; background: var(--bg-3); box-shadow: inset 0 0 0 1px var(--line); transition: translate .5s cubic-bezier(.32, .72, 0, 1); }
.dash-main { padding: 18px 20px 26px; display: grid; gap: 16px; }
.dash-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--line-2); }
.dash-head h2 { font-size: 17px; font-weight: 600; }
.dash-head p { font-size: 12px; color: var(--fg-3); }
.tag-ej { flex: none; padding: 3px 10px; border-radius: 99px; border: 1px dashed var(--line); font-size: 12px; color: var(--fg-3); }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat { padding: 14px; border: 1px solid var(--line-2); border-radius: 12px; background: var(--bg-3); }
.stat small { display: block; font-size: 12px; color: var(--fg-3); }
.stat b { display: block; margin-top: 4px; font-size: 17px; font-weight: 600; letter-spacing: -.025em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat i { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-style: normal; font-size: 12px; color: #3ecf8e; }
:root[data-theme="light"] .stat i { color: #13865a; }
.panels { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 12px; }
.panel { padding: 16px; border: 1px solid var(--line-2); border-radius: 12px; background: var(--bg-3); }
.panel h3 { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 14px; }
.panel h3 small { font-weight: 400; color: var(--fg-3); font-size: 12px; }
.bars6 { display: grid; gap: 10px; }
.bars6 div { display: grid; grid-template-columns: 100px minmax(0, 1fr) 28px; gap: 10px; align-items: center; font-size: 12px; color: var(--fg-2); }
.bars6 div i { height: 8px; border-radius: 99px; background: var(--line-2); overflow: hidden; }
.bars6 div i::before { content: ""; display: block; height: 100%; width: calc(var(--w) / 25 * 100%); border-radius: inherit; background: linear-gradient(90deg, var(--warm), var(--copper)); transform-origin: left; }
.motion .bars6.in div i::before { animation: grow 1.2s var(--ease-out) backwards; animation-delay: calc(.3s + var(--k, 0) * 80ms); }
@keyframes grow { from { transform: scaleX(0); } }
.bars6 div b { text-align: right; font-family: var(--mono); font-weight: 500; color: var(--fg); }
.timeline { list-style: none; display: grid; gap: 12px; }
.timeline li { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 13px; }
.timeline .dot { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--line); color: var(--fg-3); }
.timeline .done .dot { background: #3ecf8e; border-color: #3ecf8e; color: #04120b; }
.timeline .now .dot { border-color: var(--warm); box-shadow: 0 0 0 4px color-mix(in srgb, var(--warm) 20%, transparent); }
.timeline .now .dot::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--warm); }
.motion .timeline.in .now .dot::before { animation: pulse 1.6s ease-in-out 1.2s 3; }
@keyframes pulse { 50% { scale: .55; opacity: .55; } }
.motion .timeline.in .done .dot { animation: pop .5s var(--ease-out) backwards; animation-delay: calc(.35s + var(--k, 0) * 140ms); }
.timeline small { color: var(--fg-3); font-size: 12px; }

.around { position: absolute; inset: 0; pointer-events: none; }
.circuit { position: absolute; top: 150px; width: 240px; height: 300px; color: var(--line); z-index: -1; }
.circuit.l { left: 0; }
.circuit.r { right: 0; top: 230px; scale: -1 1; }
.circuit path { fill: none; stroke: currentColor; stroke-width: 1.5; }
.circuit .pulse { stroke: var(--warm); stroke-dasharray: 18 300; animation: current 4.5s linear infinite; }
.circuit .pulse:nth-of-type(2n) { animation-delay: -1.7s; stroke: var(--c2); }
@keyframes current { from { stroke-dashoffset: 318; } to { stroke-dashoffset: 0; } }
.card { position: absolute; z-index: 3; pointer-events: auto; text-align: left; border: 1px solid var(--line); border-radius: 18px; background: linear-gradient(160deg, color-mix(in srgb, var(--bg-3) 94%, transparent), color-mix(in srgb, var(--bg-2) 94%, transparent)); box-shadow: var(--shadow), inset 0 1px 0 var(--line-2); translate: var(--px, 0) var(--py, 0); transition: translate .9s var(--ease-out); }
.card .ej { font-size: 12px; color: var(--fg-3); font-family: var(--mono); letter-spacing: .04em; }
.card-head { display: flex; align-items: center; gap: 10px; }
.card-head .ic { flex: none; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 10px; color: var(--warm); background: color-mix(in srgb, var(--warm) 14%, transparent); }
.card-head b { display: block; font-size: 14px; font-weight: 600; }
.g-card { left: calc(50% - 602px); top: 12px; width: 230px; padding: 16px; display: grid; gap: 12px; }
.g-card .state { font-size: 13px; color: var(--fg-2); }
.g-card .open { color: #3ecf8e; font-weight: 500; }
:root[data-theme="light"] .g-card .open { color: #13865a; }
.g-card .acts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.g-card .acts span { display: grid; justify-items: center; gap: 4px; padding: 8px 4px; border-radius: 10px; background: var(--bg-2); border: 1px solid var(--line-2); font-size: 12px; color: var(--fg-2); }
.g-card .acts svg { color: var(--warm); }
.cat-card { left: calc(50% - 584px); top: 262px; width: 220px; padding: 16px; display: grid; gap: 10px; }
.cat-card ul { list-style: none; display: grid; gap: 6px; }
.cat-card li { display: flex; justify-content: space-between; gap: 8px; padding: 9px 12px; border-radius: 10px; background: var(--bg-2); border: 1px solid var(--line-2); font-size: 13px; }
.cat-card li span:last-child { font-family: var(--mono); color: var(--fg-2); }
.cat-card small { font-size: 12px; color: var(--fg-3); }
.cert-card { left: calc(50% + 372px); top: 12px; width: 230px; padding: 18px; display: grid; gap: 10px; background: radial-gradient(80% 60% at 30% 0%, color-mix(in srgb, var(--warm) 22%, transparent), transparent), linear-gradient(160deg, var(--bg-3), var(--bg-2)); }
.cert-card .ok { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--warm); box-shadow: 0 0 0 6px color-mix(in srgb, var(--warm) 18%, transparent); }
.cert-card > b { font-size: 17px; font-weight: 560; }
.cert-card dl { display: grid; gap: 6px; margin: 0; font-size: 12px; }
.cert-card dl div { display: flex; justify-content: space-between; gap: 8px; }
.cert-card dt { color: var(--fg-3); }
.cert-card dd { margin: 0; text-align: right; color: var(--fg); }
.cert-card .sign { display: grid; gap: 2px; padding-top: 8px; border-top: 1px dashed var(--line); color: var(--fg-2); }
.cert-card .sign svg { width: 120px; height: 28px; }
.cert-card .sign path { fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-dasharray: 1; }
.motion .cert-card .sign path { stroke-dashoffset: 1; }
.motion .cert-card.in .sign path { animation: draw 1.6s var(--ease-out) 1.4s forwards; }
.cert-card .sign span { font-family: var(--mono); font-size: 12px; letter-spacing: .06em; color: var(--fg-3); }
.plan-card { left: calc(50% + 364px); top: 292px; width: 224px; padding: 16px; display: grid; gap: 8px; }
.plan-card label { font-size: 12px; color: var(--fg-3); }
.plan-card div { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 11px 12px; border-radius: 12px; background: var(--bg-2); border: 1px solid var(--line-2); }
.plan-card div b { font-size: 14px; font-weight: 560; white-space: nowrap; }
.plan-card div span { font-family: var(--mono); font-size: 12px; color: var(--fg-2); text-align: right; white-space: nowrap; }
@keyframes draw { to { stroke-dashoffset: 0; } }
.stage .ex { position: absolute; left: 50%; bottom: 14px; translate: -50% 0; z-index: 3; font-size: 12px; color: var(--fg-3); }

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

@media (max-width: 1200px) {
  .stage { min-height: 0; padding-bottom: 28px; }
  .stage::after { display: none; }
  .dash { border-bottom: 1px solid var(--line); border-radius: 16px; }
  .around { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; width: min(100% - 48px, 800px); margin: 16px auto 0; pointer-events: auto; }
  .circuit { display: none; }
  .card { position: relative; left: auto; top: auto; width: auto; }
  .stage .ex { position: static; translate: none; margin-top: 12px; text-align: center; }
}
@media (max-width: 900px) {
  .dash { grid-template-columns: 1fr; width: calc(100% - 24px); }
  .dash-side { display: none; }
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .panels { grid-template-columns: 1fr; }
  .around { width: calc(100% - 24px); }
  main, .top, .site-foot { border-inline: 0; }
  .spot i { width: 320px; }
}
@media (max-width: 600px) {
  .around { grid-template-columns: 1fr; }
  .bars6 div { grid-template-columns: 88px minmax(0, 1fr) 24px; }
  .capture { flex-direction: column; border-radius: 24px; }
  .capture input { min-height: 44px; }
}
`,
  hero: String.raw`
  <div class="hero">
    <div class="spot" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wrap hero-in">
      <a class="pill enter" href="#beneficio">Pack completo a $69.990 para los primeros 5 clientes <b>Ver más <svg width="14" height="14"><use href="#i-arrow"/></svg></b></a>
      <h1 class="enter enter-2">Tu negocio, <span>listo para vender en internet</span></h1>
      <p class="lead enter enter-3">Página web, videos para redes, menú digital, fotos, reservas y tarjeta de fidelización. Armamos lo que te falta, te lo dejamos funcionando y queda todo a tu nombre.</p>
      <form class="capture enter enter-3" data-capture aria-label="Empezar tu diagnóstico gratis">
        <label class="sr" for="cap-negocio">Nombre de tu negocio</label>
        <input id="cap-negocio" name="negocio" autocomplete="organization" placeholder="Nombre de tu negocio" required>
        <button class="btn btn-main" type="submit">Pedir diagnóstico</button>
      </form>
      <a class="alt-link enter enter-4" href="#planes">o mira los precios <svg width="14" height="14"><use href="#i-arrow"/></svg></a>
      <p class="hero-meta enter enter-4">
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Diagnóstico gratis al primer contacto</span>
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Productos desde $4.990 · pack completo $79.990</span>
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Startup de estudiantes UdeC · Gran Concepción</span>
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Respondemos en menos de 24 horas <span class="note">por confirmar</span></span>
      </p>
    </div>
    <div class="horizon" aria-hidden="true"></div>
    <div class="stage">
      <div class="floor" aria-hidden="true"></div>
      <figure class="dash" data-dash aria-label="Ejemplo ilustrativo del panel de un proyecto con el pack completo">
        <nav class="dash-side" aria-hidden="true">
          <b><svg width="18" height="18"><use href="#i-pin"/></svg>Tu negocio</b>
          <i class="sel"></i>
          <span class="on"><svg width="16" height="16"><use href="#i-check"/></svg>Resumen</span>
          <span><svg width="16" height="16"><use href="#i-web"/></svg>Página web</span>
          <span><svg width="16" height="16"><use href="#i-video"/></svg>Videos</span>
          <span><svg width="16" height="16"><use href="#i-qr"/></svg>Menú digital</span>
          <span><svg width="16" height="16"><use href="#i-calendar"/></svg>Reservas</span>
          <span><svg width="16" height="16"><use href="#i-card"/></svg>Fidelización</span>
        </nav>
        <div class="dash-main">
          <div class="dash-head"><div><h2>Resumen del proyecto</h2><p>Pack completo · así se ve el avance</p></div><span class="tag-ej">Ejemplo ilustrativo</span></div>
          <div class="stats reveal" data-seq>
            <div class="stat"><small>Página web</small><b>Publicada</b><i>${ok}a tu nombre</i></div>
            <div class="stat"><small>Videos</small><b>3 listos</b><i>${ok}para tus redes</i></div>
            <div class="stat"><small>Menú digital</small><b>QR activo</b><i>${ok}lo editas tú</i></div>
            <div class="stat"><small>Reservas</small><b>En línea</b><i>${ok}sin llamadas</i></div>
          </div>
          <div class="panels">
            <div class="panel">
              <h3>Cómo se reparte tu puntaje <small>máximo por aspecto</small></h3>
              <div class="bars6 reveal" data-seq>
                <div style="--w:25"><span>Tu sitio propio</span><i></i><b>25</b></div>
                <div style="--w:20"><span>Cómo se ve</span><i></i><b>20</b></div>
                <div style="--w:20"><span>Qué vendes</span><i></i><b>20</b></div>
                <div style="--w:20"><span>Cómo reservan</span><i></i><b>20</b></div>
                <div style="--w:15"><span>Si vuelven</span><i></i><b>15</b></div>
              </div>
            </div>
            <div class="panel">
              <h3>Avance <small>3 a 7 días hábiles</small></h3>
              <ol class="timeline reveal" data-seq>
                <li class="done"><span class="dot">${ok}</span><span>Diagnóstico gratis</span><small>Paso 1</small></li>
                <li class="done"><span class="dot">${ok}</span><span>Propuesta y precio</span><small>Paso 2</small></li>
                <li class="now"><span class="dot"></span><span>Producción</span><small>Paso 3</small></li>
                <li><span class="dot"></span><span>Entrega y capacitación</span><small>Paso 4</small></li>
              </ol>
            </div>
          </div>
        </div>
      </figure>
      <div class="around" aria-label="Ejemplo ilustrativo de lo que recibe tu negocio">
        <svg class="circuit l" viewBox="0 0 240 300" aria-hidden="true">
          <path d="M0 20h80l30 30h130"/><path d="M0 70h50l30 30h160"/><path d="M0 130h100l30-30h110"/><path d="M0 190h70l30 30h140"/><path d="M0 250h110l30-30h100"/>
          <path class="pulse" d="M0 20h80l30 30h130"/><path class="pulse" d="M0 130h100l30-30h110"/><path class="pulse" d="M0 250h110l30-30h100"/>
        </svg>
        <svg class="circuit r" viewBox="0 0 240 300" aria-hidden="true">
          <path d="M0 20h80l30 30h130"/><path d="M0 70h50l30 30h160"/><path d="M0 130h100l30-30h110"/><path d="M0 190h70l30 30h140"/>
          <path class="pulse" d="M0 70h50l30 30h160"/><path class="pulse" d="M0 190h70l30 30h140"/>
        </svg>
        <div class="card float g-card" data-par="-14">
          <div class="card-head"><span class="ic"><svg width="18" height="18"><use href="#i-web"/></svg></span><div><b>Tu página web</b><span class="ej">EJEMPLO</span></div></div>
          <p class="state"><span class="open">Publicada</span> · tunegocio.cl</p>
          <div class="acts"><span><svg width="16" height="16"><use href="#i-phone"/></svg>WhatsApp</span><span><svg width="16" height="16"><use href="#i-pin"/></svg>Cómo llegar</span><span><svg width="16" height="16"><use href="#i-calendar"/></svg>Reservar</span></div>
        </div>
        <div class="card float cat-card" data-par="12">
          <div class="card-head"><span class="ic"><svg width="18" height="18"><use href="#i-qr"/></svg></span><div><b>Tu menú digital</b><span class="ej">EJEMPLO</span></div></div>
          <ul><li><span>Producto destacado</span><span>$4.500</span></li><li><span>Plato del día</span><span>$8.900</span></li></ul>
          <small>QR en las mesas · cambias un precio en dos minutos</small>
        </div>
        <div class="card float cert-card" data-par="-10">
          <span class="ok"><svg width="20" height="20"><use href="#i-check"/></svg></span>
          <b>Todo a tu nombre</b>
          <dl>
            <div><dt>Titular</dt><dd>Tu negocio, con tu RUT</dd></div>
            <div><dt>Página web</dt><dd>propietario: tú</dd></div>
            <div><dt>Menú y reservas</dt><dd>los editas tú</dd></div>
          </dl>
          <div class="sign" aria-hidden="true"><svg viewBox="0 0 160 38"><path pathLength="1" d="M6 28c10-16 18-20 20-10s-6 14 2 8 14-22 18-12-2 16 8 6 12-6 20-4 18-8 28-10"/></svg><span>ACTA DE ENTREGA · FIRMADA</span></div>
        </div>
        <div class="card float plan-card" data-par="8">
          <label>Pack completo</label>
          <div><b>Los 6 productos</b><span>$79.990</span></div>
          <label>Te ahorras</label>
          <div><b>$47.950</b><span>vs. por separado</span></div>
        </div>
      </div>
      <p class="ex">Ejemplo ilustrativo</p>
    </div>
  </div>`,
  script: String.raw`
<script>
  (function () {
    // El campo del inicio lleva el nombre al formulario completo
    var cap = document.querySelector('[data-capture]');
    var dest = document.querySelector('[data-negocio]');
    if (cap && dest) {
      cap.addEventListener('submit', function (e) {
        e.preventDefault();
        dest.value = cap.elements.negocio.value;
        document.getElementById('diagnostico').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        setTimeout(function () { document.querySelector('[data-demo-form] input[name="nombre"]').focus({ preventScroll: true }); }, 700);
      });
    }
  })();
</script>`,
};
