// Seguimiento del pedido: estado con su color y animación, tiempo estimado, pasos, mapa con el repartidor (GPS), avisos,
// juego mientras espera y opinión al final. Se actualiza solo cuando la cocina o el repartidor cambian algo.
(function () {
  'use strict';
  var P = window.Pedidos, $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = P.esc, clp = P.clp, raiz = $('#seguimiento');
  var id = new URLSearchParams(location.search).get('id') || '';
  var ICONOS = {
    recibido: '<path d="M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21Z"/><path d="M10 8h4M10 12h4"/>',
    preparacion: '<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-4 3.4-5.6 3.9-9.5 2.6 1.6 4 3.9 4 6.3 1-.6 1.7-1.7 1.9-3.1 1.9 1.7 3.2 3.9 3.2 6.3 0 3.4-2.5 6-6.5 6Z"/>',
    listo: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16.5 9.5"/>',
    camino: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17h5l3-6h3l1 6M9 8h4l1 3"/>',
    entregado: '<path d="M5 8h14l-1 12H6Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    cancelado: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'
  };
  var svg = function (e) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONOS[e] + '</svg>'; };
  var p = P.obtener(id), ultimoEstado = p && p.estado, mapa = null, capas = {}, simParar = null, juegoListo = false;

  // pedido/?demo: crea un pedido de delivery de demostración y lo sigue (lo usa el carrusel de la portada)
  if (!p && new URLSearchParams(location.search).has('demo')) {
    var nuevo = P.crear({ tipo: 'delivery', cliente: { nombre: 'Cliente de demostración', telefono: '', direccion: 'Lincoyán 300', comuna: 'Concepción' }, items: [{ id: 'lomo', nombre: 'Lomo a la parrilla con papas y arroz', precio: 13900, cant: 1 }, { id: 'empanadas', nombre: 'Empanadas de horno', precio: 5900, cant: 1 }, { id: 'limonada', nombre: 'Limonada menta jengibre', precio: 3500, cant: 2 }], pago: { metodo: 'linea', pagado: true }, demo: true });
    location.replace('./?id=' + nuevo.id); return;
  }
  if (!p) { raiz.innerHTML = '<div class="vacio-s"><p>No encontramos ese pedido en este equipo.</p><p style="margin-top:12px"><a class="btn-s prim" href="../">Volver a la carta</a></p></div>'; return; }
  document.title = 'Pedido #' + p.codigo + ' · Fogón del Sur';

  var mapaHtml = p.tipo === 'delivery' ? '<section class="caja" aria-labelledby="h-mapa"><h2 id="h-mapa" style="font-size:18px;margin-bottom:10px">Dónde va tu pedido</h2><div class="mapa" id="mapa" role="img" aria-label="Mapa con el local, tu dirección y el repartidor"></div><p class="mapa-nota" data-rep>El mapa se activa cuando el repartidor sale con tu pedido.</p></section>' : '';
  raiz.innerHTML = '<div class="seg">' +
    '<div style="display:grid;gap:18px">' +
      '<section class="caja estado-hero" aria-labelledby="h-est"><p class="cod">Pedido #' + esc(p.codigo) + ' · ' + esc(P.tipoTxt(p)) + '</p><h1 id="h-est"></h1><p class="desc"></p><div class="icono-est" aria-hidden="true"></div>' +
        '<div class="eta"><b data-min></b><span data-eta></span></div><div class="barra-prog" aria-hidden="true"><i></i></div><ol class="pasos" aria-label="Avance del pedido"></ol>' +
        '<p class="sis-nota" data-demo-nota style="margin-top:10px"></p><p style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn-s" type="button" data-avisos>Avisarme en este celular</button><a class="btn-s" href="../">Pedir algo más</a></p></section>' +
      '<section class="caja" data-opinion hidden></section>' +
      '<section class="caja detalle-ped" aria-labelledby="h-det"><h2 id="h-det" style="font-size:18px;margin-bottom:6px">Detalle</h2>' +
        p.items.map(function (i) { return '<div class="fila"><span>' + i.cant + ' × ' + esc(i.nombre) + '</span><span>' + clp(i.precio * i.cant) + '</span></div>'; }).join('') +
        (p.envio ? '<div class="fila"><span>Envío a ' + esc(p.cliente.comuna) + '</span><span>' + clp(p.envio) + '</span></div>' : '') +
        '<div class="fila tot"><span>Total</span><span>' + clp(p.total) + '</span></div><div class="fila"><span>Pago</span><span data-pago></span></div>' +
        (p.nota ? '<p class="sis-nota">Nota: ' + esc(p.nota) + '</p>' : '') + '</section>' +
    '</div>' +
    '<div style="display:grid;gap:18px;align-content:start">' + mapaHtml +
      '<section class="caja" aria-labelledby="h-juego" data-juego-caja><h2 id="h-juego" style="font-size:18px">Mientras esperas: atrapa los ingredientes</h2><p class="sis-nota">Mueve el plato con el dedo, el mouse o las flechas. Evita el fuego.</p><div id="juego"></div></section>' +
    '</div></div>';

  if (window.JuegoEspera) { window.JuegoEspera($('#juego')); juegoListo = true; }

  function pintar() {
    p = P.obtener(id); if (!p) return;
    var e = p.estado, col = P.ESTADOS[e].color, hero = $('.estado-hero');
    hero.style.setProperty('--est', col);
    $('#h-est').textContent = P.nombreEstado(p); $('.desc', hero).textContent = P.descEstado(p);
    var ic = $('.icono-est'); if (ic.dataset.e !== e) { ic.className = 'icono-est ' + e; ic.dataset.e = e; ic.innerHTML = svg(e); }
    var flujo = P.FLUJO[p.tipo], idx = flujo.indexOf(e);
    $('.barra-prog i').style.setProperty('--p', (e === 'cancelado' ? 100 : Math.max(8, idx / (flujo.length - 1) * 100)) + '%');
    $('.pasos').innerHTML = flujo.map(function (x, k) {
      var t = P.cuando(p, x), cls = e === 'cancelado' ? '' : k < idx || e === 'entregado' ? 'hecho' : k === idx ? 'actual' : '';
      return '<li class="' + cls + '" style="--ec:' + P.ESTADOS[x].color + '"' + (k === idx ? ' aria-current="step"' : '') + '><span class="punto"></span><span>' + esc(P.nombreEstado(p, x)) + '</span><time>' + (t ? P.hora(t) : '') + '</time></li>';
    }).join('');
    $('[data-pago]').textContent = p.pago.pagado ? 'Pagado' + (p.pago.metodo === 'linea' ? ' en línea' : '') : p.tipo === 'delivery' ? 'Al recibir' : 'En caja';
    $('[data-demo-nota]').textContent = p.escala > 1 ? 'Demostración acelerada: como nadie atiende la cocina de prueba, el pedido avanza solo y cada minuto dura ' + Math.round(60 / p.escala) + ' segundos.' : '';
    reloj();
    if (p.tipo === 'delivery') pintarMapa();
    if (e === 'entregado') opinion();
    if ((e === 'entregado' || e === 'cancelado') && simParar) { simParar(); simParar = null; }
  }
  function reloj() {
    var e = p.estado, et = P.eta(p), m = $('[data-min]'), t = $('[data-eta]');
    if (e === 'entregado') { m.textContent = '✓'; t.textContent = P.nombreEstado(p) + ' a las ' + P.hora(P.cuando(p, 'entregado')); return; }
    if (e === 'cancelado') { m.textContent = ''; t.textContent = ''; return; }
    m.textContent = et.minutos + ' min';
    var real = function (ms) { return P.hora(Date.now() + (ms - Date.now()) * (p.escala || 1)); };   // en la demo acelerada, la hora mostrada es la real equivalente
    t.textContent = p.tipo === 'delivery' ? 'llega cerca de las ' + real(et.llega) : e === 'listo' ? 'listo desde las ' + P.hora(P.cuando(p, 'listo')) : 'listo cerca de las ' + real(et.listo);
  }

  // Mapa (Leaflet + OpenStreetMap), cargado solo en pedidos con delivery
  var cargaMapa = null;
  function leaflet() {
    if (cargaMapa) return cargaMapa;
    cargaMapa = new Promise(function (ok, mal) {
      var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      css.integrity = 'sha384-c6Rcwz4e4CITMbu/NBmnNS8yN2sC3cUElMEMfP3vqqKFp7GOYaaBBCqmaWBjmkjb'; css.crossOrigin = 'anonymous'; document.head.appendChild(css);
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      s.integrity = 'sha384-NElt3Op+9NBMCYaef5HxeJmU4Xeard/Lku8ek6hoPTvYkQPh3zLIrJP7KiRocsxO'; s.crossOrigin = 'anonymous';
      s.onload = function () { ok(window.L); }; s.onerror = mal; document.head.appendChild(s);
    });
    return cargaMapa;
  }
  var PIN = { local: '<path d="M12 21c-3.5 0-5.5-2.3-5.5-5.2 0-3.4 3-4.8 3.4-8.3 2.2 1.4 3.4 3.4 3.4 5.4.9-.5 1.5-1.4 1.6-2.6 1.6 1.4 2.6 3.3 2.6 5.5 0 2.9-2 5.2-5.5 5.2Z"/>', casa: '<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>', moto: '<circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16h5l3-6h3l1 6M9 7h4l1 3"/>' };
  function pin(n, color) { return window.L.divIcon({ className: '', html: '<div class="pin" style="background:' + color + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PIN[n] + '</svg></div>', iconSize: [34, 34], iconAnchor: [17, 17] }); }
  function pintarMapa() {
    leaflet().then(function (L) {
      if (!mapa) {
        mapa = L.map('mapa', { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapa);
        capas.local = L.marker([P.CONFIG.local.lat, P.CONFIG.local.lng], { icon: pin('local', '#cf9b4a'), title: 'Fogón del Sur' }).addTo(mapa);
        capas.casa = L.marker([p.destino.lat, p.destino.lng], { icon: pin('casa', '#3b82f6'), title: 'Tu dirección' }).addTo(mapa);
        mapa.fitBounds(L.latLngBounds([[P.CONFIG.local.lat, P.CONFIG.local.lng], [p.destino.lat, p.destino.lng]]).pad(.3));
      }
      if (p.ruta && !capas.ruta) capas.ruta = L.polyline(p.ruta, { color: '#a855f7', weight: 5, opacity: .75 }).addTo(mapa);
      var r = p.repartidor;
      if (r && r.lat) {
        if (!capas.moto) capas.moto = L.marker([r.lat, r.lng], { icon: pin('moto', '#a855f7'), title: 'Repartidor', zIndexOffset: 500 }).addTo(mapa);
        else capas.moto.setLatLng([r.lat, r.lng]);
        var km = P.distancia(r, p.destino);
        $('[data-rep]').textContent = (r.nombre || 'El repartidor') + (p.estado === 'entregado' ? ' entregó tu pedido.' : ' está a ' + (km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1) + ' km') + ' de tu dirección · ubicación actualizada a las ' + P.hora(r.t));
      }
    }).catch(function () { $('[data-rep]').textContent = 'No se pudo cargar el mapa. El estado del pedido se sigue actualizando arriba.'; });
  }

  // Opinión al final y enlace para invitar a un amigo
  function opinion() {
    var s = $('[data-opinion]'); s.hidden = false;
    var cj = $('[data-juego-caja]'); if (cj) cj.hidden = true;
    if (p.opinion) {
      var ref = location.origin + location.pathname.replace(/pedido\/?$/, '') + '?ref=' + p.codigo + p.id.slice(0, 4);
      s.innerHTML = '<h2 style="font-size:18px">¡Gracias por tu opinión!</h2><p class="sis-sub">Si te gustó, invita a un amigo con tu enlace. El local ve en su panel cuántos llegan por recomendación.</p><p style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn-s prim" type="button" data-invitar>Invitar a un amigo</button><a class="btn-s" href="../">Volver a la carta</a></p>';
      $('[data-invitar]', s).addEventListener('click', function () {
        var d = { title: 'Fogón del Sur', text: 'Te recomiendo Fogón del Sur', url: ref };
        if (navigator.share) navigator.share(d).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(ref).then(function () { toast('Enlace copiado'); });
      });
      return;
    }
    if (s.dataset.listo) return; s.dataset.listo = '1';
    s.innerHTML = '<form data-op novalidate style="display:grid;gap:12px"><h2 style="font-size:18px">¿Qué tal estuvo?</h2><div class="estrellas" role="group" aria-label="Tu nota">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-e="' + n + '" aria-pressed="false" aria-label="' + n + ' de 5">★</button>'; }).join('') + '</div>' +
      '<div class="campo"><span class="lbl">¿Nos recomendarías?</span><div class="opciones" style="grid-template-columns:1fr 1fr"><label><input type="radio" name="rec" value="si">Sí</label><label><input type="radio" name="rec" value="no">No</label></div></div>' +
      '<div class="campo"><label for="op-txt">Comentario (opcional)</label><textarea id="op-txt" rows="3" maxlength="300"></textarea></div><p class="err" role="alert"></p><button class="btn-s prim" type="submit">Enviar opinión</button></form>';
    var nota = 0;
    s.addEventListener('click', function (e) { var b = e.target.closest('[data-e]'); if (!b) return; nota = +b.dataset.e; [].forEach.call(s.querySelectorAll('[data-e]'), function (x) { x.setAttribute('aria-pressed', String(+x.dataset.e <= nota)); }); });
    s.addEventListener('submit', function (e) {
      e.preventDefault(); if (!nota) { $('.err', s).textContent = 'Elige de 1 a 5 estrellas.'; return; }
      var rec = s.querySelector('input[name="rec"]:checked');
      P.opinar(id, { estrellas: nota, recomendaria: rec ? rec.value === 'si' : null, texto: $('#op-txt').value.trim().slice(0, 300) });
    });
  }

  // Avisos cuando cambia el estado: aviso en pantalla, vibración, sonido y notificación del sistema si la aceptó
  var audio = null;
  function sonar() { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); var o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.12, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .5); o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + .5); } catch (e) {} }
  function toast(t) { var d = document.createElement('div'); d.className = 'toast-s'; d.setAttribute('role', 'status'); d.textContent = t; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 4000); }
  function avisarCambio() {
    var txt = 'Pedido #' + p.codigo + ': ' + P.nombreEstado(p);
    toast(txt); sonar();
    if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate([60, 40, 60]);
    if (window.Notification && Notification.permission === 'granted' && document.hidden) { try { new Notification('Fogón del Sur', { body: txt + '. ' + P.descEstado(p), tag: p.id }); } catch (e) {} }
    document.title = '(' + P.nombreEstado(p) + ') Pedido #' + p.codigo;
  }
  var bAv = $('[data-avisos]');
  if (!window.Notification) bAv.hidden = true;
  else if (Notification.permission === 'granted') bAv.textContent = 'Avisos activados ✓';
  bAv.addEventListener('click', function () { if (window.Notification) Notification.requestPermission().then(function (r) { bAv.textContent = r === 'granted' ? 'Avisos activados ✓' : 'Avisos bloqueados en este navegador'; }); });

  // Simulación de la demo: si nadie atiende la cocina o el reparto en otra pestaña, el pedido avanza solo (acelerado)
  function simular() {
    p = P.obtener(id); if (!p || !p.demo) return;
    var edad = Date.now() - P.cuando(p, p.estado), e = p.estado;
    if (e === 'entregado' || e === 'cancelado') return;
    if ((e === 'recibido' || e === 'preparacion' || (e === 'listo' && p.tipo !== 'delivery')) && P.atendido('cocina')) return;
    if ((e === 'listo' && p.tipo === 'delivery' || e === 'camino') && P.atendido('repartidor')) return;
    if (e === 'recibido' && edad > 10000) { P.actualizar(id, function (x) { x.escala = 20; }); P.cambiar(id, 'preparacion'); }
    else if (e === 'preparacion' && p.escala > 1 && Date.now() >= P.eta(p).listo) P.cambiar(id, 'listo');
    else if (e === 'preparacion' && p.escala === 1 && edad > 15000) P.actualizar(id, function (x) { x.escala = 20; });
    else if (e === 'listo' && p.tipo !== 'delivery' && edad > 15000) P.cambiar(id, 'entregado');
    else if (e === 'listo' && p.tipo === 'delivery' && edad > 6000) { P.actualizar(id, function (x) { x.escala = Math.max(x.escala, 20); }); P.cambiar(id, 'camino', { repartidor: { nombre: 'Repartidor de prueba' } }); }
    else if (e === 'camino' && !simParar && (!p.repartidor || !p.repartidor.t || Date.now() - p.repartidor.t > 8000)) {
      var x2 = function (i) { return P.obtener(i).escala; }, arrancar = function (r) { P.actualizar(id, function (x) { x.escala = Math.max(x.escala || 1, 20); }); simParar = P.recorrer(id, r, x2(id)); };
      if (p.ruta) arrancar(p.ruta); else P.ruta(P.CONFIG.local, p.destino).then(function (r) { P.actualizar(id, function (x) { x.ruta = r; }); arrancar(r); });
    }
  }
  if (p.tipo === 'delivery' && !p.ruta) P.ruta(P.CONFIG.local, p.destino).then(function (r) { P.actualizar(id, function (x) { if (!x.ruta) x.ruta = r; }); });

  P.escuchar(function (m) {
    if (m.id && m.id !== id && m.tipo !== 'cambio') return;
    var antes = ultimoEstado; pintar(); if (p && p.estado !== antes) { ultimoEstado = p.estado; avisarCambio(); }
  });
  setInterval(function () { if (p) reloj(); simular(); }, 1000);
  pintar();
})();
