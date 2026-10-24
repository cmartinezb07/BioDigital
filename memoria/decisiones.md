# Registro de decisiones

Bitácora cronológica. Cada entrada: fecha, decisión, por qué, qué queda pendiente.

## 2026-10-24 — Preparar publicación comercial con catálogo completo y enlaces

El usuario pidió retirar el producto de $100 y preparar el catálogo completo
para publicar en main con enlaces de Mercado Pago. Confirmó mantener cotización
previa en los servicios “desde”. Aún no tiene los enlaces; se preparó una guía
con los 9 enlaces fijos necesarios y sus importes en `PUBLICACION-COMERCIAL.md`.
El ensayo de $100 terminó rechazado y no se considera validación exitosa.

Se retiraron producto, URL y controles de ensayo del sitio y catálogo API.
Se añadió configuración por SKU en `fuentes/enlaces-pago.mjs` y comprobación
`scripts/verificar-enlaces-pago.mjs --exigir-completos`. El pago directo solo se
ofrece para un producto de precio cerrado con enlace y monto coincidentes.
Carritos combinados y servicios variables pasan por confirmar/cotizar y recibir
un enlace por el total acordado. No se confirma automáticamente en el sitio.
Se incorporó el pack de lanzamiento al catálogo del carrito y se actualizaron
los términos para describir el flujo manual. Los 14 SKU API siguen apagados.

Se creó la rama `feat/pagos-comerciales-por-enlace`. Al hacer fetch, origin/main
tenía 4 commits nuevos; se incorporaron por fast-forward hasta 9b43f8f y se
reaplicaron los cambios locales sin conflictos. Se conservaron los ejemplos,
reservas y páginas de información nuevos. Hay respaldo de los cambios previos
en el stash `cbfb5a7fb7c020664eb81f543fecfee3c9e73114`.

37 casos locales pasan y el catálogo generado coincide con los 14 productos.
La comprobación estricta falla como corresponde por los 9 enlaces faltantes.
Publicado solo Preview `payments-test`, despliegue `cd511377`.
La preparación se guarda en un commit local; no se hizo push, fusión en main
ni publicación de Production.
Pendiente: crear/configurar/verificar enlaces y validar un cobro aprobado;
después revisión, PR a main y despliegue del commit aprobado.

## 2026-10-24 — Operación real de $100 finalmente rechazada

La nueva captura del usuario confirma rechazo de la operación 185920933158
por $100 CLP: “Biodigital no recibió tu pago”. Es la misma operación antes
en revisión/en proceso. No se acreditó el ensayo ni se considera validado
el cobro real. La captura no informa el motivo técnico del rechazo; no atribuirlo
a CuentaRUT, al monto ni a la página sin el detalle de Mercado Pago.
Pendiente: consultar detalle/motivo de la operación y comprobar si hubo un
débito o retención en el banco del comprador antes de otro intento.
No se realizó otro cobro ni se habilitaron productos adicionales.

## 2026-10-24 — Venta de $100 visible en cuenta receptora, aún en proceso

El usuario indicó que pagó usando CuentaRUT de BancoEstado y compartió la
actividad de la cuenta receptora: venta “Biodigitalprueba”, operación
185920933158, +$100, estado **En proceso**. Se confirma la recepción del intento
por el vendedor; no se confirma aprobación ni disponibilidad del dinero.
No repetir el pago ni registrar el ensayo como acreditado hasta ver aprobado.

El usuario consulta extender los enlaces al catálogo. Es viable por producto
de precio cerrado con un enlace fijo por importe. Los servicios “desde” y
las compras combinadas requieren cotizar/confirmar el total y generar un enlace
por pedido, o terminar la integración API. No se habilitaron otros cobros.

## 2026-10-24 — Intento de cobro real queda en revisión

El usuario compartió el resultado de Mercado Pago: “Estamos revisando tu pago”
y aviso de respuesta por correo dentro de las próximas 24 horas. El intento
no está acreditado ni se considera una prueba exitosa todavía. La captura no
incluye importe ni ID de operación; deben comprobarse en Actividad del comprador
y del receptor. Se indicó no repetir el pago mientras siga en revisión para
evitar duplicados. No se inició otro cobro ni se modificó el estado en D1/panel.

## 2026-10-24 — Prueba de cobro real por $100 con enlace nuevo

El usuario pidió probar con dinero real por **$100 CLP** al no poder acceder
a credenciales de prueba. Autorizó agregar un producto al catálogo y entregó
el enlace `https://mpago.la/2JmNHED`, generado para ese cobro fijo.
La consulta automática recibió 403; no se verificó el monto externo ni se pagó.
Se indica comprobar $100 en Mercado Pago antes de confirmar.

Se añadió `payment-test-100` como producto separado, fuera de los seis servicios
y del cálculo del pack. Se paga solo, mediante el enlace; si se mezcla con otro
producto, se bloquea la salida a pago y se pide quitar los demás.
Los 15 SKU de la API (14 anteriores y este producto) y `PAYMENTS_ENABLED`
siguen apagados: este ensayo usa el enlace real, sin credenciales ni cobros API.
37 pruebas locales pasan, incluidas exclusiones de monto/enlace/carrito.

Resultado esperado: Mercado Pago muestra $100, el comprador autoriza un cobro
real y ve el resultado/ID de operación; el receptor verifica el pago y su neto
tras comisiones en el portal. No hay conciliación automática en D1 ni cambio
automático del panel o retorno garantizado al sitio por este enlace manual.
El usuario realizará la compra; no se ejecutó una transacción desde las herramientas.

## 2026-10-24 — Captura corrige el tipo de enlace: monto abierto y pago real

La captura aportada por el usuario muestra “Ingresa el monto a pagar” y $0.
El enlace `link.mercadopago.cl/biodigital` es de monto abierto; no fija $79.990
y no es una simulación. Esto corrige la confirmación textual anterior y la
interpretación usada al incorporarlo. Se explicó que abrir el enlace no cobra,
pero completar un pago sí mueve dinero real. El entorno Preview del sitio no
convierte un enlace externo de cobro en un entorno de pruebas.

Se deshabilitó `PACK_PAYMENT.enabled` y se retiró el enlace del HTML generado.
El carrito vuelve a la solicitud/cotización sin permitir pagar el pack mediante
ese enlace. El checkout automático y los 14 SKU permanecen apagados.
36 pruebas pasan, incluyendo ausencia del enlace del carrito. Falta configurar
usuarios/credenciales de prueba para ensayar sin dinero real. Un futuro enlace
de monto fijo servirá para cobros reales, no para una simulación.

## 2026-10-24 — Enlace del Pack completo recibido

El usuario entregó `https://link.mercadopago.cl/biodigital` y confirmó que
muestra **$79.990 fijos**. La consulta automática de Mercado Pago recibió 403;
el monto fijo se toma de esa confirmación del usuario, no de una inspección propia.
Se conectó el enlace al carrito exclusivamente para `full-pack`, sin otros
productos, y solo mientras el catálogo conserva $79.990. No se usa para el pack
de lanzamiento ni combinaciones. Abre otra pestaña y la verificación del pago
se hace en el portal del vendedor; no crea órdenes D1 ni activa Checkout Pro.
Se mantuvieron 36 pruebas pasando, con casos del enlace y sus exclusiones.
No se realizó un pago ni se envió el enlace a ningún cliente.

## 2026-10-24 — Cobro por enlace y corrección de Checkout Pro

El usuario autorizó preparar cobros por enlace para las primeras ventas y
corregir Checkout Pro en paralelo. Eligió como primer enlace el **Pack completo
de $79.990 CLP**. Los datos y mensaje están en `COBROS-POR-ENLACE.md`.
No se creó todavía el enlace real: debe generarse desde la cuenta receptora.
No se envió ningún mensaje al cliente ni se inició un cobro.

La documentación oficial consultada confirma Preferences API para Checkout Pro.
El código local pasa de `/v1/orders` a `/checkout/preferences` e `init_point`;
los webhooks pasan al evento `payment`. La conciliación verifica la orden
comercial, su preferencia y todos sus pagos antes de acreditar el total.
La migración `0003_checkout_preferences.sql` añade el ID de preferencia y un
límite atómico de conciliación. Bloqueo D1 para crear una preferencia por pedido;
fallos ambiguos requieren revisión para evitar crear otra por accidente.

Validación local: 36 pruebas pasan (incluyen SQL real en SQLite para el
repositorio D1, pagos combinados, reembolsos, fallos ambiguos y doble clic),
y pasa el validador de Checkout Pro del plugin. Son pruebas con API simulada;
no prueban credenciales ni una transacción contra Mercado Pago.

`PAYMENTS_ENABLED=false` y los 14 SKU siguen apagados. No se cambiaron secretos.
Se aplicó 0003 a D1 de prueba y se publicó Preview `payments-test`
(despliegue `b4dd7812`). Verificado: portada/retornos 200, todos los SKU apagados,
pedido bloqueado 403 y webhook sin firma 400. D1 sigue vacía tras la comprobación.
El registro anterior del 14 de octubre describe el despliegue previo. La respuesta del ticket
WCS-54274 aportada por el usuario es del 6 de octubre y dice que sigue en revisión.
No se presupone que haya que esperar habilitación de Orders API para probar
Preferences; falta verificar la configuración y credenciales de este producto.
Detalle y pendientes en `PAGOS.md`; revisión local en `REVISION-PAGOS.md`.

## 2026-10-14 — Mercado Pago pasa al flujo natural del carrito

Se eliminó el bloque independiente de contratación situado bajo el catálogo.
El carrito ahora decide el siguiente paso: si todos los servicios tienen precio
cerrado, presenta Mercado Pago y mantiene WhatsApp como alternativa; si alguno
es “desde” o “a cotizar”, continúa solamente al diagnóstico/cotización.

El navegador envía una lista de SKU, nunca montos. El servidor ordena y valida
los SKU, suma los precios del catálogo, crea una sola orden de Orders API con
varias líneas y las persiste en la nueva tabla D1 `order_items`. Se aplicó
`0002_order_items.sql` únicamente a `biodigital-payments-test` y se publicó la
rama Preview `payments-test`. El alias estable devuelve la versión actual, las
tres páginas de retorno responden 200 y 29/29 pruebas Node pasan.

`PAYMENTS_ENABLED=false`, los 14 SKU están deshabilitados y la D1 continúa con
cero órdenes y cero líneas. No se modificaron Production, `main`, secretos ni
credenciales. La prueba real sigue bloqueada por WCS-54274 y la credencial de
prueba `APP_USR-` compatible con Orders API.

