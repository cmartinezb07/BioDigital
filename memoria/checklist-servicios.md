# Checklist de servicios · 31-oct-2026 (check-in de cierre de sesión)

Contrastado con el repositorio (no con la página en vivo). ✅ listo para vender y entregar · 🟡 a medias · ❌ falta del todo.
**Publicación:** la última versión (demo de la barbería, precio nuevo de la reserva simple, planilla incluida) **NO está publicada** en biodigital-bgw; el deploy lo corre el usuario (comandos en `00 Inicio/Pendientes.md`, punto 1). Ninguna demo nueva del 31-oct es visible hoy.
**Clientes cerrados: 0.** Ningún producto se ha entregado todavía a un cliente real; "✅" significa "listo para entregar", no "probado con cliente".

## Decisiones del 31-oct (tomadas como hecho)
- Reserva simple sube a **$27.990** (antes $24.990), costo único, **sin mensualidad**.
- La **planilla de Google Sheets va incluida** en el precio de la reserva simple.
- **"Mi agenda"** (panel de solo lectura) va **incluido** en la reserva simple.
- Sin mensualidad en ningún servicio simple.

## Productos

| # | Servicio (precio en `comun.mjs`) | Estado | Qué hay (evidencia) | Qué falta |
|---|---|---|---|---|
| 1 | Página web (desde $49.990; $39.990 lanzamiento) | ✅ | Skill `respaldo-skills/crear-sitio-web`; 8 ejemplos de rubro en `web/propuesta/ejemplos/`; `formulario.html`; e2e `pruebas-e2e/paginas.spec.mjs` (24/24 páginas públicas). Demo pública: sí (versión del 30-oct) | Primer cliente real. Enlace Mercado Pago `web` y `launch-web` vacíos (`enlaces-pago.mjs`): hoy cae a solicitud, no a pago directo |
| 2 | Videos para redes (desde $9.990) | 🟡 | Skill `crear-videos-redes` (brief, guion, checklist). Sin herramienta en el repo (a propósito). Enlaces MP de 2 y 3 videos ya cargados | Ejecución 100 % de Godoy y su plan **no está en el repo**: no hay evidencia verificable de que esté listo. Confirmar con Godoy plazo y capacidad. Enlaces `social-video` y `web-video` vacíos |
| 3 | Menú digital simple, carta con QR (desde $27.990) | ✅ | Skill `crear-menu-digital`; generador `plantilla/generar-menu.mjs` (5 estilos); planilla de Google para precios/agotados; demo `ejemplos/la-joya-del-sur/` (cliente en negociación). Demo pública: sí (30-oct) | **Sin prueba e2e** (Estado.md: "faltan menú y fidelización"). Platos nuevos requieren regenerar. Enlace MP vacío |
| 4 | Menú digital PRO ($99.990; $79.990 + $20.000/mes) | ✅ | Demo `ejemplos/fogon-del-sur/` (pedidos, cocina, reparto, panel); `aplicar-formulario.mjs`, `nuevo-restaurante.mjs`; pruebas de reglas `pedidos-reglas-e2e.mjs` y `pruebas/fogon-*.js`. Demo pública: sí (30-oct) | Modo garzón, "Mi mesa", botón de reseña de Google: diseñados, **sin construir**. **Supabase Pro** (el plan gratis se pausa; `biodigital-panel` está pausado). Pasarela/WhatsApp real: necesitan cuentas. Enlaces MP vacíos |
| 5 | Registro fotográfico ($4.990) | 🟡 | Skill `crear-registro-fotografico` (preparación, sesión, edición, entrega); enlace MP cargado (`mpago.la/2WXuyew`) | **Contradicción abierta:** `comun.mjs` líneas 60 y 104 prometen "10 a 15 fotos editadas"; la skill dice "sin límite fijo". Decidir uno y alinear. Sin herramienta propia (a propósito) |
| 6 | Sistema de reservas simple (**$27.990**, antes $24.990) | 🟡 | `comun.mjs` ya dice 27990 y "Mi agenda"; demos `ejemplos/reservas-simple/` y `ejemplos/barberia-simple/` (página, "Mi agenda", "Mi planilla"); `aplicar-formulario-agenda.mjs --simple`, `nuevo-agenda.mjs`; plantilla `docs/plantillas/planilla-barberia.xlsx` verificada en Google Sheets; llave de Google Calendar creada y probada con calendario real (30-oct); e2e `reserva-simple.spec.mjs` (12/12) y 5 specs de barbería/planilla/mi-agenda; suite 198/198, 4 omitidas por fecha. Demo pública: **no** (la de barbería sin publicar; la de reservas-simple, versión vieja) | **Precio inconsistente en el repo:** sigue $24.990 en `enlaces-pago.mjs` (`reservations`, monto no coincide con 27990, así que `fixedPaymentUrl` lo rechaza: solo seguro mientras la url esté vacía), `respaldo-skills/crear-reserva-simple/SKILL.md` (líneas 3 y 32), `crear-sistemas-agendas/SKILL.md` (líneas 13 y 15), `memoria/precios-catalogo.md` (líneas 71, 102, 165, 209), `docs/publicacion/PUBLICACION-COMERCIAL.md` línea 54 y `20 Servicios/Servicios.md`. Quitar `http://localhost:4321/*` de la llave. "Entrar con Google" del mini panel: solo probado en demo, faltan credenciales OAuth. Elegir Camino A o B para editar en la página. Publicar. 4 tests omitidos por fecha sin correr. Enlace MP: crear uno nuevo de $27.990 a mano |
| 7 | Sistema de reservas PRO ($99.990; $79.990 + $20.000/mes) | ✅ | Skill `crear-sistemas-agendas`; demos `reservas/`, `cabanas/`, `dental/`, `estetica/`, `estudio-contable/`, `barberia/`; `reservas-reglas-e2e.mjs`; recordatorio por WhatsApp con un toque. Demo pública: sí (30-oct) | Correo y WhatsApp automáticos reales y pasarela (cuentas externas). Mesas y profesional + recurso solo si un cliente lo pide. **Supabase Pro**, PIN privados por cliente, revisar límite de intentos. Enlaces MP vacíos |
| 8 | Tarjeta de fidelización ($9.990; $5.990 lanzamiento) | 🟡 | Skill `crear-fidelizacion`; `ejemplos/fidelizacion/` (QR, sellos, caja con cámara, canje, métricas); `nuevo-fidelizacion.mjs`; prueba `pruebas/fidelizacion.js`; enlace MP cargado para $9.990 | **`web/herramientas/nube-sql/007-fidelizacion-cualquier-negocio.sql` existe pero NO está aplicado**: sin él, un cliente de cualquier negocio que no sea la demo no queda protegido contra sumarse sellos solo. Bloquea la primera entrega real. Sin e2e Playwright. Enlace de lanzamiento $5.990 vacío. Wallet aparte y con costo mensual |

