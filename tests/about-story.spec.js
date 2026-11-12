import { test, expect } from '@playwright/test';

test.use({ channel: 'chrome' });
import { SITE_URL as url } from './support/site.js';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
});

async function openAbout(page) {
  await page.goto(`${url}/#sobre-mi`);
  await expect(page.locator('app-about-story')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.about-story')).toHaveClass(/is-enhanced/);
  await page.waitForTimeout(350);
}
async function progress(page, value) {
  await page.locator('.pin-spacer-about-narrative').evaluate((spacer, value) => {
    const stage = spacer.querySelector('.story-stage');
    const start = spacer.getBoundingClientRect().top + scrollY - 84;
    scrollTo(0, start + (spacer.offsetHeight - stage.offsetHeight) * value);
  }, value);
  // Allow the smoothed scroll timeline to settle before checking its target state.
  await page.waitForTimeout(850);
}

test('About replaces three centered phrases one at a time and reverses with scroll', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAbout(page);
  await page.locator('.language-choice[lang="en"]').click();
  const narrative = page.locator('.story-copy');
  const box = await narrative.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(750);
  expect(box.width).toBeLessThanOrEqual(850);
  expect(box.x + box.width / 2).toBeCloseTo(720, 0);
  const font = await page.locator('.story-passage').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
  expect(font).toBeGreaterThanOrEqual(36);
  expect(font).toBeLessThanOrEqual(48);
  expect((await page.locator('.portrait').boundingBox()).y).toBeGreaterThan(900);
  await expect(narrative).toContainText('I TURN IDEAS INTO DIGITAL EXPERIENCES.');
  await expect(narrative).toContainText('FOR ME, TECHNOLOGY IS MORE THAN CODE.');

  const phraseState = () => page.locator('.story-passage').evaluateAll(passages => passages.map(passage => ({
    opacity: Number.parseFloat(getComputedStyle(passage).opacity),
    visibility: getComputedStyle(passage).visibility,
    y: new DOMMatrixReadOnly(getComputedStyle(passage).transform).m42,
  })));
  const expectOnly = async index => {
    const states = await phraseState();
    states.forEach((state, current) => {
      expect(state.visibility).toBe(current === index ? 'visible' : 'hidden');
      expect(state.opacity).toBe(current === index ? 1 : 0);
    });
    expect(Math.abs(states[index].y)).toBeLessThan(.2);
    await expect(page.locator('.story-passage').nth(index)).toHaveCSS('filter', 'blur(0px)');
  };

  await progress(page, .12);
  await expectOnly(0);
  expect((await page.locator('.story-stage').boundingBox()).y).toBeCloseTo(84, 0);
  await progress(page, .48);
  await expectOnly(1);
  await progress(page, .86);
  await expectOnly(2);
  await progress(page, .48);
  await expectOnly(1);
  await progress(page, .28);
  const incoming = page.locator('.story-passage').nth(1);
  const intermediate = await incoming.evaluate(element => ({
    opacity: Number(getComputedStyle(element).opacity),
    blur: parseFloat(getComputedStyle(element).filter.slice(5)),
  }));
  expect(intermediate.opacity).toBeGreaterThan(0);
  expect(intermediate.opacity).toBeLessThan(1);
  expect(intermediate.blur).toBeGreaterThan(0);
  expect(intermediate.blur).toBeLessThan(10);
  await progress(page, .12);
  await expectOnly(0);
  expect(new Set(await page.locator('.story-word').evaluateAll(words => words.map(word => getComputedStyle(word).color))))
    .toEqual(new Set(['rgb(32, 32, 32)']));
  expect(errors).toEqual([]);
});

