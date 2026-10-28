# Levantamiento del menú: el formulario de gustos y forma y cómo leerlo

El formulario (`plantilla/formulario/`, se arma con `node construir-formulario.mjs`) se le manda al dueño cuando **no está sentado al lado**. Son **64 preguntas en 10 bloques**, escritas como las diría un dueño de local, y se llenan en unos 15 minutos. Usa el mismo motor que el formulario de página web (`crear-sitio-web/plantilla/formulario/`), así que funciona igual: se guarda en el teléfono del cliente mientras responde y vuelve como texto ordenado.

## 1. Cómo se usa
1. `node construir-formulario.mjs --salida formulario-menu.html --agencia "Bío Digital" --contacto "…" --whatsapp 569XXXXXXXX [--supabase-url … --supabase-key …]`. Con `supabase-*` aparece "Enviar a Bío Digital" y las respuestas llegan al panel (pestaña **Formularios**, tipo "Menú digital"). Con `whatsapp`, "Abrir WhatsApp para pegarlas". Siempre queda "Copiar mis respuestas" y "Descargar como archivo".
2. Se publica junto al sitio y se manda el **link** (lo mejor), o el archivo por WhatsApp, o impreso con Ctrl+P.
3. **Nunca lo mandes sin avisar.** Lo que funciona: "para que tu carta quede como la quieres y no como yo creo que la quieres, respóndeme esto cuando puedas, son 15 minutos".
4. Si el cliente está presente (visita en terreno), úsalo tú como guion.

## 2. Qué decide cada bloque
| Bloque | Qué decide en el menú |
|---|---|
| 1. Tu local | Datos del negocio en `menu.json` (`nombre`, `direccion`, `horario`, `whatsapp`, `comuna`, `cocina`) y `tipo_schema`: restaurante → `Restaurant`, cafetería o pastelería → `CafeOrCoffeeShop`, bar → `BarOrPub`, panadería → `Bakery`, comida rápida → `FastFoodRestaurant`. |
| 2. Para qué quieres el menú | `objetivo` define qué va primero: "ver los platos antes de pedir" → más 3D y favoritos; "pedir por WhatsApp" → `pedidos_whatsapp: true`; "reemplazar cartas de papel" → carta completa y rápida. `cambios` define cuánto trabajo de mantención hay (alerta si es "todos los días"). `idioma` ≠ solo español → pregunta cuánto cuesta traducir antes de aceptar. |
| 3. Tu carta | `categorias` y `carta_envio` son el contenido. `estrella` = platos con etiqueta `favorito` (3 a 6). `etiquetas` y `alergenos`: **solo lo que el cliente confirma**. `agotados` = si usará "Agotado hoy". |
| 3b. Cómo trabajan hoy (27-oct) | **Diagnóstico de operación, no cambia la carta:** cómo se toma el pedido hoy, cómo llega a cocina, quién la maneja, garzones por turno, cuándo se llena, qué cuesta más, cómo prefiere que se pida (`quien_pide`: cliente solo, garzón anota, ambas), si el cliente ve su pedido en vivo, cocina aparte o garzón, aparatos y WiFi, cómo cobran, reservas y reseñas de Google. `aplicar-formulario.mjs` las deja en una sección del archivo de pendientes y avisa si pidió algo que aún no existe (rol garzón, "Mi mesa"). Sirve para decidir **qué ofrecerle** antes de cotizar. La reseña de Google la publica el cliente con su cuenta: se muestra un botón a todos, nunca se filtra por estrellas ni se sube por él. |
| 4. Pedidos y delivery | **Lo lee `aplicar-formulario.mjs`**: `servicios` (mesa/retiro/delivery; "solo mostrar la carta" = menú simple), `comunas_envio` ("Comuna: monto" por línea; solo comunas con coordenadas conocidas), `minimo_delivery`, `tiempos` ("Plato: minutos"), `opciones_platos` ("Plato: Grupo (obligatorio, hasta N): Opción +extra, …; otro grupo"), `equipo` ("Nombre - cocina/reparto"), `pago_online`. Si el cliente lo escribió en otro formato, **corrígelo tú en el archivo de respuestas antes de aplicar** (no inventes). |
| 5. Cómo se ve | Se traduce a un estilo (sección 3). |
| 6. Fotos de los platos | `fotos_tengo` + `fotos_visita` + `visita_dias` → plan de visita para fotografiar. (El 3D está postergado: no se ofrece.) |
| 7. Tu marca | Logo, nombre de la carta, `frase` → `lema`, `bienvenida` → texto de la portada. |
| 8. El QR y tu local | Cantidad y soporte de los QR (se presupuesta aparte lo que no sea digital). |
| 9. Publicación y números | Dominio, analítica (sí → Cloudflare Web Analytics), Maps. Recordar el costo anual del dominio. |
| 10. Plazos y decisión | Quién aprueba, fecha, y el acuerdo de que los cambios los hace Bío Digital. |

