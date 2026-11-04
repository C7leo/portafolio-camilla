// Capture real states of the existing portfolio interaction. Requires a dev server and local Chrome.
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await page.goto(process.env.PORTFOLIO_URL || 'http://127.0.0.1:5173');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.exercise-content').screenshot({ path: 'public/assets/projects/gallery/tracing-study.png' });
  await page.locator('#trace-demo').click();
  await page.locator('.exercise-content').screenshot({ path: 'public/assets/projects/gallery/tracing-study-path.png' });
} finally {
  await browser.close();
}
