# Sistema de reservas completo · 23-oct-2026

> **Actualización 26-oct-2026 (nivel menú digital):** el sistema se rehízo con reglas en el servidor (precio, depósito, disponibilidad con candado, límites de la política, estados por rol, versiones de la reserva), cliente con validación, "Mis reservas" y modificar/cancelar sobre la misma reserva, panel con jefe y recepción por PIN (aviso sonoro, catálogo en borrador → publicar, bloqueos, cobrar saldo), plantilla por negocio y herramienta formulario → agenda. Lo vigente: [plantilla-agenda.md](plantilla-agenda.md) y la skill `crear-sistemas-agendas`. Pruebas: 77 reglas del servidor (`reservas-reglas-e2e.mjs`), 17 por agenda (`agenda-cliente.js`), pantallas (`reservas-ui.js`, `reservas-panel.js`) y el motor local (`reservas-sistema.js`). Lo de abajo sigue valiendo como mapa de lo pedido y de la competencia; "Lo que falta para un cliente real" quedó parcialmente resuelto (base en la nube y panel con acceso por PIN: hecho; pagos, correos y WhatsApp reales: pendientes).

> **Actualización 24-oct-2026:** `ejemplos/reservas/` y su panel están conectados en la nube (PIN por rol, cupos que no se venden dos veces, el cliente ve solo lo suyo). Se quitaron los datos de prueba automáticos. Lo vigente está en [conexion-nube.md](conexion-nube.md); lo de abajo es el historial del 23-oct.

Encargo del usuario (23-oct): sistema de reservas completo y "todo automático" para hotel o cabañas, agencia de tours, centro médico, arriendo de espacios y salones. Demo en `web/propuesta/ejemplos/reservas/` (cliente) y `ejemplos/reservas/admin/` (panel). El módulo anterior (`_compartido/reservas.js`, nivel 1 por WhatsApp) sigue en los sitios de ejemplo y no se tocó.

## Archivos

- `motor.js`: el motor (disponibilidad, precios, retención, políticas, avisos, iCal, datos de prueba). Cuatro modos: **noches** (cabañas, hotel), **horas** (centro médico, salón), **cupos** (tours con salidas y cupos) y **bloques** (espacios por hora).
- `reservar.js` + `index.html`: lo que ve el cliente.
- `admin.js` + `admin/index.html`: el panel del negocio.
- `estilo.css`: estilos (claro y oscuro automáticos).
- Pruebas: ver la actualización de arriba (el motor local sigue en `pruebas/reservas-sistema.js`, 16/16).

## Qué cubre (lo pedido → dónde está)

| Pedido | Cómo quedó |
|---|---|
| Motor de reservas | 4 pasos: qué → cuándo → datos y pago → confirmación |
| Calendario dinámico | Mes con cada día en verde, ámbar ("quedan pocos") o rojo (completo); rango de noches; horas libres por profesional o sala; salidas con cupos |
| Inventario en tiempo real | Unidades por tipo de cabaña, cupos por salida, agenda por profesional o sala. Si otra persona reserva, el calendario se recalcula al instante y avisa |
| Reserva en pocos pasos y 100 % móvil | 4 pasos; probado a 390 px sin desborde y con áreas táctiles de 44 px |
| Varios idiomas y monedas | Español, inglés y portugués. Pesos con equivalencia en USD, EUR y BRL (tipo de cambio aproximado; se cobra en CLP) |
| Promociones | Descuentos automáticos (reserva anticipada, estadía larga, grupos, último minuto, arriendo largo) y códigos con mínimo y tope de usos. No se suman: se usa el mayor |
| Paquetes | Extras de estadía (escapada romántica, tinaja), tours con lo que incluyen, servicios con duración |
| Dashboard | Hoy, próximos 7 días, ocupación, ingresos, por cobrar, cancelaciones, alertas de retenciones y lista de espera |
| Gestión de calendarios | Vista de 14 días por unidad o recurso, con colores por estado y bloqueos; bloquear fechas a mano |
| Inventario y capacidad | Unidades, capacidad, cupos por salida, horarios de salida y mínimo de horas, editables en vivo |
| Notificaciones automáticas | Confirmación, recordatorio (24 h antes), pedir opinión después, cancelación y aviso de cupo liberado a la lista de espera; por correo y WhatsApp. En la demo quedan registradas, no salen |
| Políticas configurables | Depósito %, minutos para pagar antes de liberar el cupo, anticipación mínima, días hacia adelante, estadía mínima (y en temporada alta), tramos de devolución por cancelación |
| Reportes y analítica | Ocupación, ingresos, tarifa promedio por noche (ADR), ingreso por unidad disponible (RevPAR), cancelación, no llegaron, anticipación promedio, por canal, por servicio, por país, descuentos usados; CSV |
| Pasarela de pago | Paso de pago con retención y cuenta regresiva (simulado). Mercado Pago ya está integrado en el sitio de Bío Digital (apagado) |
| Channel manager, PMS, CRM, ERP | iCal para Airbnb y Booking (importar bloquea fechas; exportar sirve para Google Calendar): **funciona**. CRM y ERP: exportación CSV y webhook JSON de ejemplo. Channel manager y PMS: se describen y se cotizan aparte |
| Calendarios externos | Archivo .ics por reserva (con alarma), enlace a Google Calendar y calendario por recurso |
| Todo automático | Retenciones que vencen solas, avisos programados que se "envían" a su hora, reservas que se cierran solas al pasar, lista de espera que avisa al liberarse un cupo, reembolso calculado según la política |

