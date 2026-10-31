---
tags: [pendientes]
---
# Pendientes — 31-oct-2026

↩ [[Inicio]] · [[Estado]]

Ordenados por impacto (orden fijado el 31-oct). Al terminar uno, tacharlo aquí y anotarlo en la nota del día.

## Estado 1-nov (noche) — publicado y verificado
- **Publicado:** casilla de consentimiento en vivo (/formulario), cabeceras en vivo, `llave.local.js` ya no entrega la clave (devuelve la página de inicio). Aplicadas 008-012 en Supabase demos. nube-e2e quedó en 14/14 (se quitó su bloque de reservas antiguo; lo cubre reservas-reglas-e2e).
- **Por publicar de nuevo:** botón «Enviar por correo» ahora abre Gmail en escritorio (el `mailto:` no hacía nada sin programa de correo) y texto de privacidad con el almacenamiento local de formularios y «Mis reservas». Correr los 3 comandos de deploy.
- **Panel RESUELTO (1-nov, tarde):** `agente-whatsapp FINAL` se pausó (con permiso del dueño; reversible con restore_project) y `biodigital-panel` se restauró: ACTIVO. Verificado en solo lectura: RLS activo en las 6 tablas, el público solo inserta (columnas limitadas, estado fijo 'nueva'), leer/editar exige `es_staff()` = 2FA (aal2) + fila en `staff` + correo confirmado; CHECK de tamaño en items/total/respuestas. Había 0 solicitudes porque estuvo pausado durante las pruebas. **Riesgo:** plan gratis => se vuelve a pausar tras ~7 días sin actividad; entrar al panel o recibir envíos lo mantiene vivo; con cliente real, Supabase Pro.
- **Alertas de ataque:** `select * from demo.alertas order by t desc limit 50;` (Supabase demos, SQL Editor). Revisar semanalmente.
- **Privacidad:** el borrado a 12 meses de solicitudes sin contrato es MANUAL: anotar revisión cada trimestre.

## PUBLICADO y verificado en vivo (1-nov, noche)
- En biodigitales.cl y biodigital-bgw.pages.dev: Gmail en «Enviar por correo», casilla de consentimiento en los 3 formularios, borrador que no se re-guarda, privacidad completa, cabeceras (HSTS, permisos, frame-ancestors + noindex en pantallas de personal) y los arreglos de las demos (simple.js, fidelizacion.js, cocina.js).
- Única observación: `/ejemplos/reservas-simple/llave.local.js` sin parámetros sigue saliendo de la caché de Cloudflare (270 B); la clave dentro está EXPIRADA en Google (HTTP 400), inofensiva. Repetir la purga por URL en Cloudflare (biodigitales.cl) si se quiere limpiar.
- Probado por el dueño: el formulario guarda en el panel (las 3 solicitudes de prueba se borraron el 1-nov).

## Verificadores independientes (1-nov): 3 agentes, resultado
- **SQL (008-012):** resisten; cerrados en `013` (IPv6 por /64, negocio recortado a 40, visitas sin `pub`, nube_leer a prueba de `pub` mala, casts de tarjetas, p_cupo u/max/r). Quedan como hardening: `nube_importar` del dueño no sanea (solo afecta su negocio), `ruta`/`repartidor` del reparto sin sanear (el cliente los pinta con esc()/mapa), `bloqueado` y registro del fallo no atómicos (marginal), confirmar que el esquema `demo` NO está expuesto en PostgREST.
- **Navegador:** arreglados `fidelizacion.js` (negocio/color), `#g=` con fechas validadas, OSRM con Number(), borrador del formulario no se re-guarda tras enviar, `acepto_en` en el envío, texto de privacidad completo. `cartel.js` RESUELTO el 1-nov (sin publicar): dominios de Bío Digital directo; cualquier otro pide confirmar el sitio; lista `DOMINIOS_CLIENTES` para clientes y `i.cant`/`p.rev` crudos (el servidor los valida).
- **Despliegue:** `_headers` OK. `llave.local.js` sin parámetros sigue en la CACHÉ de Cloudflare (la clave vieja está EXPIRADA según Google: inofensiva); purgar la URL en el panel de Cloudflare (Caching > Purge) o esperar. Sacar `fuentes/` del deploy y mover los PIN de `zz-agenda` (reservas/agenda.config.js:15) a local-secretos.
- **Pruebas:** pedidos 62/62, nube 14/14, reservas solo T1 (fecha), e2e navegador 236/236 con fecha simulada. OJO: el cupo por conexión (120 pedidos/h en demos) se agota si se corren las pruebas 3 veces seguidas desde la misma IP; limpiar con `delete from demo.cupo_ip_log where clave like '%|<tu ip>'`.

