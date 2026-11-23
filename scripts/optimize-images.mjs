import sharp from 'sharp';
import { readFile, stat, writeFile } from 'node:fs/promises';

// Generate only active assets from the retained originals, without replacing a
// smaller existing file with a larger encoding of equivalent quality.
const variants = [
  ['design-assets/originals/hero-fondo.png', 'src/app/features/profile/presentation/home/assets/hero-fondo-1280.webp', 1280],
  ['design-assets/originals/hero-fondo.png', 'src/app/features/profile/presentation/home/assets/hero-fondo-1802.webp', 1802],
  ['design-assets/originals/about.png', 'src/app/features/profile/presentation/about/assets/about-384.webp', 384],
  ['design-assets/originals/about.png', 'src/app/features/profile/presentation/about/assets/about.webp', 530],
];
for (const [source, target, width] of variants) {
  const output = await sharp(await readFile(source)).resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toBuffer();
  const existing = await stat(target).catch(() => null);
  if (!existing || output.length < existing.size) {
    await writeFile(target, output);
    console.log(`${target}: ${output.length} bytes${existing ? ` (antes ${existing.size})` : ''}`);
  } else console.log(`${target}: se conserva el archivo existente (${existing.size} bytes)`);
}
