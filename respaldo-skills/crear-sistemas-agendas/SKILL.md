---
name: crear-sistemas-agendas
description: Subrama de crear-sitio-web para el sistema de reservas y agendas de un cliente de Bío Digital (cabañas, hotel o hostal; tours y experiencias con cupos; clínica, dental, kinesiología, salón de belleza o servicio técnico con citas; arriendo de salas, canchas o equipos por hora). Arma, casi sola, el sistema completo a partir de las respuestas del formulario del cliente: calendario en vivo, precio y depósito calculados en el servidor, "Mis reservas" con modificar y cancelar sobre la misma reserva, panel del negocio con acceso por código (recepción y jefe), aviso sonoro de reserva nueva, editor de catálogo con borrador y publicar, promociones, políticas, bloqueos, avisos, integraciones y reportes. Incluye el formulario del cliente, la herramienta que lo convierte en una agenda funcionando, la prueba de humo y la publicación. Úsala cuando pidan crear, armar, aplicar, actualizar o publicar un sistema de reservas, agenda, turnos, citas o calendario de reservas para un negocio, aunque no digan "agenda".
---

# Crear sistemas de agendas (subrama de crear-sitio-web) — plug and play

**Responder siempre en español.** Esta skill depende de `crear-sitio-web` (reglas, estilos, seguridad), de `contexto_biodigital` (estado del proyecto) y es hermana de `crear-menu-digital` (misma arquitectura: estructura en la plantilla, datos en la base, reglas en el servidor): léelas si es un chat nuevo. Todo se hace **dentro del repo del proyecto** (`C:\Users\criss\OneDrive\Escritorio\Proyecto DCP`; si no está, clonar https://github.com/cmartinezb07/BioDigital). La plantilla viva es `web/propuesta/ejemplos/reservas/` (también es la demostración de Bío Digital, con 5 agendas de ejemplo).

## Estado al 29-oct-2026 y qué falta para darlo por TERMINADO
El usuario quiere cerrar este sistema el 29-oct, sin olvidar ningún detalle de lo que pidió. **Primero leer** `memoria/reservas-requisitos.md` (todo lo que pidió, en un lugar; el prompt largo original no quedó guardado textual: pedirle que reenvíe lo que falte) y `memoria/reservas-checklist.md` (la lista de ChatGPT contrastada, sus observaciones O1 a O4 y 25 casos no considerados).
- **Hecho (26-oct):** 4 modos, reglas en el servidor (77/77), cliente y panel nuevos, formulario → agenda, skill. **Sin publicar la demo nueva**: la demo en vivo sigue con el cliente viejo hasta aplicar `006e` (ver `contexto_biodigital`).
- **Falta, en orden:** (1) O1 a O4: mensaje claro y arriba al reservar de nuevo las mismas fechas, **unidad asignada guardada y mostrada** (confirmación, Mis reservas, correo, panel), "quedan N de M" por día y **motivo** de cada día no disponible; (2) reserva por teléfono creada a mano desde el panel y mover una reserva de unidad; (3) formularios con campos propios por negocio; (4) **decidir con el usuario módulos activables de verdad o 4 modos por rubro**, antes de construir; (5) profesional + recurso a la vez, mesas, correo y WhatsApp reales, pasarela, "Mis reservas" con correo + código, widget, sucursales.
- **Dado por terminado cuando:** O1 a O4 corregidos y con pruebas nuevas; decisión de módulos tomada; 77 reglas, pruebas de pantalla, prueba de humo y `node --test` en verde; demo en vivo migrada (`006e` + `cargar-agendas.mjs` + publicar juntos) y check completo; capturas de la galería regeneradas; skill, checklist y `decisiones.md` al día.
- **Qué se vende** (no prometer más): Reservas simple $24.990 = solicitud armada por WhatsApp y el negocio confirma, sin panel ni disponibilidad en vivo ni confirmación automática; Reservas PRO $99.990 ($79.990 de lanzamiento) + $20.000 al mes desde el segundo mes = este sistema.

## Qué producto es (lo define la pregunta `tipo_negocio` del formulario)
| Lo que reservan | Modo del motor | Ejemplo | Cómo se ve |
|---|---|---|---|
| Alojamiento | `noches` | cabañas, hotel, hostal | calendario con rango de noches, unidades iguales, temporadas, fin de semana, extras, check-in y check-out |
| Tours, experiencias, clases | `cupos` | caminatas, kayak, ruta del vino | fecha + hora de salida, cupos por salida, mínimo de personas |
| Citas con profesionales | `horas` | centro médico, dental, salón, técnico | servicio con duración + profesional (o "cualquiera"), horario por día, margen entre citas |
| Arriendo por hora | `bloques` | salas, canchas, estudios | espacio + horas, mínimo de horas, horario por día |
Un negocio real tiene **una agenda** (id fijo: `alojamiento`, `tours`, `citas` o `espacios`); la demo tiene cinco bajo un mismo negocio. Si el cliente mezcla (hotel que además arrienda un salón), son dos agendas: se agrega la segunda editando `agendas.json` antes de cargar (el sistema ya soporta varias).

## Flujo plug and play
1. **Formulario** (39 preguntas, 8 bloques, ~15 min): ya está publicado como `web/propuesta/formulario-reservas.html` (se regenera con `node web/propuesta/fuentes/formularios.mjs`; para otro formato: `node respaldo-skills/crear-sistemas-agendas/plantilla/formulario/construir-formulario.mjs --salida formulario-reservas.html --agencia "Bío Digital" --contacto "…" --whatsapp 569XXXXXXXX [--supabase-url … --supabase-key …]`). Con Supabase las respuestas llegan al panel interno como JSON. Si el dueño está presente, se llena junto con él.
2. **Guardar las respuestas** en un archivo (`respuestas.json` con el JSON del formulario o el texto que copia el formulario tal cual). Ejemplo completo: `web/herramientas/ejemplos-formulario/respuestas-agenda-ejemplo.json`.
3. **Aplicar:** `node web/herramientas/aplicar-formulario-agenda.mjs respuestas.json [--id cabanas-sol] [--url https://dominio-final/] [--demo]`. Crea `web/propuesta/ejemplos/<id>/` con la agenda (catálogo con precios, capacidad y duración; horarios; temporadas; depósito; política de cancelación; descuentos; códigos; avisos; color, iniciales y lema; equipo), **quita todo lo de "demostración de Bío Digital"** (cinta, PIN en pantalla, pago de mentira, botón del panel para el público) y deja el SQL de accesos, la prueba de humo y la lista de pendientes en `web/herramientas/agendas/` (carpeta fuera de git: tiene los PIN).
4. **Pendientes:** léelos y resuélvelos con el cliente. Lo que el cliente no dijo **nunca se inventa**: si hubo que poner un valor de partida (depósito 30 %, horario 09–18, 10 cupos…) queda anotado como pendiente para confirmar. Sin precio, una línea del catálogo no se carga. Instrucciones de pago sin datos sensibles (nada de claves ni tarjetas).
5. **Accesos en la base:** ejecutar `<id>-instalar.sql` en el proyecto Supabase `biodigital-demos` (id `xoetybrsbuxcdoamcaeb`) con `execute_sql` del MCP de Supabase. Crea jefe, recepción y el personal que nombró (cada uno con su PIN). No pegar PIN en canales públicos.
6. **Publicar la agenda en la base:** `node web/herramientas/cargar-agendas.mjs --negocio <id> --pin <PIN-del-jefe> --archivo web/herramientas/agendas/<id>-agendas.json`. Es **obligatorio**: sin agenda publicada, el sitio dice "todavía no publica su agenda" y el servidor rechaza reservas (`sin_agenda`). El jefe puede editarla después desde su panel (catálogo → borrador → "Publicar cambios"); volver a correr este comando **pisa** lo que él cambió: usarlo solo antes de entregar.
7. **Probar:** servidor local (`preview_start maquetas`) y `node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/<id>/ --anchos 390,1440 --probar web/herramientas/agendas/<id>-prueba.js` (17 comprobaciones: agenda publicada, cotización del servidor = navegador, precio/pago/estado manipulados se ignoran, reserva real, no se vende dos veces, roles por PIN, la recepción cobra depósito y saldo, el cliente modifica y cancela con devolución, limpieza). Después **a ojo, en celular y escritorio**, con una reserva real de punta a punta y mirando el panel con el PIN de recepción y el del jefe.
8. **Dejarlo del cliente:** entrar a `.../<id>/admin/` con el PIN del jefe → Catálogo, Horarios, Promociones, Políticas, Negocio y equipo (color, logo/iniciales, **cómo se paga el depósito**, PIN de recepción) → **publicar**. Cambiar los PIN provisorios y entregarlos por un canal privado.
9. **Publicar el sitio** (la ejecuta el usuario, salvo que lo pida): la carpeta es autosuficiente y se publica sola en el proyecto Cloudflare del cliente: `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true`. Dominio propio y HTTPS antes de dar el enlace. **Para la demo de Bío Digital, solo `biodigital-bgw.pages.dev`.**
10. **Entrega y registro:** acta (dirección, accesos, quién cambia qué), anotar en `memoria/decisiones.md` el cliente, lo entregado y los pendientes.

## Qué recibe el cliente
- **Sitio de reservas** (`index.html`): elegir → fechas u hora → datos con validación visible → depósito con cuenta regresiva → confirmación con `.ics`, Google Calendar y enlace propio. Español, inglés y portugués; pesos con equivalencia en USD, EUR y BRL (referencial). Lista de espera cuando no hay cupo. "Mis reservas" (las de ese equipo) y página de gestión (por enlace secreto): estado, historial, **modificar la misma reserva** (versión 2, la anterior queda guardada) mientras falten más de N horas, y cancelar con la devolución que dice la política.
- **Panel del negocio** (`admin/`, acceso por código): el **jefe** entra a todo (resumen, reservas, calendario, catálogo, horarios y temporadas, promociones, políticas, avisos, integraciones, reportes, negocio y equipo); la **recepción** solo al día a día (resumen, reservas, calendario, avisos, reportes). Aviso sonoro y contador cuando llega o cambia una reserva. Registrar depósito, cobrar saldo, check-in, "no llegó", check-out, cancelar con devolución calculada. Bloquear y liberar fechas. Catálogo editable (agregar, editar, quitar) en **borrador** hasta que el jefe publica; banner si la agenda no está publicada; calendarios iCal (exportar a Google, importar de Airbnb o Booking); CSV; reportes con ocupación, ADR y RevPAR. Solo reservas reales: sin cifras de relleno.
- **Reglas en el servidor** (no se pueden saltar desde el navegador): precio y depósito recalculados desde la agenda publicada, disponibilidad con candado (no se vende dos veces ni con dos personas a la vez), límites de la política (anticipación, horizonte, estadía mínima, capacidad, cupos, mínimo de horas, horario), datos del cliente validados, 2 retenciones pendientes por contacto, estados por rol, devolución por política, versión de la reserva (`rev`/`baseRev`), códigos de descuento privados, configuración solo del jefe. Detalle y archivos: `referencias/sistema-agenda.md`.

## Reglas que no se negocian
- **No inventar nada**: precios, horarios, capacidades, políticas, fotos, reseñas, años. Falta → pendiente y se avisa.
- **Las referencias del cliente mandan** (sitios de reservas o diseños que le gustan).
- **Costo único vs recurrente**, siempre dicho: instalación (única) y mensualidad (base de datos, soporte). Correo automático: $0 con cuota gratis de un proveedor; **WhatsApp automático: por mensaje, aparte**; pago en línea: comisión por venta **que paga el negocio**; channel manager y PMS: mensualidad del proveedor, aparte. Precios finales: Reservas PRO $99.990 ($79.990 de lanzamiento) + $20.000 al mes desde el segundo mes (primer mes gratis); ver `servicios/README.md` y `memoria/precios-catalogo.md`. Supabase **Pro** (~US$25 al mes, compartido entre negocios) antes del primer cliente real: el plan gratis se pausa tras una semana sin uso. El dominio .cl es aparte (~$10.000 al año; verificar en nic.cl).
- **Seguridad y datos:** PIN privados (`demo: false` en un negocio real), nada de datos reales en demos, página de privacidad revisada con el negocio (`privacidad.html`), sin secretos en el código (la llave de Supabase del sitio es pública por diseño).
- **Sin permiso del usuario no descargues archivos ni instales paquetes**, y no hagas deploys ni commits que no pidió.
- Frases cortas, sin jerga, en el idioma del cliente final.

## Cambios que NO salen del formulario (dónde se hacen)
| Cambio | Dónde |
|---|---|
| Precios, capacidades, duraciones, descripciones, agregar o quitar alojamientos, tours, servicios, profesionales o espacios | Panel › Catálogo (el jefe) |
| Horario de atención, intervalo, margen entre citas, temporadas, recargo de fin de semana | Panel › Horarios y temporadas |
| Depósito, minutos de retención, anticipación, horizonte, plazo para modificar, devolución por tramos | Panel › Políticas |
| Descuentos automáticos activos, códigos nuevos | Panel › Promociones |
| Nombre, rubro, dirección, color, iniciales, **cómo se paga el depósito**, PIN de recepción | Panel › Negocio y equipo |
| Avisos que se programan (confirmación, recordatorio, opinión…) | Panel › Avisos |
| Logo propio (hoy: iniciales sobre su color) | A mano en la plantilla del cliente (`reservar.js`/`admin.js` usan `R.logo`) |
| Otra moneda, otro idioma, traducir los nombres del catálogo | Código (hoy solo se traduce la interfaz) |
| Pago en línea real, WhatsApp automático, lectura automática de iCal, boleta | Aparte (proveedor de pago, API de WhatsApp, tarea programada) |
| Diseño y estructura de la página | Nunca el dueño; lo hace Bío Digital en la plantilla |

## Verificación antes de entregar
`referencias/verificacion.md` de `crear-sitio-web` (sitio) **y**: la prueba de humo del paso 7; `node web/herramientas/reservas-reglas-e2e.mjs` (77 reglas del servidor) si se tocó el servidor; las pruebas de pantalla `reservas-ui.js` y `reservas-panel.js` (en `web/herramientas/pruebas/`; se lanzan con `revisar.mjs --probar`, ver `sistema-agenda.md`); `node --test`; en la demo de Bío Digital, `node web/herramientas/check.mjs http://localhost:4321` (≈ 20 min; escribe en la base real y limpia lo suyo; no usar el panel mientras corre; el aviso en vivo del panel y las pruebas de reglas se estorban si corren a la vez).

## Límites conocidos (decirlos, no esconderlos)
Checklist completo contra un sistema universal, con lo que falta y los casos no considerados: `memoria/reservas-checklist.md`. Lo más visible hoy: el servidor no guarda ni muestra la **unidad asignada** ("Cabaña Copihue 2"), los días no disponibles no explican el motivo, un reintento de las mismas fechas puede dejar el asistente en "Tus datos" sin un error claro, y los módulos no se activan: hay 4 modos por rubro.
- Los PIN se guardan en texto plano (demostración): para producción, guardarlos con hash.
- Los avisos quedan programados y "enviados (simulado)": no salen correos ni WhatsApp todavía (se conecta un proveedor aparte).
- El pago del depósito es manual (el negocio lo registra); la pasarela se conecta aparte.
- Quitar algo del catálogo no cancela las reservas que ya tiene: se mantienen (el panel avisa cuántas hay) pero ya no se puede reservar.
- Sin avisos con el navegador cerrado; sin app del dueño; sin ficha clínica ni facturación electrónica; sin channel manager propio.
- Realtime por sondeo cada 3–6 s: suficiente para un negocio, no para cientos de reservas por minuto.
- Se pueden importar calendarios iCal de portales a mano, no automáticamente.

## Más detalle
`referencias/sistema-agenda.md` (arquitectura, archivos, tablas, reglas, códigos de error, pruebas, trampas) · `memoria/reservas-sistema.md` · `memoria/plantilla-agenda.md` · `memoria/precios-catalogo.md` · `memoria/conexion-nube.md`.
