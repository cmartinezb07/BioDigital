# Tarjetas de fidelización

**Estado:** Por validar. El equipo decidió ofrecer **las dos variantes**: QR con sellos y tarjeta en Google y Apple Wallet.
**Decidido:** 2026-10-06 (ver [decisiones.md](../../memoria/decisiones.md))

## Qué es
Programa de fidelidad para que el cliente final vuelva: junta sellos o puntos y recibe un premio.
Reemplaza a la tarjeta de cartón con timbres.

## Qué incluye (entregables)
**Variante A — QR con sellos, construida por nosotros**
- Tarjeta web que el cliente final guarda en su teléfono.
- QR del local para sumar un sello.
- Panel simple para que el negocio vea cuántos sellos lleva cada persona. `[PENDIENTE: definir]`

**Variante B — tarjeta en Google Wallet y Apple Wallet**
- Tarjeta que se guarda en la billetera del teléfono, con el logo del negocio.
- Notificaciones al cliente final cuando se acerca al local o cuando le falta un sello.
- Se arma sobre una plataforma de terceros (Loopy Loyalty, Boomerangme u otra).

## Cómo se implementa
La variante A es desarrollo propio: se construye una vez y se reutiliza en cada cliente.
La variante B es configuración sobre una plataforma de pago.

## Dificultad y tiempo
Variante A: media. Es el único servicio del catálogo que exige construir algo nuevo desde cero
(guardar los sellos de cada persona, evitar que alguien escanee el mismo QR diez veces).
Variante B: baja. Se configura en una tarde.

## Costos
- Variante A: **$0** de terceros una vez construida.
- Variante B: **recurrente**, del orden de 25 a 50 dólares al mes `[aprox., verificar en la plataforma elegida]`.

## Precio
`[PENDIENTE: definir con el equipo]`, y debe ser distinto para cada variante.

## Riesgos
- **La variante B deja una cuenta mensual abierta después de transferir.** Hay que decidir si el cliente
  contrata la plataforma a su nombre, o si el equipo cobra una mantención mensual, que choca con la promesa de que el
  cliente no depende de nosotros.
- Un programa de fidelidad sin reglas claras (cuántos sellos, qué premio, hasta cuándo) genera reclamos al negocio.
- Si el local no recuerda pedir el escaneo, el programa muere en dos semanas. La capacitación es parte del servicio.

## Qué falta antes de venderlo
1. Construir y probar la variante A con un negocio conocido.
2. Elegir la plataforma de la variante B y verificar su precio real.
3. Definir quién paga la mensualidad después de la transferencia.
4. Definir las reglas tipo: cuántos sellos, qué premio y qué vigencia.
