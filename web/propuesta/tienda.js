// Tienda de Bío Digital: desglose por producto, carrito y envío del pedido por correo y por WhatsApp.
// Los precios salen del catálogo de la página (#catalogo), no de lo guardado en el navegador.
// El envío abre el correo o WhatsApp del cliente con el pedido ya escrito: no hay servidor, nada se manda solo.
(function () {
  var cat = {};
  try { JSON.parse(document.getElementById('catalogo').textContent).forEach(function (p) { cat[p.id] = p; }); } catch (e) { return; }
  var clp = function (n) { return n == null ? 'A cotizar' : '$' + n.toLocaleString('es-CL'); };
  var KEY = 'bd-carrito';
  var cart = [];
  try { cart = (JSON.parse(localStorage.getItem('bd-carrito')) || []).filter(function (id, i, a) { return cat[id] && a.indexOf(id) === i; }); } catch (e) { cart = []; }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  // ── Desglose por producto: un producto abierto a la vez
  $$('.tarifario button.fila').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      $$('.tarifario button.fila').forEach(function (x) {
        x.setAttribute('aria-expanded', 'false');
        document.getElementById(x.getAttribute('aria-controls')).hidden = true;
      });
      if (!open) {
        b.setAttribute('aria-expanded', 'true');
        document.getElementById(b.getAttribute('aria-controls')).hidden = false;
      }
    });
  });

  // ── Carrito
  var drawer = $('#carrito'), backdrop = $('.cart-fondo'), list = $('[data-cart-list]'), totalEl = $('[data-cart-total]');
  var tip = $('[data-cart-tip]'), count = $$('[data-cart-count]'), lastFocus = null;

  function total() {
    return cart.reduce(function (t, id) { return t + (cat[id].precio || 0); }, 0);
  }
  var porCotizar = function () { return cart.some(function (id) { return cat[id].precio == null; }); };
  function render() {
    count.forEach(function (c) { c.textContent = cart.length; c.hidden = !cart.length; });
    $$('[data-add]').forEach(function (b) {
      var on = cart.indexOf(b.dataset.add) > -1;
      b.setAttribute('aria-pressed', on);
      b.classList.toggle('en-carro', on);
      b.querySelector('.add-t').textContent = on ? 'En el carrito · quitar' : (b.dataset.label || 'Agregar al carrito');
    });
    list.textContent = '';
    cart.forEach(function (id) {
      var li = document.createElement('li');
      var n = document.createElement('span'); n.textContent = cat[id].nombre + (cat[id].desde ? ' (desde)' : '');
      var p = document.createElement('b'); p.className = 'num'; p.textContent = clp(cat[id].precio);
      var x = document.createElement('button'); x.type = 'button'; x.className = 'quitar'; x.setAttribute('aria-label', 'Quitar ' + cat[id].nombre); x.textContent = '×';
      x.addEventListener('click', function () { toggle(id); });
      li.append(n, p, x); list.appendChild(li);
    });
    $('[data-cart-vacio]').hidden = cart.length > 0;
    $('[data-cart-pie]').hidden = !cart.length;
    totalEl.textContent = clp(total()) + (porCotizar() ? ' + a cotizar' : '');
    // Si lo que lleva suelto cuesta más que el pack completo, se lo decimos
    var sueltos = cart.filter(function (id) { return id.indexOf('promo-') !== 0 && id !== 'pack' && cat[id].precio != null; });
    var suma = sueltos.reduce(function (t, id) { return t + cat[id].precio; }, 0);
    var pack = cat.pack.precio;
    tip.hidden = !(cart.indexOf('pack') < 0 && suma > pack);
    if (!tip.hidden) tip.textContent = 'Tus productos suman ' + clp(suma) + ': el pack completo (' + clp(pack) + ') incluye los seis y te ahorra ' + clp(suma - pack) + '.';
    // Si ya hay algo en el carrito, no hace falta preguntar qué le interesa
    var pi = $('[data-interes]');
    if (pi) { pi.hidden = cart.length > 0; if (cart.length) pi.querySelector('select').value = ''; }
    // Resumen dentro del formulario
    var res = $('[data-pedido-resumen]');
    if (res) {
      res.textContent = cart.length
        ? cart.map(function (id) { return cat[id].nombre + ' ' + clp(cat[id].precio); }).join(' · ') + ' · Total ' + clp(total()) + (porCotizar() ? ' + a cotizar' : '')
        : 'Tu carrito está vacío: pedirás solo el diagnóstico gratis. Puedes agregar productos desde los precios.';
    }
  }
  function toggle(id) {
    var i = cart.indexOf(id);
    if (i > -1) cart.splice(i, 1); else cart.push(id);
    save(); render();
    if (window.Mascota) Mascota.evento(i > -1 ? 'carritoQuita' : 'carritoSuma');
  }
  function open() {
    lastFocus = document.activeElement;
    drawer.hidden = false; backdrop.hidden = false;
    document.documentElement.classList.add('cart-abierto');
    $('.cart-x', drawer).focus();
  }
  function close() {
    drawer.hidden = true; backdrop.hidden = true;
    document.documentElement.classList.remove('cart-abierto');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-add]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); toggle(b.dataset.add); }); });
  $$('[data-cart-open]').forEach(function (b) { b.addEventListener('click', open); });
  $('.cart-x', drawer).addEventListener('click', close);
  backdrop.addEventListener('click', close);
  $('[data-cart-vaciar]').addEventListener('click', function () { cart = []; save(); render(); });
  $('[data-cart-seguir]').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (drawer.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {   // el foco no se escapa del carrito
      var f = $$('button, a[href]', drawer).filter(function (x) { return !x.hidden && !x.closest('[hidden]'); });
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  render();

  // ── Formulario del pedido: solo datos válidos, y salida por correo o por WhatsApp
  var form = $('[data-pedido]');
  if (!form) return;
  var RE = {
    nombre: /^\p{L}[\p{L}\p{M}' .-]{1,59}$/u,
    negocio: /^[\p{L}\p{N}][\p{L}\p{M}\p{N}' .,&()-]{1,59}$/u,
    correo: /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,
    telefono: /^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/,
  };
  var MSG = {
    nombre: 'Escribe tu nombre usando solo letras (2 a 60).',
    negocio: 'Escribe el nombre del negocio (2 a 60 caracteres; letras, números y . , & ( ) -).',
    correo: 'Escribe un correo válido, por ejemplo tu@correo.cl.',
    telefono: 'Usa un celular chileno: +56 9 1234 5678.',
    comuna: 'Elige una comuna de la lista.',
    rubro: 'Elige un rubro de la lista.',
    interes: 'Elige una opción de la lista.',
    acepto: 'Debes aceptar para poder contactarte.'
  };
  var clean = function (s) { return String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim(); };
  var f = form.elements;

  function setErr(name, msg) {
    var el = f[name]; if (!el) return;
    var box = form.querySelector('[data-err="' + name + '"]');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) box.textContent = msg || '';
  }
  function check(name) {
    var el = f[name], v = clean(el.value), msg = '';
    if (name === 'acepto') msg = el.checked ? '' : MSG.acepto;
    else if (el.tagName === 'SELECT') {
      var ok = [].slice.call(el.options).some(function (o) { return o.value && o.value === el.value; });
      if (name === 'interes' && !el.value) ok = true;
      msg = ok ? '' : MSG[name];
    } else if (name === 'telefono') msg = !v || RE.telefono.test(v) ? '' : MSG.telefono;
    else msg = RE[name].test(v) ? '' : MSG[name];
    setErr(name, msg);
    return !msg;
  }
  var campos = ['nombre', 'negocio', 'rubro', 'comuna', 'correo', 'telefono', 'interes', 'acepto'];
  campos.forEach(function (n) {
    var ev = f[n].tagName === 'SELECT' || f[n].type === 'checkbox' ? 'change' : 'blur';
    f[n].addEventListener(ev, function () { check(n); });
    f[n].addEventListener('input', function () { if (f[n].getAttribute('aria-invalid') === 'true') check(n); });
  });

  function datos() {
    var tel = clean(f.telefono.value).replace(/[\s+]/g, '');
    if (tel) tel = '+56 9 ' + tel.slice(-8, -4) + ' ' + tel.slice(-4);
    return {
      nombre: clean(f.nombre.value), negocio: clean(f.negocio.value), rubro: f.rubro.value,
      comuna: clean(f.comuna.value), correo: clean(f.correo.value).toLowerCase(), telefono: tel, interes: f.interes.value,
      primeros: f.beneficio.checked
    };
  }
  function mensaje(d) {
    var l = ['Hola Bío Digital, quiero pedir mi diagnóstico gratis.', ''];
    if (cart.length) {
      l.push('Mi pedido:');
      cart.forEach(function (id) { l.push('- ' + cat[id].nombre + ': ' + clp(cat[id].precio) + (cat[id].desde ? ' (desde)' : '')); });
      l.push('Total: ' + clp(total()) + (porCotizar() ? ' + lo que se cotice' : ''), '');
    }
    if (d.interes) l.push('Me interesa: ' + d.interes);
    if (d.primeros) l.push('Me interesa el precio de lanzamiento para los primeros 5 clientes.');
    l.push('Nombre: ' + d.nombre, 'Negocio: ' + d.negocio + ' (' + d.rubro + ')', 'Comuna: ' + d.comuna, 'Correo: ' + d.correo);
    if (d.telefono) l.push('Teléfono: ' + d.telefono);
    return l.join('\n');
  }
  var status = $('[role="status"]', form);
  // Además de abrir el correo o WhatsApp, deja el pedido en el panel del equipo (sin bloquear si falla)
  function registrar(d, canal) {
    if (f.sitio && f.sitio.value) return;   // campo trampa para robots
    var body = { nombre: d.nombre, negocio: d.negocio, rubro: d.rubro, comuna: d.comuna, correo: d.correo, telefono: d.telefono || null,
      interes: cart.length ? null : (d.interes || null), canal: canal, primeros5: d.primeros,
      items: cart.map(function (id) { return { id: id, nombre: cat[id].nombre, precio: cat[id].precio }; }), total: total() };
    try {
      fetch(form.dataset.sbUrl + '/rest/v1/solicitudes', { method: 'POST', keepalive: true, credentials: 'omit',
        headers: { apikey: form.dataset.sbKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(body) }).catch(function () {});
    } catch (e) {}
  }
  function enviar(canal) {
    var bad = campos.filter(function (n) { return !check(n); });
    if (bad.length) { status.textContent = 'Revisa los campos marcados.'; f[bad[0]].focus(); if (window.Mascota) Mascota.evento(bad[0] === 'correo' ? 'malDato' : 'incompleto'); return; }
    var d = datos(), txt = mensaje(d);
    registrar(d, canal === 'correo' ? 'correo' : 'whatsapp');
    if (canal === 'correo') {
      location.href = 'mailto:' + form.dataset.mail + '?subject=' + encodeURIComponent('Pedido de diagnóstico: ' + d.negocio) + '&body=' + encodeURIComponent(txt);
      status.textContent = 'Se abrió tu correo con el pedido listo. Falta que presiones "Enviar" allá.';
    } else {
      var wa = form.dataset.wa;
      window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(txt), '_blank', 'noopener');
      status.textContent = 'Se abrió WhatsApp con el pedido listo. Falta que presiones "Enviar" allá.';
    }
    if (window.Mascota) Mascota.evento('enviado');
  }
  $$('[data-enviar]', form).forEach(function (b) { b.addEventListener('click', function () { enviar(b.dataset.enviar); }); });
  form.addEventListener('submit', function (e) { e.preventDefault(); enviar('correo'); });
  $('[data-cart-pedir]').addEventListener('click', function () {
    close();
    document.getElementById('diagnostico').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
})();
