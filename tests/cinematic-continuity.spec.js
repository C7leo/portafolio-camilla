import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';
import { writeFile } from 'node:fs/promises';

for (const [width, height] of [[375, 667], [390, 844], [393, 852], [430, 932]]) {
  test(`mobile intro hands the same floral frame to Hero at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height });
    await page.goto(SITE_URL);
    await expect(page.locator('.cinematic-screen')).toBeVisible();
    // Hide annotations only for the pixel comparison: the image geometry and
    // actual production transition continue running unchanged.
    const annotations = await page.addStyleTag({ content: '.hero > *, .floating-header, app-editorial-grid, app-floating-controls, .skip-intro { visibility:hidden !important; }' });
    await page.waitForFunction(() => document.querySelector('.cinematic-film')?.readyState >= 2);
    await page.locator('.cinematic-film').evaluate(video => { video.currentTime = video.duration - 1.15; });
    await expect(page.locator('.cinematic-screen')).toHaveAttribute('data-handoff', 'still', { timeout: 15000 });
    const geometry = await page.evaluate(() => {
      const frame = document.querySelector('.cinematic-still');
      const film = document.querySelector('.cinematic-film');
      const hero = document.querySelector('app-hero');
      const backdrop = getComputedStyle(hero, '::before');
      const bounds = hero.getBoundingClientRect();
      return { still: frame.getBoundingClientRect().toJSON(), film: film.getBoundingClientRect().toJSON(),
        hero: { x: bounds.x, y: bounds.y + parseFloat(backdrop.top), width: bounds.width, height: parseFloat(backdrop.height) },
        image: getComputedStyle(frame).backgroundImage, heroImage: backdrop.backgroundImage,
        position: getComputedStyle(frame).backgroundPosition, heroPosition: backdrop.backgroundPosition,
        opacity: getComputedStyle(film).opacity };
    });
    expect(geometry.image).toBe(geometry.heroImage);
    expect(geometry.position).toBe(geometry.heroPosition);
    expect(geometry.opacity).toBe('0');
    for (const key of ['x', 'y', 'width', 'height']) {
      expect(geometry.still[key]).toBeCloseTo(geometry.hero[key], 0);
      expect(geometry.film[key]).toBeCloseTo(geometry.hero[key], 0);
    }
    const clip = { x: 0, y: 90, width, height: Math.floor(Math.min(height, geometry.hero.height) - 92) };
    const finalIntro = await page.screenshot({ clip, path: testInfo.outputPath('last-intro-flower.png') });
    await expect(page.locator('.cinematic-screen')).toHaveCount(0, { timeout: 5000 });
    const firstHero = await page.screenshot({ clip, path: testInfo.outputPath('first-hero-flower.png') });
    const difference = await page.evaluate(async ([a, b]) => {
      const load = async data => {
        const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
        const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext('2d'); context.drawImage(image, 0, 0); image.close();
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const [left, right] = await Promise.all([load(a), load(b)]);
      let difference = 0;
      for (let i = 0; i < left.length; i++) if (i % 4 !== 3) difference += Math.abs(left[i] - right[i]);
      return difference / (left.length / 4 * 3);
    }, [finalIntro.toString('base64'), firstHero.toString('base64')]);
    expect(difference, 'No spatial crop/scale jump; allow subpixel compositing rounding').toBeLessThan(.6);
    await writeFile(testInfo.outputPath('frame-comparison.json'), JSON.stringify({ width, height, meanPixelDifference: difference, geometry }, null, 2));
    await testInfo.attach('last-intro-flower', { body: finalIntro, contentType: 'image/png' });
    await testInfo.attach('first-hero-flower', { body: firstHero, contentType: 'image/png' });
    await annotations.evaluate(element => element.remove());
    await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
    await expect(page.locator('.floating-scroll-cue')).toBeVisible();
    await page.locator('.floating-scroll-cue').click();
    await expect(page.locator('.floating-header')).toBeVisible();
    for (const [language, text] of [['es', 'Desliza para explorar'], ['en', 'Scroll to explore']]) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      await expect(page.locator('.floating-scroll-cue')).toHaveAttribute('aria-label', text);
    }
    await expect(page.locator('.story-copy')).toBeInViewport();
  });
}

for (const [width, height] of [[390, 844], [1440, 900]]) {
  test(`Home to About releases its pin continuously and reverses at ${width}px`, async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.setViewportSize({ width, height });
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('app-about .about')).toHaveAttribute('data-story-end');
    const end = Number(await page.locator('app-about .about').getAttribute('data-story-end'));
    const positions = [];
    for (const offset of [-8, -4, 0, 4, 8, 4, 0, -4, -8]) {
      await page.evaluate(y => scrollTo(0, y), end + offset);
      await page.waitForTimeout(100);
      const sample = await page.evaluate(() => ({ hero: document.querySelector('app-hero').getBoundingClientRect().y, story: document.querySelector('.story-stage').getBoundingClientRect().y }));
      positions.push(sample);
      expect(Math.abs(sample.story - 84)).toBeLessThan(1);
    }
    for (let i = 1; i < positions.length; i++) expect(Math.abs(positions[i].hero - positions[i - 1].hero)).toBeLessThanOrEqual(5);
    await expect(page.locator('.floating-scroll-cue')).toBeVisible();
  });
}
