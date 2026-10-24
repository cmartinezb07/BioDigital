# Conexión en la nube de los sistemas (24-oct-2026)

Hasta el 23-oct las demos de pedidos, reservas y fidelización guardaban todo en el navegador de quien las abría: lo que se pedía en un celular no llegaba a la cocina de otro equipo. Desde el 24-oct los tres sistemas **comparten una base de datos en la nube** y funcionan entre equipos distintos. Siguen siendo un **local de ejemplo** (Fogón del Sur, Café Mirador, Cabañas Bosque Nativo…), pero el flujo es el real: es el que se aplica a un cliente.

## Cómo está armado

- **Base:** proyecto Supabase **`biodigital-demos`** (id `xoetybrsbuxcdoamcaeb`, São Paulo, plan gratis, $0). Aparte del panel interno (`biodigital-panel`) a propósito: las demos son públicas y no deben compartir proyecto con los datos reales de solicitudes del equipo.
- **Código:** `web/propuesta/ejemplos/_compartido/nube.js` (sondeo cada 2,5 a 3 s, pantalla de PIN, cola de envíos en orden). Lo usan `fogon-del-sur/pedidos.js`, `reservas/motor.js` y `fidelizacion/fidelizacion.js`.
- **Tablas** (esquema `demo`, **sin acceso directo** para el público): `items` (negocio, colección, id, datos, proyección pública), `roles` (negocio, rol, PIN, colecciones), `cols` (qué puede hacer el cliente en cada colección). Todo pasa por funciones `security definer`: `nube_leer`, `nube_escribir`, `nube_vaciar`, `nube_borrar`, `nube_rol`.
- La llave que va en el código es la **publicable** (pública por diseño). Lo que protege los datos son esas funciones.

## Quién ve qué

| Persona | Cómo entra | Qué ve y qué puede hacer |
|---|---|---|
| **Cliente** | Sin PIN. Su pedido, reserva o tarjeta se encuentra por un **código secreto** (16 caracteres) que solo tiene su equipo o su enlace | Solo lo suyo. En reservas ve además qué fechas están ocupadas, **sin nombre, contacto ni código**. Puede crear su pedido/reserva/tarjeta; en un pedido solo puede agregar su opinión y su pago (no cambiar el estado); no puede sumarse sellos |
| **Cocina** | PIN `247135` | Todos los pedidos; marca en preparación, listo, entregado (mesa y retiro), cobrado, ajusta el tiempo estimado, cancela. No ve visitas ni puede borrar |
| **Repartidor** | PIN `913572` | Pedidos de delivery listos; toma, comparte GPS, marca entregado |
| **Recepción** (reservas) | PIN `358241` | Reservas, avisos, configuración (precios, políticas, bloqueos). No puede vaciar |
| **Caja** (fidelización) | PIN `764193` | Todas las tarjetas; suma sellos y canjea premios |
| **Dueño** | PIN `482916` | Todo, en los tres sistemas; es el único que puede vaciar o borrar datos |

**Los PIN de arriba son de la demostración y se muestran en la pantalla de entrada** para poder enseñar el sistema a clientes. Por eso lo que se escribe en la demo es visible para quien tenga esos PIN: la pantalla lo avisa ("no escribas datos reales"). **En un local real cada persona tiene su PIN privado y no se muestra.** Para cambiar los PIN de la demo: tabla `demo.roles` (ver SQL en el historial de migraciones del proyecto) y la constante `CONFIG.pistas` de `pedidos.js` y los `pistas` de `admin.js` y `fidelizacion.js`.

## Flujo del restaurante (Fogón del Sur)

1. El cliente pide (mesa con `?mesa=N`, retiro o delivery). El pedido **llega a la cocina al instante**.
2. Si elige **pago en línea** pasa a `pagar/` (pago de **prueba**: no se cobra; Mercado Pago sigue apagado). Si elige **efectivo o pagar en caja/al recibir**, va **directo a su seguimiento**.
3. El seguimiento depende de cómo pidió: **mesa** → recibido, en preparación, "Listo: va a tu mesa", servido. **Retiro** → recibido, en preparación, "Listo para retirar", retirado. **Delivery** → agrega "En camino" con **mapa y GPS** del repartidor (el mapa solo existe en delivery).
4. **Nada avanza solo.** La cocina presiona cada paso. El tiempo estimado sale del plato que más demora (cada plato trae su tiempo en la carta; p. ej. lomo 25 min) más 2 min por cada otro plato, y la cocina lo puede ajustar al recibir el pedido o sumar 5 min.
5. El dueño ve ventas, pagos, visitas, opiniones y el historial en el panel.
6. Mientras espera, el cliente juega: **Zip, Queens, Tango y Sudoku mini**, con las mismas reglas que los juegos de lógica de LinkedIn y diseño propio (puzzles generados al azar y validados por las reglas). *Pendiente de confirmar con el usuario: pidió "Went", que no corresponde a un juego conocido de LinkedIn; se dejó Sudoku mini como cuarto.*

