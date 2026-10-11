# Levantamiento con el cliente: el formulario y cómo leerlo

El formulario (`plantilla/formulario/formulario-cliente.html`) se le manda al dueño del negocio cuando **no está
sentado al lado**. Son 59 preguntas en 12 bloques, escritas en lenguaje de dueño de negocio, no de diseñador.
Se llena en unos 15 minutos.

## 1. Cómo se usa

1. Copia el archivo a la carpeta del proyecto y cambia `AGENCIA` (nombre y contacto) en la primera línea del script.
2. Se lo haces llegar de una de estas formas:
   - **Link** (lo mejor): publícalo junto al sitio de maquetas o en cualquier hosting estático, y mándale la URL.
   - **Archivo**: se lo mandas por WhatsApp o correo; lo abre y funciona igual, sin internet.
   - **En papel**: ábrelo en el navegador y imprime con Ctrl+P. La barra y los botones no salen impresos.
3. El cliente responde cuando puede: lo que escribe se guarda en su propio teléfono, así que puede cerrar y seguir.
4. Al final aprieta **Copiar mis respuestas** y te las pega por WhatsApp, o te manda el archivo descargado.
5. Pegas ese texto en la conversación con la IA y empieza la fase 1.

Lo que vuelve es texto ordenado por bloques, con las escalas traducidas (`4 de 5 (1 = Serio y formal · 5 = Cercano
y relajado)`) y una lista final con lo que quedó sin responder.

**Nunca lo mandes sin avisar.** Un formulario que llega sin contexto no se llena. Lo que funciona: "para que la
página quede como la quieres y no como yo creo que la quieres, respóndeme esto cuando puedas, son 15 minutos".

**Si el cliente está presente** (visita en terreno), no se lo pases para que lo lea: úsalo tú como guion y anota.
La conversación da mejor material que el formulario, sobre todo en las preguntas de clientes y competencia.

## 2. Cómo se leen las seis escalas

Son el corazón del formulario. Cada una va de 1 a 5 y juntas definen la estética.

| Escala | 1 | 5 |
|---|---|---|
| `e_serio` Tono | Serio y formal | Cercano y relajado |
| `e_moderno` Estilo | Clásico, de toda la vida | Moderno y tecnológico |
| `e_sobrio` Presencia | Sobrio y tranquilo | Llamativo y con energía |
| `e_divertido` Humor | Nada de humor | Divertido y jugado |
| `e_premium` Posición | Precio conveniente | Premium |
| `e_edad` Público | Adulto o mayor | Jóvenes, niños y familias |

Cada escala manda sobre decisiones concretas:

| Escala | 1–2 | 3 | 4–5 |
|---|---|---|---|
| Tono | Usted, frases completas, datos y respaldo | Tú, frases cortas | Tú, lenguaje hablado, se permite una broma |
| Estilo | Serif, bordes rectos, composición clásica, foto real | Sans neutra, radios de 8 a 12 px | Sans geométrica o mono, radios 16 px o cero, degradados, efectos |
| Presencia | Dos colores, mucho espacio en blanco, sin animación llamativa | Un acento fuerte y apariciones al hacer scroll | Color saturado, contrastes altos, hero animado, contadores |
| Humor | Textos informativos, sin guiños | Un toque de calidez | Microcopia con chiste, mascota con personalidad |
| Posición | Precio visible, "desde", foco en conveniencia | Precio con valor explicado | Sin precio o bajo pedido, fotografía cuidada, mucho aire, detalles finos |
| Público | Tipografía 18 px o más, contraste alto, nada de jerga | Estándar | Colores vivos, ilustración, movimiento, formas redondas |

**Perfiles frecuentes** (atajo, siempre confirmando con el resto de las respuestas):

| Perfil | Escalas típicas | Estética sugerida |
|---|---|---|
| Profesional serio (abogado, contador, consulta médica) | 1-2 / 1-2 / 1-2 / 1 / 3-4 / 1-2 | Certificado o Foco, serif, paleta sobria, animación mínima, sin mascota |
| Oficio confiable (taller, gasfiter, cerrajero) | 2-3 / 2-3 / 3 / 2 / 2 / 2-3 | Panel o Metal, sans robusta, teléfono gigante, precio "desde" |
| Cercano y cálido (peluquería, café, veterinaria) | 4-5 / 3 / 3-4 / 3-4 / 2-3 / 3-4 | Cristal o Vidrio, colores cálidos, fotos del local, mascota recomendada |
| Juvenil y con energía (barbería, gimnasio, tatuajes) | 4-5 / 4-5 / 5 / 4 / 3 / 5 | ASCII o Metal, alto contraste, hero animado, reservas en línea |
| Premium (clínica estética, joyería, arquitectura) | 2 / 3-4 / 1-2 / 1 / 5 | Foco o Cristal, mucho espacio, fotografía grande, sin precios |
| Infantil o familiar (jardín, pediatra, cumpleaños) | 5 / 3 / 4-5 / 4-5 / 2 / 5 | Paleta clara y saturada, formas redondas, ilustración, mascota casi obligatoria |

