import {mkdir,copyFile,cp,writeFile,rm,readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(root,'dist');
const {version}=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
await writeFile(path.join(root,'src/version.js'),`// Generated from package.json by scripts/build.mjs.\nexport const APP_VERSION=${JSON.stringify(version)};\n`);
// Only replace this project's generated build directory.
if(path.dirname(output)!==path.resolve(root)||path.basename(output)!=='dist')throw new Error('Unexpected build path');
await rm(output,{recursive:true,force:true});
await mkdir(path.join(output,'assets/v2'),{recursive:true});
await cp(path.join(root,'src'),path.join(output,'src'),{recursive:true});
await cp(path.join(root,'public/assets/vendor'),path.join(output,'assets/vendor'),{recursive:true});
await cp(path.join(root,'public/assets/fonts'),path.join(output,'assets/fonts'),{recursive:true});
for(const folder of ['audio','concepts','learning'])await cp(path.join(root,'public/assets',folder),path.join(output,'assets',folder),{recursive:true});
for(const file of await readdir(path.join(root,'public/assets/v2'))){
 if(file.endsWith('.webp'))await copyFile(path.join(root,'public/assets/v2',file),path.join(output,'assets/v2',file));
}
await copyFile(path.join(root,'public/assets/CREDITS.md'),path.join(output,'assets/CREDITS.md'));
await copyFile(path.join(root,'index.html'),path.join(output,'index.html'));
await writeFile(path.join(output,'build-info.json'),JSON.stringify({version,builtAt:new Date().toISOString()}));
console.log('Built standalone site in dist/; editable PNG originals stay in public/assets/v2.');
