import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });
import { SITE_URL as url } from './support/site.js';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
});

for (const [width, height] of [[1440, 900], [768, 900], [390, 844]]) {
  test(`Experience connects directly to the contact footer at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto(`${url}/#sobre-mi`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('app-skills, app-contact, #habilidades, a[href="#habilidades"]')).toHaveCount(0);
    await expect(page.locator('main > app-experience:last-child')).toHaveCount(1);
    await expect(page.locator('main + app-footer')).toHaveCount(1);
    await expect(page.locator('.nav-link')).toHaveCount(5);
    for (const language of ['es', 'en']) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      await page.locator('.contact').click();
      await expect(page.locator('.site-footer')).toBeInViewport();
      await expect(page.locator('.contact')).toHaveAttribute('aria-current', 'location');
      await expect(page.locator('#contacto')).toHaveClass('site-footer');
      const gap = await page.evaluate(() => document.querySelector('.site-footer').getBoundingClientRect().top - document.querySelector('main').getBoundingClientRect().bottom);
      expect(Math.abs(gap)).toBeLessThanOrEqual(1);
    }
    const cta = page.locator('.brand-cta');
    await expect(cta).not.toHaveAttribute('href', '#contacto');
    await expect(cta).toHaveAttribute('href', /^(mailto:|https:\/\/)/);
    await expect(page.locator('.footer-stage')).toHaveCSS('background-image', /url\(/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/experience-footer-${width}.png` });
    expect(errors).toEqual([]);
  });
}

test('reduced motion keeps Experience and its contact footer directly accessible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${url}/#experiencia`);
  await expect(page.locator('.experience-reveal')).toBeHidden();
  await expect(page.locator('[data-company="bcp"]')).toBeVisible();
  await expect(page.locator('[data-company="banbif"]')).toBeVisible();
  await page.locator('.contact').click();
  await expect(page.locator('#contacto')).toBeInViewport();
  await expect(page.locator('app-skills, app-contact')).toHaveCount(0);
});
