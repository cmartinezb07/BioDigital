---
name: crear-menu-digital
description: Subrama de crear-sitio-web para el menú digital de un cliente de Bío Digital (restaurante, cafetería, bar, local de comida): carta con QR, estilo de restaurante y plato en vivo (el cliente elige un plato y lo ve en 3D y, desde el celular, sobre su mesa con la cámara). Incluye el formulario de gustos y forma para el cliente, varios estilos para elegir, el generador (menu.json → sitio estático con SEO, seguridad y accesibilidad), la guía de captura 3D y la publicación. Úsala cuando pidan crear, armar, rediseñar, actualizar o publicar un menú digital, carta con QR o el "plato en vivo" / menú interactivo, aunque no digan "menú digital".
---

# Crear menú digital (subrama de crear-sitio-web)

> **Actualización 24-oct-2026:** (1) el **plato en 3D y la realidad aumentada están postergados** por decisión del usuario: no se ofrecen ni se muestran en el sitio, la carta de ejemplo ni el formulario; lo de 3D/AR de esta skill queda como referencia para cuando se retome. (2) El **sistema de pedidos del restaurante está conectado en la nube** (pedido → cocina → seguimiento → panel, con PIN por rol, juegos de espera y GPS del repartidor): ver `memoria/conexion-nube.md` y el ejemplo `web/propuesta/ejemplos/fogon-del-sur/`.

**Responder siempre en español.**

> **Esta skill depende de `crear-sitio-web`. Léela primero** (`~/.claude/skills/crear-sitio-web/SKILL.md` y `referencias/requisitos.md`).
> Todo lo que aquí no se redefine se hereda de ella. El menú es una página de una sola pantalla larga, así que algunas
> partes del sitio completo no aplican; la tabla de `referencias/requisitos-menu.md` dice, punto por punto, qué se
> hereda, qué se adapta y qué no aplica. Si la página que piden es otra cosa (landing, sitio de servicios), usa solo `crear-sitio-web`.

Todo lo repetitivo está resuelto en `plantilla/` (generador, estilos, visor 3D, formulario, herramientas de fotos). No lo reescribas: copia la plantilla a `clientes/<nombre>/` y llena `menu.json`.

## Qué recibe el cliente
- Una carta con estilo de restaurante: portada, "Favoritos de la casa", categorías (entradas, ensaladas, platos de fondo, postres, bebestibles…), buscador, foto redonda, descripción, precio, etiquetas dietéticas y "Agotado hoy". Los platos sin foto se ven como línea de carta.
- En los platos con 3D, el botón **"Ver en tu mesa"**: visor 3D (se gira con el dedo) y, desde el celular, la cámara pone el plato sobre la mesa a tamaño real. En computador solo se ve el 3D.
- Un QR impreso que abre la carta. **No hace falta tener 3D de toda la carta**: los platos sin 3D se ven con foto.
- Estilo a elegir entre varios (`referencias/esteticas-menu.md`), con modo claro/oscuro automático si el cliente lo quiere.

## Reglas que no se negocian (las de crear-sitio-web, aplicadas al menú)
- **No inventar nada**: platos, precios, direcciones, horarios, alérgenos, fotos, reseñas, años. Todo sale de lo que entrega el cliente. Si falta: `[PENDIENTE]` y se avisa. **Los alérgenos y etiquetas (vegano, sin gluten) solo los que el cliente confirme**: una etiqueta falsa es un riesgo de salud.
- **Las referencias del cliente mandan.** Si manda cartas o links que le gustan, cada estilo se acerca a ellas y se confirma el mapeo antes de construir.
- **Trabaja por fases**, muestra qué hiciste y qué falta, y no digas "terminado" sin pasar la verificación de `referencias/verificacion.md`.
- **El cliente no edita nada.** Los cambios de carta y precios los hacemos nosotros (editamos `menu.json` y volvemos a publicar). Cuánto se cobra un cambio: *por definir con el equipo*.
- **Costo único vs recurrente**: el menú no lleva mensualidad nuestra. El dominio .cl es aparte (≈ $10.000 al año en NIC Chile; verificar en nic.cl) y el hosting en Cloudflare Pages no tiene costo para el cliente (verificar términos vigentes). Si una app de escaneo cobra, es un costo del servicio.
- **Precio de la versión interactiva (3D): por definir.** Hoy el sitio la muestra "a cotizar"; no prometas valores al cliente.
- **Sin permiso del usuario no descargues archivos ni instales paquetes** (ni modelos, ni librerías, ni generadores de QR).
- Idioma de la carta: como habla el cliente final, frases cortas, sin jerga técnica.

