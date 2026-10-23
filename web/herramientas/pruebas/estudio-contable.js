// Guion de prueba de Ríos & Asociados (estructura Taxo): menú que marca la sección, contadores, preguntas y agenda.
const r = {};
const ok = (k, v, extra) => { r[k] = v ? 'ok' : 'FALLÓ' + (extra ? ' → ' + extra : ''); };
scrollTo({ top: $('#proceso').getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }); await dormir(500);
ok('1 el menú marca la sección "Proceso" al llegar a ella', $('[data-menu] a[href="#proceso"]').getAttribute('aria-current') === 'true');
ok('1b la línea de avance de los pasos se llena', parseFloat(getComputedStyle($('[data-avance]')).getPropertyValue('--p')) > 0 || matchMedia('(prefers-reduced-motion: reduce)').matches);
const q = $$('.preg-lista details')[1]; q.querySelector('summary').click(); await dormir(300);
ok('2 una pregunta se abre al tocarla', q.open);
await dormir(800);
ok('3 la agenda de reuniones está montada con sus 2 servicios', $$('#reserva .res-op').length === 2, String($$('#reserva .res-op').length));
$$('#reserva .res-op')[0].click(); await dormir(500);
r.paso = (($('#reserva .res-vivo') || {}).textContent || '').slice(0, 50);
ok('3b elegir "Reunión inicial" avanza al paso 2', /paso 2/i.test(r.paso), r.paso);
return r;
