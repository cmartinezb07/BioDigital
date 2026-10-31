import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';

// Recorrido de la demo de la barbería: página del cliente -> panel Mi agenda -> Mi planilla.
const BASE = '/ejemplos/barberia-simple/';
const hayPlanilla = existsSync('web/propuesta/ejemplos/barberia-simple/mi-planilla/index.html');
const NOTA = 'Para editar el contenido de tu página se usa una planilla de Google Sheets propia, incluida en el precio y configurada por Bío Digital a pedido del cliente. Sin mensualidad.';

function vigilar(page) {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|unsplash|ERR_|Failed to load resource/.test(m.text() + (m.location().url || ''))) errores.push(m.text()); });
  return errores;
}

test.describe('barbería · recorrido de la demo', () => {
  test('franja con los 3 enlaces, nota, sin scroll horizontal y sin tapar Reservar hora', async ({ page, request }) => {
    const errores = vigilar(page);
    await page.goto(BASE);
    const franja = page.locator('aside.recorrido');
    await expect(franja).toBeVisible();
    await expect(franja.locator('a')).toHaveText(['Página del cliente', 'Panel del dueño (Mi agenda)', 'Mi planilla']);
    await expect(franja).toContainText('nunca la estructura');
    await expect(franja.locator('[data-nota]')).toContainText(NOTA);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // La franja está en el flujo (no fija): no puede tapar el botón de reservar ni el aviso
    expect(await franja.evaluate((e) => getComputedStyle(e).position)).not.toBe('fixed');
    for (const h of ['./', 'mi-agenda/']) {
      const r = await request.get(BASE + h);
      expect(r.status(), h).toBe(200);
    }
    expect(errores).toEqual([]);
  });

  test('enlace al panel lleva a Mi agenda y el botón Editar mi página apunta a la planilla', async ({ page }) => {
    const errores = vigilar(page);
    await page.goto(BASE);
    await page.locator('aside.recorrido a[data-pieza="agenda"]').click();
    await expect(page).toHaveURL(/mi-agenda\/$/);
    await expect(page.locator('h1')).toHaveText('Barbería El Filo');
    const b = page.locator('#a-planilla');
    await expect(b).toBeVisible();
    await expect(b).toHaveText('Editar mi página (planilla)');
    await expect(b).toHaveAttribute('href', '../mi-planilla/');
    await expect(page.locator('#nota-demo')).toContainText(NOTA);
    // lo que ya hacía el panel sigue igual
    await expect(page.locator('#resumen')).toBeVisible();
    await expect(page.locator('#actualizar')).toBeVisible();
    await expect(page.locator('.cita')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errores).toEqual([]);
  });

  test('Mi planilla responde 200 y es la pieza correcta', async ({ page, request }) => {
    test.skip(!hayPlanilla, 'mi-planilla/ todavía no existe');
    expect((await request.get(BASE + 'mi-planilla/')).status()).toBe(200);
    await page.goto(BASE);
    await page.locator('aside.recorrido a[data-pieza="planilla"]').click();
    await expect(page).toHaveURL(/mi-planilla\/$/);
    await page.goto(BASE + 'mi-agenda/');
    await page.locator('#a-planilla').click();
    await expect(page).toHaveURL(/mi-planilla\/$/);
  });
  test('celular 375px: sin scroll horizontal en la página de la barbería', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });

  test('entrega real: con planillaUrl vacío el botón Editar mi página no se muestra', async ({ page }) => {
    await page.route('**/mi-agenda/config.js*', async (route) => {
      const r = await route.fetch(); const t = (await r.text()).replace(/planillaUrl:\s*'[^']*'/, "planillaUrl: ''");
      await route.fulfill({ response: r, body: t });
    });
    await page.goto(BASE + 'mi-agenda/');
    await expect(page.locator('#a-planilla')).toBeHidden();
  });
});
