import {test,expect} from '@playwright/test';

for(const [width,height] of [[375,812],[390,844],[430,932],[1440,900]]) {
 test.describe(`Experience opening label at ${width}px`,()=>{
  test.use({viewport:{width,height},isMobile:width<768,hasTouch:width<768});
  test('one label belongs to the opening, survives its split and retires with the original transition',async({page},testInfo)=>{
   await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
   await page.goto('/');
   await expect(page.locator('#experiencia')).toHaveAttribute('data-zoom-enabled','');
   await page.evaluate(()=>document.fonts.ready);
   const section=page.locator('#experiencia'),label=section.locator('.editorial-section-label');
   await expect(label).toHaveCount(1);
   await expect(section.locator('.experience-opening > .editorial-section-label')).toHaveText('05 / EXPERIENCIA');
   await expect(section.locator('.experience-header .editorial-section-label')).toHaveCount(0);
   const styles=locator=>locator.evaluate(e=>{const c=getComputedStyle(e);return [c.fontFamily,c.fontSize,c.fontWeight,c.letterSpacing,c.lineHeight,c.paddingTop,c.paddingBottom];});
   expect(await styles(label)).toEqual(await styles(page.locator('#servicios .editorial-section-label')));
   const seek=async progress=>{
    await section.evaluate((e,p)=>scrollTo(0,e.getBoundingClientRect().top+scrollY+innerHeight*1.25*p),progress);
    await page.waitForTimeout(900);
   };
   await seek(0);
   await expect(label).toBeVisible();
   await expect(label).toHaveCSS('opacity','1');
   await expect(section.locator('.experience-stage')).toHaveCSS('visibility','hidden');
   const box=await label.boundingBox(),nav=await page.locator('.floating-header').boundingBox();
   expect(box.y).toBeGreaterThan(nav.y+nav.height);
   expect(box.x).toBe(width<768?24:Math.max(56,(width-1200)/2));
   const wordTop=await section.locator('.opening-left').evaluate(e=>e.getBoundingClientRect().top);
   expect(box.y+box.height+24).toBeLessThan(wordTop);
   await page.screenshot({path:testInfo.outputPath('01-opening.png'),scale:'css'});
   await seek(.38);
   await expect(section.locator('.experience-opening')).toHaveCSS('opacity','1');
   await expect(label).toBeInViewport();
   await page.screenshot({path:testInfo.outputPath('02-split.png'),scale:'css'});
   await seek(1.01);
   await expect(section.locator('.experience-backdrop')).toHaveCSS('opacity','0');
   await expect(section.locator('.experience-stage')).toHaveCSS('visibility','visible');
   await page.screenshot({path:testInfo.outputPath('03-valley.png'),scale:'css'});
   await seek(0);
   await expect(section.locator('.experience-opening')).toHaveCSS('opacity','1');
   await expect(label).toHaveCSS('opacity','1');
   const contact=page.locator('#contacto');
   await contact.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-84));
   const contactLabel=contact.locator('.editorial-section-label');
   await expect(contactLabel).toHaveText('06 / CONTACTO');
   await expect(contactLabel).toBeInViewport();
   expect(await styles(contactLabel)).toEqual(await styles(label));
   expect(await contactLabel.evaluate(e=>e.closest('.contact-card'))).toBeNull();
   expect((await contactLabel.boundingBox()).y+(await contactLabel.boundingBox()).height).toBeLessThanOrEqual((await contact.locator('h2').boundingBox()).y);
   await page.screenshot({path:testInfo.outputPath('04-contact.png'),scale:'css'});
  });
 });
}

test('reduced motion and reading mode preserve one accessible label without an animated duplicate',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
 await page.goto('/');
 const section=page.locator('#experiencia'),label=section.locator('.editorial-section-label');
 await section.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-84));
 await expect(label).toHaveCount(1);
 await expect(label).toBeInViewport();
 await expect(label).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(section).not.toHaveAttribute('data-zoom-enabled','');
 expect(await label.evaluate(e=>e.closest('[aria-hidden="true"]'))).toBeNull();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(section).toHaveAttribute('data-zoom-enabled','');
 await section.locator('.experience-content').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY));
 await section.locator('.journey-mode').click();
 await expect(section).not.toHaveAttribute('data-zoom-enabled','');
 await expect(label).toHaveCount(1);
 await expect(label).toBeVisible();
});