## Con el primer cliente real (decisión del dueño, 1-nov: todo esto queda en pendiente hasta entonces)
- PIN del personal con hash (hoy texto plano; la pantalla del dueño ve los PIN: rediseñar) y rotar los PIN provisionales de La Joya del Sur.
- Poner `demo.cols.pago_prueba = false` en su negocio (ya es el valor por defecto de un negocio nuevo; La Joya está en true por ser demo).
- Subir `maximo` de pedidos/reservas (hoy 3000) o archivar; ajustar el cupo por conexión si hace falta (migración 009).
- Crear el ID de cliente OAuth ("Entrar con Google") y pasar Supabase a Pro; enlaces de Mercado Pago (Benjamín).
- Retirar o actualizar la prueba antigua `web/herramientas/nube-e2e.mjs` (R1-R6 dan `sin_agenda`; anterior a las reglas 006).
- Al incorporar un cliente con DOMINIO PROPIO: agregarlo a `DOMINIOS_CLIENTES` en `web/propuesta/ejemplos/_compartido/cartel.js` (si no, su cartel QR pide confirmar el sitio antes de imprimir; los dominios de Bío Digital arman el cartel directo).
- Hechos por el dueño el 1-nov: clave de Google rotada y sin localhost; panel (hallazgo 6) revisado.

## ALERTA (1-nov): la clave de Google de prueba estuvo PÚBLICA
`llave.local.js` se servía en vivo (HTTP 200, 270 B) en biodigitales.cl y biodigital-bgw.pages.dev. Ya salió de `web/propuesta/` (ahora en `web/local-secretos/`, solo la entrega `web/servir.py`); el próximo deploy la quita del sitio, pero las versiones antiguas pueden seguir accesibles. **Acción del dueño:** en Google Cloud ROTAR la clave (crear nueva, borrar la vieja), restringirla a Calendar API y a referentes exactos (biodigitales.cl, biodigital-bgw.pages.dev; nunca *.pages.dev) y guardar la nueva en `web/local-secretos/ejemplos/reservas-simple/llave.local.js`.

