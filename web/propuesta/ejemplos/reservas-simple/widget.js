// Widget para insertar la agenda de reservas en otra página web (la del cliente, Wix, WordPress, Jimdo…), sin programar:
//   <div data-bd-reservas data-negocio="cabanas"></div>
//   <script src="https://SITIO/ejemplos/reservas/widget.js" async></script>
// Opcional: data-idioma="en", data-alto="900" (alto inicial en píxeles). La agenda se carga en un marco que crece solo con su contenido,
// así que no aparecen dos barras de desplazamiento. Lo que se reserva es lo mismo que en el sitio de reservas (mismas reglas en el servidor).
(function () {
  'use strict';
  var yo = document.currentScript || [].slice.call(document.querySelectorAll('script[src*="widget.js"]')).pop();
  var base = yo ? yo.src.replace(/widget\.js(\?.*)?$/, '') : '';
  function montar(cont) {
    if (cont.dataset.bdListo) return; cont.dataset.bdListo = '1';
    var q = new URLSearchParams({ widget: '1' });
    if (cont.dataset.negocio) q.set('negocio', cont.dataset.negocio);
    if (cont.dataset.idioma) q.set('idioma', cont.dataset.idioma);
    var f = document.createElement('iframe');
    f.src = base + 'index.html?' + q.toString(); f.title = 'Reserva por WhatsApp'; f.loading = 'lazy'; f.allow = 'clipboard-write';
    f.style.cssText = 'width:100%;border:0;display:block;min-height:' + (+cont.dataset.alto || 900) + 'px;color-scheme:normal';
    cont.appendChild(f);
    window.addEventListener('message', function (e) {
      if (e.source !== f.contentWindow || !e.data || e.data.bdres !== 'alto') return;
      f.style.minHeight = 0; f.style.height = Math.max(400, Math.min(6000, +e.data.alto || 0)) + 'px';
    });
  }
  function todos() { [].forEach.call(document.querySelectorAll('[data-bd-reservas]'), montar); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', todos); else todos();
})();
