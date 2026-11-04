// Run with ffmpeg on PATH, or set FFMPEG to its absolute executable path.
// The original is preserved. Runtime only needs the generated public/assets files.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const source = resolve(process.argv[2] || 'resources/data-story/03_video-original.mp4');
const destination = resolve('public/assets/data-story/video/03_video.mp4');
if (source === destination) throw new Error('Choose an original outside the output path.');
mkdirSync(resolve('public/assets/data-story/video'), { recursive: true });
mkdirSync(resolve('public/assets/data-story/stages'), { recursive: true });
function run(args) {
  const result = spawnSync(ffmpeg, args, { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
  return result;
}
run(['-hide_banner', '-loglevel', 'error', '-i', source, '-map', '0:v:0', '-an',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-r', '24', '-pix_fmt', 'yuv420p',
  '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-bf', '0', '-movflags', '+faststart', '-y', destination]);
const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', destination], { encoding: 'utf8', windowsHide: true });
const duration = probe.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
if (!duration) throw new Error('Cannot read output duration.');
const seconds = +duration[1] * 3600 + +duration[2] * 60 + +duration[3];
for (const [index, position] of [0, .2, .4, .52, .7, .98].entries()) {
  run(['-hide_banner', '-loglevel', 'error', '-ss', String(position * seconds), '-i', destination,
    '-frames:v', '1', '-vf', 'scale=640:-1', '-c:v', 'libwebp', '-quality', '82', '-y',
    resolve(`public/assets/data-story/stages/03-stage-${index + 1}.webp`)]);
}
console.log('Prepared scroll video and six static stage images in public/assets/data-story/.');