## Packs y ofertas

| Oferta | Estado | Por qué |
|---|---|---|
| Pack esencial, los seis ($79.990; $69.990 lanzamiento) | 🟡 | **Coherencia confirmada con el precio nuevo:** `SUMA` se calcula en código (`comun.mjs`) y con la reserva en $27.990 los seis suman $130.940 (el comentario del código dice 127.940, desactualizado); el pack de $79.990 ahorra unos $50.950 (~39 %), sigue siendo pack real. Los enlaces MP `full-pack` y `launch-pack` están cargados con sus montos fijos y no cambian. Falta: publicar y que la página y la skill hablen de $27.990 en todos lados |
| Pack PRO ($150.000; $120.000 lanzamiento) | 🟡 | Productos listos, pero enlaces `pro-pack` y `launch-pro-pack` vacíos; depende de Supabase Pro |
| Relámpago: web + video ($52.990) | 🟡 | Web lista; video depende de Godoy; enlace vacío |
| Relámpago: menú PRO + fotos ($89.990) | 🟡 | Ambos listos; enlace vacío (cambió de precio, el viejo ya no vale); resolver "10 a 15 fotos" |
| Relámpago: reservas PRO + fidelización ($94.990) | 🟡 | Reservas PRO lista; fidelización exige aplicar 007; enlace vacío |
| Relámpago: 2 y 3 videos ($17.990 y $24.990) | 🟡 | Enlaces MP ya cargados; ejecución de Godoy sin verificar |

## Bloqueos que dependen de cuentas o terceros
- **Mercado Pago:** de 21 enlaces en `enlaces-pago.mjs`, solo 6 tienen URL (fotos, fidelización $9.990, pack esencial, pack lanzamiento, 2 y 3 videos). Montos fijos: cada cambio de precio obliga a crear un enlace nuevo a mano. IVA sin resolver.
- **Supabase:** plan gratis se pausa sin uso (`biodigital-panel` ya pausado). Pro antes del primer cliente de menú PRO, reservas PRO o fidelización.
- **Google:** llave de Calendar probada pero con restricción a localhost por quitar; OAuth del mini panel sin credenciales.
- **WhatsApp/correo reales y pasarela:** solo reservas PRO y menú PRO; necesitan cuentas.
- **Godoy:** videos.
- **Cloudflare:** deploy lo corre el usuario (el clasificador lo bloquea).

## Correcciones sobre lo que se creía
- `foto-a-modelo.py`: **sí existe**, en `respaldo-skills/crear-menu-digital/plantilla/foto-a-modelo.py` (no en `web/herramientas/`, que es donde la skill de fotografía dice que no está). Lo que falta es aclarar la ruta; no es herramienta del registro fotográfico, es de la carta.
- "Respondemos en menos de 24 horas **por confirmar**": sigue en `comun.mjs` línea 390 (no 383). Mismo problema, nueva línea.
- Repo de GitHub **sigue público** con fichas de clientes, precios y competencia (Pendientes.md); decisión sin tomar.
- Costo de configurar la planilla del cliente: queda resuelto por decisión de hoy (incluida); falta reflejarlo en `precios-catalogo.md`, la skill y la letra chica.
- Estado.md aún dice 24.990 en varias partes y "Mi agenda: por confirmar": actualizar.

## Para retomar en el chat nuevo (por impacto)
1. **Publicar** en biodigital-bgw (comandos en Pendientes.md, punto 1): sin esto, nada de lo del 31-oct (precio $27.990, barbería, planilla incluida) es visible.
2. **Unificar el precio $27.990** de la reserva simple en `enlaces-pago.mjs`, las skills `crear-reserva-simple` y `crear-sistemas-agendas`, `memoria/precios-catalogo.md`, `PUBLICACION-COMERCIAL.md`, `Servicios.md` y `Estado.md`; crear a mano el enlace de Mercado Pago de $27.990 y registrar la decisión en `10 Decisiones/2026-10-31.md`.
3. **Aplicar `nube-sql/007`** y pasar Supabase a Pro (con PIN privados): son los bloqueos técnicos de fidelización, menú PRO y reservas PRO.
4. **Cerrar textos contradictorios de la página:** "por confirmar" de las 24 h (`comun.mjs` línea 390) y "10 a 15 fotos" vs "sin límite fijo" (líneas 60 y 104).
5. **Cerrar el primer cliente** (La Joya del Sur o web) y, de paso, completar enlaces MP faltantes (15 de 21 vacíos), confirmar con Godoy el plan de videos, quitar `localhost` de la llave de Google y decidir si el repo pasa a privado.
