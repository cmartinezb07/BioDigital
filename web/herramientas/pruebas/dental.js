// Guion de prueba de Clínica Dental Sonríe (con --movimiento: frases que se iluminan y tarjetas apiladas).
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
// 1. Frase que se ilumina al bajar
const f = $('.frase-luz'); scrollTo({ top: 0, behavior: 'instant' }); await dormir(300);
const antes = $$('.w.on', f).length;
f.scrollIntoView({ block: 'center', behavior: 'instant' }); await dormir(700);
const despues = $$('.w.on', f).length;
ok('1 las palabras se encienden al bajar', despues > antes, antes + ' → ' + despues);
// 2. Carril con flechas
const c = $('[data-carril]'); const x0 = c.scrollLeft;
$('[data-carril-ir="1"]').click(); await dormir(900);
ok('2 la flecha mueve el carril', c.scrollLeft > x0, x0 + ' → ' + c.scrollLeft);
// 3. Tarjetas apiladas: la primera se achica cuando la tapa la siguiente
const cartas = $$('.carta'); const pila = $('.pila'); scrollTo({ top: pila.getBoundingClientRect().top + scrollY + pila.offsetHeight * 0.6, behavior: 'instant' }); await dormir(600);
r.escalas = cartas.map((c) => c.style.transform).join(' | ');
ok('3 la tarjeta de atrás se achica', /scale\(0\.9/.test(cartas[0].style.transform), cartas[0].style.transform);
// 4. Reservar desde un tratamiento
$('[data-reservar="Limpieza dental"]').click(); await dormir(1800);
r.paso = (($('#reserva-mod .res-vivo') || {}).textContent || '').slice(0, 60);
ok('4 el módulo avanzó con la limpieza elegida', /paso 2/i.test(r.paso), r.paso);
return r;
