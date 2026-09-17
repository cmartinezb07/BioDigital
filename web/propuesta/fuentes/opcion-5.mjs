// Opción 5 · Terminal ASCII. Referencia del equipo: "Hero ASCII One" (21st.dev/@larsen66).
// Negro con puntos, ilustración en matriz de puntos (un local con el pin de Maps) con líneas de construcción,
// tipografía monoespaciada, botones con marco y barras de sistema arriba y abajo.
export default {
  n: 5,
  archivo: 'opcion-5-ascii.html',
  nombre: 'Terminal ASCII',
  titulo: 'Bío Digital · Opción 5: Terminal ASCII',
  tema: 'dark',
  fuentes: 'family=Space+Mono:ital,wght@0,400;0,700;1,700&family=Geist+Mono:wght@400..600',
  marca: `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><g fill="currentColor"><circle cx="11" cy="3" r="1.4"/><circle cx="6" cy="5" r="1.1"/><circle cx="16" cy="5" r="1.1"/><circle cx="4" cy="10" r="1.1"/><circle cx="18" cy="10" r="1.1"/><circle cx="11" cy="9" r="2"/><circle cx="7" cy="15" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="11" cy="20" r="1.4"/></g></svg>`,
  deco: {
    aspecto: (i) => `[ASPECTO_0${i + 1}]`,
    medidor: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="m-track" cx="50" cy="50" r="44"/><circle class="m-fill" cx="50" cy="50" r="44" pathLength="100"/><circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="1 3" opacity=".5"/></svg>',
    final: '<canvas class="final-dots" aria-hidden="true"></canvas>',
  },
  mascota: String.raw`
/* Mascota: globo de terminal con sombra dura (valores por defecto de mascota.css) */
.mascota { --m-font: var(--mono); }
`,
  css: String.raw`
:root {
  --bg: #000;
  --bg-2: #000;
  --bg-3: #0e0e0e;
  --fg: #f2f2f2;
  --fg-2: #b0b0b0;
  --fg-3: #8a8a8a;
  --line: rgba(255, 255, 255, .28);
  --line-2: rgba(255, 255, 255, .12);
  --accent: #f2f2f2;
  --accent-fg: #000;
  --dot: 255, 255, 255;
  --display: "Space Mono", ui-monospace, monospace;
  --body: "Geist Mono", ui-monospace, monospace;
  --mono: "Geist Mono", ui-monospace, monospace;
  --r: 0px;
  --r-lg: 0px;
  --btn-r: 0px;
  --shadow: none;
  --glow: none;
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f4f4f1;
  --bg-2: #f4f4f1;
  --bg-3: #e6e6e2;
  --fg: #0a0a0a;
  --fg-2: #444;
  --fg-3: #6b6b6b;
  --line: rgba(0, 0, 0, .3);
  --line-2: rgba(0, 0, 0, .12);
  --accent: #0a0a0a;
  --accent-fg: #f4f4f1;
  --dot: 0, 0, 0;
  color-scheme: light;
}
body { font-size: 15px; line-height: 1.7; background-image: radial-gradient(rgba(var(--dot), .16) .8px, transparent 1.2px); background-size: 22px 22px; }
.h2 { font-weight: 700; font-size: clamp(26px, 3.2vw, 40px); letter-spacing: .02em; text-transform: uppercase; line-height: 1.15; }
.h3 { font-family: var(--display); font-size: 15px; letter-spacing: .04em; text-transform: uppercase; }
.lead { font-size: 15px; }
.accent { color: inherit; text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 6px; text-decoration-thickness: 2px; }
.proto, .top { background: var(--bg); }
.top { border-bottom-color: var(--line); }
.brand { font-family: var(--display); font-style: italic; font-weight: 700; font-size: 17px; letter-spacing: .06em; text-transform: uppercase; }
.brand::after { content: "EST. 2026"; margin-left: 10px; padding-left: 12px; border-left: 1px solid var(--line); font-family: var(--mono); font-style: normal; font-weight: 400; font-size: 12px; color: var(--fg-3); letter-spacing: .08em; }
.nav-links a { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; border-radius: 0; }
.nav-links a[aria-current="page"]::before { content: "> "; }
.btn { font-family: var(--mono); font-size: 13px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; border-color: var(--fg); }
.btn-main { background: var(--fg); color: var(--bg); }
.btn:not(.btn-main) { background: var(--bg); }
@media (hover: hover) and (pointer: fine) {
  .btn:not(.btn-main):hover { background: var(--fg); color: var(--bg); border-color: var(--fg); }
  .btn-main:hover { background: var(--bg); color: var(--fg); border-color: var(--fg); }
}
.icon-btn { border-color: var(--line); }
.note { border-radius: 0; font-family: var(--mono); text-transform: uppercase; letter-spacing: .06em; font-size: 12px; }

/* Hero */
.hero { min-height: min(calc(100svh - 104px), 860px); display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; }
.hero canvas.field { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }
.coords { display: flex; justify-content: flex-end; gap: 28px; padding-top: 14px; font-size: 12px; color: var(--fg-3); letter-spacing: .08em; }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 40px; align-items: center; }
.art { aspect-ratio: 5 / 6; max-height: 600px; }
.hero-copy { position: relative; display: grid; gap: 22px; padding: 28px 0; }
.rule { display: flex; align-items: center; gap: 8px; color: var(--fg-3); }
.rule::before { content: ""; width: 34px; height: 1px; background: currentColor; }
.rule::after { content: ""; flex: 1; height: 1px; background: var(--fg-3); }
.rule i { width: 4px; height: 4px; background: currentColor; }
.hero h1 { font-family: var(--display); font-weight: 700; font-size: clamp(30px, 3.5vw, 50px); line-height: 1.12; letter-spacing: .06em; text-transform: uppercase; }
.hero h1 .cur { display: inline-block; width: .55em; height: .9em; margin-left: .15em; vertical-align: -.08em; background: var(--fg); animation: blink 1.1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
.dotted { border: 0; height: 2px; margin: 0; background: radial-gradient(circle, var(--fg-3) 1px, transparent 1.2px) 0 0 / 7px 2px repeat-x; }
.hero .lead { position: relative; padding-left: 20px; color: var(--fg); max-width: 40em; }
.hero .lead::before { content: "▪"; position: absolute; left: 0; top: 0; color: var(--fg-3); }
.hero-copy .foot-rule { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--fg-3); letter-spacing: .08em; }
.hero-copy .foot-rule::before { content: ""; flex: 1; height: 1px; background: var(--line); }
.sysbar { display: flex; justify-content: space-between; gap: 16px; padding: 14px 0; border-top: 1px solid var(--line); font-size: 12px; color: var(--fg-3); letter-spacing: .08em; }
.sysbar span { display: inline-flex; align-items: center; gap: 14px; }
.bars { display: inline-flex; gap: 3px; align-items: end; height: 14px; }
.bars i { width: 2px; background: var(--fg-3); height: 100%; animation: eq 1.4s ease-in-out infinite alternate; }
.bars i:nth-child(2n) { animation-delay: -.4s; }
.bars i:nth-child(3n) { animation-delay: -.9s; }
@keyframes eq { from { height: 30%; } }
.live::before { content: "●"; margin-right: 6px; animation: blink 2s steps(1) infinite; }

/* Secciones como paneles de sistema: esquinas marcadas, sin redondeo */
.tldr, .svc, .ledger, .rail, .dim, .step, .plan, .gift-box, .ask form, .faq details, .final, .promises li, .ask-alt { background: var(--bg); border-color: var(--line); }
.tldr, .gift-box, .dim { position: relative; }
.tldr::before, .dim::before, .plan::before, .final::before, .gift-box::before {
  content: ""; position: absolute; inset: -4px; pointer-events: none;
  background:
    linear-gradient(var(--fg), var(--fg)) 0 0 / 10px 1px, linear-gradient(var(--fg), var(--fg)) 0 0 / 1px 10px,
    linear-gradient(var(--fg), var(--fg)) 100% 0 / 10px 1px, linear-gradient(var(--fg), var(--fg)) 100% 0 / 1px 10px,
    linear-gradient(var(--fg), var(--fg)) 0 100% / 10px 1px, linear-gradient(var(--fg), var(--fg)) 0 100% / 1px 10px,
    linear-gradient(var(--fg), var(--fg)) 100% 100% / 10px 1px, linear-gradient(var(--fg), var(--fg)) 100% 100% / 1px 10px;
  background-repeat: no-repeat;
}
.tldr h2, .gift-text h2 { font-family: var(--display); text-transform: uppercase; letter-spacing: .04em; font-size: clamp(20px, 2.2vw, 26px); }
.sec-head .h2::before { content: "// "; color: var(--fg-3); }
.svc { transition: background-color .25s ease, color .25s ease; }
.svc p { color: var(--fg-2); }
@media (hover: hover) and (pointer: fine) {
  .svc:hover { transform: none; background: var(--fg); color: var(--bg); box-shadow: none; }
  .svc:hover p, .svc:hover .go { color: var(--bg); }
  .svc:hover .ico { color: var(--bg); border-color: var(--bg); }
  .entry:hover { background: var(--fg); color: var(--bg); }
  .entry:hover .d, .entry:hover .inc, .entry:hover .n, .entry:hover .chev { color: var(--bg); }
}
.ico { background: transparent; color: var(--fg); border-style: dashed; }
.check { color: var(--fg); }
.entry .n::before { content: "["; } .entry .n::after { content: "]"; }
.rec { border-radius: 0; background: var(--fg); color: var(--bg); font-family: var(--mono); letter-spacing: .08em; text-transform: uppercase; }
.pick { border-color: var(--fg); border-width: 2px; }
.price b, .pts b, .m-read b { font-family: var(--display); font-weight: 700; letter-spacing: 0; }
.pts b { color: var(--fg); }
.meter { color: var(--fg-3); }
.meter .m-track { stroke-width: 1; stroke-dasharray: 1 2; }
.meter .m-fill { stroke: var(--fg); stroke-width: 7; stroke-linecap: butt; }
.rail ol a { border-radius: 0; }
.rail ol a.on::before { content: ">"; margin-right: -4px; }
.low { background: transparent; border: 1px dashed var(--line); }
.in-plans span { border-radius: 0; }
.gift-ico { border-radius: 0; background: var(--fg); color: var(--bg); }
.ask input:not([type="checkbox"]), .ask select { border-radius: 0; background: var(--bg); font-family: var(--mono); }
.form-status:not(:empty)::before { content: "> "; }
.faq summary { text-transform: none; }
.faq summary .n::before { content: "["; } .faq summary .n::after { content: "]"; }
.final { background: var(--bg); min-height: 440px; place-content: center; }
.final-dots { position: absolute; inset: 0; z-index: -1; width: 100%; height: 100%; }
.final .h2 { font-size: clamp(28px, 4vw, 52px); }
.final p { background: var(--bg); }
.to-top, .dock .btn { border-radius: 0; }

@media (max-width: 860px) {
  .hero { min-height: auto; }
  .hero-grid { grid-template-columns: 1fr; gap: 0; }
  .art { order: 2; max-height: 380px; aspect-ratio: auto; height: 380px; }
  .coords { justify-content: flex-start; gap: 16px; }
  .brand::after { display: none; }
  .sysbar .hide-sm { display: none; }
}
`,
  hero: String.raw`
  <div class="hero">
    <canvas class="field" aria-hidden="true"></canvas>
    <div class="wrap coords" aria-hidden="true"><span>LAT: -36.8270°</span><span>LONG: -73.0503°</span><span class="hide-sm">CONCEPCIÓN, CL</span></div>
    <div class="wrap hero-grid">
      <div class="art" data-art aria-hidden="true"></div>
      <div class="hero-copy">
        <div class="rule enter"><i></i></div>
        <h1 class="enter enter-2">Que tu negocio aparezca cuando te buscan<span class="cur" aria-hidden="true"></span></h1>
        <hr class="dotted enter enter-2">
        <p class="lead enter enter-3">Cuando alguien busca un negocio como el tuyo en Google o en Maps, elige entre los que aparecen con fotos, horario y reseñas. Dejamos tu negocio listo para competir ahí: ficha de Google, fotos profesionales, catálogo y página web, todo a tu nombre.</p>
        <div class="cta-row enter enter-3">
          <a class="btn btn-main" href="#diagnostico">Pide tu diagnóstico gratis</a>
          <a class="btn" href="#planes">Ver planes</a>
        </div>
        <p class="foot-rule enter enter-4">DESDE $150.000 · RESPUESTA &lt; 24 H <span class="note">por confirmar</span></p>
      </div>
    </div>
    <div class="wrap sysbar" aria-hidden="true">
      <span>STARTUP.UDEC <i class="bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></i> <b class="hide-sm">GRAN CONCEPCIÓN</b></span>
      <span><span class="live">DIAGNÓSTICO GRATIS</span><span class="hide-sm">CUPOS: 5 CON BENEFICIO</span></span>
    </div>
  </div>`,
  script: String.raw`
<script>
  (function () {
    var root = document.documentElement;
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    function dotRGB() { return getComputedStyle(root).getPropertyValue('--dot').trim(); }
    function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

    // Dibujo base (en blanco sobre transparente): pin de Maps con volumen y un local con toldo
    function paintShape(g, w, h) {
      g.clearRect(0, 0, w, h);
      var cx = w * .5, cy = h * .3, r = Math.min(w, h) * .22;
      var sphere = g.createRadialGradient(cx - r * .35, cy - r * .4, r * .1, cx, cy, r * 1.05);
      sphere.addColorStop(0, 'rgba(255,255,255,1)');
      sphere.addColorStop(.55, 'rgba(255,255,255,.55)');
      sphere.addColorStop(1, 'rgba(255,255,255,.12)');
      g.fillStyle = sphere;
      g.beginPath();
      g.moveTo(cx - r * .93, cy + r * .38);
      g.arc(cx, cy, r, Math.PI * .87, Math.PI * .13);
      g.lineTo(cx, cy + r * 1.95);
      g.closePath();
      g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(cx, cy, r * .38, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
      // Local: toldo a rayas, vitrina y puerta
      var x0 = w * .1, x1 = w * .9, y0 = h * .64, y1 = h * .96;
      var body = g.createLinearGradient(x0, y0, x1, y1);
      body.addColorStop(0, 'rgba(255,255,255,.55)');
      body.addColorStop(1, 'rgba(255,255,255,.18)');
      g.fillStyle = body;
      g.fillRect(x0, y0 + h * .07, x1 - x0, y1 - y0 - h * .07);
      var stripes = 8, sw = (x1 - x0 + w * .04) / stripes;
      for (var i = 0; i < stripes; i++) {
        g.fillStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.95)';
        g.beginPath();
        var sx = x0 - w * .02 + i * sw;
        g.moveTo(sx, y0); g.lineTo(sx + sw, y0); g.lineTo(sx + sw * .92, y0 + h * .07); g.lineTo(sx + sw * .08, y0 + h * .07);
        g.closePath(); g.fill();
      }
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = 'rgba(0,0,0,.75)';
      g.fillRect(x0 + (x1 - x0) * .08, y0 + h * .11, (x1 - x0) * .48, h * .13);
      g.fillStyle = 'rgba(0,0,0,.9)';
      g.fillRect(x0 + (x1 - x0) * .66, y0 + h * .11, (x1 - x0) * .24, y1 - y0 - h * .11);
      g.globalCompositeOperation = 'source-over';
      return { cx: cx, cy: cy, r: r, x0: x0, x1: x1, y0: y0, y1: y1 };
    }

    // Campo de puntos del hero: estrellas en todo el fondo + la ilustración en semitono sobre el bloque .art
    function field(canvas, artEl, opts) {
      var ctx = canvas.getContext('2d');
      var off = document.createElement('canvas');
      var og = off.getContext('2d', { willReadFrequently: true });
      var W, H, dpr, cells = [], stars = [], geo = null, box = null, t0 = performance.now();
      var mouse = { x: -999, y: -999 };
      function build() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        var rc = canvas.getBoundingClientRect();
        W = rc.width; H = rc.height;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = [];
        var n = Math.round(W * H / (opts.density || 2600));
        for (var i = 0; i < n; i++) stars.push([hash(i) * W, hash(i + 99) * H, .4 + hash(i + 7) * .9, hash(i + 3) * 6.28]);
        cells = []; geo = null;
        if (!artEl) return;
        var ra = artEl.getBoundingClientRect();
        box = { x: ra.left - rc.left, y: ra.top - rc.top, w: ra.width, h: ra.height };
        var step = W < 700 ? 6 : 7;
        var cols = Math.floor(box.w / step), rows = Math.floor(box.h / step);
        off.width = cols; off.height = rows;
        geo = paintShape(og, cols, rows);
        var data = og.getImageData(0, 0, cols, rows).data;
        for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
          var a = data[(y * cols + x) * 4 + 3] / 255;
          if (a > .04) cells.push([box.x + x * step + step / 2, box.y + y * step + step / 2, a, y / rows, hash(y * 977 + x)]);
        }
        box.step = step;
      }
      function draw(now) {
        var t = (now - t0) / 1000;
        var rgb = dotRGB();
        ctx.clearRect(0, 0, W, H);
        // Estrellas
        ctx.fillStyle = 'rgba(' + rgb + ',.55)';
        ctx.beginPath();
        stars.forEach(function (s) {
          var tw = calm ? 1 : .6 + .4 * Math.sin(t * 1.3 + s[3]);
          ctx.moveTo(s[0] + s[2] * tw, s[1]);
          ctx.arc(s[0], s[1], s[2] * tw, 0, 6.283);
        });
        ctx.fill();
        if (!cells.length) return;
        // Líneas de construcción
        var s = box.step, bx = box.x, by = box.y;
        ctx.strokeStyle = 'rgba(' + rgb + ',.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        var cx = bx + geo.cx * s, cy = by + geo.cy * s, r = geo.r * s;
        ctx.moveTo(cx + r * 1.25, cy); ctx.arc(cx, cy, r * 1.25, 0, 6.283);
        ctx.moveTo(bx - 10, cy); ctx.lineTo(bx + box.w + 10, cy);
        ctx.moveTo(cx, by - 6); ctx.lineTo(cx, by + box.h);
        ctx.rect(bx + geo.x0 * s - 8, by + geo.y0 * s - 8, (geo.x1 - geo.x0) * s + 16, (geo.y1 - geo.y0) * s + 16);
        // Espiral áurea pequeña, como en la referencia
        var gx = bx + box.w * .78, gy = by + box.h * .5, gr = box.w * .12;
        for (var k = 0; k < 4; k++) {
          ctx.moveTo(gx + gr * Math.cos(k * Math.PI / 2), gy + gr * Math.sin(k * Math.PI / 2));
          ctx.arc(gx, gy, gr, k * Math.PI / 2, (k + 1) * Math.PI / 2);
          gr *= .62;
        }
        ctx.stroke();
        // Semitono: el dibujo aparece de abajo hacia arriba y titila
        var reveal = calm ? 2 : Math.min(2, t / .9);
        var buckets = [[], [], []];
        cells.forEach(function (c) {
          if (1 - c[3] > reveal) return;
          var a = c[2] * (calm ? 1 : .82 + .18 * Math.sin(t * 2.2 + c[4] * 40));
          var dx = c[0] - mouse.x, dy = c[1] - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 6400) a = Math.min(1, a + (1 - d2 / 6400) * .6);
          var rad = s * .42 * Math.sqrt(a);
          buckets[a > .66 ? 2 : a > .33 ? 1 : 0].push(c[0], c[1], rad);
        });
        [.45, .7, 1].forEach(function (alpha, bi) {
          var b = buckets[bi];
          ctx.fillStyle = 'rgba(' + rgb + ',' + alpha + ')';
          ctx.beginPath();
          for (var i = 0; i < b.length; i += 3) { ctx.moveTo(b[i] + b[i + 2], b[i + 1]); ctx.arc(b[i], b[i + 1], b[i + 2], 0, 6.283); }
          ctx.fill();
        });
      }
      var running = false, raf = 0, last = 0;
      function loop(now) {
        raf = requestAnimationFrame(loop);
        if (now - last < 33) return; // 30 cuadros por segundo bastan
        last = now;
        draw(now);
      }
      function play(on) {
        if (calm) { draw(performance.now()); return; }
        if (on === running) return;
        running = on;
        if (on) raf = requestAnimationFrame(loop); else cancelAnimationFrame(raf);
      }
      build();
      draw(performance.now());
      addEventListener('resize', function () { build(); draw(performance.now()); });
      document.fonts && document.fonts.ready.then(function () { build(); draw(performance.now()); });
      new MutationObserver(function () { draw(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
      new IntersectionObserver(function (es) { play(es[0].isIntersecting); }).observe(canvas);
      if (fine && artEl) {
        canvas.parentElement.addEventListener('pointermove', function (e) {
          var rc = canvas.getBoundingClientRect();
          mouse.x = e.clientX - rc.left; mouse.y = e.clientY - rc.top;
        });
        canvas.parentElement.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
      }
    }
    var hero = document.querySelector('.hero canvas.field');
    if (hero) field(hero, document.querySelector('[data-art]'), { density: 2400 });
    var fin = document.querySelector('.final-dots');
    if (fin) field(fin, null, { density: 1400 });
  })();
</script>`,
};
