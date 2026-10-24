// Mascota de todas las páginas de la propuesta: solo el gato, dibujado en SVG (gato.js) y con más frases.
// El motor está en mascota.js (se carga después de este archivo). Para editar una frase, cámbiala aquí.
// Cada evento: [pose o lista de poses, [frases…], gesto]. Poses y gestos: ver gato-lamina.html.
// Las frases son borradores: el tono se revisa con el equipo antes de publicar.
window.MascotaConfig = {
  marca: 'Bío Digital',
  rig: true,
  // Scroll "muy rápido": más de 4 pantallas por segundo sostenido medio segundo; avisa como máximo cada 20 s
  rapido: { pantallas: 4, ventanaMs: 500, pausaMs: 20000 },
  // Comentarios sueltos mientras la persona lee, como máximo 2 por visita
  ocioMax: 2,
  // Mouse sacudido con fuerza (zigzag rápido sostenido): se marea como máximo 2 veces por visita, con 45 s entre mareos
  mareo: { pausaMs: 45000, max: 2 },
  // id de sección de la página -> evento que se comenta al llegar (sirve para todas las opciones)
  secciones: {
    ejemplos: 'ejemplos',
    proceso: 'proceso', planes: 'planes', promos: 'beneficio', beneficio: 'beneficio', diagnostico: 'formulario',
    preguntas: 'preguntas', contacto: 'cierre', cierre: 'cierre',
  },
  // Pose de fondo mientras se lee cada sección (tranquilas: se mantienen varios segundos)
  bases: { ejemplos: 'orgulloso', proceso: 'feliz', planes: 'sarcastico', beneficio: 'lentes', formulario: 'feliz', preguntas: 'pensativo', cierre: 'feliz' },
  selectores: { cta: '.btn-main, .btn-primary, .btn-foil', destacado: '.pack', precio: '.price, .promo-price', tarjeta: '.pack, .promo, .tarifario .fila, .tg-tile' },

  personajes: {
    gato: {
      nombre: 'el gato',
      cansadoMs: 30000,
      ev: {
        llegada: ['saluda', [
          '{s}. Ah, otro humano. Pasa, pasa.',
          '{s}. Llegaste justo cuando me iba a dormir.',
          '{s}. ¿Tu negocio ya vende en internet? Yo ya vendo mi cara.',
          '{s}. Soy el gato. El que manda aquí.',
        ], 'saluda'],
        // Scroll: sin poses de perfil (es lo que más se repite; el giro completo queda para momentos puntuales)
        bajar: [['pensativo', 'curioso', 'sarcastico'], [
          'Bajando… como mis ganas de trabajar.',
          'Sigue, sigue. Yo te sigo. Lento.',
          'Mmm. Interesante. Supongo.',
          'Lees más que yo. No es difícil.',
          'Abajo viene lo bueno. Creo.',
        ]],
        subir: [['curioso', 'pensativo'], [
          '¿Se te olvidó algo?',
          '¿De vuelta? Sabía que te perdiste algo.',
          'Retroceder también es avanzar. Dicen.',
        ]],
        rapido: ['miedo', [
          '¡Oye! Casi me botas el café.',
          '¡Despacio! Tengo siete vidas, no ocho.',
          '¿Vas a un incendio? Aquí no se quema nada.',
          'A esa velocidad no leíste nada. Te vi.',
        ], 'tiembla'],
        ejemplos: ['orgulloso', [
          'Así se ven las páginas que hacemos. Yo saldría mejor.',
          'Un estilo para cada rubro. Yo ya tengo el mío.',
          'Restaurantes, peluquerías, cabañas… yo solo duermo.',
        ]],
        proceso: ['afirmando', [
          'Cuatro pasos. Hasta yo podría. Si quisiera.',
          'El paso 1 es gratis. El gato aprueba.',
        ]],
        planes: ['guino', [
          'Abre un producto y mira qué incluye. Yo abrí todos.',
          'Psst… el pack completo. Yo sé de estas cosas.',
          'Seis productos por $79.990. Hice la cuenta dos veces.',
        ]],
        beneficio: ['lentes', [
          'Cupos limitados. Yo que tú, me apuro.',
          'Solo los primeros 5. No corras. Bueno, corre.',
        ]],
        formulario: ['soberbio', [
          'Llénalo. Yo supervisaré. Desde lejos.',
          'Puedes enviarlo por correo o por WhatsApp. Yo prefiero WhatsApp.',
          'Solo atendemos en el Gran Concepción. Elige tu comuna.',
        ]],
        carritoSuma: ['muyfeliz', [
          'Al carrito. Buena elección.',
          'Eso. Llena ese carrito.',
          'Anotado. Yo no tengo bolsillos, pero sé de compras.',
        ], 'salta'],
        carritoQuita: ['pensativo', [
          '¿Lo sacas? Bueno. Tú sabrás.',
          'Uno menos. Se echa de menos.',
        ]],
        preguntas: ['pensativo', [
          '¿Dudas? Yo no tengo ninguna.',
          'Aquí están las respuestas. De nada.',
        ]],
        cierre: ['guino', [
          '¿Y? ¿Conversamos o no?',
          'Último llamado. El gato no insiste. Mucho.',
        ]],
        final: ['muyfeliz', [
          'Llegaste al final. Premio: el diagnóstico gratis.',
          'Fin. Aplausos. Para mí, obvio.',
        ], 'baila'],
        arriba: ['sorprendido', [
          'De vuelta al inicio. Como mis lunes.',
          'Arriba otra vez. ¿Ejercicio o indecisión?',
        ]],
        botón: ['guino', [
          'Ese botón no se va a presionar solo.',
          'Clic ahí. Confía en el gato.',
          'Dale. Es gratis. Hasta yo lo haría.',
        ]],
        pick: ['afirmando', [
          'Buen gusto. Casi tanto como el mío.',
          'Ese. El que elegiría un gato con estilo.',
        ]],
        precio: ['sorprendido', [
          'Precio claro, sin letra chica. Qué honestos.',
          'Sin mensualidades. Pagas una vez.',
        ]],
        pregunta: ['afirmando', [
          'Buena pregunta. Casi tan buena como yo.',
          'Esa me la sé. Obvio.',
          'Lee con calma. Yo espero. Qué remedio.',
        ]],
        campo: ['afirmando', [
          'Escribe, escribe. Yo no juzgo… mucho.',
          'Tómate tu tiempo. Yo tengo siete vidas.',
          'Con buena letra, por favor.',
        ]],
        // Datos personales: se da vuelta, cierra los ojos y silba
        sensible: ['indiferente', [
          'No miro. Tampoco me interesa.',
          'Tus datos, tu problema. No miro.',
          'Silbo y miro para otro lado. Profesional.',
          'Privacidad. La inventaron los gatos.',
        ]],
        tipeo: ['afirmando', [
          'Qué inspiración. Casi un poeta.',
          'Escribes más que yo en toda mi vida.',
        ]],
        malDato: ['facepalm', [
          'Eso no es un correo. Y lo sabes.',
          'Mmm, no. Revisa ese dato.',
          'Ay. Inténtalo de nuevo. Yo no vi nada.',
        ], 'sacude'],
        incompleto: ['enojado', [
          'Faltan datos. No leo mentes (aún).',
          'Casi. Te faltó algo. Casi.',
        ], 'sacude'],
        enviando: ['mira-d', ['Enviando. No me apures.']],
        enviado: ['muyfeliz', [
          'Listo. Buen trabajo, humano.',
          'Hasta yo estoy impresionado.',
        ], 'celebra'],
        beneficioOk: ['lentes', ['Anotado para el beneficio. De nada.'], 'salta'],
        oscuro: ['lentes', [
          '¡Por fin, oscuridad! Mi hora favorita.',
          'Modo oscuro. Mis lentes y yo aprobamos.',
        ]],
        claro: ['miedo', [
          '¡Ay, la luz! Mis ojos.',
          '¿Modo claro? ¿Quién hace eso?',
        ], 'tiembla'],
        cansado: ['dormido', [
          'Zzz… despiértame cuando decidas.',
          'Zzz… cinco minutos más…',
        ]],
        despierta: ['sorprendido', [
          'No estaba durmiendo. Estaba meditando.',
          '¡Despierto! Siempre. Obvio.',
        ], 'salta'],
        irse: ['burlon', [
          'Jajaja, ¿ya te vas? Tu competencia te lo agradece.',
          'Ándate nomás. Yo me quedo con el diagnóstico gratis.',
        ], 'risa'],
        volver: ['soberbio', [
          'Sabía que volverías.',
          'Nadie se resiste al gato.',
          'Te extrañé. Poquito. Nada, en realidad.',
        ]],
        toque: [['soberbio', 'sarcastico', 'lengua'], [
          '¿Qué? Estoy ocupado.',
          'No soy un botón. Bueno, técnicamente sí.',
          'Si me acaricias, cobro.',
          'Cosquillas no. Tengo una reputación.',
        ]],
        muchosToques: ['enojado', [
          '¡Suficiente! Llamaré a mi abogado.',
          '¡Oye! Esto es acoso felino.',
        ], 'sacude'],
        // Mouse sacudido: estrellas alrededor de la cabeza y ojos dando vueltas
        mareo: ['mareado', [
          '¿Estás cazando una mosca? Me mareo.',
          'Para, para… veo tres cursores.',
          'Tranquilo con ese mouse. Soy gato, no péndulo.',
          'Si buscas el cursor, está ahí. Yo lo vi. Tres veces.',
        ], 'mareo'],
        copiar: ['guino', ['¿Copiando? Yo también lo haría.']],
        seleccion: ['pensativo', ['¿Tomando apuntes? Bien.']],
        achicar: ['miedo', ['¡Me aplastas la cola!'], 'tiembla'],
        // Cambio de colores con la rueda: la ropa del gato cambia con la paleta
        paleta: ['orgulloso', [
          '¿Ropa nueva? Todo me queda bien.',
          'Me cambiaste el color. Atrevido.',
          'Este tono me hace ver más delgado.',
        ], 'salta'],
        // Comentarios sueltos mientras la persona lee
        ocio: [['sarcastico', 'pensativo', 'aburrido', 'curioso', 'mira-d', 'mira-i'], [
          'Si alguien quiere reservar hoy, ¿puede sin llamarte?',
          'Estoy pensando. No, mentira. Estoy mirando.',
          'Pregunta seria: ¿tu carta está donde el cliente la ve?',
          '¿Y si tu cliente viera el plato en su mesa antes de pedir? Existe.',
          'Sigo aquí. Por si te lo preguntabas. No lo hacías.',
          'Un local sin fotos no convence. Ni a mí.',
          'Los gatos no pagan arriendo. Envidia, lo sé.',
        ]],
        loginOk: ['soberbio', ['Bienvenido de vuelta. Te extrañé. Poco.']],
        loginError: ['negacion', ['Contraseña incorrecta. Qué vergüenza ajena.'], 'sacude'],
        error: ['facepalm', ['Algo falló. No fui yo.'], 'sacude'],
      },
      titulo: 'Tu diagnóstico te espera (yo no)',
    },
  },
};
