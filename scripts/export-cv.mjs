import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const inline = value => escape(value).replace(/https:\/\/[^\s<]+/g, url => `<a href="${url}">${url}</a>`).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
function render(source) {
  const output = []; let list = false, paragraph = [];
  const flush = () => { if (paragraph.length) { output.push(`<p>${paragraph.join('<br>')}</p>`); paragraph = []; } };
  const closeList = () => { if (list) { output.push('</ul>'); list = false; } };
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim()) { flush(); closeList(); continue; }
    const heading = /^(#{1,3}) (.+)$/.exec(line);
    if (heading) { flush(); closeList(); output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); }
    else if (line.startsWith('- ')) { flush(); if (!list) { output.push('<ul>'); list = true; } output.push(`<li>${inline(line.slice(2))}</li>`); }
    else { closeList(); paragraph.push(inline(line)); }
  }
  flush(); closeList(); return output.join('\n');
}
const browser = await chromium.launch({ channel: 'chrome' });
await fs.mkdir('public/cv', { recursive: true });
await fs.mkdir('.local/cv-exports', { recursive: true });
const report = [];
try {
  for (const [source, filename, lang] of [['docs/career/CV_Camilla.md', 'CV_Camilla_Espinoza.pdf', 'es'], ['docs/career/CV_Camila_Espinoza_ATS_EN.md', 'CV_Camilla_Espinoza_EN.pdf', 'en']]) {
    const markdown = await fs.readFile(source, 'utf8');
    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>Camilla Leonor Espinoza Vivas — CV</title><style>
      @page{size:A4;margin:12mm 13mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.2;color:#171717;margin:0}h1{font-size:17pt;line-height:1.1;margin:0 0 5pt}h2{font-size:10.5pt;margin:9pt 0 4pt;break-after:avoid}h3{font-size:10pt;margin:6pt 0 2pt;break-after:avoid}p{margin:0 0 4pt;orphans:2;widows:2;break-inside:avoid}ul{margin:2pt 0 5pt;padding-left:13pt}li{margin:0 0 2pt;break-inside:avoid}a{color:inherit;text-decoration:none;overflow-wrap:anywhere}strong{font-weight:700}
    </style></head><body>${render(markdown)}</body></html>`;
    await fs.writeFile(`.local/cv-exports/${filename}.html`, html);
    const page = await browser.newPage(); await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ path: path.join('public/cv', filename), format: 'A4', printBackground: false, preferCSSPageSize: true, tagged: true });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
    report.push({ source, filename, pages, bytes: pdf.length, words: markdown.split(/\s+/).length });
    await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile('.local/cv-exports/pdf-export.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
