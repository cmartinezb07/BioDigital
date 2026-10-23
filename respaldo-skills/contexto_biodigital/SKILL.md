---
name: contexto_biodigital
description: Contexto completo de Bío Digital (startup de 5 estudiantes UdeC en el Gran Concepción) para retomar el trabajo en un chat nuevo sin releer todo: sitio web, tienda y carrito, panel interno con login y caja, formularios para clientes, menú digital con plato en vivo, las skills crear-sitio-web y crear-menu-digital, publicación en Cloudflare, Supabase, catálogo y precios, decisiones, pendientes y lecciones. Úsala cuando pidan editar, regenerar, publicar o ampliar cualquier cosa de Bío Digital (página web, gato mascota, paleta, logo, precios, promociones, panel, formularios, menú digital, demos, skills) o preguntan en qué quedó el proyecto.
---

# Contexto: Bío Digital (todo el proyecto)

**Responder siempre en español.** Proyecto: `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP` · Repo privado: https://github.com/cmartinezb07/BioDigital · Antes de nada lee `MEMORY.md`, `memoria/estado-actual.md` y el final de `memoria/decisiones.md` (bitácora; la más reciente está al final).

## Qué es
Startup de curso (Dirección y Control de Proyectos, UdeC): activación de presencia digital para micro y pequeñas empresas del Gran Concepción. 5 personas; jefe de proyecto: Christhoper. Meta: 3 a 5 clientes cerrados, pagados y transferidos en el semestre. Capital semilla: $80.000 CLP. **Solo operamos en el Gran Concepción** (Concepción, Talcahuano, Hualpén, San Pedro de la Paz, Chiguayante, Coronel, Lota, Penco, Tomé, Hualqui). El brief está en `contexto.md`.

## Reglas del usuario (siempre)
- Español. Seguir las referencias que manda **al pie de la letra**. **No inventar** reseñas, cifras ni datos: usar `[PENDIENTE]` / "por confirmar". Ser crítico antes de borrar. Anotar decisiones en `memoria/decisiones.md`. Distinguir costo único de recurrente. Cifras de terceros (dominio, hosting, apps) como aproximadas.
- **El cliente no edita nada** (ni página, ni menú, ni servicios): los cambios los hace Bío Digital. No prometer "te enseñamos a editarla".
- Los **deploys** (`wrangler pages deploy`) y el **push** a GitHub los ejecuta el usuario, salvo que lo pida o mientras esté ausente y lo autorice. No crear commits sin que lo pida.
- **Las skills se actualizan en las dos copias**: `~/.claude/skills/<skill>/` (la que se usa) y `respaldo-skills/<skill>/` (la del repo). Si cambias una, copia a la otra.

## Datos de contacto y costos (única fuente: `web/propuesta/fuentes/config.mjs`)
WhatsApp **+56 9 4694 1640** (`56946941640`) · Instagram **@biodigital.cl** · correo biodigitalici@gmail.com · dominio .cl: **$10.000 al año** en NIC Chile (verificar en nic.cl) · hosting de la página en Cloudflare, sin costo para el cliente (verificar términos vigentes) · llaves publicables de Supabase (públicas por diseño). Para cambiar un dato: editar `config.mjs` y regenerar.

## Catálogo vigente (desde 11-oct-2026; costo único, sin mensualidad)
Página web desde $49.990 · Videos para redes desde $9.990 · Menú digital desde $27.990 · Registro fotográfico $4.990 · Reservas desde $24.990 · Tarjeta de fidelización $9.990 → suma $127.940. **Pack completo $79.990** (ahorro $47.950). Dominio y hosting no incluidos. Los demás servicios están en stand by (`servicios-futuros/`).
- **Versión interactiva del menú digital** ("plato en vivo", 3D + cámara): "cuesta más", **precio a cotizar** (base + por plato por definir). Se agrega al carrito como "A cotizar".
- **Promociones:** primeros 5 clientes: pack a $69.990, o 10 % sobre compras desde $30.000. Fugaces: 2 videos $17.990 · 3 videos $24.990 · fidelización $7.990 · menú+fotos $29.990 · reservas+fidelización $29.990.
- **Diagnóstico gratis** en el primer contacto (ya no es una sección con puntaje en la página).

