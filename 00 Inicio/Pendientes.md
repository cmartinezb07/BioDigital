---
tags: [pendientes]
---
# Pendientes — 31-oct-2026

↩ [[Inicio]] · [[Estado]]

Ordenados por impacto. Al terminar uno, tacharlo aquí y anotarlo en la nota del día.

## Hoy: publicar
1. [ ] **Publicar en biodigital-bgw** (el clasificador bloqueó el deploy; lo corre el usuario):
   `node web/propuesta/fuentes/generar.mjs --publico 8`, `npx wrangler pages deploy --project-name=biodigital --branch=main --commit-dirty=true`, `node web/propuesta/fuentes/generar.mjs 8`.

## Bloquean la primera venta
2. [ ] Quitar `http://localhost:4321/*` de las restricciones de la llave de Google Calendar (la llave ya está probada con un calendario real, 30-oct).
3. [ ] Aplicar `nube-sql/007-fidelizacion-cualquier-negocio.sql` antes de entregar la primera tarjeta.
4. [ ] Supabase Pro, PIN privados por cliente, privacidad revisada con el negocio.
5. [ ] IVA y enlaces de Mercado Pago para los productos nuevos.
6. [ ] Confirmar o quitar "por confirmar" de las 24 horas de respuesta en la página (`comun.mjs`, ~línea 383).
7. [ ] Decidir si configurar la planilla del cliente es gratis o tiene costo (hoy solo se dice "sin mensualidad").
8. [ ] Confirmar si "Mi agenda" está incluido en los $24.990 de la reserva simple.

## Planilla del dueño y mini panel
- [ ] Elegir Camino A (Entrar con Google, recomendado) o B (Cloudflare con PIN) para editar dentro de la página.
- [ ] Probar que una hoja compartida por enlace se lea con la llave de API.
- [ ] Crear el ID de cliente OAuth y probar "Entrar con Google" real en el mini panel (`docs/google-oauth-panel.md`; hoy solo probado en demo).
- [ ] Verificar lectura del CSV publicado con el primer cliente real.
- [ ] Caso de una sola categoría: los paneles de pestañas sobrantes quedan vacíos.
- [ ] 404 inofensivo de `mi-agenda/config.local.js` en el sitio público.
- [ ] Correr un día hábil los 4 tests que hoy se omiten por fecha.
- [ ] Lectores difieren en año de 2 dígitos y en fecha con hora (impacto casi nulo; revisar si un cliente lo usa).

## Seguridad y repositorio
- [ ] **Decidir si el repositorio de GitHub pasa a privado** (hoy es público y tiene fichas de clientes, precios y competencia). `memoria/contexto-completo.md` quedó fuera del commit por datos personales del usuario; no se sube al repo público.
- [ ] Reactivar `biodigital-panel` (pausado) y revisar límite de intentos de los PIN.
- [ ] Aplicar/verificar `nube-sql/007` junto con el punto 3.

## Contenido
- [ ] Decidir si el registro fotográfico promete "10 a 15 fotos" (catálogo `comun.mjs`) o "sin límite fijo".
- [ ] `foto-a-modelo.py` no existe en el repo: revisar las referencias que lo nombran.
- [ ] Instalar claude-hud y 6 skills de marketing (bloqueado por permisos; lo corre el usuario).

## Comercial
- [ ] Reunión/seguimiento con La Joya del Sur → [[cliente-la-joya-del-sur]].
- [ ] Primer cliente real de página web (aún no hay ninguno).

## Mejoras (solo si un cliente las pide)
- Reservas PRO: mesas (restaurante) y profesional + recurso (clínica, taller); correo/WhatsApp reales y pasarela (necesitan cuentas externas).
- Menú PRO: modo garzón, "Mi mesa", botón de reseña en Google.

## A cargo de otros
- Videos: Godoy. Propuestas PDF: Xavier. Pagos: Benjamín.
