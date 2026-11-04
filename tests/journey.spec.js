import { test, expect } from '@playwright/test';

test('section 04 holds only its title while the three experiences scroll and releases at the end', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Español', exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#journey-title')).toContainText('EVOLUCIONA.');
  await expect(page.locator('.journey-entry h3')).toHaveText(['BCP', 'BanBif', 'UPC']);
  await expect(page.locator('.journey-entry').last()).toContainText('diciembre de 2027');
  await expect(page.locator('#journey')).toHaveAttribute('data-transition', 'flow');
  const limits = await page.evaluate(() => {
    const side = document.querySelector('.journey-sidebar');
    const layout = document.querySelector('.journey-layout');
    const top = layout.getBoundingClientRect().top + scrollY;
    const inset = parseFloat(getComputedStyle(side).top);
    return { start: top - inset, end: top + layout.offsetHeight - side.offsetHeight - inset, inset };
  });
  expect(limits.end - limits.start).toBeGreaterThan(250);
  let previous;
  for (const progress of [.05, .5, .95, .5]) {
    const destination = limits.start + (limits.end - limits.start) * progress;
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), destination);
    await expect.poll(() => page.locator('.journey-sidebar').evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(limits.inset, 0);
    const bcpTop = await page.locator('.journey-entry').first().evaluate(el => el.getBoundingClientRect().top);
    if (previous && progress > previous.progress) expect(bcpTop).toBeLessThan(previous.top - 50);
    previous = { progress, top: bcpTop };
    expect(await page.locator('#journey').evaluate(el => el.parentElement.classList.contains('pin-spacer'))).toBe(false);
    expect(['auto','scroll']).not.toContain(await page.locator('.journey-records').evaluate(el => getComputedStyle(el).overflowY));
  }
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), limits.end + 180);
  await expect.poll(() => page.locator('.journey-sidebar').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(limits.inset - 100);
  await page.locator('#ecosystem').evaluate(el => scrollTo({ top:el.getBoundingClientRect().top + scrollY, behavior:'instant' }));
  await expect(page.locator('.journey-sidebar')).not.toBeInViewport();
  await page.locator('#navigation a[href="#journey"]').click();
  await expect.poll(() => page.locator('#journey').evaluate(el => Math.abs(el.getBoundingClientRect().top - document.querySelector('.header').offsetHeight - 20))).toBeLessThan(3);
  await page.evaluate(() => Promise.all([...document.querySelectorAll('#journey img')].map(img => img.decode())));
  await page.screenshot({ path: 'test-results/journey-desktop.png' });
});

test('chapter progress follows scroll in both directions; original stickers stay clear of photographs', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/'); await page.evaluate(()=>document.fonts.ready);
  const progress=[];
  for(const index of [0,1,2,0]) {
    await page.locator('.journey-entry').nth(index).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-180,behavior:'instant'}));
    await expect(page.locator('.journey-records')).toHaveAttribute('data-chapter',String(index+1));
    await expect(page.locator('.journey-entry[aria-current=step] h3')).toHaveText(['BCP','BanBif','UPC'][index]);
    progress.push(await page.locator('.journey-records').evaluate(el=>Number(el.style.getPropertyValue('--journey-progress'))));
  }
  expect(progress[1]).toBeGreaterThan(progress[0]);expect(progress[2]).toBeGreaterThan(progress[1]);expect(progress[3]).toBeLessThan(progress[1]);
  const banbif=await page.locator('.journey-entry-2').evaluate(el=>({photo:el.querySelector('.journey-photograph').getBoundingClientRect().right,copy:el.querySelector('.journey-entry-copy').getBoundingClientRect().left}));
  expect(banbif.photo).toBeLessThan(banbif.copy);
  for(const entry of await page.locator('.journey-entry:has(.journey-sticker)').all()) {
    await entry.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-140,behavior:'instant'}));
    await expect(entry.locator('.journey-media')).toHaveCSS('opacity','1');
    const boxes=await entry.evaluate(el=>({cat:el.querySelector('.journey-sticker').getBoundingClientRect().bottom,photo:el.querySelector('.journey-photograph img').getBoundingClientRect().top}));
    expect(boxes.cat).toBeLessThan(boxes.photo);
  }
  const sources=await page.locator('#journey img[src*="04_"]').evaluateAll(images=>images.map(img=>decodeURI(new URL(img.src).pathname)));
  expect(sources).toEqual(['/assets/career/stickers/04_gato_mirando.png','/assets/career/stickers/04_Gatito neón guiñando el ojo.png','/assets/career/stickers/04_gato durmiendo.png']);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.journey-entry[aria-current]')).toHaveCount(0);
  for(const media of await page.locator('.journey-media').all()) await expect(media).toHaveCSS('opacity','1');
});

test('section 04 fits both languages, keeps photographs local, and remains readable on small screens', async ({ page }) => {
  for (const [width, height] of [[320,740], [390,844], [768,1024], [1240,700], [1920,900]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const language of ['es','en']) {
      await page.locator(`[data-language="${language}"]`).click();
      await page.locator('#journey').evaluate(el => scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior:'instant' }));
      const layout = await page.locator('#journey').evaluate(el => {
        const sidebar = el.querySelector('.journey-sidebar');
        const title = el.querySelector('.journey-title');
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          position: getComputedStyle(sidebar).position,
          titleBottom: title.getBoundingClientRect().bottom,
          words: [...title.children].map(span => {
            const range = document.createRange(); range.selectNodeContents(span);
            const rect = range.getBoundingClientRect();
            return { left:rect.left, right:rect.right };
          }),
        };
      });
      expect(layout.overflow, `horizontal overflow at ${width}px in ${language}`).toBeLessThanOrEqual(1);
      expect(layout.position).toBe(width <= 700 ? 'relative' : 'sticky');
      for (const word of layout.words) { expect(word.left).toBeGreaterThanOrEqual(0); expect(word.right).toBeLessThanOrEqual(width); }
      for (const image of await page.locator('#journey img').all()) {
        await image.evaluate(el => el.scrollIntoView({ behavior:'instant', block:'center' }));
        await image.evaluate(el => el.decode());
      }
      expect(await page.locator('#journey img').evaluateAll(images => images.every(img => img.naturalWidth > 0 && new URL(img.src).origin === location.origin))).toBe(true);
    }
    if (width === 390) await page.screenshot({ path:'test-results/journey-mobile.png' });
  }
  await page.emulateMedia({ reducedMotion:'reduce' });
  await expect(page.locator('#journey')).toHaveCSS('clip-path','none');
});
