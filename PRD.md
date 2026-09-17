# PRD — Bío Digital

| Campo | Valor |
|---|---|
| Versión | 0.2 (borrador interno, no compartir aún) — v0.2: término en diciembre, organización del equipo, formalización tributaria |
| Fecha | 16-sep-2026 |
| Estado | En revisión — ver §14 Preguntas abiertas antes de aprobar |
| Ramo | Dirección y Control de Proyectos — línea Proyectos de inversión |
| Equipo | Benjamín Alvear, Christhoper Martínez, Eduardo Ruiz, Xavier Godoy, Marcos Seguel |
| Documentos relacionados | [contexto.md](contexto.md) · [MEMORY.md](MEMORY.md) · [memoria/](memoria/) |

**Convención:** todo lo marcado `[SUPUESTO]` es una estimación que el equipo debe validar o reemplazar por un dato real. Ninguna cifra marcada así debe presentarse como hecho.

---

## 1. Resumen ejecutivo

Bío Digital vende e implementa **presencia digital llave en mano** (ficha de Google Business, fotos, catálogo, sitio web, dominio y correo) a micro y pequeñas empresas del Gran Concepción. Cada cliente recibe el activo **transferido formalmente** —a su nombre, con capacitación y acta de entrega— y queda sin depender del equipo.

El PRD especifica dos capas:

1. **El servicio** (lo que compra el cliente): paquetes, entregables, criterios de aceptación y proceso de entrega.
2. **Radar** *(nombre tentativo)*: la herramienta interna en Python + Streamlit que construye la base de prospectos, los prioriza con un modelo de scoring, genera los diagnósticos que se usan como gancho comercial y sigue el embudo de ventas.

**Meta del semestre:** entre 3 y 5 clientes con su proyecto cerrado, pagado y transferido. El escenario base de este documento es **4 clientes**.

**Por qué existe Radar:** según el §8, conseguir un cliente cuesta del orden de 10 horas-persona (se necesitan ~14 diagnósticos por cierre), casi lo mismo que entregar un paquete Base. Automatizar el diagnóstico y enfocar las visitas en los mejores prospectos es la palanca de margen más grande del proyecto.

---

## 2. Problema

### 2.1 Enunciado

El dueño de una MyPE pierde clientes que lo buscan en Google, Maps o Instagram y lo encuentran a él con menor visibilidad que a su competencia, o no lo encuentran. No sabe cuánto está perdiendo porque nunca ha medido esa brecha. No actúa por el costo percibido de una agencia, por falta de tiempo y porque no sabe qué es "suficiente", no porque rechace lo digital.

### 2.2 Estado de la evidencia

Todavía **no hay evidencia primaria**: la jornada de terreno no se ha hecho. El problema es una hipótesis que la jornada debe validar:

| Hipótesis | Cómo se valida | Criterio de invalidación |
|---|---|---|
| H1: Una fracción relevante de las MyPE objetivo tiene una ficha de Google ausente o incompleta | Auditoría de Radar sobre la base de prospectos | < 30% de la base con brecha en su ficha `[SUPUESTO de umbral]` |
| H2: El dueño reconoce la brecha cuando ve su diagnóstico | Reacción registrada en la visita (escala 1-5) | Mediana < 3 |
| H3: El dueño está dispuesto a pagar ≥ $150.000 | Tasa de propuestas aceptadas | 0 cierres tras 15 propuestas |

Si H3 falla, se revisa el precio o el paquete antes de seguir prospectando, en vez de visitar más negocios con la misma oferta.

---

## 3. Objetivos, métricas y no-objetivos

### 3.1 Objetivos del semestre

| ID | Objetivo | Métrica | Meta |
|---|---|---|---|
| O1 | Cerrar clientes | Proyectos cerrados, pagados y con acta firmada | ≥ 3 (base 4, máx. 5) |
| O2 | Retorno sobre el capital | Ingreso neto / capital aportado ($80.000) | ≥ 4× `[SUPUESTO]` |
| O3 | Entregar a tiempo | % de clientes transferidos dentro del plazo comprometido | 100% |
| O4 | Satisfacción | Nota del cliente al cierre (1-7) | ≥ 6,0 promedio |
| O5 | Radar operativo | Diagnósticos generados por Radar vs. a mano | ≥ 90% por Radar |

### 3.2 Métricas del embudo (se miden desde la primera jornada)

