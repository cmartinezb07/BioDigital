# Estándares de animación (ya aplicados en la plantilla)

Basados en `emilkowalski/skills` (review-animations) y en una revisión real. Si se agrega movimiento nuevo, debe cumplir esto.

## Tiempos y curvas
| Uso | Duración | Curva |
|---|---|---|
| Presionar un botón | 160 ms, escala .97 (redondos .95) | `--ease-out: cubic-bezier(.23,1,.32,1)` |
| Hover | 250–350 ms | ease-out |
| Aparición al hacer scroll | 700 ms, subida de 18 px (con blur solo en el hero) | ease-out |
| Escalonado de listas | 60–80 ms entre elementos (máximo ~6 pasos) | — |
| Paneles o preguntas que abren | abrir 360 ms, cerrar 240 ms (cerrar más rápido) | `cubic-bezier(.32,.72,0,1)` |
| Cambio de tema (burbuja) | 700 ms, `clip-path: circle()` desde el botón | `cubic-bezier(.32,.72,0,1)` |
| Movimiento ambiental en bucle (auroras, flotación) | 6–14 s, `alternate` | **ease-in-out**; ease-out da un tirón en cada cambio de sentido |

## Reglas
- **Hover solo con mouse:** va dentro de `@media (hover: hover) and (pointer: fine)`. En pantallas táctiles, el hover se queda "pegado".
- **Reflejos que siguen al mouse:** usar `@property` con `inherits: false`. Así las variables no se heredan a los hijos, lo que evita repintados y valores raros.
- **Nada infinito que llame la atención:** los pings y pulsos se repiten 3 veces y se detienen. Solo lo ambiental puede ser infinito, y debe ser suave.
- **Contenido visible por defecto:** JS agrega `.motion` y `.in`. Sin JS, o al imprimir, todo se ve.
- **Movimiento reducido** (`prefers-reduced-motion`):
  - sin desplazamientos;
  - se mantienen las transiciones de opacidad y color;
  - el indicador de carga sigue girando;
  - los shaders dibujan un solo cuadro.
- **Tema:** la View Transitions API va con `ready.catch()`, porque el navegador puede abortar la transición. Se guarda el tema pedido para que un doble clic rápido no invierta el resultado. Si el navegador no soporta la API, el cambio es instantáneo; con movimiento reducido, se funde.
- **Animar solo propiedades del compositor** (`transform`, `translate`, `scale`, `opacity`, `clip-path`). Excepción justificada: la altura de las preguntas frecuentes (WAAPI), porque es la única forma de empujar suavemente el contenido de abajo.
- **Efectos WebGL o canvas:**
  - pausar fuera de pantalla (IntersectionObserver) y con la pestaña oculta;
  - 30 fps bastan en canvas 2D;
  - limitar el DPR;
  - agrupar los dibujos en pocos `fill()`.
- **Scroll-driven** (`animation-timeline: view()`): siempre dentro de `@supports`, con un estado final correcto si no hay soporte.
- **Números que cuentan:** 1.2–1.6 s con easing cuártico; manda la última cuenta pedida.

## Rendimiento de la burbuja de tema
El navegador captura la pantalla una vez y anima un `clip-path` en el compositor. El costo principal es esa captura, un cuadro, y funciona bien en celulares de gama media.
