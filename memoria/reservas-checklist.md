# Reservas: checklist contra un sistema universal · 26-oct-2026

Se contrastó lo que hay (`web/propuesta/ejemplos/reservas/`, skill `crear-sistemas-agendas`) con la lista de requisitos de un "sistema de reservas universal modular" que armó ChatGPT para el usuario, más lo que el usuario observó probándolo. Leyenda: ✅ está y probado · 🟡 a medias · ❌ falta. Para seguir mañana.

## 1. Lo que el usuario observó probando (prioridad alta)

| # | Observación | Estado | Qué pasa / qué hacer |
|---|---|---|---|
| O1 | Al reservar otra vez las **mismas fechas** que ya reservó, el asistente "se queda pegado en Tus datos" y parece un error | ✅ 29-oct | Causas probables (verificar primero): (a) el servidor rechaza con `demasiadas_retenciones` (máx. 2 reservas esperando pago por correo o celular) y el mensaje sale solo en letra chica bajo el botón; (b) `ocupado`/`conflicto` vuelve al paso de fechas sin explicar. Debe: decir **en grande y arriba** qué pasó, volver al calendario con las fechas ya marcadas como no disponibles, y ofrecer "ver mi reserva" si es la misma persona |
| O2 | Una vez registrados los días, el calendario **no los muestra como ocupados** | ✅ 29-oct ("2/3" por día) | El calendario cuenta unidades: una cabaña con 3 unidades sigue "libre" tras 1 reserva (es lo correcto) pero el cliente no lo entiende. Mostrar "quedan N de 3" por día y marcar "ocupado" cuando es 0; revisar si las reservas propias retenidas se descuentan igual que las ajenas |
| O3 | **No dice qué cabaña (número de unidad) le tocó** | ✅ 29-oct | El servidor no guarda la unidad asignada: solo el panel la calcula para dibujarla. Hay que asignar y guardar `unidad` (ej. "Cabaña Copihue 2") en la reserva y mostrarla en confirmación, "Mis reservas", correo y panel. Depende del rubro: cabañas/habitaciones/boxes/canchas sí; tours no |
| O4 | **Poca información de por qué no se puede**: ocupado, cerrado, mínimo de noches, muy pronto, muy lejos, sin cupos | ✅ 29-oct | Cada día deshabilitado debería decir su motivo (al tocar o con leyenda): "completo", "bloqueado por el negocio", "mínimo 2 noches en temporada alta", "solo se reserva con 12 h de anticipación", "cerrado ese día". Y sugerir fechas cercanas libres y la lista de espera |

## 2. Núcleo universal

| Requisito | Estado | Detalle |
|---|---|---|
| Negocios | ✅ | Cada cliente es un `negocio` aislado |
| Sucursales y ubicaciones | ❌ | Un negocio = una dirección; no hay sucursales |
| Roles: dueño, recepción | ✅ | Por PIN |
| Admin global de la plataforma | ❌ | Hoy solo se administra desde Supabase y las herramientas |
| Encargado de sucursal | ❌ | Depende de las sucursales |
| Empleados/profesionales con su propia sesión y agenda | ❌ | El profesional es un recurso; no entra con PIN ni ve solo su agenda |
| Servicios y recursos reservables | ✅ | Catálogo editable en el panel |
| Horarios por día | ✅ | Con tramos (almuerzo) |
| Excepciones: feriados, vacaciones, ausencias por profesional | 🟡 | Solo "bloquear fechas" manual por recurso; sin feriados ni ausencias recurrentes |
| Duración, intervalo, tiempo de preparación | 🟡 | Duración e intervalo sí; margen entre citas solo en citas |
| Capacidad y restricciones | ✅ | Unidades, personas, cupos, mínimos |
| Formularios configurables por negocio | ✅ 29-oct | Campos fijos (nombre, correo, celular, país, código). Falta definir campos propios, obligatorios u opcionales |
| Crear, confirmar, modificar, cancelar | ✅ | Modificar la misma reserva (versión) dentro del plazo |
| Estados controlados con reglas de transición | ✅ | En el servidor, por rol |
| Notificaciones y recordatorios | 🟡 | Se programan bien; **no se envían** (quedan "enviados (simulado)") |
| Historial de operaciones | 🟡 | Historial de estados y versiones por reserva; falta bitácora de lo que hace el personal (precios, catálogo, PIN) |
| Permisos y reglas por negocio | 🟡 | Dos roles fijos; sin permisos configurables |

