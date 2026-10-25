import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const file of [...(await readdir('src')).map(f=>`src/${f}`),'public/sw.js']){
 if(!file.endsWith('.js'))continue;
 const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
console.log('All source modules passed syntax checks.');
