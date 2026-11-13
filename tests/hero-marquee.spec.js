import { test, expect } from '@playwright/test';
import { SITE_URL } from './support/site.js';

const text = 'DESARROLLO WEB, APLICACIONES A MEDIDA, DATOS Y AUTOMATIZACIÓN, SOLUCIONES DIGITALES';

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [2560, 1440]]) {
  test(`editorial marquee fills Home and loops without gaps at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen', '1'));
    await page.goto(SITE_URL);
    await page.evaluate(() => document.fonts.ready);
    // Let the existing chapter pin finish its queued font/layout refresh before
    // isolating theme changes from initial DOM reparenting by ScrollTrigger.
    await page.waitForTimeout(400);
    const bar = page.locator('.hero-marquee');
    await expect(bar).toBeVisible();
    await expect(bar.locator('.sr-only')).toHaveText(text);
    await expect(bar).toHaveCSS('background-color', 'rgb(226, 244, 166)');
    await expect(bar).toHaveCSS('color', 'rgb(17, 17, 17)');
    const box = await bar.boundingBox();
    expect(box.x).toBe(0);
    expect(box.y).toBe(0);
    expect(box.width).toBe(width);
    expect(box.height).toBe(width <= 640 ? 30 : 36);
    const heroBefore = await page.locator('.hero').boundingBox();
    const coverage = await bar.evaluate(bar => {
      const track = bar.querySelector('.hero-marquee-track');
      const animation = track.getAnimations()[0];
      const duration = animation.effect.getTiming().duration;
      animation.pause();
      const samples = [0, .25, .5, .99999, 1.00001].map(fraction => {
        animation.currentTime = duration * fraction;
        const groups = [...bar.querySelectorAll('.hero-marquee-group')].map(group => group.getBoundingClientRect());
        return {
          left: groups[0].left,
          right: groups[1].right,
          seam: Math.abs(groups[0].right - groups[1].left),
          equalWidths: Math.abs(groups[0].width - groups[1].width),
        };
      });
      animation.currentTime = 1000;
      animation.play();
      window.marqueeAnimation = animation;
      return { duration, samples };
    });
    expect(coverage.duration).toBeGreaterThanOrEqual(25000);
    expect(coverage.duration).toBeLessThanOrEqual(35000);
    for (const sample of coverage.samples) {
      expect(sample.left).toBeLessThanOrEqual(0);
      expect(sample.right).toBeGreaterThanOrEqual(width);
      expect(sample.seam).toBeLessThan(.1);
      expect(sample.equalWidths).toBeLessThan(.1);
    }
    // On short mobile screens the corner utility can legitimately hide behind
    // protected Hero links. Activate it on a clear surface, then restore Home.
    const toggle = page.locator('.floating-theme-toggle');
    const seekTheme = !(await toggle.isVisible());
    if (seekTheme) await page.locator('#sobre-mi').evaluate(section => scrollTo(0, section.getBoundingClientRect().top + scrollY - 84));
    await expect(toggle).toBeVisible();
    await toggle.click();
    if (seekTheme) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(bar).toHaveCSS('background-color', 'rgb(226, 244, 166)');
    await expect(bar).toHaveCSS('color', 'rgb(17, 17, 17)');
    expect(await bar.evaluate(bar => window.marqueeAnimation === bar.querySelector('.hero-marquee-track').getAnimations()[0])).toBe(true);
    // CSS animation clocks can round the assigned millisecond fractionally.
    expect(await page.evaluate(() => window.marqueeAnimation.currentTime)).toBeGreaterThanOrEqual(999);
    const heroAfter = await page.locator('.hero').boundingBox();
    expect(heroAfter).toEqual(heroBefore);
    await page.locator('.language-choice[lang="en"]').click();
    await expect(bar.locator('.sr-only')).toHaveText('WEB DEVELOPMENT, CUSTOM APPLICATIONS, DATA & AUTOMATION, DIGITAL SOLUTIONS');
    await expect(page.locator('.micro-cta-description')).toHaveText('Your business, easy to find online.');
    expect(await bar.evaluate(bar => window.marqueeAnimation === bar.querySelector('.hero-marquee-track').getAnimations()[0])).toBe(true);
    await page.locator('.language-choice[lang="es"]').click();
    await expect(bar.locator('.sr-only')).toHaveText(text);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('editorial marquee respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(SITE_URL);
  await expect(page.locator('.hero-marquee')).toBeVisible();
  await expect(page.locator('.hero-marquee .sr-only')).toHaveText(text);
  await expect(page.locator('.hero-marquee-track')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.hero-marquee-track')).toHaveCSS('transform', 'none');
});
