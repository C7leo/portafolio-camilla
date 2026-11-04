import { test, expect } from '@playwright/test';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicRoot=fileURLToPath(new URL('../public/',import.meta.url));
async function mediaFiles(directory=publicRoot){
  const entries=await readdir(directory,{withFileTypes:true});
  return (await Promise.all(entries.map(entry=>entry.isDirectory()?mediaFiles(path.join(directory,entry.name)):path.join(directory,entry.name)))).flat().filter(file=>/\.(png|jpe?g|webp|svg|mp4)$/i.test(file));
}

test('every published media asset is used by a current section and resolves at its new URL',async({page,request})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.locator('.card-swap').waitFor();
  const referenced=new Set();
  async function collect(){
    const urls=await page.evaluate(()=>{
      const media=[...document.querySelectorAll('img,video,link[rel="icon"]')].flatMap(element=>['src','poster','data-src','href'].map(attribute=>element.getAttribute(attribute)).filter(Boolean));
      const mask=getComputedStyle(document.querySelector('.data-video')).maskImage;
      const maskURL=mask.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if(maskURL)media.push(maskURL);
      return media.map(url=>decodeURI(new URL(url,location.href).pathname));
    });
    urls.forEach(url=>referenced.add(url));
  }
  await collect();
  for(let index=0;index<6;index++){
    await page.locator(`[data-tech="${index}"]`).click();
    await expect(page.locator('#tech-panel')).toHaveAttribute('data-category',String(index));
    await collect();
  }
  const published=(await mediaFiles()).map(file=>'/'+path.relative(publicRoot,file).replaceAll('\\','/')).sort();
  expect(published.filter(url=>!referenced.has(url)),'published media without a current consumer').toEqual([]);
  expect([...referenced].filter(url=>!published.includes(url)),'references to removed or missing media').toEqual([]);
  for(const url of published){
    const response=await request.get(encodeURI(url));
    expect(response.ok(),url).toBe(true);
    expect(response.headers()['content-type'],url).toMatch(/^(image|video)\//);
  }
});
