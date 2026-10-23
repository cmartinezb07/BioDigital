// Muestra qué elemento es el LCP y los recursos más pesados.
await dormir(4000);
const e = await new Promise((ok) => { let v = null; new PerformanceObserver((l) => { const x = l.getEntries(); v = x[x.length - 1]; }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => ok(v), 300); });
const el = e && e.element;
const pesados = performance.getEntriesByType('resource').map((r) => [Math.round((r.transferSize || r.encodedBodySize) / 1024), r.name.replace(location.origin, '').slice(0, 80), Math.round(r.responseEnd)]).sort((a, b) => b[0] - a[0]).slice(0, 10);
return { lcp: Math.round(e ? e.startTime : 0), elemento: el ? el.tagName + '.' + el.className + ' ' + (el.textContent || el.src || '').trim().slice(0, 60) : null, pesados };
