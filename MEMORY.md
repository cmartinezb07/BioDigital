# Índice — memoria del proyecto Bío Digital

- [EMPEZAR-AQUI.md](EMPEZAR-AQUI.md) — para quien llega nuevo o va a trabajar el proyecto con otra IA: qué leer, en qué orden y el prompt listo para copiar.

- [contexto.md](contexto.md) — brief fijo del proyecto: equipo, propósito, alcance, presupuesto original, stakeholders, fechas.
- [PRD.md](PRD.md) — especificación vigente (v0.1): servicio + herramienta Radar, scoring, economía, cronograma, riesgos y preguntas abiertas.
- [Conceptualización del negocio](memoria/conceptualizacion.md) — problema, solución, paquetes, ICP, diferenciación, propuesta de valor.
- [Riesgos críticos](memoria/riesgos-criticos.md) — hallazgos priorizados por impacto sobre presupuesto, cronograma y estructura de costos.
- [Conceptos clave a dominar](memoria/conceptos-clave.md) — lista de fase 2: BMC, pricing, scoring, funnel, legal, KPIs.
- [Servicios — catálogo vigente](servicios/) — los 6 decididos el 2026-10-06, una carpeta y una ficha por servicio.
- [Servicios futuros](servicios-futuros/) — los que quedaron en stand by, también con una carpeta cada uno.
- [Servicios vendibles](memoria/servicios-vendibles.md) — evaluación técnica previa (web, dominio, Google Business, fotos, catálogo, WhatsApp, voz): dificultad, estructura de costo y tiering. Sigue valiendo como análisis; el catálogo vigente es el de `servicios/`.
- [PRODUCT.md](PRODUCT.md) — contexto de producto para diseño (Impeccable): usuarios, posicionamiento, restricciones, evidencia disponible.
- [Propuesta del sitio web](web/propuesta/) — textos (`textos.md`) y galería `index.html` con 7 estéticas: 1 `maqueta-final.html` (vidrio iOS), 2 certificado, 3–7 según los links del equipo (se generan con `node fuentes/generar.mjs`); falta que el equipo elija.
- [Estado actual](memoria/estado-actual.md) — punto de retorno para sesiones nuevas: qué está listo, qué falta, cómo retomar.
- [Decisiones](memoria/decisiones.md) — bitácora cronológica de decisiones tomadas y su justificación.
- Skill `crear-sitio-web` (en `~/.claude/skills/`, respaldo en `respaldo-skills/`) — flujo reutilizable para sitios de clientes: preguntas, maquetas con 5 estéticas, requisitos SEO/seguridad, recursos evaluados.
- Skills (en `~/.claude/skills/`, respaldo en `respaldo-skills/`): `crear-sitio-web` (base), `crear-menu-digital` (subrama para menús con QR y plato en vivo; usa el mismo motor de formularios) y `contexto_biodigital` (contexto completo del proyecto; reemplaza a `contexto_pagina_web`).
- [Panel interno](web/panel/LEEME.md) — solicitudes en vivo, formularios, caja y equipo, con login y segundo factor (Supabase). Dirección: https://main.biodigital-panel.pages.dev
- [Menú digital](web/menu/) — plantilla y demo "Fogón del Sur" (https://main.menu-demo.pages.dev): carta estilo restaurante con "Ver en tu mesa" (3D y realidad aumentada).
- Formularios para clientes: `web/propuesta/formulario.html` (página web, 59 preguntas) y `formulario-menu.html` (menú digital, 60); se arman con `node web/propuesta/fuentes/formularios.mjs`.

