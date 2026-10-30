# Sistema de reservas (agenda): arquitectura, archivos, reglas y pruebas

Fuente de verdad: el repo (`web/propuesta/ejemplos/reservas/` = plantilla y demo; `web/herramientas/` = herramientas y SQL). Esta nota resume lo necesario para trabajar sin releer el código. Estado y decisiones: `memoria/decisiones.md`, `memoria/reservas-sistema.md`, `memoria/plantilla-agenda.md`, `memoria/conexion-nube.md`.

## Piezas
| Qué | Dónde |
|---|---|
| Motor (disponibilidad, precio, estados, avisos, iCal; modo local y conectado) | `reservas/motor.js` (`window.Reservas`) |
| Lo que ve el cliente: asistente de 4 pasos, "Mis reservas", gestión, modificar | `reservas/index.html` + `reservar.js` |
| Panel del negocio (acceso por código) | `reservas/admin/index.html` + `admin.js` |
| Estilos (claro y oscuro; el color del negocio entra por `--marca`) | `reservas/estilo.css` |
| Privacidad del sitio | `reservas/privacidad.html` |
| Configuración de CADA negocio | `reservas/agenda.config.js` (`window.AGENDA`: `negocio`, `demo`, `pistas`, `negocios` = agendas de partida) |
| Acceso y base de datos | `../_compartido/nube.js` (en un negocio real se copia a la carpeta como `nube.js`) |

## Base de datos (Supabase `biodigital-demos`, esquema `demo`)
- Tablas: `items(negocio, col, id, data, pub, creado, updated)`, `roles(negocio, rol, nombre, pin, cols, activo)`, `cols` (permisos del cliente por columna). Columnas por negocio: `config` (una fila `cfg-<agenda>` pública), `promos` (códigos de descuento, **solo equipo**: id largo al azar), `reservas`, `bloqueos`, `avisos`, `espera`.
- Solo se exponen funciones (`nube_leer/escribir/vaciar/borrar/rol/quien/importar/personal_*` y `reserva_cotizar`). El cliente es "capacidad por código secreto" (el id de su reserva); el personal entra con PIN (`dueno` ve todo; `recepcion` ve reservas, avisos, espera y bloqueos). **Cada negocio es un `negocio` distinto**: PIN, agenda y reservas no se mezclan. Ninguna función nombra un negocio en particular.
- SQL versionado (en este orden): `web/herramientas/nube-sql/006a-reservas-base.sql` (utilidades, fechas en hora de Chile, precio), `006b-reservas-resolver.sql` (qué recurso y unidad se asigna, cupos), `006c-reservas-reglas.sql` (triggers y estados), `006d-reservas-panel.sql` (quitar bloqueos, recepción con PIN, cobrar saldo), `006f-reservas-unidades-modulos.sql` (unidad asignada, mover de unidad, reserva del equipo por teléfono, campos propios, módulos, bloqueos por unidad). Para un proyecto nuevo se corren 006a, b, c, d y f. La demo en vivo (`reservas`) quedó con las reglas el 29-oct (006e aplicado).
- Los triggers son `reserva_reglas`, `espera_reglas`, `bloqueo_reglas` y `config_reglas` sobre `demo.items`. Cada uno guarda quién lo ejecuta en `demo.rol` y `demo.nombre`; `nube_importar` corre como rol `sistema` (se salta las reglas: solo para cargas del jefe).
- Tiempos en milisegundos de época con la hora de Chile (`America/Santiago`); el precio se calcula en `float8` con el mismo redondeo que `Math.round` de JavaScript (coincide con el navegador: 77 reglas lo prueban en 4 modos).
- Disponibilidad: las funciones son `VOLATILE` y toman un candado (`pg_advisory_xact_lock`, `hashtext(negocio:rv:agenda)`) por agenda: dos personas a la vez no pueden tomar el último cupo.

