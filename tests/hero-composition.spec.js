import { test, expect } from '@playwright/test';

const sizes = [[375,812],[390,844],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080]];
const overlaps = (a,b) => a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
const center = box => box.y + box.height / 2;

for (const [width,height] of sizes) {
  test(`Hero editorial composition stays balanced at ${width}px in both languages`, async ({ page }, testInfo) => {
    await page.setViewportSize({width,height});
    await page.addInitScript(() => sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero-micro-cta')).toHaveCSS('opacity','1',{timeout:10000});
    await expect(page.locator('.hero-marquee, .specialty-data')).toHaveCount(0);
    await expect(page.locator('.hero .specialty')).toHaveCount(1);
    await expect(page.locator('.hero .specialty')).toHaveText('Desarrollo de aplicaciones.');
    const glow = await page.locator('.name').evaluate(e => {
      const s = getComputedStyle(e,'::before');
      return {image:s.backgroundImage, color:s.backgroundColor, filter:s.filter};
    });
    expect(glow.image).toContain('radial-gradient');
    expect(glow.color).toBe('rgba(0, 0, 0, 0)');
    expect(glow.filter).toBe('none');
    for (const lang of ['es','en']) {
      await page.locator(`.language-choice[lang="${lang}"]`).click();
      await expect(page.locator('.floating-scroll-cue')).toBeVisible();
      const boxes = Object.fromEntries(await Promise.all(['.floating-header','.hero-meta','#hero-title','.hero-micro-cta','.specialty','.hero-link.primary','.hero-link.secondary','.floating-scroll-cue','.floating-theme-toggle','.hero'].map(async s => [s,await page.locator(s).boundingBox()])));
      expect(boxes['.floating-header'].y).toBeGreaterThanOrEqual(16);
      expect(boxes['.floating-header'].y+boxes['.floating-header'].height).toBeLessThan(boxes['.hero-meta'].y);
      expect(boxes['#hero-title'].y-boxes['.hero-meta'].y-boxes['.hero-meta'].height).toBeGreaterThanOrEqual(40);
      expect(boxes['.hero'].y+boxes['.hero'].height).toBeCloseTo(height,0);
      const cue = boxes['.floating-scroll-cue'];
      expect(cue.x+cue.width/2).toBeCloseTo(width/2,0);
      const primary = boxes['.hero-link.primary'], secondary = boxes['.hero-link.secondary'];
      expect(Math.abs(center(cue)-center(primary))).toBeLessThanOrEqual(1);
      expect(Math.abs(center(cue)-center(secondary))).toBeLessThanOrEqual(1);
      if (width>640) expect(Math.abs(center(cue)-center(boxes['.specialty']))).toBeLessThanOrEqual(1);
      for (const s of ['#hero-title','.hero-micro-cta','.specialty','.hero-link.primary','.hero-link.secondary']) {
        expect(overlaps(boxes[s],cue), `${lang}: scroll overlaps ${s}`).toBe(false);
        expect(overlaps(boxes[s],boxes['.floating-theme-toggle']), `${lang}: theme overlaps ${s}`).toBe(false);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.mouse.move(0,0);
      await page.screenshot({path:testInfo.outputPath(`hero-${lang}.png`)});
    }
    await page.locator('.floating-scroll-cue').click();
    await expect(page.locator('#sobre-mi')).toBeInViewport();
    expect(errors).toEqual([]);
  });
}

for (const width of [390,1440]) {
  test(`language controls keep their geometry, lime states and keyboard focus at ${width}px`, async ({page},testInfo) => {
    await page.setViewportSize({width,height:900});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    for (const section of ['inicio','sobre-mi']) {
      await page.locator(section==='inicio'?'.hero':'#sobre-mi').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-(e.classList.contains('hero')?80:84)));
      await expect(page.locator('.floating-header')).toBeVisible();
      const selector = page.locator('.language-selector');
      const before = await selector.boundingBox();
      for (const lang of ['en','es']) {
        const button = selector.locator(`[lang="${lang}"]`);
        await button.hover();
        await expect(button).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
        await expect(button).toHaveCSS('border-radius','0px');
        await expect(button).toHaveCSS('color','rgb(226, 244, 166)');
        await expect(button).toHaveCSS('box-shadow','none');
        await button.click();
        await expect(button).toHaveAttribute('aria-pressed','true');
        const after = await selector.boundingBox();
        expect(after.width).toBe(before.width);
        expect(after.height).toBe(before.height);
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(button).toBeFocused();
        await expect(button).toHaveCSS('outline-style','none');
        await expect(button).toHaveCSS('text-decoration-line','underline');
        await expect(button).toHaveCSS('text-decoration-thickness','2px');
        await page.screenshot({path:testInfo.outputPath(`${section}-${lang}-focus.png`)});
      }
    }
  });
}

test('font loading preserves the name block and lower band geometry', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
  let release;
  const gate = new Promise(resolve=>release=resolve);
  await page.route('**/*.woff2',async route=>{await gate;await route.continue();});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.hero')).toBeVisible();
  const measure = () => page.locator('#hero-title,.hero-details').evaluateAll(nodes=>nodes.map(e=>{const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height];}));
  const before = await measure();
  release();
  await page.evaluate(()=>document.fonts.ready);
  const after = await measure();
  for (let row=0;row<before.length;row++) for (let value=0;value<before[row].length;value++) {
    expect(Math.abs(after[row][value]-before[row][value])).toBeLessThanOrEqual(.5);
  }
});
