# Checklist de servicios · 30-oct-2026

Lo que ofrece https://biodigitales.cl (revisado el 30-oct), contrastado con lo que hay en el repositorio. ✅ listo para vender y entregar · 🟡 a medias · ❌ falta hacerlo.

## Productos

| # | Servicio (precio en la página) | Estado | Qué hay | Qué falta |
|---|---|---|---|---|
| 1 | Página web (desde $49.990; $39.990 lanzamiento) | ✅ | Skill `crear-sitio-web` (maquetas → sitio con SEO, seguridad y publicación), 8 ejemplos de rubro en la portada, `formulario.html` | Entregarla a un cliente real por primera vez (aún no hay ninguno) |
| 2 | Videos para redes (desde $9.990) | ✅ | Lo tiene planificado Godoy (a cargo de este servicio; su plan no está en el repositorio) | — |
| 3 | Menú digital simple, carta con QR (desde $27.990) | ✅ | Generador `generar-menu.mjs` de la skill `crear-menu-digital`, con 5 estilos | Decidir cómo cambia el cliente un precio sin mensualidad (pendiente desde el 27-oct) |
| 4 | Menú digital PRO ($99.990; $79.990 + $20.000/mes) | ✅ | Fogón del Sur (pedidos, cocina, reparto, panel) y `aplicar-formulario.mjs`; demo de La Joya del Sur | Modo garzón, "Mi mesa" y botón de reseña en Google (diseñados el 27-oct, sin construir); el botón WhatsApp de la plantilla apunta al número de Bío Digital |
| 5 | Registro fotográfico ($4.990) | ✅ | Fotos con celular en el local, según lo que pida el cliente; formato simple, sin límite fijo de fotos, entrega lo antes posible. `foto-a-modelo.py` para las fotos de la carta | — |
| 6 | Sistema de reservas simple (desde $24.990) | ❌ | Solo está descrito (calendario; la solicitud llega armada por WhatsApp y el negocio confirma) | **Construirlo**: no hay plantilla ni herramienta. Se vende suelto y dentro del pack esencial. Se puede sacar del sistema PRO en modo local, sin base de datos |
| 7 | Sistema de reservas PRO ($99.990; $79.990 + $20.000/mes) | 🟡 | Todo lo del 29-oct: unidad asignada, motivos por día, reserva por teléfono, mover, campos propios, módulos, widget; 89/89 reglas | **Publicar la demo** (hoy en vivo no deja reservar); correo y WhatsApp reales y pasarela (necesitan cuentas); mesas y profesional + recurso solo si un cliente lo pide |
| 8 | Tarjeta de fidelización ($9.990; $5.990 lanzamiento) | ✅ | `ejemplos/fidelizacion/`: tarjeta con QR y sellos, caja con cámara, canje, métricas | No hay herramienta para armarla para un cliente nuevo (se copia a mano); Wallet de Google/Apple es aparte y con costo mensual |

## Packs y ofertas

| Oferta | Estado | Por qué |
|---|---|---|
| Pack esencial, los seis ($79.990; $69.990 lanzamiento) | 🟡 | No se puede entregar completo: falta la reserva simple (6) |
| Pack PRO ($150.000; $120.000 lanzamiento) | 🟡 | Se puede con el menú PRO hoy; con reservas PRO, después de publicar la demo |
| Relámpago: web + video | ✅ | Web lista; video a cargo de Godoy |
| Relámpago: menú PRO + fotos | ✅ | Ambos listos |
| Relámpago: reservas PRO + fidelización | 🟡 | Ambos construidos; falta publicar la demo de reservas |
| Relámpago: 2 y 3 videos | ✅ | A cargo de Godoy |

## Transversal, antes del primer cliente real
- [ ] Publicar biodigital-bgw (demo de reservas sin poder reservar hasta entonces).
- [ ] Supabase Pro, PIN privados por cliente y privacidad revisada con el negocio (el plan gratis se pausa si no hay uso).
- [ ] IVA y enlaces de Mercado Pago para los productos nuevos.
- [ ] En la página quedó a la vista "respondemos en menos de 24 horas **por confirmar**" (`fuentes/comun.mjs`, línea 383): confirmarlo o quitar el "por confirmar".
