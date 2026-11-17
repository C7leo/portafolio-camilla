import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[320, 568], [375, 667], [390, 844], [768, 1024], [1042, 531], [1250, 632], [1440, 900]]) {
  test(`compact Hero CTA preserves composition and contact at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    const cta = page.locator('.hero-micro-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveCSS('opacity', '1');
    await expect(cta.locator('#hero-project-question')).toHaveText('¿Tienes un proyecto en mente?');
    await expect(cta.locator('.micro-cta-description')).toHaveText('Tu negocio visible en internet.');
    const link = cta.locator('a');
    await expect(link).toHaveAttribute('href', '#contacto');
    await expect(link).not.toHaveAttribute('target');
    await expect(link).toHaveCSS('background-color', 'rgb(226, 244, 166)');
    const box = await cta.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(23);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 23);
    expect((await link.boundingBox()).height).toBeGreaterThanOrEqual(44);
    const line = await page.locator('app-hero .grid-rule').last().boundingBox();
    expect(line.y - box.y - box.height).toBeGreaterThanOrEqual(24);
    expect(line.y - box.y - box.height).toBeLessThanOrEqual(32);
    const specialty = await page.locator('.specialty:not(.specialty-data)').boundingBox();
    expect(box.x).toBeCloseTo(specialty.x, 0);
    await expect(page.locator('.hero-details .hero-micro-cta')).toHaveCount(0);
    for (const selector of ['#hero-title', '.specialty', '.hero-actions', '.floating-scroll-cue']) {
      const other = await page.locator(selector).boundingBox();
      expect(box.x < other.x + other.width && box.x + box.width > other.x && box.y < other.y + other.height && box.y + box.height > other.y, `CTA overlaps ${selector}`).toBe(false);
    }
    const geometry = await cta.evaluate(cta => {
      const hero = cta.closest('.hero');
      const parent = cta.parentNode;
      const next = cta.nextSibling;
      const measure = () => hero.getBoundingClientRect().height;
      const withCTA = measure();
      cta.remove();
      const withoutCTA = measure();
      parent.insertBefore(cta, next);
      return { withCTA, withoutCTA };
    });
    // Compact phones and short landscape viewports grow in natural flow to
    // preserve the name, readable content and room for the fixed theme control.
    if (height >= 640) expect(Math.abs(geometry.withCTA - geometry.withoutCTA)).toBeLessThanOrEqual(1);
    await expect(page.locator('app-freelance-section, #trabajemos-juntos, .freelance-section')).toHaveCount(0);
    await expect(page.locator('.hero-link.primary')).toHaveAttribute('href', '#proyectos');
    await expect(page.locator('.hero-link.secondary')).toHaveAttribute('href', '#sobre-mi');
    await expect(page.locator('.hero-marquee')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('compact CTA supports English, reduced motion and inline contact navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.setItem('portfolio-language', 'en'));
  await page.goto(SITE_URL);
  const cta = page.locator('.hero-micro-cta');
  await expect(cta.locator('#hero-project-question')).toHaveText('Have a project in mind?');
  await expect(cta.locator('.micro-cta-description')).toHaveText('Your business, easy to find online.');
  await expect(cta).toHaveCSS('animation-name', 'none');
  const link = cta.locator('a');
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contacto')).toBeFocused();
  await expect(page.locator('#contacto form')).toBeInViewport();
});
