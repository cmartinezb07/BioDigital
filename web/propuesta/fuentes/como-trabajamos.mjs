// Página "Cómo trabajamos" (como-trabajamos/index.html): cronograma real de una página web de 3 a 7 días hábiles.
// Gestión del tiempo (DCP): actividades → precedencias → duraciones → método de la ruta crítica (inicio y término
// tempranos y tardíos, holguras) → hitos. El cálculo se hace aquí al generar; si cambia una duración, cambia la página.
import { plantilla } from './legales.mjs';

// [id, actividad, duración en días hábiles, predecesoras, desfase en días (espera que no es trabajo), quién]
const ACT = [
  ['A', 'Visita al local: fotos, textos y datos', 1, [], 0, 'Bío Digital y tú'],
  ['B', 'Registro del dominio .cl a tu nombre', 0.5, [], 0, 'Bío Digital (lo pagas a NIC Chile)'],
  ['C', 'Edición de fotos', 1, ['A'], 0, 'Bío Digital'],
  ['D', 'Maqueta de tu página', 1, ['A'], 0, 'Bío Digital'],
  ['E', 'Revisas y apruebas la maqueta', 1, ['D'], 0, 'Tú'],
  ['F', 'Construcción de la página', 1.5, ['C', 'E'], 0, 'Bío Digital'],
  ['G', 'Dominio y correo contacto@ conectados', 0.5, ['B', 'F'], 1, 'Bío Digital'],
  ['H', 'Pruebas en celular, velocidad y seguridad', 0.5, ['F'], 0, 'Bío Digital'],
  ['I', 'Publicación, acta de entrega y saldo', 0.5, ['G', 'H'], 0, 'Bío Digital y tú'],
];
// Método de la ruta crítica: pasada hacia adelante (inicio temprano) y hacia atrás (término tardío)
function cpm() {
  const m = Object.fromEntries(ACT.map(([id, nombre, dur, pre, lag, quien]) => [id, { id, nombre, dur, pre, lag, quien }]));
  for (const a of ACT.map((x) => m[x[0]])) { a.ei = Math.max(0, ...a.pre.map((p) => m[p].et + (a.id === 'G' && p === 'B' ? a.lag : 0))); a.et = a.ei + a.dur; }
  const fin = Math.max(...Object.values(m).map((a) => a.et));
  for (const a of ACT.map((x) => m[x[0]]).reverse()) {
    const suc = Object.values(m).filter((s) => s.pre.includes(a.id));
    a.tt = suc.length ? Math.min(...suc.map((s) => s.ti - (s.id === 'G' && a.id === 'B' ? s.lag : 0))) : fin;
    a.ti = a.tt - a.dur; a.holgura = +(a.ti - a.ei).toFixed(2); a.critica = a.holgura === 0;
  }
  return { act: ACT.map((x) => m[x[0]]), fin };
}
const { act, fin } = cpm();
const dia = (x) => String(x).replace('.', ',');
// Actividades críticas agrupadas por inicio: las que van en paralelo se muestran juntas ("G y H")
const ruta = [...new Set(act.filter((a) => a.critica).map((a) => a.ei))].map((ei) => act.filter((a) => a.critica && a.ei === ei).map((a) => a.id).join(' y ')).join(' → ');
const COL = Math.ceil(fin) * 2;   // medio día por columna (hasta completar el último día)

const gantt = `<div class="gt" role="img" aria-label="Cronograma de ${dia(fin)} días hábiles. Ruta crítica: ${ruta}.">
  <div class="gt-f gt-cab"><span></span>${Array.from({ length: Math.ceil(fin) }, (_, i) => `<span style="grid-column:span 2">Día ${i + 1}</span>`).join('')}</div>
  ${act.map((a) => `<div class="gt-f"><span class="gt-n"><b>${a.id}</b> ${a.nombre}</span><i class="${a.critica ? 'cr' : ''}" style="grid-column:${a.ei * 2 + 2} / span ${a.dur * 2}" title="${a.nombre}: día ${dia(a.ei)} a ${dia(a.et)}${a.holgura ? ' · holgura ' + dia(a.holgura) + ' días' : ' · crítica'}"></i>${a.holgura ? `<em style="grid-column:${a.et * 2 + 2} / span ${a.holgura * 2}" aria-hidden="true"></em>` : ''}</div>`).join('\n  ')}
</div>
<p class="gt-ley"><span class="cr">Ruta crítica (si se atrasa, se atrasa la entrega)</span><span>Con holgura</span><span class="hol">Holgura: margen sin atrasar la entrega</span></p>`;

