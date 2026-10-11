# Mascota animada (módulo opcional)

Un personaje fijo en una esquina que cambia de cara, gira, salta y habla según lo que hace la persona.
Es **opcional**: primero se pregunta si el cliente la quiere. Si dice que no, se salta este módulo completo.

## Dos caminos

| | **A · Personaje dibujado en SVG** (recomendado) | **B · Personaje en imágenes** |
|---|---|---|
| Qué es | Un gato dibujado por partes que se anima solo a la tasa de la pantalla | Una hoja de dibujos recortada en 12 o más caras |
| Cuándo | Por defecto. Sirve para casi cualquier negocio: se le cambia la ropa, el tono y las frases | Cuando el cliente ya tiene su propia mascota, o quiere un personaje que no es un gato |
| Qué cuesta cambiarlo por cliente | Minutos: dos colores y las frases | Horas: conseguir o generar la hoja, recortarla y revisarla |
| Peso | ~70 KB de código, sin imágenes | ~16 KB por cara, 12 caras mínimo |
| Expresividad | 30 poses, 11 gestos, vista de frente y de perfil, ojos que siguen al mouse | Las caras que tenga la hoja |

Los dos usan el mismo motor (`mascota.js`) y la misma configuración (`window.MascotaConfig`). Se elige con `rig`.

## Piezas

| Archivo | Qué es | ¿Se cambia por cliente? |
|---|---|---|
| `mascota.js` | Motor: eventos, prioridades, control de comentarios, mouse, formularios | No |
| `mascota.css` | Estilos con variables `--m-*` para adaptarse a cada estética | No (se sobrescriben las variables en la página) |
| `gato.js` | El personaje dibujado en SVG y su animación | No, salvo que se dibuje otro personaje |
| `gato.css` | Colores del personaje, con `--g-c1` y `--g-c2` | **Sí**, dos variables |
| `mascota-gato.js` | Frases, secciones y selectores del camino A | **Sí**, es el archivo que se escribe por cliente |
| `mascota-personajes.js` | Lo mismo para el camino B, más la dirección de la mirada de cada imagen | **Sí** |
| `gato-lamina.html` | Lámina para ver las 30 poses y los 11 gestos | No (es herramienta de revisión) |
| `herramientas/recortar-hoja.py` | Convierte una hoja de dibujos en imágenes WebP transparentes (camino B) | Solo el JSON |

---

## 1. Preguntas (antes de dibujar nada)
Usa AskUserQuestion. Pon la opción recomendada primero.

1. **¿Quiere mascota?** Sí / No / Solo en algunas páginas. Si dice que no, termina aquí.
2. **Qué personaje:** el gato de la plantilla vestido con los colores de la marca (recomendado) · la mascota que ya
   tiene la marca · otro animal u objeto del rubro.
3. **Personalidad:** amable · sarcástica · tierna y dormilona · hiperactiva · formal ("usted"). Define además:
   - **Tratamiento:** tú o usted.
   - **Humor:** nada, suave o pícaro.
   - **Límites:** nunca se burla del cliente final ni de su rubro, y nunca promete algo que el negocio no ofrece.
4. **Nivel de reacción:** discreta (solo llegada, secciones y formulario) · media (recomendada: + scroll, mouse y
   estados) · habladora (+ comentarios sueltos mientras la persona lee).
5. **Reacciones propias del negocio:** ¿hay algo que deba comentar sí o sí? (un plan destacado, un beneficio, una
   fecha límite).
6. **Ubicación:** esquina inferior izquierda (por defecto) o derecha.

---

## 2. Camino A — el gato de la plantilla

### Qué se cambia por cliente, y cuánto cuesta

