# Sitios de ejemplo · matriz de trazabilidad y matriz CREA

Actualizado el 22-oct-2026. Fuente de los datos que se ven en el sitio: `web/propuesta/fuentes/maquetas.mjs` (carrusel y galería `ejemplos/index.html`).

Dos herramientas de los ramos del semestre:
- **Taller de Emprendimiento (Mod 1.3, encaje producto-cliente):** cada página le habla a un *segmento no atendido* del rubro y usa la **matriz CREA** (Crear, Reducir, Eliminar, Aumentar) para diferenciarse de la oferta típica, no de un competidor puntual.
- **Dirección y Control de Proyectos (PM 03, gestión del alcance):** **matriz de trazabilidad de requisitos**. Cada requisito del pedido se liga a un entregable, a un criterio de aceptación y a un caso de prueba.

## 1. Requisitos del pedido (22-oct-2026) → entregable → criterio → prueba

| Id | Requisito | Entregable | Criterio de aceptación | Caso de prueba |
|---|---|---|---|---|
| R1 | Páginas al nivel del sitio de Bío Digital, con varias animaciones de distinto tipo | 8 sitios en `ejemplos/<id>/` | Cada uno con al menos 4 tipos de movimiento (entrada, aparición al bajar, escena con scroll, interacción con el puntero o el toque) | Guiones `web/herramientas/pruebas/<id>.js` |
| R2 | Basadas en plantillas de 21st.dev u otras, no inventadas | Una plantilla por ejemplo (tabla 2) | La estructura de secciones y el movimiento siguen la plantilla. Lo que cambia (paleta, contenido) va justificado | Capturas de la plantilla vs. el ejemplo (revisor, 1440 px) |
| R3 | Relacionadas con su rubro y diferenciadas entre sí | Segmento y CREA por ejemplo (tabla 3) | No hay dos ejemplos con la misma paleta y tipografía. Cada uno muestra a la vista lo que "crea" | Galería `ejemplos/index.html` |
| R4 | Verlas en el carrusel mientras se deslizan | Capturas reales `ejemplos/<id>.webp` (1200×750) en el carrusel | Las 8 tarjetas usan captura real y enlace | `pruebas/carrusel.js` (paso 1) |
| R5 | Al hacer clic, ver la página como tal | Visor con la página en vivo (escritorio 1440 / celular 390) | Se abre al hacer clic, cambia de ejemplo con flechas y se cierra con Esc | `pruebas/carrusel.js` (pasos 2 a 5) |
| R6 | Un botón para ir a la página | "Abrir la página completa ↗" en el visor y "Ver la página" en la galería | Se abre en otra pestaña | `pruebas/carrusel.js` (paso 2b) |
| R7 | Políticas que funcionen | `privacidad/` y `terminos/`, enlazadas en el pie y en la casilla del formulario | Los enlaces del pie ya no apuntan a `#` | Revisor sobre `/privacidad/` y `/terminos/` |
| R8 | Calidad técnica (heredado de crear-sitio-web) | Todo lo anterior | Desborde 0 a 390 y 1440 px, textos de 12 px o más, áreas táctiles de 44 px o más, cero errores de consola y cero recursos fallidos | `node web/herramientas/revisar.mjs <url>` |

**Exclusiones:** el menú digital Fogón del Sur no se rehízo (es la demo del producto *menú digital* y tiene su propio diseño, de la skill crear-menu-digital). Las fotos son de Unsplash, de uso libre y cargadas desde su servidor, sin descargarlas al proyecto: son referenciales. Las reseñas no se inventaron; donde la plantilla tenía testimonios, se puso otra sección.

## 2. Plantilla de referencia por ejemplo

