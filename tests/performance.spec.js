import { test, expect } from '@playwright/test';

test('first visit autoplays the film before starting secondary graphics', async ({ page }) => {
  const media = [];
  const graphics = [];
  const failures = [];
  page.on('request', request => {
    if (/\.(mp4|webm)(?:\?|$)/.test(request.url())) media.push(request.url());
    if (/\/(three-|about-horizon-bloom\.scene-|experience-valley\.scene-)/.test(request.url())) graphics.push(request.url());
  });
  page.on('pageerror', error => failures.push(error.message));
  await page.addInitScript(() => {
    window.introInputCount = 0;
    for (const name of ['pointerdown', 'touchstart', 'keydown', 'click']) {
      document.addEventListener(name, event => { if (event.isTrusted) window.introInputCount++; }, true);
    }
  });
  await page.goto('/');
  await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
  await expect(page.locator('.cinematic-screen')).toBeVisible();
  await expect.poll(() => media.length).toBeGreaterThan(0);
  await page.waitForFunction(() => { const video = document.querySelector('video'); return video && !video.paused && video.currentTime > .5; });
  expect(await page.evaluate(() => window.introInputCount)).toBe(0);
  expect(graphics).toEqual([]);
  await expect(page.locator('.portrait img')).not.toHaveAttribute('src');
  await page.locator('.skip-intro').click();
  await expect(page.locator('.cinematic-screen')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeVisible();
  expect(failures).toEqual([]);
});

test('production HTML is readable with JavaScript disabled', async ({ browser, baseURL }) => {
  test.skip(!process.env.TEST_BASE_URL, 'Requires the prerendered production build');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL);
  await expect(page.locator('#hero-title')).toContainText('CAMILLA');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('#sobre-mi')).toContainText('PROPÓSITO');
  expect(await page.locator('img[src*="127.0.0.1:5186"]').count()).toBe(0);
  await context.close();
});

test('mobile image hints reserve space and select optimized resources', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
  await page.locator('.skip-intro').click();
  await expect(page.locator('.hero')).not.toHaveClass(/hero-intro-pending/);
  const images = await page.locator('img').evaluateAll(nodes => nodes.map(image => ({
    width: image.getAttribute('width'), height: image.getAttribute('height'), src: image.getAttribute('src'),
  })));
  expect(images.every(image => Number(image.width) > 0 && Number(image.height) > 0)).toBeTruthy();
  expect(images.some(image => image.src?.endsWith('.png'))).toBeFalsy();
  await expect(page.locator('.portrait img')).toHaveAttribute('srcset', /480w.*960w/);
  await expect(page.locator('head link[rel="preload"][as="image"][media="(max-width: 640px)"]')).toHaveAttribute('href', /960.*\.webp/);
});

test('production cache keeps HTML fresh and fingerprints immutable', async ({ request }) => {
  test.skip(!process.env.TEST_BASE_URL || !process.env.CHECK_CACHE, 'Requires production server headers');
  const html = await request.get('/');
  expect(html.headers()['cache-control']).toContain('max-age=0');
  const source = await html.text();
  const asset = /src="([^\"]+\/assets\/[^\"]+\.js)"/.exec(source)?.[1] || /src="(\/assets\/[^\"]+\.js)"/.exec(source)?.[1];
  expect(asset).toBeTruthy();
  const response = await request.get(asset);
  expect(response.headers()['cache-control']).toContain('immutable');
  expect(response.headers()['cache-control']).toContain('31536000');
});

test('an outdated lazy chunk refreshes HTML once without a reload loop', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
  await Promise.all([
    page.waitForEvent('load'),
    page.evaluate(() => window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))),
  ]);
  await expect(page.locator('app-root')).toHaveAttribute('data-ready', '');
  expect(await page.evaluate(() => sessionStorage.getItem('portfolio-chunk-recovery'))).toBeTruthy();
  const timestamp = await page.evaluate(() => performance.timeOrigin);
  await page.evaluate(() => window.dispatchEvent(new Event('vite:preloadError', { cancelable: true })));
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timestamp);
});
