// Despues de `node generar-menu.mjs`: agrega la cinta compartida de ejemplo y el enlace de vuelta a la portada.
// Uso (desde esta carpeta): node generar-menu.mjs && node cinta.mjs
import { readFileSync, writeFileSync } from 'node:fs';
for (const f of ['index.html', '404.html', 'privacidad.html']) {
  let h;
  try { h = readFileSync(f, 'utf8'); } catch { continue; }
  if (h.includes('_compartido/demo.js')) continue;
  h = h.replace('<html lang="es-CL">', '<html lang="es-CL" data-ejemplo="Casa Dulce">');
  h = h.replace('</head>', '<link rel="stylesheet" href="../../_compartido/demo.css">\n</head>');
  h = h.replace('</body>', '<script src="../../_compartido/demo.js" defer></script>\n</body>');
  if (f === 'index.html') h = h.replace('<header class="portada"><div class="wrap">', '<header class="portada"><div class="wrap">\n  <p class="volver"><a href="../index.html">&larr; Volver a Casa Dulce</a></p>');
  writeFileSync(f, h);
}
console.log('Cinta de ejemplo agregada.');
