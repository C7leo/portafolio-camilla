import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`contact follows the theme without losing form data at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${SITE_URL}/#contacto`);
    const section = page.locator('#contacto');
    const theme = page.locator('.home-theme');
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.locator('#contact-name').fill('Camilla');
    await page.locator('.contact-submit').click();
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(section).toHaveCSS('background-color', 'rgb(9, 9, 11)');
    await expect(section).toHaveCSS('color', 'rgb(247, 247, 247)');
    await expect(page.locator('.field-control').first()).toHaveCSS('background-color', 'rgb(24, 24, 27)');
    await expect(page.locator('#contact-name')).toHaveValue('Camilla');
    await expect(page.locator('#contact-email-error')).toHaveCSS('color', 'rgb(255, 155, 165)');
    await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid', 'true');
    await theme.click();
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('#contact-name')).toHaveValue('Camilla');
    await expect(page.locator('#contact-email-error')).toHaveCSS('color', 'rgb(166, 43, 52)');
  });
}

test('contact restores the saved dark theme and keeps feedback readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'));
  await page.goto(`${SITE_URL}/#contacto`);
  await expect(page.locator('#contacto')).toHaveCSS('background-color', 'rgb(9, 9, 11)');
  await page.locator('.contact-submit').click();
  await expect(page.locator('#contact-feedback')).toHaveCSS('color', 'rgb(255, 155, 165)');
});
