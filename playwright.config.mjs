import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    browserName: 'chromium'
  },
  projects: [
    { name: 'mobile-small', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'mobile-modern', use: { ...devices['iPhone 14'], browserName: 'chromium' } },
    { name: 'desktop', use: { viewport: { width: 1365, height: 900 } } }
  ]
});