Tasa diagnóstico → reunión, tasa reunión → propuesta, tasa propuesta → cierre, ticket promedio, días desde el cierre hasta la transferencia y referidos por cliente.

### 3.3 No-objetivos (este semestre)

- Agente de voz: no calza con el cliente ideal por costo por minuto y volumen de llamadas (ver [servicios-vendibles.md](memoria/servicios-vendibles.md)).
- E-commerce con pagos en línea.
- Gestión de redes sociales como servicio mensual.
- Radar como producto para terceros: es una herramienta interna.
- Validación estadística del scoring: con 3-5 cierres no es posible (ver §6.4).

---

## 4. Usuarios

| Persona | Quién es | Qué necesita | Qué le preocupa |
|---|---|---|---|
| **Dueño de la MyPE** (cliente) | Dueño de un restaurante, peluquería, taller, almacén o consulta en el Gran Concepción, con poco tiempo y conocimiento digital limitado | Que lo encuentren, verse profesional y no tener que aprender a usar plataformas | Pagar por algo que no entiende, que lo dejen botado, perder el control de su número o su cuenta |
| **Integrante en terreno** (usuario de Radar) | Integrante del equipo que visita prospectos | Saber a quién visitar primero y llevar un diagnóstico listo e impreso | Perder tiempo con prospectos sin capacidad de pago |
| **Integrante implementador** (usuario de Radar) | Integrante que construye los entregables | Checklist claro por paquete y material del cliente a tiempo | Clientes que no entregan fotos, textos o accesos |
| **Profesor** (mandante) | Evalúa el proyecto | Evidencia de planificación y control: EDT, cronograma, presupuesto, riesgos, avance | Que el equipo no pueda defender individualmente lo que presenta |

---

## 5. Capa 1 — El servicio

### 5.1 Paquetes

| | **Base** | **Estándar** | **Premium** |
|---|---|---|---|
| Precio `[SUPUESTO — validar en terreno]` | $150.000 | $250.000 | $380.000 |
| Ficha Google Business optimizada | ✔ | ✔ | ✔ |
| Registro fotográfico (10-15 fotos editadas) | ✔ | ✔ | ✔ |
| Catálogo digital | PDF | PDF | Interactivo (en el sitio) |
| Sitio web | — | Landing de 1 página | 3-5 secciones |
| Dominio .cl (1 año) + correo corporativo | — | ✔ | ✔ |
| Capacitación + acta de entrega | 1 sesión | 1 sesión | 2 sesiones |
| Soporte post-entrega | 7 días | 14 días | 30 días |
| Upsell: agente de WhatsApp | — | — | Opcional, fase 2 (§5.6) |

**Regla de precio:** el dominio, el hosting y cualquier otro costo de terceros del cliente van **incluidos en el precio** del paquete y se registran a nombre del cliente. No se pagan con el capital del equipo.

### 5.2 Criterios de aceptación por entregable

Un entregable se considera terminado solo si cumple todos sus criterios.

| Entregable | Criterios de aceptación |
|---|---|
| Ficha Google Business | Verificada por Google · categoría principal y secundarias correctas · horario, teléfono, dirección y enlace completos · ≥ 10 fotos propias · descripción con palabras clave locales · el cliente es **propietario** de la ficha y el equipo solo tiene rol de administrador, que se revoca al transferir |
| Registro fotográfico | 10-15 fotos editadas en alta resolución y en formato web · fachada, interior, productos y equipo · entregadas en carpeta del cliente · autorización de uso de imagen si aparecen personas |
| Catálogo PDF | Productos o servicios con precios vigentes validados por el cliente · archivo editable entregado (Canva compartido con el cliente) |
| Landing / sitio | Carga en < 3 s en celular `[SUPUESTO de umbral]` · adaptado a celular · botón de WhatsApp y de llamada · mapa · HTTPS activo · textos aprobados por escrito por el cliente |
| Dominio + correo | Dominio registrado en NIC Chile **a nombre (RUT) del cliente** · correo funcionando para envío y recepción · credenciales entregadas en el acta |
| Capacitación | El cliente ejecuta sin ayuda: responder una reseña, cambiar el horario de su ficha y subir una foto |
| Acta de entrega | Lista de activos, credenciales y titularidad · firma del cliente y de un integrante · copia para ambas partes |

### 5.3 Proceso de entrega por cliente

```
Diagnóstico → Visita → Propuesta → Cierre + anticipo → Levantamiento → Producción → Revisión → Capacitación + acta → Pago final → Soporte
```

