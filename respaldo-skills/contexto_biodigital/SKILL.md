---
name: contexto_biodigital
description: Contexto completo de Bío Digital (startup de 5 estudiantes UdeC en el Gran Concepción) para retomar el trabajo en un chat nuevo sin releer todo: sitio web, tienda y carrito, panel interno con login y caja, formularios para clientes, menú digital con pedidos, reservas y fidelización conectados en la nube, las skills crear-sitio-web, crear-menu-digital y crear-sistemas-agendas, publicación en Cloudflare, Supabase, catálogo y precios, decisiones, pendientes y lecciones. Úsala cuando pidan editar, regenerar, publicar o ampliar cualquier cosa de Bío Digital (página web, gato mascota, paleta, logo, precios, promociones, panel, formularios, menú digital, sistema de reservas o agendas, demos, skills) o preguntan en qué quedó el proyecto.
---

# Contexto: Bío Digital (todo el proyecto)

**Responder siempre en español.** Proyecto: `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP` · Repo privado: https://github.com/cmartinezb07/BioDigital · Antes de nada lee `MEMORY.md`, `memoria/estado-actual.md` y el final de `memoria/decisiones.md` (bitácora; la más reciente está al final).

## PRÓXIMO CHAT — leer primero (estado al 30-oct-2026)

**Dónde quedamos:** los 8 productos del sitio existen (`memoria/checklist-servicios.md`). El 30-oct el usuario pidió **seguir mejorando todo por cuenta propia, sin revisar**, subiendo a GitHub a medida que avanza (sí autorizado). Lo hecho del 29 y 30-oct está en `memoria/decisiones.md`.
1. **Reservas PRO (terminado y publicado):** unidad asignada, motivo por día, reserva por teléfono, mover de unidad, campos propios, 7 módulos activables, widget, **ficha de clientes** y **pedir reseña en Google**. SQL `006a`–`006g` aplicados; demo en vivo migrada. Pruebas: 89/89 reglas.
2. **Reserva simple (rehecha el 30-oct):** lo ocupado sale del **Google Calendar del dueño** (freeBusy, solo libre/ocupado), varios servicios por solicitud, WhatsApp con **enlace para el negocio** (agendar en su calendario y confirmar en 2 toques, proponer otra hora, avisar que no hay), planilla de Google opcional para precios. Demo `ejemplos/reservas-simple/` (en la galería, no en la portada). **Falta: la llave de Google Calendar de Bío Digital** (pasos en `docs/google-calendar-llave.md`) y probar con un calendario real.
3. **Fidelización:** `nuevo-fidelizacion.mjs` la arma para cualquier local. **Falta aplicar `web/herramientas/nube-sql/007-fidelizacion-cualquier-negocio.sql`** antes de la primera tarjeta real (la regla que impide sumarse sellos solo protegía a la demo; a Claude el permiso le bloqueó aplicarla).
4. **Menú simple:** el dueño cambia precios y agotados en su planilla de Google (`negocio.planilla`). **Menú PRO:** el WhatsApp de un local nuevo ya usa su número.
5. **Cartel con QR** para imprimir o Instagram: `ejemplos/_compartido/cartel.html?url=…` (enlazado desde el panel PRO y las herramientas).
6. **Publicar:** los deploys a producción los corre el usuario (a Claude se los bloquea el permiso). Lo último publicado por el usuario: reservas PRO del 30-oct; lo posterior (simple con calendario, clientes, cartel, galería) está en GitHub pero falta publicarlo.
7. **Pendiente que necesita cuentas o decisiones:** correo real para recordatorios del PRO (proveedor con cuota gratis), WhatsApp automático y pasarela (costo por mensaje o comisión), Supabase Pro, IVA, enlaces de Mercado Pago, el texto "por confirmar" del sitio. Por construir solo si un cliente lo pide: mesas, profesional + recurso, modo garzón.
8. `check.mjs` tarda más de 10 minutos (correrlo en segundo plano); el 30-oct marcó 2 pruebas de animación del ejemplo Dental (no tocado; revisar con ventana visible).

