import {test,expect} from '@playwright/test';

const endpoint='https://formspree.io/f/xjgvpygp';
test.use({viewport:{width:1440,height:1000}});
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  sessionStorage.setItem('camilla-cinematic-intro-seen','1');
  window.contactRiseCalls=[];
  const animate=Element.prototype.animate;
  Element.prototype.animate=function(frames,options){
   if(this.matches('[data-motion="rise"]')&&this.closest('#contacto'))window.contactRiseCalls.push({element:this,frames,delay:options.delay});
   return animate.call(this,frames,options);
  };
 });
 await page.goto('/#contacto');
 await expect(page.locator('app-root')).toHaveAttribute('data-ready','');
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('#contacto').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-84));
 await expect(page.locator('.contact-card')).toHaveAttribute('data-motion-state','done');
});

test('fields respond to mouse and keyboard without moving the layout or losing the typed value',async({page},testInfo)=>{
 const input=page.locator('#contact-name'),wrapper=input.locator('..');
 await expect(input.locator('../..')).toHaveAttribute('data-motion-state','done');
 const original=await input.boundingBox();
 await page.mouse.move(1,1);await page.waitForTimeout(260);
 await expect(input).toHaveCSS('border-bottom-color','rgba(33, 33, 33, 0.55)');
 await input.hover();await expect(input).toHaveCSS('border-bottom-color','rgb(33, 33, 33)');
 const label=page.locator('label[for="contact-name"]');
 const labelBounds=await label.boundingBox();
 await input.click();
 await expect.poll(()=>wrapper.evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
 await expect(input).toHaveCSS('outline-style','none');
 await expect(input).toHaveCSS('box-shadow','none');
 await expect(input).toHaveCSS('border-top-width','0px');
 await expect(input).toHaveCSS('border-bottom-width','1px');
 expect(await wrapper.evaluate(e=>getComputedStyle(e,'::after').height)).toBe('2px');
 expect(await wrapper.evaluate(e=>getComputedStyle(e,'::after').backgroundColor)).toBe('rgb(0, 0, 0)');
 expect(await label.boundingBox()).toEqual(labelBounds);
 await input.fill('Camilla');
 await expect(input).toHaveValue('Camilla');
 const focused=await input.boundingBox();expect(focused).toEqual(original);
 await page.screenshot({path:testInfo.outputPath('field-focus.png'),scale:'css'});
 await page.keyboard.press('Tab');
 await expect(page.locator('#contact-email')).toBeFocused();
 await expect.poll(()=>wrapper.evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(0, 0, 0, 0.5, 0, 0)');
 await expect(page.locator('#contact-email')).toHaveCSS('outline-style','none');
 await expect.poll(()=>page.locator('#contact-email').locator('..').evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
 await expect(input).toHaveValue('Camilla');
});

test('capsule changes to violet without movement, keeps its width and shows only confirmed success',async({page},testInfo)=>{
 let release;const gate=new Promise(resolve=>release=resolve);let posts=0;
 await page.route(endpoint,async r=>{posts++;await gate;await r.fulfill({json:{ok:true}});});
 const button=page.locator('.contact-submit');
 await button.scrollIntoViewIfNeeded();
 await expect(page.locator('.contact-actions')).toHaveAttribute('data-motion-state','done');
 await page.mouse.move(1,1);const original=await button.boundingBox();
 await button.hover();await expect(button).toHaveCSS('background-color','rgb(90, 78, 255)');
 await expect(button).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(page.locator('.submit-arrow')).toHaveCSS('transform','none');
 expect(await button.evaluate(e=>getComputedStyle(e,'::before').content)).toBe('none');
 await page.screenshot({path:testInfo.outputPath('button-hover.png'),scale:'css'});
 await page.mouse.down();await expect(button).toHaveCSS('transform','none');
 await page.mouse.move(1,1);await page.mouse.up();
 await expect(button).toHaveCSS('transform','none');
 for(const [field,value] of [['name','Visitante'],['email','visitor@example.com'],['message','Mensaje de prueba interceptado']])await page.locator(`#contact-${field}`).fill(value);
 await button.click();await expect(button).toBeDisabled();
 await expect(button).toHaveAccessibleName('Enviando…');
 await expect(page.locator('.submit-spinner')).toHaveCSS('opacity','1');
 expect((await button.boundingBox()).width).toBeCloseTo(original.width,1);
 await expect(page.locator('.submit-check')).toHaveCSS('opacity','0');
 await page.screenshot({path:testInfo.outputPath('button-sending.png'),scale:'css'});
 release();await expect(button).toHaveAccessibleName('Mensaje enviado');
 await expect(page.locator('.submit-check')).toHaveCSS('opacity','1');
 await expect(page.locator('#contact-feedback')).toContainText('Mensaje recibido');
 expect((await button.boundingBox()).width).toBeCloseTo(original.width,1);expect(posts).toBe(1);
 await page.screenshot({path:testInfo.outputPath('button-success.png'),scale:'css'});
});

test('failed delivery keeps the arrow and never reveals the success icon',async({page})=>{
 await page.route(endpoint,r=>r.fulfill({status:500,json:{error:'Unavailable'}}));
 for(const [field,value] of [['name','Visitante'],['email','visitor@example.com'],['message','Mensaje de prueba interceptado']])await page.locator(`#contact-${field}`).fill(value);
 await page.locator('.contact-submit').click();
 await expect(page.locator('#contact-feedback')).toHaveClass(/is-error/);
 await expect(page.locator('.contact-submit')).toHaveAccessibleName('Enviar mensaje');
 await expect(page.locator('.submit-check')).toHaveCSS('opacity','0');
 await expect(page.locator('.submit-arrow')).toHaveCSS('opacity','1');
});

test('stagger uses transform and opacity and does not replay during edits or return scrolling',async({page})=>{
 await page.locator('.contact-submit').scrollIntoViewIfNeeded();
 await expect(page.locator('.contact-actions')).toHaveAttribute('data-motion-state','done');
 const before=await page.evaluate(()=>window.contactRiseCalls.length);
 expect(before).toBe(7);
 expect(await page.evaluate(()=>window.contactRiseCalls.map(c=>c.delay).sort((a,b)=>a-b))).toEqual([0,65,130,195,260,325,390]);
 expect(await page.evaluate(()=>window.contactRiseCalls.every(c=>!('filter' in c.frames[0])&&'translate' in c.frames[0]))).toBe(true);
 await page.locator('#contact-name').fill('Texto que permanece');
 await page.evaluate(()=>scrollTo(0,0));
 await page.locator('#contacto').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-84));
 await page.waitForTimeout(800);
 expect(await page.evaluate(()=>window.contactRiseCalls.length)).toBe(before);
 await expect(page.locator('#contact-name')).toHaveValue('Texto que permanece');
});

test('reduced motion keeps focus and loading understandable without movement',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 await expect(page.locator('.contact-actions')).toHaveAttribute('data-motion-state','done');
 expect(await page.evaluate(()=>window.contactRiseCalls.length)).toBe(0);
 await page.locator('#contact-name').focus();
 await expect(page.locator('label[for="contact-name"]')).toHaveCSS('transform','none');
 await expect(page.locator('.field-control').first()).toHaveCSS('transition-duration','0s');
 await page.locator('.contact-submit').hover();
 await expect(page.locator('.submit-arrow')).toHaveCSS('transform','none');
 await expect(page.locator('#contact-name')).toHaveCSS('outline-style','none');
 expect(await page.locator('#contact-name').locator('..').evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
});

test.describe('touch input',()=>{
 test.use({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 test('tap focuses the underline, keeps the target comfortable and preserves input during scroll',async({page},testInfo)=>{
  const input=page.locator('#contact-email');
  await input.tap();await expect(input).toBeFocused();
  await expect(input).toHaveCSS('outline-style','none');
  await expect(input).toHaveCSS('box-shadow','none');
  await expect.poll(()=>input.locator('..').evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  await input.fill('visitor@example.com');
  await page.locator('.contact-submit').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-actions')).toHaveAttribute('data-motion-state','done');
  const b=await page.locator('.contact-submit').boundingBox();expect(b.height).toBeGreaterThanOrEqual(44);
  await expect(input).toHaveValue('visitor@example.com');
  await page.screenshot({path:testInfo.outputPath('mobile-controls.png'),scale:'css'});
 });
});
