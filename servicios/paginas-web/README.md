# Páginas web

**Estado:** Vendible. Es el servicio más maduro: hay 8 maquetas listas y una skill que las genera.
**Decidido:** 2026-10-06 (ver [decisiones.md](../../memoria/decisiones.md))

## Qué es
Sitio informativo para el negocio: una landing de una página o un sitio de 3 a 5 secciones, con los
servicios o productos, el contacto, la ubicación y las preguntas frecuentes. Queda a nombre del cliente.

## Qué incluye (entregables)
- Diseño elegido por el cliente entre varias maquetas reales, no entre descripciones.
- Página adaptada a celular, con modo claro y oscuro.
- Formulario de contacto y botón de WhatsApp.
- Textos redactados con el cliente.
- Capacitación para que pueda cambiar textos y fotos, más acta de entrega.

## Cómo se implementa
Fase de maquetas en HTML con la skill `crear-sitio-web` (ver `respaldo-skills/`), y sitio final en Astro
publicado en Cloudflare Pages, que permite uso comercial gratis. Los requisitos técnicos completos (SEO, seguridad,
checklist de entrega) están en `respaldo-skills/crear-sitio-web/referencias/requisitos.md`.

## Dificultad y tiempo
Baja a media. Una landing sale en horas; un sitio de 3 a 5 secciones toma de 1 a 3 días de trabajo.
La skill reduce mucho el tiempo: varias estéticas distintas se generan en una sesión.

## Costos
- Hosting en Cloudflare Pages: **$0**, uso comercial permitido.
- Dominio .cl: **ya no está en el catálogo**. Si el cliente lo quiere, hoy no hay un servicio que se lo venda.
  `[PENDIENTE: decidir]`

## Precio
`[PENDIENTE: definir con el equipo]`. Referencia anterior: la web estaba desde el plan Estándar ($250.000).

## Riesgos
- **Sin dominio propio, el sitio queda en una dirección terminada en `.pages.dev`.** Los propios
  requisitos que definió el equipo dicen que no se entrega un sitio con una URL de ese tipo. Hay que decidir si el
  cliente compra su dominio por su cuenta, si se lo gestionamos sin cobrarlo como servicio, o si vuelve al catálogo.
- El contenido del cliente (textos y fotos) es lo que más atrasa la entrega.
- Un sitio sin ficha de Google asociada rinde menos en búsquedas locales.

## Qué falta antes de venderlo
Nada técnico. Falta el precio y resolver lo del dominio.
