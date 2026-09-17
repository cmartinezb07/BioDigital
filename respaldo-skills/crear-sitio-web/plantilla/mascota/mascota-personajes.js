// CONFIGURACIÓN DE LA MASCOTA (se reescribe por cliente). Se carga ANTES de mascota.js.
// - Un personaje = una carpeta de imágenes en <ruta>/<id>/ con un archivo por reacción.
// - Cada evento: [reacción, [frases…], gesto?]  gesto: 'salta' | 'sacude' | 'tiembla' | 'asiente'
// - {s} en una frase se reemplaza por "Buenos días / Buenas tardes / Buenas noches".
// - Si un personaje no define un evento, ese evento no hace nada (no se inventa una frase por defecto).
// - Las frases no prometen nada que el negocio no ofrezca: revisa precios, plazos y beneficios reales.
window.MascotaConfig = {
  marca: '[PENDIENTE: nombre del negocio]',
  ruta: 'mascotas/',
  formato: 'webp',

  // Nombres de archivo disponibles para TODOS los personajes (sin extensión)
  reacciones: ['feliz', 'negacion', 'triste', 'enojado', 'sorprendido', 'soberbio', 'pensativo', 'afirmando', 'miedo', 'guino', 'cansado', 'muyfeliz'],

  // Animaciones cuadro a cuadro (opcional). Archivos: <reaccion>-1, <reaccion>-2, … en la carpeta del personaje.
  // Si existe una animación con el mismo nombre que un evento, se reproduce en vez de la imagen fija.
  animaciones: {
    // saluda: { cuadros: 4, ms: 110, vueltas: 2, final: 'primero', personajes: ['guia'] },
  },

  // Hacia dónde mira cada dibujo original: 'd' derecha, 'i' izquierda, 'f' frente (por defecto).
  // '*' vale para todas las reacciones del personaje. El motor voltea en espejo cuando hace falta.
  mira: {
    guia: { '*': 'f', negacion: 'd' },
    critico: { '*': 'd' },
  },

  // id de sección en la página -> nombre de evento que se comenta una vez al llegar
  secciones: { servicios: 'servicios', detalle: 'detalle', puntaje: 'puntaje', proceso: 'proceso', planes: 'planes', beneficio: 'beneficio', contacto: 'formulario', preguntas: 'preguntas', cierre: 'cierre' },
  // cara de fondo mientras se lee cada sección
  bases: { servicios: 'afirmando', detalle: 'pensativo', puntaje: 'feliz', proceso: 'afirmando', planes: 'guino', beneficio: 'feliz', formulario: 'feliz', preguntas: 'pensativo', cierre: 'feliz' },
  // qué elementos de la página miran/comentan al pasar el mouse
  selectores: { cta: '.btn-main', destacado: '.pick', precio: '.price', tarjeta: '.plan, .svc, a.entry' },

  personajes: {
    // Personalidad 1: amable y entusiasta (tutea)
    guia: {
      nombre: 'la guía', presentacion: '¡Hola! Soy tu guía. Te acompaño por la página.',
      cansadoMs: 30000, miedoVel: 4.5, titulo: '¡Vuelve! Te estamos esperando',
      ev: {
        llegada: ['muyfeliz', ['¡{s}! ¡Qué bueno verte por aquí!', '¡{s}! Pasa, te muestro todo.'], 'salta'],
        bajar: ['pensativo', ['¡Sigamos! Hay mucho que ver.', 'Voy contigo.']],
        subir: ['sorprendido', ['¿Volvemos a ver algo?']],
        rapido: ['miedo', ['¡Despacio, que me mareo!'], 'tiembla'],
        servicios: ['afirmando', ['Esto es lo que hacemos por ti.']],
        detalle: ['pensativo', ['Y esto es lo que recibes.']],
        puntaje: ['sorprendido', ['¡Mira cómo sube!']],
        proceso: ['afirmando', ['Así trabajamos, paso a paso.']],
        planes: ['guino', ['El recomendado es el favorito.']],
        beneficio: ['muyfeliz', ['¡Mira este beneficio!'], 'salta'],
        formulario: ['feliz', ['¡Te ayudo a llenarlo!']],
        preguntas: ['pensativo', ['¿Tienes dudas? Aquí están las respuestas.']],
        cierre: ['feliz', ['¡Escríbenos cuando quieras!']],
        final: ['muyfeliz', ['¡Llegaste al final! ¡Bien hecho!'], 'salta'],
        arriba: ['sorprendido', ['¡De vuelta al inicio!']],
        'botón': ['guino', ['¡Ese botón te lleva directo!']],
        pick: ['muyfeliz', ['¡Buena elección!']],
        precio: ['sorprendido', ['Precio claro, sin sorpresas.']],
        pregunta: ['afirmando', ['¡Buena pregunta!']],
        campo: ['feliz', ['¡Tú puedes!', '¡Vas muy bien!']],
        sensible: ['negacion', ['No miro, tranquilo.', 'Tus datos son tuyos. Me doy vuelta.']],
        tipeo: ['afirmando', ['¡Qué bien lo explicas!']],
        malDato: ['triste', ['Uy, ese dato tiene un error.'], 'sacude'],
        incompleto: ['triste', ['Faltan algunos datos.'], 'sacude'],
        enviando: ['pensativo', ['Enviando…']],
        enviado: ['muyfeliz', ['¡Listo! Mensaje enviado.', '¡Te respondemos pronto!'], 'salta'],
        beneficioOk: ['muyfeliz', ['¡Anotado!'], 'salta'],
        oscuro: ['sorprendido', ['¡Se hizo de noche!']],
        claro: ['feliz', ['¡Buenos días, sol!']],
        cansado: ['cansado', ['Zzz… sigo aquí… zzz…']],
        despierta: ['sorprendido', ['¡Ah! ¡Estoy despierta!'], 'salta'],
        irse: ['triste', ['¿Ya te vas? Vuelve pronto.']],
        volver: ['muyfeliz', ['¡Volviste!'], 'salta'],
        toque: ['muyfeliz', ['¡Hola!', '¡Hihi, cosquillas!']],
        muchosToques: ['miedo', ['¡Despacito!'], 'tiembla'],
        copiar: ['feliz', ['¡Copiado!']],
        seleccion: ['pensativo', ['¿Tomando nota? ¡Bien!']],
        achicar: ['miedo', ['¡Me aprietas!'], 'tiembla'],
        loginOk: ['muyfeliz', ['¡Bienvenido de vuelta!'], 'salta'],
        loginError: ['negacion', ['Esos datos no calzan.'], 'sacude'],
        error: ['triste', ['Algo salió mal. Probemos de nuevo.']],
      },
    },
    // Personalidad 2: irónico pero útil (contraste para que el cliente elija)
    critico: {
      nombre: 'el crítico', presentacion: 'Soy el crítico. Sarcástico, pero te ayudo igual.',
      cansadoMs: 25000, miedoVel: 5, titulo: 'Te fuiste. Típico.',
      ev: {
        llegada: ['soberbio', ['{s}. Otro visitante. Adelante.']],
        bajar: ['pensativo', ['Bajando… sin apuro, veo.']],
        rapido: ['miedo', ['¡Oye! Casi me botas.'], 'tiembla'],
        planes: ['guino', ['Psst… el recomendado. Confía.']],
        'botón': ['guino', ['Ese botón no se presiona solo.']],
        sensible: ['negacion', ['No miro. Tampoco me interesa.']],
        malDato: ['enojado', ['Eso no es un dato válido. Y lo sabes.'], 'sacude'],
        incompleto: ['enojado', ['Faltan datos. No leo mentes.'], 'sacude'],
        enviado: ['muyfeliz', ['Listo. Buen trabajo.', 'Hasta yo estoy impresionado.'], 'salta'],
        cansado: ['cansado', ['Zzz… avísame cuando decidas.']],
        despierta: ['sorprendido', ['No dormía. Meditaba.']],
        irse: ['muyfeliz', ['Jaja, ¿ya te vas? Tu competencia te lo agradece.'], 'salta'],
        volver: ['soberbio', ['Sabía que volverías.']],
        toque: ['soberbio', ['¿Qué? Estoy ocupado.']],
        muchosToques: ['enojado', ['¡Suficiente!'], 'sacude'],
      },
    },
  },
};
