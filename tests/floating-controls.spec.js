import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

async function skipIntro(page) {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
}

for (const [width, height] of [[390, 844], [768, 1024], [1042, 531], [1250, 632], [1440, 900]]) {
  test(`Home centers the lime scroll arrow and About anchors it left at ${width}px`, async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width, height });
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    const cue = page.locator('.floating-scroll-cue');
    await expect(cue).toHaveClass(/at-home/);
    await expect(page.locator('.scroll-arrow')).toHaveCSS('color', 'rgb(226, 244, 166)');
    const home = await cue.evaluate(el => el.getBoundingClientRect().toJSON());
    expect(home.x + home.width / 2).toBeCloseTo(width / 2, 0);
    const homeEdge = await page.locator('#sobre-mi').evaluate(section => section.getBoundingClientRect().top);
    expect(home.y + home.height).toBeLessThanOrEqual(homeEdge);
    if (home.y + home.height > height) await expect(cue).toBeHidden();
    for (const content of await page.locator('.hero .specialty, .hero .hero-link, #hero-title').all()) {
      const box = await content.boundingBox();
      const overlaps = home.x < box.x + box.width && home.x + home.width > box.x && home.y < box.y + box.height && home.y + home.height > box.y;
      expect(overlaps, 'The centered cue must not cover Hero text or links').toBe(false);
    }
    // The cue leaves Home with its layout slot; it cannot float over incoming content.
    await page.evaluate(() => scrollTo({ top: 100, behavior: 'instant' }));
    await expect(cue).not.toHaveClass(/at-home/);
    await page.locator('#sobre-mi').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY - 84));
    await expect(cue).toBeVisible();
    await expect(cue).not.toHaveClass(/at-home/);
    await expect.poll(async () => (await cue.boundingBox()).x).toBeLessThan(width / 4);
    const about = await cue.boundingBox();
    expect(height - about.y - about.height).toBeCloseTo(44, 0);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(cue).toHaveClass(/at-home/);
    await expect(page.locator('.scroll-arrow')).toHaveCSS('color', 'rgb(226, 244, 166)');
    const restored = await cue.boundingBox();
    expect(restored.x + restored.width / 2).toBeCloseTo(width / 2, 0);
  });
}

for (const [width, height] of [[1042, 531], [1440, 900], [390, 844]]) {
  test(`floating controls stay anchored through Projects and Experience at ${width}px`, async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width, height });
    await page.goto(`${SITE_URL}/#proyectos`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('#proyectos').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY));
    const cue = page.locator('.floating-scroll-cue');
    const initial = await cue.evaluate(el => el.getBoundingClientRect().toJSON());
    const toggle = page.locator('.floating-theme-toggle');
    const initialTheme = await toggle.evaluate(el => el.getBoundingClientRect().toJSON());
    const expectAnchored = async () => {
      const themeBox = await toggle.evaluate(el => el.getBoundingClientRect().toJSON());
      expect(themeBox.x).toBeCloseTo(initialTheme.x, 0);
      expect(themeBox.y).toBeCloseTo(initialTheme.y, 0);
      expect(height - themeBox.y - themeBox.height).toBeCloseTo(44, 0);
    };
    for (const fraction of [0, .2, .5, .8, .3, 0]) {
      await page.locator('.project-showcase').evaluate((section, fraction) => {
        scrollTo(0, section.getBoundingClientRect().top + scrollY + section.clientHeight * fraction);
      }, fraction);
      // Include the delayed collision check after scrubbed animations settle.
      await page.waitForTimeout(950);
      const box = await cue.evaluate(el => el.getBoundingClientRect().toJSON());
      expect(box.x).toBeCloseTo(initial.x, 0);
      expect(box.y).toBeCloseTo(initial.y, 0);
      expect(height - box.y - box.height).toBeCloseTo(44, 0);
      await expect(cue).toHaveCSS('transform', 'none');
      await expectAnchored();
    }
    await page.locator('#experiencia').scrollIntoViewIfNeeded();
    if (height < 560) {
      // Short viewports intentionally use the existing static reading layout.
      await page.locator('.experience-content').scrollIntoViewIfNeeded();
      await page.waitForTimeout(950);
      await expectAnchored();
      await expect(page.locator('.scroll-arrow')).toHaveCSS('animation-name', /scroll-invitation$/);
      return;
    }
    await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
    for (const fraction of [.3, .5, .7, .3]) {
      await page.locator('.experience-content').evaluate((content, fraction) => {
        const height = document.querySelector('.experience-grid').clientHeight;
        scrollTo(0, content.getBoundingClientRect().top + scrollY + height * 8.5 * fraction);
      }, fraction);
      await page.waitForTimeout(950);
      await expectAnchored();
      const reading = await page.locator('.journey-mode').boundingBox();
      const themeBox = await toggle.evaluate(el => el.getBoundingClientRect().toJSON());
      expect(themeBox.x < reading.x + reading.width && themeBox.x + themeBox.width > reading.x && themeBox.y < reading.y + reading.height && themeBox.y + themeBox.height > reading.y).toBe(false);
      const bottomRule = await page.locator('.experience-grid .grid-rule').last().boundingBox();
      for (const control of [cue, toggle]) {
        const box = await control.evaluate(el => el.getBoundingClientRect().toJSON());
        expect(bottomRule.y - box.y - box.height).toBeGreaterThanOrEqual(11);
      }
    }
    await expect(page.locator('.scroll-arrow')).toHaveCSS('animation-name', /scroll-invitation$/);
  });
}

