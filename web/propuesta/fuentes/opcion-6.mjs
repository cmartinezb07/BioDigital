// Opción 6 · Panel SaaS. Referencia del equipo: "SaaS Template" (21st.dev/@waleedkibhen).
// Negro, aviso en píldora, titular con degradado, botón blanco, resplandor naranjo en el horizonte
// y un panel de control del proyecto que se endereza al hacer scroll.
// El panel solo muestra datos reales de la oferta (entregables, puntajes máximos, pasos); va rotulado como ejemplo.
const ok = '<svg width="14" height="14"><use href="#i-check"/></svg>';
export default {
  n: 6,
  archivo: 'opcion-6-panel.html',
  nombre: 'Panel SaaS',
  titulo: 'Bío Digital · Opción 6: Panel SaaS',
  tema: 'dark',
  fuentes: 'family=Poppins:wght@400;500;600&family=Geist+Mono:wght@400..600',
  marca: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect x="1" y="1" width="26" height="26" rx="8" fill="var(--fg)"/><path d="M9 18.5V9.5h5.2a2.6 2.6 0 0 1 0 5.2H9m5.2 0a2 2 0 0 1 0 3.8H9" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  deco: { shine: true },
  mascota: String.raw`
/* Mascota: tarjeta del panel con filo naranjo arriba */
.mascota { --m-paper: var(--bg-3); --m-font: var(--body); --m-radio: 12px; --m-borde: 1px solid var(--line); --m-sombra: 0 -1px 0 color-mix(in srgb, var(--warm) 60%, transparent), 0 18px 40px -20px rgba(0, 0, 0, .7); --m-contorno: color-mix(in srgb, var(--warm) 45%, transparent); --m-piso: color-mix(in srgb, var(--warm) 50%, transparent); --m-control: var(--bg-3); }
:root[data-theme="light"] .mascota { --m-sombra: 0 -1px 0 color-mix(in srgb, var(--warm) 60%, transparent), 0 16px 34px -20px rgba(0, 0, 0, .3); }
`,
  css: String.raw`
:root {
  --bg: #000;
  --bg-2: #0a0a0b;
  --bg-3: #141416;
  --fg: #fafafa;
  --fg-2: #a3adbf;
  --fg-3: #7c8595;
  --line: rgba(255, 255, 255, .1);
  --line-2: rgba(255, 255, 255, .06);
  --accent: #fafafa;
  --accent-fg: #000;
  --warm: #ff9a3c;
  --warm-2: #ffcf8a;
  --side: #09090a;
  --display: "Poppins", system-ui, sans-serif;
  --body: "Poppins", system-ui, sans-serif;
  --mono: "Geist Mono", ui-monospace, monospace;
  --r: 10px;
  --r-lg: 16px;
  --btn-r: 10px;
  --shadow: 0 20px 50px -30px rgba(255, 154, 60, .35);
  --glow: 0 0 0 1px rgba(255, 154, 60, .5), 0 30px 80px -30px rgba(255, 154, 60, .45);
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #ffffff;
  --bg-2: #fbfbfc;
  --bg-3: #f2f3f5;
  --fg: #0b0c0f;
  --fg-2: #505a6b;
  --fg-3: #6b7383;
  --line: rgba(11, 12, 15, .1);
  --line-2: rgba(11, 12, 15, .06);
  --accent: #0b0c0f;
  --accent-fg: #fff;
  --warm: #e2700f;
  --warm-2: #f7a24b;
  --side: #f5f5f6;
  --shadow: 0 20px 50px -30px rgba(226, 112, 15, .35);
  --glow: 0 0 0 1px rgba(226, 112, 15, .5), 0 30px 80px -30px rgba(226, 112, 15, .35);
  color-scheme: light;
}
html { background: var(--side); }
body { font-size: 16px; background: linear-gradient(90deg, var(--side), var(--side) calc(50% - 640px), var(--bg) calc(50% - 640px), var(--bg) calc(50% + 640px), var(--side) calc(50% + 640px)); }
main, .top, .site-foot { border-inline: 1px solid var(--line-2); max-width: 1280px; margin-inline: auto; }
.top { background: color-mix(in srgb, var(--bg) 85%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.nav { width: min(100% - 48px, 1180px); }
.h2 { font-weight: 600; letter-spacing: -.035em; }
.h3 { font-weight: 600; font-size: 18px; }
.accent { background: linear-gradient(180deg, var(--fg) 20%, var(--fg-3)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.btn-main { background: linear-gradient(180deg, #fff, #d9d9de); color: #000; box-shadow: inset 0 -2px 0 rgba(0, 0, 0, .12), 0 8px 24px -10px rgba(255, 255, 255, .35); }
:root[data-theme="light"] .btn-main { background: linear-gradient(180deg, #2a2c33, #0b0c0f); color: #fff; box-shadow: inset 0 1px 0 rgba(255, 255, 255, .15), 0 8px 24px -12px rgba(0, 0, 0, .5); }
.check { color: var(--warm); }

/* Hero centrado con resplandor y panel */
.hero { padding: clamp(40px, 6vw, 72px) 0 0; overflow: hidden; text-align: center; }
.hero-in { display: grid; justify-items: center; gap: 22px; }
.pill { display: inline-flex; align-items: center; gap: 10px; padding: 7px 16px; border: 1px solid rgba(120, 150, 255, .35); border-radius: 99px; font-size: 13px; color: var(--fg-2); background: rgba(80, 110, 255, .06); text-decoration: none; transition: border-color .25s ease, background-color .25s ease; }
.pill b { color: var(--fg); font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
.pill svg { transition: transform .3s var(--ease-out); }
@media (hover: hover) and (pointer: fine) { .pill:hover { border-color: rgba(120, 150, 255, .6); } .pill:hover svg { transform: translateX(3px); } }
.hero h1 { font-weight: 600; font-size: clamp(40px, 5.8vw, 76px); line-height: 1.04; letter-spacing: -.05em; max-width: 15ch; }
.hero h1 span { display: block; background: linear-gradient(180deg, var(--fg) 10%, color-mix(in srgb, var(--fg) 45%, var(--bg))); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero .lead { max-width: 36em; color: var(--fg-2); }
.hero .cta-row { justify-content: center; }
.hero-meta { font-size: 13px; color: var(--fg-3); }
.horizon { position: relative; height: 150px; margin-top: 12px; }
.horizon::before { content: ""; position: absolute; left: 50%; bottom: 0; width: min(900px, 110vw); height: 220px; translate: -50% 40%; background: radial-gradient(closest-side, color-mix(in srgb, var(--warm) 70%, transparent), color-mix(in srgb, var(--warm) 22%, transparent) 45%, transparent); filter: blur(10px); animation: breathe 6s ease-in-out infinite alternate; }
@keyframes breathe { to { opacity: .7; scale: 1.06 1; } }

.stage { position: relative; perspective: 1400px; margin-top: -40px; }
.stage::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 90px; background: linear-gradient(transparent, var(--bg)); pointer-events: none; }
.dash { position: relative; width: min(100% - 48px, 1030px); margin-inline: auto; display: grid; grid-template-columns: 190px minmax(0, 1fr); text-align: left; border: 1px solid var(--line); border-bottom: 0; border-radius: 16px 16px 0 0; background: var(--bg-2); box-shadow: 0 -1px 0 color-mix(in srgb, var(--warm) 60%, transparent), 0 -30px 80px -40px var(--warm); transform-origin: 50% 0; }
@supports (animation-timeline: view()) {
  .motion .dash { animation: tilt linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
  @keyframes tilt { from { transform: rotateX(18deg) scale(.94); opacity: .6; } }
}
.dash-side { padding: 18px 12px; border-right: 1px solid var(--line-2); display: grid; align-content: start; gap: 4px; font-size: 13px; }
.dash-side b { display: flex; align-items: center; gap: 8px; padding: 4px 8px 16px; font-weight: 600; font-size: 14px; }
.dash-side span { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; color: var(--fg-2); }
.dash-side span.on { color: var(--fg); background: var(--bg-3); box-shadow: inset 0 0 0 1px var(--line); }
.dash-main { padding: 18px 20px 26px; display: grid; gap: 16px; }
.dash-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--line-2); }
.dash-head h2 { font-size: 17px; font-weight: 600; }
.dash-head p { font-size: 12px; color: var(--fg-3); }
.tag-ej { padding: 3px 10px; border-radius: 99px; border: 1px dashed var(--line); font-size: 12px; color: var(--fg-3); }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat { padding: 14px; border: 1px solid var(--line-2); border-radius: 12px; background: var(--bg-3); }
.stat small { display: block; font-size: 12px; color: var(--fg-3); }
.stat b { display: block; margin-top: 4px; font-size: 20px; font-weight: 600; letter-spacing: -.02em; }
.stat i { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-style: normal; font-size: 12px; color: #3ecf8e; }
.panels { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 12px; }
.panel { padding: 16px; border: 1px solid var(--line-2); border-radius: 12px; background: var(--bg-3); }
.panel h3 { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; margin-bottom: 14px; }
.panel h3 small { font-weight: 400; color: var(--fg-3); font-size: 12px; }
.bars6 { display: grid; gap: 10px; }
.bars6 div { display: grid; grid-template-columns: 110px minmax(0, 1fr) 28px; gap: 10px; align-items: center; font-size: 12px; color: var(--fg-2); }
.bars6 div i { height: 8px; border-radius: 99px; background: var(--line-2); overflow: hidden; }
.bars6 div i::before { content: ""; display: block; height: 100%; width: calc(var(--w) / 30 * 100%); border-radius: inherit; background: linear-gradient(90deg, var(--warm), var(--warm-2)); transform-origin: left; }
.motion .bars6.in div i::before { animation: grow 1.2s var(--ease-out) backwards; animation-delay: calc(.2s + var(--k, 0) * 80ms); }
@keyframes grow { from { transform: scaleX(0); } }
.bars6 div b { text-align: right; font-family: var(--mono); font-weight: 500; color: var(--fg); }
.timeline { list-style: none; display: grid; gap: 12px; }
.timeline li { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 13px; }
.timeline .dot { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--line); color: var(--fg-3); }
.timeline .done .dot { background: #3ecf8e; border-color: #3ecf8e; color: #04120b; }
.timeline .now .dot { border-color: var(--warm); box-shadow: 0 0 0 4px color-mix(in srgb, var(--warm) 20%, transparent); }
.timeline .now .dot::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--warm); animation: pulse 1.6s ease-in-out infinite; }
@keyframes pulse { 50% { scale: .6; opacity: .6; } }
.timeline small { color: var(--fg-3); font-size: 12px; }

/* Secciones */
.sec-head.center { text-align: center; }
.svc, .plan { background: linear-gradient(180deg, var(--bg-3), var(--bg-2)); }
@property --mx { syntax: "<percentage>"; inherits: false; initial-value: 50%; }
@property --my { syntax: "<percentage>"; inherits: false; initial-value: 0%; }
[data-shine]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(360px circle at var(--mx) var(--my), color-mix(in srgb, var(--warm) 12%, transparent), transparent 60%); opacity: 0; transition: opacity .4s ease; pointer-events: none; }
@media (hover: hover) and (pointer: fine) { [data-shine]:hover::after { opacity: 1; } .svc:hover { border-color: color-mix(in srgb, var(--warm) 45%, transparent); } }
.ico { color: var(--warm); border-radius: 10px; }
.rec { background: var(--warm); color: #140800; }
.pick { background: linear-gradient(180deg, color-mix(in srgb, var(--warm) 10%, var(--bg-2)), var(--bg-2) 55%); }
.pick::before { content: ""; position: absolute; left: 20%; right: 20%; top: -1px; height: 1px; background: linear-gradient(90deg, transparent, var(--warm), transparent); }
.meter .m-fill { stroke: var(--warm); }
.gift-ico { background: var(--warm); color: #140800; }
.gift-box { background: radial-gradient(80% 140% at 0% 50%, color-mix(in srgb, var(--warm) 12%, transparent), transparent 60%), var(--bg-2); }
.final { background: var(--bg); border: 0; overflow: hidden; }
.final::before { content: ""; position: absolute; left: 50%; bottom: -160px; width: 900px; height: 320px; translate: -50% 0; z-index: -1; background: radial-gradient(closest-side, color-mix(in srgb, var(--warm) 55%, transparent), transparent); filter: blur(12px); }
.final .h2 { font-size: clamp(34px, 5vw, 60px); }
.site-foot { border-top: 1px solid var(--line-2); }

@media (max-width: 900px) {
  .dash { grid-template-columns: 1fr; width: calc(100% - 24px); }
  .dash-side { display: none; }
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .panels { grid-template-columns: 1fr; }
  main, .top, .site-foot { border-inline: 0; }
}
@media (max-width: 480px) { .bars6 div { grid-template-columns: 88px minmax(0, 1fr) 24px; } }
`,
  hero: String.raw`
  <div class="hero">
    <div class="wrap hero-in">
      <a class="pill enter" href="#beneficio">Beneficio para los primeros 5 clientes <b>Ver más <svg width="14" height="14"><use href="#i-arrow"/></svg></b></a>
      <h1 class="enter enter-2">Que tu negocio aparezca <span>cuando te buscan</span></h1>
      <p class="lead enter enter-3">Cuando alguien busca un negocio como el tuyo en Google o en Maps, elige entre los que aparecen con fotos, horario y reseñas. Dejamos tu negocio listo para competir ahí: ficha de Google, fotos profesionales, catálogo y página web, todo a tu nombre.</p>
      <div class="cta-row enter enter-3">
        <a class="btn btn-main" href="#diagnostico">Pide tu diagnóstico gratis <svg class="btn-ico" width="18" height="18"><use href="#i-arrow"/></svg></a>
        <a class="btn" href="#planes">Ver planes</a>
      </div>
      <p class="hero-meta enter enter-4">Startup de estudiantes UdeC · Planes desde <span class="num">$150.000</span> · Respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
    </div>
    <div class="horizon" aria-hidden="true"></div>
    <div class="stage">
      <figure class="dash" aria-label="Ejemplo ilustrativo del panel de un proyecto con plan Estándar">
        <nav class="dash-side" aria-hidden="true">
          <b><svg width="18" height="18"><use href="#i-pin"/></svg>Tu negocio</b>
          <span class="on"><svg width="16" height="16"><use href="#i-web"/></svg>Resumen</span>
          <span><svg width="16" height="16"><use href="#i-pin"/></svg>Ficha de Google</span>
          <span><svg width="16" height="16"><use href="#i-camera"/></svg>Fotos</span>
          <span><svg width="16" height="16"><use href="#i-book"/></svg>Catálogo</span>
          <span><svg width="16" height="16"><use href="#i-star"/></svg>Reseñas</span>
          <span><svg width="16" height="16"><use href="#i-mail"/></svg>Dominio y correo</span>
        </nav>
        <div class="dash-main">
          <div class="dash-head"><div><h2>Resumen del proyecto</h2><p>Plan Estándar · así se ve el avance</p></div><span class="tag-ej">Ejemplo ilustrativo</span></div>
          <div class="stats">
            <div class="stat"><small>Ficha de Google</small><b>Verificada</b><i>${ok}a tu nombre</i></div>
            <div class="stat"><small>Fotos del local</small><b>10 a 15</b><i>${ok}en tu carpeta</i></div>
            <div class="stat"><small>Dominio</small><b>tunegocio.cl</b><i>${ok}1er año incluido</i></div>
            <div class="stat"><small>Soporte</small><b>14 días</b><i>${ok}después de la entrega</i></div>
          </div>
          <div class="panels">
            <div class="panel">
              <h3>Cómo se reparte tu puntaje <small>máximo por aspecto</small></h3>
              <div class="bars6 reveal" data-seq>
                <div style="--w:30"><span>Te encuentran</span><i></i><b>30</b></div>
                <div style="--w:20"><span>Información</span><i></i><b>20</b></div>
                <div style="--w:20"><span>Imagen</span><i></i><b>20</b></div>
                <div style="--w:15"><span>Reputación</span><i></i><b>15</b></div>
                <div style="--w:15"><span>Contacto</span><i></i><b>15</b></div>
              </div>
            </div>
            <div class="panel">
              <h3>Avance <small>3 a 7 días hábiles</small></h3>
              <ol class="timeline">
                <li class="done"><span class="dot">${ok}</span><span>Diagnóstico gratis</span><small>Paso 1</small></li>
                <li class="done"><span class="dot">${ok}</span><span>Propuesta y precio</span><small>Paso 2</small></li>
                <li class="now"><span class="dot"></span><span>Visita a tu local</span><small>Paso 3</small></li>
                <li><span class="dot"></span><span>Entrega y capacitación</span><small>Paso 4</small></li>
              </ol>
            </div>
          </div>
        </div>
      </figure>
    </div>
  </div>`,
};
