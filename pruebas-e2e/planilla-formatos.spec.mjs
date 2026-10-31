import { test, expect } from '@playwright/test';

// Google puede publicar el CSV con otro formato (con $, con coma de miles, horas con segundos, fechas ISO...). Ambos lectores deben tolerarlo.
const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dias = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const csv = (texto) => ({ status: 200, contentType: 'text/csv; charset=utf-8', body: texto });
const BARBEROS = 'Barbero,Activo\r\nCuervo,Sí\r\nTiburón,Si\r\nFideo,Sí\r\n';
const AVISO = (d, h, act = 'Sí') => `Título,Texto,Desde,Hasta,Activo\r\nOferta,Texto,${d},${h},${act}\r\n`;

async function rutas(page, c) {
  const base = { servicios: 'Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,15000,45,,Sí\r\n', horario: 'Día,Abre,Cierra\r\nMartes,10:00,20:00\r\n', barberos: BARBEROS, aviso: AVISO(fmt(dias(-1)), fmt(dias(5))), ...c };
  for (const k of Object.keys(base)) await page.route(`**/barberia-${k}.csv*`, (r) => r.fulfill(csv(base[k])));
}
const pagina = async (page, c) => { await rutas(page, c); await page.goto('/ejemplos/barberia-simple/', { waitUntil: 'domcontentloaded' }); };

for (const [txt, esperado] of [['12000', '$12.000'], ['"$12.000"', '$12.000'], ['"$12,000"', '$12.000'], ['"12,000"', '$12.000']]) {
  test(`precio ${txt} se lee como ${esperado} (página)`, async ({ page }) => {
    await pagina(page, { servicios: `Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,${txt},45,,Sí\r\n` });
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText(esperado);
  });
}

for (const [txt, esperado] of [['9:30', '09:30'], ['09:30', '09:30'], ['09:30:00', '09:30']]) {
  test(`hora ${txt} se lee como ${esperado} (página)`, async ({ page }) => {
    await pagina(page, { horario: `Día,Abre,Cierra\r\nMartes,${txt},20:00:00\r\n` });
    await expect(page.locator('#horario dl.horas')).toContainText(esperado + ' – 20:00');
  });
}

test('horas con segundos y precios con coma funcionan en la reserva', async ({ page }) => {
  await rutas(page, { servicios: 'Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,"$15,000",45,,SI\r\n', horario: 'Día,Abre,Cierra\r\nLunes,9:30,20:00:00\r\nMartes,09:30:00,20:00:00\r\nMiércoles,09:30:00,20:00:00\r\nJueves,09:30:00,20:00:00\r\nViernes,09:30:00,20:00:00\r\nSábado,09:30:00,20:00:00\r\nDomingo,09:30:00,20:00:00\r\n' });
  await page.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1');
  await expect(page.locator('body')).toContainText('15.000');
  await page.locator('[data-elige]').first().click();
  await page.locator('[data-sig]').click();
  await page.locator('[data-mes="1"]').click();
  await page.locator('button[data-f]:not([aria-disabled])').first().click();
  const horas = await page.locator('[data-min]').allTextContents();
  expect(horas.length).toBeGreaterThan(0);
  expect(horas.every((h) => /^\d\d:\d\d$/.test(h) && h >= '09:30' && h < '20:00')).toBe(true);
});

for (const [nombre, d, h] of [['DD-MM-AAAA', fmt(dias(-1)), fmt(dias(5))], ['DD/MM/AAAA', fmt(dias(-1)).replaceAll('-', '/'), fmt(dias(5)).replaceAll('-', '/')], ['AAAA-MM-DD', iso(dias(-1)), iso(dias(5))]]) {
  test(`fecha del aviso en ${nombre}`, async ({ page }) => {
    await pagina(page, { aviso: AVISO(d, h) });
    await expect(page.locator('#aviso-planilla')).toBeVisible();
  });
}

test('aviso vencido en formato ISO no se muestra', async ({ page }) => {
  await pagina(page, { aviso: AVISO(iso(dias(-10)), iso(dias(-2))) });
  await page.waitForTimeout(600);
  await expect(page.locator('#aviso-planilla')).toHaveCount(0);
});