## Sitio web (`web/propuesta/`)
- **El sitio = opción 8** → `index.html` (generado). Las opciones 3–7 son plantillas ya hechas en `plantillas/`. **No editar los HTML generados**: regenerar con `node fuentes/generar.mjs [3 4 … 8]` desde `web/propuesta`. Para publicar: `node fuentes/generar.mjs --publico 8` (quita la rueda de colores del equipo y el aviso de prototipo; después se vuelve a generar sin flag para seguir trabajando).
- Archivos: `fuentes/comun.mjs` (contenido compartido: catálogo, promos, FAQ, formulario del pedido, carrito), `fuentes/opcion-8.mjs` (estética y portada), `fuentes/config.mjs` (datos), `fuentes/maquetas.mjs` (ejemplos del carrusel), `fuentes/formularios.mjs` (genera los dos formularios), `kit.css`/`nucleo.css`, `tienda.js/.css` (desglose por producto, carrito, formulario con validación y envío), `carrusel.js/.css` (carrusel curvo de ejemplos y visor), `secciones.js`, `mundo.js`, `movimiento.js`, `paleta.js/.css` (rueda de colores del equipo), `gato.js/.css`, `mascota.js`, `mascota-gato.js`.
- **Portada:** carrusel curvo con las capturas reales de los 8 sitios de ejemplo; clic → visor con la página en vivo y botón para abrirla (ver "Sitios de ejemplo" más abajo). Movimiento suave con el mouse (`data-par`).
- **Precios:** cada producto se abre con "qué incluye" y "cómo funciona" y botón de carrito; carrito en panel lateral (guardado en el navegador; los precios salen del catálogo de la página). Formulario del pedido: nombre, negocio, rubro, **comuna (lista cerrada del Gran Concepción)**, correo, celular (+56 9), qué te interesa (solo si el carrito está vacío), con validación estricta. Botones: enviar por correo y por WhatsApp (logos); además deja la solicitud en el panel.
- **Gato mascota:** SVG por partes, frases en `mascota-gato.js`; habla poco (tope 5/min, 15 s entre comentarios, 2 sueltos por visita). Vive fuera de la columna del sitio (la columna llega a 1440 px y deja 150 px a cada lado).
- Marca: logo en 2 máscaras (la "B" con `--c1→--c2`, el texto con `--fg`), colores originales `--c1 #0da5ff`, `--c2 #00e5d0`.
- Páginas aparte: `formulario.html` (59 preguntas, página web) y `formulario-menu.html` (60 preguntas, menú digital), generadas por `fuentes/formularios.mjs` desde las skills; envían al panel, copian y abren WhatsApp.

## Panel interno (`web/panel/`, ver su `LEEME.md`)
- Sitio estático sin librerías: https://main.biodigital-panel.pages.dev (la dirección corta da 404 hasta cambiar la rama de producción a `main` en Cloudflare).
- **Supabase** proyecto `biodigital-panel` (id `mkxxqhywwzsaeojfmkme`, São Paulo, gratis, se pausa tras 1 semana sin uso). Tablas: `staff` (lista autorizada: hoy solo cmartinezb07@gmail.com, admin), `solicitudes`, `levantamientos` (columna `tipo` = web | menu), `caja`, `auditoria`, `limite_envios`. Funciones `privado.es_staff()` / `es_admin()`.
- **Seguridad:** RLS en todo; el público solo inserta en `solicitudes` y `levantamientos` (columnas y valores validados, tope 5 envíos/10 min por conexión y 200/hora); leer o editar exige estar en `staff`, correo confirmado y segundo factor (aal2); solo admins borran. Login con contraseña (11+ con mayúscula, minúscula, número y símbolo) + TOTP. Sesión se cierra a los 15 min sin uso; CSP estricta; CSV a prueba de fórmulas.
- Pestañas: Resumen, Solicitudes (estados, responsable, notas), Formularios (tipo web o menú), Caja (saldo, ingresos, gastos, capital), Equipo, Actividad. "En vivo" = consulta cada 5 s.
- **Pendiente en Supabase (panel web):** Site URL = `https://main.biodigital-panel.pages.dev`; largo mínimo de contraseña 11; SMTP propio (el correo de prueba solo envía al dueño y los compañeros no reciben la confirmación). Cuenta de Christhoper ya creada y confirmada a mano. Para agregar compañeros: pestaña Equipo → Autorizar; luego ellos "Crear mi cuenta" (si no les llega el correo, confirmar la cuenta desde SQL).
- El proyecto Supabase `agente-whatsapp` (otro proyecto del usuario, con datos reales) está **pausado, no borrado**, para liberar el cupo gratis de 2 proyectos.

