---
name: crear-menu-digital
description: Subrama de crear-sitio-web para el menú digital de un cliente de Bío Digital (restaurante, cafetería, bar, local de comida). Arma, casi sola, el sistema completo para un local a partir de las respuestas de su formulario: carta editable con fotos y opciones, pedidos en la mesa, para retirar y con delivery, pantalla de cocina, reparto con GPS, panel del jefe con estadísticas, acceso por código y reglas de seguridad en el servidor; también el menú simple con QR (solo carta). Incluye el formulario del cliente, la herramienta que lo convierte en un restaurante funcionando, la prueba de humo y la publicación. Úsala cuando pidan crear, armar, aplicar, actualizar o publicar un menú digital, carta con QR, sistema de pedidos o delivery para un restaurante, aunque no digan "menú digital".
---

# Crear menú digital (subrama de crear-sitio-web) — plug and play

**Responder siempre en español.** Esta skill depende de `crear-sitio-web` (reglas, estilos, seguridad) y de `contexto_biodigital` (estado del proyecto): léelas si es un chat nuevo. Todo se hace **dentro del repo del proyecto** (`C:\Users\criss\OneDrive\Escritorio\Proyecto DCP`; si no está, clonar https://github.com/cmartinezb07/BioDigital). La plantilla viva es `web/propuesta/ejemplos/fogon-del-sur/` y las herramientas están en `web/herramientas/`. **No se reescribe nada: se aplica el formulario.**

## Qué producto es (lo define la pregunta `servicios` del formulario)
| | **Carta QR simple** | **Menú con pedidos (sistema completo)** |
|---|---|---|
| Qué es | Carta estática con QR, sin pedidos | Carta editable por el dueño + pedidos mesa/retiro/delivery + cocina + reparto + panel del jefe |
| Cómo se arma | Generador `plantilla/generar-menu.mjs` (ver "Carta QR simple") | **`aplicar-formulario.mjs`** (flujo de abajo) |
| Precio | "desde $27.990" (catálogo, costo único) | Propuesta en `memoria/precios-menu-digital.md` (instalación + mensualidad): **aún no aprobada**; no prometer valores |
Si el cliente solo quiere mostrar la carta, no uses el sistema.

## Flujo plug and play del sistema completo
1. **Formulario** (64 preguntas, 10 bloques, ~15 min): `node respaldo-skills/crear-menu-digital/plantilla/formulario/construir-formulario.mjs --salida formulario-menu.html --agencia "Bío Digital" --contacto "…" --whatsapp 569XXXXXXXX [--supabase-url … --supabase-key …]`. Se publica o se manda por WhatsApp; con Supabase las respuestas llegan al panel interno como JSON. Si el dueño está presente, se usa como guion. **No mandarlo sin avisar.** Cómo leerlo: `referencias/levantamiento-menu.md`.
2. **Guardar las respuestas** en un archivo (`respuestas.json` con el JSON del formulario, o el texto que copia el formulario tal cual). Ejemplo completo: `web/herramientas/ejemplos-formulario/respuestas-ejemplo.json`.
3. **Aplicar:** `node web/herramientas/aplicar-formulario.mjs respuestas.json [--id mirador] [--url https://dominio-final/] [--demo]`. Crea `web/propuesta/ejemplos/<id>/` con la carta, platos, precios, tiempos, opciones, favoritos, comunas y envíos, horarios, mesas, mínimo de delivery, servicios, color y nombre; **quita todo lo de "ejemplo de Bío Digital"** (cinta, notas, pago de prueba, simulador de reparto, foto de portada) y las fotos de muestra; deja la carpeta **autosuficiente** (lleva su `nube.js`). Escribe, en `web/herramientas/restaurantes/` (fuera de git, tiene los PIN): `<id>-instalar.sql`, `<id>-prueba.js` y `<id>-pendientes.md`.
4. **Pendientes:** léelos y resuélvelos con el cliente (ubicación exacta del local, comunas sin coordenadas, fotos, logo, privacidad, dominio…). Lo que el cliente no dijo **nunca se inventa**: queda en pendientes. Etiquetas dietéticas y alérgenos solo con su confirmación, plato por plato, desde el panel.
5. **Accesos en la base:** ejecutar `<id>-instalar.sql` en el proyecto Supabase `biodigital-demos` (id `xoetybrsbuxcdoamcaeb`) con la herramienta `execute_sql` del MCP de Supabase. Crea jefe, cocina, reparto y el personal que nombró (cada uno con su PIN). No pegar PIN en canales públicos.
6. **Cargar la carta publicada:** `node web/herramientas/cargar-carta-base.mjs <id> <PIN-del-jefe> <id>`. Es **obligatorio**: el servidor valida precios y opciones contra la carta publicada; sin ella no hay validación. (Vuelve a la carta de la plantilla: usarlo solo antes de entregar, porque pisa lo que el dueño edite en el panel.)
7. **Probar:** servidor local (`preview_start maquetas`) y `node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/<id>/ --anchos 390,1440 --probar web/herramientas/restaurantes/<id>-prueba.js` (carta, PIN, precio manipulado rechazado, pedido real, cocina lo acepta, limpieza). Después a ojo, en celular y escritorio, con un pedido de cada tipo (mesa, retiro, delivery) pasando por cocina y reparto.
8. **Dejarlo del cliente:** entrar a `.../<id>/panel/` con el PIN del jefe → Carta (fotos propias, opciones), Negocio y equipo (logo, color, comunas, PIN), **publicar**. Cambiar los PIN provisorios y entregarlos por un canal privado.
9. **Publicar** (la ejecuta el usuario, salvo que lo pida): la carpeta se publica sola en el proyecto Cloudflare del cliente: `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true` (acordarse de la rama de producción `main`; ver `crear-sitio-web`). Dominio propio y HTTPS antes de imprimir el QR (QR estático, probado desde otro celular). **Para la demo de Bío Digital**, en cambio, solo se publica en https://biodigital-bgw.pages.dev (`contexto_biodigital`).
10. **Entrega y registro:** acta (dirección, accesos, quién cambia qué), anotar en `memoria/decisiones.md` el cliente, lo entregado y los pendientes.

## Qué recibe el cliente (sistema completo)
- **Carta pública** (datos, no HTML fijo): categorías, platos con foto, descripción, precio, opciones obligatorias o no (tamaño, término, extras), favoritos, agotados, buscador. El dueño la edita sola desde el panel y se publica en vivo.
- **Pedir:** en la mesa (QR por mesa), para retirar, o delivery con comunas y envío; validación visible de campos; "Modificar mi pedido" sobre el **mismo** pedido solo mientras está "Nuevo"; "Mis pedidos" con historial; seguimiento con estados, tiempo estimado y, en delivery, el repartidor en el mapa (más 4 juegos de espera).
- **Panel del restaurante** (`panel/`): un solo acceso. Según su código entra el **cocinero** (pantalla de cocina), el **repartidor** (entregas y GPS del celular) o el **jefe** (pedidos en vivo con aviso sonoro, carta, estadísticas con datos reales, opiniones con respuesta, negocio y equipo).
- **Reglas en el servidor** (no se pueden saltar desde el navegador): precios y opciones contra la carta, cada estado lo cambia solo su rol, un pedido "Nuevo" por cliente, versiones del pedido, un solo repartidor por entrega. Detalle y archivos: `referencias/sistema-restaurante.md`.

## Reglas que no se negocian
- **No inventar nada**: platos, precios, direcciones, horarios, alérgenos, fotos, reseñas, años. Falta → pendiente y se avisa.
- **Las referencias del cliente mandan** (cartas o links que le gustan).
- **Fotos con permiso o con licencia** (CC0, dominio público o CC BY con crédito); las de la plantilla son de ejemplo y se reemplazan.
- **Costo único vs recurrente**, siempre dicho: instalación (único) y mensualidad (base de datos, soporte). El pago en línea cobra comisión por venta **que paga el local**. El dominio .cl es aparte (~$10.000 al año; verificar en nic.cl). Supabase **Pro** (~US$25 al mes, compartido entre locales) antes del primer cliente real: el plan gratis se pausa tras una semana sin uso.
- **Seguridad y datos:** PIN privados (`demo: false` en un local real), nada de datos reales en demos, página de privacidad revisada con el negocio, sin secretos en el código (la llave de Supabase del sitio es pública por diseño).
- **Sin permiso del usuario no descargues archivos ni instales paquetes**, y no hagas deploys ni commits que no pidió.
- Frases cortas, sin jerga, en el idioma del cliente final.

## Cambios que NO salen del formulario (dónde se hacen)
| Cambio | Dónde |
|---|---|
| Fotos, precios, platos, opciones, favoritos, agotados | Panel › Carta (el dueño) |
| Logo, color (6), nombre, lema, horarios, mesas, mínimo, envío de las comunas | Panel › Negocio y equipo (el dueño) |
| PIN del personal | Panel › Negocio y equipo |
| Comuna nueva o ubicación exacta del local | `carta-base.json` del local (`config.comunas`, `config.local`) + `cargar-carta-base.mjs` (hoy no hay editor) |
| Pago en línea real | Aparte, con la cuenta de pago del local |
| Diseño y estructura de la página | Nunca el dueño; lo hace Bío Digital en la plantilla |

## Carta QR simple (solo carta, sin pedidos)
Generador estático en `plantilla/` (`menu.json` → `generar-menu.mjs`: `index.html`, 404, privacidad, sitemap, llms.txt, datos estructurados Restaurant + Menu, CSP). `--opciones` genera 5 estilos para elegir; fotos con `foto-a-modelo.py`; publicación en un proyecto Cloudflare por cliente. Pasos y estilos: `referencias/esquema.md`, `esteticas-menu.md`, `requisitos-menu.md`, `verificacion.md`. **El plato en 3D y la realidad aumentada están postergados** por decisión del usuario (no se ofrecen); la técnica queda archivada en `referencias/captura-3d.md` y en `plantilla/modelos/`.

## Verificación antes de entregar
`referencias/verificacion.md` (sitio) **y** estos: la prueba de humo del paso 7; `node web/herramientas/pedidos-reglas-e2e.mjs` (62 reglas del servidor) y `nube-e2e.mjs` (25 permisos) si se tocó el servidor; `node --test`; en la demo de Bío Digital, `node web/herramientas/check.mjs http://localhost:4321` (≈ 17 min; escribe en la base real y limpia lo suyo; no usar el panel mientras corre). Las pruebas de la demo están en `web/herramientas/pruebas/` (`fogon-del-sur.js`, `fogon-servicio.js`, `panel-dueno.js`, `mis-pedidos.js`).

## Límites conocidos (decirlos, no esconderlos)
- Los servicios que no atiende un local (p. ej. sin delivery) se ocultan en la pantalla, pero el servidor todavía no los bloquea.
- Sin avisos con el navegador cerrado (Web Push/WhatsApp) ni boleta electrónica; pago en línea solo cuando el local tenga su cuenta.
- Los PIN se guardan en texto plano (demostración): para producción, guardarlos con hash.
- La carta no tiene idiomas (solo español) ni editor de comunas nuevas.
- El SQL final de las reglas del servidor (migraciones 003–005) está aplicado en Supabase pero falta guardarlo en el repo (`web/herramientas/nube-sql/`).

## Más detalle
`referencias/sistema-restaurante.md` (arquitectura, archivos, tablas, reglas, pruebas, cómo se armaron la galería y el carrusel de la demo y sus capturas) · `memoria/plantilla-restaurante.md` · `memoria/precios-menu-digital.md` · `memoria/conexion-nube.md` · `memoria/menu-pedidos.md`.
