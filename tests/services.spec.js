import { test, expect } from '@playwright/test';
import { SITE_URL, WHATSAPP_NUMBER } from './support/site.js';

for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [821, 900], [1024, 900], [1440, 1000]]) {
  test(`Services shares the editorial grid and preserves contact and themes at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(`${SITE_URL}/#servicios`);
    const section = page.locator('#servicios');
    await expect(section).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await section.evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 84));
    await expect(page.locator('.services-intro')).toHaveAttribute('data-motion-state', 'done');
    await expect(page.locator('.nav-link[href="#servicios"]')).toHaveAttribute('aria-current', 'location');
    await expect(section).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(section.locator('h3')).toHaveText(['Desarrollo web', 'Aplicaciones a medida', 'Datos y automatización']);
    await expect(section.locator('.service-number')).toHaveText(['01 / WEB', '02 / SOFTWARE', '03 / DATA']);
    await expect(section.locator('.service-icon svg')).toHaveCount(3);
    await expect(section.locator('.service').first()).toHaveCSS('background-color', 'rgb(90, 78, 255)');
    await expect(section.locator('.service').nth(1)).toHaveCSS('background-color', 'rgb(242, 242, 242)');
    await expect(section.locator('.service').last()).toHaveCSS('border-radius', '16px');
    const layout = await section.evaluate(element => {
      const rect = selector => element.querySelector(selector).getBoundingClientRect().toJSON();
      return {
        container: rect('.container'), grid: rect('.services-grid'), left: rect('.grid-rail.left'), right: rect('.grid-rail.right'),
        meta: rect('.services-meta'), cta: rect('.services-cta'),
        gap: parseFloat(getComputedStyle(element.querySelector('.services-grid')).columnGap),
        items: [...element.querySelectorAll('.service')].map(item => item.getBoundingClientRect().toJSON()),
        overflow: document.documentElement.scrollWidth - innerWidth,
        previous: element.closest('app-services').previousElementSibling.tagName,
        next: element.closest('app-services').nextElementSibling.tagName,
      };
    });
    expect(layout.previous).toBe('APP-PROJECTS');
    expect(layout.next).toBe('APP-EXPERIENCE');
    expect(layout.overflow).toBeLessThanOrEqual(1);
    for (const box of [layout.grid, layout.meta, layout.cta]) {
      expect(box.x).toBeCloseTo(layout.container.x, 0);
      expect(box.width).toBeCloseTo(layout.container.width, 0);
    }
    expect(layout.left.x).toBeCloseTo(layout.container.x, 0);
    expect(layout.right.x + layout.right.width).toBeCloseTo(layout.container.x + layout.container.width, 0);
    if (width > 900) {
      expect(layout.items[0].y).toBeCloseTo(layout.items[2].y, 0);
      expect(layout.items[0].width).toBeCloseTo((layout.container.width - 2 * layout.gap) / 3, 0);
      expect(layout.items[0].height).toBeCloseTo(layout.items[2].height, 0);
    } else if (width > 640) {
      expect(layout.items[0].y).toBeCloseTo(layout.items[1].y, 0);
      expect(layout.items[2].y).toBeGreaterThan(layout.items[0].y + layout.items[0].height);
      expect(layout.items[2].width).toBeCloseTo(layout.container.width, 0);
    } else {
      expect(layout.items[1].y).toBeGreaterThanOrEqual(layout.items[0].y + layout.items[0].height - 1);
      expect(layout.items[2].width).toBeCloseTo(layout.container.width, 0);
    }
    const header = await page.locator('.floating-header').boundingBox();
    expect(header.x).toBeGreaterThanOrEqual(0);
    expect(header.x + header.width).toBeLessThanOrEqual(width);
    const contact = page.locator('.services-contact');
    const url = new URL(await contact.getAttribute('href'));
    expect(url.origin + url.pathname).toBe(`https://wa.me/${WHATSAPP_NUMBER}`);
    expect(url.searchParams.get('text')).toBe('Hola, vi tu portafolio y me gustaría conversar contigo sobre un proyecto de desarrollo web.');
    expect(await contact.getAttribute('href')).toBe(await page.locator('.micro-cta-link').getAttribute('href'));
    await expect(contact).toHaveAttribute('target', '_blank');
    await expect(contact).toHaveAttribute('rel', 'noopener noreferrer');
    expect((await contact.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath('services.png') });
    if (width <= 640) {
      await section.locator('h3').nth(1).evaluate(element => {
        const cue = document.querySelector('.floating-scroll-cue').getBoundingClientRect();
        scrollTo(0, element.getBoundingClientRect().top + scrollY - cue.top - 10);
      });
      await expect(page.locator('.floating-scroll-cue')).toBeHidden();
    }
    // Place a clear editorial gutter under the fixed controls before activating
    // the theme: protected mobile text legitimately hides overlapping utilities.
    await section.locator('.services-grid').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - innerHeight + 60));
    await expect(page.locator('.floating-theme-toggle')).toBeVisible();
    await page.locator('.floating-theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(section).toHaveCSS('background-color', 'rgb(9, 9, 11)');
    await expect(section.locator('.service').first()).toHaveCSS('background-color', 'rgb(90, 78, 255)');
    await expect(section.locator('.service').nth(1)).toHaveCSS('background-color', 'rgb(24, 24, 27)');
    await page.locator('.language-choice[lang="en"]').click();
    await expect(section.locator('h2')).toHaveText('Digital solutions to take your ideas further.');
    await expect(section.locator('h3')).toHaveText(['Web development', 'Custom applications', 'Data and automation']);
    await expect(page.locator('.experience-header .section-index')).toHaveText('05 / EXPERIENCE');
    if (width <= 820) await page.locator('.menu-toggle').click();
    await page.locator('.nav-link[href="#servicios"]').click();
    await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
    await contact.focus();
    await expect(contact).toBeFocused();
    await expect(contact).toBeInViewport();
  });
}

for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`Projects, Services and Experience keep their scroll order with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(`${SITE_URL}/#servicios`);
    const services = page.locator('#servicios');
    await services.evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 84));
    await expect(page.locator('.services-intro')).toHaveAttribute('data-motion-state', 'done');
    if (reducedMotion === 'reduce') {
      await expect(services.locator('.service[data-motion-state="done"]')).toHaveCount(3);
      await services.locator('.service').first().hover();
      await expect(services.locator('.service').first()).toHaveCSS('transform', 'none');
    }
    expect(await page.locator('app-services').evaluate(element => element.parentElement.classList.contains('pin-spacer'))).toBe(false);
    for (const edge of ['top', 'bottom']) {
      const boundary = await services.evaluate((element, edge) => element.getBoundingClientRect()[edge] + scrollY, edge);
      let previous;
      for (const offset of [-4, 0, 4, 0, -4]) {
        await page.evaluate(y => scrollTo(0, y - innerHeight / 2), boundary + offset);
        await page.waitForTimeout(80);
        const current = await services.evaluate(element => ({ y: element.getBoundingClientRect().y, scroll: scrollY }));
        if (previous) expect(Math.abs(current.y - previous.y + current.scroll - previous.scroll)).toBeLessThan(2);
        previous = current;
      }
    }
    await page.locator('#experiencia').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY));
    await expect(page.locator('.nav-link[href="#experiencia"]')).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('.experience-header .section-index')).toHaveText('05 / EXPERIENCIA');
    if (reducedMotion === 'no-preference') await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled', '');
    else await expect(page.locator('#experiencia')).not.toHaveAttribute('data-journey-enabled');
  });
}
