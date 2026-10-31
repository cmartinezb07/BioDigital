import { test, expect } from '@playwright/test';

// Recorrido de un cliente en la reserva simple: elige, agenda, deja sus datos y arma la solicitud de WhatsApp.
// La demo simula el Google Calendar del dueño: mañana ocupa 11:00-12:00 y 16:00-17:30; pasado mañana +2 días (día 3) cerrado;
// la cabaña Copihue está tomada desde el día 5.
const iso = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const libres = (page) => page.locator('button[data-f]:not([aria-disabled])');

// Siempre en el mes siguiente: así la prueba no depende de cuántos días le queden al mes actual.
async function irAPrimerDiaLibre(page) {
  await page.locator('[data-mes="1"]').click();
  await expect(libres(page).first()).toBeVisible();
}

test.describe('reserva simple · salón (por horas)', () => {
  test('cliente completo: servicio, día, hora, datos y solicitud por WhatsApp', async ({ page }) => {
    await page.goto('/ejemplos/reservas-simple/?negocio=salon');
    await page.locator('[data-elige="corte"]').click();
    await page.locator('[data-sig]').click();

    await irAPrimerDiaLibre(page);
    await libres(page).first().click();
    await page.locator('[data-min]').first().click();
    await expect(page.locator('.resumen-lat')).toContainText('Total estimado');
    await page.locator('[data-sig]').click();

    await page.locator('#s-nombre').fill('María Pérez');
    await page.locator('#s-tel').fill('+56 9 8765 4321');
    await page.locator('#sc-primera').selectOption('Sí');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: 'Tu solicitud está lista' })).toBeVisible();
    const enlace = await page.locator('[data-enviar]').getAttribute('href');
    expect(enlace).toContain('https://wa.me/56946941640?text=');
    const texto = decodeURIComponent(enlace.split('text=')[1]);
    expect(texto).toContain('Corte y lavado');
    expect(texto).toContain('María Pérez');
    expect(texto).toContain('Total estimado');
  });

  test('sin elegir nada avisa y no avanza', async ({ page }) => {
    await page.goto('/ejemplos/reservas-simple/?negocio=salon');
    await page.locator('[data-sig]').click();
    await expect(page.locator('.err')).toHaveText('Elige una opción.');
    await expect(page.getByRole('heading', { name: '¿Qué quieres reservar?' })).toBeVisible();
  });

  test('datos vacíos o inválidos marcan los campos y no envían', async ({ page }) => {
    await page.goto('/ejemplos/reservas-simple/?negocio=salon');
    await page.locator('[data-elige="corte"]').click();
    await page.locator('[data-sig]').click();
    await irAPrimerDiaLibre(page);
    await libres(page).first().click();
    await page.locator('[data-min]').first().click();
    await page.locator('[data-sig]').click();

    await page.locator('#s-nombre').fill('Al');
    await page.locator('#s-tel').fill('123');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.err')).toHaveText('Revisa los campos marcados en rojo.');
    await expect(page.locator('#s-nombre').locator('xpath=..')).toContainText('nombre y apellido');
    await expect(page.locator('#s-tel').locator('xpath=..')).toContainText('celular válido');
    await expect(page.getByRole('heading', { name: 'Tus datos' })).toBeVisible();
  });

  test('el calendario del dueño bloquea lo ocupado: mañana sin 11:00 y el día 3 cerrado', async ({ page }) => {
    await page.goto('/ejemplos/reservas-simple/?negocio=salon');
    await page.locator('[data-elige="corte"]').click();
    await page.locator('[data-sig]').click();

    const cerrado = page.locator(`[data-f="${iso(3)}"]`);
    if (await cerrado.count()) await expect(cerrado).toHaveAttribute('aria-disabled', 'true');

    const manana = page.locator(`[data-f="${iso(1)}"]`);
    const abierto = (await manana.count()) > 0 && !(await manana.getAttribute('aria-disabled'));
    test.skip(!abierto, 'mañana el salón está cerrado por horario: no se puede comprobar la hora ocupada');
    await manana.click();
    await expect(page.locator('[data-min]').first()).toBeVisible();
    const horas = await page.locator('[data-min]').allTextContents();
    expect(horas, 'hora ocupada por el calendario').not.toContain('11:00');
  });

  test('el enlace para el negocio (#g=) abre sin errores', async ({ page }) => {
    const errores = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('/ejemplos/reservas-simple/?negocio=salon');
    await page.locator('[data-elige="corte"]').click();
    await page.locator('[data-sig]').click();
    await irAPrimerDiaLibre(page);
    await libres(page).first().click();
    await page.locator('[data-min]').first().click();
    await page.locator('[data-sig]').click();
    await page.locator('#s-nombre').fill('Pedro Soto');
    await page.locator('#s-tel').fill('+56 9 1111 2222');
    await page.locator('#sc-primera').selectOption('No');
    await page.locator('button[type="submit"]').click();

    const texto = decodeURIComponent((await page.locator('[data-enviar]').getAttribute('href')).split('text=')[1]);
    const gestion = texto.match(/(https?:\/\/\S+#g=\S+)/)[1];
    // Se abre como lo haría el dueño desde WhatsApp: en una pestaña nueva (en la misma, solo cambiaría el # y no recargaría).
    const duenio = await page.context().newPage();
    duenio.on('pageerror', (e) => errores.push(e.message));
    await duenio.goto(gestion);
    await expect(duenio.locator('body')).toContainText('Pedro Soto');
    expect(errores).toEqual([]);
  });
});

test.describe('reserva simple · cabañas (por noches)', () => {
  test('cliente completo: cabaña, llegada, salida, datos y solicitud', async ({ page }) => {
    await page.goto('/ejemplos/reservas-simple/?negocio=cabanas');
    await page.locator('[data-elige="copihue"]').click();
    await page.locator('[data-sig]').click();

    await irAPrimerDiaLibre(page);
    await libres(page).nth(0).click();
    await libres(page).nth(1).click();
    await expect(page.locator('.resumen-lat')).toContainText('Total estimado');
    await page.locator('[data-sig]').click();

    await page.locator('#s-nombre').fill('Ana Rojas');
    await page.locator('#s-tel').fill('+56 9 2222 3333');
    await page.locator('button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: 'Tu solicitud está lista' })).toBeVisible();
    const texto = decodeURIComponent((await page.locator('[data-enviar]').getAttribute('href')).split('text=')[1]);
    expect(texto).toContain('Copihue');
    expect(texto).toContain('Personas: 2');
  });
});
