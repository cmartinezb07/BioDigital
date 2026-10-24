// Carta: pedir desde la mesa (QR con ?mesa=N), para retirar o con delivery. Agrega los botones a cada plato, las opciones y extras,
// el carrito y el formulario. Cuando el cliente ya tiene un pedido "Nuevo" (sin aceptar), todo lo que agrega se suma a ESE pedido:
// el carrito pasa a ser "Modificar mi pedido" y al guardar se actualiza el mismo pedido (mismo número), nunca se crea otro.
// Si un dato obligatorio falta, el campo se marca en rojo, se sacude, dice qué falta y la pantalla lo muestra, sin borrar nada.
(function () {
  'use strict';
  var P = window.Pedidos, C = window.Carta; if (!P || !C) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = P.esc, clp = P.clp;
  var q = new URLSearchParams(location.search);
  function ses(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function loc(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }

  P.visita();
  if (q.get('mesa')) ses('fogon-mesa', String(Math.max(1, Math.min(P.CONFIG.mesas, parseInt(q.get('mesa'), 10) || 1))));
  if (q.get('ref')) ses('fogon-ref', q.get('ref').replace(/[^a-z0-9]/gi, '').slice(0, 12));
  var estado = { modo: ses('fogon-modo') || (ses('fogon-mesa') ? 'mesa' : 'retiro'), carro: {}, gps: null, edicion: null, sucio: false, bloqueado: false, enviando: false, tocados: {} };
  try { estado.carro = JSON.parse(ses('fogon-carro-2')) || {}; } catch (e) {}
  function guardar() { ses(estado.edicion ? 'fogon-borrador-' + estado.edicion.id : 'fogon-carro-2', JSON.stringify(estado.carro)); ses('fogon-modo', estado.modo); }

  // ---------- Líneas del carrito (con su precio actual o el fijado en el pedido original) ----------
  function lineas() {
    return Object.keys(estado.carro).map(function (k) {
      var l = estado.carro[k], p = C.plato(l.id), r = { lid: k, id: l.id, opc: l.opc || [], cant: l.cant, nota: l.nota || '', prep: l.prep || (p && p.prep) || 0, ok: true, motivo: '' };
      if (l.precioFijo != null) { r.precio = l.precioFijo; r.nombre = l.nombreFijo; r.opciones = l.opciones || []; r.fijo = true; return r; }   // línea del pedido original: conserva su precio
      if (!p || p.activo === false) { r.ok = false; r.nombre = (p && p.nombre) || l.id; r.precio = 0; r.opciones = []; r.motivo = 'ya no está en la carta'; return r; }
      if (p.disponible === false) { r.ok = false; r.nombre = p.nombre; r.precio = 0; r.opciones = []; r.motivo = 'se agotó'; return r; }
      var x = C.linea(p, r.opc); r.precio = x.precio; r.opciones = x.opciones; r.nombre = p.nombre;
      if (x.faltan.length) { r.ok = false; r.motivo = 'faltan opciones'; }
      return r;
    });
  }
  function totales() {
    var its = lineas(), sub = its.reduce(function (t, i) { return t + (i.ok ? i.precio * i.cant : 0); }, 0), com = estado.modo === 'delivery' && $('#c-comuna', dlg) && $('#c-comuna', dlg).value;
    var envio = com && P.CONFIG.comunas[com] ? P.CONFIG.comunas[com].envio : 0;
    return { its: its, n: its.reduce(function (t, i) { return t + i.cant; }, 0), sub: sub, envio: envio };
  }
  function cantDe(id) { return Object.keys(estado.carro).reduce(function (t, k) { return t + (estado.carro[k].id === id ? estado.carro[k].cant : 0); }, 0); }

  // ---------- Modo de pedido (mesa, retiro, delivery) bajo los datos del local ----------
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

  // ---------- Botones en cada plato ----------
  var aviso = document.createElement('aside'); aviso.className = 'aviso-pend'; aviso.hidden = true;
  var contMain = $('#contenido'); if (contMain) contMain.insertBefore(aviso, contMain.firstChild);
  function pintarControles() {
    $$('.plato[data-id]').forEach(function (art) {
      if (art.classList.contains('agotado')) return;
      var id = art.dataset.id, p = C.plato(id); if (!p) return;
      var cont = $('.pedir-ctl', art); if (!cont) { cont = document.createElement('div'); cont.className = 'pedir-ctl'; $('.txt', art).appendChild(cont); }
      var n = cantDe(id), conOpc = (p.grupos || []).length > 0, desde = (conOpc && p.grupos.some(function (g) { return g.obligatorio; })) ? 'desde ' : '';
      if (conOpc) cont.innerHTML = '<button class="agregar' + (n ? ' tiene' : '') + '" type="button" data-elegir="' + esc(id) + '">' + (n ? n + ' en tu pedido · Agregar otro' : 'Elegir opciones · ' + desde + clp(p.precio)) + '</button>';
      else cont.innerHTML = n ? '<div class="cant-ctl" role="group" aria-label="Cantidad de ' + esc(p.nombre) + '"><button type="button" data-menos="' + esc(id) + '" aria-label="Quitar uno">−</button><span>' + n + '</span><button type="button" data-mas="' + esc(id) + '" aria-label="Agregar uno">+</button></div>'
        : '<button class="agregar" type="button" data-mas="' + esc(id) + '">Agregar · ' + clp(p.precio) + '</button>';
    });
  }
  document.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mas]'), r = e.target.closest('[data-menos]'), el = e.target.closest('[data-elegir]');
    if (el) { abrirOpciones(el.dataset.elegir); return; }
    if (!m && !r) return;
    var id = (m || r).dataset[m ? 'mas' : 'menos'], k = C.lid(id, []);
    if (m) agregar(id, [], 1, ''); else cambiarCant(k, -1);
  });
  function agregar(id, opc, cant, nota, extra) {
    var k = C.lid(id, opc), l = estado.carro[k];
    if (l) { l.cant = Math.min(30, l.cant + cant); if (nota) l.nota = nota; }
    else estado.carro[k] = { id: id, opc: opc, cant: Math.min(30, cant), nota: nota || '' };
    cambioCarro();
  }
  function cambiarCant(k, d) {
    var l = estado.carro[k]; if (!l) return;
    l.cant = Math.max(0, Math.min(30, l.cant + d)); if (!l.cant) delete estado.carro[k];
    cambioCarro();
  }
  function cambioCarro() {
    guardar(); pintarControles(); pintarCarro(true);
    if (estado.edicion && !estado.bloqueado) { estado.sucio = true; marcarModificando(); }
  }

  // ---------- Opciones y extras de un plato ----------
  var dop = document.createElement('dialog'); dop.className = 'carrito sis opciones-dlg'; dop.setAttribute('aria-label', 'Elige las opciones');
  document.body.appendChild(dop);
  dop.addEventListener('click', function (e) { if (e.target === dop || e.target.closest('[data-cerrar-op]')) dop.close(); });
  var opActual = null;
  // Sin 'lineaK' agrega un plato nuevo; con la clave de una línea del carrito, edita esa línea (opciones, cantidad y nota)
  function abrirOpciones(id, lineaK) {
    var p = C.plato(id); if (!p) return;
    var lin = lineaK ? estado.carro[lineaK] : null;
    opActual = { id: id, cant: lin ? lin.cant : 1, editar: lin ? lineaK : null };
    dop.innerHTML = '<form class="carrito-in" novalidate><div class="carrito-cab"><h2>' + (lin ? 'Editar · ' : '') + esc(p.nombre) + '</h2><button class="btn-s" type="button" data-cerrar-op aria-label="Cerrar">×</button></div><div class="carrito-cuerpo">' +
      (p.descripcion ? '<p class="sis-nota">' + esc(p.descripcion) + '</p>' : '') +
      (p.grupos || []).map(function (g) {
        return '<fieldset class="grupo-op" data-grupo="' + esc(g.id) + '"><legend>' + esc(g.nombre) + ' <small>' + (g.obligatorio ? '· obligatorio' : '· opcional') + (g.tipo === 'varios' ? ' · hasta ' + (g.max || g.opciones.length) : '') + '</small></legend>' +
          g.opciones.map(function (o) { return '<label class="op-fila"><input type="' + (g.tipo === 'varios' ? 'checkbox' : 'radio') + '" name="g-' + esc(g.id) + '" value="' + esc(g.id + ':' + o.id) + '"><span>' + esc(o.nombre) + '</span>' + (o.extra ? '<b>+' + clp(o.extra) + '</b>' : '') + '</label>'; }).join('') +
          '<small class="campo-err" role="alert"></small></fieldset>';
      }).join('') +
      '<div class="campo"><label for="op-nota">Nota para la cocina (opcional)</label><input id="op-nota" maxlength="120" placeholder="Sin cebolla, bien cocido…"></div>' +
      '<div class="campo"><span class="lbl">Cantidad</span><div class="cant-ctl" role="group" aria-label="Cantidad"><button type="button" data-op-menos aria-label="Quitar uno">−</button><span data-op-cant>1</span><button type="button" data-op-mas aria-label="Agregar uno">+</button></div></div>' +
      '</div><div class="carrito-pie"><p class="err" role="alert"></p><button class="btn-s prim" type="submit" data-op-total></button></div></form>';
    if (lin) {
      $$('input', dop).forEach(function (i) { i.checked = (lin.opc || []).indexOf(i.value) > -1; });
      $$('[data-grupo]', dop).forEach(function (g) { var gr = p2(g); if (gr) topeVarios(g, gr); });
      $('#op-nota', dop).value = lin.nota || '';
    }
    dop.showModal(); precioOp();
  }
  function opcSel() { return $$('input:checked', dop).map(function (i) { return i.value; }); }
  function precioOp() {
    var p = C.plato(opActual.id), x = C.linea(p, opcSel());
    $('[data-op-total]', dop).textContent = (opActual.editar ? 'Guardar cambios · ' : 'Agregar al pedido · ') + clp(x.precio * opActual.cant);
    $('[data-op-cant]', dop).textContent = opActual.cant;
  }
  dop.addEventListener('change', function (e) {
    var g = e.target.closest('[data-grupo]'); precioOp();
    if (g && g.classList.contains('mal')) { var p = C.plato(opActual.id), gr = p.grupos.filter(function (x) { return x.id === g.dataset.grupo; })[0]; if (!errorGrupo(gr, opcSel())) limpiarMal(g); }
    var gMax = g && p2(g); if (gMax) topeVarios(g, gMax);
  });
  function p2(g) { var p = C.plato(opActual.id); return p.grupos.filter(function (x) { return x.id === g.dataset.grupo && x.tipo === 'varios'; })[0]; }
  function topeVarios(g, gr) { var n = $$('input:checked', g).length, mx = gr.max || gr.opciones.length; $$('input:not(:checked)', g).forEach(function (i) { i.disabled = n >= mx; }); }
  dop.addEventListener('click', function (e) {
    if (e.target.closest('[data-op-mas]')) { opActual.cant = Math.min(30, opActual.cant + 1); precioOp(); }
    if (e.target.closest('[data-op-menos]')) { opActual.cant = Math.max(1, opActual.cant - 1); precioOp(); }
  });
  function errorGrupo(g, sel) {
    var n = (g.opciones || []).filter(function (o) { return sel.indexOf(g.id + ':' + o.id) > -1; }).length;
    return g.obligatorio && n < 1 ? 'Elige una opción de "' + g.nombre + '".' : '';
  }
  dop.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = C.plato(opActual.id), sel = opcSel(), primero = null, msg = '';
    (p.grupos || []).forEach(function (g) {
      var er = errorGrupo(g, sel), el = $('[data-grupo="' + g.id + '"]', dop);
      if (er) { marcar(el, $('.campo-err', el), er); if (!primero) { primero = el; msg = er; } } else limpiarMal(el);
    });
    if (primero) { $('.err', dop).textContent = msg; primero.scrollIntoView({ block: 'center', behavior: 'smooth' }); var i = $('input', primero); if (i) i.focus({ preventScroll: true }); return; }
    if (opActual.editar) delete estado.carro[opActual.editar];   // la línea editada se reemplaza (si queda igual a otra, se suman)
    agregar(opActual.id, sel, opActual.cant, $('#op-nota', dop).value.trim().slice(0, 120));
    dop.close();
  });

  // ---------- Botón flotante y carrito ----------
  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'carrito-btn'; btn.hidden = true;
  document.body.appendChild(btn);
  var dlg = document.createElement('dialog'); dlg.className = 'carrito sis'; dlg.setAttribute('aria-label', 'Tu pedido');
  document.body.appendChild(dlg);
  btn.addEventListener('click', function () { pintarCarro(); dlg.showModal(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  function pintarCarro(salto) {
    var t = totales(), ed = estado.edicion;
    btn.hidden = !t.n && !ed;
    btn.innerHTML = '<b>' + t.n + '</b>' + (ed ? 'Modificar mi pedido #' + esc(ed.codigo) : 'Ver mi pedido') + ' · ' + clp(t.sub);
    if (salto) { btn.classList.remove('salta'); void btn.offsetWidth; btn.classList.add('salta'); }
    var mesaAct = ses('fogon-mesa') || '', origen = ed ? P.obtener(ed.id) : null;
    var valores = {}; $$('input, select, textarea', dlg).forEach(function (el) { if (el.type === 'radio') { if (el.checked) valores.pago = el.value; } else if (el.id) valores[el.id] = el.value; });
    var cli = origen ? origen.cliente : {};
    dlg.innerHTML = '<form class="carrito-in" novalidate>' +
      '<div class="carrito-cab"><h2>' + (ed ? 'Modificar pedido #' + esc(ed.codigo) : 'Tu pedido') + '</h2><button class="btn-s" type="button" data-cerrar aria-label="Cerrar">×</button></div>' +
      '<div class="carrito-cuerpo">' +
        (estado.bloqueado ? '<div class="banda mal" role="alert"><b>El local ya aceptó tu pedido.</b> Ya no se puede modificar. <a href="pedido/?id=' + esc(ed.id) + '">Ver mi pedido</a> · <button class="btn-s" type="button" data-nuevo-con>Hacer un pedido nuevo con estos productos</button></div>'
          : ed ? '<div class="banda"><b>Estás modificando tu pedido #' + esc(ed.codigo) + '.</b> Lo que cambies se guarda en ese mismo pedido (no se crea otro). Solo se puede mientras el local no lo acepte.</div>' : '') +
        '<div data-lineas>' +
        (t.its.length ? t.its.map(function (i) {
          return '<div class="linea-c' + (i.ok ? '' : ' mal') + '" data-lid="' + esc(i.lid) + '"><span class="n">' + esc(i.nombre) + ((i.opciones || []).length ? '<br><small class="sis-nota">' + i.opciones.map(function (o) { return esc(o.opcion); }).join(' · ') + '</small>' : '') + (i.ok ? '' : '<br><small class="campo-err">' + esc(i.nombre) + ' ' + esc(i.motivo === 'faltan opciones' ? 'necesita que elijas sus opciones' : i.motivo) + '. Quítalo para continuar.</small>') + '</span><span class="p">' + (i.ok ? clp(i.precio * i.cant) : '—') + '</span>' +
            '<div class="cant-ctl"><button type="button" data-menos-l="' + esc(i.lid) + '" aria-label="Quitar uno">−</button><span>' + i.cant + '</span><button type="button" data-mas-l="' + esc(i.lid) + '" aria-label="Agregar uno">+</button></div>' + (i.fijo && !C.plato(i.id) ? '' : '<button class="btn-s editar-l" type="button" data-editar-l="' + esc(i.lid) + '" aria-label="Editar ' + esc(i.nombre) + '">Editar</button>') +
            '<input class="nota-l" data-nota-l="' + esc(i.lid) + '" maxlength="120" placeholder="Nota (opcional)" value="' + esc(i.nota) + '" aria-label="Nota para ' + esc(i.nombre) + '"></div>';
        }).join('') : '<p class="vacio-s">Tu pedido está vacío. Agrega platos de la carta.</p>') + '<small class="campo-err" data-err-lineas role="alert"></small></div>' +
        '<div class="campo"><span class="lbl">¿Cómo lo quieres?</span><div class="modo" role="group" aria-label="Cómo quieres pedir">' + Object.keys(MODOS).map(function (k) { return '<button type="button" data-modo="' + k + '" aria-pressed="' + (k === estado.modo) + '">' + MODOS[k] + '</button>'; }).join('') + '</div></div>' +
        (estado.modo === 'mesa' ? '<div class="campo"><label for="c-mesa">Número de mesa</label><select id="c-mesa" required>' + Array.from({ length: P.CONFIG.mesas }, function (_, k) { return '<option' + (String(k + 1) === (origen && origen.mesa ? String(origen.mesa) : mesaAct) ? ' selected' : '') + '>' + (k + 1) + '</option>'; }).join('') + '</select><small class="campo-err" role="alert"></small></div>' : '') +
        '<div class="dos"><div class="campo"><label for="c-nombre">Tu nombre</label><input id="c-nombre" autocomplete="given-name" maxlength="40" value="' + esc(cli.nombre || '') + '" required><small class="campo-err" role="alert"></small></div>' +
        (estado.modo !== 'mesa' ? '<div class="campo"><label for="c-fono">Celular</label><input id="c-fono" type="tel" inputmode="tel" autocomplete="tel" placeholder="9 1234 5678" maxlength="15" value="' + esc((cli.telefono || '').replace(/^\+56/, '')) + '" required><small class="campo-err" role="alert"></small></div>' : '') + '</div>' +
        (estado.modo === 'delivery' ? '<div class="campo"><label for="c-dir">Dirección</label><input id="c-dir" autocomplete="street-address" maxlength="80" required placeholder="Calle, número, depto." value="' + esc(cli.direccion || '') + '"><small class="campo-err" role="alert"></small></div>' +
          '<div class="dos"><div class="campo"><label for="c-comuna">Comuna</label><select id="c-comuna" required><option value="">Elige tu comuna</option>' + Object.keys(P.CONFIG.comunas).map(function (c) { return '<option value="' + esc(c) + '"' + (cli.comuna === c ? ' selected' : '') + '>' + esc(c) + ' · envío ' + clp(P.CONFIG.comunas[c].envio) + '</option>'; }).join('') + '</select><small class="campo-err" role="alert"></small></div>' +
          '<div class="campo"><span class="lbl">Ubicación exacta (opcional)</span><button class="btn-s" type="button" data-gps>Usar mi ubicación</button></div></div>' : '') +
        '<div class="campo"><label for="c-nota">Nota para la cocina (opcional)</label><input id="c-nota" maxlength="200" placeholder="Sin cebolla, término medio…" value="' + esc(origen ? origen.nota : '') + '"></div>' +
        (ed ? '<p class="sis-nota">Pago: ' + esc(origen && origen.pago.metodo === 'linea' ? 'en línea' : (estado.modo === 'delivery' ? 'al recibir' : 'en caja')) + (origen && origen.pago.pagado ? ' (pagado)' : '') + '. No cambia al modificar.</p>' :
          '<div class="campo"><span class="lbl">Pago</span><div class="opciones">' +
            '<label><input type="radio" name="pago" id="c-pago-linea" value="linea" checked><span>Pagar ahora en línea<small>Tarjeta con Mercado Pago. Aquí es un pago de prueba: no se cobra nada.</small></span></label>' +
            '<label><input type="radio" name="pago" id="c-pago-caja" value="caja"><span>' + (estado.modo === 'delivery' ? 'Pagar al recibir' : 'Pagar en caja') + '<small>Efectivo o tarjeta.</small></span></label></div></div>' +
          '<div class="campo"><label for="c-ref">¿Cómo nos conociste?</label><select id="c-ref"><option value="">Prefiero no decir</option><option>Instagram</option><option>TikTok</option><option>Google Maps</option><option>Me lo recomendaron</option><option>Pasaba por fuera</option><option>Otro</option></select></div>') +
        '<p class="sis-nota">Demostración: tu pedido llega de verdad a la cocina de esta demo, pero ' + esc(P.CONFIG.negocio) + ' es un local de ejemplo: no se prepara ni se cobra nada. No escribas datos personales reales.</p>' +
      '</div>' +
      '<div class="carrito-pie"><div class="resumen"><div><span>Subtotal</span><span>' + clp(t.sub) + '</span></div>' + (estado.modo === 'delivery' ? '<div><span>Envío</span><span data-envio>' + (t.envio ? clp(t.envio) : 'según comuna') + '</span></div>' : '') +
        '<div class="tot"><span>Total</span><span data-total>' + clp(t.sub + t.envio) + '</span></div></div>' +
        '<p class="err" role="alert" data-err></p>' +
        '<button class="btn-s prim" type="submit"' + (estado.bloqueado || estado.enviando ? ' disabled' : '') + '>' + (ed ? 'Guardar cambios' : 'Enviar pedido') + '</button>' +
        (ed && !estado.bloqueado ? '<button class="btn-s" type="button" data-cancelar-mod>Cancelar modificación</button>' : '') + '</div>' +
    '</form>';
    Object.keys(valores).forEach(function (id) { var el = id !== 'pago' && $('#' + id, dlg); if (el && valores[id] != null && (!ed || estado.tocados[id])) el.value = valores[id]; });   // en edición, lo que el cliente no tocó se rellena con los datos del pedido
    if (valores.pago) { var r = $('input[name="pago"][value="' + valores.pago + '"]', dlg); if (r) r.checked = true; }
    if (estado.gps) { var g = $('[data-gps]', dlg); if (g) g.textContent = 'Ubicación lista ✓'; }
  }

  // ---------- Errores visibles: rojo, sacudida, mensaje claro y a la vista ----------
  function marcar(cont, msgEl, texto) {
    if (!cont) return;
    cont.classList.add('mal'); var inp = $('input, select, textarea', cont); if (inp && cont.classList.contains('campo')) inp.setAttribute('aria-invalid', 'true');
    if (msgEl) msgEl.textContent = texto;
    cont.classList.remove('sacude'); void cont.offsetWidth; cont.classList.add('sacude');
    cont.addEventListener('animationend', function f() { cont.classList.remove('sacude'); cont.removeEventListener('animationend', f); });
  }
  function limpiarMal(cont) { if (!cont) return; cont.classList.remove('mal', 'sacude'); var inp = $('input, select, textarea', cont); if (inp) inp.removeAttribute('aria-invalid'); var m = $('.campo-err', cont); if (m) m.textContent = ''; }
  var valida = {
    'c-nombre': function (v) { return v.trim().length < 2 ? 'Escribe tu nombre.' : ''; },
    'c-fono': function (v) { return /^9\d{8}$/.test(v.replace(/[^\d]/g, '').replace(/^56/, '')) ? '' : 'Escribe un celular válido: 9 y 8 dígitos (ej. 9 1234 5678).'; },
    'c-dir': function (v) { return v.trim().length < 3 ? 'Escribe la dirección de entrega (calle y número).' : ''; },
    'c-comuna': function (v) { return v ? '' : 'Elige tu comuna para calcular el envío.'; },
    'c-mesa': function (v) { return v ? '' : 'Elige el número de tu mesa.'; }
  };
  // Al escribir o elegir, el error de ese campo se va en cuanto el dato queda bien
  function alCambiar(e) {
    var id = e.target.id, f = valida[id]; if (!f) return;
    var cont = e.target.closest('.campo'); if (cont && cont.classList.contains('mal') && !f(e.target.value)) limpiarMal(cont);
  }
  dlg.addEventListener('input', alCambiar); dlg.addEventListener('change', alCambiar);
  function tocar(e) { if (e.target.id) estado.tocados[e.target.id] = true; }
  dlg.addEventListener('input', tocar); dlg.addEventListener('change', tocar);
  function errores() {
    var errs = [], t = totales();
    if (!t.its.length) errs.push({ lineas: true, msg: 'Agrega al menos un plato a tu pedido.' });
    t.its.forEach(function (l) { if (!l.ok) errs.push({ linea: l.lid, msg: l.nombre + ' ' + (l.motivo === 'faltan opciones' ? 'necesita que elijas sus opciones' : l.motivo) + '. Quítalo para continuar.' }); });
    var ids = ['c-mesa', 'c-nombre', 'c-fono', 'c-dir', 'c-comuna'];
    ids.forEach(function (id) { var el = $('#' + id, dlg); if (el) { var m = valida[id](el.value); if (m) errs.push({ campo: id, msg: m }); } });
    if (!errs.length && estado.modo === 'delivery' && t.sub < P.CONFIG.minimoDelivery) errs.push({ lineas: true, msg: 'El pedido mínimo para delivery es ' + clp(P.CONFIG.minimoDelivery) + ' (llevas ' + clp(t.sub) + ').' });
    return errs;
  }
  function mostrarErrores(errs) {
    $$('.mal', dlg).forEach(limpiarMal); var el = $('[data-err-lineas]', dlg); if (el) el.textContent = '';
    var primero = null;
    errs.forEach(function (er) {
      var cont;
      if (er.campo) { var inp = $('#' + er.campo, dlg); cont = inp && inp.closest('.campo'); marcar(cont, cont && $('.campo-err', cont), er.msg); }
      else if (er.linea) { cont = $('[data-lid="' + er.linea + '"]', dlg); marcar(cont, null, ''); }
      else { cont = $('[data-lineas]', dlg); if (el) el.textContent = er.msg; marcar(cont, null, ''); }
      if (!primero && cont) primero = { cont: cont, er: er };
    });
    $('[data-err]', dlg).textContent = errs[0].msg;
    if (primero) { primero.cont.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (primero.er.campo) { var f = $('#' + primero.er.campo, dlg); if (f) f.focus({ preventScroll: true }); } }
  }

  dlg.addEventListener('click', function (e) {
    if (e.target.closest('[data-cerrar]')) dlg.close();
    var mb = e.target.closest('[data-modo]');
    if (mb) { estado.modo = mb.dataset.modo; guardar(); pintarModo(); if (estado.edicion) { estado.sucio = true; marcarModificando(); } pintarCarro(); return; }
    var mas = e.target.closest('[data-mas-l]'), menos = e.target.closest('[data-menos-l]');
    var ed = e.target.closest('[data-editar-l]');
    if (ed) {
      var k = ed.dataset.editarL, l = estado.carro[k], pl = l && C.plato(l.id);
      if (pl && (pl.grupos || []).length) abrirOpciones(l.id, k);
      else { var nota = $('[data-nota-l="' + k + '"]', dlg); if (nota) { nota.scrollIntoView({ block: 'center', behavior: 'smooth' }); nota.focus({ preventScroll: true }); } }
      return;
    }
    if (mas) { cambiarCant(mas.dataset.masL, 1); return; }
    if (menos) { cambiarCant(menos.dataset.menosL, -1); return; }
    if (e.target.closest('[data-cancelar-mod]')) { cancelarModificacion(); return; }
    if (e.target.closest('[data-nuevo-con]')) { salirEdicionConservando(); return; }
    var g = e.target.closest('[data-gps]');
    if (g && navigator.geolocation) {
      g.textContent = 'Buscando…';
      navigator.geolocation.getCurrentPosition(function (pos) { estado.gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }; g.textContent = 'Ubicación lista ✓'; },
        function () { g.textContent = 'No se pudo: usaremos la comuna'; }, { enableHighAccuracy: true, timeout: 8000 });
    }
  });
  dlg.addEventListener('input', function (e) {
    var n = e.target.closest('[data-nota-l]'); if (n && estado.carro[n.dataset.notaL]) { estado.carro[n.dataset.notaL].nota = n.value.slice(0, 120); guardar(); if (estado.edicion) { estado.sucio = true; marcarModificando(); } }
  });
  dlg.addEventListener('change', function (e) {
    if (e.target.id !== 'c-comuna') return;
    var t = totales(); $('[data-envio]', dlg).textContent = t.envio ? clp(t.envio) : 'según comuna'; $('[data-total]', dlg).textContent = clp(t.sub + t.envio);
    if (estado.edicion) { estado.sucio = true; marcarModificando(); }
  });

  function datosPedido() {
    var v = function (id) { var el = $('#' + id, dlg); return el ? el.value.trim() : ''; };
    var fono = v('c-fono').replace(/[^\d]/g, '').replace(/^56/, '');
    var cli = { nombre: v('c-nombre').slice(0, 40), telefono: fono ? '+56' + fono : '', direccion: v('c-dir').slice(0, 80), comuna: v('c-comuna') };
    if (estado.gps && estado.modo === 'delivery') { cli.lat = estado.gps.lat; cli.lng = estado.gps.lng; }
    var mesa = estado.modo === 'mesa' ? parseInt(v('c-mesa'), 10) : null; if (mesa) ses('fogon-mesa', String(mesa));
    var items = totales().its.map(function (i) { return { id: i.id, nombre: i.nombre, precio: i.precio, cant: i.cant, prep: i.prep, opc: i.opc, nota: i.nota }; });
    return { tipo: estado.modo, mesa: mesa, cliente: cli, items: items, nota: v('c-nota').slice(0, 200) };
  }
  dlg.addEventListener('submit', function (e) {
    e.preventDefault();
    if (estado.enviando || estado.bloqueado) return;
    var errs = errores(); if (errs.length) { mostrarErrores(errs); return; }
    var d = datosPedido(), boton = $('button[type="submit"]', dlg), errEl = $('[data-err]', dlg);
    estado.enviando = true; boton.disabled = true; errEl.textContent = ''; boton.textContent = estado.edicion ? 'Guardando…' : 'Enviando a la cocina…';
    var fin = function () { estado.enviando = false; };
    if (estado.edicion) {
      P.modificar(estado.edicion.id, { items: d.items, nota: d.nota, cliente: d.cliente, mesa: d.mesa, tipo: d.tipo }).then(function (p) {
        ses('fogon-borrador-' + p.id, null); estado.sucio = false; P.marcarModificando(p.id, false);
        location.href = 'pedido/?id=' + p.id + '&modificado=1';
      }).catch(function (er) { fin(); falloEnvio(er, boton, 'Guardar cambios'); });
      return;
    }
    var pago = ($('input[name="pago"]:checked', dlg) || {}).value || 'caja';
    var idPend = ses('fogon-id-pendiente'); if (!idPend) { idPend = Nube.idNuevo(); ses('fogon-id-pendiente', idPend); }   // si toca "Enviar" dos veces, es el mismo pedido
    P.crear(Object.assign(d, { id: idPend, pago: { metodo: pago, pagado: false }, referencia: v2('c-ref'), invitadoPor: ses('fogon-ref') || '' })).then(function (p) {
      loc('fogon-mi-pedido', p.id); ses('fogon-id-pendiente', null); estado.carro = {}; guardar();
      // Pagar en línea lleva al pago; efectivo o pagar en caja (o al recibir) va directo al seguimiento
      location.href = (pago === 'linea' ? 'pagar/?id=' : 'pedido/?id=') + p.id;
    }).catch(function (er) { fin(); falloEnvio(er, boton, 'Enviar pedido'); });
  });
  function v2(id) { var el = $('#' + id, dlg); return el ? el.value.trim() : ''; }
  function falloEnvio(er, boton, texto) {
    boton.disabled = false; boton.textContent = texto;
    var errEl = $('[data-err]', dlg); errEl.textContent = er.message || 'No pudimos enviar el pedido. Revisa tu conexión e intenta de nuevo.';
    if (er.codigo === 'pedido_activo') { var pend = P.pedidoPendiente(); if (pend) errEl.innerHTML = esc(er.message) + ' <a href="?editar=' + esc(pend.id) + '">Modificar mi pedido #' + esc(pend.codigo) + '</a>'; }
    if (er.codigo === 'no_modificable' || er.codigo === 'terminal') { estado.bloqueado = true; pintarCarro(); }
    if (er.codigo === 'conflicto') { var ed = estado.edicion; if (ed) { var o = P.obtener(ed.id); if (o) { ed.rev = o.rev; } } }
  }

  // ---------- "Modificar mi pedido": editar el pedido original mientras está Nuevo ----------
  var latido = null;
  function lineasDePedido(p) {
    var c = {};
    (p.items || []).forEach(function (i) { c[C.lid(i.id, i.opc || [])] = { id: i.id, opc: i.opc || [], cant: i.cant, nota: i.nota || '', precioFijo: i.precio, nombreFijo: i.nombre, opciones: i.opciones || [], prep: i.prep || 0 }; });
    return c;
  }
  function entrarEdicion(p) {
    estado.edicion = { id: p.id, codigo: p.codigo, rev: p.rev || 1, ultimoEstado: p.estado };
    estado.bloqueado = false; estado.sucio = false; estado.tocados = {}; dlg.innerHTML = '';
    var borr = ses('fogon-borrador-' + p.id), uso = null;
    if (borr) { try { uso = JSON.parse(borr); } catch (e) {} }
    if (uso && Object.keys(uso).length) { estado.carro = uso; estado.sucio = true; } else estado.carro = lineasDePedido(p);
    estado.modo = p.tipo; if (p.mesa) ses('fogon-mesa', String(p.mesa));
    if (!latido) latido = setInterval(function () { if (estado.edicion && estado.sucio && !estado.bloqueado) P.marcarModificando(estado.edicion.id, true); }, 60000);
    pintarModo(); pintarControles(); pintarCarro(); pintarAviso();
    if (q.get('editar')) { try { history.replaceState(null, '', location.pathname); } catch (e) {} setTimeout(function () { pintarCarro(); dlg.showModal(); }, 300); q.delete('editar'); }
  }
  function marcarModificando() { if (estado.edicion && !estado.bloqueado) P.marcarModificando(estado.edicion.id, true); }
  function cancelarModificacion() {
    var ed = estado.edicion; if (!ed) return;
    ses('fogon-borrador-' + ed.id, null); P.marcarModificando(ed.id, false);
    var p = P.obtener(ed.id); if (p) { estado.carro = lineasDePedido(p); estado.sucio = false; estado.modo = p.tipo; }
    pintarControles(); pintarCarro(); pintarAviso(); dlg.close();
  }
  function salirEdicionConservando() {
    // El local aceptó el pedido mientras el cliente editaba: lo que armó pasa a ser un pedido nuevo (el anterior no se toca)
    var ed = estado.edicion; ses('fogon-borrador-' + ed.id, null);
    var nuevo = {}; Object.keys(estado.carro).forEach(function (k) { var l = estado.carro[k]; nuevo[k] = { id: l.id, opc: l.opc || [], cant: l.cant, nota: l.nota || '' }; });
    estado.carro = nuevo; estado.edicion = null; estado.bloqueado = false; estado.sucio = false; guardar(); pintarControles(); pintarCarro(true); pintarAviso();
  }
  function pintarAviso() {
    var ed = estado.edicion;
    if (!ed) { aviso.hidden = true; return; }
    aviso.hidden = false; aviso.className = 'aviso-pend' + (estado.bloqueado ? ' mal' : '');
    aviso.innerHTML = estado.bloqueado ? '<b>El local ya aceptó tu pedido #' + esc(ed.codigo) + '.</b> Ya no se puede modificar. <a href="pedido/?id=' + esc(ed.id) + '">Ver mi pedido</a>'
      : '<b>Tienes el pedido #' + esc(ed.codigo) + ' pendiente.</b> Lo que agregues se suma a ese mismo pedido mientras el local no lo acepte. <button class="btn-s" type="button" data-abrir-carro>Ver y guardar cambios</button> <a href="pedido/?id=' + esc(ed.id) + '">Ver mi pedido</a>';
  }
  aviso.addEventListener('click', function (e) { if (e.target.closest('[data-abrir-carro]')) { pintarCarro(); dlg.showModal(); } });
  function revisarEdicion() {
    var ed = estado.edicion, pedido = ed ? P.obtener(ed.id) : (q.get('editar') ? P.obtener(q.get('editar')) : P.pedidoPendiente());
    if (ed) {
      if (!pedido) return;
      if (pedido.estado !== 'recibido') { if (!estado.bloqueado) { estado.bloqueado = true; ed.ultimoEstado = pedido.estado; pintarAviso(); if (dlg.open) pintarCarro(); else btn.classList.add('salta'); } return; }
      if ((pedido.rev || 1) !== ed.rev && !estado.sucio) { entrarEdicion(pedido); }   // lo cambió otra pantalla: se muestra la versión actual
      return;
    }
    if (pedido && pedido.estado === 'recibido' && !pedido.soloLocal) entrarEdicion(pedido);
    else if (q.get('editar') && pedido && pedido.estado !== 'recibido') { q.delete('editar'); aviso.hidden = false; aviso.className = 'aviso-pend mal'; aviso.innerHTML = 'Ese pedido ya no se puede modificar (el local lo aceptó o ya terminó). <a href="pedido/?id=' + esc(pedido.id) + '">Ver mi pedido</a>'; }
  }
  window.addEventListener('pagehide', function () { if (estado.edicion) P.soltarModificacion(estado.edicion.id); });

  // ---------- Acceso a "Mi pedido" mientras haya uno en curso ----------
  function miPedido() {
    var p = P.misPedidos().filter(function (x) { return P.ACTIVOS.indexOf(x.estado) > -1; })[0], a = $('.mi-pedido');
    if (!p) { if (a) a.remove(); return; }
    if (!a) { a = document.createElement('a'); a.className = 'mi-pedido'; document.body.appendChild(a); }
    a.href = 'pedido/?id=' + p.id; a.style.setProperty('--est', P.ESTADOS[p.estado].color);
    a.innerHTML = '<i aria-hidden="true"></i>Mi pedido #' + esc(p.codigo) + ': ' + esc(P.nombreEstado(p));
  }
  P.escuchar(function (m) { if (m.tipo === 'cambio' || m.tipo === 'nuevo') { miPedido(); revisarEdicion(); } });

  // ---------- Arranque ----------
  document.addEventListener('carta:lista', function () { pintarControles(); pintarCarro(); revisarEdicion(); });
  if (C.modelo()) { pintarControles(); revisarEdicion(); }   // la carta guardada en el equipo puede estar lista antes de que cargue este archivo
  if (q.get('editar')) P.seguir(q.get('editar'));
  P.esperar().then(function () { miPedido(); revisarEdicion(); }, function () {});
  pintarModo(); pintarCarro(); miPedido();
})();
