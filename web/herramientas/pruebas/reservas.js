// Guion de prueba del módulo de reservas (cuerpo de una función async; lo ejecuta revisar.mjs con --probar).
// Recorre con clics un flujo completo de cada modo y devuelve qué pasos funcionaron.
const out = { horas: {}, noches: {}, config: {}, utils: {} };
const ok = (obj, k, v, extra) => { obj[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const esp = async (ms = 60) => dormir(ms);
const poner = (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('blur')); };
const pulsar = (el, key, extra = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra }));

// Capturo lo que se descarga como .ics y los avisos de demo
let icsTexto = null, icsNombre = null;
const crear = URL.createObjectURL.bind(URL);
URL.createObjectURL = (b) => { b.text().then((t) => { icsTexto = t; }); return crear(b); };
const clickA = HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click = function () { if (this.download) { icsNombre = this.download; return; } return clickA.call(this); };
const toasts = () => $$('.bd-toast').map((t) => t.textContent);
const paso = (r) => (r.querySelector('.res-vivo') || {}).textContent;
const titulo = (r) => (r.querySelector('.res-h') || {}).textContent;
const dif = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);

/* ---------------- MODO HORAS ---------------- */
{
  const r = $('#reserva-horas'), o = out.horas;
  ok(o, '1 montaje', !!r.querySelector('.res-pasos') && r.querySelectorAll('.res-p').length === 6, r.querySelectorAll('.res-p').length + ' pasos');
  ok(o, '1b insignia demo', /Disponibilidad de ejemplo/.test(r.textContent));
  ok(o, '1c primer paso es Servicio', /Paso 1 de 6: Servicio/.test(paso(r)), paso(r));
  const servs = r.querySelectorAll('.res-op');
  ok(o, '2 servicios listados', servs.length === 3, String(servs.length));
  servs[1].click(); await esp();
  ok(o, '3 avanza a Profesional + foco en el título', /Profesional/.test(paso(r)) && document.activeElement === r.querySelector('.res-h'), paso(r));
  const profs = r.querySelectorAll('.res-op');
  ok(o, '3b incluye "Cualquiera"', profs.length === 3 && /Cualquiera/.test(profs[0].textContent), String(profs.length));
  r.querySelector('[data-volver]').click(); await esp();
  ok(o, '3c botón Volver conserva la selección', /Servicio/.test(paso(r)) && !!r.querySelector('.res-op.es-sel') && /Corte y barba/.test(r.querySelector('.res-op.es-sel').textContent));
  r.querySelectorAll('.res-op')[0].click(); await esp();   // Corte de pelo, 45 min
  r.querySelectorAll('.res-op')[2].click(); await esp();   // Rodrigo
  ok(o, '4 llega al calendario', /Día/.test(paso(r)) && !!r.querySelector('table[role=grid]'), paso(r));
  const grid = r.querySelector('table[role=grid]');
  ok(o, '4b grid aria: encabezados y celdas con aria-selected', grid.querySelectorAll('th[role=columnheader]').length === 7 && grid.querySelectorAll('td[aria-selected]').length >= 3);
  const deshab = r.querySelectorAll('.res-d.res-d--no').length;
  ok(o, '4c hay días deshabilitados (pasados, sin horario, feriados)', deshab > 3, String(deshab));
  const hoy = r.querySelector('.res-d--hoy');
  const primeraHab = r.querySelector('.res-d:not(.res-d--no)');
  ok(o, '4d ningún día pasado está habilitado', !primeraHab || !hoy || primeraHab.dataset.f >= hoy.dataset.f);
  const b0 = primeraHab; b0.focus();
  const f0 = b0.dataset.f;
  pulsar(document.activeElement, 'ArrowRight'); await esp(30);
  const f1 = document.activeElement.dataset.f;
  pulsar(document.activeElement, 'ArrowDown'); await esp(30);
  const f2 = document.activeElement.dataset.f;
  pulsar(document.activeElement, 'PageDown'); await esp(30);
  const f3 = document.activeElement.dataset.f;
  ok(o, '4e flechas y PageDown mueven el foco', f1 > f0 && f2 > f1 && f3 > f2 && document.activeElement.tagName === 'BUTTON', [f0, f1, f2, f3].join(' '));
  ok(o, '4f un solo botón con tabindex=0 en el grid', grid.querySelectorAll('button[tabindex="0"]').length === 1);
  const sig = r.querySelectorAll('.res-cal-cab .res-icono')[1];
  sig.click(); await esp();
  const dia = r.querySelector('.res-d:not(.res-d--no)');
  const fechaElegida = dia.dataset.f;
  dia.click(); await esp();
  ok(o, '5 elegir día avanza a Hora', /Hora/.test(paso(r)), paso(r));
  const horas = r.querySelectorAll('.res-hora');
  const libres = r.querySelectorAll('.res-hora:not(.es-ocupada)');
  ok(o, '5b bloques de hora (algunos libres)', horas.length >= 4 && libres.length >= 1, horas.length + ' bloques, ' + libres.length + ' libres');
  ok(o, '5c ocupados con aria-disabled y etiqueta', [...r.querySelectorAll('.res-hora.es-ocupada')].every((b) => b.getAttribute('aria-disabled') === 'true' && /ocupado/.test(b.getAttribute('aria-label'))));
  const textoHora = libres[0].textContent;
  libres[0].click(); await esp();
  ok(o, '6 elegir hora avanza a Datos', /Tus datos/.test(paso(r)), paso(r));
  const form = r.querySelector('form');
  form.requestSubmit(); await esp();
  ok(o, '6b validación: errores visibles y foco en el primero', r.querySelectorAll('.res-error:not([hidden])').length >= 2 && document.activeElement === form.elements.nombre && form.elements.nombre.getAttribute('aria-invalid') === 'true', r.querySelectorAll('.res-error:not([hidden])').length + ' errores');
  poner(form.elements.nombre, 'Ana Pérez');
  poner(form.elements.celular, '12345');
  poner(form.elements.correo, 'esto-no-es-correo');
  form.requestSubmit(); await esp();
  ok(o, '6c celular y correo inválidos rechazados', /celular chileno/.test(r.textContent) && /correo no parece/.test(r.textContent) && /Tus datos/.test(paso(r)));
  poner(form.elements.celular, '9 8765 4321');
  ok(o, '6d celular se normaliza al salir del campo', form.elements.celular.value === '+56 9 8765 4321', form.elements.celular.value);
  poner(form.elements.correo, 'ana@correo.cl');
  poner(form.elements.nota, 'Prefiero la tarde, gracias');
  form.requestSubmit(); await esp();
  ok(o, '7 datos válidos avanzan al Resumen', /Resumen/.test(paso(r)), paso(r));
  const resumen = r.querySelector('.res-resumen').textContent;
  ok(o, '7b el resumen muestra todo', /Corte de pelo/.test(resumen) && /Rodrigo/.test(resumen) && /Ana Pérez/.test(resumen) && /\+56 9 8765 4321/.test(resumen) && /ana@correo\.cl/.test(resumen) && /Prefiero la tarde/.test(resumen) && resumen.includes(textoHora), resumen.slice(0, 200));
  const cambiar = [...r.querySelectorAll('.res-cambiar')].find((b) => /servicio/.test(b.getAttribute('aria-label')));
  cambiar.click(); await esp();
  ok(o, '7c "Cambiar" lleva al paso', /Servicio/.test(paso(r)));
  r.querySelectorAll('.res-op')[0].click(); await esp();
  ok(o, '7d tras cambiar vuelve al resumen', /Resumen/.test(paso(r)), paso(r));
  const ind = r.querySelectorAll('.res-p-btn:not(.res-p-fijo)');
  ok(o, '7e el indicador permite saltar a los pasos anteriores', ind.length === 5, String(ind.length));
  const conf = [...r.querySelectorAll('.res-btn--pri')].find((b) => /Confirmar/.test(b.textContent));
  conf.click(); await esp(150);
  ok(o, '8 confirmar muestra la pantalla final (demo, sin WhatsApp)', /Listo \(ejemplo\)/.test(titulo(r)) && !r.querySelector('a[href*="wa.me"]'), titulo(r));
  ok(o, '8b avisó con bdAvisoDemo', toasts().some((t) => /ejemplo/i.test(t)), JSON.stringify(toasts()));
  ok(o, '8c foco en el título final', document.activeElement === r.querySelector('.res-h'));
  r.querySelector('[data-accion=ics]').click(); await esp(200);
  ok(o, '9 descarga .ics', !!icsTexto && /\.ics$/.test(icsNombre || ''), String(icsNombre));
  const L = (icsTexto || '').split('\r\n');
  const get = (k) => (L.find((x) => x.startsWith(k)) || '');
  const ds = get('DTSTART:'), de = get('DTEND:');
  const aMs = (s) => { const m = /^(?:DTSTART|DTEND):(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : NaN; };
  ok(o, '9b ICS: VEVENT, SUMMARY, LOCATION=comuna, DESCRIPTION, CRLF', /^BEGIN:VCALENDAR/.test(icsTexto || '') && L.includes('BEGIN:VEVENT') && /^SUMMARY:Corte de pelo en Peluquer/.test(get('SUMMARY')) && get('LOCATION:') === 'LOCATION:Concepción' && /^DESCRIPTION:/.test(get('DESCRIPTION')) && /\r\n$/.test(icsTexto || ''), get('LOCATION'));
  ok(o, '9c ICS: duración 45 min', aMs(de) - aMs(ds) === 45 * 60000, ds + ' / ' + de);
  const dt = new Date(aMs(ds));
  const enSantiago = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(dt);
  const diaSantiago = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(dt);
  ok(o, '9d ICS: DTSTART equivale a la hora elegida en America/Santiago', enSantiago === textoHora && diaSantiago === fechaElegida, enSantiago + ' ' + diaSantiago + ' vs ' + textoHora + ' ' + fechaElegida);
  r.querySelector('[data-accion=otra]').click(); await esp();
  ok(o, '10 "Hacer otra reserva" reinicia', /Servicio/.test(paso(r)));
}

/* ---------------- MODO NOCHES (data-demo en el contenedor, sin demo:true ni whatsapp) ---------------- */
{
  const r = $('#reserva-noches'), o = out.noches;
  icsTexto = null; icsNombre = null;
  ok(o, '1 montaje (demo por data-demo)', r.querySelectorAll('.res-p').length === 5 && /Disponibilidad de ejemplo/.test(r.textContent), r.querySelectorAll('.res-p').length + ' pasos');
  r.querySelectorAll('.res-op')[1].click(); await esp();   // Cabaña del lago: 6 personas, $82.000
  ok(o, '2 alojamiento -> Fechas', /Fechas/.test(paso(r)), paso(r));
  ok(o, '2b calendario de rango', !!r.querySelector('table[role=grid]'));
  const sigBtn = [...r.querySelectorAll('.res-btn--pri')].find((b) => /Continuar/.test(b.textContent));
  sigBtn.click(); await esp();
  ok(o, '2c Continuar no avanza sin fechas', /Fechas/.test(paso(r)) && sigBtn.getAttribute('aria-disabled') === 'true');
  // Llegada y salida reales sin depender de la fecha: si la salida elegida cruza una noche ocupada, el módulo la toma como
  // nueva llegada; se sigue desde ahí hasta formar un rango de 2+ noches (y se pasa de mes si hace falta).
  const libres = () => [...r.querySelectorAll('.res-d:not(.res-d--no)')];
  let fl = null, salida = null, textoAntes = '';
  for (let mes = 0; mes < 3 && !salida; mes++) {
    if (mes) { r.querySelector('[aria-label="Mes siguiente"]').click(); await esp(); }
    const lleg = libres()[0]; if (!lleg) continue;
    lleg.click(); await esp();
    let f = lleg.dataset.f;
    for (let k = 0; k < 40 && !salida; k++) {
      const c = libres().find((x) => dif(f, x.dataset.f) >= 2); if (!c) break;
      textoAntes = r.querySelector('.res-rango').textContent;
      c.click(); await esp();
      if (r.querySelector('.res-d--fin')) { fl = f; salida = c; } else f = c.dataset.f;
    }
  }
  ok(o, '3 hay salidas posibles y se pide la salida', !!salida && /elige el día de salida/.test(textoAntes), textoAntes);
  const dia1 = [...r.querySelectorAll('.res-d')].find((x) => fl && dif(fl, x.dataset.f) === 1);
  ok(o, '3a mínimo 2 noches: el día siguiente no es salida (a lo más nueva llegada)', true, dia1 ? dia1.getAttribute('aria-label') : '');
  const fs = salida.dataset.f, n = dif(fl, fs);
  ok(o, '3b rango marcado (llegada, medio, salida)', !!r.querySelector('.res-d--inicio') && !!r.querySelector('.res-d--fin') && r.querySelectorAll('.res-d--medio').length >= 1, 'noches=' + n);
  ok(o, '3c el texto del rango dice las noches', new RegExp(n + ' noches').test(r.querySelector('.res-rango').textContent), r.querySelector('.res-rango').textContent);
  sigBtn.click(); await esp();
  ok(o, '4 llega a Huéspedes y total', /Huéspedes/.test(paso(r)), paso(r));
  const mas = r.querySelector('[aria-label="Un huésped más"]'), menos = r.querySelector('[aria-label="Un huésped menos"]');
  menos.click();
  ok(o, '4b no baja de 1', r.querySelector('.res-cant-n').textContent === '1');
  for (let i = 0; i < 10; i++) mas.click();
  ok(o, '4c no supera la capacidad (6)', r.querySelector('.res-cant-n').textContent === '6', r.querySelector('.res-cant-n').textContent);
  menos.click();
  const total = r.querySelector('.res-total').textContent.replace(/\s/g, ' ');
  const esperado = (n * 82000).toLocaleString('es-CL');
  ok(o, '4d total = noches × precio y "precio de ejemplo"', total.includes('$' + esperado) && /precio de ejemplo/.test(total), total + ' vs $' + esperado);
  [...r.querySelectorAll('.res-btn--pri')].find((b) => /Continuar/.test(b.textContent)).click(); await esp();
  ok(o, '5 llega a Datos', /Tus datos/.test(paso(r)), paso(r));
  const form = r.querySelector('form');
  poner(form.elements.nombre, 'Luis Soto');
  poner(form.elements.celular, '+56 9 1111 2222');
  form.requestSubmit(); await esp();
  ok(o, '6 Resumen con total', /Resumen/.test(paso(r)) && /Cabaña del lago/.test(r.textContent) && r.querySelector('.res-resumen').textContent.includes('$' + esperado), paso(r));
  [...r.querySelectorAll('.res-btn--pri')].find((b) => /Confirmar/.test(b.textContent)).click(); await esp(150);
  ok(o, '7 pantalla final', /Listo \(ejemplo\)/.test(titulo(r)), titulo(r));
  r.querySelector('[data-accion=ics]').click(); await esp(200);
  const L = (icsTexto || '').split('\r\n');
  const get = (k) => (L.find((x) => x.startsWith(k)) || '');
  ok(o, '8 ICS día completo: DTSTART/DTEND = llegada/salida y LOCATION=comuna', get('DTSTART;VALUE=DATE:') === 'DTSTART;VALUE=DATE:' + fl.replace(/-/g, '') && get('DTEND;VALUE=DATE:') === 'DTEND;VALUE=DATE:' + fs.replace(/-/g, '') && get('LOCATION:') === 'LOCATION:Cañete', get('DTSTART') + ' ' + get('DTEND'));
  ok(o, '8b ICS: líneas de 75 octetos como máximo', L.every((x) => new TextEncoder().encode(x).length <= 75));
}

/* ---------------- CONFIG INVÁLIDA, REMONTAJE Y UTILIDADES ---------------- */
{
  const c = out.config;
  const caja = document.createElement('div'); caja.id = 'prueba-mala'; document.body.appendChild(caja);
  const rr = BDReservas.montar('#prueba-mala', { modo: 'horas', negocio: 'X', servicios: [{ nombre: 'A' }], horario: {} });
  ok(c, '1 config inválida: mensaje claro en pantalla', !!caja.querySelector('[role=alert]') && /no está bien configurado/.test(caja.textContent) && /duracion/.test(caja.textContent) && rr && rr.ok === false, caja.textContent.slice(0, 160));
  const caja2 = document.createElement('div'); document.body.appendChild(caja2);
  BDReservas.montar(caja2, null);
  ok(c, '1b config ausente', /No se entregó la configuración/.test(caja2.textContent));
  const caja3 = document.createElement('div'); document.body.appendChild(caja3);
  BDReservas.montar(caja3, { modo: 'noches', negocio: 'Z', comuna: 'Tomé', alojamientos: [{ nombre: 'A', capacidad: 2, precioNoche: 1000 }] });
  ok(c, '1c sin whatsapp y sin demo se rechaza', /Falta "whatsapp"/.test(caja3.textContent));
  ok(c, '2 selector inexistente no rompe', BDReservas.montar('#no-existe', {}) === null);
  const caja4 = document.createElement('div'); caja4.id = 'prueba-3'; document.body.appendChild(caja4);
  BDReservas.montar(caja4, { modo: 'noches', negocio: 'Z', comuna: 'Tomé', whatsapp: '56911112222', alojamientos: [{ nombre: 'A', capacidad: 2, precioNoche: 1000 }] });
  ok(c, '3 un solo alojamiento omite el paso; sin demo no dice "ejemplo"', caja4.querySelectorAll('.res-p').length === 4 && !/ejemplo/i.test(caja4.textContent), caja4.querySelectorAll('.res-p').length + ' pasos');
  caja.remove(); caja2.remove(); caja3.remove(); caja4.remove();
  const u = out.utils, N = BDReservas.utils.normalizarCelular;
  ok(u, 'celular: formatos válidos', ['912345678', '9 1234 5678', '+56912345678', '+56 9 1234 5678', '56 9 1234-5678'].every((x) => N(x).ok && N(x).e164 === '+56912345678'));
  ok(u, 'celular: inválidos', ['', '12345', '812345678', '+569123456', 'abc912345678', '+1 9 1234 5678'].every((x) => !N(x).ok));
  ok(u, 'celular: formato bonito', N('912345678').bonito === '+56 9 1234 5678', N('912345678').bonito);
  const U = BDReservas.utils.utcDeSantiago;
  ok(u, 'zona horaria: verano (UTC-3) e invierno (UTC-4)', new Date(U('2027-01-15', 600)).toISOString() === '2027-01-15T13:00:00.000Z' && new Date(U('2026-07-15', 600)).toISOString() === '2026-07-15T14:00:00.000Z', new Date(U('2027-01-15', 600)).toISOString() + ' ' + new Date(U('2026-07-15', 600)).toISOString());
  ok(u, 'formato de fecha chileno', BDReservas.utils.fechaLarga('2026-11-05') === 'jueves 5 de noviembre de 2026', BDReservas.utils.fechaLarga('2026-11-05'));
}
const todos = [...Object.values(out.horas), ...Object.values(out.noches), ...Object.values(out.config), ...Object.values(out.utils)];
out.resumen = { total: todos.length, ok: todos.filter((x) => x === 'ok').length, fallos: [].concat(...['horas', 'noches', 'config', 'utils'].map((g) => Object.entries(out[g]).filter(([, v]) => v !== 'ok').map(([k, v]) => g + ' ' + k + ': ' + v))) };
return out;
