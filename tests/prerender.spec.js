import { test, expect } from '@playwright/test';

test.skip(!process.env.TEST_BASE_URL, 'Requires the prerendered production build');

test('static page remains readable with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL);
  await expect(page.locator('#hero-title')).toHaveText('CAMILLA');
  await expect(page.locator('#sobre-mi')).toContainText('desarrolladora');
  await expect(page.locator('.about-image img')).toHaveAttribute('src', /about.*\.webp/);
  await context.close();
});

test('the static page becomes interactive and preserves section navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
  await page.locator('app-navbar a.nav-link').nth(1).click();
  await expect(page).toHaveURL(/#sobre-mi$/);
  await expect(page.locator('#sobre-mi')).toBeVisible();
  await page.locator('.home-theme').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});
