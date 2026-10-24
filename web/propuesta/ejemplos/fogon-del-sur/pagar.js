// Pago del pedido: siguiente paso después de enviar el pedido cuando el cliente elige pagar en línea.
// En esta demostración el pago es de prueba (no se cobra nada); en un local real aquí se abre Mercado Pago.
// Si prefiere pagar en caja o al recibir, el pedido sigue igual y pasa directo a su seguimiento.
(function () {
  'use strict';
  var P = window.Pedidos, app = document.getElementById('app'), esc = P.esc, clp = P.clp;
  var id = new URLSearchParams(location.search).get('id') || '';
  P.seguir(id);
  P.esperar().then(iniciar, function () { app.innerHTML = '<div class="vacio-s"><p>No pudimos conectarnos. Revisa tu internet y recarga la página.</p></div>'; });

  function seguimiento() { location.href = '../pedido/?id=' + encodeURIComponent(id); }
  function iniciar() {
    var p = P.obtener(id);
    if (!p) { app.innerHTML = '<div class="vacio-s"><p>No encontramos ese pedido.</p><p style="margin-top:12px"><a class="btn-s prim" href="../">Volver a la carta</a></p></div>'; return; }
    if (p.pago.pagado || p.pago.metodo !== 'linea') { seguimiento(); return; }
    document.title = 'Pagar el pedido #' + p.codigo + ' · ' + P.CONFIG.negocio;
    app.innerHTML = '<div style="max-width:520px;margin:0 auto;display:grid;gap:16px">' +
      '<section class="caja"><p class="cod" style="margin:0;color:var(--fg-3)">Pedido #' + esc(p.codigo) + ' · ' + esc(P.tipoTxt(p)) + '</p><h1 class="sis-h" style="margin:4px 0 10px">Paga tu pedido</h1>' +
      p.items.map(function (i) { return '<div class="fila"><span>' + i.cant + ' × ' + esc(i.nombre) + '</span><span>' + clp(i.precio * i.cant) + '</span></div>'; }).join('') +
      (p.envio ? '<div class="fila"><span>Envío a ' + esc(p.cliente.comuna) + '</span><span>' + clp(p.envio) + '</span></div>' : '') +
      '<div class="fila tot"><span>Total</span><span>' + clp(p.total) + '</span></div></section>' +
      '<section class="caja"><h2 style="font-size:18px">Pago en línea</h2><p class="sis-nota">Es un pago de prueba: no se cobra nada y no se pide ninguna tarjeta. En un local real, este botón abre Mercado Pago.</p>' +
      '<p class="err" role="alert"></p><div style="display:grid;gap:10px;margin-top:12px"><button class="btn-s prim" type="button" data-pagar>Pagar ' + clp(p.total) + ' (prueba)</button>' +
      '<button class="btn-s" type="button" data-despues>' + (p.tipo === 'delivery' ? 'Prefiero pagar al recibir' : 'Prefiero pagar en caja') + '</button></div></section>' +
      '<p class="sis-nota" style="text-align:center">Tu pedido ya llegó a la cocina. Pagar ahora solo ahorra la espera al final.</p></div>';
    app.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pagar], [data-despues]'); if (!b) return;
      var err = app.querySelector('.err'); app.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
      if (b.hasAttribute('data-pagar')) P.marcarPagado(id, true, 'linea'); else P.actualizar(id, function (z) { z.pago = Object.assign({}, z.pago, { metodo: 'caja' }); });
      P.guardado().then(seguimiento, function () { err.textContent = 'No se pudo guardar. Intenta de nuevo.'; });
    });
  }
})();
