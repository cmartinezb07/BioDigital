// Configuración de ESTA reserva simple. Es lo único que cambia al copiarla para otro negocio (lo arma aplicar-formulario-agenda.mjs --simple).
// Sin base de datos ni mensualidad: el cliente elige, la página arma el mensaje y lo envía por WhatsApp al negocio, que confirma a mano.
// Las horas ocupadas salen del GOOGLE CALENDAR del dueño (calendario: compartido como "ver solo libre/ocupado"). Precios, descripciones,
// servicios del mismo tipo y horario los cambia en SU planilla de Google (planilla: enlaces CSV publicados). Sin planilla, se usa el catálogo de aquí abajo. Ver la skill crear-sistemas-agendas, "Reserva simple".
// Esta es la demostración de Bío Digital: dos negocios ficticios, una "planilla" de ejemplo en CSV y un calendario simulado.
window.SIMPLE = {
  demo: true,
  negocios: [
    { id: 'salon', nombre: 'Salón Brillo', rubro: 'Salón de belleza', modo: 'horas', icono: 'salon', color: '#b8437a', sigla: 'SB', comuna: 'Chiguayante', direccion: 'Av. Ejemplo 789, Chiguayante',
      whatsapp: '56946941640', mapa: 'https://www.google.com/maps/search/?api=1&query=Chiguayante',
      horario: { lun: [['10:00', '20:00']], mar: [['10:00', '20:00']], mie: [['10:00', '20:00']], jue: [['10:00', '20:00']], vie: [['10:00', '20:00']], sab: [['10:00', '18:00']], dom: [] }, intervalo: 30, buffer: 0,
      recursos: [{ id: 'agenda', nombre: 'Salón Brillo', unidades: 1, servicios: ['corte', 'color', 'manicure'] }],
      servicios: [{ id: 'corte', nombre: 'Corte y lavado', precio: 12000, duracion: 45, desc: 'Incluye lavado y secado.' }, { id: 'color', nombre: 'Color completo', precio: 35000, duracion: 120 }, { id: 'manicure', nombre: 'Manicure semipermanente', precio: 10000, duracion: 60 }],
      politicas: { deposito: 0, anticipacionHoras: 2, maxDias: 45, cancelacion: [] },
      campos: [{ id: 'primera', etiqueta: '¿Es tu primera vez con nosotros?', tipo: 'si' }],
      // Demo: el "Google Calendar" del dueño se simula (días desde hoy, hora desde, hora hasta). En un negocio real: calendario: { id: 'correo@gmail.com', llave: 'AIza…' }
      calendario: { demo: [[1, '11:00', '12:00'], [1, '16:00', '17:30'], [3]] },
      planilla: { servicios: 'planilla-ejemplo/salon-servicios.csv', horario: 'planilla-ejemplo/salon-horario.csv' } },
    { id: 'barberia', nombre: 'Barbería El Filo', rubro: 'Barbería', modo: 'horas', icono: 'salon', color: '#8e0f0f', sigla: 'EF', comuna: 'Talcahuano', direccion: 'Calle Colón (dirección de ejemplo), Talcahuano',
      whatsapp: '56946941640', mapa: 'https://www.google.com/maps/search/?api=1&query=Talcahuano',
      horario: { lun: [], mar: [['10:00', '13:30'], ['15:00', '20:00']], mie: [['10:00', '13:30'], ['15:00', '20:00']], jue: [['10:00', '13:30'], ['15:00', '20:00']], vie: [['10:00', '13:30'], ['15:00', '20:00']], sab: [['10:00', '17:00']], dom: [] }, intervalo: 15, buffer: 0,
      recursos: [{ id: 'agenda', nombre: 'Barbería El Filo', unidades: 1, servicios: ['fade', 'clasico', 'nino', 'combo-barba', 'barba', 'perfilado'] }],
      servicios: [{ id: 'fade', nombre: 'Fade', precio: 15000, duracion: 45, desc: 'Degradado a máquina y terminación a tijera.' }, { id: 'clasico', nombre: 'Corte clásico', precio: 10000, duracion: 40 }, { id: 'nino', nombre: 'Corte niño', precio: 8000, duracion: 30, desc: 'Hasta 12 años.' }, { id: 'combo-barba', nombre: 'Corte + barba', precio: 16000, duracion: 60, desc: 'Corte a elección y barba a navaja.' }, { id: 'barba', nombre: 'Barba a navaja', precio: 7000, duracion: 30 }, { id: 'perfilado', nombre: 'Perfilado', precio: 4000, duracion: 15 }],
      politicas: { deposito: 0, anticipacionHoras: 2, maxDias: 45, cancelacion: [] },
      campos: [{ id: 'barbero', etiqueta: '¿Con qué barbero te quieres cortar?', tipo: 'opciones', opciones: ['Sin preferencia', 'Cuervo', 'Tiburón', 'Fideo'] }],
      // Demo: el "Google Calendar" del dueño se simula (día desde hoy, hora desde, hora hasta; sin horas = día completo). Con un negocio real: calendario: { id: 'correo@gmail.com', llave: 'AIza…' }
      calendario: { demo: [[1, '11:00', '13:00'], [1, '17:00', '18:00'], [2, '10:00', '12:30'], [2, '15:00', '16:30'], [4, '10:00', '20:00'], [5, '12:00', '14:00']] },
      demoPlanilla: true,   // SOLO demostración: usa lo editado en barberia-simple/mi-planilla/ (localStorage)
      planilla: { servicios: 'planilla-ejemplo/barberia-servicios.csv', horario: 'planilla-ejemplo/barberia-horario.csv', barberos: 'planilla-ejemplo/barberia-barberos.csv' } },
    { id: 'cabanas', nombre: 'Cabañas Bosque Nativo', rubro: 'Cabañas', modo: 'noches', icono: 'cabana', color: '#2f6f4e', sigla: 'BN', comuna: 'Tomé', direccion: 'Camino a Cocholgüe km 3 (ejemplo)',
      whatsapp: '56946941640', mapa: 'https://www.google.com/maps/search/?api=1&query=Cocholg%C3%BCe%20Tom%C3%A9',
      recursos: [{ id: 'copihue', nombre: 'Cabaña Copihue', unidades: 1, capacidad: 2, precio: 45000, desc: 'Para dos, con terraza y vista al mar.' }, { id: 'araucaria', nombre: 'Cabaña Araucaria', unidades: 1, capacidad: 4, precio: 65000, desc: 'Dos dormitorios, ideal para familias.' }],
      servicios: [], temporadas: [{ nombre: 'Temporada alta', desde: '12-15', hasta: '03-15', factor: 1.3 }], factorFinde: 1.15,
      politicas: { deposito: 0, anticipacionHoras: 0, maxDias: 365, estadiaMin: 1, estadiaMinAlta: 2, cancelacion: [], checkin: '15:00', checkout: '11:00' },
      campos: [],
      calendario: { demo: [[5, null, null, 'copihue', 3], [12, null, null, null, 2]] },
      planilla: { servicios: 'planilla-ejemplo/cabanas-cabanas.csv' } }
  ]
};

