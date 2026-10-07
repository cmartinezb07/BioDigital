# Agente de voz

**Estado:** en stand by desde el 2026-10-06.
**Por qué:** Se evaluó en septiembre de 2026 y se descartó para este semestre: no calza con el cliente objetivo.

## Qué es
Contesta o hace llamadas con una voz artificial: agenda reservas, da horarios y ubicación.

## Cómo se implementaría
Voz a texto, modelo de lenguaje y texto a voz, con Vapi, Retell o Synthflow, o con Twilio más n8n.

## Dificultad y costo
Alta, la más compleja de todas las evaluadas: latencia, interrupciones y paso a una persona. **Recurrente por minuto**, sin importar el volumen del cliente.

## Qué hay que resolver antes de retomarlo
Un cliente con volumen real de llamadas. Una peluquería de barrio no lo justifica: el costo por minuto se come el margen antes de que se note el beneficio.
