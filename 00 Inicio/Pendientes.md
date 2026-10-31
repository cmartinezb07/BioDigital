---
tags: [pendientes]
---
# Pendientes — 31-oct-2026

↩ [[Inicio]] · [[Estado]]

Ordenados por impacto (orden fijado el 31-oct). Al terminar uno, tacharlo aquí y anotarlo en la nota del día.

## Orden de prioridad (31-oct)
1. [ ] **Publicar en biodigital-bgw** con todos los cambios juntos, cuando el usuario diga que está listo (lo corre el usuario):
   `node web/propuesta/fuentes/generar.mjs --publico 8`, `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`, `node web/propuesta/fuentes/generar.mjs 8`.
2. [ ] **Mercado Pago:** crear el enlace de la reserva simple a $27.990 y completar los 15 que faltan (hoy 6 de 21 tienen URL). IVA de los productos nuevos: sigue pendiente.
3. [ ] **Base y privacidad:** aplicar `nube-sql/007-fidelizacion-cualquier-negocio.sql` antes de entregar la primera tarjeta; pasar Supabase a Pro; PIN privados por cliente (revisar límite de intentos y reactivar `biodigital-panel`, pausado); privacidad revisada con el negocio.
4. [ ] **Cerrar textos:** confirmar o quitar "por confirmar" de las 24 horas de respuesta (`comun.mjs`, ~línea 390); decidir entre "10 a 15 fotos" y "sin límite fijo" en el registro fotográfico.
5. [ ] **Primer cliente real** (aún no hay ninguno; posible: [[cliente-la-joya-del-sur]]). Confirmar con Godoy el plan de videos.
6. [ ] **Editar dentro de la página:** elegir Camino A (Entrar con Google, recomendado) o B (Cloudflare con PIN). Ver [[Estado]].
7. [ ] **Repositorio:** decidir si el repositorio de GitHub pasa a privado (hoy es público y tiene fichas de clientes, precios y competencia). `memoria/contexto-completo.md` quedó fuera del commit por datos personales.
8. [ ] **Verificar** que la barra del mod `progreso-equipo` se vea en la app (`/progreso`).

## Ya resuelto
- [x] "Mi agenda" y la planilla de Google Sheets van incluidas en los $27.990 de la reserva simple (decisión del dueño, 31-oct).
- [x] Costo de configurar la planilla del cliente: incluido en el precio, sin mensualidad, configurado por Bío Digital a pedido del cliente (decisión del dueño, 31-oct).

## Resto (sin orden fijo)
- [ ] Quitar `http://localhost:4321/*` de las restricciones de la llave de Google Calendar (la llave ya está probada con un calendario real, 30-oct).
- [ ] Planilla del dueño y mini panel: probar que una hoja compartida por enlace se lea con la llave de API; crear el ID de cliente OAuth y probar "Entrar con Google" real (`docs/google-oauth-panel.md`; hoy solo probado en demo); verificar lectura del CSV publicado con el primer cliente real.
- [ ] Caso de una sola categoría: los paneles de pestañas sobrantes quedan vacíos.
- [ ] 404 inofensivo de `mi-agenda/config.local.js` en el sitio público.
- [ ] Correr un día hábil los 4 tests que hoy se omiten por fecha.
- [ ] Lectores difieren en año de 2 dígitos y en fecha con hora (impacto casi nulo; revisar si un cliente lo usa).
- [ ] `foto-a-modelo.py` no existe en el repo: revisar las referencias que lo nombran.
- [ ] Instalar claude-hud y 6 skills de marketing (bloqueado por permisos; lo corre el usuario).
- [ ] Reunión/seguimiento con La Joya del Sur → [[cliente-la-joya-del-sur]].

## Mejoras (solo si un cliente las pide)
- Reservas PRO: mesas (restaurante) y profesional + recurso (clínica, taller); correo/WhatsApp reales y pasarela (necesitan cuentas externas).
- Menú PRO: modo garzón, "Mi mesa", botón de reseña en Google.

## A cargo de otros
- Videos: Godoy. Propuestas PDF: Xavier. Pagos: Benjamín.
