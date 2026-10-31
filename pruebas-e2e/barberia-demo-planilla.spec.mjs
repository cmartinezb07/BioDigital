import { test, expect } from '@playwright/test';

// Demo pública: la planilla simulada (mi-planilla) guarda en localStorage y la página y la reserva de la barbería leen eso.
const PLANILLA = '/ejemplos/barberia-simple/mi-planilla/';
const PAGINA = '/ejemplos/barberia-simple/';

const precioFade = (page) => page.locator('#hoja tbody tr').first().locator('input[aria-label^="Precio"]');

async function editarPrecio(page, valor) {
  await page.goto(PLANILLA);
  await expect(page.locator('#hoja tbody tr').first().locator('input[aria-label^="Servicio"]')).toHaveValue('Fade');
  await precioFade(page).fill(valor);
}

async function enReserva(page) {
  await page.locator('#reserva').scrollIntoViewIfNeeded();
  return page.frameLocator('iframe[title="Reserva por WhatsApp"]');
}

test.describe('barbería · planilla de demostración', () => {
  test('la franja explica la demo y enlaza a la página', async ({ page }) => {
    await page.goto(PLANILLA);
    await expect(page.locator('.franja')).toContainText('Demostración: así edita el dueño su página desde su propia planilla de Google. Aquí lo que cambies se guarda solo en tu navegador.');
    await expect(page.locator('#nota-pie')).toContainText('Para editar el contenido de tu página se usa una planilla de Google Sheets propia, que Bío Digital configura a pedido del cliente. Sin mensualidad.');
    await expect(page.getByRole('link', { name: 'Ver mi página con los cambios' })).toHaveAttribute('href', '../index.html');
  });

  test('precio de Fade en 17000 se ve en la página y en la reserva; restablecer vuelve a $15.000', async ({ page }) => {
    await editarPrecio(page, '17000');
    await page.getByRole('link', { name: 'Ver mi página con los cambios' }).click();
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$17.000');
    const f = await enReserva(page);
    await expect(f.locator('body')).toContainText('17.000');
    await expect(f.locator('body')).not.toContainText('15.000');

    await page.goto(PLANILLA);
    await page.getByRole('button', { name: 'Restablecer ejemplo' }).click();
    await expect(precioFade(page)).toHaveValue('15000');
    await page.goto(PAGINA);
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$15.000');
  });

  test('precio 600000 muestra aviso rojo y la página conserva el respaldo', async ({ page }) => {
    await editarPrecio(page, '600000');
    await expect(precioFade(page).locator('xpath=..')).toHaveClass(/rojo/);
    await precioFade(page).fill('150000');
    await expect(precioFade(page).locator('xpath=..')).toHaveClass(/amarillo/);
    await precioFade(page).fill('600000');
    await page.goto(PAGINA);
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$15.000');
  });

  test('avisos de horario y barberos repetidos', async ({ page }) => {
    await page.goto(PLANILLA);
    await page.getByRole('tab', { name: 'Horario' }).click();
    const fila = page.locator('#hoja tbody tr').first();
    await fila.locator('select[aria-label^="Cierra"]').selectOption('10:00');
    await expect(fila.locator('select[aria-label^="Cierra"]').locator('xpath=..')).toHaveClass(/rojo/);
    await page.getByRole('tab', { name: 'Barberos' }).click();
    await page.locator('#hoja tbody tr').nth(1).locator('input').fill('Cuervo');
    await expect(page.locator('#hoja tbody tr').first().locator('td').first()).toHaveClass(/rojo/);
  });

  test('Agregar fila suma una fila', async ({ page }) => {
    await page.goto(PLANILLA);
    await expect(page.locator('#hoja tbody tr')).toHaveCount(6);
    await page.getByRole('button', { name: 'Agregar fila' }).click();
    await expect(page.locator('#hoja tbody tr')).toHaveCount(7);
  });

  test('sin localStorage no hay errores y la página usa el CSV', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.addInitScript(() => {
      const romper = () => { throw new DOMException('bloqueado', 'SecurityError'); };
      Storage.prototype.getItem = romper; Storage.prototype.setItem = romper; Storage.prototype.removeItem = romper;
    });
    await page.goto(PLANILLA);
    await expect(precioFade(page)).toHaveValue('15000');
    await precioFade(page).fill('17000');
    await expect(page.locator('#estado')).toContainText('No se pudo guardar');
    await page.goto(PAGINA);
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$15.000');
    expect(errores).toEqual([]);
  });

  test('datos corruptos en localStorage caen al CSV', async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.setItem('bio_demo_planilla_barberia', '{no es json'); } catch (e) {} });
    await page.goto(PLANILLA);
    await expect(precioFade(page)).toHaveValue('15000');
    await page.goto(PAGINA);
    await expect(page.locator('#servicios [data-reservar="Fade"]')).toContainText('$15.000');
  });
});
