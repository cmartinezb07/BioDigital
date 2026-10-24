// Configuración de ESTE restaurante. Es lo único del código que cambia al copiar la plantilla para otro local:
// el resto (carta, fotos, precios, horarios, comunas de envío, marca, personal) se administra desde el panel del dueño y vive en la base.
// Cada restaurante tiene su propio "negocio" en la base: sus pedidos, carta, fotos y PIN no se mezclan con los de otro.
// Para crear un restaurante nuevo: node web/herramientas/nuevo-restaurante.mjs (ver memoria/plantilla-restaurante.md).
window.RESTAURANTE = {
  negocio: 'fogon',
  nombre: 'Fogón del Sur',
  // En la demostración los PIN se muestran en la pantalla de entrada para poder enseñar el sistema. En un local real: demo = false.
  demo: true,
  pistas: {
    cocina: [{ rol: 'Cocina', pin: '247135' }, { rol: 'Dueño', pin: '482916' }],
    reparto: [{ rol: 'Repartidor 1', pin: '913572' }, { rol: 'Repartidor 2', pin: '913573' }, { rol: 'Dueño', pin: '482916' }],
    panel: [{ rol: 'Dueño', pin: '482916' }]
  }
};