## Menú digital (`web/menu/`)
- Subrama de crear-sitio-web: carta estilo restaurante (café y dorado, Playfair + DM Sans) con 5 categorías (Entradas, Ensaladas, Platos de fondo, Postres, Bebestibles), favoritos, buscador, "Ver en tu mesa" (3D y AR con model-viewer 3.5.0 + SRI).
- Demo ficticia "Fogón del Sur": https://main.menu-demo.pages.dev (noindex). `node generar-menu.mjs --opciones` genera 5 estilos. Fotos de prueba que mandó el usuario; los discos planos (empanadas 26 cm, carne asada 28 cm) y la brocheta (modelo de muestra) tienen botón AR.
- **Estado de la AR:** probada en un iPhone 15 Pro con un plato plano desde foto (se apoya en la mesa a tamaño real). **Falta** probar con un escaneo 3D real (Polycam instalado; plan gratis puede llevar marca de agua y tiene tope en el modo fotos: probar exportación; alternativas Scaniverse y RealityScan) y en Android.
- Herramienta de fotos: `foto-a-modelo.py` (tarjetas, discos y `og`) con Pillow.

## Skills y cómo se relacionan
- **`crear-sitio-web`** (base): flujo completo de un sitio (preguntas → maquetas → sitio final → seguridad → publicación → checklist), formulario de 59 preguntas, mascota, requisitos SEO/seguridad.
- **`crear-menu-digital`** (subrama): depende de la anterior y la especializa: formulario de gustos y forma (60 preguntas), 5 estilos, generador (SEO, JSON-LD Restaurant/Menu, CSP, SRI, privacidad, 404, sitemap, llms.txt), captura 3D, verificación y entrega. Su `requisitos-menu.md` dice qué se hereda, adapta o no aplica.
- **`contexto_biodigital`** (esta): memoria operativa del proyecto. Reemplaza a `contexto_pagina_web`.
- Copias del repo en `respaldo-skills/`. El formulario del menú se arma sobre el motor del formulario de página web (una sola fuente).

## Publicación (Cloudflare Pages; la ejecuta el usuario)
Proyectos: `biodigital-propuesta` (sitio), `biodigital-panel`, `menu-demo`. Comandos desde la raíz del proyecto:
- Sitio: `node web/propuesta/fuentes/generar.mjs --publico 8` y `npx wrangler pages deploy web/propuesta --project-name=biodigital-propuesta --branch=main --commit-dirty=true`
- Panel: `npx wrangler pages deploy web/panel --project-name=biodigital-panel --branch=main --commit-dirty=true`
- Menú demo: `npx wrangler pages deploy web/menu --project-name=menu-demo --branch=main --commit-dirty=true`
- **Trampa conocida:** los proyectos creados por el primer deploy quedan con otra rama de producción: `proyecto.pages.dev` da 404 y `main.proyecto.pages.dev` abre. Arreglo: Cloudflare → proyecto → Settings → rama de producción = `main`.
- Antes de pegar el link en Instagram y WhatsApp Business: publicar la **versión pública** del sitio. Hoy el link vigente es https://biodigital-propuesta.pages.dev.

## Pendiente (consolidado)
- Probar la AR con un escaneo real (Polycam: exportar GLB y ver si trae marca de agua) y en Android; fijar el **precio de la versión interactiva** y quién cobra los cambios de carta.
- Ajustes de Supabase (Site URL, largo 11, SMTP); autorizar a los compañeros; publicar panel, sitio (versión pública) y menú demo con lo último; instalar `qrcode` o decidir el generador de QR (pedir permiso).
- Valor del hosting para reservas/menú/fidelización (si necesitan más que una página estática); capital semilla $80.000 en Caja como "Capital aportado".
- Acortar la página principal (el usuario define criterios con un amigo); probar a ojo la burbuja del tema; confirmar variante de logo.
- Preguntas viejas: Jornada de Terreno, plan de Claude y quién lo paga, piloto del bot de WhatsApp.
- **Hay mucho trabajo sin commit** (panel, menú, formularios, skills): ofrecer commit y push cuando el usuario lo pida.

