import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../src/',import.meta.url));
async function files(directory) {
  const entries=await readdir(directory,{withFileTypes:true});
  return (await Promise.all(entries.map(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):path.join(directory,entry.name)))).flat();
}
const errors=[];
const sources=(await files(root)).filter(file=>/\.(?:js|jsx|css)$/.test(file));
const relative=file=>path.relative(root,file).replaceAll('\\','/');
const moduleOf=file=>relative(file).match(/^modules\/([^/]+)\//)?.[1];
for(const file of sources){
  const name=relative(file),source=await readFile(file,'utf8');
  const imports=[...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\s*(?:\(\s*)?['"]([^'"]+)['"]/g)].map(match=>match[1]??match[2]);
  if(name.includes('/domain/') && /\b(?:document|window|HTMLElement|localStorage|matchMedia)\b|<\/?(?:div|span|section|svg)\b/.test(source))errors.push(`${name}: domain must not depend on browser APIs or markup`);
  for(const specifier of imports){
    if(!specifier.startsWith('.')){
      if(name.includes('/domain/'))errors.push(`${name}: domain cannot import framework/package ${specifier}`);
      continue;
    }
    const target=path.resolve(path.dirname(file),specifier),targetName=relative(target);
    try{await access(target);}catch{errors.push(`${name}: unresolved ${specifier}`);continue;}
    if(targetName.startsWith('../'))errors.push(`${name}: source dependency leaves src`);
    if(name.includes('/domain/') && !targetName.startsWith(`modules/${moduleOf(file)}/domain/`))errors.push(`${name}: domain dependency must stay in its own domain`);
    if(name.startsWith('shared/') && !targetName.startsWith('shared/'))errors.push(`${name}: shared code cannot depend on app/modules`);
    if(name.startsWith('modules/') && targetName.startsWith('app/'))errors.push(`${name}: a module cannot depend on the composition root`);
    const crossesModule=moduleOf(file)&&moduleOf(target)&&moduleOf(file)!==moduleOf(target);
    const appImportsModule=name.startsWith('app/')&&moduleOf(target)&&!target.endsWith('.css');
    if((crossesModule||appImportsModule)&&!/^modules\/[^/]+\/index\.js$/.test(targetName))errors.push(`${name}: access ${moduleOf(target)} through its index.js API`);
  }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Architecture OK: ${sources.length} source files; pure domains, module APIs and shared dependency direction verified.`);
