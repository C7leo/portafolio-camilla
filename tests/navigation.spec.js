import { test, expect } from '@playwright/test';

test('header stays visible across sections and language persists with working interactions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('.hero-code')).toHaveText('CÓDIGO');
  await expect(page.locator('.exploring h2')).toHaveText('SIGOAPRENDIENDO.');
  await expect(page.locator('#navigation')).toContainText('Sobre mí');
  for (const id of ['about', 'work', 'data', 'journey', 'ecosystem', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    const header = await page.locator('.header').boundingBox();
    expect(Math.abs(header.y)).toBeLessThan(1);
    expect(await page.locator('.header').evaluate(el => document.elementFromPoint(innerWidth / 2, 20).closest('.header') === el)).toBe(true);
  }
  await page.locator('[data-tech="3"]').click();
  await expect(page.locator('#tech-category-name')).toHaveText('Bases de datos');
  await expect(page.locator('#tech-panel .tech-quick-list')).toContainText('Diseño relacional');
  await page.locator('[data-select-view="0"]').click();
  await expect(page.locator('#case-dialog')).toBeVisible();
  await expect(page.locator('#case-dialog h3').first()).toHaveText('La motivación');
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('.hero-code')).toHaveText('CODE');
  await expect(page.locator('#case-dialog h3').first()).toHaveText('The motivation');
  await page.locator('[data-tech="3"]').click();
  await expect(page.locator('#tech-category-name')).toHaveText('Databases');
});

test('mobile header keeps language accessible and translated navigation works', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.locator('.menu-toggle').click();
  await page.locator('#navigation a[href="#journey"]').click();
  await expect(page).toHaveURL(/#journey$/);
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('button', { name: 'English', exact: true })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('animated section navigation accounts for the persistent header in both languages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.locator('#navigation a[href="#journey"]').click();
  await expect.poll(() => page.locator('#journey').evaluate(el => Math.abs(el.getBoundingClientRect().top - document.querySelector('.header').offsetHeight - 20)), { timeout: 10000 }).toBeLessThan(3);
  await expect(page.locator('.header')).toBeInViewport();
  await expect(page.locator('#journey')).toBeInViewport();
});