## Cómo verificar
Navegador integrado a 1440 y 390 px: sin desborde (`scrollWidth`), textos ≥ 12 px, áreas táctiles ≥ 44 px, consola sin errores, recursos sin 404. Los `.reveal` quedan en opacidad 0 hasta entrar en pantalla. **El panel del navegador se "congela" si la ventana está oculta**: un `screenshot` lo despierta (los temporizadores y la carga de modelos pueden quedar a medias). Previews: `maquetas` (4321, sitio), `panel` (4322), `menu` (4323), todos con `web/servir.py` sin caché (`.claude/launch.json`).

## ENCARGO DEL USUARIO DEL 23-OCT-2026 (leer antes que todo; es la tarea del próximo chat)

**Decisiones del usuario (23-oct):**
- **Ficha de Google Business: NO por ahora.** No proponerla de nuevo salvo que el usuario lo pida.
- **Fidelización: SÍ, crear ya la tarjeta con QR** (variante sin mensualidad; Wallet queda como cotización aparte).
- **Garantía 50/50: NO** por ahora.
- **Políticas: todavía no hay datos** (plazos, razón social o RUT). Dejar las políticas como están.
- **Production: NO se toca** hasta que Benjamín entregue información de pagos. Seguir usando la vista previa `--branch=ejemplos`.
- **Quitar del sitio la sección "Cuánto cuesta tener tu página en 3 años"** (`#comparar` en `fuentes/comun.mjs` y sus estilos `.cmp` en `kit.css`). El análisis queda en `memoria/competencia.md`.
- **Regla nueva de estructura:** la página principal ya es larga y **no debe crecer**. Todo lo nuevo va en **otra página** (otra pestaña o ruta del mismo sitio, con un enlace desde la principal), nunca como sección extra de la portada. Ejemplo: "Cómo trabajamos" (cronograma real de un proyecto de 3 a 7 días, aplicando la clase de gestión del tiempo de DCP) va en su propia página.

**Tareas, en este orden:**
1. **Arreglar Fogón del Sur** (`web/propuesta/ejemplos/fogon-del-sur/`): "no baja bien" (problema de scroll y errores). Después hacer un check de **todas** las páginas (`node web/herramientas/check.mjs` y revisión a ojo), aunque el usuario dice que las demás se ven bien.
2. **Quitar la sección de 3 años** (ver arriba) y crear la página aparte **"Cómo trabajamos"**. *(23-oct: sección quitada; falta "Cómo trabajamos". Ya existe la página aparte `/antes-de-contratar/` (`fuentes/antes.mjs`): fallas de la competencia sin nombrar marcas y 6 preguntas antes de pagar; el pie y una línea bajo los precios la enlazan. La página web ahora incluye correo contacto@tunegocio.cl por reenvío, sin mensualidad. Detalle en `memoria/competencia.md` §10.)*
3. **Menú digital completo, enfocado en restaurantes** ("estamos centrados full en el restaurante"), al nivel de los menús digitales más top del mercado. Investigar la competencia antes de construir. Debe tener:
   - **Lado del cliente:** ver la carta, ordenar desde la mesa, pedir en línea, **delivery**, seguimiento del pedido con **GPS en tiempo real** del repartidor, estado del pedido ("recibido", "en preparación", "listo", "en camino") con su color y su animación, **tiempo estimado** de entrega, y un **juego en el celular mientras espera**.
   - **Lado de la cocina:** que el pedido llegue a la cocina, se marque en preparación y listo, y se le avise al cliente.
   - **Lado del dueño (panel):** cuántos clientes entran, cuántos pagaron, opiniones y referencias de clientes, ventas.
   - Mantener lo que ya existe: 3D, realidad aumentada, favoritos, buscador.
