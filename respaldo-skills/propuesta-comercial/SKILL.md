---
name: propuesta-comercial
description: Arma la propuesta comercial de Bío Digital para un negocio a partir de su Instagram y su ficha de Google Maps, una página A4 en PDF, más el correo y el WhatsApp cortos para mandarla. Úsala cuando pidan "hazle una propuesta a <negocio>", "propuesta para este Instagram", "cotización para <local>", o peguen el link o capturas del Instagram de un negocio.
---

# Propuesta comercial desde un Instagram

**Responder siempre en español, tuteando, sin tecnicismos.** Este archivo tiene todo lo necesario: no hace falta
haber visto cómo se hicieron las anteriores. Si puedes leer la carpeta, mira igual los dos ejemplos terminados:

| Ejemplo | Qué muestra |
|---|---|
| `propuestas/kairos-cafe/` (cafetería) | 3 piezas que suman **menos** que el pack: «el pack por $7.020 más» |
| `propuestas/zoul-barber/` (barbería) | 2 piezas que suman **más** que el pack: «el pack cuesta $4.990 menos» |

Cada uno tiene `datos.json` (lo que se escribe), `propuesta.pdf` (lo que se manda) y `mensajes.md` (correo, WhatsApp y fuentes).

## Qué es y qué no es
- **Una sola página A4**: qué vimos del negocio, qué pieza resuelve cada cosa, cuánto cuesta y cómo seguimos.
- **No lleva forma de pago, anticipo ni condiciones** (decisión del 27-oct-2026). Eso se conversa después.
- **Los precios no se escriben a mano**: `propuestas/generar.mjs` los toma de `web/propuesta/fuentes/comun.mjs`,
  el mismo archivo del sitio. Si el equipo cambia un precio, se vuelve a generar y queda al día.
- **La IA no envía nada.** Deja el PDF y los mensajes listos; los manda una persona del equipo.

## 0. Antes de empezar
- `git pull` para tener precios y plantilla al día.
- Necesitas **Node** (nodejs.org) y **Chrome o Edge** instalado: el navegador es el que crea el PDF.
- **La propuesta siempre sale y se manda en PDF.** El script no deja otro formato: en la carpeta del cliente queda
  solo `propuesta.pdf`. No se manda un Word, un Google Doc ni capturas.

## 1. Juntar la evidencia
Todo lo que diga la propuesta tiene que poder comprobarse. **Anota la fuente de cada dato** (link del post o de la
ficha): va en `mensajes.md`.

| Qué mirar | Dónde | Qué buscar |
|---|---|---|
| Bio y links del perfil | `instagram.com/<cuenta>/` | ¿Tiene web? ¿La carta es un PDF, Drive, Linktree, una foto? ¿«Reservas por DM» o un número? Dirección, horario, teléfono |
| Seguidores | Perfil | Una cifra para la introducción |
| Historias destacadas | Perfil | Carta, precios, servicios, promociones |
| Las 6 a 12 últimas publicaciones, con su texto | Feed y reels | Cómo reservan, qué promociones hacen, si ya tienen buenas fotos y videos, si cambiaron de dirección |
| Nota, número de reseñas, si tiene sitio web, teléfono | Ficha de Google Maps (buscar el nombre en maps.google.com) | Cifras para la introducción y la fila de página web |

**Cómo leer Instagram:** casi ninguna IA puede abrirlo sin iniciar sesión. Si la tuya no puede, pídele a la persona
**capturas de pantalla**: el perfil completo (bio y links), las destacadas que digan carta, menú, precios o reservas,
unas 6 publicaciones con el texto abierto y la ficha de Google Maps. **No inventes lo que no se ve en las capturas.**

**Compara el teléfono de Instagram con el de Maps.** Si no coinciden (en Zoul uno terminaba en 0225 y el otro en
0255), no va en la propuesta: va como posdata en el correo, como dato útil.

## 2. Elegir de 1 a 3 piezas
Cada pieza responde a algo que **viste**. Si no hay evidencia, no va.

| Si ves esto | Ofrece | `producto` | Precio (sitio, 27-oct) |
|---|---|---|---|
| Carta o lista de precios en PDF, Drive, una foto, las destacadas, o «precios por DM» | Menú digital | `interactive-menu` | desde $27.990 |
| «Reservas por DM», «agenda por WhatsApp», números para reservar, cupos que coordinan a mano | Sistema de reservas | `reservations` | desde $24.990 |
| Tarjeta de sellos de papel, «cliente frecuente», promociones para que vuelvan | Tarjeta de fidelización | `loyalty-card` | $9.990 |
| Sin web: Maps no tiene sitio y el link de la bio es WhatsApp, Linktree o nada | Página web | `web` | desde $49.990 |
| Pocas fotos de producto, o fotos oscuras o sin cuidar | Registro fotográfico | `photography` | $4.990 |
| Casi sin reels ni videos | Videos para redes | `social-video` | desde $9.990 |

