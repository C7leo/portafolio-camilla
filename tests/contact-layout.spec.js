import {test,expect} from '@playwright/test';

for(const width of [375,390,430,768,1366,1920]){
 test.describe(`Recovered Contact at ${width}px`,()=>{
  test.use({viewport:{width,height:width<768?844:1080}});
  test('matches the centered white reference with grey fields and blue underlines',async({page},info)=>{
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto('/');
   await page.evaluate(()=>document.fonts.ready);
   if(await page.locator('.home-menu-toggle').isVisible())await page.locator('.home-menu-toggle').click();
   await page.locator('.home-contact').click();
   await expect(page).toHaveURL(/#contacto$/);
   const section=page.locator('#contacto');
   await expect(section).toHaveCount(1);
   await expect(page.locator('#pie-de-pagina')).toHaveCount(1);
   await expect(section).toHaveCSS('background-color','rgb(255, 255, 255)');
   await expect(page.locator('.field-control').first()).toHaveCSS('background-color','rgb(249, 249, 249)');
   await expect(page.locator('#contact-title')).toHaveText('CONTACT');
   await expect(page.locator('#contact-title')).toHaveCSS('font-size','16px');
   await expect(page.locator('#contact-name')).toHaveAttribute('placeholder','Nombre');
   await expect(page.locator('#contact-email')).toHaveAttribute('placeholder','Correo');
   await expect(page.locator('#contact-message')).toHaveCSS('min-height','244px');
   await expect(page.locator('#contact-title')).toBeInViewport();
   await page.waitForTimeout(1000);
   const label=await section.locator('.contact-heading').boundingBox();
   const navbar=await page.locator('.floating-header').boundingBox();
   expect(label.y+8).toBeGreaterThan(navbar.y+navbar.height);
   const form=await page.locator('.contact-form').boundingBox();
   expect(form.width).toBeLessThanOrEqual(382);
   expect(form.x+form.width/2).toBeCloseTo(width/2,0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
   await page.screenshot({path:info.outputPath('contact-entry.png'),scale:'css'});
   await page.locator('#contact-name').click();
   await page.keyboard.type('Camilla');
   await expect(page.locator('#contact-name')).toHaveCSS('outline-style','none');
   await page.waitForTimeout(300);
   expect(await page.locator('#contact-name').locator('..').evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
   const button=page.locator('.contact-submit');
   await button.scrollIntoViewIfNeeded();
   const before=await button.boundingBox();
   expect(before.height).toBeGreaterThanOrEqual(44);
   expect(before.width).toBeLessThan(width-48);
   await button.hover();
   await expect(button).toHaveCSS('background-color','rgb(255, 105, 117)');
   expect((await button.boundingBox()).width).toBeCloseTo(before.width,0);
   await page.screenshot({path:info.outputPath('contact-button-hover.png'),scale:'css'});
   await page.keyboard.press('Tab');
   await page.locator('#contact-email').focus();
   await expect(page.locator('#contact-email')).toBeFocused();
   await expect(page.locator('#contact-email')).toHaveCSS('outline-style','none');
   await expect(page.locator('.contact-intro')).toHaveCSS('opacity','1');
   expect(errors).toEqual([]);
  });
 });
}

test.describe('touch Contact',()=>{
 test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 test('edits and sends using touch without changing the contact destination',async({page})=>{
  await page.route('https://formspree.io/f/xjgvpygp',r=>r.fulfill({json:{ok:true}}));
  await page.goto('/#contacto');
  await page.locator('#contact-name').tap();
  await page.locator('#contact-name').fill('Visitante móvil');
  await expect(page.locator('#contact-name')).toHaveCSS('outline-style','none');
  await page.locator('#contact-email').fill('visitor@example.com');
  await page.locator('#contact-message').fill('Consulta desde un dispositivo táctil.');
  await page.locator('.contact-submit').tap();
  await expect(page.locator('#contact-feedback')).toContainText('Mensaje recibido');
  await expect(page).toHaveURL(/#contacto$/);
 });
});
