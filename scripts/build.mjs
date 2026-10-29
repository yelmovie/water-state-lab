import {mkdir,copyFile,cp,writeFile,rm,readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const out=process.argv.indexOf('--out'),output=path.resolve(root,out>0?process.argv[out+1]:'dist');
const {version}=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
const versionModule=offline=>`// Generated from package.json by scripts/build.mjs.\nexport const APP_VERSION=${JSON.stringify(version)};\n// Only the built site registers the offline service worker.\nexport const OFFLINE_BUILD=${offline};\n`;
await writeFile(path.join(root,'src/version.js'),versionModule(false));
// Only replace this project's generated build directory (or a test copy under tmp/).
if(output!==path.join(path.resolve(root),'dist')&&path.dirname(output)!==path.join(path.resolve(root),'tmp'))throw new Error('Unexpected build path');
await rm(output,{recursive:true,force:true});
await mkdir(path.join(output,'assets/v2'),{recursive:true});
await cp(path.join(root,'src'),path.join(output,'src'),{recursive:true});
await writeFile(path.join(output,'src/version.js'),versionModule(true));
await cp(path.join(root,'public/assets/vendor'),path.join(output,'assets/vendor'),{recursive:true});
await cp(path.join(root,'public/assets/fonts'),path.join(output,'assets/fonts'),{recursive:true});
for(const folder of ['audio','concepts','learning','stages','icons','models'])await cp(path.join(root,'public/assets',folder),path.join(output,'assets',folder),{recursive:true});
for(const file of await readdir(path.join(root,'public/assets/v2'))){
 if(file.endsWith('.webp'))await copyFile(path.join(root,'public/assets/v2',file),path.join(output,'assets/v2',file));
}
await copyFile(path.join(root,'public/assets/CREDITS.md'),path.join(output,'assets/CREDITS.md'));
await copyFile(path.join(root,'public/manifest.webmanifest'),path.join(output,'manifest.webmanifest'));
await copyFile(path.join(root,'index.html'),path.join(output,'index.html'));
await writeFile(path.join(output,'build-info.json'),JSON.stringify({version,builtAt:new Date().toISOString()}));
const offline=await writeServiceWorker();
console.log(`Built standalone site in dist/; editable PNG originals stay in public/assets/v2. Offline cache ${offline.cache}: ${offline.shell.length} first-screen + ${offline.later.length} background files.`);

/** Precache lists come from the real dist files; the cache name is their content hash. */
async function offlineLists(dir){
 const files=(await readdir(dir,{recursive:true,withFileTypes:true})).filter(e=>e.isFile()).map(e=>path.relative(dir,path.join(e.parentPath??e.path,e.name)).split(path.sep).join('/')).filter(f=>!f.split('/').some(p=>p.startsWith('._')))/* macOS ._* metadata on exFAT drives */.filter(f=>!['sw.js','build-info.json'].includes(f)&&!/\.(md|txt)$/.test(f)).sort();
 const hash=createHash('sha256');for(const f of files)hash.update(f+'\0').update(await readFile(path.join(dir,f)));
 // Images of the opening map and story screen stay in the install set; other art waits for the idle warm-up.
 const firstScreen=['assets/v2/research-island-v4.webp','assets/v2/buddy-poses-clean.webp','assets/v2/story-repair.webp'];
 const url=f=>f==='index.html'?'/':'/'+f,shell=[],later=[];
 for(const f of files)(!/^assets\/(v2|stages|learning|concepts|models|vendor\/three)\//.test(f)||firstScreen.includes(f)?shell:later).push(url(f));
 later.sort((a,b)=>/\.(mp4|webm)$/.test(a)-/\.(mp4|webm)$/.test(b));
 return {cache:'water-'+hash.digest('hex').slice(0,12),shell,later};
}
async function writeServiceWorker(){
 const lists=await offlineLists(output),source=await readFile(path.join(root,'public/sw.js'),'utf8'),marker="const CACHE='water-dev',SHELL=[],LATER=[];";
 if(!source.includes(marker))throw new Error('public/sw.js lost its build marker');
 await writeFile(path.join(output,'sw.js'),source.replace(marker,`const CACHE=${JSON.stringify(lists.cache)},SHELL=${JSON.stringify(lists.shell)},LATER=${JSON.stringify(lists.later)};`));
 return lists;
}
