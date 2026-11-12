import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });
import { SITE_URL as url } from './support/site.js';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('camilla-cinematic-intro-seen', '1');
    window.valleyDraws = 0;
    window.valleyPreviewFrames = 0;
    const drawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
      if (this.canvas.matches('.experience-valley-preview') && source.closest?.('app-experience-valley')) window.valleyPreviewFrames++;
      return drawImage.call(this, source, ...args);
    };
    for (const method of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      const original = WebGL2RenderingContext.prototype[method];
      WebGL2RenderingContext.prototype[method] = function (...args) {
        if (this.canvas.closest('app-experience-valley')) window.valleyDraws++;
        return original.apply(this, args);
      };
    }
  });
});

async function start(page) {
  await page.goto(`${url}/#experiencia`);
  await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
  await page.evaluate(() => document.fonts.ready);
  const base = await page.locator('.experience-content').evaluate(e => e.getBoundingClientRect().top + scrollY);
  return async time => {
    await page.evaluate(({ base, time }) => scrollTo(0, base + innerHeight * 8.5 * time / 10.3), { base, time });
    await page.waitForTimeout(800); // Allow the scrub to settle, rather than advancing the scene on a timer.
  };
}
const info = (page, company) => page.locator(`[data-company="${company}"] .entry-information`);

