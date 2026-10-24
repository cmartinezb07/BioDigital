// Sistema de pedidos del restaurante (mesa, retiro y delivery): datos, estados, tiempos estimados, modificación y ruta.
// Lo usan la carta (pedir.js), el pago (pagar.js), el seguimiento (pedido/), el historial del cliente (mis-pedidos/), la cocina,
// el repartidor y el panel del dueño. Todos trabajan sobre los MISMOS pedidos, guardados en la nube (_compartido/nube.js).
//
// Reglas (las valida la base de datos, no solo la pantalla):
//  · Un pedido nace "recibido" (Nuevo). Mientras esté así, el cliente lo puede modificar: se actualiza el MISMO pedido (mismo id),
//    se guarda la versión anterior y se recalcula el total. Una vez aceptado ya no se puede tocar.
//  · Estados: recibido → aceptado → preparación → listo → (entregado | en camino → entregado). Nadie puede saltarse pasos.
//  · Cocina y dueño aceptan, preparan y entregan en mesa/retiro; el repartidor toma y entrega los delivery. Nada avanza solo.
//  · Cada línea guarda el nombre y el precio con que se pidió: cambiar la carta después no cambia los pedidos ya hechos.
//  · Un solo pedido Nuevo por sesión: lo que el cliente agregue mientras está pendiente se suma a ese pedido.
(function () {
  'use strict';
  var R = window.RESTAURANTE || { negocio: 'fogon', nombre: 'Restaurante', pistas: {} };
  var NEG = R.negocio, COL = 'pedidos';
  var CONFIG = {
    negocio: R.nombre,
    local: { lat: -36.8270, lng: -73.0503, dir: '' },
    mesas: 12, minimoDelivery: 8000,
    prepBase: 8, prepPorItem: 2, prepMax: 45,   // minutos; si el plato trae su propio tiempo (prep), se usa ese
    kmh: 22,                                     // velocidad media del reparto en ciudad (supuesto)
    pistas: R.pistas || {},
    comunas: {}
  };
  // Los datos del local (comunas y envíos, mesas, mínimo) vienen de la carta publicada por el dueño
  function configurar(c) {
    if (!c) return;
    ['mesas', 'minimoDelivery', 'prepBase', 'prepPorItem', 'prepMax', 'kmh'].forEach(function (k) { if (c[k] != null) CONFIG[k] = c[k]; });
    if (c.local) CONFIG.local = Object.assign({}, CONFIG.local, c.local);
    if (c.comunas) CONFIG.comunas = c.comunas;
  }
  // Estados con su color. El nombre y el texto cambian según cómo se pidió: en la mesa, para retirar o con delivery.
  var ESTADOS = {
    recibido: { color: '#3b82f6', nombre: 'Recibido', desc: 'Esperando que el local lo acepte. Mientras tanto puedes modificar tu pedido.' },
    aceptado: { color: '#14b8a6', nombre: 'Aceptado', desc: 'El local aceptó tu pedido: ya no se puede modificar. Pronto empieza a prepararse.' },
    preparacion: { color: '#f59e0b', nombre: 'En preparación', desc: 'Tu pedido está en el fuego.' },
    listo: { color: '#22c55e', nombre: { mesa: 'Listo: va a tu mesa', retiro: 'Listo para retirar', delivery: 'Listo, esperando al repartidor' }, desc: { mesa: 'Un garzón te lo lleva a la mesa ahora.', retiro: 'Ya puedes retirarlo en el mesón. Muestra tu número de pedido.', delivery: 'El repartidor lo toma en unos minutos.' } },
    camino: { color: '#a855f7', nombre: 'En camino', desc: 'El repartidor va hacia tu dirección.' },
    entregado: { color: '#cf9b4a', nombre: { mesa: 'Servido', retiro: 'Retirado', delivery: 'Entregado' }, desc: '¡Buen provecho!' },
    cancelado: { color: '#ef4444', nombre: 'Cancelado', desc: 'El local no pudo aceptar tu pedido.' }
  };
  var FLUJO = {
    mesa: ['recibido', 'aceptado', 'preparacion', 'listo', 'entregado'],
    retiro: ['recibido', 'aceptado', 'preparacion', 'listo', 'entregado'],
    delivery: ['recibido', 'aceptado', 'preparacion', 'listo', 'camino', 'entregado']
  };
  var ACTIVOS = ['recibido', 'aceptado', 'preparacion', 'listo', 'camino'];
  // Mensajes claros para los errores que devuelve la base
  var MENSAJES = {
    no_modificable: 'El local ya aceptó tu pedido: ya no se puede modificar.',
    terminal: 'Este pedido ya terminó y no se puede modificar.',
    conflicto: 'Tu pedido cambió mientras lo editabas. Ábrelo de nuevo para ver la última versión.',
    pedido_activo: 'Ya tienes un pedido pendiente. Agrega tus productos a ese pedido con "Modificar mi pedido".',
    plato_inexistente: 'Un producto de tu pedido ya no está en la carta. Quítalo para continuar.',
    items_invalidos: 'Tu pedido no tiene productos válidos.',
    cantidad_invalida: 'Una cantidad no es válida (de 1 a 30).',
    tipo_invalido: 'Elige cómo quieres tu pedido.',
    asignado_a_otro: 'Otro repartidor ya tomó este pedido.',
    'sin permiso': 'No tienes permiso para este cambio.',
    opinion_invalida: 'Elige de 1 a 5 estrellas.'
  };
  function parseError(e) {
    var raw = (e && (e.codigo || e.message)) || String(e || ''), partes = raw.split(':'), cod = partes[0], arg = partes.slice(1).join(':');
    var msg = MENSAJES[cod];
    if (!msg) {
      if (cod === 'precio_cambio') msg = 'El precio de "' + arg + '" cambió en la carta. Revisa tu pedido y vuelve a intentar.';
      else if (cod === 'plato_agotado') msg = '"' + arg + '" se agotó. Quítalo del pedido para continuar.';
      else if (cod === 'opcion_invalida') msg = 'Elige las opciones de "' + arg + '".';
      else if (cod === 'minimo_delivery') msg = 'El pedido mínimo para delivery es $' + Math.round(+arg || 0).toLocaleString('es-CL') + '.';
      else if (cod === 'falta') msg = { nombre: 'Escribe tu nombre.', telefono: 'Escribe un celular válido: 9 y 8 dígitos.', mesa: 'Elige el número de tu mesa.', direccion: 'Escribe la dirección de entrega.', comuna: 'Elige tu comuna.' }[arg] || 'Falta un dato obligatorio.';
      else if (cod === 'transicion_invalida') msg = 'Ese paso ya no es posible: el pedido cambió de estado. Se actualizó la pantalla.';
      else msg = 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.';
    }
    return { codigo: cod, arg: arg, mensaje: msg };
  }
  function fallo(e) { var x = parseError(e), er = new Error(x.mensaje); er.codigo = x.codigo; er.arg = x.arg; return er; }

  // ---------- Estado en memoria (espejo de la nube) ----------
  var cache = {}, oyentes = [], vis = [], escribiendo = {}, promesas = {}, conectado = true, listoPrimera = false, esperaPrimera = [];
  function loc(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function guardarLoc(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var mis = loc('fogon-mis-' + NEG, loc('fogon-mis', []));   // pedidos hechos desde este equipo (para volver a verlos)
  function avisar(tipo, id, extra) { var m = { tipo: tipo, id: id, t: Date.now() }; if (extra) Object.keys(extra).forEach(function (k) { m[k] = extra[k]; }); oyentes.forEach(function (f) { try { f(m); } catch (e) {} }); }
  function pinEquipo() { return Nube.pin(NEG); }
  // Una "sesión de compra" por equipo: mientras tenga un pedido Nuevo, lo que agregue se suma a ese pedido
  function sesionId() { var s = loc('fogon-sesion-' + NEG, ''); if (!s) { s = Nube.idNuevo(); guardarLoc('fogon-sesion-' + NEG, s); } return s; }

  function todos() { return Object.keys(cache).map(function (k) { return cache[k]; }).sort(function (a, b) { return a.creado - b.creado; }); }
  function obtener(id) { return cache[id] || null; }
  function copia(x) { return JSON.parse(JSON.stringify(x)); }

  function fusionar(filas) {
    var cambio = null;
    filas.forEach(function (f) {
      if (escribiendo[f.id] && escribiendo[f.id] > Date.now()) return;   // acabo de escribir: no piso mi cambio con una lectura vieja
      var d = f.data; if (!d) return; d.id = f.id;
      if (!cache[f.id] || Nube.canon(cache[f.id]) !== Nube.canon(d)) { cache[f.id] = d; cambio = cambio || f.id; }
    });
    if (cambio) avisar('cambio', cambio);
  }
  var poll = null, pollVis = null, extras = [];
  function conectar() {
    if (poll) return;
    var avisoConexion = function (ok) { if (ok !== conectado) { conectado = ok; avisar('conexion', null, { ok: ok }); } if (ok && !listoPrimera) { listoPrimera = true; esperaPrimera.forEach(function (f) { f(); }); esperaPrimera = []; } };
    poll = Nube.sondear(NEG, COL, { pin: pinEquipo, ids: function () { return mis.concat(extras); }, soloSiHayIds: true, cada: 2500, alConectar: avisoConexion }, function (r) { fusionar(r.filas); });
    pollVis = Nube.sondear(NEG, 'visitas', { pin: function () { return pinEquipo(); }, soloSiHayIds: true, cada: 6000 }, function (r) {
      if (!r.staff) return;
      r.filas.forEach(function (f) { if (f.data && !vis.some(function (v) { return v.id === f.id; })) { f.data.id = f.id; vis.push(f.data); } });
      avisar('visita');
    });
  }
  function seguir(id) { if (id && extras.indexOf(id) < 0) extras.push(id); if (poll) poll.ya(); }
  // Promesa que se cumple cuando ya se leyó la nube por primera vez (o falla a los 9 s: sin conexión)
  function esperar() { return new Promise(function (ok, mal) { if (listoPrimera) return ok(); esperaPrimera.push(ok); setTimeout(function () { if (!listoPrimera) mal(new Error('sin conexión')); }, 9000); }); }
  // Al entrar el equipo con su PIN, se vuelve a leer todo desde cero
  function entrarEquipo() { if (poll) poll.reiniciar(); if (pollVis) pollVis.reiniciar(); }

  // Lee un pedido propio (por su código secreto) y adopta la versión que dejó el servidor
  function traer(id) {
    return Nube.leer(NEG, COL, { ids: [id] }).then(function (r) {
      var f = (r.mios || []).filter(function (x) { return x.id === id; })[0];
      if (f && f.data) { f.data.id = id; delete escribiendo[id]; cache[id] = f.data; avisar('cambio', id); }
      return cache[id] || null;
    });
  }
  function enviar(id, parche, modo) {
    if (cache[id] && cache[id].soloLocal) return Promise.resolve();
    escribiendo[id] = Date.now() + 3500;
    var pin = pinEquipo();
    var pr = Nube.cola(COL + id, function () { return Nube.escribir(NEG, COL, id, parche, { pin: pin, modo: modo || 'parchar' }); }).then(function () { escribiendo[id] = Date.now() + 1500; if (poll) poll.ya(); })
      .catch(function (e) {
        delete escribiendo[id];
        var x = parseError(e);
        avisar('error', id, { mensaje: x.mensaje, codigo: x.codigo });
        if (pin) entrarEquipo(); else traer(id).catch(function () {});   // se vuelve a la versión real del servidor
        throw e;
      });
    promesas[id] = pr.catch(function () {});
    return pr;
  }
  // Se cumple cuando todos los cambios pendientes ya llegaron a la nube (antes de cambiar de página)
  function guardado() { return Promise.all(Object.keys(promesas).map(function (k) { return promesas[k]; })); }
  function actualizar(id, fn) {
    var p = cache[id]; if (!p) return null;
    var antes = copia(p); fn(p);
    var parche = {}; Object.keys(p).forEach(function (k) { if (Nube.canon(p[k]) !== Nube.canon(antes[k])) parche[k] = p[k]; });
    if (!Object.keys(parche).length) return p;
    avisar('cambio', id); enviar(id, parche).catch(function () {});
    return p;
  }
  function nuevoId() { return Nube.idNuevo(); }
  function codigo() { return String(100 + Math.floor(Math.random() * 900)); }

  // Crea el pedido y lo manda a la nube; devuelve una promesa con el pedido tal como lo dejó el servidor (totales y versión incluidos).
  // Si el cliente toca "Enviar" dos veces, el id es el mismo (d.id): no se duplica.
  function crear(d) {
    var cant = d.items.reduce(function (t, i) { return t + i.cant; }, 0);
    var subtotal = d.items.reduce(function (t, i) { return t + i.precio * i.cant; }, 0);
    var com = d.tipo === 'delivery' ? CONFIG.comunas[d.cliente.comuna] : null;
    var envio = com ? com.envio : 0;
    var id = d.id || nuevoId();
    var p = {
      id: id, codigo: codigo(), creado: Date.now(), tipo: d.tipo, mesa: d.mesa || null,
      cliente: d.cliente, items: d.items, nota: d.nota || '', subtotal: subtotal, envio: envio,
      total: subtotal + envio, pago: d.pago, referencia: d.referencia || '', invitadoPor: d.invitadoPor || '',
      estado: 'recibido', historial: [{ estado: 'recibido', t: Date.now() }], prepMin: prepEstimado(d.items, cant), escala: 1, sesion: d.soloLocal ? '' : sesionId(), rev: 1, ediciones: []
    };
    if (p.tipo === 'delivery') {
      var dest = d.cliente.lat ? { lat: d.cliente.lat, lng: d.cliente.lng } : cerca(com, d.cliente.direccion);
      p.destino = dest; p.km = +distancia(CONFIG.local, dest).toFixed(1);
    }
    if (d.soloLocal) { p.soloLocal = true; cache[p.id] = p; avisar('nuevo', p.id); return Promise.resolve(p); }
    cache[p.id] = p; if (mis.indexOf(p.id) < 0) mis.push(p.id); mis = mis.slice(-30); guardarLoc('fogon-mis-' + NEG, mis); escribiendo[p.id] = Date.now() + 5000;
    avisar('nuevo', p.id);
    return Nube.cola(COL + p.id, function () { return Nube.escribir(NEG, COL, p.id, p, { modo: 'poner' }); })
      .then(function () { if (poll) poll.ya(); return traer(p.id); })
      .catch(function (e) {
        delete cache[p.id]; delete escribiendo[p.id]; mis = mis.filter(function (x) { return x !== p.id; }); guardarLoc('fogon-mis-' + NEG, mis); avisar('cambio', p.id);
        throw fallo(e);
      });
  }
  // Modificar el pedido original (solo mientras está "Nuevo"): cambios = { items, nota, cliente, mesa, tipo }. Devuelve el pedido actualizado.
  function modificar(id, cambios) {
    var p = cache[id]; if (!p) return Promise.reject(fallo('terminal'));
    if (p.estado !== 'recibido') return Promise.reject(fallo(p.estado === 'cancelado' || p.estado === 'entregado' ? 'terminal' : 'no_modificable'));
    var parche = { baseRev: p.rev || 1 };
    ['items', 'nota', 'cliente', 'mesa', 'tipo'].forEach(function (k) { if (cambios[k] !== undefined) parche[k] = cambios[k]; });
    var tipo = parche.tipo || p.tipo, cli = parche.cliente || p.cliente;
    if (tipo === 'delivery') {
      var com = CONFIG.comunas[cli.comuna], dest = cli.lat ? { lat: cli.lat, lng: cli.lng } : (com ? cerca(com, cli.direccion) : p.destino);
      if (dest) { parche.destino = dest; parche.km = +distancia(CONFIG.local, dest).toFixed(1); }
    }
    escribiendo[id] = Date.now() + 5000;
    return Nube.cola(COL + id, function () { return Nube.escribir(NEG, COL, id, parche, {}); }).then(function () { return traer(id); }).catch(function (e) { delete escribiendo[id]; traer(id).catch(function () {}); throw fallo(e); });
  }
  // El cliente avisa que está modificando (el dueño y la cocina lo ven). Se apaga solo al guardar, cancelar o cerrar la página.
  function marcarModificando(id, v) {
    var p = cache[id]; if (!p || p.estado !== 'recibido' || p.soloLocal) return Promise.resolve();
    if (p.modificando === !!v && v !== true) return Promise.resolve();
    p.modificando = !!v; if (v) p.modificandoDesde = Date.now();
    escribiendo[id] = Date.now() + 2500;
    return Nube.cola(COL + id, function () { return Nube.escribir(NEG, COL, id, { modificando: !!v }, {}); }).catch(function () {});
  }
  function soltarModificacion(id) { var p = cache[id]; if (p && p.modificando) Nube.escribirRapido(NEG, COL, id, { modificando: false }, {}); }
  function modificandoAhora(p) { return !!(p && p.estado === 'recibido' && p.modificando && Date.now() - (p.modificandoDesde || 0) < 3 * 60 * 1000); }
  function puedeModificar(p) { return !!p && p.estado === 'recibido'; }
  // El pedido Nuevo de este equipo (si lo hay): lo que el cliente agregue se suma a ese pedido
  function pedidoPendiente() {
    var l = mis.map(function (id) { return cache[id]; }).filter(function (p) { return p && p.estado === 'recibido' && !p.soloLocal; });
    return l.sort(function (a, b) { return b.creado - a.creado; })[0] || null;
  }
  function misPedidos() { return mis.map(function (id) { return cache[id]; }).filter(Boolean).sort(function (a, b) { return b.creado - a.creado; }); }

  // Tiempo estimado de preparación: el del plato que más demora, más 2 min por cada otro plato; la cocina lo puede ajustar
  function prepEstimado(items, cant) {
    var mayor = Math.max.apply(null, items.map(function (i) { return i.prep || 0; }).concat([0]));
    if (!mayor) return Math.min(CONFIG.prepMax, CONFIG.prepBase + CONFIG.prepPorItem * cant);
    return Math.min(CONFIG.prepMax, mayor + CONFIG.prepPorItem * Math.max(0, cant - 1));
  }
  // Sin la ubicación exacta, se toma un punto cerca del centro de la comuna (la dirección escrita se usa solo para variarlo).
  function cerca(com, dir) {
    if (!com) return { lat: CONFIG.local.lat, lng: CONFIG.local.lng };
    var h = 0; String(dir || '').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) | 0; });
    return { lat: com.lat + ((h % 100) / 100) * 0.008, lng: com.lng + (((h >> 8) % 100) / 100) * 0.008 };
  }
  function cambiar(id, estado, extra) {
    return actualizar(id, function (p) {
      if (p.estado === estado) return;
      p.estado = estado; p.historial = (p.historial || []).concat([{ estado: estado, t: Date.now() }]);
      if (extra) Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    });
  }
  function siguiente(p) { var f = FLUJO[p.tipo], i = f.indexOf(p.estado); return i > -1 && i < f.length - 1 ? f[i + 1] : null; }
  function ubicar(id, lat, lng) { return actualizar(id, function (p) { p.repartidor = Object.assign({}, p.repartidor, { lat: lat, lng: lng, t: Date.now() }); }); }
  function opinar(id, op) { return actualizar(id, function (p) { op.t = Date.now(); p.opinion = op; }); }
  function marcarPagado(id, v, metodo) { return actualizar(id, function (p) { p.pago = Object.assign({}, p.pago, { pagado: v !== false }); if (metodo) p.pago.metodo = metodo; if (v !== false) p.pago.cuando = Date.now(); }); }
  // Acciones del equipo
  function aceptar(id, prepMin) { return cambiar(id, 'aceptado', prepMin ? { prepMin: prepMin } : null); }
  function rechazar(id, motivo) { return cambiar(id, 'cancelado', { motivo: String(motivo || '').slice(0, 120) }); }
  function asignar(id, nombre) { return actualizar(id, function (p) { p.asignadoA = nombre || null; }); }
  function responderOpinion(id, texto) { return actualizar(id, function (p) { if (p.opinion) p.opinion = Object.assign({}, p.opinion, { respuesta: { texto: String(texto || '').slice(0, 300) } }); }); }
  // El repartidor toma un delivery listo: la base lo asigna a él solo si está libre (dos repartidores a la vez: gana uno)
  function tomarEntrega(id) {
    var p = cache[id]; if (!p) return Promise.reject(fallo('transicion_invalida'));
    escribiendo[id] = Date.now() + 3500;
    var pin = pinEquipo();
    return Nube.cola(COL + id, function () { return Nube.escribir(NEG, COL, id, { estado: 'camino', tomar: true, salida: Date.now() }, { pin: pin }); })
      .then(function () { escribiendo[id] = Date.now() + 1500; if (poll) poll.ya(); })
      .catch(function (e) { delete escribiendo[id]; entrarEquipo(); throw fallo(e); });
  }

  function cuando(p, estado) { var h = (p.historial || []).filter(function (x) { return x.estado === estado; }).pop(); return h ? h.t : null; }
  function viajeMin(p) { return p.km ? Math.round(p.km / CONFIG.kmh * 60 + 4) : 0; }
  // Hora estimada de "listo" y de llegada, recalculadas con lo que ya pasó. Antes de que el local acepte no hay estimación.
  function eta(p) {
    var min = 60000;
    var inicioPrep = cuando(p, 'preparacion') || cuando(p, 'aceptado') || cuando(p, 'recibido');
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
    var Rt = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lng - a.lng) * r;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * Rt * Math.asin(Math.sqrt(x));
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
  function largoRuta(r) { var t = 0; for (var i = 1; i < r.length; i++) t += distancia({ lat: r[i - 1][0], lng: r[i - 1][1] }, { lat: r[i][0], lng: r[i][1] }); return t; }
  // Guarda la ruta por calles en el pedido (la dibuja el mapa del cliente y del repartidor)
  function fijarRuta(id) {
    var p = cache[id]; if (!p || p.ruta || !p.destino) return Promise.resolve();
    return ruta(CONFIG.local, p.destino).then(function (r) { actualizar(id, function (z) { if (z.ruta) return; z.ruta = r; z.rutaKm = +largoRuta(r).toFixed(2); z.km = z.rutaKm; }); });
  }
  // Prueba sin moto: recorre la ruta a velocidad de ciudad (por `escala`), publicando la posición cada 3 s. Devuelve cómo detenerlo.
  function recorrer(id, puntos, escala) {
    var tramos = [], total = 0;
    for (var i = 1; i < puntos.length; i++) { var d = distancia({ lat: puntos[i - 1][0], lng: puntos[i - 1][1] }, { lat: puntos[i][0], lng: puntos[i][1] }); tramos.push(d); total += d; }
    var ms = total / CONFIG.kmh * 3600000 / (escala || 1), t0 = Date.now();
    var timer = setInterval(function () {
      var hecho = Math.min(1, (Date.now() - t0) / ms) * total, acc = 0, k = 0;
      while (k < tramos.length && acc + tramos[k] < hecho) { acc += tramos[k]; k++; }
      var f = k < tramos.length && tramos[k] ? (hecho - acc) / tramos[k] : 1, a = puntos[Math.min(k, puntos.length - 1)], b = puntos[Math.min(k + 1, puntos.length - 1)];
      ubicar(id, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
      if (hecho >= total) clearInterval(timer);
    }, 3000);
    return function () { clearInterval(timer); };
  }

  // Visitas a la carta (una por sesión), con su origen: QR de mesa, enlace de un amigo o directo.
  function visita() {
    try { if (sessionStorage.getItem('fogon-visto')) return; sessionStorage.setItem('fogon-visto', '1'); } catch (e) { return; }
    var q = new URLSearchParams(location.search);
    var origen = q.get('mesa') ? 'QR de mesa' : q.get('ref') ? 'Invitación de un cliente' : document.referrer ? 'Otro sitio' : 'Directo';
    Nube.escribir(NEG, 'visitas', nuevoId(), { t: Date.now(), origen: origen }, { modo: 'poner' }).catch(function () {});
  }
  function visitas() { return vis.slice(); }
  // Solo el dueño: empezar de cero (borra los pedidos y visitas)
  function vaciar() {
    var pin = pinEquipo();
    return Promise.all([Nube.vaciar(NEG, COL, pin), Nube.vaciar(NEG, 'visitas', pin)]).then(function () { cache = {}; vis = []; mis = []; guardarLoc('fogon-mis-' + NEG, []); avisar('cambio'); });
  }

  var clp = function (n) { return '$' + Math.round(n).toLocaleString('es-CL'); };
  var hora = function (t) { return new Date(t).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); };
  var fecha = function (t) { return new Date(t).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }); };
  function nombreEstado(p, e) { var x = ESTADOS[e || p.estado].nombre; return typeof x === 'string' ? x : x[p.tipo]; }
  function descEstado(p) { var x = ESTADOS[p.estado].desc; return typeof x === 'string' ? x : x[p.tipo]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tipoTxt(p) { return p.tipo === 'mesa' ? 'Mesa ' + p.mesa : p.tipo === 'retiro' ? 'Retiro en local' : 'Delivery'; }
  // Una línea del pedido con sus opciones y su nota, lista para mostrar
  function lineaTxt(i) { return i.cant + '× ' + i.nombre + ((i.opciones || []).length ? ' (' + i.opciones.map(function (o) { return o.opcion; }).join(', ') + ')' : ''); }
  function lineaHtml(i) { return '<b>' + i.cant + '×</b> ' + esc(i.nombre) + ((i.opciones || []).length ? ' <small>(' + i.opciones.map(function (o) { return esc(o.opcion); }).join(', ') + ')</small>' : '') + (i.nota ? '<br><small class="sis-nota">“' + esc(i.nota) + '”</small>' : ''); }

  conectar();
  window.Pedidos = {
    CONFIG: CONFIG, ESTADOS: ESTADOS, FLUJO: FLUJO, ACTIVOS: ACTIVOS, configurar: configurar, todos: todos, obtener: obtener, crear: crear, modificar: modificar, cambiar: cambiar, siguiente: siguiente,
    marcarModificando: marcarModificando, soltarModificacion: soltarModificacion, modificandoAhora: modificandoAhora, puedeModificar: puedeModificar, pedidoPendiente: pedidoPendiente,
    ubicar: ubicar, opinar: opinar, marcarPagado: marcarPagado, actualizar: actualizar, aceptar: aceptar, rechazar: rechazar, asignar: asignar, responderOpinion: responderOpinion, tomarEntrega: tomarEntrega,
    eta: eta, viajeMin: viajeMin, cuando: cuando, distancia: distancia, ruta: ruta, fijarRuta: fijarRuta, recorrer: recorrer, visita: visita, visitas: visitas, vaciar: vaciar,
    escuchar: function (f) { oyentes.push(f); }, seguir: seguir, esperar: esperar, guardado: guardado, entrarEquipo: entrarEquipo, misPedidos: misPedidos, misIds: function () { return mis.slice(); }, enLinea: function () { return conectado; },
    sesion: sesionId, parseError: parseError, refrescar: function () { if (poll) poll.ya(); },
    clp: clp, hora: hora, fecha: fecha, nombreEstado: nombreEstado, descEstado: descEstado, esc: esc, tipoTxt: tipoTxt, largoRuta: largoRuta, lineaTxt: lineaTxt, lineaHtml: lineaHtml
  };
})();
