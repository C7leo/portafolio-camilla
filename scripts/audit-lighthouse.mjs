import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';
import { serveProduction } from './serve-production.mjs';

await mkdir('.local/performance', { recursive: true });
const externalUrl = process.env.AUDIT_URL;
const server = externalUrl ? undefined : await serveProduction(5187);
let chrome;
try {
  chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });
  for (const desktop of [false, true]) {
    const name = desktop ? 'desktop' : 'mobile';
    const result = await lighthouse(externalUrl || 'http://127.0.0.1:5187', {
      port: chrome.port, output: ['html', 'json'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      ...(desktop ? { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } : {}),
    });
    if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message || 'Lighthouse produced no report');
    await writeFile(`.local/performance/${name}.html`, result.report[0]);
    await writeFile(`.local/performance/${name}.json`, result.report[1]);
    console.log(`${name}:`, Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])));
  }
} finally {
  await chrome?.kill();
  if (server) await new Promise(resolve => server.close(resolve));
}
