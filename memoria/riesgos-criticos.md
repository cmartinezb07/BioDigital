# Riesgos críticos del planteamiento

Ordenados por impacto. Cada uno anclado a una cifra o hecho concreto del brief.

## 1. CRÍTICO — El presupuesto no cerraba con el modelo de costos original

$57.000 de $80.000 (71%) era la suscripción a Imperio Agéntico, pero esa cifra es el costo **mensual** (59 USD/mes). En un proyecto de 3 meses (sept-nov) el costo real de esa sola línea sería ~$171.000 — más del doble del presupuesto total declarado.

**Estado:** resuelto operativamente — el equipo usó la semana de prueba gratuita para evaluar el producto (agentes de WhatsApp y de voz) y decidió **no comprar la suscripción de 59 USD/mes**, evaluando otras opciones de menor costo. Ver [decisiones.md](decisiones.md).

## 2. IMPORTANTE — Dominios y hosting no deberían salir del capital semilla

Con el presupuesto original, quedaban ~$23.000 para "gastos operacionales menores" tras la suscripción, pero un dominio .cl ronda $8.000-15.000/año y con 3-5 clientes eso ya consume el saldo. **Corrección:** dominio y hosting del cliente van dentro del precio del paquete (costo variable por cliente), no como gasto operacional del equipo. Sigue aplicando aunque ya no se compre Imperio Agéntico — es un principio de estructura de costos, no depende de ese proveedor.

## 3. IMPORTANTE — Ventana de ejecución corta para el ciclo completo por cliente

Entre el inicio del proyecto y fines de noviembre hay ~10-11 semanas. Cada cliente necesita: diagnóstico → venta → registro fotográfico → construcción → capacitación → transferencia. Si los 3-5 clientes se ejecutan en serie, no alcanza — se necesitan **pipelines en paralelo desde la primera semana**.

## 4. MENOR — Verificación de Google Business Profile puede tardar

La verificación de una ficha nueva (postal, teléfono o video) puede tomar días a semanas — es un riesgo de cronograma, no técnico. Debe entrar al plan de cada cliente con margen.

## 5. Estructural — servicios de IA (WhatsApp/voz) introducen costo recurrente, no único

A diferencia de sitio web/dominio/ficha/catálogo (entrega única), los agentes de WhatsApp y voz corren sobre APIs que cobran por uso de forma indefinida. Si se venden, hay que decidir quién paga esa cuenta después de la transferencia: el cliente con su propia cuenta, o el equipo con un cobro mensual de mantención. Detalle en [servicios-vendibles.md](servicios-vendibles.md).

## 6. Recordatorio propio del ramo (no genérico)

Dirección y Control de Proyectos suele interrogar a cada integrante por separado y calificar según el dominio individual demostrado. Cada uno de los 5 debería poder explicar sin apoyo el modelo de scoring, el presupuesto y el cronograma — no solo la parte que ejecutó.

## Fecha de campo desalineada

La Jornada de Terreno estaba fijada para el viernes 11 de septiembre de 2026. **No se ejecutó.** Se propone el viernes 2-oct-2026 como Jornada 1 y el 16-oct como Jornada 2 condicional (ver [PRD.md](../PRD.md) §9). Esto reduce la ventana de implementación a ~7 semanas y agrava el riesgo #3.
