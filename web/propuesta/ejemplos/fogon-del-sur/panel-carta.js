// Pestaña "Carta" del panel del dueño: agregar, editar, ocultar y eliminar platos y categorías, con foto propia, precio, descripción,
// disponibilidad y opciones (tamaños, extras). Todo se trabaja en un borrador y se publica con un botón: la carta pública se actualiza sola.
// El dueño solo toca los datos de la carta: la estructura y el diseño de la página no se pueden cambiar desde aquí.
// Los pedidos ya hechos guardan el nombre y el precio que tenían, así que cambiar o borrar un plato no los altera.
(function () {
  'use strict';
  var Panel = window.Panel, C = Panel.C, esc = Panel.esc, clp = Panel.clp;
  var abierto = {};   // categorías plegadas

  function slug(t, usados, vacio) {
    var b = String(t || vacio).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || vacio, id = b, n = 2;
    while (usados.indexOf(id) > -1) id = b + '-' + n++;
    return id;
  }
  function idsPlatos(m) { var l = []; m.categorias.forEach(function (c) { (c.platos || []).forEach(function (p) { l.push(p.id); }); }); return l; }
  function buscar(m, id) { var r = null; m.categorias.forEach(function (c, ci) { (c.platos || []).forEach(function (p, pi) { if (p.id === id) r = { c: c, ci: ci, p: p, pi: pi }; }); }); return r; }
  function mover(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return false; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; return true; }
  var etiquetaLista = function (t) { return String(t || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4); };

  function pintar(cont) {
    var m = Panel.borrador();
    if (!m) { cont.innerHTML = '<p class="sis-nota">Cargando la carta…</p>'; return; }
    var total = 0, ocultos = 0; m.categorias.forEach(function (c) { (c.platos || []).forEach(function (p) { total++; if (p.activo === false) ocultos++; }); });
    cont.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-top:14px"><p class="sis-nota">' + total + ' platos en ' + m.categorias.length + ' categorías' + (ocultos ? ' · ' + ocultos + ' ocultos' : '') + '. Los cambios se ven en la carta pública cuando los publicas.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-s prim" type="button" data-nueva-cat>+ Categoría</button><button class="btn-s" type="button" data-base>Volver a la carta de ejemplo</button></div></div>' +
      '<div class="ed-cats">' + m.categorias.map(function (c, ci) {
        return '<section class="ed-cat" data-ci="' + ci + '"><header><h3>' + esc(c.nombre) + (c.sub ? ' <small class="sis-nota">' + esc(c.sub) + '</small>' : '') + '</h3><div style="display:flex;gap:6px;flex-wrap:wrap">' +
          '<button class="btn-s" type="button" data-cat-sube aria-label="Subir categoría ' + esc(c.nombre) + '"' + (ci === 0 ? ' disabled' : '') + '>↑</button><button class="btn-s" type="button" data-cat-baja aria-label="Bajar categoría ' + esc(c.nombre) + '"' + (ci === m.categorias.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="btn-s" type="button" data-cat-edita>Renombrar</button><button class="btn-s" type="button" data-plato-nuevo>+ Plato</button><button class="btn-s peligro" type="button" data-cat-borra>Eliminar</button></div></header>' +
          ((c.platos || []).length ? c.platos.map(function (p, pi) {
            return '<div class="ed-plato' + (p.activo === false ? ' oculto' : '') + '" data-pi="' + pi + '"><img alt="" loading="lazy" data-fn="' + esc(C.claveFoto(p)) + '" src="' + esc(C.fotoSrc(p)) + '"><div><b>' + esc(p.nombre) + '</b> <span class="sis-nota">' + clp(p.precio) + (p.destacado ? ' · favorito' : '') + ((p.grupos || []).length ? ' · ' + p.grupos.length + (p.grupos.length === 1 ? ' grupo de opciones' : ' grupos de opciones') : '') + '</span><br>' +
              '<label class="interruptor"><input type="checkbox" data-disp' + (p.disponible !== false ? ' checked' : '') + '> Disponible hoy</label> <label class="interruptor"><input type="checkbox" data-activo' + (p.activo !== false ? ' checked' : '') + '> Visible en la carta</label></div>' +
              '<div class="acc"><button class="btn-s" type="button" data-sube aria-label="Subir ' + esc(p.nombre) + '"' + (pi === 0 ? ' disabled' : '') + '>↑</button><button class="btn-s" type="button" data-baja aria-label="Bajar ' + esc(p.nombre) + '"' + (pi === c.platos.length - 1 ? ' disabled' : '') + '>↓</button><button class="btn-s prim" type="button" data-edita>Editar</button><button class="btn-s peligro" type="button" data-borra>Eliminar</button></div></div>';
          }).join('') : '<p class="sis-nota">Esta categoría no tiene platos. Agrega el primero con “+ Plato”.</p>') + '</section>';
      }).join('') + '</div>';
  }
  Panel.registrar({
    id: 'carta', titulo: 'Carta',
    pintar: function (cont) {
      pintar(cont);
      cont.onclick = function (e) {
        var m = Panel.borrador(); if (!m) return;
        var sec = e.target.closest('[data-ci]'), ci = sec ? +sec.dataset.ci : -1, fila = e.target.closest('[data-pi]'), pi = fila ? +fila.dataset.pi : -1;
        var cat = ci > -1 ? m.categorias[ci] : null, plato = cat && pi > -1 ? cat.platos[pi] : null;
        var cambio = function () { Panel.marcarSucio(); pintar(cont); };
        if (e.target.closest('[data-nueva-cat]')) { var n = prompt('Nombre de la nueva categoría (por ejemplo: Postres):'); if (n && n.trim()) { m.categorias.push({ id: slug(n, m.categorias.map(function (c) { return c.id; }), 'cat'), nombre: n.trim().slice(0, 40), sub: '', platos: [] }); cambio(); } return; }
        if (e.target.closest('[data-base]')) { if (confirm('Esto reemplaza TODA la carta publicada por la carta de ejemplo (se pierden tus platos y fotos). ¿Seguro?')) C.restablecerBase().then(function (b) { Panel.draft = Panel.copia(b); Panel.marcarSucio(false); pintar(cont); Panel.toast('Carta de ejemplo restaurada y publicada.'); }, function () { Panel.toast('No se pudo restaurar. Revisa tu conexión.', true); }); return; }
        if (!cat) return;
        if (e.target.closest('[data-cat-sube]') && mover(m.categorias, ci, -1)) return cambio();
        if (e.target.closest('[data-cat-baja]') && mover(m.categorias, ci, 1)) return cambio();
        if (e.target.closest('[data-cat-edita]')) { var nn = prompt('Nombre de la categoría:', cat.nombre); if (nn && nn.trim()) { cat.nombre = nn.trim().slice(0, 40); var sb = prompt('Frase corta bajo el título (opcional):', cat.sub || ''); if (sb !== null) cat.sub = sb.trim().slice(0, 80); cambio(); } return; }
        if (e.target.closest('[data-cat-borra]')) { if (confirm('¿Eliminar la categoría “' + cat.nombre + '”' + ((cat.platos || []).length ? ' y sus ' + cat.platos.length + ' platos' : '') + '? Los pedidos ya hechos no cambian.')) { m.categorias.splice(ci, 1); cambio(); } return; }
        if (e.target.closest('[data-plato-nuevo]')) return editor(null, ci, cont);
        if (!plato) return;
        if (e.target.closest('[data-sube]') && mover(cat.platos, pi, -1)) return cambio();
        if (e.target.closest('[data-baja]') && mover(cat.platos, pi, 1)) return cambio();
        if (e.target.closest('[data-edita]')) return editor(plato.id, ci, cont);
        if (e.target.closest('[data-borra]')) { if (confirm('¿Eliminar “' + plato.nombre + '” de la carta? Si solo quieres quitarlo por hoy, mejor desmarca “Disponible hoy” u “Visible”. Los pedidos ya hechos conservan su nombre y precio.')) { cat.platos.splice(pi, 1); cambio(); } }
      };
      cont.onchange = function (e) {
        var m = Panel.borrador(), fila = e.target.closest('[data-pi]'), sec = e.target.closest('[data-ci]'); if (!m || !fila || !sec) return;
        var p = m.categorias[+sec.dataset.ci].platos[+fila.dataset.pi];
        if (e.target.matches('[data-disp]')) p.disponible = e.target.checked;
        if (e.target.matches('[data-activo]')) { p.activo = e.target.checked; fila.classList.toggle('oculto', !p.activo); }
        Panel.marcarSucio();
      };
    },
    alCarta: function (cont) { if (!Panel.sucio) { Panel.draft = null; pintar(cont); } },
    alFoto: true
  });
  // Cuando llega una foto subida, se actualiza la miniatura
  if (C.escucharFoto) C.escucharFoto(function (k, src) { [].forEach.call(document.querySelectorAll('img[data-fn="' + k + '"]'), function (i) { i.src = src; }); });

  // ---------- Editor de un plato ----------
  function editor(id, ci, cont) {
    var m = Panel.borrador(), hallado = id ? buscar(m, id) : null, nuevo = !hallado;
    var p = nuevo ? { id: '', nombre: '', descripcion: '', precio: '', foto: '', prep: 15, etiquetas: [], destacado: false, disponible: true, activo: true, grupos: [] } : Panel.copia(hallado.p);
    p.grupos = p.grupos || []; p.etiquetas = p.etiquetas || [];   // los platos sin opciones no traen estos campos
    var catIdx = hallado ? hallado.ci : ci, fotoNueva = null, fotoQuitada = false;
    var dlg = document.createElement('dialog'); dlg.className = 'editor'; dlg.setAttribute('aria-labelledby', 'ed-tit'); document.body.appendChild(dlg);
    function campo(idc, etq, valor, extra) { return '<div class="campo"><label for="' + idc + '">' + etq + '</label><input id="' + idc + '" value="' + esc(valor) + '" ' + (extra || '') + '><span class="campo-err" data-err="' + idc + '"></span></div>'; }
    function gruposHtml() {
      return p.grupos.map(function (g, gi) {
        return '<div class="ed-grupo" data-gi="' + gi + '"><div class="campo"><label>Nombre del grupo (por ejemplo: Tamaño, Agregar)</label><input data-gn value="' + esc(g.nombre) + '" maxlength="30"></div>' +
          '<div style="display:flex;gap:12px;flex-wrap:wrap"><label class="interruptor"><select data-gt aria-label="Cuántas opciones puede elegir"><option value="uno"' + (g.tipo !== 'varios' ? ' selected' : '') + '>Elige solo una</option><option value="varios"' + (g.tipo === 'varios' ? ' selected' : '') + '>Puede elegir varias</option></select></label>' +
          '<label class="interruptor"><input type="checkbox" data-go' + (g.obligatorio ? ' checked' : '') + '> Obligatorio</label>' + (g.tipo === 'varios' ? '<label class="interruptor">Máximo <input data-gm type="number" min="1" max="9" value="' + (g.max || 2) + '" style="width:64px;min-height:40px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);padding:0 8px"></label>' : '') + '</div>' +
          g.opciones.map(function (o, oi) { return '<div class="ed-op" data-oi="' + oi + '"><input data-on value="' + esc(o.nombre) + '" placeholder="Nombre de la opción" maxlength="30" aria-label="Nombre de la opción" style="min-height:44px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);padding:0 10px"><input data-oe type="number" min="0" step="100" value="' + (o.extra || 0) + '" aria-label="Precio extra en pesos" style="min-height:44px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--fg);padding:0 10px"><button class="btn-s peligro" type="button" data-op-borra aria-label="Quitar opción">×</button></div>'; }).join('') +
          '<div class="acc" style="display:flex;gap:6px"><button class="btn-s" type="button" data-op-nueva>+ Opción</button><button class="btn-s peligro" type="button" data-grupo-borra>Quitar grupo</button></div></div>';
      }).join('');
    }
    function fotoHtml() {
      var src = fotoNueva ? fotoNueva.vista : fotoQuitada ? C.PLACEHOLDER : C.fotoSrc(p);
      return '<div class="ed-foto"><img alt="Foto del plato" src="' + esc(src) + '"><div style="display:grid;gap:6px"><label class="btn-s" style="cursor:pointer">Subir mi foto<input type="file" accept="image/*" data-foto hidden></label>' + (p.foto || p.fotoNube || fotoNueva ? '<button class="btn-s" type="button" data-foto-quita>Quitar foto</button>' : '') + '<small class="sis-nota" data-foto-msg>Se ajusta sola a formato 4:3. Usa fotos tuyas o con permiso.</small></div></div>';
    }
    function dibujar() {
      dlg.innerHTML = '<form method="dialog" novalidate><div class="ed-cab"><h2 id="ed-tit" style="font-size:19px">' + (nuevo ? 'Nuevo plato' : 'Editar plato') + '</h2><button class="btn-s" type="button" data-cerrar aria-label="Cerrar">×</button></div><div class="ed-cuerpo">' +
        campo('e-nombre', 'Nombre del plato', p.nombre, 'maxlength="50" autocomplete="off"') + '<div class="campo"><label for="e-desc">Descripción</label><textarea id="e-desc" rows="3" maxlength="160">' + esc(p.descripcion) + '</textarea></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + campo('e-precio', 'Precio ($)', p.precio, 'type="number" inputmode="numeric" min="0" step="100"') + campo('e-prep', 'Preparación (min)', p.prep, 'type="number" inputmode="numeric" min="1" max="90"') + '</div>' +
        '<div class="campo"><label for="e-cat">Categoría</label><select id="e-cat">' + m.categorias.map(function (c, k) { return '<option value="' + k + '"' + (k === catIdx ? ' selected' : '') + '>' + esc(c.nombre) + '</option>'; }).join('') + '</select></div>' +
        campo('e-etq', 'Etiquetas (separadas por coma, máx. 4: Vegetariano, Sin gluten…)', (p.etiquetas || []).join(', '), 'maxlength="80"') +
        '<div style="display:flex;gap:16px;flex-wrap:wrap"><label class="interruptor"><input type="checkbox" id="e-dest"' + (p.destacado ? ' checked' : '') + '> Favorito de la casa</label><label class="interruptor"><input type="checkbox" id="e-disp"' + (p.disponible !== false ? ' checked' : '') + '> Disponible hoy</label><label class="interruptor"><input type="checkbox" id="e-act"' + (p.activo !== false ? ' checked' : '') + '> Visible en la carta</label></div>' +
        '<div><p class="lbl" style="margin-bottom:6px">Foto</p>' + fotoHtml() + '</div>' +
        '<div><p class="lbl" style="margin-bottom:6px">Opciones del plato (tamaños, extras…)</p><div data-grupos style="display:grid;gap:10px">' + gruposHtml() + '</div><button class="btn-s" type="button" data-grupo-nuevo style="margin-top:8px">+ Grupo de opciones</button></div>' +
        '</div><div class="ed-pie"><span class="campo-err" data-err-general style="margin-right:auto"></span><button class="btn-s" type="button" data-cerrar>Cancelar</button><button class="btn-s prim" type="submit" data-guardar>Guardar plato</button></div></form>';
    }
    // lee lo escrito para no perderlo al redibujar
    function leer() {
      var q = function (s) { return dlg.querySelector(s); };
      p.nombre = q('#e-nombre').value; p.descripcion = q('#e-desc').value; p.precio = q('#e-precio').value; p.prep = q('#e-prep').value; catIdx = +q('#e-cat').value;
      p.etiquetas = etiquetaLista(q('#e-etq').value); p.destacado = q('#e-dest').checked; p.disponible = q('#e-disp').checked; p.activo = q('#e-act').checked;
      [].forEach.call(dlg.querySelectorAll('[data-gi]'), function (el) {
        var g = p.grupos[+el.dataset.gi]; if (!g) return;
        g.nombre = el.querySelector('[data-gn]').value; g.tipo = el.querySelector('[data-gt]').value; g.obligatorio = el.querySelector('[data-go]').checked;
        var mx = el.querySelector('[data-gm]'); g.max = g.tipo === 'varios' ? Math.max(1, +(mx && mx.value) || 2) : 1;
        [].forEach.call(el.querySelectorAll('[data-oi]'), function (oe) { var o = g.opciones[+oe.dataset.oi]; if (o) { o.nombre = oe.querySelector('[data-on]').value; o.extra = oe.querySelector('[data-oe]').value; } });
      });
    }
    function mal(idc, texto) { var e = dlg.querySelector('[data-err="' + idc + '"]'), i = dlg.querySelector('#' + idc); if (e) e.textContent = texto; if (i) { i.setAttribute('aria-invalid', 'true'); i.closest('.campo').classList.add('mal'); } }
    function validar() {
      var errores = 0, primero = null;
      var falla = function (idc, t) { mal(idc, t); errores++; if (!primero) primero = dlg.querySelector('#' + idc); };
      [].forEach.call(dlg.querySelectorAll('.campo.mal'), function (c) { c.classList.remove('mal'); }); [].forEach.call(dlg.querySelectorAll('[data-err]'), function (e) { e.textContent = ''; });
      if (!String(p.nombre).trim()) falla('e-nombre', 'Escribe el nombre del plato.');
      var pr = Number(p.precio); if (p.precio === '' || !isFinite(pr) || pr < 0 || Math.round(pr) !== pr) falla('e-precio', 'Escribe el precio en pesos, sin decimales.');
      var pp = Number(p.prep); if (!isFinite(pp) || pp < 1 || pp > 90) falla('e-prep', 'Entre 1 y 90 minutos.');
      var gerr = '';
      p.grupos.forEach(function (g) {
        if (!String(g.nombre).trim()) gerr = gerr || 'Cada grupo de opciones necesita un nombre.';
        else if (!g.opciones.length) gerr = gerr || 'El grupo “' + g.nombre + '” no tiene opciones.';
        g.opciones.forEach(function (o) { if (!String(o.nombre).trim()) gerr = gerr || 'Hay una opción sin nombre en “' + g.nombre + '”.'; var e = Number(o.extra); if (o.extra === '' || !isFinite(e) || e < 0 || Math.round(e) !== e) gerr = gerr || 'El precio extra de “' + (o.nombre || 'una opción') + '” debe ser un número de pesos (0 si no cuesta).'; });
      });
      dlg.querySelector('[data-err-general]').textContent = gerr;
      if (gerr) errores++;
      if (primero) { primero.scrollIntoView({ block: 'center' }); primero.focus(); var c = primero.closest('.campo'); if (c && c.animate) c.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); }
      return !errores;
    }
    dibujar(); dlg.showModal();
    dlg.addEventListener('close', function () { dlg.remove(); });
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-cerrar]')) { dlg.close(); return; }
      var acc = false;
      if (e.target.closest('[data-grupo-nuevo]')) { leer(); p.grupos.push({ id: slug('grupo', p.grupos.map(function (g) { return g.id; }), 'grupo'), nombre: '', tipo: 'uno', max: 1, obligatorio: false, opciones: [{ id: 'op1', nombre: '', extra: 0 }] }); acc = true; }
      var ge = e.target.closest('[data-gi]'), g = ge ? p.grupos[+ge.dataset.gi] : null;
      if (g && e.target.closest('[data-op-nueva]')) { leer(); g.opciones.push({ id: slug('op', g.opciones.map(function (o) { return o.id; }), 'op'), nombre: '', extra: 0 }); acc = true; }
      if (g && e.target.closest('[data-op-borra]')) { leer(); g.opciones.splice(+e.target.closest('[data-oi]').dataset.oi, 1); acc = true; }
      if (g && e.target.closest('[data-grupo-borra]')) { leer(); p.grupos.splice(+ge.dataset.gi, 1); acc = true; }
      if (e.target.closest('[data-foto-quita]')) { leer(); fotoNueva = null; fotoQuitada = true; acc = true; }
      if (acc) { var y = dlg.querySelector('.ed-cuerpo').scrollTop; dibujar(); dlg.querySelector('.ed-cuerpo').scrollTop = y; }
    });
    dlg.addEventListener('change', function (e) {
      if (e.target.matches('[data-gt]')) { leer(); var y = dlg.querySelector('.ed-cuerpo').scrollTop; dibujar(); dlg.querySelector('.ed-cuerpo').scrollTop = y; }
      if (e.target.matches('[data-foto]')) {
        var msg = dlg.querySelector('[data-foto-msg]'), f = e.target.files[0]; if (!f) return; msg.textContent = 'Subiendo la foto…';
        C.subirFoto(f).then(function (r) { leer(); fotoNueva = r; fotoQuitada = false; var y = dlg.querySelector('.ed-cuerpo').scrollTop; dibujar(); dlg.querySelector('.ed-cuerpo').scrollTop = y; dlg.querySelector('[data-foto-msg]').textContent = 'Foto lista: se publica al guardar y publicar.'; }, function (er) { msg.textContent = er.message || 'No se pudo subir la foto.'; });
      }
    });
    dlg.addEventListener('submit', function (e) {
      e.preventDefault(); leer(); if (!validar()) return;
      var salida = {
        id: nuevo ? slug(p.nombre, idsPlatos(m), 'plato') : p.id, nombre: String(p.nombre).trim().slice(0, 50), descripcion: String(p.descripcion).trim().slice(0, 160), precio: Number(p.precio), prep: Number(p.prep),
        etiquetas: p.etiquetas, destacado: !!p.destacado, disponible: p.disponible !== false, activo: p.activo !== false
      };
      if (fotoNueva) salida.fotoNube = { id: fotoNueva.id, h: fotoNueva.h }; else if (!fotoQuitada) { if (p.foto) salida.foto = p.foto; if (p.fotoNube) salida.fotoNube = p.fotoNube; }
      if (p.grupos.length) salida.grupos = p.grupos.map(function (g) {
        var usados = [];
        return { id: g.id, nombre: String(g.nombre).trim().slice(0, 30), tipo: g.tipo === 'varios' ? 'varios' : 'uno', max: g.tipo === 'varios' ? g.max : 1, obligatorio: !!g.obligatorio, opciones: g.opciones.map(function (o) { var oid = o.id && usados.indexOf(o.id) < 0 ? o.id : slug(o.nombre, usados, 'op'); usados.push(oid); return { id: oid, nombre: String(o.nombre).trim().slice(0, 30), extra: Number(o.extra) }; }) };
      });
      if (hallado) { hallado.c.platos.splice(hallado.pi, 1); }
      var dest = m.categorias[catIdx]; dest.platos = dest.platos || [];
      if (hallado && hallado.ci === catIdx) dest.platos.splice(hallado.pi, 0, salida); else dest.platos.push(salida);
      Panel.marcarSucio(); dlg.close(); pintar(cont);
      Panel.toast('Plato guardado en el borrador. Publica para que tus clientes lo vean.');
    });
  }
})();
