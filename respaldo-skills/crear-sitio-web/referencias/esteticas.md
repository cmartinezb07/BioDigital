# Catálogo de estéticas

Todas usan el mismo contenido (`contenido.mjs`) y la misma estructura (`kit.css`). Solo cambian los tokens, la tipografía, el hero y el efecto.

**Si el usuario manda referencias, esas mandan.** Cada link se convierte en una opción que se parece visiblemente a él. Este catálogo sirve cuando no hay referencias, o para sugerir opciones según la sensación que buscan.

## En la plantilla (listas para generar)

| id | Nombre | Referencia | Sensación | Tema | Tipografías | Efecto | Riesgo |
|---|---|---|---|---|---|---|---|
| `metal` | Metal líquido | [Liquid Metal Hero](https://21st.dev/@chowlol202/components/liquid-metal-hero) | energía, premium | oscuro | Manrope + Geist Mono | Esfera cromada detrás del titular, hecha con `@paper-design/shaders@0.0.80` (ShaderMount + liquidMetalFragmentShader, forma `circle`); se inclina hacia el mouse | Carga una librería WebGL desde un CDN; en el sitio final se instala con npm |
| `cristal` | Cristal líquido | [Crystal Shader](https://21st.dev/@dhileepkumargm/components/crystal-shader) | artístico, lujo | oscuro (crema) | Syne + Figtree + JetBrains Mono | Shader WebGL propio a pantalla completa: celdas Voronoi deformadas con onda al pasar el mouse; se atenúa y se pausa bajo el hero | El efecto protagonista puede distraer; Syne 800 queda muy ancha (usar 700) |
| `ascii` | Terminal ASCII | [Hero ASCII One](https://21st.dev/@larsen66/components/hero-ascii-one) | técnico, distinto | oscuro | Space Mono + Geist Mono | Canvas con estrellas y una ilustración en semitono (un local con el pin de Maps), líneas de construcción, cursor que parpadea y barras de sistema | La letra monoespaciada cuesta a público no técnico; la ilustración se cambia en `paintShape()` |
| `panel` | Panel SaaS | [SaaS Template](https://21st.dev/@waleedkibhen/components/saa-s-template) | confianza, producto serio | oscuro | Poppins + Geist Mono | Píldora de aviso, titular con degradado, resplandor naranjo y un panel que se endereza con el scroll (`animation-timeline: view()`) | Estilo muy visto en startups; el detector marca el texto con degradado y el resplandor (van a propósito) |
| `foco` | Foco fintech | [Paymark (Lovable)](https://lovable.dev/templates/websites/landing-page/paymark-template) | sobrio, confianza | oscuro carbón | Geist + Geist Mono | Foco rosa y violeta, piso con grilla en perspectiva, campo en píldora que prellena el formulario, tarjetas flotantes con parallax y líneas de circuito | Menos personalidad; es la más liviana |

Todas tienen variante clara, que se activa con el botón o con `?tema=light`.

## Recetas sin plantilla (ya hechas en un proyecto; recrear si el cliente las pide)

### Vidrio iOS con aurora
- **Referencia:** estilo "Liquid Glass" de iOS 26.
- **Aurora:** 5 cintas `<i>` con blur y blend en un contenedor fijo. El vaivén usa `ease-in-out` (no `ease-out`, que da tirones).
- **Paneles:** `backdrop-filter: blur() saturate()` y un borde de luz con `mask-composite`.
- **Reflejo:** sigue al mouse con `@property --mx/--my` y `inherits: false`, para que el valor no se herede a los hijos.
- **Widgets:** tipo pantalla de inicio de iPhone.
- **Riesgo:** el vidrio pide más al celular. Respetar `prefers-reduced-transparency`.

### Certificado (papel de seguridad)
- **Sensación:** seriedad, propiedad y entrega formal.
- **Fondo:** blanco; de noche, negro. Tipografías Bodoni Moda y Archivo.
- **Guilloché:** canvas con curvas polares `r = base + a1·sin(k1·t+ph) + a2·sin(k2·t−2ph)` y roseta girando con máscara cónica.
- **Detalles:**
  - sello SVG con `textPath` y firmas;
  - franja foil con gradiente cónico que sigue al mouse;
  - servicios como estampillas perforadas (máscara `radial-gradient` con `round border-box` más `padding-box`, sobre un borde transparente de 6 px);
  - planes con talón punteado.

## Cómo agregar una estética nueva
1. Copia la estética más parecida en `fuentes/esteticas/<id>.mjs`.
2. Cambia los tokens de `:root` y `:root[data-theme="light"]`: `--bg --bg-2 --bg-3 --fg --fg-2 --fg-3 --line --line-2 --accent --accent-fg --display --body --mono --r --r-lg --btn-r --shadow --glow`.
3. Reescribe `hero(c, {arrow, ico})` leyendo `c.hero.*`, y los efectos en `script`.
4. Reglas del efecto:
   - pausar fuera de pantalla con IntersectionObserver;
   - con movimiento reducido, dibujar un solo cuadro;
   - limitar el DPR (≤ 2) y la resolución (escala 0.6 en shaders a pantalla completa);
   - ofrecer un respaldo en CSS si no hay WebGL.
5. Evita `backdrop-filter` sobre un canvas fijo y los textos bajo 12 px.
6. En la grilla del hero usa `minmax(0, 1fr)` en móvil, nunca `1fr` a secas (desborda).
7. Genera y verifica (`verificacion.md`).

## Sugerir según el caso
| Tipo de cliente | Estéticas sugeridas |
|---|---|
| Oficio o servicio local (taller, peluquería, almacén) | `foco` o vidrio iOS, con tema claro disponible; evitar `ascii` |
| Profesional o consultora (abogado, contador) | Certificado, `foco`, `panel` |
| Tecnología o startup | `panel`, `metal`, `ascii` |
| Diseño, arte, moda, gastronomía de autor | `cristal`, `metal` |
| Público mayor o poco digital | Tema claro, animación sobria, tipografía grande; los efectos WebGL solo como adorno |
