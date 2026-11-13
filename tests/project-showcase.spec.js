import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

async function open(page, width = 1440, height = 900) {
  await page.setViewportSize({ width, height });
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(`${SITE_URL}/#proyectos`);
  await page.locator('.project-showcase').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#proyectos').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY));
}

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900]]) {
  test(`sea ring, real projects and accessible links at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await open(page, width, height);
    const frame = page.locator('.sea-gallery');
    const bounds = await frame.boundingBox();
    const rails = await page.locator('.is-viewport .grid-rail').evaluateAll(nodes => nodes.map((el, index) => index === 0 ? el.getBoundingClientRect().left : el.getBoundingClientRect().right));
    expect(bounds.x).toBeCloseTo(rails[0], 1);
    expect(bounds.x + bounds.width).toBeCloseTo(rails[1], 1);
    await expect(page.locator('.gallery-intro > span')).toBeVisible();
    await expect(page.locator('.project-index .project-open')).toHaveCount(7);
    await expect(page.locator('.ring-card')).toHaveCount(14);
    await expect(page.locator('#proyectos canvas')).toHaveCount(0);
    await expect.poll(() => page.locator('.ring-card').evaluateAll(cards => cards.filter(card => getComputedStyle(card).visibility === 'visible').length)).toBeGreaterThan(5);
    await expect(frame).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(frame.locator('video')).toHaveCount(0);
    for (const language of ['es', 'en']) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      await expect(page.locator('.showcase-header p')).toHaveText(language === 'es' ? 'Soluciones digitales, de la idea al desarrollo.' : 'Digital solutions, from idea to development.');
      const trigger = page.locator('.project-open').nth(3);
      await trigger.click();
      await expect(page.locator('#reel-project-name')).toHaveText('SmartCampus');
      await expect(page.locator('.dialog-links a').first()).toHaveAttribute('href', 'https://smartcampus-grupo1-fundamentoarqui.github.io/lumina-smartcampus-landingPage/');
      await expect(page.locator('.dialog-links a').last()).toHaveAttribute('href', /^https:\/\/github.com\//);
      await page.keyboard.press('Escape');
      await expect(page.locator('.project-dialog')).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('ring drag and horizontal wheel work while vertical page scroll remains available', async ({ page }) => {
  await open(page);
  await page.locator('.motion-toggle').click();
  await page.waitForTimeout(2000);
  const card = page.locator('.ring-card').first();
  const transform = await card.evaluate(el => el.style.transform);
  await page.locator('.gallery-buttons button').last().click();
  await expect.poll(() => card.evaluate(el => el.style.transform)).not.toBe(transform);
  await page.waitForTimeout(700);
  const beforeWheel = await card.evaluate(el => el.style.transform);
  await page.mouse.move(720, 510);
  await page.mouse.wheel(180, 0);
  await expect.poll(() => card.evaluate(el => el.style.transform)).not.toBe(beforeWheel);
  const beforeDrag = await card.evaluate(el => el.style.transform);
  await page.mouse.move(720, 480);
  await page.mouse.down();
  await page.mouse.move(950, 480, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator('.project-dialog')).not.toBeVisible();
  await expect.poll(() => card.evaluate(el => el.style.transform)).not.toBe(beforeDrag);
  const scrollBefore = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 100);
  await page.locator('.hero').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(150);
  const offscreen = await card.evaluate(el => el.style.transform);
  await page.waitForTimeout(150);
  expect(await card.evaluate(el => el.style.transform)).toBe(offscreen);
});

test('reduced motion provides seven static previews and live preference changes are supported', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, 390, 844);
  await expect(page.locator('.sea-gallery')).toBeHidden();
  await expect(page.locator('.project-open img')).toHaveCount(7);
  await expect(page.locator('.project-open img').first()).toBeVisible();
  await expect(page.locator('.sea-gallery video')).toHaveCount(0);
  await page.locator('.project-open').last().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#reel-project-name')).toHaveText('Veyra');
  await page.keyboard.press('Escape');
  await expect(page.locator('.project-open').last()).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.sea-gallery')).toBeVisible();
});

test('gallery follows the theme without replacing cards and project links remain usable', async ({ page }) => {
  await open(page);
  await expect(page.locator('.sea-gallery')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.locator('.ring-card').first().evaluate(card => { window.themeTestCard = card; window.themeTestImage = card.querySelector('img').src; });
  await page.locator('#sobre-mi').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY - 84));
  await page.locator('.floating-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#proyectos').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY));
  await expect(page.locator('.sea-gallery')).toHaveCSS('background-color', 'rgb(9, 9, 11)');
  expect(await page.locator('.ring-card').first().evaluate(card => card === window.themeTestCard && card.querySelector('img').src === window.themeTestImage)).toBe(true);
  await page.locator('.floating-theme-toggle').click();
  await expect(page.locator('.sea-gallery')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.locator('.project-open').first().click();
  await expect(page.locator('#reel-project-name')).toHaveText('Harmonix');
  await expect(page.locator('.dialog-links a').first()).toHaveAttribute('href', /^https:\/\//);
});