## Fase 0 — Levantamiento: el formulario de gustos y forma
1. Entrega el formulario si el dueño no está en la conversación (lo normal): `plantilla/formulario/` → `node construir-formulario.mjs` crea `formulario-menu.html` (60 preguntas, 9 bloques, 15 minutos: local, objetivo, carta, estilo en seis escalas, fotos y 3D, marca, QR, publicación, plazos). En Bío Digital ya está publicado como `formulario-menu.html` y las respuestas llegan al panel (pestaña Formularios, tipo "Menú digital") o se copian por WhatsApp.
2. Si el dueño sí está (visita en terreno): úsalo como guion y anota; sale mejor que dárselo a leer.
3. **Cómo leer las respuestas y convertirlas en decisiones: `referencias/levantamiento-menu.md`.** Resume en 10 líneas lo que entendiste y pide confirmación antes de armar nada.
4. Mínimo para empezar: carta completa con precios, categorías, estilo (o "propónganme"), horario/dirección/WhatsApp, qué platos llevarán 3D y fotos disponibles.

## Fase 1 — Opciones de estilo
`node generar-menu.mjs --opciones` genera la misma carta en 5 estilos (`opciones.html` + `opcion-<estilo>.html`). Se las muestras al cliente en su celular, con fortalezas y riesgos honestos (`esteticas-menu.md`). Si pidió algo distinto, ajusta `tema` en `menu.json` (colores, letras, modo automático). Si trae referencias, se usan como guía del ajuste.

## Fase 2 — Contenido y fotos
1. Copia `plantilla/` a `clientes/<nombre>/`; pon fotos en `fotos/` y modelos en `modelos/`.
2. Fotos de tarjeta: `python foto-a-modelo.py tarjeta foto.jpg fotos/plato.webp --caja X Y LADO` (cuadradas, ≤ 120 KB).
3. Imagen para redes: `python foto-a-modelo.py og og.jpg --nombre "…" --lema "…" --foto fotos/plato.webp` (1200 × 630).
4. Edita `menu.json` (`referencias/esquema.md`): datos del negocio, `url` final, categorías y platos tal como los entregó el cliente. Sin `"demo": true`.
5. **Captura 3D** de los platos estrella (`referencias/captura-3d.md`). Hay dos niveles; no los confundas al vender:
   - **3D real (escaneo)**: el plato tiene volumen y se ve de todos lados. Es lo que se promete como "plato en vivo".
   - **Plato plano desde una foto (provisorio)**: `python foto-a-modelo.py disco foto.jpg modelos/plato.glb --centro CX CY --radio R --diametro-cm 26` crea un plato del tamaño real (2,2 cm de alto, borde levantado) con la foto desde arriba como textura. Se ve realista desde arriba, pero **es plano**. Sirve para pruebas y como solución mínima; no se vende como 3D. Las fotos en ángulo no sirven. Una foto sola **no puede** convertirse en 3D real.

## Fase 3 — Generar y verificar
`node generar-menu.mjs` crea `index.html`, `404.html`, `privacidad.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.svg`, `manifest.webmanifest` y `_headers`, con datos estructurados (Restaurant + Menu), canonical, Open Graph y política de seguridad. Lee el informe "Revisar:" y corrígelo **todo**. Después sigue `referencias/verificacion.md` (computador y **celulares reales**: iPhone con Safari y Android con Chrome; la realidad aumentada solo se puede probar en un celular).

## Fase 4 — Publicación (la ejecuta el usuario)
- Un proyecto de Cloudflare Pages por cliente: `npx wrangler pages deploy clientes/<nombre> --project-name=menu-<nombre> --branch=main --commit-dirty=true`.
- **Ojo:** si el proyecto lo crea el primer deploy, Cloudflare lo toma como "vista previa" y la dirección corta da 404. La dirección que abre es `https://main.<proyecto>.pages.dev`. Para activar la corta, cambiar la rama de producción a `main` en Cloudflare (Settings) y volver a publicar.
- Dominio propio con HTTPS antes de imprimir el QR. QR **estático** (no uno "dinámico" que vence o pide suscripción), en SVG o PNG grande, probado escaneando desde otro celular. Con dominio propio, el QR lleva el dominio, no `pages.dev`.
- Analítica sin cookies (Cloudflare Web Analytics) en vez de GA4 con banner: ver la decisión en `requisitos-menu.md` §9.
- Para producción, guardar el visor 3D en `vendor/model-viewer.min.js` (el generador lo detecta y deja de usar el CDN de Google). Requiere permiso del usuario para descargarlo.

## Fase 5 — Entrega
Acta con la dirección, el QR en alta resolución, la lista de platos con 3D, los accesos a nombre del cliente (dominio, Cloudflare, analítica) y quién hace los cambios. Anotar en `memoria/decisiones.md`: cliente cerrado, estilo elegido, pendientes.