## 2026-10-13 — D1 y Preview aislados para pagos

Se creó `biodigital-payments-test` en la cuenta Cloudflare de BioDigital y se
aplicó `migrations/0001_orders.sql`. El binding `DB`, `CHECKOUT_SITE_URL` y
`PAYMENTS_ENABLED=false` quedaron exclusivamente en `env.preview`. Se publicó
la rama `payments-test` en
https://payments-test.biodigital-propuesta.pages.dev, sin modificar `main` ni
Production. Las Pages Functions, retornos, `noindex` y barreras 403/400 fueron
verificados; D1 quedó con cero órdenes y cero eventos.

**Pendiente:** soporte debe resolver WCS-54274 y emitir/confirmar credenciales
de prueba `APP_USR-`. Antes de probar pagos también debe confirmar si la
aplicación 7545447256210205 tiene habilitado el contrato usado en `/v1/orders`,
porque la guía vigente clasifica Checkout Pro bajo Preferences API. No se
configuraron secretos, habilitaron SKU, crearon órdenes ni realizaron pagos.

## 2026-10-11 — Checkout Pro: integración visual sin habilitar cobros

La opción 8 incorpora selección de servicio, resumen desde el catálogo del
servidor, pago completo y anticipos solo cuando el backend los habilite. Los
reintentos de una misma selección reutilizan `Idempotency-Key`; el navegador
envía únicamente `sku` y `purpose` y redirige en la misma ventana.

El `access_token` de la orden se conserva solo en `sessionStorage`, nunca en la
URL. Los retornos `/pago/exitoso`, `/pago/pendiente` y `/pago/error` consultan el
GET autenticado: solo `processed` se muestra como pago verificado. Hasta que la
fase 4 sincronice estados mediante webhooks, una orden `created` aparece como
comprobación pendiente. `PAYMENTS_ENABLED=false` y todos los SKU siguen
bloqueados.

**Pendiente:** D1, credenciales de prueba, `CHECKOUT_SITE_URL`, pruebas visuales
en navegador/celular y webhooks de fase 4. No se desplegó ni ejecutó un pago.

## 2026-10-11 — Logo definitivo, paleta de marca y una sola página de trabajo

**Logo.** El equipo entregó tres piezas: la versión vertical, el logotipo horizontal y el ícono de app en sus dos
fondos. Se recortaron del fondo oscuro y quedaron en `web/propuesta/marca/`:
- `logotipo-96/240` (texto blanco, para fondo oscuro) y `logotipo-tinta-96/240` (texto azul oscuro, para fondo claro);
- `app-oscuro-512` y `app-claro-512`, más `favicon-32`, `icono-192`, `icono-512` y `apple-touch-icon`;
- `og.jpg` (1200 × 630) para cuando se comparte el enlace.
La primera versión que mandaron (la "B" con el cuadradito separado) usa un isotipo **distinto** al del logotipo y
del ícono; quedó guardada en `marca/variante-1/` y **no se usa**, para que la marca sea una sola.

**Paleta.** Los dos colores por defecto de la página pasan a ser los del logo: `--c1: #0da5ff` (azul) y
`--c2: #00e5d0` (cian), tomados del propio archivo. Toda la página deriva de esos dos, incluida la ropa del gato.
La rueda de colores sigue funcionando: cambia la página entera, "Restablecer" vuelve a los colores de la marca, y
se agregaron los presets "Marca (logo)" y "Azul profundo". Verificado: por defecto marca, un preset cambia todo, y
restablecer vuelve a `#0da5ff` / `#00e5d0`.

**Una sola página de trabajo.** La opción 8 (mezcla de la 6 y la 7) pasa a ser **el sitio**: se genera como
`index.html`. Las siete anteriores quedan como plantillas ya hechas en `web/propuesta/plantillas/`, con su galería
en `plantillas/index.html`. El generador escribe la 8 en la raíz y las otras en `plantillas/`, y los archivos
compartidos (css, js, marca) se enlazan con `../` cuando la página vive en esa carpeta.
`opcion-8-final.html` quedó como redirección, para no romper los enlaces ya enviados por WhatsApp.
Los accesos directos de `enlaces/01-nuestras-paginas/` se actualizaron a las direcciones nuevas.

**Verificado:** las 8 páginas, el formulario y la lámina responden 200; las plantillas cargan desde su carpeta con
el gato y sin recursos fallidos; el logotipo se ve en los dos temas.

**Pendiente:** los textos de la página siguen hablando del catálogo anterior (ficha de Google, dominio y correo).
Hay que reescribirlos con los 6 servicios vigentes, y para eso faltan los precios.

## 2026-10-11 — Formulario de levantamiento para el cliente

**Qué es:** una página web de una sola pieza (`web/propuesta/formulario.html`, y en la skill como plantilla) con
**59 preguntas en 12 bloques** que el dueño del negocio responde solo, en unos 15 minutos, desde el celular.
Se guarda mientras lo llena, y al final entrega las respuestas ordenadas para pegarlas en la conversación.

**Por qué:** el equipo atiende al cliente en terreno, no en el chat. Sin esto, las decisiones de diseño se tomaban
adivinando. Las seis escalas de personalidad (serio ↔ cercano, clásico ↔ moderno, sobrio ↔ llamativo, humor,
precio ↔ premium, adulto ↔ joven) son lo que no se puede adivinar.

**Cómo se manda:** como link publicado junto a las maquetas, como archivo por WhatsApp, o impreso con Ctrl+P
(la barra y los botones no salen impresos).

**Lo importante está en la skill:** `referencias/levantamiento.md` explica cómo convertir cada respuesta en
decisiones de diseño: qué estética, tipografía, paleta, animación y tono salen de cada escala, seis perfiles
frecuentes con su estética sugerida, qué hacer cuando las respuestas se contradicen y siete señales de alerta
(cliente sin fotos, sin propuesta de valor, varios decisores, fecha imposible).

**Verificado:** 12 secciones y 59 preguntas renderizan sin errores; el avance se calcula; lo escrito sobrevive a
recargar la página; en 375 px no hay desborde, ningún texto baja de 12 px y ningún control baja de 44 px de alto.

**Pendiente:** el número de WhatsApp del equipo (hoy dice `[PENDIENTE]` en el pie del formulario).

## 2026-10-06 — Limpieza del repositorio

**Borrado** (todo estaba versionado; se recupera con `git checkout d1e3823 -- <ruta>`):
- `web/propuesta/mascotas/` completa, 5 MB: las imágenes recortadas de los 4 animales (panda, conejo, pingüino y el gato viejo) y el material de recorte de las hojas (`control.png`, `lamina.png`, `mira-0.png`, `mira-1.png`, `hoja-1.webp`, `hoja-2.webp`, `recortar.py`). Sin uso desde que el gato se dibuja en SVG. La versión mantenida de la herramienta de recorte vive en la skill (`respaldo-skills/crear-sitio-web/plantilla/mascota/herramientas/recortar-hoja.py`).
- `web/propuesta/mascota-personajes.js`, 16 KB: el motor de los 4 animales, sin referencias en ninguna página.

**Movido:** las hojas de referencia del gato (`gato-emociones.webp`, `gato-feliz.webp`) pasaron de `mascotas/fuente/` a `web/propuesta/referencias-gato/`. No estaban versionadas.

**Resultado:** el proyecto pasó de 30 MB a 25 MB. Verificado después de borrar: las 8 páginas cargan sin errores de consola ni recursos fallidos, el gato funciona y los 8 enlaces de la galería responden 200.

**Revisado y NO borrado, con su razón:**
- **Las 8 maquetas** (`maqueta-final.html`, `opcion-2` a `opcion-8`): son 330 KB, el 1 % del proyecto, y `index.html` es una galería que las enlaza, no un archivo que las contenga. Borrarlas deja 8 enlaces rotos, en local y en el sitio publicado. Las opciones 3 a 8 se regeneran con `node fuentes/generar.mjs`, pero la 1 y la 2 están escritas a mano y no se pueden regenerar.
- **`servicios/paginas-web/`**: no es una copia de `web/`. Una cosa es la ficha comercial del servicio que se le vende al cliente y otra es el sitio de la propia Bío Digital.
- **`respaldo-skills/`**: es copia exacta de la skill instalada (verificado con `diff -r`), y ese es justamente su propósito: si se pierde el perfil del usuario, la skill se recupera desde el repositorio.
- **`textos.md`**: no lo carga ningún archivo, pero es el documento de textos aprobados con el equipo.
- **`mundo.css`**: solo lo usa `maqueta-final.html`, que es la opción 1.
- **Binario de Impeccable** (`.claude/skills/impeccable/scripts/bin/`, 15 MB): es la mitad del espacio del proyecto, ya está excluido de git y se vuelve a descargar solo. Se mantiene porque Impeccable se usa en la fase 2 del sitio.

## 2026-10-06 — Catálogo de servicios: se reduce a seis

**Decisión del equipo.** El catálogo que se vende queda en estos seis servicios:

1. Páginas web
2. Videos para redes sociales
3. Menús interactivos
4. Registro fotográfico
5. Reservas (sin definir cómo se entrega)
6. Tarjetas de fidelización (las dos variantes: QR con sellos y tarjeta en Google y Apple Wallet)

Todo lo demás queda en stand by como servicios futuros: ficha de Google Business, dominio y correo, bot de WhatsApp,
agente de voz, chatbot de Instagram, automatización de reseñas, kit de marca, presencia en otros mapas, mantención
mensual, reportes de métricas y licenciar Radar.

**Estructura nueva:** cada servicio tiene su carpeta con una ficha (qué es, qué incluye, cómo se implementa,
dificultad, costos, riesgos y qué falta) en [servicios/](../servicios/) y [servicios-futuros/](../servicios-futuros/).

**Objeciones registradas (el equipo decidió igual, quedan anotadas):**
- **La ficha de Google Business sale del catálogo**, y es el servicio de mayor impacto y menor costo para este cliente:
  es gratis de implementar y es lo que resuelve el problema declarado en la conceptualización, que es aparecer cuando
  alguien busca el rubro cerca. Además, el diagnóstico gratis y el puntaje de Radar están construidos sobre ella,
  igual que el argumento central de las 8 maquetas.
- **Sin dominio en el catálogo, un sitio de cliente queda en una dirección terminada en `.pages.dev`**, que los propios
  requisitos definidos por el equipo descartan explícitamente.
- **Tres de los seis servicios son nuevos y no se han hecho nunca** (video, reservas, fidelización), con 7 semanas para
  cerrar y transferir 3 a 5 clientes.
