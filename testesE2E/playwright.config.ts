import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  fullyParallel: false,
  retries: 0,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'relatorio-html' }],
    ['json', { outputFile: 'relatorio/resultados.json' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
