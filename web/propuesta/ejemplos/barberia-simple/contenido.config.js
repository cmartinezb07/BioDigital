/* Contenido editable de Barbería El Filo desde una planilla de Google.
   DEMO: estas URL apuntan a CSV de ejemplo dentro del repositorio.
   CLIENTE REAL: reemplazar cada URL por el enlace CSV publicado de la pestaña correspondiente de su Google Sheets
   (Archivo > Compartir > Publicar en la web > elegir la pestaña > formato CSV).
   Si una URL falla o viene vacía, esa sección conserva el texto que ya trae la página. */
window.CONTENIDO_BARBERIA = {
  demoPlanilla: true,   // SOLO demostración (lee lo editado en mi-planilla/ desde localStorage). Quitar en un cliente real.
  servicios: '../reservas-simple/planilla-ejemplo/barberia-servicios.csv',
  horario: '../reservas-simple/planilla-ejemplo/barberia-horario.csv',
  barberos: '../reservas-simple/planilla-ejemplo/barberia-barberos.csv',
  aviso: '../reservas-simple/planilla-ejemplo/barberia-aviso.csv'
};
