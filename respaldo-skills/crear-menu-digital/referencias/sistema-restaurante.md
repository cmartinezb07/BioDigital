# Sistema del restaurante: arquitectura, archivos, reglas y pruebas

Fuente de verdad: el repo (`web/propuesta/ejemplos/fogon-del-sur/` = plantilla y demo; `web/herramientas/` = herramientas). Esta nota resume lo necesario para trabajar sin releer el código. Estado y decisiones: `memoria/decisiones.md`, `memoria/plantilla-restaurante.md`, `memoria/conexion-nube.md`.

## Piezas
| Qué | Dónde |
|---|---|
| Carta pública (datos, no HTML fijo) | `index.html` + `menu.js` (dibuja) + `carta.js` (datos: caché local, `carta-base.json` de respaldo, fotos subidas, edición del dueño) |
| Pedir, carrito, opciones, validación, "modificar mi pedido" | `pedir.js` (+ `pedidos.js`: caché de pedidos, escritura optimista, errores del servidor) |
| Seguimiento del pedido (mapa, juego, opinión) | `pedido/` + `seguimiento.js`, `juego.js` |
| Historial del cliente | `mis-pedidos/` + `mispedidos.js` |
| Cocina (tablero de 5 columnas) | `cocina/` + `cocina.js` |
| Reparto (GPS del celular) | `repartidor/` + `repartidor.js` |
| Panel del restaurante (acceso por código) | `panel/` + `panel.js` (marco, pedidos, estadísticas, opiniones), `panel-carta.js`, `panel-negocio.js` |
| Pago de prueba (solo demo) | `pagar/` + `pagar.js` |
| Configuración de CADA local | `restaurante.config.js` (negocio, nombre, `demo`, PIN visibles solo en demo) |
| Acceso y base de datos | `../_compartido/nube.js` (en un local real se copia a la carpeta como `nube.js`) |

## Base de datos (Supabase `biodigital-demos`, esquema `demo`)
- Tablas: `items(negocio, col, id, data, pub, creado, updated)`, `roles(negocio, rol, nombre, pin, cols, activo)`, `cols` (permisos del cliente por columna). Columnas por local: `pedidos`, `visitas`, `carta`, `fotos`.
- Solo se exponen funciones (`nube_leer/escribir/vaciar/borrar/rol/quien/importar/personal_*`). El cliente es "capacidad por código secreto" (su id de pedido); el personal entra con PIN. **Cada local es un `negocio`**: PIN, carta, pedidos y fotos no se mezclan. Ninguna función nombra un local en particular.
- Reglas (trigger `demo.pedido_reglas` + `pedido_normalizar` + `transicion_ok`): precios y opciones contra la carta publicada; mínimo y envío por comuna; estados por rol (cliente → recibido; cocina/jefe → aceptado, preparación, listo, entregado en mesa y retiro; reparto/jefe → en camino y entregado en delivery); un pedido "Nuevo" por sesión; modificar solo en "recibido" con `baseRev` (si cambió el estado, se rechaza con explicación) y `ediciones` con las versiones anteriores; `tomar` = un solo repartidor. El rol llega por `set_config('demo.rol', …)` desde las funciones; `nube_importar` entra como "sistema" (cargas masivas).
- `nube_escribir` devuelve `{error: …}` con códigos (`no_modificable`, `conflicto`, `precio_cambio`, `plato_agotado`, `opcion_invalida`, `minimo_delivery`, `falta:campo`, `transicion_invalida`, `asignado_a_otro`…); `pedidos.js › parseError` los traduce a mensajes.

## Servicios, pagos y modo demo
- `carta.config.servicios` (`mesa`/`retiro`/`delivery`) decide qué modos ofrece la pantalla; `config.pagoEnLinea` (true solo en la demo) muestra o no el pago de prueba.
- `RESTAURANTE.demo`: true = muestra PIN, nota de demostración y botón "simular recorrido". Un local real: `false` (lo deja así `nuevo-restaurante.mjs` sin `--demo`).

## Herramientas
| Herramienta | Para qué |
|---|---|
| `aplicar-formulario.mjs` | Formulario → restaurante completo (carpeta, carta, SQL de accesos, prueba, pendientes) |
| `nuevo-restaurante.mjs` | Copia la plantilla con otro nombre/negocio y PIN al azar (la usa la anterior) |
| `cargar-carta-base.mjs <negocio> <PIN> [carpeta]` | Publica la `carta-base.json` de una carpeta como carta publicada |
| `pedidos-reglas-e2e.mjs`, `nube-e2e.mjs` | 62 reglas del servidor y 25 permisos, contra la base real (limpian lo suyo) |
| `revisar.mjs` · `scroll.mjs` · `check.mjs` | Revisor de páginas (390/1440 px) y guiones de `pruebas/`; scroll real; check completo → `memoria/CHECK.md` |
| `capturar-ejemplos.mjs` + `semillas-restaurante.mjs` | Imágenes de la portada; la cocina y el panel se capturan desde una copia (`captura-fogon`) con 56 pedidos y 140 visitas de muestra que se borran al terminar |

## Cómo se muestra el restaurante en el sitio de Bío Digital
- Dos páginas: `fogon-del-sur/` (menú y pedir) y `fogon-del-sur/panel/` (códigos de cocinero, repartidor y jefe en la demo). Cocina y reparto sin código mandan al panel; con código, el panel manda a cada uno a lo suyo.
- Portada: carrusel con 4 imágenes seguidas (`fogon-del-sur`, `restaurante-seguimiento`, `restaurante-cocina`, `restaurante-panel`) definidas en `web/propuesta/fuentes/maquetas.mjs` (`destino`, `soloCarrusel`, `capturaRuta`); las dos primeras llevan al menú y las otras dos al panel. La galería `ejemplos/` muestra solo menú y panel. Regenerar con `node web/propuesta/fuentes/generar.mjs 8` y recapturar con `capturar-ejemplos.mjs` si cambia el diseño.
- Publicar la demo: solo en https://biodigital-bgw.pages.dev (ver `contexto_biodigital`).

## Trampas conocidas
- Un helper de parches que devuelve el texto sin cambios puede dejar edits "aplicados" en silencio: verificar con `grep` después de editar.
- El carrito, los pedidos y la sesión del cliente se guardan en `localStorage`/`sessionStorage` con el negocio en la clave: para probar varios pedidos desde la misma página, rotar `fogon-sesion-<negocio>`.
- Un cliente solo puede tener un pedido "Nuevo": las pruebas rotan la sesión entre pedidos.
- Navegador integrado: si el panel está oculto no carga imágenes diferidas ni anima; el servidor local (`maquetas`, puerto 4321) se apaga al reiniciar la sesión.
- Las pruebas escriben en la base real con nombres `zz-…` y limpian al terminar; si queda algo, `Nube.borrar` con el PIN del jefe.