for (const [width, height] of [[375, 667], [390, 844], [393, 852], [430, 932], [768, 1024], [1440, 900]]) {
  test(`themes preserve brand, layout and cinematic nodes at ${width}px`, async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${SITE_URL}/#sobre-mi`);
    await page.evaluate(() => document.fonts.ready);
    const toggle = page.locator('.floating-theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.sun-icon')).toBeVisible();
    await expect(page.locator('.moon-icon')).toBeHidden();
    await page.locator('.story-stage').scrollIntoViewIfNeeded();
    await expect(page.locator('.horizon-canvas')).toHaveClass(/is-ready/);
    await expect(page.locator('.horizon-canvas canvas')).toHaveCount(1);
    await page.waitForTimeout(400);
    const before = await page.locator('.story-stage').boundingBox();
    await page.evaluate(() => {
      window.themeNodes = [...document.querySelectorAll('canvas')];
      window.themePinCount = document.querySelectorAll('.pin-spacer').length;
      window.themeImage = document.querySelector('.portrait img').src;
      window.themeScroll = scrollY;
    });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.moon-icon')).toBeVisible();
    await expect(page.locator('.sun-icon')).toBeHidden();
    await expect(page.locator('.story-stage')).toHaveCSS('background-color', 'rgb(9, 9, 11)');
    await expect(page.locator('.story-word').first()).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.project-showcase')).toHaveCSS('background-color', 'rgb(90, 78, 255)');
    await expect(page.locator('.manifesto')).toHaveCSS('color', 'rgb(33, 33, 33)');
    const after = await page.locator('.story-stage').boundingBox();
    for (const key of ['x', 'y', 'width', 'height']) expect(after[key]).toBeCloseTo(before[key], 0);
    expect(await page.evaluate(() => window.themeNodes.every(canvas => canvas.isConnected) && window.themePinCount === document.querySelectorAll('.pin-spacer').length && window.themeImage === document.querySelector('.portrait img').src && Math.abs(scrollY - window.themeScroll) < 1)).toBe(true);
    for (const selector of ['.floating-scroll-cue', '.floating-theme-toggle']) {
      const box = await page.locator(selector).evaluate(el => el.getBoundingClientRect().toJSON());
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y + box.height).toBeLessThanOrEqual(height - 10);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await page.locator('.project-open').first().click();
    await expect(page.locator('.project-dialog')).toHaveCSS('background-color', 'rgb(9, 9, 11)');
    await page.keyboard.press('Escape');
    await expect(page.locator('.project-dialog')).not.toBeVisible();
    // The theme intentionally leaves the tab order on boundaries/collisions.
    // Activate it in a clear surface, as a keyboard user would.
    await page.locator('#sobre-mi').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY - 84));
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.story-stage')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.locator('.language-choice[lang="en"]').click();
    await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('theme persists on reload and the scroll cue points up at the page end', async ({ page }) => {
  await skipIntro(page);
  await page.goto(SITE_URL);
  const cue = page.locator('.floating-scroll-cue');
  const toggle = page.locator('.floating-theme-toggle');
  await expect(cue).toBeVisible();
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  if (await page.locator('.skip-intro').count()) await page.locator('.skip-intro').click();
  await expect(toggle).toBeVisible();
  await expect(page.locator('.moon-icon')).toBeVisible();
  await cue.click();
  await expect(page.locator('.story-copy')).toBeInViewport();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(cue).toBeVisible();
  await expect(cue).toHaveClass(/points-up/);
  await expect(cue).toHaveAttribute('tabindex', '0');
  await expect(toggle).toBeVisible();
  await page.evaluate(() => scrollTo(0, 0));
  await expect(cue).toBeVisible();
});

