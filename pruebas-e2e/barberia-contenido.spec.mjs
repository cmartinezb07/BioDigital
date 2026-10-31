import { test, expect } from '@playwright/test';

// Contenido de Barbería El Filo editable desde la planilla (4 CSV). Se interceptan los CSV con page.route.
const SERVICIOS = 'Servicio,Categoría,Precio,Duración (min),Descripción,Activo\r\nFade,Cortes,13500,45,,Sí\r\nCorte clásico,Cortes,10000,40,,Sí\r\nCorte niño,Cortes,8000,30,,No\r\nBarba a navaja,Barba,7000,30,,Sí\r\nPerfilado,Otros,4000,15,,Sí\r\n';
const HORARIO = 'Día,Abre,Cierra\r\nMiércoles,11:00,19:00\r\nJueves,11:00,19:00\r\nViernes,11:00,19:00\r\nSábado,10:00,14:00\r\n';
const BARBEROS = 'Barbero,Activo\r\nCuervo,Sí\r\nTiburón,No\r\nFideo,Sí\r\n';
const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
const dias = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };
const AVISO = (desde, hasta, titulo = 'Oferta', texto = 'Texto normal') => `Título,Texto,Desde,Hasta,Activo\r\n"${titulo}","${texto}",${desde},${hasta},Sí\r\n`;

async function abrir(page, csv = {}, url = '/ejemplos/barberia-simple/') {
  const base = { servicios: SERVICIOS, horario: HORARIO, barberos: BARBEROS, aviso: AVISO(dias(-1), dias(5)), ...csv };
  for (const k of ['servicios', 'horario', 'barberos', 'aviso']) {
    await page.route(`**/barberia-${k}.csv*`, (r) => {
      if (base[k] === null) return r.fulfill({ status: 404, body: 'no' });
      return r.fulfill({ status: 200, contentType: 'text/csv; charset=utf-8', body: base[k] });
    });
  }
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

test('un precio cambiado y un servicio Activo=No se reflejan en Servicios', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$13.500');
  await expect(page.locator('#servicios [data-reservar="Corte niño"]')).toHaveCount(0);
  await expect(page.locator('#servicios [role="tab"]:visible')).toHaveText(['Cortes', 'Barba', 'Otros']);
});

test('un barbero Activo=No oculta su tarjeta y los demás siguen', async ({ page }) => {
  await abrir(page);
  await expect(page.locator('#barberos figure', { hasText: 'Tiburón' })).toBeHidden();
  await expect(page.locator('#barberos figure', { hasText: 'Cuervo' })).toBeVisible();
  await expect(page.locator('#barberos figure', { hasText: 'Fideo' })).toBeVisible();
});

test('el horario se regenera desde la planilla', async ({ page }) => {
  await abrir(page);
  const dl = page.locator('#horario dl.horas');
  await expect(dl).toContainText('Miércoles a viernes');
  await expect(dl).toContainText('11:00 – 19:00');
  await expect(dl).toContainText('10:00 – 14:00');
  await expect(dl).toContainText('Domingo, lunes y martes');
  await expect(dl).toContainText('Cerrado');
  await expect(dl).not.toContainText('Martes a viernes');
});

test('el aviso aparece vigente, no vencido, y el HTML se muestra como texto', async ({ page }) => {
  await abrir(page, { aviso: AVISO(dias(-1), dias(5), 'Hola <b>x</b>', '<script>window.__xss=1</script><img src=x onerror=window.__xss=1>') });
  const aviso = page.locator('#aviso-planilla');
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText('<script>window.__xss=1</script>');
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  await expect(aviso.locator('img, script')).toHaveCount(0);
  await aviso.getByRole('button', { name: 'Cerrar aviso' }).click();
  await expect(aviso).toHaveCount(0);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await expect(page.locator('#aviso-planilla')).toHaveCount(0);
});

test('un aviso vencido o futuro no se muestra', async ({ page }) => {
  await abrir(page, { aviso: AVISO(dias(-10), dias(-2)) });
  await expect(page.locator('#horario dl.horas')).toContainText('Miércoles a viernes'); // ya cargó el contenido
  await expect(page.locator('#aviso-planilla')).toHaveCount(0);
});

test('con los 4 CSV en 404 la página conserva su contenido estático sin errores', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await abrir(page, { servicios: null, horario: null, barberos: null, aviso: null }, '/ejemplos/barberia-simple/?revisar=1');
  await expect(page.locator('#revisar-contenido')).toContainText('servicios');
  await expect(page.locator('#servicios [data-reservar="Corte niño"]')).toHaveCount(1);
  await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$15.000');
  await expect(page.locator('#barberos figure:visible')).toHaveCount(3);
  await expect(page.locator('#horario dl.horas')).toContainText('Martes a viernes');
  await expect(page.locator('#aviso-planilla')).toHaveCount(0);
  expect(errores).toEqual([]);
});
