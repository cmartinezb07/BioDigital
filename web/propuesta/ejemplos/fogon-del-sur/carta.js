// Carta del restaurante como DATOS (no como HTML fijo): categorías, platos, fotos, precios, disponibilidad y opciones.
// Cada restaurante tiene la suya, guardada en la base bajo su "negocio". El dueño la edita desde su panel y la carta pública se actualiza
// sola, sin reconstruir nada. Mientras no haya una carta publicada se usa carta-base.json (la plantilla).
// Lo usan la carta pública (menu.js, pedir.js), el panel del dueño y el seguimiento.
(function () {
  'use strict';
  var R = window.RESTAURANTE, NEG = R.negocio, CLAVE = 'carta-' + NEG;
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^\/]*$/, '');   // carpeta donde viven carta-base.json y fotos/
  var modelo = null, oyentes = [], fotos = {}, pidiendo = {}, alFoto = [];
  var PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120"><rect width="160" height="120" fill="#2a1d15"/><g fill="none" stroke="#a48e76" stroke-width="3" stroke-linecap="round"><circle cx="80" cy="60" r="28"/><circle cx="80" cy="60" r="16"/><path d="M34 30v34M28 30v16a6 6 0 0 0 12 0V30M126 30c-8 4-12 14-12 26h12Zm0 26v34"/></g></svg>');

  function leerCache() { try { return JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { return null; } }
  function guardarCache(m) { try { localStorage.setItem(CLAVE, JSON.stringify(m)); } catch (e) {} }
  function fijar(m, origen) {
    if (!m || !Array.isArray(m.categorias)) return;
    if (modelo && Nube.canon(modelo) === Nube.canon(m)) return;
    modelo = m;
    if (window.Pedidos && Pedidos.configurar) Pedidos.configurar(m.config);
    oyentes.forEach(function (f) { try { f(m, origen); } catch (e) {} });
  }
  var sondeo = null;
  function iniciar() {
    if (sondeo) return;
    var c = leerCache(); if (c) fijar(c, 'cache');
    // Si todavía no hay una carta publicada, se parte de la plantilla (carta-base.json)
    var base = fetch(BASE + 'carta-base.json').then(function (r) { return r.json(); }).catch(function () { return null; });
    sondeo = Nube.sondear(NEG, 'carta', { ids: function () { return ['carta']; }, cada: 15000 }, function (r) {
      var f = (r.filas || []).filter(function (x) { return x.id === 'carta'; })[0];
      if (f && f.data) { guardarCache(f.data); fijar(f.data, 'nube'); return; }
      if (!modelo) base.then(function (b) { if (b && !modelo) fijar(b, 'base'); });
    });
    // Respaldo si la nube no responde y aún no hay nada que mostrar
    setTimeout(function () { if (!modelo) base.then(function (b) { if (b && !modelo) fijar(b, 'base'); }); }, 4000);
  }
  function escuchar(f) { oyentes.push(f); if (modelo) f(modelo, 'cache'); }

  function platos(incluirInactivos) {
    var l = []; if (modelo) modelo.categorias.forEach(function (c) { (c.platos || []).forEach(function (p) { if (incluirInactivos || p.activo !== false) l.push(p); }); });
    return l;
  }
  function plato(id) { return platos(true).filter(function (p) { return p.id === id; })[0] || null; }
  function categoriaDe(id) { var r = null; (modelo ? modelo.categorias : []).forEach(function (c) { (c.platos || []).forEach(function (p) { if (p.id === id) r = c; }); }); return r; }

  // Precio de una línea: precio base + extras de las opciones elegidas ('grupo:opcion'). Devuelve también lo que falta elegir.
  function linea(p, opc) {
    var extra = 0, opciones = [], faltan = [], sel = opc || [];
    (p.grupos || []).forEach(function (g) {
      var n = 0;
      (g.opciones || []).forEach(function (o) { if (sel.indexOf(g.id + ':' + o.id) > -1) { n++; extra += o.extra || 0; opciones.push({ grupo: g.nombre, opcion: o.nombre, extra: o.extra || 0 }); } });
      if (g.obligatorio && n < 1) faltan.push(g);
      if (n > (g.tipo === 'varios' ? (g.max || 99) : 1)) faltan.push(g);
    });
    return { precio: p.precio + extra, opciones: opciones, faltan: faltan };
  }
  function lid(id, opc) { return id + '|' + (opc || []).slice().sort().join(','); }

  // ----- Fotos: las de la plantilla son archivos; las que sube el dueño viven en la base y se guardan en el equipo para no bajarlas de nuevo -----
  function fotoSrc(p) {
    if (p.fotoNube) {
      var k = p.fotoNube.id + '@' + p.fotoNube.h;
      if (fotos[k]) return fotos[k];
      var c; try { c = localStorage.getItem('fotonube-' + k); } catch (e) {}
      if (c) { fotos[k] = c; return c; }
      pedirFoto(p.fotoNube); return PLACEHOLDER;
    }
    return p.foto ? (/^(https?:|data:)/.test(p.foto) ? p.foto : BASE + p.foto) : PLACEHOLDER;
  }
  function pedirFoto(f) {
    var k = f.id + '@' + f.h; if (pidiendo[k]) return; pidiendo[k] = 1;
    Nube.leer(NEG, 'fotos', { ids: [f.id] }).then(function (r) {
      var x = (r.mios || []).filter(function (q) { return q.id === f.id; })[0];
      if (x && x.data && x.data.img) { fotos[k] = x.data.img; try { localStorage.setItem('fotonube-' + k, x.data.img); } catch (e) {} alFoto.forEach(function (fn) { fn(k, x.data.img); }); }
    }).catch(function () {}).then(function () { delete pidiendo[k]; });
  }
  function escucharFoto(fn) { alFoto.push(fn); }
  function claveFoto(p) { return p.fotoNube ? p.fotoNube.id + '@' + p.fotoNube.h : ''; }

  // ----- Edición (solo el dueño, con su PIN) -----
  function pin() { return Nube.pin(NEG); }
  function guardar(m) {
    m.publicada = Date.now();
    return Nube.escribir(NEG, 'carta', 'carta', m, { pin: pin(), modo: 'poner' }).then(function () { guardarCache(m); modelo = m; return m; });
  }
  // Reduce la foto en el equipo (800 px, 4:3, WebP) y la guarda en la base. Devuelve { id, h } para apuntarla desde el plato.
  function subirFoto(archivo) {
    return new Promise(function (ok, mal) {
      if (!archivo || !/^image\//.test(archivo.type)) return mal(new Error('Elige un archivo de imagen (JPG, PNG o WebP).'));
      var url = URL.createObjectURL(archivo), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, t = 4 / 3, sw = w, sh = h;
        if (w / h > t) sw = Math.round(h * t); else sh = Math.round(w / t);
        var cv = document.createElement('canvas'); cv.width = 800; cv.height = 600;
        cv.getContext('2d').drawImage(img, Math.round((w - sw) / 2), Math.round((h - sh) / 2), sw, sh, 0, 0, 800, 600);
        URL.revokeObjectURL(url);
        var q = 0.8, data = cv.toDataURL('image/webp', q);
        if (!/^data:image\/webp/.test(data)) data = cv.toDataURL('image/jpeg', q);
        while (data.length > 200000 && q > 0.35) { q -= 0.1; data = cv.toDataURL(/^data:image\/webp/.test(data) ? 'image/webp' : 'image/jpeg', q); }
        if (data.length > 230000) return mal(new Error('La foto es muy pesada. Prueba con otra.'));
        var hash = 0; for (var i = 0; i < data.length; i += 97) hash = (hash * 31 + data.charCodeAt(i)) >>> 0;
        var h8 = hash.toString(36).slice(0, 8), id = 'f' + Nube.idNuevo().slice(0, 10);
        Nube.escribir(NEG, 'fotos', id, { img: data, h: h8 }, { pin: pin(), modo: 'poner' }).then(function () { fotos[id + '@' + h8] = data; ok({ id: id, h: h8, vista: data }); }, mal);
      };
      img.onerror = function () { URL.revokeObjectURL(url); mal(new Error('No se pudo leer esa imagen.')); };
      img.src = url;
    });
  }
  function restablecerBase() {
    return fetch(BASE + 'carta-base.json').then(function (r) { return r.json(); }).then(function (b) { return guardar(b); });
  }
  function idPlato(nombre) {
    var base = String(nombre || 'plato').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'plato', id = base, n = 2;
    while (plato(id)) id = base + '-' + n++;
    return id;
  }

  window.Carta = { iniciar: iniciar, escuchar: escuchar, modelo: function () { return modelo; }, platos: platos, plato: plato, categoriaDe: categoriaDe, linea: linea, lid: lid, fotoSrc: fotoSrc, claveFoto: claveFoto, escucharFoto: escucharFoto, PLACEHOLDER: PLACEHOLDER,
    guardar: guardar, subirFoto: subirFoto, restablecerBase: restablecerBase, idPlato: idPlato, base: BASE };
})();