4. **Sistema de reservas completo** (el otro producto). Investigar la competencia: qué tienen, cómo compiten y qué destacan. Debe cubrir:
   - **Cara al cliente:** motor de reservas, calendario dinámico, inventario en tiempo real, reserva en pocos pasos, 100 % móvil, varios idiomas y monedas, módulo de promociones.
   - **Panel de administración:** gestión de paquetes, dashboard, gestión de calendarios, inventario y capacidad, notificaciones automáticas, políticas configurables (cancelación, depósitos), reportes y analítica.
   - **Integraciones:** pasarela de pago, channel manager, PMS, CRM, ERP, calendarios externos (Google o iCal), y lo que la investigación muestre que se usa.
   - **Rubros a contemplar:** hotel o cabañas, agencia de tours, centro médico, arriendo de espacios, salones. "Que sea todo automático".
   - Base actual: `web/propuesta/ejemplos/_compartido/reservas.js` (modos horas y noches, nivel 1 por WhatsApp, demo). El panel y Supabase (`web/panel/`) sirven de backend.
5. **Al final, commit y push** de todo (el usuario lo autorizó para cuando estén las tareas). Hoy hay más de 65 archivos sin commit del 22-oct.

**Cuidado al construir 3 y 4:** distinguir costo único de recurrente. El GPS en vivo, las notificaciones, las pasarelas y los channel managers pueden tener costos mensuales: marcarlos y cotizarlos (aprox., verificar), sin prometerlos dentro de un precio único. Probar todo con el revisor y sumar sus pruebas al check.

## Avance del 23-oct-2026 (madrugada): lo hecho del encargo
- **Competencia:** página aparte `/antes-de-contratar/` (`fuentes/antes.mjs`): 8 fallas del mercado sin nombrar marcas + 6 preguntas antes de pagar. Agregado al catálogo: correo contacto@ con el dominio, por reenvío, sin mensualidad. Detalle: `memoria/competencia.md` §10.
- **Tarea 1 hecha:** Fogón del Sur bajaba mal porque `scrollIntoView` de la barra de categorías peleaba el scroll; ahora mueve solo la barra. Sin `background-attachment: fixed`. Vibración solo con toque real. Mismo arreglo en `web/menu/`.
- **Tarea 2 hecha:** sin sección de 3 años; página `/como-trabajamos/` (`fuentes/como-trabajamos.mjs`) con actividades, precedencias, ruta crítica calculada (A → D → E → F → G y H → I, 5,5 días hábiles), holguras, hitos y Gantt. No había material de la clase de DCP en el repo: se usó el método estándar; ajustar si el usuario pasa la clase.
- **Tarea 3 hecha:** menú con pedidos (mesa, retiro, delivery), seguimiento con colores, tiempo estimado, mapa con GPS, juego, cocina, repartidor y panel del dueño. Ver `memoria/menu-pedidos.md` y la skill crear-menu-digital.
- **Tarea 4 hecha:** sistema de reservas `ejemplos/reservas/` (+ `admin/`): 4 modos para 5 rubros, idiomas, monedas, promociones, depósito, cancelación, lista de espera, avisos, iCal, CSV, webhook y reportes. Ver `memoria/reservas-sistema.md`.
- **Fidelización QR hecha:** `ejemplos/fidelizacion/` (cliente) y `local/` (caja). Sin mensualidad.
- Enlaces: galería `ejemplos/` (bloque "Sistemas completos") y "Ver la demo" dentro del detalle de cada producto en Precios. Pruebas nuevas sumadas al check: `fogon-del-sur.js`, `reservas-sistema.js`, `fidelizacion.js`.
- **Visualizaciones (23-oct):** el carrusel y la galería suman 6 pantallas de los sistemas (seguimiento `pedido/?demo`, cocina, panel del restaurante, reservas, panel de reservas, fidelización), con `sistema: true`, `ruta` y `preparar` en `fuentes/maquetas.mjs`. Íconos de línea SVG y logotipo de sigla por negocio (sin emojis). Los paneles cargan datos de prueba marcados la primera vez.
- Pendiente del equipo: precio de las versiones completas (a cotizar, separando costos mensuales de terceros), plazo de la garantía de corrección, qué pedir a los primeros 5 clientes.

