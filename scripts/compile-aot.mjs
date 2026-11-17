import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { transform } from 'lightningcss';

const source = path.resolve('.local/aot-source');
const output = path.resolve('.local/aot');
for (const directory of [source, output]) {
  if (!directory.startsWith(path.resolve('.local') + path.sep)) throw new Error('Invalid build directory');
  await rm(directory, { recursive: true, force: true });
}
await mkdir(source, { recursive: true });
await mkdir(output, { recursive: true });
await cp('src', source, { recursive: true });
await cp('src', output, { recursive: true, filter: file => !file.endsWith('.ts') || file.endsWith('.d.ts') });
async function walk(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
for (const file of (await walk(source)).filter(file => file.endsWith('.ts'))) {
  let text = await readFile(file, 'utf8');
  const imports = [...text.matchAll(/import (template|styles) from '(.+?)\?(raw|inline)';/g)];
  for (const [statement, name, relative, mode] of imports) {
    let content = await readFile(path.resolve(path.dirname(file), relative), 'utf8');
    if (mode === 'inline') {
      content = content.replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (match, quote, url) => {
        if (!url.startsWith('.')) return match;
        const original = path.resolve(path.dirname(file), url).replace(source, path.resolve('src'));
        return `url('/${path.relative(process.cwd(), original).replaceAll('\\', '/')}')`;
      });
      content = transform({ filename: relative, code: Buffer.from(content), minify: true }).code.toString();
    }
    text = text.replace(statement, `const ${name} = ${JSON.stringify(content)};`);
  }
  if (file === path.join(source, 'main.ts')) text = text.replace("import '@angular/compiler';", '');
  await writeFile(file, text);
}
const base = JSON.parse(await readFile('tsconfig.json', 'utf8'));
await writeFile('.local/tsconfig.aot.json', JSON.stringify({
  compilerOptions: { ...base.compilerOptions, noEmit: false, rootDir: source, outDir: output, declaration: false, noUnusedLocals: false },
  angularCompilerOptions: { compilationMode: 'full', strictTemplates: true },
  include: [source + '/**/*.ts'],
}));
const result = spawnSync(process.execPath, ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', '.local/tsconfig.aot.json'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
// Angular embeds component CSS in JavaScript. Turn local CSS asset references
// into Vite-recognizable URL expressions so they receive hashes and CDN paths.
for (const file of (await walk(output)).filter(file => file.endsWith('.js'))) {
  let text = await readFile(file, 'utf8');
  text = text.replace(/\/src\/([\w/.-]+\.(?:webp|png))/g, (_, asset) => {
    let relative = path.relative(path.dirname(file), path.join(output, asset)).replaceAll('\\', '/');
    if (!relative.startsWith('.')) relative = './' + relative;
    return `" + new URL(${JSON.stringify(relative)}, import.meta.url).href + "`;
  });
  await writeFile(file, text);
}
console.log('Angular templates compiled ahead of time.');
