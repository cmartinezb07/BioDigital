# Mascota animada (módulo opcional)

La mascota es un personaje fijo en una esquina que cambia de cara, gira, salta y habla según lo que hace la persona. Es **opcional**: primero se pregunta si el cliente la quiere. Si no la quiere, se salta este módulo completo.

Piezas de la plantilla (`plantilla/mascota/`):

| Archivo | Qué es | ¿Se cambia por cliente? |
|---|---|---|
| `mascota.js` | Motor: eventos, prioridades, giros, animaciones cuadro a cuadro, globo, controles | No |
| `mascota.css` | Estilos con variables `--m-*` para adaptarse a cada estética | No (se sobrescriben las variables en la página) |
| `mascota-personajes.js` | `window.MascotaConfig`: personajes, frases, hacia dónde mira cada dibujo, secciones, selectores, animaciones | **Sí** |
| `herramientas/recortar-hoja.py` + `recorte.ejemplo.json` | Convierte una hoja de dibujos en imágenes WebP transparentes | Solo el JSON |

## 1. Preguntas (antes de dibujar nada)
Usa AskUserQuestion. Pon la opción recomendada primero.

1. **¿Quiere mascota?** Sí / No / Solo en algunas páginas. Si dice que no, termina aquí.
2. **Personajes**
   - **Cuántos:** uno fijo, o varios que la persona puede cambiar (recomendado de 2 a 4).
   - **Qué son:** animales, un objeto del rubro (una taza, una herramienta), una persona ilustrada o la mascota que ya tenga la marca.
3. **Estilo de dibujo:** línea negra estilo cartoon (el que mejor se recorta), color plano, pixel art, 3D suave o el estilo de la marca.
4. **Personalidad** (por personaje): amable, sarcástica, tierna y dormilona, hiperactiva, formal ("usted"), otra. Define también:
   - **Tratamiento:** tú o usted.
   - **Humor:** nada, suave o pícaro.
   - **Límites:** el humor nunca se burla del cliente final ni de su rubro, y nunca promete algo que el negocio no ofrece.
5. **Nivel de animación**
   - **Sutil:** caras fijas con un pequeño "pop".
   - **Media** (recomendada): caras, giros y gestos (saltar, sacudirse, temblar, asentir).
   - **Alta:** además, animaciones cuadro a cuadro (saludar, bailar, dormir).
6. **Reacciones que quiere** (multiselección):
   - al llegar;
   - al hacer scroll;
   - al entrar a secciones;
   - al pasar el mouse por los botones o precios;
   - en formularios: mirar a otro lado en datos personales, enojarse con un error, celebrar el envío;
   - al irse, volver o quedarse inactivo;
   - login correcto o fallido;
   - otras propias del negocio.
7. **¿Quién pone las imágenes?**
   - **(a)** El cliente o el usuario ya las tiene, o las crea y las manda. Recomendado cuando hay identidad de marca.
   - **(b)** Se generan con una herramienta de imágenes. Pide permiso antes: tiene costo y derechos.
   - **(c)** Por ahora se usa un personaje simple en SVG hecho a mano, y después se reemplaza.
8. **Ubicación y control**
   - **Ubicación:** esquina inferior izquierda (por defecto) o derecha.
   - **Control:** botón para esconderla (siempre) y botón para cambiar de personaje (si hay varios).

## 2. Imágenes: qué pedir o qué generar
El recorte automático funciona mejor con **hojas en grilla**:
- fondo claro liso;
- contorno oscuro;
- un personaje por celda;
- el mismo tamaño y la misma ropa en todas las celdas;
- los rótulos de texto **debajo o al costado de los pies**, nunca tocando el dibujo.

**Set mínimo por personaje (12 reacciones):** feliz, negación, triste, enojado, sorprendido, soberbio, pensativo, afirmando, miedo, guiño, cansado, muy feliz.

**Lo ideal:** la misma hoja con las 12 reacciones en 6 filas × 2 columnas.

