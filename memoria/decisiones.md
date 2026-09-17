# Registro de decisiones

Bitácora cronológica. Cada entrada: fecha, decisión, por qué, qué queda pendiente.

## 2026-09-16 — No comprar la suscripción de Imperio Agéntico por ahora

**Decisión:** el equipo usó la semana de prueba gratuita de Imperio Agéntico para evaluar herramientas concretas (agente de WhatsApp, agente de voz para llamadas) sin comprometer los 59 USD/mes (~$57.000 CLP). Cada integrante dedicó una semana a evaluar. Resultado: no se compra por ahora; se están evaluando otras opciones de menor costo.

**Por qué:** esa suscripción representaba el 71% del presupuesto total declarado ($80.000 CLP) calculado como si fuera costo único, cuando en realidad es mensual — sobre 3 meses de proyecto el costo real habría sido ~$171.000, más del doble del presupuesto. Ver detalle en [riesgos-criticos.md](riesgos-criticos.md), riesgo #1.

**Pendiente:** definir con qué stack se construyen el bot de WhatsApp y (si se retoma) el agente de voz si no es con Imperio Agéntico — opciones evaluadas en [servicios-vendibles.md](servicios-vendibles.md) (Manychat, Landbot, n8n + API oficial de Meta, Vapi/Retell/Synthflow).

## 2026-09-17 — Mascota animada como módulo opcional de la skill `crear-sitio-web`

**Cambios en el proyecto:**
- El motor quedó separado de la marca:
  - `mascota.js` es genérico;
  - `mascota-personajes.js` (nuevo) guarda los personajes, las frases, la dirección de la mirada, las secciones y los selectores de Bío Digital.
- Las 7 páginas cargan primero el archivo de personajes y luego el motor. Se verificaron sin errores.
- El motor ahora admite **animaciones cuadro a cuadro** (`animaciones: { nombre: { cuadros, ms, vueltas, final } }`, con archivos `nombre-1…n`). Se probó la secuencia completa con cuadros de prueba.
- API pública: `window.Mascota`. Se mantiene `bdMascota` como alias.

**Cambios en la skill** (`~/.claude/skills/crear-sitio-web/`):
- `plantilla/mascota/` trae el motor, los estilos, un archivo de personajes de ejemplo sin datos de Bío (dos personalidades de muestra) y `herramientas/recortar-hoja.py` con `recorte.ejemplo.json`. El recortador genérico se probó con la hoja del proyecto: 24 recortes limpios.
- `referencias/mascota.md` describe el proceso completo:
  - preguntas, empezando por si el cliente quiere mascota (es opcional);
  - cómo pedir o generar las hojas, con un prompt de ejemplo, y cómo extraer imágenes pegadas en el chat;
  - recorte, dirección de la mirada, personalidades y eventos;
  - integración por estética y verificación.
- `SKILL.md` agrega la pregunta 6 y la "Fase 1a — Mascota". `preguntas.md` agrega la sección 6.
- Si un cliente necesita un personaje específico, el usuario puede crear la imagen y enviarla.

## 2026-09-17 — Mascotas en las 7 opciones, con personalidad y giros

El equipo aprobó la prueba de la opción 5 y pidió extenderla a todas las páginas.

**Integración visual por estética:**
- La mascota ya está en las opciones 1 a 7.
- En las opciones 3–7 va en la plantilla común (`fuentes/comun.mjs`) y cada estética tiene su bloque `mascota:` con variables.
- En las opciones 1 y 2 se agregó a mano en el HTML.

| Opción | Globo | Contorno del personaje |
|---|---|---|
| 1 | Vidrio | Celeste |
| 2 | Papel con doble marco | Verde |
| 3 | Vidrio oscuro | Cromado |
| 4 | Facetado | Crema, con tinte cálido |
| 5 | Terminal | Sin contorno |
| 6 | Tarjeta con filo naranjo | Naranjo |
| 7 | Tarjeta | Cobre |

