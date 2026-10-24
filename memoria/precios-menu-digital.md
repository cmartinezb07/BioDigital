# Precios del menú digital con pedidos · propuesta del 24-oct-2026

Pregunta: ¿cuánto cobrar por el sistema de menú digital con pedidos (carta editable, pedidos, cocina, reparto, panel del dueño)? Esto es una **propuesta para decidir en equipo**; no se cambió ningún precio del catálogo del sitio (hoy el menú simple dice "desde $27.990").
Todas las cifras de terceros son **aproximadas y de la fecha indicada**: verificar en la fuente antes de cotizar. IVA: Fudo publica sin IVA; las cifras de Bío Digital abajo se entienden **netas** (definir si se cobra con IVA según cómo facture el equipo).

## 1. Qué cobran los comparables (lo que pudimos verificar)

| Referencia | Qué es | Precio | Fecha / nota |
|---|---|---|---|
| [Fudo Chile](https://fu.do/precios) | Sistema de restaurante (caja, carta QR, pedido desde la mesa) | Inicial **$25.500/mes**, Avanzado $34.500, Pro $52.500. Módulos: KDS $9.500, Delivery Apps $9.500, Gestión de mesas $4.500 | Publicado en CLP **sin IVA**; sin comisión por venta; -10 % semestral, -15 % anual. Es un POS completo: más que nuestra oferta, y sin seguimiento de repartidor propio |
| [MenuTiger](https://www.menutiger.com/es/pricing) | Menú QR con pedidos (internacional) | Gratis (75 pedidos/mes); **US$17/mes** (500 pedidos); US$46 (2.000 pedidos + KDS); US$119 (ilimitado, dominio propio) | En dólares, 0 % de comisión por pedido. A ~$950 por dólar (supuesto) serían ≈ $16.000, $44.000 y $113.000 |
| [Neolo Chile](https://www.neolo.com/chile/menu-qr/) | Menú QR (hosting) | Gratis hasta 200 visualizaciones; planes de **$4.088 a $9.084/mes** (la página mezcla mensual/anual) | Solo muestra la carta: no recibe pedidos |
| Gurmi (Chile) | Menú QR | Básico gratis; personalización **$4.990/mes** | Dato de **2020**, [El Mostrador](https://www.elmostrador.cl/generacion-m/2020/08/08/menus-online-la-solucion-para-atender-sin-contacto): puede haber cambiado |
| Apps de delivery (PedidosYa, Rappi, Uber Eats) | Marketplace con reparto | Comisión de **25 % a 30 %** de la venta según el gremio gastronómico | Dato de **2020**, [El Mostrador](https://www.elmostrador.cl/generacion-m/2020/06/17/gremio-gastronomico-denuncia-alza-de-comisiones-en-aplicaciones-de-delivery/); se negocia por contrato |
| [Justo](https://elceo.com/tecnologia/justo-la-startup-chilena-que-llega-competir-con-comisiones-mas-bajas-en-delivery/) | Tienda propia del restaurante | Comisión **7 % a 12 %** | 2020-2021; sin suscripción conocida |
| Desarrollo web a medida en Chile | Sitio web | **$250.000 a $1.000.000** de entrega única | [2x3.cl](https://www.2x3.cl/p/precios-desarrollo-web) (fuente comercial); un sitio con pedidos queda en la parte alta |
| Mercado Pago (cobro online) | Comisión por pago, **la paga el local** | Tarifa estándar **2,95 % + IVA** (crédito y débito) | Dato de **2021** ([Chócale](https://chocale.cl/2021/06/mercado-pago-firma-acuerdo-con-asech-habra-comisiones-preferenciales/)); hoy los procesadores rondan 1,1-1,8 % débito y ~2,5 % crédito + IVA. Verificar en mercadopago.cl |

Lo que **no** pudimos verificar: la tarifa vigente de Mercado Pago, las comisiones actuales de las apps (2026) y el precio claro de Neolo. No inventamos cifras para esos casos.

Lectura: el rango de mercado para "carta + pedidos" va de **$16.000 a $45.000 al mes** (MenuTiger Regular a Advanced, Fudo Inicial con KDS), y el desarrollo a medida parte en **$250.000**. Una app de delivery se lleva el 25-30 % de cada venta: ese es el argumento comercial más fuerte.

## 2. Costos propios (para no vender a pérdida)

| Costo | Tipo | Monto aproximado | Nota |
|---|---|---|---|
| Armado: cargar carta, fotos del local, comunas, PIN, capacitar al dueño | **Único** | 8-12 horas del equipo | La plantilla ya existe (`web/herramientas/nuevo-restaurante.mjs`); la mayor parte del tiempo son las fotos y la carta del cliente |
| Base de datos Supabase | **Recurrente, compartido** | Gratis hoy (se **pausa tras 1 semana sin uso**, 500 MB); plan Pro **US$25/mes** (≈ $24.000) sin pausa | [supabase.com/pricing](https://supabase.com/pricing). Un solo proyecto atiende a **varios restaurantes** (cada uno aislado por "negocio"), así que el Pro se reparte entre los clientes. **Antes del primer cliente que pague hay que pasar a Pro**: un local real no puede quedar pausado |
| Hosting (Cloudflare Pages) | Recurrente | $0 en el plan gratis | Verificar límites vigentes |
| Dominio .cl propio | Recurrente anual | Del orden de $10.000 al año | Verificar en nic.cl |
| Mapa y ruta del repartidor | Recurrente si crece | Gratis en demo (OpenStreetMap); en producción, un proveedor con cuota gratis | Ver [menu-pedidos.md](menu-pedidos.md) |
| Comisión de pago en línea | Por venta, **la paga el local** | ~2,5-3 % + IVA | No es ingreso ni costo de Bío Digital |
| Avisos por WhatsApp | Por mensaje | No incluido | Avisos por pantalla, sonido y notificación del navegador sí |

Con 3 clientes y plan Pro, la infraestructura cuesta ≈ $8.000 por cliente al mes; con 5, ≈ $4.800. Por eso la mensualidad tiene que cubrir eso **más** el soporte (cambios de carta, dudas, caídas).

## 3. Propuesta de tramos (CLP, netos, aproximados)

Siempre separados: **instalación (única)** y **mensualidad (recurrente)**.

| | **Carta QR** (ya existe) | **Pedidos Esencial** | **Pedidos Completo** | **Marca propia** |
|---|---|---|---|---|
| Para quién | Mostrar la carta | Local que quiere recibir pedidos para retirar o en mesa | Local con delivery propio | Local que quiere su dominio y atención preferente |
| Instalación (única) | desde $27.990 (hoy) | **$149.000** | **$249.000** | **$349.000** |
| Mensualidad (recurrente) | — | **$14.900** | **$24.900** | **$34.900** |
| Carta editable por el dueño (fotos, precios, opciones) | — | ✔ | ✔ | ✔ |
| Pedidos en mesa y para retirar, aceptar/rechazar, modificar mientras está nuevo | — | ✔ | ✔ | ✔ |
| Pantalla de cocina + panel del dueño | — | ✔ (1 cocina) | ✔ | ✔ |
| Delivery con repartidor propio, seguimiento en el mapa, asignación | — | — | ✔ (hasta 3 repartidores) | ✔ |
| Estadísticas, opiniones con respuesta | — | básicas | ✔ | ✔ |
| Pago en línea (Mercado Pago, comisión la paga el local) | — | — | ✔ | ✔ |
| Dominio .cl propio y diseño a medida | — | — | — | ✔ (+ 1 ajuste de diseño al mes) |
| Soporte | — | por correo/WhatsApp, 48 h | 24 h hábiles | 4 h hábiles |

Por qué estos números:
- **Esencial $14.900/mes** queda *bajo* MenuTiger Regular (≈ $16.000) y Fudo Inicial ($25.500, que incluye caja) y sobre un menú QR simple ($4.000-$9.000), porque aquí sí se reciben pedidos. 
- **Completo $24.900/mes** queda en el nivel de Fudo Inicial pero incluye el delivery con GPS del repartidor propio, que Fudo vende aparte (Delivery Apps $9.500 + KDS $9.500 = $44.500 con el plan Inicial).
- **Instalación $149.000-$349.000**: entre 1/6 y 1/2 del rango de desarrollo a medida ($250.000-$1.000.000), y se justifica porque llega funcionando con carta, fotos y capacitación, no como plantilla vacía.
- **Ejemplo de ahorro** (ilustrativo): un local que vende $2.000.000 al mes por apps de delivery pagando 25 % deja $500.000 en comisiones. Si pasa la mitad a su canal propio, con Completo gasta $24.900 + ~3 % de pago en línea ($30.000 por $1.000.000) y evita ≈ $250.000 de comisión: ahorra unos **$190.000 al mes**. La instalación de $249.000 se paga en poco más de un mes. (Supuestos del ejemplo: ventas, porcentaje de apps y traspaso de clientes; el local debe confirmarlos.)

## 4. Cuánto deja (para el semestre)

| Escenario | Ingreso único | Mensualidades | Costo infra (Pro compartido) | Comentario |
|---|---|---|---|---|
| 3 clientes Esencial/Completo (mezcla: 2 Esencial + 1 Completo) | 2×149.000 + 249.000 = **$547.000** | 2×14.900 + 24.900 = **$54.700/mes** | ≈ $24.000/mes | Margen mensual ≈ $30.000: cubre infra y poco más; el negocio está en la instalación |
| 5 clientes (3 Esencial + 2 Completo) | 3×149.000 + 2×249.000 = **$945.000** | 3×14.900 + 2×24.900 = **$94.500/mes** | ≈ $24.000/mes | Margen mensual ≈ $70.000 |

Con 3 clientes la mensualidad apenas sostiene el plan Pro; por eso no conviene regalar la instalación ni bajar de $14.900. Sigue valiendo la regla del proyecto: **no prometer delivery con GPS "sin mensualidad"**; depende de la base de datos y los mapas.

## 5. Riesgos y pendientes

- Las comisiones de apps (2020) y la tarifa de Mercado Pago (2021) son antiguas: confirmar antes de usarlas en una propuesta a un cliente.
- El tipo de cambio (~$950 por dólar) es un **supuesto**; actualizar.
- Falta definir con qué boleta/factura se cobra (IVA) y el contrato de mensualidad (permanencia, qué pasa si no paga: el sistema se pausa, la carta pública queda en modo lectura).
- Antes del primer cliente real: Supabase Pro, PIN privados (`demo: false`), pago en línea con credenciales reales de **su** cuenta de Mercado Pago, y publicación en producción (esperando los datos de pago de Benjamín).
- Decisión que necesita el equipo: ¿se aprueban los 3 tramos y se actualiza el catálogo del sitio? Hasta entonces, el sitio sigue sin cambios.
