// Renders transparent frames with Remotion, then packs them as animated WebP because iPad Safari ignores VP9 alpha.
import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition} from '@remotion/renderer';
import sharp from 'sharp';
import {mkdir,readdir,rm,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {FPS,places} from './src/places.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(here,'../..');
const out=path.join(project,'public/assets/village'),work=path.join(project,'.tmp/map-clips/frames');
const only=process.argv.slice(2).map(Number);
await mkdir(out,{recursive:true});
// Remotion's bundled headless shell never fires requestAnimationFrame on this Mac; desktop Chrome does.
const browserExecutable=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:path.join(here,'src/index.jsx'),outDir:path.join(project,'.tmp/map-clips/bundle')});
for(const {id} of places.filter(p=>!only.length||only.includes(p.id)))for(const mode of ['on','idle']){
 const name=`stage-${id}-${mode}`,dir=path.join(work,name);
 await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});
 const composition=await selectComposition({serveUrl,id:name,inputProps:{id,mode},browserExecutable});
 await renderFrames({composition,serveUrl,inputProps:{id,mode},outputDir:dir,imageFormat:'png',onStart:()=>{},onFrameUpdate:()=>{},concurrency:2,browserExecutable});
 const files=(await readdir(dir)).filter(f=>f.endsWith('.png')&&!f.startsWith('._')).sort();
 const {width,height}=composition,frames=await Promise.all(files.map(f=>sharp(path.join(dir,f)).ensureAlpha().raw().toBuffer()));
 const file=path.join(out,name+'.webp');
 await sharp(Buffer.concat(frames),{raw:{width,height:height*frames.length,channels:4,pageHeight:height}})
  .webp({delay:1000/FPS,loop:mode==='on'?1:0,quality:70,alphaQuality:75,effort:5}).toFile(file);
 console.log(`${name}: ${frames.length} frames, ${Math.round((await stat(file)).size/1024)} KiB`);
}
