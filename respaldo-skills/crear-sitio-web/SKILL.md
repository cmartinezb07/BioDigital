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

## Fase 0 — Preguntas (siempre, antes de escribir código)
Usa AskUserQuestion (máx. 4 preguntas por llamada, con opción recomendada primero). Banco completo en `referencias/preguntas.md`. Mínimo indispensable:
1. **Tipo de página** y **acción principal** (cotizar, WhatsApp, agendar, comprar, pedir diagnóstico).
2. **Datos del negocio** (lista de `preguntas.md` §2). Lo que no tengan → `[PENDIENTE]`.
3. **Estética**: ¿tienen referencias (links/capturas)? Si no, ofrece el catálogo de `referencias/esteticas.md`. Sensación buscada, tema por defecto (claro/oscuro), logo/colores.
4. **Animación**: sobria / media / protagonista; ¿efectos WebGL permitidos? ¿cuántas opciones de maqueta?
5. **Publicación**: dominio, hosting, formulario, analítica, ¿necesita login?
6. **¿Quiere mascota animada?** (sí / no / solo en algunas páginas). Si dice sí, haz el bloque de preguntas de `referencias/mascota.md` §1 (personajes, estilo de dibujo, personalidades, nivel de animación, reacciones, quién pone las imágenes).

Si mandan links: ábrelos (navegador integrado), lee el `src` del iframe de la demo y captúrala a 1440 px (ver `referencias/verificacion.md` §Referencias). Revisa dependencias (`Copy prompt`/`Code`) para usar la misma librería si es liviana.

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
Proceso completo en `referencias/mascota.md`. Resumen:
1. Copia `plantilla/mascota/*` a la carpeta del sitio.
2. Consigue las imágenes: el usuario o el cliente las manda (hoja en grilla), o se generan con permiso, o se usa un SVG simple temporal. Si llegan por el chat y no quedan como archivo, se extraen del registro de la sesión.
3. Recorta con `python herramientas/recortar-hoja.py recorte.json` y revisa `control.png` y `lamina.png`.
4. Completa `mascota-personajes.js`: `mira` (hacia dónde mira cada dibujo), personalidades y frases por evento, `secciones`, `selectores` y `animaciones` cuadro a cuadro si el nivel es alto.
5. Integra en cada página: `mascota.css` en el `<head>`; `mascota-personajes.js` y después `mascota.js` al final; variables `--m-*` según la estética (tabla de recetas en `mascota.md` §5). En la plantilla generada: `head`/`script` de la estética o `comun`.
6. Verifica por script: foco sensible → se voltea; dato inválido → enojo; envío → celebra dos veces; salida → reacción de la personalidad; animación → secuencia completa. Además, 375 px sin tapar el botón principal.

### Fase 1b — Verificación de maquetas
Sigue `referencias/verificacion.md`: captura completa a 1440 px (escala 0.5), chequeo de desborde a 390 px, textos ≥ 12 px, consola sin errores, detector de Impeccable si está instalado. Corrige y vuelve a generar. Muestra la galería al usuario con fortalezas y riesgos honestos de cada opción.

## Fase 2 — Sitio final (tras la elección)
- **Stack por defecto**: Astro (SSG) + Cloudflare Pages (uso comercial gratis). Nada de SPA pura: el HTML debe traer el contenido.
- Porta la estética elegida: `nucleo.css` + `kit.css` + CSS de la estética como estilos globales; `mundo.js`/`secciones.js` como scripts; cada sección como componente Astro. El formulario real reemplaza al de maqueta.
- Arquitectura, estructura por página, SEO técnico, UX: `referencias/requisitos.md` §2–§6.
- Escribe `DESIGN.md` del sitio (tokens, tipografías, componentes, movimiento) derivado de lo construido.

## Fase 3 — Seguridad · Fase 4 — Publicación · Fase 5 — Checklist
`referencias/requisitos.md` §7–§11. Formulario con validación en servidor, rate limit, honeypot + Turnstile, cabeceras de seguridad, sin secretos en el código. Dominio + HTTPS, GA4 con consentimiento, Search Console. Luego el checklist completo, con evidencia.

## Herramientas y recursos
Qué repos y sitios usar (y cuáles no) según el caso: `referencias/recursos.md`. Estándares de animación: `referencias/animaciones.md`.

## Registro
Si el proyecto tiene carpeta de memoria/decisiones, anota ahí: opciones creadas, referencias usadas, elección del cliente, pendientes `[PENDIENTE]`.
