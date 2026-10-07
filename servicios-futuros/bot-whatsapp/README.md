# Bot de WhatsApp

**Estado:** en stand by desde el 2026-10-06.
**Por qué:** Quedó como upsell condicionado del plan Premium y nunca se validó.

## Qué es
Responde preguntas frecuentes, horarios y toma pedidos o reservas por WhatsApp, con paso a una persona cuando hace falta.

## Cómo se implementaría
Con la API oficial de Meta o una plataforma que la use (Manychat, 360dialog). Primero un menú de botones; conversacional con IA solo si el equipo alcanza.

## Dificultad y costo
Media a alta. **Recurrente:** Meta cobra por conversación y el modelo de IA por uso.

## Qué hay que resolver antes de retomarlo
**Nunca usar librerías no oficiales** (Baileys, whatsapp-web.js): violan los términos de Meta y pueden terminar con el número del cliente bloqueado. Además, definir quién paga la cuenta después de transferir.
