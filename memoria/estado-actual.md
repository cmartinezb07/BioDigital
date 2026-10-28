# Estado actual (punto de retorno) — actualizado 2026-10-27

> El resumen más completo y vivo es la skill `contexto_biodigital` (copia en `respaldo-skills/contexto_biodigital/SKILL.md`). Esta hoja es la versión corta, para ubicarse en un minuto. Lo decidido, con fecha y motivo, está en [decisiones.md](decisiones.md); los precios vigentes, en [precios-catalogo.md](precios-catalogo.md).

## Qué existe hoy
- **Sitio oficial:** https://biodigitales.cl (misma versión en biodigital-bgw.pages.dev; `biodigital-propuesta.pages.dev` solo redirige). Se genera con `node web/propuesta/fuentes/generar.mjs 8`; precios, catálogo y textos salen de `web/propuesta/fuentes/comun.mjs`. Publicación y entornos: [MIGRACION-SITIO.md](../docs/publicacion/MIGRACION-SITIO.md).
- **Catálogo y precios** (26-oct): seis productos de pago único, dos sistemas PRO con mensualidad de $20.000 (primer mes gratis), pack esencial $69.990 de lanzamiento, pack PRO $120.000, ofertas relámpago. **Sin anticipo** (27-oct): se paga al entregar y firmar el acta.
- **Sitios de ejemplo** (`web/propuesta/ejemplos/`): Fogón del Sur (menú digital con pedidos, cocina, reparto y panel), reservas, fidelización, y los ejemplos de rubro del carrusel.
- **Pagos** (Benjamín): enlaces fijos de Mercado Pago; el cobro por API solo existe en el entorno de pruebas. Ver [PAGOS.md](../docs/pagos/PAGOS.md), [COBROS-POR-ENLACE.md](../docs/pagos/COBROS-POR-ENLACE.md) y [PUBLICACION-COMERCIAL.md](../docs/publicacion/PUBLICACION-COMERCIAL.md).
- **Propuestas comerciales en PDF** (Xavier): `propuestas/` (ver [LEEME](../propuestas/LEEME.md)); los precios se leen del sitio. Primeras: Café Kairós y Zoulbarber Studio.
- **Formularios del cliente:** `formulario.html` (página web), `formulario-menu.html` (menú digital, 80 preguntas) y `formulario-reservas.html`.
- **Panel interno** (`web/panel/`, Supabase `biodigital-panel`) y **nube de las demos** (Supabase `biodigital-demos`): ver [conexion-nube.md](conexion-nube.md).
- **Skills del proyecto** (`respaldo-skills/`): crear-sitio-web, crear-menu-digital, crear-sistemas-agendas, contexto_biodigital, propuesta-comercial.

## Pendientes que mandan
1. Demo de reservas publicada: sigue el cliente viejo a propósito; falta aplicar `006e` (ver la skill `contexto_biodigital`).
2. Antes del primer cliente real: Supabase Pro, PIN privados, pago en línea con la cuenta del local y privacidad revisada con el negocio.
3. IVA, enlaces de Mercado Pago para los SKU nuevos y cómo se edita el menú simple sin mensualidad.
4. Reunión con La Joya del Sur (28-oct 18:00): ver [cliente-la-joya-del-sur.md](cliente-la-joya-del-sur.md).

## Qué se eliminó (27-oct-2026)
Las opciones de diseño 2 a 7 y la carpeta `plantillas/`, sus fuentes y accesos directos, `textos.md` (plan Base/Estándar/Premium), y capturas y reportes generados. Todo sigue en el historial de git: etiqueta `respaldo-antes-de-limpieza-27oct`.
