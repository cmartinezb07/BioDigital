---
name: crear-sitio-web
description: Crea landing pages y sitios web completos (maquetas con varias estéticas animadas → sitio final en Astro con SEO, seguridad, analítica y publicación), con mascota animada opcional que reacciona a lo que hace el visitante. Úsala cuando pidan crear, maquetar, rediseñar o publicar una página web, landing o sitio para un negocio o cliente, comparar opciones de diseño a partir de referencias (links de 21st.dev, Lovable, capturas), o agregar un personaje/mascota animada con reacciones a una página.
---

# Crear sitio web

Flujo probado de punta a punta: preguntas → maquetas con varias estéticas → el cliente elige → sitio final → seguridad → publicación → checklist. Todo lo repetitivo ya está resuelto en `plantilla/`; no lo reescribas.

## Reglas que no se negocian
- **No inventar nada**: reseñas, casos, cifras, métricas, direcciones, teléfonos, plazos, años de fundación. Si falta un dato, escribe `[PENDIENTE: qué falta]` (la plantilla lo muestra como "por confirmar") y avísalo.
- **Las referencias del usuario mandan.** Si manda links o capturas, cada opción copia visiblemente la estética de su link (opción N = link N). Confirma ese mapeo antes de construir. No sustituyas por direcciones inventadas por ti ni por otra skill de diseño.
- **Trabaja por fases** y al final de cada una muestra qué hiciste y qué falta. No digas "terminado" sin pasar el checklist de `referencias/requisitos.md` §11.
- **Si algo de los requisitos no aplica** (login, blog, panel), dilo en vez de implementarlo igual.
- **Costos**: separa siempre costo único de recurrente y marca precios de terceros como aproximados.
- **Idioma**: escribe como habla el cliente final, frases cortas, sin jerga técnica en la página.

## Subramas (especializaciones de esta skill)
- **`crear-menu-digital`**: carta digital con QR y plato en vivo (3D y realidad aumentada) para restaurantes y cafeterías. Hereda todo lo de aquí (reglas, formulario, estilos, seguridad, publicación, checklist) y agrega lo propio; su `referencias/requisitos-menu.md` dice qué se hereda, qué se adapta y qué no aplica. Si piden un menú, **usa esa skill** y no hagas una landing.
- **`contexto_biodigital`**: contexto completo de Bío Digital (sitio, panel, formularios, catálogo, decisiones). Léela al retomar trabajo del proyecto.

## Fase 0 — Levantamiento (siempre, antes de escribir código)

**Lo primero: ¿el dueño del negocio está en la conversación o no?**

- **No está** (el caso normal: el equipo atiende al cliente aparte) → **entrega el formulario**. Copia
  `plantilla/formulario/formulario-cliente.html` a la carpeta del proyecto, cambia `AGENCIA` por los datos del
  equipo y dile al usuario cómo hacérselo llegar (link, archivo por WhatsApp o impreso con Ctrl+P). Son 59
  preguntas en 12 bloques, 15 minutos, y vuelve como texto ordenado para pegar aquí. El motor admite dos extras
  en `AGENCIA`: `whatsapp` (botón que abre el chat con el equipo) y `envio` (el cliente aprieta "Enviar" y las respuestas
  llegan al panel interno de Bío Digital, tabla `levantamientos`, con `tipo: 'web'` o `'menu'`). El formulario del
  menú se arma sobre este mismo motor (`crear-menu-digital/plantilla/formulario/construir-formulario.mjs`).
  **Cómo leer las respuestas y convertirlas en decisiones de diseño: `referencias/levantamiento.md`.**
  No empieces a maquetar con el formulario a medias: lo que no se puede adivinar son las seis escalas de
  personalidad y la pregunta de en qué se diferencia.
- **Sí está, o el sitio es del propio equipo** → pregunta directo con AskUserQuestion (máx. 4 por llamada, con la
  opción recomendada primero). Banco completo en `referencias/preguntas.md`. El formulario igual sirve de guion.

