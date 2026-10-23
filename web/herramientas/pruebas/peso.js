// Mide peso y velocidad de una página (sirve para comparar sitios entre sí con el mismo método; sin limitar CPU ni red).
await dormir(3500);
const lcp = await new Promise((ok) => { let v = 0; try { new PerformanceObserver((l) => { const e = l.getEntries(); if (e.length) v = e[e.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {} setTimeout(() => ok(v), 300); });
const rec = performance.getEntriesByType('resource'), nav = performance.getEntriesByType('navigation')[0] || {};
const kb = (rec.reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0) + (nav.transferSize || 0)) / 1024;
const terceros = new Set(rec.map((r) => new URL(r.name).host).filter((h) => h !== location.host)).size;
return { lcp_ms: Math.round(lcp), peso_kb: Math.round(kb), peticiones: rec.length + 1, dominios_externos: terceros, dom_listo_ms: Math.round(nav.domContentLoadedEventEnd || 0) };