test('saved dark theme is applied before Angular is loaded', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'));
  await page.route('**/src/main.ts*', route => route.abort());
  await page.route('**/assets/index-*.js', route => route.abort());
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(9, 9, 11)');
  await expect(page.locator('app-floating-controls')).toHaveCount(0);
});

test('controls respect reduced motion and work when localStorage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage disabled'); };
    Storage.prototype.setItem = () => { throw new Error('Storage disabled'); };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(SITE_URL);
  await expect(page.locator('.scroll-arrow')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.floating-theme-toggle')).toHaveCSS('transition-duration', '0s');
  await page.locator('.floating-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('.floating-scroll-cue').click();
  await expect(page.locator('.story-copy')).toBeInViewport();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const cue = page.locator('.floating-scroll-cue');
  await expect(cue).toHaveClass(/points-up/);
  await cue.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.return-veil')).toHaveCSS('opacity', '0');
  await expect(page.locator('#inicio')).toBeFocused();
});

test('theme changes keep the Experience canvas and reading controls intact', async ({ page }) => {
  await skipIntro(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${SITE_URL}/#experiencia`);
  await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
  await page.locator('.experience-content').evaluate(content => {
    const height = document.querySelector('.experience-grid').clientHeight;
    scrollTo(0, content.getBoundingClientRect().top + scrollY + height * 8.5 * 3 / 10.3);
  });
  const information = page.locator('[data-company="bcp"] .entry-information');
  await expect(information).toHaveCSS('opacity', '1');
  const reading = await page.locator('.journey-mode').boundingBox();
  await expect.poll(async () => {
    const button = await page.locator('.floating-theme-toggle').boundingBox();
    return button.x < reading.x + reading.width && button.x + button.width > reading.x && button.y < reading.y + reading.height && button.y + button.height > reading.y;
  }).toBe(false);
  const before = await information.boundingBox();
  await page.evaluate(() => { window.valleyNode = document.querySelector('app-experience-valley canvas'); window.journeyScroll = scrollY; });
  await page.locator('.floating-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(information).toHaveCSS('opacity', '1');
  const after = await information.boundingBox();
  expect(after.y).toBeCloseTo(before.y, 0);
  expect(await page.evaluate(() => window.valleyNode === document.querySelector('app-experience-valley canvas') && Math.abs(scrollY - window.journeyScroll) < 1)).toBe(true);
});

for (const [width, height] of [[390, 844], [1440, 900]]) {
  test(`scroll cue remains available in Projects and Experience at ${width}px`, async ({ page }) => {
    await skipIntro(page);
    await page.setViewportSize({ width, height });
    await page.goto(`${SITE_URL}/#proyectos`);
    await page.locator('.sea-gallery').waitFor();
    await page.locator('.sea-gallery').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - innerHeight * .55));
    const cue = page.locator('.floating-scroll-cue');
    await expect(cue).toBeVisible();
    await expect(cue).not.toHaveClass(/at-home/);
    await page.waitForTimeout(2200);
    await expect(cue).toBeVisible();
    const before = await page.evaluate(() => scrollY);
    await cue.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
    await page.locator('.experience-content').evaluate(content => {
      const height = document.querySelector('.experience-grid').clientHeight;
      scrollTo(0, content.getBoundingClientRect().top + scrollY + height * 8.5 * 3 / 10.3);
    });
    await expect(page.locator('[data-company="bcp"] .entry-information')).toHaveCSS('opacity', '1');
    await expect(cue).toBeVisible();
    await expect(cue).toHaveAttribute('tabindex', '0');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(cue).toBeVisible();
    await expect(cue).toHaveClass(/points-up/);
    await expect(cue).toHaveAccessibleName('Volver al inicio');
    await expect(cue.locator('.scroll-direction')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
    const bottom = await page.evaluate(() => scrollY);
    await page.evaluate(() => { window.returnCanvas = document.querySelector('app-experience-valley canvas'); });
    await cue.focus();
    await page.keyboard.press('Enter');
    await expect(cue).toBeDisabled();
    await expect.poll(() => page.locator('.return-veil').evaluate(element => parseFloat(getComputedStyle(element).backdropFilter.replace(/[^\d.]/g, '')))).toBeGreaterThan(5);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(bottom - 100);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(cue).toBeEnabled();
    await expect(page.locator('.return-veil')).toHaveCSS('opacity', '0');
    await expect(page.locator('#inicio')).toBeFocused();
    await expect(cue).not.toHaveClass(/points-up/);
    expect(await page.evaluate(() => window.returnCanvas === document.querySelector('app-experience-valley canvas'))).toBe(true);
  });
}

for (const [width, height] of [[1100, 762], [1440, 900]]) {
  test(`both controls stay visible above the technology rule at ${width}px`, async ({ page }, testInfo) => {
    await skipIntro(page);
    await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'));
    await page.setViewportSize({ width, height });
    await page.goto(`${SITE_URL}/#sobre-mi`);
    const marquee = page.locator('.technology-marquee');
    await marquee.waitFor();
    await page.evaluate(() => document.fonts.ready);
    const position = async () => {
      await marquee.evaluate(element => scrollTo(0, element.getBoundingClientRect().bottom + scrollY - innerHeight + 4));
    };
    await position();
    const cue = page.locator('.floating-scroll-cue'), theme = page.locator('.floating-theme-toggle');
    await expect(cue).toBeVisible();
    await expect(theme).toBeVisible();
    const line = await marquee.locator('.grid-rule').last().boundingBox();
    for (const control of [cue, theme]) {
      const box = await control.boundingBox();
      expect(line.y - box.y - box.height).toBeGreaterThan(0);
      expect(line.y - box.y - box.height).toBeLessThan(12);
    }
    await page.screenshot({ path: testInfo.outputPath('controls-above-technology-rule.png') });
    // Decorative lines are not obstacles, even when they cross the controls.
    const themeBox = await theme.boundingBox();
    await marquee.locator('.grid-rule').last().evaluate((element, y) => scrollTo(0, element.getBoundingClientRect().top + scrollY - y), themeBox.y + themeBox.height / 2);
    await expect(cue).toBeVisible();
    await expect(theme).toBeVisible();
    await position();
    await expect(cue).toBeVisible();
    await expect(theme).toBeVisible();
  });
}

for (const [width, height] of [[1108, 758], [1440, 900]]) {
  test(`Projects utilities remain visible across every editorial line at ${width}px`, async ({ page }, testInfo) => {
    await skipIntro(page);
    await page.setViewportSize({ width, height });
    await page.goto(`${SITE_URL}/#proyectos`);
    await page.locator('.project-index').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const cue = page.locator('.floating-scroll-cue'), theme = page.locator('.floating-theme-toggle');
    const rect = await theme.evaluate(el => el.getBoundingClientRect().toJSON());
    const center = rect.y + rect.height / 2;
    const xs = [];
    for (const language of ['es', 'en']) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      // Put each rule directly through both control hit areas, including the
      // exact navigation rule shown in the bug report.
      for (let index = 0; index < 3; index++) {
        await page.locator('.project-catalogue .grid-rule').nth(index).evaluate((el, y) => scrollTo(0, el.getBoundingClientRect().top + scrollY - y), center);
        // The first rule can be above Projects; use only the two navigation rules
        // to assert the post-Hero fixed controls.
        if (index === 0) continue;
        await expect(cue).toBeVisible();
        await expect(theme).toBeVisible();
        await expect(cue).toHaveAttribute('tabindex', '0');
        await expect(theme).toHaveAttribute('tabindex', '0');
        xs.push(await cue.evaluate(el => el.getBoundingClientRect().x));
      }
    }
    expect(new Set(xs).size).toBe(1);
    await page.screenshot({ path: testInfo.outputPath('projects-controls-on-editorial-rule.png') });
    await theme.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(theme).toBeVisible();
    await expect(page.locator('.moon-icon')).toBeVisible();
    const before = await page.evaluate(() => scrollY);
    await cue.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
    // Native dialogs still block utilities; they return after dismissal.
    await page.locator('.project-open').first().click();
    await expect(page.locator('.project-dialog')).toBeVisible();
    await expect(theme).toBeHidden();
    await expect(cue).toBeHidden();
    await page.keyboard.press('Escape');
    await page.locator('.project-index').evaluate((el, y) => scrollTo(0, el.getBoundingClientRect().top + scrollY - y), center);
    await expect(cue).toBeVisible();
    await expect(theme).toBeVisible();
  });
}
