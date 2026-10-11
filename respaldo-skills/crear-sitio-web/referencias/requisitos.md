# Requisitos del sitio final

Rol: desarrollador web senior, especialista en SEO y seguridad web. Objetivo: un sitio publicado en internet, listo para usarse.

> **Origen:** este archivo recoge el encargo completo del equipo (el prompt de "Proyecto: sitio web para
> [NOMBRE DEL NEGOCIO]", secciones 0 a 11) y le agrega lo aprendido construyendo. Nada del encargo quedó fuera:
> la §0 del encargo está en SKILL.md ("Reglas que no se negocian" y las fases), la §1 en `preguntas.md`, y las
> §2 a §11 en las secciones de abajo con la misma numeración. La **§12 es lo que el encargo no pedía** y conviene
> hacer igual.

## 2. Tecnología y publicación
- El framework debe generar HTML real, ya sea como sitio estático o en el servidor: **Astro** (recomendado) o Next.js con SSG. No se acepta una SPA pura con Vite + React: al ver el código fuente debe aparecer el contenido.
- Se publica en Cloudflare Pages, Netlify o Vercel, con **dominio propio y HTTPS**. No se entrega con una URL del tipo `.vercel.app`.
- La versión de producción debe quedar limpia:
  - sin source maps expuestos;
  - sin errores en la consola;
  - con el mínimo de JavaScript;
  - con imágenes optimizadas (WebP o AVIF, tamaños adaptables, carga diferida).
- Credenciales y API keys van siempre en variables de entorno:
  - `.env` va en `.gitignore`;
  - se crea un `.env.example` sin valores reales.

## 3. Páginas y arquitectura SEO (topic clusters)
**Páginas:**
- `/`: inicio.
- `/servicios`: página pilar.
  - `/servicios/[servicio]`: una página por servicio (los clusters).
- `/casos`: casos de estudio.
- `/nosotros`.
- `/contacto`: formulario, mapa e indicaciones para llegar.
- `/gracias`: página posterior al envío del formulario, con noindex.
- `/privacidad`.
- 404 personalizada, con enlaces útiles.
- `/blog`: opcional, solo si conviene para el SEO.

Una landing de una sola página también es válida si el cliente la pide, pero se debe advertir el costo en SEO.

**URL:**
- Cortas, en minúsculas y con guiones.
- Sin conectores ("para", "de", "el", "la", "en").
- Correcto: `/servicios/reparacion-aire-acondicionado`. Incorrecto: `/servicios-de-reparacion-para-aire-acondicionado`.

**Enlaces internos:**
- Cada servicio enlaza a su página pilar y a los servicios relacionados.
- La página pilar enlaza a todos sus servicios.
- Los casos y artículos enlazan al servicio que corresponde.

## 4. Estructura de contenido de CADA página
1. Migas de pan (breadcrumbs), salvo en el inicio.
2. Un solo H1, distinto del `<title>`.
3. Un primer párrafo que responda de inmediato lo que la persona buscó.
4. Un CTA justo después de ese párrafo, visible sin hacer scroll.
5. Un resumen TL;DR con 5 puntos.
6. Jerarquía real de títulos (H2 → H3), sin saltarse niveles.
7. Tablas o listas donde ayuden, con un máximo de 3 por página.
8. Enlaces internos a páginas relacionadas.
9. 5 preguntas frecuentes, con schema FAQPage. Desde 2023, Google muestra poco los resultados enriquecidos de FAQ, pero el schema igual ayuda a que se entienda la página.
10. Reseñas reales o un caso de estudio relacionado. Las reseñas que el propio negocio publica sobre sí mismo no dan estrellas en Google.
11. Un CTA final con la promesa de tiempo de respuesta.

## 5. SEO técnico
**En cada página:**
- `<title>` y meta description únicos.
- `lang` en `<html>` y canonical.
- Imagen Open Graph y Twitter Card.

**Datos estructurados:** JSON-LD de LocalBusiness (dirección, teléfono, horario, ubicación y reseñas reales), BreadcrumbList, FAQPage y Service.

**Imágenes:** nombres de archivo descriptivos (ej. `instalacion-paneles-solares.webp`) y `alt` en todas.

**Archivos del sitio:**
- `sitemap.xml` generado automáticamente.
- `robots.txt` que:
  - permita los buscadores y los crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended);
  - bloquee `/page/`;
  - incluya la URL del sitemap.
