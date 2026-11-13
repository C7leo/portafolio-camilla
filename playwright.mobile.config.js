import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';
const { channel, ...use } = base.use;

export default defineConfig({
  ...base,
  use,
  testMatch: ['**/mobile-audit.spec.js', '**/mobile-responsive.spec.js', '**/cinematic-continuity.spec.js', '**/project-showcase.spec.js', '**/project-summary.spec.js', '**/project-lines.spec.js', '**/floating-controls.spec.js', '**/navbar-visibility.spec.js', '**/hero-marquee.spec.js', '**/hero-micro-cta.spec.js', '**/layout-containment.spec.js', '**/services.spec.js'],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', channel: 'chrome', hasTouch: true } },
    { name: 'webkit', use: { browserName: 'webkit', hasTouch: true } },
  ],
});