Cuando lleguen las respuestas: resume en 10 líneas lo que entendiste y pídele al usuario que lo confirme antes de
dibujar nada. Corregir ahí cuesta minutos; corregir después de maquetar cuesta días.

Mínimo indispensable para poder empezar:
1. **Tipo de página** y **acción principal** (cotizar, WhatsApp, agendar, comprar, pedir diagnóstico).
2. **Datos del negocio** (lista de `preguntas.md` §2). Lo que no tengan → `[PENDIENTE]`.
3. **Estética**: ¿tienen referencias (links/capturas)? Si no, ofrece el catálogo de `referencias/esteticas.md`. Sensación buscada, tema por defecto (claro/oscuro), logo/colores.
4. **Animación**: sobria / media / protagonista; ¿efectos WebGL permitidos? ¿cuántas opciones de maqueta?
5. **Publicación**: dominio, hosting, formulario, analítica, ¿necesita login?
6. **¿Quiere mascota animada?** (sí / no / solo en algunas páginas). Si dice sí, haz el bloque de preguntas de `referencias/mascota.md` §1 (personajes, estilo de dibujo, personalidades, nivel de animación, reacciones, quién pone las imágenes).

El formulario ya pregunta todo esto y bastante más (clientes, competencia, personalidad en seis escalas, qué
contenido existe, plazos y quién decide). Úsalo como fuente única: no vuelvas a preguntar lo que ya respondió.

Si mandan links: ábrelos (navegador integrado), lee el `src` del iframe de la demo y captúrala a 1440 px (ver `referencias/verificacion.md` §Referencias). Revisa dependencias (`Copy prompt`/`Code`) para usar la misma librería si es liviana.

Si **no** mandan links, no inventes la estética desde cero: busca una plantilla del mismo rubro y síguela (estructura de secciones, tipografía, movimiento). Fuentes probadas: 21st.dev → Templates (la demo está en el iframe `*.21st.app`) y Framer Marketplace (demo en `*.framer.website`; hay gratuitas). Captúrala con `node web/herramientas/revisar.mjs <demo> --anchos 1440`. Cambia la paleta solo si choca con la marca o con otro sitio del mismo catálogo, y dilo. No copies reseñas ni personas de la plantilla: reemplaza esas secciones. Antes de elegir una fuente gruesa, revisa que tenga tildes (Bowlby One no las tiene), y no pongas interlineado menor a 1 en títulos dentro de `overflow: hidden`, porque corta los tildes. Ejemplo resuelto: `memoria/ejemplos-matriz.md` del proyecto Bío Digital.

## Fase 1 — Maquetas (HTML estático, rápido y barato)
1. Copia la plantilla a la carpeta del proyecto (ej. `web/propuesta/`):
   `cp -r ~/.claude/skills/crear-sitio-web/plantilla/* <carpeta>/`
2. Escribe **solo** `fuentes/contenido.mjs` con los textos del cliente (estructura comentada en el archivo; secciones en `null` se omiten).
3. Genera: `node fuentes/generar.mjs` (todas) o `node fuentes/generar.mjs metal foco` (algunas). Crea `opcion-N-<estetica>.html` + `index.html` (galería).
4. Estéticas listas en `fuentes/esteticas/`: `metal`, `cristal`, `ascii`, `panel`, `foco` (detalle y cuándo usar cada una en `referencias/esteticas.md`). Para una estética nueva, copia la más parecida y cambia `css`, `hero` y `script`; mantén los tokens de `kit.css`.
5. Sirve la carpeta con un servidor local (`.claude/launch.json` + preview) y verifica (Fase 1b).
6. Para cambiar un texto en todas las opciones: edita `contenido.mjs` y regenera. No edites los HTML generados.

