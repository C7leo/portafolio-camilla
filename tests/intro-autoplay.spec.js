import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.introInputCount = 0;
    for (const name of ['pointerdown', 'touchstart', 'keydown', 'click']) {
      document.addEventListener(name, event => { if (event.isTrusted) window.introInputCount++; }, true);
    }
  });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test.describe(`automatic cinematic entrance at ${viewport.width}px`, () => {
    test.use({ viewport });

    test('plays without gestures, completes the original Hero reveal and keeps navigation usable', async ({ page }, testInfo) => {
      const errors = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const film = page.locator('.cinematic-film');
      await expect(page.locator('.cinematic-screen')).toBeVisible();
      await expect(film).toHaveAttribute('autoplay', '');
      await expect(film).toHaveAttribute('muted', '');
      await expect(film).toHaveAttribute('playsinline', '');
      await page.waitForFunction(() => { const v = document.querySelector('video'); return v && !v.paused && v.currentTime > 1; });
      expect(await page.evaluate(() => window.introInputCount)).toBe(0);
      await expect(page.locator('.intro-play')).toHaveCount(0);
      await expect(page.locator('.hero')).toHaveClass(/hero-intro-pending/);
      expect(requests.filter(url => /\/(three-|about-horizon-bloom\.scene-|experience-valley\.scene-)/.test(url))).toEqual([]);
      const playback = await film.evaluate(v => ({ time: v.currentTime, duration: v.duration, width: v.videoWidth, height: v.videoHeight, poster: v.poster, source: v.currentSrc }));
      // Windows WebKit reports the decoded cover surface (e.g. 1600×900),
      // whereas Chrome reports the encoded 1280×720 frame. Both must stay 16:9.
      expect(playback.width).toBeGreaterThan(0);
      expect(playback.width / playback.height).toBeCloseTo(16 / 9, 2);
      await expect(film).toHaveAttribute('width', '1280');
      await expect(film).toHaveAttribute('height', '720');
      expect(playback.duration).toBeCloseTo(10, 0);
      expect(playback.poster).toContain('cinematic-intro-poster');
      await page.screenshot({ path: testInfo.outputPath('automatic-film.png') });
      await expect(page.locator('.cinematic-screen')).toHaveCount(0, { timeout: 25000 });
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
      await expect(page.locator('.name-letters')).toHaveCSS('opacity', '1');
      await expect(page.locator('.surname-letters')).toHaveCSS('opacity', '1');
      await page.screenshot({ path: testInfo.outputPath('hero-after-film.png') });
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      await page.locator('.hero-link.primary').click();
      await expect(page.locator('#proyectos')).toBeInViewport();
      expect(errors).toEqual([]);
      await testInfo.attach('playback', { body: JSON.stringify(playback, null, 2), contentType: 'application/json' });
    });

    test('skip and Escape release the cinematic entrance', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.cinematic-screen')).toBeVisible();
      await page.locator('.skip-intro').click();
      await expect(page.locator('.cinematic-screen')).toHaveCount(0);
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('.cinematic-screen')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.cinematic-screen')).toHaveCount(0);
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/, { timeout: 10000 });
    });

    test('blocked autoplay dissolves to a readable Hero without a play button', async ({ page }) => {
      await page.addInitScript(() => {
        HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Blocked by browser policy', 'NotAllowedError'));
      });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
      await expect(page.locator('.cinematic-screen')).toHaveCount(0);
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/);
      await expect(page.locator('#hero-title')).toBeVisible();
      await expect(page.locator('html')).not.toHaveAttribute('data-intro-pending');
      await expect(page.locator('.intro-play')).toHaveCount(0);
    });

    test('reduced motion avoids media downloads and leaves all content readable', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const media = [];
      page.on('request', request => { if (/\.(mp4|webm)(?:\?|$)/.test(request.url())) media.push(request.url()); });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
      await expect(page.locator('.cinematic-screen')).toHaveCount(0);
      await expect(page.locator('#hero-title')).toBeVisible();
      await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/);
      await expect(page.locator('html')).not.toHaveAttribute('data-intro-pending');
      expect(media).toEqual([]);
    });

    test('unsupported WebM uses the optimized MP4 automatically', async ({ page }) => {
      await page.addInitScript(() => {
        const play = HTMLMediaElement.prototype.play;
        const canPlay = HTMLMediaElement.prototype.canPlayType;
        HTMLMediaElement.prototype.canPlayType = function (type) { return type.includes('mp4') ? '' : canPlay.call(this, type); };
        HTMLMediaElement.prototype.play = function () {
          return this.src.endsWith('.webm') ? Promise.reject(new DOMException('Codec unavailable', 'NotSupportedError')) : play.call(this);
        };
      });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.cinematic-screen')).toBeVisible();
      await page.waitForFunction(() => { const v = document.querySelector('video'); return v && /optimized.*\.mp4/.test(v.currentSrc) && !v.paused && v.currentTime > .2; });
      expect(await page.evaluate(() => window.introInputCount)).toBe(0);
      await page.locator('.skip-intro').click();
      await expect(page.locator('.cinematic-screen')).toHaveCount(0);
    });
  });
}