**Giros:**
- Se registró hacia dónde mira cada dibujo:
  - conejo: a la derecha;
  - pingüino: a la izquierda;
  - gato y panda: casi siempre de frente.
- `mascota.js` voltea el dibujo en espejo con una animación de giro de 340 ms.
- Cuándo se da vuelta:
  - mira hacia lo que señala el mouse;
  - se da vuelta si el mouse pasa por su izquierda;
  - mira alrededor cuando no pasa nada;
  - **le da la espalda al campo** cuando se escribe el correo o el teléfono.

**Personalidades (frases y caras propias, con tuteo salvo el pingüino):**

| Animal | Carácter | Si te vas… |
|---|---|---|
| Gato | Sarcástico | Se ríe de ti |
| Panda | Tierno y dormilón (se duerme a los 18 s) | Se pone triste |
| Conejo | Hiperactivo; disfruta el scroll rápido | Se enoja |
| Pingüino | Formal, trata de "usted" | Le da la espalda, "no se ofende" |

- Cada uno se presenta al elegirlo.

**Situaciones nuevas:**
- saludo según la hora;
- llegar al final de la página o volver al inicio;
- mouse sobre el precio;
- asentir mientras escribes;
- comentario al escribir un texto largo;
- varios toques seguidos;
- seleccionar o copiar texto;
- achicar la ventana;
- despertar después de dormirse;
- el título de la pestaña cambia cuando te vas a otra pestaña;
- avanzar desde el campo en píldora (opción 7).

**Envío de formularios:** se detecta con cualquier formulario que tenga `role="status"`.

**Verificación:**
- Las 7 páginas cargan sin errores.
- Cada una toma su letra y sus esquinas.
- Las opciones 1 y 5 no se desbordan a 375 px.
- Al enfocar el correo, el gato se voltea (`--dir: -1`).

**Pendientes:**
- Probar la sensación en un celular real.
- Las frases son borradores: el equipo puede ajustarlas en `PERSONAS`, dentro de `mascota.js`.

## 2026-09-17 — Mascotas animadas como sello de la marca (prueba en la opción 5)

**Personajes y recortes:**
- Personajes: gato, panda, conejo y pingüino. El lagarto y el pato se descartaron.
- 12 reacciones por animal (48 en total): feliz, negación, triste, enojado, sorprendido, soberbio, pensativo, afirmando, miedo, guiño, cansado y muy feliz.
- Salen de la hoja de reacciones que mandó el equipo (`web/propuesta/mascotas/fuente/`).
- Se recortan con `recortar.py` (grilla fija más filtro de rótulos) y quedan en `mascotas/<animal>/<reaccion>.webp`, de ~16 KB cada una: relleno blanco y un borde que se ve bien en modo claro y oscuro.

**Motor (`mascota.js` + `mascota.css`):**
- Es independiente de la estética y está integrado solo en `opcion-5-ascii.html`.
- **Posición:**
  - fija abajo a la izquierda;
  - en celular, dentro de la barra de botones.
- **Controles:**
  - botón para cambiar de personaje (la elección se guarda) y para esconderlo;
  - en pantallas táctiles, los controles aparecen al tocar.

**Reacciones:**

| Momento | Reacción |
|---|---|
| Al llegar | sorprendido → feliz, con saludo |
| Bajando / subiendo con el scroll | pensativo / soberbio |
| Scroll muy rápido | miedo |
| Al entrar a cada sección | una cara y un comentario, una sola vez |
| Mouse sobre el botón principal | guiño |
| Mouse sobre el plan recomendado | muy feliz |
| Se abre una pregunta frecuente | afirmando |
| Cambio de tema | sorprendido |
| Campo de correo o teléfono | negación ("no miro") |
| Dato mal escrito o envío incompleto | enojado, con sacudida |
| Envío correcto | muy feliz dos veces seguidas |
| Casilla del beneficio | muy feliz |
| Mouse sale por arriba | triste |
| 35 s sin actividad | cansado |
| Vuelve a la pestaña | sorprendido |

