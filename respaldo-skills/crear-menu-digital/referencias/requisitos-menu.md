# Requisitos de crear-sitio-web aplicados al menú digital

`crear-sitio-web/referencias/requisitos.md` describe un sitio completo de varias páginas. El menú es una carta de una sola pantalla larga. Esta tabla dice qué se **hereda** (se cumple igual), qué se **adapta** (se cumple de otra forma) y qué **no aplica** (se dice y no se implementa). Numeración = la de `requisitos.md`.

## §2 Tecnología y publicación
| Requisito | En el menú |
|---|---|
| HTML real, no SPA | **Hereda.** HTML estático generado: el contenido está en el código fuente. Se usa generador propio (no Astro): una sola página no justifica un framework. |
| Cloudflare Pages, HTTPS, dominio propio | **Hereda.** No se entrega ni se imprime el QR con una dirección `pages.dev`. |
| Producción limpia (sin source maps, sin errores, mínimo JS, imágenes optimizadas) | **Hereda.** Sin source maps; el visor 3D se carga solo al abrir un plato; fotos WebP con `width`/`height` y carga diferida. |
| Credenciales en variables de entorno | **No aplica:** el menú no tiene secretos. |

## §3–§4 Páginas y estructura de contenido
| Requisito | En el menú |
|---|---|
| Páginas de servicios, casos, nosotros, contacto, blog | **No aplica.** Es una carta. Se advierte el costo en SEO (una sola página) y se compensa con datos estructurados `Restaurant` + `Menu`. |
| `/privacidad`, 404 personalizada | **Hereda.** El generador crea `privacidad.html` y `404.html`. |
| `/gracias` | **No aplica:** no hay formulario. |
| H1 único distinto del `<title>`, jerarquía H2 → H3 | **Hereda.** H1 = nombre del local; `<title>` = "Nombre · Carta y precios"; categorías en H2 y platos en H3. |
| Migas de pan, TL;DR, FAQ, reseñas, casos | **No aplica** a una carta. Reseñas: jamás inventadas. |
| CTA visible y promesa de respuesta | **Adapta.** Botones "Escribir por WhatsApp" y "Compartir carta" arriba; "Pedir por WhatsApp" fijo si el cliente lo pide. |

## §5 SEO técnico
| Requisito | En el menú |
|---|---|
| `title` y meta description únicos, `lang`, canonical, OG y Twitter Card | **Hereda.** Generados desde `menu.json` (`url`, `descripcion`, `og.jpg`). Sin `url` el generador avisa. |
| JSON-LD LocalBusiness / BreadcrumbList / FAQ / Service | **Adapta.** `Restaurant` (o `tipo_schema`) con dirección, teléfono, horario y `hasMenu` → `MenuSection` → `MenuItem` con precio en CLP y dieta (solo etiquetas confirmadas). Sin datos inventados. |
| Imágenes con nombre descriptivo y `alt` | **Hereda.** Nombre de archivo = id del plato; `alt` = "Foto de <plato>" o el que ponga el cliente. |
| `sitemap.xml`, `robots.txt` (con crawlers de IA), `llms.txt`, favicon y manifest | **Hereda.** Se generan solos. Las demos llevan `noindex` y `Disallow: /`. |
| Lighthouse ≥ 90 en móvil | **Hereda.** Se mide con PageSpeed Insights sobre la dirección publicada (ver `verificacion.md`). |

