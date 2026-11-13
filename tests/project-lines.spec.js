import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]]) {
  test(`Projects editorial lines stay white on violet surfaces at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(`${SITE_URL}/#proyectos`);
    await page.evaluate(() => document.fonts.ready);
    const globalRails = page.locator('.is-viewport .grid-rail');
    const positions = await globalRails.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().x));
    for (const [surface, ink] of [['.project-catalogue', '255, 255, 255']]) {
      const area = page.locator(surface);
      await area.locator('.showcase-header').scrollIntoViewIfNeeded();
      const grid = area.locator('app-editorial-grid').first();
      await expect(grid).toHaveCSS('mix-blend-mode', 'normal');
      const rails = grid.locator('.grid-rail');
      for (let i = 0; i < 2; i++) {
        const bounds = await rails.nth(i).boundingBox();
        expect(bounds.x).toBeCloseTo(positions[i], 0);
        expect(bounds.width).toBe(1);
        await expect(rails.nth(i)).toHaveCSS('background-color', `rgba(${ink}, ${width <= 640 ? '0.1' : '0.13'})`);
      }
      await expect(grid.locator('.grid-rule').first()).toHaveCSS('height', '1px');
      const horizontal = await grid.locator('.grid-rule').first().evaluate(el => getComputedStyle(el, '::before').backgroundColor);
      expect(horizontal).toContain(ink);
      await expect.poll(() => page.locator('.is-viewport .grid-rails').evaluate(el => getComputedStyle(el).maskImage)).toContain('rgba(0, 0, 0, 0)');
    }
    await expect(page.locator('.project-index')).toHaveCSS('border-bottom-width', '0px');
    const index = page.locator('.project-index');
    const controls = await page.locator('.gallery-controls').boundingBox();
    const frame = await index.boundingBox();
    expect(frame.x).toBeCloseTo(positions[0], 1);
    expect(frame.x + frame.width - 1).toBeCloseTo(positions[1], 1);
    expect(frame.y).toBeCloseTo(controls.y + controls.height, 1);
    const indexRules = page.locator('.project-catalogue .grid-rule').filter({ has: page.locator('.grid-crossings') });
    for (const [ruleIndex, y] of [[1, frame.y], [2, frame.y + frame.height]]) {
      const rule = await indexRules.nth(ruleIndex).boundingBox();
      expect(rule.x).toBe(0);
      expect(rule.width).toBe(width);
      expect(Math.abs(rule.y - y)).toBeLessThanOrEqual(1);
    }
    for (const side of ['left', 'right']) {
      await expect(index).toHaveCSS(`border-${side}-width`, '0px');
      const rail = page.locator(`.project-catalogue .grid-rail.${side}`);
      const bounds = await rail.boundingBox();
      expect(bounds.y).toBeLessThan(frame.y - 24);
      expect(bounds.y + bounds.height).toBeGreaterThan(frame.y + frame.height + 24);
    }
    const firstItem = await index.locator('.project-row').first().boundingBox();
    expect(firstItem.x - frame.x).toBeGreaterThanOrEqual(16);
    await expect(page.locator('.project-catalogue .grid-rails')).toHaveCSS('mask-image', 'none');
    await expect(page.locator('.project-showcase')).toHaveCSS('background-color', 'rgb(90, 78, 255)');
    // Validate the actual painted pixels above, throughout and below the index;
    // matching DOM bounds alone cannot detect a masked or doubled guide.
    await index.evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight / 2));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const sampling = await page.evaluate(() => ({
      rails: Array.from(document.querySelectorAll('.project-catalogue .grid-rail'), el => el.getBoundingClientRect().x),
      index: document.querySelector('.project-index').getBoundingClientRect().toJSON(),
      horizontalYs: Array.from(document.querySelectorAll('.project-catalogue .grid-rule')).slice(1).map(el => el.getBoundingClientRect().y),
    }));
    for (const rule of await page.locator('.project-catalogue .grid-rule').all()) await expect(rule).toHaveClass(/is-seen/);
    const screenshot = await page.screenshot({ path: testInfo.outputPath('continuous-guides.png'), animations: 'disabled' });
    const endPixels = await page.evaluate(async ({ data, ys }) => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0); bitmap.close();
      return ys.flatMap(y => [0, canvas.width - 1].map(x => Math.max(...[-1, 0, 1].map(delta => context.getImageData(x, Math.floor(y) + delta, 1, 1).data[0]))));
    }, { data: screenshot.toString('base64'), ys: sampling.horizontalYs });
    for (const red of endPixels) expect(red, 'The horizontal line must be painted at the viewport edge').toBeGreaterThan(98);
    const painted = await page.evaluate(async ({ data, sampling }) => {
      const bitmap = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const context = canvas.getContext('2d'); context.drawImage(bitmap, 0, 0); bitmap.close();
      const pixel = (x, y) => Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3);
      return sampling.rails.map(position => {
        const x = Math.round(position), top = Math.floor(sampling.index.top), bottom = Math.ceil(sampling.index.bottom);
        const reference = pixel(x, top - 16);
        let maxDifference = 0, maxAdjacentDifference = 0, count = 0;
        for (let y = top - 20; y < bottom + 20; y++) {
          if (Math.abs(y - sampling.index.top) < 3 || Math.abs(y - sampling.index.bottom) < 3) continue;
          const color = pixel(x, y);
          maxDifference = Math.max(maxDifference, ...color.map((value, channel) => Math.abs(value - reference[channel])));
          for (const adjacent of [x - 1, x + 1]) {
            maxAdjacentDifference = Math.max(maxAdjacentDifference, ...pixel(adjacent, y).map((value, channel) => Math.abs(value - [90, 78, 255][channel])));
          }
          count++;
        }
        return { x, reference, maxDifference, maxAdjacentDifference, count };
      });
    }, { data: screenshot.toString('base64'), sampling });
    for (const rail of painted) {
      expect(rail.reference[0], 'The guide must be visibly lighter than the violet surface').toBeGreaterThan(98);
      expect(rail.maxDifference, 'Same visible line above, inside and below the index').toBeLessThanOrEqual(1);
      expect(rail.maxAdjacentDifference, 'Only one painted pixel column, with no doubled border').toBeLessThanOrEqual(1);
      expect(rail.count).toBeGreaterThan(60);
    }
    await testInfo.attach('continuous-guides', { body: screenshot, contentType: 'image/png' });
    await testInfo.attach('painted-guide-measurements', { body: Buffer.from(JSON.stringify(painted, null, 2)), contentType: 'application/json' });
    await page.locator('.hero').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.is-viewport .grid-rails').evaluate(el => getComputedStyle(el).maskImage)).not.toContain('rgba(0, 0, 0, 0)');
    await expect(page.locator('.is-viewport')).toHaveCSS('mix-blend-mode', 'difference');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