- **Otras páginas (login, pagos):** API `bdMascota.reaccionar(...)` y eventos `mascota` con `login-ok`, `login-error`, `error`, `enviado` y `copiado`.
- Con movimiento reducido, las caras cambian sin movimiento.

**Verificación:**
- Reacciones del formulario, tema, login y cambio de animal comprobadas por script en el navegador.
- Sin desborde a 375 px.

**Pendientes:**
- Probar la sensación en un celular real.
- Si el equipo lo aprueba:
  - adaptar los colores a las otras estéticas con las variables `--m-ink`, `--m-paper` y `--m-font`;
  - agregar la mascota a la skill `crear-sitio-web` como pieza opcional.
- **Riesgo:** la hoja de reacciones es una imagen generada; si la marca se registra, conviene redibujar los personajes en vectores con derechos claros.

## 2026-09-17 — Skill `crear-sitio-web` y ajuste de espaciado

**Skill `crear-sitio-web`:**
- Está en `~/.claude/skills/crear-sitio-web/`, a nivel de usuario, para poder usarla en proyectos de clientes fuera de esta carpeta.
- Generaliza el brief del sitio (secciones 0–11) sin datos de Bío Digital.
- **`SKILL.md`** define el flujo por fases.
- **`referencias/`** contiene:
  - `preguntas.md`: preguntas obligatorias antes de construir;
  - `requisitos.md`: tecnología, SEO, UX, seguridad, analítica y checklist;
  - `esteticas.md`: las 7 estéticas y cuándo sugerir cada una;
  - `recursos.md`: repos de GitHub, bibliotecas, sitios de inspiración y servicios, con su veredicto;
  - `animaciones.md` y `verificacion.md`: incluyen los errores que ya ocurrieron.
- **`plantilla/`** es un generador genérico: el contenido va en `contenido.mjs` y las 5 estéticas se generan con `node fuentes/generar.mjs`.
- **Probada** con contenido de ejemplo: las 5 opciones se generan sin desborde a 390 px, y los `[PENDIENTE]` se ven como "por confirmar".

**Espaciado de las opciones 3–7:**
- Se redujo el espacio entre secciones en `kit.css`: de `clamp(64px, 9vw, 120px)` a `clamp(28px, 3.6vw, 52px)` por lado, con encabezados más cerca de su contenido.
- La grilla del hero en móvil ahora usa `minmax(0, 1fr)` en las opciones 4 y 5.

## 2026-09-17 — Sitio: siete estéticas para elegir, a partir de las referencias del equipo

**Qué se hizo:**
- **Cambio de tema con burbuja** (`mundo.js`): el tema nuevo crece como un círculo desde el botón, usando la View Transitions API. Si el navegador no la soporta, el cambio es instantáneo; con movimiento reducido, se funde. En rendimiento cuesta una captura de pantalla y una animación de `clip-path` en el compositor, aceptable en celulares de gama media.
- **Maquetas A–D borradas:** se enviaron a la Papelera de Windows, así que se pueden recuperar. Queda `maqueta-final.html` como opción 1.
- **Opción 2 (Certificado):** aprobada por el equipo sin cambios de forma. Solo cambian los colores: fondo blanco y modo noche negro.
- **Corrección:** los primeros briefs de las opciones 3 a 5 (letrero LED, código de barras, startup) salieron del proceso de Impeccable y no de los links del equipo. El equipo lo detectó; los briefs se enviaron a la Papelera.
- **Opciones rehechas según los links del equipo:**

  | Opción | Archivo | Referencia |
  |---|---|---|
  | 3 | `opcion-3-metal.html` | Liquid Metal Hero (21st.dev/@chowlol202), con `@paper-design/shaders` 0.0.80 desde jsDelivr |
  | 4 | `opcion-4-cristal.html` | Crystal Shader (@dhileepkumargm), con un shader WebGL propio |
  | 5 | `opcion-5-ascii.html` | Hero ASCII One (@larsen66); un local con el pin de Maps, dibujado en puntos |
  | 6 | `opcion-6-panel.html` | SaaS Template (@waleedkibhen) |
  | 7 | `opcion-7-foco.html` | Paymark (Lovable), la más sobria |