| Nivel | Qué se cambia | Dónde | Esfuerzo |
|---|---|---|---|
| 1 | **La ropa:** chaqueta, mochila, pantalón y cordones salen de dos colores | `.gato { --g-c1; --g-c2 }` en el CSS de la página | Minutos |
| 2 | **Las frases y el tono:** todo lo que dice, por evento | `mascota-gato.js` | 1 a 2 horas, y hay que revisarlas con el cliente |
| 3 | **Qué comenta y cuándo:** secciones, selectores de botones y precios, cuántos comentarios sueltos | `secciones`, `bases`, `selectores`, `ocioMax` | Minutos |
| 4 | **El nombre y el título de la pestaña** | `personajes.<nombre>` y `titulo` | Minutos |
| 5 | **Accesorios del dibujo:** lentes, mochila, logo del pecho | `gato.js`, funciones `frente()` y `perfil()` | Horas |
| 6 | **Otro animal entero** | Dibujar un `rig` nuevo con la misma API | Días. Conviene el camino B |

Por defecto `--g-c1` y `--g-c2` toman `--c1` y `--c2` de la página, así que **si la estética ya define esos dos
colores, el personaje se viste solo**.

### Qué trae el personaje
- **30 poses:** feliz, sarcástico, muy feliz, risa, guiño, afirmando, soberbio, lentes, pensativo, idea,
  sorprendido, confundido, enojado, triste, miedo, cansado, dormido, facepalm, aburrido, indiferente, negación,
  lengua, saluda, curioso, preocupado, burlón, orgulloso, mareado, y las dos de perfil (`mira-d`, `mira-i`).
- **11 gestos:** salta, celebra (con confeti), sacude, asiente, tiembla, saluda, baila, risa, estira, mareo, vuelta.
- **Dos vistas:** de frente y de perfil, con giro completo hacia cualquier lado.
- **Ojos que siguen al puntero**, con la cabeza acompañando un poco y el párpado subiendo al mirar hacia arriba.

Para verlas todas, abre `gato-lamina.html` con el servidor local. Tiene un botón por gesto y `?grande=pose1,pose2`
para revisar dos poses en tamaño grande.

### Cómo se integra
```html
<link rel="stylesheet" href="mascota.css">
<link rel="stylesheet" href="gato.css">
...
<script src="gato.js"></script>
<script src="mascota-gato.js"></script>
<script src="mascota.js"></script>
```
El orden importa: el dibujo, la configuración y al final el motor. En `mascota-gato.js` debe ir `rig: true`.

---

## 3. Camino B — personaje en imágenes

Se usa cuando el cliente trae su propia mascota. En la configuración **no** va `rig: true`, y se carga
`mascota-personajes.js` en vez de `mascota-gato.js`.

**Hojas:** fondo claro liso, contorno oscuro, un personaje por celda, mismo tamaño y misma ropa en todas,
y los rótulos **debajo de los pies**, sin tocar el dibujo.

**Set mínimo (12 caras):** feliz, negación, triste, enojado, sorprendido, soberbio, pensativo, afirmando, miedo,
guiño, cansado, muy feliz. Lo ideal: una hoja de 6 filas × 2 columnas.

**Dirección de la mirada:** anota hacia dónde mira cada dibujo (`'d'`, `'i'` o `'f'`). El motor voltea en espejo,
así que no hace falta dibujar los dos lados.

**Animación cuadro a cuadro** (nivel alto): una fila por animación, de 3 a 6 cuadros, con los pies en la misma
posición, y nombres `saluda-1`, `saluda-2`, …

**Plantilla de indicación para generar o encargar la hoja:**

> Hoja de personaje estilo cartoon de línea negra gruesa, fondo blanco liso, sin sombras de color. Personaje:
> [descripción, ropa, accesorio]. Grilla de 6 filas × 2 columnas, un personaje por celda, todos del mismo tamaño y
> de cuerpo entero, pies alineados. Expresiones en este orden: feliz, negación (girado mirando a otro lado), triste,
> enojado, sorprendido, soberbio (brazos cruzados), pensativo (mano en el mentón), afirmando (pulgar arriba), miedo,
> guiño, cansado, muy feliz (brazos arriba). Nombre de cada expresión escrito pequeño debajo de los pies, sin tocar
> el dibujo.