// PRUEBA CON UN CALENDARIO REAL (solo en el computador de quien prueba; llave.local.js no se sube a GitHub).
// Si existe llave.local.js (ver docs/google-calendar-llave.md), aparece un tercer negocio "Prueba con calendario real" que lee ese Google Calendar.
// llave.local.js define:  window.BIO_CAL_PRUEBA = { id: 'correo@gmail.com', llave: 'AIza…' };
window.__bioRegistrarPrueba = function () {
  if (!window.BIO_CAL_PRUEBA) return;
  var copia = JSON.parse(JSON.stringify(window.SIMPLE.negocios[0]));
  copia.id = 'prueba';
  copia.nombre = 'Prueba con calendario real';
  copia.rubro = 'Prueba interna';
  copia.calendario = window.BIO_CAL_PRUEBA;
  delete copia.planilla;
  window.SIMPLE.negocios.push(copia);
  // Con ?calendario=real el negocio abierto (p. ej. ?negocio=barberia&calendario=real) usa ese Google Calendar en vez del simulado.
  var q = new URLSearchParams(location.search);
  if (q.get('calendario') === 'real') window.SIMPLE.negocios.forEach(function (n) { if (n.id === q.get('negocio')) n.calendario = window.BIO_CAL_PRUEBA; });
};
// Los scripts escritos con document.write corren en orden, después de este archivo y antes de simple.js.
document.write('<script src="llave.local.js" onerror="void 0"><\/script><script>window.__bioRegistrarPrueba()<\/script>');
