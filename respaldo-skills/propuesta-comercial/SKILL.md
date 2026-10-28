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

Cada uno tiene `datos.json` (lo único que se escribe) y lo que genera el script: `propuesta.pdf` (lo que se adjunta)
y `mensajes.md` (el correo y el WhatsApp para mandarla).

## Qué es y qué no es
- **Una sola página A4**: qué vimos del negocio, qué pieza resuelve cada cosa, cuánto cuesta y cómo seguimos.
- **No lleva forma de pago, anticipo ni condiciones** (decisión del 27-oct-2026). Eso se conversa después.
- **Los precios no se escriben a mano**: `propuestas/generar.mjs` los toma de `web/propuesta/fuentes/comun.mjs`,
  el mismo archivo del sitio. Si el equipo cambia un precio, se vuelve a generar y queda al día.
- **Por cada local salen dos cosas, con un solo comando:** el documento (`propuesta.pdf`) y el texto para mandarlo
  (`mensajes.md`, correo y WhatsApp). **El texto es genérico y lo escribe el script**, igual para todos los locales:
  solo cambia el nombre del negocio y menciona biodigitales.cl. No se le agregan comentarios personales
  (aniversarios, felicitaciones, posdatas): lo específico va solo en el PDF.
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
0255), anótalo en `fuentes` para que quien mande el WhatsApp use el correcto. No va en la propuesta ni en el mensaje.

## 2. Elegir de 1 a 3 piezas
Cada pieza responde a algo que **viste**. Si no hay evidencia, no va. Los precios no se escriben: salen del sitio
(biodigitales.cl, sección de precios, y `web/propuesta/fuentes/comun.mjs`). Míralos ahí antes de decidir.

| Si ves esto | Ofrece | `producto` |
|---|---|---|
| Carta o lista de precios en PDF, Drive, una foto, las destacadas, o «precios por DM» | Menú digital (carta en QR, sin pedidos) | `interactive-menu` |
| «Reservas por DM», «agenda por WhatsApp», números para reservar | Sistema de reservas (calendario con sus servicios y horarios; la solicitud le llega armada por WhatsApp y el dueño confirma) | `reservations` |
| Tarjeta de sellos de papel, «cliente frecuente», promociones para que vuelvan | Tarjeta de fidelización | `loyalty-card` |
| Sin web: Maps no tiene sitio y el link de la bio es WhatsApp, Linktree o nada | Página web | `web` |
| Pocas fotos de producto, o fotos oscuras o sin cuidar | Registro fotográfico | `photography` |
| Casi sin reels ni videos | Videos para redes | `social-video` |

**Versiones PRO** (llevan mensualidad: $20.000 al mes, una sola por cliente, y el primer mes no se paga). Ofrécelas
solo si lo que viste **de verdad** las necesita; si no, la versión simple:

| Si ves esto | Ofrece | `producto` |
|---|---|---|
| Restaurante que ya recibe pedidos para retirar o delivery por WhatsApp o DM, o que tiene muchos platos y cambia precios seguido | Menú digital PRO (carta que el dueño edita, pedidos en mesa, retiro y delivery, cocina y panel) | `interactive-menu-pro` |
| Alojamiento, tours, arriendo por hora o citas con depósito; o que se le cruzan las reservas | Sistema de reservas PRO (calendario en vivo, depósito y política de cancelación, el cliente modifica o cancela, panel) | `reservations-pro` |

**Cómo calcula los precios el generador:**
- Si el producto tiene precio de lanzamiento para los primeros 5 clientes, usa ese y muestra el normal tachado.
- `"pack": true` agrega al lado el pack recomendado, también a precio de lanzamiento: el **pack esencial** (los
  seis productos simples) o, si elegiste un producto PRO, el **Pack PRO**. La propuesta dice sola cuánto más o
  cuánto menos cuesta que las piezas sueltas.
- Si hay un PRO, la nota de abajo explica la mensualidad. Si no, dice «pago único, sin mensualidad».

Reglas:
- **No ofrezcas lo que ya hace bien.** Kairós y Zoul ya publican buenos reels: a ninguno se le ofrecieron videos.
- **`"pack": true` casi siempre**, salvo que sea una sola pieza barata (por ejemplo, solo fidelización).
  Antes de mandar, **confirma con el equipo que queda cupo de lanzamiento**: no hay registro automático.
- **No describas lo que el producto no hace.** El sistema de reservas simple no confirma solo, no muestra
  disponibilidad en vivo y no tiene panel: eso es el PRO. Usa las frases del sitio.