**Recorte:**
1. Pon las hojas en `mascotas/fuente/` y crea `recorte.json` a partir de `recorte.ejemplo.json`.
2. `python herramientas/recortar-hoja.py mascotas/fuente/recorte.json` (necesita pillow, numpy y scipy).
3. **Mira `control.png` y `lamina.png`:** que no se haya colado ningún rótulo, que no falten orejas ni colas, que el
   interior quede blanco y opaco, y que cada imagen pese unos 16 KB a 360×500 px.

**Derechos:** si la mascota va a ser la marca registrada del cliente, conviene redibujarla en vectores con derechos
claros. Nunca copiar personajes de terceros.

Si el cliente manda las imágenes por el chat y no quedan como archivo, se pueden extraer del registro de la sesión
(`~/.claude/projects/<proyecto>/<sesión>.jsonl`, bloques `image` en base64).

---

## 4. Frases y eventos

Cada evento es `[pose o lista de poses, [frases…], gesto]`.

| Grupo | Eventos |
|---|---|
| Llegada y recorrido | `llegada`, `bajar`, `subir`, `rapido`, `final`, `arriba` |
| Secciones | las claves que definas en `secciones` (p. ej. `servicios`, `planes`, `formulario`, `cierre`) |
| Mouse | `botón`, `pick`, `precio`, `pregunta`, `seleccion`, `copiar`, `achicar`, `mareo` |
| Formularios | `campo`, `sensible` (se da vuelta), `tipeo`, `malDato`, `incompleto`, `enviando`, `enviado`, `beneficioOk` |
| Estado | `cansado`, `despierta`, `irse`, `volver`, `oscuro`, `claro` |
| Toques | `toque`, `muchosToques` |
| Sistema | `loginOk`, `loginError`, `error`, `paleta` (vía `document.dispatchEvent(new CustomEvent('mascota', { detail: 'login-ok' }))`) |

**Parámetros:** `cansadoMs` (cuándo se duerme), `ocioMax` (tope de comentarios sueltos por visita),
`rapido` (umbral del aviso de scroll), `mareo` (pausa y tope de mareos), `titulo` (título de la pestaña al irse).

**Reglas para escribir las frases:**
- 2 o 3 variantes por evento importante: se eligen al azar sin repetir la anterior.
- Cortas, menos de 60 caracteres. `{s}` pone "Buenos días", "Buenas tardes" o "Buenas noches" según la hora.
- Diferencia real entre personalidades: al irse, una se ríe, otra se entristece, otra se ofende con elegancia.
- Nada falso: si dice "cupos limitados", debe ser cierto para ese negocio.
- Son borradores hasta que el cliente las apruebe.

---

## 5. Cuidados aprendidos (no los quites)

Estos límites salieron de medir el comportamiento real con mouse y rueda. Sin ellos la mascota se ve defectuosa.

**Movimiento**
- Un giro de perfil empezado **siempre termina**. Si piden otra vista mientras gira, espera a que acabe y deja una
  pausa de 350 ms. Sin esto, un scroll indeciso lo deja a medio girar.
- Un gesto no se reinicia a medias, y dos gestos de cuerpo entero no se suman: el anterior se desvanece.
- Las poses de ambiente no cambian una cara que lleva menos de 0,8 s.

**Scroll**
- Una reacción por tramo, no una por cuadro. El sentido cambia solo después de recorrer el 60 % de una pantalla.
- Con scroll rápido no hay reacción de ambiente: solo el aviso de "muy rápido", que necesita más de 4 pantallas por
  segundo sostenidas medio segundo, y descuenta los saltos del menú y las teclas Inicio y Fin.
- La pose de la sección se aplica al parar el scroll.

**Mouse**
- Reacciona solo si el puntero **se detiene** encima: 260 ms en el botón principal, 380 ms en tarjetas.
- No reacciona si el mouse va rápido, está agitado, o si fue la página la que se movió bajo un puntero quieto.
- Los ojos siguen al puntero con suavizado adaptativo: si el mouse se sacude, siguen el promedio en vez de temblar.
- Si el mouse sale de la ventana o lleva 6 s quieto, vuelve a la mirada propia de la pose.