| Ejemplo | Plantilla | Dónde se ve | Qué se cambió y por qué |
|---|---|---|---|
| Estética · Centro Aurora | Forma pilates studio (21st.dev) | https://21st-pilates.vercel.app/ | Clases → tratamientos. Testimonios → "Lo que cuidamos" (sin reseñas inventadas) |
| Cabañas · Los Copihues | Villa Aurelia (21st.dev) | https://villa-aurelia-cinematic-villa-website-template-v1.21st.app/ | Reseñas → "Un día aquí". Se agregó la reserva por noches del módulo compartido |
| Dental · Clínica Sonríe | Oris Dental (21st.dev) | https://oris-dental-modern-dental-clinic-template-v1.21st.app/ | Equipo con monogramas (sin fotos de personas reales como "doctores"). "Happy clients" → "Sin miedo" |
| Contable · Ríos & Asociados | Taxo (21st.dev) | https://taxo-astro.pages.dev/ | Proyectos y blog → pasos y agenda |
| Técnico · TecnoRápido | Kyntra (21st.dev) | https://kyntra-home-service-booking-app-landing-page-v1.21st.app/ | Azul → verde, para no repetir el azul de dental. Se conservaron el cotizador y el seguimiento |
| Barbería · El Filo | DBC Dallas Barber Club (Framer, gratis) | https://dallasbarbershop.framer.website/ | Productos y reseñas → reserva con barbero. Los barberos se muestran con fotos del local, no de personas identificables |
| Pastelería · Casa Dulce | Boolka (Framer) | https://boolka.framer.website/ | Naranjo → frambuesa (el naranjo ya está en contable). Equipo → encargo de torta en cuatro pasos. Bowlby One → Lilita One (la primera no tiene tildes) |
| Restaurante · Fogón del Sur | Diseño propio (skill crear-menu-digital) | — | Sin cambios |

Se descartó *Crumb* (Framer) para la pastelería porque es en blanco y negro, igual que la barbería.

## 3. Segmento y matriz CREA por ejemplo

| Ejemplo | Segmento al que le habla | Crea | Aumenta | Reduce | Elimina |
|---|---|---|---|---|---|
| Fogón del Sur | Comensal que no conoce el local y duda qué pedir | Ver el plato en 3D sobre la mesa | Fotos y precios claros | Preguntas al garzón | La carta en PDF |
| Centro Aurora | Persona que trabaja todo el día y quiere una pausa sin coordinar por mensajes | Agenda de la semana con horas libres | Privacidad (una persona por sala) | Dudas de precio y duración | Llamar para pedir hora |
| TecnoRápido | Persona que depende de su equipo y no sabe cuánto le costará | Cotizador por falla y seguimiento con código | Transparencia (nada sin aprobar) | Incertidumbre del precio | Llamar para preguntar cómo va |
| Los Copihues | Familia de Concepción que busca escaparse un fin de semana | Reserva directa con total por noches | Sensación del lugar | Ida y vuelta de mensajes | Comisión de intermediarios |
| El Filo | Hombre joven que no quiere hacer fila un sábado | Elegir barbero y hora desde el celular | Identidad de barrio | Espera en el local | La fila por orden de llegada |
| Clínica Sonríe | Adulto que posterga el dentista por miedo o por el precio | Sección "Sin miedo" y reserva por especialista | Explicación de cada tratamiento | Sorpresas en la cuenta | Llamar a recepción |
| Casa Dulce | Familia que necesita una torta para un cumpleaños | Armar el encargo en línea | Calidez de barrio | Coordinación por chat | Ir al local solo a preguntar |
| Ríos & Asociados | Pyme que parte o está atrasada con el SII | Reunión de 30 min agendable en línea | Claridad (pasos y precio fijo) | Trámites presenciales | Jerga y letra chica |

## 4. Cómo volver a verificar

```
node web/herramientas/revisar.mjs http://localhost:4321/ejemplos/<id>/ --probar web/herramientas/pruebas/<id>.js
node web/herramientas/revisar.mjs http://localhost:4321/ --anchos 390 --movimiento --probar web/herramientas/pruebas/carrusel.js
node web/herramientas/capturar-ejemplos.mjs            # vuelve a sacar las 8 capturas del carrusel
cd web/propuesta && node fuentes/generar.mjs 8   # regenera portada, galería y páginas legales
```
Las escenas con scroll (cabañas, dental) se prueban con `--movimiento`. Sin esa opción, el revisor fuerza "movimiento reducido".
