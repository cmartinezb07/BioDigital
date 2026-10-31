import { test, expect } from '@playwright/test';

// Cada página pública carga sin errores de JavaScript, con título y sin scroll horizontal.
const paginas = [
  ['portada', '/'],
  ['formulario web', '/formulario.html'],
  ['formulario menú', '/formulario-menu.html'],
  ['formulario reservas', '/formulario-reservas.html'],
  ['galería de ejemplos', '/ejemplos/'],
  ['menú Fogón del Sur', '/ejemplos/fogon-del-sur/'],
  ['reservas PRO', '/ejemplos/reservas/'],
  ['reserva simple', '/ejemplos/reservas-simple/'],
  ['fidelización', '/ejemplos/fidelizacion/'],
  ['La Joya del Sur', '/ejemplos/la-joya-del-sur/'],
  ['privacidad', '/privacidad/'],
  ['términos', '/terminos/'],
];

for (const [nombre, ruta] of paginas) {
  test(`${nombre} carga limpia`, async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    const respuesta = await page.goto(ruta, { waitUntil: 'networkidle' });
    expect(respuesta.status(), 'código HTTP').toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);
    expect(errores, 'errores de JavaScript').toEqual([]);
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(desborda, 'scroll horizontal').toBe(false);
  });
}

// Lista de productos de la portada: precio de la reserva simple y sin desborde horizontal (corre también a 375 px en el proyecto celular).
test('portada: reserva simple en $27.990 y lista de productos sin scroll horizontal', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const fila = page.locator('#svc-reservations .fila');
  await expect(fila).toContainText('$27.990');
  await expect(fila).not.toContainText('24.990');
  const t = await page.locator('.tarifario').evaluate((el) => ({ desborda: el.scrollWidth > el.clientWidth + 1, pagina: document.documentElement.scrollWidth > window.innerWidth + 1 }));
  expect(t.desborda, 'scroll horizontal en la lista').toBe(false);
  expect(t.pagina, 'scroll horizontal en la página').toBe(false);
  const familias = await page.locator('.tarifario .fila *').evaluateAll((els) => [...new Set(els.map((e) => getComputedStyle(e).fontFamily))]);
  expect(familias.length, 'una sola familia tipográfica en la lista').toBe(1);
});