## 3. De las seis escalas a un estilo
Cada escala va de 1 a 5 (1 = lado izquierdo). Suma las respuestas y busca el patrón dominante; no promedies a ciegas.

| Escalas | Pista | Estilo sugerido |
|---|---|---|
| `e_clasico` bajo, `e_elegante` bajo, `e_calido` bajo | clásico, rústico, cálido | **café y dorado** (`cafe`) |
| `e_calido` alto, `e_detalle` bajo, `e_sobrio` bajo | luminoso, simple, tranquilo | **crema y cobre** (`crema`) |
| `e_elegante` alto, `e_sobrio` bajo, `e_divertido` bajo | refinado y serio | **noche y oro** (`nocturno`) |
| `e_clasico` alto, `e_calido` alto, `e_divertido` alto | fresco, europeo, relajado | **bistró vino** (`bistro`) |
| el cliente nombra verde, natural, saludable, vegetariano | natural | **jardín** (`jardin`) |

Otras respuestas:
- `colores`: si pide los de su logo, usa `tema.c1` y `tema.c2` con esos colores (verifica contraste ≥ 4,5:1).
- `modo`: "cambie según el celular" → `tema.auto` (recomendado); "siempre oscura/clara" → estilo fijo y se avisa que pierde la adaptación.
- `letra`: clásica → Playfair Display; elegante y fina → Cormorant Garamond; moderna → Inter o DM Sans con títulos Fraunces.
- `referencias` + `que_gusta` + `no_parecer`: **mandan** sobre la tabla. Si dos escalas se contradicen con las referencias, gana lo que él mostró.
- `tres_palabras`: sirven de prueba. "Familiar, de campo, casero" y un estilo `nocturno` no calzan: pregunta.

## 4. Lo que más decide el resultado
- **`carta_envio`**: un plato por línea con precio. Si llega como foto o PDF, pasa los datos tal cual; **no corrijas ortografía de nombres de platos ni cambies precios**. Dudas → se le preguntan.
- **`estrella`**: qué se destaca (3 a 6 platos): salen como "Favoritos de la casa".
- **Fotos**: la calidad de la foto decide más que el estilo. Sin fotos buenas, sube la prioridad de la visita.

## 5. Señales de alerta
- Carta con **más de 60 platos** y mucho cambio diario: la mantención por nuestra parte se vuelve costosa; conversar el precio de los cambios antes de aceptar.
- Pide etiquetas dietéticas "por si acaso" sin confirmarlas: no se ponen.
- Escalas todas en 3: no decidió; llámalo o muéstrale las opciones de estilo.
- No responde `decide`: pregunta quién aprueba **antes** de mostrar nada.

## 6. Después del formulario
1. Resume en 10 líneas lo que entendiste y pide confirmación.
2. Guarda las respuestas en un archivo y corre `node web/herramientas/aplicar-formulario.mjs respuestas.json` (sistema con pedidos) o, para carta simple, pasa los datos a `menu.json` y arma los estilos (`--opciones`).
3. Agenda la visita de fotos y resuelve la lista de pendientes que deja la herramienta.
4. Registra en `memoria/decisiones.md`: cliente, estilo y pendientes.
