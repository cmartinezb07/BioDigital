// Opción 7 · Foco fintech. Referencia del equipo: "Paymark" (lovable.dev, Payments Fintech Site).
// Carbón con un foco de luz rosa y violeta arriba, piso con grilla en perspectiva, campo en píldora
// y tarjetas flotantes con líneas de circuito a los costados. La más sobria de las cinco.
export default {
  n: 7,
  archivo: 'opcion-7-foco.html',
  nombre: 'Foco fintech',
  titulo: 'Bío Digital · Opción 7: Foco fintech',
  tema: 'dark',
  fuentes: 'family=Geist:wght@300..700&family=Geist+Mono:wght@400..600',
  marca: `<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><g stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M12 3v18"/><path d="M4.2 7.5l15.6 9"/><path d="M4.2 16.5l15.6-9"/></g></svg>`,
  deco: { shine: true },
  mascota: String.raw`
/* Mascota: tarjeta flotante con brillo cobre */
.mascota { --m-paper: var(--bg-3); --m-font: var(--body); --m-radio: 16px; --m-borde: 1px solid var(--line); --m-sombra: var(--shadow), inset 0 1px 0 var(--line-2); --m-contorno: color-mix(in srgb, var(--copper) 55%, transparent); --m-piso: color-mix(in srgb, var(--copper) 45%, transparent); --m-control: var(--bg-2); }
.m-globo { background: radial-gradient(120% 100% at 0% 100%, color-mix(in srgb, var(--copper) 18%, transparent), transparent 65%), var(--m-paper); }
/* Gato: ropa con los colores de esta estética (foco: cobre y violeta) */
.gato { --g-c1: var(--copper); --g-c2: #be96ff; }
`,
  css: String.raw`
:root {
  --bg: #0f0f0f;
  --bg-2: #161616;
  --bg-3: #1e1e1e;
  --fg: #f3f1ef;
  --fg-2: #b3aeaa;
  --fg-3: #8a8581;
  --line: rgba(255, 255, 255, .1);
  --line-2: rgba(255, 255, 255, .06);
  --accent: #ece9e6;
  --accent-fg: #111;
  --copper: #e07a5f;
  --amber: #f2a65a;
  --spot-1: rgba(190, 150, 255, .55);
  --spot-2: rgba(240, 150, 190, .4);
  --spot-3: rgba(230, 140, 110, .22);
  --grid: rgba(255, 255, 255, .11);
  --display: "Geist", system-ui, sans-serif;
  --body: "Geist", system-ui, sans-serif;
  --mono: "Geist Mono", ui-monospace, monospace;
  --r: 14px;
  --r-lg: 22px;
  --btn-r: 99px;
  --shadow: 0 30px 60px -30px rgba(0, 0, 0, .8);
  --glow: 0 0 0 1px rgba(224, 122, 95, .45), 0 30px 70px -30px rgba(224, 122, 95, .4);
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f7f5f3;
  --bg-2: #ffffff;
  --bg-3: #f0ece8;
  --fg: #161412;
  --fg-2: #5b5550;
  --fg-3: #7b746e;
  --line: rgba(22, 20, 18, .1);
  --line-2: rgba(22, 20, 18, .06);
  --accent: #161412;
  --accent-fg: #fff;
  --copper: #c95c40;
  --amber: #d98631;
  --spot-1: rgba(170, 130, 255, .35);
  --spot-2: rgba(240, 140, 180, .28);
  --spot-3: rgba(230, 140, 110, .16);
  --grid: rgba(22, 20, 18, .08);
  --shadow: 0 30px 60px -34px rgba(60, 40, 30, .35);
  --glow: 0 0 0 1px rgba(201, 92, 64, .45), 0 30px 70px -30px rgba(201, 92, 64, .3);
  color-scheme: light;
}
body { font-size: 16px; letter-spacing: -.005em; }
.h2 { font-weight: 500; letter-spacing: -.04em; }
.h3 { font-weight: 500; }
.accent { color: var(--copper); }
.top { background: transparent; border-bottom-color: transparent; position: absolute; left: 0; right: 0; top: 34px; }
.proto { background: var(--bg); }
.brand { font-family: var(--body); font-size: 15px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--fg-2); }
.nav-links a { font-weight: 500; color: var(--fg); }
.btn { font-weight: 500; }
.btn-main { color: #111; background: linear-gradient(180deg, #fafafa, #bdbab7); box-shadow: inset 0 1px 0 #fff, inset 0 -2px 4px rgba(0, 0, 0, .15), 0 6px 20px -8px rgba(0, 0, 0, .6); }
:root[data-theme="light"] .btn-main { color: #fff; background: linear-gradient(180deg, #3a3633, #121110); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .2), 0 8px 22px -10px rgba(0, 0, 0, .5); }
.btn:not(.btn-main) { background: var(--bg-2); }
.check { color: var(--copper); }

/* Foco de luz y piso con grilla */
.hero { padding: 150px 0 0; overflow: hidden; text-align: center; }
.spot { position: absolute; inset: -34px 0 auto; height: 760px; z-index: -2; pointer-events: none; }
.spot i { position: absolute; top: -120px; width: 520px; height: 760px; border-radius: 50%; filter: blur(60px); transform-origin: 50% 0; animation: sway 14s ease-in-out infinite alternate; }
.spot i:nth-child(1) { left: calc(50% - 560px); background: radial-gradient(closest-side, var(--spot-1), transparent); rotate: -18deg; }
.spot i:nth-child(2) { left: calc(50% - 240px); background: radial-gradient(closest-side, var(--spot-2), transparent); rotate: 6deg; animation-delay: -5s; }
.spot i:nth-child(3) { left: calc(50% + 120px); background: radial-gradient(closest-side, var(--spot-3), transparent); rotate: 22deg; animation-delay: -9s; }
@keyframes sway { to { rotate: 4deg; opacity: .75; } }
.floor { position: absolute; left: 50%; top: 360px; width: 1600px; height: 520px; translate: -50% 0; z-index: -1; perspective: 520px; pointer-events: none; -webkit-mask: radial-gradient(60% 70% at 50% 0%, #000 30%, transparent 75%); mask: radial-gradient(60% 70% at 50% 0%, #000 30%, transparent 75%); }
.floor::before { content: ""; position: absolute; inset: 0 0 -200px; background: linear-gradient(var(--grid) 1px, transparent 1px) 0 0 / 60px 36px, linear-gradient(90deg, var(--grid) 1px, transparent 1px) 50% 0 / 60px 36px; transform: rotateX(62deg); transform-origin: 50% 0; animation: drift 6s linear infinite; }
@keyframes drift { to { background-position: 0 36px, 50% 36px; } }
.hero-in { display: grid; justify-items: center; gap: 22px; }
.hero h1 { font-weight: 500; font-size: clamp(40px, 5.6vw, 76px); line-height: 1.02; letter-spacing: -.055em; max-width: 14ch; }
.hero .lead { max-width: 34em; color: var(--fg); opacity: .8; }
.capture { display: flex; gap: 6px; width: min(100%, 460px); padding: 5px; border: 1px solid var(--line); border-radius: 99px; background: color-mix(in srgb, var(--bg-2) 80%, transparent); box-shadow: inset 0 1px 0 var(--line-2); }
.capture input { flex: 1; min-width: 0; padding: 0 16px; border: 0; background: transparent; color: var(--fg); font-size: 15px; outline: none; }
.capture input::placeholder { color: var(--fg-3); }
.capture:focus-within { border-color: color-mix(in srgb, var(--copper) 60%, transparent); }
.capture .btn { min-height: 42px; }
.hero-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; font-size: 13px; color: var(--fg-3); }
.hero-meta span { display: inline-flex; align-items: center; gap: 6px; }
.hero-meta svg { color: var(--copper); }

/* Composición de tarjetas */
.deck { position: relative; height: 560px; margin-top: 56px; }
.circuit { position: absolute; top: 80px; width: 260px; height: 320px; color: var(--line); }
.circuit.l { left: 0; }
.circuit.r { right: 0; top: 190px; scale: -1 1; }
.circuit path { fill: none; stroke: currentColor; stroke-width: 1.5; }
.circuit .pulse { stroke: var(--copper); stroke-width: 1.5; stroke-dasharray: 18 300; animation: current 4.5s linear infinite; }
.circuit .pulse:nth-of-type(2n) { animation-delay: -1.7s; stroke: var(--amber); }
@keyframes current { from { stroke-dashoffset: 318; } to { stroke-dashoffset: 0; } }
.card { position: absolute; text-align: left; border: 1px solid var(--line); border-radius: 20px; background: linear-gradient(160deg, color-mix(in srgb, var(--bg-3) 92%, transparent), color-mix(in srgb, var(--bg-2) 92%, transparent)); box-shadow: var(--shadow), inset 0 1px 0 var(--line-2); translate: var(--px, 0) var(--py, 0); transition: translate .9s var(--ease-out); }
.float { animation: bob 7s ease-in-out infinite alternate; }
@keyframes bob { to { transform: translateY(-10px); } }
.id-card { left: 50%; top: 20px; width: 420px; height: 260px; margin-left: -210px; padding: 24px; overflow: hidden; background: radial-gradient(120% 90% at 70% 110%, color-mix(in srgb, var(--copper) 45%, transparent), transparent 60%), linear-gradient(150deg, #2a2624, #121110); color: #f3f1ef; border-color: rgba(255, 255, 255, .12); }
.id-card .row { display: flex; justify-content: space-between; align-items: start; }
.id-card .chip-ic { width: 42px; height: 32px; border-radius: 7px; background: linear-gradient(135deg, #cfcac5, #7a7672 55%, #b9b4af); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .25); }
.id-card .mark { color: rgba(255, 255, 255, .7); }
.id-card .ast { position: absolute; right: -30px; bottom: -40px; width: 200px; color: rgba(240, 160, 120, .22); }
.id-card b { display: block; margin-top: 64px; font-size: 22px; font-weight: 500; letter-spacing: -.02em; }
.id-card small { display: flex; gap: 14px; margin-top: 6px; font-family: var(--mono); font-size: 12px; color: rgba(255, 255, 255, .6); }
.notes { left: calc(50% - 540px); top: 40px; width: 250px; padding: 12px; display: grid; gap: 8px; animation-delay: -2s; }
.notes div { padding: 10px 12px; border: 1px solid var(--line-2); border-radius: 12px; background: var(--bg-2); }
.notes b { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; }
.notes b i { flex: none; white-space: nowrap; font-style: normal; font-size: 12px; padding: 1px 8px; border-radius: 99px; background: var(--bg-3); color: var(--fg-2); }
.notes small { font-size: 12px; color: var(--fg-3); }
.done-card { left: calc(50% + 290px); top: 30px; width: 230px; padding: 20px; display: grid; justify-items: center; gap: 8px; text-align: center; animation-delay: -4s; background: radial-gradient(80% 60% at 30% 0%, color-mix(in srgb, var(--copper) 25%, transparent), transparent), linear-gradient(160deg, var(--bg-3), var(--bg-2)); }
.done-card .ok { width: 46px; height: 46px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--copper); box-shadow: 0 0 0 6px color-mix(in srgb, var(--copper) 18%, transparent); }
.done-card b { font-size: 18px; font-weight: 500; }
.done-card small { font-size: 12px; color: var(--fg-2); }
.done-card .who { width: 100%; margin-top: 8px; padding: 10px; border-radius: 10px; background: var(--bg-2); font-family: var(--mono); font-size: 12px; color: var(--fg-2); text-align: left; }
.chart-card { left: calc(50% - 500px); top: 250px; width: 340px; padding: 20px; animation-delay: -1s; }
.chart-card b { font-size: 26px; font-weight: 500; letter-spacing: -.03em; }
.chart-card p { font-size: 12px; color: var(--fg-3); }
.chart-card svg { width: 100%; height: 90px; margin: 10px 0; overflow: visible; }
.chart-card path { fill: none; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 1; }
.motion .chart-card path { stroke-dashoffset: 1; }
.motion .chart-card.in path { animation: draw 2.2s var(--ease-out) forwards; }
.chart-card path:nth-child(2) { animation-delay: .15s !important; }
.chart-card path:nth-child(3) { animation-delay: .3s !important; }
@keyframes draw { to { stroke-dashoffset: 0; } }
.legend { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--fg-3); }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.plan-card { left: calc(50% + 240px); top: 280px; width: 300px; padding: 16px; display: grid; gap: 10px; animation-delay: -3s; }
.plan-card label { font-size: 12px; color: var(--fg-3); }
.plan-card div { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 12px; background: var(--bg-2); border: 1px solid var(--line-2); }
.plan-card div b { font-size: 18px; font-weight: 500; }
.plan-card div span { font-family: var(--mono); font-size: 12px; color: var(--fg-2); }
.deck .ex { position: absolute; left: 50%; bottom: 8px; translate: -50% 0; font-size: 12px; color: var(--fg-3); }

/* Secciones */
.tldr, .svc, .ledger, .rail, .dim, .step, .plan, .gift-box, .ask form, .faq details { box-shadow: inset 0 1px 0 var(--line-2); }
.svc, .plan { background: linear-gradient(170deg, var(--bg-3), var(--bg-2) 60%); }
@property --mx { syntax: "<percentage>"; inherits: false; initial-value: 50%; }
@property --my { syntax: "<percentage>"; inherits: false; initial-value: 0%; }
[data-shine]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(300px circle at var(--mx) var(--my), var(--spot-2), transparent 65%); opacity: 0; transition: opacity .4s ease; pointer-events: none; mix-blend-mode: soft-light; }
@media (hover: hover) and (pointer: fine) { [data-shine]:hover::after { opacity: 1; } }
.ico { color: var(--copper); border-radius: 12px; }
.rec { background: var(--copper); color: #fff; }
.pick { background: radial-gradient(90% 60% at 50% 0%, color-mix(in srgb, var(--copper) 20%, transparent), transparent 70%), linear-gradient(170deg, var(--bg-3), var(--bg-2)); }
.meter .m-fill { stroke: var(--copper); }
.gift-ico { background: var(--copper); color: #fff; border-radius: 50%; }
.final { border: 0; background: var(--bg-2); }
.final::before { content: ""; position: absolute; inset: -40% 10% auto; height: 120%; z-index: -1; background: radial-gradient(closest-side, var(--spot-1), transparent), radial-gradient(closest-side at 70% 40%, var(--spot-2), transparent); filter: blur(40px); opacity: .7; }
.final .h2 { font-size: clamp(34px, 5vw, 64px); }

@media (max-width: 1100px) {
  .circuit { display: none; }
  .notes { left: 16px; }
  .done-card { left: auto; right: 16px; }
  .chart-card { left: 16px; }
  .plan-card { left: auto; right: 16px; }
}
@media (max-width: 860px) {
  .top { position: sticky; top: 0; background: var(--bg); }
  .hero { padding-top: 64px; }
  .deck { height: auto; display: grid; gap: 14px; padding: 0 16px 24px; }
  .card { position: relative; left: auto !important; right: auto !important; top: auto !important; margin: 0 !important; width: auto !important; }
  .id-card { height: 220px; }
  .id-card b { margin-top: 44px; }
  .deck .ex { position: static; translate: none; text-align: center; }
  .float { animation: none; }
  .spot i { width: 320px; }
  .floor { top: 300px; }
}
`,
  hero: String.raw`
  <div class="hero">
    <div class="spot" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="floor" aria-hidden="true"></div>
    <div class="wrap hero-in">
      <h1 class="enter">Que tu negocio aparezca cuando te buscan</h1>
      <p class="lead enter enter-2">Ficha de Google, fotos profesionales, catálogo y página web para que te elijan en Google y en Maps. Todo a tu nombre.</p>
      <form class="capture enter enter-3" data-capture aria-label="Empezar tu diagnóstico gratis">
        <label class="sr" for="cap-negocio">Nombre de tu negocio</label>
        <input id="cap-negocio" name="negocio" autocomplete="organization" placeholder="Nombre de tu negocio" required>
        <button class="btn btn-main" type="submit">Pedir diagnóstico</button>
      </form>
      <p class="hero-meta enter enter-4">
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Diagnóstico gratis</span>
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Planes desde $150.000</span>
        <span><svg width="14" height="14"><use href="#i-check"/></svg>Startup de estudiantes UdeC</span>
      </p>
    </div>
    <div class="wrap deck" aria-label="Ejemplo ilustrativo de lo que recibe tu negocio">
      <svg class="circuit l" viewBox="0 0 260 320" aria-hidden="true">
        <path d="M0 20h90l30 30h140"/><path d="M0 70h60l30 30h170"/><path d="M0 130h110l30-30h120"/><path d="M0 190h80l30 30h150"/><path d="M0 250h120l30-30h110"/>
        <path class="pulse" d="M0 20h90l30 30h140"/><path class="pulse" d="M0 130h110l30-30h120"/><path class="pulse" d="M0 250h120l30-30h110"/>
      </svg>
      <svg class="circuit r" viewBox="0 0 260 320" aria-hidden="true">
        <path d="M0 20h90l30 30h140"/><path d="M0 70h60l30 30h170"/><path d="M0 130h110l30-30h120"/><path d="M0 190h80l30 30h150"/>
        <path class="pulse" d="M0 70h60l30 30h170"/><path class="pulse" d="M0 190h80l30 30h150"/>
      </svg>
      <div class="card float notes" data-par="-14">
        <div><b>Tu diagnóstico está listo <i>Paso 1</i></b><small>Revisamos cómo te ve un cliente</small></div>
        <div><b>Te enviamos tu plan <i>Paso 2</i></b><small>Con el precio acordado antes</small></div>
      </div>
      <div class="card id-card" data-par="8">
        <div class="row"><span class="chip-ic"></span><svg class="mark" width="26" height="26"><use href="#i-pin"/></svg></div>
        <b>Tu negocio</b>
        <small><span>FICHA VERIFICADA</span><span>TUNEGOCIO.CL</span></small>
        <svg class="ast" viewBox="0 0 24 24" aria-hidden="true"><g stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M12 3v18"/><path d="M4.2 7.5l15.6 9"/><path d="M4.2 16.5l15.6-9"/></g></svg>
      </div>
      <div class="card float done-card" data-par="-10">
        <span class="ok"><svg width="22" height="22"><use href="#i-check"/></svg></span>
        <b>Todo a tu nombre</b>
        <small>Dominio, ficha y cuentas</small>
        <span class="who">ACTA DE ENTREGA · FIRMADA</span>
      </div>
      <div class="card float chart-card reveal" data-par="12">
        <b>100 puntos</b>
        <p>Lo que revisa tu diagnóstico gratis</p>
        <svg viewBox="0 0 320 90" aria-hidden="true" preserveAspectRatio="none">
          <path pathLength="1" stroke="var(--copper)" d="M0 60C30 60 40 20 70 20s40 60 80 60 50-50 90-50 50 30 80 30"/>
          <path pathLength="1" stroke="var(--amber)" d="M0 50C40 50 50 70 90 70s40-50 80-50 40 40 80 40 40-20 70-20"/>
          <path pathLength="1" stroke="var(--fg)" d="M0 70c30 0 50-30 90-30s50 20 90 20 50-35 90-35 30 20 50 20"/>
        </svg>
        <div class="legend"><span style="--c:var(--copper)"><i></i>Te encuentran 30</span><span style="--c:var(--amber)"><i></i>Imagen 20</span><span style="--c:var(--fg)"><i></i>Contacto 15</span></div>
      </div>
      <div class="card float plan-card" data-par="-8">
        <label>Plan</label>
        <div><b>Estándar</b><span>desde $250.000</span></div>
        <label>Incluye</label>
        <div><b>Web + dominio .cl</b><span>1er año</span></div>
      </div>
      <p class="ex">Ejemplo ilustrativo</p>
    </div>
  </div>`,
  script: String.raw`
<script>
  (function () {
    // El campo del hero lleva el nombre al formulario completo
    var cap = document.querySelector('[data-capture]');
    var dest = document.querySelector('[data-negocio]');
    if (cap && dest) {
      cap.addEventListener('submit', function (e) {
        e.preventDefault();
        dest.value = cap.elements.negocio.value;
        document.getElementById('diagnostico').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        setTimeout(function () { document.querySelector('[data-demo-form] input[name="nombre"]').focus({ preventScroll: true }); }, 600);
      });
    }
    // Las tarjetas se desplazan un poco con el mouse, cada una a su profundidad
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var hero = document.querySelector('.hero');
    var cards = [].slice.call(document.querySelectorAll('[data-par]'));
    hero.addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      cards.forEach(function (c) {
        var k = Number(c.dataset.par);
        c.style.setProperty('--px', (x * k).toFixed(1) + 'px');
        c.style.setProperty('--py', (y * k).toFixed(1) + 'px');
      });
    });
  })();
</script>`,
};
