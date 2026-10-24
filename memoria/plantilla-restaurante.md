# Plantilla de restaurante reutilizable · 24-oct-2026

El menú digital con pedidos de Fogón del Sur es la **plantilla** para cualquier restaurante. La idea: el **código** (estructura y diseño) es el mismo para todos y los **datos** (carta, fotos, precios, comunas, horarios, personal, pedidos) viven en la base bajo un "negocio" propio de cada local.

## Qué es estructura y qué es dato

| Estructura (no la toca el dueño) | Dato (lo administra el dueño desde su panel) |
|---|---|
| HTML y CSS de la carta, carrito, seguimiento, cocina, reparto y panel | Nombre, lema, color principal y logo |
| Reglas de pedidos en el servidor (estados, permisos, un pedido "Nuevo" por cliente, modificar el mismo pedido) | Categorías y platos: nombre, descripción, precio, foto propia, tiempo, etiquetas, favorito |
| Flujo mesa / retiro / delivery, mapa, juegos de espera | Disponible hoy / visible, opciones (tamaños, extras, obligatorias o no) |
| `restaurante.config.js` (negocio, nombre, demo sí/no) | Mesas, pedido mínimo, comunas y costo de envío, dirección y horarios |
| | Personal (cocina, reparto) con su PIN; pedidos, visitas y opiniones |

La carta de ejemplo trae **24 platos con fotos con licencia** (Wikimedia Commons / Openverse; CC0, dominio público o CC BY, con autor y enlace en `fotos/CREDITOS.md`). Son de ejemplo: **para un cliente real se reemplazan por fotos del local** (el dueño las sube desde Panel › Carta).

## Aislamiento entre restaurantes

- Cada restaurante es un `negocio` distinto en la base (`demo.items.negocio`); los PIN (`demo.roles`) y los permisos (`demo.cols`) son por negocio. Las funciones y reglas del servidor **no mencionan ningún negocio en particular** (revisado el 24-oct: ninguna función `pedido_*`, `nube_*` ni `transicion_ok` contiene `'fogon'`).
- Un PIN de un local no abre otro: `nube_rol`/`nube_quien` buscan por (negocio, PIN). Prueba: `web/herramientas/pedidos-reglas-e2e.mjs` incluye el chequeo de aislamiento.
- La carta de un local no se mezcla con la de otro: la carta, las fotos y los pedidos están en columnas del mismo negocio.
- En el navegador, el carrito y los pedidos guardados llevan el negocio en su clave.

## Crear un restaurante nuevo (paso a paso)

1. `node web/herramientas/nuevo-restaurante.mjs --id mirador --nombre "El Mirador"` (agregar `--demo` solo para demostraciones: muestra los PIN en pantalla).
   - Copia la carpeta de la plantilla a `web/propuesta/ejemplos/mirador/`, cambia el nombre en todas las páginas y escribe `restaurante.config.js` con PIN al azar.
   - Escribe `web/herramientas/restaurantes/mirador-instalar.sql` con los accesos (dueño, cocina, repartidor). Esa carpeta **no se sube a git** (tiene los PIN).
2. Ejecutar ese SQL en Supabase (proyecto `biodigital-demos`).
3. Entrar a `.../mirador/panel/` (acceso único del equipo: según el código, cada persona va a la cocina, al reparto o a la administración) con el PIN del dueño y: cargar la carta (o partir de la de ejemplo), subir fotos, definir comunas, horarios y mesas, crear los PIN de cocina y reparto, **publicar**.
4. Cambiar los PIN provisorios y entregárselos al dueño por un canal privado.
5. Generar el sitio (`node web/propuesta/fuentes/generar.mjs --publico 8`) y publicar. Para un cliente real se publica en **su** carpeta/dominio, no en la galería de ejemplos.

Para un local real: `demo: false` (no mostrar PIN), Supabase **Pro** (el plan gratis se pausa), credenciales de pago del propio local y probar un pedido completo antes de abrir.

## Qué falta para producción real (no está hecho)

- Notificaciones con el navegador cerrado (Web Push o WhatsApp) y boleta electrónica (SII).
- Pago en línea con cuenta real (Mercado Pago está integrado pero apagado).
- Roles de dueño adicionales y cambio del PIN de dueño desde el panel.
- Realtime por socket (hoy es sondeo cada 3-6 s: suficiente para un local, no para cientos de pedidos simultáneos).
- Sacar el PIN de la base en texto plano (es una demostración; para producción, guardar hash).
