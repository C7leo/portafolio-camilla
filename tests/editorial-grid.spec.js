import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });
import { SITE_URL as url } from './support/site.js';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
});

async function navigate(page, section) {
  if (await page.locator('.floating-header').getAttribute('inert') !== null) await page.locator('.floating-scroll-cue').click();
  const menu = page.locator('.menu-toggle');
  if (await menu.isVisible()) await menu.click();
  await page.locator(`.nav-link[href="#${section}"]`).click();
}

for (const [width, height] of [[1440, 900], [768, 900], [390, 844], [864, 531]]) {
  test(`architectural rails share the existing content edges at ${width} x ${height}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.about-story')).toHaveClass(/is-enhanced/);
    const globalGrid = page.locator('app-editorial-grid.is-viewport');
    const rails = await globalGrid.locator('.grid-rail').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, right: rect.right, top: rect.top, bottom: rect.bottom };
    }));
    expect(rails[0].top).toBe(0);
    expect(rails[0].bottom).toBe(height);
    expect(rails[1].top).toBe(0);
    expect(rails[1].bottom).toBe(height);
    const heroRule = await page.locator('app-hero .grid-rule').last().boundingBox();
    expect(heroRule.x).toBe(0);
    expect(heroRule.width).toBe(width);
    expect(heroRule.height).toBe(1);
    await expect(page.locator('.hero-details')).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const grids = page.locator('main app-editorial-grid');
    await expect(grids).toHaveCount(7);
    const dimensions = await grids.evaluateAll(elements => elements.flatMap(element => {
      const crossing = Array.from(element.querySelectorAll('.grid-crossings')).map(node => node.getBoundingClientRect()).find(rect => rect.width > 0);
      return crossing ? [{ left: crossing.x, right: crossing.right, pointer: getComputedStyle(element).pointerEvents, hidden: element.getAttribute('aria-hidden') }] : [];
    }));
    const inset = width <= 640 ? 24 : width <= 1050 ? 40 : Math.max(56, (width - 1200) / 2);
    expect(rails[0].x).toBeCloseTo(inset, 0);
    expect(rails[1].right).toBeCloseTo(width - inset, 0);
    for (const grid of dimensions) {
      expect(grid.left).toBeCloseTo(inset, 0);
      expect(grid.right).toBeCloseTo(width - inset, 0);
      expect(grid.pointer).toBe('none');
      expect(grid.hidden).toBe('true');
    }
    // The decorative layer must never change the existing composition's geometry.
    const geometry = () => page.locator('main section, main h1, main h2, main figure').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return [box.x, box.width, box.height];
    }));
    const before = await geometry();
    await grids.evaluateAll(elements => elements.forEach(element => element.style.display = 'none'));
    expect(await geometry()).toEqual(before);
    await grids.evaluateAll(elements => elements.forEach(element => element.style.removeProperty('display')));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440) await page.screenshot({ path: 'test-results/editorial-hero.png' });
    await navigate(page, 'sobre-mi');
    await expect(page.locator('.story-copy')).toBeInViewport();
    const rule = page.locator('.story-stage .grid-rule').first();
    await expect(rule).toHaveClass(/is-seen/);
    await navigate(page, 'experiencia');
    await expect(page.locator('.experience-grid .grid-rule').first()).toHaveClass(/is-seen/);
    await navigate(page, 'sobre-mi');
    await expect(rule).toHaveClass(/is-seen/);
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    const footerRules = page.locator('.site-footer .grid-rule');
    await expect(footerRules).toHaveCount(2);
    const footerContent = await page.locator('.footer-content').boundingBox();
    const footerLogo = await page.locator('.site-footer .brand-logo').boundingBox();
    const footerLines = await footerRules.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    for (const line of footerLines) {
      expect(line.x).toBe(0);
      expect(line.width).toBe(width);
      expect(line.height).toBe(1);
    }
    expect(footerLines[0].y).toBeLessThan(footerLogo.y);
    expect(footerLines[1].y).toBeGreaterThan(footerContent.y + footerContent.height);
    if (width === 1440) {
      await expect.poll(() => footerRules.last().evaluate(element => getComputedStyle(element, '::before').opacity)).toBe('1');
      await page.screenshot({ path: 'test-results/editorial-footer.png' });
    }
    expect(errors).toEqual([]);
  });
}

test('grid follows pinned narrative, stays outside its text and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${url}/#sobre-mi`);
  await expect(page.locator('.about-story')).toHaveClass(/is-enhanced/);
  await page.locator('.pin-spacer-about-narrative').evaluate(spacer => {
    const stage = spacer.querySelector('.story-stage');
    scrollTo(0, spacer.getBoundingClientRect().top + scrollY - 84 + (spacer.offsetHeight - stage.offsetHeight) * .48);
  });
  await expect(page.locator('.story-passage').nth(1)).toHaveCSS('filter', 'blur(0px)');
  const stage = await page.locator('.story-stage').boundingBox();
  const overlay = await page.locator('.story-stage app-editorial-grid').boundingBox();
  expect(overlay.y).toBeCloseTo(stage.y, 0);
  const rail = await page.locator('.is-viewport .grid-rail.left').boundingBox();
  expect(rail.y).toBe(0);
  expect(rail.height).toBe(900);
  const text = await page.locator('.story-passage').nth(1).boundingBox();
  const rules = await page.locator('.story-stage .grid-rule').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().y));
  expect(rules[0]).toBeLessThan(text.y);
  expect(rules[1]).toBeGreaterThan(text.y + text.height);
  await page.screenshot({ path: 'test-results/editorial-about.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(0);
  expect(await page.locator('.grid-node').evaluateAll(elements => elements.every(element => getComputedStyle(element).transitionDuration === '0s'))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.story-stage .grid-node.right').first()).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('project controls remain interactive and Contact closes the shared rails', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await page.locator('.hero-link.primary').click();
  await expect(page.locator('.showcase-header')).toBeInViewport();
  await page.locator('.project-open').first().click();
  await expect(page.locator('.project-dialog')).toBeVisible();
  await page.locator('.dialog-close').click();
  await expect(page.locator('.project-dialog')).not.toBeVisible();
  await page.locator('.contact').click();
  await expect(page.locator('.site-footer')).toBeInViewport();
  const closing = page.locator('#contacto .grid-rule').last();
  await expect(closing).toHaveClass(/is-seen/);
  const rule = await closing.boundingBox();
  const content = await page.locator('.footer-content').boundingBox();
  expect(rule.y).toBeCloseTo(content.y + content.height + 24, 0);
  await page.screenshot({ path: 'test-results/editorial-contact.png' });
  await page.goto(`${url}/#proyectos/harmonix`);
  await expect(page.locator('.project-detail')).toBeVisible();
  await expect(page.locator('#proyectos > app-editorial-grid')).toBeVisible();
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`Experience opening keeps both horizontal guides through the image reveal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(`${url}/#experiencia`);
    const section = page.locator('#experiencia');
    await expect(section).toHaveAttribute('data-zoom-enabled', '');
    const rules = page.locator('.experience-grid .grid-rule');
    await expect(section.locator('app-editorial-grid')).toHaveCount(1);
    await expect(rules).toHaveCount(2);
    // The sticky scene needs its existing white surface as a blending backdrop.
    await expect(page.locator('.experience-backdrop')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    for (const progress of [.12, .96, 1, 1.01, 1.1, 1.64, 2.12, 1.01, .96]) {
      await section.evaluate((element, progress) => scrollTo(0, element.getBoundingClientRect().top + scrollY + innerHeight * 1.25 * progress), progress);
      await expect.poll(() => rules.evaluateAll(elements => elements.map(element => {
        const box = element.getBoundingClientRect();
        return [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
      }))).toEqual([[0, 84, width, 1], [0, height - 32, width, 1]]);
      for (const rule of await rules.all()) await expect(rule).toHaveClass(/is-seen/);
      await expect(page.locator('.experience-grid app-editorial-grid')).toHaveCSS('visibility', 'visible');
      await expect.poll(() => rules.last().evaluate(element => getComputedStyle(element, '::before').opacity)).toBe('1');
      if (progress > 1) {
        await expect.poll(() => page.locator('.experience-photo').evaluate(element => Math.round(element.getBoundingClientRect().width))).toBe(width);
      }
      await page.screenshot({ path: `test-results/experience-grid-${width}-${progress}.png` });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
