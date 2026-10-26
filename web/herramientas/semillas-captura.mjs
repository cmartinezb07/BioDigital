// Datos de ejemplo para las capturas de la portada y la galería (cocina, panel del restaurante, tarjeta de fidelización; las reservas usan semillas-reservas.mjs).
// Se crean en la base por el mismo camino que usan las pantallas, se capturan, y se borran al terminar (marcados con muestra o con un correo propio).
// Cada función corre DENTRO de la página (por eso usa Pedidos, Nube y Reservas, y no variables de Node).
export const sembrarFogon = async () => {
  const P = Pedidos, dormir = (ms) => new Promise((r) => setTimeout(r, ms));
  Nube.pin('fogon', '482916'); P.entrarEquipo(); await dormir(800);
  const platos = JSON.parse(document.getElementById('menu-datos').textContent).categorias.flatMap((c) => c.platos);
  const rnd = (n) => Math.floor(Math.random() * n), pick = (a) => a[rnd(a.length)];
  const nombres = ['Camila R.', 'Matías S.', 'Fernanda L.', 'Diego P.', 'Valentina A.', 'Joaquín M.', 'Sofía C.', 'Benjamín T.', 'Isidora V.', 'Tomás G.'];
  const comunas = ['Concepción', 'Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Hualpén'];
  const refs = ['Instagram', 'Pasaba por fuera', 'Me lo recomendaron', 'Google Maps', 'TikTok'];
  const MIN = 6e4;
  const hacer = async (tipo, haceMin, estado, extra) => {
    const items = []; for (let i = 0, k = 1 + rnd(3); i < k; i++) { const pl = pick(platos); items.push({ id: pl.id, nombre: pl.nombre, precio: pl.precio, cant: 1 + rnd(2), prep: pl.prep || 0 }); }
    if (tipo === 'delivery') while (items.reduce((t, x) => t + x.precio * x.cant, 0) < P.CONFIG.minimoDelivery) items[0].cant++;
    const p = await P.crear({ tipo, mesa: tipo === 'mesa' ? 1 + rnd(12) : null, cliente: { nombre: pick(nombres), telefono: '', direccion: 'Calle ' + (100 + rnd(800)), comuna: tipo === 'delivery' ? pick(comunas) : '' }, items, nota: '', pago: { metodo: rnd(10) < 6 ? 'linea' : 'caja', pagado: false }, referencia: pick(refs) });
    const t0 = Date.now() - haceMin * MIN, prep = p.prepMin;
    const hist = [{ estado: 'recibido', t: t0 }];
    const orden = P.FLUJO[tipo], hasta = orden.indexOf(estado);
    for (let i = 1; i <= hasta; i++) hist.push({ estado: orden[i], t: t0 + (i === 1 ? 2 : i === 2 ? 2 + prep : i === 3 ? 4 + prep : 18 + prep) * MIN });
    P.actualizar(p.id, (x) => {
      x.creado = t0; x.historial = hist; x.estado = estado; x.muestra = true; x.prepMin = Math.min(45, prep);
      if (estado === 'entregado' || (x.pago.metodo === 'linea' && rnd(10) < 8)) x.pago = Object.assign({}, x.pago, { pagado: true, cuando: t0 + 3 * MIN });
      if (estado === 'camino') x.repartidor = { nombre: 'Repartidor', equipo: 'muestra', lat: x.destino.lat + 0.004, lng: x.destino.lng - 0.003, t: Date.now() - 20000 };
      if (estado === 'entregado' && rnd(10) < 5) x.opinion = { estrellas: pick([5, 5, 5, 4, 4, 3]), recomendaria: rnd(10) < 8, texto: '', t: t0 + 40 * MIN };
    });
  };
  // En curso ahora: un poco de todo para que la cocina se vea trabajando
  await hacer('mesa', 2, 'recibido'); await hacer('retiro', 3, 'recibido'); await hacer('delivery', 4, 'recibido');
  await hacer('mesa', 9, 'preparacion'); await hacer('delivery', 12, 'preparacion'); await hacer('retiro', 15, 'preparacion');
  await hacer('mesa', 20, 'listo'); await hacer('delivery', 24, 'listo'); await hacer('delivery', 30, 'camino');
  // Historia de los últimos días para el panel del dueño
  const tipos = ['mesa', 'mesa', 'retiro', 'delivery', 'delivery'];
  for (let d = 6; d >= 0; d--) for (let k = 0, n = 3 + rnd(4); k < n; k++) await hacer(pick(tipos), d * 1440 + 30 + rnd(600), 'entregado');
  // Visitas a la carta
  for (let i = 0; i < 70; i += 10) await Promise.all(Array.from({ length: 10 }, (_, j) => Nube.escribir('fogon', 'visitas', 'zzvis' + Date.now().toString(36) + i + j, { t: Date.now() - rnd(6 * 864e5), origen: pick(['QR de mesa', 'QR de mesa', 'Directo', 'Instagram', 'Invitación de un cliente', 'Google Maps']), muestra: true }, { modo: 'poner' })));
  await P.guardado(); await dormir(1500);
  return 'sembrado';
};
export const limpiarFogon = async () => {
  const r = await Promise.all([Nube.borrar('fogon', 'pedidos', '482916', { filtro: { muestra: true } }), Nube.borrar('fogon', 'visitas', '482916', { prefijo: 'zzvis' })]);
  Nube.pin('fogon', null); return JSON.stringify(r);
};

export const sembrarFidelizacion = async () => {
  const f = (cod, nombre, sellos, visitas, premios) => Nube.escribir('fidelizacion', 'tarjetas', cod, { codigo: cod, nombre, telefono: '', sellos, creada: Date.now() - visitas * 864e5, visitas, premios, ultimo: Date.now() - 3600e3, muestra: true }, { pin: '482916', modo: 'poner' });
  await Promise.all([f('ZZCAP001', 'Camila', 5, 5, 1), f('ZZCAP002', 'Tomás', 2, 2, 0), f('ZZCAP003', 'Fernanda', 8, 9, 1), f('ZZCAP004', 'Joaquín', 1, 1, 0)]);
  return 'sembrado';
};
export const limpiarFidelizacion = async () => JSON.stringify(await Nube.borrar('fidelizacion', 'tarjetas', '482916', { prefijo: 'ZZCAP' }));

// Qué se siembra para cada tarjeta de la portada, y en qué página se corre
export const SEMILLAS = {
  fidelizacion: { ruta: 'fidelizacion/', sembrar: sembrarFidelizacion, limpiar: limpiarFidelizacion, para: ['fidelizacion'] }
};
