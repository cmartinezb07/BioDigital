---
name: contexto_pagina_web
description: Contexto completo del sitio web de Bío Digital (startup de 5 estudiantes UdeC, Gran Concepción) para retomar el trabajo en un chat nuevo sin releer todo. Úsala cuando pidan editar, regenerar, publicar o ampliar la página web, el gato mascota, la paleta, el logo, los precios o las promociones de Bío Digital.
---

# Contexto: página web de Bío Digital

**Responder siempre en español.** Proyecto: `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP`. Repo privado: https://github.com/cmartinezb07/BioDigital. Publicado: https://biodigital-propuesta.pages.dev. Antes de nada lee `MEMORY.md`, `memoria/estado-actual.md` y el final de `memoria/decisiones.md`.

## Estructura (web/propuesta/)
- **El sitio = opción 8** → `index.html` (generado). Las opciones 3–7 son plantillas ya hechas en `plantillas/` (con galería). `opcion-8-final.html` solo redirige.
- **NO editar los HTML generados.** Regenerar con `node fuentes/generar.mjs [3 4 … 8]` desde `web/propuesta`.
- `fuentes/comun.mjs`: contenido compartido (SERVICIOS, ASPECTOS, PROMOS, FAQ, precios). `fuentes/opcion-8.mjs`: estética y portada del sitio. `kit.css`: estilos comunes. Prefijo de rutas `${b}` (raíz vs `plantillas/`).
- Servir: preview "maquetas" (`.claude/launch.json`, puerto 4321, `web/servir.py` sin caché). Si se cae, `preview_start`.
- Archivos: `mundo.js` (tema, burbuja, FAQ), `secciones.js` (puntaje, formulario demo), `paleta.js/.css` (rueda de colores del equipo), `gato.js/.css` (gato SVG), `mascota.js` (motor), `mascota-gato.js` (frases), `formulario.html` (levantamiento de 59 preguntas para el cliente).

## Catálogo vigente (desde 11-oct-2026; costo único, sin mensualidad)
Página web desde $49.990 · Videos para redes desde $9.990 · Menú digital desde $27.990 · Registro fotográfico $4.990 · Reservas desde $24.990 · Tarjeta de fidelización $9.990. Suma $127.940. **Pack completo $79.990** (ahorro $47.950). Los otros servicios están en stand by (`servicios-futuros/`). Dominio .cl y hosting NO incluidos (valor `[por confirmar]`).

## Promociones
- Primeros 5 clientes: pack a **$69.990**, o 10 % sobre compras desde $30.000 (la antigua del "doble de soporte por publicar tu caso" fue descartada).
- Fugaces: 2 videos $17.990 · 3 videos $24.990 · fidelización $7.990 · menú+fotos $29.990 · reservas+fidelización $29.990.

## Diagnóstico gratis
Se hace en el primer contacto. Mide qué tan digitalizado está el negocio, 100 puntos: sitio propio 25 · cómo se ve 20 · qué vendes 20 · cómo te reservan 20 · si vuelve 15. Ya NO mide Google/Maps/ficha.

## Marca y paleta
Logo en 2 máscaras (`marca/mascara-marca-540.png`, `mascara-texto-540.png`): la "B" usa `--c1→--c2`, el texto `--fg`; cambia con la rueda. Colores originales: `--c1 #0da5ff`, `--c2 #00e5d0` ("Restablecer" vuelve a ellos). Todo deriva de esos dos con `color-mix`. Favicon/OG en `marca/`. `marca/variante-1/` sin uso (otra "B").

## Gato
SVG por partes, frente y perfil, ojos que siguen al mouse, giro sin quedarse a medias, una reacción por tramo de scroll, hover con dwell, se marea si sacuden el mouse (máx 2), globo según largo del texto, tope 12 frases/min. Frases en `mascota-gato.js` (ya sin referencias a Google/planes). Lámina: `gato-lamina.html`.

## Reglas del usuario
- Español siempre. Seguir referencias al pie de la letra. No inventar reseñas, cifras ni datos: usar `[PENDIENTE]`/"por confirmar". Ser crítico antes de borrar. Anotar decisiones en `memoria/decisiones.md`.
- `git push` y `wrangler pages deploy` los ejecuta el usuario (el push fue denegado): `git push` y `npx wrangler pages deploy web/propuesta --project-name=biodigital-propuesta --branch=main --commit-dirty=true`.
- Skill hermana para sitios de clientes: `crear-sitio-web` (respaldo en `respaldo-skills/`).

## Pendiente
- Acortar la página (hoy 8.869 px a 1440 px): el usuario está definiendo criterios con su amigo.
- Probar a ojo la fluidez de la burbuja del tema (no se pudo medir por panel oculto).
- Valor anual de dominio .cl + hosting; número de WhatsApp del equipo (pie del formulario).
- Confirmar variante de logo; subir cambios (push + deploy).
- Preguntas viejas: Jornada de Terreno 2-oct, plan de Claude y quién lo paga, piloto del bot de WhatsApp.

## Cómo verificar
Navegador integrado, 1440 px y 390 px: sin desborde (`scrollWidth`), textos ≥12 px, consola sin errores, recursos sin 404. Los `.reveal` quedan en opacidad 0 hasta entrar en pantalla (esperar o forzar `.in`).