- **La variante de fidelización en Wallet tiene costo mensual** (del orden de 25 a 50 dólares, por verificar), lo que
  choca con la promesa de entrega única y transferencia.

**Pendientes que abre esta decisión:**
- Precios por servicio: los paquetes del PRD (Base $150.000 / Estándar $250.000 / Premium $380.000) se armaron con el
  catálogo anterior y hay que rehacerlos.
- Qué mide el diagnóstico gratis y el puntaje de Radar ahora que la ficha de Google no se vende.
- Cómo se publica el sitio de un cliente sin dominio propio.
- Cómo actualiza el cliente su menú interactivo.
- Cómo se entregan las reservas (sin definir).
- Quién paga la plataforma de fidelización después de la transferencia.
- Los textos de las 8 maquetas y el PRD todavía describen el catálogo anterior. No se tocan hasta que los precios estén firmes.

## 2026-09-17 — Mascota del sitio final: solo el gato, redibujado en SVG y animado

**Pedido del equipo:**
- que el gato se mueva de forma fluida (la meta era unos 32 cuadros por segundo);
- que no parezca un elemento externo a la página;
- sacar los otros animales;
- más frases con el mismo tono sarcástico;
- que el aviso de "scroll rápido" salte solo con un scroll muy rápido.

Las hojas de referencia (32 emociones y 32 cuadros de "feliz") quedaron en `web/propuesta/referencias-gato/` (movidas ahí el 2026-10-06).

- **Por qué se redibujó y no se usaron las hojas cuadro a cuadro:**
  - los 32 cuadros de "feliz" son poses sueltas generadas por IA, con el trazo distinto en cada una;
  - puestas en secuencia "tiemblan" y no se ven fluidas;
  - 32 imágenes por emoción pesarían varios MB.
- **Qué se hizo:** el gato se dibujó en SVG por partes (`web/propuesta/gato.js`) respetando el diseño de las hojas: chaqueta con capucha, polera, mochila, cinturón, pantalón cargo, zapatillas y cola con punta oscura.
  - Se anima con resortes a la tasa de la pantalla. Se midieron 61 cuadros por segundo; la cabeza se redibuja unas 53 veces por segundo.
  - Tiene 27 poses. Entre ellas están las de las hojas y una nueva, **"indiferente"**, que se usa al escribir correo o teléfono: se da vuelta, cierra los ojos y silba.
  - Tiene 9 gestos: saltar, celebrar con confeti, negar, asentir, temblar, saludar, bailar, reír y estirarse.
  - Además parpadea, respira, mueve la cola y las orejas, mueve la boca al hablar y sigue el mouse con los ojos y la cabeza.
  - Lámina de revisión para el equipo: `gato-lamina.html`.
- **Integración con la página:** la ropa usa los colores de la paleta, así que cambia con la rueda de colores y con el tema.
  - Chaqueta: `--c1`.
  - Mochila, tirantes y cordones: `--c2`.
  - Pantalón: `--c2` apagado.
  - La polera lleva el símbolo de la marca.
  - Sin contorno naranjo, a pedido del equipo.
  - Al cambiar la paleta, el gato comenta su "ropa nueva".
- **Motor (`mascota.js`):** un solo motor para todas las opciones. Si la configuración trae `rig: true`, usa el dibujo SVG en vez de las imágenes. Cambios:
  - **Scroll rápido:** solo salta con más de 4 pantallas por segundo sostenidas durante medio segundo. No cuenta los saltos del menú ni las teclas Inicio, Fin y AvPág, y no se repite antes de 20 s.
  - **Secciones:** las comenta solo si la persona se queda en la sección al menos 0,65 s.
  - **Comentarios sueltos:** hasta 5 por visita, mientras la persona lee.
- **Frases:** el archivo nuevo `mascota-gato.js` tiene solo el gato y 100 frases en 43 situaciones (antes eran 58), todas de menos de 60 caracteres y revisadas contra los textos de la página. Siguen siendo borradores para que el equipo las apruebe.
- **Alcance:** solo la opción 8. Las opciones 3 a 7 quedaron idénticas, con los 4 animales en imágenes.
- **Verificación** (Chrome sin ventana por CDP):
  - **Scroll:** con 2,5 pantallas por segundo no se asusta, tampoco con un clic en el menú; con 8 pantallas por segundo sí.
  - **Formulario:** al escribir el correo se pone "indiferente" y silba; con un dato inválido pone la mano en la cara.
  - **Comportamiento:** con movimiento reducido no hay animación en reposo; escondido, no gasta cuadros.
  - **Pantallas:** a 390 px no hay desborde ni tapa el botón del dock. Revisado en tema claro y oscuro y con otra paleta.

**Pendiente:** que el equipo apruebe el dibujo y las frases, y probarlo en un celular real.

### 2026-09-18 — Giro completo y el gato en todas las páginas

- **Giro completo (pedido del equipo):** el gato ahora se da vuelta del todo hacia la derecha o la izquierda, no solo gira la cabeza.
  - Se agregó un segundo dibujo de perfil. Tiene hocico, un solo ojo, la mochila en la espalda y las piernas una delante de la otra. La oreja, el brazo y la pierna de atrás van más oscuros para dar profundidad.
  - **Transición:** la cara se desliza hacia el lado y el cuerpo se angosta. Al cruzar la mitad, parpadea y cambia al perfil, que en espejo sirve para mirar a la izquierda.
  - **Medición:** 42 cuadros reales en 700 ms, grabados con `Page.startScreencast`; el cambio de dibujo ocurre a los ~150 ms.
- **Cuándo gira del todo:**
  - con correo o teléfono, se da vuelta hacia afuera y silba;
  - con el mouse sobre el botón principal, lo mira de perfil y le guiña;
  - a veces, al mirar alrededor cuando no pasa nada;
  - en algunas reacciones al bajar o subir, en comentarios sueltos y al enviar.
  - Las 27 poses tienen versión de perfil. Poses nuevas: `mira-d` y `mira-i`. Gesto nuevo: `vuelta`.
- **El gato en todas las páginas:** las opciones 1 a 8 cargan `gato.js` + `mascota-gato.js`. Ya ninguna muestra el panda, el conejo ni el pingüino.
  - Los archivos viejos (`mascota-personajes.js` y `mascotas/<animal>/`) quedan sin uso, por si se retoman.
  - La ropa toma los colores de cada estética: 1 celeste y turquesa, 2 verde y violeta, 3 cromado, 4 crema, 5 grises, 6 naranjo y azul, 7 cobre y violeta, 8 la paleta de la rueda.
- **Servidor local sin caché** (`web/servir.py`, usado por `.claude/launch.json`). Con `python -m http.server` el navegador mostraba copias viejas y por eso seguía apareciendo el gato anterior.

### 2026-09-18 — Usos raros del mouse y del scroll, y ojos que siguen al mouse

**Problema reportado por el equipo:**
- con movimientos raros del mouse o del scroll (subir y bajar), el gato empezaba un movimiento, saltaba a otro y quedaba "entre medio";
- al subir rápido desde el final de la página, hacía muchas posiciones seguidas.

**Causa medida:** el scroll disparaba una reacción en **cada cuadro** (60 por segundo), y cada vez se elegía una pose al azar distinta de la anterior. Al subir, alternaba entre una pose de frente y otra de perfil cada ~100 ms, así que el giro nunca terminaba: en la prueba quedó hasta **683 ms a medio girar** y hubo 9 cambios de pose en 3 s.

**Correcciones:**
- **Giro (`gato.js`):** un giro empezado siempre termina. Si piden otra vista mientras gira, espera a que acabe y deja una pausa de 350 ms antes del siguiente.
- **Gestos:** un gesto no se reinicia a medias. Además, dos gestos de cuerpo entero no se suman: el anterior se desvanece en 180 ms.
- **Scroll (`mascota.js`):**
  - hay una reacción por tramo de scroll, no una por cuadro;
  - el sentido cambia solo después de recorrer el 60 % de una pantalla (1,2 pantallas si ya reaccionó en ese tramo), y reacciona como máximo una vez cada 2,5 s;
  - con scroll rápido (más de 2,5 pantallas/s) no reacciona: solo queda el aviso de "muy rápido";
  - la pose de la sección se aplica al parar el scroll;
  - las poses de perfil se quitaron de las reacciones al bajar o subir.
- **Poses de ambiente:** no cambian una cara que lleva menos de 0,8 s.
- **Mouse sobre botones y tarjetas:** hay reacción solo si el mouse se detiene encima: 260 ms en el botón principal y 380 ms en tarjetas. No reacciona si el mouse va rápido, está agitado o fue la página la que se movió bajo el puntero.
- **Comentarios:**
  - un globo que se está leyendo no se tapa con otro de igual o menor importancia;
  - pausa mínima de 4 s entre comentarios de interacción, 12 s en los de ambiente y 8 s en los de sección;
  - máximo 5 comentarios por minuto;
  - los importantes siempre hablan (errores, envío, toques y aviso de scroll);
  - toques: la cara cambia como máximo una vez cada 0,9 s; con 4 seguidos se enoja e ignora los clics durante 3 s;
  - "¿ya te vas?": como máximo cada 20 s, y no si el mouse venía agitado.
- **Ojos que siguen al mouse (pedido del equipo):**
  - Las pupilas apuntan hacia el puntero: miran del todo hacia allá si el puntero está a más de ~150 px, y menos si está cerca. La cabeza lo sigue un poco y el párpado sube al mirar hacia arriba; sin esto, la pupila quedaba escondida y el gato parecía dormido.
  - Si el mouse va muy rápido, salta o se sacude, el suavizado se alarga hasta 0,45 s y los ojos siguen el promedio en vez de temblar.
  - Cuando el mouse sale de la ventana, se pierde el foco o lleva 6 s quieto, vuelve a la mirada propia de la pose.
  - **Poses que no lo siguen:**
    - no lo siguen nunca: `indiferente`, `soberbio`, `negacion`, `facepalm` y `dormido`;
    - lo siguen un poco: `pensativo` y las poses que miran a un lado a propósito.
  - **Casos especiales:**
    - En un campo del formulario mira fijo el campo.
    - En el celular mira 1,5 s hacia donde se tocó.
    - Con movimiento reducido no hay seguimiento.
- **Mouse sacudido (comentario controlado):**
  - Si se sacude con fuerza durante más de 1 s (7 o más cambios de sentido amplios en 1 s y más de 1.800 px/s), el gato se marea: pose `mareado` y gesto `mareo`, con estrellas alrededor de la cabeza y los ojos dando vueltas.
  - Puede pasar como máximo 2 veces por visita, con 45 s entre mareos. Se configura en `mascota-gato.js` (`mareo`).
