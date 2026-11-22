import {test,expect} from '@playwright/test';

const ids=['inicio','sobre-mi','proyectos','servicios','experiencia','contacto'];
const markers={proyectos:'.showcase-header',servicios:'.services-meta .editorial-section-label',contacto:'.editorial-section-label'};

async function entry(page,id){
 if(id==='inicio')return Math.abs(await page.evaluate(()=>scrollY));
 return page.locator(`#${id}`).evaluate((section,selector)=>{
  if(!selector)return Math.abs(section.getBoundingClientRect().top);
  const marker=section.querySelector(selector);
  const ink=marker.getBoundingClientRect().top+parseFloat(getComputedStyle(marker).paddingTop);
  return Math.abs(ink-document.querySelector('.floating-header').getBoundingClientRect().bottom-16);
 },markers[id]??null);
}
async function navigate(page,id){
 if(id!=='contacto'&&await page.locator('.menu-toggle').isVisible()){
  if(await page.locator('.menu-toggle').getAttribute('aria-expanded')!=='true')await page.locator('.menu-toggle').click();
 }
 await page.locator(`.navbar a[href="#${id}"]`).first().click();
 await expect(page.locator(`#${id}`)).toBeFocused();
 await expect.poll(()=>entry(page,id),{timeout:8000}).toBeLessThan(2);
 await expect(page.locator(`.navbar a[href="#${id}"][aria-current="location"]`)).toHaveCount(1);
 if(id!=='inicio'){
  const section=page.locator(`#${id}`);
  expect((await section.boundingBox()).y).toBeLessThan(2);
 }
 await page.waitForTimeout(180);
 expect(await entry(page,id)).toBeLessThan(2);
}
async function open(page){
 await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
 await page.goto('/');
 await expect(page.locator('app-root')).toHaveAttribute('data-ready','');
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(400);
}

for(const [width,height] of [[375,812],[390,844],[430,932],[768,1024],[1366,900],[1920,1080]]){
 test.describe(`section entries ${width}px`,()=>{
  test.use({viewport:{width,height},isMobile:width<768,hasTouch:width<768});
  test('aligns cinematic and editorial entries in both themes after manual scrolling',async({page},info)=>{
   test.setTimeout(120000);
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await open(page);
   for(const theme of ['light','dark']){
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.floating-theme-toggle').click();
    for(const id of ['proyectos','servicios','experiencia','contacto','sobre-mi','inicio']){
     await navigate(page,id);
     await page.screenshot({path:info.outputPath(`${theme}-${id}.png`),scale:'css'});
    }
    // A manual scroll changes the source, not the calculated destination.
    await page.evaluate(()=>scrollTo(0,document.querySelector('#servicios').getBoundingClientRect().top+scrollY+350));
    await navigate(page,'proyectos');
    await navigate(page,'contacto');
    await navigate(page,'experiencia');
   }
   expect(errors).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  });
 });
}

test('all section pairs, resize, interrupt, history and catalogue return use one destination',async({page},info)=>{
 test.setTimeout(180000);
 await open(page);
 for(const from of ids){
  await navigate(page,from);
  for(const to of ids.filter(id=>id!==from)){
   await navigate(page,to);
   await navigate(page,from);
  }
 }
 for(const id of ['proyectos','servicios','experiencia','contacto','sobre-mi']){
  await navigate(page,id);
  await page.setViewportSize({width:768,height:1024});
  await expect.poll(()=>entry(page,id),{timeout:8000}).toBeLessThan(2);
  await page.setViewportSize({width:1366,height:900});
  await expect.poll(()=>entry(page,id),{timeout:8000}).toBeLessThan(2);
 }
 await navigate(page,'servicios');await navigate(page,'proyectos');
 await page.goBack();
 await expect.poll(()=>entry(page,'servicios')).toBeLessThan(2);
 await page.evaluate(()=>{location.hash='#proyectos/harmonix';});
 await expect(page.locator('.project-detail')).toBeVisible();
 await navigate(page,'proyectos');
 await expect(page.locator('.project-detail')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('catalogue-return.png')});
 // A newer navigation cancels an unfinished one; user wheel input also cancels.
 await page.locator('.navbar a[href="#sobre-mi"]').dispatchEvent('click');
 await page.locator('.navbar a[href="#servicios"]').dispatchEvent('click');
 await expect.poll(()=>entry(page,'servicios')).toBeLessThan(2);
 await page.locator('.navbar a[href="#sobre-mi"]').dispatchEvent('click');
 await page.waitForTimeout(180);
 await page.mouse.wheel(0,120);
 await page.waitForTimeout(250);
 const stopped=await page.evaluate(()=>scrollY);
 await page.waitForTimeout(700);
 expect(Math.abs(await page.evaluate(()=>scrollY)-stopped)).toBeLessThan(2);
});

test('reduced motion and direct hashes preserve the same visual entries',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await open(page);
 for(const id of ids)await navigate(page,id);
 await page.goto('/#servicios');
 await expect.poll(()=>entry(page,'servicios')).toBeLessThan(2);
});
