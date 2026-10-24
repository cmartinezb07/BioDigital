// Configuración de ESTE restaurante. Es lo único del código que cambia al copiar la plantilla para otro local:
// el resto (carta, fotos, precios, horarios, comunas de envío, marca, personal) se administra desde el panel del dueño y vive en la base.
// Cada restaurante tiene su propio "negocio" en la base: sus pedidos, carta, fotos y PIN no se mezclan con los de otro.
// Para crear un restaurante nuevo: node web/herramientas/nuevo-restaurante.mjs (ver memoria/plantilla-restaurante.md).
window.RESTAURANTE = {
  negocio: 'fogon',
  nombre: 'Fogón del Sur',
  // En la demostración los PIN se muestran en la pantalla de entrada para poder enseñar el sistema. En un local real: demo = false.
  demo: true,
  // Un solo acceso para el equipo (panel/): según su código, cada persona entra a la cocina, al reparto o a la administración
  pistas: {
    equipo: [{ rol: 'Cocinero', pin: '247135' }, { rol: 'Repartidor', pin: '913572' }, { rol: 'Jefe (dueño)', pin: '482916' }]
  }
};