for (const v of ['Sí', 'Si', 'sí', 'SI', 'x']) {
  test(`Activo "${v}" mantiene visible el servicio y el aviso`, async ({ page }) => {
    await pagina(page, { servicios: `Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,15000,45,,${v}\r\n`, aviso: AVISO(fmt(dias(-1)), fmt(dias(5)), v) });
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toBeVisible();
    await expect(page.locator('#aviso-planilla')).toBeVisible();
  });
}

for (const v of ['No', 'NO', 'no']) {
  test(`Activo "${v}" oculta el servicio`, async ({ page }) => {
    await pagina(page, { servicios: `Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,15000,45,,Sí\r\nBarba,Barba,7000,30,,${v}\r\n` });
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toBeVisible();
    await expect(page.locator('#servicios [data-reservar="Barba"]')).toHaveCount(0);
  });
}

// --- Decimales, número de serie de Excel, AM/PM y fecha americana ---
const SERV = (precio) => `Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,${precio},45,,Sí\r\n`;

for (const txt of ['15000.00', '"15,000.00"', '"15000,00"', '"$15.000,00"', '"$ 15.000"', '"$15,000"', '$15.000', '15000']) {
  test(`precio ${txt} se lee como $15.000 (página y reserva)`, async ({ page }) => {
    await pagina(page, { servicios: SERV(txt) });
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$15.000');
  });
  test(`precio ${txt} se lee como 15.000 en la reserva simple`, async ({ page }) => {
    await rutas(page, { servicios: SERV(txt) });
    await page.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1');
    await expect(page.locator('[data-elige="fade"]')).toContainText('15.000');
  });
}

test('precio con texto se rechaza (página y reserva simple)', async ({ page }) => {
  await pagina(page, { servicios: SERV('"abc 123"') + 'Barba a navaja,Barba,7000,30,,Sí\r\n' });
  await expect(page.locator('#servicios [data-reservar="Fade"]')).toHaveCount(0);
  await expect(page.locator('#servicios [data-reservar="Barba a navaja"]').first()).toBeVisible();
  const p2 = await page.context().newPage();
  await rutas(p2, { servicios: SERV('"abc 123"') + 'Barba a navaja,Barba,7000,30,,Sí\r\n' });
  await p2.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1&revisar=1');
  await expect(p2.locator('[data-elige="fade"]')).toHaveCount(0);
  await expect(p2.locator('body')).toContainText('no es un número');
});

for (const [txt, esperado] of [['0.4375', '10:30'], ['"0,4375"', '10:30'], ['10:00 AM', '10:00'], ['"10:00 a. m."', '10:00'], ['1:30 PM', '13:30'], ['12:00 AM', '00:00']]) {
  test(`hora ${txt} se lee como ${esperado} en la página`, async ({ page }) => {
    await pagina(page, { horario: `Día,Abre,Cierra\r\nMartes,${txt},23:00\r\n` });
    await expect(page.locator('#horario dl.horas')).toContainText(esperado + ' – 23:00');
  });
}

const horasDe = async (page, txt) => {
  const todos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => `${d},${txt},20:00`).join('\r\n');
  await rutas(page, { horario: `Día,Abre,Cierra\r\n${todos}\r\n` });
  await page.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1');
  await page.locator('[data-elige]').first().click();
  await page.locator('[data-sig]').click();
  await page.locator('[data-mes="1"]').click();
  await page.locator('button[data-f]:not([aria-disabled])').first().click();
  return page.locator('[data-min]').allTextContents();
};
for (const txt of ['0.4375', '10:30 AM', '"10:30 a. m."']) {
  test(`hora ${txt} da las mismas horas que 10:30 en la reserva simple`, async ({ page }) => {
    const base = await horasDe(page, '10:30');
    expect(base.length).toBeGreaterThan(0);
    const p2 = await page.context().newPage();
    expect(await horasDe(p2, txt)).toEqual(base);
  });
}

