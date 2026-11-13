import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

for (const [width, height] of [[320, 568], [1440, 900]]) {
  test(`all seven project sheets explain the problem, solution and stack at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(`${SITE_URL}/#proyectos`);
    const dialog = page.locator('.project-dialog');
    const projects = [
      ['Harmonix', 'Vue.js / C# / .NET / MySQL'],
      ['SpotFinder', 'Angular / TypeScript / Java / Spring Boot / MySQL / Flutter / Dart'],
      ['NutriSend', 'Angular / Java / Spring Boot / MySQL'],
      ['SmartCampus', 'Angular / TypeScript / Java / Spring Boot / MySQL'],
      ['Courtly', 'Flutter / Dart / Android / Kotlin / Java / Spring Boot'],
      ['EduSpace', 'Vue.js / C# / .NET / MySQL'],
      ['Veyra', 'Angular / TypeScript / Java / Spring Boot'],
    ];
    for (const language of ['es', 'en']) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      for (let index = 0; index < projects.length; index++) {
        const [name, stack] = projects[index];
        const opener = page.locator('.project-open').nth(index);
        await opener.click();
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('h3')).toHaveText(name);
        await expect(dialog.locator('dt')).toHaveText(language === 'es' ? ['Problema', 'Solución', 'Tecnologías'] : ['Problem', 'Solution', 'Technologies']);
        const facts = dialog.locator('dd');
        await expect(facts).toHaveCount(3);
        expect((await facts.nth(0).innerText()).length).toBeGreaterThan(40);
        expect((await facts.nth(1).innerText()).length).toBeGreaterThan(40);
        await expect(facts.last()).toHaveText(stack);
        if (index === 0) {
          await expect(facts.nth(1)).toContainText(language === 'es' ? 'Aplicación web para organizar los gastos' : 'A web application to organize household expenses');
          await page.screenshot({ path: testInfo.outputPath(`harmonix-${language}.png`) });
        }
        await dialog.locator('.dialog-links a').first().scrollIntoViewIfNeeded();
        await expect(dialog.locator('.dialog-links a').first()).toBeInViewport();
        const box = await dialog.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        expect(box.height).toBeLessThanOrEqual(height - 48);
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(opener).toBeFocused();
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('direct project detail shares the same case-study facts', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
  await page.goto(`${SITE_URL}/#proyectos/harmonix`);
  const detail = page.locator('.project-detail');
  await expect(detail.locator('h2')).toHaveText('Harmonix');
  await expect(detail.locator('dt')).toHaveText(['Problema', 'Solución', 'Tecnologías']);
  await expect(detail.locator('dd').last()).toHaveText('Vue.js / C# / .NET / MySQL');
  await detail.locator('.back-link').click();
  await expect(page.locator('.sea-gallery')).toBeVisible();
});
