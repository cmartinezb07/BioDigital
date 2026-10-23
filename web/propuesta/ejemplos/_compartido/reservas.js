/* Bío Digital · Módulo de reservas · sin librerías
 * Uso: BDReservas.montar(elementoOSelector, config)  (ver reservas-LEEME.md)
 * Modo "horas": servicio > profesional > día > hora > datos > resumen.
 * Modo "noches": alojamiento > fechas > huéspedes y total > datos > resumen.
 * Nivel 1: la solicitud sale por WhatsApp (wa.me). Nivel 2 opcional: config.envio = { url, llave, tabla }.
 * Todo el texto se escribe con textContent / createTextNode: nada de innerHTML.
 */
(function () {
  'use strict';
  if (window.BDReservas && window.BDReservas.version) return;

  var TZ = 'America/Santiago';
  var LOC = 'es-CL';
  var contador = 0;

  /* ---------------------------------------------------------------- fechas (civiles, 'AAAA-MM-DD') */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fechaStr(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function parseFecha(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    var t = new Date(Date.UTC(y, mo - 1, d));
    if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d };
  }
  function utcDe(s) { var p = parseFecha(s); return Date.UTC(p.y, p.m - 1, p.d); }
  function deUtc(ms) { var t = new Date(ms); return fechaStr(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); }
  function sumaDias(s, n) { return deUtc(utcDe(s) + n * 86400000); }
  function difDias(a, b) { return Math.round((utcDe(b) - utcDe(a)) / 86400000); }
  function diaSemana(s) { return new Date(utcDe(s)).getUTCDay(); } // 0 = domingo
  function mesDe(s) { return s.slice(0, 7); }
  function diasDelMes(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function sumaMeses(s, k) {
    var p = parseFecha(s);
    var idx = p.y * 12 + (p.m - 1) + k;
    var y = Math.floor(idx / 12), m = idx % 12 + 1;
    return fechaStr(y, m, Math.min(p.d, diasDelMes(y, m)));
  }
  function minDeHora(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 24 || mi > 59 || (h === 24 && mi > 0)) return null;
    return h * 60 + mi;
  }
  function horaStr(min) { return pad(Math.floor(min / 60) % 24) + ':' + pad(min % 60); }

  var fPartes = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  // Reloj civil de Santiago: { fecha, min (minutos desde medianoche), ms (el reloj civil expresado como UTC) }
  function civilSantiago(ms) {
    var o = {};
    fPartes.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    var hh = +o.hour % 24;
    return { fecha: o.year + '-' + o.month + '-' + o.day, min: hh * 60 + (+o.minute), ms: Date.UTC(+o.year, +o.month - 1, +o.day, hh, +o.minute, +o.second) };
  }
  // Instante UTC (ms) en que en Santiago son las <min> minutos de <fecha>; considera el horario de verano de Chile.
  function utcDeSantiago(fecha, min) {
    var p = parseFecha(fecha);
    var civil = Date.UTC(p.y, p.m - 1, p.d, 0, min);
    var guess = civil;
    for (var i = 0; i < 3; i++) { var off = civilSantiago(guess).ms - guess; guess = civil - off; }
    return guess;
  }

  var fLarga = new Intl.DateTimeFormat(LOC, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  var fMesAnio = new Intl.DateTimeFormat(LOC, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  var fDiaLargo = new Intl.DateTimeFormat(LOC, { weekday: 'long', timeZone: 'UTC' });
  var fDiaCorto = new Intl.DateTimeFormat(LOC, { weekday: 'short', timeZone: 'UTC' });
  var fMesCorto = new Intl.DateTimeFormat(LOC, { month: 'short', timeZone: 'UTC' });
  var fPlata = new Intl.NumberFormat(LOC, { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  function mediodia(s) { return new Date(utcDe(s) + 43200000); }
  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function sinPunto(s) { return s.replace(/\./g, ''); }
  function fechaLarga(s) { return fLarga.format(mediodia(s)).replace(',', ''); }
  function fechaCorta(s) {
    var p = parseFecha(s);
    return sinPunto(fDiaCorto.format(mediodia(s))) + ' ' + p.d + ' ' + sinPunto(fMesCorto.format(mediodia(s)));
  }
  function plata(n) { return fPlata.format(n); }
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  var DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
  function claveDia(k) { return String(k).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3); }

  // Feriados de Chile 2026-2027 (aproximados: verificar cada año en feriados.cl / bcn.cl). Se pueden ampliar con config.feriados.
  var FERIADOS_CL = ['2026-01-01', '2026-04-03', '2026-04-04', '2026-05-01', '2026-05-21', '2026-06-21', '2026-06-29', '2026-07-16', '2026-08-15', '2026-09-18', '2026-09-19', '2026-10-12', '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25',
    '2027-01-01', '2027-03-26', '2027-03-27', '2027-05-01', '2027-05-21', '2027-06-21', '2027-06-28', '2027-07-16', '2027-08-15', '2027-09-18', '2027-09-19', '2027-10-11', '2027-10-31', '2027-11-01', '2027-12-08', '2027-12-25'];

  /* ---------------------------------------------------------------- utilidades varias */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13; h = Math.imul(h, 3266489917); h ^= h >>> 16;
    return h >>> 0;
  }
  function pseudo(str) { return (hash(str) % 10000) / 10000; } // 0 a 0,9999: siempre igual para el mismo texto
  function texto(v) { return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : ''; }
  function slug(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'reserva'; }

  function normalizarCelular(s) {
    var crudo = String(s == null ? '' : s).trim();
    if (!crudo || !/^[\d\s+()\-.]+$/.test(crudo)) return { ok: false };
    var d = crudo.replace(/\D/g, '');
    if (d.length === 11 && d.indexOf('56') === 0) d = d.slice(2);
    if (!/^9\d{8}$/.test(d)) return { ok: false };
    return { ok: true, digitos: '56' + d, e164: '+56' + d, bonito: '+56 9 ' + d.slice(1, 5) + ' ' + d.slice(5) };
  }
  function correoValido(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 120; }

  /* ---------------------------------------------------------------- DOM seguro */
  function h(tag, attrs, hijos) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k.indexOf('on') === 0 && typeof v === 'function') { e.addEventListener(k.slice(2), v); return; }
      if (v === false && !/^(aria|data)-/.test(k)) return;
      if (v === true && !/^(aria|data)-/.test(k)) v = '';
      e.setAttribute(k, String(v));
    });
    (function add(l) {
      if (l == null || l === false) return;
      if (Array.isArray(l)) { l.forEach(add); return; }
      e.appendChild(typeof l === 'object' ? l : document.createTextNode(String(l)));
    })(hijos);
    return e;
  }
  function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  /* ---------------------------------------------------------------- validación y normalización de la config */
  function parseRangos(v, etiqueta, err) {
    if (v == null || v === false || v === '' || v === 'cerrado') return [];
    var lista = Array.isArray(v) ? v : [v];
    if (lista.length === 2 && typeof lista[0] === 'string' && typeof lista[1] === 'string' && lista[0].indexOf('-') < 0 && lista[1].indexOf('-') < 0) lista = [lista];
    var out = [];
    lista.forEach(function (x) {
      var a = null, b = null;
      if (Array.isArray(x)) { a = minDeHora(x[0]); b = minDeHora(x[1]); }
      else if (typeof x === 'string' && x.indexOf('-') > 0) { var p = x.split('-'); a = minDeHora(p[0]); b = minDeHora(p[1]); }
      if (a == null || b == null || b <= a) err.push('Horario inválido en ' + etiqueta + ': usa "09:00-13:00" o ["09:00","13:00"].');
      else out.push([a, b]);
    });
    return out.sort(function (p, q) { return p[0] - q[0]; });
  }
  function parseSemana(obj, etiqueta, err) {
    var sem = [[], [], [], [], [], [], []];
    if (!obj || typeof obj !== 'object') return sem;
    Object.keys(obj).forEach(function (k) {
      var i = DIAS.indexOf(claveDia(k));
      if (i < 0) { err.push('Día desconocido en ' + etiqueta + ': "' + k + '". Usa dom, lun, mar, mie, jue, vie, sab.'); return; }
      sem[i] = parseRangos(obj[k], etiqueta + ' (' + k + ')', err);
    });
    return sem;
  }
  function listaFechas(v, nombre, err, conHora) {
    var out = [];
    if (v == null) return out;
    if (!Array.isArray(v)) { err.push('"' + nombre + '" debe ser una lista.'); return out; }
    v.forEach(function (x) {
      var s = String(x), f = s.slice(0, 10);
      var okHora = !conHora || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s) || /^\d{4}-\d{2}-\d{2}$/.test(s);
      if (!parseFecha(f) || !okHora) err.push('"' + nombre + '" tiene un valor inválido: "' + s + '" (usa AAAA-MM-DD' + (conHora ? ' o AAAA-MM-DD HH:MM' : '') + ').');
      else out.push(s);
    });
    return out;
  }
  function entero(v, min, max) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= min && v <= max; }

  function normalizar(cfg, el) {
    var err = [];
    if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) return { ok: false, errores: ['No se entregó la configuración (segundo argumento de BDReservas.montar).'] };
    var c = {};
    c.modo = cfg.modo;
    if (c.modo !== 'horas' && c.modo !== 'noches') err.push('"modo" debe ser "horas" o "noches".');
    c.negocio = texto(cfg.negocio); if (!c.negocio) err.push('Falta "negocio" (nombre del negocio).');
    c.comuna = texto(cfg.comuna); if (!c.comuna) err.push('Falta "comuna" (va como ubicación en el calendario).');
    c.direccion = texto(cfg.direccion);
    c.demo = cfg.demo === true || !!(el && el.hasAttribute('data-demo') && el.getAttribute('data-demo') !== 'false');
    var wa = String(cfg.whatsapp == null ? '' : cfg.whatsapp).replace(/\D/g, '');
    if (wa.length === 9 && wa.charAt(0) === '9') wa = '56' + wa;
    if (wa && !/^569\d{8}$/.test(wa)) { err.push('"whatsapp" debe ser un celular chileno, por ejemplo "56912345678".'); wa = ''; }
    else if (!wa && !c.demo) err.push('Falta "whatsapp" (celular del negocio, ej. "56912345678"). Solo se puede omitir con demo: true.');
    c.whatsapp = wa;
    c.titulo = texto(cfg.titulo);
    c.nivelTitulo = entero(cfg.nivelTitulo, 2, 5) ? cfg.nivelTitulo : 3;
    c.precioDeEjemplo = c.demo || cfg.precioDeEjemplo === true;
    if (cfg.envio != null) {
      var e = cfg.envio;
      if (!e || typeof e !== 'object' || !/^https:\/\//.test(String(e.url || '')) || !texto(e.llave) || !texto(e.tabla)) err.push('"envio" debe ser { url: "https://…", llave: "…", tabla: "…" }.');
      else c.envio = { url: String(e.url).replace(/\/+$/, ''), llave: texto(e.llave), tabla: texto(e.tabla), enDemo: e.enDemo === true };
    }
    var feriados = listaFechas(cfg.feriados, 'feriados', err);
    c.feriados = {}; (cfg.feriadosChile === false ? [] : FERIADOS_CL).concat(feriados).forEach(function (f) { c.feriados[f] = true; });
    c.cerrados = {}; listaFechas(cfg.cerrados, 'cerrados', err).forEach(function (f) { c.cerrados[f] = true; });

    if (c.modo === 'horas') {
      if (!Array.isArray(cfg.servicios) || !cfg.servicios.length) err.push('Falta "servicios": una lista con al menos un servicio { nombre, duracion }.');
      c.servicios = (Array.isArray(cfg.servicios) ? cfg.servicios : []).map(function (s, i) {
        var n = texto(s && s.nombre);
        if (!n) err.push('El servicio ' + (i + 1) + ' no tiene "nombre".');
        if (!s || !entero(s.duracion, 5, 720)) err.push('El servicio "' + (n || i + 1) + '" necesita "duracion" en minutos (entero entre 5 y 720).');
        if (s && s.precio != null && !(typeof s.precio === 'number' && s.precio >= 0)) err.push('El "precio" del servicio "' + n + '" debe ser un número.');
        return { nombre: n, duracion: s && s.duracion, precio: s && typeof s.precio === 'number' ? s.precio : null, descripcion: texto(s && s.descripcion) };
      });
      c.intervalo = cfg.intervalo == null ? 30 : cfg.intervalo;
      if (!entero(c.intervalo, 5, 240)) err.push('"intervalo" debe ser un número entero de minutos entre 5 y 240.');
      c.anticipacionHoras = cfg.anticipacionHoras == null ? 2 : cfg.anticipacionHoras;
      if (!(typeof c.anticipacionHoras === 'number' && c.anticipacionHoras >= 0 && c.anticipacionHoras <= 720)) err.push('"anticipacionHoras" debe ser un número de horas (0 o más).');
      c.diasAdelante = cfg.diasAdelante == null ? 30 : cfg.diasAdelante;
      if (!entero(c.diasAdelante, 1, 365)) err.push('"diasAdelante" debe ser un entero entre 1 y 365.');
      c.horario = parseSemana(cfg.horario, 'horario', err);
      c.profesionales = (Array.isArray(cfg.profesionales) ? cfg.profesionales : []).map(function (p, i) {
        var nom = texto(typeof p === 'string' ? p : p && p.nombre);
        if (!nom) err.push('El profesional ' + (i + 1) + ' no tiene "nombre".');
        var ph = p && typeof p === 'object' && p.horario ? parseSemana(p.horario, 'horario de ' + nom, err) : null;
        return { nombre: nom, horario: ph, ocupados: p && typeof p === 'object' ? listaFechas(p.ocupados, 'ocupados de ' + nom, err, true) : [] };
      });
      c.ocupados = listaFechas(cfg.ocupados, 'ocupados', err, true);
      var hay = c.horario.some(function (r) { return r.length; }) || c.profesionales.some(function (p) { return p.horario && p.horario.some(function (r) { return r.length; }); });
      if (!hay) err.push('"horario" no tiene ningún tramo. Ejemplo: horario: { lun: ["09:00-13:00", "15:00-19:00"], mar: ["09:00-19:00"] }.');
    } else if (c.modo === 'noches') {
      if (!Array.isArray(cfg.alojamientos) || !cfg.alojamientos.length) err.push('Falta "alojamientos": una lista con al menos uno { nombre, capacidad, precioNoche }.');
      c.alojamientos = (Array.isArray(cfg.alojamientos) ? cfg.alojamientos : []).map(function (a, i) {
        var n = texto(a && a.nombre);
        if (!n) err.push('El alojamiento ' + (i + 1) + ' no tiene "nombre".');
        if (!a || !entero(a.capacidad, 1, 50)) err.push('El alojamiento "' + (n || i + 1) + '" necesita "capacidad" (entero entre 1 y 50).');
        if (!a || !(typeof a.precioNoche === 'number' && a.precioNoche >= 0)) err.push('El alojamiento "' + (n || i + 1) + '" necesita "precioNoche" (número en pesos).');
        return { nombre: n, capacidad: a && a.capacidad, precioNoche: a && a.precioNoche, descripcion: texto(a && a.descripcion), ocupadas: a ? listaFechas(a.ocupadas, 'ocupadas de ' + n, err) : [] };
      });
      c.minNoches = cfg.minNoches == null ? 1 : cfg.minNoches;
      if (!entero(c.minNoches, 1, 60)) err.push('"minNoches" debe ser un entero de 1 o más.');
      c.maxNoches = cfg.maxNoches == null ? 30 : cfg.maxNoches;
      if (!entero(c.maxNoches, 1, 120) || c.maxNoches < c.minNoches) err.push('"maxNoches" debe ser un entero mayor o igual que "minNoches".');
      c.diasAdelante = cfg.diasAdelante == null ? 180 : cfg.diasAdelante;
      if (!entero(c.diasAdelante, 1, 730)) err.push('"diasAdelante" debe ser un entero entre 1 y 730.');
      c.anticipacionDias = cfg.anticipacionDias == null ? 1 : cfg.anticipacionDias;
      if (!entero(c.anticipacionDias, 0, 365)) err.push('"anticipacionDias" debe ser un entero de 0 o más.');
      c.ocupados = listaFechas(cfg.ocupados, 'ocupados', err);
    }
    return err.length ? { ok: false, errores: err } : { ok: true, c: c };
  }

  /* ---------------------------------------------------------------- calendario accesible (grid) */
  function crearCalendario(o) {
    var mes = o.mesInicial, foco = o.focoInicial;
    var raiz = h('div', { class: 'res-cal' });
    var titulo = h('p', { class: 'res-cal-titulo', id: o.id + '-t', 'aria-live': 'polite' });
    var bPrev = h('button', { type: 'button', class: 'res-icono', 'aria-label': 'Mes anterior' }, [h('span', { 'aria-hidden': 'true' }, ['‹'])]);
    var bSig = h('button', { type: 'button', class: 'res-icono', 'aria-label': 'Mes siguiente' }, [h('span', { 'aria-hidden': 'true' }, ['›'])]);
    var tabla = h('table', { class: 'res-grid', role: 'grid', 'aria-labelledby': o.id + '-t' });
    raiz.appendChild(h('div', { class: 'res-cal-cab' }, [bPrev, titulo, bSig]));
    raiz.appendChild(tabla);
    var hoy = o.hoy;

    function primeroHabilitado() {
      var p = mes.split('-').map(Number), n = diasDelMes(p[0], p[1]);
      for (var d = 1; d <= n; d++) { var f = fechaStr(p[0], p[1], d); if (o.estado(f).hab) return f; }
      return mes + '-01';
    }
    function render(enfocar) {
      var tenia = enfocar || tabla.contains(document.activeElement);
      var p = mes.split('-').map(Number), y = p[0], m = p[1];
      titulo.textContent = capital(fMesAnio.format(new Date(Date.UTC(y, m - 1, 1, 12))));
      bPrev.setAttribute('aria-disabled', mes <= mesDe(o.min) ? 'true' : 'false');
      bSig.setAttribute('aria-disabled', mes >= mesDe(o.max) ? 'true' : 'false');
      if (mesDe(foco) !== mes) foco = primeroHabilitado();
      vaciar(tabla);
      var cab = h('tr', { role: 'row' });
      for (var i = 0; i < 7; i++) {
        var base = '2024-01-0' + (1 + i); // 1 ene 2024 fue lunes
        cab.appendChild(h('th', { role: 'columnheader', scope: 'col' }, [h('abbr', { title: fDiaLargo.format(mediodia(base)) }, [sinPunto(fDiaCorto.format(mediodia(base)))])]));
      }
      tabla.appendChild(h('thead', null, [cab]));
      var cuerpo = h('tbody');
      var primero = fechaStr(y, m, 1), vacios = (diaSemana(primero) + 6) % 7, n = diasDelMes(y, m), d = 1, fila;
      var semanas = Math.ceil((vacios + n) / 7);
      var botonFoco = null;
      for (var w = 0; w < semanas; w++) {
        fila = h('tr', { role: 'row' });
        for (var c = 0; c < 7; c++) {
          var idx = w * 7 + c;
          if (idx < vacios || d > n) { fila.appendChild(h('td', { role: 'gridcell', class: 'res-vacio', 'aria-hidden': 'true' })); continue; }
          var f = fechaStr(y, m, d), st = o.estado(f);
          var clases = 'res-d' + (st.hab ? '' : ' res-d--no') + (st.sel ? ' res-d--' + st.sel : '') + (f === hoy ? ' res-d--hoy' : '');
          var etiqueta = fechaLarga(f) + (f === hoy ? ', hoy' : '') + (st.sel ? ', ' + ({ inicio: 'llegada', fin: 'salida', medio: 'dentro de tu estadía', unico: 'seleccionado' })[st.sel] : '') + (!st.hab && st.motivo ? ', ' + st.motivo : '');
          var b = h('button', { type: 'button', class: clases, 'data-f': f, tabindex: f === foco ? '0' : '-1', 'aria-label': etiqueta, 'aria-disabled': st.hab ? null : 'true' }, [h('span', { 'aria-hidden': 'true' }, [String(d)])]);
          if (f === foco) botonFoco = b;
          fila.appendChild(h('td', { role: 'gridcell', 'aria-selected': st.hab || st.sel ? (st.sel ? 'true' : 'false') : null }, [b]));
          d++;
        }
        cuerpo.appendChild(fila);
      }
      tabla.appendChild(cuerpo);
      if (tenia && botonFoco) botonFoco.focus();
    }
    function mover(n) {
      if (n < o.min) n = o.min;
      if (n > o.max) n = o.max;
      foco = n; mes = mesDe(n); render(true);
    }
    function cambiarMes(k) {
      var nuevo = mesDe(sumaMeses(mes + '-01', k));
      if (nuevo < mesDe(o.min) || nuevo > mesDe(o.max)) return;
      mes = nuevo; foco = primeroHabilitado(); render(false);
    }
    bPrev.addEventListener('click', function () { cambiarMes(-1); });
    bSig.addEventListener('click', function () { cambiarMes(1); });
    tabla.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-f]') : null;
      if (!b) return;
      foco = b.getAttribute('data-f');
      if (o.estado(foco).hab) o.alElegir(foco); else render(true);
    });
    tabla.addEventListener('keydown', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-f]') : null;
      if (!b) return;
      var f = b.getAttribute('data-f'), n = null, lun = (diaSemana(f) + 6) % 7;
      switch (e.key) {
        case 'ArrowLeft': n = sumaDias(f, -1); break;
        case 'ArrowRight': n = sumaDias(f, 1); break;
        case 'ArrowUp': n = sumaDias(f, -7); break;
        case 'ArrowDown': n = sumaDias(f, 7); break;
        case 'Home': n = sumaDias(f, -lun); break;
        case 'End': n = sumaDias(f, 6 - lun); break;
        case 'PageUp': n = sumaMeses(f, e.shiftKey ? -12 : -1); break;
        case 'PageDown': n = sumaMeses(f, e.shiftKey ? 12 : 1); break;
        default: return;
      }
      e.preventDefault();
      mover(n);
    });
    if (mesDe(foco) !== mes) foco = mes + '-01';
    render(false);
    return { el: raiz, refrescar: function () { render(false); } };
  }

  /* ---------------------------------------------------------------- iCalendar (.ics) */
  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function bytesUtf8(cp) { return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4; }
  function plegar(linea) { // RFC 5545: máximo 75 octetos por línea; las siguientes empiezan con un espacio
    var out = [], cur = '', bytes = 0;
    Array.from(linea).forEach(function (ch) {
      var b = bytesUtf8(ch.codePointAt(0));
      if (bytes + b > 75) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch; bytes += b;
    });
    out.push(cur);
    return out.join('\r\n');
  }
  function fechaIcsUtc(ms) {
    var t = new Date(ms);
    return t.getUTCFullYear() + pad(t.getUTCMonth() + 1) + pad(t.getUTCDate()) + 'T' + pad(t.getUTCHours()) + pad(t.getUTCMinutes()) + pad(t.getUTCSeconds()) + 'Z';
  }
  function construirICS(r) {
    var l = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bio Digital//Reservas//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-TIMEZONE:' + TZ,
      'BEGIN:VEVENT', 'UID:' + r.uid, 'DTSTAMP:' + fechaIcsUtc(Date.now())];
    if (r.modo === 'horas') {
      l.push('DTSTART:' + fechaIcsUtc(utcDeSantiago(r.fecha, r.horaMin)));
      l.push('DTEND:' + fechaIcsUtc(utcDeSantiago(r.fecha, r.horaMin + r.duracion)));
    } else {
      l.push('DTSTART;VALUE=DATE:' + r.llegada.replace(/-/g, ''));
      l.push('DTEND;VALUE=DATE:' + r.salida.replace(/-/g, '')); // en eventos de día completo la fecha final no se incluye
    }
    l.push('SUMMARY:' + icsEscape(r.resumenCorto));
    l.push('LOCATION:' + icsEscape(r.ubicacion));
    l.push('DESCRIPTION:' + icsEscape(r.descripcion));
    l.push('STATUS:TENTATIVE');
    l.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(r.resumenCorto), r.modo === 'horas' ? 'TRIGGER:-PT60M' : 'TRIGGER:-P1D', 'END:VALARM');   // aviso 1 hora antes de la cita o 1 día antes de la llegada
    l.push('END:VEVENT', 'END:VCALENDAR');
    return l.map(plegar).join('\r\n') + '\r\n';
  }
  function descargar(nombre, contenido) {
    var blob = new Blob([contenido], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nombre; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------------------------------------------------------------- instancia */
  function Instancia(raiz, c) {
    var id = 'res' + (++contador);
    var hoyCivil = function () { return civilSantiago(Date.now()); };
    var esHoras = c.modo === 'horas';
    var semilla = slug(c.negocio) + '|' + c.modo;
    var est = {
      paso: 0, listo: false, enviando: false, desdeResumen: false, reserva: null,
      sel: { servicio: null, profesional: c.profesionales && c.profesionales.length === 1 ? 0 : null, fecha: null, hora: null, alojamiento: c.alojamientos && c.alojamientos.length === 1 ? 0 : null, llegada: null, salida: null, huespedes: 1, nombre: '', celular: '', correo: '', nota: '' },
      errores: {}
    };
    var sel = est.sel;
    var cal = null;

    /* ----- disponibilidad: horas ----- */
    function servicioSel() { return sel.servicio == null ? null : c.servicios[sel.servicio]; }
    function candidatos() {
      if (!c.profesionales.length) return [-1];
      if (sel.profesional === 'any' || sel.profesional == null) return c.profesionales.map(function (p, i) { return i; });
      return [sel.profesional];
    }
    function rangosDe(pi, f) {
      var sem = pi >= 0 && c.profesionales[pi].horario ? c.profesionales[pi].horario : c.horario;
      return sem[diaSemana(f)] || [];
    }
    function maxFecha() { return sumaDias(hoyCivil().fecha, c.diasAdelante); }
    function celdaOcupada(pi, f, t) {
      var clave = f + ' ' + horaStr(t);
      if (c.ocupados.indexOf(clave) > -1) return true;
      if (pi >= 0 && c.profesionales[pi].ocupados.indexOf(clave) > -1) return true;
      return false;
    }
    function ocupadoDemo(pi, f, t) {
      if (!c.demo) return false;
      if (pseudo(semilla + '|dia|' + f + '|' + pi) < 0.07) return true;      // algunos días completos
      return pseudo(semilla + '|' + f + '|' + t + '|' + pi) < 0.17;
    }
    function bloqueado(pi, f, t, dur) {
      for (var x = t; x < t + dur; x += 5) if (c.ocupados.indexOf(f + ' ' + horaStr(x)) > -1 || (pi >= 0 && c.profesionales[pi].ocupados.indexOf(f + ' ' + horaStr(x)) > -1)) return true;
      if (c.demo) { for (var y = t; y < t + dur; y += c.intervalo) if (ocupadoDemo(pi, f, y)) return true; }
      return false;
    }
    // Lista de bloques de un día: { min, libre }. Los bloques que ya pasaron (con la anticipación mínima) no se listan.
    function bloquesDelDia(f) {
      var sv = servicioSel();
      if (!sv || c.feriados[f] || c.cerrados[f]) return [];
      var ahora = hoyCivil(), lim = ahora.ms / 60000 + c.anticipacionHoras * 60, res = {};
      candidatos().forEach(function (pi) {
        rangosDe(pi, f).forEach(function (r) {
          for (var t = r[0]; t + sv.duracion <= r[1]; t += c.intervalo) {
            if (utcDe(f) / 60000 + t < lim) continue;
            var libre = !bloqueado(pi, f, t, sv.duracion);
            if (!(t in res)) res[t] = false;
            if (libre) res[t] = true;
          }
        });
      });
      return Object.keys(res).map(Number).sort(function (a, b) { return a - b; }).map(function (t) { return { min: t, libre: res[t] }; });
    }
    function estadoDiaHoras(f) {
      var hoy = hoyCivil().fecha;
      if (f < hoy) return { hab: false, motivo: 'ya pasó' };
      if (f > maxFecha()) return { hab: false, motivo: 'fuera del plazo de reservas' };
      if (c.feriados[f]) return { hab: false, motivo: 'feriado' };
      if (c.cerrados[f]) return { hab: false, motivo: 'cerrado' };
      var hay = candidatos().some(function (pi) { return rangosDe(pi, f).length; });
      if (!hay) return { hab: false, motivo: 'sin atención' };
      var b = bloquesDelDia(f);
      if (!b.some(function (x) { return x.libre; })) return { hab: false, motivo: 'sin horas disponibles' };
      var o = { hab: true };
      if (f === sel.fecha) o.sel = 'unico';
      return o;
    }

    /* ----- disponibilidad: noches ----- */
    function alojSel() { return sel.alojamiento == null ? null : c.alojamientos[sel.alojamiento]; }
    function nocheOcupada(f) {
      var a = alojSel();
      if (c.cerrados[f] || c.ocupados.indexOf(f) > -1 || (a && a.ocupadas.indexOf(f) > -1)) return true;
      return c.demo && a ? pseudo(semilla + '|' + a.nombre + '|' + f) < 0.22 : false;
    }
    function nochesLibres(desde, hasta) { // todas las noches desde <desde> hasta antes de <hasta>
      for (var f = desde; f < hasta; f = sumaDias(f, 1)) if (nocheOcupada(f)) return false;
      return true;
    }
    function primeraLlegada() { return sumaDias(hoyCivil().fecha, c.anticipacionDias); }
    function ultimaLlegada() { return sumaDias(hoyCivil().fecha, c.diasAdelante); }
    function puedeLlegar(f) { return f >= primeraLlegada() && f <= ultimaLlegada() && nochesLibres(f, sumaDias(f, c.minNoches)); }
    function puedeSalir(g) {
      if (!sel.llegada || sel.salida) return false;
      var n = difDias(sel.llegada, g);
      return n >= c.minNoches && n <= c.maxNoches && nochesLibres(sel.llegada, g);
    }
    function estadoDiaNoches(f) {
      var o = { hab: puedeLlegar(f) || puedeSalir(f) };
      if (!o.hab) {
        if (f < primeraLlegada()) o.motivo = 'no disponible para llegar';
        else if (f > ultimaLlegada()) o.motivo = 'fuera del plazo de reservas';
        else o.motivo = nocheOcupada(f) ? 'ocupado' : 'no disponible';
      }
      if (sel.llegada && f === sel.llegada) o.sel = 'inicio';
      else if (sel.salida && f === sel.salida) o.sel = 'fin';
      else if (sel.llegada && sel.salida && f > sel.llegada && f < sel.salida) o.sel = 'medio';
      return o;
    }
    function estanciaValida() {
      if (!sel.llegada || !sel.salida) return false;
      var n = difDias(sel.llegada, sel.salida);
      return n >= c.minNoches && n <= c.maxNoches && sel.llegada >= primeraLlegada() && nochesLibres(sel.llegada, sel.salida);
    }
    function noches() { return sel.llegada && sel.salida ? difDias(sel.llegada, sel.salida) : 0; }

    /* ----- datos de contacto ----- */
    function validarDatos() {
      var e = {}, nombre = texto(sel.nombre);
      if (nombre.length < 2) e.nombre = 'Escribe tu nombre (al menos 2 letras).';
      else if (nombre.length > 80 || !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(nombre)) e.nombre = 'Revisa tu nombre: debe llevar letras y tener menos de 80 caracteres.';
      if (!sel.celular.trim()) e.celular = 'Escribe tu celular para que el negocio te confirme.';
      else if (!normalizarCelular(sel.celular).ok) e.celular = 'Escribe un celular chileno de 9 dígitos que parta con 9, por ejemplo +56 9 1234 5678.';
      var correo = sel.correo.trim();
      if (correo && !correoValido(correo)) e.correo = 'El correo no parece válido. Puedes dejarlo en blanco.';
      return e;
    }

    /* ----- pasos ----- */
    function pasos() {
      var p = [];
      if (esHoras) {
        p.push({ id: 'servicio', nombre: 'Servicio' });
        if (c.profesionales.length > 1) p.push({ id: 'profesional', nombre: 'Profesional' });
        p.push({ id: 'dia', nombre: 'Día' }, { id: 'hora', nombre: 'Hora' });
      } else {
        if (c.alojamientos.length > 1) p.push({ id: 'alojamiento', nombre: 'Alojamiento' });
        p.push({ id: 'fechas', nombre: 'Fechas' }, { id: 'huespedes', nombre: 'Huéspedes' });
      }
      p.push({ id: 'datos', nombre: 'Tus datos' }, { id: 'resumen', nombre: 'Resumen' });
      return p;
    }
    function completoId(pid) {
      switch (pid) {
        case 'servicio': return sel.servicio != null;
        case 'profesional': return sel.profesional != null;
        case 'dia': return !!sel.fecha && estadoDiaHoras(sel.fecha).hab;
        case 'hora': return sel.hora != null && !!sel.fecha && bloquesDelDia(sel.fecha).some(function (b) { return b.min === sel.hora && b.libre; });
        case 'alojamiento': return sel.alojamiento != null;
        case 'fechas': return estanciaValida();
        case 'huespedes': return !!alojSel() && sel.huespedes >= 1 && sel.huespedes <= alojSel().capacidad;
        case 'datos': return Object.keys(validarDatos()).length === 0;
        default: return false;
      }
    }
    function sanear() { // si un paso anterior cambió, descarta lo que ya no vale
      if (esHoras) {
        if (sel.fecha && !(sel.servicio != null && estadoDiaHoras(sel.fecha).hab)) { sel.fecha = null; sel.hora = null; }
        if (sel.hora != null && !completoId('hora')) sel.hora = null;
      } else {
        if (sel.llegada && sel.salida && !estanciaValida()) { sel.llegada = null; sel.salida = null; }
        else if (sel.llegada && !sel.salida && !puedeLlegar(sel.llegada)) sel.llegada = null;
        if (alojSel() && sel.huespedes > alojSel().capacidad) sel.huespedes = alojSel().capacidad;
      }
    }
    function puedeIr(i) {
      var P = pasos();
      for (var j = 0; j < i; j++) if (!completoId(P[j].id)) return false;
      return true;
    }

    /* ----- estructura fija ----- */
    var nivel = 'h' + c.nivelTitulo;
    raiz.classList.add('res');
    raiz.setAttribute('role', 'region');
    raiz.setAttribute('aria-label', c.titulo || (esHoras ? 'Reservar una hora' : 'Reservar una estadía'));
    var insignia = c.demo ? h('p', { class: 'res-insignia' }, ['Disponibilidad de ejemplo']) : null;
    var olPasos = h('ol', { class: 'res-pasos' });
    var navPasos = h('nav', { class: 'res-pasos-nav', 'aria-label': 'Pasos de la reserva' }, [olPasos]);
    var vivo = h('p', { class: 'res-vivo', 'aria-live': 'polite', 'aria-atomic': 'true' });
    var mini = h('p', { class: 'res-mini' });
    var cuerpo = h('div', { class: 'res-cuerpo' });
    var cabecera = h('div', { class: 'res-cabecera' }, [insignia, navPasos, mini]);
    raiz.appendChild(cabecera);
    raiz.appendChild(vivo);
    raiz.appendChild(cuerpo);

    function titulo(txt, sub) {
      return h('div', { class: 'res-tit' }, [h(nivel, { class: 'res-h', tabindex: '-1', 'data-foco': '1' }, [txt]), sub ? h('p', { class: 'res-sub' }, [sub]) : null]);
    }
    function btn(txt, clase, fn, extra) {
      var a = { type: 'button', class: 'res-btn ' + clase, onclick: fn };
      if (extra) Object.keys(extra).forEach(function (k) { a[k] = extra[k]; });
      return h('button', a, [txt]);
    }
    function barraNav(opciones) {
      var P = pasos(), kids = [];
      if (est.paso > 0) kids.push(btn('Volver', 'res-btn--sec', function () { ir(est.paso - 1, true); }, { 'data-volver': '1' }));
      if (opciones && opciones.siguiente) kids.push(opciones.siguiente);
      return h('div', { class: 'res-nav' }, kids);
    }
    function precioTxt(n) { return plata(n) + (c.precioDeEjemplo ? ' (precio de ejemplo)' : ''); }

    /* ----- resumen en una línea (encima del paso) ----- */
    function resumenMini() {
      var t = [];
      if (esHoras) {
        var sv = servicioSel(); if (sv) t.push(sv.nombre);
        if (sel.profesional === 'any') t.push('Cualquier profesional');
        else if (sel.profesional != null && c.profesionales.length > 1) t.push(c.profesionales[sel.profesional].nombre);
        if (sel.fecha) t.push(fechaCorta(sel.fecha));
        if (sel.hora != null) t.push(horaStr(sel.hora));
      } else {
        if (alojSel() && c.alojamientos.length > 1) t.push(alojSel().nombre);
        if (sel.llegada) t.push(fechaCorta(sel.llegada) + (sel.salida ? ' → ' + fechaCorta(sel.salida) : ''));
        var P = pasos(), ih = P.map(function (x) { return x.id; }).indexOf('huespedes');
        if (sel.salida && est.paso > ih) t.push(plural(sel.huespedes, 'huésped', 'huéspedes'));
      }
      return t.join(' · ');
    }

    /* ----- navegación ----- */
    function renderPasos() {
      var P = pasos();
      vaciar(olPasos);
      P.forEach(function (p, i) {
        var actual = i === est.paso, hecho = !actual && i < P.length - 1 && completoId(p.id);
        var alcanzable = !actual && puedeIr(i);
        var num = h('span', { class: 'res-num', 'aria-hidden': 'true' }, [hecho ? '✓' : String(i + 1)]);
        var txt = h('span', { class: 'res-p-txt' }, [p.nombre]);
        var li = h('li', { class: 'res-p' + (actual ? ' es-actual' : '') + (hecho ? ' es-hecho' : '') });
        if (alcanzable) {
          li.appendChild(h('button', { type: 'button', class: 'res-p-btn', 'aria-label': 'Ir al paso ' + (i + 1) + ': ' + p.nombre + (hecho ? ' (completo)' : ''), onclick: function () { est.desdeResumen = est.paso === P.length - 1 || est.desdeResumen; ir(i, true); } }, [num, txt]));
        } else {
          var a = { class: 'res-p-btn res-p-fijo' };
          if (actual) a['aria-current'] = 'step';
          li.appendChild(h('span', a, [num, txt, actual ? null : h('span', { class: 'res-solo-lector' }, [' (paso ' + (i + 1) + ', pendiente)'])]));
          if (actual) li.lastChild.appendChild(h('span', { class: 'res-solo-lector' }, [' (paso actual)']));
        }
        olPasos.appendChild(li);
      });
    }
    function ir(i, foco) {
      var P = pasos();
      if (i < 0) i = 0;
      if (i > P.length - 1) i = P.length - 1;
      est.paso = i;
      if (P[i].id === 'resumen') est.desdeResumen = false;
      render(foco);
      if (foco) {
        var hEl = cuerpo.querySelector('[data-foco]');
        if (hEl) { hEl.focus(); }
        var r = raiz.getBoundingClientRect();
        if (r.top < 0) raiz.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    }
    function avanzar() {
      sanear();
      var P = pasos(), resumenIdx = P.length - 1;
      if (est.desdeResumen && puedeIr(resumenIdx)) ir(resumenIdx, true);
      else ir(est.paso + 1, true);
    }
    function render(conAnim) {
      sanear();
      var P = pasos();
      if (est.listo) { cabecera.hidden = true; vivo.textContent = ''; vaciar(cuerpo); cuerpo.appendChild(pantallaListo()); return; }
      cabecera.hidden = false;
      renderPasos();
      var m = resumenMini();
      mini.textContent = m; mini.hidden = !m;
      vivo.textContent = 'Paso ' + (est.paso + 1) + ' de ' + P.length + ': ' + P[est.paso].nombre;
      vaciar(cuerpo);
      cal = null;
      var contenido = ({ servicio: pasoServicio, profesional: pasoProfesional, dia: pasoDia, hora: pasoHora, alojamiento: pasoAlojamiento, fechas: pasoFechas, huespedes: pasoHuespedes, datos: pasoDatos, resumen: pasoResumen })[P[est.paso].id]();
      contenido.classList.add('res-paso');
      if (conAnim) contenido.classList.add('res-entra');
      cuerpo.appendChild(contenido);
    }

    /* ----- paso: servicio ----- */
    function opcion(selec, kids, fn, aria) {
      return h('button', { type: 'button', class: 'res-op' + (selec ? ' es-sel' : ''), 'aria-pressed': selec ? 'true' : 'false', onclick: fn, 'aria-label': aria || null }, kids);
    }
    function pasoServicio() {
      var lista = h('div', { class: 'res-ops' }, c.servicios.map(function (s, i) {
        var meta = s.duracion + ' min' + (s.precio != null ? ' · ' + precioTxt(s.precio) : '');
        return opcion(sel.servicio === i, [h('span', { class: 'res-op-t' }, [s.nombre]), h('span', { class: 'res-op-m' }, [meta]), s.descripcion ? h('span', { class: 'res-op-d' }, [s.descripcion]) : null], function () {
          if (sel.servicio !== i) { sel.servicio = i; sel.hora = null; }
          avanzar();
        });
      }));
      return h('div', null, [titulo('¿Qué servicio necesitas?'), lista, barraNav()]);
    }
    /* ----- paso: profesional ----- */
    function pasoProfesional() {
      var ops = [opcion(sel.profesional === 'any', [h('span', { class: 'res-op-t' }, ['Cualquiera']), h('span', { class: 'res-op-m' }, ['Se asigna a quien esté libre'])], function () { if (sel.profesional !== 'any') { sel.profesional = 'any'; sel.hora = null; } avanzar(); })];
      c.profesionales.forEach(function (p, i) {
        ops.push(opcion(sel.profesional === i, [h('span', { class: 'res-op-t' }, [p.nombre])], function () { if (sel.profesional !== i) { sel.profesional = i; sel.hora = null; } avanzar(); }));
      });
      return h('div', null, [titulo('¿Con quién prefieres atenderte?'), h('div', { class: 'res-ops' }, ops), barraNav()]);
    }
    /* ----- paso: día ----- */
    function pasoDia() {
      var hoy = hoyCivil().fecha, max = maxFecha();
      cal = crearCalendario({
        id: id + '-cal', hoy: hoy, min: hoy, max: max, mesInicial: mesDe(sel.fecha || hoy), focoInicial: sel.fecha || hoy,
        estado: estadoDiaHoras,
        alElegir: function (f) { if (sel.fecha !== f) { sel.fecha = f; sel.hora = null; } avanzar(); }
      });
      return h('div', null, [
        titulo('Elige el día', c.demo ? 'Disponibilidad de ejemplo. Los días atenuados no tienen horas (pasados, sin atención, feriados o completos).' : 'Los días atenuados no tienen horas (pasados, sin atención, feriados o completos).'),
        cal.el, barraNav()
      ]);
    }
    /* ----- paso: hora ----- */
    function pasoHora() {
      var sv = servicioSel(), bl = bloquesDelDia(sel.fecha), grupos = [['Mañana', 0, 720], ['Tarde', 720, 1200], ['Noche', 1200, 1500]], kids = [];
      grupos.forEach(function (g, gi) {
        var items = bl.filter(function (b) { return b.min >= g[1] && b.min < g[2]; });
        if (!items.length) return;
        var gid = id + '-g' + gi;
        kids.push(h('div', { class: 'res-grupo', role: 'group', 'aria-labelledby': gid }, [
          h('p', { class: 'res-grupo-t', id: gid }, [g[0]]),
          h('div', { class: 'res-horas' }, items.map(function (b) {
            var fin = horaStr(b.min + sv.duracion), s = sel.hora === b.min;
            return h('button', {
              type: 'button', class: 'res-hora' + (s ? ' es-sel' : '') + (b.libre ? '' : ' es-ocupada'), 'aria-pressed': s ? 'true' : 'false',
              'aria-disabled': b.libre ? null : 'true', 'aria-label': horaStr(b.min) + ' a ' + fin + (b.libre ? '' : ', ocupado'),
              onclick: function () { if (!b.libre) return; sel.hora = b.min; avanzar(); }
            }, [horaStr(b.min)]);
          }))
        ]));
      });
      if (!kids.length) kids.push(h('p', { class: 'res-aviso', role: 'status' }, ['Ese día ya no tiene horas disponibles.']));
      var sub = capital(fechaLarga(sel.fecha)) + ' · ' + sv.nombre + ' (' + sv.duracion + ' min)' + (c.demo ? ' · Disponibilidad de ejemplo' : '');
      return h('div', null, [titulo('Elige la hora', sub), h('div', { class: 'res-bloques' }, kids), h('p', { class: 'res-ayuda' }, ['Los horarios tachados ya están ocupados. Hora de Chile (' + TZ.replace('_', ' ') + ').']), barraNav()]);
    }

    /* ----- paso: alojamiento ----- */
    function pasoAlojamiento() {
      var lista = h('div', { class: 'res-ops' }, c.alojamientos.map(function (a, i) {
        return opcion(sel.alojamiento === i, [h('span', { class: 'res-op-t' }, [a.nombre]), h('span', { class: 'res-op-m' }, ['Hasta ' + plural(a.capacidad, 'huésped', 'huéspedes') + ' · ' + precioTxt(a.precioNoche) + ' por noche']), a.descripcion ? h('span', { class: 'res-op-d' }, [a.descripcion]) : null], function () {
          if (sel.alojamiento !== i) { sel.alojamiento = i; if (sel.huespedes > a.capacidad) sel.huespedes = a.capacidad; }
          avanzar();
        });
      }));
      return h('div', null, [titulo('Elige dónde quedarte'), lista, barraNav()]);
    }
    /* ----- paso: fechas (rango) ----- */
    function pasoFechas() {
      var hoy = hoyCivil().fecha, primera = primeraLlegada();
      var estado = h('p', { class: 'res-rango', role: 'status', 'aria-live': 'polite' });
      var siguiente = btn('Continuar', 'res-btn--pri', function () { if (estanciaValida()) avanzar(); }, { 'aria-disabled': 'true' });
      function actualizar() {
        var txt;
        if (!sel.llegada) txt = 'Elige el día de llegada.';
        else if (!sel.salida) txt = 'Llegada: ' + fechaCorta(sel.llegada) + '. Ahora elige el día de salida' + (c.minNoches > 1 ? ' (mínimo ' + plural(c.minNoches, 'noche', 'noches') + ')' : '') + '.';
        else txt = 'Llegada: ' + fechaCorta(sel.llegada) + ' · Salida: ' + fechaCorta(sel.salida) + ' · ' + plural(noches(), 'noche', 'noches') + '.';
        estado.textContent = txt;
        siguiente.setAttribute('aria-disabled', estanciaValida() ? 'false' : 'true');
        var m = resumenMini(); mini.textContent = m; mini.hidden = !m;
        renderPasos();
      }
      cal = crearCalendario({
        id: id + '-cal', hoy: hoy, min: hoy < primera ? primera : hoy, max: sumaDias(ultimaLlegada(), c.maxNoches), mesInicial: mesDe(sel.llegada || primera), focoInicial: sel.llegada || primera,
        estado: estadoDiaNoches,
        alElegir: function (f) {
          if (sel.llegada && !sel.salida && f > sel.llegada && puedeSalir(f)) sel.salida = f;
          else if (puedeLlegar(f)) { sel.llegada = f; sel.salida = null; }
          cal.refrescar(); actualizar();
        }
      });
      var a = alojSel();
      var sub = (c.alojamientos.length > 1 ? a.nombre + ' · ' : '') + 'Mínimo ' + plural(c.minNoches, 'noche', 'noches') + (c.demo ? ' · Disponibilidad de ejemplo' : '');
      var nodo = h('div', null, [titulo('Elige llegada y salida', sub), cal.el, h('p', { class: 'res-ayuda' }, ['Los días atenuados no están disponibles. Una noche ocupada no se puede cruzar.']), estado, barraNav({ siguiente: siguiente })]);
      actualizar();
      return nodo;
    }
    /* ----- paso: huéspedes y total ----- */
    function pasoHuespedes() {
      var a = alojSel(), salida = h('output', { class: 'res-cant-n', id: id + '-hn', 'aria-live': 'polite' });
      var total = h('div', { class: 'res-total', role: 'group', 'aria-label': 'Total' });
      var menos = h('button', { type: 'button', class: 'res-icono', 'aria-label': 'Un huésped menos' }, [h('span', { 'aria-hidden': 'true' }, ['−'])]);
      var mas = h('button', { type: 'button', class: 'res-icono', 'aria-label': 'Un huésped más' }, [h('span', { 'aria-hidden': 'true' }, ['+'])]);
      function pintar() {
        salida.textContent = String(sel.huespedes);
        menos.setAttribute('aria-disabled', sel.huespedes <= 1 ? 'true' : 'false');
        mas.setAttribute('aria-disabled', sel.huespedes >= a.capacidad ? 'true' : 'false');
        var n = noches();
        vaciar(total);
        total.appendChild(h('p', { class: 'res-total-l' }, [plural(n, 'noche', 'noches') + ' × ' + plata(a.precioNoche)]));
        total.appendChild(h('p', { class: 'res-total-v' }, [plata(n * a.precioNoche)]));
        if (c.precioDeEjemplo) total.appendChild(h('p', { class: 'res-total-n' }, ['precio de ejemplo']));
        var m = resumenMini(); mini.textContent = m; mini.hidden = !m;
      }
      menos.addEventListener('click', function () { if (sel.huespedes > 1) { sel.huespedes--; pintar(); } });
      mas.addEventListener('click', function () { if (sel.huespedes < a.capacidad) { sel.huespedes++; pintar(); } });
      var siguiente = btn('Continuar', 'res-btn--pri', function () { avanzar(); });
      var nodo = h('div', null, [
        titulo('Huéspedes y total', a.nombre + ' · ' + fechaCorta(sel.llegada) + ' → ' + fechaCorta(sel.salida)),
        h('div', { class: 'res-cant', role: 'group', 'aria-labelledby': id + '-hl' }, [h('p', { class: 'res-cant-t', id: id + '-hl' }, ['Huéspedes (máximo ' + a.capacidad + ')']), h('div', { class: 'res-cant-c' }, [menos, salida, mas])]),
        total, barraNav({ siguiente: siguiente })
      ]);
      pintar();
      return nodo;
    }

    /* ----- paso: datos ----- */
    function campo(nombre, etiqueta, tipo, opts) {
      var fid = id + '-' + nombre, err = est.errores[nombre], ayudaId = fid + '-a', errId = fid + '-e';
      var describe = [opts.ayuda ? ayudaId : null, err ? errId : null].filter(Boolean).join(' ') || null;
      var attrs = { id: fid, name: nombre, class: 'res-in', autocomplete: opts.auto, 'aria-invalid': err ? 'true' : null, 'aria-describedby': describe, maxlength: opts.max, 'aria-required': opts.req ? 'true' : null };
      var inp;
      if (tipo === 'textarea') { attrs.rows = '3'; inp = h('textarea', attrs); }
      else { attrs.type = tipo; if (opts.modo) attrs.inputmode = opts.modo; if (opts.ph) attrs.placeholder = opts.ph; inp = h('input', attrs); }
      inp.value = sel[nombre];
      inp.addEventListener('input', function () {
        sel[nombre] = inp.value;
        if (est.errores[nombre]) revalidar(nombre, inp);
      });
      inp.addEventListener('blur', function () {
        if (nombre === 'celular') { var r = normalizarCelular(inp.value); if (r.ok) { inp.value = r.bonito; sel.celular = r.bonito; } }
        if (inp.value.trim() || est.errores[nombre]) revalidar(nombre, inp);
      });
      return h('div', { class: 'res-campo' }, [
        h('label', { for: fid, class: 'res-et' }, [etiqueta, opts.req ? h('span', { class: 'res-req', 'aria-hidden': 'true' }, [' *']) : h('span', { class: 'res-opc' }, [' (opcional)'])]),
        inp,
        opts.ayuda ? h('p', { class: 'res-ayuda', id: ayudaId }, [opts.ayuda]) : null,
        h('p', { class: 'res-error', id: errId, hidden: !err }, [err || ''])
      ]);
    }
    function revalidar(nombre, inp) {
      var e = validarDatos(), fid = inp.id, p = document.getElementById(fid + '-e');
      if (e[nombre]) est.errores[nombre] = e[nombre]; else delete est.errores[nombre];
      if (!p) return;
      p.textContent = est.errores[nombre] || ''; p.hidden = !est.errores[nombre];
      if (est.errores[nombre]) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
      var ay = document.getElementById(fid + '-a');
      inp.setAttribute('aria-describedby', [ay ? ay.id : null, est.errores[nombre] ? p.id : null].filter(Boolean).join(' '));
      if (!inp.getAttribute('aria-describedby')) inp.removeAttribute('aria-describedby');
    }
    function pasoDatos() {
      var f = h('form', { class: 'res-form', novalidate: true, onsubmit: function (e) {
        e.preventDefault();
        sel.nombre = f.elements.nombre.value; sel.celular = f.elements.celular.value; sel.correo = f.elements.correo.value; sel.nota = f.elements.nota.value;
        var errs = validarDatos();
        if (Object.keys(errs).length) {
          est.errores = errs;
          ['nombre', 'celular', 'correo'].forEach(function (n) { revalidar(n, f.elements[n]); });
          var primero = ['nombre', 'celular', 'correo'].filter(function (n) { return errs[n]; })[0];
          resumenErr.textContent = 'Revisa ' + (Object.keys(errs).length === 1 ? 'el campo marcado' : 'los campos marcados') + ' para continuar.';
          resumenErr.hidden = false;
          f.elements[primero].focus();
          return;
        }
        est.errores = {};
        var r = normalizarCelular(sel.celular); sel.celular = r.bonito; sel.nombre = texto(sel.nombre); sel.correo = sel.correo.trim();
        avanzar();
      } });
      var resumenErr = h('p', { class: 'res-error res-error--resumen', role: 'alert', hidden: true });
      f.appendChild(resumenErr);
      f.appendChild(campo('nombre', 'Tu nombre', 'text', { req: true, auto: 'name', max: 80 }));
      f.appendChild(campo('celular', 'Tu celular', 'tel', { req: true, auto: 'tel', modo: 'tel', ph: '+56 9 1234 5678', max: 20, ayuda: 'Celular chileno. Lo usamos solo para confirmar tu solicitud.' }));
      f.appendChild(campo('correo', 'Correo', 'email', { auto: 'email', modo: 'email', max: 120 }));
      f.appendChild(campo('nota', 'Nota para el negocio', 'textarea', { max: 300 }));
      f.appendChild(barraNav({ siguiente: h('button', { type: 'submit', class: 'res-btn res-btn--pri' }, ['Continuar']) }));
      return h('div', null, [titulo('Tus datos de contacto'), f]);
    }

    /* ----- paso: resumen ----- */
    function filasResumen() {
      var P = pasos(), idx = function (pid) { for (var i = 0; i < P.length; i++) if (P[i].id === pid) return i; return -1; };
      var f = [];
      if (esHoras) {
        var sv = servicioSel();
        f.push(['Servicio', sv.nombre + ' (' + sv.duracion + ' min)' + (sv.precio != null ? ' · ' + precioTxt(sv.precio) : ''), idx('servicio')]);
        if (c.profesionales.length) f.push(['Profesional', sel.profesional === 'any' ? 'Cualquiera' : c.profesionales[sel.profesional].nombre, idx('profesional')]);
        f.push(['Día', capital(fechaLarga(sel.fecha)), idx('dia')]);
        f.push(['Hora', horaStr(sel.hora) + ' a ' + horaStr(sel.hora + sv.duracion), idx('hora')]);
      } else {
        var a = alojSel();
        f.push(['Alojamiento', a.nombre, idx('alojamiento')]);
        f.push(['Llegada', capital(fechaLarga(sel.llegada)), idx('fechas')]);
        f.push(['Salida', capital(fechaLarga(sel.salida)), idx('fechas')]);
        f.push(['Estadía', plural(noches(), 'noche', 'noches'), idx('fechas')]);
        f.push(['Huéspedes', String(sel.huespedes), idx('huespedes')]);
        f.push(['Total', plata(noches() * a.precioNoche) + (c.precioDeEjemplo ? ' (precio de ejemplo)' : ''), idx('huespedes')]);
      }
      f.push(['Nombre', texto(sel.nombre), idx('datos')]);
      f.push(['Celular', sel.celular, idx('datos')]);
      if (sel.correo.trim()) f.push(['Correo', sel.correo.trim(), idx('datos')]);
      if (texto(sel.nota)) f.push(['Nota', texto(sel.nota), idx('datos')]);
      return f.filter(function (x) { return x[2] >= 0; });
    }
    function pasoResumen() {
      var dl = h('dl', { class: 'res-resumen' }, filasResumen().map(function (fila) {
        return h('div', { class: 'res-fila' }, [
          h('div', { class: 'res-fila-t' }, [h('dt', null, [fila[0]]), h('dd', null, [fila[1]])]),
          h('button', { type: 'button', class: 'res-cambiar', 'aria-label': 'Cambiar ' + fila[0].toLowerCase(), onclick: function () { est.desdeResumen = true; ir(fila[2], true); } }, ['Cambiar'])
        ]);
      }));
      var nota = c.demo ? 'Es un ejemplo: no se envía nada a ningún negocio.' : 'Se abrirá WhatsApp con tu solicitud lista para enviar. ' + c.negocio + ' te confirmará la ' + (esHoras ? 'hora' : 'disponibilidad') + ' por ahí.';
      var conf = btn('Confirmar solicitud', 'res-btn--pri', confirmar);
      return h('div', null, [titulo('Revisa tu solicitud'), dl, h('p', { class: 'res-ayuda' }, [nota]), barraNav({ siguiente: conf })]);
    }

    /* ----- confirmar ----- */
    function armarReserva() {
      var r = { modo: c.modo, negocio: c.negocio, comuna: c.comuna, nombre: texto(sel.nombre), celular: normalizarCelular(sel.celular), correo: sel.correo.trim(), nota: texto(sel.nota) };
      var loc = [c.direccion, c.comuna].filter(Boolean).join(', ');
      r.ubicacion = loc;
      r.uid = 'res-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '@biodigital.cl';
      var lineas = ['Hola, soy ' + r.nombre + '. Quiero hacer una solicitud en ' + c.negocio + ':'];
      var desc = [];
      if (esHoras) {
        var sv = servicioSel(), prof = sel.profesional === 'any' || sel.profesional == null ? (c.profesionales.length > 1 ? 'Sin preferencia' : '') : c.profesionales[sel.profesional].nombre;
        r.servicio = sv.nombre; r.profesional = prof; r.fecha = sel.fecha; r.horaMin = sel.hora; r.duracion = sv.duracion;
        r.hora = horaStr(sel.hora); r.horaFin = horaStr(sel.hora + sv.duracion);
        r.resumenCorto = sv.nombre + ' en ' + c.negocio;
        lineas.push('• Servicio: ' + sv.nombre + ' (' + sv.duracion + ' min)');
        if (prof) lineas.push('• Profesional: ' + prof);
        lineas.push('• Fecha: ' + fechaLarga(sel.fecha), '• Hora: ' + r.hora + ' a ' + r.horaFin);
        desc.push('Servicio: ' + sv.nombre, prof ? 'Profesional: ' + prof : null, 'Hora: ' + r.hora + ' a ' + r.horaFin + ' (hora de Chile)');
      } else {
        var a = alojSel(), n = noches(), tot = n * a.precioNoche;
        r.alojamiento = a.nombre; r.llegada = sel.llegada; r.salida = sel.salida; r.noches = n; r.huespedes = sel.huespedes; r.total = tot;
        r.resumenCorto = 'Estadía en ' + c.negocio + ' (' + plural(n, 'noche', 'noches') + ')';
        lineas.push('• Alojamiento: ' + a.nombre, '• Llegada: ' + fechaLarga(sel.llegada), '• Salida: ' + fechaLarga(sel.salida), '• Noches: ' + n, '• Huéspedes: ' + sel.huespedes, '• Total estimado: ' + plata(tot));
        desc.push('Alojamiento: ' + a.nombre, 'Llegada: ' + fechaLarga(sel.llegada), 'Salida: ' + fechaLarga(sel.salida), 'Huéspedes: ' + sel.huespedes, 'Total estimado: ' + plata(tot));
      }
      lineas.push('• Celular: ' + r.celular.bonito);
      if (r.correo) lineas.push('• Correo: ' + r.correo);
      if (r.nota) lineas.push('• Nota: ' + r.nota);
      lineas.push('Quedo atento/a a tu confirmación. ¡Gracias!');
      desc.push('Solicitud hecha por ' + r.nombre + ' (' + r.celular.bonito + '). Falta la confirmación de ' + c.negocio + '.');
      r.mensaje = lineas.join('\n');
      r.descripcion = desc.filter(Boolean).join('\n');
      r.ics = construirICS(r);
      r.archivo = 'reserva-' + slug(c.negocio) + '-' + (r.fecha || r.llegada) + '.ics';
      r.wa = c.whatsapp ? 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(r.mensaje) : '';
      return r;
    }
    function enviarNivel2(r) {
      try {
        var fila = { negocio: r.negocio, modo: r.modo, nombre: r.nombre, celular: r.celular.e164, correo: r.correo || null, nota: r.nota || null, servicio: r.servicio || null, profesional: r.profesional || null, alojamiento: r.alojamiento || null,
          fecha: r.fecha || null, hora: r.hora || null, llegada: r.llegada || null, salida: r.salida || null, huespedes: r.huespedes || null, total: r.total || null, creado: new Date().toISOString() };
        fetch(c.envio.url + '/rest/v1/' + encodeURIComponent(c.envio.tabla), {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json', apikey: c.envio.llave, Authorization: 'Bearer ' + c.envio.llave, Prefer: 'return=minimal' },
          body: JSON.stringify(fila)
        }).catch(function () { /* no bloquea: la solicitud igual sale por WhatsApp */ });
      } catch (e) { /* no bloquea */ }
    }
    function confirmar() {
      if (est.enviando) return;
      est.enviando = true;
      var r = armarReserva();
      est.reserva = r;
      if (c.envio && (!c.demo || c.envio.enDemo)) enviarNivel2(r);
      if (c.demo) {
        if (typeof window.bdAvisoDemo === 'function') window.bdAvisoDemo('Esto es un ejemplo: en el sitio real, esta solicitud se abre en el WhatsApp de ' + c.negocio + ' con todos los datos listos.');
      } else if (r.wa) {
        window.open(r.wa, '_blank', 'noopener');
      }
      est.listo = true; est.enviando = false;
      render(false);
      var hEl = cuerpo.querySelector('[data-foco]');
      if (hEl) hEl.focus();
      var rc = raiz.getBoundingClientRect();
      if (rc.top < 0) raiz.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
    function pantallaListo() {
      var r = est.reserva, resumen = esHoras ? capital(fechaLarga(r.fecha)) + ', ' + r.hora + ' a ' + r.horaFin : capital(fechaLarga(r.llegada)) + ' → ' + fechaLarga(r.salida) + ' (' + plural(r.noches, 'noche', 'noches') + ')';
      var kids = [
        h('div', { class: 'res-ok', 'aria-hidden': 'true' }, ['✓']),
        titulo(c.demo ? 'Listo (ejemplo)' : 'Solicitud lista'),
        h('p', { class: 'res-listo-r' }, [r.resumenCorto + '. ' + resumen]),
        h('p', { class: 'res-ayuda', role: 'status' }, [c.demo
          ? 'Esto es un ejemplo: no se envió nada. En el sitio real se abre WhatsApp con tu solicitud y ' + c.negocio + ' te confirma.'
          : 'Abrimos WhatsApp con tu solicitud: solo falta que la envíes. Nada queda reservado hasta que ' + c.negocio + ' te confirme.'])
      ];
      var acciones = [btn('Agregar a mi calendario', 'res-btn--pri', function () { descargar(r.archivo, r.ics); }, { 'data-accion': 'ics' })];
      if (!c.demo && r.wa) acciones.push(h('a', { class: 'res-btn res-btn--sec', href: r.wa, target: '_blank', rel: 'noopener' }, ['Abrir WhatsApp otra vez']));
      acciones.push(btn('Hacer otra reserva', 'res-btn--sec', reiniciar, { 'data-accion': 'otra' }));
      kids.push(h('div', { class: 'res-nav res-nav--listo' }, acciones));
      return h('div', { class: 'res-final res-paso res-entra' }, kids);
    }
    function reiniciar() {
      var nuevo = { servicio: null, profesional: c.profesionales && c.profesionales.length === 1 ? 0 : null, fecha: null, hora: null, alojamiento: c.alojamientos && c.alojamientos.length === 1 ? 0 : null, llegada: null, salida: null, huespedes: 1, nombre: sel.nombre, celular: sel.celular, correo: sel.correo, nota: '' };
      Object.keys(nuevo).forEach(function (k) { sel[k] = nuevo[k]; });
      est.listo = false; est.paso = 0; est.errores = {}; est.reserva = null; est.desdeResumen = false;
      render(false);
      var hEl = cuerpo.querySelector('[data-foco]'); if (hEl) hEl.focus();
    }

    render(false);
    return {
      el: raiz,
      reiniciar: function () { reiniciar(); },
      destruir: function () {
        vaciar(raiz); raiz.classList.remove('res'); raiz.removeAttribute('role'); raiz.removeAttribute('aria-label');
      },
      estado: function () { return JSON.parse(JSON.stringify({ paso: est.paso, listo: est.listo, seleccion: sel })); }
    };
  }

  /* ---------------------------------------------------------------- API pública */
  var montados = typeof WeakMap === 'function' ? new WeakMap() : null;
  function mostrarErrores(el, errores) {
    vaciar(el);
    el.classList.add('res');
    el.appendChild(h('div', { class: 'res-config-error', role: 'alert' }, [
      h('p', { class: 'res-config-t' }, ['El módulo de reservas no está bien configurado']),
      h('ul', null, errores.map(function (e) { return h('li', null, [e]); })),
      h('p', { class: 'res-ayuda' }, ['Revisa la configuración en reservas-LEEME.md.'])
    ]));
  }
  function montar(destino, config) {
    var el = typeof destino === 'string' ? document.querySelector(destino) : destino;
    if (!el || el.nodeType !== 1) {
      if (typeof console !== 'undefined' && console.warn) console.warn('BDReservas.montar: no encontré el elemento ' + (typeof destino === 'string' ? '"' + destino + '"' : 'indicado') + '.');
      return null;
    }
    if (montados && montados.has(el)) montados.get(el).destruir();
    var n = normalizar(config, el);
    if (!n.ok) {
      mostrarErrores(el, n.errores);
      var falla = { ok: false, errores: n.errores, el: el, destruir: function () { vaciar(el); el.classList.remove('res'); }, reiniciar: function () {} };
      if (montados) montados.set(el, falla);
      return falla;
    }
    var inst = Instancia(el, n.c);
    inst.ok = true;
    if (montados) montados.set(el, inst);
    return inst;
  }

  window.BDReservas = {
    version: '1.0.0',
    montar: montar,
    utils: { normalizarCelular: normalizarCelular, construirICS: construirICS, utcDeSantiago: utcDeSantiago, fechaLarga: fechaLarga }
  };
})();
