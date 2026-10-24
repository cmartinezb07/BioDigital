# Pagos de BioDigital — estado comercial al 24 de octubre de 2026

La versión comercial se prepara con **enlaces de pago de monto fijo por producto**.
La opción de $100 se retiró del catálogo, de la configuración y del HTML.
Los servicios con precio “desde” y “a cotizar” conservan cotización previa,
según confirmó el usuario. El pack de lanzamiento ya aparece en el carrito.

## Qué falta para publicar los pagos

Faltan **9 enlaces comerciales**. La lista con nombres, importes y pasos está
en [PUBLICACION-COMERCIAL.md](PUBLICACION-COMERCIAL.md).
Se configuran en [enlaces-pago.mjs](web/propuesta/fuentes/enlaces-pago.mjs).
Los campos vacíos conservan el flujo de confirmar pedido por WhatsApp.
No se sustituyen por el enlace abierto ni por el enlace del ensayo de $100.

La consulta automática de Mercado Pago recibió 403 en los enlaces anteriores:
el equipo debe abrir los nuevos enlaces y comprobar nombre, receptor e importe.
Un enlace configurado no garantiza que Mercado Pago apruebe todas las tarjetas.

## Qué hace el carrito

- Un producto de precio cerrado con enlace e importe coincidentes: abre su enlace.
- Un producto cuyo enlace falta: permite confirmar el pedido y solicitar su cobro.
- Varios productos: se confirma el total y se genera un enlace por pedido.
- Servicios “desde” o “a cotizar”: se confirma alcance y precio antes de cobrar.
- Un enlace de un producto nunca se usa para cobrar otro o el total de un carrito.
- Los enlaces manuales se verifican en el portal del receptor; no crean órdenes
  D1 ni actualizan automáticamente el sitio o el panel interno.

El equipo debe confirmar estado aprobado, importe y correspondencia con el
cliente/pedido antes de comenzar el trabajo. Pendiente/en revisión no es aprobado.
Los cupos y descuentos de lanzamiento se controlan manualmente.

## Estado del código y despliegue

Rama de preparación: `feat/pagos-comerciales-por-enlace`, sincronizada con
`origin/main` 9b43f8f, conservando los ejemplos, reservas y páginas nuevas.

Preview actualizado: https://payments-test.biodigital-propuesta.pages.dev.
Despliegue: https://cd511377.biodigital-propuesta.pages.dev.
Production y la rama `main` no se publicaron con estos cambios.
La entrega se guarda en un commit local de la rama de preparación; faltan
los enlaces antes de completar la revisión, hacer push y abrir el PR.

## Integración API separada, deshabilitada

El código del checkout automático usa Preferences API (`/checkout/preferences`),
`init_point`, webhook `payment` y conciliación por orden comercial y sus pagos.
Tiene control de importe, identidad, cuenta, firma, reintentos y concurrencia.
`PAYMENTS_ENABLED=false` y los 14 SKU API siguen deshabilitados.

D1 `biodigital-payments-test` es exclusiva de Preview; migraciones 0001, 0002 y
0003 aplicadas. No se deben copiar credenciales o esa base a Production para
publicar enlaces manuales. La integración API todavía necesita configuración y
pruebas propias. El rechazo del enlace manual no diagnostica el código API.

## Pruebas y condiciones de lanzamiento

37 casos locales pasan. El verificador comprueba correspondencia entre
catálogo y enlaces, importe, dominio, duplicados y ausencia del ensayo de $100:

```powershell
node web/propuesta/fuentes/generar.mjs --publico 8
node --test test/payments.test.js test/webhooks.test.js
node scripts/verificar-enlaces-pago.mjs --exigir-completos
```

La última orden falla mientras falten enlaces; actualmente faltan nueve.
No se considera listo para pagos comerciales hasta configurarlos, revisar sus
destinos y comprobar un cobro aprobado. El ensayo previo de $100 (operación
185920933158) terminó rechazado por seguridad; no fue una validación exitosa.

Procedimiento de revisión, PR y despliegue:
[PUBLICACION-COMERCIAL.md](PUBLICACION-COMERCIAL.md).
