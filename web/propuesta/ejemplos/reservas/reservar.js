// Reservas, lado del cliente: elegir → fecha y hora → datos y pago → confirmación; "Mis reservas" para ver, modificar o cancelar.
// Español, inglés y portugués; precios en pesos con equivalencia en otras monedas. La disponibilidad se actualiza en vivo si otra persona reserva.
// Conectado a la nube, el SERVIDOR calcula el precio y valida todo (motor.js): esta pantalla solo muestra y envía lo que la persona eligió.
(function () {
  'use strict';
  var R = window.Reservas, U = R.util, app = document.getElementById('app');
  var q = new URLSearchParams(location.search);
  var T = {
    es: { que: 'Qué', cuando: 'Cuándo', datos: 'Tus datos', listo: 'Listo', personas: 'Personas', horas: 'Horas', sig: 'Continuar', atras: 'Atrás', noche: 'noche', noches: 'noches', persona: 'persona', hora: 'hora',
      desde: 'desde', libre: 'Disponible', pocos: 'Quedan pocos', lleno: 'Completo', cerrado: 'Cerrado', llegada: 'Elige el día de llegada', salida: 'Ahora elige el día de salida', dia: 'Elige un día', horaE: 'Elige una hora', quedan: 'quedan', prof: 'Profesional', cualquiera: 'Cualquiera',
      nombre: 'Nombre y apellido', correo: 'Correo', celular: 'Celular (WhatsApp)', pais: 'País', codigo: 'Código de descuento', aplicar: 'Aplicar', acepto: 'Acepto la política de cancelación y los términos.', resumen: 'Resumen', total: 'Total', deposito: 'Depósito ahora', saldo: 'Saldo al llegar',
      reservar: 'Reservar', pagarDep: 'Ir a pagar el depósito', retenido: 'Te guardamos el cupo por', pagar: 'Pagar', ok: '¡Reserva confirmada!', cod: 'Tu código', cal: 'Agregar a mi calendario', gcal: 'Google Calendar', compartir: 'Enviar por WhatsApp', gestionar: 'Ver, modificar o cancelar mi reserva',
      espera: 'Avísame si se libera un cupo', esperaOk: 'Listo: te avisamos por correo o WhatsApp si se libera.', politica: 'Política de cancelación', extras: 'Agrega a tu estadía', conv: 'Referencial. Se cobra en pesos chilenos.', vivo: 'Disponibilidad en vivo', actualizada: 'La disponibilidad cambió: alguien acaba de reservar.',
      mis: 'Mis reservas', guardar: 'Guardar los cambios', modificando: 'Estás modificando tu reserva', reservando: 'Reservando…' },
    en: { que: 'What', cuando: 'When', datos: 'Your details', listo: 'Done', personas: 'Guests', horas: 'Hours', sig: 'Continue', atras: 'Back', noche: 'night', noches: 'nights', persona: 'person', hora: 'hour',
      desde: 'from', libre: 'Available', pocos: 'Few left', lleno: 'Full', cerrado: 'Closed', llegada: 'Choose your check-in day', salida: 'Now choose your check-out day', dia: 'Choose a day', horaE: 'Choose a time', quedan: 'left', prof: 'Professional', cualquiera: 'Any',
      nombre: 'Full name', correo: 'Email', celular: 'Mobile (WhatsApp)', pais: 'Country', codigo: 'Discount code', aplicar: 'Apply', acepto: 'I accept the cancellation policy and terms.', resumen: 'Summary', total: 'Total', deposito: 'Deposit now', saldo: 'Balance on arrival',
      reservar: 'Book', pagarDep: 'Pay the deposit', retenido: 'Your spot is held for', pagar: 'Pay', ok: 'Booking confirmed!', cod: 'Your code', cal: 'Add to my calendar', gcal: 'Google Calendar', compartir: 'Send by WhatsApp', gestionar: 'View, change or cancel my booking',
      espera: 'Notify me if a spot opens', esperaOk: 'Done: we will notify you by email or WhatsApp.', politica: 'Cancellation policy', extras: 'Add to your stay', conv: 'For reference. Charged in Chilean pesos.', vivo: 'Live availability', actualizada: 'Availability changed: someone just booked.',
      mis: 'My bookings', guardar: 'Save changes', modificando: 'You are changing your booking', reservando: 'Booking…' },
    pt: { que: 'O quê', cuando: 'Quando', datos: 'Seus dados', listo: 'Pronto', personas: 'Pessoas', horas: 'Horas', sig: 'Continuar', atras: 'Voltar', noche: 'noite', noches: 'noites', persona: 'pessoa', hora: 'hora',
      desde: 'a partir de', libre: 'Disponível', pocos: 'Últimas vagas', lleno: 'Lotado', cerrado: 'Fechado', llegada: 'Escolha o dia de chegada', salida: 'Agora escolha o dia de saída', dia: 'Escolha um dia', horaE: 'Escolha um horário', quedan: 'restam', prof: 'Profissional', cualquiera: 'Qualquer',
      nombre: 'Nome completo', correo: 'E-mail', celular: 'Celular (WhatsApp)', pais: 'País', codigo: 'Cupom de desconto', aplicar: 'Aplicar', acepto: 'Aceito a política de cancelamento e os termos.', resumen: 'Resumo', total: 'Total', deposito: 'Sinal agora', saldo: 'Saldo na chegada',
      reservar: 'Reservar', pagarDep: 'Pagar o sinal', retenido: 'Guardamos sua vaga por', pagar: 'Pagar', ok: 'Reserva confirmada!', cod: 'Seu código', cal: 'Adicionar ao calendário', gcal: 'Google Agenda', compartir: 'Enviar por WhatsApp', gestionar: 'Ver, alterar ou cancelar minha reserva',
      espera: 'Avise-me se abrir uma vaga', esperaOk: 'Pronto: avisaremos por e-mail ou WhatsApp.', politica: 'Política de cancelamento', extras: 'Adicione à sua estadia', conv: 'Referência. Cobrado em pesos chilenos.', vivo: 'Disponibilidade ao vivo', actualizada: 'A disponibilidade mudou: alguém acabou de reservar.',
      mis: 'Minhas reservas', guardar: 'Salvar alterações', modificando: 'Você está alterando sua reserva', reservando: 'Reservando…' }
  };
  // Tipos de cambio aproximados (pesos por unidad). Verificar antes de publicar; solo se muestran como referencia.
  var MONEDAS = { CLP: [1, 'es-CL', 'CLP'], USD: [950, 'en-US', 'USD'], EUR: [1030, 'de-DE', 'EUR'], BRL: [170, 'pt-BR', 'BRL'] };
  var LOC = { es: 'es-CL', en: 'en-US', pt: 'pt-BR' };
  var OFF = { pasado: 1, lejos: 1, cerrado: 1, lleno: 1, bloqueado: 1, corte: 1, min: 1 };   // días que no se pueden elegir (cada uno con su motivo)
  var guard = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  var st = { neg: q.get('negocio') || guard('bdres-neg') || R.NEGOCIOS[0].id, idioma: guard('bdres-idioma') || ((navigator.language || 'es').slice(0, 2) in T ? (navigator.language || 'es').slice(0, 2) : 'es'), moneda: guard('bdres-moneda') || 'CLP', paso: 1, sel: {}, codigo: '', vista: null, res: null, edit: null, cot: null, enviando: false, motivo: null, aviso: null, resp: {}, dupOk: false };
  if (!R.NEGOCIOS.some(function (n) { return n.id === st.neg; })) st.neg = R.NEGOCIOS[0].id;
  if (q.get('idioma') in T) st.idioma = q.get('idioma');
  // Insertada en otra web con widget.js: avisa su alto para que el marco crezca con el contenido (sin doble barra de desplazamiento)
  if (q.get('widget') && window.parent !== window && window.ResizeObserver) {
    document.documentElement.classList.add('en-widget');
    new ResizeObserver(function () { parent.postMessage({ bdres: 'alto', alto: document.documentElement.scrollHeight }, '*'); }).observe(document.body);
  }
  var t = function (k) { return T[st.idioma][k] || T.es[k]; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var clp = U.clp, copia = function (x) { return JSON.parse(JSON.stringify(x)); };
  var conv = function (n) { if (st.moneda === 'CLP') return ''; var m = MONEDAS[st.moneda]; return '≈ ' + new Intl.NumberFormat(m[1], { style: 'currency', currency: m[2], maximumFractionDigits: 0 }).format(n / m[0]); };
  function d() { return R.leer(st.neg); }
  function toast(x, malo) { var e = document.createElement('div'); e.className = 'toast'; e.setAttribute('role', malo ? 'alert' : 'status'); e.textContent = x; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 4200); }

  // Barra superior: negocios de la demostración (solo si hay más de uno), idioma y moneda
  app.innerHTML = '<div class="wrap"><div class="negocios" role="group" aria-label="Negocio"></div><header class="cab"></header><div class="motor"><div><ol class="pasos-r"></ol><div data-paso></div></div><aside class="resumen-lat caja" aria-label="' + t('resumen') + '"></aside></div></div>';
  var selIdi = document.getElementById('idioma'), selMon = document.getElementById('moneda');
  selIdi.value = st.idioma; selMon.value = st.moneda;
  selIdi.addEventListener('change', function () { st.idioma = selIdi.value; guard('bdres-idioma', st.idioma); document.documentElement.lang = st.idioma; pintar(); });
  selMon.addEventListener('change', function () { st.moneda = selMon.value; guard('bdres-moneda', st.moneda); pintar(); });
  document.documentElement.lang = st.idioma;
  function pintarNegocios() {
    var cont = app.querySelector('.negocios'); cont.hidden = R.NEGOCIOS.length < 2;
    cont.innerHTML = R.NEGOCIOS.length < 2 ? '' : R.NEGOCIOS.map(function (n) { return '<button type="button" data-neg="' + n.id + '" aria-pressed="' + (n.id === st.neg) + '">' + R.icono(n.icono, 18) + esc(n.rubro) + '</button>'; }).join('');
    var a = document.querySelector('[data-admin]'); if (a) { a.href = 'admin/?negocio=' + st.neg; a.hidden = !R.AGENDA.demo; }   // en un negocio real el panel no se ofrece al público
    var m = document.querySelector('[data-mis]'); if (m) { m.textContent = t('mis'); m.href = './?negocio=' + st.neg + '&mis=1'; }
  }
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-neg]'); if (!b) return;
    soltar(); location.href = location.pathname + '?negocio=' + b.dataset.neg;
  });

  function pintar() {
    var D = d(), c = D.config;
    R.automatico(st.neg);
    document.documentElement.style.setProperty('--marca', c.color || '');   // el color del negocio tiñe botones, precios y marcas
    pintarNegocios();
    var reglas = (c.reglas || []).filter(function (g) { return g.activa; });
    app.querySelector('.cab').innerHTML = '<div class="marca-n">' + R.logo(c) + '<div><h1>' + esc(c.nombre) + '</h1><p>' + esc(c.rubro) + ' · ' + esc(c.direccion) + ' · <span class="vivo">' + t('vivo') + '</span></p></div></div>' +
      (reglas.length ? '<p class="promo">' + R.icono('calendario', 16) + '<b>Promociones:</b> ' + reglas.map(function (g) { return esc({ anticipada: 'reserva con ' + g.dias + '+ días de anticipación −' + g.porcentaje + ' %', estadia: g.noches + '+ noches −' + g.porcentaje + ' %', grupo: 'grupos de ' + g.personas + '+ −' + g.porcentaje + ' %', ultimo: 'último minuto −' + g.porcentaje + ' %', duracion: g.horas + '+ horas −' + g.porcentaje + ' %' }[g.tipo]); }).join(' · ') + '</p>' : '');
    var p = app.querySelector('[data-paso]');
    if (!R.estaPublicada(st.neg)) { app.querySelector('.pasos-r').innerHTML = ''; app.querySelector('.resumen-lat').hidden = true; p.innerHTML = '<section class="caja"><h2>' + esc(c.nombre) + '</h2><p>Este negocio todavía no publica su agenda de reservas. Vuelve pronto o escríbele directamente.</p></section>'; return; }
    if (q.get('mis')) { app.querySelector('.pasos-r').innerHTML = ''; app.querySelector('.resumen-lat').hidden = true; return mis(p); }
    if (q.get('gestion')) { app.querySelector('.pasos-r').innerHTML = ''; app.querySelector('.resumen-lat').hidden = true; return gestion(p); }
    var nombres = [t('que'), t('cuando'), t('datos'), t('listo')];
    app.querySelector('.pasos-r').innerHTML = nombres.map(function (n, i) { return '<li class="' + (i + 1 < st.paso ? 'hecho' : i + 1 === st.paso ? 'actual' : '') + '"' + (i + 1 === st.paso ? ' aria-current="step"' : '') + '>' + n + '</li>'; }).join('');
    [paso1, paso2, paso3, paso4][st.paso - 1](p, D);
    if (st.aviso && st.paso < 4) p.insertAdjacentHTML('afterbegin', avisoHtml(st.aviso));
    if (st.edit && st.paso < 4) p.insertAdjacentHTML('afterbegin', '<div class="banda-ed" role="status"><b>' + t('modificando') + ' ' + esc(st.edit.codigo) + '.</b> Lo que cambies se guarda en esa misma reserva (no se crea otra). <a href="./?negocio=' + st.neg + '&gestion=' + esc(st.edit.codigo) + '&rid=' + esc(st.edit.rid) + '">Cancelar cambios</a></div>');
    resumen(D);
  }

  // Aviso grande arriba del paso: por qué no se pudo reservar y qué hacer (antes salía en letra chica bajo el botón y parecía que se quedaba pegado)
  function avisoHtml(a) {
    var D = d(), enlace = function (r) { return './?negocio=' + st.neg + '&gestion=' + esc(r.codigo) + '&rid=' + esc(r.id); };
    var linea = function (r) { return esc(nombreRes(D, r)) + ' · ' + esc(R.fechaHora(D, r)) + ' · código <b>' + esc(r.codigo) + '</b>'; };
    if (a.tipo === 'duplicada') return '<div class="aviso-grande info" role="alert"><h3>Ya tienes una reserva igual</h3><p>' + linea(a.r) + ' (' + R.ESTADOS[a.r.estado][0].toLowerCase() + ').</p><p>Si querías otra más (por ejemplo, para otra familia), puedes seguir.</p><div class="acc"><a class="btn prim" href="' + enlace(a.r) + '">Ver mi reserva</a><button class="btn" type="button" data-dup-ok>Sí, quiero otra igual</button></div></div>';
    if (a.tipo === 'retenciones') return '<div class="aviso-grande" role="alert"><h3>Ya tienes 2 reservas esperando el pago del depósito</h3><p>Para hacer otra, paga o cancela una de ellas. Si no las pagas, se liberan solas al vencer el plazo.</p>' +
      (a.lista.length ? '<ul style="margin:0 0 0 18px;font-size:14px">' + a.lista.map(function (r) { return '<li>' + linea(r) + (r.expira ? ' · vence a las ' + new Date(r.expira).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '') + ' · <a href="' + enlace(r) + '">pagar o cancelar</a></li>'; }).join('') + '</ul>' : '<p>Las hiciste desde otro equipo: ábrelas con el enlace que te llegó.</p>') + '</div>';
    return '<div class="aviso-grande" role="alert"><h3>' + esc(a.titulo || 'No pudimos guardar la reserva') + '</h3><p>' + esc(a.texto) + '</p></div>';
  }
  function alAviso() { var a = app.querySelector('.aviso-grande'); (a || app).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function nombreRes(D, r) { var x = r.servicio ? R.servicio(D, r.servicio) : R.recurso(D, r.recurso); return (x || {}).nombre || ''; }
  // Lo que le tocó: la unidad (cabaña, habitación, box) o el profesional; en tours no aplica
  function unidadHtml(D, r) { if (!r.unidadNombre) return D.config.modo === 'noches' && r.recurso ? '<span class="unidad-asig">La unidad se asigna al llegar</span>' : ''; return '<span class="unidad-asig">' + (D.config.modo === 'horas' ? 'Te atiende: ' : 'Te toca: ') + esc(r.unidadNombre) + '</span>'; }
  // Paso 1: qué reservar
  function paso1(p, D) {
    var c = D.config, lista = c.modo === 'noches' || c.modo === 'bloques' ? c.recursos : c.servicios, clave = c.modo === 'noches' || c.modo === 'bloques' ? 'recurso' : 'servicio';
    var unidad = { noches: '/ ' + t('noche'), cupos: '/ ' + t('persona'), horas: '', bloques: '/ ' + t('hora') }[c.modo];
    p.innerHTML = '<section class="caja"><h2>' + t('que') + '</h2><div class="opciones-r">' + lista.map(function (x) {
      var cap = x.capacidad ? (c.modo === 'cupos' ? x.capacidad + ' cupos por salida' : 'hasta ' + x.capacidad + ' personas') : x.duracion ? x.duracion + ' min' : '';
      return '<button type="button" class="opcion" data-' + clave + '="' + esc(x.id) + '" aria-pressed="' + (st.sel[clave] === x.id) + '"><b>' + esc(x.nombre) + '</b><span class="p">' + (c.modo === 'horas' ? '' : t('desde') + ' ') + clp(x.precio) + ' ' + unidad + '</span><small>' + esc([cap, x.minHoras ? 'mínimo ' + x.minHoras + ' h' : '', x.minPersonas > 1 ? 'mínimo ' + x.minPersonas + ' personas' : '', c.modo === 'cupos' && x.salidas ? 'salidas ' + x.salidas.join(' y ') : ''].filter(Boolean).join(' · ')) + '</small>' +
        (x.desc ? '<small>' + esc(x.desc) + '</small>' : '') + (x.incluye ? '<ul>' + x.incluye.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' : '') + '</button>';
    }).join('') + '</div>' +
    (c.modo !== 'horas' ? '<div class="fila-ctl"><span>' + t('personas') + '</span><div class="contador"><button type="button" data-pers="-1" aria-label="Menos">−</button><span>' + (st.sel.personas || 2) + '</span><button type="button" data-pers="1" aria-label="Más">+</button></div>' +
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
      var off = OFF[e.estado];
      if (st.motivo && st.motivo.f === f) cls.push('elegido-off');
      var q = !off && e.info !== '' && e.info != null && e.total ? '<small class="q" aria-hidden="true">' + e.info + '/' + e.total + '</small>' : '';
      celdas += '<button type="button" class="' + cls.join(' ') + '" data-f="' + f + '"' + (off ? ' aria-disabled="true"' : '') + ' title="' + esc(e.motivo || '') + '" aria-label="' + esc(f + ' · ' + (e.motivo || t(e.estado === 'pasado' ? 'cerrado' : e.estado) || '')) + '">' + n + q + '<i aria-hidden="true"></i></button>';
    });
    var guia = c.modo === 'noches' ? (!st.sel.llegada || st.sel.salida ? t('llegada') : t('salida')) : t('dia');
    var html = '<section class="caja"><h2>' + t('cuando') + '</h2><p class="nota" style="margin-bottom:10px">' + guia + '</p>' +
      '<div class="cal-cab"><button class="btn chico" type="button" data-mes="-1" aria-label="Mes anterior">‹</button><b>' + nom + '</b><button class="btn chico" type="button" data-mes="1" aria-label="Mes siguiente">›</button></div>' +
      '<div class="cal">' + dn.map(function (x) { return '<span class="dn">' + x + '</span>'; }).join('') + celdas + '</div>' +
      '<p class="leyenda"><span style="--c:var(--ok)">' + t('libre') + '</span><span style="--c:var(--pocos)">' + t('pocos') + '</span><span style="--c:var(--lleno)">' + t('lleno') + '</span>' + (c.modo === 'noches' || c.modo === 'cupos' ? '<span style="--c:transparent">2/3 = quedan 2 de 3</span>' : '') + '<span style="--c:transparent">Toca un día gris para saber por qué</span></p>';
    if (st.motivo) {   // por qué no se puede ese día y qué fechas cercanas sí
      var sug = R.cercanas(D, c.modo === 'noches' && st.motivo.salida ? { recurso: st.sel.recurso, salvo: st.sel.salvo } : st.sel, st.motivo.f, 3);
      html += '<div class="motivo-dia" role="status"><span><b>' + esc(new Date(U.fdate(st.motivo.f)).toLocaleDateString(LOC[st.idioma], { weekday: 'long', day: 'numeric', month: 'long' })) + ':</b> ' + esc(st.motivo.texto) + '</span>' +
        (sug.length && !st.motivo.salida ? '<span class="nota">Fechas libres cercanas:</span><div class="sug">' + sug.map(function (f) { return '<button class="btn chico" type="button" data-sug="' + f + '">' + esc(U.fdate(f).toLocaleDateString(LOC[st.idioma], { weekday: 'short', day: 'numeric', month: 'short' })) + '</button>'; }).join('') + '</div>' : '') +
        (/lleno|bloqueado/.test(st.motivo.estado) && R.modulo(c, 'espera') && c.modo === 'noches' ? '<div><button class="btn chico" type="button" data-espera>' + t('espera') + '</button></div>' : '') + '</div>';
    }
    if (c.modo === 'horas' && st.sel.fecha) {
      var profs = c.recursos.filter(function (r) { return r.servicios.indexOf(st.sel.servicio) > -1; });
      if (profs.length > 1) html += '<div class="campo" style="margin-top:12px;max-width:320px"><label for="prof">' + t('prof') + '</label><select id="prof"><option value="">' + t('cualquiera') + '</option>' + profs.map(function (r) { return '<option value="' + esc(r.id) + '"' + (st.sel.recurso === r.id ? ' selected' : '') + '>' + esc(r.nombre) + '</option>'; }).join('') + '</select></div>';
    }
    if (c.modo !== 'noches' && st.sel.fecha) {
      var hs = c.modo === 'cupos' ? R.salidas(D, st.sel) : R.horas(D, st.sel);
      html += '<p class="nota" style="margin-top:12px">' + t('horaE') + '</p><div class="horas-r">' + (hs.length ? hs.map(function (h) {
        var lleno = c.modo === 'cupos' && h.quedan < st.sel.personas;
        return '<button type="button" data-min="' + h.min + '" aria-pressed="' + (st.sel.min === h.min) + '"' + (lleno ? ' disabled' : '') + '>' + h.hora + (c.modo === 'cupos' ? '<small>' + h.quedan + ' ' + t('quedan') + '</small>' : '') + '</button>';
      }).join('') : '<p class="nota">' + t('lleno') + '</p>') + '</div>';
      if (R.modulo(c, 'espera') && (!hs.length || (c.modo === 'cupos' && hs.every(function (h) { return h.quedan < st.sel.personas; })))) html += '<p style="margin-top:10px"><button class="btn chico" type="button" data-espera>' + t('espera') + '</button></p>';
    }
    if (c.modo === 'noches' && st.sel.salida) { var lib = R.libresNoche(D, st.sel.recurso, st.sel.llegada, st.sel.salvo), tot = (R.recurso(D, st.sel.recurso) || {}).unidades || 1; for (var nn = 1; nn < U.difDias(st.sel.llegada, st.sel.salida); nn++) lib = Math.min(lib, R.libresNoche(D, st.sel.recurso, U.sumaDias(st.sel.llegada, nn), st.sel.salvo)); if (tot > 1) html += '<p class="nota" style="margin-top:10px">' + esc((R.recurso(D, st.sel.recurso) || {}).nombre) + ': quedan <b>' + Math.max(0, lib) + ' de ' + tot + '</b> para todas tus noches. Al reservar te decimos cuál te toca.</p>'; }
    if (c.modo === 'noches' && c.servicios.length && R.modulo(c, 'extras') && st.sel.salida) html += '<div style="margin-top:14px"><p class="lbl nota">' + t('extras') + '</p>' + c.servicios.map(function (s) { return '<label class="chk"><input type="checkbox" data-extra="' + esc(s.id) + '"' + ((st.sel.extras || []).indexOf(s.id) > -1 ? ' checked' : '') + '><span><b>' + esc(s.nombre) + '</b> · ' + clp(s.precio) + ' — ' + esc(s.desc) + '</span></label>'; }).join('') + '</div>';
    html += '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-atras>' + t('atras') + '</button><button class="btn prim" type="button" data-sig>' + t('sig') + '</button></div></section>';
    p.innerHTML = html;
  }
  // Campo con su mensaje y marca roja (se corrige solo al arreglarlo)
  function campo(id, etiqueta, valor, extra) { return '<div class="campo"><label for="' + id + '">' + etiqueta + '</label><input id="' + id + '" ' + (extra || '') + ' value="' + esc(valor) + '"><small class="campo-err" role="alert"></small></div>'; }
  // Paso 3: datos, código, política y pago del depósito
  // Campos propios del negocio (los define el jefe en el panel; el servidor valida): texto, número, opciones o sí/no
  function camposPropios(c) {
    var lista = R.modulo(c, 'campos') ? (c.campos || []) : []; if (!lista.length) return '';
    return '<div class="campos" style="margin-top:12px">' + lista.map(function (cp) {
      var id = 'rc-' + cp.id, v = st.resp[cp.id] || '', et = esc(cp.etiqueta) + (cp.obligatorio ? '' : ' <small class="nota">(opcional)</small>'), ay = cp.ayuda ? '<small class="nota">' + esc(cp.ayuda) + '</small>' : '';
      var ctl = cp.tipo === 'opciones' ? '<select id="' + id + '" data-resp="' + esc(cp.id) + '"><option value="">Elige…</option>' + (cp.opciones || []).map(function (o) { return '<option' + (o === v ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>'
        : cp.tipo === 'si' ? '<select id="' + id + '" data-resp="' + esc(cp.id) + '"><option value="">Elige…</option><option' + (v === 'Sí' ? ' selected' : '') + '>Sí</option><option' + (v === 'No' ? ' selected' : '') + '>No</option></select>'
        : '<input id="' + id + '" data-resp="' + esc(cp.id) + '"' + (cp.tipo === 'numero' ? ' inputmode="numeric" maxlength="6"' : ' maxlength="300"') + ' value="' + esc(v) + '">';
      return '<div class="campo"><label for="' + id + '">' + et + '</label>' + ctl + ay + '<small class="campo-err" role="alert"></small></div>';
    }).join('') + '</div>';
  }
  function paso3(p, D) {
    var c = R.efectiva(D.config), pol = c.politicas, cancel = pol.cancelacion.slice().sort(function (a, b) { return b.horas - a.horas; });
    var txtPol = cancel.map(function (x) { return x.horas ? 'con ' + (x.horas >= 48 ? Math.round(x.horas / 24) + ' días' : x.horas + ' horas') + ' o más de anticipación: devolución del ' + x.reembolso + ' %' : 'después: ' + (x.reembolso ? 'devolución del ' + x.reembolso + ' %' : 'sin devolución'); }).join('; ');
    if (st.res && st.res.estado === 'retenida') {
      var pr = st.res.precio, demo = R.conectado(st.neg) ? !!c.pagoDemo : true;
      p.innerHTML = '<section class="caja"><h2>' + t('pagar') + '</h2><div class="reloj-ret" role="timer">⏳ ' + t('retenido') + ' <b data-reloj></b></div>' + (unidadHtml(D, st.res) ? '<p style="margin-bottom:10px">' + unidadHtml(D, st.res) + '</p>' : '') +
        (demo ? '<div class="pago-demo"><b>Mercado Pago</b><p class="nota">Demostración: no se cobra nada. En un negocio real aquí se paga con tarjeta, débito o transferencia.</p><button class="btn prim" type="button" data-pagar>' + t('pagar') + ' ' + clp(pr.deposito) + '</button></div>'
          : '<div class="pago-demo"><b>' + t('deposito') + ': ' + clp(pr.deposito) + '</b><p class="nota">' + esc(c.pagoInstrucciones || 'El negocio te contactará por correo o WhatsApp para recibir el depósito y confirmar tu reserva.') + '</p><p class="nota">Cuando el negocio confirme el pago, esta reserva pasa a "Confirmada" y te avisamos. Si pasa el tiempo sin pago, la fecha se libera.</p></div>') +
        '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-soltar>' + t('atras') + '</button>' + (demo ? '' : '<a class="btn" href="./?negocio=' + st.neg + '&gestion=' + esc(st.res.codigo) + '&rid=' + esc(st.res.id) + '">' + t('gestionar') + '</a>') + '</div></section>';
      return;
    }
    var v = st.cli || {};
    p.innerHTML = '<form class="caja" novalidate data-form><h2>' + t('datos') + '</h2><div class="campos">' +
      campo('r-nombre', t('nombre'), v.nombre || '', 'autocomplete="name" maxlength="60"') + campo('r-correo', t('correo'), v.correo || '', 'type="email" autocomplete="email" maxlength="120"') +
      campo('r-tel', t('celular'), v.telefono || '', 'type="tel" autocomplete="tel" maxlength="20" placeholder="+56 9 1234 5678"') +
      '<div class="campo"><label for="r-pais">' + t('pais') + '</label><select id="r-pais">' + ['Chile', 'Argentina', 'Brasil', 'Perú', 'Estados Unidos', 'Otro'].map(function (x) { return '<option' + (v.pais === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div></div>' +
      camposPropios(D.config) +
      (R.modulo(D.config, 'promociones') ? '<div class="form-l" style="margin-top:12px"><div class="campo"><label for="r-cod">' + t('codigo') + '</label><input id="r-cod" maxlength="20" autocapitalize="characters" value="' + esc(st.codigo) + '"></div><button class="btn chico" type="button" data-cod>' + t('aplicar') + '</button></div><p class="nota" data-cod-msj></p>' : '') +
      '<p class="nota" style="margin-top:12px"><b>' + t('politica') + ':</b> ' + esc(txtPol) + '.' + (pol.deposito ? ' Depósito del ' + pol.deposito + ' % para confirmar; el cupo se guarda ' + pol.retencionMin + ' minutos mientras pagas.' : ' No se cobra depósito: pagas en el local.') + '</p>' +
      (st.edit ? '' : '<div class="campo"><label class="chk"><input type="checkbox" id="r-acepto"' + (st.acepto ? ' checked' : '') + '><span>' + t('acepto') + '</span></label><small class="campo-err" role="alert"></small></div>') +
      '<p class="err" role="alert"></p><div class="acciones-r"><button class="btn" type="button" data-atras>' + t('atras') + '</button><button class="btn prim" type="submit">' + (st.edit ? t('guardar') : pol.deposito ? t('pagarDep') : t('reservar')) + '</button></div></form>';
  }
  // Paso 4: confirmación
  function paso4(p, D) {
    var r = st.res, c = D.config, cu = R.fechaHora(D, r), nombre = r.servicio ? (R.servicio(D, r.servicio) || {}).nombre : (R.recurso(D, r.recurso) || {}).nombre;
    var g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(c.nombre + ' · ' + nombre) + '&dates=' + gfecha(r.desde) + '/' + gfecha(r.hasta) + '&details=' + encodeURIComponent('Código ' + r.codigo) + '&location=' + encodeURIComponent(c.direccion);
    var gest = location.origin + location.pathname + '?negocio=' + st.neg + '&gestion=' + r.codigo + '&rid=' + r.id;
    p.innerHTML = '<section class="caja ok-hero"><span class="ico" aria-hidden="true">✓</span><h2 style="font-size:24px">' + (st.edit ? '¡Reserva actualizada!' : t('ok')) + '</h2><p>' + esc(nombre) + ' · ' + esc(cu) + '</p>' + (unidadHtml(D, r) ? '<p>' + unidadHtml(D, r) + '</p>' : '') + '<p class="nota">' + t('cod') + '</p><p class="codigo">' + esc(r.codigo) + '</p>' +
      '<p class="nota">' + (R.conectado(st.neg) ? 'Guarda este código: con él (y el enlace de abajo) puedes ver, modificar o cancelar tu reserva.' : 'Demostración: no salen mensajes reales.') + '</p>' +
      '<div class="acciones-r" style="justify-content:center"><button class="btn" type="button" data-ics>' + t('cal') + '</button><a class="btn" href="' + g + '" target="_blank" rel="noopener">' + t('gcal') + '</a><a class="btn" href="https://wa.me/?text=' + encodeURIComponent(c.nombre + ': reserva ' + r.codigo + ', ' + cu + '. ' + gest) + '" target="_blank" rel="noopener">' + t('compartir') + '</a></div>' +
      '<p><a href="' + esc(gest) + '">' + t('gestionar') + '</a></p><p><a href="./?negocio=' + st.neg + '&mis=1">' + t('mis') + '</a> · <button class="btn chico" type="button" data-nueva>Hacer otra reserva</button></p></section>';
  }
  function gfecha(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; }

  // Mis reservas: las que se hicieron desde este equipo o abriendo su enlace
  function mis(p) {
    var D = d(), ids = R.mias(st.neg), l = ids.map(function (id) { return R.reservaDe(st.neg, id); }).filter(Boolean).sort(function (a, b) { return b.desde - a.desde; });
    var prox = l.filter(function (r) { return ['retenida', 'confirmada', 'pagada', 'checkin'].indexOf(r.estado) > -1; }), antes = l.filter(function (r) { return prox.indexOf(r) < 0; });
    var tarj = function (r) {
      var e = R.ESTADOS[r.estado], nom = r.servicio ? (R.servicio(D, r.servicio) || {}).nombre : (R.recurso(D, r.recurso) || {}).nombre;
      return '<article class="caja" style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>' + esc(nom) + '</b><span class="chip" style="--ec:' + e[1] + '">' + e[0] + '</span></div><p class="nota">' + esc(R.fechaHora(D, r)) + (r.unidadNombre ? ' · ' + esc(r.unidadNombre) : '') + ' · ' + clp(r.precio.total) + ' · código <b>' + esc(r.codigo) + '</b></p><p><a class="btn chico" href="./?negocio=' + st.neg + '&gestion=' + esc(r.codigo) + '&rid=' + esc(r.id) + '">Ver y gestionar</a></p></article>';
    };
    p.innerHTML = '<h2 style="margin-bottom:6px">' + t('mis') + '</h2><p class="nota" style="margin-bottom:12px">Las reservas hechas desde este equipo. Si reservaste en otro, abre el enlace que te enviamos.</p>' +
      (l.length ? (prox.length ? '<h3 style="margin:10px 0">Vigentes</h3>' + prox.map(tarj).join('') : '') + (antes.length ? '<h3 style="margin:14px 0 10px">Anteriores</h3>' + antes.map(tarj).join('') : '') : '<section class="caja"><p>Todavía no tienes reservas en este equipo.</p></section>') +
      '<p style="margin-top:14px"><a class="btn prim" href="./?negocio=' + st.neg + '">Hacer una reserva</a></p>';
  }
  // Una reserva: estado, historial, y para el cliente modificar o cancelar
  function gestion(p) {
    var D = d(), c = D.config, cod = String(q.get('gestion')).toUpperCase(), rid = q.get('rid'), r = (rid && R.reservaDe(st.neg, rid)) || D.reservas.filter(function (x) { return !x._pub && x.codigo === cod; })[0];
    if (!r) { p.innerHTML = '<section class="caja"><p>No encontramos la reserva ' + esc(cod) + (R.conectado(st.neg) && !rid ? '. Abre el enlace completo que te enviamos al reservar (trae un código secreto).' : '. Revisa el enlace.') + '</p><p style="margin-top:10px"><a class="btn" href="./?negocio=' + st.neg + '">Volver</a></p></section>'; return; }
    var e = R.ESTADOS[r.estado], rb = R.reembolso(D, r), vigente = ['retenida', 'confirmada', 'pagada'].indexOf(r.estado) > -1, antes = r.desde > Date.now(), horasMin = c.politicas.modificarHoras != null ? c.politicas.modificarHoras : 24;
    var puedeCancelar = vigente && antes, puedeModificar = R.conectado(st.neg) && R.modulo(c, 'modificar') && vigente && (r.desde - Date.now()) >= horasMin * 36e5 && !(r.estado === 'retenida' && r.expira && r.expira < Date.now());
    var hist = (r.historial || []).map(function (h) { return '<li>' + esc(h.cobro ? 'Pago registrado: ' + clp(h.cobro) + ' en total' : h.movida ? 'Cambio de unidad: ' + h.movida : (R.ESTADOS[h.estado] || [h.estado])[0]) + (h.modificada ? ' (modificada)' : '') + ' · ' + new Date(h.t).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) + '</li>'; }).join('');
    var eds = (r.ediciones || []).map(function (x) { return '<li>Versión ' + x.rev + ': ' + new Date(x.desde).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + clp(x.total) + '</li>'; }).join('');
    p.innerHTML = '<section class="caja"><h2>Reserva ' + esc(r.codigo) + '</h2><p><span class="chip" style="--ec:' + e[1] + '">' + e[0] + '</span>' + ((r.rev || 1) > 1 ? ' <span class="chip" style="--ec:#6366f1">Modificada · versión ' + r.rev + '</span>' : '') + '</p>' + (unidadHtml(D, r) ? '<p>' + unidadHtml(D, r) + '</p>' : '') + '<p style="margin-top:8px">' + esc(R.fechaHora(D, r)) + ' · ' + clp(r.precio.total) + ' · pagado ' + clp(r.pagado || 0) + (r.ajuste ? ' · ajuste ' + (r.ajuste > 0 ? 'por pagar ' + clp(r.ajuste) : 'a favor ' + clp(-r.ajuste)) : '') + '</p>' +
      (r.estado === 'retenida' && r.expira > Date.now() ? '<p class="nota" style="margin-top:8px">⏳ Tu cupo está guardado hasta las ' + new Date(r.expira).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) + '. Falta el depósito de ' + clp(r.precio.deposito) + '.</p>' : '') +
      '<div class="acciones-r" style="justify-content:flex-start;margin-top:12px">' + (puedeModificar ? '<a class="btn prim" href="./?negocio=' + st.neg + '&editar=' + esc(r.id) + '">Modificar mi reserva</a>' : '') + (puedeCancelar ? '<button class="btn peligro" type="button" data-cancelar="' + esc(r.id) + '">Cancelar mi reserva</button>' : '') + '</div>' +
      (vigente && !puedeModificar ? '<p class="nota" style="margin-top:8px">Ya no se puede modificar online (faltan menos de ' + horasMin + ' horas o la retención venció). Si necesitas un cambio, escríbele al negocio.</p>' : '') +
      (puedeCancelar ? '<p class="nota" style="margin-top:10px">Si cancelas ahora (' + rb.horas + ' h antes) te devolvemos el ' + rb.porcentaje + ' % de lo pagado: ' + clp(rb.monto) + '.</p>' : r.reembolso ? '<p class="nota" style="margin-top:10px">Devolución: ' + clp(r.reembolso.monto) + '.</p>' : '') +
      '<details style="margin-top:12px"><summary>Historial' + (eds ? ' y versiones anteriores' : '') + '</summary><ol class="nota" style="margin:6px 0 0 18px">' + hist + '</ol>' + (eds ? '<p class="nota" style="margin-top:6px"><b>Versiones anteriores</b></p><ol class="nota" style="margin:2px 0 0 18px">' + eds + '</ol>' : '') + '</details>' +
      '<p style="margin-top:12px"><a class="btn" href="./?negocio=' + st.neg + '&mis=1">' + t('mis') + '</a> <a class="btn" href="./?negocio=' + st.neg + '">Hacer una reserva</a></p></section>';
  }
  // Resumen lateral con precio, descuentos, depósito y equivalencia en otra moneda
  function resumen(D) {
    var c = D.config, box = app.querySelector('.resumen-lat'), sel = st.sel, listo = selCompleta(D);
    if (st.paso === 4 || q.get('gestion') || q.get('mis')) { box.hidden = true; return; }
    box.hidden = false; box.classList.toggle('vacio', !listo);
    if (!listo) { box.innerHTML = '<h2>' + t('resumen') + '</h2><p class="nota">' + (st.paso === 1 ? 'Elige qué quieres reservar.' : 'Elige la fecha' + (c.modo === 'noches' ? 's' : ' y la hora') + '.') + '</p>'; return; }
    var pr = st.res ? st.res.precio : precioActual(D);
    box.innerHTML = '<h2>' + t('resumen') + '</h2>' + pr.lineas.map(function (l) { return '<div class="fila' + (l[1] < 0 ? ' desc' : '') + '"><span>' + esc(l[0]) + '</span><span>' + (l[1] < 0 ? '−' + clp(-l[1]) : clp(l[1])) + '</span></div>'; }).join('') +
      '<div class="fila total"><span>' + t('total') + '</span><span>' + clp(pr.total) + '</span></div>' + (conv(pr.total) ? '<p class="conv">' + conv(pr.total) + ' · ' + t('conv') + '</p>' : '') +
      (pr.deposito ? '<div class="fila"><span>' + t('deposito') + ' (' + c.politicas.deposito + ' %)</span><span>' + clp(pr.deposito) + '</span></div><div class="fila"><span>' + t('saldo') + '</span><span>' + clp(pr.saldo) + '</span></div>' : '') +
      '<p class="nota" style="margin-top:8px">' + esc(sel.fecha || sel.llegada ? R.fechaHora(D, { desde: c.modo === 'noches' ? U.fdate(sel.llegada).getTime() : U.fdate(sel.fecha, sel.min).getTime(), hasta: sel.salida ? U.fdate(sel.salida).getTime() : 0 }) : '') + '</p>';
    if (R.conectado(st.neg)) pedirCotizacion(D);
  }
  // El precio que vale es el del servidor: se muestra uno de vista previa y se reemplaza al llegar el oficial
  function llaveCot() { return JSON.stringify([st.sel, st.codigo]); }
  function precioActual(D) { return st.cot && st.cot.key === llaveCot() && st.cot.precio ? st.cot.precio : R.precio(D, st.sel, st.codigo); }
  var cotPendiente = null;
  function pedirCotizacion(D) {
    var key = llaveCot(); if ((st.cot && st.cot.key === key) || cotPendiente === key) return;
    cotPendiente = key;
    R.cotizar(st.neg, copia(st.sel), st.codigo).then(function (x) {
      if (cotPendiente === key) cotPendiente = null;
      if (key !== llaveCot()) return;
      st.cot = { key: key, precio: x && x.ok ? x.precio : null, error: x && x.error };
      if (x && x.ok) resumen(d());
      var msj = app.querySelector('[data-cod-msj]'); if (msj && st.codigo && x && x.ok) { var pm = x.precio.promo; msj.textContent = pm ? (pm.error || pm.nota || 'Código aplicado: −' + clp(pm.valor)) : ''; }
    });
  }
  function selCompleta(D) { var c = D.config, s = st.sel; return c.modo === 'noches' ? !!(s.recurso && s.llegada && s.salida) : !!((s.servicio || s.recurso) && s.fecha && s.min != null); }

  // Eventos
  app.addEventListener('click', function (e) {
    var D = d(), c = D.config, x;
    if ((x = e.target.closest('[data-recurso]'))) { st.sel.recurso = x.dataset.recurso; if (c.modo === 'bloques') st.sel.horas = R.recurso(D, st.sel.recurso).minHoras; st.sel.min = null; pintar(); }
    else if ((x = e.target.closest('[data-servicio]'))) { st.sel.servicio = x.dataset.servicio; st.sel.min = null; if (c.modo === 'cupos') st.sel.personas = Math.max(st.sel.personas || 1, R.servicio(D, st.sel.servicio).minPersonas); pintar(); }
    else if ((x = e.target.closest('[data-pers]'))) { var max = (c.modo === 'noches' || c.modo === 'bloques') && st.sel.recurso ? R.recurso(D, st.sel.recurso).capacidad : 20; st.sel.personas = Math.max(1, Math.min(max, (st.sel.personas || 2) + +x.dataset.pers)); pintar(); }
    else if ((x = e.target.closest('[data-hrs]'))) { var mn = st.sel.recurso ? R.recurso(D, st.sel.recurso).minHoras : 1; st.sel.horas = Math.max(mn, Math.min(12, (st.sel.horas || mn) + +x.dataset.hrs)); st.sel.min = null; pintar(); }
    else if ((x = e.target.closest('[data-mes]'))) { st.vista.m += +x.dataset.mes; if (st.vista.m < 0) { st.vista.m = 11; st.vista.y--; } if (st.vista.m > 11) { st.vista.m = 0; st.vista.y++; } pintar(); }
    else if ((x = e.target.closest('[data-f]'))) {
      var f = x.dataset.f;
      if (x.getAttribute('aria-disabled')) {   // no se puede: se explica por qué, con fechas cercanas libres
        var ev = R.mes(D, st.sel, +f.slice(0, 4), +f.slice(5, 7) - 1)[f] || {};
        st.motivo = st.motivo && st.motivo.f === f ? null : { f: f, estado: ev.estado, texto: ev.motivo || 'No disponible.', salida: c.modo === 'noches' && !!st.sel.llegada && !st.sel.salida && f > st.sel.llegada };
        pintar(); return;
      }
      st.motivo = null; st.aviso = null;
      if (c.modo === 'noches') { if (!st.sel.llegada || st.sel.salida || f <= st.sel.llegada) { st.sel.llegada = f; st.sel.salida = null; } else st.sel.salida = f; }
      else { st.sel.fecha = f; st.sel.min = null; }
      pintar();
    }
    else if ((x = e.target.closest('[data-sug]'))) { var fs = x.dataset.sug; st.motivo = null; if (c.modo === 'noches') { st.sel.llegada = fs; st.sel.salida = null; } else { st.sel.fecha = fs; st.sel.min = null; } var fd = U.fdate(fs); st.vista = { y: fd.getFullYear(), m: fd.getMonth() }; pintar(); }
    else if (e.target.closest('[data-dup-ok]')) { st.dupOk = true; st.aviso = null; var fm = app.querySelector('[data-form]'); if (fm) { pintar(); app.querySelector('[data-form]').requestSubmit(); } else pintar(); }
    else if ((x = e.target.closest('[data-min]'))) { st.sel.min = +x.dataset.min; pintar(); }
    else if ((x = e.target.closest('[data-sig]'))) {
      var err = '';
      if (st.paso === 1) err = !(st.sel.recurso || st.sel.servicio) ? 'Elige una opción.' : '';
      if (st.paso === 2) err = !selCompleta(D) ? (c.modo === 'noches' ? 'Elige la llegada y la salida.' : 'Elige el día y la hora.') : R.validar(D, st.sel);
      if (err) { app.querySelector('.err').textContent = err; return; }
      st.aviso = null; st.motivo = null; st.paso++; pintar(); app.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    else if (e.target.closest('[data-atras]')) { if (st.paso === 3) recordar(); st.aviso = null; st.paso--; pintar(); }
    else if (e.target.closest('[data-cod]')) {
      recordar(); st.codigo = (app.querySelector('#r-cod').value || '').trim().toUpperCase();
      if (R.conectado(st.neg)) { st.cot = null; app.querySelector('[data-cod-msj]').textContent = 'Revisando el código…'; resumen(D); }
      else { var pr = R.precio(D, st.sel, st.codigo); app.querySelector('[data-cod-msj]').textContent = pr.promo ? (pr.promo.error || pr.promo.nota || 'Código aplicado: −' + clp(pr.promo.valor)) : ''; resumen(D); }
    }
    else if (e.target.closest('[data-pagar]')) {
      var btn = e.target.closest('[data-pagar]'); btn.disabled = true;
      Promise.resolve(R.pagar(st.neg, st.res.id, st.res.precio.deposito)).then(function (pg) {
        if (pg && pg.error) { toast(pg.error, true); st.res = null; st.paso = 2; st.sel.min = null; pintar(); return; }
        st.res = R.reservaDe(st.neg, st.res.id) || R.leer(st.neg).reservas.filter(function (r) { return r.id === st.res.id; })[0]; st.paso = 4; pintar();
      });
    }
    else if (e.target.closest('[data-soltar]')) { soltar(); pintar(); }
    else if (e.target.closest('[data-ics]')) descargarIcs();
    else if (e.target.closest('[data-nueva]')) { location.href = location.pathname + '?negocio=' + st.neg; }
    else if (e.target.closest('[data-espera]')) {
      var nombre = prompt('Tu nombre:'); if (!nombre) return; var contacto = prompt('Tu correo o celular, para avisarte:'); if (!contacto) return;
      var cl = /@/.test(contacto) ? { nombre: nombre, correo: contacto, telefono: '' } : { nombre: nombre, correo: '', telefono: contacto };
      Promise.resolve(R.esperar(st.neg, copia(st.sel), cl)).then(function (o) { if (o && o.error) toast(o.error, true); else toast(t('esperaOk')); });
    }
    else if ((x = e.target.closest('[data-cancelar]'))) {
      var rr = R.reservaDe(st.neg, x.dataset.cancelar) || {}, rb2 = rr.desde ? R.reembolso(d(), rr) : null;
      if (!confirm('¿Cancelar la reserva?' + (rb2 ? ' Se te devuelve el ' + rb2.porcentaje + ' % de lo pagado (' + clp(rb2.monto) + ').' : ''))) return;
      x.disabled = true;
      Promise.resolve(R.cancelar(st.neg, x.dataset.cancelar, 'cliente')).then(function (o) { if (o && o.error) toast(o.error, true); else toast('Reserva cancelada.'); pintar(); });
    }
  });
  app.addEventListener('change', function (e) {
    if (e.target.id === 'prof') { st.sel.recurso = e.target.value || null; st.sel.min = null; pintar(); }
    if (e.target.dataset.extra) { var ex = st.sel.extras || []; st.sel.extras = e.target.checked ? ex.concat(e.target.dataset.extra) : ex.filter(function (z) { return z !== e.target.dataset.extra; }); resumen(d()); }
  });
  // Al corregir un campo marcado, el error desaparece
  app.addEventListener('input', function (e) { var c = e.target.closest('.campo.mal'); if (c) { recordar(); var er = erroresDe([e.target.id]); if (!er.length) limpiar(c); } });
  function limpiar(cont) { cont.classList.remove('mal', 'sacude'); var i = cont.querySelector('input,select'); if (i) i.removeAttribute('aria-invalid'); var m = cont.querySelector('.campo-err'); if (m) m.textContent = ''; }
  function marcar(cont, msg) {
    if (!cont) return; cont.classList.add('mal'); var i = cont.querySelector('input,select'); if (i) i.setAttribute('aria-invalid', 'true'); var m = cont.querySelector('.campo-err'); if (m) m.textContent = msg;
    cont.classList.remove('sacude'); void cont.offsetWidth; cont.classList.add('sacude');
  }
  function recordar() {
    var g = function (id) { var el = app.querySelector('#' + id); return el ? el.value.trim() : ''; };
    st.cli = { nombre: g('r-nombre'), correo: g('r-correo'), telefono: g('r-tel'), pais: g('r-pais') };
    [].forEach.call(app.querySelectorAll('[data-resp]'), function (el) { st.resp[el.dataset.resp] = el.value.trim(); });
    var ac = app.querySelector('#r-acepto'); if (ac) st.acepto = ac.checked;
  }
  function erroresDe(ids) {
    var cli = st.cli || {}, tel = (cli.telefono || '').replace(/[^\d+]/g, ''), out = [];
    var todos = [['r-nombre', (cli.nombre || '').length < 3, 'Escribe tu nombre y apellido.'], ['r-correo', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cli.correo || ''), 'Escribe un correo válido, por ejemplo nombre@correo.cl.'], ['r-tel', tel.replace(/\D/g, '').length < 8, 'Escribe un celular válido, por ejemplo +56 9 1234 5678.']];
    (R.modulo(d().config, 'campos') ? d().config.campos || [] : []).forEach(function (cp) { var v = st.resp[cp.id] || ''; todos.push(['rc-' + cp.id, (cp.obligatorio && !v) || (cp.tipo === 'numero' && v && !/^\d{1,6}$/.test(v)), cp.tipo === 'numero' && v ? 'Escribe solo números.' : 'Completa este dato.']); });
    var chk = app.querySelector('#r-acepto'); if (chk) todos.push(['r-acepto', !chk.checked, 'Debes aceptar la política de cancelación para reservar.']);
    todos.forEach(function (x) { if ((!ids || ids.indexOf(x[0]) > -1) && x[1]) out.push({ campo: x[0], msg: x[2] }); });
    return out;
  }
  app.addEventListener('submit', function (e) {
    e.preventDefault(); recordar();
    var errBox = app.querySelector('.err'), errs = erroresDe();
    [].forEach.call(app.querySelectorAll('.campo.mal'), limpiar);
    if (errs.length) {
      errs.forEach(function (x) { marcar(app.querySelector('#' + x.campo).closest('.campo'), x.msg); });
      errBox.textContent = errs.length === 1 ? errs[0].msg : 'Revisa los ' + errs.length + ' campos marcados en rojo.';
      var f = app.querySelector('#' + errs[0].campo); f.closest('.campo').scrollIntoView({ block: 'center', behavior: 'smooth' }); f.focus({ preventScroll: true }); return;
    }
    if (st.enviando) return;
    var cli = st.cli, tel = cli.telefono.replace(/[^\d+]/g, ''), codEl = app.querySelector('#r-cod');
    st.codigo = codEl ? (codEl.value || '').trim().toUpperCase() : '';
    // ¿Ya tiene esta misma reserva vigente (doble clic, botón atrás, o volvió a reservar lo mismo)? Se le muestra antes de crear otra
    if (!st.edit && !st.dupOk) {
      var clave = function (s) { return JSON.stringify([s.recurso || null, s.servicio || null, s.llegada || null, s.salida || null, s.fecha || null, s.min == null ? null : s.min]); };
      var igual = R.mias(st.neg).map(function (id) { return R.reservaDe(st.neg, id); }).filter(function (r) { return r && r.sel && ['retenida', 'confirmada', 'pagada'].indexOf(r.estado) > -1 && !(r.estado === 'retenida' && r.expira && r.expira < Date.now()) && clave(r.sel) === clave(st.sel); })[0];
      if (igual) { st.aviso = { tipo: 'duplicada', r: igual }; pintar(); alAviso(); return; }
    }
    var datos = { nombre: cli.nombre.slice(0, 60), correo: cli.correo.slice(0, 120), telefono: tel.slice(0, 20), pais: cli.pais, idioma: st.idioma };
    var btn = app.querySelector('[type="submit"]'), txt = btn.textContent; btn.disabled = true; btn.textContent = t('reservando'); st.enviando = true; errBox.textContent = ''; st.aviso = null;
    var resp = copia(st.resp);
    var p = st.edit ? R.modificar(st.neg, st.edit.rid, { sel: copia(st.sel), cliente: datos, codigoPromo: st.codigo, respuestas: resp }) : R.crear(st.neg, copia(st.sel), datos, { codigo: st.codigo, respuestas: resp });
    Promise.resolve(p).then(function (out) {
      st.enviando = false; btn.disabled = false; btn.textContent = txt;
      if (out.error) {
        var cod = out.codigo || '';
        if (/^(ocupado|ya_paso|fuera_horario|sin_salida|cupos|estadia_min|capacidad|minimo_personas|horas_min|lejos|fechas|seleccion|bloqueado)/.test(cod)) {
          st.aviso = { titulo: 'Esa fecha ya no se puede', texto: out.error + ' Te dejamos en el calendario para elegir otra.' };
          st.paso = 2; st.sel.min = null; if (d().config.modo === 'noches') st.sel.salida = null; pintar(); alAviso(); return;
        }
        if (cod === 'demasiadas_retenciones') {
          var pend = R.mias(st.neg).map(function (id) { return R.reservaDe(st.neg, id); }).filter(function (r) { return r && r.estado === 'retenida' && r.expira > Date.now() && r.cliente && r.cliente.correo === datos.correo.toLowerCase(); });
          st.aviso = { tipo: 'retenciones', lista: pend };
        } else st.aviso = { texto: out.error };
        pintar(); alAviso(); return;
      }
      st.dupOk = false;
      st.res = out.reserva || out.ok && R.reservaDe(st.neg, st.edit && st.edit.rid);
      if (st.edit) st.edit = null;
      if (st.res.estado !== 'retenida') st.paso = 4; pintar();
    });
  });
  function soltar() {
    st.aviso = null;
    if (st.res && st.res.estado === 'retenida') { var id = st.res.id; Promise.resolve(R.estado(st.neg, id, 'cancelada', { canceladaPor: 'cliente: volvió atrás' })); }
    st.res = null;
  }
  function descargarIcs() {
    var D = d(), r = st.res, c = D.config, f = function (ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'; };
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bio Digital//Reservas//ES', 'BEGIN:VEVENT', 'UID:' + r.id + '@biodigital', 'DTSTAMP:' + f(Date.now()), 'DTSTART:' + f(r.desde), 'DTEND:' + f(r.hasta), 'SUMMARY:' + c.nombre.replace(/[,;]/g, ' ') + ' (' + r.codigo + ')', 'LOCATION:' + c.direccion.replace(/[,;]/g, ' '), 'BEGIN:VALARM', 'TRIGGER:-PT' + (c.modo === 'noches' ? '24H' : '2H'), 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'reserva-' + r.codigo + '.ics'; a.click();
  }
  // Reloj de la retención y tareas automáticas; si el negocio confirma el pago mientras tanto, la pantalla avanza sola
  setInterval(function () {
    R.automatico(st.neg);
    if (st.res && st.res.estado === 'retenida') {
      var r = R.reservaDe(st.neg, st.res.id), el = app.querySelector('[data-reloj]');
      if (!r) return;
      if (r.estado === 'pagada' || r.estado === 'confirmada') { st.res = r; st.paso = 4; pintar(); return; }
      if (r.estado !== 'retenida') { st.res = null; toast('Se acabó el tiempo para pagar: liberamos el cupo.', true); st.paso = 2; st.sel.min = null; pintar(); return; }
      if (el) { var s = Math.max(0, Math.round((r.expira - Date.now()) / 1000)); el.textContent = Math.floor(s / 60) + ':' + U.pad(s % 60); }
    }
  }, 1000);
  // Disponibilidad en vivo: si otra pestaña o persona reserva, se recalcula
  R.escuchar(function (m) {
    if (m.id !== st.neg) return;
    if (m.tipo === 'error') { toast(m.mensaje, true); return; }
    if (m.tipo === 'conexion') return;
    if (m.tipo === 'sinconfig') { pintar(); return; }
    if (st.enviando) return;
    var foco = document.activeElement; if (foco && foco.matches && foco.matches('input, select, textarea') && st.paso === 3) return;
    if (st.paso === 2 && !q.get('mis') && !q.get('gestion')) { var D = d(); if (selCompleta(D) && R.validar(D, st.sel)) { st.sel.min = null; if (D.config.modo === 'noches') st.sel.salida = null; toast(t('actualizada')); } pintar(); }
    else if (st.paso === 1 || q.get('mis') || q.get('gestion')) pintar();
  });
  var seguirRid = q.get('rid') || q.get('editar');
  Promise.resolve(R.conectar(st.neg)).then(function () { return seguirRid ? R.seguir(st.neg, seguirRid) : null; }).then(function () {
    // Modificar una reserva: se abre el mismo asistente con lo que ya eligió
    var rid = q.get('editar');
    if (rid) {
      var r = R.reservaDe(st.neg, rid);
      if (r && ['retenida', 'confirmada', 'pagada'].indexOf(r.estado) > -1) { st.edit = { rid: rid, codigo: r.codigo }; st.sel = copia(r.sel || {}); st.sel.salvo = rid; st.codigo = r.codigoPromo || ''; st.cli = copia(r.cliente || {}); st.resp = copia(r.respuestas || {}); st.paso = 2; }
      else toast('Esa reserva no se puede modificar.', true);
    }
    pintar();
  });
})();
