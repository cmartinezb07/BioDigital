import { defineConfig } from '@playwright/test';

// Pruebas de recorrido de cliente. Usa el Chrome ya instalado (sin descargar navegadores).
export default defineConfig({
  testDir: 'pruebas-e2e',
  timeout: 30000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4321', channel: 'chrome', headless: true },
  webServer: {
    command: 'python web/servir.py 4321 web/propuesta',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'celular', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
    { name: 'escritorio', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