- `llms.txt` en la raíz, con un resumen del negocio y los enlaces clave.
- Favicon en ico, svg y apple-touch-icon, más el web manifest.

**Meta de rendimiento:** Lighthouse ≥ 90 en móvil, en todas las categorías.

## 6. Diseño y experiencia de usuario
La plantilla ya trae resuelto lo siguiente; se conserva al portar a Astro:
- Diseño responsive, pensado primero para móvil, con menú móvil accesible.
- Modo oscuro o claro: por defecto **sigue al sistema** (`prefers-color-scheme`), con botón para cambiarlo y transición de burbuja. La elección de la persona se recuerda y manda sobre el sistema. Si el cliente pide un tema fijo, se respeta y se avisa que pierde esa adaptación.
- Animación de entrada del hero y apariciones al hacer scroll, respetando `prefers-reduced-motion`.
- Microinteracciones y estados hover, focus y active. El hover se activa solo con mouse: `(hover: hover) and (pointer: fine)`.
- Transiciones entre páginas con la View Transitions API (`@view-transition { navigation: auto }`).
- Botón para volver arriba.
- CTA fijo en móvil para llamar o escribir por WhatsApp. Si no hay teléfono, va el correo.

Lo que se agrega en el sitio final:
- Skeleton o estado de carga donde el contenido tarde en aparecer.
- Botón para compartir, con la Web Share API y la opción de copiar el enlace como alternativa.
- Vibración leve al tocar los CTA en móviles compatibles (`navigator.vibrate(10)`).
- Formulario:
  - validación en vivo y autoguardado del borrador;
  - estados de carga, éxito y error;
  - notificaciones toast;
  - redirección a `/gracias`.
- Accesibilidad WCAG 2.2 AA:
  - buen contraste, navegación con teclado y foco visible;
  - ARIA donde corresponda;
  - textos de al menos 12 px.

## 7. Seguridad (sitio y formulario)
- Validar y limpiar todo en el servidor (evita inyección SQL y XSS). No basta con validar en el navegador.
- Rate limiting en el formulario y en todos los endpoints, con bloqueo progresivo por IP.
- Detección de bots sin un CAPTCHA molesto: campo honeypot más Cloudflare Turnstile.
- Tokens CSRF y validación del origen en cada envío.
- CORS limitado al dominio propio.
- Cabeceras de seguridad:
  - Content-Security-Policy estricta, con envío de reportes;
  - `X-Content-Type-Options: nosniff`;
  - `Permissions-Policy` restrictiva;
  - `Strict-Transport-Security`, `Referrer-Policy` y `frame-ancestors`.
- SRI en todo script o CSS externo. Si la maqueta carga librerías desde un CDN (p. ej. `@paper-design/shaders`), en el sitio final se instalan con npm y se empaquetan.
- Cookies con `HttpOnly`, `Secure` y `SameSite`.
- Verificar la firma de los webhooks.
- Los enlaces sensibles deben expirar.
- Correo:
  - SPF, DKIM y DMARC en el dominio;
  - en Resend, el remitente de prueba solo envía al dueño de la cuenta, así que hay que verificar el dominio.

## 8. Solo si el sitio necesita login o panel
Si no lo necesita, no se implementa y se avisa.
- La autenticación no se programa desde cero: se usa Supabase Auth, Clerk, Firebase Auth o Auth0.
- RLS activado en todas las tablas.
- Contraseñas siempre hasheadas.
- Límite de intentos de inicio de sesión y bloqueo temporal tras varios fallos.
- Mensaje de error genérico ("Email o contraseña incorrectos").
- Detección de contraseñas filtradas.
- Rotación de la sesión al iniciar sesión y detección de sesiones anómalas.
- Canary tokens y canary endpoints.
- Funciones tipo app:
  - onboarding y tooltips contextuales;
  - command palette (Ctrl/Cmd + K), atajos de teclado y búsqueda instantánea;
  - filtros persistentes, drag and drop y scroll infinito;
  - confirmación antes de acciones destructivas.

## 9. Analítica y Search Console
- GA4 cargado solo con consentimiento, mediante un banner de cookies que permita rechazar.
- Eventos de conversión: clic en llamar, clic en WhatsApp y envío del formulario.
- Search Console: dejar lista la verificación del dominio y explicar al cliente, paso a paso, cómo agregar el sitemap.

## 10. Fases
1. Preguntas y propuesta de estructura, textos y diseño (maquetas), para aprobación.
2. Construcción (§2–§6).
3. Seguridad (§7, y §8 si aplica).
4. Publicación con dominio, Analytics y Search Console (§9).
5. Verificación final.

