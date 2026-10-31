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