Qué trae resuelto la plantilla (no lo rehagas): tema claro/oscuro con transición de burbuja (View Transitions), aparición al hacer scroll con escalonado, preguntas con altura animada, menú móvil, botón volver arriba, barra fija de acciones en móvil, formulario de maqueta con estados, riel de puntaje que suma al leer, beneficio que marca la casilla del formulario, movimiento reducido, foco visible, íconos SVG.

### Fase 1a — Mascota animada (solo si el cliente la quiere)
Proceso completo en `referencias/mascota.md`. Hay **dos caminos** y el mismo motor sirve para los dos:

**A · Personaje dibujado en SVG (por defecto).** Ya está hecho: un gato con 30 poses, 11 gestos, vista de frente y de
perfil y ojos que siguen al mouse. Para adaptarlo a un cliente nuevo basta con cambiar dos colores y las frases.
1. Copia `plantilla/mascota/*` a la carpeta del sitio.
2. Viste al personaje con la marca: `.gato { --g-c1: …; --g-c2: … }`. Si la estética ya define `--c1` y `--c2`, se
   viste solo.
3. Escribe `mascota-gato.js` con las frases, `secciones`, `bases` y `selectores` de ese negocio. Mantén `rig: true`.
4. Carga en cada página: `mascota.css` y `gato.css` en el `<head>`; al final `gato.js`, `mascota-gato.js` y
   `mascota.js`, en ese orden.
5. Revisa las poses con el cliente abriendo `gato-lamina.html`.

**B · Personaje en imágenes.** Cuando el cliente ya tiene su mascota o quiere otro personaje.
1. Consigue la hoja en grilla (la manda el cliente, se genera con permiso, o se usa el gato mientras tanto).
2. Recorta con `python herramientas/recortar-hoja.py recorte.json` y revisa `control.png` y `lamina.png`.
3. Completa `mascota-personajes.js`: `mira` (hacia dónde mira cada dibujo), frases por evento, `secciones`,
   `selectores` y animaciones cuadro a cuadro si el nivel es alto. Sin `rig: true`.

**En los dos casos:** ajusta las variables `--m-*` según la estética (recetas en `mascota.md` §6), respeta los
cuidados de `mascota.md` §5 (son los que evitan que se vea rota) y verifica con la tabla de `mascota.md` §7.

### Fase 1b — Verificación de maquetas
Sigue `referencias/verificacion.md`: captura completa a 1440 px (escala 0.5), chequeo de desborde a 390 px, textos ≥ 12 px, consola sin errores, detector de Impeccable si está instalado. Corrige y vuelve a generar. Muestra la galería al usuario con fortalezas y riesgos honestos de cada opción.

## Fase 2 — Sitio final (tras la elección)
- **Stack por defecto**: Astro (SSG) + Cloudflare Pages (uso comercial gratis). Nada de SPA pura: el HTML debe traer el contenido.
- Porta la estética elegida: `nucleo.css` + `kit.css` + CSS de la estética como estilos globales; `mundo.js`/`secciones.js` como scripts; cada sección como componente Astro. El formulario real reemplaza al de maqueta.
- Arquitectura, estructura por página, SEO técnico, UX: `referencias/requisitos.md` §2–§6.
- Escribe `DESIGN.md` del sitio (tokens, tipografías, componentes, movimiento) derivado de lo construido.

## Fase 3 — Seguridad · Fase 4 — Publicación · Fase 5 — Checklist
`referencias/requisitos.md` §7–§11. Formulario con validación en servidor, rate limit, honeypot + Turnstile, cabeceras de seguridad, sin secretos en el código. Dominio + HTTPS, GA4 con consentimiento, Search Console.
**Cloudflare Pages desde `wrangler`:** si el proyecto lo crea el primer deploy, queda con otra rama de producción y la dirección corta (`proyecto.pages.dev`) da 404 mientras `main.proyecto.pages.dev` sí abre. Solución: en Cloudflare → el proyecto → Settings, cambiar la rama de producción a `main` y volver a publicar. Las versiones para publicar deben salir **sin** la rueda de colores del equipo ni avisos de prototipo. Luego el checklist completo, con evidencia.

