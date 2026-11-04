import { test, expect } from '@playwright/test';

test('desktop narrative, scroll visualization and interactive controls',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/');await expect(page.locator('h1')).toContainText('Camilla');
  await expect(page.locator('.hero-bottom')).toHaveCSS('opacity','1');
  await expect(page.locator('.hero-art')).toHaveCSS('clip-path','none');
  await page.screenshot({path:'test-results/desktop-hero.png'});
  await page.locator('#data').scrollIntoViewIfNeeded();
  await expect(page.locator('.data-visual')).toHaveClass(/webgl-ready/);
  const before=await page.locator('.data-visual canvas').screenshot();
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#data').offsetTop+window.innerHeight*.95,behavior:'instant'}));
  await expect(page.locator('.pipeline-step.active')).toHaveCount(5);
  await expect(page.locator('#stage-description')).toContainText('reporting');
  await page.screenshot({path:'test-results/data-scene.png'});
  await page.evaluate(()=>window.scrollTo({top:document.querySelector('#data').offsetTop+window.innerHeight*1.2,behavior:'instant'}));
  await expect(page.locator('.pipeline-step.active')).toHaveCount(6);
  const after=await page.locator('.data-visual canvas').screenshot();
  expect(before.equals(after)).toBe(false);
  await page.locator('#navigation a[href="#work"]').click();await page.locator('#trace-demo').click();
  await expect(page.locator('#drawing-status')).toContainText('example');
  await page.locator('#clear-drawing').click();await expect(page.locator('#drawing-status')).toContainText('fresh start');
  const canvas=page.locator('#drawing');const box=await canvas.boundingBox();
  await page.mouse.move(box.x+20,box.y+50);await page.mouse.down();await page.mouse.move(box.x+120,box.y+80,{steps:10});await page.mouse.up();
  await expect(page.locator('#drawing-status')).toContainText('Your line');
  await page.locator('#open-case').click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.locator('#open-case')).toBeFocused();
  await page.locator('[data-tech="4"]').click();await expect(page.locator('#tech-name')).toHaveText('Cloud & automation');
  await expect(page.locator('[data-tech="4"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await page.screenshot({path:'test-results/desktop-full.png',fullPage:true});
  expect(errors).toEqual([]);
});

test('mobile navigation, layout and touch-friendly controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.getByRole('button',{name:'Menu'}).click();await expect(page.locator('#navigation')).toBeVisible();
  await page.locator('#navigation a[href="#work"]').click();await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded','false');
  for(const section of ['#home','#data','#about','#work','#journey','#ecosystem','#contact']){
    await page.locator(section).scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.locator('#home').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/mobile-hero.png'});
  await page.screenshot({path:'test-results/mobile-full.png',fullPage:true});
});

test('reduced motion keeps a complete readable narrative',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.locator('#data').scrollIntoViewIfNeeded();
  await expect(page.locator('#stage-description')).toContainText('clearer system');
  const sizes=await page.locator('#data').evaluate(el=>({height:el.offsetHeight,innerHeight}));expect(sizes.height).toBeLessThan(sizes.innerHeight*1.5);
  await page.locator('#contact').scrollIntoViewIfNeeded();await expect(page.locator('#contact h2')).toBeVisible();
  expect(await page.locator('#contact h2').evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
});

test('WebGL failure leaves the conceptual fallback and navigation usable',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
  await page.goto('/');await page.locator('#data').scrollIntoViewIfNeeded();await expect(page.locator('.data-visual')).toHaveClass(/fallback-active/);
  await expect(page.locator('.data-fallback')).toBeVisible();await expect(page.locator('#data-title')).toBeVisible();
  await page.locator('#navigation a[href="#work"]').click();
  await page.locator('#open-case').click();await expect(page.getByRole('dialog')).toBeVisible();
});

test('small phones, tablet and wide layouts retain content within the viewport',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,768,1024,1920]){
    await page.setViewportSize({width,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
    const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,name:[...document.querySelectorAll('h1 .hero-headline-line')].map(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}))}));
    expect(metrics.scroll,`Horizontal overflow at ${width}px`).toBeLessThanOrEqual(metrics.width);
    const art=await page.locator('.hero-art').boundingBox(), actions=await page.locator('.hero-actions').boundingBox();
    expect(art.y+art.height,`Illustration overlaps actions at ${width}px`).toBeLessThan(actions.y);
    for(const letter of metrics.name){expect(letter.left).toBeGreaterThanOrEqual(0);expect(letter.right).toBeLessThanOrEqual(width);}
    await page.locator('#ecosystem').scrollIntoViewIfNeeded();await page.locator('[data-tech="2"]').click();await expect(page.locator('#tech-name')).toHaveText('Reporting');
  }
});