El **pack completo** trae los seis productos: $79.990, o **$69.990 de lanzamiento para los primeros 5 clientes**.

- **No ofrezcas lo que ya hace bien.** Kairós y Zoul ya publican buenos reels: a ninguno se le ofrecieron videos.
- **`"pack": true` casi siempre.** Pon el pack como recomendado cuando las piezas sueltas suman cerca o más que
  $69.990. Si es una sola pieza barata (por ejemplo, solo fidelización), deja `"pack": false`.
  Antes de mandar, **confirma con el equipo que queda cupo de lanzamiento**: no hay registro automático.
- **Reservas va en su versión base** (agenda con horarios, confirmación automática, reservas del día en el
  teléfono). Cobrar por cupo, depósito, cancelación o elegir profesional es la versión completa, que se cotiza
  aparte: no la prometas.
- **Nunca ofrezcas ni prometas**: menú con pedidos y delivery, 3D o realidad aumentada, Wallet, cuotas, «tú mismo lo
  editas», agente de voz, posición en Google («aparecer primero», «que te encuentren en Google»), más ventas o
  clientes, ni plazos de respuesta.

## 3. Escribir `datos.json`
```sh
cp -r propuestas/_ejemplo propuestas/<negocio-en-minusculas-con-guiones>
```
Ejemplo completo (Zoul):
```json
{
  "negocio": "Zoulbarber Studio",
  "fecha": "2026-10-27",
  "titulo": "960 reseñas con nota 5,0 en Google.\n*Que agendar sea igual de bueno.*",
  "intro": "Revisamos tu Instagram (2.106 seguidores) y tu ficha de Google Maps (nota 5,0 con 960 reseñas). La reputación ya está; lo que proponemos es que reservar una hora y llegar al local sea igual de fácil.",
  "filas": [
    {
      "producto": "reservations",
      "hoy": "Las horas se agendan por teléfono o WhatsApp, en dos números, y las publicaciones cierran con «escríbenos para reservar».",
      "propuesta": "Que el cliente elija día y hora desde el celular, a cualquier hora, sin esperar respuesta, y tú veas la agenda del día en tu teléfono.",
      "ejemplo": "ejemplos/reservas/"
    },
    {
      "producto": "web",
      "hoy": "Tu ficha de Google no tiene sitio web, y cómo llegar (2.º piso, entrada por el estacionamiento) está repartido entre la bio y las publicaciones.",
      "propuesta": "Una página propia con tus servicios, cómo llegar paso a paso y el botón para reservar, enlazada desde tu ficha de Google.",
      "incluye": ["Botón de WhatsApp, mapa y horario", "Hasta 5 secciones, hecha a tu medida"],
      "ejemplo": "ejemplos/barberia/"
    }
  ],
  "pack": true
}
```

| Campo | Cómo escribirlo |
|---|---|
| `negocio` | Como lo escribe el negocio, con sus tildes |
| `fecha` | AAAA-MM-DD |
| `titulo` | Dos líneas separadas por `\n`. La primera, lo que el negocio **ya tiene** (con una cifra si se puede); la segunda, entre `*asteriscos*` (sale en azul), lo que le proponemos. Corto: cada línea cabe en el ancho de la hoja |
| `intro` | Qué revisamos, con un par de cifras que el dueño pueda comprobar, y en una frase qué proponemos |
| `filas[].producto` | Un id de la tabla del paso 2 |
| `filas[].hoy` | Lo que viste, concreto y sin juicio. «Tu carta es un PDF en Google Drive», no «tu carta está mal hecha». Máximo unas 25 palabras |
| `filas[].propuesta` | Qué cambia para su cliente, en una frase |
| `filas[].incluye` | Opcional: 2 cosas que recibe, sacadas de lo que dice el sitio. Si no se pone, salen las 2 primeras del sitio |
| `filas[].ejemplo` | Opcional: una demo de https://biodigital-bgw.pages.dev (ver tabla abajo) |
| `pack` | `true` o `false` (ver paso 2) |

**Demos que se pueden enlazar** (negocios ficticios del sitio):

