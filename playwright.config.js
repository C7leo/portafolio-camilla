import { defineConfig } from '@playwright/test';
import { SITE_URL } from './tests/support/site.js';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 45000,
  workers: process.env.CI ? 2 : 1,
  reporter: 'list',
  use: { channel: 'chrome', baseURL: SITE_URL, trace: 'retain-on-failure' },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npm run dev -- --port 5183 --strictPort',
    url: SITE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
