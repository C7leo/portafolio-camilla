import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
});

for (const [width, height] of [[1920, 1080], [1366, 768], [768, 1024], [390, 844], [440, 956], [375, 667]]) {
  test(`theme stays reachable across every chapter at ${width}×${height}`, async ({ page }, testInfo) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width, height });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const theme = page.locator('.floating-theme-toggle');
    await expect(theme).toBeVisible();
    if (width < 500) {
      const hero = await page.locator('.hero').boundingBox();
      expect(hero.y + hero.height).toBeCloseTo(height, 0);
    }
    await expect(page.locator('.hero-marquee .marquee-separator')).toHaveCount(24);
    await expect(page.locator('.project-index .index-arrow')).toHaveCount(7);
    expect((await page.locator('.hero-marquee, .project-index').allTextContents()).join('')).not.toMatch(/[↗✳]/);
    await page.screenshot({ path: testInfo.outputPath('home.png') });
    for (const selector of ['#sobre-mi', '.technology-marquee', '.sea-gallery', '.gallery-controls', '.project-index', '#servicios', '.services-cta', '#experiencia', '#contacto']) {
      await page.locator(selector).evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - 120));
      await page.waitForTimeout(400);
      await expect(theme, selector).toBeVisible();
      await expect(theme).not.toHaveAttribute('tabindex', '-1');
      const box = await theme.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(height);
      expect(await theme.evaluate(el => {
        const b = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2));
      }), `${selector}: theme receives pointer events`).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (selector === '.gallery-controls') {
        const buttons = await page.locator('.gallery-buttons').boundingBox();
        if (buttons.y < box.y + box.height && buttons.y + buttons.height > box.y) {
          expect(buttons.x + buttons.width).toBeLessThanOrEqual(box.x - 3);
        }
        await page.screenshot({ path: testInfo.outputPath('projects.png') });
      }
    }
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(errors).toEqual([]);
  });
}

test('Experience retires completed paint layers and restores them on reverse scroll', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(SITE_URL);
  await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
  await page.evaluate(() => document.fonts.ready);
  const seek = async progress => {
    await page.locator('#experiencia').evaluate((el, progress) => scrollTo(0, el.getBoundingClientRect().top + scrollY + innerHeight * progress), progress);
    await page.waitForTimeout(1100);
  };
  await seek(1.4);
  await expect(page.locator('.experience-aperture-line')).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('.experience-opening')).toHaveCSS('visibility', 'hidden');
  await seek(2.8);
  await expect(page.locator('.experience-backdrop')).toHaveCSS('visibility', 'hidden');
  await page.screenshot({ path: testInfo.outputPath('experience-exit.png') });
  await seek(1.4);
  await expect(page.locator('.experience-backdrop')).toHaveCSS('visibility', 'visible');
  await seek(.05);
  await expect(page.locator('.experience-aperture-line')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.experience-opening')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('.floating-theme-toggle')).toBeVisible();
});

test.describe('high density rendering', () => {
  test.use({ deviceScaleFactor: 3 });

  test('fixed theme icon stays painted after the long cinematic scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    const icon = page.locator('.sun-icon');
    const initialPixels = await icon.screenshot();
    await page.locator('#experiencia').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY + innerHeight * 5));
    await page.waitForTimeout(1200);
    expect((await icon.screenshot()).equals(initialPixels), 'SVG pixels survive the compositor transition').toBe(true);
  });
});

test('scroll cue yields to the Projects title while theme stays available', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(SITE_URL);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const cue = page.locator('.floating-scroll-cue');
  // The corner cue sits just outside the 24px guide, overlapping its inner
  // edge. Protect the title through the existing obstacle registry.
  await page.locator('.gallery-intro').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - 760));
  await expect(cue).toBeHidden();
  await expect(cue).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('.floating-theme-toggle')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('projects-title-clear.png') });
  // Restore it over the empty section entrance, outside the moving cards.
  await page.locator('#proyectos').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * .85));
  await expect(cue).toBeVisible();
});
