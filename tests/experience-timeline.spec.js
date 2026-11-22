import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [320, 568]]) {
  test(`experience timeline follows the shared layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(`${SITE_URL}/#experiencia`);
    const section = page.locator('#experiencia');
    await expect(section).toHaveCSS('background-color', 'rgb(250, 250, 250)');
    await expect(section.locator('.timeline-entry')).toHaveCount(2);
    await expect(section.locator('.entry-date')).toHaveText(['2026 - BCP', '2025 - BanBif']);
    await expect(section.locator('.material-symbol')).toHaveText(['analytics', 'support_agent']);
    await expect(section.locator('.experience-intro')).toContainText('financiero, combinando análisis');
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector).getBoundingClientRect();
      const nodes = [...document.querySelectorAll('.timeline-node')].map(node => node.getBoundingClientRect());
      return {
        left: rect('.experience-container').left,
        aboutLeft: rect('.about-container').left,
        intro: rect('.experience-introduction').toJSON(),
        timeline: rect('.timeline').toJSON(),
        centers: nodes.map(node => node.left + node.width / 2),
        overflow: document.documentElement.scrollWidth - innerWidth,
        iconLoaded: document.fonts.check('27px "Experience Material Symbols"'),
      };
    });
    expect(layout.left).toBeCloseTo(layout.aboutLeft, 1);
    expect(layout.centers[0]).toBeCloseTo(layout.centers[1], 1);
    expect(layout.overflow).toBeLessThanOrEqual(0);
    expect(layout.iconLoaded).toBe(true);
    if (width <= 640) expect(layout.timeline.top).toBeGreaterThan(layout.intro.bottom);
    else expect(layout.timeline.left).toBeGreaterThan(layout.intro.right);
  });
}

test('experience remains readable in dark theme and switches language', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    sessionStorage.setItem('camilla-cinematic-intro-seen', '1');
    localStorage.setItem('portfolio-theme', 'dark');
  });
  await page.goto(`${SITE_URL}/#experiencia`);
  const section = page.locator('#experiencia');
  await expect(section).toHaveCSS('background-color', 'rgba(224, 224, 224, 0.15)');
  await expect(section.locator('h3').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.locator('.language-choice[lang="en"]').click();
  await expect(section.locator('h3').first()).toHaveText('Software Engineering Intern');
  await expect(section.locator('.experience-intro')).toContainText('financial sector, combining');
});

test('theme toggle updates the inactive track and node while preserving scroll activation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    sessionStorage.setItem('camilla-cinematic-intro-seen', '1');
    localStorage.setItem('portfolio-theme', 'light');
  });
  await page.goto(SITE_URL);
  await page.locator('.home-theme').click();
  const section = page.locator('#experiencia');
  const node = section.locator('[data-company="banbif"] .timeline-node');
  const positions = await section.evaluate(element => {
    const entries = [...element.querySelectorAll('.timeline-entry')];
    const center = entry => entry.getBoundingClientRect().top + scrollY + entry.querySelector('.timeline-node').offsetHeight / 2;
    return { start: center(entries[0]) - innerHeight * .82, end: center(entries[1]) - innerHeight * .82 };
  });
  await page.evaluate(y => window.scrollTo({ top: y + 30, behavior: 'instant' }), positions.end);
  await expect(node).toHaveCSS('background-color', 'rgb(255, 105, 117)');
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), (positions.start + positions.end) / 2);
  await expect(node).toHaveCSS('background-color', 'rgba(224, 224, 224, 0.15)');
  await expect(node.locator('.material-symbol')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect.poll(() => section.locator('.timeline-entry').first().evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe('rgba(224, 224, 224, 0.15)');
  await page.locator('.home-theme').click();
  await expect(node).toHaveCSS('background-color', 'rgb(217, 217, 217)');
  await expect.poll(() => section.locator('.timeline-entry').first().evaluate(el => getComputedStyle(el, '::before').backgroundColor)).toBe('rgb(213, 213, 213)');
});

test('timeline reveals on entry without pinning or hiding content', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(SITE_URL);
  const section = page.locator('#experiencia');
  await section.evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await expect(section).toHaveClass(/is-visible/);
  await section.locator('.timeline-entry').last().evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(section.locator('.timeline-node').last()).toHaveCSS('opacity', '1');
  await expect(section.locator('.entry-information').last()).toBeVisible();
  await expect(section).not.toHaveAttribute('data-journey-enabled');
});

