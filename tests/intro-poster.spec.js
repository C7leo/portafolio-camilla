import { test, expect } from '@playwright/test';
import sharp from 'sharp';

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`the original opening frame covers slow application startup at ${viewport.width}px`, async ({ page, browserName }, testInfo) => {
    await page.setViewportSize(viewport);
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/assets/index-*.js', async route => { await gate; await route.continue(); });
    try {
      await page.goto('/', { waitUntil: 'commit' });
      await expect(page.locator('html')).toHaveAttribute('data-intro-pending', '');
      const posterLink = page.locator('link[rel="preload"][as="image"][href*="cinematic-intro-poster"]');
      await posterLink.evaluate(link => new Promise((resolve, reject) => {
        const poster = new Image(); poster.onload = resolve; poster.onerror = reject; poster.src = link.href;
      }));
      const cover = await page.evaluate(() => {
        const style = getComputedStyle(document.body, '::before');
        return { image: style.backgroundImage, position: style.position, width: parseFloat(style.width), height: parseFloat(style.height) };
      });
      expect(cover.image).toContain('cinematic-intro-poster');
      expect(cover.position).toBe('fixed');
      expect(cover.width).toBe(viewport.width);
      expect(cover.height).toBe(viewport.height);
      // Windows WebKit's screenshot API waits for initial document load, which
      // is deliberately blocked here. Verify its cover and decoded image above;
      // Chrome can additionally capture and inspect pixels before that load.
      if (browserName !== 'webkit') {
        const screenshot = await page.screenshot({ path: testInfo.outputPath('poster-before-playback.png') });
        const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        let white = 0;
        for (let i = 0; i < data.length; i += info.channels) if (data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245) white++;
        expect(white / (info.width * info.height), 'The opening floral poster covers the screen while video waits').toBeLessThan(.1);
      }
      await expect(page.locator('app-root')).not.toHaveAttribute('data-ready');
    } finally { release(); }
    await page.waitForFunction(() => { const v = document.querySelector('video'); return v && !v.paused && v.currentTime > .2; });
    await expect(page.locator('video')).toHaveAttribute('poster', /cinematic-intro-poster/);
    await page.locator('.skip-intro').click();
    await expect(page.locator('.cinematic-screen')).toHaveCount(0);
    await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
  });
}