test('section slides overlap, reverse with scroll, and keep keyboard navigation usable',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  const workTop=await page.locator('#about').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  await page.evaluate(top=>scrollTo({top:top-innerHeight*.75,behavior:'instant'}),workTop);
  await expect.poll(()=>page.locator('#home').evaluate(el=>Math.abs(el.getBoundingClientRect().bottom-innerHeight))).toBeLessThanOrEqual(2);
  await page.evaluate(top=>scrollTo({top:top-innerHeight*.5,behavior:'instant'}),workTop);
  await expect.poll(()=>page.locator('#about').evaluate(el=>Math.abs(el.getBoundingClientRect().top-innerHeight*.5))).toBeLessThanOrEqual(2);
  expect(await page.locator('#home').evaluate(el=>Math.abs(el.getBoundingClientRect().bottom-innerHeight))).toBeLessThanOrEqual(2);
  await page.screenshot({path:'test-results/section-transition.png'});
  await page.evaluate(top=>scrollTo({top:top-innerHeight*.75,behavior:'instant'}),workTop);
  await expect.poll(()=>page.locator('#about').evaluate(el=>Math.abs(el.getBoundingClientRect().top-innerHeight*.75))).toBeLessThanOrEqual(2);
  await page.locator('#open-case').focus();await expect(page.locator('#open-case')).toBeFocused();
  await expect.poll(()=>page.locator('#work').evaluate(el=>Math.round(el.getBoundingClientRect().top))).toBeLessThanOrEqual(200);
  await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await expect(page.locator('#work')).toHaveAttribute('data-transition','flow');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('#work')).toHaveCSS('clip-path','none');
});

test('reference Hero buttons navigate and collage responds to the pointer',async({page})=>{
  await page.setViewportSize({width:1672,height:941});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.hero-bottom')).toHaveCSS('opacity','1');await expect(page.locator('.hero-art')).toHaveCSS('clip-path','none');
  await expect(page.locator('.hero-cat-image')).toBeVisible();
  const initial=await page.locator('.hero-photo').evaluate(el=>getComputedStyle(el).transform);
  await page.mouse.move(1550,300);
  await expect.poll(()=>page.locator('.hero-photo').evaluate(el=>getComputedStyle(el).transform)).not.toBe(initial);
  await page.locator('.hero-actions .button-dark').click();await expect(page).toHaveURL(/#work$/);
  await expect.poll(()=>page.locator('#work').evaluate(el=>Math.abs(el.getBoundingClientRect().top-document.querySelector('.header').offsetHeight-20))).toBeLessThan(3);
  await page.getByRole('link',{name:'Portfolio home',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(3);
  await page.locator('.hero-actions .button-outline').click();await expect(page).toHaveURL(/#contact$/);
  await expect.poll(()=>page.locator('#contact').evaluate(el=>Math.abs(el.getBoundingClientRect().top-document.querySelector('.header').offsetHeight-20))).toBeLessThan(3);
});

test('desktop editorial Hero keeps its central image, typography and footer inside the viewport',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[1440,900],[1536,864],[1600,900]]){
    await page.setViewportSize({width,height});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
    const geometry=await page.evaluate(()=>{
      const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
      return{header:rect('.header'),hero:rect('#home'),headlines:[...document.querySelectorAll('.hero-headline-line')].map(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};}),portrait:rect('.hero-art'),labels:rect('.hero-right-list'),strip:rect('.hero-bottom'),buttons:[...document.querySelectorAll('.hero-actions a')].map(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};})};
    });
    for(const item of [geometry.header,...geometry.headlines,geometry.portrait,geometry.labels,geometry.strip,...geometry.buttons]){
      expect(item.top,`${width}: item above viewport`).toBeGreaterThanOrEqual(0);
      expect(item.bottom,`${width}: item below Hero`).toBeLessThanOrEqual(geometry.hero.bottom);
      expect(item.left,`${width}: item clipped on left`).toBeGreaterThanOrEqual(0);
      expect(item.right,`${width}: item clipped on right`).toBeLessThanOrEqual(width);
    }
    expect(geometry.hero.bottom-geometry.strip.bottom,`${width}: insufficient breathing room below strip`).toBeGreaterThanOrEqual(30);
    expect(geometry.hero.bottom).toBeLessThanOrEqual(height+1);
    expect(geometry.strip.top-geometry.portrait.bottom,`${width}: portrait touches strip`).toBeGreaterThanOrEqual(12);
    await page.screenshot({path:`test-results/hero-fit-${width}x${height}.png`});
  }
});