| Etapa | Duración objetivo | Salida | Dependencia crítica |
|---|---|---|---|
| Propuesta | ≤ 48 h desde la visita | PDF con el paquete recomendado por Radar | — |
| Cierre | — | Contrato simple firmado + **50% de anticipo** `[SUPUESTO de política]` | — |
| Levantamiento | 1 visita (1-2 h) | Fotos, textos, accesos, datos para el dominio | **El cliente entrega el material** |
| Producción | 3-7 días hábiles según paquete | Entregables en borrador | Verificación de Google (puede tardar días o semanas) |
| Revisión | 1 ronda incluida | Aprobación escrita del cliente | — |
| Capacitación + acta | 1 sesión | Acta firmada | — |
| Pago final | Contra acta | Saldo del 50% + documento tributario | Mecanismo de facturación definido (§8.4) |

**Regla anti-atasco:** si el cliente no entrega su material en 5 días hábiles, el plazo de entrega se corre por los mismos días y se deja registrado. Es el riesgo operativo más probable de este tipo de servicio (ver §11).

**Regla de verificación de Google:** la verificación de la ficha se inicia el mismo día del cierre, porque es la dependencia más lenta y no la controla el equipo.

### 5.4 Qué NO incluye el servicio

Publicidad pagada, administración de redes sociales, redacción mensual de contenido, cambios después del período de soporte, fotografía de producto de estudio y tienda en línea con pagos.

### 5.5 Transferencia

El principio es que **el cliente es dueño de todo**. El dominio queda a su RUT, la ficha de Google tiene al cliente como propietario, y las cuentas se crean con su correo. Al firmar el acta, el equipo revoca sus propios accesos o los deja documentados como "administrador temporal hasta [fecha]".

### 5.6 Upsell de fase 2: agente de WhatsApp

- **Se activa solo si** el equipo lo tiene funcionando en un negocio de prueba propio durante ≥ 2 semanas sin incidentes.
- **Canal:** exclusivamente la API oficial de WhatsApp Business (Meta Cloud API o un proveedor que la use). Se prohíben las librerías no oficiales porque pueden hacer que Meta bloquee el número del cliente.
- **Alcance inicial:** bot de menú (horarios, ubicación, catálogo, derivación a humano). El modo conversacional con IA queda para después.
- **Costo recurrente:** lo paga el cliente con su propia cuenta y medio de pago, o el equipo cobra una mantención mensual. **Decisión pendiente** (§14).

---

## 6. Capa 2 — Radar (herramienta interna)

### 6.1 Propósito

Pasar de "visitar a quien se cruce" a "visitar primero a quien tiene más brecha y más capacidad de pago", y producir un diagnóstico impreso en minutos en vez de en horas.

### 6.2 Módulos y requisitos funcionales

Prioridad MoSCoW: **M** = imprescindible para la jornada de terreno · **S** = debería estar antes del primer cierre · **C** = deseable · **W** = no este semestre.

**M1 — Base de prospectos**

| ID | Requisito | Prioridad |
|---|---|---|
| RF-01 | Importar prospectos desde CSV/Excel con el esquema definido en §6.5 | M |
| RF-02 | Crear y editar un prospecto a mano desde un formulario | M |
| RF-03 | Detectar duplicados por nombre normalizado + dirección, o por teléfono | M |
| RF-04 | Registrar la fuente de cada dato (manual, municipal, directorio público) | M |
| RF-05 | Filtrar por comuna, rubro y estado del embudo | S |
| RF-06 | Ver los prospectos en un mapa | C |

**M2 — Scoring**

| ID | Requisito | Prioridad |
|---|---|---|
| RF-07 | Calcular un score de 0 a 100 por prospecto según §6.3 | M |
| RF-08 | Mostrar el desglose del score por componente, para poder explicarlo en la defensa | M |
| RF-09 | Recomendar un paquete según las reglas de §6.3 | M |
| RF-10 | Versionar los pesos (`scoring_v1`, `v2`…) y guardar con qué versión se puntuó cada prospecto | S |
| RF-11 | Reporte de conversión por tercil de score (§6.4) | S |

**M3 — Diagnóstico**

