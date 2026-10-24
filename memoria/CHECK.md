# Check del sitio · 24 de octubre de 2026 a las 2:08 p. m.

Revisado en: http://localhost:4321 · 24 de 24 páginas sin observaciones.
Para repetirlo: `node web/herramientas/check.mjs` (vista previa) o `node web/herramientas/check.mjs http://localhost:4321` (local).

## 1. Revisión automática (celular 390 px y escritorio 1440 px)

Criterios (de la skill crear-sitio-web): sin desborde horizontal, textos de 12 px o más, áreas táctiles de 44 px o más, imágenes con texto alternativo, consola sin errores, ningún recurso que falle y la prueba de interacción completa.

| Página | Resultado | Desborde | Textos < 12 px | Táctiles < 44 px | Img sin alt | Errores | Recursos fallidos | Prueba |
|---|---|---|---|---|---|---|---|---|
| [Portada (carrusel y visor)](http://localhost:4321/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 7/7 |
| [Portada · Mira tu página](http://localhost:4321/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 5/5 |
| [Galería de ejemplos](http://localhost:4321/ejemplos/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Política de privacidad](http://localhost:4321/privacidad/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Términos del servicio](http://localhost:4321/terminos/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Antes de contratar](http://localhost:4321/antes-de-contratar/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Ejemplo · Estética (Forma)](http://localhost:4321/ejemplos/estetica/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 7/7 |
| [Ejemplo · Cabañas (Villa Aurelia)](http://localhost:4321/ejemplos/cabanas/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 8/8 |
| [Ejemplo · Dental (Oris)](http://localhost:4321/ejemplos/dental/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 4/4 |
| [Ejemplo · Contable (Taxo)](http://localhost:4321/ejemplos/estudio-contable/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 5/5 |
| [Ejemplo · Técnico (Kyntra)](http://localhost:4321/ejemplos/tecnico/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 8/8 |
| [Ejemplo · Barbería (DBC)](http://localhost:4321/ejemplos/barberia/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 5/5 |
| [Ejemplo · Pastelería (Boolka)](http://localhost:4321/ejemplos/casa-dulce/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 7/7 |
| [Ejemplo · Restaurante (menú 3D y pedidos)](http://localhost:4321/ejemplos/fogon-del-sur/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 11/11 |
| [Restaurante · Cocina](http://localhost:4321/ejemplos/fogon-del-sur/cocina/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Restaurante · Repartidor](http://localhost:4321/ejemplos/fogon-del-sur/repartidor/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Restaurante · Panel del dueño (caso base: servicio automático)](http://localhost:4321/ejemplos/fogon-del-sur/panel/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 13/13 |
| [Pastelería · Carta](http://localhost:4321/ejemplos/casa-dulce/carta/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Sistema de reservas (cliente)](http://localhost:4321/ejemplos/reservas/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 16/16 |
| [Sistema de reservas (panel)](http://localhost:4321/ejemplos/reservas/admin/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Fidelización (cliente)](http://localhost:4321/ejemplos/fidelizacion/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 6/6 |
| [Fidelización (caja del local)](http://localhost:4321/ejemplos/fidelizacion/local/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Cómo trabajamos](http://localhost:4321/como-trabajamos/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Módulo de reservas (demo)](http://localhost:4321/ejemplos/_compartido/reservas-demo.html) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 60/60 |

## 2. Revisión a ojo (marca cada casilla al verla)

- [ ] **Carrusel de la portada** ([abrir](http://localhost:4321/#ejemplos)): las 8 tarjetas giran con la captura real de cada ejemplo.
- [ ] **Visor**: al hacer clic en una tarjeta se ve la página en vivo; cambia entre Escritorio y Celular; las flechas pasan de ejemplo; "Abrir la página completa ↗" abre otra pestaña; Esc cierra.
- [ ] **Antes de contratar** ([abrir](http://localhost:4321/antes-de-contratar/)): no nombra marcas, cada falla tiene su fuente y las cifras dicen "aprox."; revisar cada 3 meses.
- [ ] **Fidelización** ([abrir](http://localhost:4321/#planes)): ya no promete Google Wallet ni Apple Wallet a precio único.
- [ ] **Políticas** ([privacidad](http://localhost:4321/privacidad/), [términos](http://localhost:4321/terminos/)): el equipo leyó los plazos y el retracto propuestos.
- [ ] **Galería** ([abrir](http://localhost:4321/ejemplos/)): cada ejemplo muestra su segmento y su matriz CREA.
- [ ] **Cada ejemplo frente a su plantilla** (tabla en `memoria/ejemplos-matriz.md`): la estructura y el movimiento se parecen y los colores no se repiten entre ejemplos.
- [ ] **En un celular real** (no solo en el emulador): portada, un ejemplo con reservas y el menú 3D.
- [ ] **Sistemas en dos pestañas**: un pedido en Fogón del Sur aparece en la cocina y el seguimiento avanza; una reserva en una pestaña baja la disponibilidad en la otra; un sello sumado en la caja aparece en la tarjeta.

## 3. Decisiones pendientes del equipo

Detalle y cifras en `memoria/competencia.md` (§9 y §10), `memoria/menu-pedidos.md` y `memoria/reservas-sistema.md`. Ya decidido el 23-oct: sin ficha de Google por ahora, sin garantía 50/50, fidelización QR hecha.

- [ ] Precio de la versión de restaurante con pedidos y delivery, y de las reservas completas (hoy "a cotizar"), separando instalación única de costos mensuales de terceros.
- [ ] ¿Plazo para la garantía de corrección de errores (hoy sin plazo en los términos)?
- [ ] ¿Qué se pide a los primeros 5 clientes (caso documentado y reseña)?
- [ ] Plazos de las políticas (12 meses de retención, 15 días hábiles de respuesta, retracto de 10 días) y razón social o RUT.
- [ ] Commit en git y, cuando termine la fase de pagos, publicación en Production con la versión pública (`node fuentes/generar.mjs --publico 8`).