## Qué decide el servidor (el navegador solo envía lo que la persona eligió)
- Al crear: se arma la reserva desde `sel` (selección), `cliente` y `codigoPromo`; todo lo demás que mande el navegador (precio, pagado, estado, código, fechas) se ignora. Nace `retenida` (si hay depósito; expira en `retencionMin`) o `confirmada`. Código de 6 caracteres, `rev` 1, historial con `por`/`quien`.
- Al actualizar un cliente solo se aceptan `sel`, `cliente`, `codigoPromo` (con `baseRev` = la versión que vio) y `estado`: `cancelada`, o `pagada` si la agenda tiene `pagoDemo`. Cambiar `sel` rehace la reserva: versión + 1, guarda la anterior en `ediciones`, recalcula precio y deja `ajuste` (lo que falta pagar o queda a favor). Solo mientras falten más de `modificarHoras` (24 por defecto).
- Roles: `recepcion` y `dueno` pasan una reserva por `retenida → confirmada/pagada/cancelada`, `confirmada → pagada/checkin/noshow/completada/cancelada`, `pagada → checkin/noshow/completada/cancelada`, `checkin → completada/cancelada`; pueden subir lo pagado hasta el total en una reserva `pagada` o `checkin` (cobrar saldo, queda en el historial con `cobro`). `noshow` y `completada` solo después de la hora. Una retención vencida solo se puede cancelar (queda a nombre del sistema).
- Cancelar calcula `reembolso` según el tramo de la política y lo pagado (`rv_reembolso`). Los avisos (confirmación, recordatorio, opinión, cancelación, cupo liberado) los programa el servidor, no el navegador.
- `config_reglas`: solo `dueno` publica la configuración (`cfg-<agenda>`); valida modo, ids de recursos y servicios (`[a-z0-9_-]{1,30}`), tamaños y que `politicas` exista; saca los códigos de descuento a `promos`.
- **Unidad** (006f): en todo menos tours, el servidor guarda `unidad` (1..N) y `unidadNombre` ("Cabaña Copihue 2", o el nombre propio de `recurso.nombresUnidades`). Toca la preferida si sigue libre (al modificar se conserva), si no la primera libre todo el periodo; `null` si ninguna queda libre de punta a punta (el panel avisa "sin unidad fija" y se usa Mover). El equipo mueve con un parche `{ unidad: N }` (`rv_mover`: valida que esté libre, deja `movida` en el historial); el cliente no puede.
- **Reserva del equipo** (teléfono, WhatsApp, mostrador): basta celular o correo, sin anticipación mínima, sin preguntas obligatorias, `canal` y `sinPago` (confirmada sin depósito).
- **Campos propios** (`config.campos`, máx. 10: `{ id, etiqueta, tipo: texto|numero|opciones|si, opciones, obligatorio, ayuda }`): el servidor valida y guarda `respuestas` (solo las conocidas).
- **Módulos** (`config.modulos`: pagos, promociones, extras, avisos, espera, campos, modificar; sin la clave = encendido). `rv_cfg` devuelve la configuración *efectiva* (con lo apagado ya aplicado) y todas las reglas la usan; `Reservas.efectiva(c)` hace lo mismo en el navegador. Apagar no toca lo ya reservado.
- **Bloqueos**: `{ unidad: N }` bloquea esa unidad, `{ todas: true }` todas (el panel por defecto); sin nada, 1 unidad sin nombre (iCal). Un bloqueo cierra también la salida de un tour (`bloqueado`).
- Códigos de error (el motor los traduce a mensajes en `Reservas.mensajeError`): `ocupado`, `ya_paso`, `lejos`, `fechas`, `estadia_min:N`, `estadia_larga`, `capacidad:N`, `cupos:N`, `minimo_personas:N`, `horas_min:N`, `horas_max`, `fuera_horario`, `sin_salida`, `seleccion`, `datos:nombre|correo|telefono|contacto`, `demasiadas_retenciones`, `conflicto`, `bloqueado`, `unidad_invalida`, `unidad_ocupada:COD|bloqueo`, `campo:ID`, `sin_espera`, `tarde_modificar:N`, `no_modificable`, `transicion_invalida`, `retencion_vencida`, `aun_no`, `sin_agenda`, `config_invalida`, `bloqueo_invalido`, `sin permiso`.

