# Registro de decisiones

Bitácora cronológica. Cada entrada: fecha, decisión, por qué, qué queda pendiente.

## 2026-09-16 — No comprar la suscripción de Imperio Agéntico por ahora

**Decisión:** el equipo usó la semana de prueba gratuita de Imperio Agéntico para evaluar herramientas concretas (agente de WhatsApp, agente de voz para llamadas) sin comprometer los 59 USD/mes (~$57.000 CLP). Cada integrante dedicó una semana a evaluar. Resultado: no se compra por ahora; se están evaluando otras opciones de menor costo.

**Por qué:** esa suscripción representaba el 71% del presupuesto total declarado ($80.000 CLP) calculado como si fuera costo único, cuando en realidad es mensual — sobre 3 meses de proyecto el costo real habría sido ~$171.000, más del doble del presupuesto. Ver detalle en [riesgos-criticos.md](riesgos-criticos.md), riesgo #1.

**Pendiente:** definir con qué stack se construyen el bot de WhatsApp y (si se retoma) el agente de voz si no es con Imperio Agéntico — opciones evaluadas en [servicios-vendibles.md](servicios-vendibles.md) (Manychat, Landbot, n8n + API oficial de Meta, Vapi/Retell/Synthflow).

## 2026-09-16 — PRD v0.2: calendario, equipo y cobro

- **Término del semestre:** diciembre de 2026 (fecha exacta por confirmar). Se mantiene la meta de transferir al 27-nov; el límite duro es el 4-dic y lo que queda de diciembre es holgura y cierre.
- **Organización:** trabajo repartido en partes iguales y todos participan en todo. **Christhoper es el jefe de proyecto.** Regla agregada: un responsable único por tarea y por cliente cada semana, más un registro de horas por integrante. Objeción registrada: "todos hacen todo" diluye la responsabilidad y es lo primero que revisa el evaluador.
- **Cobro:** se formaliza con boleta. Falta elegir entre boleta de honorarios (persona natural con inicio de actividades en segunda categoría) y empresa. Recomendación: honorarios con emisor rotativo por cliente este semestre, y empresa solo si el negocio continúa después del ramo.
- **PRD:** se mantiene como documento interno; **no se comparte todavía**.

## 2026-09-16 — Definiciones para el PRD v0.1

- **Alcance del PRD:** dos capas. El servicio que compra el cliente y Radar (nombre tentativo), la herramienta interna de prospección, scoring y diagnóstico.
- **Jornada de Terreno del 11-sep:** no se hizo. Se propone el viernes 2-oct-2026 como Jornada 1 (el 18-sep es feriado y el 25-sep deja muy poco tiempo para preparar) y una Jornada 2 el viernes 16-oct si el embudo lo exige. **Pendiente de confirmar por el equipo.**
- **Agente de WhatsApp:** fuera del MVP; solo como upsell del Premium, después de un piloto interno de 2 semanas y usando únicamente la API oficial.
- **Stack de Radar:** Python 3.12 + Streamlit + SQLite + fpdf2. Los datos reales de prospectos quedan fuera del repositorio (`data/` en `.gitignore`).

**Pendiente:** las preguntas abiertas del §14 de [PRD.md](../PRD.md), en especial la fecha de término del semestre, los roles y el mecanismo tributario.

## 2026-09-16 — Repositorio Git inicializado

Se creó el repositorio en `C:\Users\criss\OneDrive\Escritorio\Proyecto DCP` para versionar el trabajo del proyecto Bío Digital, independiente del repositorio académico general del usuario.
