import { test, expect } from '@playwright/test';

// La barbería lee su planilla (servicios, horario, barberos). Cada prueba devuelve CSV modificados con page.route.
const URL = '/ejemplos/reservas-simple/?negocio=barberia&solo=1';
const csv = (texto) => ({ status: 200, contentType: 'text/csv; charset=utf-8', body: texto });
const SERVICIOS = `Servicio,Categoría,Precio,Duración (min),Descripción,Activo
Fade,Cortes,13500,45,"Degradado.",Sí
Corte clásico,Cortes,10000,40,,Sí
Perfilado,Otros,4000,15,,No
`;
const BARBEROS = `Barbero,Activo
Cuervo,Sí
Tiburón,No
Fideo,Sí
Toro,Sí
`;

async function irADatos(page) {
  await page.locator('[data-elige]').first().click();
  await page.locator('[data-sig]').click();
  await page.locator('[data-mes="1"]').click();
  await page.locator('button[data-f]:not([aria-disabled])').first().click();
  await page.locator('[data-min]').first().click();
  await page.locator('[data-sig]').click();
  await expect(page.locator('#sc-barbero')).toBeVisible();
}

test.describe('barbería · planilla', () => {
  test('precio cambiado y servicio inactivo se reflejan en servicios', async ({ page }) => {
    await page.route('**/barberia-servicios.csv', (r) => r.fulfill(csv(SERVICIOS)));
    await page.goto(URL);
    await expect(page.getByText('Fade').first()).toBeVisible();
    await expect(page.locator('body')).toContainText('13.500');
    await expect(page.locator('body')).not.toContainText('Perfilado');
  });

  test('barbero inactivo no aparece y uno nuevo sí', async ({ page }) => {
    await page.route('**/barberia-barberos.csv', (r) => r.fulfill(csv(BARBEROS)));
    await page.goto(URL);
    await irADatos(page);
    const op = await page.locator('#sc-barbero option').allTextContents();
    expect(op).toContain('Sin preferencia');
    expect(op).toContain('Toro');
    expect(op).toContain('Cuervo');
    expect(op).not.toContain('Tiburón');
  });

  test('si el CSV de barberos da 404 quedan las opciones por defecto', async ({ page }) => {
    await page.route('**/barberia-barberos.csv', (r) => r.fulfill({ status: 404, body: 'no' }));
    await page.goto(URL);
    await irADatos(page);
    const op = await page.locator('#sc-barbero option').allTextContents();
    expect(op).toEqual(expect.arrayContaining(['Sin preferencia', 'Cuervo', 'Tiburón', 'Fideo']));
  });
});
