import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[390, 844], [1440, 900]]) {
  test(`navbar is transparent on Home and restores its capsule from About at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('.floating-header');
    await expect(header).toBeVisible();
    await expect(header).not.toHaveAttribute('inert');
    await expect(header).toHaveClass(/is-home/);
    await expect(page.locator('.glass-surface')).toHaveCSS('opacity', '0');
    await expect(page.locator('.navbar')).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const marquee = await page.locator('.hero-marquee').boundingBox();
    const homeNav = await header.boundingBox();
    expect(homeNav.y).toBeGreaterThanOrEqual(marquee.y + marquee.height);
    const meta = await page.locator('.hero-meta').boundingBox();
    expect(homeNav.y + homeNav.height).toBeLessThanOrEqual(meta.y);
    await page.screenshot({ path: testInfo.outputPath('home-navbar.png') });
    const heroHeight = await page.locator('.hero').evaluate(hero => hero.clientHeight);
    await page.locator('.floating-scroll-cue').click();
    await expect(header).toBeVisible();
    await expect(header).not.toHaveAttribute('inert');
    await expect(page.locator('.nav-link[href="#sobre-mi"]')).toHaveAttribute('aria-current', 'location');
    await expect(header).not.toHaveClass(/is-home/);
    await expect(page.locator('.glass-surface')).toHaveCSS('opacity', '1');
    for (const section of ['proyectos', 'experiencia', 'inicio']) {
      if (width <= 820) await page.locator('.menu-toggle').click();
      await page.locator(`.nav-link[href="#${section}"]`).click();
      if (section !== 'inicio') await expect(header).toBeVisible();
    }
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/is-home/);
    await expect(page.locator('.glass-surface')).toHaveCSS('opacity', '0');
    await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    expect(await page.locator('.hero').evaluate(hero => hero.clientHeight)).toBe(heroHeight);
    await page.goto(`${SITE_URL}/#proyectos`);
    await expect(header).toBeVisible();
    await page.reload();
    if (await page.locator('.skip-intro').count()) {
      await expect(header).toBeHidden();
      await page.locator('.skip-intro').click();
    }
    // Reload intentionally restarts the existing Home introduction.
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/is-home/);
    await page.locator('.floating-scroll-cue').click();
    await expect(header).toBeVisible();
  });
}
