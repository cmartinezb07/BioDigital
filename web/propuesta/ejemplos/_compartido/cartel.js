// Cartel con código QR (para imprimir en A4 o descargar como imagen para Instagram o WhatsApp): lleva a la reserva, la carta o la tarjeta de un local.
// Todo se arma en el navegador con los datos de la dirección (url, titulo, sub, color); no se guarda nada en ningún lado.
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), main = document.getElementById('cartel');
  var url = q.get('url') || '', color = /^#[0-9a-f]{6}$/i.test(q.get('color') || '') ? q.get('color') : '#2f6f4e';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  if (!/^https?:\/\/[^\s"<>]{3,400}$/.test(url)) { main.innerHTML = '<p class="err">Falta la dirección a la que lleva el código (cartel.html?url=https://…).</p>'; document.querySelector('.barra').hidden = true; return; }
  document.documentElement.style.setProperty('--c', color);
  var tit = document.getElementById('c-tit'), sub = document.getElementById('c-sub');
  tit.value = (q.get('titulo') || 'Reserva aquí').slice(0, 40); sub.value = (q.get('sub') || '').slice(0, 60);
  function pintar() {
    main.innerHTML = '<section class="hoja"><div><h1>' + esc(tit.value) + '</h1>' + (sub.value ? '<p class="sub">' + esc(sub.value) + '</p>' : '') + '</div><div class="qr" data-qr role="img" aria-label="Código QR que lleva a ' + esc(url) + '"></div><div class="pie"><b>Escanea con la cámara de tu celular</b><small>' + esc(url) + '</small></div></section>';
    if (window.QRCode) new window.QRCode(main.querySelector('[data-qr]'), { text: url, width: 660, height: 660, colorDark: '#111827', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    else main.querySelector('[data-qr]').innerHTML = '<p>No se pudo cargar el generador de QR. Revisa tu conexión y recarga.</p>';
    document.title = tit.value + (sub.value ? ' · ' + sub.value : '');
  }
  tit.addEventListener('input', pintar); sub.addEventListener('input', pintar);
  document.getElementById('c-imp').addEventListener('click', function () { window.print(); });
  // Imagen cuadrada de 1080 px (la medida de Instagram) con el mismo contenido
  document.getElementById('c-png').addEventListener('click', function () {
    var qr = main.querySelector('[data-qr] canvas'); if (!qr) return;
    var c = document.createElement('canvas'), x = c.getContext('2d'), W = 1080; c.width = W; c.height = W;
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, W); x.fillStyle = color; x.fillRect(0, 0, W, 26);
    x.textAlign = 'center'; x.fillStyle = '#111827'; x.font = '800 68px Inter, system-ui, sans-serif'; x.fillText(tit.value, W / 2, 140);
    if (sub.value) { x.fillStyle = '#374151'; x.font = '500 40px Inter, system-ui, sans-serif'; x.fillText(sub.value, W / 2, 205); }
    x.imageSmoothingEnabled = false; x.drawImage(qr, (W - 600) / 2, 250, 600, 600);
    x.fillStyle = color; x.font = '700 40px Inter, system-ui, sans-serif'; x.fillText('Escanea con la cámara de tu celular', W / 2, 940);
    x.fillStyle = '#6b7280'; x.font = '400 26px Inter, system-ui, sans-serif'; x.fillText(url.length > 60 ? url.slice(0, 57) + '…' : url, W / 2, 1000);
    var a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'cartel-qr.png'; a.click();
  });
  pintar();
})();
