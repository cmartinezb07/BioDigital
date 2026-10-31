---
name: contexto_biodigital
description: Contexto de Bío Digital (startup UdeC, Gran Concepción) para retomar trabajo: sitio, panel, menú digital, reservas, fidelización, precios, publicación. Úsala al editar, publicar o ampliar cualquier cosa de Bío Digital o al preguntar en qué quedó el proyecto.
---

# Bío Digital — contexto (versión corta)

Responder en español. Proyecto: `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP` (carpeta = vault de Obsidian). Repo: https://github.com/cmartinezb07/BioDigital

**No leas más de esto sin necesidad.** Abre `00 Inicio/Inicio.md` (tabla "qué necesito → dónde está") y `00 Inicio/Estado.md`; luego solo el archivo que toque. La versión larga de esta skill está en `memoria/contexto-completo.md`: consúltala **solo con Grep**.

## Reglas del usuario (siempre)
- Español. Seguir las referencias al pie de la letra. No inventar reseñas, cifras ni datos (`[PENDIENTE]` / "por confirmar"). Distinguir costo único de recurrente; cifras de terceros como aproximadas.
- El cliente edita el CONTENIDO de su página (precios, servicios, horarios, profesionales, avisos con fechas, días libres) en su planilla de Google, nunca la estructura ni el diseño (decisión 30-oct). Sin mensualidad ni Supabase en esos casos. Ver `crear-sitio-web` › "Contenido editable por el dueño" y `docs/guia-planilla-dueno.md`.
- Deploys (`wrangler pages deploy`) y push los ejecuta el usuario, salvo que lo pida. No crear commits sin que lo pida.
- Skills en dos copias: `~/.claude/skills/<skill>/` (la que se usa) y `respaldo-skills/<skill>/`. Cambiar una → copiar a la otra.
- Cada commit actualiza el vault: nota del día en `10 Decisiones/`, `Estado`, `Pendientes`.
- Solo operamos en el Gran Concepción. Capital semilla $80.000 CLP.

## Datos clave
- Contacto y costos: fuente única `web/propuesta/fuentes/config.mjs`. Catálogo y precios: `web/propuesta/fuentes/comun.mjs`.
- Sitio: `node web/propuesta/fuentes/generar.mjs 8`. Publicación comercial en `biodigital-bgw.pages.dev` (única dirección donde se publica): `generar.mjs --publico 8`, luego `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`, luego `generar.mjs 8`.
- Restaurante de cliente: `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true`.
- No tocar sin pedirlo: `biodigital-propuesta`, `biodigital-panel`, `menu-demo`.
- Skills por servicio: `crear-sitio-web` (página), `crear-menu-digital` (menú simple y PRO), `crear-sistemas-agendas` (reservas PRO), `crear-reserva-simple`, `crear-fidelizacion`, `crear-registro-fotografico`, `crear-videos-redes`, `propuesta-comercial`.