**Equipo y trabajo en GitHub (leer antes de borrar o mover algo):** además de Christhoper (jefe de proyecto) trabajan **Benjamín Alvear** (pagos con Mercado Pago, `functions/`, `migrations/`, `test/`, `scripts/`, `deployment/`, `docs/`) y **Xavier Godoy** (propuestas comerciales en PDF: `propuestas/` y la skill `respaldo-skills/propuesta-comercial`). **No tocar su trabajo sin avisarles y hacer `git fetch` / `git pull` antes de empezar**: el 27-oct el computador local estaba 5 commits atrás y casi se trabajó sobre una versión vieja (el PDF de Zoul Barber que circulaba era de antes de que Xavier lo corrigiera). El 27-oct se **limpió el repositorio** (commit `1202478` en GitHub; respaldo en la etiqueta `respaldo-antes-de-limpieza-27oct`; lo borrado se recupera con `git checkout respaldo-antes-de-limpieza-27oct -- <ruta>`): se eliminaron las opciones de diseño 2 a 7, `web/menu/`, `textos.md`, las fichas viejas de `servicios/` y `precios-menu-digital.md`; la guía de pagos y publicación está en `docs/pagos/` y `docs/publicacion/`; `servicios/README.md` es el catálogo vigente (fuente única de precios: `web/propuesta/fuentes/comun.mjs`; si algo difiere, manda el sitio).

**Dónde trabajar y publicar:** sitio oficial https://biodigitales.cl (canónica; misma versión en https://biodigital-bgw.pages.dev, proyecto Cloudflare `biodigital`, rama `main`, cuenta `1f79804ece4d02d62f0df05f07c23ad2`). Publicar: `node web/propuesta/fuentes/generar.mjs --publico 8`, `npx wrangler pages deploy web/propuesta --project-name=biodigital --branch=main --commit-dirty=true` (el `wrangler.toml` de la raíz ya apunta a `biodigital`, API de pagos apagada) y después `node web/propuesta/fuentes/generar.mjs 8`. `generar.mjs` agrega `?v=huella` a los CSS y JS (el dominio propio los cachea 4 h). **La dirección anterior `biodigital-propuesta.pages.dev` redirige con 301** (fuente: `deployment/legacy-redirect/`, ver `docs/publicacion/MIGRACION-SITIO.md`): nunca publicar el sitio completo ahí ni borrar ese proyecto. **La carpeta `ejemplos/la-joya-del-sur/` está en `.gitignore` pero SÍ se publica con el sitio completo** (tiene la carta y fotos de un posible cliente): excluirla del deploy o no desplegar sin hablar con el local. Deploys, commits y push: solo cuando el usuario lo pide.

**Catálogo y reglas vigentes (27-oct):** seis productos de pago único, dos sistemas PRO con mensualidad de $20.000 (primer mes gratis), pack esencial $69.990 de lanzamiento ($79.990 normal), pack PRO $120.000 de lanzamiento ($150.000 normal), ofertas relámpago, precios de lanzamiento para los primeros 5 clientes. **Sin anticipo**: se paga una vez, al entregar y firmar el acta; el retracto cobra solo lo ya hecho. La reserva simple ($24.990) ofrece solo lo libre según el Google Calendar del dueño y manda la solicitud por WhatsApp; el negocio agenda y confirma en 2 toques. **Sin panel, sin base de datos ni confirmación automática**; la agenda automática es Reservas PRO. Nunca prometer avisos por WhatsApp o correo, 3D ni realidad aumentada (no existen). Tabla completa: `servicios/README.md`, `memoria/precios-catalogo.md`.

**El sistema de menú digital para restaurantes (listo, es la plantilla de los clientes):**
- Demo: `web/propuesta/ejemplos/fogon-del-sur/`, **dos páginas**: (1) el menú para ver la carta y pedir; (2) `panel/`, acceso único del equipo con tres códigos (demo: cocinero 247135, repartidor 913572, jefe 482916): el código decide si entras a cocina, reparto o administración (pedidos en vivo, carta editable, estadísticas, opiniones, negocio y equipo).
- Reglas en el servidor (Supabase `biodigital-demos`, id `xoetybrsbuxcdoamcaeb`): precios y opciones contra la carta publicada, estados por rol, un pedido "Nuevo" por cliente, modificar el mismo pedido solo mientras está "recibido", un repartidor por entrega. Cada local es un `negocio` aislado. Leer `memoria/conexion-nube.md`, `memoria/plantilla-restaurante.md` y la skill `crear-menu-digital`.
- **Plug and play:** formulario del cliente (`formulario-menu.html`, **80 preguntas** con el bloque "Cómo trabajan hoy") → `node web/herramientas/aplicar-formulario.mjs respuestas.json` → SQL de accesos → `cargar-carta-base.mjs` → prueba de humo → panel → publicar; paleta propia con `node web/herramientas/aplicar-tema.mjs <id> --tema claro-rosado`. Todo en la skill `crear-menu-digital`.
- **Cobertura medida:** la base aguantó 800 clientes simulados (310 peticiones por segundo, 0 errores) en el plan gratis; Supabase Pro (~US$25 al mes, compartido) igual antes del primer cliente real.
- **Idea de diseño pendiente (modo garzón):** rol garzón con su código y pantalla "Tomar pedido", cocina manejada por el garzón o aparte, página "Mi mesa" para que el cliente vea su pedido en vivo sin pedir, y botón de reseña de Google (la publica el cliente; no se filtra por estrellas; falta el identificador de lugar). No está construido; el formulario ya pregunta cómo trabaja cada local para decidir qué ofrecerle.
- 3D y AR **postergados**. "Went" (juego): no se pudo identificar; la demo tiene Zip, Queens, Tango y Sudoku mini; **preguntarle al usuario cuál era**.
- Pruebas: `check.mjs` (≈ 17 a 20 min; no usar el panel mientras corre), `pedidos-reglas-e2e.mjs` (62), `nube-e2e.mjs` (25), `reservas-reglas-e2e.mjs` (89), `pruebas/reservas-simple.js` (18), `node --test` (38).

