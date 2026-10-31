---
tags: [estado]
---
# Estado — 31-oct-2026

↩ [[Inicio]] · Siguiente: [[Pendientes]]

## Qué existe
- **Sitio oficial:** https://biodigitales.cl (misma versión en biodigital-bgw.pages.dev, única dirección donde se publica). Se genera con `node web/propuesta/fuentes/generar.mjs 8`; precios y textos en `web/propuesta/fuentes/comun.mjs`. **Los cambios del 31-oct (precio de la reserva simple, portada, demo de la barbería) aún no están publicados.**
- **Catálogo (31-oct):** seis productos de pago único; reserva simple $27.990 (planilla incluida, sin mensualidad); dos sistemas PRO con mensualidad de $20.000 (primer mes gratis); pack esencial $79.990 ($69.990 de lanzamiento); pack PRO $120.000. **Sin anticipo:** se paga al entregar y firmar el acta.
- **Panel interno** (`web/panel/`, Supabase `biodigital-panel`) y **nube de demos** (Supabase `biodigital-demos`): [[conexion-nube]].
- **Formularios del cliente:** página web, menú digital, reservas.
- **Propuestas en PDF** (`propuestas/`), primera: Café Kairós.
- **Skills** (respaldo en `respaldo-skills/`): crear-sitio-web, crear-menu-digital, crear-sistemas-agendas, contexto_biodigital, propuesta-comercial, crear-reserva-simple, crear-fidelizacion, crear-registro-fotografico, crear-videos-redes.
- **Clientes cerrados:** ninguno aún. Posible: La Joya del Sur (Penco) → [[cliente-la-joya-del-sur]].

## Último trabajo (31-oct, noche)
- **Galería de ejemplos:** una tarjeta por demo con enlaces a sus piezas; franja "Demo · recorre las N piezas" en barbería, Fogón del Sur, reservas PRO y fidelización. Sin publicar. Detalle: [[2026-10-31]].

## Último trabajo previo (31-oct, tarde)
- **Reserva simple a $27.990** (antes $24.990), con planilla de Google incluida y sin mensualidad; pack esencial sigue en $79.990 ($69.990 de lanzamiento). Detalle: [[2026-10-31]].
- **Portada:** lista de productos con una sola tipografía para precios y filas alineadas.
- **Check-in de servicios:** listos página web, menú simple, menú PRO y reservas PRO; el resto pendiente (ver [[checklist-servicios]]).
- **QA:** 232 pasan, 0 fallan, 4 omitidas por fecha.
- **Mercado Pago:** 6 de 21 enlaces con URL; falta crear el de la reserva simple a $27.990.

## Trabajo de la madrugada (31-oct)
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

- **Pruebas de recorrido:** `npm run e2e` (Playwright: 24/24 páginas públicas + 12/12 recorrido de la reserva simple; faltan menú y fidelización). Suite total: 232 pasan, 0 fallan, 4 omitidas por fecha (31-oct).
- **Barbería El Filo con reserva simple** (`ejemplos/barberia-simple/`): demo completa, alimentada por la planilla del dueño; Google real del mini panel pendiente de credenciales OAuth. **Sin publicar.**
- **Agentes:** orquestador + 8 especialistas en `.claude/agents/` (ver `CLAUDE.md`).

## Riesgos abiertos
- `nube-sql/007` (sellos de fidelización para cualquier negocio) **sin aplicar**: aplicar antes de entregar la primera tarjeta real.
- Supabase gratis se pausa sin uso: pasar a Pro antes del primer cliente.
- "Respondemos en menos de 24 horas **por confirmar**" visible en la página (`comun.mjs`, ~línea 390).
- Registro fotográfico: la página dice "10 a 15 fotos editadas" y la decisión vigente es "sin límite fijo". Hay que decidir cuál manda.
- Mercado Pago: 15 de 21 enlaces sin URL y sin enlace de la reserva simple a $27.990.
- Repositorio de GitHub público con fichas de clientes y precios: decidir si pasa a privado.
