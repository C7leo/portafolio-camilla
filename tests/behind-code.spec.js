import { test, expect } from '@playwright/test';

test('morphs code tokens, supports fast keyboard changes and copies the active example', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.copiedCode = text; } } });
  });
  await page.goto('/');
  await expect(page.locator('#curtain-intro')).toHaveCount(0, { timeout: 9000 });
  const section = page.locator('app-behind-code');
  await section.scrollIntoViewIfNeeded();
  await section.locator('.editor').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await section.locator('.editor-toolbar').scrollIntoViewIfNeeded();
  await expect(section.locator('.code-text')).toContainText('GreetingComponent');
  expect(await page.evaluate(() => {
    const main = document.querySelector('main');
    const order = [...main.children].map(element => element.tagName.toLowerCase());
    return order.indexOf('app-services') < order.indexOf('app-behind-code') && order.indexOf('app-behind-code') < order.indexOf('app-projects');
  })).toBe(true);
  const startScroll = await page.evaluate(() => scrollY);
  await section.getByRole('tab', { name: 'Datos' }).click();
  await expect(section.locator('.code-text')).toContainText('monthly_totals');
  await expect.poll(() => section.locator('.code-text').evaluate(element => element.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
  await section.getByRole('tab', { name: 'Automatización' }).click();
  await section.getByRole('tab', { name: 'Desarrollo' }).click();
  await section.getByRole('tab', { name: 'Desarrollo' }).press('ArrowRight');
  await expect(section.getByRole('tab', { name: 'Datos' })).toHaveAttribute('aria-selected', 'true');
  await expect(section.locator('.code-text')).toContainText('SELECT');
  await section.getByRole('button', { name: 'Copiar código' }).click();
  await expect(section.getByRole('status')).toHaveText('Copiado');
  expect(await page.evaluate(() => window.copiedCode)).toContain('FROM payments');
  expect(Math.abs((await page.evaluate(() => scrollY)) - startScroll)).toBeLessThan(2);
  await expect.poll(() => section.locator('.code-text').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(section.locator('.code-ghosts .token')).toHaveCount(0);
  const rays = section.locator('app-falling-rays');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(rays).not.toHaveClass(/is-playing/);
  await expect(rays.locator('.ray-pulse').first()).toHaveCSS('animation-play-state', 'paused');
  expect(errors).toEqual([]);
});

test('pauses rays outside the viewport and supports dark, mobile and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'dark');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => {} } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const section = page.locator('app-behind-code');
  const rays = section.locator('app-falling-rays');
  await expect(rays).not.toHaveClass(/is-playing/);
  await section.scrollIntoViewIfNeeded();
  await expect(rays).toHaveClass(/is-playing/);
  await expect(rays.locator('.ray-pulse').first()).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(section.locator('.editor')).toHaveCSS('background-color', 'rgb(23, 23, 29)');
  const editor = await section.locator('.editor').boundingBox();
  expect(editor.x).toBeGreaterThanOrEqual(0);
  expect(editor.x + editor.width).toBeLessThanOrEqual(390);
  await expect(section.getByRole('button', { name: 'Copiar código' })).toBeVisible();
  await section.getByRole('tab', { name: 'Datos' }).click();
  await section.getByRole('button', { name: 'Copiar código' }).click();
  await expect(section.locator('.copy-label')).toBeVisible();
  await expect(section.locator('.copy-label')).toHaveText('Copiado');
  expect(await section.locator('.code-text').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(rays).not.toHaveClass(/is-playing/);
});

test('translates the interface while preserving the code itself', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.language-choice[lang="en"]').click();
  const section = page.locator('app-behind-code');
  await expect(section.locator('h2')).toHaveText('From logic to experience.');
  await expect(section.getByRole('tab', { name: 'Development' })).toHaveAttribute('aria-selected', 'true');
  await section.getByRole('tab', { name: 'Automation' }).click();
  await expect(section.locator('.code-text')).toContainText('from pathlib import Path');
  await expect(section.getByRole('button', { name: 'Copy code' })).toBeVisible();
});
