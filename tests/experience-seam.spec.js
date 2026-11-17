import {test,expect,devices} from '@playwright/test';
import sharp from 'sharp';

for (const [width,height,deviceScaleFactor] of [[375,812,3],[390,844,3],[430,932,3],[1440,900,1.25]]) {
  test.describe(`Experience aperture handoff at ${width}px`,()=>{
    test.use({viewport:{width,height},deviceScaleFactor,isMobile:width<=430,hasTouch:width<=430,
      ...(width<=430?{userAgent:devices['iPhone 13'].userAgent}:{})});
    test('fractional overlay edges leave the live particles uninterrupted and reverse correctly',async({page},testInfo)=>{
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto('/#experiencia');
      await page.evaluate(()=>document.fonts.ready);
      await expect(page.locator('#experiencia')).toHaveAttribute('data-journey-enabled','');
      const seek=async time=>{
        await page.locator('.experience-content').evaluate((e,time)=>scrollTo(0,e.getBoundingClientRect().top+scrollY+innerHeight*8.5*time/10.3),time);
        await page.waitForTimeout(850); // Let the existing scrub reach the requested narrative moment.
      };
      const backdrop=page.locator('.experience-backdrop');
      await seek(.85);
      await expect(page.locator('app-experience-valley')).toHaveAttribute('data-ready','true');
      await expect(backdrop).toHaveCSS('opacity','0');
      await expect(page.locator('app-experience-valley')).toHaveCSS('opacity','0.7');
      await expect(page.locator('app-experience-valley canvas')).toBeVisible();

      // Reproduce a frame of the scrub between CSS pixels. The old light-backed
      // clipping edge drew a gray horizontal stripe at this exact boundary.
      await page.evaluate(()=>{
        const y=Math.floor(innerHeight*.3)+.5;
        document.querySelector('.experience-backdrop').style.transform=`translate3d(0,${-y}px,0)`;
        document.querySelector('.experience-valley-preview').style.transform=`translate3d(0,${y}px,0)`;
      });
      const edge=await backdrop.evaluate(e=>e.getBoundingClientRect().bottom);
      const actual=await page.screenshot({path:testInfo.outputPath('particles-with-fractional-overlay.png'),scale:'css'});
      await backdrop.evaluate(e=>e.style.visibility='hidden');
      const reference=await page.screenshot({path:testInfo.outputPath('live-valley-reference.png'),scale:'css'});
      const pixels=async png=>sharp(png).extract({left:0,top:Math.floor(edge)-8,width,height:16}).removeAlpha().raw().toBuffer();
      const a=await pixels(actual), b=await pixels(reference);
      const rowDifferences=Array.from({length:16},(_,y)=>{
        let sum=0;
        for(let x=0;x<width*3;x++) sum+=Math.abs(a[y*width*3+x]-b[y*width*3+x]);
        return sum/(width*3);
      });
      // The live particles keep moving between screenshots. Their small local
      // differences are allowed; the former full-width gray stripe is not.
      expect(Math.max(...rowDifferences),'No horizontal stripe may appear at the fractional clipping edge').toBeLessThan(8);
      await backdrop.evaluate(e=>e.style.removeProperty('visibility'));

      const rules=await page.locator('.experience-grid .grid-rule').evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().top));
      expect(rules).toEqual([84,height-32]);
      await expect(page.locator('.experience-grid .grid-rule')).toHaveCount(2);
      expect(await page.locator('.title-composition').evaluate(e=>getComputedStyle(e,'::before').backgroundColor)).toBe('rgb(238, 160, 255)');

      // Reverse into the original oval opening, including its themed backdrop.
      await page.locator('#experiencia').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY+innerHeight*1.25*.6));
      await expect(backdrop).toHaveCSS('opacity','1');
      await expect(backdrop).toHaveCSS('background-color','rgb(255, 255, 255)');
      await seek(.85);
      await expect(backdrop).toHaveCSS('opacity','0');
      if(width<=430){
        // Model an iPhone browser toolbar changing the available screen height.
        await page.setViewportSize({width,height:height-110});
        await expect.poll(()=>page.locator('.experience-grid').evaluate(e=>e.clientHeight)).toBe(height-110);
        await seek(.85);
        await expect(backdrop).toHaveCSS('opacity','0');
        await expect(page.locator('app-experience-valley canvas')).toBeVisible();
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
        await page.screenshot({path:testInfo.outputPath('after-toolbar-resize.png'),scale:'css'});
      }
      expect(errors).toEqual([]);
    });
  });
}
