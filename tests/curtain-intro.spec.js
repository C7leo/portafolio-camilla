import { test, expect } from '@playwright/test';

test('waits for the Hero image, reveals it, and does not repeat on internal navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  let releaseImage;
  const imageGate = new Promise(resolve => { releaseImage = resolve; });
  await page.route(/\/hero-fondo-1802(?:-[\w-]+)?\.webp/, async route => { await imageGate; await route.continue(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const curtain = page.locator('#curtain-intro');
  await expect(curtain).toBeVisible();
  await expect(page.locator('#hero-title')).toHaveText('CAMILLA');
  await expect(curtain).not.toHaveAttribute('aria-valuenow', '100');
  releaseImage();
  await expect.poll(async () => Number(await curtain.getAttribute('aria-valuenow'))).toBeGreaterThan(0);
  const values = await curtain.evaluate(element => ({
    value: Number(element.getAttribute('aria-valuenow')),
    text: element.querySelector('.curtain-percent').textContent,
    scale: element.querySelector('.curtain-progress').style.transform,
    states: [...element.querySelectorAll('.curtain-step')].map(step => step.dataset.state),
    time: element.querySelector('.curtain-time').textContent,
  }));
  expect(values.text).toBe(`${values.value}%`);
  expect(values.scale).toBe(`scaleX(${values.value / 100})`);
  expect(values.time).toMatch(/^\d+\.\ds$/);
  expect(values.states).toEqual(values.states.map((_, index) => index < Math.floor(values.value / 25) ? 'done' : index === Math.floor(values.value / 25) ? 'active' : 'pending'));
  await expect(curtain).toHaveAttribute('aria-valuenow', '100', { timeout: 6500 });
  await expect(curtain.locator('.curtain-percent')).toHaveText('100%');
  await expect(curtain.locator('.curtain-step[data-state="done"]')).toHaveCount(4);
  await expect(curtain).toHaveClass(/is-revealing/);
  const heroBefore = await page.locator('app-hero .hero').boundingBox();
  await expect(curtain).toHaveCount(0, { timeout: 3000 });
  const heroAfter = await page.locator('app-hero .hero').boundingBox();
  expect(heroAfter.x).toBeCloseTo(heroBefore.x, 1);
  expect(heroAfter.width).toBeCloseTo(heroBefore.width, 1);
  await expect(page.locator('html')).not.toHaveClass(/curtain-active/);
  await page.evaluate(() => { location.hash = '#servicios'; });
  await expect(curtain).toHaveCount(0, { timeout: 8000 });
  expect(errors).toEqual([]);
});

test('supports dark mode on mobile and runs again on reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const curtain = page.locator('#curtain-intro');
  await expect(curtain).toHaveCSS('background-color', 'rgb(9, 9, 11)');
  await expect(curtain.locator('.curtain-step')).toHaveCount(4);
  await expect(curtain).toHaveCount(0, { timeout: 8000 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(curtain).toBeVisible();
  await expect(curtain).toHaveCount(0, { timeout: 8000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('skips the curtain for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#curtain-intro')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/curtain-active/);
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('continues when the Hero image fails', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route(/\/hero-fondo-1802(?:-[\w-]+)?\.webp/, route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#curtain-intro')).toHaveCount(0, { timeout: 8000 });
  await expect(page.locator('html')).not.toHaveClass(/curtain-active/);
});

test('releases the page when a critical image stalls and a noncritical image fails', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let releaseImage;
  const imageGate = new Promise(resolve => { releaseImage = resolve; });
  await page.route(/\/hero-fondo-1802(?:-[\w-]+)?\.webp/, async route => { await imageGate; await route.continue().catch(() => {}); });
  await page.route('**/about-*.webp', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const curtain = page.locator('#curtain-intro');
  await expect(curtain).toBeVisible();
  await expect(curtain).toHaveClass(/is-revealing/, { timeout: 7500 });
  await expect(curtain).not.toHaveAttribute('aria-valuenow', '100');
  await expect(curtain).toHaveCount(0, { timeout: 3000 });
  await expect(page.locator('html')).not.toHaveClass(/curtain-active/);
  releaseImage();
});