**Dirección de la mirada:**
- Anota hacia dónde mira cada dibujo (derecha, izquierda o de frente). El motor los voltea en espejo, así que **no hace falta dibujar ambos lados**.
- Si un personaje sale siempre de perfil, conviene pedir al menos 3 o 4 poses de frente para que el giro se note.

**Animación cuadro a cuadro** (nivel alto):
- una fila por animación;
- de 3 a 6 cuadros de izquierda a derecha, con la misma posición de los pies;
- nombres `saluda-1`, `saluda-2`, …

**Plantilla de indicación (prompt)** para generar o encargar una hoja (adaptar):

> Hoja de personaje estilo cartoon de línea negra gruesa, fondo blanco liso, sin sombras de color. Personaje: [descripción, ropa, accesorio]. Grilla de 6 filas × 2 columnas, un personaje por celda, todos del mismo tamaño y de cuerpo entero, pies alineados. Expresiones en este orden: feliz, negación (girado mirando a otro lado), triste, enojado, sorprendido, soberbio (brazos cruzados), pensativo (mano en el mentón), afirmando (pulgar arriba), miedo, guiño, cansado, muy feliz (brazos arriba). Nombre de cada expresión escrito pequeño debajo de los pies, sin tocar el dibujo.

Si el usuario manda las imágenes por el chat y no quedan como archivo, se pueden extraer del registro de la sesión (`~/.claude/projects/<proyecto>/<sesión>.jsonl`, bloques `image` en base64). Guárdalas en `mascotas/fuente/`.

**Derechos:**
- Si la mascota será la marca registrada del cliente, recomienda redibujarla en vectores con derechos claros.
- No copies personajes de terceros.

## 3. Recortar y preparar
1. Copia `plantilla/mascota/` a la carpeta del sitio. Pon las hojas en `mascotas/fuente/`.
2. Crea `recorte.json` a partir de `recorte.ejemplo.json`:
   - `filas`: límites verticales en px, o `{ "auto": 6 }` para partir en partes iguales;
   - `personajes`: límites horizontales de cada uno, o `{ "desde", "hasta", "columnas" }`;
   - `reacciones`: nombre de archivo por celda.
3. Ejecuta `python herramientas/recortar-hoja.py mascotas/fuente/recorte.json` (requiere pillow, numpy y scipy).
4. **Mira `control.png` y `lamina.png`.** Revisa cuatro cosas:
   - que ningún rótulo se haya colado;
   - que no falten orejas, colas o brazos (si la fila corta la cabeza, ajusta ese límite);
   - que el interior quede blanco y opaco (se ve bien sobre fondo oscuro);
   - el peso: unos 16 KB por imagen, a 360×500 px aprox.
5. Arma una lámina de "mirada" (los recortes con su nombre) y completa `mira` en la configuración: `'d'`, `'i'` o `'f'` por reacción, y `'*'` para todo el personaje.

## 4. Personalidad y frases (`mascota-personajes.js`)
Cada evento es `[reacción, [frases…], gesto]`. Eventos que usa el motor:

| Grupo | Eventos |
|---|---|
| Llegada y recorrido | `llegada`, `bajar`, `subir`, `rapido`, `final`, `arriba` |
| Secciones | las claves que definas en `secciones` (p. ej. `servicios`, `planes`, `formulario`, `preguntas`, `cierre`) |
| Mouse | `botón`, `pick`, `precio`, `pregunta`, `seleccion`, `copiar`, `achicar` |
| Formularios | `campo`, `sensible` (se da vuelta), `tipeo`, `malDato`, `incompleto`, `enviando`, `enviado` (se reproduce 2 veces), `beneficioOk` |
| Estado | `cansado`, `despierta`, `irse`, `volver`, `oscuro`, `claro` |
| Toques | `toque`, `muchosToques` (4 toques en 2 s) |
| Sistema | `loginOk`, `loginError`, `error` (vía `document.dispatchEvent(new CustomEvent('mascota', { detail: 'login-ok' }))`) |

