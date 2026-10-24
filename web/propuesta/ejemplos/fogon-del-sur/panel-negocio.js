// Pestaña "Negocio y equipo" del panel del dueño: nombre, lema, color y logo del local, dirección y horarios, mesas, pedido mínimo,
// costo de envío por comuna y el personal (cocina y reparto) con su PIN. Los datos del local viajan junto con la carta y se publican
// con el mismo botón. Lo que cambia aquí es información del negocio: la estructura y el diseño de la página no se editan.
(function () {
  'use strict';
  var Panel = window.Panel, C = Panel.C, P = Panel.P, R = Panel.R, esc = Panel.esc, clp = Panel.clp;
  var ACENTOS = [['#cf9b4a', 'Dorado'], ['#d9663b', 'Terracota'], ['#b8484f', 'Granate'], ['#7a9a52', 'Oliva'], ['#4f8aa6', 'Azul'], ['#9a7bc2', 'Lila']];
  var PERSONAL_ROL = { cocina: 'Cocina', reparto: 'Reparto', dueno: 'Dueño' };
  var msgEq = '';

  function nombreRol(r) { return PERSONAL_ROL[r] || r; }
  function numero(v) { var n = Number(v); return v !== '' && isFinite(n) && n >= 0 && Math.round(n) === n ? n : null; }

  function pintar(cont) {
    var m = Panel.borrador();
    if (!m) { cont.innerHTML = '<p class="sis-nota">Cargando…</p>'; return; }
    var marca = m.marca || (m.marca = {}), neg = m.negocio || (m.negocio = {}), cfg = m.config || (m.config = {});
    var logo = marca.logo ? C.fotoSrc({ foto: marca.logo.src, fotoNube: marca.logo.id ? marca.logo : null }) : '';
    cont.innerHTML = '<div class="grid-p" style="margin-top:14px">' +
      '<section class="caja"><h2>Identidad del local</h2><div style="display:grid;gap:12px">' +
        '<div class="campo"><label for="n-nombre">Nombre del restaurante</label><input id="n-nombre" data-m="marca.nombre" value="' + esc(marca.nombre || '') + '" maxlength="40"></div>' +
        '<div class="campo"><label for="n-lema">Frase bajo el nombre</label><input id="n-lema" data-m="marca.lema" value="' + esc(marca.lema || '') + '" maxlength="90"></div>' +
        '<div><p class="lbl" style="margin-bottom:6px">Color principal</p><div class="swatches" role="group" aria-label="Color principal">' + ACENTOS.map(function (a) { return '<button type="button" data-acento="' + a[0] + '" style="background:' + a[0] + '" aria-label="' + a[1] + '" aria-pressed="' + (a[0] === (marca.acento || '#cf9b4a')) + '"></button>'; }).join('') + '</div></div>' +
        '<div><p class="lbl" style="margin-bottom:6px">Logo</p><div class="ed-foto">' + (logo ? '<img alt="Logo actual" src="' + esc(logo) + '" data-fn="' + esc(marca.logo && marca.logo.id ? marca.logo.id + '@' + marca.logo.h : '') + '">' : '') + '<div style="display:grid;gap:6px"><label class="btn-s" style="cursor:pointer">Subir logo<input type="file" accept="image/*" data-logo hidden></label>' + (marca.logo ? '<button class="btn-s" type="button" data-logo-quita>Quitar logo</button>' : '') + '<small class="sis-nota" data-logo-msg>Mejor si es cuadrado.</small></div></div></div>' +
        '<div class="campo"><label for="n-dir">Dirección</label><input id="n-dir" data-m="negocio.direccion" value="' + esc(neg.direccion || '') + '" maxlength="90"></div>' +
        '<div class="campo"><label for="n-hor">Horarios (uno por línea)</label><textarea id="n-hor" data-horarios rows="3" maxlength="240">' + esc((neg.horarios || []).join('\n')) + '</textarea></div>' +
      '</div></section>' +
      '<section class="caja"><h2>Servicio y envíos</h2><div style="display:grid;gap:12px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="campo"><label for="n-mesas">Mesas del local</label><input id="n-mesas" type="number" inputmode="numeric" min="1" max="99" data-c="mesas" value="' + esc(cfg.mesas == null ? '' : cfg.mesas) + '"><span class="campo-err" data-err="n-mesas"></span></div>' +
        '<div class="campo"><label for="n-min">Pedido mínimo en delivery ($)</label><input id="n-min" type="number" inputmode="numeric" min="0" step="500" data-c="minimoDelivery" value="' + esc(cfg.minimoDelivery == null ? '' : cfg.minimoDelivery) + '"><span class="campo-err" data-err="n-min"></span></div></div>' +
        '<p class="lbl">Costo de envío por comuna</p><div data-comunas style="display:grid;gap:6px">' + Object.keys(cfg.comunas || {}).map(function (k) { return '<div class="ed-op" data-com="' + esc(k) + '" style="grid-template-columns:1fr 110px auto"><span>' + esc(k) + '</span><input type="number" min="0" step="100" data-envio value="' + esc(cfg.comunas[k].envio) + '" aria-label="Envío a ' + esc(k) + '" style="min-height:44px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);padding:0 10px"><button class="btn-s peligro" type="button" data-com-borra aria-label="Quitar ' + esc(k) + '">×</button></div>'; }).join('') + '</div>' +
        '<small class="sis-nota">Para sumar una comuna nueva escríbenos: necesita sus coordenadas para calcular la ruta del repartidor.</small>' +
      '</div></section>' +
      '<section class="caja" style="grid-column:1/-1"><h2>Equipo y PIN de acceso</h2><p class="sis-nota">Cada persona entra con su PIN a la cocina o al reparto y solo ve lo suyo. Tu PIN de dueño no se puede cambiar desde aquí.</p>' +
        '<div class="scroll-x"><table class="tabla-p"><thead><tr><th>Nombre</th><th>Rol</th><th>PIN</th><th>Estado</th><th></th></tr></thead><tbody data-equipo>' + equipoHtml() + '</tbody></table></div>' +
        '<form data-nuevo-miembro style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end;margin-top:14px"><div class="campo"><label for="q-nombre">Nombre</label><input id="q-nombre" maxlength="30" autocomplete="off"></div><div class="campo"><label for="q-rol">Rol</label><select id="q-rol"><option value="reparto">Repartidor</option><option value="cocina">Cocina</option></select></div><div class="campo"><label for="q-pin">PIN (4 a 8 números)</label><input id="q-pin" inputmode="numeric" maxlength="8" autocomplete="off"></div><button class="btn-s prim" type="submit">Agregar persona</button></form>' +
        '<p class="campo-err" data-msg-equipo role="alert">' + esc(msgEq) + '</p></section>' +
      '<section class="caja" style="grid-column:1/-1"><h2>Empezar de cero</h2><p class="sis-nota">Borra todos los pedidos y visitas (por ejemplo, al terminar las pruebas antes de abrir al público). No toca tu carta, fotos ni equipo. No se puede deshacer.</p><button class="btn-s peligro" type="button" data-vaciar style="margin-top:8px">Borrar pedidos y visitas</button></section></div>';
  }
  function equipoHtml() {
    if (!Panel.personal.length) return '<tr><td colspan="5" class="sis-nota">Cargando el equipo…</td></tr>';
    return Panel.personal.map(function (x) {
      var edit = x.rol !== 'dueno';
      return '<tr data-pin="' + esc(x.pin) + '"><td>' + esc(x.nombre) + '</td><td>' + nombreRol(x.rol) + '</td><td><code>' + esc(x.pin) + '</code></td><td>' + (x.activo ? 'Activo' : 'Desactivado') + '</td><td>' + (edit ? '<button class="btn-s" type="button" data-pin-cambia>Cambiar PIN</button> <button class="btn-s" type="button" data-persona-activo>' + (x.activo ? 'Desactivar' : 'Activar') + '</button>' : '') + '</td></tr>';
    }).join('');
  }
  function recargarEquipo(cont) {
    return Nube.personalListar(R.negocio, Nube.pin(R.negocio)).then(function (r) {
      if (r && r.ok) { Panel.personal = r.personal; Panel.repartidores = r.personal.filter(function (x) { return x.rol === 'reparto' && x.activo; }).map(function (x) { return x.nombre; }); }
      var t = cont.querySelector('[data-equipo]'); if (t) t.innerHTML = equipoHtml();
    });
  }
  function poner(obj, ruta, v) { var k = ruta.split('.'); obj[k[0]] = obj[k[0]] || {}; obj[k[0]][k[1]] = v; }
  function errCampo(cont, id, t) { var e = cont.querySelector('[data-err="' + id + '"]'), i = cont.querySelector('#' + id); if (e) e.textContent = t || ''; if (i) { i.setAttribute('aria-invalid', t ? 'true' : 'false'); i.closest('.campo').classList.toggle('mal', !!t); } }

  Panel.registrar({
    id: 'negocio', titulo: 'Negocio y equipo',
    pintar: function (cont) {
      pintar(cont); recargarEquipo(cont);
      cont.oninput = function (e) {
        var m = Panel.borrador(); if (!m) return; var t = e.target;
        if (t.dataset.m) { poner(m, t.dataset.m, t.value); Panel.marcarSucio(); }
        if (t.dataset.horarios !== undefined) { m.negocio.horarios = t.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 6); Panel.marcarSucio(); }
        if (t.dataset.c) { var n = numero(t.value), id = t.id; if (n == null || (t.dataset.c === 'mesas' && (n < 1 || n > 99))) errCampo(cont, id, t.dataset.c === 'mesas' ? 'Entre 1 y 99 mesas.' : 'Escribe un monto en pesos.'); else { errCampo(cont, id, ''); m.config[t.dataset.c] = n; Panel.marcarSucio(); } }
        if (t.matches('[data-envio]')) { var k = t.closest('[data-com]').dataset.com, v = numero(t.value); if (v != null) { m.config.comunas[k].envio = v; Panel.marcarSucio(); } }
      };
      cont.onclick = function (e) {
        var m = Panel.borrador(); if (!m) return;
        var a = e.target.closest('[data-acento]'); if (a) { m.marca.acento = a.dataset.acento; Panel.marcarSucio(); [].forEach.call(cont.querySelectorAll('[data-acento]'), function (b) { b.setAttribute('aria-pressed', String(b === a)); }); return; }
        if (e.target.closest('[data-logo-quita]')) { delete m.marca.logo; Panel.marcarSucio(); pintar(cont); recargarEquipo(cont); return; }
        var cb = e.target.closest('[data-com-borra]'); if (cb) { var k = cb.closest('[data-com]').dataset.com; if (Object.keys(m.config.comunas).length <= 1) { Panel.toast('Debe quedar al menos una comuna con delivery.', true); return; } if (confirm('¿Quitar el delivery a ' + k + '?')) { delete m.config.comunas[k]; Panel.marcarSucio(); pintar(cont); recargarEquipo(cont); } return; }
        var fila = e.target.closest('[data-pin]'), x = fila && Panel.personal.filter(function (q) { return q.pin === fila.dataset.pin; })[0];
        if (x && e.target.closest('[data-pin-cambia]')) {
          var nuevo = prompt('Nuevo PIN para ' + x.nombre + ' (4 a 8 números):', ''); if (nuevo === null) return;
          Nube.personalGuardar(R.negocio, Nube.pin(R.negocio), x.rol, x.nombre, nuevo.trim(), x.activo, x.pin).then(function (r) { msgEq = r && r.ok ? '' : (r && r.error) || 'No se pudo cambiar el PIN.'; if (r && r.ok) Panel.toast('PIN actualizado. Dáselo a ' + x.nombre + '.'); return recargarEquipo(cont); }).then(function () { cont.querySelector('[data-msg-equipo]').textContent = msgEq; });
          return;
        }
        if (x && e.target.closest('[data-persona-activo]')) {
          if (x.activo && !confirm(x.nombre + ' ya no podrá entrar con su PIN. ¿Desactivar?')) return;
          Nube.personalGuardar(R.negocio, Nube.pin(R.negocio), x.rol, x.nombre, x.pin, !x.activo, x.pin).then(function (r) { msgEq = r && r.ok ? '' : (r && r.error) || 'No se pudo cambiar.'; return recargarEquipo(cont); }).then(function () { cont.querySelector('[data-msg-equipo]').textContent = msgEq; });
          return;
        }
        if (e.target.closest('[data-vaciar]')) {
          if (!confirm('Se borrarán TODOS los pedidos y visitas. Esto no se puede deshacer. ¿Seguro?')) return;
          var t = prompt('Para confirmar escribe BORRAR:'); if (t !== 'BORRAR') return;
          P.vaciar().then(function () { Panel.toast('Listo: pedidos y visitas borrados.'); }, function () { Panel.toast('No se pudo borrar. Revisa tu conexión.', true); });
        }
      };
      cont.onsubmit = function (e) {
        e.preventDefault(); if (!e.target.matches('[data-nuevo-miembro]')) return;
        var nombre = cont.querySelector('#q-nombre').value.trim(), rol = cont.querySelector('#q-rol').value, pin = cont.querySelector('#q-pin').value.trim(), msg = cont.querySelector('[data-msg-equipo]');
        if (nombre.length < 2) { msg.textContent = 'Escribe el nombre de la persona.'; cont.querySelector('#q-nombre').focus(); return; }
        if (!/^[0-9]{4,8}$/.test(pin)) { msg.textContent = 'El PIN debe tener de 4 a 8 números.'; cont.querySelector('#q-pin').focus(); return; }
        Nube.personalGuardar(R.negocio, Nube.pin(R.negocio), rol, nombre, pin, true, null).then(function (r) {
          msgEq = r && r.ok ? '' : (r && r.error) || 'No se pudo agregar.'; if (r && r.ok) { Panel.toast(nombre + ' ya puede entrar con su PIN.'); cont.querySelector('#q-nombre').value = ''; cont.querySelector('#q-pin').value = ''; }
          return recargarEquipo(cont);
        }).then(function () { msg.textContent = msgEq; });
      };
      cont.onchange = function (e) {
        if (!e.target.matches('[data-logo]')) return;
        var f = e.target.files[0], msg = cont.querySelector('[data-logo-msg]'); if (!f) return; msg.textContent = 'Subiendo el logo…';
        C.subirFoto(f).then(function (r) { var m = Panel.borrador(); m.marca.logo = { id: r.id, h: r.h }; Panel.marcarSucio(); pintar(cont); recargarEquipo(cont); }, function (er) { msg.textContent = er.message || 'No se pudo subir el logo.'; });
      };
    },
    alCarta: function (cont) { if (!Panel.sucio) { Panel.draft = null; pintar(cont); recargarEquipo(cont); } }
  });
})();
