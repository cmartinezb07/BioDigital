# Índice — memoria del proyecto Bío Digital

- [Sitio principal y migración](docs/publicacion/MIGRACION-SITIO.md) — trabajar y publicar en `biodigital` (biodigital-bgw.pages.dev); la dirección antigua redirige y conserva payments-test.

- [Menú digital: plantilla de restaurante](memoria/plantilla-restaurante.md) — estructura vs datos, aislamiento por negocio y cómo crear un restaurante nuevo con nuevo-restaurante.mjs
- [Sistema de reservas: plantilla de agenda](memoria/plantilla-agenda.md) — mismo nivel que el menú: reglas en el servidor, panel jefe/recepción, formulario → agenda con aplicar-formulario-agenda.mjs (skill crear-sistemas-agendas); la demo en vivo aún espera el cambio (006e)
- [Precios del menú digital](memoria/precios-catalogo.md) — comparables (Fudo, MenuTiger, apps de delivery) y costos únicos vs recurrentes (la propuesta de 3 tramos se reemplazó por los precios finales PRO) propuestos (pendiente de aprobación)
- [Precios de todo el catálogo](memoria/precios-catalogo.md) — análisis del 25-oct: costo por hora, competencia, único vs. único + mensual y precios sugeridos (pendiente de aprobación)
- [Conexión en la nube](memoria/conexion-nube.md) — pedidos, reservas y fidelización conectados entre equipos (Supabase `biodigital-demos`): roles por PIN, flujo del restaurante, GPS del delivery paso a paso, costos y límites.
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
- [Propuesta del sitio web](web/propuesta/) — el sitio oficial (`index.html`, generado con `node fuentes/generar.mjs 8`; textos y precios en `fuentes/comun.mjs`), con carrusel de 8 sitios de ejemplo, galería `ejemplos/` y políticas en `privacidad/` y `terminos/`.
- [Estado actual](memoria/estado-actual.md) — punto de retorno para sesiones nuevas: qué está listo, qué falta, cómo retomar.
- [Publicación comercial](docs/publicacion/PUBLICACION-COMERCIAL.md) — guía para crear los 9 enlaces fijos, revisar y publicar en main. Catálogo sin el producto de $100, servicios “desde” por cotización; enlaces comerciales pendientes.
- [Pagos](docs/pagos/PAGOS.md) — estado vigente del flujo manual y API deshabilitada. [Ensayo de $100](docs/pagos/PRUEBA-COBRO-100.md): histórico, rechazado por seguridad; producto retirado.
- [Decisiones](memoria/decisiones.md) — bitácora cronológica de decisiones tomadas y su justificación.
- Skill `crear-sitio-web` (en `~/.claude/skills/`, respaldo en `respaldo-skills/`) — flujo reutilizable para sitios de clientes: preguntas, maquetas con 5 estéticas, requisitos SEO/seguridad, recursos evaluados.
- Skills (en `~/.claude/skills/`, respaldo en `respaldo-skills/`): `crear-sitio-web` (base), `crear-menu-digital` (subrama para menús con QR y plato en vivo; usa el mismo motor de formularios), `crear-sistemas-agendas` (subrama para sistemas de reservas y agendas, plug and play) y `contexto_biodigital` (contexto completo del proyecto; reemplaza a `contexto_pagina_web`).
- [Panel interno](web/panel/LEEME.md) — solicitudes en vivo, formularios, caja y equipo, con login y segundo factor (Supabase). Dirección: https://main.biodigital-panel.pages.dev
- [Menú digital con pedidos](web/propuesta/ejemplos/fogon-del-sur/) — sistema completo y plantilla para restaurantes (demo Fogón del Sur): carta, pedidos, cocina, reparto y panel. La versión antigua con 3D se eliminó el 27-oct (la técnica sigue en la skill crear-menu-digital).
- Formularios para clientes: `web/propuesta/formulario.html` (página web, 59 preguntas) y `formulario-menu.html` (menú digital, 64) y `formulario-reservas.html` (sistema de reservas, 39); se arman con `node web/propuesta/fuentes/formularios.mjs`.
- [Ejemplos: matriz CREA y trazabilidad](memoria/ejemplos-matriz.md) — plantilla de referencia, segmento y matriz CREA de cada sitio de ejemplo; requisitos → criterios → pruebas.
- [Competencia y margen de mejora](memoria/competencia.md) — mapa de competencia con precios, costo a 3 años, velocidad medida, hallazgos por impacto y decisiones pendientes (22-oct-2026).
- [Menú digital con pedidos](memoria/menu-pedidos.md) — restaurante: pedidos en mesa, retiro y delivery, seguimiento con mapa, cocina, repartidor y panel; competencia y costos recurrentes (23-oct-2026).
- [Sistema de reservas completo](memoria/reservas-sistema.md) — 5 rubros, panel, políticas, avisos, iCal y reportes; competencia y costos recurrentes (23-oct-2026).
- [Posible cliente: La Joya del Sur (Penco)](memoria/cliente-la-joya-del-sur.md) — diagnóstico del 27-oct, qué ofrecerles y plan para la reunión del miércoles 28-oct 18:00
- [Propuestas comerciales](propuestas/LEEME.md) — plantilla de una página en PDF (`node propuestas/generar.mjs <negocio>`), precios importados del sitio; primera: Café Kairós (27-oct-2026).
- [Reservas: lo que pidió el usuario](memoria/reservas-requisitos.md) — encargo, observaciones de prueba y lista universal en un lugar; qué falta para terminar el sistema (29-oct)