## Mañana (1-nov) — seguridad, en este orden
1. [ ] **Terminar la auditoría `security-audit`** (run-1 pausado: 11 de 30 agentes). Resumen sin verificar en `~/security-audit-skill/proyecto-dcp/run-1/RESUMEN-HALLAZGOS-SIN-VERIFICAR.md`. Falta crítica final + verificadores (~14). En Windows el validador exige copias parcheadas (`*.win.cjs`, en el scratchpad de la sesión; rehacerlas si se perdieron).
2. [~] **Corregir todo lo que arroje** — HECHO el 1-nov (JS, sin publicar, 40+18 pruebas verdes): XSS de `x.p` (simple.js), `codigo` (fidelizacion.js), `_n` (panel Fogón/La Joya), `km`/`destino` (cocina, panel, repartidor de Fogón y La Joya). HECHO (1-nov, noche): `web/propuesta/_headers` (HSTS, Referrer-Policy, Permissions-Policy; `frame-ancestors 'self'` + noindex en pantallas de personal y /pago/; sin CSP estricta a propósito); casilla de consentimiento + enlace a privacidad en los 3 formularios de levantamiento (se exige solo al pulsar «Enviar») y borrado del borrador local tras enviar; migración `010` (p_cupo acotado a 800 pasos; `visitas` solo {t,origen}) y `011` (cupo por conexión no aplica a negocios `zz-*`). Verificado: pedidos-reglas-e2e 62/62; reservas-reglas-e2e solo falla T1 (`fuera_horario`, dependiente del día); nube-e2e R1-R6 `sin_agenda` es una prueba antigua (anterior a las reglas 006), no causada por 008-011. **Sigue pendiente:** PIN en texto plano (hash), políticas del panel (las revisa el dueño), subir `maximo` de clientes reales, llave Google rotada (confirmar), quitar localhost de la llave, publicar. HECHO también (1-nov, tarde): migración `009` aplicada y verificada en vivo (límite de intentos de PIN por conexión: 30 fallos por negocio u 80 en total en 10 min; PIN nuevo mínimo 6 dígitos; borrar/vaciar exigen PIN activo; cada conexión crea a lo más 120 pedidos/1000 visitas/300 eventos/40 del resto por hora). La IP real llega a la base (cf-connecting-ip). **Sigue pendiente:** PIN guardado en texto plano (hash + que el dueño no vea los PIN; cambia la pantalla de personal), `p_cupo` sin tope, forma de `visitas`, subir `maximo` de clientes reales (hoy 3000 pedidos) o archivar, `_headers` del sitio público, consentimiento en los 3 formularios, políticas del panel (las revisa el dueño). HECHO también: migración `008` aplicada (km/destino limpios en servidor; pago de prueba solo en negocios con `demo.cols.pago_prueba`=true: fogon, captura-fogon, la-joya-del-sur; un cliente real queda en false); llave.local.js fuera de la carpeta publicada. FALTA: PIN con límite de intentos y hash (diseño cuidadoso: el bloqueo por negocio permite que un atacante deje fuera al personal; usar IP vía request.headers y registrar el fallo SIN lanzar excepción, o se revierte); `p_cupo`; tope `maximo`; forma de `visitas`; `_headers` del sitio público; consentimiento en 3 formularios; políticas del panel. Lista original:, incluidos: PIN sin límite de intentos y en texto plano; pedido "pagado" falsificable (002:155,186,206); XSS almacenado (`km`/`destino`, `codigo` de tarjeta, `_n` de visitas, `x.p` en `#g=`); tope `maximo` llenable; `p_cupo` sin límite; `llave.local.js` dentro de `web/propuesta`; sitio público sin `_headers`; consentimiento en los 3 formularios de levantamiento; políticas del panel (RLS) fuera del repo.
3. [ ] **Después:** trabajar con los links que envía el dueño (cola, sin gastar tokens hasta entonces):
   - Instagram (3 ya analizados en chat): checklist de seguridad (límites de peticiones, llaves, reglas de tablas, `.env`, filtrado de entradas, errores, registros) -> en curso; arnés `security-audit` -> instalado; multas por ley de datos en Chile (políticas, consentimiento, cookies; cifras sin verificar, ver BCN, Ley 21.719) -> pendiente de revisar en los formularios.
   - Artículos: `codetocloud.io` (10 repos; evaluado, nada que instalar) y `virtualuncle.com/github-repos-claude-code-productivity-2026/` (sin abrir). `vercel-labs/skills find-skills` ya está instalada.
   - Ofrecer correr de nuevo `security-audit` solo cuando haya avance grande.

## Orden de prioridad (31-oct)
1. [ ] **Publicar en biodigital-bgw** con todos los cambios juntos, cuando el usuario diga que está listo (lo corre el usuario):
   `node web/propuesta/fuentes/generar.mjs --publico 8`, `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`, `node web/propuesta/fuentes/generar.mjs 8`.
