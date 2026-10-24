// Prueba del carrusel de ejemplos de la portada: abrir el visor, página en vivo, cambiar de ejemplo y de tamaño.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
const datos = JSON.parse($('[data-tilt]').dataset.images);
ok('1 el carrusel trae los 14 ejemplos (8 rubros y 6 sistemas) con captura y enlace', datos.length === 14 && datos.every((d) => /\.webp$/.test(d.src) && /^ejemplos\//.test(d.url)));
// El restaurante: cuatro imágenes seguidas (menú, pedidos, cocina, panel) que llevan a solo DOS páginas (menú y panel del restaurante)
const rest = datos.slice(0, 4);
ok('1b las cuatro primeras son el restaurante (menú, pedidos, cocina y panel)', rest.map((d) => d.src.replace('ejemplos/', '').replace('-chica.webp', '')).join() === 'fogon-del-sur,restaurante-seguimiento,restaurante-cocina,restaurante-panel', rest.map((d) => d.src).join());
ok('1c y llevan solo a dos páginas: el menú y el panel del restaurante', JSON.stringify([...new Set(rest.map((d) => d.url))]) === JSON.stringify(['ejemplos/fogon-del-sur/', 'ejemplos/fogon-del-sur/panel/']) && rest[1].url === rest[0].url && rest[2].url === rest[3].url, rest.map((d) => d.url).join());
$('[data-tilt-open]').click(); await dormir(2500);
const lb = $('.tg-lb'), fr = $('.tg-lb iframe');
ok('2 el visor abre con la página en vivo', lb && !lb.hidden && /ejemplos\//.test(fr.src), fr && fr.src);
r.modo = lb.classList.contains('es-cel') ? 'celular' : 'escritorio';
ok('2b el botón abre la página completa en otra pestaña', $('.tg-lb-abrir').target === '_blank' && /ejemplos\//.test($('.tg-lb-abrir').href));
$('.tg-lb [data-d="1"]').click(); await dormir(600);
ok('3 la flecha pasa al siguiente ejemplo', $('.tg-lb b').textContent === datos[1].nombre, $('.tg-lb b').textContent);
$('.tg-lb [data-modo="pc"]').click(); await dormir(400);
ok('4 se puede ver en escritorio', fr.style.width === '1440px');
$('.tg-lb [data-modo="cel"]').click(); await dormir(400);
ok('4b y en celular', fr.style.width === '390px');
r.anchoVisor = Math.round($('.tg-lb-in').getBoundingClientRect().width) + ' de ' + innerWidth;
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await dormir(300);
ok('5 Esc cierra y detiene la página', lb.hidden && fr.src === 'about:blank');
return r;
