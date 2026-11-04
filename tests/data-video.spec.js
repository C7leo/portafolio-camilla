import { test, expect } from '@playwright/test';

async function scrollToProgress(page, progress) {
  await page.locator('#data').evaluate((el, value) => {
    const header = document.querySelector('.header').offsetHeight;
    const start = el.getBoundingClientRect().top + scrollY - header;
    scrollTo({ top: start + (el.offsetHeight - innerHeight + header) * value, behavior: 'instant' });
  }, progress);
}
async function seek(page, progress, stage) {
  await scrollToProgress(page, progress);
  await expect(page.locator('#data')).toHaveAttribute('data-media', 'ready');
  await expect.poll(() => page.locator('.data-video').evaluate((v, value) =>
    !v.seeking && Math.abs(v.currentTime / v.duration - value) < .003, progress)).toBe(true);
  if (stage !== undefined) await expect(page.locator('#data')).toHaveAttribute('data-stage', String(stage));
}
async function open(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}

test('actual MP4 is lazy, paused, reversible and synchronized with all six stages', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await open(page);
  const video = page.locator('.data-video');
  expect(await video.getAttribute('src')).toBeNull();
  expect(await video.getAttribute('autoplay')).toBeNull();
  const frames = [];
  for (const [stage, progress] of [0, .2, .4, .52, .7, 1].entries()) {
    await seek(page, progress, stage);
    await expect(page.locator('.pipeline-step.active')).toHaveCount(stage + 1);
    await expect(page.locator('.pipeline-step[aria-current=step]')).toHaveCount(1);
    expect(await video.evaluate(v => v.paused)).toBe(true);
    const frame = await video.screenshot({ path: `test-results/video-stage-${stage}.png` });
    for (const earlier of frames) expect(frame.equals(earlier)).toBe(false);
    frames.push(frame);
  }
  await seek(page, .4, 2);
  const stopped = await video.evaluate(v => v.currentTime);
  await page.waitForTimeout(700);
  expect(await video.evaluate(v => v.currentTime)).toBe(stopped);
  await seek(page, .2, 1);
  expect((await video.screenshot()).equals(frames[1])).toBe(true);
  await seek(page, 0, 0);
  expect(await video.evaluate(v => v.currentTime)).toBeLessThan(.01);
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await seek(page, .7, 4);
  await expect(page.locator('.pipeline-step[aria-current=step]')).toContainText('Reportes');
  await expect(page.locator('.data-scroll-hint')).toContainText('DESLIZA');
  expect(errors).toEqual([]);
});

test('sticky title and navigation stay visible on desktop, mobile and short screens; scene releases', async ({ page }) => {
  for (const [width, height] of [[1440,900], [1920,1080], [768,1024], [390,844], [320,740], [1240,600], [844,390]]) {
    await page.setViewportSize({ width, height }); await open(page);
    await seek(page, .4, 2);
    const first = await page.locator('#data-title').boundingBox();
    await seek(page, .7, 4);
    const layout = await page.evaluate(() => ({
      header: document.querySelector('.header').getBoundingClientRect().bottom,
      title: document.querySelector('#data-title').getBoundingClientRect().top,
      copyBottom: document.querySelector('.data-heading p').getBoundingClientRect().bottom,
      axisTop: document.querySelector('#data .visual-axis').getBoundingClientRect().top,
      footer: document.querySelector('.data-footer').getBoundingClientRect().bottom,
      sceneHeight: document.querySelector('#data').offsetHeight,
      visualHeight: document.querySelector('.data-visual').getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth - innerWidth,
      separated: (() => {
        const bounds = selector => document.querySelector(selector).getBoundingClientRect();
        const overlap = (a,b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return !overlap(bounds('.data-heading'),bounds('.data-visual')) &&
          !overlap(bounds('.data-cat'),bounds('.data-aside'));
      })(),
      catWidth: document.querySelector('.data-cat').getBoundingClientRect().width,
    }));
    expect(Math.abs(layout.title - first.y)).toBeLessThan(1);
    expect(layout.title).toBeGreaterThanOrEqual(layout.header);
    expect(layout.copyBottom).toBeLessThanOrEqual(layout.axisTop);
    expect(layout.footer).toBeLessThanOrEqual(height + 1);
    expect(layout.visualHeight).toBeGreaterThan(70);
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.separated, `copy and annotation must stay clear at ${width}px`).toBe(true);
    if (width >= 1440) { expect(layout.catWidth).toBeGreaterThanOrEqual(140); expect(layout.catWidth).toBeLessThanOrEqual(190); }
    expect(layout.sceneHeight / height).toBeGreaterThanOrEqual(3.5);
    await scrollToProgress(page, 1.2);
    await expect.poll(() => page.locator('.data-sticky').evaluate(el => el.getBoundingClientRect().bottom < innerHeight - 30)).toBe(true);
    if (width === 390) { await seek(page, .52, 3); await page.screenshot({ path:'test-results/video-mobile.png' }); }
  }
});

