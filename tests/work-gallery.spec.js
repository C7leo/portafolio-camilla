import {test,expect} from '@playwright/test';

async function showGallery(page){
 await page.goto('/');await page.locator('.card-swap').waitFor();
 await page.locator('.projects-swap-container').scrollIntoViewIfNeeded();
 await page.evaluate(()=>document.fonts.ready);
}
const front=page=>page.locator('.card-swap-slot[data-front]');
async function settled(page){
 await expect.poll(()=>front(page).evaluate(el=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);return Math.max(Math.abs(m.m41),Math.abs(m.m42),Math.abs(m.m43));})).toBeLessThan(2);
}

test('back selection brings a view forward, then a second click opens its real proposal',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await showGallery(page);
 await expect(front(page)).toHaveAttribute('data-swap-index','0');
 await expect(page.locator('[data-gallery-play]')).toBeDisabled();
 const back=page.locator('[data-swap-index="2"]');
 const box=await back.boundingBox();await page.mouse.click(box.x+box.width-12,box.y+box.height*.35);
 await expect(front(page)).toHaveAttribute('data-swap-index','2');await settled(page);
 await expect(page.locator('#case-dialog')).toBeHidden();
 await front(page).locator('button').click();await expect(page.locator('#case-dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.locator('.work-index-toggle').click();await page.locator('[data-index-view="1"]').click();
 await expect(front(page)).toHaveAttribute('data-swap-index','1');
 await settled(page);
 await expect(page.locator('#case-dialog')).toBeHidden();
 await page.keyboard.press('Enter');await expect(page.locator('.work-case-preview img')).toHaveAttribute('src','/assets/projects/gallery/tracing-study.png');
 await page.keyboard.press('Escape');await page.locator('[data-language="es"]').click();
 await expect(page.locator('#work-title')).toHaveText('TRABAJOCON PROPÓSITO.');
 await expect(page.locator('[data-gallery-play]')).toHaveText('Pausar');
 await page.locator('[data-language="en"]').click();await expect(page.locator('#work-title')).toHaveText('WORKWITH PURPOSE.');
 await expect(page.locator('.work-gallery-track,.work-panel,#drawing')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('Card Swap retains spring drag, suppresses accidental project opening and changes views',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await showGallery(page);
 await page.locator('[data-gallery-play]').click();await settled(page);
 const box=await front(page).boundingBox();
 await page.mouse.move(Math.max(30,box.x+box.width*.6),box.y+box.height*.35);
 await page.mouse.down();await page.mouse.move(Math.max(30,box.x+box.width*.6)+220,box.y+box.height*.35-30,{steps:20});await page.mouse.up();
 await expect(front(page)).toHaveAttribute('data-swap-index','1');
 await expect(page.locator('#case-dialog')).toBeHidden();
 await settled(page);
 await page.locator('[data-gallery-prev]').click();await expect(front(page)).toHaveAttribute('data-swap-index','0');
 await settled(page);
});

test('autoplay advances, pauses on hover and supports an explicit pause control',async({page})=>{
 test.setTimeout(40000);await page.setViewportSize({width:1440,height:1100});await showGallery(page);await page.mouse.move(1,1);
 await expect(front(page)).toHaveAttribute('data-swap-index','1',{timeout:8000});
 await settled(page);
 await front(page).hover();const held=await front(page).getAttribute('data-swap-index');
 await page.waitForTimeout(4300);await expect(front(page)).toHaveAttribute('data-swap-index',held);
 await page.locator('[data-gallery-play]').click();await expect(page.locator('[data-gallery-play]')).toHaveAttribute('aria-pressed','true');
 await page.mouse.move(1,1);await page.waitForTimeout(4300);await expect(front(page)).toHaveAttribute('data-swap-index',held);
 await page.locator('[data-gallery-play]').click();await page.mouse.move(1,1);
 await expect.poll(()=>front(page).getAttribute('data-swap-index'),{timeout:8000}).not.toBe(held);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('[data-gallery-play]')).toBeDisabled();await expect(front(page)).toHaveAttribute('data-swap-index','0');
 await page.waitForTimeout(4300);await expect(front(page)).toHaveAttribute('data-swap-index','0');
});

test('responsive stacks use the real six views with diagonal depth and reduced-motion navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,768,1440,1920]){
  await page.setViewportSize({width,height:1050});await showGallery(page);await page.mouse.move(1,1);
  await expect(page.locator('.card-swap-slot')).toHaveCount(6);
  const state=await page.locator('.card-swap').evaluate(el=>{
   const root=el.getBoundingClientRect();return{fits:document.documentElement.scrollWidth<=innerWidth+1,
    slots:[...el.querySelectorAll('.card-swap-slot')].filter(p=>getComputedStyle(p).visibility!=='hidden').map(p=>{const r=p.getBoundingClientRect();return{x:r.x-root.x,y:r.y-root.y,width:r.width,bottom:r.bottom-root.y,transform:p.style.transform};})};
  });
  expect(state.fits).toBe(true);expect(state.slots).toHaveLength(width<=700?3:4);
  if(width>700){
   expect(state.slots[0].x).toBeGreaterThanOrEqual(0);
   for(let i=1;i<state.slots.length;i++){
    expect(state.slots[i].x).toBeGreaterThan(state.slots[i-1].x);expect(state.slots[i].y).toBeLessThan(state.slots[i-1].y);
    expect(state.slots[i].width).toBeLessThan(state.slots[i-1].width);
    expect(state.slots[i].x).toBeLessThan(state.slots[i-1].x+state.slots[i-1].width);
    expect(state.slots[i].transform).toContain('translate3d');
   }
  }
  for(let i=1;i<6;i++){await page.locator('[data-gallery-next]').click();await expect(front(page)).toHaveAttribute('data-swap-index',String(i));}
  await expect(page.locator('.work-mascot img')).toHaveCSS('animation-name','none');
  for(const img of await page.locator('.card-swap img').all())expect(await img.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
 }
});
