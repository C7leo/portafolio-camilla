import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';
const { channel, ...use } = base.use;

export default defineConfig({
  ...base,
  use,
  testMatch: ['**/mobile-responsive.spec.js', '**/cinematic-continuity.spec.js'],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', channel: 'chrome', hasTouch: true } },
    { name: 'webkit', use: { browserName: 'webkit', hasTouch: true } },
  ],
});
