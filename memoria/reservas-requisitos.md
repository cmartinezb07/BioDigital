# Reservas: lo que pidió el usuario, todo en un lugar · 29-oct-2026

Este archivo junta lo que el usuario fue pidiendo para el sistema de reservas, para no depender de la memoria de un chat. **El prompt largo original con la lista de requisitos de ChatGPT no quedó guardado palabra por palabra**: lo que sigue es lo que sí quedó escrito (checklist del 26-oct, encargo del 23-oct, observaciones del usuario). Si el usuario tiene el texto original o recuerda algo que no está aquí, **pedirle que lo reenvíe y pegarlo en la sección 6**.

## 1. Encargo original (23-oct-2026)
Sistema de reservas completo y **"todo automático"**, investigando antes la competencia (qué tienen, cómo compiten, qué destacan; ver `reservas-sistema.md`).
- **Cara al cliente:** motor de reservas, calendario dinámico, inventario en tiempo real, reserva en pocos pasos, 100 % móvil, varios idiomas y monedas, módulo de promociones.
- **Panel de administración:** gestión de paquetes, dashboard, gestión de calendarios, inventario y capacidad, notificaciones automáticas, políticas configurables (cancelación, depósitos), reportes y analítica.
- **Integraciones:** pasarela de pago, channel manager, PMS, CRM, ERP, calendarios externos (Google o iCal) y lo que la investigación muestre que se usa.
- **Rubros:** hotel o cabañas, agencia de tours, centro médico, arriendo de espacios, salones.

## 2. Pedido del 26-oct: al mismo nivel que el menú digital
Reglas en el servidor, cliente con validación y "Mis reservas", modificar la misma reserva, panel con jefe y recepción por PIN, plantilla por negocio, formulario → agenda funcionando, y la skill `crear-sistemas-agendas`. **Hecho** (ver `reservas-sistema.md`, `plantilla-agenda.md`).

## 3. Lo que el usuario observó probando el sistema (hay que corregirlo)
1. **Reservar otra vez las mismas fechas** deja el asistente "pegado" en *Tus datos* y parece un error.
2. Una vez registrados los días, el calendario **no los muestra bien como ocupados** (hay que mostrar "quedan N de M").
3. **No dice qué cabaña (unidad) le tocó** al cliente: el servidor no guarda la unidad asignada.
4. **Casi no explica por qué un día no se puede reservar** (completo, bloqueado, mínimo de noches, muy pronto, muy lejos, cerrado).

## 4. La lista de ChatGPT: "sistema de reservas universal modular"
Lo que se pedía, ya contrastado punto por punto en [reservas-checklist.md](reservas-checklist.md) (✅ / 🟡 / ❌), en nueve bloques:
núcleo universal (negocios, sucursales, roles, servicios y recursos, horarios y excepciones, formularios configurables, estados, notificaciones, historial) · motor de disponibilidad con cinco patrones (por horario, por recurso, por capacidad/mesas, por período, eventos con cupos; más profesional **y** recurso a la vez; sin sobreventa) · **módulos plug and play** que se activan y desactivan sin romper nada · plantillas por industria · panel y página pública · multiempresa, integraciones e integridad de datos · casos no considerados.

**Lo más grande que falta** (ver la checklist): módulos activables de verdad (hoy son 4 modos por rubro), mesas de restaurante, profesional + recurso a la vez, formularios con campos propios por negocio, sucursales, correo/SMS/WhatsApp y pasarela reales, reserva por teléfono desde el panel, mover una reserva de unidad, acceso a "mis reservas" con correo + código, widget para insertar en otra web.

## 5. Decisiones ya tomadas que importan aquí
- **Sin anticipo** de Bío Digital (27-oct). Reservas simple: $24.990, solicitud por WhatsApp, sin panel. Reservas PRO: $79.990 de lanzamiento ($99.990 normal) + $20.000 al mes desde el segundo mes. Precios y qué incluye cada una: `servicios/README.md` y `fuentes/comun.mjs`.
- **No prometer** lo que no existe: hoy no se envían correos ni WhatsApp (quedan "enviados (simulado)"), no hay pasarela real, y los módulos no se activan.
- Una propuesta nunca debe decir "sin esperar respuesta", "agenda del día en el teléfono" o "confirmación automática" para la reserva simple (lo corrigió Xavier en `propuestas/zoul-barber/`).
- El cliente no edita la página, pero **sí** edita su catálogo y horarios desde el panel PRO (borrador → publicar).
- Idea en evaluación (27-28-oct): un **bot de WhatsApp por botones** que agende sobre Google Calendar, sin base de datos propia. Hoy no existe; requiere API oficial de WhatsApp (número nuevo, costo por mensaje en recordatorios) y un piloto con un negocio antes de ofrecerlo. Está en `servicios-futuros/bot-whatsapp/`.

## 6. Detalle adicional que el usuario envíe (pegar aquí, con fecha)
**29-oct-2026, orden de trabajo del usuario:**
1. Lo que vio probando: reservar otra vez las mismas fechas sin quedarse pegado, mostrar la unidad asignada, "quedan N de M" por día y el motivo de cada día no disponible. → ✅
2. Reserva por teléfono desde el panel y mover una reserva de unidad. → ✅
3. Formularios con campos propios por negocio ("lo básico; cuando haya un cliente en serio indagamos su ámbito"). → ✅
4. Decisión antes de construir: módulos activables de verdad o 4 modos por rubro ("haz lo óptimo"). → ✅ modo + módulos (ver `decisiones.md`, 29-oct).
5. Después: profesional + recurso a la vez, mesas, correo y WhatsApp reales, pasarela de pago, widget. → ✅ widget; ❌ el resto (mesas y profesional + recurso por construir; correo, WhatsApp y pasarela necesitan cuentas del negocio o de Bío Digital).
6. Cierre: aplicar `006e` (lo hace Claude), cargar las agendas, probar y publicar. → ✅ 006e, agendas y pruebas; **falta el deploy** (lo bloqueó el permiso de producción).
- Los cambios no se suben a GitHub hasta que el usuario diga "estamos listos".