## Competencia revisada (23-oct; cifras aproximadas, verificar)

| Producto | Rubro | Qué destacan | Precio |
|---|---|---|---|
| Cloudbeds | Hoteles | Todo en uno: PMS, motor de reservas y channel manager | Mensualidad (no publicada en el resultado) |
| Bókun, FareHarbor, Checkfront | Tours y actividades | Cupos por salida, recursos, venta en portales | Suscripción o comisión según el producto |
| SimplyBook.me | Servicios por hora | Versión gratis; desde ~US$11,70 al mes | Suscripción |
| Reservo (Chile) | Salud y belleza | Agenda, recordatorios por SMS, correo y WhatsApp, ficha clínica, facturación, telemedicina | Listado de terceros: 30 a 175 por usuario al mes (moneda no confirmada) |
| AgendaPro (Chile) | Belleza y salud | Recordatorios por WhatsApp (mensajes aparte), caja | Desde $15.900 + IVA al mes |
| ReservationKey | Alojamiento | Motor y calendario | Desde ~US$37 |

**Dónde ganamos:** un solo motor para los 5 rubros, dentro de la página del propio negocio, sin comisión por reserva, con sincronización iCal gratis y reportes incluidos. **Dónde perdemos:** no tenemos channel manager propio, ficha clínica, facturación electrónica ni app para el celular del dueño; para un hotel con muchos portales conviene un PMS dedicado.

Fuentes: [Capterra, alternativas a FareHarbor](https://www.capterra.es/alternatives/135106/fareharbor) · [Software Advice, FareHarbor frente a SimplyBook.me](https://www.softwareadvice.com.au/compare/32804/156049/fareharbor/vs/simplybookme) · [Zoftware, Reservo](https://zoftwarehub.com/en-bh/products/reservo/overview) · [Capterra Chile, motor de reservas](https://www.capterra.cl/software/39610/booking-engine) · [AgendaPro, planes](https://agendapro.com/planes)

## Lo que falta para un cliente real

1. ~~Varios equipos~~ **Hecho (24 y 26-oct):** los datos viven en la base (Supabase) y el panel pide PIN por rol. Para producción falta guardar los PIN con hash y, si se quiere, segundo factor.
2. Pagos reales (Mercado Pago u otra pasarela), envío real de correos y WhatsApp, lectura automática periódica de los iCal de los portales.
3. Traducir los nombres de servicios y alojamientos (hoy se traduce la interfaz, no el contenido del negocio).
4. Confirmar textos legales de cancelación y depósito con cada negocio.

## Costos: único frente a recurrente (aproximados, verificar)

| Pieza | Tipo | Costo aprox. |
|---|---|---|
| Configurar el motor, el calendario y el panel para el negocio | **Único** | Lo cotiza Bío Digital (el catálogo dice "reservas desde $24.990" para la versión simple; la completa **no cabe** en ese precio) |
| Base de datos en la nube | **Recurrente** | $0 en el plan gratis de Supabase (con límites); plan Pro ~US$25 al mes |
| Correos automáticos | Recurrente si crece | $0 con un proveedor con cuota gratis mensual; pago por sobre la cuota |
| WhatsApp automático | **Por mensaje** | Tarifa por conversación de Meta para Chile |
| Pasarela de pago | **Por venta** | Comisión por pago (Mercado Pago del orden de 3 % + IVA, según plazo) |
| Channel manager o PMS | **Recurrente** | Mensualidad del proveedor |
| iCal, CSV, webhook, reportes | $0 | Incluidos |
