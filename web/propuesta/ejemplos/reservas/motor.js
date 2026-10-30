// Motor de reservas de Bío Digital: disponibilidad en tiempo real, precios con temporadas y promociones, retención con
// vencimiento, políticas de depósito y cancelación, lista de espera, avisos automáticos, iCal (exportar e importar) y reportes.
// Cuatro modos cubren los rubros: "noches" (cabañas, hotel), "horas" (centro médico, salón), "cupos" (tours) y
// "bloques" (arriendo de espacios por hora).
//
// CONECTADO: con Reservas.conectar(negocio) los datos viven en una base en la nube (_compartido/nube.js) y el SERVIDOR manda: calcula precio, depósito y
// disponibilidad, y valida quién puede hacer qué. El navegador solo envía lo que la persona eligió. El cliente ve solo lo suyo (con el código secreto de su
// reserva) y qué fechas están ocupadas; el equipo entra con PIN (recepción o jefe). Sin conectar, funciona solo en este navegador. Ver memoria/reservas-sistema.md.
// Cada negocio real define sus agendas en agenda.config.js (window.AGENDA); sin eso se usan las 5 de demostración.
(function () {
  'use strict';
  // v2 (30-oct-2026): la copia local de la demo antigua (reservas en el formato viejo, ya borradas de la base) se ignora y se borra; si no, se mezclaba con las nuevas
  try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('bdres-v1-') === 0 || k.indexOf('bdres-mis-') === 0) localStorage.removeItem(k); }); } catch (e) {}
  var V = 'bdres-v2-', MIS = 'bdres-mis2-';   // se completan con el negocio apenas se lee la configuración (dos negocios en un mismo sitio no mezclan su caché)
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
  var DEMOS = [
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
  var AG = window.AGENDA || {};
  var NEGOCIOS = AG.negocios || DEMOS;
  if (AG.negocio) { V += AG.negocio + '-'; MIS += AG.negocio + '-'; }
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
    var d = null; if (!AG.sinCache) try { d = JSON.parse(localStorage.getItem(V + id)); } catch (e) {}   // la reserva simple (sinCache) siempre parte de su planilla
    if (!d) { var cf = JSON.parse(JSON.stringify(base)); d = { config: cf, reservas: cf.ocupadas || [], bloqueos: cf.bloqueos || [], avisos: [] }; delete cf.bloqueos; delete cf.ocupadas; }
    return d;
  }
  function guardar(id, d) { if (!AG.sinCache) try { localStorage.setItem(V + id, JSON.stringify(d)); } catch (e) {} avisar(id); }
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
    d.reservas.forEach(function (r) { if (r.estado === 'retenida' && r.expira && r.expira < Date.now()) return; if (r.id !== salvo && ACTIVAS[r.estado] && r.recurso === recurso && r.desde < hasta && r.hasta > desde) n += r.unidades || 1; });
    d.bloqueos.forEach(function (b) { if (b.recurso === recurso && b.desde < hasta && b.hasta > desde) n += b.unidades || 1; });
    return n;
  }
  // Unidades con nombre propio ya tomadas en un periodo; la que le toca a una reserva es la preferida si sigue libre o la primera libre (igual que el servidor)
  function tomadas(d, rec, desde, hasta, salvo) {
    var t = {};
    d.reservas.forEach(function (r) { if (r.id === salvo || !ACTIVAS[r.estado] || r.recurso !== rec || !r.unidad || r.desde >= hasta || r.hasta <= desde) return; if (r.estado === 'retenida' && r.expira && r.expira < Date.now()) return; t[r.unidad] = r.codigo || '·'; });
    d.bloqueos.forEach(function (b) { if (b.recurso === rec && b.unidad && !b.quitado && b.desde < hasta && b.hasta > desde) t[b.unidad] = 'bloqueo'; });
    return t;
  }
  function unidadPara(d, rec, desde, hasta, salvo, pref) {
    var r = recurso(d, rec); if (!r) return null; var n = Math.max(1, r.unidades || 1), t = tomadas(d, rec, desde, hasta, salvo);
    if (pref >= 1 && pref <= n && !t[pref]) return pref;
    for (var u = 1; u <= n; u++) if (!t[u]) return u;
    return null;
  }
  function nombreUnidad(r, u) { if (!r || !u) return null; return (r.nombresUnidades && r.nombresUnidades[u - 1]) || r.nombre + ((r.unidades || 1) > 1 ? ' ' + u : ''); }
  // Módulos que el negocio enciende o apaga (sin la clave, encendido). "efectiva" = la configuración con los módulos apagados aplicados, como en el servidor
  var MODULOS = ['pagos', 'promociones', 'extras', 'avisos', 'espera', 'campos', 'modificar'];
  function modulo(c, k) { return !(c.modulos && c.modulos[k] === false); }
  function efectiva(c) {
    var e = Object.assign({}, c);
    if (!modulo(c, 'pagos')) { e.politicas = Object.assign({}, c.politicas, { deposito: 0 }); e.pagoDemo = false; }
    if (!modulo(c, 'promociones')) { e.reglas = []; e.promos = []; }
    if (!modulo(c, 'avisos')) e.notif = {};
    if (!modulo(c, 'campos')) e.campos = [];
    if (c.modo === 'noches' && !modulo(c, 'extras')) e.servicios = [];
    return e;
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
  function libresNoche(d, rec, fecha, salvo) { var r = recurso(d, rec), a = fdate(fecha).getTime(); return r.unidades - ocupan(d, rec, a, a + 864e5, salvo); }
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
      d.reservas.forEach(function (r) { if (r.estado === 'retenida' && r.expira && r.expira < Date.now()) return; if (ACTIVAS[r.estado] && r.servicio === s.id && r.desde === a && r.id !== sel.salvo) usados += r.personas; });
      var bloq = d.bloqueos.some(function (b) { return b.recurso === s.id && !b.quitado && b.desde <= a && b.hasta > a; });   // un bloqueo cierra la salida
      return { min: minH(h), hora: h, quedan: bloq ? 0 : Math.max(0, s.capacidad - usados), capacidad: s.capacidad, bloqueado: bloq, valida: a >= lim.desde && a <= lim.hasta };
    }).filter(function (x) { return x.valida; });
  }
  // Unidades bloqueadas por el negocio en una noche (para decir "bloqueado" y no "completo")
  function bloqueadasNoche(d, rec, fecha) { var a = fdate(fecha).getTime(), b = a + 864e5, n = 0; d.bloqueos.forEach(function (x) { if (x.recurso === rec && !x.quitado && x.desde < b && x.hasta > a) n += x.unidades || 1; }); return n; }
  var fcorta = function (f) { return fdate(f).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }); };
  // Estado de cada día del mes para el calendario, con lo que queda (info de total) y el MOTIVO de cada día que no se puede elegir:
  // libre, pocos, lleno, bloqueado, cerrado, pasado (ya pasó o muy pronto), lejos, corte (hay una noche completa antes) o min (estadía mínima)
  function mes(d, sel, anio, mesN) {
    var c = d.config, P = c.politicas, out = {}, n = new Date(anio, mesN + 1, 0).getDate(), lim = limites(c), hoyS = hoy();
    var eligeSalida = c.modo === 'noches' && sel.recurso && sel.llegada && !sel.salida, corte = null, minN = 1;
    if (eligeSalida) {   // primera noche completa después de la llegada: no se puede salir después de ella
      for (var k = 0; k < 62 && !corte; k++) { var fk = sumaDias(sel.llegada, k); if (libresNoche(d, sel.recurso, fk, sel.salvo) <= 0) corte = fk; }
      minN = enTemporada(c, sel.llegada) ? P.estadiaMinAlta || 1 : P.estadiaMin || 1;
    }
    for (var i = 1; i <= n; i++) {
      var f = anio + '-' + pad(mesN + 1) + '-' + pad(i), ini = fdate(f).getTime(), fin = ini + 864e5, est = 'cerrado', info = '', total = '', motivo = '';
      if (f < hoyS) { out[f] = { estado: 'pasado', motivo: 'Este día ya pasó.' }; continue; }
      if (eligeSalida && f > sel.llegada) {   // eligiendo el día de salida: vale si todas las noches anteriores tienen cupo y se cumple el mínimo
        var nn = difDias(sel.llegada, f);
        if (ini > lim.hasta) out[f] = { estado: 'lejos', motivo: 'Todavía no se puede reservar para tan adelante (hasta ' + (P.maxDias || 365) + ' días).' };
        else if (corte && f > corte) out[f] = { estado: 'corte', motivo: 'La noche del ' + fcorta(corte) + ' está completa: puedes salir a más tardar ese día.' };
        else if (nn < minN) out[f] = { estado: 'min', motivo: 'En estas fechas la estadía mínima es de ' + minN + ' noches.' };
        else out[f] = { estado: 'libre', info: nn, motivo: nn + (nn === 1 ? ' noche' : ' noches') };
        continue;
      }
      if (fin <= lim.desde - (c.modo === 'noches' ? 0 : 864e5)) { out[f] = { estado: 'pasado', motivo: 'Muy pronto: se reserva con al menos ' + P.anticipacionHoras + ' horas de anticipación.' }; continue; }
      if (ini > lim.hasta) { out[f] = { estado: 'lejos', motivo: 'Todavía no se puede reservar para tan adelante (hasta ' + (P.maxDias || 365) + ' días).' }; continue; }
      if (c.modo === 'noches') {
        var recs = sel.recurso ? [recurso(d, sel.recurso)] : c.recursos, lb = 0, bl = 0;
        total = recs.reduce(function (t, r) { return t + r.unidades; }, 0);
        recs.forEach(function (r) { lb += Math.max(0, libresNoche(d, r.id, f, sel.salvo)); bl += bloqueadasNoche(d, r.id, f); });
        est = lb <= 0 ? (bl >= total ? 'bloqueado' : 'lleno') : lb / total <= .34 ? 'pocos' : 'libre'; info = lb;
        motivo = est === 'bloqueado' ? 'No disponible: el negocio cerró esta fecha.' : est === 'lleno' ? (total === 1 ? 'Ocupado: ya está reservado.' : 'Completo: no queda ninguna de ' + total + '.') : 'Quedan ' + lb + ' de ' + total + '.';
      }
      else if (c.modo === 'cupos') {
        if (!sel.servicio) { est = 'libre'; motivo = ''; }
        else {
          var sl = salidas(d, { servicio: sel.servicio, fecha: f, salvo: sel.salvo }), s0 = servicio(d, sel.servicio);
          if (s0 && s0.dias.indexOf(diaSem(f)) < 0) { est = 'cerrado'; motivo = 'Este tour no sale los ' + fdate(f).toLocaleDateString('es-CL', { weekday: 'long' }) + '.'; }
          else if (!sl.length) { est = 'pasado'; motivo = 'Las salidas de este día ya no se pueden reservar.'; }
          else if (sl.every(function (x) { return x.bloqueado; })) { est = 'bloqueado'; motivo = 'No disponible: el negocio cerró esta fecha.'; }
          else { var q = sl.reduce(function (t, x) { return t + x.quedan; }, 0), cap = sl.reduce(function (t, x) { return t + x.capacidad; }, 0); est = q < (sel.personas || 1) ? 'lleno' : q / cap <= .3 ? 'pocos' : 'libre'; info = q; total = cap; motivo = est === 'lleno' ? (q ? 'Quedan ' + q + ' cupos: no alcanzan para ' + sel.personas + ' personas.' : 'Completo: no quedan cupos.') : 'Quedan ' + q + ' de ' + cap + ' cupos.'; }
        }
      }
      else if (!abierto(c, f).length) { est = 'cerrado'; motivo = 'Cerrado este día.'; }
      else if (sel.servicio || sel.recurso) { var hs = horas(d, { servicio: sel.servicio, recurso: sel.recurso, fecha: f, horas: sel.horas, salvo: sel.salvo }); est = !hs.length ? 'lleno' : hs.length <= 4 ? 'pocos' : 'libre'; info = hs.length; motivo = hs.length ? hs.length + (hs.length === 1 ? ' hora libre.' : ' horas libres.') : 'Sin horas libres este día.'; }
      else { est = 'libre'; }
      out[f] = { estado: est, info: info, total: total, motivo: motivo };
    }
    return out;
  }
  // Días libres más cercanos a una fecha (para sugerir cuando el elegido no se puede)
  function cercanas(d, sel, fecha, max) {
    var out = [], anio, m, est = {};
    for (var k = 1; k <= 45 && out.length < (max || 3); k++) {
      [sumaDias(fecha, k), sumaDias(fecha, -k)].forEach(function (f) {
        if (out.length >= (max || 3) || f < hoy()) return;
        var key = f.slice(0, 7); if (!est[key]) { anio = +f.slice(0, 4); m = +f.slice(5, 7) - 1; est[key] = mes(d, sel, anio, m); }
        var e = est[key][f]; if (e && (e.estado === 'libre' || e.estado === 'pocos')) out.push(f);
      });
    }
    return out.sort();
  }

  // ---------- Precio ----------
  function precio(d, sel, codigo) {
    var c = efectiva(d.config), lineas = [], base = 0, extra = 0, inicio, noches = 0;
    if (c.modo === 'noches') {
      var r = recurso(d, sel.recurso); noches = difDias(sel.llegada, sel.salida); inicio = fdate(sel.llegada).getTime();
      for (var i = 0; i < noches; i++) {
        var f = sumaDias(sel.llegada, i), t = enTemporada(c, f), ds = diaSem(f), fin = ds === 5 || ds === 6;
        base += Math.round(r.precio * (t ? t.factor : 1) * (fin ? c.factorFinde : 1) / 100) * 100;
      }
      lineas.push([r.nombre + ' · ' + noches + (noches === 1 ? ' noche' : ' noches'), base]);
      (sel.extras || []).forEach(function (x) { var s = c.servicios.filter(function (y) { return y.id === x; })[0]; if (s) { extra += s.precio; lineas.push([s.nombre, s.precio]); } });
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
      for (var i = 0; i < n; i++) if (libresNoche(d, r.id, sumaDias(sel.llegada, i), sel.salvo) <= 0) return 'Alguien acaba de tomar una de esas noches. Elige otras fechas.';
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
    if (nubes[id]) return crearNube(id, sel, cliente, opc);   // conectado: devuelve una promesa con { reserva } o { error }
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
        canal: opc.canal || 'Sitio web', idioma: cliente.idioma || 'es', historial: [{ estado: conDep ? 'retenida' : 'confirmada', t: Date.now() }], semilla: !!opc.semilla, respuestas: opc.respuestas || {} };
      if (c.modo !== 'cupos') { r.unidad = unidadPara(d, rec, desde, hasta, null); r.unidadNombre = nombreUnidad(recurso(d, rec), r.unidad); }
      if (pr.promo && pr.promo.codigo && pr.motivo.indexOf(pr.promo.codigo) > -1) c.promos.forEach(function (p) { if (p.codigo === pr.promo.codigo) p.usos++; });
      d.reservas.push(r);
      if (!opc.semilla) programarAvisos(d, r, conDep ? 'pago' : 'confirmacion');
      return { reserva: r };
    });
  }
  function estado(id, rid, nuevo, extra) {
    if (nubes[id]) return escribirRes(id, rid, { estado: nuevo, pagado: extra && extra.pagado }, 'parchar').then(function (x) { return x.error ? x : x.reserva; });   // conectado: promesa
    return cambiar(id, function (d) {
      var r = d.reservas.filter(function (x) { return x.id === rid; })[0]; if (!r) return null;
      if ((nuevo === 'pagada' || nuevo === 'confirmada') && (r.estado === 'cancelada' || (r.estado === 'retenida' && r.expira && r.expira < Date.now()))) return { error: 'La retención venció y la fecha se liberó. Haz una reserva nueva.' };   // no se revive: la fecha pudo venderse a otra persona
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
  function cancelar(id, rid, por) { if (nubes[id]) return estado(id, rid, 'cancelada'); var d = leer(id), r = d.reservas.filter(function (x) { return x.id === rid; })[0]; if (!r) return null; var rb = reembolso(d, r); return estado(id, rid, 'cancelada', { reembolso: rb, canceladaPor: por || 'cliente' }); }
  function esperar(id, sel, cliente) {
    if (nubes[id]) return Nube.escribir(NUBE, 'espera', Nube.idNuevo(), { agenda: id, neg: id, sel: sel, cliente: cliente }, { modo: 'poner' }).then(function () { return { ok: true }; }).catch(function (e) { return { error: mensajeError(e && e.codigo ? e.codigo : 'red') }; });
    return cambiar(id, function (d) { d.espera = d.espera || []; var e = { id: 'e' + Date.now().toString(36), t: Date.now(), sel: sel, cliente: cliente, avisado: false }; d.espera.push(e); return e; }); }
  function avisarEspera(d, r) {
    (d.espera || []).forEach(function (e) {
      if (e.avisado) return;
      var mismo = d.config.modo === 'noches' ? e.sel.recurso === r.recurso && fdate(e.sel.llegada).getTime() < r.hasta && fdate(e.sel.salida).getTime() > r.desde : (e.sel.servicio === r.servicio || e.sel.recurso === r.recurso) && e.sel.fecha === fstr(new Date(r.desde));
      if (mismo) { e.avisado = true; aviso(d, { id: e.id, codigo: 'ESPERA', cliente: e.cliente, desde: r.desde }, 'espera', Date.now()); }
    });
  }

  // ---------- Avisos automáticos (correo y WhatsApp; en la demo se registran como enviados, no salen) ----------
  function aviso(d, r, tipo, cuando) {
    var cfg = (efectiva(d.config).notif || {})[tipo]; if (!cfg || !cfg.activo) return;
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
      recordatorio: 'Recordatorio: te esperamos en ' + n + ' el ' + cu + '. Si no puedes venir, cancela desde tu enlace.', resena: '¿Cómo te fue en ' + n + '? ' + (/^https:\/\//.test(d.config.resenaUrl || '') ? 'Déjanos tu opinión en Google, nos ayuda mucho: ' + d.config.resenaUrl : 'Cuéntanos en 1 minuto.'),
      cancelacion: 'Tu reserva ' + r.codigo + ' en ' + n + ' fue cancelada.' + (r.reembolso && r.reembolso.monto ? ' Te devolvemos ' + clp(r.reembolso.monto) + '.' : ''), espera: 'Se liberó un cupo en ' + n + ' para la fecha que esperabas. Reserva antes que otro.' }[tipo];
  }
  // Tareas automáticas: vencer retenciones sin pago, enviar avisos programados, cerrar reservas pasadas
  function automatico(id) {
    if (nubes[id]) return automaticoNube(id);
    var d = leer(id), cambio = false, ahora = Date.now(), equipo = true;
    d.reservas.forEach(function (r) {
      if (r._pub) return;
      if (r.estado === 'retenida' && r.expira && r.expira < ahora) { r.estado = 'cancelada'; r.canceladaPor = 'sistema: no se pagó a tiempo'; r.historial.push({ estado: 'cancelada', t: ahora }); avisarEspera(d, r); cambio = true; }
      if (equipo && (r.estado === 'confirmada' || r.estado === 'pagada') && r.desde <= ahora && r.hasta > ahora && !r.semilla) { r.estado = 'checkin'; r.historial.push({ estado: 'checkin', t: ahora, auto: true }); cambio = true; }   // llegó la hora: queda "En curso"
      if (equipo && (r.estado === 'confirmada' || r.estado === 'pagada' || r.estado === 'checkin') && r.hasta < ahora && !r.semilla) { r.estado = 'completada'; r.historial.push({ estado: 'completada', t: ahora }); cambio = true; }
    });
    if (equipo) d.avisos.forEach(function (a) { if (a.estado === 'programado' && a.cuando <= ahora) { a.estado = 'enviado (demo)'; a.enviado = ahora; cambio = true; } });
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
    if (nubes[id]) return importarIcalNube(id, rec, txt, origen);
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
  // Quitar un bloqueo manual: las fechas vuelven a estar disponibles (en la nube se marca como quitado; el historial queda)
  function quitarBloqueo(id, bid) {
    var sacar = function () { var d = leer(id); d.bloqueos = d.bloqueos.filter(function (b) { return b.id !== bid; }); guardar(id, d, true); };
    if (!nubes[id]) { sacar(); return Promise.resolve({ ok: true }); }
    return Nube.escribir(NUBE, 'bloqueos', bid, { quitado: true }, { pin: pinEquipo(), modo: 'parchar' }).then(function () { sacar(); nubes[id].sondeos[3].ya(); return { ok: true }; }).catch(function (e) { return { error: mensajeError(e && e.codigo ? e.codigo : 'red') }; });
  }
  function importarIcalNube(id, rec, txt, origen) {
    var eventos = String(txt).replace(/\r\n[ \t]/g, '').split('BEGIN:VEVENT').slice(1), pin = pinEquipo();
    var fecha = function (v) { var m = /(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime() : null; };
    var filas = [];
    eventos.forEach(function (ev) { var g = function (k) { var m = new RegExp('^' + k + '[^:]*:(.*)$', 'm').exec(ev); return m ? m[1].trim() : ''; }; var a = fecha(g('DTSTART')), b = fecha(g('DTEND')) || (a && a + 864e5); if (a && b && b > a) filas.push({ desde: a, hasta: b, motivo: (g('SUMMARY') || 'Reservado') + ' (' + origen + ')' }); });
    return Nube.borrar(NUBE, 'bloqueos', pin, { filtro: { agenda: id, recurso: rec, origen: origen } }).catch(function () {}).then(function () {
      return Promise.all(filas.map(function (f) { return Nube.escribir(NUBE, 'bloqueos', Nube.idNuevo(), { agenda: id, neg: id, recurso: rec, desde: f.desde, hasta: f.hasta, motivo: f.motivo, origen: origen }, { pin: pin, modo: 'poner' }).catch(function () {}); }));
    }).then(function () { nubes[id].sondeos[3].ya(); return filas.length; });
  }
  // Bloquear fechas: de una unidad (unidad = número) o de todas las unidades del recurso (unidad = 'todas', lo normal al cerrar por vacaciones o mantención)
  function bloquear(id, rec, desde, hasta, motivo, unidad) {
    var todas = unidad === 'todas' || unidad == null, u = todas ? null : +unidad;
    if (nubes[id]) return Nube.escribir(NUBE, 'bloqueos', Nube.idNuevo(), { agenda: id, neg: id, recurso: rec, desde: desde, hasta: hasta, motivo: motivo || 'Bloqueo manual', origen: 'manual', todas: todas, unidad: u }, { pin: pinEquipo(), modo: 'poner' }).then(function () { nubes[id].sondeos[3].ya(); return { ok: true }; }).catch(function (e) { return { error: mensajeError(e && e.codigo ? e.codigo : 'red') }; });
    return cambiar(id, function (d) { var r = recurso(d, rec), tot = r ? Math.max(1, r.unidades || 1) : 1; d.bloqueos.push({ id: 'b' + Date.now().toString(36), recurso: rec, desde: desde, hasta: hasta, motivo: motivo || 'Bloqueo manual', origen: 'manual', unidades: u ? 1 : tot, unidad: u, todas: !u && tot > 1 }); }); }

  // ---------- Datos de prueba para el panel (marcados; clientes "de prueba") ----------
  function sembrar(id) {
    if (nubes[id]) return;   // los datos de muestra solo existen en modo local
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
  function restablecer(id) {
    if (nubes[id]) {   // en la nube solo el jefe puede vaciar; se vuelve a leer todo desde cero
      var pin = pinEquipo();
      return Promise.all(['reservas', 'avisos', 'espera', 'bloqueos'].map(function (c) { return Nube.vaciar(NUBE, c, pin); })).then(function (r) {
        if (r[0] && r[0].error) throw new Error('sin permiso');
        try { localStorage.removeItem(V + id); } catch (e) {} nubes[id].sondeos.forEach(function (x) { x.reiniciar(); }); avisar(id);
      });
    }
    try { localStorage.removeItem(V + id); } catch (e) {} avisar(id); return Promise.resolve();
  }
  function guardarConfig(id, fn) { var x = cambiar(id, function (d) { fn(d.config); }); if (nubes[id]) { nubes[id].sucio = true; avisar(id); } return x; }

  var clp = function (n) { return '$' + Math.round(n).toLocaleString('es-CL'); };
  function fechaHora(d, r) {
    var f = new Date(r.desde), opc = { weekday: 'short', day: 'numeric', month: 'short' };
    if (d.config.modo === 'noches') return f.toLocaleDateString('es-CL', opc) + ' al ' + new Date(r.hasta).toLocaleDateString('es-CL', opc);
    return f.toLocaleDateString('es-CL', opc) + ' a las ' + hMin(f.getHours() * 60 + f.getMinutes());
  }
  var ESTADOS = { retenida: ['Retenida (falta pago)', '#f59e0b'], confirmada: ['Confirmada', '#3b82f6'], pagada: ['Pagada', '#22c55e'], checkin: ['En curso', '#a855f7'], completada: ['Completada', '#94a3b8'], cancelada: ['Cancelada', '#ef4444'], noshow: ['No llegó', '#b91c1c'] };


  // ---------- Nube: el servidor manda ----------
  // Conectado a la nube, este navegador NO decide nada importante: manda lo que la persona eligió (selección y datos) y el SERVIDOR calcula precio,
  // depósito, disponibilidad y estado, y valida quién puede hacer qué (cliente con el código de su reserva, recepción, jefe). Lo que vuelve es lo que vale.
  // Sin conectar, todo funciona solo en este navegador (los ejemplos de rubro de la galería). Ver memoria/reservas-sistema.md.
  var NUBE = AG.negocio || 'reservas', nubes = {};
  function pinEquipo() { return window.Nube ? Nube.pin(NUBE) : ''; }
  function mias(id) { try { return JSON.parse(localStorage.getItem(MIS + id)) || []; } catch (e) { return []; } }
  function recordarMia(id, rid) { var l = mias(id); if (l.indexOf(rid) < 0) { l.push(rid); try { localStorage.setItem(MIS + id, JSON.stringify(l.slice(-40))); } catch (e) {} } }
  function olvidarMia(id, rid) { var l = mias(id).filter(function (x) { return x !== rid; }); try { localStorage.setItem(MIS + id, JSON.stringify(l)); } catch (e) {} }

  // Mensajes para las personas: el servidor responde con códigos cortos
  var MSJ = {
    ocupado: 'Alguien acaba de tomar esa fecha u hora. Elige otra.', ya_paso: 'Esa fecha u hora ya pasó o es muy pronto para reservar.', lejos: 'Todavía no se puede reservar para tan adelante.',
    fechas: 'Revisa las fechas elegidas.', estadia_larga: 'La estadía máxima es de 60 noches.', fuera_horario: 'Esa hora no está disponible. Elige otra.', sin_salida: 'Esa salida no está disponible.',
    seleccion: 'Revisa lo que elegiste.', sin_agenda: 'Este negocio todavía no publica su agenda de reservas.', horas_max: 'Se puede arrendar hasta 12 horas seguidas.',
    demasiadas_retenciones: 'Ya tienes 2 reservas esperando pago. Págalas o espera a que venzan.', conflicto: 'Esta reserva cambió mientras la editabas. Ábrela otra vez para ver la versión actual.',
    no_modificable: 'Esta reserva ya no se puede modificar.', transicion_invalida: 'Ese cambio no está permitido para esta reserva.', retencion_vencida: 'La retención venció y la fecha se liberó. Haz una reserva nueva.',
    aun_no: 'Esa reserva todavía no empieza.', 'sin permiso': 'No tienes permiso para hacer eso.', config_invalida: 'La configuración no es válida: revisa nombres, códigos y números.', bloqueo_invalido: 'Revisa las fechas del bloqueo.',
    bloqueado: 'El negocio cerró esa fecha. Elige otra.', sin_espera: 'Este negocio no usa lista de espera.', unidad_invalida: 'Esa unidad no existe.',
    red: 'No hay conexión. Revisa tu internet e intenta de nuevo.'
  };
  function mensajeError(c) {
    c = String(c || ''); var p = c.split(':'), k = p[0], a = p.slice(1);
    if (k === 'estadia_min') return 'En esas fechas la estadía mínima es de ' + a[0] + ' noches.';
    if (k === 'capacidad') return 'La capacidad máxima es de ' + a[0] + ' personas.';
    if (k === 'minimo_personas') return 'Esta salida requiere mínimo ' + a[0] + ' personas por reserva.';
    if (k === 'cupos') return +a[0] > 0 ? 'Quedan ' + a[0] + ' cupos en esa salida.' : 'Esa salida ya no tiene cupos.';
    if (k === 'horas_min') return 'El mínimo para este espacio es de ' + a[0] + ' horas.';
    if (k === 'tarde_modificar') return 'Ya no se puede modificar: faltan menos de ' + a[0] + ' horas. Escríbele al negocio.';
    if (k === 'datos') return { nombre: 'Escribe tu nombre y apellido.', correo: 'Escribe un correo válido.', telefono: 'Escribe un celular válido, con código de país.', contacto: 'Escribe un correo o un celular válido.' }[a[0]] || 'Revisa tus datos.';
    if (k === 'transicion_invalida') return MSJ[k];
    if (k === 'unidad_ocupada') return a[0] === 'bloqueo' ? 'Esa unidad está bloqueada en esas fechas.' : 'Esa unidad está ocupada en esas fechas por la reserva ' + a[0] + '.';
    if (k === 'campo') { var cp = null; NEGOCIOS.some(function (n) { var d = leer(n.id); cp = d && (d.config.campos || []).filter(function (x) { return x.id === a[0]; })[0]; return cp; }); return cp ? 'Completa «' + cp.etiqueta + '»' + (cp.tipo === 'numero' ? ' con un número' : '') + '.' : 'Completa los datos que pide el negocio.'; }
    return MSJ[k] || MSJ[c] || 'No se pudo guardar (' + c + '). Intenta de nuevo.';
  }
  function reservaDe(id, rid) { return leer(id).reservas.filter(function (x) { return x.id === rid; })[0] || null; }
  // Escribe un cambio y devuelve lo que quedó en el servidor (o el mensaje de por qué no)
  function escribirRes(id, rid, data, modo) {
    var pin = pinEquipo();
    return Nube.cola('res' + rid, function () { return Nube.escribir(NUBE, 'reservas', rid, data, { pin: pin, modo: modo || 'parchar' }); })
      .then(function () { return traer(id, rid); })
      .then(function () { var r = reservaDe(id, rid); return r ? { ok: true, reserva: r } : { error: 'No pudimos leer la reserva. Revisa "Mis reservas".', codigo: 'lectura' }; })
      .catch(function (e) { var cod = e && e.codigo ? e.codigo : 'red'; return { error: mensajeError(cod), codigo: cod }; });
  }
  // Lee una reserva por su código secreto (sirve para cualquiera que lo tenga) y la mezcla en lo local
  function traer(id, rid) {
    return Nube.leer(NUBE, 'reservas', { ids: [rid] }).then(function (r) { fusionar(id, 'reservas', r.mios || []); });
  }
  function crearNube(id, sel, cliente, opc) {
    var rid = Nube.idNuevo();
    var doc = { agenda: id, neg: id, sel: JSON.parse(JSON.stringify(sel)), cliente: cliente, codigoPromo: opc.codigo || '', canal: opc.canal || undefined, sinPago: !!opc.sinPago, respuestas: opc.respuestas || {} };
    if (!opc.equipo) recordarMia(id, rid);   // la reserva que hace la recepción por teléfono no queda en "Mis reservas" de ese equipo
    return escribirRes(id, rid, doc, 'poner').then(function (x) { if (x.error) { olvidarMia(id, rid); return { error: x.error, codigo: x.codigo }; } return { reserva: x.reserva }; });
  }
  function modificar(id, rid, cambios) {
    if (!nubes[id]) return Promise.resolve({ error: 'Modificar reservas solo funciona conectado.' });
    var r = reservaDe(id, rid); if (!r) return Promise.resolve({ error: 'No encontramos la reserva.' });
    var data = { baseRev: r.rev || 1 };
    ['sel', 'cliente', 'codigoPromo', 'respuestas'].forEach(function (k) { if (cambios[k] !== undefined) data[k] = cambios[k]; });
    return escribirRes(id, rid, data, 'parchar');
  }
  // El equipo mueve una reserva a otra unidad del mismo alojamiento o recurso (el servidor revisa que esté libre esas fechas)
  function moverUnidad(id, rid, u) {
    u = +u;
    if (nubes[id]) return escribirRes(id, rid, { unidad: u }, 'parchar');
    return Promise.resolve(cambiar(id, function (d) {
      var r = d.reservas.filter(function (x) { return x.id === rid; })[0]; if (!r) return { error: 'No encontramos la reserva.' };
      var t = tomadas(d, r.recurso, r.desde, r.hasta, r.id); if (t[u]) return { error: mensajeError('unidad_ocupada:' + t[u]) };
      var rr = recurso(d, r.recurso), antes = r.unidadNombre || 'sin unidad'; r.unidad = u; r.unidadNombre = nombreUnidad(rr, u); r.historial.push({ estado: r.estado, t: Date.now(), movida: antes + ' → ' + r.unidadNombre });
      return { ok: true, reserva: r };
    }));
  }
  // Estado de cada unidad de un recurso en el periodo de una reserva (para elegir a dónde moverla)
  function unidadesDe(id, rid) {
    var d = leer(id), r = d.reservas.filter(function (x) { return x.id === rid; })[0]; if (!r) return [];
    var rr = recurso(d, r.recurso); if (!rr) return [];
    var t = tomadas(d, r.recurso, r.desde, r.hasta, r.id), out = [];
    for (var u = 1; u <= Math.max(1, rr.unidades || 1); u++) out.push({ u: u, nombre: nombreUnidad(rr, u), actual: r.unidad === u, ocupada: t[u] || '' });
    return out;
  }
  // Precio calculado por el servidor (con códigos de descuento, que nunca se publican)
  function cotizar(id, sel, codigo) {
    if (!nubes[id]) return Promise.resolve({ ok: true, precio: precio(leer(id), sel, codigo) });
    return Nube.rpc('reserva_cotizar', { p_neg: NUBE, p_ag: id, p_sel: sel, p_codigo: codigo || null }).catch(function () { return { error: 'red' }; });
  }

  function fusionar(id, col, filas) {
    var d = leer(id), cambio = false, lista = d[col] = d[col] || [];
    filas.forEach(function (f) {
      var x = f.data; if (!x || x.neg !== id) return; x.id = f.id;
      var i = -1; lista.forEach(function (y, k) { if (y.id === x.id) i = k; });
      if (i < 0) { lista.push(x); cambio = true; } else if (Nube.canon(lista[i]) !== Nube.canon(x)) { lista[i] = x; cambio = true; }
    });
    if (cambio) { d[col] = lista; guardar(id, d, true); }
  }
  // Lo único público de cada reserva ajena: fechas y estado, sin nombre, contacto, código ni precio
  function fusionarPub(id, pubs) {
    var d = leer(id);
    var stubs = (pubs || []).filter(function (p) { return p && p.n === id && p.e !== 'bloqueo'; }).map(function (p, i) {
      var k = String(p.r).split(':');
      return { id: 'pub-' + i, _pub: true, neg: id, recurso: k[1], servicio: p.m === 'c' ? k[1] : null, desde: p.d, hasta: p.h, personas: p.u, unidades: p.m === 'c' ? 1 : p.u, estado: p.e, expira: p.x || null };
    });
    var actuales = d.reservas.filter(function (r) { return r._pub; });
    if (Nube.canon(actuales) === Nube.canon(stubs)) return;
    d.reservas = d.reservas.filter(function (r) { return !r._pub; }).concat(stubs); guardar(id, d, true);
  }
  function fusionarBloqueos(id, r) {
    var d = leer(id), nuevos;
    if (r.staff) {
      nuevos = d.bloqueos.filter(function (b) { return !b._pub; });
      r.filas.forEach(function (f) { var x = f.data; if (!x || x.neg !== id) return; x.id = f.id; var i = -1; nuevos.forEach(function (y, k) { if (y.id === x.id) i = k; }); if (i < 0) nuevos.push(x); else nuevos[i] = x; });
    } else {
      nuevos = (r.pub || []).filter(function (p) { return p && p.n === id && p.e === 'bloqueo'; }).map(function (p, i) { return { id: 'pub-b' + i, _pub: true, recurso: String(p.r).split(':')[1], desde: p.d, hasta: p.h, unidades: p.u || 1, motivo: 'No disponible' }; });
    }
    nuevos = nuevos.filter(function (b) { return !b.quitado; });
    if (Nube.canon(nuevos) === Nube.canon(d.bloqueos)) return;
    d.bloqueos = nuevos; guardar(id, d, true);
  }
  function conectar(id) {
    if (nubes[id]) return nubes[id].listo;
    var n = nubes[id] = { ultimo: { config: null }, sondeos: [], enLinea: true, sucio: false, auto: {}, publicada: null };
    var pend = 3, fin, primera = {};
    n.listo = new Promise(function (ok) { fin = ok; setTimeout(ok, 9000); });
    var listo1 = function (k) { if (!primera[k]) { primera[k] = 1; if (--pend === 0) fin(); } };
    var base = function (ids) { return { pin: pinEquipo, ids: ids, cada: 3000, alConectar: function (ok) { if (ok !== n.enLinea) { n.enLinea = ok; oyentes.forEach(function (f) { f({ id: id, tipo: 'conexion', ok: ok }); }); } } }; };
    // La configuración publicada (precios, políticas, catálogo) la ve todo el mundo; los códigos de descuento, solo el equipo
    n.sondeos.push(Nube.sondear(NUBE, 'config', base(function () { return ['cfg-' + id]; }), function (r) {
      var fila = r.filas.filter(function (f) { return f.id === 'cfg-' + id; })[0];
      if (fila && fila.data && fila.data.config) {
        n.publicada = true; n.cfgVista = true;
        if (!n.sucio) {
          var d = leer(id), c = fila.data.config; c.promos = pinEquipo() ? (d.config.promos || []) : [];
          if (Nube.canon(d.config) !== Nube.canon(c)) { d.config = c; guardar(id, d, true); }
        }
      } else if (!n.cfgVista && n.publicada !== false) { n.publicada = false; oyentes.forEach(function (f) { f({ id: id, tipo: 'sinconfig' }); }); }
      listo1('c');
    }));
    n.sondeos.push(Nube.sondear(NUBE, 'promos', { pin: pinEquipo, soloSiHayIds: true, cada: 6000 }, function (r) {
      if (!r.staff || n.sucio) return;
      var f = r.filas.filter(function (x) { return x.data && x.data.agenda === id; })[0]; if (!f) return;
      var d = leer(id); if (Nube.canon(d.config.promos || []) !== Nube.canon(f.data.lista || [])) { d.config.promos = f.data.lista || []; guardar(id, d, true); }
    }));
    n.sondeos.push(Nube.sondear(NUBE, 'reservas', base(function () { return mias(id); }), function (r) {
      if (r.staff) n.equipoVisto = true;   // ya llegaron todas las reservas al equipo (el panel avisa solo de las que lleguen después)
      fusionar(id, 'reservas', r.filas); if (!r.staff) fusionarPub(id, r.pub); listo1('r');
    }));
    n.sondeos.push(Nube.sondear(NUBE, 'bloqueos', base(function () { return []; }), function (r) { fusionarBloqueos(id, r); listo1('b'); }));
    n.sondeos.push(Nube.sondear(NUBE, 'avisos', { pin: pinEquipo, soloSiHayIds: true, cada: 5000 }, function (r) { if (r.staff) fusionar(id, 'avisos', r.filas); }));
    n.sondeos.push(Nube.sondear(NUBE, 'espera', { pin: pinEquipo, soloSiHayIds: true, cada: 6000 }, function (r) { if (r.staff) fusionar(id, 'espera', r.filas); }));
    return n.listo;
  }
  // Configuración: el jefe edita un borrador y lo publica con un botón (como la carta del restaurante)
  function configPendiente(id) { return !!(nubes[id] && nubes[id].sucio); }
  function publicarConfig(id) {
    var n = nubes[id], d = leer(id), pin = pinEquipo();
    if (!n) return Promise.resolve({ ok: true });
    if (!pin) return Promise.resolve({ error: mensajeError('sin permiso') });
    return Nube.escribir(NUBE, 'config', 'cfg-' + id, { config: d.config }, { pin: pin, modo: 'poner' })
      .then(function () { n.sucio = false; n.publicada = true; n.sondeos[0].ya(); avisar(id); return { ok: true }; })
      .catch(function (e) { return { error: mensajeError(e && e.codigo ? e.codigo : 'red') }; });
  }
  function descartarConfig(id) { var n = nubes[id]; if (!n) return; n.sucio = false; n.sondeos[0].reiniciar(); avisar(id); }
  function estaPublicada(id) { return !nubes[id] || nubes[id].publicada !== false; }   // mientras no se sabe (null), se muestra la agenda de base
  // Al entrar el equipo con su PIN se vuelve a leer todo
  function entrarEquipo(id) { var n = nubes[id]; if (!n) return; n.sondeos.forEach(function (x) { x.reiniciar(); }); }
  // Un cliente que abre el enlace de su reserva en otro equipo: se agrega a las que sigue
  function seguir(id, rid) { if (rid && /^[a-z0-9]{6,40}$/.test(rid)) { recordarMia(id, rid); if (nubes[id]) { nubes[id].sondeos.forEach(function (x) { x.ya(); }); return traer(id, rid).catch(function () {}); } } return Promise.resolve(); }
  // Solo para las pruebas automáticas: deja el negocio trabajando solo en este navegador
  function desconectar(id) { var n = nubes[id]; if (!n) return; n.sondeos.forEach(function (x) { x.parar(); }); delete nubes[id]; }
  function enLinea(id) { return !nubes[id] || nubes[id].enLinea; }
  function equipoVisto(id) { return !!(nubes[id] && nubes[id].equipoVisto); }
  function listo(id) { return nubes[id] ? nubes[id].listo : Promise.resolve(); }
  function conectado(id) { return !!nubes[id]; }

  // Tareas del equipo: pasar a "En curso" y "Completada" cuando llega la hora, vencer retenciones y dar por enviados los avisos programados
  function automaticoNube(id) {
    var n = nubes[id], d = leer(id), ahora = Date.now(), pin = pinEquipo();
    d.reservas.forEach(function (r) {
      if (r._pub) return;
      var sig = null;
      if (r.estado === 'retenida' && r.expira && r.expira < ahora) sig = 'cancelada';
      else if (pin && (r.estado === 'confirmada' || r.estado === 'pagada') && r.desde <= ahora && r.hasta > ahora) sig = 'checkin';
      else if (pin && (r.estado === 'confirmada' || r.estado === 'pagada' || r.estado === 'checkin') && r.hasta < ahora) sig = 'completada';
      if (sig && !n.auto[r.id + sig]) { n.auto[r.id + sig] = 1; estado(id, r.id, sig); }
    });
    if (pin) (d.avisos || []).forEach(function (a) {
      if (a.estado === 'programado' && a.cuando <= ahora && !n.auto[a.id]) { n.auto[a.id] = 1; Nube.escribir(NUBE, 'avisos', a.id, { estado: 'enviado (simulado)', enviado: ahora }, { pin: pin, modo: 'parchar' }).catch(function () { delete n.auto[a.id]; }); }
    });
  }

  window.Reservas = {
    NEGOCIOS: NEGOCIOS, ESTADOS: ESTADOS, icono: icono, logo: logo, leer: leer, guardarConfig: guardarConfig, escuchar: function (f) { oyentes.push(f); },
    mes: mes, horas: horas, salidas: salidas, libresNoche: libresNoche, precio: precio, validar: validar, crear: crear, estado: estado, pagar: pagar,
    cancelar: cancelar, reembolso: reembolso, esperar: esperar, automatico: automatico, exportarIcal: exportarIcal, importarIcal: importarIcal, bloquear: bloquear, quitarBloqueo: quitarBloqueo,
    sembrar: sembrar, restablecer: restablecer, conectar: conectar, desconectar: desconectar, entrarEquipo: entrarEquipo, seguir: seguir, enLinea: enLinea, listo: listo, equipoVisto: equipoVisto, recurso: recurso, servicio: servicio, enTemporada: enTemporada, fechaHora: fechaHora,
    modificar: modificar, moverUnidad: moverUnidad, unidadesDe: unidadesDe, nombreUnidad: nombreUnidad, cercanas: cercanas, modulo: modulo, efectiva: efectiva, MODULOS: MODULOS, cotizar: cotizar, mensajeError: mensajeError, conectado: conectado, mias: mias, reservaDe: reservaDe, configPendiente: configPendiente, publicarConfig: publicarConfig, descartarConfig: descartarConfig, estaPublicada: estaPublicada, AGENDA: AG, NUBE: function () { return NUBE; },
    util: { fstr: fstr, fdate: fdate, hoy: hoy, sumaDias: sumaDias, difDias: difDias, diaSem: diaSem, hMin: hMin, minH: minH, clp: clp, pad: pad }
  };
})();