| Ruta | Qué es |
|---|---|
| `ejemplos/reservas/` | Reservas en línea |
| `ejemplos/fidelizacion/` | Tarjeta de sellos (temática café) |
| `ejemplos/barberia/` | Página web de una barbería |
| `ejemplos/casa-dulce/` | Página web de una pastelería o cafetería |
| `ejemplos/estetica/` | Página web de un centro de estética |
| `ejemplos/dental/` | Página web de una clínica dental |
| `ejemplos/tecnico/` | Página web de un servicio técnico |
| `ejemplos/cabanas/` | Página web de cabañas |
| `ejemplos/estudio-contable/` | Página web de un estudio contable |
| `ejemplos/` | La galería completa |

**No enlaces `ejemplos/fogon-del-sur/`**: muestra pedidos y delivery, que no se ofrecen en la propuesta.

## 4. Generar y revisar
```sh
node propuestas/generar.mjs <negocio>
```
Abre `propuestas/<negocio>/propuesta.pdf` y revisa:
- [ ] Es **una sola página**. Si se pasa, acorta `hoy` y `propuesta` o quita una pieza.
- [ ] El título no queda cortado de forma rara.
- [ ] Cada «hoy» se puede comprobar en su Instagram o en Maps, y tiene su fuente en `mensajes.md`.
- [ ] El nombre del negocio está bien escrito.
- [ ] Nada de la lista «Nunca ofrezcas ni prometas» del paso 2.
- [ ] Los precios coinciden con https://biodigital-bgw.pages.dev.

## 5. Los mensajes: `propuestas/<negocio>/mensajes.md`
Cortos y **sin detalle**: el detalle está en el PDF, y el mensaje solo tiene que lograr que lo abran.

```markdown
# <Negocio> · mensajes para mandar la propuesta

Adjuntar `propuesta.pdf` en los dos. Enviar desde biodigitalici@gmail.com y el WhatsApp de Bío Digital.

## Correo

**Asunto:** Una propuesta para <Negocio>

Hola, ¿cómo estás?

Somos Bío Digital, un equipo de cinco estudiantes de Ingeniería Civil Industrial de la Universidad de
Concepción. Ayudamos a negocios del Gran Concepción con lo digital: <las 3 o 4 cosas más cercanas a su rubro>.
Pago único, sin mensualidades.

Revisamos el Instagram y la ficha de Google Maps de <Negocio> y armamos una propuesta de una página pensada para
ustedes. Te la dejo adjunta.

Si te hace sentido, coordinamos para pasar por el local cuando te acomode.

<Opcional, una línea: algo personal y cierto que viste (un aniversario, un local nuevo) o un dato útil
(teléfonos que no coinciden).>

Saludos,
[Nombre] · Bío Digital
WhatsApp +56 9 4694 1640 · biodigital-bgw.pages.dev

## WhatsApp

Hola, ¿cómo estás? Te escribo de Bío Digital, un equipo de estudiantes de la UdeC que ayuda a negocios del Gran
Concepción con <lo más cercano a su rubro>. Vimos el Instagram de <Negocio> y armamos una propuesta corta para
ustedes, te la dejo acá 👇

Si te tinca, coordinamos para pasar por el local.

## Fuentes de lo que dice la propuesta (revisado el <fecha>)
- <cada afirmación de «hoy» y cada cifra, con el link del post, del perfil o de la ficha de Maps>
- <lo que decidiste no ofrecer y por qué, en una línea>
```

## 6. Dejarla registrada
- Agrega una fila a la tabla «Propuestas hechas» de `propuestas/LEEME.md`.
- Si el negocio está en el Excel de prospectos de Google Maps, avísale a quien lo lleva para anotar el Estado.
- Sube los cambios:
  ```sh
  git add propuestas/<negocio> propuestas/LEEME.md
  git commit -m "Propuesta para <negocio>"
  git push
  ```

## Si algo falla
| Problema | Qué hacer |
|---|---|
| `Producto desconocido` | El `producto` tiene que ser uno de los 6 id del paso 2 |
| `No encontré Chrome ni Edge` | Instalar Google Chrome. Si ya está pero en otra ruta: `CHROME="<ruta>" node propuestas/generar.mjs <negocio>` |
| El PDF sale sin la letra Geist | Hace falta internet al generar (la fuente viene de Google Fonts) |
| Dos páginas | Textos más cortos o una pieza menos |
| `datos.json` no se lee | Revisar comas y comillas: el JSON no acepta una coma después del último elemento |
