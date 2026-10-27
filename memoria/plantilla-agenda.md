# Plantilla de agenda (sistema de reservas) reutilizable · 26-oct-2026

El sistema de reservas de `web/propuesta/ejemplos/reservas/` es la **plantilla** para cualquier negocio que reciba reservas (alojamiento, tours, citas, arriendo de espacios). Misma idea que la del restaurante ([plantilla-restaurante.md](plantilla-restaurante.md)): el **código** es igual para todos y los **datos** (catálogo, precios, horarios, políticas, personal, reservas) viven en la base bajo un "negocio" propio de cada cliente. Skill: `crear-sistemas-agendas`.

## Qué es estructura y qué es dato

| Estructura (no la toca el dueño) | Dato (lo administra el jefe desde su panel) |
|---|---|
| HTML y CSS del asistente de reserva, "Mis reservas", gestión, panel | Nombre, rubro, dirección, color, iniciales, cómo se paga el depósito |
| Reglas del servidor: precio, depósito, disponibilidad, límites de la política, estados por rol, devolución, versiones de la reserva | Catálogo: alojamientos, tours, servicios, profesionales, espacios (precio, capacidad, duración, mínimos, descripción) |
| Los 4 modos del motor (noches, cupos, horas, bloques) | Horario por día, intervalo, margen, temporadas y recargo de fin de semana |
| `agenda.config.js` (negocio, `demo` sí/no, agendas de partida) | Depósito, retención, anticipación, horizonte, plazo para modificar, devolución por tramos |
| | Descuentos automáticos y códigos; avisos que se programan; recepción con su PIN; reservas, bloqueos, lista de espera |

## Aislamiento entre negocios

- Cada negocio es un `negocio` distinto en `demo.items`; PIN (`demo.roles`) y permisos (`demo.cols`) son por negocio. Ninguna función del servidor nombra un negocio en particular (la demo `reservas` es un negocio más). Un PIN de un negocio no abre otro. El negocio `zz-agenda` es solo para pruebas.
- Los códigos de descuento de cada agenda se guardan en una fila con identificador largo al azar (`promos`): solo el equipo la lee; un cliente no puede adivinarla.
- En el navegador, el caché y las reservas del cliente llevan el negocio y la agenda en la clave.

## Crear un negocio nuevo (paso a paso)

**Atajo (recomendado):** `node web/herramientas/aplicar-formulario-agenda.mjs respuestas.json --id cabanas-sol [--url https://…]` hace todo menos ejecutar el SQL, publicar la agenda y probar. Flujo completo en la skill `crear-sistemas-agendas`.

1. Formulario → `aplicar-formulario-agenda.mjs`: carpeta `web/propuesta/ejemplos/<id>/` (sin nada de demostración y con su propio `nube.js`), `web/herramientas/agendas/<id>-agendas.json`, `<id>-instalar.sql`, `<id>-prueba.js` y `<id>-pendientes.md` (la carpeta `agendas/` no se sube a git: tiene los PIN).
2. Ejecutar el SQL de accesos en Supabase (`biodigital-demos`).
3. `node web/herramientas/cargar-agendas.mjs --negocio <id> --pin <PIN del jefe> --archivo web/herramientas/agendas/<id>-agendas.json`.
4. Probar con `revisar.mjs … --probar web/herramientas/agendas/<id>-prueba.js` (17 comprobaciones) y a ojo, con reservas reales de punta a punta.
5. El jefe entra a `…/<id>/admin/`, ajusta y **publica**. Cambiar los PIN provisorios y entregarlos por un canal privado.
6. Publicar la carpeta en el Cloudflare del cliente (no en la galería de ejemplos).

Para un negocio real: `demo: false` (sin PIN en pantalla ni pago de mentira ni botón del panel para el público), Supabase **Pro**, instrucciones de pago del depósito escritas por el negocio y una reserva completa de prueba antes de abrir.

## Costos (aproximados, verificar; único frente a recurrente)

| Pieza | Tipo | Costo aprox. |
|---|---|---|
| Armado: cargar agenda, revisar con el cliente, capacitar | **Único** | 5-8 horas del equipo (la herramienta deja listo catálogo, políticas y accesos; el tiempo va en confirmar los pendientes con el cliente) |
| Base de datos Supabase | **Recurrente, compartido** | Plan gratis se pausa tras 1 semana sin uso; Pro ≈ US$25/mes (≈ $23.750 a $950), un solo proyecto para varios negocios: con 3 clientes ≈ $7.900 por cliente al mes, con 5 ≈ $4.750 |
| Hosting Cloudflare Pages | Recurrente | $0 en el plan gratis (verificar límites) |
| Dominio .cl | Recurrente anual | ≈ $10.000 al año (verificar en nic.cl) |
| Correos automáticos | Recurrente si crece | $0 con proveedor con cuota gratis |
| WhatsApp automático | **Por mensaje** | Tarifa de Meta; no incluido |
| Pasarela de pago | **Por venta, la paga el negocio** | Comisión del proveedor (verificar) |
| Channel manager, PMS | Mensualidad del proveedor | Aparte |

Precio propuesto en [precios-catalogo.md](precios-catalogo.md): **Reservas completo $119.990 + $12.900/mes** (propuesta sin aprobar). Con la mensualidad de $12.900 y la base compartida (≈ $4.750 a $7.900 por cliente) quedan ≈ $5.000 a $8.000 al mes por cliente para soporte: ajustado; no regalar la instalación.

## Qué falta para producción real (no está hecho)

- Correos y WhatsApp reales (hoy los avisos quedan "enviados (simulado)"); pasarela de pago (el depósito lo registra el negocio a mano); lectura automática de calendarios iCal.
- Hash de los PIN (hoy en texto plano, es una demostración); cambio del PIN del jefe desde el panel; más de un jefe.
- Logo propio (hoy iniciales sobre el color), traducción del contenido del catálogo, textos legales confirmados por cada negocio.
- Pasar la demo en vivo al sistema nuevo (ver la skill `contexto_biodigital`, "Falta para la demo en vivo") y regenerar sus capturas de la galería.
