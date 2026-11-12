import { test, expect } from '@playwright/test';
import { SITE_URL as url } from './support/site.js';

for (const width of [1440, 390, 320]) {
  test(`CV download keeps its document and language at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(url);
    const link = page.locator('.cv-download');
    for (const language of ['es', 'en']) {
      await page.locator(`.language-choice[lang="${language}"]`).click();
      const filename = language === 'es' ? 'CV_Camilla_Espinoza.pdf' : 'CV_Camilla_Espinoza_EN.pdf';
      await expect(link).toHaveAttribute('download', filename);
      const response = await page.request.get(new URL(await link.getAttribute('href'), page.url()).href);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
      const body = await response.body();
      expect(body.subarray(0, 5).toString()).toBe('%PDF-');
      expect((body.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length).toBe(2);
      const downloaded = page.waitForEvent('download');
      await link.click();
      const download = await downloaded;
      expect(download.suggestedFilename()).toBe(filename);
      expect(await download.failure()).toBeNull();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