## Cliente y panel (cómo funcionan)
- Calendario del cliente: `Reservas.mes()` da por día `estado`, `info`/`total` ("2/3") y `motivo`; estados que no se eligen: pasado, lejos, cerrado, lleno, bloqueado, corte (hay una noche completa antes de esa salida) y min (estadía mínima). Tocar un día gris muestra el motivo, fechas cercanas libres (`Reservas.cercanas`) y la lista de espera.
- Errores al reservar: aviso grande arriba del paso (no en letra chica). Antes de crear, si en "Mis reservas" hay una vigente con la misma selección, pregunta "¿otra igual?". Con `demasiadas_retenciones` lista las retenciones pendientes con su enlace para pagar o cancelar.
- Panel: "+ Nueva reserva" (teléfono o mostrador), "Mover" de unidad, la unidad y las respuestas en la tabla, calendario por unidad guardada, bloqueo de todas o de una unidad, y la sección "Módulos y formulario" (jefe).
- `motor.js` guarda un caché local por agenda (`localStorage bdres-v2-<agenda>`) y lo mezcla con lo que traen los sondeos (`Nube.sondear` cada 3–6 s): la config publicada, los códigos (solo con PIN), las reservas (las del cliente por su id; todas con PIN; para los demás, solo "pub": fechas y estado, sin nombre ni precio), los bloqueos, los avisos y la lista de espera.
- La **configuración** se edita en borrador (`guardarConfig` marca `sucio`) y se publica con `publicarConfig` (escribe `cfg-<agenda>`); `descartarConfig` vuelve a la publicada. Mientras hay borrador, los sondeos no pisan la config. `estaPublicada` es `false` solo si la primera lectura no encontró la fila.
- `crear`, `estado`, `modificar`, `cancelar`, `bloquear`, `quitarBloqueo`, `esperar`, `cotizar` devuelven **promesas** en modo conectado y valores en modo local (por eso las pantallas usan `Promise.resolve(...)`). Los errores llegan como `{ error: 'mensaje', codigo }`.
- Las acciones de una misma reserva van en cola (`Nube.cola('res' + id)`): nunca llegan al revés.
- Panel: `Nube.acceso({ aceptan: ['dueno', 'recepcion'] })` pide el PIN; `rol` decide las pestañas. El aviso en vivo compara versiones de reservas (`vistas`) y suena (Web Audio) cuando aparece una o cambia otra; las que existían al entrar no suenan. "Catálogo" edita recursos y servicios en un diálogo con validación; "Quitar" saca el elemento del borrador (las reservas existentes se mantienen).

## Herramientas
| Herramienta | Para qué |
|---|---|
| `aplicar-formulario-agenda.mjs` | Formulario → agenda completa (carpeta, `agendas.json`, SQL de accesos, prueba, pendientes) |
| `nuevo-agenda.mjs` | Copia la plantilla con otro nombre/negocio y PIN al azar (la usa la anterior); `--demo` para demostraciones |
| `cargar-agendas.mjs --negocio <id> --pin <PIN del jefe> [--archivo agendas.json]` | Publica las agendas en la base (sin archivo: las 5 de demostración) |
| `reservas-reglas-e2e.mjs` | 89 reglas del servidor contra la base real, en el negocio `zz-agenda` (PIN 741852 jefe / 852963 recepción); limpia lo suyo |
| `pruebas/agenda-cliente.js` | Prueba de humo de cualquier agenda conectada (17 comprobaciones); se lanza con `revisar.mjs --probar` |
| `pruebas/reservas-ui.js`, `pruebas/reservas-panel.js` | Pantallas del cliente y panel de punta a punta (usan iframes) |
| `pruebas/reservas-sistema.js` | Motor en modo local (precios, retención, iCal, idiomas) |
| `reservas/widget.js` + `widget-ejemplo.html` | Insertar la agenda en otra web: `<div data-bd-reservas data-negocio="X"></div>` + el script; el marco crece solo |
| `pruebas/reservas-panel-medidas.js` | Desborde, áreas táctiles y textos chicos del panel en cada sección (correr con `--anchos 390` y con `1440`) |
| `check.mjs` | Check completo → `memoria/CHECK.md` (incluye las 5 agendas y las reglas del servidor) |

Para probar en la computadora sin tocar la demo: `agenda.config.js` acepta `?nube=zz-agenda` **solo en localhost** (apunta a ese negocio de pruebas); cargar sus agendas con `node web/herramientas/cargar-agendas.mjs --negocio zz-agenda --pin 741852`.
Ejemplo: `node web/herramientas/revisar.mjs "http://localhost:4321/ejemplos/reservas/?nube=zz-agenda&negocio=cabanas" --anchos 1440 --probar web/herramientas/pruebas/reservas-ui.js`.

## Trampas conocidas
- El sondeo trae **solo lo que cambió** desde la última vez: ausencia de una fila no significa que no exista (así se rompió "agenda no publicada" en la primera versión; ahora cuenta solo la primera lectura).
- Las pruebas de reglas y el panel abierto a la vez se estorban: el panel marca como "enviados" los avisos que vencen. Cerrar el panel antes de correr `reservas-reglas-e2e.mjs`.
- Un cliente solo puede tener 2 retenciones pendientes por correo o celular: las pruebas usan correos distintos y limpian al terminar; si una prueba se corta, `Nube.borrar(negocio, 'reservas', PIN, { filtro: { cliente: { nombre: 'zz-prueba' } } })`.
- `Reservas.configPendiente` y las demás funciones son por ventana: en pruebas con iframe usar `iframe.contentWindow.Reservas`.
- Un helper de parches que devuelve el texto sin cambios puede dejar edits "aplicados" en silencio: verificar con `grep` después de editar.
- Navegador integrado: si el panel está oculto no carga imágenes diferidas; el servidor local (`maquetas`, puerto 4321) se apaga al reiniciar la sesión.
