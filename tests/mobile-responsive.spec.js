import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

const viewports = [[320, 568], [375, 667], [390, 844], [393, 852], [430, 932], [768, 1024], [1440, 900]];
const settle = page => page.waitForTimeout(900);
async function open(page, hash = '') {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(`${SITE_URL}/${hash}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.about-story')).toHaveClass(/is-enhanced/);
}
async function seekReel(page, progress) {
  await page.locator('.reel-track').evaluate((track, progress) => {
    const stage = track.querySelector('.reel-stage');
    scrollTo(0, track.getBoundingClientRect().top + scrollY + (track.offsetHeight - stage.offsetHeight) * progress);
  }, progress);
  await expect.poll(async () => Number(await page.locator('.reel-stage').getAttribute('data-reel-progress')), { timeout: 15000 }).toBeCloseTo(progress, 2);
}
async function seekJourney(page, time) {
  await page.locator('.experience-content').evaluate((content, time) => {
    const height = document.querySelector('.experience-grid').clientHeight;
    scrollTo(0, content.getBoundingClientRect().top + scrollY + height * 8.5 * time / 10.3);
  }, time);
  await settle(page);
}
async function checkReading(page, company) {
  const card = page.locator(`[data-company="${company}"] .entry-information`);
  await expect(card).toHaveCSS('opacity', '1');
  const box = await card.boundingBox(), size = page.viewportSize();
  expect(Math.abs(box.x + box.width / 2 - size.width / 2)).toBeLessThan(2);
  expect(box.y).toBeGreaterThan(76);
  expect(box.y + box.height).toBeLessThan(size.height - 40);
}

  test.describe('responsive', () => {
    for (const [width, height] of viewports) {
      test(`mosaic, ES/EN reading and navigation at ${width}x${height}`, async ({ page }, testInfo) => {
        const browser = testInfo.project.name || 'chromium';
        test.setTimeout(90000);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.setViewportSize({ width, height });
        await open(page);
        const title = await page.locator('.name-letters').boundingBox();
        expect(title.x).toBeGreaterThanOrEqual(0);
        expect(title.x + title.width).toBeLessThanOrEqual(width + 1);
        const nav = await page.locator('.navbar').boundingBox();
        expect(nav.x).toBeGreaterThan(0);
        expect(nav.x + nav.width).toBeLessThan(width);
        await seekReel(page, .99);
        if (width <= 820) {
          const labels = page.locator('.reel-card-label');
          await expect(labels).toHaveCount(7);
          const boxes = await labels.evaluateAll(nodes => nodes.map(node => {
            const box = node.getBoundingClientRect(), hint = document.querySelector('.reel-bottom').getBoundingClientRect();
            return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, height: box.height, visible: getComputedStyle(node).visibility, overflow: node.scrollWidth > node.clientWidth + 1, inert: node.inert, hintTop: hint.top };
          }));
          for (const box of boxes) {
            expect(box.visible).toBe('visible');
            expect(box.inert).toBe(false);
            expect(box.x).toBeGreaterThanOrEqual(23);
            expect(box.right).toBeLessThanOrEqual(width - 23);
            expect(box.y).toBeGreaterThan(128);
            expect(box.bottom).toBeLessThan(box.hintTop);
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.overflow).toBe(false);
          }
          await page.screenshot({ path: `test-results/mobile-${browser}-${width}-mosaic.png` });
          await labels.nth(3).click();
          await expect(page.locator('.project-dialog')).toBeVisible();
          await expect(page.locator('#reel-project-name')).toHaveText('SmartCampus');
          await page.locator('.dialog-close').click();
          await seekReel(page, .25);
          await expect(labels.first()).toHaveCSS('visibility', 'hidden');
          await seekReel(page, .99);
          await expect(labels.last()).toHaveCSS('visibility', 'visible');
        }
        await seekJourney(page, 0);
        await expect(page.locator('.experience-stage')).toBeVisible();
        await expect(page.locator('.experience-header')).toHaveCSS('opacity', '1');
        for (const language of ['es', 'en']) {
          await page.locator(`.language-choice[lang="${language}"]`).click();
          await seekJourney(page, 3);
          await checkReading(page, 'bcp');
          await expect(page.locator('[data-company="bcp"] .description')).toContainText(language === 'es' ? 'procesamiento' : 'processing');
          const canvas = await page.locator('app-experience-valley canvas').boundingBox();
          expect(canvas.y).toBeCloseTo(0, 0);
          expect(canvas.width).toBeCloseTo(width, 0);
          expect(canvas.height).toBeCloseTo(height, 0);
          await seekJourney(page, 7.5);
          await checkReading(page, 'banbif');
          await expect(page.locator('[data-company="banbif"] .description')).toContainText(language === 'es' ? 'reprocesos' : 'rework');
          await page.screenshot({ path: `test-results/mobile-${browser}-${width}-${language}-banbif.png` });
        }
        await seekJourney(page, 3);
        await checkReading(page, 'bcp');
        for (const delta of [50, 50, -50]) { await page.mouse.wheel(0, delta); await page.waitForTimeout(100); }
        await page.mouse.wheel(0, height * 2);
        await settle(page);
        await seekJourney(page, 3);
        await checkReading(page, 'bcp');
        await page.locator('.contact').click();
        await expect(page.locator('#contacto')).toBeInViewport();
        if (width <= 820) await page.locator('.menu-toggle').click();
        await page.locator('.nav-link[href="#inicio"]').click();
        await expect(page.locator('.hero-meta')).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(errors).toEqual([]);
      });
    }

    test('orientation, browser-height divergence and mid-page reload', async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, '#experiencia');
      await seekJourney(page, 3);
      await checkReading(page, 'bcp');
      await page.setViewportSize({ width: 844, height: 390 });
      await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
      await page.locator('[data-company="bcp"]').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-company="bcp"] .description')).toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
      // Reproduce the Safari distinction between stable CSS height and the
      // layout viewport, without pretending desktop WebKit has iOS browser bars.
      await page.evaluate(() => {
        Object.defineProperty(window, 'innerHeight', { configurable: true, value: 944 });
        dispatchEvent(new Event('resize'));
      });
      await page.waitForTimeout(600);
      await seekJourney(page, 3);
      const photo = await page.locator('.experience-photo').boundingBox();
      expect(photo.height).toBeCloseTo(844, 0);
      await page.evaluate(() => { delete window.innerHeight; dispatchEvent(new Event('resize')); });
      await seekJourney(page, 7.5);
      await checkReading(page, 'banbif');
      await page.reload();
      // Existing product behavior: a reload replays the intro at Home.
      const intro = page.locator('.cinematic-screen');
      if (await intro.count()) await page.locator('.skip-intro').click();
      await expect(intro).toHaveCount(0, { timeout: 15000 });
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 15000 });
      expect(await page.evaluate(() => scrollY)).toBe(0);
    });

    test('intro keeps its skip control and centered crop after viewport resize', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(SITE_URL);
      const intro = page.locator('.cinematic-screen');
      await expect(intro).toBeVisible();
      await expect(page.locator('.cinematic-film')).toHaveCSS('object-position', '50% 50%');
      await page.setViewportSize({ width: 390, height: 667 });
      const box = await intro.boundingBox();
      expect(box.height).toBeCloseTo(667, 0);
      const skip = await page.locator('.skip-intro').boundingBox();
      expect(skip.y + skip.height).toBeLessThan(667);
      expect(skip.y).toBeGreaterThan(0);
      await page.locator('.skip-intro').click();
      await expect(intro).toHaveCount(0);
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
      expect(await page.evaluate(() => scrollY)).toBe(0);
    });

    test('About reverses on mobile and reduced motion cleans up the animated gallery', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await open(page, '#sobre-mi');
      for (const progress of [.12, .48, .86, .48]) {
        await page.locator('.pin-spacer-about-narrative').evaluate((spacer, progress) => {
          const stage = spacer.querySelector('.story-stage');
          scrollTo(0, spacer.getBoundingClientRect().top + scrollY - 84 + (spacer.offsetHeight - stage.offsetHeight) * progress);
        }, progress);
        await settle(page);
        await expect(page.locator('.story-passage').nth(progress < .2 ? 0 : progress > .8 ? 2 : 1)).toHaveCSS('opacity', '1');
      }
      await seekReel(page, .9);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('.reel-stage')).toHaveClass(/is-fallback/);
      await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(0);
      await expect(page.locator('.reel-title span').first()).toHaveCSS('transform', 'none');
      await expect(page.locator('.fallback-project')).toHaveCount(7);
      await page.locator('.fallback-project').nth(3).click();
      await expect(page.locator('#reel-project-name')).toHaveText('SmartCampus');
      await page.locator('.dialog-close').click();
      await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
    });
  });