- **Aether Flow** (el cuarto link) no se usó porque el equipo no lo nombró.
- **Cómo se generan las opciones 3–7:** con `web/propuesta/fuentes/generar.mjs` (`node fuentes/generar.mjs`). El contenido común está en `fuentes/comun.mjs`, la estructura en `kit.css` y cada estética en `fuentes/opcion-N.mjs`. **Para cambiar un texto de todas las opciones, se edita `comun.mjs` y se regenera; no se editan los HTML a mano.**
- **Datos en los paneles de ejemplo:** solo muestran datos reales de la oferta (entregables, puntajes máximos, plazos, precios) y van rotulados como "Ejemplo ilustrativo". No se inventaron métricas.
- **Verificación:**
  - Todas las opciones pasaron a 1440 px y a 390 px, sin desborde horizontal, sin errores de consola y sin texto bajo 12 px.
  - En el detector de Impeccable quedan dos avisos a propósito en la opción 6: texto con degradado y resplandor naranjo, que vienen de la referencia.

**Pendiente:** que el equipo elija una estética (o una combinación). Después, pasar el revisor final de Impeccable y escribir DESIGN.md sobre la opción elegida.

## 2026-09-17 — Skills de diseño y Figma MCP evaluados

| Herramienta | Veredicto | Por qué |
|---|---|---|
| `emilkowalski/skills` (MIT) | **Instalado en parte** (aprobado por el equipo el 17-sep) | Especializado en animación, que es lo que pidió el equipo. De sus 13 skills solo se instalaron 4 en `.claude/skills/`: `review-animations`, `improve-animations`, `apple-design` y `emil-design-eng`. El resto es para Swift, Expo o Sonner. Se copiaron a mano desde el commit `85e8e23` con su LICENSE, en vez de usar `npx skills add`. Se leyeron completas antes de instalar: solo traen instrucciones, sin scripts. |
| `leonxlnx/taste-skill` / tasteskill.dev (MIT, gratis) | **No por ahora** | Resuelve lo mismo que Impeccable, que ya está configurado con PRODUCT.md. Tener dos skills que deciden la dirección visual genera reglas contradictorias. Queda como referencia para la futura skill de sitios de clientes. |
| Figma MCP | **Descartado por ahora** | El equipo eligió trabajar directo en código. En plan Starter permite solo 6 llamadas al mes; las 200 diarias requieren un asiento Dev o Full en un plan pagado, que es un costo **recurrente**. Por verificar: si el plan Education de Figma cambia estos límites. |

## 2026-09-17 — Maqueta final: mezcla de las cuatro opciones

**Decisión del equipo:** no elegir una sola opción, sino combinarlas. La maqueta está en `web/propuesta/maqueta-final.html` y aparece destacada en `index.html`.

**Composición, en orden:**
1. Inicio: texto de A y pantalla de *widgets* de B.
2. "En 30 segundos" y "Todo lo que tu negocio necesita", ambas de A.
3. "Cada widget es algo que te entregamos", de B.
4. Informe con anillo "de 100 revisados", de C.
5. "Así te vamos avisando", de B. Reemplaza "Cómo trabajamos" de A.
6. Planes en formato A, con la franja "Todo a tu nombre / Vamos a tu local / Te enseñamos / Sabes cuánto pagas" que venía de la v1.
7. Beneficio de lanzamiento: diseño de A y D (eran idénticos), texto de A con los cupos y regalo animado.
8. Formulario de C, que ahora:
   - valida los campos obligatorios;
   - trae una casilla del beneficio, que se marca sola al pulsar "Quiero participar";
   - muestra el correo como alternativa.
9. Preguntas frecuentes en formato C: las 11 de todas las opciones, sin repetir y con apertura animada.
10. Cierre de A, con el correo.

