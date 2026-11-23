import { test, expect } from '@playwright/test';

test('shows a temporary ripple on mouse movement while keeping the Hero usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#curtain-intro')).toHaveCount(0, { timeout: 9000 });
  const hero = page.locator('app-hero .hero');
  const box = await hero.boundingBox();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
  const canvas = hero.locator('.hero-ripple canvas');
  await expect(canvas).toBeAttached();
  await page.waitForTimeout(500);
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
  await expect(canvas).toBeVisible();
  await expect(canvas).toBeHidden({ timeout: 5000 });
  await expect(hero.locator('.hero-cta')).toBeVisible();
});

test('does not create the effect with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.locator('app-hero .hero');
  const box = await hero.boundingBox();
  await page.mouse.move(box.x + 100, box.y + 100);
  await expect(hero.locator('.hero-ripple canvas')).toHaveCount(0);
});
