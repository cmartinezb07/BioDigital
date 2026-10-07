# Menús interactivos

**Estado:** Falta una definición clave: cómo actualiza el cliente su propio menú.
**Decidido:** 2026-10-06 (ver [decisiones.md](../../memoria/decisiones.md))

## Qué es
Menú o catálogo digital con fotos, categorías y precios, que se abre desde un código QR en la mesa o en
el mostrador. Reemplaza al catálogo en PDF del catálogo anterior.

## Qué incluye (entregables)
- Menú web con fotos, categorías y precios.
- Código QR impreso para la mesa, el mostrador o la vitrina.
- Enlace para compartir por WhatsApp e Instagram.
- Capacitación para actualizarlo.

## Cómo se implementa
Página web ligera, de la misma familia que las páginas web del catálogo. Lo que falta decidir es el
mecanismo de actualización. Tres caminos, por evaluar:
1. **Planilla de Google que alimenta el menú:** el cliente cambia precios en una planilla y el menú se actualiza solo.
   Es lo que mejor calza con la promesa de transferencia.
2. **Panel de administración propio:** más prolijo, pero es desarrollo nuevo y hay que mantenerlo.
3. **Menú estático que actualizamos nosotros:** lo más rápido de construir y lo peor para el modelo, porque deja al
   cliente dependiendo del equipo justo después de haberle entregado el acta.

## Dificultad y tiempo
Baja a media, según el camino que se elija para la actualización.

## Costos
- Hosting: **$0** en Cloudflare Pages.
- Impresión del QR (placa o adhesivo): costo único, de imprenta.

## Precio
`[PENDIENTE: definir con el equipo]`.

## Riesgos
- Si el cliente no puede actualizar precios solo, el servicio se transforma en soporte permanente.
- Un menú con fotos malas vende menos que uno sin fotos: depende del registro fotográfico.

## Qué falta antes de venderlo
Elegir el mecanismo de actualización y construir una vez la plantilla del menú.
