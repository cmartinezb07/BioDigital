// Configuración de "Mi agenda" (panel del dueño). El clientId de Google es público por diseño, pero aquí va vacío:
// sin clientId el panel funciona en MODO DEMOSTRACIÓN. Para el real, crea config.local.js (ver docs/google-oauth-panel.md):
//   window.MI_AGENDA = { clientId: '…apps.googleusercontent.com', calendarId: 'correo@gmail.com' };
window.MI_AGENDA_BASE = {
  negocio: 'Barbería El Filo',
  clientId: '',
  calendarId: 'primary',
  // Jornada por día de la semana (0 = domingo). Sirve para calcular el tiempo libre.
  jornada: { 0: [], 1: [], 2: [['10:00', '13:30'], ['15:00', '20:00']], 3: [['10:00', '13:30'], ['15:00', '20:00']], 4: [['10:00', '13:30'], ['15:00', '20:00']], 5: [['10:00', '13:30'], ['15:00', '20:00']], 6: [['10:00', '17:00']] },
  paginaUrl: '../index.html',
  // Botón "Editar mi página (planilla)". DEMO: la planilla simulada del repositorio. CLIENTE REAL: el enlace de SU Google Sheet
  // (el de "Compartir" con permiso de edición, solo para el dueño), por ejemplo 'https://docs.google.com/spreadsheets/d/…/edit'.
  planillaUrl: '../mi-planilla/',
  // Accesos directos a cada pestaña. En la demo son los CSV de ejemplo. En un negocio real: el enlace de cada pestaña de su planilla de Google.
  planillaPestanas: {
    servicios: '../../reservas-simple/planilla-ejemplo/barberia-servicios.csv',
    horario: '../../reservas-simple/planilla-ejemplo/barberia-horario.csv',
    barberos: '../../reservas-simple/planilla-ejemplo/barberia-barberos.csv',
    aviso: '../../reservas-simple/planilla-ejemplo/barberia-aviso.csv'
  }
};