| ID | Requisito | Prioridad |
|---|---|---|
| RF-12 | Formulario de auditoría con la rúbrica de §6.6 (tiempo objetivo ≤ 10 min por prospecto) | M |
| RF-13 | Generar un PDF de 1 página: puntaje, 3 brechas principales, qué gana el negocio al cerrarlas y un llamado a la acción | M |
| RF-14 | Generar diagnósticos en lote para los N prospectos con mejor score | S |
| RF-15 | Código QR en el PDF hacia el WhatsApp del equipo | C |

**M4 — Embudo**

| ID | Requisito | Prioridad |
|---|---|---|
| RF-16 | Estados: `nuevo → diagnosticado → visitado → reunión → propuesta → cerrado / perdido` | M |
| RF-17 | Registrar cada interacción (fecha, integrante, resultado, reacción 1-5, motivo de pérdida) | M |
| RF-18 | Seguimiento de cada cliente cerrado: etapa de §5.3, material pendiente y fecha comprometida | S |

**M5 — Tablero**

| ID | Requisito | Prioridad |
|---|---|---|
| RF-19 | Embudo con tasas de conversión reales vs. supuestas (§8.1) | S |
| RF-20 | Ingresos cerrados vs. meta y presupuesto ejecutado vs. planificado | S |
| RF-21 | Exportar a Excel para los informes del ramo | S |

**Fuera de alcance (W):** scraping automatizado de Google Maps o Meta, envío masivo de mensajes y login con múltiples roles.

### 6.3 Modelo de scoring v1

Score = Brecha digital (0-40) + Capacidad de pago (0-30) + Accesibilidad (0-20) + Señales de intención (0-10). **Los pesos son `[SUPUESTO]`** y se recalibran después de la primera jornada.

| Componente | Variable | Puntos |
|---|---|---|
| **Brecha digital (40)** | Sin ficha de Google / ficha sin reclamar | 15 / 10 |
| | Ficha con < 5 fotos o sin horario | 5 |
| | Sin sitio web | 10 |
| | < 10 reseñas o reseñas sin responder | 10 |
| **Capacidad de pago (30)** | Rubro con ticket medio-alto (gastronomía, salud, automotriz, belleza) | 10 |
| | Local físico en un eje comercial | 10 |
| | Señales de formalidad (patente visible, factura/boleta, > 2 años de operación) | 10 |
| **Accesibilidad (20)** | Comuna dentro de la ruta de la jornada | 10 |
| | Dueño presente en el local o contacto directo disponible | 10 |
| **Intención (10)** | Activo en Instagram/Facebook pero sin web ni ficha completa | 10 |

**Reglas de recomendación de paquete:**
- Brecha solo en la ficha y en las fotos → **Base**.
- Sin web, y capacidad de pago ≥ 20 → **Estándar**.
- Sin web, capacidad de pago = 30 y catálogo amplio (> 20 ítems) → **Premium**.

**Exclusiones duras** (score = 0): negocio con presencia digital completa, negocio sin local ni contacto, y negocio que declaró no estar interesado.

### 6.4 Validación honesta del scoring

Con 3-5 cierres **no se puede probar estadísticamente** que el score prediga la venta. Por eso se valida con un indicador intermedio que tiene más volumen: la **tasa de reunión agendada**, comparada entre el tercil alto y el tercil bajo del score. Si el tercil alto no convierte al menos 1,5 veces más que el bajo después de ≥ 30 visitas `[SUPUESTO de umbral]`, se recalibran los pesos (v2) y el cambio se documenta. Esta limitación debe decirse tal cual en la presentación: es más defendible que afirmar que el modelo funciona sin evidencia.

### 6.5 Modelo de datos

```
prospecto(id, nombre, rubro, comuna, direccion, telefono, instagram, url_web,
          ficha_google_estado, n_fotos, n_resenas, anios_operacion, fuente,
          score, score_version, paquete_recomendado, estado, creado_en)
diagnostico(id, prospecto_id, fecha, puntaje_total, detalle_json, pdf_path, autor)
interaccion(id, prospecto_id, fecha, integrante, tipo, resultado, reaccion_1a5, nota)
proyecto_cliente(id, prospecto_id, paquete, precio, anticipo_pagado, etapa,
                 material_pendiente, fecha_comprometida, fecha_acta, nota_cliente)
```

### 6.6 Rúbrica del diagnóstico (0-100)

