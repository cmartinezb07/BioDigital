// Carta: pedir desde la mesa (QR con ?mesa=N), para retirar o con delivery. Agrega botones a cada plato, carrito y formulario.
// El pedido se crea con pedidos.js y el cliente pasa a la página de seguimiento (pedido/?id=...).
(function () {
  'use strict';
  var P = window.Pedidos; if (!P) return;
  var cfg = JSON.parse(document.getElementById('menu-datos').textContent);
  var lista = []; cfg.categorias.forEach(function (c) { c.platos.forEach(function (p) { lista.push(p); }); });
  var porId = {}; lista.forEach(function (p) { porId[p.id] = p; });
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = P.esc, clp = P.clp;
  var q = new URLSearchParams(location.search);
  function ses(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function loc(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  P.visita();
  if (q.get('mesa')) ses('fogon-mesa', String(Math.max(1, Math.min(P.CONFIG.mesas, parseInt(q.get('mesa'), 10) || 1))));
  if (q.get('ref')) ses('fogon-ref', q.get('ref').replace(/[^a-z0-9]/gi, '').slice(0, 12));
  var estado = { modo: ses('fogon-modo') || (ses('fogon-mesa') ? 'mesa' : 'retiro'), carro: {} };
  try { estado.carro = JSON.parse(ses('fogon-carro')) || {}; } catch (e) {}
  function guardar() { ses('fogon-carro', JSON.stringify(estado.carro)); ses('fogon-modo', estado.modo); }

  // Modo de pedido, bajo los datos del local
  var MODOS = { mesa: 'En la mesa', retiro: 'Para retirar', delivery: 'Delivery' };
  var modoEl = document.createElement('div');
  modoEl.className = 'modo-caja';
  modoEl.innerHTML = '<div class="modo" role="group" aria-label="Cómo quieres pedir">' + Object.keys(MODOS).map(function (k) { return '<button type="button" data-modo="' + k + '">' + MODOS[k] + '</button>'; }).join('') + '</div><p class="modo-nota" aria-live="polite"></p>';
  var acciones = $('.portada .acciones'); if (acciones) acciones.after(modoEl);
  function pintarModo() {
    $$('[data-modo]', modoEl).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.modo === estado.modo)); });
    var mesa = ses('fogon-mesa');
    $('.modo-nota', modoEl).textContent = estado.modo === 'mesa' ? (mesa ? 'Pides desde la mesa ' + mesa + ': te lo llevamos.' : 'Escanea el QR de tu mesa o elige el número al pedir.')
      : estado.modo === 'retiro' ? 'Pide ahora y retíralo en el local sin hacer fila.' : 'Delivery en el Gran Concepción · pedido mínimo ' + clp(P.CONFIG.minimoDelivery) + '.';
  }
  modoEl.addEventListener('click', function (e) { var b = e.target.closest('[data-modo]'); if (!b) return; estado.modo = b.dataset.modo; guardar(); pintarModo(); pintarCarro(); });

  // Botón de agregar en cada plato (los artículos siguen el orden de la carta)
  var articulos = $$('main .cat .plato');
  articulos.forEach(function (art, i) {
    var p = lista[i]; if (!p || $('h3', art).textContent.trim() !== p.nombre) return;
    art.dataset.id = p.id;
    if (art.classList.contains('agotado')) return;
    var cont = document.createElement('div'); cont.className = 'pedir-ctl'; $('.txt', art).appendChild(cont);
  });
  function pintarPlato(id) {
    var art = $('.plato[data-id="' + id + '"]'), cont = art && $('.pedir-ctl', art); if (!cont) return;
    var n = estado.carro[id] || 0, p = porId[id];
    cont.innerHTML = n ? '<div class="cant-ctl" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-menos="' + id + '" aria-label="Quitar uno">−</button><span>' + n + '</span><button type="button" data-mas="' + id + '" aria-label="Agregar uno">+</button></div>'
      : '<button class="agregar" type="button" data-mas="' + id + '">Agregar · ' + clp(p.precio) + '</button>';
  }
  document.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mas]'), r = e.target.closest('[data-menos]');
    if (!m && !r) return;
    var id = (m || r).dataset[m ? 'mas' : 'menos'];
    estado.carro[id] = Math.max(0, Math.min(20, (estado.carro[id] || 0) + (m ? 1 : -1)));
    if (!estado.carro[id]) delete estado.carro[id];
    guardar(); pintarPlato(id); pintarCarro(true);
  });

  // Botón flotante y carrito
  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'carrito-btn'; btn.hidden = true;
  document.body.appendChild(btn);
  var dlg = document.createElement('dialog'); dlg.className = 'carrito sis'; dlg.setAttribute('aria-label', 'Tu pedido');
  document.body.appendChild(dlg);
  btn.addEventListener('click', function () { pintarCarro(); dlg.showModal(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  function items() { return Object.keys(estado.carro).filter(function (id) { return porId[id]; }).map(function (id) { var p = porId[id]; return { id: id, nombre: p.nombre, precio: p.precio, cant: estado.carro[id] }; }); }
  function pintarCarro(salto) {
    var its = items(), n = its.reduce(function (t, i) { return t + i.cant; }, 0), sub = its.reduce(function (t, i) { return t + i.precio * i.cant; }, 0);
    btn.hidden = !n;
    btn.innerHTML = '<b>' + n + '</b>Ver mi pedido · ' + clp(sub);
    if (salto) { btn.classList.remove('salta'); void btn.offsetWidth; btn.classList.add('salta'); }
    var com = $('#c-comuna', dlg), envio = estado.modo === 'delivery' && com && com.value ? P.CONFIG.comunas[com.value].envio : 0;
    var mesaAct = ses('fogon-mesa') || '';
    var valores = {}; $$('input, select, textarea', dlg).forEach(function (el) { if (el.type === 'radio') { if (el.checked) valores.pago = el.value; } else if (el.id) valores[el.id] = el.value; });
    dlg.innerHTML = '<form class="carrito-in" novalidate>' +
      '<div class="carrito-cab"><h2>Tu pedido</h2><button class="btn-s" type="button" data-cerrar aria-label="Cerrar">×</button></div>' +
      '<div class="carrito-cuerpo">' +
        (its.length ? its.map(function (i) { return '<div class="linea-c"><span class="n">' + esc(i.nombre) + '</span><span class="p">' + clp(i.precio * i.cant) + '</span><div class="cant-ctl"><button type="button" data-menos="' + i.id + '" aria-label="Quitar uno">−</button><span>' + i.cant + '</span><button type="button" data-mas="' + i.id + '" aria-label="Agregar uno">+</button></div></div>'; }).join('') : '<p class="vacio-s">Tu pedido está vacío. Agrega platos desde la carta.</p>') +
        '<div class="campo"><span class="lbl">¿Cómo lo quieres?</span><div class="modo" role="group" aria-label="Cómo quieres pedir">' + Object.keys(MODOS).map(function (k) { return '<button type="button" data-modo="' + k + '" aria-pressed="' + (k === estado.modo) + '">' + MODOS[k] + '</button>'; }).join('') + '</div></div>' +
        (estado.modo === 'mesa' ? '<div class="campo"><label for="c-mesa">Número de mesa</label><select id="c-mesa" required>' + Array.from({ length: P.CONFIG.mesas }, function (_, k) { return '<option' + (String(k + 1) === mesaAct ? ' selected' : '') + '>' + (k + 1) + '</option>'; }).join('') + '</select></div>' : '') +
        '<div class="dos"><div class="campo"><label for="c-nombre">Tu nombre</label><input id="c-nombre" autocomplete="given-name" maxlength="40" required></div>' +
        (estado.modo !== 'mesa' ? '<div class="campo"><label for="c-fono">Celular</label><input id="c-fono" type="tel" inputmode="tel" autocomplete="tel" placeholder="9 1234 5678" maxlength="15" required></div>' : '') + '</div>' +
        (estado.modo === 'delivery' ? '<div class="campo"><label for="c-dir">Dirección</label><input id="c-dir" autocomplete="street-address" maxlength="80" required placeholder="Calle, número, depto."></div>' +
          '<div class="dos"><div class="campo"><label for="c-comuna">Comuna</label><select id="c-comuna" required><option value="">Elige tu comuna</option>' + Object.keys(P.CONFIG.comunas).map(function (c) { return '<option value="' + c + '">' + c + ' · envío ' + clp(P.CONFIG.comunas[c].envio) + '</option>'; }).join('') + '</select></div>' +
          '<div class="campo"><span class="lbl">Ubicación exacta (opcional)</span><button class="btn-s" type="button" data-gps>Usar mi ubicación</button></div></div>' : '') +
        '<div class="campo"><label for="c-nota">Nota para la cocina (opcional)</label><input id="c-nota" maxlength="120" placeholder="Sin cebolla, término medio…"></div>' +
        '<div class="campo"><span class="lbl">Pago</span><div class="opciones">' +
          '<label><input type="radio" name="pago" id="c-pago-linea" value="linea" checked><span>Pagar ahora en línea<small>Tarjeta con Mercado Pago. En esta demo el pago se aprueba solo.</small></span></label>' +
          '<label><input type="radio" name="pago" id="c-pago-caja" value="caja"><span>' + (estado.modo === 'delivery' ? 'Pagar al recibir' : 'Pagar en caja') + '<small>Efectivo o tarjeta.</small></span></label></div></div>' +
        '<div class="campo"><label for="c-ref">¿Cómo nos conociste?</label><select id="c-ref"><option value="">Prefiero no decir</option><option>Instagram</option><option>TikTok</option><option>Google Maps</option><option>Me lo recomendaron</option><option>Pasaba por fuera</option><option>Otro</option></select></div>' +
        '<p class="err" role="alert" aria-live="assertive"></p>' +
      '</div>' +
      '<div class="carrito-pie"><div class="resumen"><div><span>Subtotal</span><span>' + clp(sub) + '</span></div>' + (estado.modo === 'delivery' ? '<div><span>Envío</span><span data-envio>' + (envio ? clp(envio) : 'según comuna') + '</span></div>' : '') +
        '<div class="tot"><span>Total</span><span data-total>' + clp(sub + envio) + '</span></div></div>' +
        '<button class="btn-s prim" type="submit"' + (its.length ? '' : ' disabled') + '>Enviar pedido</button><p class="sis-nota">Demostración: el pedido llega a la cocina de esta demo, no a un local real.</p></div>' +
    '</form>';
    Object.keys(valores).forEach(function (id) { var el = id !== 'pago' && $('#' + id, dlg); if (el && valores[id] != null) el.value = valores[id]; });
    if (valores.pago) { var r = $('input[name="pago"][value="' + valores.pago + '"]', dlg); if (r) r.checked = true; }
    if (estado.gps) { var g = $('[data-gps]', dlg); if (g) g.textContent = 'Ubicación lista ✓'; }
    $$('.plato[data-id]').forEach(function (a) { pintarPlato(a.dataset.id); });
  }
  dlg.addEventListener('change', function (e) {
    if (e.target.id !== 'c-comuna') return;
    var sub = items().reduce(function (t, i) { return t + i.precio * i.cant; }, 0), env = e.target.value ? P.CONFIG.comunas[e.target.value].envio : 0;
    $('[data-envio]', dlg).textContent = env ? clp(env) : 'según comuna'; $('[data-total]', dlg).textContent = clp(sub + env);
  });
  dlg.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar]')) dlg.close();
    var mb = e.target.closest('[data-modo]');
    if (mb) { estado.modo = mb.dataset.modo; guardar(); pintarModo(); pintarCarro(); return; }
    var g = e.target.closest('[data-gps]');
    if (g && navigator.geolocation) {
      g.textContent = 'Buscando…';
      navigator.geolocation.getCurrentPosition(function (pos) { estado.gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }; g.textContent = 'Ubicación lista ✓'; },
        function () { g.textContent = 'No se pudo: usaremos la comuna'; }, { enableHighAccuracy: true, timeout: 8000 });
    }
  });
  dlg.addEventListener('submit', function (e) {
    e.preventDefault();
    var its = items(), err = $('.err', dlg), v = function (id) { var el = $('#' + id, dlg); return el ? el.value.trim() : ''; };
    var nombre = v('c-nombre'), fono = v('c-fono').replace(/[^\d]/g, '').replace(/^56/, '');
    var falta = !its.length ? 'Agrega al menos un plato.' : !nombre ? 'Escribe tu nombre.' : estado.modo !== 'mesa' && !/^9\d{8}$/.test(fono) ? 'Escribe un celular válido: 9 y 8 dígitos.' :
      estado.modo === 'delivery' && !v('c-dir') ? 'Escribe la dirección.' : estado.modo === 'delivery' && !v('c-comuna') ? 'Elige tu comuna.' : '';
    var sub = its.reduce(function (t, i) { return t + i.precio * i.cant; }, 0);
    if (!falta && estado.modo === 'delivery' && sub < P.CONFIG.minimoDelivery) falta = 'El pedido mínimo para delivery es ' + clp(P.CONFIG.minimoDelivery) + '.';
    if (falta) { err.textContent = falta; return; }
    var pago = ($('input[name="pago"]:checked', dlg) || {}).value || 'caja';
    var cli = { nombre: nombre.slice(0, 40), telefono: fono ? '+56' + fono : '', direccion: v('c-dir').slice(0, 80), comuna: v('c-comuna') };
    if (estado.gps) { cli.lat = estado.gps.lat; cli.lng = estado.gps.lng; }
    var mesa = estado.modo === 'mesa' ? parseInt(v('c-mesa'), 10) : null;
    if (mesa) ses('fogon-mesa', String(mesa));
    var p = P.crear({ tipo: estado.modo, mesa: mesa, cliente: cli, items: its, nota: v('c-nota').slice(0, 120), pago: { metodo: pago, pagado: pago === 'linea' }, referencia: v('c-ref'), invitadoPor: ses('fogon-ref') || '', demo: true });
    loc('fogon-mi-pedido', p.id);
    estado.carro = {}; guardar();
    location.href = 'pedido/?id=' + p.id;
  });

  // Acceso a "Mi pedido" mientras haya uno en curso
  function miPedido() {
    var id = loc('fogon-mi-pedido'), p = id && P.obtener(id), a = $('.mi-pedido');
    if (!p || p.estado === 'entregado' || p.estado === 'cancelado') { if (a) a.remove(); return; }
    if (!a) { a = document.createElement('a'); a.className = 'mi-pedido'; document.body.appendChild(a); }
    a.href = 'pedido/?id=' + p.id; a.style.setProperty('--est', P.ESTADOS[p.estado].color);
    a.innerHTML = '<i aria-hidden="true"></i>Mi pedido #' + p.codigo + ': ' + esc(P.nombreEstado(p));
  }
  P.escuchar(miPedido);

  // Enlaces de la demostración: las otras pantallas del sistema
  var pie = $('footer .wrap');
  if (pie) {
    var d = document.createElement('div'); d.className = 'demo-sis';
    d.innerHTML = '<p class="peq" style="width:100%">Demostración del sistema completo: abre cada pantalla en otra pestaña y haz un pedido.</p><a class="chip" href="cocina/">Pantalla de cocina</a><a class="chip" href="repartidor/">App del repartidor</a><a class="chip" href="panel/">Panel del dueño</a><a class="chip" href="?mesa=4">Probar el QR de la mesa 4</a>';
    pie.insertBefore(d, pie.children[2] || null);
  }
  pintarModo(); pintarCarro(); miPedido();
})();