**Parámetros por personaje:**
- `presentacion`: lo que dice al elegirlo.
- `cansadoMs`: tras cuánto tiempo sin actividad se duerme.
- `miedoVel`: umbral de scroll rápido; 99 = nunca se asusta.
- `titulo`: título de la pestaña cuando te vas a otra.

**Reglas para escribir las frases:**
- 2 o 3 variantes por evento importante: se eligen al azar sin repetir la anterior.
- Cortas: menos de 60 caracteres. `{s}` pone "Buenos días", "Buenas tardes" o "Buenas noches" según la hora.
- **Diferencia real entre personalidades.** Al irse, uno se ríe, otro se entristece, otro se enoja y otro se ofende con elegancia.
- Nada falso: si dice "cupos limitados" o "sin letra chica", debe ser cierto para ese negocio.
- Revisa el tono con el cliente. Las frases son borradores hasta que las apruebe.

## 5. Integración visual por estética
En el `<head>` va `mascota.css`. Antes de `</body>` van `mascota-personajes.js` y luego `mascota.js`.

En el CSS de la página, sobrescribe las variables para que no parezca un elemento externo:

```css
.mascota {
  --m-ink: var(--fg); --m-paper: var(--bg-3); --m-font: var(--body);
  --m-radio: 14px; --m-borde: 1px solid var(--line);
  --m-sombra: 0 18px 40px -18px rgba(0,0,0,.8);
  --m-contorno: color-mix(in srgb, var(--accent) 50%, transparent);  /* borde del personaje con el color de la marca */
  --m-piso: color-mix(in srgb, var(--accent) 40%, transparent);      /* sombra en el suelo */
  --m-filtro: opacity(1);   /* p. ej. sepia(.2) para paletas cálidas; nunca "none" */
  --m-blur: none;           /* blur(14px) si la estética usa vidrio */
}
```

Recetas probadas:

| Estética | Globo | Contorno del personaje |
|---|---|---|
| Terminal | Sin radio, sombra dura `3px 3px 0` | Sin contorno |
| Vidrio | Radio 18 px, `--m-blur` | Celeste |
| Certificado | Doble marco (`0 0 0 3px paper, 0 0 0 4px line`) | Verde |
| Metal | Vidrio oscuro | Cromado |
| Cristal | Globo facetado con `clip-path` (dejar margen para la colita) y `--m-filtro: sepia(.2)` | Crema |
| Panel SaaS | Filo naranjo arriba | Naranjo |
| Fintech | Degradado cobre en el globo | Cobre |

Ajusta también `selectores` en la configuración, con las clases reales de botones principales, plan destacado, precios y tarjetas.

**En celular**, la mascota se ubica dentro de la barra fija inferior (`.dock`), que reserva espacio a la izquierda. Si el sitio no tiene esa barra, revisa que la mascota no tape botones.

## 6. Verificación
- Consola sin errores en cada página, y `window.Mascota` presente.
- Por script, comprueba lo siguiente (los eventos de foco se disparan a mano si el panel no tiene foco):
  - enfocar el correo → reacción `sensible` y `--dir` volteado;
  - valor inválido al salir del campo → `malDato`;
  - envío → dos `enviado`;
  - `Mascota.evento('irse')` → la cara que corresponde a la personalidad;
  - con una animación configurada → la secuencia de archivos completa, observando `img.src` con un MutationObserver.
- A 375 px: sin desborde horizontal y sin tapar el botón principal.
- Movimiento reducido: solo cambian las caras.
- Captura de cada estética con el globo visible.

## Qué NO hacer
- No inventar datos del negocio en las frases.
- No hacerla obligatoria: siempre debe poder esconderse, y la preferencia se recuerda.
- No bloquear clics: el contenedor tiene `pointer-events: none` y solo el personaje y sus botones reciben clics.
- No usar `filter: none` combinado con otros filtros en `--m-filtro`: invalida toda la regla.
- No hacer que la mascota lea o registre lo que se escribe. Solo reacciona al foco y a la validez del campo.
