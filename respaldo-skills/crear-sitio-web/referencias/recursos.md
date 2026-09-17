# Recursos: repositorios de GitHub y sitios web

Veredictos probados en un proyecto real (sep-2026). Antes de instalar algo, revisa su licencia y su versión actual; si hay un MCP de documentación (Context7), úsalo para la API.

## Repositorios de GitHub

| Repositorio | Para qué | Cuándo usarlo | Notas |
|---|---|---|---|
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Skill de diseño (Apache 2.0) con comandos `critique`, `audit`, `polish`, `harden` y el detector `detect` de patrones típicos de IA | **Recomendado** para criticar maquetas y hacer la revisión final | Pide un PRODUCT.md. Su detector marca texto con degradado, resplandores de color, íconos encajonados sobre títulos y bajo contraste. Si una referencia del cliente usa esos recursos, se dejan a propósito. **Sus propuestas de dirección no reemplazan las referencias del usuario.** Se ejecuta con `.claude/skills/impeccable/scripts/impeccable.cmd detect <archivo>` |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) (MIT) | Skills de animación: `review-animations`, `improve-animations`, `apple-design`, `emil-design-eng` | Para revisar o mejorar el movimiento | Instalar solo esas 4; el resto es para Swift, Expo o Sonner. Solo traen instrucciones. Sus estándares están resumidos en `animaciones.md` |
| [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) · tasteskill.dev (MIT) | Alternativa a Impeccable para decidir la dirección visual | Solo si **no** se usa Impeccable | Dos skills de dirección visual a la vez generan reglas contradictorias |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) (Apache 2.0) | CLI de Playwright para agentes, más liviana que el MCP | Para automatizar el checklist final y probar formularios | Mientras tanto basta el navegador integrado o Chrome sin ventana |
| [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) | Colección de DESIGN.md de marcas | Solo como **formato** para el DESIGN.md propio | No copiar el archivo de una marca: el sitio terminaría pareciéndose a ella |
| [paper-design/shaders](https://github.com/paper-design/shaders) (`@paper-design/shaders`) | Shaders listos en JS puro (ShaderMount): liquid metal, mesh gradient, voronoi, god rays, warp… | Para efectos WebGL sin React | Uniforms: color con `getShaderColorFromString`, tamaño con `ShaderFitOptions`; `u_image` necesita un pixel transparente si no hay imagen. Métodos útiles: `setSpeed(0)` para pausar y `dispose()` |
| img2threejs/img2threejs | Convierte imágenes en modelos 3D (three.js) | **Descartado** para sitios de servicios | Pesa demasiado en celulares |

## Librerías y bibliotecas web

| Recurso | Veredicto | Notas |
|---|---|---|
| [GSAP](https://gsap.com) | Solo si CSS no alcanza | Gratis para uso comercial con todos los plugins desde la versión 3.13; no requiere React. La licencia solo prohíbe usarlo en herramientas no-code que compitan con Webflow |
| [React Bits](https://reactbits.dev) | Solo como fuente de ideas | Requiere React, varios componentes arrastran three.js u ogl y su licencia es MIT + Commons Clause. Sus efectos se reconocen mucho como hechos con IA; si gusta uno, se recrea en CSS o GSAP |
| [Cult UI](https://cult-ui.com) | Descartado para sitios estáticos | Exige React + Tailwind + shadcn + Motion |
| [21st.dev](https://21st.dev) | **Muy útil** para referencias de componentes | La demo vive en un iframe `cdn.21st.dev/.../bundle.*.html`: se lee con `[...document.querySelectorAll('iframe')].map(f=>f.src)` y se captura a 1440 px. La pestaña Code muestra las dependencias; a veces el componente está bloqueado y hay que recrearlo. Perfiles útiles: @chowlol202 (Liquid Metal, Globe Hero, Grain Gradient), @dhileepkumargm (Crystal Shader, [Aether Flow Hero](https://21st.dev/@dhileepkumargm/components/aether-flow-hero)), @larsen66 (Hero ASCII), @waleedkibhen (SaaS Template) |
| [Lovable templates](https://lovable.dev/templates) | Plantillas completas como referencia | La vista previa en vivo es un iframe `*.lovable.app`, que se captura completo. Ejemplo: Paymark (`warm-structure-hub.lovable.app`). Muchos textos aparecen con animación y salen vacíos en capturas sin ventana |
| Figma MCP | Descartado salvo plan pagado | El plan Starter permite 6 llamadas al mes; el uso real exige un asiento pagado (costo **recurrente**). Trabajar directo en código |
| Context7 MCP | Recomendado | Documentación al día de Astro, GSAP, Resend, etc. |

## Inspiración (para que el cliente mande capturas)
- **Gratis:** [Godly](https://godly.website), [Land-book](https://land-book.com), [Awwwards](https://www.awwwards.com), [Lapa Ninja](https://www.lapa.ninja), [One Page Love](https://onepagelove.com), [Siteinspire](https://www.siteinspire.com), [Httpster](https://httpster.net), [Minimal Gallery](https://minimal.gallery), [21st.dev](https://21st.dev).
- **Con límites o pagados:** [Mobbin](https://mobbin.com) (freemium, interfaces de apps), [Refero](https://refero.design) (pagado).

## Servicios para publicar y operar

| Servicio | Uso | Notas |
|---|---|---|
| Cloudflare Pages | Hosting recomendado | Uso comercial gratis, con Turnstile y cabeceras de seguridad |
| Vercel | Alternativa de hosting | El plan Hobby es "non-commercial, personal use only"; Pro cuesta ~20 USD por usuario al mes (**recurrente**; verificar) |
| Netlify | Alternativa de hosting | Revisar los límites del plan gratis |
| Resend | Envío de correos del formulario | El remitente de prueba solo envía al dueño de la cuenta; hay que verificar el dominio (SPF, DKIM, DMARC) |
| Cloudflare Turnstile | Antibots sin CAPTCHA molesto | Va junto con un honeypot |
| NIC Chile (nic.cl) | Dominios .cl | Precio aproximado; verificar en nic.cl. Comprar antes de imprimir QR o material con la URL |
| Google Search Console / GA4 | Indexación y analítica | GA4 se carga solo con consentimiento |
| [Rich Results Test](https://search.google.com/test/rich-results), [securityheaders.com](https://securityheaders.com), PageSpeed Insights | Verificación del checklist | Guardar capturas como evidencia |
