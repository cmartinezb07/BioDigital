// Opción 3 · Metal líquido. Referencia del equipo: "Liquid Metal Hero" (21st.dev/@chowlol202).
// Fondo negro, esfera cromada animada (Paper Shaders) detrás del titular centrado, barra de tres garantías.
export default {
  n: 3,
  archivo: 'opcion-3-metal.html',
  nombre: 'Metal líquido',
  titulo: 'Bío Digital · Opción 3: Metal líquido',
  tema: 'dark',
  fuentes: 'family=Manrope:wght@400..800&family=Geist+Mono:wght@400..600',
  marca: `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><defs><linearGradient id="g-marca" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fafafa"/><stop offset=".45" stop-color="#8d8d94"/><stop offset=".55" stop-color="#e6e6ea"/><stop offset="1" stop-color="#55555c"/></linearGradient></defs><circle cx="15" cy="15" r="13" fill="url(#g-marca)"/><path d="M9.5 15.5l3.8 3.8 7.2-8" fill="none" stroke="var(--bg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  deco: {
    shine: true,
    medidor: '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="g-cromo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--chrome-1)"/><stop offset=".5" stop-color="var(--chrome-2)"/><stop offset="1" stop-color="var(--chrome-3)"/></linearGradient></defs><circle class="m-track" cx="50" cy="50" r="44"/><circle class="m-fill" cx="50" cy="50" r="44" pathLength="100" stroke="url(#g-cromo)"/></svg>',
    final: '<div class="metal metal-final" aria-hidden="true" data-metal="metaballs"></div>',
  },
  mascota: String.raw`
/* Mascota: globo de vidrio oscuro y contorno cromado */
.mascota { --m-paper: color-mix(in srgb, var(--bg-3) 80%, transparent); --m-font: var(--body); --m-radio: 14px; --m-borde: 1px solid var(--line); --m-sombra: 0 18px 40px -18px rgba(0, 0, 0, .85), inset 0 1px 0 rgba(255, 255, 255, .08); --m-blur: blur(14px); --m-contorno: color-mix(in srgb, var(--chrome-2) 75%, transparent); --m-piso: rgba(255, 255, 255, .2); --m-control: var(--bg-3); }
:root[data-theme="light"] .mascota { --m-sombra: 0 16px 34px -18px rgba(0, 0, 0, .35); --m-piso: rgba(0, 0, 0, .22); }
.m-globo { font-weight: 600; }
`,
  css: String.raw`
:root {
  --bg: #000;
  --bg-2: #0b0b0c;
  --bg-3: #151517;
  --fg: #f4f4f5;
  --fg-2: #b4b4bb;
  --fg-3: #85858d;
  --line: rgba(255, 255, 255, .13);
  --line-2: rgba(255, 255, 255, .07);
  --accent: #f4f4f5;
  --accent-fg: #000;
  --chrome-1: #ffffff;
  --chrome-2: #7c7c85;
  --chrome-3: #d9d9e0;
  --chrome: linear-gradient(100deg, #fff 0%, #c9c9d1 30%, #6f6f78 48%, #f2f2f6 62%, #9b9ba3 100%);
  --display: "Manrope", system-ui, sans-serif;
  --body: "Manrope", system-ui, sans-serif;
  --mono: "Geist Mono", ui-monospace, monospace;
  --r: 12px;
  --r-lg: 18px;
  --btn-r: 10px;
  --shadow: 0 20px 40px -24px rgba(0, 0, 0, .9);
  --glow: 0 0 0 1px rgba(255, 255, 255, .25), 0 30px 60px -30px rgba(255, 255, 255, .18);
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f3f3f4;
  --bg-2: #ffffff;
  --bg-3: #ececee;
  --fg: #0b0b0c;
  --fg-2: #4a4a50;
  --fg-3: #6e6e75;
  --line: rgba(0, 0, 0, .12);
  --line-2: rgba(0, 0, 0, .06);
  --accent: #0b0b0c;
  --accent-fg: #fff;
  --chrome-1: #2a2a2e;
  --chrome-2: #9a9aa2;
  --chrome-3: #3d3d42;
  --chrome: linear-gradient(100deg, #1a1a1d 0%, #6b6b73 32%, #1f1f22 50%, #8c8c94 66%, #2b2b2f 100%);
  --shadow: 0 20px 40px -26px rgba(0, 0, 0, .35);
  --glow: 0 0 0 1px rgba(0, 0, 0, .3), 0 30px 60px -30px rgba(0, 0, 0, .3);
  color-scheme: light;
}
body { font-weight: 450; }
.h2, .h3 { font-weight: 700; }
.accent { background: var(--chrome); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: chrome-shift 8s ease-in-out infinite alternate; }
@keyframes chrome-shift { to { background-position: 100% 0; } }

/* Hero centrado sobre la esfera */
.hero { min-height: min(calc(100svh - 104px), 920px); display: grid; place-items: center; padding: 48px 0 56px; overflow: hidden; }
.metal { position: absolute; pointer-events: none; }
.metal canvas { display: block; }
.metal-hero { z-index: -1; left: 50%; top: 50%; width: min(68vw, 680px); aspect-ratio: 1; translate: calc(-50% + var(--tx, 0px)) calc(-54% + var(--ty, 0px)); transition: translate 1.2s var(--ease-out); animation: orb-in 1.6s var(--ease-out) backwards; }
@keyframes orb-in { from { opacity: 0; scale: .82; } }
/* Si no hay WebGL queda una esfera cromada en CSS */
.metal-hero::before { content: ""; position: absolute; inset: 12%; border-radius: 50%; background: radial-gradient(circle at 35% 28%, #fff 0 8%, #a7a7b0 30%, #3a3a40 58%, #cfcfd6 78%, #55555c 100%); opacity: .35; }
.metal.ready::before { display: none; }
.hero-in { position: relative; display: grid; justify-items: center; gap: 26px; text-align: center; }
.hero h1 { font-family: var(--display); font-weight: 800; font-size: clamp(44px, 7.4vw, 104px); line-height: .98; letter-spacing: -.045em; max-width: 12ch; text-shadow: 0 2px 30px color-mix(in srgb, var(--bg) 60%, transparent); }
.hero .lead { max-width: 34em; color: color-mix(in srgb, var(--fg) 86%, transparent); text-shadow: 0 1px 16px var(--bg); }
.hero .cta-row { justify-content: center; }
.hero .btn:not(.btn-main) { background: var(--bg); }
.chip { background: color-mix(in srgb, var(--bg) 60%, transparent); }
.chip i { width: 6px; height: 6px; border-radius: 50%; background: #3ddc84; box-shadow: 0 0 0 3px rgba(61, 220, 132, .2); }
.bar { width: min(100%, 980px); display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 22px; border: 1px solid var(--line); border-radius: var(--r-lg); background: color-mix(in srgb, var(--bg-3) 70%, transparent); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.bar li { list-style: none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 24px 16px; font-weight: 700; font-size: 15px; }
.bar li + li { border-left: 1px solid var(--line-2); }
.bar .check { color: var(--fg); }
.hero-meta { font-size: 14px; color: var(--fg-3); }

/* Superficies: borde cromado que sigue al mouse */
@property --mx { syntax: "<percentage>"; inherits: false; initial-value: 50%; }
@property --my { syntax: "<percentage>"; inherits: false; initial-value: 0%; }
[data-shine] { --mx: 50%; --my: 0%; }
[data-shine]::before { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; background: radial-gradient(220px circle at var(--mx) var(--my), var(--chrome-1), transparent 70%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity .4s ease; pointer-events: none; }
@media (hover: hover) and (pointer: fine) { [data-shine]:hover::before { opacity: 1; } }
.ico { color: var(--fg); background: linear-gradient(160deg, var(--bg-3), var(--bg-2)); box-shadow: inset 0 1px 0 var(--line); }
.check { color: var(--fg); }
.pick { background: linear-gradient(180deg, color-mix(in srgb, var(--fg) 6%, var(--bg-2)), var(--bg-2) 60%); }
.rec { background: var(--chrome); color: var(--accent-fg); }
:root[data-theme="light"] .rec { color: #fff; }
.meter .m-fill { stroke: url(#g-cromo); }
.gift-ico { background: var(--chrome); color: #0b0b0c; }
:root[data-theme="light"] .gift-ico { color: #fff; }

.final { background: var(--bg); min-height: 460px; place-content: center; }
.metal-final { z-index: -1; left: 50%; top: 50%; width: 760px; aspect-ratio: 1; translate: -50% -50%; opacity: .32; }
.final .h2 { font-size: clamp(34px, 5vw, 64px); font-weight: 800; letter-spacing: -.04em; }
.final p { color: var(--fg); }

@media (max-width: 860px) {
  .hero { min-height: auto; padding: 56px 0 48px; }
  .metal-hero { width: 110vw; top: 30%; opacity: .45; }
  .bar { grid-template-columns: 1fr; }
  .bar li { justify-content: flex-start; padding: 16px 20px; }
  .bar li + li { border-left: 0; border-top: 1px solid var(--line-2); }
}
`,
  hero: String.raw`
  <div class="hero">
    <div class="metal metal-hero" aria-hidden="true" data-metal="circle"></div>
    <div class="wrap hero-in">
      <a class="chip enter" href="#preguntas"><i></i>Startup de estudiantes UdeC · <b>Gran Concepción</b></a>
      <h1 class="enter enter-2">Que tu negocio aparezca cuando te buscan</h1>
      <p class="lead enter enter-3">Cuando alguien busca un negocio como el tuyo en Google o en Maps, elige entre los que aparecen con fotos, horario y reseñas. Dejamos tu negocio listo para competir ahí: ficha de Google, fotos profesionales, catálogo y página web, todo a tu nombre.</p>
      <div class="cta-row enter enter-3">
        <a class="btn btn-main" href="#diagnostico">Pide tu diagnóstico gratis <svg class="btn-ico" width="18" height="18"><use href="#i-arrow"/></svg></a>
        <a class="btn" href="#planes">Ver planes</a>
      </div>
      <ul class="bar enter enter-4" data-seq>
        <li><svg class="check" width="18" height="18"><use href="#i-check"/></svg>Ficha de Google verificada</li>
        <li><svg class="check" width="18" height="18"><use href="#i-check"/></svg>Fotos reales de tu local</li>
        <li><svg class="check" width="18" height="18"><use href="#i-check"/></svg>Todo a tu nombre</li>
      </ul>
      <p class="hero-meta enter enter-4">Planes desde <span class="num">$150.000</span> · Respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
    </div>
  </div>`,
  script: String.raw`
<script type="module">
  // Esfera de metal líquido con Paper Shaders (misma librería que la referencia). Se pausa fuera de pantalla.
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  try {
    const P = await import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.80/+esm');
    document.querySelectorAll('[data-metal]').forEach((el) => {
      const shape = el.dataset.metal;
      const mount = new P.ShaderMount(el, P.liquidMetalFragmentShader, {
        u_colorBack: P.getShaderColorFromString('#00000000'),
        u_colorTint: P.getShaderColorFromString('#ffffff'),
        u_image: pixel,
        u_isImage: false,
        u_shape: P.LiquidMetalShapes[shape],
        u_repetition: shape === 'circle' ? 1.6 : 2.4,
        u_softness: .25,
        u_shiftRed: .12,
        u_shiftBlue: .12,
        u_distortion: .07,
        u_contour: .4,
        u_angle: 70,
        u_fit: P.ShaderFitOptions.contain,
        u_scale: shape === 'circle' ? .82 : 1,
        u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: .5, u_originY: .5, u_worldWidth: 0, u_worldHeight: 0,
      }, { alpha: true, premultipliedAlpha: false }, calm ? 0 : 1, 2400, 1.5, 1920 * 1080 * 2, ['u_image']);
      el.classList.add('ready');
      new IntersectionObserver(([e]) => mount.setSpeed(calm || !e.isIntersecting ? 0 : 1)).observe(el);
    });
  } catch (err) { /* sin WebGL o sin red: queda la esfera en CSS */ }

  // La esfera se inclina un poco hacia el mouse
  const orb = document.querySelector('.metal-hero');
  if (orb && !calm && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const hero = orb.parentElement;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      orb.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 40 + 'px');
      orb.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * 30 + 'px');
    });
    hero.addEventListener('pointerleave', () => { orb.style.removeProperty('--tx'); orb.style.removeProperty('--ty'); });
  }
</script>`,
};
