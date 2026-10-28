# Propuestas comerciales

Una página A4 **en PDF**, para mandar por correo o WhatsApp después del diagnóstico. Siempre se manda el PDF.
El mismo comando escribe `mensajes.md`: el correo y el WhatsApp para mandarla, genéricos (solo cambia el nombre
del negocio) y con biodigitales.cl. Dice qué vimos del negocio,
qué pieza resuelve cada cosa, cuánto cuesta y cómo seguimos. **No lleva forma de pago ni condiciones**: eso se
conversa después (decidido el 27-oct-2026).

## Hacerla con tu IA, desde un Instagram
**Primera vez:** entrégale [INSTALAR-CON-IA.md](INSTALAR-CON-IA.md) a tu IA y dile «sigue este archivo»: revisa lo que
falta, actualiza el proyecto, prueba el PDF e instala la skill.

El procedimiento completo está en `respaldo-skills/propuesta-comercial/SKILL.md`. Con una IA que lee la carpeta
(Claude Code, Cursor, Codex, Gemini CLI), pega esto y adjunta las capturas del Instagram si tu IA no puede abrirlo:

```
Lee respaldo-skills/propuesta-comercial/SKILL.md y síguelo al pie de la letra para hacer la propuesta
comercial de Bío Digital a este negocio: <link del Instagram>. Su ficha de Google Maps: <link, si lo tienes>.
Te adjunto capturas del perfil, las destacadas y las últimas publicaciones.
```
En Claude Code también se puede instalar como skill: copiar la carpeta `respaldo-skills/propuesta-comercial` a
`~/.claude/skills/` y pedir «hazle una propuesta a <negocio>».

## Hacer una nueva a mano
```sh
cp -r propuestas/_ejemplo propuestas/<negocio>      # p. ej. propuestas/kairos-cafe
# editar propuestas/<negocio>/datos.json
node propuestas/generar.mjs <negocio>               # deja propuesta.pdf y mensajes.md en esa carpeta
```
Necesita Node, Google Chrome o Edge (crean el PDF) e internet (carga la fuente Geist).

## Qué va en `datos.json`
| Campo | Qué es |
|---|---|
| `negocio`, `fecha` | Nombre y fecha (AAAA-MM-DD) |
| `titulo` | Dos líneas separadas por `\n`; lo que va entre `*asteriscos*` sale en azul |
| `intro` | Qué revisamos, con datos que el cliente pueda comprobar (seguidores, nota en Maps) |
| `filas` | De 1 a 3 piezas. `producto` es el id del sitio: `web`, `social-video`, `interactive-menu`, `photography`, `reservations`, `loyalty-card`, o los PRO `interactive-menu-pro` y `reservations-pro` (con mensualidad). `hoy` es lo que vimos; `propuesta`, qué cambia. `incluye` y `ejemplo` son opcionales (`ejemplo` es una ruta de biodigitales.cl) |
| `pack` | `true` agrega el pack como opción recomendada: el esencial, o el Pack PRO si hay un producto PRO. Usa precios de lanzamiento |
| `fuentes` | De dónde salió cada dato; queda al final de `mensajes.md`, marcado como «no se envía» |

Los precios, los nombres y lo que incluye cada producto **no se escriben aquí**: salen de
`web/propuesta/fuentes/comun.mjs`, el mismo archivo del sitio. Si cambia un precio, se vuelve a generar.

## Reglas
- Cada cosa de «hoy» tiene que poder comprobarse en su Instagram, su ficha de Maps o su web. Nada inventado.
- Tutear. Sin tecnicismos.
- No ofrecer lo que el equipo no aprobó: 3D, Wallet, cuotas, forma de pago. Los PRO solo si el negocio los necesita.
- Máximo 3 piezas: si no cabe en una página, sobra algo.

## Propuestas hechas
| Carpeta | Negocio | Fecha | Ofrecido |
|---|---|---|---|
| `kairos-cafe/` | Café Kairós, San Pedro de la Paz | 27-oct-2026 | Pack $69.990 o menú + reservas + fidelización desde $58.970 |
| `zoul-barber/` | Zoulbarber Studio, Concepción | 27-oct-2026 | Pack $69.990 o reservas + página web desde $64.980 |