| Dimensión | Puntos | Qué se revisa |
|---|---|---|
| Encontrabilidad | 30 | ¿Aparece en Maps al buscar "[rubro] [comuna]"? ¿Tiene ficha verificada? |
| Información completa | 20 | Horario, teléfono, dirección, enlace y categoría correctos |
| Imagen | 20 | Cantidad y calidad de las fotos; fotos propias vs. subidas por usuarios |
| Reputación | 15 | Cantidad de reseñas, nota promedio y respuestas del dueño |
| Canal de contacto | 15 | Web, WhatsApp visible y catálogo accesible |

El PDF traduce el puntaje a lenguaje de negocio, por ejemplo: "cuando alguien busca *peluquería en San Pedro de la Paz*, usted no aparece entre las primeras opciones".

### 6.7 Requisitos no funcionales

| ID | Requisito |
|---|---|
| RNF-01 | **Datos personales:** la base de prospectos (nombres, teléfonos) **no se sube al repositorio**. Queda en `data/`, que va en `.gitignore`. El repositorio contiene solo código y datos de ejemplo ficticios. |
| RNF-02 | **Cumplimiento legal:** solo se usan datos de fuentes públicas o levantados en la visita, y se elimina a quien lo pida. Hay que revisar la Ley 19.628 y la Ley 21.719 de protección de datos personales, cuya entrada en vigencia está prevista para diciembre de 2026 (verificar la fecha exacta). |
| RNF-03 | **Términos de servicio:** nada de scraping automatizado de Google Maps, Instagram ni Facebook. La auditoría de la ficha es manual, asistida por el formulario. |
| RNF-04 | Radar corre en local (`streamlit run`) en el computador de cualquier integrante con Python 3.12. El despliegue en la nube es opcional y solo sin datos reales. |
| RNF-05 | La generación de un diagnóstico en PDF toma < 5 s. |
| RNF-06 | Los pesos del scoring y la rúbrica viven en un archivo de configuración (YAML), no en el código. |
| RNF-07 | Hay pruebas automáticas (pytest) del cálculo del score, la recomendación de paquete y la detección de duplicados. Las pruebas de interfaz con Playwright se agregan cuando las pantallas estén estables. |

### 6.8 Stack

| Capa | Elección | Por qué |
|---|---|---|
| Lenguaje | Python 3.12 | El equipo ya tiene base en Python |
| Interfaz | Streamlit | Pantallas en horas, sin frontend separado |
| Datos | SQLite + pandas | Un solo archivo, sin servidor, suficiente para < 1.000 prospectos |
| PDF | fpdf2 | Funciona en Windows sin dependencias nativas (WeasyPrint suele dar problemas ahí) |
| Gráficos | Plotly | Integración nativa con Streamlit |
| Configuración | YAML | Recalibrar pesos sin tocar el código |
| Pruebas | pytest; Playwright más adelante | — |

Estructura sugerida:

```
radar/
  app.py              # entrada de Streamlit
  pages/              # prospectos, scoring, diagnóstico, embudo, tablero
  core/scoring.py     # cálculo puro, testeable
  core/diagnostico.py
  core/db.py
  config/scoring_v1.yaml
  templates/
tests/
data/                 # en .gitignore
```

---

## 7. Alcance del MVP para la jornada de terreno

Para la jornada, el MVP es: **RF-01 a RF-04, RF-07 a RF-09, RF-12, RF-13, RF-16 y RF-17**. El resto puede llegar después. Si al 30-sep el MVP no está listo, el plan B es imprimir los diagnósticos desde una planilla con la misma rúbrica: la jornada no se posterga por la herramienta.

---

## 8. Modelo económico

### 8.1 Embudo: cuánto hay que prospectar

Todas las tasas son `[SUPUESTO]` y se reemplazan por las reales desde la primera jornada.

| Etapa | Tasa supuesta | Para 4 clientes |
|---|---|---|
| Propuesta → cierre | 30% | 14 propuestas |
| Reunión → propuesta | 60% | 23 reuniones |
| Diagnóstico entregado → reunión | 40% | **~56 diagnósticos** |
| Base puntuada (se visita el ~40% superior) | — | **~140 prospectos** |

**Implicación:** 56 diagnósticos entregados en persona difícilmente caben en **una** jornada de 5 personas. Con ~5-6 por persona en una jornada `[SUPUESTO]` salen ~25-30. El plan contempla **dos jornadas** (§9). Si las tasas reales resultan mejores, la segunda se reduce o se elimina.

### 8.2 Economía por paquete

Las horas son `[SUPUESTO]` y se reemplazan por las horas registradas en el primer cliente.