test('missing video shows six real static frames without trapping scroll', async ({ page }) => {
  await page.route('**/assets/data-story/video/03_video.mp4', route => route.abort());
  await open(page); await scrollToProgress(page, .3);
  await expect(page.locator('#data')).toHaveAttribute('data-mode', 'static');
  await expect(page.locator('#data')).toHaveAttribute('data-media', 'unavailable');
  await expect(page.locator('.data-storyboard')).toBeVisible();
  await expect(page.locator('.data-storyboard li')).toHaveCount(6);
  expect(await page.locator('.data-storyboard img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
  expect(await page.locator('#data').evaluate(el => el.offsetHeight)).toBeLessThan(1600);
  await expect(page.locator('.data-sticky')).toHaveCSS('position','relative');
});

test('reduced motion skips downloading video and supports live preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let requests = 0;
  page.on('request', r => { if (r.url().endsWith('/03_video.mp4')) requests++; });
  await open(page); await page.locator('#data').scrollIntoViewIfNeeded();
  await expect(page.locator('#data')).toHaveAttribute('data-mode','static');
  await expect(page.locator('.data-storyboard')).toBeVisible();
  expect(await page.locator('.data-video').getAttribute('src')).toBeNull();
  expect(await page.locator('#data').evaluate(el => el.querySelector('.data-storyboard li:last-child').getBoundingClientRect().bottom <= el.getBoundingClientRect().bottom)).toBe(true);
  expect(requests).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seek(page, .52, 3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#data')).toHaveAttribute('data-mode','static');
  await expect(page.locator('.data-sticky')).toHaveCSS('position','relative');
  expect(await page.locator('.data-video').getAttribute('src')).toBeNull();
});

test('metadata arriving after scroll uses the latest target; rapid changes settle on the final frame', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/assets/data-story/video/03_video.mp4', async route => { await gate; await route.continue(); });
  await open(page);
  await scrollToProgress(page, .2);
  await expect(page.locator('#data')).toHaveAttribute('data-media','loading');
  await scrollToProgress(page, .7); release();
  await seek(page, .7, 4);
  await page.locator('#data').evaluate(async el => {
    const header = document.querySelector('.header').offsetHeight;
    const start = el.getBoundingClientRect().top + scrollY - header;
    const distance = el.offsetHeight - innerHeight + header;
    for (const p of [.95,.1,.8,.3,.9,.4]) {
      scrollTo({ top:start + distance * p, behavior:'instant' });
      await new Promise(requestAnimationFrame);
    }
  });
  await seek(page, .4, 2);
  const time = await page.locator('.data-video').evaluate(v => v.currentTime);
  await page.waitForTimeout(300);
  expect(await page.locator('.data-video').evaluate(v => v.currentTime)).toBe(time);
});
