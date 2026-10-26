// Guion de prueba del sistema de reservas (ejemplos/reservas/): motor, disponibilidad, precios, retención, cancelación, iCal e idiomas.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const R = window.Reservas, U = R.util;
// Estas pruebas miden el motor (precios, cupos, políticas); la conexión con la nube se prueba en nube-e2e.mjs. Aquí cada negocio trabaja solo en este navegador.
['cabanas', 'tours', 'medico', 'espacios', 'salon'].forEach((n) => { R.desconectar(n); R.restablecer(n); });
await dormir(300);
// 1. Noches: precio con fin de semana y descuento; una unidad no se vende dos veces
const lunes = (() => { let f = U.sumaDias(U.hoy(), 40); while (U.diaSem(f) !== 1) f = U.sumaDias(f, 1); return f; })();
const selC = { recurso: 'familiar', llegada: lunes, salida: U.sumaDias(lunes, 2), personas: 4 };
const p1 = R.precio(R.leer('cabanas'), selC);
ok('1 precio de 2 noches con reserva anticipada (−10 %)', p1.bruto === 170000 && p1.descuento === 17000 && p1.deposito === Math.round(153000 * .3), JSON.stringify([p1.bruto, p1.descuento, p1.deposito]));
const c1 = R.crear('cabanas', selC, { nombre: 'Prueba Uno', correo: 'a@b.cl', telefono: '+56911111111' });
ok('1b la reserva queda retenida hasta pagar el depósito', c1.reserva && c1.reserva.estado === 'retenida');
const c2 = R.crear('cabanas', selC, { nombre: 'Prueba Dos', correo: 'b@b.cl', telefono: '+56922222222' });
ok('1c la Casa Familiar (1 unidad) no se vende dos veces', !!c2.error, c2.error);
// 2. Retención vencida se libera sola
R.guardarConfig('cabanas', () => {});
const d0 = R.leer('cabanas'); d0.reservas[0].expira = Date.now() - 1000; localStorage.setItem('bdres-v1-' + (Reservas.AGENDA.negocio ? Reservas.AGENDA.negocio + '-' : '') + 'cabanas', JSON.stringify(d0));
R.automatico('cabanas');
ok('2 la retención sin pago se cancela y libera la fecha', R.leer('cabanas').reservas[0].estado === 'cancelada' && !R.validar(R.leer('cabanas'), selC));
// 3. Pago y política de cancelación (con 7+ días de anticipación devuelve 100 %)
const c3 = R.crear('cabanas', selC, { nombre: 'Prueba Tres', correo: 'c@b.cl', telefono: '+56933333333' });
R.pagar('cabanas', c3.reserva.id, c3.reserva.precio.deposito);
const rb = R.reembolso(R.leer('cabanas'), R.leer('cabanas').reservas.find((x) => x.id === c3.reserva.id));
ok('3 pagada y con devolución del 100 % si cancela con tiempo', rb.porcentaje === 100 && rb.monto === c3.reserva.precio.deposito, JSON.stringify(rb));
ok('3b programa confirmación, recordatorio y opinión', ['confirmacion', 'recordatorio', 'resena'].every((t) => R.leer('cabanas').avisos.some((a) => a.reserva === c3.reserva.id && a.tipo === t)));
// 4. Tours: los cupos bajan en vivo y el código de descuento se aplica
let sab = U.sumaDias(U.hoy(), 10); while (U.diaSem(sab) !== 6) sab = U.sumaDias(sab, 1);
const selT = { servicio: 'kayak', fecha: sab, min: 600, personas: 6 };
const pt = R.precio(R.leer('tours'), selT, 'AMIGOS');
ok('4 grupo de 6 con código: se usa el mayor descuento', pt.descuento === Math.round(150000 * .1), pt.descuento);
R.crear('tours', selT, { nombre: 'Grupo', correo: 'g@b.cl', telefono: '+56944444444' });
const sl = R.salidas(R.leer('tours'), selT)[0];
ok('4b quedan 2 cupos de 8 en esa salida', sl.quedan === 2, sl.quedan);
ok('4c no deja reservar 3 personas más', !!R.validar(R.leer('tours'), Object.assign({}, selT, { personas: 3 })));
// 5. Centro médico: horas por profesional, sin choques
let mar = U.sumaDias(U.hoy(), 3); while (U.diaSem(mar) !== 2) mar = U.sumaDias(mar, 1);
const h1 = R.horas(R.leer('medico'), { servicio: 'general', fecha: mar });
const primera = h1[0];
ok('5 hay horas desde las 08:30 con 2 boxes posibles', primera && primera.hora === '08:30' && primera.recursos.length === 2, primera && primera.hora);
R.crear('medico', { servicio: 'general', fecha: mar, min: primera.min, recurso: 'box1' }, { nombre: 'P1', correo: 'p@b.cl', telefono: '+56955555555' });
const h2 = R.horas(R.leer('medico'), { servicio: 'general', fecha: mar }).find((x) => x.min === primera.min);
ok('5b al tomar el box 1, esa hora sigue con el box 2', h2 && h2.recursos.join() === 'box2');
// 6. iCal: exportar e importar (bloquea fechas de otro portal)
const ics = R.exportarIcal('cabanas', 'familiar');
ok('6 exporta el calendario con la reserva', /BEGIN:VEVENT[\s\S]*DTSTART;VALUE=DATE:/.test(ics));
const n = R.importarIcal('cabanas', 'copihue', 'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:' + U.sumaDias(U.hoy(), 20).replace(/-/g, '') + '\r\nDTEND;VALUE=DATE:' + U.sumaDias(U.hoy(), 22).replace(/-/g, '') + '\r\nSUMMARY:Airbnb\r\nEND:VEVENT\r\nEND:VCALENDAR', 'Airbnb');
ok('6b importa 1 bloqueo de Airbnb y baja la disponibilidad', n === 1 && R.libresNoche(R.leer('cabanas'), 'copihue', U.sumaDias(U.hoy(), 20)) === 2);
// 7. Pantalla: idioma y moneda
const idi = document.getElementById('idioma'); idi.value = 'en'; idi.dispatchEvent(new Event('change')); await dormir(100);
ok('7 cambia a inglés', /What/.test(document.querySelector('.pasos-r').textContent));
idi.value = 'es'; idi.dispatchEvent(new Event('change'));
// 8. Automático: al llegar la hora queda "En curso" y al terminar "Completada", sin tocar nada
R.restablecer('cabanas');
const hoyR = R.crear('cabanas', { recurso: 'araucaria', llegada: U.hoy(), salida: U.sumaDias(U.hoy(), 2), personas: 2 }, { nombre: 'Auto', correo: 'auto@b.cl', telefono: '+56966666666' });
R.pagar('cabanas', hoyR.reserva.id, hoyR.reserva.precio.deposito);
R.automatico('cabanas');
ok('8 al llegar el día queda "En curso" solo', R.leer('cabanas').reservas.find((x) => x.id === hoyR.reserva.id).estado === 'checkin');
const d8 = R.leer('cabanas'); d8.reservas.find((x) => x.id === hoyR.reserva.id).hasta = Date.now() - 1000; localStorage.setItem('bdres-v1-' + (Reservas.AGENDA.negocio ? Reservas.AGENDA.negocio + '-' : '') + 'cabanas', JSON.stringify(d8));
R.automatico('cabanas');
ok('8b al terminar queda "Completada" solo', R.leer('cabanas').reservas.find((x) => x.id === hoyR.reserva.id).estado === 'completada');
['cabanas', 'tours', 'medico'].forEach((x) => R.restablecer(x));
return r;
