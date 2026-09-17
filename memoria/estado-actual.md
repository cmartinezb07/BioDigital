# Estado actual (punto de retorno) — 2026-09-17

Leer esto primero al empezar una sesión nueva.

## Sitio web (web/propuesta/)
- 7 maquetas listas y verificadas (sin errores de consola): 1 vidrio iOS (`maqueta-final.html`), 2 certificado (blanco puro / noche negra), 3 metal líquido, 4 cristal, 5 ASCII, 6 panel SaaS, 7 foco/fintech. Galería en `index.html`.
- Servir: preview "maquetas" (`.claude/launch.json`, puerto 4321).
- Páginas 3–7 se generan: `node web/propuesta/fuentes/generar.mjs [3 4 …]`. No editar los HTML generados; textos en `fuentes/comun.mjs`.
- Mascota (sello de marca): gato (sarcástico), panda (tierno/triste), conejo (hiperactivo/enojón), pingüino (formal, "usted"). Motor genérico `mascota.js`; frases y personalidades en `mascota-personajes.js`; imágenes en `mascotas/<animal>/` (12 reacciones WebP). Hojas originales y recortador en `mascotas/fuente/`.

## Pendiente
- Que el equipo elija una estética (y apruebe las frases de la mascota).
- Probar en celulares reales.
- Tras la elección: `DESIGN.md` y sitio final en Astro (fase 2 de la skill).
- Datos del negocio marcados "por confirmar" siguen sin completar.

## Skill crear-sitio-web
- Instalada en `~/.claude/skills/crear-sitio-web/`; respaldo versionado en `respaldo-skills/crear-sitio-web/`.
- Si se pierde la instalada: `cp -r respaldo-skills/crear-sitio-web ~/.claude/skills/`.
- Incluye: preguntas, 5 estéticas generables, requisitos SEO/seguridad, recursos (repos y webs), verificación, y módulo opcional de mascota animada (preguntas, prompt de hoja, recortador, cuadro a cuadro).
