import {test,expect} from '@playwright/test';

for(const [width,height] of [[375,812],[390,844],[430,932],[1440,900]]){
 test.describe(`Contact cover at ${width}px`,()=>{
  test.use({viewport:{width,height},isMobile:width<768,hasTouch:width<768});
  for(const source of ['hero','services']){
   test(`${source} is covered laterally by the one real form without visible vertical scrolling`,async({page},info)=>{
    page.on('pageerror',error=>{throw error;});
    await page.clock.install();
    await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
    await page.goto('/');
    await expect(page.locator('app-root')).toHaveAttribute('data-ready','');
    await page.evaluate(()=>document.fonts.ready);
    const selector=source==='hero'?'.hero a[href="#contacto"]':'.services-contact';
    if(source==='services')await page.locator('.services-cta').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-180));
    await page.clock.pauseAt(await page.evaluate(()=>Date.now()+1000));
    const originalY=await page.evaluate(()=>{window.originalContactForm=document.querySelector('#contacto form');return scrollY;});
    const panel=page.locator('app-contact-form');
    await page.locator(selector).dispatchEvent('click');
    await page.clock.runFor(360);
    expect(await page.evaluate(()=>scrollY)).toBe(originalY);
    expect((await panel.boundingBox()).x).toBeGreaterThan(width*.35);
    expect((await panel.boundingBox()).x).toBeLessThan(width*.65);
    expect(await page.evaluate(()=>document.querySelector('#contacto form')===window.originalContactForm)).toBe(true);
    await expect(page.locator('#contacto form')).toHaveCount(1);
    expect(await page.evaluate(()=>!!document.elementFromPoint(innerWidth*.85,innerHeight*.5)?.closest('app-contact-form'))).toBe(true);
    await page.screenshot({path:info.outputPath('01-half-cover.png'),scale:'css'});
    // A second activation must keep the same panel and animation in progress.
    await page.locator('.navbar .contact').dispatchEvent('click');
    await page.clock.runFor(500);
    await page.clock.resume();
    await expect(page.locator('#contacto')).toBeFocused();
    await expect(page).toHaveURL(/#contacto$/);
    await expect.poll(()=>page.locator('#contacto .editorial-section-label').evaluate(e=>Math.round(e.getBoundingClientRect().top+parseFloat(getComputedStyle(e).paddingTop)-document.querySelector('.floating-header').getBoundingClientRect().bottom))).toBe(16);
    await expect(panel).toHaveCSS('position','static');
    await expect(panel).toHaveCSS('transform','none');
    await expect(page.locator('.navbar .contact')).toHaveAttribute('aria-current','location');
    await expect(page.locator('#contacto input:focus')).toHaveCount(0);
    expect(await page.evaluate(()=>document.querySelector('#contacto form')===window.originalContactForm)).toBe(true);
    const y=await page.evaluate(()=>scrollY);
    await page.waitForTimeout(200);
    expect(await page.evaluate(()=>scrollY)).toBe(y);
    await page.screenshot({path:info.outputPath('02-contact-arrival.png'),scale:'css'});
   });
  }
 });
}

test('reduced motion navigates immediately without a covering layer',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
 await page.goto('/');
 await page.locator('.hero a[href="#contacto"]').click();
 await expect(page.locator('#contacto')).toBeFocused();
 await expect(page.locator('app-contact-form')).toHaveCSS('position','static');
 await expect(page.locator('app-contact-form')).toHaveCSS('position','static');
 await expect(page.locator('app-contact-form')).toHaveCSS('transform','none');
});

test('Escape completes the cover cleanly and preserves the typed draft',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
 await page.goto('/');
 await page.locator('#contact-name').evaluate(e=>e.value='Draft');
 await page.locator('.hero a[href="#contacto"]').click();
 await page.keyboard.press('Escape');
 await expect(page.locator('#contacto')).toBeFocused();
 await expect(page.locator('app-contact-form')).toHaveCSS('position','static');
 await expect(page.locator('app-contact-form')).toHaveCSS('transform','none');
 await expect(page.locator('#contact-name')).toHaveValue('Draft');
});
