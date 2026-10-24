// Motor de reservas de Bío Digital: disponibilidad en tiempo real, precios con temporadas y promociones, retención con
// vencimiento, políticas de depósito y cancelación, lista de espera, avisos automáticos, iCal (exportar e importar) y reportes.
// Cuatro modos cubren los rubros: "noches" (cabañas, hotel), "horas" (centro médico, salón), "cupos" (tours) y
// "bloques" (arriendo de espacios por hora).
//
// DEMO: los datos viven en el navegador y se sincronizan entre pestañas (BroadcastChannel): reserva en una pestaña y el
// calendario de la otra y el panel cambian al instante. PRODUCCIÓN: la misma interfaz se conecta a una base en la nube
// (ver memoria/reservas-sistema.md, con los costos recurrentes marcados).
(function () {
  'use strict';
  var V = 'bdres-v1-';
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fstr = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var fdate = function (s, min) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 0, min || 0); };
  var hoy = function () { return fstr(new Date()); };
  var sumaDias = function (s, n) { var d = fdate(s); d.setDate(d.getDate() + n); return fstr(d); };
  var difDias = function (a, b) { return Math.round((fdate(b) - fdate(a)) / 864e5); };
  var diaSem = function (s) { return fdate(s).getDay(); };
  var minH = function (h) { var p = String(h).split(':'); return +p[0] * 60 + +(p[1] || 0); };
  var hMin = function (m) { return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60); };
  var DSEM = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  var semana = function (txt) { var o = {}; DSEM.forEach(function (d) { o[d] = txt[d] || []; }); return o; };
  var LV = function (a, b) { return { lun: [[a, b]], mar: [[a, b]], mie: [[a, b]], jue: [[a, b]], vie: [[a, b]] }; };

  // ---------- Negocios de demostración (ficticios, Gran Concepción) ----------
  var NEGOCIOS = [
    { id: 'cabanas', nombre: 'Cabañas Bosque Nativo', rubro: 'Cabañas y hotel', modo: 'noches', icono: 'cabana', color: '#2f6f4e', sigla: 'BN', comuna: 'Tomé', direccion: 'Camino a Cocholgüe km 3 (ejemplo)',
      recursos: [
        { id: 'copihue', nombre: 'Cabaña Copihue', unidades: 3, capacidad: 2, precio: 45000, desc: 'Para dos, con terraza y vista al mar.', incluye: ['Cama king', 'Cocina equipada', 'Wifi', 'Estacionamiento'] },
        { id: 'araucaria', nombre: 'Cabaña Araucaria', unidades: 2, capacidad: 4, precio: 65000, desc: 'Dos dormitorios, ideal para familias.', incluye: ['2 dormitorios', 'Parrilla', 'Wifi', 'Estacionamiento'] },
        { id: 'familiar', nombre: 'Casa Familiar', unidades: 1, capacidad: 6, precio: 85000, desc: 'Tres dormitorios y tinaja caliente.', incluye: ['3 dormitorios', 'Tinaja', 'Parrilla', 'Wifi'] }],
      servicios: [{ id: 'romantica', nombre: 'Escapada romántica', precio: 25000, desc: 'Tabla de quesos, espumante y salida tardía.' }, { id: 'tinaja', nombre: 'Tinaja caliente', precio: 30000, desc: 'Una sesión de tinaja de 2 horas.' }],
      temporadas: [{ nombre: 'Temporada alta', desde: '12-15', hasta: '03-15', factor: 1.3 }], factorFinde: 1.15,
      politicas: { deposito: 30, retencionMin: 10, anticipacionHoras: 0, maxDias: 365, estadiaMin: 1, estadiaMinAlta: 2, cancelacion: [{ horas: 168, reembolso: 100 }, { horas: 48, reembolso: 50 }, { horas: 0, reembolso: 0 }], checkin: '15:00', checkout: '11:00' },
      promos: [{ codigo: 'BIENVENIDA10', tipo: 'porcentaje', valor: 10, minimo: 0, activa: true, usos: 0, usosMax: 100 }, { codigo: 'INVIERNO15', tipo: 'porcentaje', valor: 15, minimo: 100000, activa: true, usos: 0, usosMax: 50 }],
      reglas: [{ tipo: 'anticipada', dias: 30, porcentaje: 10, activa: true }, { tipo: 'estadia', noches: 5, porcentaje: 15, activa: true }, { tipo: 'ultimo', horas: 72, porcentaje: 12, activa: true }] },
    { id: 'tours', nombre: 'Biobío Aventura', rubro: 'Agencia de tours', modo: 'cupos', icono: 'tour', color: '#c2562b', sigla: 'BA', comuna: 'Concepción', direccion: 'Punto de encuentro: Plaza Independencia (ejemplo)',
      recursos: [],
      servicios: [
        { id: 'cerro', nombre: 'Caminata Cerro Caracol', precio: 15000, duracion: 180, capacidad: 12, minPersonas: 1, salidas: ['09:00', '15:00'], dias: [2, 3, 4, 5, 6, 0], desc: 'Sendero con guía y vista de la ciudad. Dificultad baja.', incluye: ['Guía', 'Snack', 'Seguro'] },
        { id: 'kayak', nombre: 'Kayak en el río Biobío', precio: 25000, duracion: 150, capacidad: 8, minPersonas: 2, salidas: ['10:00'], dias: [3, 4, 5, 6, 0], desc: 'Remada guiada. Se entrega todo el equipo.', incluye: ['Kayak y chaleco', 'Guía certificado', 'Fotos'] },
        { id: 'vino', nombre: 'Ruta del vino del Itata', precio: 45000, duracion: 480, capacidad: 14, minPersonas: 2, salidas: ['09:00'], dias: [6], desc: 'Dos viñas, almuerzo campestre y traslado.', incluye: ['Traslado', 'Degustación', 'Almuerzo'] }],
      politicas: { deposito: 50, retencionMin: 10, anticipacionHoras: 12, maxDias: 120, cancelacion: [{ horas: 48, reembolso: 100 }, { horas: 0, reembolso: 0 }] },
      promos: [{ codigo: 'AMIGOS', tipo: 'porcentaje', valor: 10, minimo: 0, activa: true, usos: 0, usosMax: 200 }],
      reglas: [{ tipo: 'grupo', personas: 6, porcentaje: 10, activa: true }, { tipo: 'anticipada', dias: 21, porcentaje: 8, activa: true }] },
    { id: 'medico', nombre: 'Centro Médico Lomas Azules', rubro: 'Centro médico', modo: 'horas', icono: 'medico', color: '#1d6fb8', sigla: 'LA', comuna: 'San Pedro de la Paz', direccion: 'Av. Ejemplo 1234, San Pedro de la Paz',
      horario: semana(Object.assign(LV('08:30', '19:00'), { sab: [['09:00', '13:00']] })), intervalo: 15, buffer: 5,
      recursos: [{ id: 'box1', nombre: 'Medicina general · Box 1', unidades: 1, servicios: ['general'] }, { id: 'box2', nombre: 'Pediatría · Box 2', unidades: 1, servicios: ['pediatria', 'general'] }, { id: 'kine', nombre: 'Kinesiología · Sala 3', unidades: 1, servicios: ['kine'] }],
      servicios: [{ id: 'general', nombre: 'Consulta medicina general', precio: 25000, duracion: 20, desc: 'Atención particular. Trae tu cédula y exámenes previos.' }, { id: 'pediatria', nombre: 'Control pediátrico', precio: 28000, duracion: 30, desc: 'Control de niño sano o morbilidad.' }, { id: 'kine', nombre: 'Sesión de kinesiología', precio: 22000, duracion: 45, desc: 'Rehabilitación musculoesquelética.' }],
      politicas: { deposito: 0, retencionMin: 10, anticipacionHoras: 2, maxDias: 60, cancelacion: [{ horas: 24, reembolso: 100 }, { horas: 0, reembolso: 0 }] },
      promos: [], reglas: [] },
    { id: 'espacios', nombre: 'Espacio Nodo', rubro: 'Arriendo de espacios', modo: 'bloques', icono: 'espacio', color: '#5b4bb7', sigla: 'EN', comuna: 'Concepción', direccion: 'Calle Ejemplo 456, Concepción',
      horario: semana(Object.assign(LV('08:00', '22:00'), { sab: [['09:00', '20:00']] })), intervalo: 60, buffer: 0,
      recursos: [{ id: 'reunion', nombre: 'Sala de reuniones', unidades: 1, capacidad: 8, precio: 8000, minHoras: 1, desc: 'Pantalla 55", pizarra y café.', incluye: ['Pantalla', 'Pizarra', 'Café'] }, { id: 'taller', nombre: 'Sala de talleres', unidades: 1, capacidad: 20, precio: 15000, minHoras: 2, desc: 'Mesas móviles y proyector.', incluye: ['Proyector', 'Mesas móviles', 'Wifi'] }, { id: 'eventos', nombre: 'Salón de eventos', unidades: 1, capacidad: 60, precio: 30000, minHoras: 3, desc: 'Para lanzamientos, cumpleaños y charlas.', incluye: ['Sonido', 'Cocina de apoyo', 'Terraza'] }],
      servicios: [],
      politicas: { deposito: 50, retencionMin: 10, anticipacionHoras: 4, maxDias: 180, cancelacion: [{ horas: 72, reembolso: 100 }, { horas: 24, reembolso: 50 }, { horas: 0, reembolso: 0 }] },
      promos: [{ codigo: 'EMPRENDE20', tipo: 'porcentaje', valor: 20, minimo: 30000, activa: true, usos: 0, usosMax: 30 }],
      reglas: [{ tipo: 'duracion', horas: 4, porcentaje: 10, activa: true }] },
    { id: 'salon', nombre: 'Salón Brillo', rubro: 'Salón de belleza', modo: 'horas', icono: 'salon', color: '#b8437a', sigla: 'SB', comuna: 'Chiguayante', direccion: 'Av. Ejemplo 789, Chiguayante',
      horario: semana(Object.assign(LV('10:00', '20:00'), { sab: [['10:00', '18:00']] })), intervalo: 15, buffer: 10,
      recursos: [{ id: 'est1', nombre: 'Estilista 1', unidades: 1, servicios: ['corte', 'color', 'peinado'] }, { id: 'est2', nombre: 'Estilista 2', unidades: 1, servicios: ['corte', 'peinado'] }, { id: 'mani', nombre: 'Manicurista', unidades: 1, servicios: ['manicure', 'pedicure'] }],
      servicios: [{ id: 'corte', nombre: 'Corte y lavado', precio: 12000, duracion: 45 }, { id: 'color', nombre: 'Color completo', precio: 35000, duracion: 120 }, { id: 'peinado', nombre: 'Peinado para evento', precio: 18000, duracion: 60 }, { id: 'manicure', nombre: 'Manicure semipermanente', precio: 10000, duracion: 60 }, { id: 'pedicure', nombre: 'Pedicure', precio: 12000, duracion: 60 }],
      politicas: { deposito: 0, retencionMin: 10, anticipacionHoras: 1, maxDias: 45, cancelacion: [{ horas: 2, reembolso: 100 }, { horas: 0, reembolso: 0 }] },
      promos: [{ codigo: 'PRIMERAVEZ', tipo: 'monto', valor: 3000, minimo: 10000, activa: true, usos: 0, usosMax: 100 }], reglas: [] }
  ];
  // Íconos de línea (24×24, trazo) para rubros y pantallas. Sin emojis: se ven igual en todos los equipos.
  var ICONOS = {
    cabana: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    tour: '<path d="m3 20 6-11 4 7 3-4 5 8Z"/><circle cx="17" cy="6" r="2"/>',
    medico: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="12" r="2"/>',
    espacio: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M10 21v-4h4v4"/>',
    salon: '<circle cx="6" cy="18" r="2.5"/><circle cx="6" cy="6" r="2.5"/><path d="M8 7.5 20 17M8 16.5 20 7"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    panel: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'
  };
  var icono = function (n, t) { return '<svg class="ico-l" width="' + (t || 20) + '" height="' + (t || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONOS[n] || '') + '</svg>'; };
  // Logotipo de cada negocio de la demo: sigla sobre su color (en un cliente real va su logo)
  var logo = function (n, t) { return '<span class="logo-n" style="--lc:' + n.color + ';--lt:' + (t || 44) + 'px" aria-hidden="true">' + n.sigla + '</span>'; };
  var BASE_NOTIF = { confirmacion: { activo: true, correo: true, whatsapp: true }, recordatorio: { activo: true, horas: 24, correo: true, whatsapp: true }, resena: { activo: true, correo: true, whatsapp: false }, cancelacion: { activo: true, correo: true, whatsapp: true }, espera: { activo: true, correo: true, whatsapp: true } };
  NEGOCIOS.forEach(function (n) { n.notif = JSON.parse(JSON.stringify(BASE_NOTIF)); n.temporadas = n.temporadas || []; n.factorFinde = n.factorFinde || 1; });

  // ---------- Almacenamiento y avisos en vivo ----------
  function leer(id) {
    var base = NEGOCIOS.filter(function (n) { return n.id === id; })[0]; if (!base) return null;
    var d = null; try { d = JSON.parse(localStorage.getItem(V + id)); } catch (e) {}
    if (!d) d = { config: JSON.parse(JSON.stringify(base)), reservas: [], bloqueos: [], avisos: [] };
    return d;
  }
  function guardar(id, d) { try { localStorage.setItem(V + id, JSON.stringify(d)); } catch (e) {} avisar(id); }
  var canal = null; try { canal = new BroadcastChannel('bd-reservas'); } catch (e) {}
  var oyentes = [];
  function avisar(id) { var m = { id: id, t: Date.now() }; if (canal) canal.postMessage(m); oyentes.forEach(function (f) { f(m); }); }
  if (canal) canal.onmessage = function (e) { oyentes.forEach(function (f) { f(e.data); }); };
  window.addEventListener('storage', function (e) { if (!canal && e.key && e.key.indexOf(V) === 0) oyentes.forEach(function (f) { f({ id: e.key.slice(V.length) }); }); });
  function cambiar(id, fn) { var d = leer(id); var r = fn(d); guardar(id, d); return r; }

  // ---------- Disponibilidad ----------
  var ACTIVAS = { retenida: 1, confirmada: 1, pagada: 1, checkin: 1, completada: 1, noshow: 1 };
  function ocupan(d, recurso, desde, hasta, salvo) {
    var n = 0;
    d.reservas.forEach(function (r) { if (r.id !== salvo && ACTIVAS[r.estado] && r.recurso === recurso && r.desde < hasta && r.hasta > desde) n += r.unidades || 1; });
    d.bloqueos.forEach(function (b) { if (b.recurso === recurso && b.desde < hasta && b.hasta > desde) n += b.unidades || 1; });
    return n;
  }
  function recurso(d, id) { return d.config.recursos.filter(function (r) { return r.id === id; })[0]; }
  function servicio(d, id) { return d.config.servicios.filter(function (s) { return s.id === id; })[0]; }
  function enTemporada(c, fecha) {
    var md = fecha.slice(5);
    return c.temporadas.filter(function (t) { return t.desde <= t.hasta ? md >= t.desde && md <= t.hasta : md >= t.desde || md <= t.hasta; })[0] || null;
  }
  function abierto(c, fecha) { return (c.horario && c.horario[DSEM[diaSem(fecha)]]) || []; }
  function limites(c) { var a = Date.now() + (c.politicas.anticipacionHoras || 0) * 36e5; return { desde: a, hasta: fdate(sumaDias(hoy(), c.politicas.maxDias || 365)).getTime() }; }

  // Unidades libres de un tipo de alojamiento en una noche
  function libresNoche(d, rec, fecha) { var r = recurso(d, rec), a = fdate(fecha).getTime(); return r.unidades - ocupan(d, rec, a, a + 864e5); }
  // Horas disponibles de un servicio en un día (con qué profesional o sala)
  function horas(d, sel) {
    var c = d.config, lim = limites(c), out = [], dur, recs;
    if (c.modo === 'horas') { var s = servicio(d, sel.servicio); dur = s.duracion; recs = c.recursos.filter(function (r) { return r.servicios.indexOf(s.id) > -1 && (!sel.recurso || sel.recurso === r.id); }); }
    else { var r0 = recurso(d, sel.recurso); dur = (sel.horas || r0.minHoras || 1) * 60; recs = [r0]; }
    var paso = c.intervalo || 30, buf = c.buffer || 0;
    abierto(c, sel.fecha).forEach(function (tr) {
      for (var m = minH(tr[0]); m + dur <= minH(tr[1]); m += paso) {
        var a = fdate(sel.fecha, m).getTime(), b = a + (dur + buf) * 6e4;
        if (a < lim.desde || a > lim.hasta) continue;
        var libres = recs.filter(function (r) { return ocupan(d, r.id, a, b, sel.salvo) < r.unidades; }).map(function (r) { return r.id; });
        if (libres.length) out.push({ min: m, hora: hMin(m), recursos: libres });
      }
    });
    return out;
  }
  // Salidas de un tour en un día, con los cupos que quedan
  function salidas(d, sel) {
    var s = servicio(d, sel.servicio), lim = limites(d.config);
    if (s.dias.indexOf(diaSem(sel.fecha)) < 0) return [];
    return s.salidas.map(function (h) {
      var a = fdate(sel.fecha, minH(h)).getTime(), usados = 0;
      d.reservas.forEach(function (r) { if (ACTIVAS[r.estado] && r.servicio === s.id && r.desde === a && r.id !== sel.salvo) usados += r.personas; });
      return { min: minH(h), hora: h, quedan: Math.max(0, s.capacidad - usados), capacidad: s.capacidad, valida: a >= lim.desde && a <= lim.hasta };
    }).filter(function (x) { return x.valida; });
  }
  // Estado de cada día del mes para el calendario: libre, pocos, lleno o cerrado
  function mes(d, sel, anio, mesN) {
    var c = d.config, out = {}, n = new Date(anio, mesN + 1, 0).getDate(), lim = limites(c);
    for (var i = 1; i <= n; i++) {
      var f = anio + '-' + pad(mesN + 1) + '-' + pad(i), fin = fdate(f).getTime() + 864e5, est = 'cerrado', info = '';
      if (fin <= lim.desde - (c.modo === 'noches' ? 0 : 864e5) || fdate(f).getTime() > lim.hasta) { out[f] = { estado: 'pasado' }; continue; }
      if (c.modo === 'noches') { var lb = sel.recurso ? libresNoche(d, sel.recurso, f) : c.recursos.reduce(function (t, r) { return t + libresNoche(d, r.id, f); }, 0), tot = sel.recurso ? recurso(d, sel.recurso).unidades : c.recursos.reduce(function (t, r) { return t + r.unidades; }, 0); est = lb <= 0 ? 'lleno' : lb / tot <= .34 ? 'pocos' : 'libre'; info = lb; }
      else if (c.modo === 'cupos') { if (sel.servicio) { var sl = salidas(d, { servicio: sel.servicio, fecha: f }); if (sl.length) { var q = sl.reduce(function (t, x) { return t + x.quedan; }, 0), cap = sl.reduce(function (t, x) { return t + x.capacidad; }, 0); est = q < (sel.personas || 1) ? 'lleno' : q / cap <= .3 ? 'pocos' : 'libre'; info = q; } } }
      else if ((sel.servicio || sel.recurso) && abierto(c, f).length) { var hs = horas(d, { servicio: sel.servicio, recurso: sel.recurso, fecha: f, horas: sel.horas }); est = !hs.length ? 'lleno' : hs.length <= 4 ? 'pocos' : 'libre'; info = hs.length; }
      out[f] = { estado: est, info: info };
    }
    return out;
  }

  // ---------- Precio ----------
  function precio(d, sel, codigo) {
    var c = d.config, lineas = [], base = 0, extra = 0, inicio, noches = 0;
    if (c.modo === 'noches') {
      var r = recurso(d, sel.recurso); noches = difDias(sel.llegada, sel.salida); inicio = fdate(sel.llegada).getTime();
      for (var i = 0; i < noches; i++) {
        var f = sumaDias(sel.llegada, i), t = enTemporada(c, f), ds = diaSem(f), fin = ds === 5 || ds === 6;
        base += Math.round(r.precio * (t ? t.factor : 1) * (fin ? c.factorFinde : 1) / 100) * 100;
      }
      lineas.push([r.nombre + ' · ' + noches + (noches === 1 ? ' noche' : ' noches'), base]);
      (sel.extras || []).forEach(function (x) { var s = servicio(d, x); if (s) { extra += s.precio; lineas.push([s.nombre, s.precio]); } });
    } else if (c.modo === 'cupos') { var s1 = servicio(d, sel.servicio); base = s1.precio * sel.personas; inicio = fdate(sel.fecha, sel.min).getTime(); lineas.push([s1.nombre + ' · ' + sel.personas + (sel.personas === 1 ? ' persona' : ' personas'), base]); }
    else if (c.modo === 'horas') { var s2 = servicio(d, sel.servicio); base = s2.precio; inicio = fdate(sel.fecha, sel.min).getTime(); lineas.push([s2.nombre, base]); }
    else { var r2 = recurso(d, sel.recurso); base = r2.precio * sel.horas; inicio = fdate(sel.fecha, sel.min).getTime(); lineas.push([r2.nombre + ' · ' + sel.horas + ' h', base]); }
    var bruto = base + extra, desc = 0, motivo = '';
    // Mejor regla automática (no se suman entre sí)
    (c.reglas || []).forEach(function (g) {
      if (!g.activa) return;
      var aplica = g.tipo === 'anticipada' ? (inicio - Date.now()) / 864e5 >= g.dias : g.tipo === 'estadia' ? noches >= g.noches : g.tipo === 'grupo' ? sel.personas >= g.personas : g.tipo === 'ultimo' ? (inicio - Date.now()) / 36e5 <= g.horas && inicio > Date.now() : g.tipo === 'duracion' ? sel.horas >= g.horas : false;
      var v = Math.round(base * g.porcentaje / 100);
      if (aplica && v > desc) { desc = v; motivo = NOMBRE_REGLA[g.tipo](g); }
    });
    var promo = null;
    if (codigo) {
      var p = (c.promos || []).filter(function (x) { return x.codigo === String(codigo).trim().toUpperCase(); })[0];
      if (!p || !p.activa || (p.usosMax && p.usos >= p.usosMax)) promo = { error: 'El código no existe o ya no está vigente.' };
      else if (bruto < p.minimo) promo = { error: 'Este código pide un mínimo de ' + clp(p.minimo) + '.' };
      else { var v2 = p.tipo === 'porcentaje' ? Math.round(bruto * p.valor / 100) : p.valor; promo = { codigo: p.codigo, valor: v2 }; if (v2 > desc) { desc = v2; motivo = 'Código ' + p.codigo; } else promo.nota = 'Ya tienes un descuento mayor; no se suman.'; }
    }
    if (desc) lineas.push([motivo, -desc]);
    var total = Math.max(0, bruto - desc), dep = Math.round(total * (c.politicas.deposito || 0) / 100);
    return { lineas: lineas, bruto: bruto, descuento: desc, motivo: motivo, total: total, deposito: dep, saldo: total - dep, promo: promo, noches: noches };
  }
  var NOMBRE_REGLA = {
    anticipada: function (g) { return 'Reserva anticipada (' + g.dias + '+ días) −' + g.porcentaje + ' %'; },
    estadia: function (g) { return 'Estadía de ' + g.noches + '+ noches −' + g.porcentaje + ' %'; },
    grupo: function (g) { return 'Grupo de ' + g.personas + '+ personas −' + g.porcentaje + ' %'; },
    ultimo: function (g) { return 'Último minuto −' + g.porcentaje + ' %'; },
    duracion: function (g) { return 'Arriendo de ' + g.horas + '+ horas −' + g.porcentaje + ' %'; }
  };

  // ---------- Validar y crear ----------
  function validar(d, sel) {
    var c = d.config, P = c.politicas;
    if (c.modo === 'noches') {
      var r = recurso(d, sel.recurso); if (!r) return 'Elige un alojamiento.';
      if (!sel.llegada || !sel.salida || sel.salida <= sel.llegada) return 'Elige la llegada y la salida.';
      var n = difDias(sel.llegada, sel.salida), alta = enTemporada(c, sel.llegada);
      if (n < (alta ? P.estadiaMinAlta || 1 : P.estadiaMin || 1)) return 'En esas fechas la estadía mínima es de ' + (alta ? P.estadiaMinAlta : P.estadiaMin) + ' noches.';
      if (sel.personas > r.capacidad) return r.nombre + ' es para ' + r.capacidad + ' personas como máximo.';
      for (var i = 0; i < n; i++) if (libresNoche(d, r.id, sumaDias(sel.llegada, i)) <= 0) return 'Alguien acaba de tomar una de esas noches. Elige otras fechas.';
      if (fdate(sel.llegada).getTime() + 864e5 < Date.now()) return 'Esa fecha ya pasó.';
      return '';
    }
    if (c.modo === 'cupos') {
      var s = servicio(d, sel.servicio), sl = salidas(d, sel).filter(function (x) { return x.min === sel.min; })[0];
      if (!sl) return 'Esa salida ya no está disponible.';
      if (sel.personas < s.minPersonas) return 'Este tour sale con mínimo ' + s.minPersonas + ' personas por reserva.';
      if (sl.quedan < sel.personas) return 'Quedan ' + sl.quedan + ' cupos en esa salida.';
      return '';
    }
    var hs = horas(d, sel).filter(function (x) { return x.min === sel.min; })[0];
    if (!hs) return 'Esa hora ya no está disponible. Elige otra.';
    if (c.modo === 'bloques' && sel.personas > recurso(d, sel.recurso).capacidad) return 'La capacidad máxima es de ' + recurso(d, sel.recurso).capacidad + ' personas.';
    return '';
  }
  function codigoNuevo(d) { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s; do { s = ''; var b = new Uint8Array(6); crypto.getRandomValues(b); for (var i = 0; i < 6; i++) s += a[b[i] % a.length]; } while (d.reservas.some(function (r) { return r.codigo === s; })); return s; }
  function crear(id, sel, cliente, opc) {
    opc = opc || {};
    return cambiar(id, function (d) {
      var err = validar(d, sel); if (err) return { error: err };
      var c = d.config, pr = precio(d, sel, opc.codigo), desde, hasta, rec = sel.recurso;
      if (c.modo === 'noches') { desde = fdate(sel.llegada).getTime(); hasta = fdate(sel.salida).getTime(); }
      else if (c.modo === 'cupos') { desde = fdate(sel.fecha, sel.min).getTime(); hasta = desde + servicio(d, sel.servicio).duracion * 6e4; rec = sel.servicio; }
      else if (c.modo === 'horas') { desde = fdate(sel.fecha, sel.min).getTime(); hasta = desde + (servicio(d, sel.servicio).duracion + (c.buffer || 0)) * 6e4; if (!rec) rec = horas(d, sel).filter(function (x) { return x.min === sel.min; })[0].recursos[0]; }
      else { desde = fdate(sel.fecha, sel.min).getTime(); hasta = desde + sel.horas * 36e5; }
      var conDep = pr.deposito > 0 && !opc.sinPago;
      var r = { id: codigoNuevo(d).toLowerCase() + Date.now().toString(36), codigo: codigoNuevo(d), creada: Date.now(), modo: c.modo, recurso: rec, servicio: sel.servicio || null, extras: sel.extras || [],
        desde: desde, hasta: hasta, personas: sel.personas || 1, horas: sel.horas || null, cliente: cliente, precio: pr, pagado: 0, moneda: 'CLP',
        estado: conDep ? 'retenida' : 'confirmada', expira: conDep ? Date.now() + (c.politicas.retencionMin || 10) * 6e4 : null,
        canal: opc.canal || 'Sitio web', idioma: cliente.idioma || 'es', historial: [{ estado: conDep ? 'retenida' : 'confirmada', t: Date.now() }], semilla: !!opc.semilla };
      if (pr.promo && pr.promo.codigo && pr.motivo.indexOf(pr.promo.codigo) > -1) c.promos.forEach(function (p) { if (p.codigo === pr.promo.codigo) p.usos++; });
      d.reservas.push(r);
      if (!opc.semilla) programarAvisos(d, r, conDep ? 'pago' : 'confirmacion');
      return { reserva: r };
    });
  }
  function estado(id, rid, nuevo, extra) {
    return cambiar(id, function (d) {
      var r = d.reservas.filter(function (x) { return x.id === rid; })[0]; if (!r) return null;
      r.estado = nuevo; r.historial.push({ estado: nuevo, t: Date.now() }); if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
      if (nuevo === 'confirmada' || nuevo === 'pagada') { r.expira = null; programarAvisos(d, r, 'confirmacion'); }
      if (nuevo === 'cancelada') { aviso(d, r, 'cancelacion', Date.now()); avisarEspera(d, r); }
      return r;
    });
  }
  function pagar(id, rid, monto) { return estado(id, rid, 'pagada', { pagado: monto }); }
  // Reembolso según la política de cancelación (porcentaje de lo pagado, por horas de anticipación)
  function reembolso(d, r) {
    var h = (r.desde - Date.now()) / 36e5, tramos = d.config.politicas.cancelacion.slice().sort(function (a, b) { return b.horas - a.horas; });
    var t = tramos.filter(function (x) { return h >= x.horas; })[0] || { reembolso: 0 };
    return { porcentaje: t.reembolso, monto: Math.round(r.pagado * t.reembolso / 100), horas: Math.max(0, Math.floor(h)) };
  }
  function cancelar(id, rid, por) { var d = leer(id), r = d.reservas.filter(function (x) { return x.id === rid; })[0]; if (!r) return null; var rb = reembolso(d, r); return estado(id, rid, 'cancelada', { reembolso: rb, canceladaPor: por || 'cliente' }); }
  function esperar(id, sel, cliente) { return cambiar(id, function (d) { d.espera = d.espera || []; var e = { id: 'e' + Date.now().toString(36), t: Date.now(), sel: sel, cliente: cliente, avisado: false }; d.espera.push(e); return e; }); }
  function avisarEspera(d, r) {
    (d.espera || []).forEach(function (e) {
      if (e.avisado) return;
      var mismo = d.config.modo === 'noches' ? e.sel.recurso === r.recurso && fdate(e.sel.llegada).getTime() < r.hasta && fdate(e.sel.salida).getTime() > r.desde : (e.sel.servicio === r.servicio || e.sel.recurso === r.recurso) && e.sel.fecha === fstr(new Date(r.desde));
      if (mismo) { e.avisado = true; aviso(d, { id: e.id, codigo: 'ESPERA', cliente: e.cliente, desde: r.desde }, 'espera', Date.now()); }
    });
  }

  // ---------- Avisos automáticos (correo y WhatsApp; en la demo se registran como enviados, no salen) ----------
  function aviso(d, r, tipo, cuando) {
    var cfg = d.config.notif[tipo]; if (!cfg || !cfg.activo) return;
    ['correo', 'whatsapp'].forEach(function (can) {
      if (!cfg[can]) return;
      if (can === 'correo' && !r.cliente.correo) return;
      if (can === 'whatsapp' && !r.cliente.telefono) return;
      d.avisos.push({ id: 'a' + Math.random().toString(36).slice(2, 9), reserva: r.id, codigo: r.codigo, tipo: tipo, canal: can, para: can === 'correo' ? r.cliente.correo : r.cliente.telefono, cuando: cuando, estado: 'programado', texto: textoAviso(d, r, tipo) });
    });
    d.avisos = d.avisos.slice(-500);
  }
  function programarAvisos(d, r, tipo) {
    d.avisos = d.avisos.filter(function (a) { return !(a.reserva === r.id && a.estado === 'programado'); });
    aviso(d, r, tipo === 'pago' ? 'confirmacion' : tipo, Date.now());
    if (tipo === 'pago') return;
    var rec = d.config.notif.recordatorio; if (rec && rec.activo) aviso(d, r, 'recordatorio', Math.max(Date.now(), r.desde - rec.horas * 36e5));
    aviso(d, r, 'resena', r.hasta + 2 * 36e5);
  }
  function textoAviso(d, r, tipo) {
    var n = d.config.nombre, cu = fechaHora(d, r);
    return { confirmacion: r.estado === 'retenida' ? 'Reservamos tu cupo por ' + d.config.politicas.retencionMin + ' minutos. Paga el depósito para confirmar ' + n + ' (' + cu + '). Código ' + r.codigo + '.' : 'Tu reserva en ' + n + ' está confirmada: ' + cu + '. Código ' + r.codigo + '.',
      recordatorio: 'Recordatorio: te esperamos en ' + n + ' el ' + cu + '. Si no puedes venir, cancela desde tu enlace.', resena: '¿Cómo te fue en ' + n + '? Cuéntanos en 1 minuto.',
      cancelacion: 'Tu reserva ' + r.codigo + ' en ' + n + ' fue cancelada.' + (r.reembolso && r.reembolso.monto ? ' Te devolvemos ' + clp(r.reembolso.monto) + '.' : ''), espera: 'Se liberó un cupo en ' + n + ' para la fecha que esperabas. Reserva antes que otro.' }[tipo];
  }
  // Tareas automáticas: vencer retenciones sin pago, enviar avisos programados, cerrar reservas pasadas
  function automatico(id) {
    var d = leer(id), cambio = false, ahora = Date.now();
    d.reservas.forEach(function (r) {
      if (r.estado === 'retenida' && r.expira && r.expira < ahora) { r.estado = 'cancelada'; r.canceladaPor = 'sistema: no se pagó a tiempo'; r.historial.push({ estado: 'cancelada', t: ahora }); avisarEspera(d, r); cambio = true; }
      if ((r.estado === 'confirmada' || r.estado === 'pagada') && r.desde <= ahora && r.hasta > ahora && !r.semilla) { r.estado = 'checkin'; r.historial.push({ estado: 'checkin', t: ahora, auto: true }); cambio = true; }   // llegó la hora: queda "En curso"
      if ((r.estado === 'confirmada' || r.estado === 'pagada' || r.estado === 'checkin') && r.hasta < ahora && !r.semilla) { r.estado = 'completada'; r.historial.push({ estado: 'completada', t: ahora }); cambio = true; }
    });
    d.avisos.forEach(function (a) { if (a.estado === 'programado' && a.cuando <= ahora) { a.estado = 'enviado (demo)'; a.enviado = ahora; cambio = true; } });
    if (cambio) guardar(id, d);
  }

  // ---------- iCal (Google Calendar, Airbnb, Booking y otros) ----------
  var icsF = function (ms, soloDia) { var t = new Date(ms); return t.getFullYear() + pad(t.getMonth() + 1) + pad(t.getDate()) + (soloDia ? '' : 'T' + pad(t.getHours()) + pad(t.getMinutes()) + '00'); };
  var icsTxt = function (s) { return String(s).replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); };
  function exportarIcal(id, rec) {
    var d = leer(id), c = d.config, noches = c.modo === 'noches';
    var l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bio Digital//Reservas//ES', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + icsTxt(c.nombre + (rec ? ' · ' + rec : '')), 'X-WR-TIMEZONE:America/Santiago'];
    d.reservas.forEach(function (r) {
      if (!ACTIVAS[r.estado] || r.estado === 'retenida' || (rec && r.recurso !== rec)) return;
      l.push('BEGIN:VEVENT', 'UID:' + r.id + '@biodigital', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', (noches ? 'DTSTART;VALUE=DATE:' : 'DTSTART:') + icsF(r.desde, noches), (noches ? 'DTEND;VALUE=DATE:' : 'DTEND:') + icsF(r.hasta, noches), 'SUMMARY:' + icsTxt('Reservado · ' + r.codigo), 'END:VEVENT');
    });
    d.bloqueos.forEach(function (b) { if (rec && b.recurso !== rec) return; l.push('BEGIN:VEVENT', 'UID:' + b.id + '@biodigital', (noches ? 'DTSTART;VALUE=DATE:' : 'DTSTART:') + icsF(b.desde, noches), (noches ? 'DTEND;VALUE=DATE:' : 'DTEND:') + icsF(b.hasta, noches), 'SUMMARY:' + icsTxt('Bloqueado · ' + (b.motivo || '')), 'END:VEVENT'); });
    l.push('END:VCALENDAR');
    return l.join('\r\n');
  }
  // Importa un calendario .ics (por ejemplo, el de Airbnb o Booking) como bloqueos de un recurso
  function importarIcal(id, rec, txt, origen) {
    var eventos = String(txt).replace(/\r\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1), n = 0;
    var fecha = function (v) { var m = /(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime() : null; };
    return cambiar(id, function (d) {
      d.bloqueos = d.bloqueos.filter(function (b) { return !(b.recurso === rec && b.origen === origen); });   // reemplaza la sincronización anterior
      eventos.forEach(function (ev) {
        var g = function (k) { var m = new RegExp('^' + k + '[^:]*:(.*)$', 'm').exec(ev); return m ? m[1].trim() : ''; };
        var a = fecha(g('DTSTART')), b = fecha(g('DTEND')) || (a && a + 864e5);
        if (a && b && b > a) { d.bloqueos.push({ id: 'b' + Math.random().toString(36).slice(2, 9), recurso: rec, desde: a, hasta: b, motivo: (g('SUMMARY') || 'Reservado') + ' (' + origen + ')', origen: origen, unidades: 1 }); n++; }
      });
      return n;
    });
  }
  function bloquear(id, rec, desde, hasta, motivo) { return cambiar(id, function (d) { d.bloqueos.push({ id: 'b' + Date.now().toString(36), recurso: rec, desde: desde, hasta: hasta, motivo: motivo || 'Bloqueo manual', origen: 'manual', unidades: 1 }); }); }

  // ---------- Datos de prueba para el panel (marcados; clientes "de prueba") ----------
  function sembrar(id) {
    var d = leer(id), c = d.config;
    d.reservas = d.reservas.filter(function (r) { return !r.semilla; });
    var canales = c.modo === 'noches' ? ['Sitio web', 'Sitio web', 'Airbnb (iCal)', 'Booking (iCal)', 'WhatsApp', 'Teléfono'] : ['Sitio web', 'Sitio web', 'Sitio web', 'WhatsApp', 'Teléfono', 'Presencial'];
    var paises = ['Chile', 'Chile', 'Chile', 'Chile', 'Argentina', 'Brasil', 'Estados Unidos'], k = 0;
    var meter = function (r) { r.id = 's' + (k++) + Date.now().toString(36); r.codigo = codigoNuevo(d); r.semilla = true; r.historial = [{ estado: r.estado, t: r.creada }]; d.reservas.push(r); };
    for (var dia = -30; dia <= 30; dia++) {
      var f = sumaDias(hoy(), dia), pasado = dia < 0;
      var est = function () { var x = Math.random(); return pasado ? (x < .08 ? 'cancelada' : x < .12 ? 'noshow' : 'completada') : (x < .06 ? 'cancelada' : x < .55 ? 'pagada' : 'confirmada'); };
      var cli = function () { var p = paises[Math.floor(Math.random() * paises.length)]; return { nombre: 'Cliente de prueba', correo: '', telefono: '', pais: p, idioma: p === 'Brasil' ? 'pt' : p === 'Estados Unidos' ? 'en' : 'es' }; };
      var lead = function () { return Math.floor(Math.random() * 25) + 1; };
      if (c.modo === 'noches') {
        c.recursos.forEach(function (r) { for (var u = 0; u < r.unidades; u++) { if (Math.random() < .5 && libresNoche(d, r.id, f) > 0) { var n = 1 + Math.floor(Math.random() * 3), sel = { recurso: r.id, llegada: f, salida: sumaDias(f, n), personas: Math.min(r.capacidad, 2) }; var ok = true; for (var i = 0; i < n; i++) if (libresNoche(d, r.id, sumaDias(f, i)) <= 0) ok = false; if (!ok) continue; var pr = precio(d, sel), e = est(); meter({ creada: fdate(f).getTime() - lead() * 864e5, modo: 'noches', recurso: r.id, desde: fdate(f).getTime(), hasta: fdate(sel.salida).getTime(), personas: sel.personas, cliente: cli(), precio: pr, pagado: e === 'pagada' || e === 'completada' ? pr.total : e === 'confirmada' ? pr.deposito : 0, estado: e, canal: canales[Math.floor(Math.random() * canales.length)] }); } } });
      } else if (c.modo === 'cupos') {
        c.servicios.forEach(function (s) { salidas(d, { servicio: s.id, fecha: f }).forEach(function (sl) { var m = Math.floor(Math.random() * 4); for (var i = 0; i < m && sl.quedan > 1; i++) { var pers = Math.min(sl.quedan, Math.max(s.minPersonas, 1 + Math.floor(Math.random() * 4))), pr = precio(d, { servicio: s.id, fecha: f, min: sl.min, personas: pers }), e = est(), a = fdate(f, sl.min).getTime(); sl.quedan -= pers; meter({ creada: a - lead() * 864e5, modo: 'cupos', recurso: s.id, servicio: s.id, desde: a, hasta: a + s.duracion * 6e4, personas: pers, cliente: cli(), precio: pr, pagado: e === 'pagada' || e === 'completada' ? pr.total : pr.deposito, estado: e, canal: canales[Math.floor(Math.random() * canales.length)] }); } }); });
      } else {
        var lista = c.modo === 'horas' ? c.servicios : c.recursos;
        var intentos = c.modo === 'horas' ? 14 : 4;
        for (var j = 0; j < intentos; j++) {
          var x = lista[Math.floor(Math.random() * lista.length)], sel2 = c.modo === 'horas' ? { servicio: x.id, fecha: f } : { recurso: x.id, fecha: f, horas: x.minHoras + Math.floor(Math.random() * 2) };
          var hs = horas(d, Object.assign({}, sel2, { salvo: null }));
          if (!hs.length || Math.random() < .35) continue;
          var hh = hs[Math.floor(Math.random() * hs.length)], a2 = fdate(f, hh.min).getTime(); sel2.min = hh.min;
          var dur = c.modo === 'horas' ? x.duracion + (c.buffer || 0) : sel2.horas * 60, pr2 = precio(d, sel2), e2 = est();
          if (a2 < Date.now() - 30 * 864e5) continue;
          meter({ creada: a2 - lead() * 864e5, modo: c.modo, recurso: c.modo === 'horas' ? hh.recursos[0] : x.id, servicio: c.modo === 'horas' ? x.id : null, desde: a2, hasta: a2 + dur * 6e4, personas: 1, horas: sel2.horas || null, cliente: cli(), precio: pr2, pagado: e2 === 'pagada' || e2 === 'completada' ? pr2.total : 0, estado: e2, canal: canales[Math.floor(Math.random() * canales.length)] });
        }
      }
    }
    guardar(id, d);
  }
  function restablecer(id) { try { localStorage.removeItem(V + id); } catch (e) {} avisar(id); }
  function guardarConfig(id, fn) { return cambiar(id, function (d) { fn(d.config); }); }

  var clp = function (n) { return '$' + Math.round(n).toLocaleString('es-CL'); };
  function fechaHora(d, r) {
    var f = new Date(r.desde), opc = { weekday: 'short', day: 'numeric', month: 'short' };
    if (d.config.modo === 'noches') return f.toLocaleDateString('es-CL', opc) + ' al ' + new Date(r.hasta).toLocaleDateString('es-CL', opc);
    return f.toLocaleDateString('es-CL', opc) + ' a las ' + hMin(f.getHours() * 60 + f.getMinutes());
  }
  var ESTADOS = { retenida: ['Retenida (falta pago)', '#f59e0b'], confirmada: ['Confirmada', '#3b82f6'], pagada: ['Pagada', '#22c55e'], checkin: ['En curso', '#a855f7'], completada: ['Completada', '#94a3b8'], cancelada: ['Cancelada', '#ef4444'], noshow: ['No llegó', '#b91c1c'] };

  window.Reservas = {
    NEGOCIOS: NEGOCIOS, ESTADOS: ESTADOS, icono: icono, logo: logo, leer: leer, guardarConfig: guardarConfig, escuchar: function (f) { oyentes.push(f); },
    mes: mes, horas: horas, salidas: salidas, libresNoche: libresNoche, precio: precio, validar: validar, crear: crear, estado: estado, pagar: pagar,
    cancelar: cancelar, reembolso: reembolso, esperar: esperar, automatico: automatico, exportarIcal: exportarIcal, importarIcal: importarIcal, bloquear: bloquear,
    sembrar: sembrar, restablecer: restablecer, recurso: recurso, servicio: servicio, enTemporada: enTemporada, fechaHora: fechaHora,
    util: { fstr: fstr, fdate: fdate, hoy: hoy, sumaDias: sumaDias, difDias: difDias, diaSem: diaSem, hMin: hMin, minH: minH, clp: clp, pad: pad }
  };
})();
