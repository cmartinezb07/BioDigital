/* SOLO DEMOSTRACION. Activa la franja "Pagina del cliente / Panel del dueno / Mi planilla" de la pagina y la nota del panel.
   ENTREGA A UN CLIENTE REAL: borrar este archivo y su <script> en index.html y en mi-agenda/index.html
   (sin el archivo, la franja no aparece y el panel no muestra la nota).
   PARA LA ENTREGA REAL (5 pasos):
   1) Quitar este archivo y sus 2 <script> (index.html y mi-agenda/index.html).
   2) En mi-agenda/config.js poner planillaUrl = enlace de SU Google Sheet (o vacio: el boton "Editar mi pagina (planilla)" no se muestra).
   3) Quitar demoPlanilla de contenido.config.js y de reservas-simple/simple.config.js.
   4) Apuntar los CSV (servicios, horario, barberos, aviso) a sus enlaces publicados, tambien en planillaPestanas de mi-agenda/config.js.
   5) Probar: sin franja, sin boton a mi-planilla/ y cambios de la planilla visibles en la pagina. */
window.BARBERIA_DEMO = {
  activo: true,
  nota: 'Para editar el contenido de tu página se usa una planilla de Google Sheets propia, incluida en el precio y configurada por Bío Digital a pedido del cliente. Sin mensualidad. Los cambios se ven en unos minutos.'
};