- **Servidor:** `web/servir.py` ahora tiene una cola de 128 conexiones. Con la de 5, Windows rechazaba archivos cuando el navegador pedía muchos a la vez. También escucha en `::1` y no se cae si se cierra la consola que lo lanzó.

**Verificación:** las pruebas se hicieron en Chrome sin ventana, con mouse y rueda reales (CDP `Input`).

| Caso | Antes | Después |
|---|---|---|
| Subir rápido desde el final | 9 cambios de pose, 683 ms a medio girar | 1 cambio (el aviso), sin giros |
| Rueda indecisa (subir y bajar) | — | 1 reacción |
| Mouse subiendo y bajando sobre las tarjetas | — | 0 reacciones |
| Sesión inquieta de 45 s | — | 27 cambios de pose, solo 1 cambio seguido en menos de 0,5 s (llegar arriba) y 7 globos, 4 de ellos por acciones de la persona |

Sin errores en ninguno de estos casos: las 8 páginas, celular táctil de 390 px y movimiento reducido. La animación se mantiene a 60 cuadros por segundo.

**Publicado (2026-09-18, autorizado por Christhoper):** se subió a https://biodigital-propuesta.pages.dev, con las opciones 1–8, el gato nuevo y la lámina en `/gato-lamina`. Se probó en la página publicada sin errores.

### 2026-09-18 — Corrección: el gato hablaba muy poco y los globos quedaban pegados

**Reclamo del equipo:** después del cambio anterior el gato comentaba mucho menos (antes era "muy dinámico" y gustaba así). Además, a veces un globo quedaba pegado aunque se siguiera bajando.

**Causas (medidas con la misma lectura de 55 s en la versión anterior y en la nueva):**
- **Pocos comentarios:** puse 8 s de pausa entre comentarios de sección y exigí que el scroll estuviera detenido. Al leer de corrido, solo se comentaban 3 de 10 secciones: 4 globos, contra 13 en la versión anterior.
- **Globo pegado:** el globo duraba lo mismo que la reacción. Las reacciones largas (scroll, campo del formulario, "Enviando…" y dormido) mantienen la pose hasta 60 s, así que su globo también quedaba 60 s y tapaba los comentarios siguientes. En el campo y el envío ya pasaba antes.

**Correcciones (`mascota.js`):**
- **Duración del globo:** dura lo que se tarda en leerlo, de 2,2 a 4,2 s según el largo, aunque la pose siga.
- **Secciones:**
  - comenta cuando la sección lleva 0,65 s al centro, aunque se siga bajando despacio;
  - si justo hay un globo recién aparecido, reintenta cada 0,5 s mientras siga en esa sección.
- **Globo recién aparecido:**
  - no lo tapa otro comentario igual o menos importante durante 2,2 s, ni uno más importante durante 1 s (antes había globos que duraban 0,1 s);
  - las acciones de la persona (toques, errores, envío y aviso de scroll) siempre hablan.
- **Ritmo:**
  - los comentarios de ambiente esperan 6 s y el scroll habla en la mitad de los tramos;
  - el hover espera 6 s;
  - el tope es de 12 comentarios por minuto.
- **Final y regreso al inicio:** esos comentarios no se pierden: reintentan hasta 3 s.
- **Al parar el scroll** se suelta solo la reacción que puso el propio scroll: ya no corta el gesto de asentir sobre una tarjeta.

**Resultado:** en la lectura de 55 s salen 11 comentarios (las 9 secciones más 2 de scroll), sin globos tapados ni pegados, con una duración de 2,2 a 3,8 s. En la opción 1 y la 6 salen 11 y 12. Las pruebas de movimientos raros siguen sin giros a medias.

## 2026-09-17 — Estética elegida: opción 8 = mezcla de 6 y 7

**Decisión del equipo:** una sola página con la estética de la 6 (Panel SaaS) y la 7 (Foco fintech). De las otras opciones solo se trae el contenido que no se repite, no su estética.

- **Archivo:** `web/propuesta/opcion-8-final.html`, generado con `node fuentes/generar.mjs 8` desde `fuentes/opcion-8.mjs`. Primera en `index.html`.
- **Portada:** titular y aviso de beneficio (6), foco de luz, campo en píldora que pasa el nombre al formulario y piso con grilla (7), panel del proyecto (6) con cuatro tarjetas flotantes a los lados (7).
- **Contenido integrado de otras opciones:** vista de la ficha de Google ("Abierto · Cómo llegar · Llamar · Sitio web") y catálogo de ejemplo (1); certificado "Todo a tu nombre" con RUT, "propietario: tú", correo y firma del acta (2); la frase "lo que ves en el panel es lo que te llevas" en entregables (1). El resto de 1–5 era idéntico (informe, planes, 11 preguntas).
- **Paleta:** todo sale de dos colores, `--c1` (principal, `#f08a4b`, entre el naranjo de la 6 y el cobre de la 7) y `--c2` (luz, `#a47cff`, el violeta de la 7). **Rueda de colores** (`paleta.js`/`paleta.css`) junto al botón de tema, **solo para el equipo**: paletas guardadas (6, 7, mezcla, ámbar), rueda arrastrable, código hex exacto y botón "Copiar enlace" (`?c1=…&c2=…`). **Se quita al publicar el sitio final**; queda fijo el color que elija el equipo.
- **Animación nueva** (`movimiento.css`/`movimiento.js`): barra de lectura, cabecera que se asienta, títulos que se descubren, tarjetas que entran cuando se ven, panel que se endereza con el scroll, selección del panel que recorre las secciones, puntos y precios que cuentan, pasos que caen como avisos con una línea que los une, filo del plan recomendado, reflejo en el beneficio y en el botón principal, luz del cierre en movimiento. Los efectos en bucle se pausan fuera de pantalla.
- **Arreglos de fluidez:** la grilla del piso ahora se mueve con `transform` (antes redibujaba la pantalla en cada cuadro), los focos de luz ya no usan `filter: blur`, y la portada usa `overflow: clip` (con `hidden` el panel nunca se enderezaba; la opción 6 tenía el mismo defecto).
- **Mascota:** sin cambios, a pedido del equipo (la van a modificar).
- **Verificación:** Chrome sin ventana en tiempo real por CDP (el panel del navegador integrado no dibuja cuadros con la pestaña en segundo plano). Sin errores de consola; sin desborde a 390, 768 y 1024 px; textos ≥ 12 px; contraste corregido. Impeccable: 22 avisos, todos de las referencias del equipo (resplandores, texto con degradado, grilla, Geist).

**Pendiente:** que el equipo fije la paleta con la rueda; probar en celular real; luego `DESIGN.md` y construcción en Astro.

## 2026-09-17 — Propuesta publicada en Cloudflare Pages y carpeta de enlaces

- Las 7 maquetas quedaron públicas en https://biodigital-propuesta.pages.dev (proyecto `biodigital-propuesta`, cuenta `biodigitalici@gmail.com`, plan gratis, $0). Para actualizar: `npx wrangler pages deploy web/propuesta --project-name=biodigital-propuesta --branch=main` (sin `--branch=main` queda como vista previa y no en el dominio principal).
- Nueva carpeta `enlaces/`: accesos directos por categoría y `LEEME.md` con todos los servicios, repos y referencias (usados, por usar y descartados, con el motivo).

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

## 2026-10-11 · Catálogo, precios y promociones en la página

**Precios por producto** (costo único, sin mensualidad): página web desde $49.990 · videos para redes desde $9.990 · menú digital desde $27.990 · registro fotográfico $4.990 · sistema de reservas desde $24.990 · tarjeta de fidelización $9.990. Suma por separado **$127.940**. **Pack completo $79.990** (ahorro $47.950).

**Promoción primeros 5 clientes** (reemplaza a la del "doble de soporte a cambio del caso publicado", descartada): pack completo a **$69.990**, o 10 % de descuento sobre cualquier compra desde $30.000.

**Promociones fugaces**: 2 videos $17.990 · 3 videos $24.990 · tarjeta de fidelización $7.990 · menú digital + fotos $29.990 · reservas + fidelización $29.990. Las dos últimas las propuso Claude y quedaron aplicadas.

**Diagnóstico gratis**: ya no mide presencia en Google. Mide qué tan digitalizado está el negocio, en cinco aspectos que suman 100 puntos: sitio propio 25 · cómo se ve 20 · qué vendes 20 · cómo te reservan 20 · si el cliente vuelve 15. Se hace en el primer contacto, no como informe enviado después.

**Estructura de la página**: se borró "En 30 segundos", se fusionaron "Todo lo que tu negocio necesita" y "Cada cosa que te entregamos" en una sola sección de seis tarjetas con precio, y el diagnóstico quedó compacto. La página pasó de ~12.000 px a 8.869 px de alto a 1440 px de ancho.

**Logo**: ahora son dos capas recortadas del logotipo (`marca/mascara-marca-540.png` y `marca/mascara-texto-540.png`). La "B" se pinta con la paleta (`--c1` a `--c2`) y el texto con el color de texto, así que el logo cambia con la rueda de colores y sirve en los dos temas sin dos archivos.

**Pendiente**: valor anual del dominio .cl y del hosting (quedó como `[por confirmar]` en las preguntas frecuentes).

**Gato (2026-10-11):** se quitaron de sus frases las referencias a Google/Maps/ficha y al plan Estándar; ahora habla del pack, de reservas y de la carta. Selectores del motor actualizados (`.pack`, `.promo`, `.promo-price`). Verificado en 390 px: sin desborde horizontal y sin textos menores a 12 px. La fluidez de la burbuja no se pudo medir en cuadros por segundo (el panel del navegador estaba oculto); queda por probar a ojo en el navegador del equipo.

## 2026-10-12 · Tienda, ejemplos y ajustes de la página

