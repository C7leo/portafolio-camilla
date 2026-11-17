import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testMatch: ['**/intro-autoplay.spec.js', '**/intro-poster.spec.js', '**/cinematic-continuity.spec.js'],
  use: { ...base.use, channel: undefined },
  projects: [{ name: 'webkit', use: { browserName: 'webkit', hasTouch: true } }],
});