for (const [width, height] of [[1440, 900], [768, 900], [390, 844], [320, 640]]) {
  test(`one reversible journey keeps text centered with stable reading at ${width}px`, async ({ page }) => {
    test.setTimeout(45000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewportSize({ width, height });
    const seek = await start(page);
    for (const language of ['es', 'en']) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      await seek(.25);
      await expect(page.locator('.experience-header')).toHaveCSS('opacity', '1');
      await expect(page.locator('.experience-header')).not.toHaveAttribute('aria-hidden', 'true');
      await expect(info(page, 'bcp')).toHaveCSS('opacity', '0');
      await seek(1.4);
      await expect(page.locator('.experience-content img')).toHaveCount(0);
      await expect(page.locator('.experience-header')).toHaveCSS('opacity', '0');
      await seek(3);
      await expect(info(page, 'bcp')).toHaveCSS('opacity', '1');
      await expect(info(page, 'banbif')).toHaveCSS('opacity', '0');
      const reading = await info(page, 'bcp').boundingBox();
      expect(reading.x + reading.width / 2).toBeCloseTo(width / 2, 0);
      expect(reading.y).toBeGreaterThan(84);
      expect(reading.y + reading.height / 2).toBeCloseTo(height / 2, 0);
      await seek(3.8);
      const stable = await info(page, 'bcp').boundingBox();
      expect(stable.y).toBeCloseTo(reading.y, 0);
      expect(stable.width).toBeCloseTo(reading.width, 0);
      const copy = await info(page, 'bcp').boundingBox();
      expect(copy.y + copy.height).toBeLessThan(height - 65);
      await expect(page.locator('app-experience-valley')).toHaveAttribute('data-ready', 'true');
      await page.waitForTimeout(250);
      const paused = await page.evaluate(() => window.valleyDraws);
      await page.waitForTimeout(250);
      expect(await page.evaluate(() => window.valleyDraws)).toBe(paused);
      await page.screenshot({ path: `test-results/journey-bcp-${width}-${language}.png` });
      await seek(5.35);
      await expect(info(page, 'bcp')).toHaveCSS('opacity', '0');
      await expect(info(page, 'banbif')).toHaveCSS('opacity', '0');
      await seek(7.5);
      expect(await page.evaluate(() => window.valleyDraws)).toBeGreaterThan(paused);
      await expect(info(page, 'banbif')).toHaveCSS('opacity', '1');
      await expect(page.locator('[data-company="bcp"]')).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('[data-company="banbif"]')).toHaveAttribute('aria-hidden', 'false');
      const next = await info(page, 'banbif').boundingBox();
      expect(next.x + next.width / 2).toBeCloseTo(width / 2, 0);
      expect(next.y + next.height / 2).toBeCloseTo(height / 2, 0);

      await page.screenshot({ path: `test-results/journey-banbif-${width}-${language}.png` });
      await seek(3);
      await expect(info(page, 'bcp')).toHaveCSS('opacity', '1');
      await expect(info(page, 'banbif')).toHaveCSS('opacity', '0');
    }
    await seek(10.3);
    await expect(page.locator('app-experience-valley')).toHaveCSS('opacity', '0');
    await expect(page.locator('#experiencia')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.mouse.wheel(0, height * .65);
    await expect(page.locator('.site-footer')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`opening oval reuses the live valley frame at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await start(page);
    await page.locator('#experiencia').evaluate(e => scrollTo(0, e.getBoundingClientRect().top + scrollY + innerHeight * 1.25 * .6));
    await expect(page.locator('app-experience-valley')).toHaveAttribute('data-ready', 'true');
    await expect.poll(() => page.evaluate(() => window.valleyPreviewFrames)).toBeGreaterThan(0);
    await page.waitForTimeout(800);
    const oval = await page.locator('.experience-photo').boundingBox();
    expect(oval.width).toBeGreaterThan(oval.height);
    expect(oval.width).toBeLessThan(width);
    expect(Math.abs(oval.x + oval.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs(oval.y + oval.height / 2 - height / 2)).toBeLessThanOrEqual(1);
    await expect(page.locator('.experience-backdrop')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.experience-photo')).toHaveCSS('background-image', 'none');
    await expect(page.locator('app-experience-valley canvas')).toHaveCount(1);
    expect(await page.locator('.experience-valley-preview').evaluate(canvas => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 150) return true;
      }
      return false;
    })).toBe(true);
    await page.screenshot({ path: `test-results/experience-valley-oval-${width}.png` });
    // Both views must share viewport coordinates while the aperture slides away,
    // including reverse scroll; otherwise the same horizon appears twice.
    for (const position of [1.5, 2.05, 2.45, 2.05]) {
      await page.locator('#experiencia').evaluate((e, position) => scrollTo(0, e.getBoundingClientRect().top + scrollY + innerHeight * position), position);
      await page.waitForTimeout(500);
      const source = await page.locator('app-experience-valley canvas').boundingBox();
      const preview = await page.locator('.experience-valley-preview').boundingBox();
      expect(Math.abs(preview.y - source.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(preview.height - source.height)).toBeLessThanOrEqual(1);
      const opacity = await page.locator('app-experience-valley').evaluate(e => getComputedStyle(e).opacity);
      await expect(page.locator('.experience-valley-preview')).toHaveCSS('opacity', opacity);
      await expect(page.locator('#experiencia app-editorial-grid')).toHaveCount(1);
      await expect(page.locator('.experience-grid app-editorial-grid')).toHaveCSS('visibility', 'visible');
      expect(await page.locator('.experience-grid .grid-rule').evaluateAll(rules =>
        rules.map(rule => Math.round(rule.getBoundingClientRect().top))
      )).toEqual([84, height - 32]);
    }
    await page.screenshot({ path: `test-results/experience-valley-handoff-${width}.png` });
  });

  test(`journey starts as soon as the oval fills the screen at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await start(page);
    const startOffset = await page.locator('#experiencia').evaluate(section => {
      const content = section.querySelector('.experience-content');
      return content.getBoundingClientRect().top - section.getBoundingClientRect().top;
    });
    expect(Math.abs(startOffset - height * 1.25)).toBeLessThanOrEqual(1);
    const enter = async position => {
      await page.locator('#experiencia').evaluate((e, position) => scrollTo(0, e.getBoundingClientRect().top + scrollY + innerHeight * position), position);
      await page.waitForTimeout(700);
    };
    await enter(.75);
    await expect(page.locator('.experience-stage')).toHaveCSS('visibility', 'hidden');
    await enter(1.3);
    await expect(page.locator('.experience-header')).toBeVisible();
    expect(Math.abs((await page.locator('.experience-stage').boundingBox()).y)).toBeLessThanOrEqual(1);
    await expect(page.locator('.experience-header')).toHaveCSS('opacity', '1');
    await expect(page.locator('app-experience-valley')).toHaveAttribute('data-ready', 'true');
    const draws = await page.evaluate(() => window.valleyDraws);
    await page.screenshot({ path: `test-results/experience-immediate-entry-${width}.png` });
    await enter(1.5);
    expect(await page.evaluate(() => window.valleyDraws)).toBeGreaterThan(draws);
    await enter(.75);
    await expect(page.locator('.experience-stage')).toHaveCSS('visibility', 'hidden');
  });
}

test('landscape remains opaque and exits before the journey; list mode releases the pin and is reversible', async ({ page }) => {
  await start(page);
  for (const [position, bottom] of [[1.5, 100], [2.05, 60]]) {
    await page.locator('#experiencia').evaluate((e, position) => scrollTo(0, e.getBoundingClientRect().top + scrollY + innerHeight * position), position);
    await expect(page.locator('.experience-photo')).toHaveCSS('opacity', '1');
    await expect.poll(() => page.locator('.experience-backdrop').evaluate(e => Math.round(e.getBoundingClientRect().bottom / innerHeight * 100))).toBe(bottom);
  }
  await page.locator('.experience-content').scrollIntoViewIfNeeded();
  await page.locator('.journey-mode').click();
  await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
  await expect(page.locator('.experience-content .pin-spacer')).toHaveCount(0);
  for (const company of ['bcp', 'banbif']) {
    await expect(info(page, company)).toHaveCSS('opacity', '1');
    await expect(page.locator(`[data-company="${company}"]`)).not.toHaveAttribute('aria-hidden');
  }
  await page.locator('.journey-mode').click();
  await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
  await expect(page.locator('.experience-content .pin-spacer')).toHaveCount(1);
  await page.locator('.contact').click();
  await expect(page.locator('#contacto')).toBeInViewport();
});

test('reduced motion, short screens and WebGL loss expose the complete readable history', async ({ page }) => {
  const seek = await start(page);
  await seek(3);
  await page.locator('app-experience-valley[data-ready="true"]').waitFor();
  await page.locator('app-experience-valley canvas').evaluate(c => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
  await expect(page.locator('.experience-content .pin-spacer')).toHaveCount(0);
  await expect(info(page, 'banbif')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
  await expect(page.locator('.experience-reveal')).toBeHidden();
  await expect(info(page, 'bcp')).toHaveCSS('opacity', '1');
  await expect(info(page, 'banbif')).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
  await expect(info(page, 'bcp')).toHaveCSS('opacity', '1');
  await expect(info(page, 'banbif')).toHaveCSS('opacity', '1');
});