// 46323 = 2026-10-28 (época Excel 1899-12-30). Se prueba con una vigencia que contiene hoy (2026-10-30 como mínimo en la ejecución) usando fechas relativas.
const serial = (d) => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000);
test('fecha como número de serie de Excel (aviso vigente)', async ({ page }) => {
  expect(serial(new Date(2026, 9, 28))).toBe(46323);
  await pagina(page, { aviso: AVISO(String(serial(dias(-1))), String(serial(dias(5)))) });
  await expect(page.locator('#aviso-planilla')).toBeVisible();
});

test('fecha americana (mes > 12) se descarta con aviso, sin mostrar basura (página)', async ({ page }) => {
  await rutas(page, { aviso: AVISO('10/28/2026', fmt(dias(5))) });
  await page.goto('/ejemplos/barberia-simple/?revisar=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#revisar-contenido')).toContainText('fecha no válida');
  await expect(page.locator('#aviso-planilla')).toHaveCount(0);
});

test('fecha ocupada americana o en serie en la reserva simple: se avisa y no se bloquea basura', async ({ page }) => {
  await page.route('**/simple.config.js*', async (r) => {
    const resp = await r.fetch();
    await r.fulfill({ response: resp, body: (await resp.text()).replace("barberos: 'planilla-ejemplo/barberia-barberos.csv'", "barberos: 'planilla-ejemplo/barberia-barberos.csv', ocupado: 'planilla-ejemplo/barberia-ocupado.csv'") });
  });
  await rutas(page, {});
  await page.route('**/barberia-ocupado.csv*', (r) => r.fulfill(csv('Desde,Hasta\r\n10/28/2026,\r\n')));
  await page.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1&revisar=1');
  await expect(page.locator('body')).toContainText('Ocupado, fila 2');
});

// --- Rango de seguridad del precio y la duración ---
test('precio 500001 se descarta y cae al respaldo estático (página) con aviso', async ({ page }) => {
  await rutas(page, { servicios: SERV('500001') });
  await page.goto('/ejemplos/barberia-simple/?revisar=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#servicios [data-reservar="Fade"]').first()).toContainText('$15.000');
  await expect(page.locator('#revisar-contenido')).toContainText('Precio fuera de rango en Fade: revisa los ceros');
});

test('precio 500001 se descarta en la reserva simple (usa el respaldo) con aviso', async ({ page }) => {
  await rutas(page, { servicios: SERV('500001') });
  await page.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1&revisar=1');
  await expect(page.locator('[data-elige="fade"]')).toContainText('15.000');
  await expect(page.locator('body')).toContainText('Precio fuera de rango en Fade: revisa los ceros');
});

test('precio 120000 se muestra pero con aviso (página y reserva simple)', async ({ page }) => {
  await rutas(page, { servicios: SERV('120000') });
  await page.goto('/ejemplos/barberia-simple/?revisar=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#servicios [data-reservar="Fade"]').first()).toContainText('$120.000');
  await expect(page.locator('#revisar-contenido')).toContainText('Precio alto en Fade');
  const p2 = await page.context().newPage();
  await rutas(p2, { servicios: SERV('120000') });
  await p2.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1&revisar=1');
  await expect(p2.locator('[data-elige="fade"]')).toContainText('120.000');
  await expect(p2.locator('body')).toContainText('Precio alto en Fade');
});

test('duración 9999 se descarta y usa el respaldo (45 min) con aviso', async ({ page }) => {
  await rutas(page, { servicios: 'Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,15000,9999,,Sí\r\n' });
  await page.goto('/ejemplos/barberia-simple/?revisar=1', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#servicios [data-reservar="Fade"]').first()).toContainText('45 min');
  await expect(page.locator('#revisar-contenido')).toContainText('Duración fuera de rango en Fade');
  const p2 = await page.context().newPage();
  await rutas(p2, { servicios: 'Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,15000,9999,,Sí\r\n' });
  await p2.goto('/ejemplos/reservas-simple/?negocio=barberia&solo=1&revisar=1');
  await expect(p2.locator('[data-elige="fade"]')).toContainText('45 min');
  await expect(p2.locator('body')).toContainText('Duración fuera de rango en Fade');
});