| | Base | Estándar | Premium |
|---|---|---|---|
| Precio | $150.000 | $250.000 | $380.000 |
| Costo de terceros (dominio, etc.) `[aprox., verificar en nic.cl]` | ~$0 | ~$10.000 | ~$10.000 |
| Horas de entrega | 8 h | 16 h | 28 h |
| Horas de adquisición (~14 diagnósticos por cierre) | ~10 h | ~10 h | ~10 h |
| **Ingreso por hora-persona** (precio − terceros) / (entrega + adquisición) | **~$8.300/h** | **~$9.200/h** | **~$9.700/h** |

**Lectura:**
1. Los tres paquetes rinden parecido por hora una vez que se suma la adquisición: el Premium cuesta 2,5 veces lo que el Base, pero solo deja ~16% más por hora.
2. Conseguir un cliente pesa tanto como entregarle un Base. Reducir las horas de adquisición con Radar (priorizar mejor, diagnosticar más rápido) mejora el margen de todos los paquetes a la vez.
3. Si el primer Premium toma más de 28 h, hay que subir su precio o recortar su alcance.

### 8.3 Presupuesto revisado del capital semilla ($80.000)

Sin la suscripción de Imperio Agéntico (ver [decisiones.md](memoria/decisiones.md)).

| Ítem | Monto `[SUPUESTO]` |
|---|---|
| Movilización: 2 jornadas + visitas de levantamiento y capacitación | $35.000 |
| Impresión de ~60 diagnósticos y 5 actas | $12.000 |
| Dominio propio del proyecto (1 año, verificar disponibilidad y precio) | $10.000 |
| Créditos de API para el piloto del agente de WhatsApp (fase 2) | $10.000 |
| Contingencia | $13.000 |
| Software (Streamlit, Canva gratis, Zoho Mail gratis) | $0 |
| **Total** | **$80.000** |

**Punto de equilibrio:** un solo cliente Base ($150.000) cubre todo el capital aportado.

**Ingresos esperados** (escenario base de 4 clientes, 2 Base + 1 Estándar + 1 Premium): $930.000 brutos, antes de impuestos y de costos de terceros.

### 8.4 Formalización tributaria

**Decisión del equipo:** cobrar con boleta, ya sea de honorarios o de una empresa con inicio de actividades. Falta elegir entre las dos.

**Precisión importante:** estas dos opciones no se excluyen del todo. Para emitir boletas de honorarios electrónicas, la persona también debe hacer **inicio de actividades en el SII como persona natural** (segunda categoría), un trámite en línea y gratuito. La elección real es entre esa vía y crear una empresa (primera categoría). **Verificar ambos trámites en sii.cl antes de decidir.**

| Opción | Ventaja | Costo / riesgo |
|---|---|---|
| **A. Boleta de honorarios** (persona natural) | Trámite rápido, sin costo, operativo en días | Tiene retención o pago provisional (15,25% en 2026, verificar en SII). El ingreso tributa a nombre de quien emite. Revisar si afecta beneficios estudiantiles del emisor. |
| **B. Empresa** (p. ej. SpA vía "Empresa en un Día") | Imagen más formal, separa el patrimonio y sirve si el negocio continúa | Más trámite, contabilidad mensual, declaraciones y posible costo de un contador. Difícil de justificar para 3-5 ventas. |

**Recomendación:** opción **A** este semestre, con un **emisor rotativo por cliente** para repartir la carga tributaria entre los integrantes que tengan inicio de actividades. Pasar a la opción B solo si el negocio sigue después del ramo (fase 3 del §12). Es un juicio propio, no asesoría tributaria: conviene confirmarlo con el SII o con un contador.

Los precios deben declararse explícitamente como **brutos** o **líquidos** antes de la primera propuesta. Si no, la retención sale del margen del equipo.

---

## 9. Cronograma e hitos

Fecha base: miércoles 16-sep-2026. El semestre termina en **diciembre de 2026**; la fecha exacta está por confirmar con el calendario del ramo. El plan apunta a transferir todo antes de fin de noviembre y usa las primeras semanas de diciembre como holgura y cierre. **No se planifica trabajo con clientes en diciembre:** ese margen es para absorber atrasos, no para cerrar ventas.

La columna "Responsable" indica quién responde por el hito. Christhoper coordina todos los hitos (§10), y cada semana se nombra un responsable único por tarea.

