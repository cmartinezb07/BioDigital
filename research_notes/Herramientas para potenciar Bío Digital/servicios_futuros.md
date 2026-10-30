# Servicios futuros de Bío Digital: herramientas, APIs, repos y MCP (estado a oct-2026)

Notas de investigación (30-10-2026). Convención: **[VERIFICADO]** = fuente primaria (Meta/Google/repo); **[3ª PARTE]** = blog/agregador; **[NO VERIFICADO]** = conocimiento previo o inferencia sin fuente consultada en esta sesión. Tipo de cambio supuesto para conversiones: **~950 CLP/USD [NO VERIFICADO, solo para orden de magnitud]**.

---

## 1. Bot de WhatsApp para agendar (Cloud API + Google Calendar): ¿camino más barato y conforme?

### Takeaway
El único camino conforme es la WhatsApp Business Platform (Cloud API directa de Meta, sin BSP intermedio) + un backend propio o n8n que escriba en Google Calendar. **Cambio crítico: desde el 01-10-2026 los mensajes de servicio y los utility dentro de la ventana de 24 h ya NO son gratis**; cada número tiene 1.000 mensajes de servicio gratis al mes y luego paga. Para una barbería/café con volumen bajo (<1.000 respuestas/mes por número) el costo Meta sigue siendo casi cero, pero hay que registrar medio de pago. Las librerías no oficiales (Baileys, whatsapp-web.js, Evolution API en modo Baileys) arriesgan baneo del número del cliente.

