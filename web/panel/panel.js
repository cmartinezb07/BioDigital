// Panel interno de Bío Digital. Sin librerías: habla directo con Supabase (login, segundo factor y datos).
// La llave de abajo es la "publicable": es pública por diseño. Lo que protege los datos son las reglas de la base (RLS),
// que solo dejan leer a quien esté en la lista del equipo, con correo confirmado y segundo factor (aal2).
(function () {
  'use strict';
  var URL_API = 'https://mkxxqhywwzsaeojfmkme.supabase.co';
  var LLAVE = 'sb_publishable_IY0ngSo4QeKmUFVQTTUTGw_jTudkX8Z';
  var SESION = 'bd-panel-sesion';
  var INACTIVO_MS = 15 * 60 * 1000;      // se cierra solo tras 15 minutos sin tocar nada
  var CADA_MS = 5000;                     // cuántas veces mira si hay datos nuevos
  var ESTADOS = ['nueva', 'contactada', 'diagnostico', 'propuesta', 'ganada', 'perdida'];
  var RUBROS = ['Gastronomía', 'Belleza y peluquería', 'Taller o servicio técnico', 'Almacén o tienda', 'Salud', 'Otro'];
  var COMUNAS = ['Concepción', 'Talcahuano', 'Hualpén', 'San Pedro de la Paz', 'Chiguayante', 'Coronel', 'Lota', 'Penco', 'Tomé', 'Hualqui'];
  var MEDIOS = ['efectivo', 'transferencia', 'boleta', 'otro'];

  var $app = document.getElementById('app'), $avisos = document.getElementById('avisos');
  var ses = null, yo = null, tab = 'resumen', datos = { sol: [], lev: [], caja: [], equipo: [], audit: [] };
  var vistos = null, nuevas = 0, timer = null, ultimaActividad = Date.now(), cae = false, filtroEstado = '', filtroMes = '';
  var fallos = 0, bloqueoHasta = 0;

  // ---------- utilidades (todo el texto entra con textContent: nada de HTML armado a mano)
  function h(tag, props) {
    var el = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'on') Object.keys(v).forEach(function (e) { el.addEventListener(e, v[e]); });
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(function (x) { add(el, x); }); else el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c); }
  var clp = function (n) { return '$' + Math.round(n || 0).toLocaleString('es-CL'); };
  var fecha = function (s) { return new Date(s).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }); };
  var dia = function (s) { return new Date(s + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }); };
  var digitos = function (s) { return String(s || '').replace(/\D/g, ''); };
  var etiqueta = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  function aviso(txt, mal) { var a = h('div', { class: 'aviso' + (mal ? ' mal' : ''), text: txt }); $avisos.appendChild(a); setTimeout(function () { a.remove(); }, 5000); }
  function montar(el) { $app.textContent = ''; $app.appendChild(el); }
  function claims() { try { return JSON.parse(atob(ses.access.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return {}; } }

  // ---------- red
  function api(path, o) {
    o = o || {};
    var headers = { apikey: LLAVE, 'Content-Type': 'application/json' };
    if (o.auth !== false && ses) headers.Authorization = 'Bearer ' + ses.access;
    if (o.prefer) headers.Prefer = o.prefer;
    return fetch(URL_API + path, { method: o.method || 'GET', headers: headers, body: o.body ? JSON.stringify(o.body) : undefined, cache: 'no-store', credentials: 'omit' })
      .then(function (r) {
        return r.text().then(function (t) {
          var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
          if (!r.ok) { var e = new Error((j && (j.msg || j.message || j.error_description || j.error)) || ('Error ' + r.status)); e.status = r.status; e.code = j && (j.error_code || j.code); throw e; }
          return j;
        });
      });
  }
  function guardar(j) {
    ses = { access: j.access_token, refresh: j.refresh_token, exp: Date.now() + Math.max(60, (j.expires_in || 3600) - 60) * 1000, email: (j.user && j.user.email) || (ses && ses.email) || '' };
    try { sessionStorage.setItem(SESION, JSON.stringify({ refresh: ses.refresh, email: ses.email })); } catch (e) {}
  }
  function renovar() {
    if (!ses) return Promise.reject(new Error('sin sesión'));
    return api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', auth: false, body: { refresh_token: ses.refresh } }).then(guardar);
  }
  function conSesion(path, o) {   // renueva antes de que venza y reintenta una vez si el servidor dice 401
    var p = ses && Date.now() > ses.exp ? renovar() : Promise.resolve();
    return p.then(function () { return api(path, o); }).catch(function (e) {
      if (e.status === 401 && ses) return renovar().then(function () { return api(path, o); });
      throw e;
    });
  }
  function salir(msg) {
    clearInterval(timer); timer = null;
    var t = ses && ses.access;
    if (t) fetch(URL_API + '/auth/v1/logout', { method: 'POST', headers: { apikey: LLAVE, Authorization: 'Bearer ' + t }, credentials: 'omit' }).catch(function () {});
    ses = null; yo = null; vistos = null; nuevas = 0;
    datos = { sol: [], lev: [], caja: [], equipo: [], audit: [] };
    try { sessionStorage.removeItem(SESION); } catch (e) {}
    document.title = 'Panel · Bío Digital';
    pantallaLogin(msg);
  }

  // ---------- acceso
  var logo = function () { return h('span', { class: 'logo', role: 'img', 'aria-label': 'Bío Digital' }, h('i', { class: 'm' }), h('i', { class: 't' })); };
  function campo(label, attrs) { var i = h('input', attrs); return { el: h('label', {}, label, i), i: i }; }

  function pantallaLogin(msg) {
    var correo = campo('Correo', { type: 'email', autocomplete: 'username', required: true, maxlength: 80 });
    var clave = campo('Contraseña (11 o más, con mayúscula, minúscula, número y símbolo)', { type: 'password', autocomplete: 'current-password', required: true, minlength: 11, maxlength: 72 });
    var err = h('p', { class: 'error', role: 'alert', text: msg || '' });
    var btn = h('button', { class: 'btn main', type: 'submit', text: 'Entrar' });
    function bloqueado() { var s = Math.ceil((bloqueoHasta - Date.now()) / 1000); if (s > 0) { err.textContent = 'Demasiados intentos. Espera ' + s + ' s.'; return true; } return false; }
    function fallo(e) {
      fallos++; if (fallos >= 5) { bloqueoHasta = Date.now() + 60000; fallos = 0; }
      err.textContent = e.status === 400 || e.status === 401 ? 'Correo o contraseña incorrectos, o falta confirmar tu correo.' : (e.message || 'No se pudo entrar.');
    }
    var form = h('form', { novalidate: true, on: { submit: function (ev) {
      ev.preventDefault(); err.textContent = '';
      if (bloqueado()) return;
      if (!correo.i.value.trim() || clave.i.value.length < 11) { err.textContent = 'Escribe tu correo y una contraseña de al menos 11 caracteres.'; return; }
      btn.disabled = true;
      api('/auth/v1/token?grant_type=password', { method: 'POST', auth: false, body: { email: correo.i.value.trim().toLowerCase(), password: clave.i.value } })
        .then(function (j) { fallos = 0; guardar(j); clave.i.value = ''; siguiente(); })
        .catch(function (e) { fallo(e); btn.disabled = false; });
    } } }, correo.el, clave.el, err, btn);
    var crear = h('button', { class: 'enlace', type: 'button', text: 'Crear mi cuenta', on: { click: function () {
      err.textContent = '';
      if (!correo.i.value.trim() || clave.i.value.length < 11) { err.textContent = 'Escribe tu correo y elige una contraseña de al menos 11 caracteres, y luego presiona "Crear mi cuenta".'; return; }
      api('/auth/v1/signup', { method: 'POST', auth: false, body: { email: correo.i.value.trim().toLowerCase(), password: clave.i.value } })
        .then(function () { clave.i.value = ''; err.className = 'error ok-t'; err.textContent = 'Listo. Te enviamos un correo para confirmar tu cuenta. Después vuelve aquí a entrar.'; })
        .catch(function (e) { err.className = 'error'; err.textContent = e.message; });
    } } });
    var olvido = h('button', { class: 'enlace', type: 'button', text: 'Olvidé mi contraseña', on: { click: function () {
      if (!correo.i.value.trim()) { err.textContent = 'Escribe tu correo arriba primero.'; return; }
      api('/auth/v1/recover', { method: 'POST', auth: false, body: { email: correo.i.value.trim().toLowerCase() } }).catch(function () {});
      err.className = 'error ok-t'; err.textContent = 'Si el correo existe, te llegará un enlace para cambiar la contraseña.';
    } } });
    montar(h('div', { class: 'acceso' }, h('div', { class: 'tarjeta' }, logo(), h('h1', { text: 'Panel interno' }),
      h('p', { class: 'suave', text: 'Solo para el equipo de Bío Digital. Pedimos contraseña y un código de tu app de autenticación.' }),
      form, h('div', { class: 'enlaces' }, crear, olvido))));
  }

  // Después de la contraseña: si falta el segundo factor, se pide; si no, se entra
  function siguiente() {
    if (claims().aal === 'aal2') return entrar();
    api('/auth/v1/user', { method: 'GET' }).then(function (u) {
      var f = (u.factors || []).filter(function (x) { return x.factor_type === 'totp' && x.status === 'verified'; })[0];
      if (f) pantallaCodigo(f.id); else pantallaEnrolar(u.factors || []);
    }).catch(function () { salir('No pudimos verificar tu cuenta. Entra de nuevo.'); });
  }
  function verificar(fid, codigo) {
    return api('/auth/v1/factors/' + fid + '/challenge', { method: 'POST', body: {} }).then(function (c) {
      return api('/auth/v1/factors/' + fid + '/verify', { method: 'POST', body: { challenge_id: c.id, code: codigo } });
    }).then(function (j) { guardar(j); entrar(); });
  }
  function pantallaCodigo(fid) {
    var cod = campo('Código de 6 dígitos de tu app', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 6, pattern: '[0-9]{6}', required: true });
    var err = h('p', { class: 'error', role: 'alert' });
    var form = h('form', { novalidate: true, on: { submit: function (ev) {
      ev.preventDefault(); err.textContent = '';
      if (!/^\d{6}$/.test(cod.i.value)) { err.textContent = 'Son 6 números.'; return; }
      verificar(fid, cod.i.value).catch(function (e) { fallos++; if (fallos >= 5) { salir('Demasiados intentos. Entra de nuevo.'); return; } err.textContent = 'Código incorrecto o vencido.'; cod.i.value = ''; });
    } } }, cod.el, err, h('button', { class: 'btn main', type: 'submit', text: 'Verificar' }));
    montar(h('div', { class: 'acceso' }, h('div', { class: 'tarjeta' }, logo(), h('h1', { text: 'Segundo paso' }), form,
      h('button', { class: 'enlace', type: 'button', text: 'Cancelar', on: { click: function () { salir(); } } }))));
    cod.i.focus();
  }
  function pantallaEnrolar(factores) {
    var viejos = factores.filter(function (f) { return f.status !== 'verified'; });
    Promise.all(viejos.map(function (f) { return api('/auth/v1/factors/' + f.id, { method: 'DELETE' }).catch(function () {}); }))
      .then(function () { return api('/auth/v1/factors', { method: 'POST', body: { factor_type: 'totp', friendly_name: 'Bío Digital ' + Date.now(), issuer: 'Bío Digital' } }); })
      .then(function (f) {
        var cod = campo('Código de 6 dígitos', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 6, required: true });
        var err = h('p', { class: 'error', role: 'alert' });
        var qr = h('img', { class: 'qr', alt: 'Código QR para tu app de autenticación', width: 200, height: 200 });
        if (/^data:image\/svg\+xml/.test(f.totp.qr_code)) qr.src = f.totp.qr_code;
        var form = h('form', { novalidate: true, on: { submit: function (ev) {
          ev.preventDefault(); err.textContent = '';
          if (!/^\d{6}$/.test(cod.i.value)) { err.textContent = 'Son 6 números.'; return; }
          verificar(f.id, cod.i.value).catch(function () { err.textContent = 'Código incorrecto. Revisa la hora de tu teléfono e inténtalo de nuevo.'; cod.i.value = ''; });
        } } }, cod.el, err, h('button', { class: 'btn main', type: 'submit', text: 'Activar y entrar' }));
        montar(h('div', { class: 'acceso' }, h('div', { class: 'tarjeta' }, logo(), h('h1', { text: 'Activa tu segundo factor' }),
          h('p', { class: 'suave', text: 'Escanea el código con Google Authenticator, Authy o similar. Cada vez que entres te pediremos el código que muestra la app.' }),
          qr, h('p', { class: 'suave', text: 'Si no puedes escanear, escribe esta clave en la app:' }), h('code', { text: f.totp.secret }), form,
          h('button', { class: 'enlace', type: 'button', text: 'Cancelar', on: { click: function () { salir(); } } }))));
        cod.i.focus();
      }).catch(function (e) { salir(e.message || 'No se pudo activar el segundo factor.'); });
  }

  // Con segundo factor listo: se confirma que el correo está en la lista del equipo
  function entrar() {
    var correo = (ses.email || '').toLowerCase();
    api('/rest/v1/staff?select=email,nombre,rol&email=eq.' + encodeURIComponent(correo)).then(function (r) {
      if (!r || !r.length) {
        montar(h('div', { class: 'acceso' }, h('div', { class: 'tarjeta' }, logo(), h('h1', { text: 'Sin acceso' }),
          h('p', { text: 'Tu correo (' + correo + ') todavía no está en la lista del equipo. Pide a un administrador que te agregue.' }),
          h('button', { class: 'btn', type: 'button', text: 'Salir', on: { click: function () { salir(); } } }))));
        return;
      }
      yo = r[0]; tab = 'resumen'; ultimaActividad = Date.now();
      cargar().then(function () { vistos = new Set(datos.sol.map(function (s) { return s.id; })); pintar(); });
      clearInterval(timer);
      timer = setInterval(latido, CADA_MS);
    }).catch(function () { salir('No pudimos comprobar tu acceso.'); });
  }

  // ---------- datos
  var SOL = 'id,creada_en,nombre,negocio,rubro,comuna,correo,telefono,interes,items,total,primeros5,canal,estado,notas,asignado_a';
  function cargar() {
    var pedidos = [
      conSesion('/rest/v1/solicitudes?select=' + SOL + '&order=creada_en.desc&limit=500'),
      conSesion('/rest/v1/levantamientos?select=id,creada_en,negocio,contacto,revisado,notas,tipo&order=creada_en.desc&limit=200'),
      conSesion('/rest/v1/caja?select=*&order=fecha.desc,creado_en.desc&limit=1000'),
      conSesion('/rest/v1/staff?select=*&order=creado_en.asc'),
    ];
    if (yo && yo.rol === 'admin') pedidos.push(conSesion('/rest/v1/auditoria?select=*&order=en.desc&limit=100'));
    return Promise.all(pedidos).then(function (r) {
      datos.sol = r[0]; datos.lev = r[1]; datos.caja = r[2]; datos.equipo = r[3]; datos.audit = r[4] || [];
      cae = false;
    }).catch(function (e) { cae = true; if (e.status === 401 || e.status === 403) salir('Tu sesión terminó. Entra de nuevo.'); });
  }
  function latido() {
    if (!ses) return;
    if (Date.now() - ultimaActividad > INACTIVO_MS) { salir('Cerramos tu sesión por inactividad.'); return; }
    if (document.hidden) return;
    var antes = datos.sol.length, anteriorLev = datos.lev.length;
    cargar().then(function () {
      var frescas = datos.sol.filter(function (s) { return vistos && !vistos.has(s.id); });
      if (frescas.length) {
        frescas.forEach(function (s) { vistos.add(s.id); });
        nuevas += frescas.length;
        aviso('Nueva solicitud: ' + frescas[0].negocio + (frescas.length > 1 ? ' y ' + (frescas.length - 1) + ' más' : ''));
        document.title = '(' + nuevas + ') Panel · Bío Digital';
      }
      if (datos.lev.length > anteriorLev) aviso('Llegó un formulario completado.');
      if (!document.querySelector('.ficha') && !document.querySelector('form.mov') ) pintar(frescas.map(function (s) { return s.id; }));
      else pintarBarra();
    });
  }
  ['pointerdown', 'keydown', 'scroll'].forEach(function (e) { addEventListener(e, function () { ultimaActividad = Date.now(); }, { passive: true }); });

  // ---------- pantallas
  function pintarBarra() { var v = document.querySelector('.vivo'); if (v) v.className = 'vivo' + (cae ? ' cae' : ''); }
  function pintar(idsNuevos) {
    var sinRev = datos.lev.filter(function (l) { return !l.revisado; }).length;
    var lista = [['resumen', 'Resumen'], ['solicitudes', 'Solicitudes', datos.sol.filter(function (s) { return s.estado === 'nueva'; }).length], ['formularios', 'Formularios', sinRev], ['caja', 'Caja']];
    if (yo.rol === 'admin') lista.push(['equipo', 'Equipo'], ['actividad', 'Actividad']);
    var tabs = h('div', { class: 'pestanas', role: 'tablist' }, lista.map(function (t) {
      return h('button', { role: 'tab', 'aria-selected': String(tab === t[0]), on: { click: function () { tab = t[0]; if (tab === 'solicitudes') { nuevas = 0; document.title = 'Panel · Bío Digital'; } pintar(); } } }, t[1], t[2] ? h('span', { class: 'n', text: t[2] }) : null);
    }));
    var barra = h('header', { class: 'barra' }, logo(), h('span', { class: 'vivo' + (cae ? ' cae' : '') }, h('i'), cae ? 'Sin conexión' : 'En vivo · cada 5 s'),
      h('div', { class: 'quien' }, h('span', { text: yo.nombre + ' · ' + yo.rol }), h('button', { class: 'btn chico', type: 'button', text: 'Salir', on: { click: function () { salir(); } } })));
    var vista = { resumen: vResumen, solicitudes: function () { return vSolicitudes(idsNuevos || []); }, formularios: vFormularios, caja: vCaja, equipo: vEquipo, actividad: vActividad }[tab]();
    var y = window.scrollY;
    montar(h('div', {}, barra, tabs, h('main', {}, vista)));
    window.scrollTo(0, y);
  }

  function kpi(t, v, cls) { return h('div', { class: 'kpi ' + (cls || '') }, h('small', { text: t }), h('b', { text: v })); }
  function saldos() {
    var s = { ing: 0, gas: 0, cap: 0 };
    datos.caja.forEach(function (m) { if (m.tipo === 'ingreso') s.ing += m.monto; else if (m.tipo === 'gasto') s.gas += m.monto; else s.cap += m.monto; });
    s.saldo = s.cap + s.ing - s.gas; return s;
  }
  function vResumen() {
    var c = saldos(), cuenta = {};
    ESTADOS.forEach(function (e) { cuenta[e] = 0; });
    datos.sol.forEach(function (s) { cuenta[s.estado]++; });
    var max = Math.max.apply(null, ESTADOS.map(function (e) { return cuenta[e]; }).concat([1]));
    var enProceso = cuenta.contactada + cuenta.diagnostico + cuenta.propuesta;
    var potencial = datos.sol.filter(function (s) { return ['propuesta', 'diagnostico', 'contactada', 'nueva'].indexOf(s.estado) > -1; }).reduce(function (t, s) { return t + (s.total || 0); }, 0);
    return [
      h('div', { class: 'titulo' }, h('h2', { text: 'Resumen' })),
      h('div', { class: 'kpis' },
        kpi('Solicitudes nuevas', String(cuenta.nueva), cuenta.nueva ? 'bueno' : ''), kpi('En proceso', String(enProceso)), kpi('Clientes ganados', String(cuenta.ganada), 'bueno'),
        kpi('Saldo de caja', clp(c.saldo), c.saldo < 0 ? 'malo' : 'bueno'), kpi('Ingresos', clp(c.ing)), kpi('Gastos', clp(c.gas)), kpi('En el embudo (pedidos)', clp(potencial))),
      h('div', { class: 'dos' },
        h('div', { class: 'panel' }, h('h3', { text: 'Embudo de clientes' }), h('div', { class: 'embudo' }, ESTADOS.map(function (e) {
          var b = h('b'); b.style.width = (cuenta[e] / max * 100) + '%';
          return h('div', {}, h('span', { text: etiqueta(e) }), h('i', {}, b), h('span', { class: 'num', text: String(cuenta[e]) }));
        }))),
        h('div', { class: 'panel' }, h('h3', { text: 'Caja, últimos 6 meses' }), graficoMeses())),
      h('div', { class: 'panel' }, h('h3', { text: 'Últimas solicitudes' }), datos.sol.length ? tablaSol(datos.sol.slice(0, 5), []) : h('p', { class: 'vacio', text: 'Todavía no llega ninguna solicitud.' }))
    ];
  }
  function graficoMeses() {
    var ahora = new Date(), meses = [];
    for (var i = 5; i >= 0; i--) { var d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1); meses.push({ k: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), n: d.toLocaleDateString('es-CL', { month: 'short' }), i: 0, g: 0 }); }
    datos.caja.forEach(function (m) { var x = meses.filter(function (q) { return m.fecha.slice(0, 7) === q.k; })[0]; if (x) { if (m.tipo === 'ingreso') x.i += m.monto; else if (m.tipo === 'gasto') x.g += m.monto; } });
    var max = Math.max.apply(null, meses.map(function (m) { return Math.max(m.i, m.g); }).concat([1]));
    return h('div', { class: 'meses' }, meses.map(function (m) {
      var a = h('b', { class: 'i', title: 'Ingresos ' + clp(m.i) }), b = h('b', { class: 'g', title: 'Gastos ' + clp(m.g) });
      a.style.height = (m.i / max * 100) + '%'; b.style.height = (m.g / max * 100) + '%';
      return h('div', {}, h('div', { class: 'par' }, a, b), h('span', { text: m.n }));
    }));
  }

  function tablaSol(filas, ids) {
    return h('div', { class: 'tabla-c' }, h('table', {}, h('thead', {}, h('tr', {}, ['Fecha', 'Negocio', 'Contacto', 'Pedido', 'Total', 'Estado'].map(function (t) { return h('th', { text: t }); }))),
      h('tbody', {}, filas.map(function (s) {
        return h('tr', { class: 'abre' + (ids.indexOf(s.id) > -1 ? ' nueva-fila' : ''), tabindex: 0, on: { click: function () { fichaSol(s); }, keydown: function (e) { if (e.key === 'Enter') fichaSol(s); } } },
          h('td', { text: fecha(s.creada_en) }), h('td', {}, s.negocio, h('small', { text: s.nombre + ' · ' + s.comuna })),
          h('td', {}, s.correo, h('small', { text: s.telefono || 'sin celular' })), h('td', { text: (s.items || []).map(function (i) { return i.nombre; }).join(', ') || s.interes || '—' }),
          h('td', { class: 'num', text: s.total ? clp(s.total) : '—' }), h('td', {}, h('span', { class: 'estado ' + s.estado, text: etiqueta(s.estado) })));
      }))));
  }
  function vSolicitudes(ids) {
    var filas = datos.sol.filter(function (s) { return !filtroEstado || s.estado === filtroEstado; });
    var sel = h('select', { 'aria-label': 'Filtrar por estado', on: { change: function () { filtroEstado = sel.value; pintar(); } } }, h('option', { value: '', text: 'Todos los estados' }), ESTADOS.map(function (e) { return h('option', { value: e, text: etiqueta(e), selected: e === filtroEstado }); }));
    return [h('div', { class: 'titulo' }, h('h2', { text: 'Solicitudes' }), h('div', { class: 'filtros' }, sel,
        h('button', { class: 'btn chico', type: 'button', text: 'Nueva manual', on: { click: function () { fichaNueva(); } } }),
        h('button', { class: 'btn chico', type: 'button', text: 'Exportar CSV', on: { click: function () { csv('solicitudes', ['creada_en', 'nombre', 'negocio', 'rubro', 'comuna', 'correo', 'telefono', 'interes', 'total', 'canal', 'estado'], datos.sol); } } }))),
      filas.length ? tablaSol(filas, ids) : h('p', { class: 'vacio', text: 'No hay solicitudes con ese filtro.' })];
  }

  function cerrarFicha() { document.querySelectorAll('.ficha, .fondo').forEach(function (e) { e.remove(); }); }
  function ficha(titulo, cuerpo) {
    cerrarFicha();
    var f = h('aside', { class: 'ficha', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo }, h('div', { class: 'titulo' }, h('h2', { text: titulo }), h('button', { class: 'btn chico', type: 'button', text: 'Cerrar', on: { click: cerrarFicha } })), cuerpo);
    document.body.appendChild(h('div', { class: 'fondo', on: { click: cerrarFicha } })); document.body.appendChild(f);
    f.querySelector('button').focus();
  }
  addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarFicha(); });

  function fichaSol(s) {
    var estado = h('select', { 'aria-label': 'Estado' }, ESTADOS.map(function (e) { return h('option', { value: e, text: etiqueta(e), selected: e === s.estado }); }));
    var notas = h('textarea', { maxlength: 2000, 'aria-label': 'Notas', text: s.notas || '' });
    var asig = h('select', { 'aria-label': 'Responsable' }, h('option', { value: '', text: 'Sin responsable' }), datos.equipo.map(function (p) { return h('option', { value: p.nombre, text: p.nombre, selected: p.nombre === s.asignado_a }); }));
    var tel = digitos(s.telefono);
    var acc = h('div', { class: 'acciones' },
      tel ? h('a', { class: 'btn chico', href: 'https://wa.me/' + tel, target: '_blank', rel: 'noopener noreferrer', text: 'WhatsApp' }) : null,
      h('a', { class: 'btn chico', href: 'mailto:' + encodeURIComponent(s.correo), text: 'Correo' }),
      h('button', { class: 'btn chico', type: 'button', text: 'Registrar ingreso', on: { click: function () { cerrarFicha(); tab = 'caja'; pintar(); document.querySelector('form.mov [name=concepto]').value = 'Pago ' + s.negocio; document.querySelector('form.mov [name=solicitud_id]').value = s.id; document.querySelector('form.mov [name=monto]').value = s.total || ''; document.querySelector('form.mov [name=monto]').focus(); } } }),
      yo.rol === 'admin' ? h('button', { class: 'btn chico peligro', type: 'button', text: 'Borrar', on: { click: function () { if (confirm('¿Borrar esta solicitud? No se puede deshacer.')) conSesion('/rest/v1/solicitudes?id=eq.' + s.id, { method: 'DELETE' }).then(function () { cerrarFicha(); return cargar(); }).then(function () { pintar(); }).catch(function (e) { aviso(e.message, true); }); } } }) : null);
    var guardarBtn = h('button', { class: 'btn main', type: 'button', text: 'Guardar cambios', on: { click: function () {
      conSesion('/rest/v1/solicitudes?id=eq.' + s.id, { method: 'PATCH', prefer: 'return=minimal', body: { estado: estado.value, notas: notas.value.trim() || null, asignado_a: asig.value || null } })
        .then(function () { aviso('Guardado.'); cerrarFicha(); return cargar(); }).then(function () { pintar(); }).catch(function (e) { aviso(e.message, true); });
    } } });
    var items = (s.items || []).map(function (i) { return i.nombre + (i.precio != null ? ' (' + clp(i.precio) + ')' : ' (a cotizar)'); }).join(' · ');
    ficha(s.negocio, h('div', { style: null }, h('dl', {},
      h('dt', { text: 'Recibida' }), h('dd', { text: fecha(s.creada_en) + ' · por ' + s.canal }), h('dt', { text: 'Contacto' }), h('dd', { text: s.nombre }),
      h('dt', { text: 'Correo' }), h('dd', { text: s.correo }), h('dt', { text: 'Celular' }), h('dd', { text: s.telefono || '—' }),
      h('dt', { text: 'Rubro' }), h('dd', { text: s.rubro }), h('dt', { text: 'Comuna' }), h('dd', { text: s.comuna }),
      h('dt', { text: 'Pedido' }), h('dd', { text: items || s.interes || 'Solo diagnóstico' }), h('dt', { text: 'Total' }), h('dd', { class: 'num', text: s.total ? clp(s.total) : '—' }),
      h('dt', { text: 'Primeros 5' }), h('dd', { text: s.primeros5 ? 'Sí, pidió el precio de lanzamiento' : 'No' })),
      h('label', {}, 'Estado', estado), h('label', {}, 'Responsable', asig), h('label', {}, 'Notas internas', notas), h('div', { class: 'acciones' }, guardarBtn), acc));
  }
  function fichaNueva() {
    var f = {}; var campos = [['nombre', 'Nombre', 'text'], ['negocio', 'Negocio', 'text'], ['correo', 'Correo', 'email'], ['telefono', 'Celular (+56 9 1234 5678)', 'tel']];
    var cont = h('form', { novalidate: true });
    campos.forEach(function (c) { f[c[0]] = h('input', { name: c[0], type: c[2], maxlength: 80 }); cont.appendChild(h('label', {}, c[1], f[c[0]])); });
    f.rubro = h('select', {}, RUBROS.map(function (r) { return h('option', { text: r }); })); f.comuna = h('select', {}, COMUNAS.map(function (r) { return h('option', { text: r }); }));
    cont.appendChild(h('label', {}, 'Rubro', f.rubro)); cont.appendChild(h('label', {}, 'Comuna', f.comuna));
    var err = h('p', { class: 'error', role: 'alert' }); cont.appendChild(err);
    cont.appendChild(h('button', { class: 'btn main', type: 'submit', text: 'Crear solicitud' }));
    cont.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var tel = digitos(f.telefono.value); tel = tel ? '+56 9 ' + tel.slice(-8, -4) + ' ' + tel.slice(-4) : null;
      var fila = { nombre: f.nombre.value.trim(), negocio: f.negocio.value.trim(), correo: f.correo.value.trim().toLowerCase(), telefono: tel, rubro: f.rubro.value, comuna: f.comuna.value, canal: 'manual', items: [], total: 0 };
      conSesion('/rest/v1/solicitudes', { method: 'POST', prefer: 'return=minimal', body: fila }).then(function () { cerrarFicha(); return cargar(); }).then(function () { vistos = new Set(datos.sol.map(function (s) { return s.id; })); pintar(); })
        .catch(function () { err.textContent = 'Revisa los datos: nombre y negocio de 2 a 60 caracteres, correo válido y celular chileno.'; });
    });
    ficha('Nueva solicitud manual', cont);
  }

  function vFormularios() {
    return [h('div', { class: 'titulo' }, h('h2', { text: 'Formularios completados' })),
      datos.lev.length ? h('div', { class: 'tabla-c' }, h('table', {}, h('thead', {}, h('tr', {}, ['Fecha', 'Tipo', 'Negocio', 'Contacto', 'Estado'].map(function (t) { return h('th', { text: t }); }))),
        h('tbody', {}, datos.lev.map(function (l) {
          return h('tr', { class: 'abre', tabindex: 0, on: { click: function () { fichaLev(l); }, keydown: function (e) { if (e.key === 'Enter') fichaLev(l); } } },
            h('td', { text: fecha(l.creada_en) }), h('td', { text: tipoForm(l) }), h('td', { text: l.negocio }), h('td', { text: l.contacto || '—' }), h('td', {}, h('span', { class: 'estado ' + (l.revisado ? 'ganada' : 'nueva'), text: l.revisado ? 'Revisado' : 'Sin revisar' })));
        })))) : h('p', { class: 'vacio', text: 'Todavía no llega ningún formulario. Mándale a tus clientes el link de formulario.html (página web) o formulario-menu.html (menú digital).' })];
  }
  function tipoForm(l) { return l.tipo === 'menu' ? 'Menú digital' : 'Página web'; }
  function fichaLev(l) {
    var pre = h('pre', { text: 'Cargando…' });
    conSesion('/rest/v1/levantamientos?select=texto&id=eq.' + l.id).then(function (r) { pre.textContent = (r[0] && r[0].texto) || 'Sin texto.'; }).catch(function () { pre.textContent = 'No se pudo cargar.'; });
    var notas = h('textarea', { maxlength: 2000, 'aria-label': 'Notas', text: l.notas || '' });
    var rev = h('button', { class: 'btn main', type: 'button', text: l.revisado ? 'Marcar sin revisar' : 'Marcar como revisado', on: { click: function () {
      conSesion('/rest/v1/levantamientos?id=eq.' + l.id, { method: 'PATCH', prefer: 'return=minimal', body: { revisado: !l.revisado, notas: notas.value.trim() || null } }).then(function () { cerrarFicha(); return cargar(); }).then(function () { pintar(); }).catch(function (e) { aviso(e.message, true); });
    } } });
    var copiar = h('button', { class: 'btn chico', type: 'button', text: 'Copiar respuestas', on: { click: function () { navigator.clipboard && navigator.clipboard.writeText(pre.textContent).then(function () { aviso('Copiado.'); }); } } });
    ficha(l.negocio, h('div', {}, h('dl', {}, h('dt', { text: 'Tipo' }), h('dd', { text: tipoForm(l) }), h('dt', { text: 'Recibido' }), h('dd', { text: fecha(l.creada_en) }), h('dt', { text: 'Contacto' }), h('dd', { text: l.contacto || '—' })), pre, h('label', {}, 'Notas internas', notas), h('div', { class: 'acciones' }, rev, copiar)));
  }

  function vCaja() {
    var c = saldos();
    var meses = Array.from(new Set(datos.caja.map(function (m) { return m.fecha.slice(0, 7); })));
    var mesSel = h('select', { 'aria-label': 'Mes', on: { change: function () { filtroMes = mesSel.value; pintar(); } } }, h('option', { value: '', text: 'Todos los meses' }), meses.map(function (m) { return h('option', { value: m, text: m, selected: m === filtroMes }); }));
    var filas = datos.caja.filter(function (m) { return !filtroMes || m.fecha.slice(0, 7) === filtroMes; });
    var f = { fecha: h('input', { type: 'date', name: 'fecha', required: true, value: new Date().toISOString().slice(0, 10) }), tipo: h('select', { name: 'tipo' }, [['ingreso', 'Ingreso'], ['gasto', 'Gasto'], ['capital', 'Capital aportado']].map(function (t) { return h('option', { value: t[0], text: t[1] }); })),
      concepto: h('input', { name: 'concepto', maxlength: 120, required: true, placeholder: 'Ej.: Pago página web Panadería' }), categoria: h('input', { name: 'categoria', maxlength: 40, placeholder: 'Ej.: dominios, impresión' }),
      monto: h('input', { name: 'monto', type: 'number', min: 1, max: 100000000, step: 1, required: true }), medio: h('select', { name: 'medio' }, h('option', { value: '', text: 'Medio' }), MEDIOS.map(function (m) { return h('option', { value: m, text: etiqueta(m) }); })),
      sol: h('select', { name: 'solicitud_id' }, h('option', { value: '', text: 'Sin cliente asociado' }), datos.sol.map(function (s) { return h('option', { value: s.id, text: s.negocio }); })) };
    var err = h('p', { class: 'error', role: 'alert' });
    var form = h('form', { class: 'mov form-fila', novalidate: true, on: { submit: function (ev) {
      ev.preventDefault(); err.textContent = '';
      var monto = Number(f.monto.value);
      if (!f.fecha.value || f.concepto.value.trim().length < 2 || !Number.isInteger(monto) || monto < 1) { err.textContent = 'Completa fecha, concepto (mínimo 2 letras) y un monto entero mayor a 0.'; return; }
      conSesion('/rest/v1/caja', { method: 'POST', prefer: 'return=minimal', body: { fecha: f.fecha.value, tipo: f.tipo.value, concepto: f.concepto.value.trim(), categoria: f.categoria.value.trim() || 'otros', monto: monto, medio: f.medio.value || null, solicitud_id: f.sol.value || null } })
        .then(function () { return cargar(); }).then(function () { pintar(); aviso('Movimiento registrado.'); }).catch(function (e) { err.textContent = 'No se pudo guardar: ' + e.message; });
    } } },
      h('label', {}, 'Fecha', f.fecha), h('label', {}, 'Tipo', f.tipo), h('label', {}, 'Concepto', f.concepto), h('label', {}, 'Categoría', f.categoria), h('label', {}, 'Monto (CLP)', f.monto), h('label', {}, 'Medio', f.medio), h('label', {}, 'Cliente', f.sol), h('button', { class: 'btn main', type: 'submit', text: 'Registrar' }));
    return [h('div', { class: 'titulo' }, h('h2', { text: 'Caja' }), h('div', { class: 'filtros' }, mesSel, h('button', { class: 'btn chico', type: 'button', text: 'Exportar CSV', on: { click: function () { csv('caja', ['fecha', 'tipo', 'concepto', 'categoria', 'monto', 'medio', 'creado_por'], datos.caja); } } }))),
      h('div', { class: 'kpis' }, kpi('Saldo', clp(c.saldo), c.saldo < 0 ? 'malo' : 'bueno'), kpi('Capital aportado', clp(c.cap)), kpi('Ingresos', clp(c.ing), 'bueno'), kpi('Gastos', clp(c.gas), 'malo')),
      h('div', { class: 'panel' }, h('h3', { text: 'Registrar movimiento' }), form, err),
      filas.length ? h('div', { class: 'tabla-c' }, h('table', {}, h('thead', {}, h('tr', {}, ['Fecha', 'Concepto', 'Categoría', 'Monto', 'Por', ''].map(function (t) { return h('th', { text: t }); }))),
        h('tbody', {}, filas.map(function (m) {
          return h('tr', {}, h('td', { text: dia(m.fecha) }), h('td', {}, m.concepto, h('small', { text: m.medio ? etiqueta(m.medio) : '' })), h('td', { text: m.categoria }),
            h('td', { class: 'num', style: null, text: (m.tipo === 'gasto' ? '− ' : '+ ') + clp(m.monto) }), h('td', { text: m.creado_por.split('@')[0] }),
            h('td', {}, yo.rol === 'admin' ? h('button', { class: 'btn chico peligro', type: 'button', text: 'Borrar', on: { click: function () { if (confirm('¿Borrar este movimiento?')) conSesion('/rest/v1/caja?id=eq.' + m.id, { method: 'DELETE' }).then(cargar).then(function () { pintar(); }).catch(function (e) { aviso(e.message, true); }); } } }) : null));
        })))) : h('p', { class: 'vacio', text: 'Sin movimientos todavía. Registra el capital semilla como "Capital aportado".' })];
  }

  function vEquipo() {
    var f = { email: h('input', { type: 'email', maxlength: 80, required: true }), nombre: h('input', { maxlength: 60, required: true }), rol: h('select', {}, h('option', { value: 'equipo', text: 'Equipo' }), h('option', { value: 'admin', text: 'Administrador' })) };
    var err = h('p', { class: 'error', role: 'alert' });
    var form = h('form', { class: 'form-fila', novalidate: true, on: { submit: function (ev) {
      ev.preventDefault(); err.textContent = '';
      conSesion('/rest/v1/staff', { method: 'POST', prefer: 'return=minimal', body: { email: f.email.value.trim().toLowerCase(), nombre: f.nombre.value.trim(), rol: f.rol.value } }).then(cargar).then(function () { pintar(); aviso('Agregado. Debe crear su cuenta en la pantalla de acceso con ese correo.'); }).catch(function () { err.textContent = 'Revisa el correo y el nombre (2 a 60 letras).'; });
    } } }, h('label', {}, 'Correo', f.email), h('label', {}, 'Nombre', f.nombre), h('label', {}, 'Rol', f.rol), h('button', { class: 'btn main', type: 'submit', text: 'Autorizar' }));
    return [h('div', { class: 'titulo' }, h('h2', { text: 'Equipo autorizado' })),
      h('div', { class: 'panel' }, h('h3', { text: 'Autorizar a un integrante' }), h('p', { class: 'suave', text: 'Escribe su correo. Luego esa persona entra al panel, presiona "Crear mi cuenta", confirma su correo y activa su app de autenticación.' }), form, err),
      h('div', { class: 'tabla-c' }, h('table', {}, h('thead', {}, h('tr', {}, ['Nombre', 'Correo', 'Rol', ''].map(function (t) { return h('th', { text: t }); }))),
        h('tbody', {}, datos.equipo.map(function (p) {
          return h('tr', {}, h('td', { text: p.nombre }), h('td', { text: p.email }), h('td', { text: p.rol }),
            h('td', {}, p.email !== yo.email ? h('button', { class: 'btn chico peligro', type: 'button', text: 'Quitar acceso', on: { click: function () { if (confirm('¿Quitar el acceso de ' + p.nombre + '?')) conSesion('/rest/v1/staff?email=eq.' + encodeURIComponent(p.email), { method: 'DELETE' }).then(cargar).then(function () { pintar(); }).catch(function (e) { aviso(e.message, true); }); } } }) : null));
        }))))];
  }
  function vActividad() {
    return [h('div', { class: 'titulo' }, h('h2', { text: 'Actividad del equipo' })),
      datos.audit.length ? h('div', { class: 'tabla-c' }, h('table', {}, h('thead', {}, h('tr', {}, ['Cuándo', 'Quién', 'Acción', 'Dónde'].map(function (t) { return h('th', { text: t }); }))),
        h('tbody', {}, datos.audit.map(function (a) { return h('tr', {}, h('td', { text: fecha(a.en) }), h('td', { text: a.usuario || '—' }), h('td', { text: a.accion === 'UPDATE' ? 'Modificó' : 'Borró' }), h('td', { text: a.tabla })); })))) : h('p', { class: 'vacio', text: 'Aún no hay cambios registrados.' })];
  }

  function csv(nombre, cols, filas) {
    var celda = function (v) { v = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };   // evita fórmulas maliciosas en Excel
    var txt = '﻿' + cols.join(',') + '\n' + filas.map(function (f) { return cols.map(function (c) { return celda(f[c]); }).join(','); }).join('\n');
    var a = h('a', { href: URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' })), download: nombre + '-' + new Date().toISOString().slice(0, 10) + '.csv' });
    document.body.appendChild(a); a.click(); a.remove();
  }

  // ---------- inicio: si la pestaña ya tenía sesión, se renueva; si no, pantalla de acceso
  var guardada = null; try { guardada = JSON.parse(sessionStorage.getItem(SESION)); } catch (e) {}
  if (guardada && guardada.refresh) {
    ses = { refresh: guardada.refresh, email: guardada.email, access: '', exp: 0 };
    renovar().then(siguiente).catch(function () { salir(); });
  } else pantallaLogin();
})();
