import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root=process.cwd();
const sourceRoot=path.join(root,'src');
const list=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name)):[path.join(dir,e.name)]);
const relative=file=>path.relative(root,file).replaceAll('\\','/');
const visited=new Set(), errors=[], packages=new Set();
function layer(file){return /^src\/app\/contexts\/([^/]+)\/(domain|application|infrastructure|presentation)\//.exec(relative(file));}
function checkBoundary(from,target,specifier){
  const origin=layer(from), destination=target&&layer(target);
  if(origin){
    const [,context,current]=origin;
    if(current==='domain'&&(!destination||destination[1]!==context||destination[2]!=='domain')) errors.push(`${relative(from)}: domain cannot depend on ${specifier}`);
    if(['application','infrastructure'].includes(current)&&destination&&(destination[1]!==context||!['domain',current].includes(destination[2]))) errors.push(`${relative(from)}: ${current} cannot depend on ${specifier}`);
    if(current==='presentation'&&destination&&(destination[1]!==context||destination[2]==='infrastructure')) errors.push(`${relative(from)}: presentation must use its application/domain layer, not ${specifier}`);
  }
  if(relative(from).startsWith('src/app/shared/')&&destination)errors.push(`${relative(from)}: shared code cannot depend on a business context`);
  if(relative(from).startsWith('src/app/shell/')&&destination&&destination[2]!=='application')errors.push(`${relative(from)}: shell must consume application services`);
}
function resolve(from,specifier,dependency=true){
  if(!specifier.startsWith('.')) {if(dependency){checkBoundary(from,null,specifier);packages.add(specifier.startsWith('@')?specifier.split('/').slice(0,2).join('/'):specifier.split('/')[0]);}return;}
  const clean=specifier.split('?')[0];
  const base=path.resolve(path.dirname(from),clean);
  const target=[base,`${base}.ts`,`${base}.js`,`${base}.d.ts`,path.join(base,'index.ts')].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());
  if(!target){errors.push(`${relative(from)}: missing ${specifier}`);return;}
  if(dependency)checkBoundary(from,target,specifier);
  visit(target);
}
function visit(file){
  if(visited.has(file))return;visited.add(file);
  if(file.endsWith('.js')&&fs.existsSync(file.slice(0,-3)+'.d.ts'))visit(file.slice(0,-3)+'.d.ts');
  if(!/\.(ts|js|css)$/.test(file))return;
  const text=fs.readFileSync(file,'utf8');
  if(/\.(ts|js)$/.test(file)){
    const tree=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
    const walk=node=>{
      if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))resolve(file,node.moduleSpecifier.text);
      if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))resolve(file,node.arguments[0].text);
      if(ts.isNewExpression(node)&&node.expression.getText(tree)==='URL'&&node.arguments?.[0]&&ts.isStringLiteral(node.arguments[0]))resolve(file,node.arguments[0].text,false);
      if(ts.isCallExpression(node)&&node.expression.getText(tree)==='technology'&&node.arguments[1]&&ts.isStringLiteral(node.arguments[1])){
        const icon=path.join(root,`public/assets/skills/${node.arguments[1].text}.svg`);
        if(fs.existsSync(icon))visited.add(icon);else errors.push(`Missing technology icon: ${relative(icon)}`);
      }
      ts.forEachChild(node,walk);
    };walk(tree);
    for(const match of text.matchAll(/['"](CV_[A-Za-z_]+\.pdf)['"]/g)){
      const pdf=path.join(root,'public/cv',match[1]);if(fs.existsSync(pdf))visited.add(pdf);else errors.push(`Missing CV: ${match[1]}`);
    }
  }else if(file.endsWith('.css')){
    for(const match of text.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g))resolve(file,match[1],false);
  }
}
visit(path.join(root,'src/main.ts'));visited.add(path.join(root,'src/vite-env.d.ts'));
for(const match of fs.readFileSync('index.html','utf8').matchAll(/(?:src|href)="\/(src\/[^"?]+)"/g))visit(path.join(root,match[1]));
const unused=[...list(sourceRoot),...list(path.join(root,'public'))].filter(file=>!visited.has(file)&&!file.endsWith('.md')&&!file.endsWith('.txt'));
for(const file of unused)errors.push(`Unreachable source/resource: ${relative(file)}`);
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
// Angular's published packages declare RxJS/tslib as runtime requirements.
for(const name of ['rxjs','tslib'])packages.add(name);
for(const name of Object.keys(manifest.dependencies??{}))if(!packages.has(name))errors.push(`Unused direct runtime dependency: ${name}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log(`Architecture OK: ${visited.size} reachable files, isolated domain models, valid layer dependencies and no unused runtime assets/packages.`);
