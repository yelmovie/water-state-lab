// Renders the five area clips on macOS without ffmpeg. See encode-mac.swift.
// SHARP_PATH=<sharp folder> ENCODER=<compiled encode-mac> node scripts/concept-clips/render.mjs [area]
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {concepts} from '../../src/concept-data.js';
import {freezeSvg} from './freeze-why.mjs';
import {svg,W,H,FPS} from './scenes.mjs';
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'sharp');
const fade=8;
const picture=(clip,frame)=>clip==='freeze'?freezeSvg(frame):svg(clip,frame);
const rgba=async text=>sharp(Buffer.from(text)).ensureAlpha().raw().toBuffer();
for(const area of concepts.filter(c=>c&&(!process.argv[2]||c.id===Number(process.argv[2])))){
 const base=fileURLToPath(new URL(`../../public/assets/concepts/zone-${area.id}`,import.meta.url));
 const encoder=spawn(process.env.ENCODER,[W,H,FPS,base+'.mp4'].map(String),{stdio:['pipe','inherit','inherit']});
 let last=null,lastClip=0,text='';
 for(const cue of area.cues){
  const first=Math.round(cue.from*FPS),end=Math.round(cue.to*FPS),blend=lastClip&&lastClip!==cue.clip?last:null;
  for(let f=first;f<end;f++){
   text=picture(cue.clip,f);let frame=await rgba(text);
   // A short dissolve where the picture changes to a different experiment.
   if(blend&&f-first<fade){const k=(f-first+1)/(fade+1),mixed=Buffer.alloc(frame.length);for(let i=0;i<frame.length;i++)mixed[i]=blend[i]*(1-k)+frame[i]*k;frame=mixed;}
   if(!encoder.stdin.write(frame))await once(encoder.stdin,'drain');
   last=frame;
  }
  lastClip=cue.clip;
 }
 encoder.stdin.end();
 const [code]=await once(encoder,'close');
 if(code!==0)throw new Error('encoder exit '+code);
 await sharp(Buffer.from(text)).webp({quality:86}).toFile(base+'.webp');
 console.log(`zone-${area.id}: ${area.seconds}s`);
}
