import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

const rect = element => element.getBoundingClientRect().toJSON();
async function seek(page, selector, viewportTop = 100) {
  await page.locator(selector).evaluate((element, top) => scrollTo(0, element.getBoundingClientRect().top + scrollY - top), viewportTop);
  await page.waitForTimeout(350);
}

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
  test(`marquee, gallery toolbar and contextual controls stay contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    await seek(page, '.technology-marquee');
    const rails = await page.locator('.is-viewport .grid-rail').evaluateAll(nodes => nodes.map((el, index) => index === 0 ? el.getBoundingClientRect().left : el.getBoundingClientRect().right));
    const rows = page.locator('.marquee-row');
    for (const row of await rows.all()) {
      const bounds = await row.boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(rails[0]);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(rails[1] + 1);
      await expect(row).not.toHaveCSS('mask-image', 'none');
      const groups = await row.locator('.marquee-group').evaluateAll(nodes => nodes.map(e => e.getBoundingClientRect().width));
      expect(groups[0]).toBeCloseTo(groups[1], 1);
      expect(groups[0]).toBeGreaterThanOrEqual(bounds.width);
    }
    await page.locator('.marquee-toggle').click();
    const track = page.locator('.marquee-track').first();
    const stopped = await track.evaluate(e => getComputedStyle(e).transform);
    await page.waitForTimeout(150);
    expect(await track.evaluate(e => getComputedStyle(e).transform)).toBe(stopped);
    await page.locator('.marquee-toggle').click();
    await expect.poll(() => track.evaluate(e => getComputedStyle(e).transform)).not.toBe(stopped);

    await seek(page, '.sea-gallery');
    const toolbar = await page.locator('.gallery-controls').boundingBox();
    const frame = await page.locator('.sea-gallery').boundingBox();
    const stage = await page.locator('.gallery-stage').boundingBox();
    expect(stage.y + stage.height).toBeCloseTo(frame.y + frame.height, 1);
    expect(toolbar.y).toBeGreaterThanOrEqual(frame.y + frame.height);
    for (const bounds of [frame, toolbar, await page.locator('.showcase-header').boundingBox(), await page.locator('.gallery-intro').boundingBox(), await page.locator('.project-index').boundingBox()]) {
      expect(bounds.x).toBeCloseTo(rails[0], 1);
      expect(bounds.x + bounds.width).toBeCloseTo(rails[1], 1);
    }
    await expect(page.locator('.sea-gallery')).toHaveCSS('border-radius', '22px');
    await expect(page.locator('.gallery-controls')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.gallery-controls')).toHaveCSS('position', 'relative');
    for (const button of await page.locator('.gallery-buttons button').all()) {
      const box = await button.boundingBox();
      expect(box.y).toBeCloseTo(toolbar.y + 12, 0);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      await expect(button).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(button.locator('svg')).toHaveCount(1);
      await expect(button.locator('.gallery-control-face')).toHaveCSS('width', '38px');
    }
    await expect(page.locator('.next-control .gallery-control-face')).toHaveCSS('background-color', 'rgb(226, 244, 166)');
    await expect(page.locator('.next-control .gallery-control-face')).toHaveCSS('color', 'rgb(17, 17, 17)');
    // Put the exact panel boundary through the fixed theme button.
    const themeBox = await page.locator('.floating-theme-toggle').evaluate(rect);
    await page.locator('.sea-gallery').evaluate((element, y) => scrollTo(0, element.getBoundingClientRect().bottom + scrollY - y), themeBox.y + themeBox.height / 2);
    const themeOverPanel = themeBox.x < frame.x + frame.width && themeBox.x + themeBox.width > frame.x;
    if (themeOverPanel) {
      await expect(page.locator('.floating-theme-toggle')).toBeHidden();
      await expect(page.locator('.floating-theme-toggle')).toHaveAttribute('tabindex', '-1');
    } else {
      // On wide screens the shared container leaves the theme in its own gutter.
      await expect(page.locator('.floating-theme-toggle')).toBeVisible();
    }
    await seek(page, '#sobre-mi', 84);
    await expect(page.locator('.floating-theme-toggle')).toBeVisible();
    const restored = await page.locator('.floating-theme-toggle').boundingBox();
    expect(restored.x).toBeCloseTo(themeBox.x, 0);
    expect(restored.y).toBeCloseTo(themeBox.y, 0);
    await page.locator('.floating-theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
