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
- **Portada:** carrusel curvo de 6 maquetas SVG en español (restaurante, peluquería, servicio técnico, cabañas, almuerzos, estética) con clic para verlas en grande y campo `url` vacío por maqueta para enlazar a la página real cuando exista. Movimiento suave con el mouse (`data-par`) y transiciones en todos los puntos de selección.
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
