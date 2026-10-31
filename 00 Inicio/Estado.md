---
tags: [estado]
---
# Estado — 31-oct-2026

↩ [[Inicio]] · Siguiente: [[Pendientes]]

## Qué existe
- **Sitio oficial:** https://biodigitales.cl (misma versión en biodigital-bgw.pages.dev, única dirección donde se publica). Se genera con `node web/propuesta/fuentes/generar.mjs 8`; precios y textos en `web/propuesta/fuentes/comun.mjs`. **La demo de la barbería (31-oct) aún no está publicada.**
- **Catálogo (26-oct):** seis productos de pago único; dos sistemas PRO con mensualidad de $20.000 (primer mes gratis); pack esencial $69.990 de lanzamiento; pack PRO $120.000. **Sin anticipo:** se paga al entregar y firmar el acta.
- **Panel interno** (`web/panel/`, Supabase `biodigital-panel`) y **nube de demos** (Supabase `biodigital-demos`): [[conexion-nube]].
- **Formularios del cliente:** página web, menú digital, reservas.
- **Propuestas en PDF** (`propuestas/`), primera: Café Kairós.
- **Skills** (respaldo en `respaldo-skills/`): crear-sitio-web, crear-menu-digital, crear-sistemas-agendas, contexto_biodigital, propuesta-comercial, crear-reserva-simple, crear-fidelizacion, crear-registro-fotografico, crear-videos-redes.
- **Clientes cerrados:** ninguno aún. Posible: La Joya del Sur (Penco) → [[cliente-la-joya-del-sur]].

## Último trabajo (31-oct, madrugada)
- **Demo completa de la barbería:** página del cliente, panel "Mi agenda" (resumen de mañana, Actualizar, "Editar mi página (planilla)") y "Mi planilla" simulada. Checklist de entrega real en `demo.config.js`, `docs/guia-planilla-dueno.md` y skill `crear-reserva-simple`.
- **Plantilla Excel** `docs/plantillas/planilla-barberia.xlsx` verificada por el usuario en Google Sheets; lectura real probada (cambio de precio visible tras recargar el CSV publicado).
- **Nota comercial de letra chica** (planilla propia, a pedido, sin mensualidad) en la reserva simple.
- **QA:** 198 pasan, 0 fallan, 4 omitidas por fecha; revisión de seguridad aprobada. Sin commit.
- **Mod de la app `progreso-equipo`** (barra de tareas y agentes, `/progreso`): cargado en `~/.claude/dev-mods/`; **sin verificar que la barra se vea.**
- Detalle: [[2026-10-30]] (sección 31-oct).

## Trabajo anterior (29-30 oct)
- Reservas PRO: módulos activables, unidad asignada, reserva por teléfono, bloqueos, pestaña Clientes, reseña de Google, recordar a los de mañana por WhatsApp. Demo publicada el 30-oct. Detalle: [[2026-10-29]], [[2026-10-30]].
- Reserva simple sobre Google Calendar del dueño (sin mensualidad), probada con calendario real.
- Menú simple con planilla de Google; fidelización parametrizable; cartel con QR.
- Cómo editar en la página sin Supabase: Camino A (Google) o B (Cloudflare con PIN), **sin decidir**; recomendación A.

## Estado por servicio
Ver [[Servicios]] (resumen) o [[checklist-servicios]] (detalle).

- **Pruebas de recorrido:** `npm run e2e` (Playwright: 24/24 páginas públicas + 12/12 recorrido de la reserva simple; faltan menú y fidelización). Suite total 198/198 (31-oct, 4 omitidas por fecha).
- **Barbería El Filo con reserva simple** (`ejemplos/barberia-simple/`): demo completa, alimentada por la planilla del dueño; Google real del mini panel pendiente de credenciales OAuth. **Sin publicar.**
- **Agentes:** orquestador + 8 especialistas en `.claude/agents/` (ver `CLAUDE.md`).

## Riesgos abiertos
- `nube-sql/007` (sellos de fidelización para cualquier negocio) **sin aplicar**: aplicar antes de entregar la primera tarjeta real.
- Supabase gratis se pausa sin uso: pasar a Pro antes del primer cliente.
- "Respondemos en menos de 24 horas **por confirmar**" visible en la página (`comun.mjs`, ~línea 383).
- Costo de configurar la planilla del cliente sin definir (hoy solo "sin mensualidad").
- Repositorio de GitHub público con fichas de clientes y precios: decidir si pasa a privado.
