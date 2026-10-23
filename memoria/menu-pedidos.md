# Menú digital con pedidos (restaurante) · 23-oct-2026

Encargo del usuario (23-oct): menú digital completo, "centrados full en el restaurante", al nivel de los mejores del mercado. Demo en `web/propuesta/ejemplos/fogon-del-sur/` (vista previa: `/ejemplos/fogon-del-sur/`).

## Qué hace (todo probado en el navegador)

| Lado | Pantalla | Funciones |
|---|---|---|
| Cliente | Carta (`index.html` + `pedir.js`) | Pedir **en la mesa** (QR con `?mesa=N`), **para retirar** o con **delivery**; agregar platos y cantidades, carrito lateral, envío por comuna del Gran Concepción, pedido mínimo de delivery, ubicación exacta opcional (GPS del cliente), nota para la cocina, pago en línea o en caja, "¿cómo nos conociste?". Se mantienen 3D, realidad aumentada, favoritos y buscador. |
| Cliente | Seguimiento (`pedido/` + `seguimiento.js`) | Estado con **color y animación** (Recibido azul con pulso, En preparación ámbar con llama, Listo verde, En camino violeta con moto, Entregado dorado), **tiempo estimado** en minutos y hora, barra de avance y pasos con hora, **mapa con el repartidor en vivo** (Leaflet + OpenStreetMap, ruta por calles), aviso en pantalla, sonido, vibración y notificación del sistema al cambiar de estado, **juego mientras espera** (`juego.js`: atrapar ingredientes, récord guardado) y **opinión** al final (estrellas, ¿recomendarías?, comentario) con **enlace para invitar a un amigo** (`?ref=`). |
| Cocina | `cocina/` + `cocina.js` | Pantalla tipo KDS con 4 columnas (Nuevos, En preparación, Listos, En reparto); el pedido llega solo, sonido opcional, reloj por pedido que cambia a amarillo a los 10 min y a rojo a los 20, tiempo de preparación ajustable, marcar pagado, cancelar. Cada cambio le llega al cliente al instante. |
| Reparto | `repartidor/` + `repartidor.js` | Pedidos listos para salir, "Tomar y salir", **compartir el GPS del celular** (watchPosition) o simular el recorrido, abrir la ruta en Google Maps, marcar entregado. |
| Dueño | `panel/` + `panel.js` | Visitas a la carta y su origen (QR de mesa, invitación, directo), pedidos, conversión, **pagados**, **ventas**, ticket promedio, tiempo promedio de cocina, nota promedio y % que recomendaría, pedidos que llegaron por invitación, ventas por día, pedidos por hora, platos más pedidos, canal (mesa, retiro, delivery), cómo nos conocieron, opiniones recientes, últimos pedidos, CSV a prueba de fórmulas. Botón para cargar 7 días de prueba (sin comentarios inventados: solo estrellas). |

Capa de datos común: `pedidos.js` (estados, tiempos, ruta, simulación, visitas, datos de prueba).

**Cómo funciona la demo:** los datos viven en el navegador y se sincronizan entre pestañas (BroadcastChannel). Abre la carta, la cocina, el repartidor y el panel en pestañas distintas del mismo navegador. Si nadie atiende la cocina o el reparto, el pedido avanza solo y acelerado (cada minuto dura 3 s) para que se vea completo. Prueba automática: `web/herramientas/pruebas/fogon-del-sur.js` (11/11).

**Arreglos de Fogón del Sur (tarea 1):** el scroll "no bajaba bien" porque la barra de categorías llamaba a `scrollIntoView` en cada cambio de sección, y eso movía también la página y le peleaba el scroll al dedo. Ahora se mueve solo la barra (`scrollLeft`). Se quitó `background-attachment: fixed` (repinta en cada scroll en celulares). El error de consola `navigator.vibrate` bloqueado (al abrir la página dentro del visor del carrusel) se evita vibrando solo con un toque real. Mismo arreglo en `web/menu/` (plantilla del menú).

## Lo que falta para un local real (no está en la demo)