**Clientes y propuestas en curso:**
- **La Joya del Sur (Penco):** posible cliente; demo privada del menú digital en `web/propuesta/ejemplos/la-joya-del-sur/` (blanco mate y rosado, carta real de 44 platos, 28 con foto de su Instagram, sin publicar). Detalle y pendientes: `memoria/cliente-la-joya-del-sur.md`. Lo que falta que confirme el local (horario, mesas, delivery, fotos, logo) está ahí.
- **Propuestas en PDF (Xavier):** `propuestas/LEEME.md`; leen los precios del sitio; hechas Café Kairós y Zoulbarber Studio.
- **Material para WhatsApp:** `web/herramientas/capturar-whatsapp.mjs` + `componer-whatsapp.py` arman imágenes (una por pantalla) del Fogón y de una pastelería; salida en `material-clientes/` (fuera de git).
- **Bot de WhatsApp para agendar** (idea del 27-28-oct): menú por botones sobre Google Calendar, sin base de datos propia, con API oficial de Meta (número nuevo; no cobra mensualidad, cobra por mensaje de plantilla). Hoy no existe: piloto con un solo negocio antes de ofrecerlo. Ver `servicios-futuros/bot-whatsapp/`.

**Pendiente (después de reservas):**
1. IVA y enlaces de Mercado Pago de Benjamín para los SKU nuevos (el menú simple ya se edita con planilla de Google).
2. Antes del primer cliente real: Supabase Pro, PIN privados (y con hash), pago en línea con la cuenta del local, privacidad revisada con el negocio, guardar en el repo el SQL final de las migraciones 003–005 (`web/herramientas/nube-sql/`) y bloquear en el servidor los servicios que el local no atiende.
3. Dominio y buscadores: Search Console verificado; falta pedir indexación de `/` y `/ejemplos/`. Google Business Profile: quitar "Chile" de las áreas de servicio, poner comunas, horario real, descripción, servicios y fotos. Pedir reseñas a los primeros clientes.
4. Cloudflare: el proyecto `menu-demo` (menú antiguo) sigue en línea; el canonical de Fogón del Sur aún apunta ahí.
5. Los otros ejemplos de rubro usan reservas solo local (llamar a `Reservas.conectar(negocio)` si se quieren reales).

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

## Catálogo vigente (27-oct-2026; detalle en `servicios/README.md`, fuente única `web/propuesta/fuentes/comun.mjs`)
Seis productos de pago único: Página web desde $49.990 · Videos para redes desde $9.990 · Menú digital (carta con QR) desde $27.990 · Registro fotográfico $4.990 · Reservas simple desde $24.990 · Tarjeta de fidelización $9.990 → suma $127.940. **Pack esencial (los seis) $79.990** ($69.990 de lanzamiento). **Versiones PRO** con mensualidad de $20.000 desde el segundo mes: Menú digital PRO $99.990 y Reservas PRO $99.990 ($79.990 de lanzamiento cada una); Pack PRO $150.000 ($120.000 de lanzamiento). Dominio y hosting no incluidos. Los demás servicios están en stand by (`servicios-futuros/`).
- **Menú 3D / realidad aumentada: postergado** por decisión del usuario (24-oct); no se ofrece ni se muestra en el sitio.
- **Promociones:** precio de lanzamiento por producto para los primeros 5 clientes; ofertas relámpago (no se suman al lanzamiento): página web + video desde $52.990 · menú PRO + fotos $89.990 · reservas PRO + fidelización $94.990 · 2 videos $17.990 · 3 videos $24.990.
- **Diagnóstico gratis** en el primer contacto (ya no es una sección con puntaje en la página). **Sin anticipo.**

