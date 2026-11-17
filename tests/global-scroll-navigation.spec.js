import {test,expect,devices} from '@playwright/test';

for(const [width,height] of [[375,812],[390,844],[430,932]]){
 test.describe(`global mobile navigation at ${width}px`,()=>{
  test.use({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:3,userAgent:devices['iPhone 13'].userAgent});
  test('stays painted and interactive across chapter boundaries and themes',async({page,browserName},testInfo)=>{
   test.setTimeout(browserName==='webkit'?240000:90000);
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(()=>sessionStorage.setItem('camilla-cinematic-intro-seen','1'));
   await page.goto('/');
   await page.evaluate(()=>document.fonts.ready);
   const cue=page.locator('.floating-scroll-cue'),theme=page.locator('.floating-theme-toggle');
   await expect(cue).toBeVisible();
   await expect(page.locator('.about-story')).toHaveClass(/is-enhanced/);
   await page.waitForTimeout(400);
   await page.evaluate(()=>{
    window.originalScrollCue=document.querySelector('.floating-scroll-cue');
    window.scrollCueFailures=[];
    window.observeScrollCue=true;
    const sample=()=>{
     if(!window.observeScrollCue)return;
     const el=document.querySelector('.floating-scroll-cue'),s=getComputedStyle(el);
     if(el!==window.originalScrollCue||s.visibility==='hidden'||Number(s.opacity)<.99)window.scrollCueFailures.push({y:scrollY,classes:el.className,opacity:s.opacity});
     requestAnimationFrame(sample);
    };requestAnimationFrame(sample);
   });
   const verify=async()=>{
    await expect(cue).toBeVisible();await expect(theme).toBeVisible();
    await expect(cue).toHaveAttribute('tabindex','0');
    await expect(cue).not.toHaveAttribute('aria-hidden','true');
    const a=await cue.boundingBox(),b=await theme.boundingBox();
    if(!(await cue.getAttribute('class')).includes('at-home')){
     expect(a.x).toBeCloseTo(10,0);
     expect(width-b.x-b.width).toBeCloseTo(a.x,0);
     expect(a.y+a.height).toBeCloseTo(b.y+b.height,0);
     expect(height-a.y-a.height).toBeCloseTo(44,0);
    }
    expect(await cue.evaluate(e=>{const b=e.getBoundingClientRect();return e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}),'The viewport control must receive taps above the animated sections').toBe(true);
   };
   const enter=async(selector,position)=>{
    await page.locator(selector).first().evaluate(async(e,position)=>{
     const target=Math.max(0,e.getBoundingClientRect().top+scrollY-innerHeight*position),start=scrollY;
     for(let step=1;step<=8;step++){
      scrollTo(0,start+(target-start)*step/8);
      await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
     }
    },position);
    await page.waitForTimeout(120);
    await verify();
   };
   for(const color of ['light','dark']){
    const current=await page.locator('html').getAttribute('data-theme');
    if(current!==color)await theme.click();
    // Include the requested Experience -> Services return as well as DOM order.
    for(const [name,selector] of [['about','#sobre-mi'],['skills','.technology-marquee'],['projects','#proyectos'],['experience','#experiencia'],['services','#servicios'],['contact','#contacto']]){
     for(const position of [.92,.55,.08])await enter(selector,position);
     await page.screenshot({path:testInfo.outputPath(`${color}-${name}-boundary.png`),scale:'css'});
    }
    // Reproduce the title collision that previously applied .is-hidden.
    await page.locator('.gallery-intro').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-innerHeight+84));
    await page.waitForTimeout(950);
    await verify();
    await expect(cue).toHaveClass(/on-dark/);
    await expect(page.locator('.scroll-arrow')).toHaveCSS('color','rgb(226, 244, 166)');
    await page.screenshot({path:testInfo.outputPath(`${color}-skills-projects-regression.png`),scale:'css'});
   }
   await page.evaluate(()=>window.observeScrollCue=false);
   expect(await page.evaluate(()=>window.scrollCueFailures)).toEqual([]);
   await expect(page.locator('.scroll-arrow')).toHaveCSS('animation-name',/scroll-invitation$/);
   const before=await page.evaluate(()=>scrollY);
   await cue.click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+100);
   // A transparent aperture must not turn a white-on-black cue dark.
   await page.locator('.experience-content').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY+innerHeight*8.5*.85/10.3));
   await expect(page.locator('.experience-backdrop')).toHaveCSS('opacity','0');
   await expect(cue).toHaveClass(/on-dark/);
   await theme.click();
   await expect(page.locator('html')).toHaveAttribute('data-theme','light');
   await expect(cue).toHaveClass(/on-dark/);
   await verify();
   await page.setViewportSize({width,height:height-100});
   await expect.poll(async()=>{const b=await cue.boundingBox();return height-100-b.y-b.height;}).toBeCloseTo(44,0);
   expect(errors).toEqual([]);
  });
 });
}
