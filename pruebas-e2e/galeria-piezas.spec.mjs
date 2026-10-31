import { test, expect } from '@playwright/test';

// Galería de ejemplos: una tarjeta por demo con enlaces a sus piezas, y la franja compartida "Demo · recorre las piezas" en cada pieza.
const TARJETAS = {
  'Fogón del Sur': { piezas: ['fogon-del-sur/', 'fogon-del-sur/pedido/?demo', 'fogon-del-sur/cocina/', 'fogon-del-sur/repartidor/', 'fogon-del-sur/panel/'], imagenes: 4 },
  'Reservas en línea': { piezas: ['reservas/', 'reservas/?mis=1', 'reservas/admin/', 'reservas/admin/'], imagenes: 3 },
  'Café Mirador': { piezas: ['fidelizacion/', 'fidelizacion/local/'], imagenes: 1 },
  'Barbería El Filo': { piezas: ['barberia-simple/', 'barberia-simple/mi-agenda/', 'barberia-simple/mi-planilla/'], imagenes: 1 },
};

test.describe('galería · una tarjeta por demo', () => {
  test('sin duplicados de El Filo, sin "Sistemas completos" y con enlaces e imágenes por pieza', async ({ page }) => {
    await page.goto('/ejemplos/');
    const titulos = await page.locator('article.gx h2').allTextContents();
    expect(new Set(titulos).size, 'títulos repetidos: ' + titulos).toBe(titulos.length);
    expect(titulos.filter((t) => /Filo/.test(t))).toEqual(['Barbería El Filo']);
    await expect(page.locator('a[href^="barberia/"]')).toHaveCount(0);
    await expect(page.getByText('Sistemas completos')).toHaveCount(0);
    await expect(page.locator('article.gx', { hasText: 'Panel del restaurante' })).toHaveCount(0);
    for (const [nombre, t] of Object.entries(TARJETAS)) {
      const card = page.locator('article.gx', { has: page.locator('h2', { hasText: new RegExp('^' + nombre + '$') }) });
      await expect(card, nombre).toHaveCount(1);
      const hrefs = await card.locator('.gx-piezas a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(hrefs, nombre).toEqual(t.piezas);
      // cada pieza es un <a> real (ctrl+clic y clic derecho) y las capturas de la tarjeta siguen visibles
      const imgs = card.locator('img');
      expect(await imgs.count(), nombre + ' imágenes').toBe(t.imagenes);
      for (const img of await imgs.all()) { await img.scrollIntoViewIfNeeded(); await expect(img).toBeVisible(); await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0), nombre).toBe(true); }
      expect(await card.evaluate((c) => c.scrollWidth <= c.clientWidth + 1), nombre + ' sin scroll horizontal').toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test('el carrusel de la portada conserva sus 15 diapositivas y apunta a la barbería nueva', async ({ page }) => {
    await page.goto('/');
    const lista = JSON.parse(await page.locator('.tg[data-images]').getAttribute('data-images'));
    expect(lista).toHaveLength(15);
    const urls = lista.map((d) => d.url);
    expect(urls.some((u) => /ejemplos\/barberia\//.test(u))).toBe(false);
    expect(lista.find((d) => d.url === 'ejemplos/barberia-simple/').src).toBe('ejemplos/barberia-simple-chica.webp');
    for (const clave of ['restaurante-seguimiento', 'restaurante-cocina', 'restaurante-panel', 'reservas-calendario', 'reservas-panel', 'fidelizacion']) {
      expect(lista.some((d) => d.src === `ejemplos/${clave}-chica.webp`), clave).toBe(true);
    }
  });
});

// Franja compartida: aparece en cada pieza con la pieza actual marcada.
const PIEZAS = [
  ['carta', '/ejemplos/fogon-del-sur/', 'Carta del cliente', 5],
  ['pedido', '/ejemplos/fogon-del-sur/pedido/?demo', 'Pedido en vivo', 5],
  ['cocina', '/ejemplos/fogon-del-sur/cocina/', 'Cocina', 5, '247135'],
  ['repartidor', '/ejemplos/fogon-del-sur/repartidor/', 'Repartidor', 5, '913572'],
  ['panel', '/ejemplos/fogon-del-sur/panel/', 'Administración', 5],
  ['reservas cliente', '/ejemplos/reservas/', 'Página del cliente', 3],
  ['mis reservas', '/ejemplos/reservas/?mis=1', 'Mis reservas', 3],
  ['reservas admin', '/ejemplos/reservas/admin/', 'Panel del negocio', 3],
  ['tarjeta', '/ejemplos/fidelizacion/', 'Tarjeta del cliente', 2],
  ['caja', '/ejemplos/fidelizacion/local/', 'Caja del local', 2],
  ['barbería página', '/ejemplos/barberia-simple/', 'Página del cliente', 3],
  ['barbería agenda', '/ejemplos/barberia-simple/mi-agenda/', 'Panel del dueño (Mi agenda)', 3],
  ['barbería planilla', '/ejemplos/barberia-simple/mi-planilla/', 'Mi planilla', 3],
];
for (const [nombre, ruta, actual, n, pin] of PIEZAS) {
  test(`franja de la demo en ${nombre}`, async ({ page }) => {
    if (pin) await page.addInitScript((v) => sessionStorage.setItem('nube-pin-fogon', v), pin);
    await page.goto(ruta);
    const franja = page.locator('aside.bd-recorrido');
    await expect(franja).toBeVisible();
    await expect(franja.locator('a')).toHaveCount(n);
    await expect(franja.locator('a[aria-current="page"]')).toHaveText(actual);
    await expect(franja.locator('a[aria-current="page"]')).toHaveCount(1);
    expect(await franja.evaluate((e) => getComputedStyle(e).position)).not.toBe('fixed');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'scroll horizontal').toBe(true);
  });
}

test('las demos de una pieza no muestran franja', async ({ page }) => {
  await page.goto('/ejemplos/estetica/');
  await expect(page.locator('aside.bd-recorrido')).toHaveCount(0);
});