- **Portada:** el panel y las tarjetas flotantes se reemplazaron por un carrusel curvo de 6 maquetas en español (restaurante, peluquería, servicio técnico, cabañas, almuerzos, estética). Son imágenes SVG (`fuentes/maquetas.mjs`); cada una tiene un campo `url` vacío que, al llenarlo, la convierte en enlace a la página completa. Se descartaron los óvalos con rubros bajo el carrusel.
- **Secciones quitadas:** "Todo lo que tu negocio necesita" (duplicaba precios) y el diagnóstico completo con puntaje.
- **Precios:** cada producto se abre y muestra qué incluye y cómo funciona, con botón de carrito. Carrito con envío del pedido por correo y por WhatsApp (se abre el cliente de correo o WhatsApp con el pedido escrito; no hay servidor, nada se envía solo).
- **Sin poder de edición para el cliente:** se quitaron todas las menciones a que el cliente edita, cambia precios o recibe capacitación.
- **Menú digital interactivo (cuesta más):** el cliente elige un plato y con la cámara lo ve sobre su mesa. Se agrega aparte, con **precio a cotizar** (falta fijar el valor).
- **Cobertura:** solo Gran Concepción. El formulario pide comuna (lista cerrada de 10 comunas), ya no región.
- **Dominio:** .cl lo registra NIC Chile, $10.000 al año (dato del equipo; verificar en nic.cl). Hosting: por confirmar, se buscan alternativas.
- **WhatsApp del equipo:** +56 9 4694 1640. Se cambia en `web/propuesta/fuentes/config.mjs` y se regenera con `node fuentes/generar.mjs`.
- **Ancho:** la columna del sitio sube a 1440 px (en pantallas anchas) y siempre deja 150 px a cada lado para el gato, que queda fuera de la página.
- **Pendiente:** precio del menú interactivo; valor del hosting; si se quiere avisar solo por correo se necesita un servicio de formularios (hoy lo envía el cliente desde su correo/WhatsApp).

## 2026-10-12 (tarde) · Menos texto, clic en ejemplos, hosting

- **Menos repetición:** se quitaron frases duplicadas de la página (plazo de 24 h, "startup de estudiantes", textos de las maquetas, 2 preguntas frecuentes, la promesa "Sabes cuánto pagas"). El gato habla menos: tope de 5 comentarios por minuto, 15 s entre comentarios de ambiente y 2 comentarios sueltos por visita.
- **Clic en las maquetas:** al hacer clic en una tarjeta del carrusel (o en el botón "Ver ejemplos en grande", que también sirve con teclado) se abre en grande, con flechas y Esc. Si la maqueta tiene `url`, el visor muestra "Abrir la página completa".
- **Movimiento al mover el mouse:** vuelve el desplazamiento suave de la portada y se agregaron transiciones al pasar el mouse en botones, filas de precios, promociones, pasos, preguntas y carrusel.
- **Hosting:** la página web va en Cloudflare, sin costo para el cliente (el plan gratuito permite uso comercial; **verificar los términos vigentes antes de prometerlo**). Solo se paga el dominio .cl ($10.000 al año, NIC Chile). Falta confirmar el hosting de reservas, menú y fidelización si necesitan algo más que una página estática.

## 2026-10-12 (noche) · Panel interno, Instagram y formulario del cliente

- **Instagram:** @biodigital.cl, con el mismo botón (solo logo) que WhatsApp en contacto, cierre y barra del celular. WhatsApp y Instagram usan su logo en vez de texto. Datos en `web/propuesta/fuentes/config.mjs`.
- **Carrito y "¿Qué te interesa?":** si hay algo en el carrito, el campo se oculta; si está vacío, aparece.
- **Cuarto punto de las promesas:** "Tu negocio funcionando" (lo probamos y lo entregamos funcionando, con acta).
- **Formulario del cliente** (`formulario.html`, 59 preguntas): ahora tiene botón "Enviar a Bío Digital" que deja las respuestas en el panel; sigue el copiar/WhatsApp como respaldo. Se manda como link: `<sitio>/formulario.html` (hay que publicarlo; el deploy del 18-sep no lo incluye).
- **Panel interno** (`web/panel/`, ver `LEEME.md`): login con contraseña + segundo factor, solicitudes en vivo (cada 5 s), formularios, caja, equipo y actividad. Base en Supabase `biodigital-panel` (id `mkxxqhywwzsaeojfmkme`, región São Paulo, gratis). El sitio publica solicitudes ahí al presionar enviar por correo o WhatsApp.
- **Supabase:** se **pausó** el proyecto `agente-whatsapp` (tenía datos reales: 25 mensajes, 11 documentos) para liberar el cupo gratis de 2 proyectos. No se borró; se restaura desde el panel de Supabase. No hay herramienta para borrar proyectos desde aquí.
- **Versión pública del sitio:** `node fuentes/generar.mjs --publico 8` (sin rueda de colores del equipo ni aviso de prototipo). Usarla antes de publicar y de poner el link en Instagram/WhatsApp Business.
- **Pendiente:** ajustes de Supabase (Site URL, largo de contraseña 12, SMTP propio para los correos de confirmación); autorizar a los compañeros en la pestaña Equipo; publicar el sitio y el panel; el precio del menú interactivo; el capital semilla de $80.000 se registra en Caja como "Capital aportado".

## 2026-10-12 (madrugada) · Menú digital con plato en vivo (skill nueva)

- **Producto:** menú digital por QR; en los platos con modelo 3D aparece "Ver en tu mesa": visor 3D y, desde el celular, realidad aumentada con la cámara (model-viewer de Google 3.5.0, modos webxr / scene-viewer / quick-look). Los platos sin 3D se ven solo con foto; no hace falta 3D de toda la carta.
- **Modelos 3D:** se escanean con el celular en el local (Polycam, Luma o Kiri Engine), se exportan a GLB y se optimizan a menos de 5 MB en tamaño real. Guía en `crear-menu-digital/referencias/captura-3d.md`.
- **Demostración:** restaurante ficticio "Fogón del Sur", 9 platos de ejemplo (fotos ilustradas), 1 con 3D (brocheta, modelo de muestra de modelviewer.dev). Carpeta `web/menu/` (`node generar-menu.mjs`). Se descartó el 3D de palta de muestra por pesar 8 MB.
- **Skill:** `crear-menu-digital` (instalada en `~/.claude/skills/` y respaldada en `respaldo-skills/crear-menu-digital/`). Copia la plantilla por cliente, valida `menu.json` y genera `index.html` y `_headers`.
- **Pendiente:** precio de la versión interactiva (se definirá tras la demo); probar la realidad aumentada en un celular real (no se pudo desde el computador); quién cobra los cambios de carta; generación de QR (no hay librería instalada; pedir permiso para instalar `qrcode` o usar un generador estático gratuito); si el menú interactivo se publica o no en el sitio mientras tanto.

- **12-oct (noche) · Fotos de prueba del menú:** la demo `web/menu/` usa 4 fotos que mandó el usuario (ensalada de burrata, empanadas, lomo con papas y arroz, carne asada al horno) más la brocheta ilustrada con 3D real de muestra. Las dos fotos tomadas desde arriba (empanadas y carne asada) se convirtieron en discos planos del tamaño real (26 y 28 cm, supuestos) con `foto-a-modelo.py disco`, para probar la cámara; las otras dos están en ángulo y solo sirven de foto de tarjeta. La foto de empanadas es de un banco de imágenes de baja resolución (con marca de agua, recortada): solo para pruebas, no publicar. Una foto sola no da 3D real: para eso se escanea el plato.

