// Renders the five area films (films/concept-zone-N, HyperFrames) into the game's clip slots.
// SHARP_PATH=<sharp folder> node scripts/concept-clips/render.mjs [area]   — needs the hyperframes CLI (0.9.26) and ffmpeg on PATH.
// Output: public/assets/concepts/zone-N.mp4 (1280×720 H.264, faststart, ≤2.5MB) and zone-N.webp (last frame,
// used as poster and as the reduced-motion / playback-failure picture). Set TMPDIR to an external-drive folder.
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {statSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {concepts} from '../../src/concept-data.js';
const root=fileURLToPath(new URL('../../',import.meta.url));
const tmp=path.join(process.env.TMPDIR||path.join(root,'.tmp'),'concept-films');mkdirSync(tmp,{recursive:true});
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'sharp');
const hf=process.env.HYPERFRAMES||'hyperframes',ffmpeg=process.env.FFMPEG||'ffmpeg';
const run=(cmd,args,cwd)=>execFileSync(cmd,args,{cwd,stdio:['ignore','inherit','inherit'],env:{...process.env,HYPERFRAMES_NO_TELEMETRY:'1',DO_NOT_TRACK:'1'}});
for(const area of concepts.filter(c=>c&&(!process.argv[2]||c.id===Number(process.argv[2])))){
 const film=path.join(root,`films/concept-zone-${area.id}`),master=path.join(tmp,`zone-${area.id}-1080.mp4`),base=path.join(root,`public/assets/concepts/zone-${area.id}`);
 run(hf,['render','--quality','delivery','--fps','30','-o',master],film);
 // 1280×720 for tablets; 2-pass-free CRF with a bitrate cap keeps each film under 2.5MB.
 run(ffmpeg,['-y','-v','error','-i',master,'-vf','scale=1280:720:flags=lanczos','-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-crf','22','-maxrate','1500k','-bufsize','3000k','-preset','slow','-c:a','aac','-b:a','64k','-ac','1','-movflags','+faststart',base+'.mp4']);
 const last=path.join(tmp,`zone-${area.id}-last.png`);
 run(ffmpeg,['-y','-v','error','-sseof','-0.1','-i',master,'-frames:v','1','-update','1',last]);
 await sharp(last).resize(1280,720).webp({quality:82}).toFile(base+'.webp');
 const mb=statSync(base+'.mp4').size/1048576;if(mb>2.5)throw new Error(`zone-${area.id}.mp4 is ${mb.toFixed(2)}MB (>2.5MB)`);
 console.log(`zone-${area.id}: ${area.seconds}s, ${mb.toFixed(2)}MB`);
}
