// Sistema de pedidos del menú digital (mesa, retiro y delivery): datos, estados, tiempos estimados, ruta y avisos en vivo.
// Lo usan la carta (pedir.js), el seguimiento (pedido/), la cocina (cocina/), el repartidor (repartidor/) y el panel (panel/).
//
// DEMO: los datos viven en el navegador (localStorage) y se sincronizan al instante entre pestañas (BroadcastChannel):
// abre la carta, la cocina y el panel en pestañas distintas y todo se mueve solo. Si nadie atiende la cocina o el reparto,
// el pedido avanza solo, acelerado, para que la demostración se vea completa.
// PRODUCCIÓN: la misma interfaz (crear, cambiar, ubicar, escuchar) se conecta a una base en la nube para que el cliente,
// la cocina y el repartidor estén en equipos distintos. Ver memoria/menu-pedidos.md (costos recurrentes marcados).
(function () {
  'use strict';
  var CLAVE = 'fogon-pedidos', CLAVE_VIS = 'fogon-visitas', CLAVE_VIVO = 'fogon-vivo-';
  var CONFIG = {
    negocio: 'Fogón del Sur',
    local: { lat: -36.8270, lng: -73.0503, dir: 'Barros Arana 123, Concepción' },   // dirección de ejemplo
    mesas: 12,
    minimoDelivery: 8000,
    prepBase: 8, prepPorItem: 2, prepMax: 35,   // minutos
    kmh: 22,                                     // velocidad media del reparto en ciudad (supuesto)
    // Costo de envío por comuna (ejemplo; lo define el local). Coordenadas aproximadas del centro de cada comuna.
    comunas: {
      'Concepción': { envio: 1500, lat: -36.8201, lng: -73.0444 }, 'Talcahuano': { envio: 2500, lat: -36.7249, lng: -73.1168 },
      'Hualpén': { envio: 2200, lat: -36.7900, lng: -73.0950 }, 'San Pedro de la Paz': { envio: 2200, lat: -36.8430, lng: -73.1080 },
      'Chiguayante': { envio: 2200, lat: -36.9050, lng: -73.0250 }, 'Penco': { envio: 3000, lat: -36.7400, lng: -72.9950 },
      'Coronel': { envio: 3500, lat: -37.0300, lng: -73.1550 }, 'Hualqui': { envio: 3500, lat: -36.9750, lng: -72.9400 },
      'Lota': { envio: 4000, lat: -37.0900, lng: -73.1570 }, 'Tomé': { envio: 4000, lat: -36.6170, lng: -72.9560 }
    }
  };
  // Estados con su color. El nombre cambia según cómo se pidió.
  var ESTADOS = {
    recibido: { color: '#3b82f6', nombre: 'Recibido', desc: 'La cocina ya tiene tu pedido.' },
    preparacion: { color: '#f59e0b', nombre: 'En preparación', desc: 'Tu pedido está en el fuego.' },
    listo: { color: '#22c55e', nombre: 'Listo', desc: { mesa: 'Va camino a tu mesa.', retiro: 'Ya puedes retirarlo en el mesón.', delivery: 'Esperando al repartidor.' } },
    camino: { color: '#a855f7', nombre: 'En camino', desc: 'El repartidor va hacia tu dirección.' },
    entregado: { color: '#cf9b4a', nombre: { mesa: 'Servido', retiro: 'Retirado', delivery: 'Entregado' }, desc: '¡Buen provecho!' },
    cancelado: { color: '#ef4444', nombre: 'Cancelado', desc: 'El local canceló el pedido. Te contactarán.' }
  };
  var FLUJO = { mesa: ['recibido', 'preparacion', 'listo', 'entregado'], retiro: ['recibido', 'preparacion', 'listo', 'entregado'], delivery: ['recibido', 'preparacion', 'listo', 'camino', 'entregado'] };

  function leer(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function escribir(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var canal = null; try { canal = new BroadcastChannel('fogon'); } catch (e) {}
  var oyentes = [];
  function avisar(tipo, id) {
    var m = { tipo: tipo, id: id, t: Date.now() };
    if (canal) canal.postMessage(m);
    oyentes.forEach(function (f) { f(m); });
  }
  if (canal) canal.onmessage = function (e) { oyentes.forEach(function (f) { f(e.data); }); };
  // Si el navegador no tiene BroadcastChannel, el evento storage cumple la misma función.
  window.addEventListener('storage', function (e) { if (!canal && e.key && e.key.indexOf('fogon') === 0) oyentes.forEach(function (f) { f({ tipo: 'cambio' }); }); });

  function todos() { return leer(CLAVE, []); }
  function guardarTodos(l) { escribir(CLAVE, l.slice(-400)); }
  function obtener(id) { return todos().filter(function (p) { return p.id === id; })[0] || null; }
  function actualizar(id, fn) {
    var l = todos(), p = null;
    l.forEach(function (x) { if (x.id === id) { fn(x); p = x; } });
    if (p) { guardarTodos(l); avisar('cambio', id); }
    return p;
  }
  function nuevoId() {
    var a = new Uint8Array(8); (window.crypto || window.msCrypto).getRandomValues(a);
    return [].map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function codigo(l) { var n; do { n = String(100 + Math.floor(Math.random() * 900)); } while (l.some(function (p) { return p.codigo === n && p.estado !== 'entregado'; })); return n; }

  function crear(d) {
    var l = todos(), cant = d.items.reduce(function (t, i) { return t + i.cant; }, 0);
    var subtotal = d.items.reduce(function (t, i) { return t + i.precio * i.cant; }, 0);
    var com = d.tipo === 'delivery' ? CONFIG.comunas[d.cliente.comuna] : null;
    var p = {
      id: nuevoId(), codigo: codigo(l), creado: Date.now(), tipo: d.tipo, mesa: d.mesa || null,
      cliente: d.cliente, items: d.items, nota: d.nota || '', subtotal: subtotal, envio: com ? com.envio : 0,
      total: subtotal + (com ? com.envio : 0), pago: d.pago, referencia: d.referencia || '', invitadoPor: d.invitadoPor || '',
      estado: 'recibido', historial: [{ estado: 'recibido', t: Date.now() }],
      prepMin: Math.min(CONFIG.prepMax, CONFIG.prepBase + CONFIG.prepPorItem * cant), escala: 1, demo: !!d.demo
    };
    if (p.tipo === 'delivery') {
      var dest = d.cliente.lat ? { lat: d.cliente.lat, lng: d.cliente.lng } : cerca(com, d.cliente.direccion);
      p.destino = dest; p.km = +distancia(CONFIG.local, dest).toFixed(1);
    }
    l.push(p); guardarTodos(l); avisar('nuevo', p.id);
    return p;
  }
  // Sin la ubicación exacta, se toma un punto cerca del centro de la comuna (la dirección escrita se usa solo para variarlo).
  function cerca(com, dir) {
    var h = 0; String(dir || '').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) | 0; });
    return { lat: com.lat + ((h % 100) / 100) * 0.008, lng: com.lng + (((h >> 8) % 100) / 100) * 0.008 };
  }
  function cambiar(id, estado, extra) {
    return actualizar(id, function (p) {
      if (p.estado === estado) return;
      p.estado = estado; p.historial.push({ estado: estado, t: Date.now() });
      if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    });
  }
  function siguiente(p) { var f = FLUJO[p.tipo], i = f.indexOf(p.estado); return i > -1 && i < f.length - 1 ? f[i + 1] : null; }
  function ubicar(id, lat, lng) { return actualizar(id, function (p) { p.repartidor = p.repartidor || {}; p.repartidor.lat = lat; p.repartidor.lng = lng; p.repartidor.t = Date.now(); }); }
  function opinar(id, op) { return actualizar(id, function (p) { op.t = Date.now(); p.opinion = op; }); }
  function marcarPagado(id, v) { return actualizar(id, function (p) { p.pago.pagado = v !== false; }); }

  function cuando(p, estado) { var h = p.historial.filter(function (x) { return x.estado === estado; }).pop(); return h ? h.t : null; }
  function viajeMin(p) { return p.km ? Math.round(p.km / CONFIG.kmh * 60 + 4) : 0; }
  // Hora estimada de "listo" y de llegada, recalculadas con lo que ya pasó. En la demo acelerada, los minutos duran menos.
  function eta(p) {
    var min = 60000 / (p.escala || 1);
    var inicioPrep = cuando(p, 'preparacion') || cuando(p, 'recibido');
    var listo = cuando(p, 'listo') || Math.max(Date.now(), inicioPrep + p.prepMin * min);
    var fin = listo;
    if (p.tipo === 'delivery') {
      var sale = cuando(p, 'camino') || Math.max(listo, Date.now());
      fin = sale + viajeMin(p) * min;
      if (p.estado === 'camino' && p.repartidor && p.repartidor.lat && p.destino) {
        var resta = distancia(p.repartidor, p.destino) * 1.3;   // calles en vez de línea recta
        fin = Date.now() + Math.max(1, resta / CONFIG.kmh * 60 + 1) * min;
      }
    }
    var entregado = cuando(p, 'entregado');
    return { listo: listo, llega: entregado || fin, minutos: entregado ? 0 : Math.max(0, Math.round((fin - Date.now()) / min)) };
  }
  function distancia(a, b) {
    var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  // Ruta por calles (servicio público de demostración de OSRM). Si no responde, línea recta con puntos intermedios.
  function ruta(a, b) {
    var recta = function () { var r = []; for (var i = 0; i <= 40; i++) r.push([a.lat + (b.lat - a.lat) * i / 40, a.lng + (b.lng - a.lng) * i / 40]); return r; };
    var url = 'https://router.project-osrm.org/route/v1/driving/' + a.lng + ',' + a.lat + ';' + b.lng + ',' + b.lat + '?overview=full&geometries=geojson';
    var ctl = window.AbortController ? new AbortController() : null;
    if (ctl) setTimeout(function () { ctl.abort(); }, 5000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
      var c = j.routes && j.routes[0] && j.routes[0].geometry.coordinates;
      return c && c.length > 1 ? c.map(function (x) { return [x[1], x[0]]; }) : recta();
    }).catch(recta);
  }
  // Recorre una ruta (lista de [lat, lng]) a velocidad de ciudad, publicando la posición. Devuelve una función para detenerlo.
  function recorrer(id, puntos, escala) {
    var tramos = [], total = 0;
    for (var i = 1; i < puntos.length; i++) { var d = distancia({ lat: puntos[i - 1][0], lng: puntos[i - 1][1] }, { lat: puntos[i][0], lng: puntos[i][1] }); tramos.push(d); total += d; }
    var ms = total / CONFIG.kmh * 3600000 / (escala || 1), t0 = Date.now();
    var timer = setInterval(function () {
      var hecho = Math.min(1, (Date.now() - t0) / ms) * total, acc = 0, k = 0;
      while (k < tramos.length && acc + tramos[k] < hecho) { acc += tramos[k]; k++; }
      var f = k < tramos.length && tramos[k] ? (hecho - acc) / tramos[k] : 1, a = puntos[Math.min(k, puntos.length - 1)], b = puntos[Math.min(k + 1, puntos.length - 1)];
      ubicar(id, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
      if (hecho >= total) { clearInterval(timer); cambiar(id, 'entregado'); }
    }, 1500);
    return function () { clearInterval(timer); };
  }

  // Quién está atendiendo: la cocina y el repartidor marcan "vivo" cada pocos segundos.
  function latido(rol) { escribir(CLAVE_VIVO + rol, Date.now()); }
  function atendido(rol) { return Date.now() - leer(CLAVE_VIVO + rol, 0) < 12000; }

  // Visitas a la carta (una por sesión), con su origen: QR de mesa, enlace de un amigo o directo.
  function visita() {
    try { if (sessionStorage.getItem('fogon-visto')) return; sessionStorage.setItem('fogon-visto', '1'); } catch (e) { return; }
    var q = new URLSearchParams(location.search), l = leer(CLAVE_VIS, []);
    l.push({ t: Date.now(), origen: q.get('mesa') ? 'QR de mesa' : q.get('ref') ? 'Invitación de un cliente' : document.referrer ? 'Otro sitio' : 'Directo' });
    escribir(CLAVE_VIS, l.slice(-3000)); avisar('visita');
  }
  function visitas() { return leer(CLAVE_VIS, []); }

  // Datos de demostración para el panel: 7 días de visitas y pedidos generados al azar, marcados como demo.
  // Solo notas con estrellas: no se inventan comentarios de clientes.
  function sembrar(platos) {
    var l = todos().filter(function (p) { return !p.semilla; }), v = visitas().filter(function (x) { return !x.semilla; });
    var origenes = ['QR de mesa', 'QR de mesa', 'Directo', 'Instagram', 'Invitación de un cliente', 'Google Maps'], refs = ['Instagram', 'Pasaba por fuera', 'Me lo recomendaron', 'Google Maps', 'TikTok'];
    var tipos = ['mesa', 'mesa', 'retiro', 'delivery', 'delivery'], comunas = Object.keys(CONFIG.comunas);
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    for (var d = 6; d >= 0; d--) {
      var nVis = 40 + Math.floor(Math.random() * 50);
      for (var i = 0; i < nVis; i++) {
        var hora = Math.random() < .5 ? 13 + Math.random() * 2.5 : 20 + Math.random() * 3;
        var t = hoy.getTime() - d * 864e5 + hora * 36e5;
        if (t > Date.now()) continue;
        v.push({ t: t, origen: origenes[Math.floor(Math.random() * origenes.length)], semilla: true });
        if (Math.random() < .32) {
          var tipo = tipos[Math.floor(Math.random() * tipos.length)], items = [], n = 1 + Math.floor(Math.random() * 3);
          for (var k = 0; k < n; k++) { var pl = platos[Math.floor(Math.random() * platos.length)]; items.push({ id: pl.id, nombre: pl.nombre, precio: pl.precio, cant: 1 + Math.floor(Math.random() * 2) }); }
          var sub = items.reduce(function (s, x) { return s + x.precio * x.cant; }, 0), com = comunas[Math.floor(Math.random() * 4)];
          var envio = tipo === 'delivery' ? CONFIG.comunas[com].envio : 0, prep = 10 + Math.floor(Math.random() * 15);
          var hist = [{ estado: 'recibido', t: t + 6e4 }, { estado: 'preparacion', t: t + 2e5 }, { estado: 'listo', t: t + 2e5 + prep * 6e4 }];
          if (tipo === 'delivery') hist.push({ estado: 'camino', t: t + 3e5 + prep * 6e4 });
          hist.push({ estado: 'entregado', t: t + (tipo === 'delivery' ? 15e5 : 4e5) + prep * 6e4 });
          var cancel = Math.random() < .04;
          var p = { id: nuevoId(), codigo: String(100 + Math.floor(Math.random() * 900)), creado: t + 6e4, tipo: tipo, mesa: tipo === 'mesa' ? 1 + Math.floor(Math.random() * CONFIG.mesas) : null,
            cliente: { nombre: 'Cliente de demostración', comuna: tipo === 'delivery' ? com : '' }, items: items, subtotal: sub, envio: envio, total: sub + envio,
            pago: { metodo: Math.random() < .55 ? 'linea' : 'caja', pagado: !cancel }, referencia: refs[Math.floor(Math.random() * refs.length)],
            estado: cancel ? 'cancelado' : 'entregado', historial: cancel ? hist.slice(0, 1).concat([{ estado: 'cancelado', t: t + 3e5 }]) : hist, prepMin: prep, escala: 1, semilla: true };
          if (!cancel && Math.random() < .45) { var r = Math.random(); p.opinion = { estrellas: r < .55 ? 5 : r < .85 ? 4 : r < .95 ? 3 : 2, recomendaria: r < .8, texto: '', t: p.historial[p.historial.length - 1].t + 6e5 }; }
          l.push(p);
        }
      }
    }
    l.sort(function (a, b) { return a.creado - b.creado; });
    guardarTodos(l); escribir(CLAVE_VIS, v.sort(function (a, b) { return a.t - b.t; })); avisar('cambio');
  }
  function borrarDemo() { escribir(CLAVE, []); escribir(CLAVE_VIS, []); avisar('cambio'); }

  var clp = function (n) { return '$' + Math.round(n).toLocaleString('es-CL'); };
  var hora = function (t) { return new Date(t).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); };
  function nombreEstado(p, e) { var x = ESTADOS[e || p.estado].nombre; return typeof x === 'string' ? x : x[p.tipo]; }
  function descEstado(p) { var x = ESTADOS[p.estado].desc; return typeof x === 'string' ? x : x[p.tipo]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tipoTxt(p) { return p.tipo === 'mesa' ? 'Mesa ' + p.mesa : p.tipo === 'retiro' ? 'Retiro en local' : 'Delivery'; }

  window.Pedidos = {
    CONFIG: CONFIG, ESTADOS: ESTADOS, FLUJO: FLUJO, todos: todos, obtener: obtener, crear: crear, cambiar: cambiar, siguiente: siguiente,
    ubicar: ubicar, opinar: opinar, marcarPagado: marcarPagado, actualizar: actualizar, eta: eta, viajeMin: viajeMin, cuando: cuando,
    distancia: distancia, ruta: ruta, recorrer: recorrer, latido: latido, atendido: atendido, visita: visita, visitas: visitas,
    sembrar: sembrar, borrarDemo: borrarDemo, escuchar: function (f) { oyentes.push(f); },
    clp: clp, hora: hora, nombreEstado: nombreEstado, descEstado: descEstado, esc: esc, tipoTxt: tipoTxt
  };
})();