- **12-oct (madrugada) · Prueba en iPhone y rediseño del menú:** el usuario probó la realidad aumentada en un iPhone 15 Pro: el disco de empanadas se apoya en la mesa a tamaño real ("avance decente"). Para más realismo hay que escanear los platos (Polycam instalado; plan gratuito exporta GLB pero puede llevar marca de agua y tiene tope en el modo fotos: verificar con una prueba). Se mejoró el modelo provisorio a un plato con borde levantado (2,2 cm de alto). El menú se rediseñó con estilo de carta en café (Playfair Display + DM Sans, puntos guía, favoritos de la casa, miniaturas redondas) y 5 categorías: Entradas, Ensaladas, Platos de fondo, Postres y Bebestibles (24 platos de ejemplo). La demo se republica con `npx wrangler pages deploy web/menu --project-name=menu-demo --branch=main --commit-dirty=true` (dirección que abre: https://main.menu-demo.pages.dev).

## 2026-10-12 (madrugada) · Skills unificadas: sitio → menú → contexto

- **`crear-menu-digital` es una subrama de `crear-sitio-web`.** Hereda reglas, formulario, estilos, seguridad, publicación y checklist; `requisitos-menu.md` detalla qué se hereda, adapta o no aplica a una carta de una sola página. Cualquier mejora general se hace en la skill del sitio.
- **El menú ahora cumple los requisitos del sitio:** `title`/description/canonical/Open Graph, datos estructurados (Restaurant + Menu), `sitemap.xml`, `robots.txt` (con crawlers de IA), `llms.txt`, favicon y manifest, 404 y privacidad, CSP estricta con SRI para el visor 3D, HSTS y demás cabeceras, contraste calculado por estilo (AA), áreas táctiles de 44 px, textos de 12 px o más, "saltar a la carta", compartir con Web Share, tema automático claro/oscuro opcional y analítica sin cookies (Cloudflare Web Analytics). Las demos llevan `noindex`.
- **Cinco estilos de carta** para elegir (`node generar-menu.mjs --opciones`): café y dorado, crema y cobre, noche y oro, bistró vino y jardín.
- **Formulario del menú** (60 preguntas, 9 bloques: local, objetivo, carta, estilo en seis escalas, fotos y 3D, marca, QR, publicación, plazos) sobre el mismo motor que el de página web. Llega al panel con `tipo = menu` (columna nueva en `levantamientos`) o se copia por WhatsApp. Se genera con `node web/propuesta/fuentes/formularios.mjs`.
- **Motor del formulario ampliado:** `AGENCIA.whatsapp` y `AGENCIA.envio` (envío directo al panel) disponibles para cualquier cliente.
- **Skill `contexto_pagina_web` renombrada a `contexto_biodigital`** y ampliada a todo el proyecto (sitio, panel, formularios, menú, skills, publicación y pendientes). Copias en `~/.claude/skills/` y `respaldo-skills/`.
- **Aprendizaje:** un script en línea con una CSP estricta se bloquea silenciosamente (las apariciones suaves del menú no funcionaban en producción); todo script va en archivo propio. Verificado después en Cloudflare: sin violaciones de CSP y el 3D carga (modelos propios y de otro servidor).
- **Pendiente:** guardar el visor 3D en `vendor/` (pide permiso para descargarlo), generador de QR, publicar el sitio principal con la versión pública, y las pruebas reales de escaneo y Android.

## 2026-10-22 · Catálogo de sitios de ejemplo y módulo de reservas

- Se integró el trabajo de Benjamín (Mercado Pago, cobros apagados; no tocar Production).
- Revisor automático `web/herramientas/revisar.mjs` y cinta compartida "Ejemplo de Bío Digital" para los sitios de muestra.
- Módulo de reservas reutilizable (`web/propuesta/ejemplos/_compartido/reservas.*`): modos horas y noches, .ics, WhatsApp, demo; probado 60/60 en Chrome sin ventana.
- Ejemplos terminados: estudio contable, servicio técnico, barbería, pastelería (con carta), restaurante (menú 3D). A medias por límite de uso: estética, cabañas, dental.
- Pendiente: terminar los 3, integrarlos al carrusel con capturas reales, galería, commit y publicación en vista previa.

## 2026-10-22 (tarde) · Ejemplos sobre plantillas, carrusel con páginas reales y políticas

- **Los 7 sitios de ejemplo se rehicieron sobre plantillas reales** (pedido del usuario: "a partir de plantillas, no de tu ingeniería"). Una plantilla por rubro: estética ← Forma pilates studio, cabañas ← Villa Aurelia, dental ← Oris Dental, contable ← Taxo, técnico ← Kyntra (21st.dev); barbería ← DBC Dallas Barber Club, pastelería ← Boolka (Framer). Fogón del Sur queda como está (es la demo del menú digital). Detalle, enlaces y qué se cambió en `memoria/ejemplos-matriz.md`.
- **Diferenciación (Taller de Emprendimiento, Mod 1.3):** cada ejemplo le habla a un segmento no atendido y se describe con la matriz CREA. Se cambiaron colores de la plantilla cuando chocaban con otro ejemplo: Kyntra azul → verde (dental ya es azul), Boolka naranjo → frambuesa (contable usa naranjo). Se descartó Crumb para la pastelería porque es en blanco y negro como la barbería.
- **Trazabilidad (DCP, PM 03):** matriz requisito → entregable → criterio de aceptación → caso de prueba en `memoria/ejemplos-matriz.md`. Cada ejemplo tiene su guion en `web/herramientas/pruebas/` y todos pasan: desborde 0 a 390 y 1440 px, sin errores ni recursos fallidos.
- **Fotos:** de Unsplash (licencia libre), cargadas desde su servidor, sin descargarlas al proyecto, y marcadas como referenciales en el pie de cada ejemplo. No se pusieron fotos de personas identificables como si fueran el personal: los barberos y el equipo dental van con fotos del local o con monogramas. No se inventaron reseñas: las secciones de testimonios de las plantillas se reemplazaron.
- **Carrusel de la portada:** usa capturas reales de cada ejemplo (`ejemplos/<id>.webp`, 1200×750, `web/herramientas/capturar-ejemplos.mjs`). Al hacer clic se abre un visor con **la página en vivo** (marco a 1440 o 390 px, escalado), flechas para pasar de ejemplo y el botón "Abrir la página completa ↗". El clic en 3D no siempre llegaba a la tarjeta: ahora se busca la tira bajo el puntero. Se borraron las maquetas SVG antiguas (siguen en git).
- **Galería `ejemplos/index.html`** (generada desde `fuentes/maquetas.mjs`): las 8 páginas con su segmento y su matriz CREA.
- **Políticas:** `privacidad/` y `terminos/` (generadas por `fuentes/legales.mjs`), enlazadas en el pie y en la casilla "Acepto la política de privacidad". Se basan en la Ley 19.628 y consideran la Ley 21.719 y la Ley 19.496. Describen lo que el sitio hace hoy: Supabase (São Paulo), Cloudflare, Google Fonts, Mercado Pago (aún apagado), el carrito y el tema guardados en el navegador, sin cookies de seguimiento.
- **Decisiones propuestas en las políticas que el equipo debe confirmar:** guardar las solicitudes sin contrato 12 meses; responder solicitudes de datos en 15 días hábiles; retracto de 10 días si el trabajo no empezó y devolución de la parte no hecha si ya empezó; tribunales de Concepción. Falta confirmar si Bío Digital tiene razón social o RUT: la política no lo menciona.
- **Aprendizajes técnicos:** (1) un título con interlineado menor a 1 dentro de un contenedor con `overflow: hidden` corta los tildes de las mayúsculas (barbería y pastelería); (2) Bowlby One no trae tildes, así que se cambió por Lilita One; (3) el `scroll-behavior: smooth` hace fallar las pruebas que usan `scrollTo`, por eso las pruebas usan `behavior: 'instant'`; (4) un documento interno dentro de `web/propuesta/` se publica con el sitio, así que la matriz quedó en `memoria/`.
- **Pendiente:** commit y publicación en una vista previa (no en Production mientras dure la fase de pagos); que el equipo revise las políticas; acortar la página principal.
- **22-oct (noche) · Vista previa publicada** a pedido del usuario ("haz todo lo necesario para ver el avance"): `npx wrangler pages deploy --branch=ejemplos --commit-dirty=true` desde la raíz → https://ejemplos.biodigital-propuesta.pages.dev (versión de trabajo, con rueda de colores). Production no se tocó. Verificado en línea: portada sin errores ni recursos fallidos, carrusel y visor OK, galería, ejemplos y páginas legales responden 200. Sigue sin commit.

## 2026-10-22 (noche) · Investigación de competencia y mejoras aplicadas

- Informe completo en `memoria/competencia.md`: mercado (solo 23,1 % de las pymes tiene web, CCS 2024), mapa de competencia con precios (freelancers desde $55.000, INAN desde $160.000 + IVA, AgendaPro desde $15.900 + IVA al mes, menú QR de $4.000 a $9.000 al mes, constructores con IA de US$11 a 17 al mes), costo total a 3 años y velocidad medida con el mismo método para todos.
- **Corregido (crítico):** la página prometía "se guarda en Google Wallet y Apple Wallet" a $9.990 sin mensualidad, pero la ficha del servicio dice que esa variante cuesta US$25 a 50 al mes. Ahora se promete la variante QR (acceso directo en el celular) y Wallet se cotiza aparte.
- **Aplicado:** sección pública "Cuánto cuesta tener tu página en 3 años" (por categoría, sin nombrar marcas, con valores aproximados); `srcset` en las fotos de los ejemplos (cabañas de 3,7 MB a 0,9 MB en celular); miniaturas de 720 px para el carrusel (208 KB por 8 tarjetas); recordatorio de 1 día antes en las reservas por noche; herramientas `pruebas/peso.js` y `pruebas/lcp.js`.
- **Recomendado, decide el equipo:** volver a ofrecer la ficha de Google Business (costo $0, mayor impacto local, y Google cerró sus sitios gratuitos en 2024); garantía 50 % al aprobar la maqueta y 50 % al entregar; pedir caso documentado y reseña a los primeros 5 clientes; correo con dominio por reenvío gratuito; alérgenos, inglés y analítica en el menú; Sercotec Kit Digital ($1,2 millones; próxima convocatoria estimada para junio de 2027).
- **22-oct (noche, cierre) · Check automático y accesibilidad de la portada:** `web/herramientas/check.mjs` → `memoria/CHECK.md` (13 páginas, 390 y 1440 px, con pruebas). La portada quedó sin áreas táctiles chicas ni textos de menos de 12 px: logo, íconos, menú, botones chicos, formulario, "Lanzamiento" y el botón del gato (se ve de 26 px y su área táctil es de 44 px). El título de la portada ya no se anima con opacidad, así que cuenta como contenido principal desde el primer cuadro. En laboratorio, una tarjeta del carrusel a veces aparece después y marca el LCP; con usuarios reales la medición se detiene al primer toque. Al revisor se le agregaron dos excepciones: las casillas dentro de una etiqueta de 44 px y los enlaces de texto dentro de etiquetas. Nueva prueba del estudio contable (la anterior era de la página vieja). Vista previa republicada.
- **22-oct (noche) · "Mira tu página" en la portada:** bajo el campo del nombre hay 8 fichas de rubro. Al tocar una, el visor abre el ejemplo de ese rubro con el **nombre del negocio del visitante** en el logo, el título y la pestaña (`?negocio=` en la dirección, reemplazo de texto con `textContent` en `ejemplos/_compartido/demo.js`, alias por ejemplo). "Abrir la página completa" conserva el nombre. Prueba `pruebas/tu-pagina.js` (5/5 a 390 y 1440 px, sumada al check). Publicado en la vista previa. Objetivo: que el cliente vea su propio negocio en segundos ("así como lo imagino, ya lo hacen").
- **Ideas para la próxima sesión (página propia):** sección "Cómo trabajamos" con el cronograma real de un proyecto (aplicar la clase de gestión del tiempo de DCP: hitos y ruta crítica de 3 a 7 días); garantía 50/50 si el equipo la aprueba; reemplazar ejemplos por casos reales cuando lleguen los primeros clientes.

## 2026-10-23 · Decisiones del usuario y encargo para el próximo chat

- **No** a la ficha de Google Business por ahora. **Sí** a crear ya la fidelización con QR. **No** a la garantía 50/50. Políticas sin datos todavía (plazos, razón social o RUT): se dejan como están. Production espera la información de Benjamín.
- **Se elimina** del sitio la sección "Cuánto cuesta tener tu página en 3 años".
- **Regla:** la página principal no crece más. Lo nuevo va en páginas aparte enlazadas desde la principal; por ejemplo, "Cómo trabajamos" en su propia página.
- **Encargo (detalle completo en la skill `contexto_biodigital`, sección "ENCARGO DEL USUARIO DEL 23-OCT-2026"):**
  1. Arreglar el scroll y los errores de Fogón del Sur y hacer el check de todas las páginas.
  2. Quitar la sección de 3 años y crear la página "Cómo trabajamos".
  3. Menú digital completo para restaurantes: pedir en la mesa, en línea y con delivery; GPS del repartidor en vivo; estados del pedido con color; tiempo estimado; juego mientras espera; pantalla de cocina; panel del dueño con visitas, pagos y opiniones.
  4. Sistema de reservas completo: motor, calendario e inventario en tiempo real, varios idiomas y monedas, promociones, panel con paquetes, capacidad, notificaciones automáticas, políticas, analítica, pagos, channel manager, PMS, CRM, ERP y calendarios externos; rubros hotel, tours, centro médico, espacios y salones; todo automático. Investigar la competencia antes.
  5. Commit y push al terminar.

## 2026-10-23 · Fallas de la competencia y correo con dominio

- Pedido del usuario: buscar a la competencia en internet, agregar algo que nos falte y resaltar sus fallas. Detalle con fuentes con nombre en `memoria/competencia.md` §10.
- **Página nueva `/antes-de-contratar/`** (`fuentes/antes.mjs`, misma plantilla que las políticas): 8 fallas del mercado (dominio a nombre de otro, anticipo sin nada escrito, "pago único" que se renueva, sitio atrapado en la plataforma, extras cobrados aparte, menú en PDF, páginas pesadas, correo solo con plan anual), cada una con su fuente y cómo lo hacemos, más "6 preguntas antes de pagarle a cualquiera". **No nombra marcas** (riesgo de publicidad comparativa y de repetir reclamos no verificados). Enlazada desde el pie y con una línea bajo las promesas de precios; **no se puso en el menú superior** porque apretaba la barra entre 800 y 1100 px. Cumple la regla de que la portada no crece.
- **Se quitó la sección "Cuánto cuesta tener tu página en 3 años"** (`#comparar` y estilos `.cmp`), como decidió el usuario. La portada quedó más corta.
- **Agregado al catálogo:** la página web incluye "Correo contacto@tunegocio.cl que llega a tu Gmail, sin mensualidad" (Cloudflare Email Routing + Gmail "Enviar como"; $0 recurrente según condiciones vigentes, verificar). Requiere el dominio .cl. Se puede revertir quitando el cuarto ítem de `SERVICIOS.web` en `fuentes/comun.mjs`.
- **Pendiente del equipo:** ¿plazo para la garantía de corrección (hoy sin plazo en los términos)? Revisar la página nueva cada 3 meses.
- Verificado: revisor sin desborde, textos chicos ni áreas táctiles chicas a 390 y 1440 px en la página nueva y la portada; el único error local es `/api/payments/config` (las Functions no corren en el servidor local). La página se sumó a `check.mjs`. No publicado ni en commit.

## 2026-10-23 (madrugada) · Encargo completo: Fogón del Sur, Cómo trabajamos, menú con pedidos, reservas y fidelización

- **Pedido del usuario:** "haz el sistema de reservas y completa el menú digital con todo lo que te pedí; no pares hasta completar todo". Se listó el encargo completo antes de empezar.
- **Fogón del Sur (tarea 1):** causa del scroll trabado: `scrollIntoView` en la barra de categorías, que movía la página mientras el dedo bajaba. Ahora se mueve solo la barra (`scrollLeft`). Se quitó `background-attachment: fixed`. El aviso de consola de `navigator.vibrate` (dentro del visor del carrusel) se evita vibrando solo con toques reales. Igual en `web/menu/`.
- **Cómo trabajamos (tarea 2):** página aparte con ruta crítica calculada al generar (5,5 días hábiles; crítica A → D → E → F → G y H → I; holgura de 1 día en fotos y de 3 en el dominio). Enlazada desde "Así te vamos avisando" y el pie. **Supuesto:** no estaba la clase de gestión del tiempo de DCP en el repo; se aplicó el método estándar de la ruta crítica. Revisar con la clase.
- **Menú con pedidos (tarea 3):** demo completa en Fogón del Sur (carta, seguimiento, cocina, repartidor, panel). Detalle, competencia y costos en `memoria/menu-pedidos.md`. **Se vende "a cotizar"**: no cabe en "Menú digital desde $27.990", y la base en la nube, los mapas y los pagos pueden tener costo mensual o por uso.
- **Reservas completas (tarea 4):** `ejemplos/reservas/` con panel. Detalle en `memoria/reservas-sistema.md`. **A cotizar** por la misma razón. Channel manager y PMS se describen y se cotizan aparte; iCal (Airbnb, Booking, Google) funciona gratis.
- **Fidelización con QR:** `ejemplos/fidelizacion/` (tarjeta del cliente con QR, sellos, protección contra sellos repetidos, canje) y `local/` (caja con cámara vía BarcodeDetector o código escrito, métricas). Sin mensualidad; Wallet sigue como cotización aparte.
- **Arquitectura de las demos:** datos en el navegador, sincronizados entre pestañas con BroadcastChannel, para que se puedan mostrar sin servidor. Para un cliente real: misma interfaz sobre Supabase (ya en uso) con el panel protegido como el panel interno.
- **Datos de prueba:** los paneles cargan datos generados marcados como "Cliente de prueba" / "Cliente de demostración", con estrellas pero **sin comentarios inventados**.
- **Pruebas:** `fogon-del-sur.js` (11/11), `reservas-sistema.js` (14/14), `fidelizacion.js` (6/6); las pantallas nuevas pasan el revisor (desborde 0 a 390 y 1440 px, sin textos chicos, sin errores) y se sumaron a `check.mjs`.

## 2026-10-23 (madrugada, 2) · Sistemas en las visualizaciones e íconos sobrios

- **Pedido del usuario:** mostrar en las visualizaciones todo lo trabajado (reservas, QR, paneles), que se vea bonito, mejores logos de cada cosa; "se ve muy animado la agenda".
- **Carrusel de la portada y galería:** 6 tarjetas nuevas con captura real (`fuentes/maquetas.mjs`, `sistema: true`): seguimiento del pedido (abre `pedido/?demo`, que crea un pedido de demostración), cocina, panel del restaurante, reservas, panel de reservas y tarjeta de fidelización. No salen en "Mira tu página". `capturar-ejemplos.mjs` acepta `ruta` y `preparar` (datos de prueba antes de capturar).
- **Íconos y logos:** fuera los emojis en reservas, fidelización y el mapa del pedido; íconos de línea SVG (iguales en todos los equipos) y un logotipo de sigla con color por negocio de la demo (en un cliente real va su logo). La tarjeta de fidelización pasó a café y crema, con taza en cada sello.
- **Menos animación en la agenda:** sin pulso en "Disponibilidad en vivo", sin rebote en la confirmación ni en las opciones; promociones en una franja neutra.
- **Paneles con datos la primera vez:** el panel de reservas, el del restaurante y la cocina cargan datos de prueba marcados la primera vez que se abren, para que el visor no muestre pantallas vacías.
- **Arreglo:** los gráficos de barras de los dos paneles salían vacíos (alto en % dentro de una grilla); ahora usan columnas flexibles.
- **Prueba antigua del módulo de reservas:** dependía de la fecha (a fin de mes no quedaban 3 noches libres en el mes visible); ahora sigue el calendario real del módulo. 60/60.

## 2026-10-23 (noche) · Todo automático, caso base, prueba de scroll real y cierre del chat

- **Pedido del usuario:** verificar que todo funcione con una simulación real, que todo sea automático (con opción de intervenir), revisar el scroll en todas las páginas y hacer un caso base con Fogón del Sur. Después: "gasta todo y pásame la página final publicada"; luego pidió actualizar skills y repo para seguir en un chat nuevo.
- **Modo automático del restaurante:** `pedidos.js` tiene un motor que corre en una sola pestaña líder (cualquiera de las pantallas abiertas). Tiempos del servicio: aceptar 1 min, servir 3, retiro 6, asignar repartidor 2, opinión 3; preparación según cada pedido; delivery por la ruta real hasta la puerta; lo que se paga en caja o al recibir queda pagado al entregar. Cocina con interruptor "Automático" y velocidad; el repartidor puede usar GPS real (entrega automática a 60 m). Panel con "Simular un servicio" (10 clientes, uno cada 6 s).
- **Caso base verificado:** `pruebas/fogon-servicio.js`, 14/14 (estados en orden, tiempos de preparación, rutas, llegada a la puerta, duración del viaje, pagos, opiniones sin textos inventados, panel cuadrado con pedidos, ventas y visitas). **Falla real encontrada y corregida:** "listo" se marcaba tarde y cada vez peor (comparaba contra un tiempo estimado que usa la hora de un instante después).
- **Reservas:** check-in y cierre automáticos; prueba 16/16.
- **Scroll:** herramienta `web/herramientas/scroll.mjs` con gestos reales. 44 de 46 recorridos bien. Arreglada la carta de la pastelería (mismo bug que Fogón). **Pendiente:** cabañas y barbería en celular siguen moviéndose 50 a 130 px después de soltar cerca del final (sin saltos de diseño; sospecha: trabajo por cuadro de sus efectos de scroll).
- **No alcanzó a correr** la auditoría con varios agentes (límite de sesión) ni la publicación final en la vista previa. Quedan como primeras tareas del próximo chat (skill `contexto_biodigital`, sección "PRÓXIMO CHAT").

## 2026-10-23 (noche, 2) · Scroll de cabañas y barbería en celular

- **Causa medida** (curva de `scrollY` cada 100 ms después de soltar + duración de cada cuadro): no eran saltos de diseño sino **cuadros de 300 a 600 ms** en `#adentro` y `#equipamiento` de cabañas. Durante esos cuadros el impulso del dedo queda retenido y se aplica de golpe después (ej.: 4917 → 5168 px). No hay tareas largas de JS: el costo era de pintura y de diseño forzado.
- **Arreglo en cabañas:** `cuadro()` de `sitio.js` ahora mide todo antes de escribir y solo escribe lo que cambió (antes forzaba 3 recálculos de diseño por cuadro); en celular (≤ 900 px) la barra fija y las dos cajas de vidrio de `#adentro` pasan de `backdrop-filter: blur()` a un fondo casi opaco (se ve igual y no se re-desenfoca en cada cuadro).
- **Arreglo en barbería:** mismo orden lectura → escritura en `barberia.js`; las polaroids heredan `--py` del collage (una escritura en vez de seis); las fotos con parallax y las polaroids (gris, sombra, filtro) van en capa propia (`will-change: transform`, solo con movimiento activado).
- **Resultado:** `scroll.mjs` sobre los dos, 3 rondas: 4/4, 4/4 y 3/4 (la falla, 47 px con umbral 40, fue con la auditoría de 6 agentes corriendo en paralelo; la máquina estaba cargada). Antes: cabañas fallaba siempre.

## 2026-10-24 · Auditoría: doble venta en reservas corregida y publicación final

- La auditoría (6 frentes) alcanzó a confirmar una falla alta: `pagar()` reactivaba una retención cancelada o vencida y la misma unidad quedaba vendida dos veces. Corregido en `reservas/motor.js` (`estado()` rechaza pagar/confirmar una reserva cancelada o con retención vencida y devuelve `{error}`); `reservar.js` vuelve al paso 2 y `admin.js` avisa.
- **Sin revisar:** el resto de los hallazgos de la auditoría (otros 100+ verificadores se cortaron por el límite de uso). Pendiente: relanzarla con `resumeFromRunId: wf_67573c7e-01e`. Hallazgo parcial conocido: una reserva cancelada igual recibe recordatorio y petición de opinión (`motor.js`, `programarAvisos`).
- Check completo 24/24 sin observaciones. Publicado en la vista previa `ejemplos`; Production sin tocar (espera datos de pagos de Benjamín).

## 2026-10-24 · Todo interconectado (de demo a flujo real) y 3D fuera

- **Pedido del usuario:** pedidos, reservas y fidelización no estaban conectados entre sí ni entre equipos (todo vivía en el navegador). Quiere el flujo real para mostrar a clientes y luego aplicarlo: pedir en la carta → llega a la cocina → seguimiento del cliente → panel del dueño; reservas con su panel; tarjetas con su caja. Con vistas separadas por rol. Juegos de LinkedIn en la espera. Quitar todo lo del menú 3D.
- **Hecho:** base en la nube propia (`biodigital-demos`, Supabase gratis) con PIN por rol y reglas contra trampas; detalle en `memoria/conexion-nube.md`. Se eligió un proyecto aparte del panel interno para no mezclar datos públicos de demo con las solicitudes reales del equipo.
- **Sin automático:** se eliminó el motor que avanzaba solo, el simulador y los datos falsos de siembra; cada paso lo marca una persona. Tiempos por plato (la cocina los ajusta).
- **Flujo de pago:** pago en línea (de prueba, Mercado Pago sigue apagado) lleva a `pagar/`; efectivo o pagar en caja/al recibir va directo al seguimiento. Seguimiento distinto para mesa, retiro y delivery (el mapa y "en camino" solo existen en delivery).
- **Juegos:** Zip, Queens, Tango y Sudoku mini con las reglas de los de LinkedIn y diseño propio. "Went" no se pudo identificar: queda por preguntar.
- **3D quitado** del sitio, la carta de Fogón, el catálogo (ya no existe "Menú digital interactivo"), el formulario del menú (preguntas de 3D), la mascota y la galería. Skills: se conserva la técnica como referencia futura.
- **Fallas reales encontradas por las pruebas y corregidas:** (1) cambios consecutivos de un mismo pedido llegaban al revés a la base (ahora se envían en orden); (2) la base devuelve los campos en otro orden: se compara de forma canónica; (3) un cliente con el código de su pedido podía cambiarle el estado (ahora solo agrega opinión y pago); (4) un cliente podía abrir una tarjeta con sellos (ahora solo en cero, y no edita).
- **PIN de la demo públicos** a propósito (para enseñar el sistema); avisado en pantalla. En un local real son privados.
- **Costo:** $0 hoy (plan gratis). Recurrente a vigilar: la base se pausa tras 1 semana sin uso y tiene límites; plan Pro ~US$25 al mes (aprox.; verificar).
- **Pendiente:** confirmar el cuarto juego, precio de las versiones completas, PIN reales y base propia por cliente, auditoría con varios agentes sobre el código nuevo.

## 2026-10-24 (tarde) · Correcciones tras la revisión del usuario en la página publicada

- **El carrito "no dejaba anotar el nombre":** los campos no definían color de texto y lo escrito salía negro sobre fondo oscuro; además el aviso de error quedaba oculto abajo del formulario. Ahora el texto es claro, el error sale junto al botón "Enviar pedido" y el campo faltante se marca en rojo y recibe el cursor. Prueba `fogon-del-sur.js` 3b y 3c.
- **Cliente veía "en ruta" sin que la cocina aceptara:** la pantalla del cliente mostraba el mapa "Dónde va tu pedido" y una hora de llegada desde que el pedido nacía. Ahora: en "Recibido" dice "Por confirmar" y "la cocina te dirá cuánto demora cuando acepte"; la hora aparece al aceptar (botón "Aceptar y empezar a preparar" con el tiempo que verá el cliente); el mapa aparece solo cuando el repartidor sale ("Dónde viene tu pedido") y se oculta al entregar. En mesa y retiro no hay mapa.
- **Panel del dueño muestra todo y en vivo:** tablero "En curso ahora" (pedidos activos con cliente, platos, estado, minutos, GPS y pago), lista de los 80 pedidos más recientes del período con cliente, platos, estado, pago y opinión (el CSV trae todos). Se actualiza solo en 1 a 3 s (comprobado: un pedido nuevo apareció en 1,2 s sin recargar).
- **Regla de diseño:** todo se actualiza solo (sondeo de la base), nunca hace falta recargar la página.

## 2026-10-24 (noche) · Menú digital como sistema completo y plantilla reutilizable

- **Pedido del usuario:** validación de campos con aviso claro; "Modificar mi pedido" sobre el MISMO pedido solo mientras está Nuevo; historial del cliente; panel del dueño (pedidos en vivo, carta, estadísticas, opiniones); pantalla de cocina y de reparto separadas; plantilla para otros restaurantes con fotos con licencia; revisión de precios.
- **Reglas en el servidor (no en el navegador):** trigger `demo.pedido_reglas` + `pedido_normalizar` + `transicion_ok` valida precios contra la carta publicada, opciones, mínimo de delivery, quién puede pasar a qué estado (cliente / cocina / reparto / dueño), un solo pedido Nuevo por sesión, modificación solo en "recibido" con control de versión (`rev`/`baseRev`; si el estado cambió mientras editaba, el guardado se rechaza con explicación), versiones anteriores en `ediciones`, historial escrito por el servidor, repartidor único (`tomar`). Migraciones 003-005 aplicadas por MCP; el repo tiene 002 (**pendiente: guardar en el repo el SQL final de 003-005**).
- **Panel del dueño** (`panel.js`, `panel-carta.js`, `panel-negocio.js`): Pedidos en vivo con aviso visual y sonoro (una vez por pedido; configurable), "cliente modificando", aceptar/rechazar con motivo, asignar repartidor, historial y versiones; Carta (agregar/editar/ocultar/eliminar platos y categorías, foto propia, opciones, publicar sin reconstruir; los pedidos viejos conservan nombre y precio); Estadísticas solo con datos reales (ventas, ticket, más y menos pedidos, por hora, por estado, CSV); Opiniones con respuesta; Negocio y equipo (identidad, envíos, PIN del personal).
- **Plantilla:** `web/herramientas/nuevo-restaurante.mjs` + `memoria/plantilla-restaurante.md`. Estructura = código; datos = base bajo un "negocio" propio. Las funciones del servidor no mencionan ningún local en particular.
- **Fotos de la carta base:** 24 platos con fotos con licencia (CC0/PD/CC BY) y créditos en `fotos/CREDITOS.md`. Son de ejemplo; en un cliente real se reemplazan por las suyas.
- **Precios:** propuesta de 3 tramos en `memoria/precios-menu-digital.md` (instalación única $149.000 / $249.000 / $349.000 y mensualidad $14.900 / $24.900 / $34.900, netos). **No se cambió el catálogo del sitio: requiere aprobación del equipo.** Datos de terceros aproximados; las comisiones de apps (2020) y Mercado Pago (2021) son antiguas.
- **Riesgo nuevo:** con 3 clientes la mensualidad apenas cubre Supabase Pro (~US$25), que es obligatorio antes del primer cliente real (el plan gratis se pausa). El negocio está en la instalación.
- **Pendiente:** publicar a Production solo con datos de pago de Benjamín; `web/menu/` (versión antigua) aún contiene 3D; PIN en texto plano en la base (demo).
- **Corrección (revisión del usuario):** en el panel del dueño 16 de los 24 platos (los que no traen opciones) no abrían "Editar": el editor asumía que todos tenían grupos de opciones. Corregido en `panel-carta.js` y agregado a `pruebas/panel-dueno.js` (abre el editor de los 24). De paso, cada línea del carrito del cliente ahora tiene "Editar" (opciones, cantidad y nota).

## 2026-10-24 (noche) · Restaurante: solo dos páginas y portada con las cuatro imágenes

- **Pedido del usuario:** lo del menú digital estaba disperso en la galería (la carta arriba y la cocina, el pedido y el panel más abajo, mezclados con otros rubros). Quiere **dos entradas**: (1) el menú para ver la carta y pedir; (2) el panel del restaurante, donde cada persona entra con su código (cocinero, repartidor o jefe). En la portada, el carrusel muestra cuatro imágenes seguidas: menú, pedidos (delivery con repartidor en el mapa), cocina (pedidos de cada tipo) y panel (estadísticas de muestra); cada una lleva a una de las dos páginas.
- **Hecho:** `fogon-del-sur/panel/` es el acceso único del equipo: el código decide a dónde entras (cocinero → cocina, repartidor → reparto, jefe → administración). Cocina y reparto sin código mandan al panel. La demo muestra los tres códigos (`restaurante.config.js`, `pistas.equipo`). Galería: tarjetas del restaurante = menú + panel; las imágenes de pedidos y cocina solo salen en el carrusel (`soloCarrusel`), y el carrusel las lleva al menú (pedidos) y al panel (cocina y panel) con `destino` en `maquetas.mjs`.
- **Capturas con datos de muestra sin tocar los pedidos reales:** `web/herramientas/semillas-restaurante.mjs` copia la plantilla a `ejemplos/captura-fogon/` (negocio aparte `captura-fogon`, con los mismos PIN de la demo, creado en la base el 24-oct), carga 56 pedidos y 140 visitas con `nube_importar`, `capturar-ejemplos.mjs` toma las imágenes y luego borra todo. Las imágenes se repiten igual (números con semilla fija).
- **Pendiente:** repetir las capturas si cambia el diseño del restaurante: `node web/herramientas/capturar-ejemplos.mjs restaurante-cocina restaurante-panel` (con el servidor local encendido).

## 2026-10-24 (noche) · Una sola dirección de trabajo: https://biodigital-bgw.pages.dev

- **Decisión del usuario:** desde ahora el equipo trabaja y publica solo en https://biodigital-bgw.pages.dev (proyecto Cloudflare Pages `biodigital`, rama `main`). Publicar: `node web/propuesta/fuentes/generar.mjs --publico 8` + `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`; luego `node web/propuesta/fuentes/generar.mjs 8`.
- **Mercado Pago:** en el sitio en uso los pagos funcionan con los **9 enlaces fijos** de `enlaces-pago.mjs` (direcciones `mpago.la`, no dependen del dominio), con `PAYMENTS_ENABLED=false`. Lo que **no** se mueve solo es el cobro por API de prueba (D1 `biodigital-payments-test`, secretos `MP_*`, webhook), que vive solo en la vista previa `payments-test.biodigital-propuesta.pages.dev`. **Para Benjamín:** probar un pago real con un enlace desde biodigital-bgw.pages.dev y decidir si el cobro por API se pasa al proyecto `biodigital` o se deja fuera.
- **Pendiente de confirmar con el usuario antes de borrar:** `biodigital-propuesta.pages.dev` (Production anterior, es el link que se pegó en Instagram/WhatsApp y trae el entorno de pruebas de pagos) y la vista previa `ejemplos`. Alternativa sin romper links: dejar el Production anterior redirigiendo a biodigital-bgw.pages.dev.
