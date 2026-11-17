import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

async function walk(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}

// Keep originals as editable sources. Only optimized variants are referenced by the app.
const files = (await walk('src')).filter(file => file.endsWith('.png'));
let original = 0, optimized = 0;
for (const file of files) {
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const widths = file.endsWith('logo.png') ? [72, 144] : file.endsWith('night-lily.png') ? [960, width] : [480, 960, Math.min(width, 1920)];
  for (const size of [...new Set(widths)].slice(0, -1)) {
    const target = file.replace('.png', `-${size}.webp`);
    await image.clone().resize({ width: size, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(target);
  }
  const largest = Math.max(...widths);
  const target = file.replace('.png', '.webp');
  await image.clone().resize({ width: largest, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toFile(target);
  original += (await stat(file)).size;
  optimized += (await stat(target)).size;
  console.log(`${path.basename(file)}: ${width}×${height} → ${largest}px WebP`);
}
await mkdir('.local/performance', { recursive: true });
await writeFile('.local/performance/image-sizes.json', JSON.stringify({ original, optimized }));
console.log(`Primary variants: ${(original / 1e6).toFixed(2)} MB → ${(optimized / 1e6).toFixed(2)} MB`);