## Sitio web (`web/propuesta/`)
- **El sitio** → `index.html` (generado; es la única opción que queda: las demás maquetas y plantillas se eliminaron el 27-oct-2026). **No editar los HTML generados**: regenerar con `node fuentes/generar.mjs 8` desde `web/propuesta`. Para publicar: `node fuentes/generar.mjs --publico 8` (quita la rueda de colores del equipo y el aviso de prototipo; después se vuelve a generar sin flag para seguir trabajando).
- Archivos: `fuentes/comun.mjs` (contenido compartido: catálogo, promos, FAQ, formulario del pedido, carrito), `fuentes/opcion-8.mjs` (estética y portada), `fuentes/config.mjs` (datos), `fuentes/maquetas.mjs` (ejemplos del carrusel), `fuentes/formularios.mjs` (genera los dos formularios), `kit.css`/`nucleo.css`, `tienda.js/.css` (desglose por producto, carrito, formulario con validación y envío), `carrusel.js/.css` (carrusel curvo de ejemplos y visor), `secciones.js`, `mundo.js`, `movimiento.js`, `paleta.js/.css` (rueda de colores del equipo), `gato.js/.css`, `mascota.js`, `mascota-gato.js`.
- **Portada:** carrusel curvo con las capturas reales de los 8 sitios de ejemplo; clic → visor con la página en vivo y botón para abrirla (ver "Sitios de ejemplo" más abajo). Movimiento suave con el mouse (`data-par`).
- **Precios:** cada producto se abre con "qué incluye" y "cómo funciona" y botón de carrito; carrito en panel lateral (guardado en el navegador; los precios salen del catálogo de la página). Formulario del pedido: nombre, negocio, rubro, **comuna (lista cerrada del Gran Concepción)**, correo, celular (+56 9), qué te interesa (solo si el carrito está vacío), con validación estricta. Botones: enviar por correo y por WhatsApp (logos); además deja la solicitud en el panel.
- **Gato mascota:** SVG por partes, frases en `mascota-gato.js`; habla poco (tope 5/min, 15 s entre comentarios, 2 sueltos por visita). Vive fuera de la columna del sitio (la columna llega a 1440 px y deja 150 px a cada lado).
- Marca: logo en 2 máscaras (la "B" con `--c1→--c2`, el texto con `--fg`), colores originales `--c1 #0da5ff`, `--c2 #00e5d0`.
- Páginas aparte: `formulario.html` (59 preguntas, página web), `formulario-menu.html` (80 preguntas, menú digital) y `formulario-reservas.html` (39 preguntas, reservas), generadas por `fuentes/formularios.mjs` desde las skills; envían al panel, copian y abren WhatsApp.

## Panel interno (`web/panel/`, ver su `LEEME.md`)
- Sitio estático sin librerías: https://main.biodigital-panel.pages.dev (la dirección corta da 404 hasta cambiar la rama de producción a `main` en Cloudflare).
- **Supabase** proyecto `biodigital-panel` (id `mkxxqhywwzsaeojfmkme`, São Paulo, gratis, se pausa tras 1 semana sin uso). Tablas: `staff` (lista autorizada: hoy solo cmartinezb07@gmail.com, admin), `solicitudes`, `levantamientos` (columna `tipo` = web | menu), `caja`, `auditoria`, `limite_envios`. Funciones `privado.es_staff()` / `es_admin()`.
- **Seguridad:** RLS en todo; el público solo inserta en `solicitudes` y `levantamientos` (columnas y valores validados, tope 5 envíos/10 min por conexión y 200/hora); leer o editar exige estar en `staff`, correo confirmado y segundo factor (aal2); solo admins borran. Login con contraseña (11+ con mayúscula, minúscula, número y símbolo) + TOTP. Sesión se cierra a los 15 min sin uso; CSP estricta; CSV a prueba de fórmulas.
- Pestañas: Resumen, Solicitudes (estados, responsable, notas), Formularios (tipo web o menú), Caja (saldo, ingresos, gastos, capital), Equipo, Actividad. "En vivo" = consulta cada 5 s.
- **Pendiente en Supabase (panel web):** Site URL = `https://main.biodigital-panel.pages.dev`; largo mínimo de contraseña 11; SMTP propio (el correo de prueba solo envía al dueño y los compañeros no reciben la confirmación). Cuenta de Christhoper ya creada y confirmada a mano. Para agregar compañeros: pestaña Equipo → Autorizar; luego ellos "Crear mi cuenta" (si no les llega el correo, confirmar la cuenta desde SQL).
- El proyecto Supabase `agente-whatsapp` (otro proyecto del usuario, con datos reales) está **pausado, no borrado**, para liberar el cupo gratis de 2 proyectos.

