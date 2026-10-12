# Estilos de carta (maquetas del menú)

El equivalente de las "opciones de maqueta" de `crear-sitio-web`: la misma carta en cinco estilos. Se generan con `node generar-menu.mjs --opciones` (archivos `opcion-<estilo>.html` y `opciones.html`). **Si el cliente manda referencias, esas mandan:** parte del estilo más cercano y ajusta `tema` en `menu.json`.

| id | Nombre | Sensación | Tema | Letras (títulos + texto) | Cuándo usarlo | Riesgo |
|---|---|---|---|---|---|---|
| `cafe` | Café y dorado | cálido, acogedor, de carta clásica | oscuro | Playfair Display + DM Sans | parrilla, comida casera, restaurante tradicional (el que gustó en la demo) | muy oscuro bajo el sol, pide buena pantalla |
| `crema` | Crema y cobre | luminoso, artesanal, de cafetería | claro | Cormorant Garamond + DM Sans | cafeterías, pastelerías, desayunos | la letra fina se lee peor en celulares de gama baja |
| `nocturno` | Noche y oro | elegante, de cena y coctelería | oscuro | Fraunces + Inter | bares, cenas, restaurantes de autor | puede sentirse frío en un local familiar |
| `bistro` | Bistró vino | fresco, europeo, de almuerzo | claro | DM Serif Display + DM Sans | almuerzos ejecutivos, bistró, vinos | el rojo vino cansa si hay mucho texto en color |
| `jardin` | Jardín | natural, saludable, de verduras y campo | oscuro | Lora + DM Sans | comida vegetariana, saludable, de campo | el verde pierde fuerza con fotos muy cálidas |

Todos pasan contraste AA (el generador lo calcula) y funcionan en modo claro u oscuro según el estilo. Con `tema.auto` se combinan dos: `{"auto": {"claro": "crema", "oscuro": "cafe"}}` sigue al sistema y deja un botón para cambiar.

## Cómo ajustar
- `tema.estilo`: uno de los cinco. `tema.c1` (filetes y botones) y `tema.c2` (precios) cambian los colores; `tema.fuente` y `tema.fuente_cuerpo` las letras (lista cerrada en `esquema.md`).
- **Elegir colores:** `c1` y `c2` deben tener contraste ≥ 4,5:1 contra el fondo (se usan como texto en etiquetas y precios). El generador avisa si no.
- **Un estilo nuevo:** agrega una entrada en `ESTILOS` de `generar-menu.mjs` con sus 12 valores (fondos, textos, líneas y dos colores) y las dos letras; corre `--opciones` y revisa contraste y los 390 px.
- **Traducción de las escalas del formulario:** ver `levantamiento-menu.md`.

## Cómo mostrarlas al cliente
1. Publica la carpeta de maquetas con `noindex` (las demos y opciones ya lo llevan) y manda el link de `opciones.html`.
2. Pide que las abra **en su celular** (es donde se van a ver) y que diga cuál le gusta y qué cambiaría.
3. Registra la elección en `memoria/decisiones.md` y ajusta `tema`.