test('the portrait leads the editorial scene and the connected transition reveals the lime block last', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAbout(page);
  await progress(page, 1.15);
  expect((await page.locator('.story-stage').boundingBox()).y).toBeLessThan(84);
  const intermediate = await page.locator('.portrait-mask').evaluate(e => getComputedStyle(e).clipPath);
  expect(intermediate).not.toBe('inset(100% 0px 0px)');
  await page.locator('.editorial-scene').evaluate(e => scrollTo(0, e.getBoundingClientRect().top + scrollY - 100));
  await page.waitForTimeout(200);
  const portrait = await page.locator('.portrait img').boundingBox();
  const project = await page.locator('.process img').boundingBox();
  expect(portrait.x).toBeLessThan(project.x);
  expect(portrait.width).toBeGreaterThan(project.width);
  await expect(page.locator('.story-copy')).toHaveCSS('opacity', '0');
  await expect(page.locator('.portrait-mask')).toHaveCSS('clip-path', 'inset(0% 0px 0px)');
  await expect(page.locator('.process')).toHaveCSS('opacity', '1');
  await expect(page.locator('.manifesto')).toHaveCSS('clip-path', 'inset(0% 0px 0px)');
  await expect(page.locator('.manifesto')).toHaveCSS('background-color', 'rgb(226, 244, 166)');
  expect(await page.locator('.portrait img').getAttribute('src')).toContain('retrato');
  expect(await page.locator('.process img').getAttribute('src')).toContain('proceso');
  await page.locator('.nav-link[href="#proyectos"]').click();
  await expect(page.locator('#proyectos')).toBeInViewport();
  await page.locator('.nav-link[href="#sobre-mi"]').click();
  await expect(page.locator('.story-copy')).toBeInViewport();
  await expect(page.locator('.story-copy')).toHaveCSS('opacity', '1');
});

test('technology rows move in opposite directions and pause without duplicating accessible content', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openAbout(page);
  await page.locator('.technology-marquee').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const positions = () => page.locator('.marquee-track').evaluateAll(es => es.map(e => e.getBoundingClientRect().x));
  const start = await positions(); await page.waitForTimeout(150); const moved = await positions();
  expect(moved[0]).toBeLessThan(start[0]); expect(moved[1]).toBeGreaterThan(start[1]);
  await expect(page.locator('.marquee-group:not([aria-hidden]) .technology-pill:not([aria-hidden])')).toHaveCount(15);
  for (const group of await page.locator('.marquee-group:not([aria-hidden])').all()) {
    const gaps = await group.evaluate(element => Array.from(element.children).slice(1).map((child, index) =>
      child.getBoundingClientRect().left - element.children[index].getBoundingClientRect().right));
    gaps.forEach(gap => expect(gap).toBeCloseTo(12, 0));
  }
  for (const group of await page.locator('.marquee-group:not([aria-hidden])').all()) expect((await group.boundingBox()).width).toBeGreaterThanOrEqual(1919.9);
  await page.locator('.marquee-toggle').click(); const paused = await positions();
  await page.waitForTimeout(200); expect(await positions()).toEqual(paused);
  await page.locator('.marquee-toggle').click(); await page.waitForTimeout(150); expect(await positions()).not.toEqual(paused);
  expect(await page.locator('.technology-pill:not([aria-hidden]) .technology-symbol svg').count()).toBe(4);
  expect(await page.locator('.technology-pill img').evaluateAll(es => es.every(e => e.complete && e.naturalWidth > 0))).toBe(true);
});

