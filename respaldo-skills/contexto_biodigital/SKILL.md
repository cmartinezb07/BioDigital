---
name: contexto_biodigital
description: Contexto completo de Bío Digital (startup de 5 estudiantes UdeC en el Gran Concepción) para retomar el trabajo en un chat nuevo sin releer todo: sitio web, tienda y carrito, panel interno con login y caja, formularios para clientes, menú digital con pedidos, reservas y fidelización conectados en la nube, las skills crear-sitio-web y crear-menu-digital, publicación en Cloudflare, Supabase, catálogo y precios, decisiones, pendientes y lecciones. Úsala cuando pidan editar, regenerar, publicar o ampliar cualquier cosa de Bío Digital (página web, gato mascota, paleta, logo, precios, promociones, panel, formularios, menú digital, demos, skills) o preguntan en qué quedó el proyecto.
---

# Contexto: Bío Digital (todo el proyecto)

**Responder siempre en español.** Proyecto: `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP` · Repo privado: https://github.com/cmartinezb07/BioDigital · Antes de nada lee `MEMORY.md`, `memoria/estado-actual.md` y el final de `memoria/decisiones.md` (bitácora; la más reciente está al final).

## PRÓXIMO CHAT — leer primero (estado al 24-oct-2026, noche)

**Dónde trabajar y publicar:** solo https://biodigital-bgw.pages.dev (proyecto Cloudflare `biodigital`, rama `main`, cuenta `1f79804ece4d02d62f0df05f07c23ad2`): `node web/propuesta/fuentes/generar.mjs --publico 8`, `npx wrangler pages deploy web/propuesta --project-name=biodigital --branch=main --commit-dirty=true` (el `wrangler.toml` de la raíz ya apunta a `biodigital`, API de pagos apagada), y después `node web/propuesta/fuentes/generar.mjs 8`. **La dirección anterior `biodigital-propuesta.pages.dev` ahora redirige con 301** (fuente: `deployment/legacy-redirect/`, ver `MIGRACION-SITIO.md`): nunca publicar el sitio completo ahí (reemplazaría la redirección) ni borrar ese proyecto (rompería enlaces antiguos y el entorno `payments-test`). Instagram y WhatsApp ya llevan a la dirección principal. **Se está comprando el dominio propio** (25-oct): al tenerlo, conectarlo como dominio personalizado del proyecto `biodigital` en Cloudflare Pages, cambiar la URL en `web/propuesta/fuentes/config.mjs`, regenerar, publicar y actualizar perfiles. Mercado Pago funciona por **enlaces fijos** (`enlaces-pago.mjs`); el cobro por API de prueba solo existe en `payments-test`. Deploys, commits y push: solo cuando el usuario lo pide.

**El sistema de menú digital para restaurantes (listo, es la plantilla de los clientes):**
- Demo: `web/propuesta/ejemplos/fogon-del-sur/`, **dos páginas**: (1) el menú para ver la carta y pedir; (2) `panel/`, acceso único del equipo con tres códigos (demo: cocinero 247135, repartidor 913572, jefe 482916): el código decide si entras a cocina, reparto o administración (pedidos en vivo, carta editable, estadísticas, opiniones, negocio y equipo).
- Reglas en el servidor (Supabase `biodigital-demos`, id `xoetybrsbuxcdoamcaeb`): precios y opciones contra la carta publicada, estados por rol, un pedido "Nuevo" por cliente, modificar el mismo pedido solo mientras está "recibido", un repartidor por entrega. Cada local es un `negocio` aislado. Leer `memoria/conexion-nube.md`, `memoria/plantilla-restaurante.md` y la skill `crear-menu-digital` (`referencias/sistema-restaurante.md`).
- **Plug and play:** formulario del cliente → `node web/herramientas/aplicar-formulario.mjs respuestas.json` → SQL de accesos → `cargar-carta-base.mjs` → prueba de humo → panel → publicar. Todo está en la skill `crear-menu-digital`; probado de punta a punta con un restaurante de prueba.
- Portada y galería: el carrusel muestra 4 imágenes seguidas (menú, pedidos con repartidor, cocina, panel) que llevan a esas dos páginas; las capturas de cocina y panel salen de una copia con pedidos de muestra (`semillas-restaurante.mjs`, negocio `captura-fogon`) sin tocar pedidos reales.
- 3D y AR **postergados** (no se ofrecen). "Went" (juego): no se pudo identificar; la demo tiene Zip, Queens, Tango y Sudoku mini; **preguntarle al usuario cuál era**.
- Pruebas: `check.mjs` (27 páginas + nube; ≈ 17 min; no usar el panel mientras corre), `pedidos-reglas-e2e.mjs` (62), `nube-e2e.mjs` (25), `node --test` (38). Última corrida completa: 27/27 el 24-oct.
- Precios del sistema: **propuesta sin aprobar** en `memoria/precios-menu-digital.md` (instalación $149.000 / $249.000 / $349.000 y mensualidad $14.900 / $24.900 / $34.900, netos; cifras de terceros aproximadas). El catálogo del sitio sigue igual.