## §6 Diseño y experiencia
| Requisito | En el menú |
|---|---|
| Responsive móvil primero, menú accesible | **Hereda.** Barra de categorías con desplazamiento horizontal y buscador. |
| Modo claro/oscuro que sigue al sistema, con botón y memoria | **Hereda con opción.** `tema.auto` = sigue al sistema, botón y memoria de la elección. Un estilo fijo (como "café y dorado") se respeta pero pierde esa adaptación: se avisa al cliente. |
| Animación de entrada y `prefers-reduced-motion` | **Hereda.** Aparición suave de platos; se desactiva con movimiento reducido. |
| Hover solo con mouse, foco visible | **Hereda.** |
| View Transitions, botón volver arriba | **No aplica:** una página. |
| CTA fijo en móvil | **Adapta:** botón "Pedir por WhatsApp" fijo (opcional). |
| Compartir (Web Share) y vibración leve | **Hereda.** Botón "Compartir carta"; vibración de 10 ms en botones principales. |
| Formulario con validación, toasts, autoguardado | **No aplica:** el menú no recoge datos. El formulario de gustos y forma es de la agencia, no del menú. |
| Accesibilidad WCAG 2.2 AA: contraste, teclado, textos ≥ 12 px, área táctil ≥ 44 px | **Hereda.** El generador calcula el contraste de cada estilo y avisa bajo 4,5:1; la verificación mide tamaños y áreas táctiles. Se agrega "saltar a la carta". |

## §7 Seguridad
| Requisito | En el menú |
|---|---|
| Validación en servidor, rate limit, honeypot/Turnstile, CSRF, CORS | **No aplica:** no hay formularios ni endpoints. |
| Cabeceras (CSP estricta, nosniff, Permissions-Policy, HSTS, Referrer-Policy, frame-ancestors) | **Hereda.** `_headers` generado: CSP con lista cerrada de servidores, `camera=(self)` solo para la realidad aumentada, `frame-ancestors 'none'`, HSTS, COOP. |
| SRI en scripts externos | **Hereda.** El visor 3D se carga con `integrity`; para producción se guarda en `vendor/` y deja de depender del CDN. Las tipografías de Google no admiten SRI: alternativa, alojarlas en el propio sitio. |
| Cookies seguras, webhooks, enlaces que expiran, correo (SPF/DKIM/DMARC) | **No aplica:** no hay cookies, webhooks ni correo. Para `@dominio` del cliente, ver la guía de dominio del sitio. |
| Sin secretos en el código | **Hereda.** |

## §8 Login o panel
**No aplica.** Se dice explícitamente al cliente: la carta no tiene cuentas; los cambios los hace Bío Digital.

## §9 Analítica y Search Console
- **Decisión (distinta a GA4 + banner):** el menú usa **Cloudflare Web Analytics** (sin cookies, no identifica personas, no requiere banner). Motivo: no hay formularios ni conversiones que medir más allá de visitas, y evita un banner molesto en una carta. Si el cliente exige eventos de conversión (clic en WhatsApp), se agrega GA4 **con** banner de consentimiento que permita rechazar.
- Search Console: dejar verificado el dominio y explicar al cliente cómo agregar el sitemap.

## §10–§12 Fases y más allá del encargo
- Fases: formulario → estilos → contenido y fotos → generar y verificar → publicar → entrega (ver `SKILL.md`).
- Rendimiento (LCP < 2,5 s, CLS < 0,1): `width`/`height` en todas las imágenes, `font-display: swap`, las primeras 3 imágenes con prioridad alta.
- **Legal chileno:** `privacidad.html` dice qué se guarda (nada, o conteo anónimo), servicios de terceros (Google Fonts y visor 3D reciben la IP) y cómo pedir borrado. Confirmar con el negocio el responsable (`[PENDIENTE]` visible hasta entonces). Verificar vigencia de la normativa en bcn.cl. Fotos de personas: autorización escrita.
- Formulario que no depende solo del correo: lo cumple el formulario de la agencia (llega al panel y copia por WhatsApp).
- Caída del sitio, transferencia al cliente, dispositivos reales, redirecciones 301, `npm audit`, contenido verificable, copias de seguridad, barrido de restos ("lorem", enlaces `#`): **se heredan**, ver `verificacion.md`.
- **Específico del menú:** etiquetas dietéticas y alérgenos solo los confirmados por el cliente; precios idénticos a la carta entregada; un plato agotado no muestra el botón de 3D.
