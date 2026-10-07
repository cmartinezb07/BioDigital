// Rueda de paleta (herramienta del equipo; no va en el sitio publicado).
// Cambia --c1 (color principal) y --c2 (color de luz); el resto de la paleta se deriva en el CSS de la opción 8.
// Guarda la elección en este navegador y arma un enlace ?c1=…&c2=… para compartirla.
(function () {
  var root = document.documentElement;
  var actions = document.querySelector('.nav-actions');
  if (!actions) return;
  var DEF = { c1: '#f08a4b', c2: '#a47cff' };
  var PRESETS = [
    ['Mezcla 6 + 7', '#f08a4b', '#a47cff'],
    ['Naranjo (opción 6)', '#ff9a3c', '#7890ff'],
    ['Cobre y violeta (opción 7)', '#e07a5f', '#be96ff'],
    ['Ámbar y rosa', '#f2a65a', '#f096be'],
  ];
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexToHsl(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min, h = 0, s = 0;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return [h, s, l];
  }
  function hslToHex(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, rgb;
    if (h < 60) rgb = [c, x, 0]; else if (h < 120) rgb = [x, c, 0]; else if (h < 180) rgb = [0, c, x];
    else if (h < 240) rgb = [0, x, c]; else if (h < 300) rgb = [x, 0, c]; else rgb = [c, 0, x];
    return '#' + rgb.map(function (v) { return ('0' + Math.round((v + m) * 255).toString(16)).slice(-2); }).join('');
  }
  var isHex = function (v) { return /^#[0-9a-f]{6}$/i.test(v); };
  var read = function (k) { var v = getComputedStyle(root).getPropertyValue('--' + k).trim(); return isHex(v) ? v.toLowerCase() : DEF[k]; };
  var state = { c1: read('c1'), c2: read('c2') };
  var active = 'c1';

  // Botón junto al de tema
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'icon-btn pal-btn';
  btn.setAttribute('aria-label', 'Cambiar la paleta de colores');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'paleta');
  btn.innerHTML = '<span class="pal-dot" aria-hidden="true"></span>';
  actions.insertBefore(btn, actions.firstChild);

  var pal = document.createElement('div');
  pal.className = 'pal';
  pal.id = 'paleta';
  pal.setAttribute('role', 'dialog');
  pal.setAttribute('aria-label', 'Paleta de colores');
  pal.innerHTML =
    '<div class="pal-head"><b>Paleta de colores</b><span>Solo para el equipo</span></div>' +
    '<div class="pal-presets">' + PRESETS.map(function (p, i) {
      return '<button type="button" data-preset="' + i + '" title="' + p[0] + '"><i style="background:' + p[1] + '"></i><i style="background:' + p[2] + '"></i><span>' + p[0] + '</span></button>';
    }).join('') + '</div>' +
    '<div class="pal-wheel" data-wheel><div class="pal-hole"></div>' +
    '<button type="button" class="pal-h" data-h="c1" aria-label="Tono del color principal"></button>' +
    '<button type="button" class="pal-h" data-h="c2" aria-label="Tono del color de luz"></button></div>' +
    ['c1', 'c2'].map(function (k) {
      return '<div class="pal-row" data-row="' + k + '"><button type="button" class="pal-pick" data-pick="' + k + '">' + (k === 'c1' ? 'Principal' : 'Luz') + '</button>' +
        '<label class="sr" for="pal-hex-' + k + '">Código del color ' + (k === 'c1' ? 'principal' : 'de luz') + '</label>' +
        '<input id="pal-hex-' + k + '" class="pal-hex" data-hex="' + k + '" maxlength="7" spellcheck="false" autocomplete="off">' +
        '<input type="color" class="pal-native" data-native="' + k + '" aria-label="Elegir el color ' + (k === 'c1' ? 'principal' : 'de luz') + ' exacto"></div>';
    }).join('') +
    '<p class="pal-note">Arrastra los puntos de la rueda o escribe el código. Cuando lo decidan, copien el enlace y lo dejamos fijo en el sitio.</p>' +
    '<div class="pal-actions"><button type="button" class="btn btn-sm" data-reset>Restablecer</button><button type="button" class="btn btn-sm btn-main" data-copy>Copiar enlace</button></div>' +
    '<p class="pal-status" role="status"></p>';
  document.body.appendChild(pal);

  var wheel = pal.querySelector('[data-wheel]');
  var handles = { c1: pal.querySelector('[data-h="c1"]'), c2: pal.querySelector('[data-h="c2"]') };
  var status = pal.querySelector('.pal-status');

  function paint() {
    ['c1', 'c2'].forEach(function (k) {
      var hex = state[k];
      root.style.setProperty('--' + k, hex);
      var h = hexToHsl(hex)[0] * Math.PI / 180;
      var rad = wheel.offsetWidth / 2 - 14;
      handles[k].style.translate = (Math.sin(h) * rad).toFixed(1) + 'px ' + (-Math.cos(h) * rad).toFixed(1) + 'px';
      handles[k].style.background = hex;
      handles[k].classList.toggle('act', k === active);
      var hexIn = pal.querySelector('[data-hex="' + k + '"]');
      if (document.activeElement !== hexIn) hexIn.value = hex;
      pal.querySelector('[data-native="' + k + '"]').value = hex;
      pal.querySelector('[data-row="' + k + '"]').classList.toggle('act', k === active);
    });
    try { localStorage.setItem('bd-paleta', JSON.stringify(state)); } catch (e) {}
    // Avisa a la mascota que cambió la ropa (el gato se viste con --c1 y --c2)
    var clave = state.c1 + state.c2;
    if (ultimaClave && clave !== ultimaClave) document.dispatchEvent(new CustomEvent('mascota', { detail: 'paleta' }));
    ultimaClave = clave;
  }
  var ultimaClave = '';
  function set(k, hex) { if (!isHex(hex)) return; state[k] = hex.toLowerCase(); paint(); }
  function setHue(k, deg) { var hsl = hexToHsl(state[k]); set(k, hslToHex((deg + 360) % 360, Math.max(hsl[1], .35), Math.min(Math.max(hsl[2], .35), .75))); }

  // Abrir y cerrar
  function open(yes) {
    pal.classList.toggle('open', yes);
    btn.setAttribute('aria-expanded', String(yes));
    if (yes) pal.querySelector('[data-preset]').focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () { open(!pal.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pal.classList.contains('open')) { open(false); btn.focus(); } });
  document.addEventListener('pointerdown', function (e) { if (pal.classList.contains('open') && !pal.contains(e.target) && !btn.contains(e.target)) open(false); });

  // Paletas guardadas
  pal.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () { var p = PRESETS[b.dataset.preset]; state.c1 = p[1]; state.c2 = p[2]; paint(); });
  });

  // Rueda: arrastrar un punto o tocar el anillo mueve el color activo
  function hueAt(e) {
    var r = wheel.getBoundingClientRect();
    return Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
  }
  var dragging = false;
  wheel.addEventListener('pointerdown', function (e) {
    var h = e.target.closest('[data-h]');
    if (h) active = h.dataset.h;
    dragging = true;
    wheel.setPointerCapture(e.pointerId);
    setHue(active, hueAt(e));
  });
  wheel.addEventListener('pointermove', function (e) { if (dragging) setHue(active, hueAt(e)); });
  wheel.addEventListener('pointerup', function () { dragging = false; });
  wheel.addEventListener('pointercancel', function () { dragging = false; });
  Object.keys(handles).forEach(function (k) {
    handles[k].addEventListener('keydown', function (e) {
      var step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
      if (!step) return;
      e.preventDefault();
      active = k;
      setHue(k, hexToHsl(state[k])[0] + step);
    });
    handles[k].addEventListener('focus', function () { active = k; paint(); });
  });

  // Código exacto y selector nativo
  pal.querySelectorAll('[data-pick]').forEach(function (b) { b.addEventListener('click', function () { active = b.dataset.pick; paint(); }); });
  pal.querySelectorAll('[data-hex]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var v = inp.value.trim();
      if (v[0] !== '#') v = '#' + v;
      if (isHex(v)) { active = inp.dataset.hex; set(inp.dataset.hex, v); }
    });
    inp.addEventListener('blur', paint);
  });
  pal.querySelectorAll('[data-native]').forEach(function (inp) {
    inp.addEventListener('input', function () { active = inp.dataset.native; set(inp.dataset.native, inp.value); });
  });

  pal.querySelector('[data-reset]').addEventListener('click', function () { state.c1 = DEF.c1; state.c2 = DEF.c2; paint(); status.textContent = 'Paleta original restablecida.'; });
  pal.querySelector('[data-copy]').addEventListener('click', function () {
    var url = location.origin + location.pathname + '?c1=' + state.c1.slice(1) + '&c2=' + state.c2.slice(1);
    var done = function () { status.textContent = 'Enlace copiado. Pégalo en el grupo del equipo.'; };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { status.textContent = url; });
    else status.textContent = url;
  });

  if (calm) pal.classList.add('calm');
  paint();
})();
