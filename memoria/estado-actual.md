# Estado actual (punto de retorno) — actualizado 2026-10-14

> Resumen vigente y completo: skill `contexto_biodigital` (`~/.claude/skills/` y `respaldo-skills/`). Lo de abajo es el detalle del sitio hasta septiembre; las decisiones recientes están al final de `decisiones.md`.

**Estado al 14-oct-2026:** sitio con carrusel de ejemplos, tienda y carrito; panel interno con login y segundo factor en producción (Cloudflare + Supabase); formularios de página web y de menú que llegan al panel; menú digital con plato en vivo (demo publicada; AR probada en un iPhone con un plato plano; falta escaneo 3D real); skills `crear-sitio-web`, `crear-menu-digital` y `contexto_biodigital`. El Preview aislado de pagos está publicado con D1 de prueba y cobros deshabilitados.

Leer esto primero al empezar una sesión nueva.

**Repositorio:** https://github.com/cmartinezb07/BioDigital (privado, el equipo trabaja ahí desde el 2026-10-06).
Quien llegue nuevo parte por [EMPEZAR-AQUI.md](../EMPEZAR-AQUI.md).

## Sitio web (web/propuesta/)
- **El sitio es la opción 8** (mezcla de la 6 y la 7) y se genera como `web/propuesta/index.html`. Logo aplicado y paleta de marca (`#0da5ff` / `#00e5d0`), con rueda de colores para probar otras.
- **Pagos, Preview seguro:** Mercado Pago está integrado dentro del carrito; una compra de servicios con precio cerrado crea una sola orden con sus líneas, mientras los productos “desde” o “a cotizar” conservan el flujo de diagnóstico/WhatsApp. Pages Functions están publicadas solo en `payments-test`; D1 `biodigital-payments-test` está enlazada solo como `DB` de Preview y tiene aplicadas `0001_orders.sql` y `0002_order_items.sql`. `PAYMENTS_ENABLED=false`, los 14 SKU siguen bloqueados y D1 tiene cero órdenes/eventos/líneas. El Preview actual es https://payments-test.biodigital-propuesta.pages.dev. Siguen pendientes las credenciales de prueba `APP_USR-` (ticket WCS-54274) y las pruebas reales/webhooks. Contrato y operación en `PAGOS.md`.
- Las siete anteriores son **plantillas ya hechas**: `web/propuesta/plantillas/`, con galería propia.
- Servir: preview "maquetas" (`.claude/launch.json`, puerto 4321) con `web/servir.py`, sin caché.
- Páginas 3–8 se generan: `node web/propuesta/fuentes/generar.mjs [3 4 … 8]`. No editar los HTML generados; textos comunes en `fuentes/comun.mjs`, estética en `fuentes/opcion-N.mjs`.
- Paleta de la opción 8: dos colores (`--c1`, `--c2`) con rueda de colores para el equipo (`paleta.js`, se quita al publicar).
- **Mascota (todas las páginas):** solo el gato, dibujado en SVG por partes (de frente y de perfil, con giro completo) y animado a la tasa de la pantalla (`gato.js`, `gato.css`). Frases en `mascota-gato.js`, motor en `mascota.js`. La ropa toma los colores de cada estética. Lámina de poses y gestos: `gato-lamina.html`.
- **Mascota a prueba de usos raros (2026-09-18):**
  - los ojos siguen al mouse;
  - el giro nunca queda a medias;
  - hay una reacción por tramo de scroll;
  - el hover reacciona solo si el mouse se detiene;
  - comenta cada sección como antes (unos 11 comentarios por recorrido); un globo dura lo que tarda en leerse y ya no queda pegado;
  - con el mouse sacudido, el gato se marea (máximo 2 veces por visita).
  - Detalle y mediciones en `decisiones.md`.
- **Borrados el 2026-10-06** los 4 animales en imágenes y su motor (`mascota-personajes.js`, `mascotas/`): 5 MB sin uso desde que el gato se dibuja en SVG. Están en el historial de git (commit `d1e3823`); para recuperarlos: `git checkout d1e3823 -- web/propuesta/mascotas web/propuesta/mascota-personajes.js`.
- Las hojas de referencia del gato siguen en `web/propuesta/referencias-gato/` (`gato-emociones.webp`, `gato-feliz.webp`), por si hay que redibujarlo.
- Publicado en https://biodigital-propuesta.pages.dev (actualizado el 2026-09-18: las 8 opciones con el gato nuevo, y la lámina en `/gato-lamina`; **falta subir la corrección de los comentarios**). Para volver a subir: `npx wrangler pages deploy web/propuesta --project-name=biodigital-propuesta --branch=main --commit-dirty=true`.

- **Formulario para el cliente:** `web/propuesta/formulario.html` (59 preguntas, 15 minutos). Se manda por link o por WhatsApp. Cómo leer las respuestas: `respaldo-skills/crear-sitio-web/referencias/levantamiento.md`.

## Pendiente
- Que el equipo fije la paleta con la rueda y apruebe el gato y sus frases.
- Probar en celulares reales.
- Luego: `DESIGN.md` y sitio final en Astro (fase 2 de la skill).
- Datos del negocio marcados "por confirmar" siguen sin completar.

## Skill crear-sitio-web
- Instalada en `~/.claude/skills/crear-sitio-web/`; respaldo versionado en `respaldo-skills/crear-sitio-web/`.
- Si se pierde la instalada: `cp -r respaldo-skills/crear-sitio-web ~/.claude/skills/`.
- Incluye: preguntas, 5 estéticas generables, requisitos SEO/seguridad, recursos (repos y webs), verificación, y módulo opcional de mascota animada (preguntas, prompt de hoja, recortador, cuadro a cuadro).