1. **Varios equipos a la vez:** cliente, cocina y repartidor en equipos distintos necesitan una base en la nube con tiempo real. Opción: Supabase (ya en uso). Se deja para el primer cliente real, porque la demo no lo necesita.
2. Pago en línea real (Mercado Pago, ya integrado en el sitio pero apagado).
3. Notificaciones con el navegador cerrado (Web Push con service worker) o por WhatsApp.
4. Boleta electrónica (SII): no incluida; la emite el local con su sistema actual.

## Costos: único frente a recurrente (aproximados, verificar en la fuente)

| Pieza | Tipo | Costo aprox. | Nota |
|---|---|---|---|
| Armar la carta, el QR y las pantallas | **Único** | Lo cotiza Bío Digital | Hoy el menú simple está "desde $27.990"; el sistema con pedidos **no cabe** en ese precio |
| Base de datos en tiempo real (Supabase) | **Recurrente** | $0 en el plan gratis (con límites; se pausa tras 1 semana sin uso); plan Pro ~US$25 al mes | Un local activo no se pausa, pero hay que vigilar los límites |
| Mapa (teselas) | Recurrente si crece | OpenStreetMap sirve para la demo; en producción, un proveedor con plan gratis (p. ej. ~100.000 teselas al mes) y pago por sobre eso | La política de OSM no permite uso comercial intenso |
| Ruta por calles | Recurrente si crece | El servidor público de OSRM es solo para demos; en producción, un servicio con cuota gratis diaria o mensual | Verificar cuotas vigentes |
| GPS del repartidor | $0 | El celular del repartidor | Usa sus datos móviles |
| Pago en línea (Mercado Pago) | **Por venta** | Comisión por cada pago (del orden de 3 % + IVA, según plazo de liberación) | Verificar en mercadopago.cl |
| Avisos por WhatsApp | **Por mensaje** | Cobro por conversación de la API de WhatsApp Business | No incluido; los avisos de la demo son gratis (pantalla, sonido, notificación del navegador) |
| Juego, panel, cocina | $0 | Archivos estáticos | — |

**Recomendación de precio (decide el equipo):** vender el sistema con pedidos como **instalación única a cotizar** más un **costo de operación mensual transparente** solo si el local supera los planes gratis (base de datos, mapas). Nunca prometer el delivery con GPS "sin mensualidad" sin decir que depende de esos límites.

## Competencia revisada (23-oct)

- **Fudo** (Argentina, usado en Chile): carta QR, integración con PedidosYa, Uber Eats y Rappi, KDS, mapa de mesas y pedido desde la mesa (según un comparador con interés comercial; verificar con Fudo). Suscripción mensual.
- **Qamarero, Menu Tiger:** KDS que recibe pedidos de QR, delivery y caja, con estados y tiempos reales de preparación.
- **Owner.com:** seguimiento del repartidor solo cuando el reparto lo hace Uber Eats o DoorDash; con repartidores propios no hay seguimiento. Nosotros sí lo damos con el celular del repartidor propio.
- **Patrones de buen seguimiento:** mapa con repartidor, destino y ruta; tiempo estimado que se recalcula; pasos claros; ocultar el mapa al entregar; explicar cuando no hay seguimiento.
- **Lo que nadie revisado tiene:** el plato en 3D y realidad aumentada, y el juego mientras espera.

Fuentes: [Meniu sobre Fudo](https://meniuapp.com/en/blog/alternativa-gratuita-fudo-software-restaurantes) · [Qamarero KDS](https://qamarero.com/kds) · [Menu Tiger KDS](https://www.menutiger.com/es/features/kitchen-display-system) · [Owner.com, seguimiento](https://help.owner.com/en/articles/15485357-how-do-i-track-a-third-party-delivery-on-the-owner-app) · [Walmart GoLocal, seguimiento](https://developer.walmart.com/transportation-carriers/docs/live-order-tracking) · [Restaurant Technology News](https://restauranttechnologynews.com/2026/08/why-restaurant-qr-menus-have-an-execution-problem-not-a-concept-problem/)
