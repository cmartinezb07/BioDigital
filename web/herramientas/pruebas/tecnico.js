// Guion de prueba de TecnoRápido (estructura Kyntra): cotizador, seguimiento y atajos "Cotizar" de cada bloque.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
// 1. Cotizador completo
$('.opcion.eq[data-eq="cel"]').click(); await dormir(300);
ok('1 elegir celular pasa al paso 2', !$('.paso[data-paso="2"]').hidden && $$('#lista-fallas .opcion').length === 6);
$$('#lista-fallas .opcion')[0].click(); await dormir(1100);
ok('1b elegir falla muestra el rango', !$('.paso[data-paso="3"]').hidden && /\$\d/.test($('#rango-v').textContent), $('#rango-v').textContent);
ok('1c el mensaje se arma', $('[data-m="eq"]').textContent === 'Celular' && $('[data-m="rango"]').textContent !== '—');
$('#reiniciar').click(); await dormir(200);
ok('1d empezar de nuevo vuelve al paso 1', !$('.paso[data-paso="1"]').hidden);
// 2. Atajo desde un bloque
$('[data-cotizar="Se mojó o tiene humedad"]').click(); await dormir(900);
ok('2 "Cotizar" del bloque de agua deja celular y esa falla', $('[data-m="eq"]').textContent === 'Celular' && $('[data-m="falla"]').textContent === 'Se mojó o tiene humedad', $('[data-m="falla"]').textContent);
// 3. Seguimiento
$('#codigo').value = 'xx'; $('#form-seg').dispatchEvent(new Event('submit', { cancelable: true })); await dormir(100);
ok('3 un código mal escrito muestra error', /TR-2048/.test($('#codigo-err').textContent));
$('[data-cod="TR-2048"]').click(); await dormir(2200);
ok('3b el código de ejemplo muestra la orden', /TR-2048/.test($('#orden').textContent) && $$('#orden .linea li').length === 5);
// 4. Preguntas
const q = $$('.q')[1]; q.querySelector('summary').click(); await dormir(500);
ok('4 la pregunta se abre', q.open);
return r;
