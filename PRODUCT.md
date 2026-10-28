# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro, publicado en Cloudflare (Workers con assets estáticos). Las maquetas de la fase de propuesta son HTML/CSS estático en `web/propuesta/`.

## Users

Dueños de micro y pequeñas empresas con local físico y atención a público (gastronomía, peluquerías, talleres, almacenes, consultas pequeñas), principalmente en el Gran Concepción, Chile. Tienen poco tiempo y conocimiento digital limitado. Llegan al sitio de dos formas: después de recibir en persona un diagnóstico impreso con QR durante una jornada de terreno, o buscando cómo aparecer en Google. Su tarea es entender qué les falta, confiar en quien se los ofrece y pedir el diagnóstico gratis.

## Product Purpose

Bío Digital vende e implementa presencia digital llave en mano: ficha de Google Business, fotografía del local, catálogo digital, página web, dominio .cl y correo corporativo. Existe porque estos negocios pierden clientes que los buscan en Google y Maps y no los encuentran bien presentados. El éxito del semestre (2026-2) son 3 a 5 clientes con proyecto cerrado, pagado y transferido.

## Positioning

Todo lo que se entrega queda a nombre del cliente (dominio a su RUT, ficha con el cliente como propietario), con capacitación presencial y un acta de entrega firmada: el cliente no queda dependiendo del equipo. La captación parte con un diagnóstico gratis y concreto de su presencia en Google, puntuado de 0 a 100 en cinco dimensiones.

## Operating Context

- Jornada de terreno: el equipo visita negocios y entrega un diagnóstico impreso de una página con QR hacia `/diagnostico`.
- Proceso por cliente: diagnóstico → visita → propuesta en ≤ 48 h → anticipo del 50% → levantamiento en el local → producción (3-7 días hábiles) → una ronda de revisión → capacitación y acta → pago final → soporte.
- La verificación de Google puede tardar días y no depende del equipo.
- Canal de contacto actual: formulario y `biodigitalici@gmail.com`. Sin teléfono, WhatsApp ni redes sociales por ahora.

## Capabilities and Constraints

- Planes: Base desde $150.000, Estándar desde $250.000 y Premium desde $380.000 (CLP). El precio final se confirma después del diagnóstico.
- Cobertura: presencial en el Gran Concepción (fotos, capacitación) y remota en todo Chile (ficha, web, dominio, correo).
- Atención: se reciben solicitudes 24/7. El plazo de respuesta propuesto es de menos de 24 horas y **no está confirmado**.
- Fuera de alcance: publicidad pagada, gestión de redes sociales, tienda con pagos en línea, agente de voz. El agente de WhatsApp es un upsell futuro, **no se ofrece en el sitio**.
- Sin inicio de sesión ni panel de usuarios.
- **Sin decidir:** dominio del sitio, tipo de documento tributario (boleta de honorarios o de empresa), medio de pago, cupos del beneficio de lanzamiento, publicación de los nombres del equipo.

## Brand Commitments

- Nombre: Bío Digital.
- Presentación: startup de un grupo de estudiantes de la Universidad de Concepción (Ingeniería Civil Industrial). Se menciona la universidad en texto; **no se usa su logo** sin autorización.
- Voz: cercana, directa, sin tecnicismos, tuteando al dueño del negocio.
- Estilo visual **definido** (el sitio oficial, `web/propuesta/fuentes/opcion-8.mjs`): oscuro y tecnológico, con confianza y energía. Las otras opciones de diseño que se exploraron en septiembre se eliminaron el 27-oct-2026; si un cliente pide otro estilo, se busca una referencia nueva (21st.dev u otra).

## Evidence on Hand

- No hay clientes, reseñas, casos de estudio, fotos del equipo ni fotos de negocios. **No inventar ninguno.** Mientras no existan, un bloque de "beneficio de lanzamiento" (doble soporte a los primeros 5 clientes a cambio de publicar su caso) ocupa el lugar de la prueba social.
- Material de ejemplo, como un diagnóstico ilustrativo, se permite solo rotulado como ejemplo.
- Textos y precios del sitio: `web/propuesta/fuentes/comun.mjs`. Plan y cifras originales del proyecto en `PRD.md` (los paquetes Base, Estándar y Premium ya no se venden: manda el catálogo del sitio).

## Product Principles

1. El cliente es dueño de todo lo que se entrega.
2. Mostrar antes de vender: el diagnóstico gratis demuestra el trabajo.
3. Precios y plazos claros desde el primer contacto; nada de cobros mensuales escondidos.
4. Honestidad sobre lo que no se controla: nadie garantiza el primer lugar en Google.
5. Pensado para el celular de un dueño de negocio ocupado.

## Accessibility & Inclusion

WCAG 2.2 AA: contraste, navegación con teclado, foco visible. Respeta `prefers-reduced-motion` y `prefers-reduced-transparency`. Debe funcionar bien en celulares Android de gama media con datos móviles.
