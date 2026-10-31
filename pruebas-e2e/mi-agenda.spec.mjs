import { test, expect } from '@playwright/test';

const URL = '/ejemplos/barberia-simple/mi-agenda/index.html';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,OPTIONS' };

function mañana10() { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; }
function ev(summary, desc, h, min = 45) {
  const a = mañana10(); a.setHours(h); const b = new Date(a.getTime() + min * 6e4);
  return { summary, description: desc, start: { dateTime: a.toISOString() }, end: { dateTime: b.toISOString() } };
}

test.describe('Mi agenda · modo demostración', () => {
  test('cinta, resumen, lista y WhatsApp', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#cinta')).toBeVisible();
    await expect(page.locator('#cinta')).toContainText('Modo demostración');
    await expect(page.locator('#resumen')).toBeVisible();
    await expect(page.locator('#r-n')).toHaveText('5');
    await expect(page.locator('#r-ini')).toHaveText('10:00');
    await expect(page.locator('.cita')).toHaveCount(5);
    await expect(page.locator('.cita').first()).toContainText('Matías Rojas');
    await expect(page.locator('.cita').first()).toContainText('Cuervo');
    const href = await page.locator('[data-wa]').first().getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/56987654321\?text=/);
    expect(decodeURIComponent(href)).toContain('Hola Matías');
    expect(decodeURIComponent(href)).toContain('mañana a las 10:00');
    // accesos del dueño
    await expect(page.locator('#a-servicios')).toHaveAttribute('href', /barberia-servicios\.csv$/);
    await expect(page.locator('#a-pagina')).toBeVisible();
    await expect(page.getByText('Los cambios se ven en tu página al recargarla.')).toBeVisible();
    // sin scroll horizontal
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('Actualizar recarga y cambia el día', async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#estado')).toContainText('Actualizado a las');
    await page.locator('#estado').evaluate((e) => { e.textContent = 'x'; });
    await page.getByRole('button', { name: 'Actualizar' }).click();
    await expect(page.locator('#estado')).toContainText('Actualizado a las');
    await page.getByRole('button', { name: 'Hoy' }).click();
    await expect(page.locator('#titulo-dia')).toContainText('Hoy');
    await expect(page.locator('[data-dia="hoy"]')).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Mañana' }).click();
    await expect(page.locator('#titulo-dia')).toContainText('Mañana');
    await page.locator('#otro').fill('2030-01-15');
    await expect(page.locator('#titulo-dia')).toContainText('15 de enero');
    await expect(page.locator('.cita')).toHaveCount(5);
  });
});

test.describe('Mi agenda · modo real simulado', () => {
  async function preparar(page) {
    await page.addInitScript(() => {
      window.MI_AGENDA = { clientId: 'prueba.apps.googleusercontent.com', calendarId: 'dueno@gmail.com' };
      window.__tokens = 0;
      window.google = { accounts: { oauth2: { initTokenClient(cfg) { return { requestAccessToken() { window.__tokens++; cfg.callback({ access_token: 'tok' + window.__tokens }); } }; } } } };
    });
  }
  async function api(page, handler) {
    await page.route('https://www.googleapis.com/calendar/v3/**', async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
      return handler(route);
    });
  }

  test('entra, lista eventos y trata el HTML como texto', async ({ page }) => {
    await preparar(page);
    const vistos = [];
    await api(page, (route) => {
      vistos.push({ url: route.request().url(), auth: route.request().headers()['authorization'] });
      return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ items: [
        ev('Fade · Ana Pérez', 'Cel +56 9 1111 2222 · $12.000 · ¿Con qué barbero?: Tiburón · Solicitud desde la página', 11),
        ev('<img src=x onerror=window.__xss=1><script>window.__xss=1</script>', 'sin formato', 15, 30),
      ] }) });
    });
    await page.goto(URL);
    await expect(page.locator('#cinta')).toBeHidden();
    await expect(page.locator('#sesion')).toBeVisible();
    await page.getByRole('button', { name: 'Entrar con Google' }).click();
    await expect(page.locator('.cita')).toHaveCount(2);
    await expect(page.locator('.cita').first()).toContainText('Ana Pérez');
    await expect(page.locator('.cita').first()).toContainText('Tiburón');
    await expect(page.locator('.cita').nth(1)).toContainText('<script>window.__xss=1</script>');
    await expect(page.locator('.cita').nth(1).locator('[data-wa]')).toHaveCount(0);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    expect(vistos[0].url).toContain('/calendars/dueno%40gmail.com/events');
    expect(vistos[0].url).toContain('singleEvents=true');
    expect(vistos[0].auth).toBe('Bearer tok1');
    expect(await page.evaluate(() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage))).not.toContain('tok1');
  });

  test('401 pide entrar de nuevo', async ({ page }) => {
    await preparar(page);
    let n = 0;
    await api(page, (route) => {
      n++;
      if (n === 1) return route.fulfill({ status: 401, headers: CORS, contentType: 'application/json', body: '{}' });
      return route.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ items: [] }) });
    });
    await page.goto(URL);
    await page.getByRole('button', { name: 'Entrar con Google' }).click();
    await expect(page.locator('#sesion-msg')).toContainText('venció');
    await page.getByRole('button', { name: 'Entrar con Google' }).click();
    await expect(page.locator('#vacio')).toContainText('no tienes clientes agendados');
    expect(await page.evaluate(() => window.__tokens)).toBe(2);
  });

  test('403 muestra un mensaje claro', async ({ page }) => {
    await preparar(page);
    await api(page, (route) => route.fulfill({ status: 403, headers: CORS, contentType: 'application/json', body: '{}' }));
    await page.goto(URL);
    await page.getByRole('button', { name: 'Entrar con Google' }).click();
    await expect(page.locator('#estado')).toContainText('no dio permiso');
    await expect(page.locator('#estado')).toHaveClass(/error/);
  });

  test('sin red avisa', async ({ page }) => {
    await preparar(page);
    await api(page, (route) => route.abort('failed'));
    await page.goto(URL);
    await page.getByRole('button', { name: 'Entrar con Google' }).click();
    await expect(page.locator('#estado')).toContainText('Sin conexión');
  });
});
