import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });

import { SITE_URL as url } from './support/site.js';

for (const scenario of [
  { name: 'finished video on desktop', viewport: { width: 1440, height: 900 }, skip: false },
  { name: 'skipped video on desktop', viewport: { width: 1440, height: 900 }, skip: true },
  { name: 'finished video on mobile', viewport: { width: 390, height: 844 }, skip: false },
]) {
  test(`Home stays visible after its entrance: ${scenario.name}`, async ({ page }) => {
    await page.setViewportSize(scenario.viewport);
    await page.goto(url);
    await expect(page.locator('.cinematic-screen')).toBeVisible();
    await page.evaluate(() => {
      const hero = document.querySelector('.hero');
      const selectors = ['.name-letters', '.surname-letters', '.hero-meta', '.hero-details > *'];
      const revealed = new Set();
      const finishedLetters = new Map();
      window.heroVisibilityRegressions = [];
      window.heroLetterRenderingRegressions = [];
      const sample = () => {
        for (const selector of selectors) {
          for (const element of hero.querySelectorAll(selector)) {
            const style = getComputedStyle(element);
            const opacity = Number(style.opacity);
            if (opacity >= 0.99) revealed.add(element);
            if (revealed.has(element) && opacity < 0.99) {
              window.heroVisibilityRegressions.push({ selector, opacity, classes: hero.className });
            }
            if (element.matches('.name-letters, .surname-letters')) {
              const rendering = { filter: style.filter, clipPath: style.clipPath, font: style.font };
              const finished = finishedLetters.get(element);
              if (finished && JSON.stringify(rendering) !== finished) {
                window.heroLetterRenderingRegressions.push({ selector, rendering });
              }
              if (!finished && opacity === 1 && style.filter === 'blur(0px)' && style.clipPath === 'inset(0%)') {
                finishedLetters.set(element, JSON.stringify(rendering));
              }
            }
          }
        }
      };
      // Observe style cleanup as well as painted frames: the hidden state may
      // last less than a frame, depending on Angular's render scheduling.
      window.heroVisibilityObserver = new MutationObserver(sample);
      window.heroVisibilityObserver.observe(hero, { attributes: true, subtree: true });
      const frame = () => { sample(); window.heroVisibilityFrame = requestAnimationFrame(frame); };
      frame();
    });

    if (scenario.skip) await page.locator('.skip-intro').click();
    await expect(page.locator('.cinematic-screen')).toHaveCount(0, { timeout: 60000 });
    await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => window.heroVisibilityRegressions)).toEqual([]);
    expect(await page.evaluate(() => window.heroLetterRenderingRegressions)).toEqual([]);
    await expect(page.locator('.name-letters')).toHaveCSS('opacity', '1');
    await expect(page.locator('.surname-letters')).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.evaluate(() => {
      window.heroVisibilityObserver.disconnect();
      cancelAnimationFrame(window.heroVisibilityFrame);
    });
  });
}