## 3. Motor de disponibilidad y patrones

| Patrón | Estado | Detalle |
|---|---|---|
| A. Por horario (citas) | ✅ | Servicio + profesional (o cualquiera) |
| B. Por recurso (salas, canchas) | ✅ | Modo `bloques` |
| C. Por capacidad (mesas de restaurante) | ❌ | No hay mesas, aforo por horario ni agrupar mesas; el menú del restaurante no maneja reservas de mesa |
| D. Por período (alojamiento, arriendos por días) | ✅ | Modo `noches`; vehículos por días funcionarían con ese modo pero sin entrega/devolución |
| E. Eventos y actividades con cupos | 🟡 | Tours con salida y cupos y lista de espera; falta inscripción grupal con lista de participantes y control de asistencia |
| Profesional **y** recurso a la vez (clínica: médico + box; taller: técnico + bahía) | ❌ | Una reserva usa un solo recurso |
| Sin doble reserva ni sobreventa con varias personas a la vez | ✅ | Candado por agenda, 77 reglas lo prueban |
| Reglas de anticipación, cancelación y modificación | ✅ | Configurables |
| Reglas de entrega y devolución, depósito en garantía | ❌ | |

## 4. Módulos "plug and play"

| Requisito | Estado | Detalle |
|---|---|---|
| Módulos activables y desactivables sin romper nada, con aviso si hay reservas activas | ✅ 29-oct (7 módulos sobre los 4 modos; ver decisiones.md) | Hoy son **4 modos** dentro de un mismo motor, no módulos que se encienden. Es la diferencia más grande con la visión de ChatGPT |
| Módulo pagos: anticipo, completo, garantía | 🟡 | Depósito % y cobro de saldo registrado a mano |
| Estado de pago independiente del estado de la reserva | ❌ | Hoy `pagada` es un estado de la reserva |
| Pasarela real (Mercado Pago, Webpay, Flow) y reembolsos ejecutados | ❌ | La devolución se calcula, no se paga |
| Módulo notificaciones: correo, SMS, WhatsApp | ❌ | Sin proveedor conectado |
| Aviso al personal | 🟡 | Alerta con sonido en el panel abierto; sin correo ni push |
| Módulo estadísticas | ✅ | Ocupación, ingresos, ADR, RevPAR, cancelaciones, por canal y país |
| Mesas, recursos con mantenimiento, eventos | ❌ / 🟡 | Bloqueos manuales sí; el resto no |

## 5. Plantillas por industria

| Perfil | Estado |
|---|---|
| Alojamiento | ✅ (cabañas) |
| Tours / actividades | ✅ |
| Clínica / dental / salón / barbería / técnico (citas) | ✅ (modo `horas`) |
| Centro deportivo, salas, espacios | ✅ (modo `bloques`) |
| Restaurante (mesas) | ❌ |
| Arriendo de vehículos | 🟡 (por días con el modo alojamiento, sin entrega/devolución) |
| Taller mecánico (bahías + técnicos) | ❌ (necesita profesional + recurso) |
| Flujo "crear negocio → plantilla → configurar → publicar" | ✅ vía formulario y `aplicar-formulario-agenda.mjs` (lo hace el equipo, no el cliente solo) |
| Cliente cambia su configuración sin perder historial | ✅ borrador → publicar; lo ya reservado conserva su precio |

## 6. Panel y página pública

| Requisito | Estado | Detalle |
|---|---|---|
| Calendario y lista de reservas | ✅ | |
| Filtros por servicio, profesional, recurso | 🟡 | Solo estado y texto |
| Gestión de clientes | ❌ | Solo exportar CSV; sin ficha ni historial por cliente |
| Gestión de empleados | 🟡 | Solo PIN de recepción |
| Servicios, recursos y horarios editables | ✅ | |
| Configuración de la página pública (textos, colores, logo) | 🟡 | Color e iniciales; sin logo ni textos propios |
| Secciones que aparecen solo si el módulo está activo | 🟡 | Cambian por rubro, no por módulo |
| Cliente ve disponibilidad real, reserva, recibe código, consulta, modifica, cancela | ✅ | |
| Ver reservas anteriores con acceso seguro | 🟡 | Solo desde el mismo equipo o con el enlace; si cambia de celular las pierde. Falta acceso con correo + código |
| Insertar en una web existente (widget) | ✅ 29-oct | `reservas/widget.js` |
| Móvil | ✅ | Probado a 390 px |

