import { test, expect } from '@playwright/test';

for (const width of [1240, 390]) {
  test(`projects and next questions stay readable through entry and exit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Español', exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    for (const selector of ['#work', '.exploring']) {
      const section = page.locator(selector);
      await expect(section).toHaveAttribute('data-transition', 'flow');
      const top = await section.evaluate(el => el.getBoundingClientRect().top + scrollY);
      for (const position of [top - 650, top - 400, top - 100, top - 400]) {
        await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), position);
        await expect(section).toHaveCSS('clip-path', 'none');
        expect(await section.evaluate(el => el.parentElement.classList.contains('pin-spacer'))).toBe(false);
        expect(await section.evaluate(el => Math.abs(el.getBoundingClientRect().left))).toBeLessThan(1);
      }
    }
    // Every question can be read without Contact covering it or a mask hiding it.
    for (const question of await page.locator('.exploring article').all()) {
      await question.evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }));
      await expect.poll(() => question.evaluate(el => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return el.contains(hit) && r.top >= document.querySelector('.header').offsetHeight && r.bottom <= innerHeight;
      })).toBe(true);
    }
    const boundaries = await page.evaluate(() => ({
      explorationBottom: document.querySelector('.exploring').getBoundingClientRect().bottom,
      contactTop: document.querySelector('#contact').getBoundingClientRect().top,
    }));
    expect(Math.abs(boundaries.explorationBottom - boundaries.contactTop)).toBeLessThan(1);
    await expect(page.locator('.signature-row, .mascot-signature')).toHaveCount(0);
    if (width > 700) {
      await page.locator('.exploring').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 95, behavior: 'instant' }));
      await expect(page.locator('.exploring h2')).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.exploring article').last()).toBeInViewport({ ratio: 1 });
      await page.screenshot({ path: 'test-results/exploration-reading-flow.png' });
    }
  });
}
