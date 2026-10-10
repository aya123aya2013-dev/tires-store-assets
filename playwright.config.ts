import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

process.env.PLAYWRIGHT_BROWSERS_PATH = fileURLToPath(new URL('./output/playwright/browsers', import.meta.url));

export default defineConfig({
  testDir: './tests/salla',
  testMatch: '**/*.spec.ts',
  workers: 1,
  retries: 0,
  timeout: 30000,
  outputDir: 'output/playwright/results',
  reporter: [['list'], ['html', { outputFolder: 'output/playwright/report', open: 'never' }]],
  use: { channel: 'chromium', baseURL: 'http://127.0.0.1:4178', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Keep fixture lifecycle in-process, avoiding Windows child-tree shutdown.
  globalSetup: './tests/salla/global-setup.mjs',
});