**Comentarios**
- Un globo dura lo que se tarda en leerlo (2,2 a 4,2 s), **aunque la pose dure más**. Si no, una reacción larga
  (scroll, campo, enviando, dormido) deja su globo pegado hasta un minuto.
- Un globo recién aparecido no se tapa: 2,2 s si lo nuevo es igual o menos importante, 1 s si es más importante.
- Los de ambiente esperan 6 s; el tope es de 12 por minuto. Lo que hace la persona (tocarlo, un error, el envío)
  siempre habla.

**Privacidad**
- En un campo de correo, teléfono o contraseña se da vuelta, cierra los ojos y silba. Nunca lee lo que se escribe:
  solo reacciona al foco y a si el dato es válido.

---

## 6. Integración visual por estética

En el CSS de la página, sobrescribe las variables para que no parezca un elemento pegado encima:

```css
.mascota {
  --m-ink: var(--fg); --m-paper: var(--bg-3); --m-font: var(--body);
  --m-radio: 14px; --m-borde: 1px solid var(--line);
  --m-sombra: 0 18px 40px -18px rgba(0,0,0,.8);
  --m-piso: color-mix(in srgb, var(--accent) 40%, transparent);
  --m-alto: 140px;          /* tamaño del personaje */
  --m-blur: none;           /* blur(14px) si la estética usa vidrio */
}
.gato { --g-c1: var(--accent); --g-c2: var(--accent-2); }   /* la ropa */
```

Recetas probadas:

| Estética | Globo | Ropa del personaje |
|---|---|---|
| Terminal | Sin radio, sombra dura `3px 3px 0` | Grises de terminal |
| Vidrio | Radio 18 px, con `--m-blur` | Celeste y turquesa |
| Certificado | Doble marco (`0 0 0 3px paper, 0 0 0 4px line`) | Verde y violeta de la tinta |
| Metal | Vidrio oscuro | Cromado |
| Cristal | Globo facetado con `clip-path` (deja margen para la colita) | Crema y arena |
| Panel SaaS | Filo naranjo arriba | Naranjo y azul |
| Fintech | Degradado cobre en el globo | Cobre y violeta |

Ajusta `selectores` con las clases reales de botones principales, plan destacado, precios y tarjetas.

**En celular** la mascota se ubica dentro de la barra fija inferior (`.dock`), que reserva espacio a la izquierda.
Si el sitio no tiene esa barra, revisa que no tape el botón principal.

---

## 7. Verificación

Con el navegador sin ventana y mouse y rueda reales (CDP `Input`), no solo llamando funciones:

| Prueba | Qué debe pasar |
|---|---|
| Lectura normal de toda la página | Comenta cada sección; ningún globo dura menos de 2 s ni queda pegado |
| Subir rápido desde el final | Solo el aviso de "muy rápido"; sin ráfaga de poses ni giros a medias |
| Rueda indecisa (subir y bajar) | Una reacción, no una por cuadro |
| Mouse cruzando tarjetas sin parar | Ninguna reacción |
| Mouse sacudido más de un segundo | Se marea una vez (tope por visita) |
| Correo o teléfono enfocado | Se da vuelta de perfil, ojos cerrados |
| Dato inválido al salir del campo | `malDato` |
| Envío | Celebra dos veces |
| 390 px | Sin desborde y sin tapar el botón principal |
| Movimiento reducido | Sin animación en reposo, sin seguimiento de ojos, giros instantáneos |
| Pestaña oculta o personaje escondido | El bucle se detiene |

Además: consola sin errores en cada página y 60 cuadros por segundo con el personaje visible.

---

## Qué NO hacer
- No inventar datos del negocio en las frases.
- No hacerla obligatoria: siempre debe poder esconderse, y la preferencia se recuerda.
- No bloquear clics: el contenedor tiene `pointer-events: none` y solo el personaje y sus botones reciben clics.
- No hacer que lea o registre lo que se escribe.
- No quitar los cuidados de la sección 5 para "que reaccione más": es exactamente lo que la hace ver rota.
