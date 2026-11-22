import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { serveProduction } from './serve-production.mjs';

// Browser prerender for the Angular app. This is static HTML followed
// by a client bootstrap, not Angular SSR hydration.
const server = await serveProduction(5186);
let browser;
try {
  const onVercel = process.env.VERCEL === '1' && process.platform === 'linux';
  if (onVercel) {
    const { default: serverChromium } = await import('@sparticuz/chromium');
    browser = await chromium.launch({ args: serverChromium.args, executablePath: await serverChromium.executablePath(), headless: true });
  } else {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5186', { waitUntil: 'networkidle' });
  await page.locator('app-root[data-ready]').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) throw new Error(errors.join('\n'));
  const snapshot = await page.evaluate(() => {
    const root = document.querySelector('app-root').cloneNode(true);
    root.removeAttribute('data-ready');
    root.querySelectorAll('canvas, app-floating-controls, app-editorial-grid, app-cinematic-intro').forEach(node => node.remove());
    root.querySelectorAll('[style]').forEach(node => node.removeAttribute('style'));
    // No dead controls in the static fallback; client bootstrap adds them back.
    root.querySelectorAll('button').forEach(node => node.setAttribute('disabled', ''));
    root.querySelectorAll('.is-pending, .hero-intro-pending').forEach(node => node.classList.remove('is-pending', 'hero-intro-pending'));
    const styles = [...document.head.querySelectorAll('style')].filter(node => /_ng(content|host)/.test(node.textContent))
      .map(node => `<style data-prerender-style>${node.textContent}</style>`).join('');
    return { root: root.outerHTML.replaceAll('http://127.0.0.1:5186', ''), styles: styles.replaceAll('http://127.0.0.1:5186', '') };
  });
  let html = await readFile('dist/index.html', 'utf8');
  html = html.replace('<app-root></app-root>', snapshot.root).replace('</head>', `${snapshot.styles}</head>`);
  await writeFile('dist/index.html', html);
  console.log(`Prerendered index.html: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KiB, with readable content before JavaScript.`);
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
