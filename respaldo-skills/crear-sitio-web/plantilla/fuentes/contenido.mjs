// CONTENIDO DEL SITIO. Es el único archivo que se reescribe por cliente.
// Reglas: nada inventado (reseñas, cifras, direcciones, teléfonos, plazos). Si falta un dato: "[PENDIENTE: qué falta]".
// Cualquier sección puede ser null para omitirla (resumen, servicios, puntaje, proceso, planes, beneficio, faq).
// Íconos disponibles: pin camera book web mail check key walk learn tag star search send phone clock shield chat share
export default {
  marca: '[PENDIENTE: nombre del negocio]',
  descripcion: '[PENDIENTE: una frase: qué hace el negocio y para quién]',
  idioma: 'es-CL',
  correo: 'contacto@ejemplo.cl',
  telefono: null,            // '+56 9 1234 5678' solo si es real
  whatsapp: null,            // '56912345678' solo si es real
  promesaRespuesta: 'Respondemos en menos de [PENDIENTE: tiempo de respuesta]',
  ctaCorto: 'Cotizar',
  pie: ['[PENDIENTE: frase del negocio]', '[PENDIENTE: zona que atienden]'],

  // El hero lo dibuja cada estética con estos campos
  hero: {
    chip: '[PENDIENTE: dato de confianza corto, ej. años o zona]',
    titulo: 'Titular que dice el resultado que obtiene el cliente',
    destacado: 'el resultado',          // parte del titular que se resalta (opcional)
    bajada: 'Primer párrafo que responde de inmediato lo que la persona buscó: qué haces, para quién y por qué elegirte.',
    cta: 'Pide tu cotización',
    secundario: { texto: 'Ver servicios', href: '#servicios' },
    meta: 'Desde [PENDIENTE: precio] · [PENDIENTE: promesa de respuesta]',
    garantias: ['Garantía o beneficio 1', 'Garantía o beneficio 2', 'Garantía o beneficio 3'],
    // Panel de ejemplo que algunas estéticas muestran. Solo datos reales de la oferta; va rotulado "Ejemplo ilustrativo".
    panel: {
      titulo: 'Qué incluye tu servicio',
      filas: [['Servicio 1', '[PENDIENTE]'], ['Servicio 2', '[PENDIENTE]'], ['Servicio 3', '[PENDIENTE]']],
      total: ['Plazo de entrega', '[PENDIENTE]'],
      nota: 'Te enviamos la propuesta con el precio antes de empezar.',
    },
  },

  resumen: {
    titulo: 'En 30 segundos',
    puntos: ['Punto clave 1', 'Punto clave 2', 'Punto clave 3', 'Punto clave 4', 'Punto clave 5'],
  },

  servicios: {
    titulo: 'Todo lo que necesitas',
    bajada: 'Una frase que explica cómo se combinan los servicios.',
    detalleTitulo: 'Qué recibes en cada servicio',
    detalleBajada: null,
    columnaIncluye: 'Viene en',
    items: [
      { id: 'servicio-uno', icono: 'pin', nombre: 'Servicio uno', texto: 'Beneficio para el cliente, no la característica.', detalle: 'Qué se entrega exactamente.', incluye: 'Todos los planes' },
      { id: 'servicio-dos', icono: 'camera', nombre: 'Servicio dos', texto: 'Beneficio para el cliente.', detalle: 'Qué se entrega exactamente.', incluye: 'Todos los planes' },
      { id: 'servicio-tres', icono: 'web', nombre: 'Servicio tres', texto: 'Beneficio para el cliente.', detalle: 'Qué se entrega exactamente.', incluye: 'Plan superior' },
    ],
  },

  // Sección opcional tipo "diagnóstico con puntaje" (el puntaje sube al leer). Útil si el negocio ofrece una evaluación.
  puntaje: null,
  /* puntaje: {
    titulo: '¿Cuántos puntos saca tu ...?', bajada: '...', etiquetaMedidor: 'de 100<br>revisados',
    aspectos: [
      { nombre: 'Aspecto', corto: 'Aspecto', pts: 50, revisa: ['...'], cita: 'Lo que piensa el cliente', icono: 'pin',
        solucion: 'Lo resolvemos con ...', solucionDetalle: '...', servicio: 'servicio-uno', enPlanes: ['Base', '~Otro: parcial'] },
    ],
  }, */

  proceso: {
    titulo: 'Cómo trabajamos',
    bajada: 'Sabes en qué va tu proyecto en cada paso.',
    pasos: [
      { icono: 'search', etapa: 'Contacto', titulo: 'Nos cuentas qué necesitas', texto: '...' },
      { icono: 'send', etapa: 'Propuesta', titulo: 'Te enviamos precio y plazo', texto: '...' },
      { icono: 'walk', etapa: 'Trabajo', titulo: 'Hacemos el trabajo', texto: '...' },
      { icono: 'key', etapa: 'Entrega', titulo: 'Te entregamos todo', texto: '...' },
    ],
  },

  planes: {
    titulo: 'Planes claros',
    bajada: 'El precio final se confirma antes de empezar.',
    etiquetaDestacado: 'Recomendado',
    items: [
      { nombre: 'Base', precio: '[PENDIENTE: precio]', incluye: ['...', '...'] },
      { nombre: 'Estándar', precio: '[PENDIENTE: precio]', incluye: ['Todo lo del plan Base', '...'], destacado: true },
      { nombre: 'Premium', precio: '[PENDIENTE: precio]', incluye: ['Todo lo del plan Estándar', '...'] },
    ],
    promesas: [
      { icono: 'shield', titulo: 'Promesa 1', texto: '...' },
      { icono: 'clock', titulo: 'Promesa 2', texto: '...' },
      { icono: 'learn', titulo: 'Promesa 3', texto: '...' },
      { icono: 'tag', titulo: 'Sabes cuánto pagas', texto: 'Precio acordado antes de empezar.' },
    ],
  },

  beneficio: null, // { titulo, texto, cta, casilla }

  formulario: {
    titulo: 'Pide tu cotización',
    destacado: 'cotización',
    bajada: 'Te respondemos por correo. Un solo seguimiento, sin insistir.',
    campoEmpresa: 'Empresa o negocio',   // false para ocultarlo
    boton: 'Enviar solicitud',
  },

  // 5 o más preguntas reales del rubro
  faq: [
    ['¿Cuánto cuesta?', '[PENDIENTE: respuesta]'],
    ['¿Cuánto se demora?', '[PENDIENTE: respuesta]'],
    ['¿Qué necesito tener listo?', '[PENDIENTE: respuesta]'],
    ['¿Dónde atienden?', '[PENDIENTE: respuesta]'],
    ['¿Qué hacen con mis datos?', 'Solo los usamos para responder tu solicitud.'],
  ],

  cierre: {
    titulo: 'Pregunta de cierre que invita a actuar',
    destacado: 'a actuar',
    texto: 'Promesa de tiempo de respuesta. [PENDIENTE: tiempo de respuesta]',
  },
};