**Animación:**
- Cada sección tiene un movimiento propio: los *widgets* se arman, las notificaciones caen, los planes se marcan, el regalo se abre, el anillo suma puntos y las preguntas se despliegan.
- El movimiento al pasar el mouse se desactiva si la persona pide reducir el movimiento.
- `mundo.css` y `mundo.js` ahora hacen aparecer el contenido al entrar en pantalla (antes la aparición dependía de la posición del scroll) y animan las preguntas. Esto también afecta a las opciones A a D.

**Textos ajustados** para no repetir las mismas frases:
- Tarjetas de servicios: hablan del beneficio.
- Lista de entregables: dice qué recibes y en qué plan viene.
- Pendiente: pasar estos cambios a `textos.md` cuando se apruebe la maqueta.

**Verificación:**
- Detector de Impeccable: solo queda el aviso del fondo aurora, que es intencional.
- Sin desborde horizontal en 1440 px ni en 390 px.
- En celular, las filas de *widgets* crecen para no cortar contenido.

**Observación:**
- La página nombra los cinco servicios en cuatro bloques: resumen, tarjetas, lista y planes.
- Mide unas 9 pantallas en escritorio (8.000 px).
- Si hay que acortar, conviene fusionar las tarjetas con la lista y quedarse con la lista, que además dice en qué plan viene cada servicio.

**Revisión de animaciones** con `review-animations`, ya aplicada:
- **Fondo aurora:** la curva de salida fuerte en un bucle de ida y vuelta daba un tirón en cada cambio de sentido. Ahora usa una curva de vaivén suave.
- **Reflejo del mouse:** las variables `--mx`, `--my`, `--rx`, `--ry` y `--p` se heredaban a todo el contenido de cada panel. Ahora no se heredan, y el reflejo sigue al mouse con una transición de 0,35 s.
- **Botones:** al presionar reaccionan en 160 ms con escala 0,97 (los redondos, 0,95).
- **Mouse y pantallas táctiles:** el movimiento al pasar el mouse ahora solo ocurre con mouse o trackpad.
- **Tiempos:**
  - movimiento al pasar el mouse: de 450–600 ms a 350 ms;
  - escalonados: dentro de 60–80 ms;
  - aparición al hacer scroll: 700 ms y 18 px;
  - preguntas frecuentes: abren en 360 ms y cierran en 240 ms, con curva tipo iOS.
- **Pin del mapa:** pulsa 3 veces y se detiene (antes era un bucle infinito).
- **Agregado:**
  - fundido al cambiar entre modo claro y oscuro;
  - el menú del celular se despliega;
  - "volver arriba" aparece con desplazamiento;
  - respuesta al presionar las tarjetas;
  - el indicador de carga sigue girando con movimiento reducido.
- **Se mantiene a propósito:**
  - la altura animada de las preguntas, porque es la única forma de empujar suavemente el contenido de abajo;
  - las notificaciones escalonadas cada 130 ms, porque explican el proceso paso a paso.
- **Detector de Impeccable:** las 6 páginas solo tienen el aviso del fondo aurora.
- **Falta:** revisar la sensación de las animaciones con la vista, porque el panel del navegador estuvo oculto durante la verificación.

**Pendiente:** aprobación del equipo. Después vienen el `DESIGN.md` y la construcción en Astro.

## 2026-09-16 — Maquetas del sitio: cuatro opciones e Impeccable instalado

- **Impeccable** quedó instalado en el proyecto (`.claude/skills/impeccable`, sin hooks), con aprobación del equipo. Contexto de producto en `PRODUCT.md`; método "código directo" en `.impeccable/config.json`; contratos de dirección de B, C y D en `.impeccable/surfaces/`.
- **Stack confirmado para el sitio final:** Astro. Objetivo principal del inicio: pedir el diagnóstico gratis.
- **Maquetas** en `web/propuesta/`, en `http://localhost:4321` con el servidor `maquetas` de `.claude/launch.json`:
  - `opcion-a.html`: composición de la referencia, con aurora y vidrio nuevos. El error visual de "cupos" se reemplazó por "Cupos limitados a los primeros 5 clientes".
  - `opcion-b.html`: pantalla de inicio con widgets.
  - `opcion-c.html`: la página como informe de diagnóstico.
  - `opcion-d.html`: recorrido de la visita al acta.
  - La versión 1 original quedó en `archivo/opcion-a-v1.html`. El estilo compartido está en `mundo.css` y `mundo.js`, y el índice para el equipo en `index.html`.
