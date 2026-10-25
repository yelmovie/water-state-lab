import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,stat} from 'node:fs/promises';
import {once} from 'node:events';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {concepts} from '../../src/concept-data.js';
import {svg,W,H,FPS} from './scenes.mjs';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'sharp');
const ffmpeg=process.env.FFMPEG||'ffmpeg';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=path.join(root,'public/assets/concepts');
await mkdir(out,{recursive:true});
function encoder(file,args){
 const proc=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',String(FPS),'-i','-',...args,'-pix_fmt','yuv420p','-an',file],{stdio:['pipe','inherit','inherit']});
 const done=new Promise((resolve,reject)=>{proc.on('error',reject);proc.on('close',code=>code===0?resolve():reject(new Error(`FFmpeg exit ${code}`)));});
 proc.stdin.on('error',()=>{});
 return {async write(b){if(!proc.stdin.write(b))await once(proc.stdin,'drain');},async end(){proc.stdin.end();await done;}};
}
for(const clip of concepts.filter(c=>c&&(!process.argv[2]||c.id===Number(process.argv[2])))){
 const base=path.join(out,`stage-${clip.id}`);
 const mp4=encoder(base+'.mp4',['-c:v','libx264','-preset','fast','-crf','24','-movflags','+faststart']);
 const webm=encoder(base+'.webm',['-c:v','libvpx-vp9','-b:v','0','-crf','34','-row-mt','1','-cpu-used','5','-deadline','realtime']);
 for(let f=0;f<clip.seconds*FPS;f++){
  const rgba=await sharp(Buffer.from(svg(clip.id,f))).ensureAlpha().raw().toBuffer();
  await Promise.all([mp4.write(rgba),webm.write(rgba)]);
 }
 await Promise.all([mp4.end(),webm.end()]);
 await sharp(Buffer.from(svg(clip.id,clip.seconds*FPS-1))).webp({quality:86}).toFile(base+'.webp');
 console.log(`stage-${clip.id}: ${clip.seconds}s, ${Math.round(((await stat(base+'.mp4')).size+(await stat(base+'.webm')).size)/1024)} KiB`);
}
