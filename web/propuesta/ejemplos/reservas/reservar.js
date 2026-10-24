// Motor de reservas, lado del cliente: elegir → fecha y hora → datos y pago → confirmación. Español, inglés y portugués;
// precios en pesos con equivalencia en otras monedas. La disponibilidad se actualiza en vivo si otra persona reserva.
(function () {
  'use strict';
  var R = window.Reservas, U = R.util, app = document.getElementById('app');
  var q = new URLSearchParams(location.search);
  var T = {
    es: { que: 'Qué', cuando: 'Cuándo', datos: 'Tus datos', listo: 'Listo', personas: 'Personas', horas: 'Horas', sig: 'Continuar', atras: 'Atrás', noche: 'noche', noches: 'noches', persona: 'persona', hora: 'hora',
      desde: 'desde', libre: 'Disponible', pocos: 'Quedan pocos', lleno: 'Completo', cerrado: 'Cerrado', llegada: 'Elige el día de llegada', salida: 'Ahora elige el día de salida', dia: 'Elige un día', horaE: 'Elige una hora', quedan: 'quedan', prof: 'Profesional', cualquiera: 'Cualquiera',
      nombre: 'Nombre y apellido', correo: 'Correo', celular: 'Celular (WhatsApp)', pais: 'País', codigo: 'Código de descuento', aplicar: 'Aplicar', acepto: 'Acepto la política de cancelación y los términos.', resumen: 'Resumen', total: 'Total', deposito: 'Depósito ahora', saldo: 'Saldo al llegar',
      reservar: 'Reservar', pagarDep: 'Ir a pagar el depósito', retenido: 'Te guardamos el cupo por', pagar: 'Pagar', ok: '¡Reserva confirmada!', cod: 'Tu código', cal: 'Agregar a mi calendario', gcal: 'Google Calendar', compartir: 'Enviar por WhatsApp', gestionar: 'Ver o cancelar mi reserva',
      espera: 'Avísame si se libera un cupo', esperaOk: 'Listo: te avisamos por correo o WhatsApp si se libera.', politica: 'Política de cancelación', extras: 'Agrega a tu estadía', conv: 'Referencial. Se cobra en pesos chilenos.', vivo: 'Disponibilidad en vivo', actualizada: 'La disponibilidad cambió: alguien acaba de reservar.' },
    en: { que: 'What', cuando: 'When', datos: 'Your details', listo: 'Done', personas: 'Guests', horas: 'Hours', sig: 'Continue', atras: 'Back', noche: 'night', noches: 'nights', persona: 'person', hora: 'hour',
      desde: 'from', libre: 'Available', pocos: 'Few left', lleno: 'Full', cerrado: 'Closed', llegada: 'Choose your check-in day', salida: 'Now choose your check-out day', dia: 'Choose a day', horaE: 'Choose a time', quedan: 'left', prof: 'Professional', cualquiera: 'Any',
      nombre: 'Full name', correo: 'Email', celular: 'Mobile (WhatsApp)', pais: 'Country', codigo: 'Discount code', aplicar: 'Apply', acepto: 'I accept the cancellation policy and terms.', resumen: 'Summary', total: 'Total', deposito: 'Deposit now', saldo: 'Balance on arrival',
      reservar: 'Book', pagarDep: 'Pay the deposit', retenido: 'Your spot is held for', pagar: 'Pay', ok: 'Booking confirmed!', cod: 'Your code', cal: 'Add to my calendar', gcal: 'Google Calendar', compartir: 'Send by WhatsApp', gestionar: 'View or cancel my booking',
      espera: 'Notify me if a spot opens', esperaOk: 'Done: we will notify you by email or WhatsApp.', politica: 'Cancellation policy', extras: 'Add to your stay', conv: 'For reference. Charged in Chilean pesos.', vivo: 'Live availability', actualizada: 'Availability changed: someone just booked.' },
    pt: { que: 'O quê', cuando: 'Quando', datos: 'Seus dados', listo: 'Pronto', personas: 'Pessoas', horas: 'Horas', sig: 'Continuar', atras: 'Voltar', noche: 'noite', noches: 'noites', persona: 'pessoa', hora: 'hora',
      desde: 'a partir de', libre: 'Disponível', pocos: 'Últimas vagas', lleno: 'Lotado', cerrado: 'Fechado', llegada: 'Escolha o dia de chegada', salida: 'Agora escolha o dia de saída', dia: 'Escolha um dia', horaE: 'Escolha um horário', quedan: 'restam', prof: 'Profissional', cualquiera: 'Qualquer',
      nombre: 'Nome completo', correo: 'E-mail', celular: 'Celular (WhatsApp)', pais: 'País', codigo: 'Cupom de desconto', aplicar: 'Aplicar', acepto: 'Aceito a política de cancelamento e os termos.', resumen: 'Resumo', total: 'Total', deposito: 'Sinal agora', saldo: 'Saldo na chegada',
      reservar: 'Reservar', pagarDep: 'Pagar o sinal', retenido: 'Guardamos sua vaga por', pagar: 'Pagar', ok: 'Reserva confirmada!', cod: 'Seu código', cal: 'Adicionar ao calendário', gcal: 'Google Agenda', compartir: 'Enviar por WhatsApp', gestionar: 'Ver ou cancelar minha reserva',
      espera: 'Avise-me se abrir uma vaga', esperaOk: 'Pronto: avisaremos por e-mail ou WhatsApp.', politica: 'Política de cancelamento', extras: 'Adicione à sua estadia', conv: 'Referência. Cobrado em pesos chilenos.', vivo: 'Disponibilidade ao vivo', actualizada: 'A disponibilidade mudou: alguém acabou de reservar.' }
  };
  // Tipos de cambio aproximados (pesos por unidad). Verificar antes de publicar; solo se muestran como referencia.
  var MONEDAS = { CLP: [1, 'es-CL', 'CLP'], USD: [950, 'en-US', 'USD'], EUR: [1030, 'de-DE', 'EUR'], BRL: [170, 'pt-BR', 'BRL'] };
  var LOC = { es: 'es-CL', en: 'en-US', pt: 'pt-BR' };
  var guard = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var st = { neg: q.get('negocio') || guard('bdres-neg') || 'cabanas', idioma: guard('bdres-idioma') || ((navigator.language || 'es').slice(0, 2) in T ? (navigator.language || 'es').slice(0, 2) : 'es'), moneda: guard('bdres-moneda') || 'CLP', paso: 1, sel: {}, codigo: '', vista: null, res: null };
  if (!R.NEGOCIOS.some(function (n) { return n.id === st.neg; })) st.neg = 'cabanas';
  var t = function (k) { return T[st.idioma][k] || T.es[k]; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var clp = U.clp;
  var conv = function (n) { if (st.moneda === 'CLP') return ''; var m = MONEDAS[st.moneda]; return '≈ ' + new Intl.NumberFormat(m[1], { style: 'currency', currency: m[2], maximumFractionDigits: 0 }).format(n / m[0]); };
  function d() { return R.leer(st.neg); }
  function toast(x) { var e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', 'status'); e.textContent = x; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 3800); }

  // Barra superior: negocio de la demo, idioma y moneda
  app.innerHTML = '<div class="wrap"><div class="negocios" role="group" aria-label="Negocio de la demostración"></div><header class="cab"></header><div class="motor"><div><ol class="pasos-r"></ol><div data-paso></div></div><aside class="resumen-lat caja" aria-label="' + t('resumen') + '"></aside></div></div>';
  var selIdi = document.getElementById('idioma'), selMon = document.getElementById('moneda');
  selIdi.value = st.idioma; selMon.value = st.moneda;
  selIdi.addEventListener('change', function () { st.idioma = selIdi.value; guard('bdres-idioma', st.idioma); document.documentElement.lang = st.idioma; pintar(); });
  selMon.addEventListener('change', function () { st.moneda = selMon.value; guard('bdres-moneda', st.moneda); pintar(); });
  document.documentElement.lang = st.idioma;
  function pintarNegocios() {
    app.querySelector('.negocios').innerHTML = R.NEGOCIOS.map(function (n) { return '<button type="button" data-neg="' + n.id + '" aria-pressed="' + (n.id === st.neg) + '">' + R.icono(n.icono, 18) + esc(n.rubro) + '</button>'; }).join('');
    var a = document.querySelector('[data-admin]'); if (a) a.href = 'admin/?negocio=' + st.neg;
  }
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-neg]'); if (!b) return;
    soltar(); st.neg = b.dataset.neg; guard('bdres-neg', st.neg); st.paso = 1; st.sel = {}; st.codigo = ''; st.vista = null; st.res = null; pintar();
  });

  function pintar() {
    var D = d(), c = D.config;
    R.automatico(st.neg);
    pintarNegocios();
    var reglas = (c.reglas || []).filter(function (g) { return g.activa; });
    app.querySelector('.cab').innerHTML = '<div class="marca-n">' + R.logo(c) + '<div><h1>' + esc(c.nombre) + '</h1><p>' + esc(c.rubro) + ' · ' + esc(c.direccion) + ' · <span class="vivo">' + t('vivo') + '</span></p></div></div>' +
      (reglas.length ? '<p class="promo">' + R.icono('calendario', 16) + '<b>Promociones:</b> ' + reglas.map(function (g) { return esc({ anticipada: 'reserva con ' + g.dias + '+ días de anticipación −' + g.porcentaje + ' %', estadia: g.noches + '+ noches −' + g.porcentaje + ' %', grupo: 'grupos de ' + g.personas + '+ −' + g.porcentaje + ' %', ultimo: 'último minuto −' + g.porcentaje + ' %', duracion: g.horas + '+ horas −' + g.porcentaje + ' %' }[g.tipo]); }).join(' · ') + '</p>' : '');
    var nombres = [t('que'), t('cuando'), t('datos'), t('listo')];
    app.querySelector('.pasos-r').innerHTML = nombres.map(function (n, i) { return '<li class="' + (i + 1 < st.paso ? 'hecho' : i + 1 === st.paso ? 'actual' : '') + '"' + (i + 1 === st.paso ? ' aria-current="step"' : '') + '>' + n + '</li>'; }).join('');
    var p = app.querySelector('[data-paso]');
    if (q.get('gestion')) return gestion(p);
    [paso1, paso2, paso3, paso4][st.paso - 1](p, D);
    resumen(D);
  }

  // Paso 1: qué reservar
  function paso1(p, D) {
    var c = D.config, lista = c.modo === 'noches' || c.modo === 'bloques' ? c.recursos : c.servicios, clave = c.modo === 'noches' || c.modo === 'bloques' ? 'recurso' : 'servicio';
    var unidad = { noches: '/ ' + t('noche'), cupos: '/ ' + t('persona'), horas: '', bloques: '/ ' + t('hora') }[c.modo];
    p.innerHTML = '<section class="caja"><h2>' + t('que') + '</h2><div class="opciones-r">' + lista.map(function (x) {
      var cap = x.capacidad ? (c.modo === 'cupos' ? x.capacidad + ' cupos por salida' : 'hasta ' + x.capacidad + ' personas') : x.duracion ? x.duracion + ' min' : '';
      return '<button type="button" class="opcion" data-' + clave + '="' + x.id + '" aria-pressed="' + (st.sel[clave] === x.id) + '"><b>' + esc(x.nombre) + '</b><span class="p">' + (c.modo === 'horas' ? '' : t('desde') + ' ') + clp(x.precio) + ' ' + unidad + '</span><small>' + esc([cap, x.minHoras ? 'mínimo ' + x.minHoras + ' h' : '', x.minPersonas > 1 ? 'mínimo ' + x.minPersonas + ' personas' : '', c.modo === 'cupos' ? 'salidas ' + x.salidas.join(' y ') : ''].filter(Boolean).join(' · ')) + '</small>' +
        (x.desc ? '<small>' + esc(x.desc) + '</small>' : '') + (x.incluye ? '<ul>' + x.incluye.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' : '') + '</button>';
    }).join('') + '</div>' +
    (c.modo !== 'horas' ? '<div class="fila-ctl"><span>' + t('personas') + '</span><div class="contador"><button type="button" data-pers="-1" aria-label="Menos">−</button><span>' + (st.sel.personas || (c.modo === 'cupos' ? 2 : 2)) + '</span><button type="button" data-pers="1" aria-label="Más">+</button></div>' +
      (c.modo === 'bloques' ? '<span>' + t('horas') + '</span><div class="contador"><button type="button" data-hrs="-1" aria-label="Menos">−</button><span>' + (st.sel.horas || 0) + '</span><button type="button" data-hrs="1" aria-label="Más">+</button></div>' : '') + '</div>' : '') +
    '<p class="err" role="alert"></p><div class="acciones-r"><span></span><button class="btn prim" type="button" data-sig>' + t('sig') + '</button></div></section>';
    if (!st.sel.personas) st.sel.personas = 2;
    if (c.modo === 'bloques' && st.sel.recurso && !st.sel.horas) st.sel.horas = R.recurso(D, st.sel.recurso).minHoras;
  }
  // Paso 2: calendario y horas
  function paso2(p, D) {
    var c = D.config, hoyS = U.hoy();
    if (!st.vista) { var f0 = U.fdate(st.sel.llegada || st.sel.fecha || hoyS); st.vista = { y: f0.getFullYear(), m: f0.getMonth() }; }
    var est = R.mes(D, st.sel, st.vista.y, st.vista.m), loc = LOC[st.idioma];
    var nom = new Date(st.vista.y, st.vista.m, 1).toLocaleDateString(loc, { month: 'long', year: 'numeric' });
    var dn = []; for (var i = 1; i <= 7; i++) dn.push(new Date(2026, 1, i).toLocaleDateString(loc, { weekday: 'short' }).slice(0, 2));   // feb-2026 parte en domingo; se reordena a lunes
    dn = dn.slice(1).concat(dn.slice(0, 1));
    var primero = (new Date(st.vista.y, st.vista.m, 1).getDay() + 6) % 7, celdas = '';
    for (var k = 0; k < primero; k++) celdas += '<span></span>';
    Object.keys(est).forEach(function (f) {
      var e = est[f], cls = [e.estado], n = +f.slice(8);
      if (f === hoyS) cls.push('hoy');
      if (c.modo === 'noches') { if (f === st.sel.llegada || f === st.sel.salida) cls.push('borde'); else if (st.sel.llegada && st.sel.salida && f > st.sel.llegada && f < st.sel.salida) cls.push('rango'); }
      else if (f === st.sel.fecha) cls.push('sel');
      var off = e.estado === 'pasado' || e.estado === 'cerrado' || (e.estado === 'lleno' && !(c.modo === 'noches' && st.sel.llegada && !st.sel.salida && f > st.sel.llegada));
      celdas += '<button type="button" class="' + cls.join(' ') + '" data-f="' + f + '"' + (off ? ' aria-disabled="true"' : '') + ' aria-label="' + f + ' · ' + t(e.estado === 'pasado' ? 'cerrado' : e.estado) + '">' + n + '<i aria-hidden="true"></i></button>';
    });
    var guia = c.modo === 'noches' ? (!st.sel.llegada || st.sel.salida ? t('llegada') : t('salida')) : t('dia');
    var html = '<section class="caja"><h2>' + t('cuando') + '</h2><p class="nota" style="margin-bottom:10px">' + guia + '</p>' +
      '<div class="cal-cab"><button class="btn chico" type="button" data-mes="-1" aria-label="Mes anterior">‹</button><b>' + nom + '</b><button class="btn chico" type="button" data-mes="1" aria-label="Mes siguiente">›</button></div>' +
      '<div class="cal">' + dn.map(function (x) { return '<span class="dn">' + x + '</span>'; }).join('') + celdas + '</div>' +
      '<p class="leyenda"><span style="--c:var(--ok)">' + t('libre') + '</span><span style="--c:var(--pocos)">' + t('pocos') + '</span><span style="--c:var(--lleno)">' + t('lleno') + '</span></p>';
    if (c.modo === 'horas' && st.sel.fecha) {
      var profs = c.recursos.filter(function (r) { return r.servicios.indexOf(st.sel.servicio) > -1; });
      if (profs.length > 1) html += '<div class="campo" style="margin-top:12px;max-width:320px"><label for="prof">' + t('prof') + '</label><select id="prof"><option value="">' + t('cualquiera') + '</option>' + profs.map(function (r) { return '<option value="' + r.id + '"' + (st.sel.recurso === r.id ? ' selected' : '') + '>' + esc(r.nombre) + '</option>'; }).join('') + '</select></div>';
    }
    if (c.modo !== 'noches' && st.sel.fecha) {
      var hs = c.modo === 'cupos' ? R.salidas(D, st.sel) : R.horas(D, st.sel);
      html += '<p class="nota" style="margin-top:12px">' + t('horaE') + '</p><div class="horas-r">' + (hs.length ? hs.map(function (h) {
        var lleno = c.modo === 'cupos' && h.quedan < st.sel.personas;
        return '<button type="button" data-min="' + h.min + '" aria-pressed="' + (st.sel.min === h.min) + '"' + (lleno ? ' disabled' : '') + '>' + h.hora + (c.modo === 'cupos' ? '<small>' + h.quedan + ' ' + t('quedan') + '</small>' : '') + '</button>';
      }).join('') : '<p class="nota">' + t('lleno') + '</p>') + '</div>';
      if (!hs.length || (c.modo === 'cupos' && hs.every(function (h) { return h.quedan < st.sel.personas; }))) html += '<p style="margin-top:10px"><button class="btn chico" type="button" data-espera>' + t('espera') + '</button></p>';
    }
    if (c.modo === 'noches' && c.servicios.length && st.sel.salida) html += '<div style="margin-top:14px"><p class="lbl nota">' + t('extras') + '</p>' + c.servicios.map(function (s) { return '<label class="chk"><input type="checkbox" data-extra="' + s.id + '"' + ((st.sel.extras || []).indexOf(s.id) > -1 ? ' checked' : '') + '><span><b>' + esc(s.nombre) + '</b> · ' + clp(s.precio) + ' — ' + esc(s.desc) + '</span></label>'; }).join('') + '</div>';
    html += '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-atras>' + t('atras') + '</button><button class="btn prim" type="button" data-sig>' + t('sig') + '</button></div></section>';
    p.innerHTML = html;
  }
  // Paso 3: datos, código, política y pago del depósito
  function paso3(p, D) {
    var c = D.config, pol = c.politicas, cancel = pol.cancelacion.slice().sort(function (a, b) { return b.horas - a.horas; });
    var txtPol = cancel.map(function (x) { return x.horas ? 'con ' + (x.horas >= 48 ? Math.round(x.horas / 24) + ' días' : x.horas + ' horas') + ' o más de anticipación: devolución del ' + x.reembolso + ' %' : 'después: ' + (x.reembolso ? 'devolución del ' + x.reembolso + ' %' : 'sin devolución'); }).join('; ');
    if (st.res && st.res.estado === 'retenida') {
      var pr = st.res.precio;
      p.innerHTML = '<section class="caja"><h2>' + t('pagar') + '</h2><div class="reloj-ret" role="timer">⏳ ' + t('retenido') + ' <b data-reloj></b></div><div class="pago-demo"><b>Mercado Pago</b><p class="nota">Demostración: no se cobra nada. En un negocio real aquí se paga con tarjeta, débito o transferencia.</p><button class="btn prim" type="button" data-pagar>' + t('pagar') + ' ' + clp(pr.deposito) + '</button></div><div class="acciones-r"><button class="btn" type="button" data-soltar>' + t('atras') + '</button></div></section>';
      return;
    }
    var v = st.cli || {};
    p.innerHTML = '<form class="caja" novalidate data-form><h2>' + t('datos') + '</h2><div class="campos">' +
      '<div class="campo"><label for="r-nombre">' + t('nombre') + '</label><input id="r-nombre" autocomplete="name" maxlength="60" value="' + esc(v.nombre || '') + '"></div>' +
      '<div class="campo"><label for="r-correo">' + t('correo') + '</label><input id="r-correo" type="email" autocomplete="email" maxlength="120" value="' + esc(v.correo || '') + '"></div>' +
      '<div class="campo"><label for="r-tel">' + t('celular') + '</label><input id="r-tel" type="tel" autocomplete="tel" maxlength="20" placeholder="+56 9 1234 5678" value="' + esc(v.telefono || '') + '"></div>' +
      '<div class="campo"><label for="r-pais">' + t('pais') + '</label><select id="r-pais">' + ['Chile', 'Argentina', 'Brasil', 'Perú', 'Estados Unidos', 'Otro'].map(function (x) { return '<option' + (v.pais === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="form-l" style="margin-top:12px"><div class="campo"><label for="r-cod">' + t('codigo') + '</label><input id="r-cod" maxlength="20" autocapitalize="characters" value="' + esc(st.codigo) + '"></div><button class="btn chico" type="button" data-cod>' + t('aplicar') + '</button></div><p class="nota" data-cod-msj></p>' +
      '<p class="nota" style="margin-top:12px"><b>' + t('politica') + ':</b> ' + esc(txtPol) + '.' + (pol.deposito ? ' Depósito del ' + pol.deposito + ' % para confirmar; el cupo se guarda ' + pol.retencionMin + ' minutos mientras pagas.' : ' No se cobra depósito: pagas en el local.') + '</p>' +
      '<label class="chk"><input type="checkbox" id="r-acepto"><span>' + t('acepto') + '</span></label>' +
      '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-atras>' + t('atras') + '</button><button class="btn prim" type="submit">' + (pol.deposito ? t('pagarDep') : t('reservar')) + '</button></div></form>';
  }
  // Paso 4: confirmación
  function paso4(p, D) {
    var r = st.res, c = D.config, cu = R.fechaHora(D, r), nombre = r.servicio ? (R.servicio(D, r.servicio) || {}).nombre : (R.recurso(D, r.recurso) || {}).nombre;
    var g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(c.nombre + ' · ' + nombre) + '&dates=' + gfecha(r.desde) + '/' + gfecha(r.hasta) + '&details=' + encodeURIComponent('Código ' + r.codigo) + '&location=' + encodeURIComponent(c.direccion);
    var gest = location.origin + location.pathname + '?negocio=' + st.neg + '&gestion=' + r.codigo;
    p.innerHTML = '<section class="caja ok-hero"><span class="ico" aria-hidden="true">✓</span><h2 style="font-size:24px">' + t('ok') + '</h2><p>' + esc(nombre) + ' · ' + esc(cu) + '</p><p class="nota">' + t('cod') + '</p><p class="codigo">' + r.codigo + '</p>' +
      '<p class="nota">Te enviamos la confirmación por correo y WhatsApp (en esta demo quedan registradas en el panel, no salen).</p>' +
      '<div class="acciones-r" style="justify-content:center"><button class="btn" type="button" data-ics>' + t('cal') + '</button><a class="btn" href="' + g + '" target="_blank" rel="noopener">' + t('gcal') + '</a><a class="btn" href="https://wa.me/?text=' + encodeURIComponent(c.nombre + ': reserva ' + r.codigo + ', ' + cu + '. ' + gest) + '" target="_blank" rel="noopener">' + t('compartir') + '</a></div>' +
      '<p><a href="' + esc(gest) + '">' + t('gestionar') + '</a></p><p><button class="btn chico" type="button" data-nueva>Hacer otra reserva</button></p></section>';
  }
  function gfecha(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; }
  // Ver o cancelar una reserva con su código
  function gestion(p) {
    var D = d(), cod = String(q.get('gestion')).toUpperCase(), r = D.reservas.filter(function (x) { return x.codigo === cod; })[0];
    if (!r) { p.innerHTML = '<section class="caja"><p>No encontramos la reserva ' + esc(cod) + ' en este equipo.</p><p style="margin-top:10px"><a class="btn" href="./?negocio=' + st.neg + '">Volver</a></p></section>'; return; }
    var e = R.ESTADOS[r.estado], rb = R.reembolso(D, r), puede = ['retenida', 'confirmada', 'pagada'].indexOf(r.estado) > -1 && r.desde > Date.now();
    p.innerHTML = '<section class="caja"><h2>Reserva ' + r.codigo + '</h2><p><span class="chip" style="--ec:' + e[1] + '">' + e[0] + '</span></p><p style="margin-top:8px">' + esc(R.fechaHora(D, r)) + ' · ' + clp(r.precio.total) + ' · pagado ' + clp(r.pagado) + '</p>' +
      (puede ? '<p class="nota" style="margin-top:10px">Si cancelas ahora (' + rb.horas + ' h antes) te devolvemos el ' + rb.porcentaje + ' % de lo pagado: ' + clp(rb.monto) + '.</p><p style="margin-top:12px"><button class="btn peligro" type="button" data-cancelar="' + r.id + '">Cancelar mi reserva</button></p>' : r.reembolso ? '<p class="nota" style="margin-top:10px">Devolución: ' + clp(r.reembolso.monto) + '.</p>' : '') +
      '<p style="margin-top:12px"><a class="btn" href="./?negocio=' + st.neg + '">Hacer una reserva</a></p></section>';
  }
  // Resumen lateral con precio, descuentos, depósito y equivalencia en otra moneda
  function resumen(D) {
    var c = D.config, box = app.querySelector('.resumen-lat'), sel = st.sel, listo = selCompleta(D);
    if (st.paso === 4 || q.get('gestion')) { box.hidden = true; return; }
    box.hidden = false;
    if (!listo) { box.innerHTML = '<h2>' + t('resumen') + '</h2><p class="nota">' + (st.paso === 1 ? 'Elige qué quieres reservar.' : 'Elige la fecha' + (c.modo === 'noches' ? 's' : ' y la hora') + '.') + '</p>'; return; }
    var pr = st.res ? st.res.precio : R.precio(D, sel, st.codigo);
    box.innerHTML = '<h2>' + t('resumen') + '</h2>' + pr.lineas.map(function (l) { return '<div class="fila' + (l[1] < 0 ? ' desc' : '') + '"><span>' + esc(l[0]) + '</span><span>' + (l[1] < 0 ? '−' + clp(-l[1]) : clp(l[1])) + '</span></div>'; }).join('') +
      '<div class="fila total"><span>' + t('total') + '</span><span>' + clp(pr.total) + '</span></div>' + (conv(pr.total) ? '<p class="conv">' + conv(pr.total) + ' · ' + t('conv') + '</p>' : '') +
      (pr.deposito ? '<div class="fila"><span>' + t('deposito') + ' (' + c.politicas.deposito + ' %)</span><span>' + clp(pr.deposito) + '</span></div><div class="fila"><span>' + t('saldo') + '</span><span>' + clp(pr.saldo) + '</span></div>' : '') +
      '<p class="nota" style="margin-top:8px">' + esc(sel.fecha || sel.llegada ? R.fechaHora(D, { desde: c.modo === 'noches' ? U.fdate(sel.llegada).getTime() : U.fdate(sel.fecha, sel.min).getTime(), hasta: sel.salida ? U.fdate(sel.salida).getTime() : 0 }) : '') + '</p>';
  }
  function selCompleta(D) { var c = D.config, s = st.sel; return c.modo === 'noches' ? !!(s.recurso && s.llegada && s.salida) : !!((s.servicio || s.recurso) && s.fecha && s.min != null); }

  // Eventos
  app.addEventListener('click', function (e) {
    var D = d(), c = D.config, x;
    if ((x = e.target.closest('[data-recurso]'))) { st.sel.recurso = x.dataset.recurso; if (c.modo === 'bloques') st.sel.horas = R.recurso(D, st.sel.recurso).minHoras; st.sel.min = null; pintar(); }
    else if ((x = e.target.closest('[data-servicio]'))) { st.sel.servicio = x.dataset.servicio; st.sel.min = null; if (c.modo === 'cupos') st.sel.personas = Math.max(st.sel.personas || 1, R.servicio(D, st.sel.servicio).minPersonas); pintar(); }
    else if ((x = e.target.closest('[data-pers]'))) { var max = c.modo === 'noches' && st.sel.recurso ? R.recurso(D, st.sel.recurso).capacidad : c.modo === 'bloques' && st.sel.recurso ? R.recurso(D, st.sel.recurso).capacidad : 20; st.sel.personas = Math.max(1, Math.min(max, (st.sel.personas || 2) + +x.dataset.pers)); pintar(); }
    else if ((x = e.target.closest('[data-hrs]'))) { var mn = st.sel.recurso ? R.recurso(D, st.sel.recurso).minHoras : 1; st.sel.horas = Math.max(mn, Math.min(12, (st.sel.horas || mn) + +x.dataset.hrs)); st.sel.min = null; pintar(); }
    else if ((x = e.target.closest('[data-mes]'))) { st.vista.m += +x.dataset.mes; if (st.vista.m < 0) { st.vista.m = 11; st.vista.y--; } if (st.vista.m > 11) { st.vista.m = 0; st.vista.y++; } pintar(); }
    else if ((x = e.target.closest('[data-f]'))) {
      if (x.getAttribute('aria-disabled')) return;
      var f = x.dataset.f;
      if (c.modo === 'noches') { if (!st.sel.llegada || st.sel.salida || f <= st.sel.llegada) { st.sel.llegada = f; st.sel.salida = null; } else st.sel.salida = f; }
      else { st.sel.fecha = f; st.sel.min = null; }
      pintar();
    }
    else if ((x = e.target.closest('[data-min]'))) { st.sel.min = +x.dataset.min; pintar(); }
    else if ((x = e.target.closest('[data-sig]'))) {
      var err = '';
      if (st.paso === 1) err = !(st.sel.recurso || st.sel.servicio) ? 'Elige una opción.' : '';
      if (st.paso === 2) err = !selCompleta(D) ? (c.modo === 'noches' ? 'Elige la llegada y la salida.' : 'Elige el día y la hora.') : R.validar(D, st.sel);
      if (err) { app.querySelector('.err').textContent = err; return; }
      st.paso++; pintar(); app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    else if (e.target.closest('[data-atras]')) { st.paso--; pintar(); }
    else if (e.target.closest('[data-cod]')) { st.codigo = app.querySelector('#r-cod').value.trim().toUpperCase(); var pr = R.precio(D, st.sel, st.codigo); app.querySelector('[data-cod-msj]').textContent = pr.promo ? (pr.promo.error || pr.promo.nota || 'Código aplicado: −' + clp(pr.promo.valor)) : ''; recordar(); resumen(D); }
    else if (e.target.closest('[data-pagar]')) { var pg = R.pagar(st.neg, st.res.id, st.res.precio.deposito); if (pg && pg.error) { alert(pg.error); st.res = null; st.paso = 2; pintar(); return; } st.res = R.leer(st.neg).reservas.filter(function (r) { return r.id === st.res.id; })[0]; st.paso = 4; pintar(); }
    else if (e.target.closest('[data-soltar]')) { soltar(); pintar(); }
    else if (e.target.closest('[data-ics]')) descargarIcs();
    else if (e.target.closest('[data-nueva]')) { st.paso = 1; st.sel = { personas: 2 }; st.res = null; st.codigo = ''; pintar(); }
    else if (e.target.closest('[data-espera]')) { R.esperar(st.neg, JSON.parse(JSON.stringify(st.sel)), { nombre: 'Interesado', correo: '', telefono: '' }); toast(t('esperaOk')); }
    else if ((x = e.target.closest('[data-cancelar]')) && confirm('¿Cancelar la reserva?')) { R.cancelar(st.neg, x.dataset.cancelar, 'cliente'); pintar(); }
  });
  app.addEventListener('change', function (e) {
    if (e.target.id === 'prof') { st.sel.recurso = e.target.value || null; st.sel.min = null; pintar(); }
    if (e.target.dataset.extra) { var ex = st.sel.extras || []; st.sel.extras = e.target.checked ? ex.concat(e.target.dataset.extra) : ex.filter(function (z) { return z !== e.target.dataset.extra; }); resumen(d()); }
  });
  function recordar() { var g = function (id) { var el = app.querySelector('#' + id); return el ? el.value.trim() : ''; }; st.cli = { nombre: g('r-nombre'), correo: g('r-correo'), telefono: g('r-tel'), pais: g('r-pais') }; }
  app.addEventListener('submit', function (e) {
    e.preventDefault(); recordar();
    var cli = st.cli, err = app.querySelector('.err'), tel = cli.telefono.replace(/[^\d+]/g, '');
    var falta = cli.nombre.length < 3 ? 'Escribe tu nombre.' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cli.correo) ? 'Escribe un correo válido.' : tel.replace(/\D/g, '').length < 8 ? 'Escribe un celular válido.' : !app.querySelector('#r-acepto').checked ? 'Debes aceptar la política de cancelación.' : '';
    if (falta) { err.textContent = falta; return; }
    st.codigo = (app.querySelector('#r-cod').value || '').trim().toUpperCase();
    var out = R.crear(st.neg, JSON.parse(JSON.stringify(st.sel)), { nombre: cli.nombre.slice(0, 60), correo: cli.correo.slice(0, 120), telefono: tel.slice(0, 20), pais: cli.pais, idioma: st.idioma }, { codigo: st.codigo });
    if (out.error) { err.textContent = out.error; return; }
    st.res = out.reserva; if (st.res.estado !== 'retenida') st.paso = 4; pintar();
  });
  function soltar() { if (st.res && st.res.estado === 'retenida') R.estado(st.neg, st.res.id, 'cancelada', { canceladaPor: 'cliente: volvió atrás' }); st.res = null; }
  function descargarIcs() {
    var D = d(), r = st.res, c = D.config, f = function (ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; };
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bio Digital//Reservas//ES', 'BEGIN:VEVENT', 'UID:' + r.id + '@biodigital', 'DTSTAMP:' + f(Date.now()), 'DTSTART:' + f(r.desde), 'DTEND:' + f(r.hasta), 'SUMMARY:' + c.nombre.replace(/[,;]/g, ' ') + ' (' + r.codigo + ')', 'LOCATION:' + c.direccion.replace(/[,;]/g, ' '), 'BEGIN:VALARM', 'TRIGGER:-PT' + (c.modo === 'noches' ? '24H' : '2H'), 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'reserva-' + r.codigo + '.ics'; a.click();
  }
  // Reloj de la retención y tareas automáticas
  setInterval(function () {
    R.automatico(st.neg);
    if (st.res && st.res.estado === 'retenida') {
      var r = R.leer(st.neg).reservas.filter(function (x) { return x.id === st.res.id; })[0], el = app.querySelector('[data-reloj]');
      if (!r || r.estado !== 'retenida') { st.res = null; toast('Se acabó el tiempo para pagar: liberamos el cupo.'); st.paso = 2; pintar(); return; }
      if (el) { var s = Math.max(0, Math.round((r.expira - Date.now()) / 1000)); el.textContent = Math.floor(s / 60) + ':' + U.pad(s % 60); }
    }
  }, 1000);
  // Disponibilidad en vivo: si otra pestaña o persona reserva, se recalcula
  R.escuchar(function (m) {
    if (m.id !== st.neg) return;
    if (st.paso === 2) { var antes = st.sel.min, D = d(); if (selCompleta(D) && R.validar(D, st.sel)) { st.sel.min = null; if (D.config.modo === 'noches') st.sel.salida = null; toast(t('actualizada')); } pintar(); if (antes !== st.sel.min) {} }
    else if (st.paso === 1) pintar();
  });
  pintar();
})();