## Menú digital
- **Sistema completo para restaurantes:** `web/propuesta/ejemplos/fogon-del-sur/` (ver "PRÓXIMO CHAT" y la skill `crear-menu-digital`). **Carta QR simple (estática):** generador de la skill (`generar-menu.mjs`); la versión antigua con 3D se **eliminó del repositorio el 27-oct-2026** (sigue publicada en el proyecto Cloudflare `menu-demo`, sin tocar): el 3D/AR se retomará más adelante (la técnica sigue en `referencias/captura-3d.md` de la skill).

## Skills y cómo se relacionan
- **`crear-sitio-web`** (base): flujo completo de un sitio (preguntas → maquetas → sitio final → seguridad → publicación → checklist), formulario de 59 preguntas, mascota, requisitos SEO/seguridad.
- **`crear-menu-digital`** (subrama, plug and play): depende de la anterior. Del formulario del cliente (64 preguntas) a un restaurante funcionando con `aplicar-formulario.mjs`: carta editable, pedidos mesa/retiro/delivery, cocina, reparto, panel del jefe con estadísticas, reglas en el servidor, prueba de humo y publicación; y la carta QR simple. Su `referencias/sistema-restaurante.md` resume la arquitectura.
- **`crear-sistemas-agendas`** (subrama, plug and play): hermana de la anterior. Del formulario del cliente (39 preguntas) a un sistema de reservas funcionando con `aplicar-formulario-agenda.mjs`: calendario en vivo, precio y depósito del servidor, modificar y cancelar sobre la misma reserva, panel con jefe y recepción, catálogo editable en borrador, avisos, bloqueos, reportes, prueba de humo y publicación. Su `referencias/sistema-agenda.md` resume la arquitectura.
- **`contexto_biodigital`** (esta): memoria operativa del proyecto. Reemplaza a `contexto_pagina_web`.
- Copias del repo en `respaldo-skills/`. El formulario del menú se arma sobre el motor del formulario de página web (una sola fuente).

## Publicación (Cloudflare Pages; la ejecuta el usuario)
- **Sitio de Bío Digital (demo, el que se usa): https://biodigital-bgw.pages.dev** → `node web/propuesta/fuentes/generar.mjs --publico 8` y `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`; luego `node web/propuesta/fuentes/generar.mjs 8` (deja la versión de trabajo; la pública no se commitea).
- Otros proyectos que existen y **no se tocan sin pedirlo:** `biodigital-propuesta` (Production = redirección 301 a la principal; rama `ejemplos` = vista previa antigua; `payments-test` = pruebas de pago con D1), `biodigital-panel` (panel interno), `menu-demo` (menú antiguo, ya sin código en el repo).
- **Un restaurante de cliente** se publica solo, desde su carpeta autosuficiente: `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true`.
- **Trampa conocida:** los proyectos creados por el primer deploy quedan con otra rama de producción: `proyecto.pages.dev` da 404 y `main.proyecto.pages.dev` abre. Arreglo: Cloudflare → proyecto → Settings → rama de producción = `main`.

## Pendiente (consolidado; lo urgente está en "PRÓXIMO CHAT")
- Probar la AR con un escaneo real y en Android cuando se retome el 3D; quién cobra los cambios de carta.
- Ajustes de Supabase (Site URL, largo 11, SMTP); autorizar a los compañeros; generador de QR (pedir permiso antes de instalar `qrcode`).
- Acortar la página principal (el usuario define criterios con un amigo); confirmar variante de logo; capital semilla $80.000 en Caja como "Capital aportado".
- Preguntas viejas: Jornada de Terreno, plan de Claude y quién lo paga, piloto del bot de WhatsApp.

## Cómo verificar
Navegador integrado a 1440 y 390 px: sin desborde (`scrollWidth`), textos ≥ 12 px, áreas táctiles ≥ 44 px, consola sin errores, recursos sin 404. Los `.reveal` quedan en opacidad 0 hasta entrar en pantalla. **El panel del navegador se "congela" si la ventana está oculta**: un `screenshot` lo despierta (los temporizadores y la carga de modelos pueden quedar a medias). Previews: `maquetas` (4321, sitio), `panel` (4322), `menu` (4323), todos con `web/servir.py` sin caché (`.claude/launch.json`).

## Historial

Lo hecho antes del 24-oct (encargo del 23-oct, avances del 22 y 23-oct) está en `memoria/decisiones.md`, con fecha. Leer solo si hace falta el detalle.
