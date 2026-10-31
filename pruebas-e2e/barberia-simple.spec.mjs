import { test, expect } from '@playwright/test';

// Barbería El Filo con reserva simple: el widget (iframe) dentro del sitio de la barbería.
// El calendario del dueño es simulado: mañana ocupa 11:00-13:00 y 17:00-18:00; en 2 días 10:00-12:30 y 15:00-16:30; en 4 días todo el día.
const iso = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// El marco de la reserva se carga al llegar a él (carga diferida): hay que bajar hasta la sección, como lo haría un cliente.
async function abrir(page) {
  await page.goto('/ejemplos/barberia-simple/', { waitUntil: 'domcontentloaded' });
  await page.locator('#reserva').scrollIntoViewIfNeeded();
  return page.frameLocator('iframe[title="Reserva por WhatsApp"]');
}

test('la barbería carga con su reserva dentro, sin errores', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  const marco = await abrir(page);
  await expect(page.locator('.hero-titulo')).toContainText('El psicólogo es caro');
  await expect(marco.getByRole('heading', { name: '¿Qué quieres reservar?' })).toBeVisible();
  await expect(marco.locator('[data-elige="fade"]')).toContainText('$15.000');
  await expect(marco.locator('.negocios'), 'el selector de negocios no va dentro de la barbería').toHaveCount(0);
  expect(errores).toEqual([]);
});

test('cliente completo: Fade, día, hora, datos, barbero y solicitud por WhatsApp', async ({ page }) => {
  const m = await abrir(page);
  await m.locator('[data-elige="fade"]').click();
  await m.locator('[data-sig]').click();
  await m.locator('[data-mes="1"]').click();
  await m.locator('button[data-f]:not([aria-disabled])').first().click();
  await m.locator('[data-min]').first().click();
  await m.locator('[data-sig]').click();

  await m.locator('#s-nombre').fill('Cris Martínez');
  await m.locator('#s-tel').fill('+56 9 6632 6775');
  await m.locator('#sc-barbero').selectOption('Tiburón');
  await m.locator('button[type="submit"]').click();

  await expect(m.getByRole('heading', { name: 'Tu solicitud está lista' })).toBeVisible();
  const enlace = await m.locator('[data-enviar]').getAttribute('href');
  expect(enlace).toContain('https://wa.me/56946941640?text=');
  const texto = decodeURIComponent(enlace.split('text=')[1]);
  expect(texto).toContain('Fade');
  expect(texto).toContain('Cris Martínez');
  expect(texto).toContain('Tiburón');
  expect(texto).toContain('Barbería El Filo');

  // El dueño abre el enlace del mensaje: ve la solicitud y puede agendarla en su Google Calendar con el nombre y el servicio.
  const gestion = texto.match(/(https?:\/\/\S+#g=\S+)/)[1];
  const duenio = await page.context().newPage();
  await duenio.goto(gestion);
  await expect(duenio.locator('body')).toContainText('Cris Martínez');
  const agendar = duenio.getByRole('link', { name: /Agendar en mi Google Calendar/ });
  await expect(agendar).toBeVisible();
  const gcal = decodeURIComponent(await agendar.getAttribute('href'));
  expect(gcal).toContain('calendar.google.com/calendar/render');
  expect(gcal).toContain('Fade');
  expect(gcal).toContain('Cris Martínez');
});

test('el calendario del dueño bloquea lo ocupado y respeta el horario', async ({ page }) => {
  const m = await abrir(page);
  await m.locator('[data-elige="fade"]').click();
  await m.locator('[data-sig]').click();

  const todoElDia = m.locator(`[data-f="${iso(4)}"]`);
  if (await todoElDia.count()) await expect(todoElDia).toHaveAttribute('aria-disabled', 'true');

  // Un día cualquiera de Mar a Vie en que haya algo ocupado: la hora ocupada no se ofrece y el almuerzo (13:30-15:00) tampoco.
  const dias = await m.locator('button[data-f]:not([aria-disabled])').evaluateAll((bs) => bs.map((b) => b.dataset.f));
  const objetivo = [iso(1), iso(2)].find((f) => dias.includes(f));
  test.skip(!objetivo, 'ni mañana ni pasado mañana están abiertos hoy: no se puede comprobar la hora ocupada');
  await m.locator(`[data-f="${objetivo}"]`).click();
  const horas = await m.locator('[data-min]').allTextContents();
  const ocupadas = objetivo === iso(1) ? ['11:00', '11:30', '12:00', '12:30'] : ['10:30', '11:00', '11:30', '12:00', '15:30', '16:00'];
  for (const h of ocupadas) expect(horas, `${h} está ocupada`).not.toContain(h);
  // De martes a viernes hay pausa de almuerzo (13:30-15:00); el sábado se atiende de corrido hasta las 17:00.
  const dia = new Date(`${objetivo}T12:00:00`).getDay();
  if (dia >= 2 && dia <= 5) for (const h of ['13:45', '14:00', '14:30']) expect(horas, `${h} es la hora de almuerzo`).not.toContain(h);
  else expect(horas, 'sábado: la última hora cabe antes de las 17:00').not.toContain('17:00');
});