## Delivery con GPS: paso a paso

1. El repartidor abre `…/ejemplos/fogon-del-sur/repartidor/` **en su celular** (Chrome en Android o Safari en iPhone; la página va por HTTPS, requisito del GPS) y entra con su PIN.
2. Cuando la cocina marca "listo", el pedido aparece en "Listos para retirar en el local". El repartidor lo retira y toca **Tomar y salir**: el cliente ve "En camino".
3. Toca **Compartir mi ubicación (GPS)** y acepta el permiso del navegador. El celular envía su posición cada 4 s o más; el cliente ve la moto moverse en su mapa y el **tiempo estimado se recalcula** con la distancia que falta.
4. **Dejar la pantalla encendida y la pestaña abierta**: el navegador pausa el GPS de una pestaña dormida (la app pide mantener la pantalla encendida donde el navegador lo permite). Usa los datos móviles del repartidor.
5. Al llegar, toca **Marcar entregado** (y "Entregado y cobrado" si se pagaba al recibir).
6. **Sin moto a mano** (para enseñar la demo): "Probar sin moto: simular recorrido" recorre la ruta por calles a 8× de velocidad.
7. **Si el local quiere seguimiento aunque el celular se apague o cambie de app:** hace falta una app nativa con ubicación en segundo plano (desarrollo aparte) o un rastreador GPS en la moto (equipo más SIM con mensualidad). Son costos que se cotizan aparte; no entran en el precio único.

## Costos (aproximados; verificar en la fuente)

| Pieza | Tipo | Costo |
|---|---|---|
| Armar el sistema para un cliente (carta, pantallas, PIN, base propia) | **Único** | A cotizar |
| Base de datos (Supabase) | **Recurrente** | $0 en el plan gratis; **se pausa tras 1 semana sin uso** y tiene límites; plan Pro ~US$25 al mes. Un local que la usa todos los días no se pausa; un cliente real debería tener su propio proyecto |
| Mapa y ruta por calles | Recurrente si crece | OpenStreetMap y OSRM público sirven para demos; en producción, un proveedor con cuota gratis |
| GPS del repartidor | $0 | El celular del repartidor |
| Pago en línea | Por venta | Comisión de Mercado Pago (verificar); hoy apagado |
| Avisos por WhatsApp o correo | Por mensaje | No incluidos; los avisos de la demo quedan registrados, no salen |

## Límites conocidos (decir la verdad al vender)

- **Sondeo, no tiempo real puro:** los cambios tardan 2 a 3 segundos en verse. Alcanza para pedidos y reservas.
- **Sin avisos con el celular apagado** (Web Push o WhatsApp quedan como mejora cotizable).
- **Pago:** el cliente puede marcar su propio pago (pago de prueba). En un local real el pago lo confirma el webhook de Mercado Pago, no el cliente.
- **Anti-abuso:** no hay límite de pedidos por persona ni captcha. La demo tiene topes por colección (p. ej. 3.000 pedidos) y el dueño puede vaciarla.
- **PIN corto de demostración:** un cliente real usa PIN largos o, mejor, cuentas con correo y segundo factor (como el panel interno).
- **Retenciones de reservas:** vencen solas para la disponibilidad (la base ya no las cuenta); el estado "cancelada" se escribe cuando alguien abre el panel o la página.

## Pruebas

- `web/herramientas/pruebas/fogon-servicio.js` (caso base conectado, 17 comprobaciones) y `fogon-del-sur.js` (16): corren contra la base real y borran lo suyo.
- `web/herramientas/nube-e2e.mjs` (25 comprobaciones): permisos por PIN, privacidad, cupos atómicos (4 clientes a la vez por 2 unidades → entran 2), reglas contra trampas.
- Las pruebas del motor de reservas y de fidelización se corren en modo local (`desconectar()`), para no llenar la base.
- Todo entra en `node web/herramientas/check.mjs`.
- Capturas de la portada: `node web/herramientas/capturar-ejemplos.mjs <id>` siembra datos de ejemplo en la base (`semillas-captura.mjs`), captura y los borra.

## Operación

- Vaciar una demostración: botón "Borrar datos" del panel del dueño (pedidos y visitas) o "Borrar las reservas de prueba" en el panel de reservas.
- Borrar lo que dejó una prueba: `nube_borrar(negocio, colección, PIN del dueño, prefijo, filtro)`.
- Cambios de esquema: migraciones en el proyecto `biodigital-demos` (`nube_demos`, `cupo_por_noche_y_avisos`, `fidelizacion_reglas_cliente`, `nube_borrar_pruebas`, `pedidos_cliente_solo_opinion_y_pago`).
