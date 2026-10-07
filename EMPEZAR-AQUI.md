# Empezar aquí — para trabajar este proyecto con una IA

Esta carpeta es el proyecto **Bío Digital** (ramo Dirección y Control de Proyectos). Todo lo decidido está escrito:
no hace falta preguntarle a nadie para ponerse al día.

Si vas a trabajar con Claude, ChatGPT u otra IA, **copia uno de los dos prompts de abajo** según si la herramienta
puede leer la carpeta o no.

---

## Antes de compartir la carpeta

Mándala completa **menos** `.claude/skills/` y `.claude/agents/` (son 17 MB de herramientas instaladas, no son del
proyecto). Deja `.claude/launch.json`, que sirve para levantar el sitio.

Así pesa unos 8 MB. No contiene datos de clientes ni contraseñas: se revisó el 2026-10-06.

---

## Prompt 1 — para una IA que puede leer la carpeta

*(Claude Code, Cursor, Copilot, Gemini CLI, o Claude/ChatGPT con la carpeta subida como proyecto)*

```
Vas a trabajar en el proyecto Bío Digital, una unidad de negocio del ramo Dirección y Control de Proyectos
que vende e implementa presencia digital a micro y pequeñas empresas del Gran Concepción (Chile).

ANTES DE RESPONDER NADA, lee en este orden:
1. CLAUDE.md — cómo se trabaja en este proyecto. Sus reglas mandan sobre tu comportamiento por defecto.
2. MEMORY.md — índice de todo lo decidido.
3. contexto.md — el encargo: equipo, meta, presupuesto, fechas.
4. memoria/estado-actual.md — en qué va todo hoy.
5. memoria/decisiones.md — bitácora: qué se decidió y por qué (es largo, lee al menos las 5 entradas más nuevas).
6. servicios/README.md — los 6 servicios que se venden.

Después lee solo lo que necesites para la tarea que te pida:
- PRD.md — especificación del servicio y de Radar, la herramienta interna de prospección.
- memoria/riesgos-criticos.md — los riesgos ya detectados, con cifras.
- memoria/conceptualizacion.md — problema, solución, cliente ideal, paquetes.
- memoria/servicios-vendibles.md — evaluación técnica de cada servicio.
- servicios-futuros/ — servicios en stand by, uno por carpeta.
- web/propuesta/ — las 8 maquetas del sitio. Se abren con un servidor local (ver más abajo).
- respaldo-skills/crear-sitio-web/ — el procedimiento completo para hacer sitios: preguntas, plantilla,
  requisitos de SEO y seguridad, y checklist de entrega.

CÓMO QUIERO QUE TRABAJES:
- Responde siempre en español, con frases cortas y sin jerga técnica innecesaria.
- Sé crítico, no complaciente. Cada objeción va anclada a una cifra, un hecho o una línea concreta del
  material. Si algo está bien, dilo en una línea y sigue.
- Prioriza por impacto: primero lo que invalida el plan, al final el detalle menor.
- No inventes nada: ni cifras, ni reseñas, ni plazos, ni precios de terceros. Si falta un dato, escribe
  [PENDIENTE: qué falta] y avísalo.
- Los precios de terceros (dominios, hosting, plataformas) se marcan como aproximados y se verifican en la fuente.
- Separa siempre costo único de costo recurrente. Es el error más fácil de cometer en este proyecto: el sitio web
  o las fotos se pagan una vez; un bot o una plataforma de fidelización cobran todos los meses, para siempre.
- Verifica la fecha real antes de dar por vigente cualquier fecha del cronograma.
- Cuando se tome una decisión, escríbela en memoria/decisiones.md con fecha, qué se decidió, por qué y qué queda
  pendiente. Si no queda escrito ahí, se pierde.

LO QUE NO DEBES HACER:
- No edites los HTML de web/propuesta/opcion-3 a opcion-8: se generan solos. Se editan sus fuentes en
  web/propuesta/fuentes/ y se regeneran con: node web/propuesta/fuentes/generar.mjs
  (maqueta-final.html y opcion-2-certificado.html sí están escritos a mano.)
- No borres archivos sin revisar antes quién los usa.
- No propongas el agente de voz como servicio de este semestre: ya se evaluó y no calza con el cliente objetivo.
- No asumas contexto de otros proyectos. Si falta información, pregunta.

PARA EMPEZAR:
Resume en 10 líneas: qué es el proyecto, en qué va, qué se vende, cuánto tiempo queda para la meta y cuáles
son los 3 riesgos más grandes hoy. Después dime qué información te falta para trabajar. No propongas nada
todavía.
```