**Cuando las escalas se contradicen, pregunta.** Las contradicciones típicas:
- Premium 5 + precio conveniente en los textos: hay que elegir uno, no se puede ser los dos.
- Serio 1 + humor 5: suele significar "quiero ser cercano pero que me tomen en serio". Se resuelve con tono
  cálido y cero chistes.
- Llamativo 5 + "no quiero parecer barato": color saturado sí, pero en un solo acento y con mucho espacio.

## 3. Cómo se leen las demás respuestas

| Respuesta | En qué se convierte |
|---|---|
| `objetivo` y `accion` | La estructura entera: qué va primero y cuál es el botón que manda. Una sola acción principal, repetida arriba, al medio y al final |
| `preguntan` | Las preguntas frecuentes, con su schema. Es la pregunta que más contenido útil entrega del formulario |
| `preocupa` y `objecion` | Qué hay que responder **antes** de que lo pregunten: garantía, plazo, precio, formas de pago |
| `diferencia` | El título principal de la página. Si está vacío, no hay sitio: hay que llamar y conversarlo |
| `hoy` | De dónde llega la gente. Si todo es Instagram, la página debe abrir rápido desde el teléfono y tener el link en la bio |
| `servicios` y `estrella` | Las páginas de servicio y cuál se destaca en el inicio |
| `precios` | Si se muestran, van en tabla comparativa; si no, el botón pasa a "pedir presupuesto" |
| `competencia` | Qué evitar. Si tres competidores usan azul, no usamos azul |
| `sitios_gustan` y `que_gusta` | Las referencias visuales. Captúralas y confirma el mapeo opción por opción |
| `colores` y `logo` | La paleta. Sin logo, se propone uno simple y se avisa que es aparte |
| `tema` | Claro, oscuro o según el sistema (lo recomendado) |
| `mascota` | Si va el personaje y con qué tono. "Muéstrenme" significa enseñar la lámina de poses antes de decidir |
| `funciones` | El alcance. Tienda y zona privada **cambian el proyecto completo**: hay que cotizarlas aparte |
| `buscar` | Las palabras clave, que mandan sobre los títulos, las URL y los textos |
| `dominio` y `correo_corp` | Costos recurrentes que paga el cliente. Hay que decirlo antes de cerrar |
| `quien_admin` | Si responde "yo mismo", el sitio necesita ser editable y la capacitación es parte del trabajo |
| `cuando` y `decide` | El cronograma y el riesgo. Dos socios que deciden juntos duplican los tiempos de aprobación |
| `odio` | Lista de prohibiciones. Respétala al pie de la letra: es lo que más se nota cuando se incumple |

## 4. Lo que más decide el resultado: `fotos`, `textos` y `resenas`

| Respuesta | Qué significa para el proyecto |
|---|---|
| Fotos buenas y actuales | Se puede hacer un diseño con foto grande. Es el mejor escenario |
| Fotos de celular | Diseño que no dependa de la foto: color, tipografía y composición. O se ofrece el registro fotográfico |
| Sin fotos | **No se empieza el diseño todavía.** Sin imágenes propias el sitio se ve genérico, por bueno que sea el código |
| Sin textos | Los escribimos nosotros y el cliente aprueba. Súmalo al plazo |
| Sin reseñas | Nunca se inventan. Se ofrece el beneficio de lanzamiento: algo a cambio de la primera reseña real |

## 5. Señales de alerta

Si aparece alguna, dilo antes de empezar, no después:

- **`diferencia` vacío o "somos los mejores".** No hay propuesta de valor: sin eso el sitio es un folleto.
- **`decide` con varios nombres** y nadie con la última palabra: el proyecto se va a estancar en las aprobaciones.
- **`cuando` con una fecha imposible** para lo que pide: hay que recortar el alcance o mover la fecha, ahora.
- **Tienda con pagos o zona privada marcadas** junto a un presupuesto de landing: son proyectos distintos.
- **`personas_fotos` en sí**, sin autorizaciones: hay que conseguirlas antes de publicar.
- **Todo respondido en el punto medio (3)**: el cliente no se la jugó. Conviene una llamada de 10 minutos y
  mostrarle dos referencias opuestas para que elija.
- **El formulario vuelve a medias**, con los bloques 1 y 2 llenos y el resto vacío: se llenó apurado. Las
  respuestas de personalidad son las que no se pueden adivinar; sin ellas, hay que conversarlas.

## 6. Después del formulario

1. Resume lo recibido en 10 líneas y devuélveselo al cliente: "esto es lo que entendí". Corregir aquí cuesta
   minutos; corregir después de maquetar cuesta días.
2. Marca con `[PENDIENTE: …]` todo lo que quedó en blanco y pídelo por separado, en una sola lista.
3. Recién entonces, fase 1: maquetas.