for (const [width, height] of [[320, 640], [390, 844], [768, 900], [864, 531], [1024, 768], [1440, 500]]) {
  test(`narrative and editorial composition fit ${width} x ${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await openAbout(page);
    await progress(page, .5);
    const passages = page.locator('.story-passage');
    await expect(passages.nth(0)).toHaveCSS('visibility', 'hidden');
    await expect(passages.nth(1)).toHaveCSS('visibility', 'visible');
    await expect(passages.nth(2)).toHaveCSS('visibility', 'hidden');
    const box = await page.locator('.story-copy').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y).toBeGreaterThanOrEqual(84); expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
    await page.locator('.manifesto').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width < 641) {
      const portrait = await page.locator('.portrait').boundingBox(); const project = await page.locator('.process').boundingBox();
      expect(portrait.y).toBeLessThan(project.y);
    }
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(350);
    await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(1);
    await progress(page, .25); expect((await page.locator('.story-stage').boundingBox()).y).toBeCloseTo(84, 0);
  });
}

test('the horizon bloom becomes static with reduced motion and leaves all content readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${url}/#sobre-mi`);
  await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(0);
  await expect(page.locator('app-about-horizon-bloom canvas')).toHaveCount(1);
  await expect(page.locator('.horizon-canvas')).toHaveClass(/is-ready/);
  for (const word of await page.locator('.story-word').all()) await expect(word).toHaveCSS('color', 'rgb(32, 32, 32)');
  await expect(page.locator('.portrait-mask')).toHaveCSS('clip-path', 'none');
  await expect(page.locator('.process')).toHaveCSS('opacity', '1');
  await expect(page.locator('.marquee-toggle')).toBeHidden();
  await expect(page.locator('.marquee-group:not([aria-hidden]) .technology-pill')).toHaveCount(15);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' }); await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(0);
  await expect(page.locator('.story-copy')).toHaveCSS('opacity', '1');
  await expect(page.locator('.manifesto')).toHaveCSS('clip-path', 'none');
});

for (const width of [1440, 390]) {
  test(`About translates all phrases without restarting the scroll scene at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openAbout(page);
    const story = page.locator('.about-story');
    const passages = page.locator('.story-passage');
    await expect(story).toHaveAttribute('lang', 'es');
    await expect(story).toHaveAttribute('aria-label', 'Mi enfoque de la tecnología');
    await expect(passages.nth(0)).toHaveText('TRANSFORMO IDEAS EN EXPERIENCIAS DIGITALES.');
    await expect(passages.nth(1)).toHaveText('PARA MÍ, LA TECNOLOGÍA ES MÁS QUE CÓDIGO.');
    await expect(passages.nth(2)).toHaveText('SE TRATA DE CREAR, EXPLORAR, Y CONSTRUIR ALGO SIGNIFICATIVO.');
    await progress(page, .48);
    await passages.nth(1).evaluate(element => window.aboutPassageBeforeLanguageSwitch = element);
    await page.locator('.language-choice[lang="en"]').click();
    await expect(story).toHaveAttribute('lang', 'en');
    await expect(passages.nth(1)).toHaveText('FOR ME, TECHNOLOGY IS MORE THAN CODE.');
    await expect(passages.nth(1)).toHaveCSS('opacity', '1');
    await expect(passages.nth(1)).toHaveCSS('filter', 'blur(0px)');
    expect(await passages.nth(1).evaluate(element => element === window.aboutPassageBeforeLanguageSwitch)).toBe(true);
    await page.locator('.language-choice[lang="es"]').click();
    await expect(passages.nth(1)).toHaveText('PARA MÍ, LA TECNOLOGÍA ES MÁS QUE CÓDIGO.');
    await expect(passages.nth(1)).toHaveCSS('opacity', '1');
    await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(1);
    await progress(page, .86);
    await expect(passages.nth(2)).toHaveCSS('opacity', '1');
    const box = await passages.nth(2).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `test-results/about-spanish-${width}.png` });
    await page.reload();
    await expect(story).toHaveAttribute('lang', 'es');
    await expect(passages.first()).toHaveText('TRANSFORMO IDEAS EN EXPERIENCIAS DIGITALES.');
  });
}

test('About translates in reduced motion with all phrases readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${url}/#sobre-mi`);
  await expect(page.locator('.story-passage').first()).toHaveText('TRANSFORMO IDEAS EN EXPERIENCIAS DIGITALES.');
  await page.locator('.language-choice[lang="en"]').click();
  await expect(page.locator('.story-passage').first()).toHaveText('I TURN IDEAS INTO DIGITAL EXPERIENCES.');
  await expect(page.locator('.pin-spacer-about-narrative')).toHaveCount(0);
  for (const passage of await page.locator('.story-passage').all()) await expect(passage).toHaveCSS('visibility', 'visible');
});
