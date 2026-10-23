// Prueba de "Mira tu página": el visitante escribe su negocio, toca un rubro y ve el ejemplo con su nombre.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
ok('1 hay 8 rubros para elegir', $$('[data-tu-rubro]').length === 8);
$('#cap-negocio').value = 'Refugio del Biobío';
const b = $$('[data-tu-rubro]').find((x) => /Cabañas/.test(x.textContent)); b.click(); await dormir(4500);
const fr = $('.tg-lb iframe');
ok('2 el visor abre la página con el nombre en la dirección', /negocio=Refugio/.test(fr.src), fr.src);
const doc = fr.contentDocument;
const h1 = doc && doc.querySelector('h1') ? doc.querySelector('h1').textContent.trim() : '';
ok('3 la página muestra el nombre del visitante', /Refugio del Biobío/.test(h1) && !/Copihues/.test(doc.body.textContent.split('Ejemplo')[0]), h1);
ok('4 el título del visor también', /Refugio del Biobío/.test($('.tg-lb b').textContent));
ok('5 "Abrir la página completa" lleva el nombre', /negocio=Refugio/.test($('.tg-lb-abrir').href));
return r;
