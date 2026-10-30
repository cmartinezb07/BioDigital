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