2. [ ] **Mercado Pago:** crear el enlace de la reserva simple a $27.990 y completar los 15 que faltan (hoy 6 de 21 tienen URL). IVA de los productos nuevos: sigue pendiente.
3. [ ] **Base y privacidad:** pasar Supabase a Pro cuando haya primer cliente real (no antes); PIN privados por cliente (revisar límite de intentos y reactivar `biodigital-panel`, pausado); privacidad revisada con el negocio.
5. [ ] **Primer cliente real** (aún no hay ninguno; posible: [[cliente-la-joya-del-sur]]). Confirmar con Godoy el plan de videos.
6. [ ] **Camino A (Entrar con Google)** para editar dentro de la página: crear el ID de cliente OAuth y probar el acceso real (`docs/google-oauth-panel.md`).

## Ya resuelto
- [x] `nube-sql/007` aplicado en `biodigital-demos` (31-oct; verificado: la regla de sellos vale para todo negocio).
- [x] Registro fotográfico: "fotos según el producto u objetivo", sin cantidad fija (decisión del dueño, 31-oct; falta publicar).
- [x] "Respondemos en menos de 24 horas": confirmado, sin "por confirmar" (31-oct; falta publicar).
- [x] $24.990 de la reserva simple ya no queda en `enlaces-pago.mjs`, skills, `precios-catalogo.md` ni `catalog.js` (verificado 31-oct; los $24.990 que quedan son de "3 videos" y "3 cambios menores").
- [x] Camino A elegido para editar en la página (31-oct). Llave de Google sin `localhost` (hecho por el usuario).
- [x] Los 4 tests omitidos por fecha corren con `FECHA_PRUEBA=2026-11-03` (simula un martes): 18/18 pasan.
- [x] Galería: los ejemplos (cabañas, dental, barbería) son solo ilustrativos; la reserva sirve a cualquier negocio. No hay orden que decidir.
- [x] Repositorio público: se deja así por ahora (decisión del usuario, 31-oct); revisar solo si aparece un dato sensible.
- [x] Barra del mod `progreso-equipo` verificada por el usuario; las 6 skills de marketing y claude-hud ya están instaladas.
- [x] Pestañas sobrantes con una sola categoría: ya se ocultan (`contenido.js`).
- [x] `pruebas/barberia.js` no es huérfano: sirve a las dos demos de barbería, como los demás guiones manuales.
- [x] "Mi agenda" y la planilla de Google Sheets van incluidas en los $27.990 de la reserva simple (decisión del dueño, 31-oct).
- [x] Costo de configurar la planilla del cliente: incluido en el precio, sin mensualidad, configurado por Bío Digital a pedido del cliente (decisión del dueño, 31-oct).

## Resto (sin orden fijo)
- [ ] Planilla del dueño y mini panel: probar que una hoja compartida por enlace se lea con la llave de API; verificar lectura del CSV publicado con el primer cliente real.
- [ ] 404 inofensivo de `mi-agenda/config.local.js` en el sitio público (por diseño: el archivo existe solo en el cliente real; se deja).
- [ ] Lectores difieren en año de 2 dígitos y en fecha con hora (impacto casi nulo; revisar si un cliente lo usa).
- [ ] Reunión/seguimiento con La Joya del Sur → [[cliente-la-joya-del-sur]].
- [ ] Galería: "Mi agenda" y "Mi planilla" solo tienen enlace de texto (sin captura). Verificar `.mi-pedido` con un pedido activo real y las pantallas del equipo tras el PIN (hoy solo cocina y repartidor).

## Mejoras (solo si un cliente las pide)
- Reservas PRO: mesas (restaurante) y profesional + recurso (clínica, taller); correo/WhatsApp reales y pasarela (necesitan cuentas externas).
- Menú PRO: modo garzón, "Mi mesa", botón de reseña en Google.

## A cargo de otros
- Videos: Godoy. Propuestas PDF: Xavier. Pagos: Benjamín.