## Levantamiento
Formulario para el cliente y cómo traducir cada respuesta en decisiones de diseño: `referencias/levantamiento.md`.

## Herramientas y recursos
Qué repos y sitios usar (y cuáles no) según el caso: `referencias/recursos.md`. Estándares de animación: `referencias/animaciones.md`.

## Registro
Si el proyecto tiene carpeta de memoria/decisiones, anota ahí: opciones creadas, referencias usadas, elección del cliente, pendientes `[PENDIENTE]`.

## Herramientas y módulos nuevos (22-oct-2026)
- **Revisor automático** `web/herramientas/revisar.mjs` (en el proyecto Bío Digital; cópialo a otros proyectos): Chrome sin ventana por el protocolo DevTools, sin instalar nada. `node web/herramientas/revisar.mjs <url> [--anchos 390,1440] [--tag nombre] [--probar guion.js]` mide desborde, textos < 12 px, áreas táctiles < 44 px, imágenes sin alt, enlaces "#", restos ([PENDIENTE], lorem, undefined, NaN), errores de consola, recursos fallidos, y guarda capturas (primera pantalla y página completa) en `web/herramientas/capturas/` (ignorada por git). `--probar` ejecuta un guion (cuerpo de función async con `$`, `$$`, `dormir`) para clicar y comprobar interacciones; los guiones viven en `web/herramientas/pruebas/`. Úsalo en vez de `captura.ps1` y **mira las capturas con Read**.
- **Prueba de scroll real** `web/herramientas/scroll.mjs` (23-oct-2026): recorre cada página con el dedo (390 px) y la rueda (1440 px), con movimiento normal, y avisa si el scroll retrocede, se mueve solo al soltar, se queda pegado o la página no carga. `node web/herramientas/scroll.mjs [url] [ruta …]` (en Git Bash, rutas sin barra inicial) o en paralelo `… 1/4` a `4/4` con las páginas de `check.mjs`. **Nunca** uses `scrollIntoView` ni `scrollTo` dentro de observadores o eventos de scroll: le pelea el scroll al dedo (fue la falla de Fogón del Sur y de la carta de la pastelería); para centrar una barra horizontal, mueve solo su `scrollLeft`.
- **Módulo de reservas** `ejemplos/_compartido/reservas.js/.css` (+ `reservas-LEEME.md` con toda la configuración y `reservas-demo.html`): `BDReservas.montar(el, config)`, modo `horas` (servicio → profesional → día → hora → datos → resumen) y modo `noches` (alojamiento → llegada/salida → huéspedes → total), celular chileno validado, zona America/Santiago, .ics para el calendario del cliente, WhatsApp con el mensaje armado, demo con disponibilidad determinista, nivel 2 opcional (POST a Supabase). Estética con variables `--res-*`. Probado 60/60 con clics; falta probar en celulares reales y verificar la lista de feriados.
- **Sitios de ejemplo para el catálogo** (`web/propuesta/ejemplos/<slug>/`): cada uno lleva `noindex`, `data-ejemplo`, y la **cinta compartida** `_compartido/demo.css/js` ("Ejemplo de Bío Digital · Quiero una así" → WhatsApp del equipo; `data-demo` en botones y formularios muestra un aviso en vez de enviar). Reglas: negocio ficticio, sin reseñas ni cifras inventadas, precios "de ejemplo", sin teléfonos ni direcciones con número, sin fotos externas (arte en SVG/CSS/canvas).
- **Receta de trabajo en paralelo que funcionó:** el orquestador escribe la dirección de arte de cada sitio (paleta, tipografías, layout, efecto firma, secciones, qué evitar) y un agente por sitio construye y se autoverifica con el revisor (máx. 4 rondas). Investigar referencias con agentes aparte gasta mucho; hacerlo solo si el usuario lo pide.
