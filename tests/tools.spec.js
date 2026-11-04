import { test, expect } from '@playwright/test';
import { technologies } from '../src/modules/capabilities/domain/technologies.js';
import { spanish } from '../src/shared/i18n/translations.js';

async function open(page) {
  await page.goto('/');
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#ecosystem').scrollIntoViewIfNeeded();
}
const card=(page,index)=>page.locator(`#ecosystem [data-tech="${index}"]`);
const panel=page=>page.locator('#tech-panel');

async function verifyTools(page,index,language='en') {
  const item=technologies[index];
  await expect(panel(page)).toHaveCount(1);
  await expect(panel(page)).toHaveAttribute('data-category',String(index));
  await expect(page.locator('.tech-node[aria-expanded=true]')).toHaveCount(1);
  await expect(card(page,index)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#tech-category-name')).toHaveText(language==='es'?spanish[item.name]??item.name:item.name);
  await expect(page.locator('#tech-label')).toHaveText(language==='es'?spanish[item.label]??item.label:item.label);
  await expect(page.locator('#tech-description')).toHaveText(language==='es'?spanish[item.description]??item.description:item.description);
  await expect(page.locator('.tech-quick-item>span:last-child')).toHaveText(item.tech.split(' · ').map(name=>language==='es'?spanish[name]??name:name));
}

test('all six categories show only their documented tools, with local vendor logos and original content',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await open(page);await expect(panel(page)).toHaveCount(0);
  for(const [index] of technologies.entries()){
    await card(page,index).click();await verifyTools(page,index);
    await expect(page.locator('.tech-brand-logo')).toHaveCount([9,0,1,1,3,0][index]);
    expect(await page.locator('.tech-brand-logo').evaluateAll(async images=>{
      await Promise.all(images.map(img=>img.decode()));
      return images.every(img=>img.naturalWidth>0 && getComputedStyle(img).filter==='none' && new URL(img.src).origin===location.origin);
    })).toBe(true);
    await expect(page.locator('.tech-tool-symbol [data-symbol]')).toHaveCount(technologies[index].tech.split(' · ').length);
  }
  expect(errors).toEqual([]);
});

test('desktop expands laterally into the reference layout and keeps the two hero blocks unchanged',async({page})=>{
  await page.setViewportSize({width:1670,height:1050});await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  const heroes=await page.locator('.tools-heroes').boundingBox();
  await card(page,0).click();await verifyTools(page,0);
  const boxes=await page.locator('.tech-node,#tech-panel').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.id==='tech-panel'?'panel':node.dataset.tech,node.getBoundingClientRect().toJSON()])));
  expect(boxes[0].right).toBeLessThanOrEqual(boxes.panel.left);
  expect(boxes.panel.right).toBeLessThanOrEqual(boxes[1].left);
  expect(Math.abs(boxes.panel.top-boxes[0].top)).toBeLessThan(1);
  expect(boxes[1].bottom).toBeLessThanOrEqual(boxes[2].top);
  for(const i of [3,4,5])expect(boxes[i].top).toBeGreaterThanOrEqual(boxes.panel.bottom);
  expect(await panel(page).evaluate(el=>getComputedStyle(el).position)).toBe('relative');
  const after=await page.locator('.tools-heroes').boundingBox();expect(after.width).toBe(heroes.width);expect(after.height).toBe(heroes.height);
  await expect(page.locator('.tools-hero-cat')).toHaveAttribute('src','/assets/05_gato.png');
  await expect(page.locator('.tools-database')).toHaveAttribute('src','/assets/05_db.png');
});

test('reselecting, closing and Escape collapse the single panel and keyboard navigation remains usable',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await open(page);
  await card(page,0).click();await verifyTools(page,0);
  await card(page,0).click();await expect(panel(page)).toHaveCount(0);
  await card(page,0).focus();await page.keyboard.press('ArrowRight');await verifyTools(page,1);await expect(card(page,1)).toBeFocused();
  await page.keyboard.press('End');await verifyTools(page,5);
  await page.keyboard.press('Escape');await expect(panel(page)).toHaveCount(0);await expect(card(page,5)).toBeFocused();
  await page.keyboard.press('Enter');await verifyTools(page,5);
  await page.locator('.tools-close').click();await expect(panel(page)).toHaveCount(0);await expect(card(page,5)).toBeFocused();
  await expect(page.locator('.tech-node[aria-expanded=true]')).toHaveCount(0);
});

test('all categories reorganize without overlaps or horizontal scroll in EN/ES on desktop, tablet and mobile',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const [width,height] of [[1920,1080],[1440,1000],[1024,900],[768,1024],[390,844],[320,740]]){
    await page.setViewportSize({width,height});await open(page);
    for(const language of ['es','en']){
      await page.locator(`[data-language=${language}]`).click();
      for(let index=0;index<6;index++){
        if(await card(page,index).getAttribute('aria-expanded')!=='true')await card(page,index).click();
        await verifyTools(page,index,language);
        const layout=await page.locator('#toolkit-categories').evaluate(el=>{
          const boxes=[...el.children].map(node=>node.getBoundingClientRect());
          const overlaps=boxes.flatMap((a,i)=>boxes.slice(i+1).filter(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1));
          const p=el.querySelector('#tech-panel'),c=el.querySelector('[aria-expanded=true]');
          return {overflow:document.documentElement.scrollWidth-innerWidth,overlaps:overlaps.length,panelTop:p.getBoundingClientRect().top,cardBottom:c.getBoundingClientRect().bottom,adjacent:c.nextElementSibling===p,clipped:p.scrollWidth>p.clientWidth+1 || p.scrollHeight>p.clientHeight+1};
        });
        expect(layout.overflow,`${width}px ${language} category ${index}`).toBeLessThanOrEqual(1);
        expect(layout.overlaps).toBe(0);expect(layout.clipped).toBe(false);
        if(width<=700){expect(layout.panelTop).toBeGreaterThanOrEqual(layout.cardBottom);expect(layout.adjacent).toBe(true);}
        await page.locator('.tools-close').click();await expect(panel(page)).toHaveCount(0);
      }
    }
  }
  expect(errors).toEqual([]);
});

test('layout animates, rapid switches keep the latest category, and live reduced motion cancels animation',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await open(page);
  await card(page,0).click();
  expect(await page.locator('#toolkit-categories').evaluate(el=>el.getAnimations({subtree:true}).some(a=>a.effect.getTiming().duration===450))).toBe(true);
  await page.locator('#toolkit-categories').evaluate(el=>{el.querySelector('[data-tech="4"]').click();});
  await verifyTools(page,4);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.locator('#toolkit-categories').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await card(page,3).click();await verifyTools(page,3);
  expect(await page.locator('#toolkit-categories').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
});
