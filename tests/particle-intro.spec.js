import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`particle intro reveals the Hero after the background at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('app-particle-intro')).toHaveClass(/is-active/);
    await expect(page.locator('.home-navbar')).toBeHidden();
    await expect(page.locator('#hero-title')).toBeHidden();
    await expect(page.locator('.particle-intro__skip')).toHaveCount(0);
    await expect(page.locator('app-particle-intro')).toHaveClass(/is-ready/, { timeout: 7000 });
    await expect(page.locator('app-particle-intro')).not.toHaveClass(/is-active/, { timeout: 15000 });
    await expect(page.locator('.home-navbar')).toBeVisible();
    await expect(page.locator('#hero-title')).toHaveText('CAMILA');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('keyboard interaction cancels the intro immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('app-particle-intro')).toHaveClass(/is-active/);
  await page.keyboard.press('Escape');
  await expect(page.locator('app-particle-intro')).not.toHaveClass(/is-active/);
  await page.locator('.hero-cta').click();
  await expect(page).toHaveURL(/#contacto/);
});

test('reduced motion, direct navigation and unavailable WebGL show the Hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'));
  await page.goto(SITE_URL);
  await expect(page.locator('app-particle-intro')).not.toHaveClass(/is-active/);
  await expect(page.locator('#hero-title')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${SITE_URL}/#servicios`);
  await expect(page.locator('app-particle-intro')).not.toHaveClass(/is-active/);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl' ? null : original.call(this, type, ...args);
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('app-particle-intro')).not.toHaveClass(/is-active/, { timeout: 8000 });
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('the indeterminate loader can be cancelled on a slow connection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.route('**/particle-scene-*.js', async route => { await new Promise(resolve => setTimeout(resolve, 3000)); await route.continue(); });
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.particle-intro__loading')).toHaveAttribute('role', 'status');
  await expect(page.locator('.particle-intro__skip')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('app-particle-intro')).not.toHaveClass(/is-active/);
});

for (const theme of ['light', 'dark']) {
  test(`intro background follows ${theme} theme`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), theme);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('app-particle-intro')).toHaveClass(/is-active/);
    const color = theme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(9, 9, 11)';
    await expect(page.locator('.particle-intro__loading')).toHaveCSS('background-color', color);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement, '::before').backgroundColor)).toBe(color);
    await expect(page.locator('app-particle-intro')).toHaveClass(/is-ready/, { timeout: 7000 });
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'complete', { timeout: 16000 });
  });
}

test('reload keeps the selected theme and restarts the intro safely', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('app-particle-intro')).toHaveClass(/is-active/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('app-particle-intro')).toHaveClass(/is-active/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#hero-title')).toBeVisible();
});

for (const [theme, width] of [['light', 1440], ['dark', 390]]) {
  test(`ring counts from 1 to 10 before dispersion in ${theme} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(theme => {
      localStorage.setItem('portfolio-theme', theme);
      window.introSteps = [];
      new MutationObserver(() => {
        const phase = document.documentElement.dataset.particlePhase;
        const count = document.querySelector('.particle-intro__count')?.textContent.trim();
        const last = window.introSteps.at(-1);
        if (count && (!last || last.count !== count || last.phase !== phase)) window.introSteps.push({ count, phase, at: performance.now() });
      }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-particle-phase'] });
    }, theme);
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'progress', { timeout: 7000 });
    await expect(page.locator('#hero-title')).toBeHidden();
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'assembling', { timeout: 7000 });
    const steps = await page.evaluate(() => window.introSteps);
    const counts = [...new Set(steps.filter(step => step.phase === 'progress').map(step => step.count))];
    expect(counts).toEqual(['1','2','3','4','5','6','7','8','9','10']);
    const first = steps.find(step => step.phase === 'progress');
    const assembly = steps.find(step => step.phase === 'assembling');
    expect(assembly.at - first.at).toBeGreaterThan(4900);
    expect(assembly.at - first.at).toBeLessThan(6500);
    await expect(page.locator('#hero-title')).toBeHidden();
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'complete', { timeout: 10000 });
    await expect(page.locator('#hero-title')).toBeVisible();
  });
}

for (const width of [1440, 390]) {
  test(`particles build the Hero before consolidation at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
    const intro = page.locator('app-particle-intro');
    const veil = page.locator('.particle-intro__veil');
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'progress', { timeout: 7000 });
    await expect(veil).toHaveCSS('opacity', '1');
    await expect(intro).not.toHaveClass(/is-consolidating/);
    await expect(page.locator('.particle-intro__drop, .particle-intro__ripples')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'assembling', { timeout: 7000 });
    await page.waitForTimeout(1000);
    await expect(veil).toHaveCSS('opacity', '1');
    await expect(page.locator('#hero-title')).toBeHidden();
    await expect(intro).toHaveClass(/is-consolidating/, { timeout: 4000 });
    await expect(page.locator('html')).toHaveAttribute('data-particle-phase', 'complete', { timeout: 8000 });
    await expect(page.locator('#hero-title')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