const DOC = {
  titulo: 'Cómo trabajamos',
  etiqueta: 'Cronograma real de un proyecto',
  resumen: `Una página web toma ${dia(fin)} días hábiles desde la visita a tu local. Aquí está cada actividad, qué depende de qué y qué parte del plan no puede atrasarse.`,
  vigencia: 'Planificado con el método de la ruta crítica (gestión del tiempo de proyectos). Plazos en días hábiles.',
  secciones: [
    ['En simple', `<ul>
      <li>Desde la visita a tu local hasta la página publicada: <strong>${dia(fin)} días hábiles</strong>. El catálogo promete de 3 a 7 según lo que contrates.</li>
      <li>Hay un tramo que no puede atrasarse (la <strong>ruta crítica</strong>): ${ruta}. Ahí ponemos la atención del equipo.</li>
      <li>Lo único que depende de ti es aprobar la maqueta (actividad E). Si te demoras, el plazo se corre los mismos días y te avisamos.</li>
      <li>Te avisamos en cada hito, como en la portada: diagnóstico, propuesta, producción y entrega.</li>
    </ul>`],
    ['Las actividades', `<div class="lg-tabla"><table>
      <thead><tr><th>Actividad</th><th>Duración</th><th>Empieza después de</th><th>Quién</th></tr></thead>
      <tbody>${act.map((a) => `<tr><td><b>${a.id}</b> · ${a.nombre}</td><td data-l="Duración">${dia(a.dur)} ${a.dur === 1 ? 'día' : 'días'}</td><td data-l="Empieza después de">${a.pre.length ? a.pre.join(' y ') : 'La aceptación de la propuesta'}${a.lag ? ` (+${a.lag} día de espera del dominio)` : ''}</td><td data-l="Quién">${a.quien}</td></tr>`).join('')}</tbody>
    </table></div>
    <p>Antes de esto van el diagnóstico gratis y la propuesta escrita (a más tardar 48 horas después de la visita). El plazo corre desde que aceptas la propuesta.</p>`],
    ['Cronograma', gantt],
    ['Ruta crítica y holguras', `<div class="lg-tabla"><table>
      <thead><tr><th>Actividad</th><th>Inicio más temprano</th><th>Término más tardío</th><th>Holgura</th></tr></thead>
      <tbody>${act.map((a) => `<tr><td><b>${a.id}</b> · ${a.nombre}</td><td data-l="Inicio más temprano">día ${dia(a.ei)}</td><td data-l="Término más tardío">día ${dia(a.tt)}</td><td data-l="Holgura">${a.critica ? '<strong>0 · crítica</strong>' : dia(a.holgura) + (a.holgura === 1 ? ' día' : ' días')}</td></tr>`).join('')}</tbody>
    </table></div>
    <p>La <strong>holgura</strong> es cuánto puede atrasarse una actividad sin mover la fecha de entrega. Por ejemplo, la edición de fotos (C) tiene ${dia(act.find((a) => a.id === 'C').holgura)} día de margen porque corre en paralelo con la maqueta y su revisión. El dominio (B) tiene ${dia(act.find((a) => a.id === 'B').holgura)} días, aun contando el día que tarda en activarse. Las actividades con holgura 0 son la ruta crítica.</p>`],
    ['Hitos y avisos', `<ol>
      <li><strong>Propuesta aceptada</strong> (día 0): empieza el plazo. Te confirmamos la fecha de entrega.</li>
      <li><strong>Visita hecha</strong> (día ${dia(act.find((a) => a.id === 'A').et)}): ya tenemos fotos, textos y datos.</li>
      <li><strong>Maqueta aprobada</strong> (día ${dia(act.find((a) => a.id === 'E').et)}): el diseño queda cerrado.</li>
      <li><strong>Página publicada y acta firmada</strong> (día ${dia(fin)}): todo queda a tu nombre y pagas el saldo.</li>
    </ol>`],
    ['Si algo se atrasa', `<ul>
      <li><strong>Si tú te demoras</strong> en aprobar la maqueta o mandar material, el plazo se corre los mismos días. Queda registrado y te avisamos.</li>
      <li><strong>Si nosotros nos atrasamos</strong> en una actividad crítica, te avisamos el mismo día con la nueva fecha.</li>
      <li>El dominio puede demorar hasta un día en activarse: por eso lo registramos el primer día, con margen de sobra.</li>
    </ul>`],
    ['Con el pack completo', `<p>Con videos, menú digital, reservas y fidelización, el equipo trabaja en paralelo: los videos se graban en la misma visita y se editan mientras se construye la página, y el menú o las reservas se cargan después de la maqueta. La ruta crítica se alarga por las revisiones extra, y el plazo llega a <strong>7 días hábiles</strong>. Te mostramos tu propio cronograma en la propuesta.</p>
    <p class="fx-cta"><a class="fx-btn" href="../#diagnostico">Pide tu diagnóstico gratis</a><a class="fx-btn fx-btn-2" href="../antes-de-contratar/">Antes de contratar</a></p>`],
  ],
  css: `.lg-txt { min-width:0; }
.gt { display:grid; gap:4px; margin-top:4px; overflow-x:auto; }
.gt-f { display:grid; grid-template-columns:minmax(150px, 1.6fr) repeat(${COL}, minmax(22px, 1fr)); gap:0 2px; align-items:center; min-width:520px; }
.gt-cab span { font-size:12px; color:var(--fg-3); text-align:center; }
.gt-n { grid-column:1; font-size:13px; color:var(--fg-2); padding-right:8px; line-height:1.3; }
.gt-n b { color:var(--fg); }
.gt i { grid-row:1; height:20px; border-radius:6px; background:color-mix(in srgb, var(--fg) 30%, transparent); }
.gt i.cr { background:linear-gradient(90deg, var(--c1), var(--c2)); }
.gt em { grid-row:1; height:4px; border-radius:2px; background:repeating-linear-gradient(90deg, var(--fg-3) 0 4px, transparent 4px 8px); }
.gt-ley { display:flex; flex-wrap:wrap; gap:8px 18px; font-size:13px; color:var(--fg-3); margin-top:12px !important; }
.gt-ley span::before { content:""; display:inline-block; width:18px; height:10px; border-radius:3px; margin-right:6px; vertical-align:middle; background:color-mix(in srgb, var(--fg) 30%, transparent); }
.gt-ley .cr::before { background:linear-gradient(90deg, var(--c1), var(--c2)); }
.gt-ley .hol::before { height:3px; background:repeating-linear-gradient(90deg, var(--fg-3) 0 4px, transparent 4px 8px); }
.fx-cta { display:flex; flex-wrap:wrap; gap:10px; margin-top:20px; }
.lg-txt a.fx-btn { display:inline-flex; align-items:center; min-height:44px; padding:0 20px; border-radius:99px; background:linear-gradient(90deg, var(--c1), var(--c2)); color:#04121c; font-weight:600; text-decoration:none; }
.lg-txt a.fx-btn-2 { background:transparent; border:1px solid var(--line); color:var(--fg); }
@media (max-width: 820px) { .lg-txt td[data-l]::before { content:attr(data-l) ": "; color:var(--fg-3); } }`,
};

export const COMO = { ruta: 'como-trabajamos', html: () => plantilla(DOC, { ruta: 'antes-de-contratar', titulo: 'Antes de contratar' }) };
export const CRONOGRAMA = { act, fin, ruta };
