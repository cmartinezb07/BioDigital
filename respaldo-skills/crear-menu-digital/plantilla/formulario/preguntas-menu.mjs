// Preguntas del formulario del menú digital (gustos y forma). Mismo formato que el formulario de página web
// (crear-sitio-web/plantilla/formulario/formulario-cliente.html). t: texto | larga | uno | varios | escala.
// Se arma con: node construir-formulario.mjs  (ver ese archivo). Cómo leer las respuestas: referencias/levantamiento-menu.md.
export const META = {
  titulo: 'Antes de armar tu menú digital',
  lead: 'Estas preguntas son para que tu carta quede como tú la quieres, con tu estilo y tus platos, y no como nosotros creemos que la quieres. No hay respuestas malas: si algo no lo sabes, déjalo en blanco y lo vemos juntos.',
  tiempo: 'Toma unos 15 minutos',
  salida: 'RESPUESTAS DEL CLIENTE (MENÚ DIGITAL)',
  tipo: 'menu',
};

export const FORM_MENU = [
  { t: 'Tu local', n: 'Lo básico, para no pedírtelo después.', p: [
    { id: 'nombre', t: 'texto', q: '¿Cómo se llama tu local?', req: 1 },
    { id: 'tipo_local', t: 'uno', q: '¿Qué tipo de local es?', req: 1, ops: [
      ['Restaurante'], ['Cafetería o pastelería'], ['Bar o coctelería'], ['Comida rápida o sándwiches'], ['Pizzería'], ['Sushi o comida oriental'], ['Panadería'], ['Carro de comida o food truck'], ['Otro'],
    ]},
    { id: 'cocina', t: 'texto', q: '¿Qué tipo de comida sirves, en pocas palabras?', a: 'Por ejemplo: parrilla chilena, comida casera, pastas, café de especialidad.' },
    { id: 'zona', t: 'texto', q: '¿En qué comuna estás?', req: 1 },
    { id: 'direccion', t: 'texto', q: '¿Cuál es la dirección del local?' },
    { id: 'horario', t: 'texto', q: '¿Qué días y a qué hora atiendes?', a: 'Si tienes almuerzo y cena, escribe los dos horarios.' },
    { id: 'telefono', t: 'texto', q: 'Teléfono y WhatsApp', req: 1 },
    { id: 'correo', t: 'texto', q: 'Correo donde quieres recibir mensajes', req: 1 },
    { id: 'redes', t: 'larga', q: '¿Tienes redes sociales? Pégalas aquí', a: 'Instagram, Facebook, TikTok, lo que uses.' },
    { id: 'web_actual', t: 'texto', q: '¿Ya tienes una página web o carta digital?', a: 'Si existe, pega el link aunque esté abandonada.' },
  ]},

  { t: 'Para qué quieres el menú', n: 'Esto define qué va primero y qué botones lleva.', p: [
    { id: 'objetivo', t: 'uno', q: '¿Qué es lo más importante que debe lograr?', req: 1, ops: [
      ['Que vean la carta en el celular|Sin pedirla ni esperar al garzón'],
      ['Reemplazar las cartas de papel|Que no se rompan, no se ensucien ni haya que reimprimir'],
      ['Que vean los platos antes de pedir|Fotos buenas de cada plato'],
      ['Que pidan por WhatsApp|Que el pedido llegue directo a mi celular'],
      ['Destacar mis platos estrella|Que lo que más quiero vender se vea primero'],
    ]},
    { id: 'hoy', t: 'uno', q: '¿Cómo es tu carta hoy?', ops: [
      ['Carta de papel o laminada'], ['Pizarra o afiche'], ['Un PDF o fotos en Instagram'], ['Me la dicen de memoria los garzones'], ['No tengo carta'],
    ]},
    { id: 'cambios', t: 'uno', q: '¿Cada cuánto cambian tus precios o platos?', a: 'Los cambios los hacemos nosotros: tú nos avisas y lo actualizamos.', ops: [
      ['Casi nunca'], ['Una o dos veces al año'], ['Cada mes'], ['Cada semana'], ['Todos los días (menú del día)'],
    ]},
    { id: 'mesas', t: 'texto', q: '¿Cuántas mesas o puestos tiene tu local, más o menos?' },
    { id: 'pedidos_wa', t: 'uno', q: '¿Quieres un botón para pedir por WhatsApp?', ops: [
      ['Sí|Que escriban su pedido a mi WhatsApp'], ['No|Solo mostrar la carta'], ['No sé|Explíquenme'],
    ]},
    { id: 'idioma', t: 'uno', q: '¿En qué idioma va la carta?', ops: [['Solo español'], ['Español e inglés (turistas)'], ['Otro idioma|Escríbelo en la última pregunta']] },
  ]},

  { t: 'Tu carta', n: 'Lo que vamos a poner en el menú. Es la parte más importante: mientras más completo, mejor.', p: [
    { id: 'categorias', t: 'varios', q: '¿Qué secciones tiene tu carta?', req: 1, ops: [
      ['Entradas'], ['Ensaladas'], ['Platos de fondo'], ['Sándwiches y hamburguesas'], ['Pizzas'], ['Sushi'], ['Postres'], ['Bebestibles'], ['Cafetería'], ['Cócteles'], ['Vinos y cervezas'], ['Menú del día o ejecutivo'], ['Otra'],
    ]},
    { id: 'n_platos', t: 'uno', q: '¿Cuántos platos y bebidas tienes en total, más o menos?', ops: [['Hasta 15'], ['Entre 16 y 30'], ['Entre 31 y 60'], ['Más de 60']] },
    { id: 'carta_envio', t: 'larga', q: 'Pega aquí tu carta completa, con precios', req: 1, a: 'Un plato por línea: nombre, qué lleva y precio. Si prefieres, mándanos una foto o un PDF por WhatsApp y escribe aquí "la mando por WhatsApp".' },
    { id: 'menu_dia', t: 'uno', q: '¿Tienes menú del día o menú ejecutivo?', ops: [['Sí, es siempre el mismo'], ['Sí, cambia todos los días'], ['No']] },
    { id: 'etiquetas', t: 'varios', q: '¿Qué avisos quieres poner en los platos?', a: 'Solo marca los que puedas asegurar: si dice "vegano", tiene que serlo.', ops: [['Vegetariano'], ['Vegano'], ['Sin gluten'], ['Picante'], ['Favorito de la casa'], ['Nuevo']] },
    { id: 'alergenos', t: 'larga', q: '¿Hay platos con alérgenos que deba advertirse?', a: 'Escribe solo lo que tú confirmes (maní, mariscos, lácteos…). No inventamos ni deducimos alérgenos.' },
    { id: 'estrella', t: 'larga', q: '¿Cuáles son tus platos estrella?', req: 1, a: 'Los 3 a 6 que más vendes o que más quieres vender. Irán primero, en "Favoritos de la casa".' },
    { id: 'agotados', t: 'uno', q: 'Si se te acaba un plato, ¿quieres poder marcarlo como agotado?', ops: [['Sí, es muy común'], ['A veces'], ['No hace falta']] },
  ]},

  { t: 'Cómo trabajan hoy', n: 'Para entender cómo funciona tu local y armar el sistema a tu medida: no todos los locales trabajan igual. Responde como es hoy, no como debería ser.', p: [
    { id: 'hoy_toma_pedido', t: 'uno', q: '¿Cómo se toma el pedido en la mesa hoy?', ops: [
      ['El garzón lo anota en papel'], ['El garzón lo recuerda y lo avisa a la cocina'], ['El garzón lo anota en un celular o tablet'], ['El cliente pide en la caja o el mesón'], ['Otra forma|Cuéntala en "algo más"'],
    ]},
    { id: 'pedido_llega_cocina', t: 'uno', q: '¿Cómo llega el pedido a la cocina?', ops: [
      ['El garzón lleva el papel o la comanda'], ['El garzón avisa a viva voz'], ['Una impresora de comandas'], ['Una pantalla en la cocina'], ['Otra forma'],
    ]},
    { id: 'quien_cocina', t: 'uno', q: '¿Quién maneja los pedidos en la cocina?', ops: [
      ['Hay un jefe de cocina que organiza y despacha'], ['Los mismos garzones retiran y avisan'], ['El dueño o la dueña'], ['Depende del día'],
    ]},
    { id: 'garzones_turno', t: 'texto', q: '¿Cuántos garzones atienden por turno, más o menos?', a: 'Entre semana y fin de semana, si cambia.' },
    { id: 'horas_punta', t: 'larga', q: '¿Cuándo se llena el local?', a: 'Días y horas. Cuéntanos si entre semana y el fin de semana es distinto, y si se arma fila afuera.' },
    { id: 'dolor', t: 'varios', q: '¿Qué es lo que más les cuesta en las horas punta?', a: 'Marca todo lo que aplique.', ops: [
      ['Tomar los pedidos a tiempo'], ['Que el pedido llegue completo y bien a la cocina'], ['Atender a todas las mesas'], ['Responder qué hay hoy o qué se agotó'], ['Cobrar y entregar la cuenta'], ['Pedidos para llevar'], ['Otra cosa'],
    ]},
    { id: 'quien_pide', t: 'uno', q: '¿Cómo prefieres que se pida en la mesa?', req: 1, ops: [
      ['Que el cliente pida solo desde su celular|Escanea el QR de su mesa'],
      ['Que el garzón anote y el cliente solo vea el estado|El cliente sigue su pedido en vivo desde el celular, sin tener que pedir'],
      ['Las dos formas|Cada mesa elige: pide solo o llama al garzón'],
      ['No sé: explíquenme'],
    ]},
    { id: 'cliente_ve', t: 'uno', q: 'Si el garzón anota el pedido, ¿quieres que el cliente lo vea en su celular?', a: 'Ve en vivo si está en preparación, listo o servido, y puede jugar mientras espera.', ops: [['Sí'], ['No'], ['No sé']] },
    { id: 'cocina_modo', t: 'uno', q: '¿Cómo quieres manejar los pedidos en la cocina?', ops: [
      ['Una pantalla de cocina aparte|El cocinero ve y marca los pedidos'], ['El garzón maneja todo desde su celular|Sin pantalla de cocina'], ['Las dos|Pantalla en cocina y garzones con su celular'], ['No sé: explíquenme'],
    ]},
    { id: 'dispositivos', t: 'varios', q: '¿Qué aparatos hay en el local para usar el sistema?', ops: [
      ['Celular de cada garzón'], ['Tablet'], ['Computador en la caja'], ['Pantalla o TV en la cocina'], ['Ninguno por ahora'],
    ]},
    { id: 'wifi', t: 'uno', q: '¿Hay WiFi o buena señal de celular en todo el local, cocina incluida?', ops: [['Sí, en todo el local'], ['Solo en algunos lugares'], ['No'], ['No sé']] },
    { id: 'cobro', t: 'varios', q: '¿Cómo cobran hoy?', ops: [['Efectivo'], ['Tarjeta con máquina'], ['Transferencia'], ['Mercado Pago u otra app'], ['Otro']] },
    { id: 'reservas_hoy', t: 'uno', q: '¿Aceptan reservas de mesa?', ops: [['No, por orden de llegada'], ['Solo en fechas especiales'], ['Solo para grupos o celebraciones'], ['Sí, siempre']] },
    { id: 'reservas_como', t: 'texto', q: 'Si aceptan reservas: ¿cómo las toman hoy?', a: 'Teléfono, mensaje de Instagram, WhatsApp, otro.' },
    { id: 'google_resenas', t: 'uno', q: '¿Quieres invitar a tus clientes a dejar su reseña en Google al terminar de comer?', a: 'Les mostramos un botón que abre el formulario de Google. La reseña la escribe y publica el cliente con su cuenta: nosotros no podemos publicarla por él.', ops: [['Sí'], ['No'], ['No sé']] },
    { id: 'maps_link', t: 'texto', q: 'Pega el enlace de tu local en Google Maps', a: 'Búscalo en Google Maps, toca Compartir y copia el enlace.' },
  ]},

  { t: 'Pedidos y delivery', n: 'Solo si quieres que tus clientes pidan desde el celular. Con esto dejamos andando los pedidos, la cocina y el reparto.', p: [
    { id: 'servicios', t: 'varios', q: '¿Cómo quieres recibir pedidos?', req: 1, ops: [
      ['En la mesa|El cliente escanea el QR de su mesa y pide'], ['En la mesa, anotado por el garzón|El garzón toma el pedido en su celular y el cliente lo sigue en vivo'], ['Para retirar en el local'], ['Delivery con repartidor propio|Tú o tu gente reparten; el cliente ve al repartidor en el mapa'], ['Solo mostrar la carta, sin pedidos|Es el menú simple, sin cocina ni reparto'],
    ]},
    { id: 'comunas_envio', t: 'larga', q: 'Si haces delivery: ¿a qué comunas llegas y cuánto cobras de envío?', a: 'Una comuna por línea, con el valor. Ejemplo: Concepción: 1500. Talcahuano: 2500.' },
    { id: 'minimo_delivery', t: 'texto', q: 'Si haces delivery: ¿cuál es el pedido mínimo?', a: 'En pesos. Ejemplo: 8000. Si no tienes, escribe "sin mínimo".' },
    { id: 'tiempos', t: 'larga', q: '¿Cuánto demora preparar tus platos?', a: 'En minutos, un plato por línea. Ejemplo: Lomo a lo pobre: 25. Si no sabes, déjalo en blanco y usamos tiempos típicos que tú puedes cambiar después.' },
    { id: 'opciones_platos', t: 'larga', q: '¿Algún plato tiene opciones para elegir (tamaño, término, extras)?', a: 'Un plato por línea. Ejemplo: Lomo: Término (obligatorio): Jugoso, A punto, Bien cocido; Agregar (hasta 2): Palta +1500, Tocino +1200. Lo que va con + es lo que suma al precio.' },
    { id: 'equipo', t: 'larga', q: '¿Quiénes van a trabajar con el sistema?', req: 1, a: 'Un nombre por línea con su función: cocina, reparto o garzón. Ejemplo: Ana - cocina. Pedro - reparto. Camila - garzón. Cada uno recibe su código para entrar a lo suyo; tú entras a todo como jefe.' },
    { id: 'pago_online', t: 'uno', q: '¿Quieres que el cliente pueda pagar en línea?', ops: [
      ['Solo pago en el local o al recibir'], ['Quiero pago en línea|Con tu cuenta de Mercado Pago; la comisión de cada pago la paga el local'], ['No sé: explíquenme'],
    ]},
  ]},

  { t: 'Cómo te gustaría que se vea', n: 'Mueve cada escala hacia el lado que mejor describe tu local. No pienses en diseño: piensa en cómo se siente entrar.', p: [
    { id: 'e_clasico', t: 'escala', q: 'Estilo', izq: 'Clásico, de toda la vida', der: 'Moderno y actual', req: 1 },
    { id: 'e_sobrio', t: 'escala', q: 'Presencia', izq: 'Sobrio y tranquilo', der: 'Llamativo y con energía', req: 1 },
    { id: 'e_elegante', t: 'escala', q: 'Terminación', izq: 'Rústico y artesanal', der: 'Elegante y refinado', req: 1 },
    { id: 'e_calido', t: 'escala', q: 'Ambiente', izq: 'Cálido y acogedor', der: 'Fresco y luminoso', req: 1 },
    { id: 'e_divertido', t: 'escala', q: 'Tono', izq: 'Serio y formal', der: 'Divertido y relajado', req: 1 },
    { id: 'e_detalle', t: 'escala', q: 'Cantidad de detalle', izq: 'Pocos elementos, mucho aire', der: 'Lleno de detalles', req: 1 },
    { id: 'tres_palabras', t: 'texto', q: 'Tres palabras que describan tu local', a: 'Ejemplos: familiar, de campo, moderno, de barrio, romántico.' },
    { id: 'colores', t: 'varios', q: '¿Qué colores te representan más?', ops: [
      ['Café y dorado|Cálido, de carta clásica'], ['Crema y cobre|Luminoso, de cafetería'], ['Negro y dorado|Elegante, de cena'], ['Blanco y vino|Fresco, de bistró'], ['Verde y natural|De jardín, saludable'], ['Los colores de mi logo'], ['No sé: propónganme ustedes'],
    ]},
    { id: 'colores_logo', t: 'texto', q: 'Si tienes colores definidos, ¿cuáles son?', a: 'Si tienes logo, los de tu logo. Si no, escribe "no tengo".' },
    { id: 'modo', t: 'uno', q: '¿La carta es clara u oscura?', ops: [
      ['Que cambie según el celular del cliente|Recomendado: se adapta solo y el cliente puede cambiarla'], ['Siempre oscura'], ['Siempre clara'], ['No sé'],
    ]},
    { id: 'letra', t: 'uno', q: '¿Qué tipo de letra te gusta para los títulos?', ops: [
      ['Clásica, como la de un menú de restaurante'], ['Moderna y limpia'], ['Elegante y fina'], ['No sé: propónganme ustedes'],
    ]},
    { id: 'referencias', t: 'larga', q: 'Pega 2 o 3 cartas o menús que te gusten, de cualquier restaurante', a: 'Pueden ser de otro país o rubro. Un link o una foto sirve.' },
    { id: 'que_gusta', t: 'larga', q: 'De esos ejemplos, ¿qué te gustó?', a: 'Los colores, que se vean las fotos, que sea simple, la letra…' },
    { id: 'no_parecer', t: 'larga', q: '¿Qué NO quieres que parezca?', a: 'Barato, recargado, frío, de comida rápida…' },
  ]},

  { t: 'Fotos de los platos', n: 'Un menú con fotos buenas vende más: así resolvemos las fotos.', p: [
    { id: 'fotos_tengo', t: 'uno', q: '¿Tienes fotos buenas de tus platos?', ops: [['De casi todos'], ['De algunos'], ['No tengo']] },
    { id: 'fotos_visita', t: 'uno', q: '¿Cómo quieres resolver las fotos?', ops: [
      ['Que vayan a mi local a sacarlas|Con luz natural y el plato recién servido'], ['Las mando yo|Las tomo con mi celular'], ['No sé|Explíquenme'],
    ]},
    { id: 'visita_dias', t: 'larga', q: 'Si van al local, ¿qué días y horas les acomodan?', a: 'Idealmente cuando no haya mucho servicio, para no molestar a tus clientes.' },
    { id: 'personas_fotos', t: 'uno', q: '¿Van a aparecer personas en las fotos?', a: 'Si es así, necesitamos su autorización por escrito. Es la ley.', ops: [['No, solo platos'], ['Sí, el equipo'], ['Sí, clientes']] },
  ]},

  { t: 'Tu marca', n: null, p: [
    { id: 'logo', t: 'uno', q: '¿Tienes logo?', ops: [['Sí, en buena calidad (PNG o vector)'], ['Sí, pero solo una foto'], ['No tengo']] },
    { id: 'nombre_carta', t: 'texto', q: '¿Cómo quieres que se llame la carta?', a: 'Ejemplos: Carta, Menú, Nuestra carta, La carta del Fogón.' },
    { id: 'frase', t: 'texto', q: 'Si tienes una frase o lema, escríbelo', a: 'Ejemplo: "Cocina a las brasas en el centro de Concepción".' },
    { id: 'bienvenida', t: 'larga', q: '¿Qué le dirías a un cliente nuevo al recibirlo?', a: 'Una o dos frases, como se lo dirías en la puerta.' },
  ]},

  { t: 'El QR y tu local', n: 'Cómo va a llegar la carta a las manos de tus clientes.', p: [
    { id: 'qr_donde', t: 'varios', q: '¿Dónde quieres poner el QR?', ops: [['En las mesas'], ['En el mesón o la caja'], ['En la vitrina o el vidrio'], ['En un afiche en la entrada'], ['En bolsas o delivery'], ['En tarjetas']] },
    { id: 'qr_cantidad', t: 'texto', q: '¿Cuántos QR necesitas, más o menos?', a: 'Normalmente uno por mesa y uno en la entrada.' },
    { id: 'qr_soporte', t: 'uno', q: '¿Cómo lo prefieres impreso?', ops: [['Tarjeta de mesa'], ['Adhesivo'], ['Soporte de acrílico'], ['No sé: propónganme ustedes']] },
  ]},

  { t: 'Publicación y números', n: null, p: [
    { id: 'dominio', t: 'uno', q: '¿Tienes dominio propio (como minegocio.cl)?', ops: [
      ['Sí, ya lo tengo'], ['No, quiero comprar uno|Cuesta cerca de $10.000 al año en NIC Chile (se confirma)'], ['Usar la dirección gratuita por ahora'],
    ]},
    { id: 'dominio_nombre', t: 'texto', q: 'Si quieres un dominio, ¿qué nombre te gustaría?', a: 'Entre 2 y 3 opciones, por si el primero está ocupado.' },
    { id: 'maps', t: 'uno', q: '¿Tu local está en Google Maps?', ops: [['Sí'], ['No'], ['No sé']] },
    { id: 'analitica', t: 'uno', q: '¿Quieres saber cuántas personas abren tu carta?', a: 'Es un conteo simple, sin cookies y sin identificar a nadie.', ops: [['Sí'], ['No'], ['No sé']] },
    { id: 'mensual', t: 'uno', q: '¿Sabías que el dominio se paga todos los años?', ops: [['Sí, lo tengo claro'], ['No sabía: explíquenmelo']] },
  ]},

  { t: 'Plazos y decisión', n: null, p: [
    { id: 'plazo', t: 'uno', q: '¿Para cuándo lo necesitas?', ops: [['Lo antes posible'], ['En un par de semanas'], ['Para una fecha especial|Escríbela abajo'], ['No hay apuro']] },
    { id: 'decide', t: 'texto', q: '¿Quién aprueba la carta y el diseño?', a: 'Si son varias personas, quién tiene la última palabra.' },
    { id: 'algo_mas', t: 'larga', q: '¿Algo más que debamos saber?', a: 'Lo que sea. Esta es la pregunta donde aparece lo importante.' },
  ]},
];