- **Nunca ofrezcas ni prometas**: 3D o realidad aumentada, Wallet, cuotas, anticipo o forma de pago, agente de voz,
  posición en Google («aparecer primero», «que te encuentren en Google»), más ventas o clientes, ni plazos de
  respuesta. «Tú mismo lo editas» solo vale para el Menú digital PRO.

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
  "pack": true,
  "fuentes": [
    "Reservas por teléfono o WhatsApp a dos números: bio de https://www.instagram.com/zoulbarberstudio/",
    "«Escríbenos para reservar»: https://www.instagram.com/p/DY0J3yWq_br/",
    "Nota 5,0 con 960 reseñas y sin sitio web: ficha https://www.google.com/maps/place/?q=place_id:ChIJQ4GCO2y1aZYR21gZPZKrO1w",
    "Ojo, no va en el mensaje: el teléfono de Maps termina en 0225 y el de Instagram en 0255",
    "No se ofrecieron videos: sus 12 últimas publicaciones ya son reels"
  ]
}
```

| Campo | Cómo escribirlo |
|---|---|
| `negocio` | Como lo escribe el negocio, con sus tildes |
| `fecha` | AAAA-MM-DD |
| `titulo` | Dos líneas separadas por `\n`. La primera, lo que el negocio **ya tiene** (con una cifra si se puede); la segunda, entre `*asteriscos*` (sale en azul), lo que le proponemos. Corto: cada línea cabe en el ancho de la hoja |
| `intro` | Qué revisamos, con un par de cifras que el dueño pueda comprobar, y en una frase qué proponemos |
| `filas[].producto` | Un id de las tablas del paso 2 |
| `filas[].hoy` | Lo que viste, concreto y sin juicio. «Tu carta es un PDF en Google Drive», no «tu carta está mal hecha». Máximo unas 25 palabras |
| `filas[].propuesta` | Qué cambia para su cliente, en una frase |
| `filas[].incluye` | Opcional: 2 cosas que recibe, sacadas de lo que dice el sitio. Si no se pone, salen las 2 primeras del sitio |
| `filas[].ejemplo` | Opcional: una demo de https://biodigitales.cl (ver tabla abajo) |
| `pack` | `true` o `false` (ver paso 2) |
| `fuentes` | De dónde salió cada afirmación de `hoy` y cada cifra (link del post, del perfil o de la ficha de Maps), lo que decidiste no ofrecer y por qué, y cualquier dato que deba saber quien mande el mensaje. No se envía: queda al final de `mensajes.md` |

**Demos que se pueden enlazar** (negocios ficticios del sitio). Cada una va **solo** con su producto:

| Ruta | Qué es | Va con |
|---|---|---|
| `ejemplos/fidelizacion/` | Tarjeta de sellos (temática café) | `loyalty-card` |
| `ejemplos/fogon-del-sur/` | Menú digital PRO: carta, pedidos y panel | `interactive-menu-pro` |
| `ejemplos/reservas/` | Sistema de reservas PRO: calendario en vivo y panel | `reservations-pro` |
| `ejemplos/barberia/` | Página web de una barbería | `web` |
| `ejemplos/casa-dulce/` | Página web de una pastelería o cafetería | `web` |
| `ejemplos/estetica/` | Página web de un centro de estética | `web` |
| `ejemplos/dental/` | Página web de una clínica dental | `web` |
| `ejemplos/tecnico/` | Página web de un servicio técnico | `web` |
| `ejemplos/cabanas/` | Página web de cabañas | `web` |
| `ejemplos/estudio-contable/` | Página web de un estudio contable | `web` |

El menú digital simple y el sistema de reservas simple **no tienen demo propia**: no les pongas `ejemplo`. Enlazar
la demo PRO a un producto simple promete cosas que no trae.

## 4. Generar y revisar
```sh
node propuestas/generar.mjs <negocio>
```
Abre `propuestas/<negocio>/propuesta.pdf` y revisa:
- [ ] Es **una sola página**. Si se pasa, acorta `hoy` y `propuesta` o quita una pieza.
- [ ] El título no queda cortado de forma rara.
- [ ] Cada «hoy» se puede comprobar en su Instagram o en Maps, y tiene su fuente en `fuentes`.
- [ ] El nombre del negocio está bien escrito.
- [ ] Nada de la lista «Nunca ofrezcas ni prometas» del paso 2.
- [ ] Los precios coinciden con https://biodigitales.cl.

## 5. Los mensajes
`node propuestas/generar.mjs <negocio>` escribe solo `propuestas/<negocio>/mensajes.md`, con:
- **Correo.** Asunto «Propuesta de Bío Digital para <Negocio>». Dice quiénes somos, qué hacemos, que va adjunta una
  propuesta de una página, que en biodigitales.cl se ven ejemplos, y ofrece pasar por el local.
- **WhatsApp.** Lo mismo en cuatro líneas, para mandar con el PDF adjunto.
- **Fuentes.** Lo que pusiste en `fuentes`, al final y marcado como «no se envía».

**No edites `mensajes.md` a mano ni le agregues frases sobre el local**: el texto es genérico a propósito
(decisión del 27-oct-2026) y se vuelve a escribir cada vez que se genera. Si hay que cambiar el texto para todos,
se cambia en `propuestas/generar.mjs`.

Quien manda pone su nombre en la firma, envía el correo desde biodigitalici@gmail.com y el WhatsApp desde el número
de Bío Digital, siempre con el PDF adjunto.

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
