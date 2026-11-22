import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[1440, 900], [1280, 900], [1241, 900], [1240, 900], [1024, 900], [768, 1024], [390, 844], [320, 568]]) {
  test(`navigation remains usable and contained at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(SITE_URL);
    const menu = page.locator('.home-menu-toggle');
    const header = page.locator('.floating-header');
    const theme = page.locator('.home-theme');
    await expect(header).toBeVisible();
    const original = await header.boundingBox();
    const themeBox = await theme.boundingBox();
    expect(themeBox.width).toBeGreaterThanOrEqual(44);
    expect(themeBox.height).toBeGreaterThanOrEqual(44);
    if (width > 1240) {
      await expect(menu).toBeHidden();
      const nav = await page.locator('.home-navigation').boundingBox();
      const group = await page.locator('.home-controls').boundingBox();
      const logo = await page.locator('.home-brand').boundingBox();
      expect(nav.height).toBe(50);
      const heroAction = await page.locator('.hero-cta').boundingBox();
      expect(nav.x + nav.width).toBeCloseTo(heroAction.x + heroAction.width, 0);
      expect(logo.x + logo.width).toBeLessThan(group.x);
      expect(group.x + group.width).toBeLessThanOrEqual(width);
      await expect(page.locator('.nav-link').first()).toHaveCSS('font-size', '14px');
      await page.locator('.language-choice[lang="en"]').click();
      await expect(page.locator('.nav-link').first()).toHaveText('Home');
      expect((await page.locator('.home-controls').boundingBox()).x).toBeGreaterThan(logo.x + logo.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.locator('.language-choice[lang="es"]').click();
    } else {
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(page.locator('.home-contact')).toBeVisible();
      await expect(page.locator('.home-cv')).toBeVisible();
      await expect(page.locator('.language-choice[lang="en"]')).toBeVisible();
      await menu.click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const id of ['sobre-mi', 'servicios', 'proyectos', 'experiencia', 'contacto', 'inicio']) {
      if (await menu.isVisible()) await menu.click();
      await page.locator(`.home-navigation a[href="#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      if (id !== 'contacto') {
        const active = page.locator(`.nav-link[href="#${id}"]`);
        await expect(active).toHaveAttribute('aria-current', 'location');
        await expect(page.locator('.nav-link.active')).toHaveCount(1);
        await expect(active).toHaveCSS('color', 'rgb(85, 161, 254)');
        await expect(active).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      }
      const next = await header.boundingBox();
      expect(next.x).toBeCloseTo(original.x, 0);
      expect(next.y).toBeCloseTo(original.y, 0);
    }
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(theme.locator('svg')).toBeVisible();
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
}

test('scrolling forward and back updates only the active link and keeps keyboard focus visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(SITE_URL);
  for (const id of ['sobre-mi', 'servicios', 'proyectos', 'experiencia', 'proyectos', 'sobre-mi', 'inicio']) {
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
    const active = page.locator(`.nav-link[href="#${id}"]`);
    await expect(active).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('.nav-link.active')).toHaveCount(1);
    await expect(active).toHaveCSS('color', 'rgb(85, 161, 254)');
    await expect(active).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  }
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  const focused = page.locator('.nav-link:focus-visible');
  await expect(focused).toHaveCount(1);
  await expect(focused).toHaveCSS('outline-style', 'solid');
});
