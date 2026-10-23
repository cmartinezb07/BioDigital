// Juego mientras espera el pedido: atrapar ingredientes con el plato y esquivar el fuego. Canvas, sin librerías.
// Se controla con el dedo, el mouse o las flechas; guarda el récord en el navegador.
(function () {
  'use strict';
  window.JuegoEspera = function (el) {
    el.innerHTML = '<div class="juego"><div class="juego-hud"><span>Puntos: <b data-pts>0</b></span><span data-vidas aria-label="Vidas">❤❤❤</span><span>Récord: <b data-rec>0</b></span></div>' +
      '<canvas aria-label="Juego: atrapa los ingredientes" role="img"></canvas><div class="juego-tapa"><p style="font-size:18px;font-weight:600" data-msj>¿Una partida mientras esperas?</p><button class="btn-s prim" type="button" data-jugar>Jugar</button></div></div>';
    var cv = el.querySelector('canvas'), cx = cv.getContext('2d'), tapa = el.querySelector('.juego-tapa');
    var BUENOS = ['🍅', '🧀', '🥩', '🌽', '🧅', '🥑', '🍋', '🫑'], MALO = '🔥';
    var W = 0, H = 0, dpr = 1, plato = { x: 0, w: 90 }, cosas = [], pts = 0, vidas = 3, vel = 1, jugando = false, ultimo = 0, proximo = 0, raf = 0;
    var rec = 0; try { rec = +localStorage.getItem('fogon-juego-record') || 0; } catch (e) {}
    el.querySelector('[data-rec]').textContent = rec;
    function medir() { dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); if (!plato.x) plato.x = W / 2; }
    medir(); window.addEventListener('resize', medir);
    function mover(x) { var r = cv.getBoundingClientRect(); plato.x = Math.max(plato.w / 2, Math.min(W - plato.w / 2, x - r.left)); }
    cv.addEventListener('pointermove', function (e) { mover(e.clientX); });
    cv.addEventListener('pointerdown', function (e) { mover(e.clientX); });
    var teclas = {};
    window.addEventListener('keydown', function (e) { if (jugando && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { teclas[e.key] = true; e.preventDefault(); } });
    window.addEventListener('keyup', function (e) { teclas[e.key] = false; });
    function hud() { el.querySelector('[data-pts]').textContent = pts; el.querySelector('[data-vidas]').textContent = '❤'.repeat(vidas) + '♡'.repeat(3 - vidas); }
    function empezar() { medir(); cosas = []; pts = 0; vidas = 3; vel = 1; jugando = true; tapa.hidden = true; ultimo = performance.now(); proximo = 0; hud(); cancelAnimationFrame(raf); raf = requestAnimationFrame(cuadro); }
    function terminar() {
      jugando = false;
      if (pts > rec) { rec = pts; try { localStorage.setItem('fogon-juego-record', rec); } catch (e) {} el.querySelector('[data-rec]').textContent = rec; }
      el.querySelector('[data-msj]').textContent = pts + ' puntos' + (pts && pts === rec ? ' · ¡nuevo récord!' : '') + '. ¿Otra?';
      el.querySelector('[data-jugar]').textContent = 'Jugar de nuevo'; tapa.hidden = false;
    }
    el.querySelector('[data-jugar]').addEventListener('click', empezar);
    function cuadro(t) {
      if (!jugando) return;
      var dt = Math.min(50, t - ultimo) / 16.7; ultimo = t;
      if (teclas.ArrowLeft) plato.x = Math.max(plato.w / 2, plato.x - 9 * dt);
      if (teclas.ArrowRight) plato.x = Math.min(W - plato.w / 2, plato.x + 9 * dt);
      proximo -= dt;
      if (proximo <= 0) { var malo = Math.random() < Math.min(.35, .12 + pts / 200); cosas.push({ x: 20 + Math.random() * (W - 40), y: -20, v: (2 + Math.random() * 1.5) * vel, e: malo ? MALO : BUENOS[Math.floor(Math.random() * BUENOS.length)], malo: malo }); proximo = Math.max(14, 42 - pts / 2); }
      cx.clearRect(0, 0, W, H);
      cx.font = '28px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      var py = H - 26;
      for (var i = cosas.length - 1; i >= 0; i--) {
        var c = cosas[i]; c.y += c.v * dt; cx.fillText(c.e, c.x, c.y);
        if (c.y > py - 16 && c.y < py + 10 && Math.abs(c.x - plato.x) < plato.w / 2 + 6) {
          cosas.splice(i, 1);
          if (c.malo) { vidas--; if (navigator.vibrate && navigator.userActivation && navigator.userActivation.isActive) navigator.vibrate(80); } else { pts++; vel = 1 + pts / 40; }
          hud(); if (!vidas) return terminar();
        } else if (c.y > H + 20) cosas.splice(i, 1);
      }
      var g = cx.createLinearGradient(0, py - 8, 0, py + 10); g.addColorStop(0, '#f4e8d7'); g.addColorStop(1, '#cf9b4a');
      cx.fillStyle = g; cx.beginPath(); cx.ellipse(plato.x, py, plato.w / 2, 11, 0, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = 'rgba(26,17,12,.35)'; cx.beginPath(); cx.ellipse(plato.x, py - 2, plato.w / 2 - 14, 5, 0, 0, Math.PI * 2); cx.fill();
      raf = requestAnimationFrame(cuadro);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden && jugando) { jugando = false; el.querySelector('[data-msj]').textContent = 'Pausado'; el.querySelector('[data-jugar]').textContent = 'Jugar de nuevo'; tapa.hidden = false; } });
  };
})();
