# Check del sitio · 24 de octubre de 2026 a las 8:44 p. m.

Revisado en: http://localhost:4321 · 27 de 27 páginas sin observaciones · 25 de 25 pruebas de la conexión en la nube sin fallas.
Para repetirlo: `node web/herramientas/check.mjs` (vista previa) o `node web/herramientas/check.mjs http://localhost:4321` (local).

## 1. Revisión automática (celular 390 px y escritorio 1440 px)

Criterios (de la skill crear-sitio-web): sin desborde horizontal, textos de 12 px o más, áreas táctiles de 44 px o más, imágenes con texto alternativo, consola sin errores, ningún recurso que falle y la prueba de interacción completa.

| Página | Resultado | Desborde | Textos < 12 px | Táctiles < 44 px | Img sin alt | Errores | Recursos fallidos | Prueba |
|---|---|---|---|---|---|---|---|---|
| [Portada (carrusel y visor)](http://localhost:4321/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 9/9 |
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
| [Ejemplo · Restaurante (menú con pedidos)](http://localhost:4321/ejemplos/fogon-del-sur/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 23/23 |
| [Restaurante · Pago del pedido](http://localhost:4321/ejemplos/fogon-del-sur/pagar/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Restaurante · Tu pedido (ejemplo) y juegos de espera](http://localhost:4321/ejemplos/fogon-del-sur/pedido/?demo) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 12/12 |
| [Restaurante · Panel del restaurante (acceso por código; cocina y reparto entran por aquí)](http://localhost:4321/ejemplos/fogon-del-sur/cocina/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Restaurante · Mis pedidos (cliente)](http://localhost:4321/ejemplos/fogon-del-sur/mis-pedidos/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 6/6 |
| [Restaurante · Servicio completo (cliente, cocina, reparto y dueño)](http://localhost:4321/ejemplos/fogon-del-sur/panel/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 20/20 |
| [Restaurante · Panel del dueño (pedidos en vivo, carta, estadísticas)](http://localhost:4321/ejemplos/fogon-del-sur/panel/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 23/23 |
| [Pastelería · Carta](http://localhost:4321/ejemplos/casa-dulce/carta/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Sistema de reservas (cliente)](http://localhost:4321/ejemplos/reservas/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 16/16 |
| [Sistema de reservas (panel, pide PIN)](http://localhost:4321/ejemplos/reservas/admin/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Fidelización (cliente)](http://localhost:4321/ejemplos/fidelizacion/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 6/6 |
| [Fidelización (caja del local, pide PIN)](http://localhost:4321/ejemplos/fidelizacion/local/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Cómo trabajamos](http://localhost:4321/como-trabajamos/) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| [Módulo de reservas (demo)](http://localhost:4321/ejemplos/_compartido/reservas-demo.html) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ 60/60 |

## 1b. Conexión en la nube (reservas, fidelización y pedidos)

Permisos por PIN, privacidad del cliente, cupos que no se venden dos veces y reglas contra trampas, probados directo contra la base (`node web/herramientas/nube-e2e.mjs`). Lo que crea la prueba se borra al terminar.

| Prueba | Resultado |
|---|---|
| R1 de 4 reservas simultáneas a una cabaña con 2 unidades entran solo 2 | ✅ |
| R2 una estadía larga cabe entre dos cortas (2 unidades) y la siguiente ya no | ✅ |
| R3 una retención vencida libera la fecha | ✅ |
| R4 una reserva cancelada libera la fecha | ✅ |
| R5 sin código, el cliente ve las fechas ocupadas pero ninguna reserva ni dato personal | ✅ |
| R5b con su código ve solo su reserva completa | ✅ |
| R6 recepción ve todas las reservas con sus datos | ✅ |
| R6b recepción no puede vaciar las reservas | ✅ |
| R6c la configuración no se cambia sin PIN, y con PIN sí | ✅ |
| R6d el cliente lee la configuración que publicó el equipo | ✅ |
| R6e el PIN de otro negocio o uno inventado no sirve para la configuración | ✅ |
| F1 el cliente abre su tarjeta en cero | ✅ |
| F2 no puede abrir una tarjeta con sellos | ✅ |
| F3 no puede sumarse sellos a sí mismo | ✅ |
| F4 la caja suma el sello y el cliente lo ve | ✅ |
| F5 el cliente solo registra su alta, no sellos | ✅ |
| F6 la caja ve todas las tarjetas; un cliente sin código ve ninguna | ✅ |
| F7 el PIN de la caja no abre las reservas | ✅ |
| P1 otro cliente no ve el pedido ajeno | ✅ |
| P2 el cliente no puede cambiar el estado de su pedido (ni reemplazarlo); solo agregar su pago | ✅ |
| P2b un pedido nuevo no puede nacer ya entregado | ✅ |
| P3 la cocina ve los pedidos con sus datos | ✅ |
| P4 el repartidor no ve las visitas (solo el dueño) | ✅ |
| P5 las visitas se registran sin PIN | ✅ |
| Z limpieza: no queda nada de la prueba | ✅ |

## 2. Revisión a ojo (marca cada casilla al verla)

- [ ] **Carrusel de la portada** ([abrir](http://localhost:4321/#ejemplos)): las 8 tarjetas giran con la captura real de cada ejemplo.
- [ ] **Visor**: al hacer clic en una tarjeta se ve la página en vivo; cambia entre Escritorio y Celular; las flechas pasan de ejemplo; "Abrir la página completa ↗" abre otra pestaña; Esc cierra.
- [ ] **Antes de contratar** ([abrir](http://localhost:4321/antes-de-contratar/)): no nombra marcas, cada falla tiene su fuente y las cifras dicen "aprox."; revisar cada 3 meses.
- [ ] **Fidelización** ([abrir](http://localhost:4321/#planes)): ya no promete Google Wallet ni Apple Wallet a precio único.
- [ ] **Políticas** ([privacidad](http://localhost:4321/privacidad/), [términos](http://localhost:4321/terminos/)): el equipo leyó los plazos y el retracto propuestos.
- [ ] **Galería** ([abrir](http://localhost:4321/ejemplos/)): cada ejemplo muestra su segmento y su matriz CREA.
- [ ] **Cada ejemplo frente a su plantilla** (tabla en `memoria/ejemplos-matriz.md`): la estructura y el movimiento se parecen y los colores no se repiten entre ejemplos.
- [ ] **En un celular real** (no solo en el emulador): portada, un ejemplo con reservas y el menú con pedidos.
- [ ] **Sistemas en dos pestañas**: un pedido en Fogón del Sur aparece en la cocina y el seguimiento avanza; una reserva en una pestaña baja la disponibilidad en la otra; un sello sumado en la caja aparece en la tarjeta.

## 3. Decisiones pendientes del equipo

Detalle y cifras en `memoria/competencia.md` (§9 y §10), `memoria/menu-pedidos.md` y `memoria/reservas-sistema.md`. Ya decidido el 23-oct: sin ficha de Google por ahora, sin garantía 50/50, fidelización QR hecha.

- [ ] Precio de la versión de restaurante con pedidos y delivery, y de las reservas completas (hoy "a cotizar"), separando instalación única de costos mensuales de terceros.
- [ ] ¿Plazo para la garantía de corrección de errores (hoy sin plazo en los términos)?
- [ ] ¿Qué se pide a los primeros 5 clientes (caso documentado y reseña)?
- [ ] Plazos de las políticas (12 meses de retención, 15 días hábiles de respuesta, retracto de 10 días) y razón social o RUT.
- [ ] Commit en git y, cuando termine la fase de pagos, publicación en Production con la versión pública (`node fuentes/generar.mjs --publico 8`).
