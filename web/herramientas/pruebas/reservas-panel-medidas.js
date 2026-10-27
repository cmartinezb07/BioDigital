// Medidas del panel de reservas en cada sección: desborde horizontal, áreas táctiles menores a 44 px y textos menores a 12 px (con el jefe adentro).
// Se lanza una vez por ancho: node web/herramientas/revisar.mjs <página de reservas> --anchos 390 --probar web/herramientas/pruebas/reservas-panel-medidas.js (y otra con 1440).
const r = {};
const A = window.AGENDA, pin = (re) => (A.pistas.find((p) => re.test(p.rol)) || {}).pin;
Nube.pin(A.negocio, pin(/jefe|due/i));
const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:99999'; f.src = location.pathname + 'admin/?negocio=cabanas' + (location.search.includes('nube=') ? '&nube=zz-agenda' : ''); document.body.appendChild(f);
await new Promise((res) => (f.onload = res)); await dormir(5000);
const d = f.contentDocument, w = f.contentWindow;
for (const t of [...d.querySelectorAll('.menu-adm [data-tab]')].map((b) => b.dataset.tab)) {
  d.querySelector('[data-tab="' + t + '"]').click(); await dormir(400);
  const de = d.documentElement.scrollWidth - d.documentElement.clientWidth;
  const chicos = [...d.querySelectorAll('button, a.btn, input:not([type=checkbox]), select')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && (b.height < 44 || b.width < 44) && getComputedStyle(e).visibility !== 'hidden'; }).map((e) => (e.textContent || e.id || e.tagName).trim().slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
  const textos = [...d.querySelectorAll('[data-vista] *')].filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12).length;
  r[t] = de <= 0 && !chicos.length && !textos ? 'ok' : 'FALLÓ → desborde ' + de + ', chicos ' + JSON.stringify(chicos.slice(0, 5)) + ', textos<12 ' + textos;
}
f.remove(); Nube.pin(A.negocio, null);
return r;