for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
  test(`line follows scroll in both directions at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(SITE_URL);
    const section = page.locator('#experiencia');
    const banbif = section.locator('[data-company="banbif"] .timeline-node');
    const positions = await section.evaluate(element => {
      const entries = [...element.querySelectorAll('.timeline-entry')];
      const center = entry => entry.getBoundingClientRect().top + scrollY + entry.querySelector('.timeline-node').offsetHeight / 2;
      return { start: center(entries[0]) - innerHeight * .82, end: center(entries[1]) - innerHeight * .82 };
    });
    const progress = () => section.evaluate(element => Number(element.style.getPropertyValue('--timeline-progress')));
    const seek = async value => {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), value);
      await page.waitForTimeout(100);
    };
    await seek(positions.start - 30);
    await expect.poll(progress).toBeLessThan(.02);
    await expect(banbif).not.toHaveClass(/is-active/);
    await expect(banbif).toHaveCSS('background-color', 'rgb(217, 217, 217)');
    const samples = [await progress()];
    const firstBefore = await section.locator('.timeline-entry').first().boundingBox();
    await seek(positions.start + (positions.end - positions.start) * .25);
    samples.push(await progress());
    await seek((positions.start + positions.end) / 2);
    await expect.poll(progress).toBeGreaterThan(.45);
    await expect.poll(progress).toBeLessThan(.55);
    await expect(section.locator('.timeline-entry').first()).toHaveClass(/is-visible/);
    await expect(section.locator('.timeline-entry').last()).not.toHaveClass(/is-visible/);
    samples.push(await progress());
    await seek(positions.start + (positions.end - positions.start) * .75);
    samples.push(await progress());
    await seek(positions.end + 30);
    await expect.poll(progress).toBe(1);
    await expect(section.locator('.timeline-entry').last()).toHaveClass(/is-visible/);
    await expect(banbif).toHaveClass(/is-active/);
    await expect(banbif).toHaveCSS('background-color', 'rgb(255, 105, 117)');
    await expect(banbif.locator('.material-symbol')).toHaveCSS('color', 'rgb(255, 255, 255)');
    samples.push(await progress());
    console.log(`timeline ${width}px: ${samples.map(value => value.toFixed(2)).join(', ')}`);
    for (const [index, expected] of [0, .25, .5, .75, 1].entries()) expect(samples[index]).toBeCloseTo(expected, 1);
    const finalScroll = await page.evaluate(() => scrollY);
    await seek((positions.start + positions.end) / 2);
    await expect.poll(progress).toBeLessThan(.55);
    await expect(section.locator('.timeline-entry').last()).toHaveClass(/is-visible/);
    await expect(banbif).not.toHaveClass(/is-active/);
    await expect(banbif).toHaveCSS('background-color', 'rgb(217, 217, 217)');
    const after = await section.locator('.timeline-entry').first().boundingBox();
    const currentScroll = await page.evaluate(() => scrollY);
    expect(after.y + currentScroll).toBeCloseTo(firstBefore.y + positions.start - 30, 0);
    expect(finalScroll).toBeGreaterThan(currentScroll);
    expect(errors).toEqual([]);
  });
}

test('resizing recomputes progress from the new node geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(SITE_URL);
  const section = page.locator('#experiencia');
  await section.evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => section.evaluate(element => {
    const nodes = [...element.querySelectorAll('.timeline-entry')].map(entry => entry.getBoundingClientRect().top + entry.querySelector('.timeline-node').offsetHeight / 2);
    const expected = Math.max(0, Math.min(1, (innerHeight * .82 - nodes[0]) / (nodes[1] - nodes[0])));
    return Math.abs(Number(element.style.getPropertyValue('--timeline-progress')) - expected);
  })).toBeLessThan(.01);
});

test('changing to reduced motion completes the line and shows both entries', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(SITE_URL);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const section = page.locator('#experiencia');
  await expect.poll(() => section.evaluate(element => Number(element.style.getPropertyValue('--timeline-progress')))).toBe(1);
  await expect(section.locator('.timeline-node').last()).toHaveCSS('opacity', '1');
  await expect(section.locator('.timeline-node').last()).toHaveCSS('background-color', 'rgb(255, 105, 117)');
  await expect(section.locator('.timeline-node').last()).toHaveCSS('transition-duration', '0s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(section.locator('.timeline-entry').last()).toHaveClass(/is-visible/);
});

test('smooth navigation keeps the line synchronized without a final scroll jump', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(SITE_URL);
  await page.locator('.nav-link[href="#experiencia"]').click();
  const section = page.locator('#experiencia');
  await expect(section).toHaveClass(/is-visible/);
  await expect.poll(() => section.evaluate(element => Math.abs(element.getBoundingClientRect().top)), { timeout: 10000 }).toBeLessThan(2);
  await page.waitForTimeout(700);
  const state = await section.evaluate(element => {
    const entries = [...element.querySelectorAll('.timeline-entry')];
    const center = entry => entry.getBoundingClientRect().top + entry.querySelector('.timeline-node').offsetHeight / 2;
    const first = center(entries[0]);
    const second = center(entries[1]);
    return { scroll: scrollY, progress: Number(element.style.getPropertyValue('--timeline-progress')), expected: Math.max(0, Math.min(1, (innerHeight * .82 - first) / (second - first))) };
  });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(state.scroll, 0);
  expect(state.progress).toBeCloseTo(state.expected, 2);
  await expect(section.locator('[data-company="banbif"] .timeline-node')).toHaveClass(state.progress >= 1 ? /is-active/ : /timeline-node/);
  if (state.progress < 1) await expect(section.locator('[data-company="banbif"] .timeline-node')).not.toHaveClass(/is-active/);
});

for (const [width, height] of [[1440, 900], [390, 844]]) {
  test(`navigation reveals the section below the header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(SITE_URL);
    if (width <= 1000) await page.locator('.home-menu-toggle').click();
    await page.locator('.nav-link[href="#experiencia"]').click();
    await expect(page).toHaveURL(/#experiencia$/);
    const header = await page.locator('.home-navbar').boundingBox();
    const title = await page.locator('#experience-title').boundingBox();
    expect(title.y).toBeGreaterThanOrEqual(header.y + header.height);
    await expect(page.locator('#experience-title')).toBeInViewport();
  });
}