## Decisiones técnicas ya tomadas
- Visor y realidad aumentada: **model-viewer de Google 3.5.0** con hash SRI, cargado solo al abrir el primer plato en 3D. Modos de AR: `webxr`, `scene-viewer` (Android) y `quick-look` (iPhone, genera el USDZ desde el GLB). Colocación en piso/mesa y tamaño real: el modelo debe estar en **metros reales**. Los modelos comprimidos con Draco o KTX2 necesitan `www.gstatic.com` en la política de seguridad (el generador ya lo incluye).
- Sitio 100 % estático, sin base de datos ni cuentas, sin cookies, sin formularios. Todo el texto de los datos entra como texto, nunca como HTML armado a mano.
- El tema por defecto de la plantilla es "café y dorado" (el que gustó). Modo automático claro/oscuro disponible con `tema.auto`.
- Los modelos de muestra de la demo están en otros servidores (el generador lo avisa); en un cliente real siempre van en `modelos/` del propio menú.
- Probado: AR en un iPhone 15 Pro con un plato plano hecho desde una foto (12-oct-2026). Falta probar con un escaneo 3D real y en Android.

## Módulo de pedidos para restaurantes (23-oct-2026)
Versión completa, a cotizar (no cabe en el precio del menú simple). Vive en `web/propuesta/ejemplos/fogon-del-sur/` y se suma a cualquier carta generada con 3 archivos y 4 páginas:
- En la carta: `<link rel="stylesheet" href="sistema.css">` y, después de `menu.js`, `<script src="pedidos.js"></script><script src="pedir.js"></script>`. `pedir.js` lee `#menu-datos` y agrega "Agregar" a cada plato (los artículos deben seguir el orden de la carta), el carrito, mesa (`?mesa=N` en el QR de cada mesa), retiro y delivery con envío por comuna.
- Páginas: `pedido/` (seguimiento con estados de color, tiempo estimado, mapa Leaflet 1.9.4 con SRI, juego `juego.js` y opinión), `cocina/` (KDS), `repartidor/` (GPS del celular) y `panel/` (visitas, pedidos, pagados, ventas, opiniones, referencias).
- Configuración del local en `pedidos.js` → `CONFIG` (dirección y coordenadas, mesas, pedido mínimo, envío por comuna, tiempos).
- La demo sincroniza pestañas del mismo navegador; un local real necesita base en la nube (Supabase). Costos recurrentes y competencia en `memoria/menu-pedidos.md`.
- **Modo automático (23-oct-2026):** `pedidos.js` mueve el servicio solo desde una pestaña líder (acepta, cocina según el tiempo de preparación, sirve, entrega, repartidor por la ruta real, cobra al entregar). Interruptor y velocidad en la cocina; GPS real opcional del repartidor; "Simular un servicio" en el panel. Caso base: `web/herramientas/pruebas/fogon-servicio.js` (14/14). Tiempos del servicio en `TIEMPOS` dentro de `pedidos.js`.
- Prueba: `web/herramientas/pruebas/fogon-del-sur.js`. Para reservas de mesa o eventos, usar el sistema de `ejemplos/reservas/` (modo horas o bloques).

## Mascota (opcional)
No va por defecto en un menú: la carta debe ser rápida y limpia. Si el cliente la pide, usa el módulo de `crear-sitio-web/referencias/mascota.md` y verifica que no tape los platos.

## Sistema completo con pedidos (24-oct): plantilla reutilizable
El menú de Fogón del Sur ya no es HTML fijo: la carta, fotos, precios, opciones, comunas y personal son **datos** que el dueño administra desde `panel/` y se publican sin reconstruir. Para un restaurante nuevo: `node web/herramientas/nuevo-restaurante.mjs --id <id> --nombre "<Nombre>"`, ejecutar el SQL que genera en Supabase y entrar al panel. Estados, permisos y modificación del pedido los valida el servidor. Detalle y límites en `memoria/plantilla-restaurante.md`; precios en `memoria/precios-menu-digital.md`.

## Pendiente (preguntar al equipo)
Precio de la versión interactiva (base + por plato), quién cobra los cambios de carta, impresión y entrega de los QR, y si la demo pública se mantiene.

## Verificación con el revisor automático
Usa `node web/herramientas/revisar.mjs http://localhost:<puerto>/<carpeta>/index.html --tag <cliente>` (ver crear-sitio-web). Para el catálogo de Bío Digital, el menú de demostración también vive copiado como ejemplo en `web/propuesta/ejemplos/fogon-del-sur/` (con la cinta "Ejemplo de Bío Digital"); el de la pastelería se generó con esta skill en `ejemplos/casa-dulce/carta/` (estilo crema). Si un cliente quiere reservas de mesa, se puede montar el módulo `ejemplos/_compartido/reservas.js` en modo horas.