| Semana | Fechas | Hitos | Responsable |
|---|---|---|---|
| S0 | 16-20 sep | PRD aprobado · rúbrica y pesos v1 cerrados · **17-20 sep feriados de Fiestas Patrias** (poca actividad comercial) | Christhoper |
| S1 | 21-25 sep | Base de ≥ 140 prospectos cargada · Radar MVP: M1 + M2 · plantilla de propuesta y acta | Asignar en la planificación semanal |
| S2 | 28 sep-2 oct | M3 (diagnóstico PDF) · auditoría de los ~60 mejores · impresión · **Jornada de Terreno 1: viernes 2-oct** | Asignar en la planificación semanal |
| S3 | 5-9 oct | Seguimiento y reuniones · propuestas en ≤ 48 h · **primer cierre (meta)** · recalibración del scoring | Asignar en la planificación semanal |
| S4 | 13-16 oct (lun 12 feriado) | **Jornada de Terreno 2: viernes 16-oct** (si el embudo real lo exige) · levantamientos de clientes | Asignar en la planificación semanal |
| S5-S7 | 19 oct-6 nov | Producción y revisión de los clientes en paralelo · cierres 3-5 · M4 y M5 del tablero | Un responsable por cliente |
| S8-S10 | 9-27 nov | Capacitaciones, actas y pagos finales · **meta: todos los clientes transferidos al 27-nov** | Un responsable por cliente |
| S11-S12 | 30 nov-11 dic | Holgura para atrasos · **límite duro de transferencias: viernes 4-dic** · cierre administrativo y financiero · informe final · preparación de la defensa | Christhoper + todos |

**Por qué el 2-oct y no el 25-sep:** el 25-sep deja una sola semana hábil después de Fiestas Patrias para construir la base, el scoring y los diagnósticos, y la jornada llegaría sin diagnósticos confiables. El 2-oct todavía deja ~7 semanas para implementar y transferir.

**Ruta crítica (por cliente):** cierre → inicio de la verificación de Google → levantamiento → producción → revisión → capacitación y acta. El último cierre que todavía alcanza a transferirse al 27-nov es cerca del **6-nov** para un Base o Estándar, y del **30-oct** para un Premium `[SUPUESTO]`. Después de esas fechas, un cierre solo se acepta si el cliente entrega todo su material en el mismo levantamiento.

---

## 10. Organización del equipo

**Decisión del equipo:** el trabajo se reparte en partes iguales y todos participan en todas las áreas. **Christhoper Martínez es el jefe de proyecto**: coordina el cronograma, el presupuesto, el control de avance y la relación con el profesor.

**Regla operativa:** que todos participen en todo no significa que todos respondan por todo. En la planificación semanal, el jefe de proyecto asigna **un responsable único** a cada tarea y a cada cliente. Así ninguna tarea queda sin dueño, y el reparto equitativo queda registrado como evidencia.

| Área | Qué cubre | Responsable |
|---|---|---|
| Dirección del proyecto | Cronograma, presupuesto, riesgos, informes, relación con el profesor | Christhoper |
| Comercial | Ruta de las jornadas, guion de venta, propuestas y cierres | Rotativo, asignado por semana |
| Radar | Desarrollo de la herramienta y calidad de los datos | Rotativo, asignado por semana |
| Implementación web | Landing, sitio, dominio y correo | Responsable único por cliente |
| Contenido | Fotografía, fichas de Google, catálogos y capacitación | Responsable único por cliente |

**Evidencia del reparto equitativo:** un registro de horas por integrante y por tarea (se puede llevar en Radar o en una planilla). Sirve para demostrar el reparto ante el profesor y, al mismo tiempo, alimenta las horas reales del §8.2.

Todos participan en las jornadas de terreno. Como el ramo puede interrogar a cada integrante por separado, **cada uno debe poder explicar el scoring, el presupuesto y el cronograma**, no solo lo que ejecutó.

---

## 11. Riesgos

