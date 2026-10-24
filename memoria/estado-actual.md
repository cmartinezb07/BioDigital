# Estado actual (punto de retorno) — actualizado 2026-10-24

> Resumen vigente y completo: skill `contexto_biodigital` (`~/.claude/skills/` y `respaldo-skills/`). Lo de abajo es el detalle del sitio hasta septiembre; las decisiones recientes están al final de `decisiones.md`.

**Estado al 24-oct-2026:** preparación comercial en `feat/pagos-comerciales-por-enlace`, sincronizada con origin/main 9b43f8f. Catálogo completo de 14 productos, sin la opción de $100, y configuración de enlaces por producto. El usuario confirmó cotización previa para los servicios “desde”. Faltan los 9 enlaces de precio cerrado y un cobro aprobado; la guía es `PUBLICACION-COMERCIAL.md`. Preview actualizado, despliegue `cd511377`; 37 pruebas pasan. La API automática sigue apagada. No se fusionó ni publicó main.

Leer esto primero al empezar una sesión nueva.

**Repositorio:** https://github.com/cmartinezb07/BioDigital (privado, el equipo trabaja ahí desde el 2026-10-06).
Quien llegue nuevo parte por [EMPEZAR-AQUI.md](../EMPEZAR-AQUI.md).

## Sitio web (web/propuesta/)
- **El sitio es la opción 8** (mezcla de la 6 y la 7) y se genera como `web/propuesta/index.html`. Logo aplicado y paleta de marca (`#0da5ff` / `#00e5d0`), con rueda de colores para probar otras.
- **Pagos:** versión comercial por enlaces en https://payments-test.biodigital-propuesta.pages.dev; faltan 9 enlaces fijos en `web/propuesta/fuentes/enlaces-pago.mjs`. Un producto con enlace correcto abre su cobro; pedidos combinados y servicios variables se confirman por WhatsApp y reciben un enlace por el total. Verificación manual del estado aprobado en el portal, sin actualización automática del sitio/panel. El ensayo previo de $100 fue rechazado por seguridad y su producto/enlace se retiraron del sitio. La API Preferences y su D1 de prueba quedan separadas y deshabilitadas. Detalle en `PAGOS.md` y `PUBLICACION-COMERCIAL.md`.
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
