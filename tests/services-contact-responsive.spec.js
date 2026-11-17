import {test,expect} from '@playwright/test';

for(const [width,height] of [[375,812],[390,844],[430,932],[768,1024],[1024,900],[1440,1000],[1920,1080]]){
 test.describe(`Services contact at ${width}px`,()=>{
  test.use({viewport:{width,height},isMobile:width<768,hasTouch:width<768});
  test('keeps one accessible CTA and reaches the integrated form',async({page},testInfo)=>{
   await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
   await page.goto('/');
   await page.evaluate(()=>document.fonts.ready);
   const cta=page.locator('.services-cta'),contact=cta.locator('.services-contact');
   await cta.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-180));
   await expect(contact).toHaveCount(1);
   await expect(contact).toBeVisible();
   await expect(contact).toBeInViewport();
   await expect(contact).toHaveAccessibleName(/Hablemos.*Ir al formulario/);
   await expect(contact).toHaveCSS('background-color','rgb(226, 244, 166)');
   await expect(contact).toHaveCSS('border-radius','999px');
   await expect(contact.locator('svg')).toBeVisible();
   const bounds=await contact.boundingBox(),title=await cta.locator('.services-cta-title').boundingBox();
   const outer=await cta.boundingBox();
   expect(bounds.width).toBeGreaterThanOrEqual(44);
   expect(bounds.height).toBeGreaterThanOrEqual(44);
   expect(bounds.width).toBeLessThan(outer.width*.65);
   if(width<=640){
    expect(bounds.x).toBeCloseTo(title.x,0);
    expect(bounds.y-title.y-title.height).toBeCloseTo(20,0);
   }else{
    expect(bounds.x).toBeGreaterThan(title.x+title.width);
    const padding=await cta.evaluate(e=>parseFloat(getComputedStyle(e).paddingInlineEnd));
    expect(bounds.x+bounds.width).toBeCloseTo(outer.x+outer.width-padding,0);
   }
   expect(await contact.evaluate(e=>{const b=e.getBoundingClientRect();return e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));})).toBe(true);
   await contact.focus();
   await expect(contact).toBeFocused();
   await expect(contact).toHaveCSS('outline-style','solid');
   await expect(contact).toHaveCSS('outline-width','2px');
   await expect(contact).toHaveAttribute('href','#contacto');
   await expect(contact).not.toHaveAttribute('target');
   await page.screenshot({path:testInfo.outputPath(`${width}-contact.png`),scale:'css'});
   if(width<768)await contact.tap();else await page.keyboard.press('Enter');
   await expect(page).toHaveURL(/#contacto$/);
   const section=page.locator('#contacto');
   await expect.poll(async()=>Math.round((await section.boundingBox()).y)).toBe(84);
   await expect(section).toBeFocused();
   await expect(section.locator('form')).toHaveCount(1);
   const card=section.locator('.contact-card'),heading=section.locator('.contact-heading');
   await expect(card).toHaveAttribute('data-motion-state','done');
   await expect(section.locator('#contact-card-title')).toHaveAttribute('data-motion-state','done');
   await expect(section).toHaveCSS('background-color','rgb(0, 0, 0)');
   await expect(card).toHaveCSS('background-color','rgb(226, 244, 166)');
   await expect(heading).toHaveText('Contacto');
   await expect(heading).toHaveCSS('text-transform','uppercase');
   expect(await heading.evaluate(e=>getComputedStyle(e).fontFamily)).toBe(await page.locator('html').evaluate(e=>getComputedStyle(e).fontFamily));
   expect(await heading.evaluate(e=>document.fonts.check('600 100px Urbanist'))).toBe(true);
   const titleBox=await heading.boundingBox(),cardBox=await card.boundingBox();
   expect(titleBox.y).toBeGreaterThan(84);
   expect(titleBox.y+titleBox.height-cardBox.y).toBeGreaterThan(0);
   expect(titleBox.y+titleBox.height-cardBox.y).toBeLessThan(titleBox.height*.3);
   expect(cardBox.x+cardBox.width).toBeCloseTo(titleBox.x+titleBox.width,0);
   if(width>=1024)expect(cardBox.x).toBeGreaterThan(titleBox.x);
   const ink=await heading.evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getBoundingClientRect().toJSON();});
   expect(ink.right).toBeLessThanOrEqual(titleBox.x+titleBox.width);
   await expect(section.locator('img,canvas,video')).toHaveCount(0);
   await expect(section.locator('.contact-submit')).toHaveCSS('background-color','rgb(0, 0, 0)');
   await expect(section.locator('.contact-submit')).toHaveCSS('color','rgb(255, 255, 255)');
   for(const field of ['name','email','subject','message']){
    const control=section.locator(`[name="${field}"]`),box=await control.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(24);
    expect(box.x+box.width).toBeLessThanOrEqual(width-24);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(control).toHaveCSS('font-size','16px');
   }
   await expect(section.locator('[name="email"]')).toHaveAttribute('type','email');
   await expect(section.locator('[name="_gotcha"]')).toBeHidden();
   await expect(page.locator('a[href^="mailto:"],a[href*="wa.me"],a[href*="whatsapp"]')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:testInfo.outputPath(`${width}-form-light-start.png`),scale:'css'});
   await section.locator('.contact-submit').scrollIntoViewIfNeeded();
   await expect(section.locator('.contact-submit')).toBeInViewport();
   expect(await section.locator('.contact-submit').evaluate(e=>{const b=e.getBoundingClientRect();return e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));})).toBe(true);
   await page.screenshot({path:testInfo.outputPath(`${width}-form-light-actions.png`),scale:'css'});
   await page.locator('.floating-theme-toggle').click();
   await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
   await expect(section).toHaveCSS('background-color','rgb(0, 0, 0)');
   await expect(card).toHaveCSS('background-color','rgb(226, 244, 166)');
   await expect(card).toHaveCSS('color','rgb(33, 33, 33)');
   await page.screenshot({path:testInfo.outputPath(`${width}-form-dark-actions.png`),scale:'css'});
   await section.evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-84));
   await page.screenshot({path:testInfo.outputPath(`${width}-form-dark-start.png`),scale:'css'});
  });
 });
}
