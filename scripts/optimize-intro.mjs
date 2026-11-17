import { spawnSync } from 'node:child_process';
import { stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Run explicitly after editing the source movie; never download encoders in CI.
const ffmpeg = process.env.FFMPEG_BINARY || 'ffmpeg';
const directory = 'src/app/shell/intro/assets';
const original = path.join(directory, 'cinematic-intro.mp4');
function run(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFmpeg exited ${result.status}`);
}
run(['-i', original, '-map', '0:v:0', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(directory, 'cinematic-intro.optimized.mp4')]);
run(['-i', original, '-map', '0:v:0', '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '28', '-row-mt', '1', '-cpu-used', '2', '-pix_fmt', 'yuv420p', path.join(directory, 'cinematic-intro.webm')]);
run(['-i', original, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '90', path.join(directory, 'cinematic-intro-poster.webp')]);
await mkdir('.local/intro-restoration', { recursive: true });
const sizes = {};
for (const name of ['cinematic-intro.mp4', 'cinematic-intro.optimized.mp4', 'cinematic-intro.webm', 'cinematic-intro-poster.webp']) {
  sizes[name] = (await stat(path.join(directory, name))).size;
}
await writeFile('.local/intro-restoration/video-sizes.json', JSON.stringify(sizes, null, 2));
console.log(sizes);
