import { test, expect } from '@playwright/test';

test('original transparent cat anchors the editorial composition with the full Hero visible in both languages',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[1440,900],[1536,864]]){
    await page.setViewportSize({width,height});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
    for(const language of ['en','es']){
      await page.locator(`[data-language="${language}"]`).click();
      await page.locator('.hero-cat-image').evaluate(image=>image.decode());
      const metrics=await page.evaluate(()=>{
        const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
        const image=document.querySelector('.hero-cat-image'),style=getComputedStyle(image);
        return{hero:rect('#home'),code:rect('.hero-code'),data:rect('.hero-data'),curiosity:rect('.hero-curiosity'),cat:rect('.hero-cat'),strip:rect('.hero-bottom'),
          image:[image.naturalWidth,image.naturalHeight],src:decodeURI(new URL(image.src).pathname),fit:style.objectFit,filter:style.filter,
          photoBackground:getComputedStyle(document.querySelector('.hero-photo')).backgroundColor,
          buttons:[...document.querySelectorAll('.hero-actions a')].map(el=>({bottom:el.getBoundingClientRect().bottom})),
        };
      });
      expect(metrics.image).toEqual([1536,1024]);expect(metrics.src).toBe('/assets/profile/hero/Gato negro de ojos neón.png');expect(metrics.fit).toBe('contain');expect(metrics.filter).toBe('none');expect(metrics.photoBackground).toBe('rgba(0, 0, 0, 0)');
      expect(metrics.cat.left).toBeLessThan(metrics.code.right);
      expect(metrics.cat.right).toBeGreaterThan(metrics.data.left);
      expect(Math.abs((metrics.cat.left+metrics.cat.right)/2-width/2)).toBeLessThan(width*.06);
      expect(metrics.curiosity.top).toBeGreaterThan(metrics.cat.top+100);
      expect(metrics.cat.right).toBeLessThan(width);expect(metrics.cat.top).toBeGreaterThan(0);
      expect(metrics.strip.top-metrics.cat.bottom).toBeGreaterThan(20);
      expect(metrics.hero.bottom).toBeLessThanOrEqual(height+1);expect(metrics.strip.bottom).toBeLessThanOrEqual(height-20);
      for(const button of metrics.buttons)expect(button.bottom).toBeLessThan(height);
      await expect(page.locator('.portrait-placeholder,.portrait-quote')).toHaveCount(0);
      if(language==='es')await page.screenshot({path:`test-results/mascot-${width}.png`});
    }
  }
  // Confirm the decoded original has transparent exterior pixels and an opaque head.
  const alpha=await page.locator('.hero-cat-image').evaluate(image=>{
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    return{corner:ctx.getImageData(0,0,1,1).data[3],head:ctx.getImageData(768,512,1,1).data[3]};
  });
  expect(alpha.corner).toBe(0);expect(alpha.head).toBeGreaterThan(240);expect(errors).toEqual([]);
});

test('cat floats gently, pointer stays within five pixels per axis and reduced motion stops it',async({page})=>{
  await page.setViewportSize({width:1536,height:864});await page.goto('/');
  await expect(page.locator('.hero-cat-image')).toHaveCSS('opacity','1');
  const float=page.locator('.hero-cat-float');await expect(float).toHaveCSS('animation-duration','4.8s');
  const before=await float.evaluate(el=>getComputedStyle(el).transform);
  await expect.poll(()=>float.evaluate(el=>getComputedStyle(el).transform)).not.toBe(before);
  await page.mouse.move(1480,120);
  await expect.poll(()=>page.locator('.hero-photo').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m41)).toBeGreaterThan(3);
  const movement=await page.locator('.hero-photo').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return{x:m.m41,y:m.m42,rotation:m.b};});
  expect(Math.abs(movement.x)).toBeLessThanOrEqual(5);expect(Math.abs(movement.y)).toBeLessThanOrEqual(5);expect(movement.rotation).toBe(0);
  await page.emulateMedia({reducedMotion:'reduce'});await expect(float).toHaveCSS('animation-name','none');await expect(float).toHaveCSS('transform','none');
  await page.mouse.move(100,100);await expect(page.locator('.hero-photo')).toHaveCSS('transform','none');
});

test('mobile and tablet retain the central poster and readable actions without horizontal overflow',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [320,390,640,700,768,1024]){
    await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
    await page.locator('.hero-cat-image').evaluate(image=>image.decode());
    const geometry=await page.evaluate(()=>{
      const r=s=>document.querySelector(s).getBoundingClientRect().toJSON();
      return{code:r('.hero-code'),data:r('.hero-data'),curiosity:r('.hero-curiosity'),cat:r('.hero-cat'),actions:r('.hero-actions'),strip:r('.hero-bottom'),overflow:document.documentElement.scrollWidth-innerWidth};
    });
    expect(geometry.overflow,`overflow at ${width}px`).toBeLessThanOrEqual(1);
    for(const word of [geometry.code,geometry.data,geometry.curiosity]){
      expect(word.left,`word clipped on left at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(word.right,`word clipped on right at ${width}px`).toBeLessThanOrEqual(width);
    }
    expect(geometry.cat.left).toBeLessThan(geometry.code.right);
    expect(geometry.cat.right).toBeGreaterThan(geometry.data.left);
    expect(geometry.curiosity.top).toBeGreaterThan(geometry.code.bottom);
    expect(geometry.cat.bottom).toBeLessThan(geometry.strip.top);expect(geometry.cat.right).toBeLessThan(width);
    await page.locator('.hero-actions .button-dark').scrollIntoViewIfNeeded();await expect(page.locator('.hero-actions .button-dark')).toBeInViewport();
    if(width===390)await page.screenshot({path:'test-results/mascot-mobile.png'});
  }
});