**Pendiente (en este orden):**
1. Que el equipo apruebe los precios del sistema y se actualice el catálogo.
2. Dominio propio (en compra, 25-oct): conectarlo a `biodigital`, actualizar `config.mjs`, perfiles y QR. Benjamín: probar un pago real con un enlace desde la dirección principal y decidir si el cobro por API se traslada (hoy apagado; secretos y D1 de pruebas siguen solo en `payments-test`).
3. Antes del primer cliente real: Supabase Pro, PIN privados, pago en línea con su cuenta, privacidad revisada con el negocio, guardar en el repo el SQL final de las migraciones 003–005 (`web/herramientas/nube-sql/`), bloquear en el servidor los servicios que el local no atiende, y hashear los PIN.
4. Relanzar la auditoría con varios agentes sobre el código conectado (script en `C:\Users\criss\.claude\projects\C--Users-criss-OneDrive-Escritorio-Proyecto-DCP\5d9893e0-a37b-4dd6-b25d-821ab54a93cf\workflows\scripts\auditoria-sistemas-biodigital-wf_efb7dee6-743.js`).
5. `web/menu/` (versión antigua) aún tiene 3D; los otros ejemplos de rubro usan reservas solo local (llamar a `Reservas.conectar(negocio)` si se quieren reales).

**Notas técnicas:** en Git Bash las rutas que empiezan con "/" se convierten en rutas de Windows: a `scroll.mjs` pasarle rutas sin barra inicial. El servidor local (preview `maquetas`, puerto 4321) se apaga al reiniciar la sesión: encenderlo con preview_start. Los proyectos gratis de Supabase se pausan tras 1 semana sin uso: si las demos fallan, despertar `biodigital-demos`. Las pruebas escriben en la base real y borran lo suyo; si queda algo, `nube_vaciar` con el PIN del dueño.
**Uso:** el usuario autorizó gastar el límite completo del plan en esta etapa.

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
- **Menú 3D / realidad aumentada: postergado** por decisión del usuario (24-oct); no se ofrece ni se muestra en el sitio hasta tener la información para hacerlo.
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

## Menú digital
- **Sistema completo para restaurantes:** `web/propuesta/ejemplos/fogon-del-sur/` (ver "PRÓXIMO CHAT" y la skill `crear-menu-digital`). **Carta QR simple (estática):** generador de la skill (`generar-menu.mjs`); la versión antigua con 3D vive en `web/menu/` (https://main.menu-demo.pages.dev, noindex) y está **archivada**: el 3D/AR se retomará más adelante (la técnica sigue en `referencias/captura-3d.md` de la skill).

## Skills y cómo se relacionan
- **`crear-sitio-web`** (base): flujo completo de un sitio (preguntas → maquetas → sitio final → seguridad → publicación → checklist), formulario de 59 preguntas, mascota, requisitos SEO/seguridad.
- **`crear-menu-digital`** (subrama, plug and play): depende de la anterior. Del formulario del cliente (64 preguntas) a un restaurante funcionando con `aplicar-formulario.mjs`: carta editable, pedidos mesa/retiro/delivery, cocina, reparto, panel del jefe con estadísticas, reglas en el servidor, prueba de humo y publicación; y la carta QR simple. Su `referencias/sistema-restaurante.md` resume la arquitectura.
- **`contexto_biodigital`** (esta): memoria operativa del proyecto. Reemplaza a `contexto_pagina_web`.
- Copias del repo en `respaldo-skills/`. El formulario del menú se arma sobre el motor del formulario de página web (una sola fuente).

## Publicación (Cloudflare Pages; la ejecuta el usuario)
- **Sitio de Bío Digital (demo, el que se usa): https://biodigital-bgw.pages.dev** → `node web/propuesta/fuentes/generar.mjs --publico 8` y `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`; luego `node web/propuesta/fuentes/generar.mjs 8` (deja la versión de trabajo; la pública no se commitea).
- Otros proyectos que existen y **no se tocan sin pedirlo:** `biodigital-propuesta` (Production = redirección 301 a la principal; rama `ejemplos` = vista previa antigua; `payments-test` = pruebas de pago con D1), `biodigital-panel` (panel interno), `menu-demo` (menú antiguo).
- **Un restaurante de cliente** se publica solo, desde su carpeta autosuficiente: `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true`.
- **Trampa conocida:** los proyectos creados por el primer deploy quedan con otra rama de producción: `proyecto.pages.dev` da 404 y `main.proyecto.pages.dev` abre. Arreglo: Cloudflare → proyecto → Settings → rama de producción = `main`.

## Pendiente (consolidado; lo urgente está en "PRÓXIMO CHAT")
- Probar la AR con un escaneo real y en Android cuando se retome el 3D; quién cobra los cambios de carta.
- Ajustes de Supabase (Site URL, largo 11, SMTP); autorizar a los compañeros; generador de QR (pedir permiso antes de instalar `qrcode`).
- Acortar la página principal (el usuario define criterios con un amigo); confirmar variante de logo; capital semilla $80.000 en Caja como "Capital aportado".
- Preguntas viejas: Jornada de Terreno, plan de Claude y quién lo paga, piloto del bot de WhatsApp.

## Cómo verificar
Navegador integrado a 1440 y 390 px: sin desborde (`scrollWidth`), textos ≥ 12 px, áreas táctiles ≥ 44 px, consola sin errores, recursos sin 404. Los `.reveal` quedan en opacidad 0 hasta entrar en pantalla. **El panel del navegador se "congela" si la ventana está oculta**: un `screenshot` lo despierta (los temporizadores y la carga de modelos pueden quedar a medias). Previews: `maquetas` (4321, sitio), `panel` (4322), `menu` (4323), todos con `web/servir.py` sin caché (`.claude/launch.json`).

## ENCARGO DEL USUARIO DEL 23-OCT-2026 (HECHO; queda como referencia. Lo pendiente está en "PRÓXIMO CHAT")

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
