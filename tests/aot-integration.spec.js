import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const width of [1440, 390]) {
  test(`compiled page loads hero, fonts and services at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    const artwork = await page.evaluate(async () => {
      await document.fonts.ready;
      const preload = [...document.querySelectorAll('link[rel="preload"][as="image"]')].find(link => matchMedia(link.media).matches);
      return {
        preload: preload?.href,
        hero: getComputedStyle(document.querySelector('.hero')).backgroundImage,
        footer: getComputedStyle(document.querySelector('.footer-stage')).backgroundImage,
        iconLoaded: document.fonts.check('27px "Experience Material Symbols"'),
      };
    });
    expect(artwork.preload).toBeTruthy();
    expect(artwork.hero).toContain(artwork.preload);
    expect(artwork.footer).toContain(artwork.preload);
    expect(artwork.iconLoaded).toBe(true);
    const trigger = page.locator('.service-trigger').nth(1);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#service-panel-02')).not.toHaveAttribute('inert', '');
    expect(errors).toEqual([]);
  });
}