## Actualización 22-oct-2026
- **Pagos (Benjamín Alvear, 14-oct):** Mercado Pago integrado al carrito con Cloudflare Pages Functions (`functions/`), D1 de prueba `biodigital-payments-test` (solo en Preview), `wrangler.toml` en la raíz (`pages_build_output_dir = ./web/propuesta`), `PAGOS.md` y 29 pruebas (`node --test`, todas pasan). **Cobros apagados** (`PAYMENTS_ENABLED=false`, SKU deshabilitados), bloqueado por el ticket de Mercado Pago WCS-54274. Regla: **no modificar Production del sitio** durante esta fase; publicar cambios del sitio en una rama de vista previa (p. ej. `npx wrangler pages deploy --branch=ejemplos` desde la raíz) y pedir aprobación antes de tocar `main`. Productos "desde" o "a cotizar" siguen por diagnóstico/WhatsApp.
- **Check completo (22-oct):** `node web/herramientas/check.mjs` revisa la vista previa (o `... check.mjs http://localhost:4321` en local): 13 páginas a 390 y 1440 px con sus guiones de prueba, y escribe `memoria/CHECK.md` con una tabla ✅/❌, la lista de revisión a ojo y las decisiones pendientes. Medición de peso y LCP: `--probar web/herramientas/pruebas/peso.js` y `lcp.js`.
- **Revisor automático:** `node web/herramientas/revisar.mjs <url> [--probar web/herramientas/pruebas/<slug>.js]` (ver crear-sitio-web). Servidor local del sitio: preview `maquetas` (4321).
- **Sitios de ejemplo (rehechos el 22-oct sobre plantillas reales; ver `memoria/ejemplos-matriz.md`):** `web/propuesta/ejemplos/<id>/`, cinta `_compartido/demo.*`, reservas `_compartido/reservas.*`. Estética ← Forma pilates (21st.dev), cabañas ← Villa Aurelia, dental ← Oris Dental, contable ← Taxo, técnico ← Kyntra (en verde), barbería ← DBC Dallas Barber Club (Framer, gratis), pastelería ← Boolka (Framer, en frambuesa). Fogón del Sur = demo del menú digital (diseño propio). Cada uno: segmento y matriz CREA (Taller de Emprendimiento), guion de prueba en `web/herramientas/pruebas/<id>.js`, fotos de Unsplash cargadas desde su servidor, sin reseñas inventadas ni personas presentadas como personal. Todos pasan el revisor (desborde 0 a 390 y 1440 px, sin errores).
  - **Regla al hacer un ejemplo nuevo:** buscar una plantilla del mismo rubro (21st.dev → Templates, la demo está en el iframe `*.21st.app`; Framer Marketplace, la demo en `*.framer.website`), capturarla con el revisor a 1440 px, seguir su estructura y su movimiento, y cambiar la paleta solo si choca con otro ejemplo. Cuidado con: fuentes sin tildes (Bowlby One), títulos con interlineado menor a 1 dentro de `overflow: hidden` (cortan los tildes) y documentos internos dentro de `web/propuesta/` (se publican).
- **Carrusel de la portada:** capturas reales `ejemplos/<id>.webp` (`node web/herramientas/capturar-ejemplos.mjs [id]`), datos en `fuentes/maquetas.mjs` (también arma la galería `ejemplos/index.html`). Al hacer clic se abre un visor con la página en vivo (escritorio 1440 / celular 390), flechas y "Abrir la página completa ↗". Prueba: `pruebas/carrusel.js`.
- **Políticas:** `privacidad/` y `terminos/`, generadas por `fuentes/legales.mjs` (Ley 19.628, considera la 21.719 y la 19.496). Plazos y retracto propuestos: el equipo los debe confirmar. Falta la razón social o el RUT si existe.
- **Competencia (22-oct):** `memoria/competencia.md`. Océano rojo: nuestra ventaja medible es el precio total a 3 años (sin mensualidades), el pack con precio publicado, la visita al local, el 3D del menú y la velocidad (9 a 14 peticiones frente a 153 de una app por suscripción). La página tiene la sección "Cuánto cuesta tener tu página en 3 años" (actualizar sus valores cada 3 meses). Decisiones abiertas: ficha de Google, fidelización QR a $0, garantía 50/50.
- **Nada de esto está en commit todavía** (ejemplos, revisor, cinta, reservas, políticas, galería, `.gitignore`). Publicar en vista previa, no en Production.
- Presupuesto: el 22-oct el usuario autorizó usar el límite diario completo con un máximo de 80 % del semanal (antes 70 %). Preferir trabajo directo o 1–3 agentes; revisar el uso con `get_usage`.