## 7. Multiempresa, integraciones, integridad

| Requisito | Estado | Detalle |
|---|---|---|
| Aislamiento de datos entre negocios | ✅ | PIN y reglas por negocio; probado |
| Zona horaria, moneda e idioma por negocio | 🟡 | Fijo Chile y CLP; la interfaz sí viene en 3 idiomas |
| Contratos de integración, reintentos y bitácora | ❌ | |
| iCal con Airbnb y Booking | 🟡 | Se importa y exporta a mano, no automático |
| Webhooks y API para otras plataformas | ❌ | |
| Backups y recuperación ante errores | ❌ | Depende de Supabase; sin plan propio |
| Protección de datos personales | 🟡 | Cliente solo ve lo suyo; PIN en texto plano (falta hash); privacidad por revisar |
| Validación en backend y base | ✅ | |
| Historial intacto al cambiar configuración | ✅ | |

## 8. Casos que no se consideraron o pueden pasar (revisar mañana)

**Cliente**
- [x] Reserva dos veces lo mismo por error: detecta "ya tienes una reserva igual" y lo lleva a ella. (29-oct)
- [x] Llega al límite de 2 retenciones: aviso con las pendientes para pagar o cancelar. (29-oct)
- [ ] La retención vence mientras llena sus datos: aviso claro y volver a elegir sin perder lo escrito.
- [ ] Pierde el código o cambia de celular: recuperar con correo o celular.
- [ ] Elige una cabaña, no hay fechas posibles en el mes: sugerir otras cabañas o fechas, o lista de espera.
- [ ] Ve "desde $X" y el total cambia (temporada, fin de semana, descuento): explicar por qué en el resumen (hoy hay líneas, revisar claridad).
- [ ] Sin internet a mitad de la reserva: mensaje y reintento sin duplicar.
- [ ] Pide un cambio fuera del plazo: hoy dice "escríbele al negocio" pero sin botón de WhatsApp.
- [ ] No sabe cómo llegar: mapa o enlace a la dirección en la confirmación.

**Negocio**
- [x] Necesita saber la **unidad asignada** (O3) y poder cambiarla (mover una reserva de cabaña). (29-oct)
- [x] Reserva por teléfono o WhatsApp: crearla a mano desde el panel. (29-oct)
- [ ] Cliente que no llega ni avisa: política de "no llegó" con cobro del depósito (se conserva, falta aplicarlo con claridad).
- [ ] Cambiar un precio no debe afectar reservas ya hechas (así es) y debe avisarlo.
- [ ] Quitar una cabaña con reservas futuras: hoy avisa cuántas hay; falta reubicarlas.
- [ ] Feriados, cierres por vacaciones, remodelación: bloqueo masivo y por rango largo.
- [ ] Dos personas de recepción editando la misma reserva a la vez (hay versión, falta mostrar el choque).
- [ ] Sobreventa externa: Airbnb/Booking se importan a mano, hay riesgo de doble venta entre portales.
- [ ] Reembolsos: el sistema dice cuánto devolver, pero alguien lo hace a mano fuera del sistema.
- [ ] Respaldo de las reservas (exportar todo en un clic).

**Sistema**
- [x] Mensajes de error técnicos siempre traducidos y visibles (aviso grande). (29-oct)
- [ ] Zona horaria si el cliente reserva desde otro país (hoy hora de Chile).
- [ ] Reloj del navegador desfasado en la cuenta regresiva (el servidor manda, la pantalla solo muestra).
- [ ] Muchos clientes a la vez (sondeo cada 3-6 s sirve para un negocio, no para cientos).
- [ ] Qué pasa si se pausa Supabase gratis: el sitio queda sin reservas (hoy sin aviso al cliente).

## 9. Orden sugerido para mañana
1. O1 a O4 (lo que el usuario vio): mensajes claros, unidad asignada y guardada, motivos por día.
2. Cliente reserva por teléfono desde el panel y mover una reserva de unidad.
3. Formularios con campos propios por negocio.
4. Decidir si se hace el salto a **módulos reales** (tabla de módulos activos por negocio y secciones del panel que dependen de ellos) o se mantiene "4 modos por rubro": definir con el equipo antes de construir, porque cambia el modelo.
5. Después: profesional + recurso a la vez (clínica y taller), mesas (restaurante), correo real, pasarela, acceso por correo + código, widget.
