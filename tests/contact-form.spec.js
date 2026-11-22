import {test,expect} from '@playwright/test';

const endpoint='https://formspree.io/f/xjgvpygp';
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
 await page.goto('/#contacto');
 await expect(page.locator('#contact-name')).toBeVisible();
});
async function fill(page){
 await page.locator('#contact-name').fill('Visitante de prueba');
 await page.locator('#contact-email').fill('visitor@example.com');
 await page.locator('#contact-subject').fill('Un proyecto web');
 await page.locator('#contact-message').fill('Me gustaría conversar sobre una aplicación.');
}

test('validates required fields and email before making any request',async({page})=>{
 let requests=0;await page.route(endpoint,r=>{requests++;return r.abort();});
 await page.locator('.contact-submit').click();
 for(const field of ['name','email','message'])await expect(page.locator(`#contact-${field}`)).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#contact-name')).toBeFocused();
 await expect(page.locator('#contact-feedback')).toContainText('Revisa los campos');
 await fill(page);
 await page.locator('#contact-email').fill('invalid');
 await page.locator('.contact-submit').click();
 await expect(page.locator('#contact-email-error')).toHaveText('Introduce un correo electrónico válido.');
 expect(requests).toBe(0);
});

test('blocks duplicate submissions, sends the expected payload and only confirms a verified response',async({page},testInfo)=>{
 let requests=0,release;
 const responseGate=new Promise(resolve=>release=resolve);
 let requestBody;
 await page.route(endpoint,async route=>{
  requests++;requestBody=route.request().postData();
  expect(route.request().method()).toBe('POST');
  expect(route.request().headers().accept).toBe('application/json');
  await responseGate;
  await route.fulfill({json:{ok:true,next:'/thanks'}});
 });
 await page.evaluate(()=>window.originalLocalStorage=JSON.stringify(localStorage));
 await fill(page);
 await page.locator('.contact-submit').click();
 await expect(page.locator('.contact-submit')).toBeDisabled();
 await expect(page.locator('fieldset')).toHaveAttribute('disabled','');
 await expect(page.locator('#contact-email')).toBeDisabled();
 await expect(page.locator('#contact-feedback')).toHaveText('Enviando tu mensaje…');
 await page.locator('.contact-form').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 await page.waitForTimeout(100);
 expect(requests).toBe(1);
 expect(requestBody).toContain('name="email"');expect(requestBody).toContain('visitor@example.com');
 expect(requestBody).toContain('name="_gotcha"');
 release();
 await expect(page.locator('#contact-feedback')).toContainText('Mensaje recibido.');
 await expect(page.locator('.contact-submit')).toBeEnabled();
 await expect(page.locator('#contact-message')).toHaveValue('');
 await expect(page.locator('#contact-feedback')).toBeFocused();
 expect(await page.evaluate(()=>JSON.stringify(localStorage)===window.originalLocalStorage)).toBe(true);
 expect(new URL(page.url()).hostname).toBe('127.0.0.1');
 await page.locator('#contacto').screenshot({path:testInfo.outputPath('success.png'),scale:'css'});
});

for(const status of [422,429,500]){
 test(`preserves the draft and handles Formspree HTTP ${status}`,async({page},testInfo)=>{
  await page.route(endpoint,r=>r.fulfill({status,json:status===422?{errors:[{field:'email',code:'TYPE_EMAIL',message:'Invalid email'}]}:{error:'Request failed'}}));
  await fill(page);await page.locator('.contact-submit').click();
  const feedback=page.locator('#contact-feedback');
  await expect(feedback).toHaveClass(/is-error/);
  await expect(feedback).not.toContainText('Mensaje recibido');
  if(status===422)await expect(page.locator('#contact-email')).toHaveAttribute('aria-invalid','true');
  if(status===429)await expect(feedback).toContainText('Espera un momento');
  await expect(page.locator('#contact-message')).toHaveValue('Me gustaría conversar sobre una aplicación.');
  await expect(page.locator('.contact-submit')).toBeEnabled();
  await page.locator('#contacto').screenshot({path:testInfo.outputPath(`error-${status}.png`),scale:'css'});
 });
}

test('network failure allows retry and a 200 response without confirmation is not treated as success',async({page})=>{
 await page.route(endpoint,r=>r.abort('failed'));
 await fill(page);await page.locator('.contact-submit').click();
 await expect(page.locator('#contact-feedback')).toContainText('No pudimos confirmar');
 await page.unroute(endpoint);await page.route(endpoint,r=>r.fulfill({json:{}}));
 await page.locator('.contact-submit').click();
 await expect(page.locator('.contact-submit')).toBeEnabled();
 await expect(page.locator('#contact-feedback')).not.toContainText('Mensaje recibido');
 await expect(page.locator('#contact-message')).not.toHaveValue('');
 await page.unroute(endpoint);await page.route(endpoint,r=>r.fulfill({json:{ok:true}}));
 await page.locator('.contact-submit').click();
 await expect(page.locator('#contact-feedback')).toContainText('Mensaje recibido');
});

test('timeout keeps the draft and does not automatically resubmit',async({page})=>{
 await page.clock.install();
 let requests=0;
 await page.route(endpoint,()=>{requests++;});
 await fill(page);await page.locator('.contact-submit').click();
 await expect(page.locator('.contact-submit')).toBeDisabled();
 await page.clock.fastForward(31000);
 await expect(page.locator('.contact-submit')).toBeEnabled();
 await expect(page.locator('#contact-feedback')).toContainText('No pudimos confirmar');
 await expect(page.locator('#contact-message')).not.toHaveValue('');
 expect(requests).toBe(1);
});

test('English labels, keyboard focus and reduced motion work without exposing personal contacts',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.language-choice[lang="en"]').click();
 await expect(page.getByLabel('Full name')).toHaveAttribute('required');
 await expect(page.getByLabel('Email address')).toHaveAttribute('name','email');
 await page.locator('.contact-submit').click();
 await expect(page.locator('#contact-name-error')).toHaveText('Enter your full name.');
 await expect(page.locator('#contact-name')).toBeFocused();
 await expect(page.locator('#contact-name')).toHaveCSS('outline-style','none');
 expect(await page.locator('#contact-name').locator('..').evaluate(e=>getComputedStyle(e,'::after').height)).toBe('2px');
 expect(await page.locator('#contact-name').locator('..').evaluate(e=>getComputedStyle(e,'::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
 expect(await page.locator('body').innerText()).not.toMatch(/@gmail\.com|WhatsApp/i);
 await expect(page.locator('a[href^="mailto:"],a[href*="wa.me"]')).toHaveCount(0);
});
