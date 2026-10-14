# Pagos con Mercado Pago — estado y operación segura

La integración usa Checkout Pro mediante Orders API (`POST /v1/orders`) desde
Cloudflare Pages Functions. El navegador nunca envía precios: solo los SKU del
carrito. El servidor valida el catálogo, suma los importes y crea una única
orden con una línea por servicio.

## Flujo del sitio

1. El cliente agrega servicios al carrito.
2. Si todos tienen precio cerrado, el carrito ofrece Mercado Pago y mantiene
   la cotización por WhatsApp como alternativa.
3. Si alguno es “desde” o “a cotizar”, el carrito continúa exclusivamente al
   diagnóstico/cotización; no intenta cobrar un valor provisional.
4. `POST /api/orders` recibe `{ "items": ["sku"], "purpose": "full" }`,
   resuelve precios en el servidor y usa un UUID en `Idempotency-Key`.
5. El navegador conserva `id` y la capacidad privada de lectura en
   `sessionStorage`, y redirige en la misma ventana al `checkout_url` validado.
6. Las páginas `/pago/exitoso`, `/pago/pendiente` y `/pago/error` consultan al
   servidor. Nunca acreditan un pago usando parámetros de la URL.

Mientras `PAYMENTS_ENABLED=false`, el botón de Mercado Pago se muestra
deshabilitado para carritos de precio cerrado. Todos los SKU también permanecen
deshabilitados en `functions/_lib/catalog.js`.

## Persistencia y verificación

- D1 guarda la orden en `orders`, sus líneas en `order_items` y las
  notificaciones idempotentes en `payment_events`.
- El webhook `POST /api/webhooks/mercadopago` valida HMAC-SHA256, timestamp,
  request ID, aplicación, vendedor y ambiente.
- Después consulta `GET /v1/orders/{id}`. Solo presenta un pago como verificado
  cuando la respuesta oficial coincide en referencia, cuenta, aplicación,
  país, moneda y monto, y sus transacciones acreditan el total.
- `GET /api/orders/:id?reconcile=1` permite reconciliar una orden con la
  capacidad Bearer guardada en la sesión, con límite de un intento por minuto.

## Preview aislado

- Proyecto Pages: `biodigital-propuesta`.
- Rama Preview: `payments-test` (nunca `main`).
- URL estable: `https://payments-test.biodigital-propuesta.pages.dev`.
- D1 de prueba: `biodigital-payments-test`.
- Binding `DB`: solamente en `[[env.preview.d1_databases]]`.
- `CHECKOUT_SITE_URL`: solamente Preview, con la URL estable anterior.
- `PAYMENTS_ENABLED=false`: global y Preview.
- Migraciones: `0001_orders.sql` y `0002_order_items.sql`.

Production no tiene binding D1 ni credenciales de prueba y no debe modificarse
durante esta fase.

## Variables y secretos de Preview

Variables no secretas: `PAYMENTS_ENABLED`, `CHECKOUT_SITE_URL`,
`MP_APPLICATION_ID`, `MP_USER_ID`, `MP_COUNTRY_CODE`, `MP_LIVE_MODE` y, cuando
exista, `MP_TEST_PAYER_EMAIL`.

Secretos: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` y `ORDER_TOKEN_SECRET`. Nunca
se guardan en Git ni se copian a logs. `.dev.vars.example` contiene solo nombres
y marcadores.

La prueba real sigue bloqueada por el ticket Mercado Pago `WCS-54274`: la
aplicación `7545447256210205` necesita credenciales de prueba compatibles
`APP_USR-` para Orders API. No se debe copiar el token `TEST-`, usar credenciales
productivas, habilitar SKU ni cambiar `PAYMENTS_ENABLED` mientras soporte no lo
resuelva.

## Verificación local

- `npm.cmd test`: 29 pruebas, incluidos carrito múltiple, precio calculado por
  servidor, idempotencia, webhooks, retornos y estados.
- Las rutas de retorno se generan junto con `index.html`.
- El catálogo y los interruptores se comprueban explícitamente como apagados.

## Pendiente antes de cualquier cobro

- Recibir y verificar las credenciales de prueba `APP_USR-` de la aplicación.
- Configurar secretos únicamente en Preview.
- Probar aprobado, pendiente y rechazado con usuarios de prueba.
- Validar webhook, conciliación y persistencia D1 sin órdenes duplicadas.
- Volver a dejar todos los interruptores apagados tras cada ensayo.
- Crear una D1 distinta y obtener aprobación humana antes de preparar
  Production.
