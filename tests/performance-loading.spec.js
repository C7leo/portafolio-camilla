import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`project carousel loads on approach and remains usable at ${width}px`, async ({ page }) => {
    const requests = [];
    const errors = [];
    page.on('request', request => requests.push(request.url()));
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });
    expect(requests.some(url => /cinematic-intro|night-lily/.test(url))).toBe(false);
    expect(requests.some(url => url.includes('circular-carousel-bridge'))).toBe(false);
    expect(requests.some(url => /\/(courtly|spotfinder|nutrisend)-(640|1280)/.test(url))).toBe(false);

    await page.locator('#proyectos').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.circular-carousel')).toBeVisible();
    await expect(page.locator('.carousel-placeholder')).toHaveCount(0);
    await expect.poll(() => requests.some(url => url.includes('circular-carousel-bridge'))).toBe(true);
    const loadedImage = await page.locator('.circular-carousel__photo').first().evaluate(image => image.currentSrc);
    expect(loadedImage).toMatch(/-640(?:-[\w-]+)?\.webp/);
    await page.locator('.carousel-dot').nth(1).click();
    await expect(page.locator('.project-primary h3')).toHaveText('SPOTFINDER');
    await expect(page.locator('.project-link')).toHaveAttribute('href', '#proyectos/spotfinder');
    expect(errors).toEqual([]);
  });
}