## 12. Más allá del encargo (recomendado)

Esto no estaba en el encargo original y conviene hacerlo igual. Cada punto nació de un problema real.

**Rendimiento con metas medibles.** Lighthouse ≥ 90 no basta: medir también Core Web Vitals en red 4G simulada
(LCP bajo 2,5 s, INP bajo 200 ms, CLS bajo 0,1). Dar `width` y `height` a todas las imágenes para que el contenido
no salte, `font-display: swap` en las tipografías y precarga solo de la fuente principal.

**Legal chileno.** La política de privacidad tiene que decir qué datos se piden, para qué, cuánto se guardan y cómo
se pide el borrado (Ley 19.628 y la nueva ley de protección de datos personales: `verificar vigencia y obligaciones
en bcn.cl`). Si en las fotos aparecen personas, autorización de uso de imagen firmada. Si el sitio vende en línea,
además términos y condiciones y el derecho a retracto.

**El formulario no puede depender solo del correo.** Guardar cada envío en un segundo lugar (planilla, base o
webhook) y avisar en pantalla si el envío falla. Probar que el correo llega a la bandeja de entrada y no a spam,
desde una cuenta que no sea la del equipo.

**Qué pasa cuando algo se cae.** Monitoreo de caída del sitio, recordatorio de renovación del dominio y del correo,
y una lista de quién tiene cada acceso. Un sitio que se cae en silencio es peor que no tenerlo.

**Transferencia al cliente.** Todos los accesos a su nombre (dominio, hosting, analítica, correo, ficha), una
capacitación y un acta de entrega. Dejar por escrito qué puede cambiar solo sin romper nada y qué no.

**Pruebas en dispositivos reales,** no solo emulados: al menos un Android de gama baja y un iPhone. El emulador no
muestra lo que pesa de verdad una animación.

**Redirecciones 301** si alguna URL cambia después de publicar, para no perder lo que Google ya tenía indexado.

**Dependencias:** revisar vulnerabilidades conocidas antes de publicar (`npm audit`) y dejar las versiones fijadas.
Mientras menos librerías, menos superficie de ataque y menos peso.

**Contenido verificable.** Nada inventado: si no hay reseñas todavía, se ofrece un beneficio de lanzamiento a
cambio de la primera, en vez de fabricar prueba social. Una reseña falsa descubierta destruye más confianza que la
ausencia de reseñas.

**Copias de seguridad.** El código en Git con remoto, y una copia de los textos y las imágenes fuera del hosting.

**Antes de publicar, barrido de restos:** nada de "lorem", enlaces `#` que no van a ninguna parte, correos de
ejemplo, imágenes de relleno ni textos de prueba.

**Accesibilidad más allá del mínimo:** área táctil de al menos 44 × 44 px, no depender solo del color para
comunicar un estado, respetar `prefers-reduced-motion` también en videos y carruseles, y que el texto se pueda
ampliar al 200 % sin que se rompa el diseño.

## 11. Checklist final (con evidencia)
- [ ] Cada página tiene title y meta description únicos, un solo H1 distinto del title, canonical e imagen OG
- [ ] El código fuente de cada página muestra el contenido
- [ ] La 404 personalizada funciona
- [ ] robots.txt, sitemap.xml y llms.txt son accesibles
- [ ] Los datos estructurados pasan el Rich Results Test sin errores
- [ ] Todas las imágenes tienen alt
- [ ] No hay errores en la consola ni source maps públicos
- [ ] Lighthouse ≥ 90 en móvil
- [ ] Las cabeceras de seguridad están bien (securityheaders.com)
- [ ] El formulario valida en el servidor, tiene rate limit y los mensajes llegan al correo
- [ ] No hay credenciales en el código
- [ ] El sitio está en línea con dominio propio y HTTPS
- [ ] No quedan `[PENDIENTE]` sin avisar al cliente
- [ ] Core Web Vitals en verde en red 4G simulada (LCP, INP, CLS)
- [ ] No quedó contenido de prueba: ni "lorem", ni enlaces `#`, ni correos de ejemplo
- [ ] El formulario guarda una copia del envío además del correo, y el correo llega a bandeja de entrada
- [ ] La política de privacidad dice qué datos se guardan, para qué y cómo se piden el borrado
- [ ] Los accesos están a nombre del cliente y hay acta de entrega firmada
- [ ] Probado en un celular real, no solo en el emulador
