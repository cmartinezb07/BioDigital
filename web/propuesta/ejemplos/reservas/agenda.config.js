// Configuración de ESTE sistema de reservas. Es lo único del código que cambia al copiar la plantilla para otro negocio:
// el catálogo (alojamientos, servicios, horarios, precios, políticas) se administra desde el panel del jefe y vive en la base.
// Cada negocio tiene su propio "negocio" en la base (sus reservas, su configuración y sus PIN no se mezclan con los de otro).
// Esta es la demostración de Bío Digital: tiene cinco agendas de ejemplo (cabañas, tours, centro médico, espacios y salón).
// Para crear un negocio nuevo: node web/herramientas/aplicar-formulario-agenda.mjs (ver la skill crear-sistemas-agendas).
window.AGENDA = {
  negocio: 'reservas',
  // En la demostración los PIN se muestran en la pantalla de entrada y el depósito se puede pagar "de mentira". En un negocio real: demo = false.
  demo: true,
  pistas: [{ rol: 'Recepción', pin: '358241' }, { rol: 'Jefe (dueño)', pin: '482916' }]
};
// Solo en el computador del desarrollador (localhost): ?nube=zz-agenda apunta la página a un negocio de pruebas, sin tocar la demostración.
if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  var prueba = new URLSearchParams(location.search).get('nube');
  if (prueba === 'zz-agenda') { window.AGENDA.negocio = prueba; window.AGENDA.pistas = [{ rol: 'Recepción', pin: '852963' }, { rol: 'Jefe (dueño)', pin: '741852' }]; }
}
