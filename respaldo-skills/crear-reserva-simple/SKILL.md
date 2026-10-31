---
name: crear-reserva-simple
description: Subrama de crear-sitio-web y crear-sistemas-agendas para la reserva simple de un cliente de Bío Digital (desde $24.990, sin base de datos ni mensualidad): el cliente elige servicio y hora viendo lo realmente libre del Google Calendar del dueño y envía una solicitud por WhatsApp. Cubre el formulario del cliente, la herramienta que arma la carpeta, la llave de Google Calendar, la planilla del dueño, la prueba y la entrega. Úsala cuando pidan crear, armar, probar o entregar una reserva simple, agenda con Google Calendar o "reservas por WhatsApp" para una barbería, salón, cabañas u otro negocio de citas, aunque no digan "simple".
---

# Crear reserva simple (Google Calendar + WhatsApp)

**Responder siempre en español.** Trabajo dentro del repo (`C:\Users\criss\OneDrive\Escritorio\Proyecto DCP`). Detalle del producto: `crear-sistemas-agendas` › "Reserva simple". Precio y estado: `20 Servicios/Servicios.md`. No inventes datos del negocio: lo que falte va como `[PENDIENTE]`.

## Cuándo es esta y cuándo no
- **Es esta:** un negocio de citas (barbería, salón, kinesiólogo) o de alojamiento chico (cabañas) que atiende por WhatsApp, quiere ver horas libres y no pagar mensualidad.
- **Es la PRO** (`crear-sistemas-agendas`) si pide pago o depósito, panel con código, cupos, "Mis reservas" con modificar/cancelar o varios locales.
- **Pack:** casi siempre se vende junto con la página web. La reserva se integra en la página del cliente; el contenido editable usa el mismo módulo de planilla (`crear-sitio-web` › "Contenido editable por el dueño").

## Flujo
1. **Formulario del cliente:** `web/propuesta/formulario-reservas.html`. El cliente lo llena y copia o envía sus respuestas; guárdalas como `respuestas.json` (ejemplo: `web/herramientas/ejemplos-formulario/respuestas-agenda-ejemplo.json`).
2. **Armar:** `node web/herramientas/aplicar-formulario-agenda.mjs respuestas.json --simple [--id x] [--url https://…]`. Crea `web/propuesta/ejemplos/<id>/` autosuficiente, `CONFIGURAR.md`, `planilla-plantilla/*.csv` y `web/herramientas/agendas/<id>-pendientes.md`. Sin SQL ni PIN. Lee los pendientes antes de seguir.
3. **Llave de Google Calendar:** una sola llave de Bío Digital sirve para todos los clientes; si aún no existe, sigue `docs/google-calendar-llave.md`. Va en `simple.config.js` → `calendario: { id: 'correo@gmail.com', llave: 'AIza…' }`. La llave de pruebas vive en `llave.local.js` (no se sube a GitHub).
4. **Calendario del dueño:** que lo comparta como público, "ver solo libre/ocupado" (la página nunca ve nombres). Cada cabaña o profesional puede tener su calendario (`recursos[].calendario`).
5. **Planilla del dueño (opcional, recomendada):** copiar `planilla-plantilla/*.csv` a Google Sheets, publicar cada pestaña como CSV y pegar las URL en `planilla` de `simple.config.js`. Guía para el dueño: `docs/guia-planilla-dueno.md`. Plantillas de referencia: `web/propuesta/ejemplos/reservas-simple/planilla-ejemplo/`.
6. **WhatsApp:** número del negocio en `whatsapp` (formato `569XXXXXXXX`). Confirma que la solicitud llega a ese número.
7. **Probar:** abrir la página con `?revisar=1` (lista las filas de la planilla que no se entendieron). Luego `node web/herramientas/revisar.mjs "http://localhost:4321/ejemplos/<id>/" --anchos 390 --probar web/herramientas/pruebas/reservas-simple.js` y, para el recorrido completo, `npm run e2e` (Playwright; `pruebas-e2e/reserva-simple.spec.mjs`).
8. **Publicar (lo hace el usuario):** `npx wrangler pages deploy web/propuesta/ejemplos/<id> --project-name=<id> --branch=main --commit-dirty=true`.

## Qué recibe el cliente
Página de reserva con servicios (uno o varios, se suman duración y precio), calendario con lo ocupado fuera, solicitud por WhatsApp y su enlace para agendar y confirmar en su Google Calendar; planilla propia para precios, servicios, horario y profesionales; `CONFIGURAR.md` con los pasos.

## Reglas
- Siempre dice que es una **solicitud**, no una reserva confirmada.
- El dueño edita contenido (precios, servicios, horario, profesionales), nunca estructura ni diseño.
- Contenido de la planilla = no confiable: solo `textContent`.
- Costo único desde $24.990; no hay recurrente. Cifras de Google: aproximadas, verificar en su consola.

## Límites (decirlos)
- Solo **citas** y **alojamiento**. Sin pagos, sin "Mis reservas", sin avisos automáticos.
- Si falla el calendario, muestra todas las horas del horario y avisa que el negocio confirma.
- Google tarda unos minutos en publicar cambios de la planilla (por verificar).
- **Por verificar con el primer cliente:** `freeBusy` con un calendario real y la lectura del CSV publicado real (las pruebas usan datos locales).
- **Resumen de mañana con nombres de clientes:** requiere el mini panel "Mi agenda" (el dueño entra con Google), en construcción en `web/propuesta/ejemplos/barberia-simple/mi-agenda/`; es otra entrega.

## Entrega real del panel y la planilla (5 pasos)
1. Borrar `demo.config.js` y sus 2 `<script>` (en `index.html` y en `mi-agenda/index.html`).
2. En `mi-agenda/config.js`, poner `planillaUrl` = enlace de SU Google Sheet (o dejarlo vacío: el botón "Editar mi página (planilla)" no se muestra).
3. Quitar `demoPlanilla` de `contenido.config.js` y de `simple.config.js`.
4. Apuntar los 4 CSV (servicios, horario, barberos, aviso) a sus enlaces publicados de Google Sheets, en la configuración del sitio y en `planillaPestanas` de `mi-agenda/config.js`.
5. Probar: sin la franja de demostración, sin botón a `mi-planilla/` si `planillaUrl` está vacío, y los cambios de la planilla se ven en la página.

## No hacer
No inventar horarios ni precios; no pedir al dueño su contraseña de Google; no tocar `reservas/` (PRO) ni otras demos desde aquí; no commitear `llave.local.js`.