### Cited Findings
**Modelo de precios Meta (oficial)**
- Desde el 01-07-2025 Meta cobra por mensaje entregado (no por conversación); la tarifa depende de la categoría y del país del destinatario. Mensajes del usuario a la empresa no se cobran. Categorías de plantilla: Marketing, Utility, Authentication; no-plantilla (solo dentro de la ventana de 24 h): Service y "Meta Business Agent" (agregada 01-07-2026, cobrada por token a USD 2,00 por millón, ~4–5 centavos/mensaje) — [Meta, WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [VERIFICADO]
- **Servicio:** gratis desde 01-11-2024; **desde 01-10-2026 se cobra después de los primeros 1.000 mensajes de servicio por número de teléfono al mes** (no acumulables). Gobierno/ONG elegibles siguen gratis hasta 31-12-2027 — [Meta, pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [VERIFICADO]; confirmado por [agentdeals.dev](https://agentdeals.dev/whatsapp-business-api-pricing-2026) [3ª PARTE]
- **Utility dentro de la ventana de servicio:** gratis desde 01-07-2025, **cobrada desde 01-10-2026** (el webhook pasa de `free_customer_service` a `regular`) — [Meta, pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [VERIFICADO]
- Plazo 30-09-2026 para agregar medio de pago; sin él, los mensajes de servicio pueden dejar de entregarse tras los 1.000 gratis — [Meta, pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [VERIFICADO]; [agentdeals.dev](https://agentdeals.dev/whatsapp-business-api-pricing-2026)
- Ventana gratuita de "free entry point" (anuncios Click-to-WhatsApp): **7 días** (no 72 h) — [Meta, pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [VERIFICADO]
- **Facturación en CLP para Chile disponible desde 01-04-2026**; la moneda se elige al crear la cuenta de mensajería y no se cambia después. Chile (+56) es mercado propio; la página enlaza a CSV/PDF de tarifas en CLP pero no muestra los montos en el texto — [Meta, pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [VERIFICADO]
- Meta solo puede cambiar precios el 1 de ene/abr/jul/oct; próximo cambio posible 01-01-2027 — [agentdeals.dev](https://agentdeals.dev/whatsapp-business-api-pricing-2026) [3ª PARTE]

**Tarifas Chile (en conflicto, verificar en el rate card CSV de Meta)**
- USD 0,0889 marketing / USD 0,0200 utility / USD 0,0200 authentication por mensaje — [Sent.dm](https://docs.sent.dm/docs/guides/whatsapp-pricing); [ChatArchitect](https://support.chatarchitect.com/books/meta-whatsapp/page/pricing-on-the-whatsapp-business-platform-developer-documentation) [3ª PARTE]
- Contradice: USD ~0,0592 marketing / ~0,0127 utility / ~0,0127 authentication (artículo 02-06-2026) — [Chattigo](https://chattigo.com/blog/whatsapp-business-cuanto-cobra-por-mensaje-en-2026/) [3ª PARTE]
- Prensa chilena: tras los 1.000 gratis, cada mensaje cuesta "entre $15 y $22" (moneda no explícita; por contexto, CLP) desde 01-10-2026; responder a mano desde la app sigue siendo gratis — [T13, 02-10-2026](https://www.t13.cl/noticia/tendencias/whatsapp-cobrara-entre-15-22-por-mensaje-quienes-se-les-aplicara-medida-2-10-2026) [3ª PARTE]

**BSP / intermediarios**
- Twilio suma USD 0,005 por mensaje enviado o recibido sobre la tarifa Meta (10.000 respuestas → +USD 100) — [agentdeals.dev](https://agentdeals.dev/whatsapp-business-api-pricing-2026) [3ª PARTE]
- 360dialog, Wati: no consulté páginas de precio en esta sesión → ver Gaps.

**Frameworks open source**
- BuilderBot (repo `codigoencasa/builderbot`, de Leifer Méndez): ~3,0k estrellas, 955 forks, licencia MIT, Node.js, se declara "agnóstico al proveedor de WhatsApp"; la página no mostró fecha del último commit — [GitHub](https://github.com/codigoencasa/builderbot) [VERIFICADO parcial]
- Evolution API: ~9,4k estrellas (dato de un blog, 27-08-2026, no verificado en GitHub). Tiene dos conectores: Baileys (emula WhatsApp Web vía QR; contraviene términos de WhatsApp y arriesga baneo) y Cloud API oficial (conforme) — [pasqualepillitteri.it](https://pasqualepillitteri.it/en/news/12969/integrate-whatsapp-evolution-api-vs-cloud-api) [3ª PARTE]; [docs Evolution API (Mintlify)](https://mintlify.com/EvolutionAPI/evolution-api/whatsapp/baileys) indica riesgo de baneo con Baileys
- El mismo blog afirma que paquetes "anti-ban" han robado sesiones de WhatsApp y cita un 68% de pymes indias baneadas en 12 meses (cifra no corroborada) — [pasqualepillitteri.it](https://pasqualepillitteri.it/news/12968/integrare-whatsapp-evolution-api-cloud-api-meta) [3ª PARTE, dudoso]

**MCP de WhatsApp**
- No existe MCP oficial de Meta ni de Anthropic en los resultados. `nakulben/whatsapp-mcp`: usa Cloud API oficial (plantillas, envío), MIT, ~1 estrella (inmaduro). `lharries/whatsapp-mcp`: ~4,6k estrellas pero es un puente a la API web (QR, SQLite) → no oficial. `whatsapp-mcp-server` (PyPI) requiere cuenta GreenAPI — [claudemarketplaces](https://claudemarketplaces.com/mcp/nakulben/whatsapp-mcp); [PyPI](https://pypi.org/project/whatsapp-mcp-server/); [augmentcode](https://www.augmentcode.com/mcp/whatsapp-mcp) [3ª PARTE]

### Inferences
- **Costo Meta real para un cliente típico:** una barbería que agenda ~150 citas/mes con ~5 mensajes por conversación (~750 mensajes de servicio) queda bajo el tramo gratis de 1.000 → ~CLP 0. Los recordatorios (plantilla utility fuera de ventana) sí pagan: ~150 × CLP 15–22 ≈ **CLP 2.300–3.300/mes**. Con cobro de CLP 20.000/mes, el margen se mantiene, pero conviene **traspasar el costo Meta al cliente** o cobrarlo con un tope incluido.
- Camino más barato y conforme: **Cloud API directa (sin BSP) + BuilderBot con proveedor Meta o n8n self-hosted + Google Calendar API**. Evitar Twilio para volumen chico (recargo por mensaje). Hosting: el VPS del n8n (ver §7).
- **Cada cliente necesita su propio número y su propia WABA** con medio de pago (tarjeta del cliente, idealmente, para no financiar a Meta con el presupuesto de la agencia). Para operar WABAs de terceros a escala, la agencia termina necesitando ser Tech Provider/verificar su Business Manager [NO VERIFICADO en esta sesión].
- Un número registrado en la Cloud API deja de poder usarse en la app WhatsApp Business normal salvo con la función de "coexistencia" [NO VERIFICADO; revisar docs de Meta]. Es una objeción frecuente de dueños de negocio.
- WhatsApp Flows (formularios nativos) sirve para elegir servicio/fecha sin texto libre; no consulté su documentación en esta sesión.
- **No usar Baileys / whatsapp-web.js / Evolution-Baileys / GreenAPI con clientes pagados**: el baneo cae sobre el número del negocio (su canal principal de ventas). GreenAPI se basa en WhatsApp Web, también no oficial [NO VERIFICADO].

### Gaps
- Tarifa exacta de Chile en CLP por categoría (Meta publica CSV; no pude leerlo) y tarifa de "service" pasado el tramo gratis.
- Precios actuales de 360dialog, Wati, y si alguno cobra fee mensual fijo (antes 360dialog ~EUR 49/mes por número [NO VERIFICADO]).
- Fecha de último commit de BuilderBot y estado de su proveedor Meta; estrellas reales de Evolution API, Typebot, Chatwoot.
- Requisito exacto de verificación de negocio en Meta para enviar más de 250 conversaciones iniciadas por la empresa/día y plazos de verificación.

---

## 2. Chatbot Instagram / Messenger: requisitos y herramientas

### Takeaway
Para atender cuentas de clientes (no propias) con una app propia se necesita **Advanced Access + Business Verification + App Review** de Meta para `instagram_business_basic` e `instagram_business_manage_messages`. Para un equipo estudiantil, ManyChat (que ya pasó la revisión de Meta) es el camino rápido; construir app propia solo se justifica con varios clientes.

### Cited Findings
- Advanced Access se requiere si la app sirve cuentas profesionales que el desarrollador no posee/administra; exige App Review y Business Verification — [Meta, Instagram Platform overview](https://developers.facebook.com/docs/instagram-platform/overview) [VERIFICADO]
- Standard Access funciona para cuentas propias o agregadas al App Dashboard (con rol en la app) — [chat-sdk.dev](https://chat-sdk.dev/en/adapters/official/instagram) [3ª PARTE]
- Para solicitar Advanced Access a ciertos permisos hay que haber hecho al menos 1 llamada exitosa a la API, y entregar instrucciones de login/prueba a los revisores — [Meta, App Review for Instagram API](https://developers.facebook.com/docs/instagram-platform/app-review) [VERIFICADO]
- Ventana de mensajería estándar: 24 h desde el último mensaje del usuario; la etiqueta HUMAN_AGENT (7 días) no se permite para mensajes automatizados — [chat-sdk.dev](https://chat-sdk.dev/en/adapters/official/instagram) [3ª PARTE]
- ManyChat cambió planes el 02-03-2026 (Essential, Pro, Business, Advanced, por contactos). Fuentes en conflicto: plan Free de 25 contactos activos vs 1.000; Pro entre ~USD 15 y ~USD 29 (+ add-on IA USD 29); otra lista USD 17/39/99/199. WhatsApp es add-on y Meta cobra aparte — [eesel.ai](https://www.eesel.ai/es/blog/precios-manychat); [hyperleap.ai](https://hyperleap.ai/comparison/manychat-pricing); [layer3labs](https://www.layer3labs.io/guides/manychat-pricing) [3ª PARTE]; la página oficial manychat.com/pricing devolvió 403.

### Inferences
- Con cuentas de clientes, la vía "Standard Access" solo sirve si el cliente agrega a la agencia como tester/rol en la app — viable para 1–3 pilotos, no para escalar.
- ManyChat Pro por cliente (~USD 15–29 ≈ CLP 14.000–28.000/mes) **se come casi todo el cobro de CLP 20.000/mes** → solo calza si se cobra aparte o el cliente paga ManyChat directo.
- Alternativa open source: n8n con nodos HTTP a la Graph API, o Chatwoot (bandeja multicanal) — requieren igualmente la app aprobada [NO VERIFICADO en esta sesión].

### Gaps
- Tiempos reales de App Review y Business Verification en 2026 (no encontré cifra oficial).
- Precio vigente oficial de ManyChat por tramo de contactos.

---

## 3. Automatización de reseñas (Google)

### Takeaway
Responder reseñas por API exige acceso aprobado a la Business Profile API (perfil verificado y activo 60+ días, sitio web, formulario de solicitud). Pedir reseñas por QR/WhatsApp es legal **solo si se pide a todos por igual y sin incentivos**: Google prohíbe el "review gating" (filtrar a los satisfechos) y premiar reseñas.

### Cited Findings
- Requisitos de acceso: administrar un GBP **verificado y activo 60+ días** (propio o de un cliente), con sitio web en la ficha; solicitar en el formulario de contacto de la GBP API eligiendo "Application for Basic API Access" con un email que sea owner/manager de la ficha — [Google, prerequisites](https://developers.google.com/my-business/content/prereqs) [VERIFICADO]
- Estado: cuota 0 QPM = no aprobado; 300 QPM = aprobado (ver en Google Cloud Console). Google solo promete un email tras la revisión — [Google, prerequisites](https://developers.google.cn/my-business/content/prereqs?hl=en) [VERIFICADO]
- Plazo de revisión: "dentro de 14 días" según una guía; "días a algunas semanas" según otra — [unified.to](https://unified.to/blog/how_to_set_up_google_business_profile_api_access_and_get_oauth_2_credentials) [3ª PARTE, sin cifra oficial]
- Endpoint de respuesta: `PUT https://mybusiness.googleapis.com/v4/{name=accounts/*/locations/*/reviews/*}/reply` (`accounts.locations.reviews.updateReply`), crea o actualiza la respuesta, solo en ubicaciones verificadas; la v4 tiene calendario de deprecación para algunos métodos — [Google, updateReply](https://developers.google.cn/my-business/reference/rest/v4/accounts.locations.reviews/updateReply?hl=pt-br) [VERIFICADO]
- Google prohíbe incentivos (dinero, descuentos, regalos, puntos) por reseñas, sin importar el sentimiento, y prohíbe desalentar reseñas negativas o solicitar selectivamente positivas (gating); sanciones: eliminación de reseñas y restricciones del perfil — [BrightLocal](https://brightlocal.com/learn/review-platform-guidelines/); [SocialPilot](https://www.socialpilot.co/reviews/blogs/review-gating); [DAC Group](https://www.dacgroup.com/?p=159133) [3ª PARTE; la página oficial de contenido prohibido de Google no apareció en la búsqueda]
- Ejemplos existentes: repo `satheeshds/gbp-review-agent` y un MCP listado en glama.ai para reseñas GBP; plantilla n8n de respuesta a reseñas — [GitHub](https://github.com/satheeshds/gbp-review-agent); [glama.ai](https://glama.ai/mcp/servers/qev918cyo8); [n8n workflow 20966](https://n8n.io/workflows/20966) [no revisados en detalle]

### Inferences
- La agencia necesita **su propia ficha GBP verificada con 60+ días** (o usar la de un cliente) antes de pedir acceso → iniciar el trámite ya, porque bloquea los servicios 3 y 4.
- Flujo conforme y barato: QR en mesón + mensaje WhatsApp post-servicio (plantilla utility, ~CLP 15–22) con enlace directo a "escribir reseña" **para todos los clientes**; la encuesta interna de satisfacción puede existir, pero no puede decidir quién recibe el enlace a Google.
- Mientras no haya acceso API: respuestas redactadas con IA y publicadas a mano por el dueño (cero riesgo, cero costo).
- Birdeye/Podium: no consulté precios; son referencia de mercado de cientos de USD/mes [NO VERIFICADO].

### Gaps
- Página oficial actual de políticas de contenido prohibido de Google (texto exacto sobre gating).
- Si la Business Profile API cobra (entendido como gratuita [NO VERIFICADO]).
- Legalidad del gating bajo norma chilena de consumidor (SERNAC) — sin fuente.

---

## 4. Gestión de ficha Google Business Profile (servicio de listing)

### Takeaway
Los mismos requisitos de acceso de §3 aplican. Sin API, el servicio se presta igual como "administrador" de la ficha desde la interfaz web; la API solo ahorra tiempo cuando hay muchas fichas.

### Cited Findings
- El acceso API depende de la aprobación descrita en §3; las ubicaciones deben estar verificadas para operar respuestas — [Google, prerequisites](https://developers.google.com/my-business/content/prereqs); [Google, updateReply](https://developers.google.cn/my-business/reference/rest/v4/accounts.locations.reviews/updateReply?hl=pt-br) [VERIFICADO]
- Existe al menos un servidor MCP comunitario para reseñas GBP — [glama.ai](https://glama.ai/mcp/servers/qev918cyo8) [no evaluado]

### Inferences
- Automatizable con la API (según la familia de APIs de GBP, [NO VERIFICADO en esta sesión]): horarios, atributos, publicaciones (posts), fotos, respuesta a reseñas, métricas de rendimiento.
- Para 5–15 clientes, la gestión manual con acceso de "administrador" es suficiente; la API es optimización, no requisito.

### Gaps
- Lista oficial de endpoints vigentes (Business Information API, Posts en v4) y su calendario de deprecación.

---

## 5. Reportes mensuales de métricas

### Takeaway
No investigué con fuentes en esta sesión; todo lo siguiente es conocimiento previo **[NO VERIFICADO]**.

### Cited Findings
- (Sin fuentes consultadas en esta sesión.)

### Inferences
- [NO VERIFICADO] Cloudflare Web Analytics es gratis y sin cookies; Umami es open source (self-host gratis, cloud con tramo gratis); Plausible es de pago (~USD 9/mes) o self-host; GA4 Data API y Search Console API son gratuitas con cuota; la GBP Performance API requiere el acceso de §3.
- [NO VERIFICADO] Ruta barata: script Python (o n8n) que consulte Search Console + analítica + GBP, genere HTML con plantilla y lo convierta a PDF (WeasyPrint/Playwright) y lo envíe por correo/WhatsApp. Looker Studio es gratis pero frágil con conectores de terceros.

### Gaps
- Precios y límites actuales de Umami Cloud, Plausible, Cloudflare Web Analytics; cuotas de GA4 Data API y Search Console API; existencia de MCP oficiales para GA4/Search Console.

---

## 6. Agente de voz (prioridad baja)

### Takeaway
El costo todo incluido ronda **USD 0,07–0,30/min** (≈ CLP 65–285/min), más el número telefónico. Con clientes que pagan CLP 20.000/mes, un agente de voz solo cabe como servicio aparte; no como parte del PRO.

### Cited Findings
- Vapi: USD 0,05/min solo orquestación; modelos y telefonía aparte; una fuente estima ~USD 0,27/min reales — [morphllm](https://www.morphllm.com/best-ai-voice-agent-platforms); [speechify](https://speechify.ai/blog/best-voice-agent-platforms-2026) [3ª PARTE]
- Retell: estimador ~USD 0,115/min (infraestructura de voz USD 0,055/min; TTS propia USD 0,015 vs ElevenLabs USD 0,040); rango publicado USD 0,07–0,31/min; USD 0,10/min extra por llamadas sobre el límite de concurrencia — [getmacha](https://www.getmacha.com/blog/retell-ai-vs-elevenlabs); [techsy](https://techsy.io/en/blog/ai-voice-agent-pricing) [3ª PARTE]
- ElevenLabs Agents: ~USD 0,08–0,10/min, más plan mensual — [elevenlabs blog](https://elevenlabs.io/blog/retell-alternatives) [fuente interesada]
- Comparativa 10.000 min/mes (sept-2026): ~USD 954 ElevenLabs con números Twilio vs USD 1.144 Retell — [getmacha](https://www.getmacha.com/blog/retell-ai-vs-elevenlabs) [3ª PARTE]

### Inferences
- Un café con 100 llamadas/mes de 2 min = 200 min ≈ USD 20–60 ≈ CLP 19.000–57.000/mes: igual o mayor que lo que paga el cliente.

### Gaps
- Precio y disponibilidad de números chilenos (+56) en Twilio/Telnyx/Vapi, requisitos regulatorios (documentación de dirección local). OpenAI Realtime: no consultado.

---

## 7. Pegamento de automatización (n8n, Make, Zapier)

### Takeaway
n8n Community Edition self-hosted es gratis e ilimitada; el costo es el VPS (~USD 3–7/mes ≈ CLP 3.000–7.000). Es la opción que calza con el presupuesto de CLP 80.000.

### Cited Findings
- Community Edition self-hosted: gratis, workflows y ejecuciones ilimitados; costo = servidor (~USD 3–7/mes en VPS pequeño); sin SSO ni colaboración multiusuario avanzada — [sliplane](https://sliplane.io/blog/n8n-pricing); [toolradar](https://toolradar.com/blog/n8n-pricing-2026) [3ª PARTE]
- Cloud Starter: ~EUR 20/mes anual con 2.500 ejecuciones (otras fuentes USD 20–24); Pro ~USD 50–60; planes renombrados en abril 2026 y el plan superior subió de USD 800 a 960 el 27-05-2026 — [jetadmin](https://www.jetadmin.io/blog/n8n-pricing/); [costbench abril](https://www.costbench.com/changelog/n8n-plans-renamed-2026-04/); [costbench mayo](https://costbench.com/changelog/n8n-price-increase-2026-05/) [3ª PARTE, cifras en conflicto]

### Inferences
- Make y Zapier: tramos gratis demasiado chicos para producción multi-cliente [NO VERIFICADO en esta sesión].
- n8n tiene MCP (nodos MCP Server/Client y servidores MCP comunitarios para gestionar workflows desde Claude) [NO VERIFICADO en esta sesión].
- Riesgo: self-host = la agencia es responsable de backups, actualizaciones de seguridad y disponibilidad; con datos personales de clientes finales eso pesa en §8.

### Gaps
- Precio oficial vigente en n8n.io/pricing; condiciones de la licencia "Sustainable Use" para revender n8n como servicio a clientes (revisar: usar n8n internamente para clientes suele estar permitido, ofrecerlo como SaaS hospedado no [NO VERIFICADO]).

---

## 8. Marco legal Chile: Ley 19.628, Ley 21.719 y consentimiento para marketing por WhatsApp

### Takeaway
La Ley 21.719 (publicada 13-12-2024) **entra en vigencia el 01-12-2026** según su texto vigente, pero el Ejecutivo ingresó el 01-09-2026 un proyecto para postergarla al 01-12-2027, aún en tramitación a la fecha de las fuentes. La Agencia de Protección de Datos no tenía consejo designado (Senado rechazó la terna en mayo 2026). Hasta entonces rige la Ley 19.628.

### Cited Findings
- Publicada en Diario Oficial 13-12-2024; vigencia 01-12-2026 por disposiciones transitorias — [Cuatrecasas](https://www.cuatrecasas.com/es/latam/art/proyecto-que-modifica-ley-proteccion-datos-personales); [Diario Constitucional, 12-06-2026](https://www.diarioconstitucional.cl/2026/06/12/la-ley-21-719-entra-en-vigor-el-1-de-diciembre-y-expone-vacios-en-regulacion-de-pequenas-empresas/)
- Proyecto de postergación al 01-12-2027 ingresado al Senado el 01-09-2026; mientras no se apruebe, la fecha sigue siendo 01-12-2026 — [Cuatrecasas](https://www.cuatrecasas.com/es/latam/art/proyecto-que-modifica-ley-proteccion-datos-personales); [ecosistemastartup](https://ecosistemastartup.com/?p=104145)
- En mayo 2026 el Senado rechazó la terna del consejo de la Agencia; plazo legal vencido → sin regulador operativo — [Diario Constitucional, carta](https://www.diarioconstitucional.cl/cartas-al-director/una-ley-vigente-sin-fiscalizador-por-que-la-ausencia-de-la-agencia-no-protege-a-nadie/)
- La ley expone vacíos en la regulación aplicable a pequeñas empresas — [Diario Constitucional](https://www.diarioconstitucional.cl/2026/06/12/la-ley-21-719-entra-en-vigor-el-1-de-diciembre-y-expone-vacios-en-regulacion-de-pequenas-empresas/)

### Inferences
- [NO VERIFICADO en esta sesión] Bajo 21.719 la agencia sería **encargada de tratamiento** (procesa datos por cuenta del negocio-cliente, que es el responsable) → necesita contrato/cláusula de encargo, medidas de seguridad y aviso de privacidad en cada bot/formulario.
- Meta exige opt-in del usuario antes de enviar plantillas iniciadas por la empresa (política de WhatsApp Business) [NO VERIFICADO en esta sesión]; además la Ley 19.496 (consumidor) regula comunicaciones promocionales con opción de desuscripción [NO VERIFICADO]. Recomendación práctica: casilla de consentimiento separada para marketing en el formulario de reserva, registro de fecha/hora del consentimiento y palabra "BAJA" para salir.

### Gaps
- Estado del proyecto de postergación al 30-10-2026 (verificar en senado.cl / bcn.cl).
- Texto exacto de la política de opt-in de WhatsApp y de las normas chilenas sobre publicidad por mensajería.

---

## Resumen transversal: verificaciones y presupuesto

| Servicio | Verificación/aprobación | Plazo conocido | Costo fijo mínimo |
|---|---|---|---|
| Bot WhatsApp (Cloud API) | WABA + número + medio de pago por cliente; verificación de negocio para escalar | Sin cifra oficial | ~CLP 0 + variable Meta; VPS compartido |
| IG/Messenger app propia | Business Verification + App Review (Advanced Access) | Sin cifra oficial | CLP 0 (app) / ManyChat ~USD 15–29 por cliente |
| Reseñas / GBP API | Ficha verificada 60+ días + solicitud "Basic API Access" | 14 días (3ª parte) | CLP 0 [API gratis, NO VERIFICADO] |
| Reportes | Ninguna (GA4/GSC con OAuth) | — | CLP 0 [NO VERIFICADO] |
| Voz | Número telefónico | — | USD 0,07–0,30/min |
| n8n self-host | Ninguna | — | ~USD 3–7/mes |

- Con CLP 80.000 de partida: VPS n8n ~CLP 5.000/mes + dominio ya existente; todo lo demás es variable y debiera cobrarse al cliente o pagarlo él (tarjeta en su WABA, su ManyChat).
- Riesgo principal operativo: baneo de números con librerías no oficiales; riesgo principal regulatorio: 21.719 (fecha incierta, 01-12-2026 vs 01-12-2027).
