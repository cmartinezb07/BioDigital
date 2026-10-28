# Enlaces del proyecto Bío Digital

Cada carpeta tiene accesos directos: doble clic y se abre la página.
Actualizado: 27-oct-2026 (se quitaron los accesos a las maquetas y referencias de las opciones 2 a 7, que ya no existen).

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

## 07 · Bibliotecas e inspiración

| Sitio | Para qué sirve | Estado |
|---|---|---|
| [21st.dev](https://21st.dev) · [Lovable](https://lovable.dev/templates) | Componentes y plantillas de referencia | ✅ |
| [jsDelivr](https://www.jsdelivr.com) | Carga los shaders en las maquetas | ✅ (en el sitio final se instalan con npm) |
| [GSAP](https://gsap.com) | Animaciones avanzadas, gratis | 🔜 solo si CSS no alcanza |
| [React Bits](https://reactbits.dev) | Efectos animados | ❌ exige React, pesa en celular y se nota "hecho con IA"; solo ideas |
| [Cult UI](https://cult-ui.com) | Componentes | ❌ exige React + Tailwind + Next.js; no calza con un sitio estático |
| [easing.dev](https://easing.dev) · [easings.co](https://easings.co) · [emilkowal.ski](https://emilkowal.ski) | Curvas y criterio de animación | ✅ |
| Inspiración gratis: [Godly](https://godly.website) · [Land-book](https://land-book.com) · [Awwwards](https://www.awwwards.com) · [Lapa Ninja](https://www.lapa.ninja) · [One Page Love](https://onepagelove.com) · [Siteinspire](https://www.siteinspire.com) · [Httpster](https://httpster.net) · [Minimal Gallery](https://minimal.gallery) | Que el cliente elija estilos con capturas | 🔜 |
| [Mobbin](https://mobbin.com) · [Refero](https://refero.design) | Inspiración de apps | 💤 con límites o pagados |

## 08 · Herramientas de trabajo

| Herramienta | Para qué sirve | Estado |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Asistente con el que se construye todo | ✅ |
| [Impeccable](https://impeccable.style) | Documentación del revisor de diseño | ✅ |
| [Context7](https://context7.com) | Documentación al día de Astro, GSAP, etc. | ✅ |
| [Taste skill](https://tasteskill.dev) | Alternativa a Impeccable | ❌ mismo motivo que arriba |
| [Figma](https://www.figma.com) | Diseñar en pantalla antes de programar | ❌ el plan gratis da 6 usos al mes; el pagado es recurrente. Trabajamos directo en código |

## 09 · Radar (herramienta interna de prospectos)

| Herramienta | Para qué sirve | Estado |
|---|---|---|
| [Python](https://www.python.org) · [Streamlit](https://streamlit.io) | Lenguaje y pantallas de Radar | 🔜 |
| [SQLite](https://www.sqlite.org) · [pandas](https://pandas.pydata.org) | Guardar y ordenar los prospectos | 🔜 |
| [fpdf2](https://py-pdf.github.io/fpdf2/) | Crear los diagnósticos en PDF | 🔜 |
| [Plotly](https://plotly.com/python/) | Gráficos del embudo | 🔜 |
| [pytest](https://docs.pytest.org) · [Playwright](https://playwright.dev) | Pruebas automáticas | 🔜 |
| [WeasyPrint](https://weasyprint.org) | Otra forma de hacer PDF | ❌ suele fallar en Windows |

## 10 · Servicios para los clientes

| Servicio | Para qué sirve | Estado |
|---|---|---|
| [Canva](https://www.canva.com) | Catálogo y material gráfico (gratis) | 🔜 |
| [Zoho Mail](https://www.zoho.com/mail/) | Correo con dominio propio, gratis | 🔜 |
| [Google Workspace](https://workspace.google.com) | Correo con dominio propio, pagado | 💤 costo mensual recurrente; Zoho es gratis |
| [Lightroom](https://www.adobe.com/products/photoshop-lightroom.html) · Snapseed (app del celular) | Editar las fotos del cliente | 🔜 |
| [Linktree](https://linktr.ee) · [Beacons](https://beacons.ai) | Página de enlaces para Instagram | 🔜 si el cliente no tiene sitio |
| [WordPress](https://wordpress.org) · [Elementor](https://elementor.com) · [Wix](https://www.wix.com) · [Framer](https://www.framer.com) · [Carrd](https://carrd.co) | Crear sitios sin programar | ❌ elegimos Astro: más rápido, más seguro y sin pago mensual |
| [Calendly](https://calendly.com) · [SimplyBook](https://simplybook.me) | Reservas online (peluquerías, talleres) | 💤 opcional, no este semestre |

## 11 · WhatsApp, voz y automatización

| Servicio | Para qué sirve | Estado |
|---|---|---|
| [WhatsApp Business](https://business.whatsapp.com) | Número del negocio para el botón del sitio | 🔜 antes de la Jornada 1 |
| [WhatsApp Cloud API (Meta)](https://developers.facebook.com/docs/whatsapp/cloud-api) | Bot oficial de WhatsApp | 💤 fase 2, solo tras 2 semanas de piloto; cobra por conversación (recurrente) |
| [Manychat](https://manychat.com) · [Landbot](https://landbot.io) | Bot de menú con botones, sin programar | 💤 fase 2 |
| [n8n](https://n8n.io) | Conectar servicios y automatizar (ej. pedir reseñas) | 💤 fase 2 |
| [Messenger API (Meta)](https://developers.facebook.com/docs/messenger-platform) | Bot de Instagram/Facebook | 💤 opcional |
| [Vapi](https://vapi.ai) · [Retell AI](https://www.retellai.com) · [Synthflow](https://synthflow.ai) · [Twilio](https://www.twilio.com) · [ElevenLabs](https://elevenlabs.io) | Agente de voz que contesta llamadas | ❌ cobran por minuto; un negocio de barrio no tiene llamadas suficientes para que valga la pena |
| Imperio Agéntico (sin enlace guardado) | Curso y herramientas de agentes | ❌ 59 USD/mes: en 3 meses costaría más que todo el presupuesto ($80.000) |

## 12 · Trámites y legal

| Sitio | Para qué sirve | Estado |
|---|---|---|
| [SII](https://www.sii.cl) | Inicio de actividades y boletas de honorarios | 🔜 antes del primer cobro |
| [INAPI](https://www.inapi.cl) | Revisar si la marca "BioDigital" se puede registrar | 🔜 |
| [Empresa en un Día](https://www.registrodeempresasysociedades.cl) | Crear una empresa | 💤 solo si el negocio sigue después del ramo |
| [Ley Chile](https://www.bcn.cl/leychile) | Leyes de datos personales 19.628 y 21.719 | 🔜 para la política de privacidad |

## 13 · Solo si algún día un sitio necesita login

| Servicio | Estado |
|---|---|
| [Supabase Auth](https://supabase.com/auth) · [Clerk](https://clerk.com) · [Firebase Auth](https://firebase.google.com/products/auth) · [Auth0](https://auth0.com) | 💤 los sitios de este semestre no tienen login |

## 14 · Generar imágenes y video con IA

| Servicio | Para qué sirve | Estado |
|---|---|---|
| [Higgsfield](https://higgsfield.ai) | Crea imágenes, videos y voz a partir de texto | 💤 no evaluado; funciona con créditos pagados. Podría servir para redibujar las mascotas o hacer videos para redes |
| [Everygen (viewmax.io)](https://www.viewmax.io) | Crea videos, imágenes y locuciones desde Claude (conector MCP) | 💤 no evaluado; precio no publicado en esa página. Ya aparece conectado en esta sesión de Claude |
