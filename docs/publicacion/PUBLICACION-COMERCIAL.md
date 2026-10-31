# Publicación comercial con enlaces de Mercado Pago

**Sitio vigente:** https://biodigital-bgw.pages.dev (proyecto `biodigital`).
La dirección anterior redirige a la nueva. Para publicar, seguir
[MIGRACION-SITIO.md](MIGRACION-SITIO.md); las referencias al despliegue anterior
al final de este documento son históricas.

Estado: preparación en la rama `feat/pagos-comerciales-por-enlace`, basada en
`origin/main` 9b43f8f. Se retiró el producto de $100 y se conservan los cambios
recientes de ejemplos, reservas y páginas de información.
Los nueve enlaces comerciales están configurados según lo enviado por el usuario.
Falta revisar nombre, receptor e importe en sus destinos y comprobar un cobro aprobado.
El usuario confirmó que `12kjBMo` corresponde a la tarjeta de lanzamiento de $7.990.

## Lo que debes hacer en Mercado Pago

Entra con la cuenta que recibirá los cobros en
[Link de pago](https://www.mercadopago.cl/herramientas-para-vender/link-de-pago)
y pulsa **Crear Link de pago**. Crea un enlace diferente por cada fila:

| Producto | Monto fijo CLP | SKU para configurarlo |
|---|---:|---|
| Registro fotográfico | $4.990 | `photography` |
| Tarjeta de fidelización | $9.990 | `loyalty-card` |
| Pack completo | $79.990 | `full-pack` |
| Pack completo de lanzamiento | $69.990 | `launch-pack` |
| 2 videos para redes | $17.990 | `social-video-2` |
| 3 videos para redes | $24.990 | `social-video-3` |
| Tarjeta de fidelización de lanzamiento | $7.990 | `launch-loyalty-card` |
| Menú digital + fotos | $29.990 | `menu-photography` |
| Reservas + fidelización | $29.990 | `reservations-loyalty` |

Usa el nombre del producto y su precio exacto. El cobro es único, no una
suscripción. Revisa la cuenta receptora, comisión, plazo de disponibilidad
y opciones de cuotas antes de generar cada enlace. No prometer cuotas sin
interés que el equipo no haya decidido financiar.

Comprueba que el enlace abre con el nombre y monto ya fijados y no pide al
comprador ingresar la cantidad. Envía las URLs como `producto — URL` para
incorporarlas, o completa los campos `url` en:
`web/propuesta/fuentes/enlaces-pago.mjs`.
Estos enlaces son públicos; no hacen falta contraseñas ni Access Tokens.
No reutilizar el enlace abierto `link.mercadopago.cl/biodigital`, el del ensayo
de $100, ni el enlace de un producto para cobrar otro.

Los enlaces deben seguir funcionando para compras de distintos clientes;
comprueba su vigencia y condición de reutilización en Mercado Pago. Los precios
de lanzamiento tienen cupos anunciados: el equipo debe controlar los cupos y
desactivar la promoción/enlace cuando se agoten; hoy no hay inventario automático.

## Qué conserva cotización previa

Página web (desde $49.990), video para redes (desde $9.990), menú digital
(desde $27.990), reservas (desde $27.990) y menú digital interactivo (a cotizar).
El usuario confirmó mantener este criterio.

El cliente puede armar el carrito completo. Si contiene varios productos o
requiere cotización, se confirma el pedido por WhatsApp y el equipo genera
un enlace por el total y alcance acordados. Los enlaces individuales no suman
el carrito. El descuento de 10% por lanzamiento se valida y aplica en esa
cotización; no se descuenta automáticamente de enlaces de productos.

## Cómo se confirma el cobro

El cliente paga en Mercado Pago con su medio de pago real. El equipo consulta
la operación en la cuenta receptora y comprueba estado aprobado, importe y
cliente/pedido. Solo entonces confirma el inicio del servicio por el canal
acordado. Si está pendiente o en revisión, no pedir otro pago hasta verificarlo.

Este flujo no crea una orden en D1, no confirma automáticamente en el sitio ni
en el panel y no garantiza un retorno al sitio desde el enlace. Que una venta
aparezca “En proceso” no significa que esté acreditada.
El ensayo de $100 terminó rechazado por seguridad; no certifica que el cobro
comercial ya esté validado. Falta verificar un cobro aprobado y el procedimiento
del equipo antes del lanzamiento. No se hará un cargo ni un reembolso automático
desde las herramientas.

## Preparar y revisar la entrega

Desde la rama de preparación:

```powershell
node web/propuesta/fuentes/generar.mjs --publico 8
node --test test/payments.test.js test/webhooks.test.js
node scripts/verificar-enlaces-pago.mjs --exigir-completos
git diff --check
```

El último verificador falla mientras falte cualquiera de los nueve enlaces.
Comprueba catálogo/precios, enlaces repetidos y formatos, y ausencia del producto
de ensayo. La comprobación local no puede garantizar el importe que muestra
Mercado Pago: también hay que abrir y revisar los nueve enlaces.

Revisar en Preview, en celular y escritorio: cada producto, precio, enlace,
carrito combinado, servicios a cotizar, promociones y formularios. Verificar
también términos, privacidad y datos de contacto ya existentes.
`PAYMENTS_ENABLED=false` debe mantenerse: controla la integración API,
no los enlaces manuales. No hacen falta credenciales de Mercado Pago ni D1
de producción para cobrar mediante enlaces. No trasladar la D1 de prueba a
Production ni habilitar los endpoints API como parte de este lanzamiento.

## Llevar a main y publicar

1. Completar enlaces y resolver cualquier fallo de las comprobaciones.
2. Revisar `git status` y el diff; guardar los enlaces y ajustes pendientes en
   un nuevo commit en `feat/pagos-comerciales-por-enlace`. La preparación inicial
   queda guardada localmente. No incluir secretos ni datos de tarjetas.
3. Subir esa rama a GitHub y abrir un PR hacia `main`. Revisar con el equipo
   los enlaces, los precios, el flujo manual y el cobro aprobado antes de fusionar.
4. Regenerar la versión pública y publicar únicamente cuando se apruebe la entrega.
   Para un despliegue directo de Pages, desde el commit aprobado de `main`:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID='1f79804ece4d02d62f0df05f07c23ad2'
npx.cmd wrangler pages deploy web/propuesta --project-name=biodigital --branch=main
```

Subir código a GitHub y publicar con Wrangler son pasos distintos en el flujo
de despliegue directo usado en esta sesión. Si se configura integración Git
automática en Cloudflare, confirmar antes qué rama dispara Production.
Después, verificar el sitio público y los destinos de pago. Conservar el
despliegue previo para volver a él si falla la publicación.

El 24-oct-2026 el usuario solicitó fusionar y publicar. Se actualizó `main` en
GitHub a `0214579` y se desplegó Production `d0965b96` en
https://biodigital-propuesta.pages.dev. Se verificaron 6 rutas HTTP 200,
14 productos y 9 enlaces. No se ejecutó un nuevo cobro: sigue pendiente la
comprobación operativa de un pago aprobado y de los importes externos.