| Riesgo | Prob. | Impacto | Mitigación | Disparador |
|---|---|---|---|---|
| El cliente no entrega su material a tiempo | Alta | Alto | Anticipo del 50%, levantamiento presencial y regla anti-atasco (§5.3) | 5 días hábiles sin material |
| La verificación de Google se demora | Media | Alto | Iniciarla el día del cierre; ofrecer la verificación por video | 7 días sin verificar |
| El embudo convierte peor de lo supuesto | Media | Crítico | Segunda jornada; revisar la oferta si H3 falla | < 2 reuniones cada 20 diagnósticos |
| Radar no está listo para la jornada | Media | Medio | Plan B con planilla (§7) | MVP incompleto al 30-sep |
| El precio no se acepta | Media | Alto | Probar un Base de entrada; anclar el precio en la pérdida del cliente, no en las horas | 0 cierres tras 15 propuestas |
| Cierres tardíos que no alcanzan a transferirse | Media | Alto | Fechas límite de cierre por paquete (§9) y holgura hasta el 4-dic | Cierre después del 6-nov (Base/Estándar) o del 30-oct (Premium) |
| El jefe de proyecto se vuelve cuello de botella | Media | Alto | Responsable único por tarea y por cliente (§10); las decisiones operativas no esperan al jefe | Tareas detenidas esperando su aprobación |
| Responsabilidad diluida ("todos hacen todo") | Media | Alto | Planificación semanal con dueño por tarea y registro de horas | Tarea sin dueño al revisar la semana |
| Retención tributaria no considerada | Alta | Medio | Definir precio bruto o líquido (§8.4) | Antes de la primera propuesta |
| Datos personales expuestos | Baja | Alto | RNF-01 y RNF-02 | Cualquier dato real en el repositorio |
| Integrante que no puede defender el proyecto | Media | Alto (nota individual) | Ensayo de defensa cruzada en S10 | — |
| Número de WhatsApp de un cliente bloqueado (fase 2) | Baja | Crítico | Solo API oficial (§5.6) | — |

---

## 12. Roadmap posterior al semestre

| Fase | Contenido | Condición para iniciar |
|---|---|---|
| 2 | Agente de WhatsApp (menú) como upsell Premium; plan de mantención mensual | Piloto interno de 2 semanas sin incidentes |
| 3 | Plan recurrente: gestión de reseñas, actualización de la ficha y reportes mensuales | ≥ 3 clientes satisfechos (nota ≥ 6) que lo pidan |
| 4 | Expansión a otras ciudades del Biobío con el mismo proceso | Proceso de entrega estandarizado y medido |
| Exploratorio | Agente de voz, WhatsApp conversacional con IA, reservas en línea | Rubros con suficiente volumen de llamadas |

---

## 13. Criterios de éxito del proyecto (para el ramo)

- [ ] ≥ 3 clientes con acta firmada y pago completo
- [ ] Presupuesto ejecutado ≤ $80.000, con cada gasto respaldado
- [ ] Embudo real documentado con sus tasas, comparado contra los supuestos del §8.1
- [ ] Scoring v1 y v2 documentados, con su limitación declarada (§6.4)
- [ ] Evidencia fotográfica y en video de las jornadas de terreno
- [ ] Cada integrante puede defender individualmente el scoring, el presupuesto y el cronograma

---

## 14. Preguntas abiertas y supuestos por confirmar

| # | Pregunta | Afecta | Fecha límite |
|---|---|---|---|
| 1 | ~~¿Cuándo termina el semestre?~~ **Resuelto: diciembre 2026.** Falta la fecha exacta y las fechas de entrega del ramo. | §9 | 18-sep |
| 2 | ¿Se confirma el viernes 2-oct para la Jornada 1? ¿Hay integrantes con clases o evaluaciones ese día? | §9 | 18-sep |
| 3 | ~~¿Quién asume cada rol?~~ **Resuelto: reparto equitativo, Christhoper como jefe de proyecto.** Falta la primera asignación semanal de responsables. | §10 | 21-sep |
| 4 | Se cobra con boleta: ¿opción A (honorarios) o B (empresa)? ¿Quién tiene o hace inicio de actividades? ¿Precios brutos o líquidos? | §8.4 | Antes de la 1ª propuesta |
| 5 | ¿Se validan los precios $150k / $250k / $380k o se ajustan tras la jornada? | §5.1, §8 | 9-oct |
| 6 | ¿Qué comunas cubre la ruta de la Jornada 1? | §6.3 | 25-sep |
| 7 | Agente de WhatsApp: ¿el costo recurrente lo paga el cliente o se cobra una mantención? | §5.6 | Antes de ofrecerlo |
| 8 | ¿Qué fuentes públicas concretas se usan para la base de prospectos? | §6.2, RNF-02 | 21-sep |
| 9 | ¿Nombre definitivo de la herramienta interna? | — | Opcional |