- **Modo oscuro por defecto** en las maquetas, porque la referencia es oscura (el brief original pedía seguir al sistema). **Decisión pendiente para el sitio final.**
- **Detector de Impeccable:** de 44 avisos quedan 5, todos del fondo aurora, que el equipo pidió explícitamente.
- **Pendiente:** el equipo elige una opción. Después vienen la revisión final de Impeccable y el `DESIGN.md` de la opción elegida, que aún no se han hecho.
- **Dominio: descartado por ahora** (decisión del equipo).

## 2026-09-16 — Sitio web: repositorios de GitHub evaluados

| Repositorio | Veredicto | Por qué |
|---|---|---|
| `pbakaus/impeccable` | **Recomendado** (instalar con aprobación del equipo) | Skill de diseño para Claude Code (Apache 2.0) con 24 comandos (`critique`, `audit`, `polish`, `harden`…) y reglas que detectan patrones típicos de interfaces hechas con IA. Ataca directamente el objetivo de que el sitio no parezca hecho con IA. Se usaría para criticar la maqueta antes de construir. |
| `microsoft/playwright-cli` | **Sí, en la fase 2** | CLI de Playwright para agentes (Apache 2.0), más liviano en contexto que el servidor MCP e instalable como skill. Sirve para automatizar la verificación del checklist final. Por ahora basta el navegador integrado. |
| `voltagent/awesome-design-md` | **Idea sí, archivos no** | Colección de archivos DESIGN.md extraídos de sitios de marcas. Copiar uno haría que el sitio se pareciera a otra marca. Se adopta el **formato**: un `DESIGN.md` propio de Bío Digital, que además sirve de base para cada sitio de cliente. |
| `img2threejs/img2threejs` | **Descartado** | Convierte imágenes en modelos 3D con three.js (orientado a objetos y personajes). Pesa mucho para celulares y no aporta a un sitio de servicios. |

## 2026-09-16 — Sitio web: datos del negocio definidos por el equipo

- **Hosting:** Cloudflare (resuelve la objeción a Vercel).
- **Contacto:** `biodigitalici@gmail.com`. **Sin teléfono, WhatsApp ni redes por ahora**, así que los botones de llamada/WhatsApp quedan marcados como pendientes y el canal principal es el formulario.
- **Horario:** 24/7 (modificable). Propuesta para el texto del sitio: "recibimos solicitudes 24/7 y respondemos en menos de 24 horas". **El tiempo de respuesta sigue sin confirmar.**
- **Precios:** los del PRD (Base $150.000 / Estándar $250.000 / Premium $380.000), mostrados como "desde".
  - Ajuste propuesto: no subir precios, porque el margen extra de cada nivel ya es bueno (~$10.800-11.300 por hora adicional; el promedio por hora baja por el costo de adquisición, no por el precio).
  - En cambio, un **beneficio de lanzamiento para los primeros 5 clientes** (soporte al doble) a cambio de autorizar la publicación de su caso y su reseña. Resuelve la falta de prueba social sin inventar nada.
  - Sin "precio normal" tachado: sería un precio de referencia ficticio.
- **Presentación:** startup de un grupo de estudiantes de la UdeC. Se menciona la universidad en el texto, sin usar su logo (requiere autorización).
- **Fotos del equipo:** se agregan más adelante; mientras tanto, marcador pendiente y sin fotos de banco.
- **Cobertura:** todo Chile, con foco en el Gran Concepción. Matiz: la fotografía y la capacitación presencial solo se pueden hacer en el Gran Concepción; el resto se hace en forma remota.
- **Identidad visual:** estilo iOS 26 "Liquid Glass" (paneles translúcidos). La imagen de referencia ("Nexora") vale solo por el estilo, no por su contenido. Tipografía del sistema (en Apple se ve SF Pro sin descargar nada).
- **Pendientes:** dominio (cuál y quién lo compra antes del ~30-sep), número de WhatsApp Business antes de la Jornada 1 y tiempo de respuesta.

