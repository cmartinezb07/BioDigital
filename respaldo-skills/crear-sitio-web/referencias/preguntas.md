# Banco de preguntas (Fase 0)

Pregunta en bloques de hasta 4 con AskUserQuestion. Pon la opción recomendada primero. No preguntes lo que ya se sabe por el proyecto (CLAUDE.md, memoria, PRODUCT.md): léelo antes.

## 1. Tipo y objetivo
- **Tipo de página**: landing de servicios (una página) · sitio de servicios multi-página · portafolio · catálogo/tienda · evento/lanzamiento · página de una app/SaaS.
- **Acción principal** (una sola): pedir cotización · escribir por WhatsApp · llamar · agendar · comprar · pedir diagnóstico/prueba gratis · suscribirse.
- **Público**: quién es, qué le preocupa, desde qué dispositivo entra (casi siempre celular).

## 2. Datos del negocio (lo que falte → `[PENDIENTE]`)
- Nombre del negocio · qué hace en una frase
- Servicios (uno por línea) y qué se entrega en cada uno
- A quién va dirigido · qué lo diferencia
- Ciudad/zona que atiende · dirección (si atiende público)
- Teléfono y WhatsApp · email de contacto · horario
- Tiempo de respuesta prometido
- Precios o "desde" · planes
- Dominio (ej. minegocio.cl)
- Logo, colores, tipografía (o "propón tú")
- Reseñas reales (texto + nombre + fuente) · casos (cliente, problema, solución, resultado)
- Redes sociales
- Palabras clave con las que quiere aparecer en Google
- Preguntas frecuentes reales de sus clientes
- Beneficio de lanzamiento (si no hay reseñas: ofrecer algo a cambio de publicar el caso)

## 3. Estética
- ¿Tienen **referencias**? Pide links (21st.dev, Lovable, Awwwards, Godly…) o capturas. Una referencia por opción.
- Si no: ofrece el catálogo (`esteticas.md`) con muestras.
- **Sensación** (multiselección): confianza y seriedad · energía y modernidad · cercanía y calidez · lujo/premium · técnico/innovador · sobrio/minimalista.
- **Tema por defecto**: oscuro · claro · según el sistema (con botón para cambiar siempre).
- **Restricciones**: colores obligatorios, sin fotos de banco, accesibilidad, etc.
- **Cuántas opciones** de maqueta (recomendado 3–5).

## 4. Animación
- **Nivel**: sobria (apariciones suaves) · media (+ microinteracciones, contadores, hover) · protagonista (efecto WebGL/canvas en el hero).
- ¿Permitimos **WebGL** (shaders)? Pesa más en celulares de gama baja; se pausa fuera de pantalla y respeta movimiento reducido.
- ¿Interacción con el mouse en el hero?

## 5. Técnica y publicación
- **Hosting**: Cloudflare Pages (recomendado, uso comercial gratis) · Netlify · Vercel (Hobby es no comercial; Pro es costo mensual).
- **Dominio**: ¿ya está comprado? ¿quién lo compra? (.cl en NIC Chile; precio aproximado, verificar)
- **Formulario**: ¿a qué correo llegan los mensajes? (Resend + Turnstile recomendado)
- **Analítica**: ID de GA4 · acceso a Search Console
- ¿Necesita **login/panel**? (si no, se omite la §8 de requisitos)
- ¿**Blog**? (solo si conviene para SEO y alguien va a escribir)
- Presupuesto para costos **recurrentes** (hosting, correo, dominio anual).

## 6. Mascota animada (opcional)
- **¿Quiere una mascota** que reaccione a lo que hace el visitante? Sí / no / solo en algunas páginas.
- Si dice sí, pregunta el resto con el bloque completo de `mascota.md` §1:
  - personajes (cuántos y qué son);
  - estilo de dibujo;
  - personalidad de cada uno;
  - nivel de animación (sutil, media o alta, con cuadro a cuadro);
  - reacciones deseadas;
  - quién pone las imágenes (el cliente las manda, se generan con permiso o se usa un SVG temporal);
  - ubicación.
