import { test, expect } from '@playwright/test';

test('contact composition stays inside the panel in both languages and responsive sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1920, 1440, 1200, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ['English', 'Español']) {
      await page.getByRole('button', { name: language, exact: true }).click();
      const geometry = await page.locator('#contact').evaluate(section => {
        const box = selector => section.querySelector(selector).getBoundingClientRect();
        const panel=box('.contact-poster'),title=box('.contact-title'),art=box('.contact-art');
        return {
          overflow:document.documentElement.scrollWidth-innerWidth,
          titleInside:title.left>=panel.left && title.right<=panel.right && title.bottom<=panel.bottom,
          artInside:art.left>=panel.left && art.right<=panel.right && art.bottom<=panel.bottom,
          separate:innerWidth>700?title.right<=art.left+1:title.bottom<art.top,
        };
      });
      expect(geometry).toEqual({overflow:0,titleInside:true,artInside:true,separate:true});
      await expect(page.locator('#contact .back-top')).toBeVisible();
    }
  }
  await expect(page.locator('#contact-title')).toHaveText('HAGAMOSALGOSIGNIFICATIVO.');
  await expect(page.locator('#contact .contact-availability')).toHaveCount(1);
  await expect(page.locator('#contact .contact-links a')).toHaveCount(3);
  await expect(page.locator('#contact .contact-links a').nth(0)).toHaveAttribute('href','mailto:cleo.espivas@gmail.com');
  await expect(page.locator('#contact .contact-links a').nth(1)).toHaveAttribute('href','https://www.linkedin.com/in/camilla-leonor-espinoza-vivas-4ba5b2361/');
  await expect(page.locator('#contact .contact-links a').nth(2)).toHaveAttribute('href','https://github.com/C7leo');
});

test('original cat retains alpha and contain styling; verified contact values create working destinations', async ({ page }) => {
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const image=document.querySelector('.contact-art-image');
    image.loading='eager';await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const context=canvas.getContext('2d');context.drawImage(image,0,0);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    let transparent=false,opaque=false;
    for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent=true;if(pixels[i]>240)opaque=true;}
    const {renderContact}=await import('/src/modules/profile/presentation/contact/contact.js');
    const fixture=document.createElement('div');fixture.innerHTML=renderContact({email:'camilla@example.com',linkedin:'https://www.linkedin.com/in/test-camilla',github:'https://github.com/test-camilla',cv:'/test-cv.pdf'});
    return {src:image.getAttribute('src'),fit:getComputedStyle(image).objectFit,filter:getComputedStyle(image).filter,transparent,opaque,
      links:[...fixture.querySelectorAll('.contact-links a')].map(a=>({href:a.getAttribute('href'),download:a.hasAttribute('download'),target:a.getAttribute('target')}))};
  });
  expect(result).toMatchObject({src:'/assets/profile/contact/07_gato.png',fit:'contain',filter:'none',transparent:true,opaque:true});
  expect(result.links).toEqual([
    {href:'mailto:camilla@example.com',download:false,target:null},
    {href:'https://www.linkedin.com/in/test-camilla',download:false,target:'_blank'},
    {href:'https://github.com/test-camilla',download:false,target:'_blank'},
    {href:'/test-cv.pdf',download:true,target:null},
  ]);
});

test('back to top works and decorative motion pauses outside the section',async({page})=>{
  await page.goto('/');
  await page.locator('#contact .back-top').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact')).toHaveClass(/contact-is-visible/);
  await expect(page.locator('.contact-art-image')).toHaveCSS('animation-play-state','running');
  await page.locator('#contact .back-top').click();
  await expect.poll(()=>page.evaluate(()=>scrollY),{timeout:10000}).toBeLessThan(2);
  await expect(page.locator('.contact-art-image')).toHaveCSS('animation-play-state','paused');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#contact .back-top').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-art-image')).toHaveCSS('animation-name','none');
  await page.locator('#contact .back-top').click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(2);
});
