import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });
import { SITE_URL as url } from './support/site.js';
const viewports = [{ width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 640 }];

for (const baseline of viewports) {
  test(`content respects existing guides without moving them at ${baseline.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: baseline.width, height: baseline.height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.about-story')).toHaveClass(/is-enhanced/);
    const rails = page.locator('.is-viewport .grid-rail');
    await expect(rails).toHaveCount(2);
    const [left, right] = await rails.evaluateAll(elements => elements.map(e => e.getBoundingClientRect().x));
    expect(left).toBeGreaterThanOrEqual(24);
    expect(Math.abs(left + right - baseline.width)).toBeLessThanOrEqual(1);

    for (const language of ['es', 'en']) {
      await page.locator('#sobre-mi').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY - 84));
      await page.locator(`.language-choice[lang="${language}"]`).click();
      for (const selector of ['.hero', '.story-stage', '.editorial-scene', '.project-showcase', '.experience-content', '.site-footer']) {
        await page.locator(selector).evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 92));
        const violations = await page.locator(selector).evaluate(element => {
          const rail = document.querySelector('.is-viewport .grid-rail.left').getBoundingClientRect().x;
          const right = innerWidth - rail;
          const selectors = [
            '.hero-meta p', '.specialty', '.hero-actions', '.story-copy', '.portrait', '.editorial-notes',
            '.showcase-header', '.gallery-intro', '.project-index', '.hero-micro-cta', '.experience-header', '.experience-entry', '.entry-information',
            '.footer-brand', '.footer-column', '.brand-disciplines',
          ];
          return Array.from(element.querySelectorAll(selectors.join(','))).flatMap(node => {
            const box = node.getBoundingClientRect();
            if (!box.width) return [];
            const issues = [];
            if (box.left < rail - 1 || box.right > right + 1) issues.push('outside rails');
            if (node.scrollWidth > node.clientWidth + 2) issues.push('content overflow');
            return issues.length ? [{ class: node.className, text: node.textContent.trim().slice(0, 30), issues }] : [];
          });
        });
        expect(violations, `${language}: ${selector}`).toEqual([]);
      }
      const headings = await page.locator('.footer-column h3').evaluateAll(elements => elements.map(element => element.offsetTop));
      if (baseline.width >= 360) expect(new Set(headings).size).toBe(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
