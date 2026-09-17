// Opción 4 · Cristal. Referencia del equipo: "Crystal Shader" (21st.dev/@dhileepkumargm).
// Campo de cristal líquido (celdas Voronoi deformadas) a pantalla completa que ondula con el mouse.
// Shader propio en WebGL: se pausa fuera de pantalla y queda quieto con movimiento reducido.
export default {
  n: 4,
  archivo: 'opcion-4-cristal.html',
  nombre: 'Cristal líquido',
  titulo: 'Bío Digital · Opción 4: Cristal líquido',
  tema: 'dark',
  fuentes: 'family=Syne:wght@500..800&family=Figtree:wght@400..700&family=JetBrains+Mono:wght@400..600',
  fondo: '<canvas id="cristal" aria-hidden="true"></canvas>',
  marca: `<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 2 26 9v12l-11 7L4 21V9Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M15 2v9l11-2M15 11 4 9m11 2 4 9m-4-9-5 10m9-1 7 1m-7-1-9 1 5 7m4-7-4 7" fill="none" stroke="var(--accent)" stroke-width="1" stroke-linejoin="round"/></svg>`,
  deco: { shine: false },
  mascota: String.raw`
/* Mascota: globo facetado con filo crema, personaje con tinte cálido */
.mascota { --m-paper: rgba(var(--ground), .94); --m-font: var(--body); --m-radio: 0px; --m-borde: 1px solid var(--accent); --m-sombra: 0 14px 30px -16px rgba(0, 0, 0, .6); --m-contorno: rgba(var(--ink), .6); --m-filtro: sepia(.2); --m-piso: rgba(var(--ink), .35); }
.m-globo { clip-path: polygon(-14px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% + 14px), -14px calc(100% + 14px)); }
`,
  css: String.raw`
:root {
  --bg: #050505;
  --bg-2: rgba(12, 11, 10, .86);
  --bg-3: rgba(236, 216, 191, .06);
  --fg: #f6efe6;
  --fg-2: #c9bcad;
  --fg-3: #978a7c;
  --line: rgba(236, 216, 191, .2);
  --line-2: rgba(236, 216, 191, .1);
  --accent: #ecd8bf;
  --accent-fg: #0a0806;
  --ink: 236, 216, 191;
  --ground: 5, 5, 5;
  --display: "Syne", "Arial Black", sans-serif;
  --body: "Figtree", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, monospace;
  --r: 4px;
  --r-lg: 6px;
  --btn-r: 99px;
  --shadow: 0 24px 50px -30px rgba(236, 216, 191, .25);
  --glow: 0 0 0 1px var(--accent), 0 0 60px -20px rgba(236, 216, 191, .45);
  color-scheme: dark;
}
:root[data-theme="light"] {
  --bg: #f4ede3;
  --bg-2: rgba(250, 246, 240, .9);
  --bg-3: rgba(40, 30, 20, .05);
  --fg: #16110c;
  --fg-2: #54483c;
  --fg-3: #7a6c5e;
  --line: rgba(40, 30, 20, .2);
  --line-2: rgba(40, 30, 20, .1);
  --accent: #16110c;
  --accent-fg: #f4ede3;
  --ink: 22, 17, 12;
  --ground: 244, 237, 227;
  --shadow: 0 24px 50px -30px rgba(40, 30, 20, .35);
  --glow: 0 0 0 1px var(--accent), 0 30px 60px -30px rgba(40, 30, 20, .4);
  color-scheme: light;
}
#cristal { position: fixed; inset: 0; z-index: -1; width: 100%; height: 100%; background: var(--bg); transition: opacity .6s ease; }
body { background: transparent; }
html { background: var(--bg); }
.h2 { font-weight: 700; letter-spacing: -.035em; text-transform: none; }
.h3 { font-family: var(--body); font-weight: 700; letter-spacing: 0; }
.top { background: rgba(var(--ground), .82); }
.proto { background: rgba(var(--ground), .9); }
.brand b { font-weight: 700; }
.accent { color: var(--accent); font-style: normal; }

/* Hero: el cristal ocupa todo; el texto va sobre un velo suave para leerse */
.hero { min-height: min(calc(100svh - 104px), 900px); display: grid; align-items: center; padding: 56px 0 72px; }
.hero::before { content: ""; position: absolute; inset: 0; z-index: -1; background: radial-gradient(60% 70% at 26% 52%, rgba(var(--ground), .88), rgba(var(--ground), .55) 55%, transparent 80%); pointer-events: none; }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, .75fr); gap: 56px; align-items: center; }
.hero-copy { display: grid; gap: 24px; justify-items: start; }
.hero h1 { font-family: var(--display); font-weight: 700; font-size: clamp(40px, 5.4vw, 80px); line-height: .95; letter-spacing: -.045em; }
.hero h1 span { display: block; color: var(--accent); }
.hero-meta { font-size: 14px; color: var(--fg-2); }
.btn { border-color: var(--line); }
.btn:not(.btn-main) { background: rgba(var(--ground), .6); }
.chip { background: rgba(var(--ground), .7); border-color: var(--line); font-family: var(--mono); font-size: 12px; letter-spacing: .04em; }

.facet { position: relative; padding: 26px; border: 1px solid var(--line); background: rgba(var(--ground), .82); clip-path: polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 28px 100%, 0 calc(100% - 28px)); }
.facet::after { content: ""; position: absolute; right: 0; top: 0; width: 40px; height: 1px; background: var(--accent); rotate: 45deg; translate: 6px 13px; }
.facet h2 { font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--fg-3); }
.facet ol { list-style: none; display: grid; gap: 14px; margin: 18px 0; }
.facet li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; font-size: 15px; }
.facet li b { font-family: var(--mono); font-weight: 500; color: var(--accent); }
.facet li i { grid-column: 1 / -1; height: 2px; background: var(--line-2); overflow: hidden; }
.facet li i::before { content: ""; display: block; height: 100%; width: calc(var(--w) * 1%); background: var(--accent); transform-origin: left; animation: fill 1.2s var(--ease-out) backwards; animation-delay: calc(.5s + var(--k, 0) * 90ms); }
@keyframes fill { from { transform: scaleX(0); } }
.facet .total { display: flex; justify-content: space-between; align-items: baseline; padding-top: 14px; border-top: 1px solid var(--line); }
.facet .total b { font-family: var(--display); font-size: 40px; font-weight: 800; letter-spacing: -.04em; }
.facet p { margin-top: 10px; font-size: 13px; color: var(--fg-2); }
.hint { position: absolute; left: 50%; bottom: 20px; translate: -50% 0; font-family: var(--mono); font-size: 12px; color: var(--fg-3); letter-spacing: .06em; }
@media (hover: none) { .hint { display: none; } }

/* Superficies facetadas sobre el cristal */
.tldr, .svc, .ledger, .rail, .dim, .step, .plan, .gift-box, .ask form, .faq details, .final, .promises li, .ask-alt { background: var(--bg-2); }
.svc, .plan, .dim { clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%); }
.svc { transition: transform .35s var(--ease-out), border-color .3s ease, background-color .3s ease; }
@media (hover: hover) and (pointer: fine) { .svc:hover { background: rgba(var(--ground), .95); border-color: var(--accent); box-shadow: none; } }
.ico { border-radius: 2px; color: var(--accent); background: transparent; rotate: 0deg; }
.check { color: var(--accent); }
.pick { box-shadow: none; border-color: var(--accent); background: rgba(var(--ground), .94); }
.rec { border-radius: 2px; font-family: var(--mono); font-weight: 500; letter-spacing: .04em; }
.price b, .pts b, .m-read b { font-family: var(--display); font-weight: 700; letter-spacing: -.04em; }
.price b { font-size: clamp(32px, 3vw, 40px); }
.pts b { color: var(--fg); }
.in-plans span, .note { border-radius: 2px; }
.gift-ico { border-radius: 2px; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); }
.meter .m-track { stroke-width: 2; }
.meter .m-fill { stroke-width: 2; stroke-linecap: butt; }
.final { background: rgba(var(--ground), .55); border-color: var(--accent); }
.final .h2 { font-size: clamp(36px, 5.2vw, 72px); font-weight: 800; }
.site-foot { background: rgba(var(--ground), .92); }

@media (max-width: 860px) {
  .hero { min-height: auto; }
  .hero-grid { grid-template-columns: minmax(0, 1fr); }
  .hero::before { background: rgba(var(--ground), .72); }
}
`,
  hero: String.raw`
  <div class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <span class="chip enter">Startup UdeC · Gran Concepción</span>
        <h1 class="enter enter-2">Que tu negocio aparezca <span>cuando te buscan</span></h1>
        <p class="lead enter enter-3">Cuando alguien busca un negocio como el tuyo en Google o en Maps, elige entre los que aparecen con fotos, horario y reseñas. Dejamos tu negocio listo para competir ahí: ficha de Google, fotos profesionales, catálogo y página web, todo a tu nombre.</p>
        <div class="cta-row enter enter-3">
          <a class="btn btn-main" href="#diagnostico">Pide tu diagnóstico gratis <svg class="btn-ico" width="18" height="18"><use href="#i-arrow"/></svg></a>
          <a class="btn" href="#planes">Ver planes</a>
        </div>
        <p class="hero-meta enter enter-4">Planes desde <span class="num">$150.000</span> · Respondemos en menos de 24 horas <span class="note">por confirmar</span></p>
      </div>
      <aside class="facet enter enter-3" aria-labelledby="t-facet">
        <h2 id="t-facet">Tu diagnóstico gratis revisa</h2>
        <ol data-seq class="in">
          <li style="--w:30"><span>Si te encuentran</span><b>30</b><i></i></li>
          <li style="--w:20"><span>Si tu información está completa</span><b>20</b><i></i></li>
          <li style="--w:20"><span>Cómo se ve tu negocio</span><b>20</b><i></i></li>
          <li style="--w:15"><span>Tu reputación</span><b>15</b><i></i></li>
          <li style="--w:15"><span>Si es fácil contactarte</span><b>15</b><i></i></li>
        </ol>
        <div class="total"><span>Puntaje máximo</span><b class="num">100</b></div>
        <p>Te entregamos tu puntaje y las tres mejoras que más te convienen.</p>
      </aside>
    </div>
    <p class="hint" aria-hidden="true">Mueve el mouse sobre el cristal</p>
  </div>`,
  script: String.raw`
<script>
  (function () {
    var c = document.getElementById('cristal');
    var gl = c && c.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    // Celdas de Voronoi animadas; el borde entre celdas es la línea de cristal.
    // Algunas celdas se "quiebran" con un borde más grueso; el mouse deja una onda que deforma el campo.
    var fs = [
      'precision highp float;',
      'uniform vec2 R;uniform float T;uniform vec2 M;uniform float MI;uniform vec3 INK;uniform vec3 BG;',
      'vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}',
      'vec4 voro(vec2 x){vec2 n=floor(x),f=fract(x),mg,mr;float md=8.;',
      ' for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=h2(n+g);o=.5+.45*sin(T*.35+6.2831*o);vec2 r=g+o-f;float d=dot(r,r);if(d<md){md=d;mr=r;mg=g;}}',
      ' md=8.;',
      ' for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 g=mg+vec2(float(i),float(j));vec2 o=h2(n+g);o=.5+.45*sin(T*.35+6.2831*o);vec2 r=g+o-f;if(dot(mr-r,mr-r)>1e-5)md=min(md,dot(.5*(mr+r),normalize(r-mr)));}',
      ' return vec4(md,n+mg,0.);}',
      'void main(){',
      ' vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;',
      ' vec2 m=(M-.5*R)/R.y;',
      ' uv+=.06*vec2(sin(uv.y*3.1+T*.21),cos(uv.x*2.7-T*.17));',
      ' vec2 d=uv-m;float dl=length(d)+1e-4;',
      ' uv+=d/dl*sin(dl*38.-T*5.)*exp(-dl*5.)*MI*.05;',
      ' vec4 v=voro(uv*13.);',
      ' float id=h2(v.yz).x;',
      ' float w=.007+.06*step(.94,id)*(.5+.5*sin(T*.5+id*40.));',
      ' float e=1.-smoothstep(w,w+.01,v.x);',
      ' float glow=exp(-v.x*18.)*.06;',
      ' float near=exp(-dl*3.)*MI;',
      ' vec3 tint=INK*(.9+.1*cos(6.2831*(id+vec3(0.,.33,.67))));',
      ' vec3 col=mix(BG,tint,clamp(e*(.55+.45*near)+glow+near*.04,0.,1.));',
      ' gl_FragColor=vec4(col,1.);}'
    ].join('\n');
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['R', 'T', 'M', 'MI', 'INK', 'BG'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

    var root = document.documentElement;
    function rgb(name) { return getComputedStyle(root).getPropertyValue(name).split(',').map(function (v) { return parseFloat(v) / 255; }); }
    var ink, bg;
    function colors() { ink = rgb('--ink'); bg = rgb('--ground'); }
    colors();
    new MutationObserver(function () { colors(); if (!running) draw(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // Resolución reducida: el campo es suave y así rinde en celulares
    var scale = 0.6;
    function size() {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round(innerWidth * dpr * scale);
      c.height = Math.round(innerHeight * dpr * scale);
      gl.viewport(0, 0, c.width, c.height);
      if (!running) draw(performance.now());
    }
    var mx = innerWidth * .7, my = innerHeight * .5, tx = mx, ty = my, energy = 0;
    addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      energy = Math.min(1, energy + .08);
    }, { passive: true });

    var running = false, raf = 0, t0 = performance.now();
    function draw(now) {
      mx += (tx - mx) * .08; my += (ty - my) * .08;
      energy *= .985;
      var k = c.width / innerWidth;
      gl.uniform2f(U.R, c.width, c.height);
      gl.uniform1f(U.T, calm ? 12 : (now - t0) / 1000);
      gl.uniform2f(U.M, mx * k, c.height - my * k);
      gl.uniform1f(U.MI, calm ? 0 : energy);
      gl.uniform3f(U.INK, ink[0], ink[1], ink[2]);
      gl.uniform3f(U.BG, bg[0], bg[1], bg[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
    function play(on) {
      if (calm) on = false;
      if (on === running) return;
      running = on;
      if (on) raf = requestAnimationFrame(loop); else cancelAnimationFrame(raf);
    }
    addEventListener('resize', size);
    size();
    draw(t0);
    // Arriba el cristal se ve completo; al bajar se atenúa y se detiene detrás del contenido
    var hero = document.querySelector('.hero');
    new IntersectionObserver(function (es) {
      var vis = es[0].isIntersecting;
      c.style.opacity = vis ? 1 : .28;
      play(vis && !document.hidden);
    }).observe(hero);
    document.addEventListener('visibilitychange', function () { play(!document.hidden && c.style.opacity !== '0.28'); });
  })();
</script>`,
};
