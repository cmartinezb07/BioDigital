# Servicios vendibles — qué son, cómo se implementan, dificultad

| Servicio | Qué es | Cómo lo implementamos | Dificultad | Estructura de costo |
|---|---|---|---|---|
| Sitio web (landing / multi-página) | Página informativa con contacto, servicios/productos, ubicación | Constructor no-code (WordPress+Elementor, Wix, Framer o Carrd) + hosting + dominio | Baja-Media. Landing en horas; sitio de 3-5 secciones, 1-3 días | Único |
| Dominio .cl + correo corporativo | Web propia + email profesional | Registro en NIC Chile + correo vía Google Workspace o Zoho Mail | Baja | Único + renovación anual (pass-through al cliente) |
| Ficha Google Business Profile optimizada | Perfil de Maps/Búsqueda con horarios, fotos, categoría, descripción | Reclamar/crear ficha en Google Business Profile Manager, optimizar campos | Baja-Media. Verificación (postal/teléfono/video) puede tardar días-semanas — riesgo de cronograma | Único, sin costo de plataforma |
| Registro fotográfico profesional | Sesión de fotos del local/productos | Visita presencial + edición en Lightroom/Snapseed/Canva | Baja técnica, exige habilidad real del equipo | Único |
| Catálogo digital | Menú/catálogo en PDF, link-in-bio o sección del sitio | Canva, Linktree/Beacons, o sección estática del sitio | Baja | Único |
| Agente de WhatsApp (bot conversacional) | Responde preguntas frecuentes, horarios, toma pedidos/reservas; puede escalar a humano | (a) bot de menú por botones vía Manychat/Landbot — simple; (b) agente con IA vía n8n + WhatsApp Business API oficial + LLM — conversacional | Media (menú simple) a Alta (conversacional con IA): requiere aprobación de Meta, diseño de flujos, prompt engineering, monitoreo | Recurrente: costo por conversación de Meta + tokens del LLM + hosting de la automatización |
| Agente de voz (atención telefónica con IA) | Contesta/hace llamadas: agenda reservas, da horarios/ubicación | STT (Whisper) → LLM → TTS (ElevenLabs) vía Vapi/Retell/Synthflow, o Twilio Voice + n8n | Alta: latencia, interrupciones, fallback a humano, el más complejo de los evaluados | Recurrente: costo por minuto + LLM, independiente del volumen del cliente |
| (Opcional) Chatbot Instagram/Messenger | Misma lógica que WhatsApp vía Meta Messenger API | Mismo stack reutilizado | Media | Recurrente |
| (Opcional) Sistema de reservas online | Calendario de citas embebido (peluquería, taller, gimnasio) | Calendly/SimplyBook embebido, o flujo simple en n8n | Baja-Media | Único o recurrente bajo |
| (Opcional) Automatización de solicitud de reseñas | Mensaje automático post-compra pidiendo reseña en Google | Flujo simple en n8n o Manychat | Baja | Recurrente muy bajo |

## Decisiones que se derivan de esta tabla

**Dos modelos de negocio mezclados.** Sitio web, dominio, ficha Google y catálogo son entrega única (se construyen, se transfieren con acta, listo). Los agentes de WhatsApp y voz corren sobre APIs de pago por uso indefinido — hay que decidir quién paga esa cuenta después de transferir: el cliente con su propia cuenta, o el equipo con cobro mensual de mantención.

**El agente de voz probablemente no calza con el ICP de este proyecto.** Una peluquería o taller de barrio no tiene el volumen de llamadas que justifique el costo por minuto — el margen se lo come la plataforma antes de generar valor visible. Recomendación: exploratorio para más adelante, no ofrecer este semestre.

**El bot de WhatsApp sí tiene encaje, con una advertencia técnica real.** Usar librerías no oficiales (Baileys/whatsapp-web.js) viola los términos de servicio de Meta y puede terminar en el bloqueo del número del cliente. Si se ofrece, debe ser vía API oficial de Meta o plataforma que la use (Manychat, 360dialog) — nunca la vía no oficial.

## Tiering recomendado

| Nivel | Qué incluye | Riesgo de no llegar a tiempo |
|---|---|---|
| Núcleo (garantizado) | Sitio web + dominio/correo + Google Business + fotos + catálogo | Bajo — depende de habilidades que el equipo controla |
| Diferenciador IA (si se valida a tiempo) | Bot de WhatsApp con API oficial — menú simple primero, conversacional si alcanza | Medio-alto — depende de aprobación de Meta y curva de aprendizaje |
| Exploratorio (no vender este semestre) | Agente de voz, Messenger, reservas online | — |

No incluir el agente de WhatsApp en el paquete Base o Estándar por defecto: dejarlo como upsell del Premium, condicionado a que el equipo lo tenga funcionando y probado internamente antes de ofrecerlo a un cliente real.