---

## Prompt 2 — para ChatGPT o Claude web, sin acceso a la carpeta

Sube estos archivos al chat (son livianos, todos de texto):

`CLAUDE.md`, `MEMORY.md`, `contexto.md`, `PRD.md`, `memoria/estado-actual.md`, `memoria/decisiones.md`,
`memoria/conceptualizacion.md`, `memoria/riesgos-criticos.md`, `memoria/servicios-vendibles.md`,
`servicios/README.md` y las fichas de `servicios/` que te interesen.

No subas la carpeta `web/`: son archivos de código que no vas a poder ejecutar ahí.

```
Te adjunto los documentos del proyecto Bío Digital: una unidad de negocio del ramo Dirección y Control de
Proyectos que vende e implementa presencia digital a micro y pequeñas empresas del Gran Concepción (Chile).
Son 5 personas y la meta del semestre es cerrar, cobrar y transferir entre 3 y 5 clientes.

Léelos completos antes de responder. CLAUDE.md explica cómo se trabaja en este proyecto y sus reglas mandan
sobre tu comportamiento por defecto. MEMORY.md es el índice. memoria/decisiones.md es la bitácora: ahí está
qué se decidió y por qué.

Trabaja así:
- En español, frases cortas, sin jerga innecesaria.
- Crítico, no complaciente: cada objeción anclada a una cifra o a una línea concreta de los documentos.
- Primero lo que invalida el plan, al final el detalle menor.
- No inventes nada. Si falta un dato, escribe [PENDIENTE: qué falta].
- Los precios de terceros van marcados como aproximados y hay que verificarlos en la fuente.
- Separa siempre costo único de costo recurrente.
- Verifica la fecha de hoy antes de dar por vigente una fecha del cronograma.

Ten presente una limitación: no tienes la carpeta del proyecto, así que no puedes revisar el sitio web ni
ejecutar nada. Si una respuesta depende de ver el código o las maquetas, dilo en vez de suponer.

Para empezar: resume en 10 líneas qué es el proyecto, en qué va, qué se vende, cuánto tiempo queda para la
meta y los 3 riesgos más grandes hoy. Después dime qué te falta. No propongas nada todavía.
```

---

## Cómo ver el sitio en tu computador

Necesitas Python instalado. Desde la carpeta del proyecto:

```
python web/servir.py
```

Y abre `http://localhost:4321`. Ahí está la galería con las 8 maquetas.

Para regenerar las maquetas 3 a 8 después de cambiar textos:

```
node web/propuesta/fuentes/generar.mjs
```

El sitio publicado está en https://biodigital-propuesta.pages.dev

---

## Lo mínimo que hay que saber para no romper nada

| Carpeta | Qué es | ¿Se edita? |
|---|---|---|
| `memoria/` | Todo lo decidido, con fecha y justificación | Sí, agregando entradas nuevas |
| `servicios/` y `servicios-futuros/` | Una ficha por servicio | Sí |
| `web/propuesta/fuentes/` | Textos y estéticas que generan las maquetas | Sí |
| `web/propuesta/opcion-*.html` | Maquetas generadas | **No**, se regeneran |
| `enlaces/` | Accesos directos del equipo | No hace falta tocarla |
| `respaldo-skills/` | Copia de seguridad del procedimiento para hacer sitios | No |
| `PRD.md`, `contexto.md` | Especificación y encargo | Sí, con cuidado: son la referencia del ramo |
