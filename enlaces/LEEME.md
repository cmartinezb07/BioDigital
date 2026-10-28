# Enlaces del proyecto Bío Digital

Cada carpeta tiene accesos directos: doble clic y se abre la página.
Actualizado: 27-oct-2026 (se quitaron los accesos de las opciones de diseño viejas, la inspiración de diseño, Radar, la competencia, el login y la generación de imágenes; los números de carpeta se reordenaron).

**Estado:** ✅ usado · 🔜 por usar · ❌ descartado (con el motivo) · 💤 no este semestre

Los precios son aproximados: verificar siempre en la página oficial.

---

## 01 · Nuestras páginas

| Qué | Enlace | Estado |
|---|---|---|
| Sitio oficial de Bío Digital | https://biodigitales.cl | ✅ |
| Formulario para el cliente (página web) | https://biodigitales.cl/formulario.html | ✅ |
| Panel de Cloudflare (el sitio está en la cuenta `biodigitalici@gmail.com`) | https://dash.cloudflare.com | ✅ |

## 02 · GitHub

| Repositorio | Para qué sirve | Estado |
|---|---|---|
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Revisa el diseño y detecta lo que "parece hecho con IA" | ✅ |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | Reglas para que las animaciones se sientan bien | ✅ (4 de 13) |
| [paper-design/shaders](https://github.com/paper-design/shaders) | Efecto de metal líquido de la opción 3 | ✅ |
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | Formato del archivo DESIGN.md | 🔜 |
| [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) | Ejemplos de DESIGN.md de marcas | 🔜 solo como formato; copiarlos haría que el sitio se parezca a otra marca |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | Probar el sitio de forma automática | 🔜 fase final |
| [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) | Alternativa a Impeccable | ❌ ya usamos Impeccable; dos a la vez dan reglas contradictorias |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Catálogo de estilos, paletas y tipografías para diseñar (MIT) | ❌ no evaluado a fondo; hace lo mismo que Impeccable, mismo choque de reglas. Útil como catálogo de ideas |
| [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) | Convierte imágenes en 3D | ❌ muy pesado para celulares |
| [openai/whisper](https://github.com/openai/whisper) | Convierte voz en texto | 💤 solo para el agente de voz |

## 03 · Publicar y hosting

| Servicio | Para qué sirve | Estado |
|---|---|---|
| [Cloudflare Pages](https://pages.cloudflare.com) | Hosting gratis, uso comercial permitido | ✅ |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | Comando para subir el sitio a Cloudflare | ✅ |
| [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | Frena bots en el formulario sin CAPTCHA | 🔜 |
| [Astro](https://astro.build) | Con qué se construye el sitio final | 🔜 |
| [Node.js](https://nodejs.org) | Necesario para Astro y Wrangler | ✅ |
| [Resend](https://resend.com) | Envía al correo los mensajes del formulario | 🔜 |
| [NIC Chile](https://www.nic.cl) | Comprar el dominio .cl (~$10.000/año) | 🔜 antes del ~30-sep; `biodigital.cl` está tomado |
| [Netlify](https://www.netlify.com) | Hosting alternativo | ❌ no hace falta; Cloudflare cubre lo mismo |
| [Vercel](https://vercel.com) | Hosting alternativo | ❌ el plan gratis prohíbe uso comercial; el pagado es ~20 USD/mes (recurrente) |

## 04 · Google y medición

| Servicio | Para qué sirve | Estado |
|---|---|---|
| [Google Business Profile](https://business.google.com) | La ficha del negocio en Google y Maps (servicio principal) | 🔜 con cada cliente |
| [Google Search Console](https://search.google.com/search-console) | Que Google indexe el sitio y ver cómo lo encuentran | 🔜 al tener dominio |
| [Google Analytics (GA4)](https://analytics.google.com) | Cuántos visitan y qué hacen (solo con consentimiento de cookies) | 🔜 al tener dominio |
| [Google Tag Manager](https://tagmanager.google.com) | Administra en un solo lugar las etiquetas de medición (GA4, píxeles de anuncios) | 💤 con un sitio simple basta GA4 directo; sirve si más adelante se agregan anuncios de Meta o Google |
| [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/) | Cuenta visitas gratis y sin cookies, así que no necesita banner de consentimiento | 🔜 alternativa más simple a GA4 para nuestro sitio |
| [Bing Webmaster Tools](https://www.bing.com/webmasters) | El "Search Console" de Bing; también alimenta a ChatGPT y Copilot | 🔜 al tener dominio, toma 5 minutos |
| [Microsoft Clarity](https://clarity.microsoft.com) | Mapas de calor y grabaciones de cómo la gente usa la página (gratis) | 🔜 para ver si llegan al formulario; necesita consentimiento de cookies |
| [Google Maps](https://maps.google.com) | Revisar fichas de prospectos a mano (sin scraping) | ✅ |
| [Google Fonts](https://fonts.google.com) | Tipografías de las maquetas | ✅ |

## 05 · Verificar el sitio

| Herramienta | Para qué sirve | Estado |
|---|---|---|
| [PageSpeed Insights](https://pagespeed.web.dev) | Velocidad en celular (meta: 90+) | 🔜 |
| [Rich Results Test](https://search.google.com/test/rich-results) | Revisa los datos que lee Google | 🔜 |
| [Security Headers](https://securityheaders.com) | Revisa la seguridad del sitio | 🔜 |

## 06 · Herramientas de trabajo

| Herramienta | Para qué sirve | Estado |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Asistente con el que se construye todo | ✅ |
| [Impeccable](https://impeccable.style) | Documentación del revisor de diseño | ✅ |
| [Context7](https://context7.com) | Documentación al día de Astro, GSAP, etc. | ✅ |
| [Taste skill](https://tasteskill.dev) | Alternativa a Impeccable | ❌ mismo motivo que arriba |
| [Figma](https://www.figma.com) | Diseñar en pantalla antes de programar | ❌ el plan gratis da 6 usos al mes; el pagado es recurrente. Trabajamos directo en código |

## 07 · WhatsApp, voz y automatización

| Servicio | Para qué sirve | Estado |
|---|---|---|
| [WhatsApp Business](https://business.whatsapp.com) | Número del negocio para el botón del sitio | 🔜 antes de la Jornada 1 |
| [WhatsApp Cloud API (Meta)](https://developers.facebook.com/docs/whatsapp/cloud-api) | Bot oficial de WhatsApp | 💤 fase 2, solo tras 2 semanas de piloto; cobra por conversación (recurrente) |
| [Manychat](https://manychat.com) · [Landbot](https://landbot.io) | Bot de menú con botones, sin programar | 💤 fase 2 |
| [n8n](https://n8n.io) | Conectar servicios y automatizar (ej. pedir reseñas) | 💤 fase 2 |
| [Messenger API (Meta)](https://developers.facebook.com/docs/messenger-platform) | Bot de Instagram/Facebook | 💤 opcional |
| [Vapi](https://vapi.ai) · [Retell AI](https://www.retellai.com) · [Synthflow](https://synthflow.ai) · [Twilio](https://www.twilio.com) · [ElevenLabs](https://elevenlabs.io) | Agente de voz que contesta llamadas | ❌ cobran por minuto; un negocio de barrio no tiene llamadas suficientes para que valga la pena |
| Imperio Agéntico (sin enlace guardado) | Curso y herramientas de agentes | ❌ 59 USD/mes: en 3 meses costaría más que todo el presupuesto ($80.000) |

## 08 · Trámites y legal

| Sitio | Para qué sirve | Estado |
|---|---|---|
| [SII](https://www.sii.cl) | Inicio de actividades y boletas de honorarios | 🔜 antes del primer cobro |
| [INAPI](https://www.inapi.cl) | Revisar si la marca "BioDigital" se puede registrar | 🔜 |
| [Empresa en un Día](https://www.registrodeempresasysociedades.cl) | Crear una empresa | 💤 solo si el negocio sigue después del ramo |
| [Ley Chile](https://www.bcn.cl/leychile) | Leyes de datos personales 19.628 y 21.719 | 🔜 para la política de privacidad |

