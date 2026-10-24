// Tarjeta de fidelización con QR (sin mensualidad): el cliente guarda su tarjeta de sellos en el celular y el local suma
// sellos escaneando su QR. Lado del cliente: index.html · lado del local: local/index.html.
// CONECTADO: cada tarjeta vive en una base en la nube (_compartido/nube.js). El cliente abre su tarjeta en su celular, el local la
// encuentra por su código y suma sellos con su PIN, y el cliente ve el sello llegar en su celular. El cliente no puede sumarse sellos.
// Sin Wallet, que sí tiene mensualidad y se cotiza aparte. Ver memoria/conexion-nube.md.
(function () {
  'use strict';
  var CLAVE = 'bdfid-v2', MI = 'bdfid-mi', NEG = 'fidelizacion';
  var PROGRAMA = { negocio: 'Café Mirador', sigla: 'CM', comuna: 'Concepción', sellos: 8, premio: 'Un café de especialidad gratis', minutosEntreSellos: 1 };
  var TAZA = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/></svg>';
  var LOGO = '<span class="logo-n" style="--lc:#6b4226;--lt:36px" aria-hidden="true">' + 'CM' + '</span>';
  // Tarjeta (se usa para la del cliente y para la vista previa del alta)
  function htmlTarjeta(t, ejemplo) {
    var completa = t.sellos >= PROGRAMA.sellos;
    return '<section class="tarjeta' + (completa ? ' completa' : '') + (ejemplo ? ' ejemplo' : '') + '"' + (ejemplo ? ' aria-label="Vista previa de la tarjeta"' : '') + '><div class="t-cab"><span class="t-marca">' + LOGO + PROGRAMA.negocio + '</span><span>' + esc(t.nombre) + '</span></div>' +
      '<div class="sellos" role="img" aria-label="' + t.sellos + ' de ' + PROGRAMA.sellos + ' sellos">' + Array.from({ length: PROGRAMA.sellos }, function (_, i) { return '<i class="' + (i < t.sellos ? 'on' : '') + '" style="--i:' + i + '">' + (i < t.sellos ? TAZA : i + 1) + '</i>'; }).join('') + '</div>' +
      '<p class="t-prem">' + (completa ? '¡Completaste tu tarjeta! Muestra este QR para canjear: ' : 'Te faltan ' + (PROGRAMA.sellos - t.sellos) + ' para: ') + '<b>' + esc(PROGRAMA.premio) + '</b></p>' +
      '<div class="t-qr"><div data-qr></div><p class="codigo">' + t.codigo + '</p><p class="nota">' + (ejemplo ? 'Así se verá tu tarjeta en el celular.' : 'Muéstralo en caja para sumar tu sello.') + '</p></div></section>';
  }
  var leer = function () { try { return JSON.parse(localStorage.getItem(CLAVE)) || { tarjetas: [], eventos: [] }; } catch (e) { return { tarjetas: [], eventos: [] }; } };
  var canal = null; try { canal = new BroadcastChannel('bd-fidelizacion'); } catch (e) {}
  var oyentes = [];
  var guardar = function (d, sinNube) { try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) {} if (canal) canal.postMessage(1); oyentes.forEach(function (f) { f(); }); if (!sinNube) sincronizar(d); };
  if (canal) canal.onmessage = function () { oyentes.forEach(function (f) { f(); }); };

  // ---------- Nube: espejo de las tarjetas y sus eventos ----------
  var ultimo = { tarjetas: {}, eventos: {} }, sondeos = [];
  var pinE = function () { return window.Nube ? Nube.pin(NEG) : ''; };
  var miCodigo = function () { try { return localStorage.getItem(MI) || ''; } catch (e) { return ''; } };
  var llave = function (col, x) { return col === 'tarjetas' ? x.codigo : x.id; };
  function sincronizar(d) {
    if (!window.Nube) return;
    var pin = pinE();
    ['tarjetas', 'eventos'].forEach(function (col) {
      (d[col] || []).forEach(function (it) {
        var id = llave(col, it); if (!id) return;
        var js = Nube.canon(it); if (ultimo[col][id] === js) return;
        ultimo[col][id] = js;
        var copia = JSON.parse(JSON.stringify(it));
        Nube.cola(col + id, function () { return Nube.escribir(NEG, col, id, copia, { pin: pin, modo: 'poner' }); }).catch(function () { delete ultimo[col][id]; avisarError(); });
      });
    });
  }
  var errorAvisado = 0;
  function avisarError() { if (Date.now() - errorAvisado < 8000) return; errorAvisado = Date.now(); toast('No se pudo guardar. Revisa tu conexión.'); }
  function fusionar(col, filas) {
    var d = leer(), lista = d[col], cambio = false;
    filas.forEach(function (f) {
      var x = f.data; if (!x) return;
      var js = Nube.canon(x), i = -1; lista.forEach(function (y, j) { if (llave(col, y) === f.id) i = j; });
      if (i < 0) { lista.push(x); cambio = true; }
      else { var loc = Nube.canon(lista[i]); if (loc === js) { ultimo[col][f.id] = js; return; } if (ultimo[col][f.id] !== loc) return; lista[i] = x; cambio = true; }   // un cambio local sin enviar gana
      ultimo[col][f.id] = js;
    });
    if (cambio) { d[col] = lista; guardar(d, true); }
  }
  function conectar() {
    if (sondeos.length || !window.Nube) return;
    sondeos.push(Nube.sondear(NEG, 'tarjetas', { pin: pinE, ids: function () { var m = miCodigo(); return m ? [m] : []; }, soloSiHayIds: true, cada: 2500 }, function (r) { fusionar('tarjetas', r.filas); }));
    sondeos.push(Nube.sondear(NEG, 'eventos', { pin: pinE, soloSiHayIds: true, cada: 4000 }, function (r) { if (r.staff) fusionar('eventos', r.filas); }));
  }
  function entrarEquipo() { sondeos.forEach(function (x) { x.reiniciar(); }); }
  // Solo para las pruebas automáticas: trabaja solo en este navegador
  function desconectar() { sondeos.forEach(function (x) { x.parar(); }); sondeos = []; sincronizar = function () {}; }
  var evento = function (tipo, cod) { return { id: 'e' + (window.Nube ? Nube.idNuevo() : Date.now().toString(36)), t: Date.now(), tipo: tipo, codigo: cod }; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var codigo = function () { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint8Array(8), s = ''; crypto.getRandomValues(b); for (var i = 0; i < 8; i++) s += a[b[i] % a.length]; return s; };
  var buscar = function (d, c) { return d.tarjetas.filter(function (t) { return t.codigo === String(c || '').trim().toUpperCase().replace(/^.*[?&]tarjeta=/, ''); })[0]; };
  function sellar(c) {
    var d = leer(), t = buscar(d, c); if (!t) return { error: 'No existe una tarjeta con ese código.' };
    if (t.ultimo && Date.now() - t.ultimo < PROGRAMA.minutosEntreSellos * 6e4) return { error: 'Esta tarjeta ya recibió un sello hace un momento (protección contra sellos repetidos).' };
    if (t.sellos >= PROGRAMA.sellos) return { error: 'La tarjeta está completa: primero canjea el premio.' };
    t.sellos++; t.ultimo = Date.now(); t.visitas = (t.visitas || 0) + 1; d.eventos.push(evento('sello', t.codigo)); guardar(d); return { tarjeta: t };
  }
  function canjear(c) {
    var d = leer(), t = buscar(d, c); if (!t) return { error: 'No existe una tarjeta con ese código.' };
    if (t.sellos < PROGRAMA.sellos) return { error: 'Faltan ' + (PROGRAMA.sellos - t.sellos) + ' sellos para el premio.' };
    t.sellos = 0; t.premios = (t.premios || 0) + 1; d.eventos.push(evento('premio', t.codigo)); guardar(d); return { tarjeta: t };
  }
  function qr(el, texto) {
    el.innerHTML = '';
    if (window.QRCode) { new window.QRCode(el, { text: texto, width: 196, height: 196, colorDark: '#111827', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M }); el.title = ''; var im = el.querySelector('img'), cv = el.querySelector('canvas'); if (im) im.alt = 'Código QR de la tarjeta de sellos'; if (cv) cv.setAttribute('aria-hidden', 'true'); }
    else el.textContent = texto;
  }
  function toast(x) { var e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', 'status'); e.textContent = x; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3500); }
  var app = document.getElementById('app'), modo = document.documentElement.getAttribute('data-modo');

  // ---------- Lado del cliente ----------
  function cliente() {
    var mi = null; try { mi = localStorage.getItem(MI); } catch (e) {}
    var d = leer(), t = mi && buscar(d, mi);
    if (!t) {
      app.innerHTML = htmlTarjeta({ nombre: 'Tu nombre', codigo: 'EJEMPLO1', sellos: 3 }, true) + '<section class="caja fid-alta"><p class="fid-neg">' + esc(PROGRAMA.negocio) + '</p><h1>Tu tarjeta de sellos</h1><p class="nota">Junta ' + PROGRAMA.sellos + ' sellos y llévate: <b>' + esc(PROGRAMA.premio) + '</b>. Sin papel y sin instalar nada.</p>' +
        '<form data-alta novalidate class="campos" style="margin-top:14px"><div class="campo"><label for="f-nom">Tu nombre</label><input id="f-nom" autocomplete="given-name" maxlength="40"></div><div class="campo"><label for="f-tel">Celular (opcional)</label><input id="f-tel" type="tel" autocomplete="tel" maxlength="20" placeholder="+56 9 1234 5678"></div>' +
        '<label class="chk" style="grid-column:1/-1"><input type="checkbox" id="f-ok"><span>Acepto que el local guarde mi nombre y mis visitas solo para este programa.</span></label><p class="err" role="alert" style="grid-column:1/-1"></p><button class="btn prim" type="submit" style="grid-column:1/-1">Crear mi tarjeta</button></form></section>';
      qr(app.querySelector('[data-qr]'), location.origin + location.pathname);
      return;
    }
    var url = location.origin + location.pathname.replace(/index\.html$/, '') + 'local/?tarjeta=' + t.codigo;
    app.innerHTML = htmlTarjeta(t) +
      '<section class="caja"><h2>Guárdala en tu celular</h2><p class="nota">En el navegador, toca <b>Compartir → Agregar a inicio</b> (iPhone) o <b>⋮ → Agregar a la pantalla principal</b> (Android). Queda como una app, sin descargar nada.</p><p class="nota" style="margin-top:8px">Visitas: ' + (t.visitas || 0) + ' · premios canjeados: ' + (t.premios || 0) + '</p>' +
      '<p class="nota" style="margin-top:8px">Demostración: el <a href="local/?tarjeta=' + t.codigo + '" target="_blank" rel="noopener">lado del local</a> es otra pantalla (pide un PIN, que se muestra ahí). Ábrela en otro equipo y suma un sello: tu tarjeta cambia sola. No escribas datos reales.</p></section>';
    qr(app.querySelector('[data-qr]'), url);
  }
  if (modo === 'cliente') {
    app.addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, nom = f.querySelector('#f-nom').value.trim();
      if (nom.length < 2) { f.querySelector('.err').textContent = 'Escribe tu nombre.'; return; }
      if (!f.querySelector('#f-ok').checked) { f.querySelector('.err').textContent = 'Debes aceptar para crear la tarjeta.'; return; }
      var d = leer(), t = { codigo: codigo(), nombre: nom.slice(0, 40), telefono: f.querySelector('#f-tel').value.replace(/[^\d+]/g, '').slice(0, 20), sellos: 0, creada: Date.now(), visitas: 0, premios: 0 };
      d.tarjetas.push(t); d.eventos.push(evento('alta', t.codigo)); guardar(d);
      try { localStorage.setItem(MI, t.codigo); } catch (x) {}
      cliente();
    });
    var antes = -1;
    oyentes.push(function () { var mi = null; try { mi = localStorage.getItem(MI); } catch (e) {} var t = mi && buscar(leer(), mi); if (t && antes > -1 && t.sellos !== antes) toast(t.sellos ? '¡Sumaste un sello! Llevas ' + t.sellos + ' de ' + PROGRAMA.sellos + '.' : '¡Premio canjeado! Tu tarjeta parte de nuevo.'); antes = t ? t.sellos : -1; cliente(); });
    cliente(); var t0 = buscar(leer(), (function () { try { return localStorage.getItem(MI); } catch (e) { return ''; } })()); antes = t0 ? t0.sellos : -1;
  }

  // ---------- Lado del local ----------
  function local() {
    var d = leer(), hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var ev = function (tipo, desde) { return d.eventos.filter(function (e) { return e.tipo === tipo && e.t >= desde; }).length; };
    var vuelven = d.tarjetas.filter(function (t) { return (t.visitas || 0) >= 2; }).length;
    app.querySelector('[data-kpi]').innerHTML = [['Tarjetas', d.tarjetas.length, 'clientes en el programa'], ['Sellos hoy', ev('sello', hoy.getTime()), ev('sello', hoy.getTime() - 6 * 864e5) + ' en 7 días'], ['Premios canjeados', ev('premio', 0), 'desde el inicio'], ['Clientes que vuelven', d.tarjetas.length ? Math.round(vuelven / d.tarjetas.length * 100) + ' %' : '—', 'con 2 visitas o más']].map(function (k) { return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>'; }).join('');
    app.querySelector('[data-lista]').innerHTML = d.tarjetas.length ? d.tarjetas.slice().sort(function (a, b) { return (b.ultimo || b.creada) - (a.ultimo || a.creada); }).slice(0, 30).map(function (t) { return '<tr><td><b>' + t.codigo + '</b></td><td>' + esc(t.nombre) + '</td><td>' + t.sellos + ' / ' + PROGRAMA.sellos + '</td><td>' + (t.visitas || 0) + '</td><td><button class="btn chico" type="button" data-usar="' + t.codigo + '">Elegir</button></td></tr>'; }).join('') : '<tr><td colspan="5" class="nota">Aún no hay tarjetas. Crea una en el lado del cliente.</td></tr>';
  }
  function actual(c) {
    var t = buscar(leer(), c), box = app.querySelector('[data-actual]');
    if (!c) { box.innerHTML = '<p class="nota">Escanea o escribe el código de una tarjeta.</p>'; return; }
    if (!t) { box.innerHTML = '<p class="err">No encontramos la tarjeta ' + esc(c) + '. Revisa el código.</p>'; return; }
    box.innerHTML = '<p style="font-size:20px;font-weight:700">' + esc(t.nombre) + ' · ' + t.sellos + ' de ' + PROGRAMA.sellos + ' sellos</p><div class="acciones-r" style="justify-content:flex-start"><button class="btn prim" type="button" data-sellar="' + t.codigo + '"' + (t.sellos >= PROGRAMA.sellos ? ' disabled' : '') + '>Sumar un sello</button><button class="btn" type="button" data-canjear="' + t.codigo + '"' + (t.sellos < PROGRAMA.sellos ? ' disabled' : '') + '>Canjear premio</button></div>';
  }
  if (modo === 'local') Nube.acceso({ negocio: NEG, titulo: 'Caja · ' + PROGRAMA.negocio, aceptan: ['caja', 'dueno'], pistas: [{ rol: 'Caja', pin: '764193' }, { rol: 'Dueño', pin: '482916' }] }).then(function () {
    entrarEquipo();
    var sel = new URLSearchParams(location.search).get('tarjeta') || '';
    app.innerHTML = '<h1 style="font-size:26px">Caja · ' + esc(PROGRAMA.negocio) + '</h1><p class="nota" style="margin-bottom:14px">Escanea el QR de la tarjeta del cliente y suma su sello. Premio a los ' + PROGRAMA.sellos + ' sellos: ' + esc(PROGRAMA.premio) + '.</p>' +
      '<div class="grid2" style="margin-top:0"><section class="caja"><h2>Tarjeta</h2><div class="form-l"><div class="campo"><label for="l-cod">Código</label><input id="l-cod" maxlength="80" autocapitalize="characters" value="' + esc(sel) + '"></div><button class="btn chico" type="button" data-ir>Buscar</button><button class="btn chico" type="button" data-cam>Escanear con la cámara</button></div><video data-video playsinline muted hidden style="width:100%;max-height:260px;border-radius:12px;margin-top:10px;background:#000"></video><div data-actual style="margin-top:12px"></div></section>' +
      '<section class="caja"><h2>Cómo va el programa</h2><div class="kpis" data-kpi></div></section></div>' +
      '<section class="caja" style="margin-top:14px"><h2>Clientes</h2><div class="scroll"><table class="tabla"><thead><tr><th>Código</th><th>Nombre</th><th>Sellos</th><th>Visitas</th><th></th></tr></thead><tbody data-lista></tbody></table></div></section>' +
      '<p class="nota" style="margin-top:12px">Costo del programa: $0 al mes (página y base de datos en planes gratis; verificar límites). La versión que se guarda en Google Wallet o Apple Wallet tiene mensualidad y se cotiza aparte.</p>';
    var cam = null;
    var codActual = function () { return app.querySelector('#l-cod').value.trim().toUpperCase().replace(/^.*[?&]TARJETA=/, ''); };
    app.addEventListener('click', function (e) {
      var x;
      if (e.target.closest('[data-ir]')) actual(codActual());
      if ((x = e.target.closest('[data-usar]'))) { app.querySelector('#l-cod').value = x.dataset.usar; actual(x.dataset.usar); }
      if ((x = e.target.closest('[data-sellar]'))) { var r = sellar(x.dataset.sellar); toast(r.error || 'Sello sumado: ' + r.tarjeta.sellos + ' de ' + PROGRAMA.sellos + '.'); actual(x.dataset.sellar); }
      if ((x = e.target.closest('[data-canjear]'))) { var r2 = canjear(x.dataset.canjear); toast(r2.error || 'Premio canjeado. La tarjeta parte de nuevo.'); actual(x.dataset.canjear); }
      if (e.target.closest('[data-cam]')) {
        var v = app.querySelector('[data-video]');
        if (!('BarcodeDetector' in window) || !navigator.mediaDevices) { toast('Este navegador no lee QR con la cámara: escribe el código (o usa Chrome en Android).'); return; }
        if (cam) { cam.getTracks().forEach(function (tr) { tr.stop(); }); cam = null; v.hidden = true; return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) {
          cam = s; v.srcObject = s; v.hidden = false; v.play();
          var det = new window.BarcodeDetector({ formats: ['qr_code'] });
          (function mirar() { if (!cam) return; det.detect(v).then(function (c) { if (c[0]) { var txt = c[0].rawValue; app.querySelector('#l-cod').value = txt; cam.getTracks().forEach(function (tr) { tr.stop(); }); cam = null; v.hidden = true; actual(codActual()); } else requestAnimationFrame(mirar); }).catch(function () { requestAnimationFrame(mirar); }); })();
        }).catch(function () { toast('No se pudo abrir la cámara. Revisa el permiso o escribe el código.'); });
      }
    });
    oyentes.push(function () { local(); actual(codActual()); });
    var salir = document.createElement('button'); salir.type = 'button'; salir.className = 'btn chico'; salir.textContent = 'Salir'; salir.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:50'; salir.addEventListener('click', function () { Nube.salir(NEG); }); document.body.appendChild(salir);
    local(); actual(sel ? codActual() : '');
  });
  conectar();
  window.Fidelizacion = { desconectar: desconectar, PROGRAMA: PROGRAMA, leer: leer, sellar: sellar, canjear: canjear };
})();
