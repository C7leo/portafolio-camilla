import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`Hero remains visible after the intro completes at ${width}px`, async ({ page }, testInfo) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      window.heroRevealEvents = [];
      document.addEventListener('animationstart', event => {
        if (event.target.closest?.('app-hero, app-navbar')) window.heroRevealEvents.push(event.animationName);
      }, true);
    });
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('app-hero').evaluate(element => { window.originalHero = element; });
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'revealing', { timeout: 15000 });
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'complete', { timeout: 5000 });

    for (let i = 0; i < 3; i++) {
      const state = await page.evaluate(() => {
        const selectors = ['.hero-copy', '#hero-title', '.hero-cta', '.home-brand', '.home-controls'];
        return {
          sameHero: window.originalHero === document.querySelector('app-hero'),
          items: selectors.map(selector => {
            const element = document.querySelector(selector);
            const style = getComputedStyle(element);
            return { selector, opacity: Number(style.opacity), visibility: style.visibility, animation: style.animationName };
          }),
          background: getComputedStyle(document.querySelector('.hero')).backgroundImage,
          overlay: getComputedStyle(document.querySelector('.hero'), '::before').opacity,
        };
      });
      expect(state.sameHero).toBe(true);
      expect(state.background).toContain('hero-fondo');
      expect(state.overlay).toBe('0');
      for (const item of state.items) {
        expect(item.opacity, item.selector).toBe(1);
        expect(item.visibility, item.selector).toBe('visible');
        expect(item.animation, item.selector).not.toMatch(/reveal|particle-content-in/);
      }
      await page.screenshot({ path: testInfo.outputPath(`hero-stable-${i}.png`) });
      await page.waitForTimeout(600);
    }
    const events = await page.evaluate(() => window.heroRevealEvents);
    expect(events.filter(name => name === 'particle-content-in')).toHaveLength(5);
    expect(events).not.toContain('reveal');
    expect(errors).toEqual([]);
  });
}

test('skipping, changing theme and returning home do not restart the Hero', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await page.locator('app-hero').evaluate(element => { window.originalHero = element; });
  await page.keyboard.press('Escape');
  await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'complete');
  await page.locator('.home-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.nav-link[href="#sobre-mi"]').click();
  await expect(page).toHaveURL(/#sobre-mi/);
  await page.locator('.nav-link[href="#inicio"]').click();
  await expect(page).toHaveURL(/#inicio/);
  await expect(page.locator('#hero-title')).toBeVisible();
  expect(await page.evaluate(() => window.originalHero === document.querySelector('app-hero'))).toBe(true);
  await page.waitForTimeout(900);
  expect(await page.locator('#hero-title').evaluate(element => ({ opacity: getComputedStyle(element).opacity, animation: getComputedStyle(element).animationName }))).toEqual({ opacity: '1', animation: 'none' });
  expect(errors).toEqual([]);
});
