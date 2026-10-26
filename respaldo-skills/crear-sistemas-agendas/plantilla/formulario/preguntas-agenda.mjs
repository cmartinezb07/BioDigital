// Preguntas del formulario del sistema de reservas (agenda). Mismo formato que el formulario del menú digital y el de página web
// (crear-sitio-web/plantilla/formulario/formulario-cliente.html). t: texto | larga | uno | varios | escala.
// Se arma con: node construir-formulario.mjs  (ver ese archivo). Cómo se leen las respuestas: web/herramientas/aplicar-formulario-agenda.mjs
// (las respuestas "larga" van una línea por cosa y con un formato sencillo; el formato está en el ejemplo `a` de cada pregunta).
export const META = {
  titulo: 'Antes de armar tu sistema de reservas',
  lead: 'Estas preguntas son para que tus clientes reserven como tú quieres: tus precios, tus horarios y tus reglas, y no las que nosotros imaginamos. No hay respuestas malas: si algo no lo sabes, déjalo en blanco y lo vemos juntos. Lo que no nos digas, no lo inventamos.',
  tiempo: 'Toma unos 15 minutos',
  salida: 'RESPUESTAS DEL CLIENTE (SISTEMA DE RESERVAS)',
  tipo: 'agenda',
};

export const FORM_AGENDA = [
  { t: 'Tu negocio', n: 'Lo básico, para no pedírtelo después.', p: [
    { id: 'nombre', t: 'texto', q: '¿Cómo se llama tu negocio?', req: 1 },
    { id: 'tipo_negocio', t: 'uno', q: '¿Qué reservan tus clientes?', req: 1, ops: [
      ['Alojamiento|Cabañas, hotel, hostal, departamentos, camping: reservan noches'],
      ['Tours, experiencias o clases|Salidas con cupos limitados: reservan lugares para una fecha y hora'],
      ['Citas con profesionales|Clínica, dental, kinesiología, peluquería, estética, servicio técnico: reservan una hora'],
      ['Arriendo de espacios o equipos|Salas, canchas, estudios, quinchos: reservan por horas'],
    ]},
    { id: 'rubro', t: 'texto', q: '¿Cómo lo describes en pocas palabras?', a: 'Por ejemplo: Cabañas en Tomé, Centro médico, Salón de belleza.' },
    { id: 'zona', t: 'texto', q: '¿En qué comuna estás?', req: 1 },
    { id: 'direccion', t: 'texto', q: '¿Cuál es la dirección o el punto de encuentro?' },
    { id: 'telefono', t: 'texto', q: 'Teléfono y WhatsApp', req: 1 },
    { id: 'correo', t: 'texto', q: 'Correo donde quieres recibir las reservas', req: 1 },
    { id: 'redes', t: 'larga', q: '¿Tienes redes sociales? Pégalas aquí', a: 'Instagram, Facebook, TikTok, lo que uses.' },
    { id: 'web_actual', t: 'texto', q: '¿Ya tienes una página web o un sistema de reservas?', a: 'Si existe, pega el link aunque esté abandonado. Cuéntanos también cómo reservan hoy (WhatsApp, llamada, planilla).' },
  ]},

  { t: 'Qué se puede reservar', n: 'Escribe una línea por cada cosa, con el formato del ejemplo. Es la parte más importante.', p: [
    { id: 'catalogo', t: 'larga', q: 'Escribe lo que se puede reservar, uno por línea', req: 1,
      a: 'ALOJAMIENTO: Cabaña Copihue - $45.000 por noche - hasta 2 personas - 3 unidades iguales - Con terraza y vista al mar. | TOURS: Caminata Cerro Caracol - $15.000 por persona - 3 horas - 12 cupos - salidas 09:00 y 15:00 - martes a domingo - mínimo 2 personas. | CITAS: Consulta general - $25.000 - 20 minutos - Trae tu cédula. | ESPACIOS: Sala de reuniones - $8.000 por hora - hasta 8 personas - mínimo 1 hora.' },
    { id: 'extras', t: 'larga', q: 'Paquetes o extras que se pueden agregar a una reserva (solo alojamiento)', a: 'Una línea por extra: Nombre - $precio - descripción. Por ejemplo: Tinaja caliente - $30.000 - Una sesión de 2 horas.' },
    { id: 'profesionales', t: 'larga', q: 'Profesionales, boxes, estilistas o salas que atienden (solo citas)', a: 'Una línea por persona o sala, con lo que atiende: Dra. Pérez - consulta general, control pediátrico. Si todos atienden todo, escribe solo los nombres.' },
    { id: 'horario', t: 'larga', q: '¿Qué días y a qué hora atiendes? (citas y arriendo de espacios)', a: 'Una línea por tramo, con horas en formato 08:30-19:00. Por ejemplo: Lunes a viernes 08:30-19:00; Sábado 09:00-13:00. Si hay almuerzo, escribe dos tramos.' },
    { id: 'checkin', t: 'texto', q: 'Hora de llegada y de salida (alojamiento)', a: 'Por ejemplo: Llegada desde las 15:00, salida hasta las 11:00.' },
    { id: 'intervalo', t: 'uno', q: 'Cada cuánto se ofrecen horas para elegir (citas y espacios)', ops: [['Cada 15 minutos'], ['Cada 30 minutos'], ['Cada hora']] },
    { id: 'margen', t: 'uno', q: 'Margen entre una cita y la siguiente (citas)', ops: [['Sin margen'], ['5 minutos'], ['10 minutos'], ['15 minutos']] },
    { id: 'personas_max', t: 'texto', q: '¿Cuántas personas pueden reservar juntas como máximo?', a: 'Si depende de cada alojamiento o tour, ya lo dijiste arriba: déjalo en blanco.' },
  ]},

  { t: 'Precios y temporadas', n: 'Para que el precio de cada reserva se calcule solo.', p: [
    { id: 'temporadas', t: 'larga', q: '¿Tus precios cambian por temporada? (alojamiento)', a: 'Una línea por temporada: Temporada alta: 15 de diciembre a 15 de marzo, +30 %. Si no cambian, déjalo en blanco.' },
    { id: 'finde', t: 'texto', q: '¿Cuesta más en fin de semana? (alojamiento)', a: 'Por ejemplo: viernes y sábado +15 %. Si no, déjalo en blanco.' },
  ]},

  { t: 'Reglas de la reserva', n: 'Lo que el sistema va a exigir y cobrar. Puedes cambiarlo después desde tu panel.', p: [
    { id: 'deposito', t: 'uno', q: '¿Cobras un depósito para confirmar la reserva?', req: 1, ops: [
      ['Sin depósito|Pagan al llegar'], ['30 %'], ['50 %'], ['100 % al reservar'], ['Otro porcentaje (escríbelo en las observaciones)'],
    ]},
    { id: 'retencion', t: 'uno', q: 'Si reservan y todavía no pagan el depósito, ¿cuánto tiempo les guardamos el cupo?', ops: [['10 minutos'], ['30 minutos'], ['1 hora'], ['2 horas']] },
    { id: 'pago_instrucciones', t: 'larga', q: '¿Cómo te pagan el depósito?', a: 'Lo que lee el cliente al reservar. Por ejemplo: Transfiere a Banco X, cuenta Y, RUT Z y envíanos el comprobante por WhatsApp. NO escribas claves ni datos de tarjetas.' },
    { id: 'cancelacion', t: 'uno', q: '¿Qué política de cancelación quieres?', req: 1, ops: [
      ['Flexible|Devolución total hasta 24 horas antes'],
      ['Moderada|Devolución total hasta 7 días antes y 50 % hasta 48 horas antes'],
      ['Estricta|El depósito no se devuelve'],
      ['Propia|La escribo abajo'],
    ]},
    { id: 'cancelacion_propia', t: 'larga', q: 'Si elegiste "Propia", escríbela', a: 'Una línea por tramo: Con 7 días o más de anticipación: devolución del 100 %. Con 48 horas o más: 50 %.' },
    { id: 'anticipacion', t: 'texto', q: '¿Con cuánta anticipación mínima se puede reservar?', a: 'Por ejemplo: 2 horas, 1 día. Si se puede reservar para ahora mismo, escribe "sin mínimo".' },
    { id: 'horizonte', t: 'texto', q: '¿Hasta cuánto tiempo adelante se puede reservar?', a: 'Por ejemplo: 60 días, 6 meses, 1 año.' },
    { id: 'modificar', t: 'texto', q: '¿Hasta cuándo puede el cliente cambiar su reserva por su cuenta?', a: 'Por ejemplo: hasta 24 horas antes. Después tiene que hablarte.' },
    { id: 'estadia_min', t: 'texto', q: 'Estadía mínima (alojamiento)', a: 'Por ejemplo: 1 noche; 2 noches en temporada alta.' },
  ]},

  { t: 'Promociones', n: 'Solo lo que tú quieres ofrecer. No se inventa ningún descuento.', p: [
    { id: 'descuentos', t: 'varios', q: '¿Qué descuentos automáticos quieres?', ops: [
      ['Por reservar con anticipación'], ['Por estadía larga (alojamiento)'], ['Por grupos'], ['De último minuto'], ['Por arriendo largo (espacios)'], ['Ninguno'],
    ]},
    { id: 'descuentos_detalle', t: 'larga', q: 'Escribe cada descuento con su porcentaje y condición', a: 'Una línea por descuento: Reserva con 30 días de anticipación: 10 %. 5 noches o más: 15 %. Grupos de 6 o más: 10 %. Último minuto (menos de 72 horas): 12 %. Arriendo de 4 horas o más: 10 %.' },
    { id: 'codigos', t: 'larga', q: '¿Quieres códigos de descuento para regalar o publicar?', a: 'Una línea por código: BIENVENIDA10 - 10 %. O con monto: PRIMERAVEZ - $3.000. Opcional: "mínimo $30.000" y "máximo 50 usos".' },
  ]},

  { t: 'Avisos a tus clientes', n: 'Mensajes automáticos. Los correos no tienen costo; WhatsApp automático se cotiza aparte.', p: [
    { id: 'avisos', t: 'varios', q: '¿Qué avisos quieres que se envíen solos?', ops: [
      ['Confirmación al reservar'], ['Recordatorio antes de la cita o llegada'], ['Pedir una opinión después'], ['Aviso si se libera un cupo (lista de espera)'], ['Aviso de cancelación'],
    ]},
    { id: 'recordatorio_horas', t: 'texto', q: '¿Cuántas horas antes quieres el recordatorio?', a: 'Por ejemplo: 24 horas antes.' },
    { id: 'calendarios', t: 'larga', q: '¿Publicas tus alojamientos o servicios en otros sitios? (Airbnb, Booking, Google Calendar)', a: 'Pega el link del calendario (.ics) de cada uno si lo tienes, para que no se venda dos veces. Si no sabes, escribe solo en qué sitios estás.' },
  ]},

  { t: 'Tu marca', n: 'Para que el sistema se vea como tu negocio.', p: [
    { id: 'colores', t: 'texto', q: '¿Qué colores representan a tu negocio?', a: 'Si tienes logo, cuéntanos sus colores. Si no, dinos qué te gusta: verde natural, azul, terracota…' },
    { id: 'logo', t: 'texto', q: '¿Tienes logo?', a: 'Puedes mandarlo por WhatsApp. Si no tienes, el sistema usa tus iniciales sobre tu color.' },
    { id: 'frase', t: 'texto', q: 'Una frase corta que te represente (opcional)' },
  ]},

  { t: 'Tu equipo', n: 'Quién va a manejar las reservas del día a día.', p: [
    { id: 'equipo', t: 'larga', q: 'Personas que van a atender las reservas (recepción)', a: 'Una línea por persona: Camila - recepción. Cada una entra con su propio PIN. Quien manda (tú) entra con un PIN de jefe y es el único que cambia precios y reglas.' },
    { id: 'observaciones', t: 'larga', q: '¿Algo más que debamos saber?', a: 'Por ejemplo: bloqueos de fechas conocidos, feriados que no atiendes, un cliente que paga distinto, un porcentaje de depósito distinto…' },
  ]},
];