## 2026-09-16 — Sitio web: bibliotecas de interfaz y hosting

**Bibliotecas evaluadas** (a pedido del equipo):
- **GSAP** (gsap.com): se usa solo si CSS no alcanza. Es gratis para uso comercial, con todos sus plugins, desde la versión 3.13. La licencia solo prohíbe usarlo en herramientas no-code que compitan con Webflow, lo que no afecta a sitios para clientes. Funciona sin React.
- **React Bits** (reactbits.dev): **no se instala**; se usa solo como fuente de ideas. Requiere React y varios componentes arrastran three.js, ogl o motion, lo que pesa en celulares de gama media. Su licencia es MIT + Commons Clause. Juicio propio: sus efectos son muy reconocibles en sitios hechos con IA, lo contrario de lo que se busca. Si el equipo elige un efecto puntual, se recrea en CSS/GSAP.
- **Cult UI** (cult-ui.com): **descartado** para el sitio. Exige React + Tailwind + shadcn + Motion, y está orientado a apps en Next.js.

**Hosting (pendiente de decisión):** el equipo propuso Vercel con la URL gratuita y comprar el dominio después. La objeción quedó registrada: el plan Hobby de Vercel es "non-commercial, personal use only" (docs de Vercel, 31-ago-2026), y el plan Pro cuesta 20 USD por usuario al mes, un costo **recurrente**. Cloudflare permite uso comercial gratis. Comprar el dominio después es correcto, **pero antes de imprimir los diagnósticos con QR** (~30-sep), para que los QR impresos apunten a la URL definitiva.

## 2026-09-16 — PRD v0.2: calendario, equipo y cobro

- **Término del semestre:** diciembre de 2026 (fecha exacta por confirmar). Se mantiene la meta de transferir al 27-nov; el límite duro es el 4-dic y lo que queda de diciembre es holgura y cierre.
- **Organización:** trabajo repartido en partes iguales y todos participan en todo. **Christhoper es el jefe de proyecto.** Regla agregada: un responsable único por tarea y por cliente cada semana, más un registro de horas por integrante. Objeción registrada: "todos hacen todo" diluye la responsabilidad y es lo primero que revisa el evaluador.
- **Cobro:** se formaliza con boleta. Falta elegir entre boleta de honorarios (persona natural con inicio de actividades en segunda categoría) y empresa. Recomendación: honorarios con emisor rotativo por cliente este semestre, y empresa solo si el negocio continúa después del ramo.
- **PRD:** se mantiene como documento interno; **no se comparte todavía**.

## 2026-09-16 — Definiciones para el PRD v0.1

- **Alcance del PRD:** dos capas. El servicio que compra el cliente y Radar (nombre tentativo), la herramienta interna de prospección, scoring y diagnóstico.
- **Jornada de Terreno del 11-sep:** no se hizo. Se propone el viernes 2-oct-2026 como Jornada 1 (el 18-sep es feriado y el 25-sep deja muy poco tiempo para preparar) y una Jornada 2 el viernes 16-oct si el embudo lo exige. **Pendiente de confirmar por el equipo.**
- **Agente de WhatsApp:** fuera del MVP; solo como upsell del Premium, después de un piloto interno de 2 semanas y usando únicamente la API oficial.
- **Stack de Radar:** Python 3.12 + Streamlit + SQLite + fpdf2. Los datos reales de prospectos quedan fuera del repositorio (`data/` en `.gitignore`).

**Pendiente:** las preguntas abiertas del §14 de [PRD.md](../PRD.md), en especial la fecha de término del semestre, los roles y el mecanismo tributario.

## 2026-09-16 — Repositorio Git inicializado

Se creó el repositorio en `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP` para versionar el trabajo del proyecto Bío Digital, independiente del repositorio académico general del usuario.
