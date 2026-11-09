// Cuts or copies the game's own art and CC0 sounds into each concept film (alpha-trimmed, transparent RGB zeroed).
// node films/prepare-assets.cjs            (from the project root; SHARP_PATH=<sharp folder> if sharp is not resolvable)
const sharp=require(process.env.SHARP_PATH||'/Users/yel/.local/node/lib/node_modules/sharp');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),A='public/assets/';
const film=n=>path.join(__dirname,`concept-zone-${n}`,'assets');
async function cut(src,box,out,pad=8){
 let img=sharp(path.join(root,src)).ensureAlpha();if(box)img=img.extract(box);
 const {data,info}=await img.raw().toBuffer({resolveWithObject:true});
 const W=info.width,H=info.height;let l=W,r=-1,t=H,b=-1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(data[i+3]<24){data[i]=data[i+1]=data[i+2]=0;data[i+3]=0;continue;}if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}
 l=Math.max(0,l-pad);t=Math.max(0,t-pad);r=Math.min(W-1,r+pad);b=Math.min(H-1,b+pad);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 await sharp(data,{raw:info}).extract({left:l,top:t,width:r-l+1,height:b-t+1}).webp({quality:92,alphaQuality:100}).toFile(out);
 console.log(path.relative(root,out),r-l+1,b-t+1);
}
const copy=(src,out)=>{fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,src),out);};
(async()=>{
 const poses={wave:0,thumbs:2,cheer:3,curious:5,surprised:6,sparkle:8,pointer:10,magnifier:12};
 const sounds={pour:'splash_09',label:'drop_003',ice:'impactMetal_medium_000',discover:'confirmation_001',door:'metalLatch',crack:'impactSoft_heavy_000',bubble:'bubble_02',drip:'drop_003'};
 const g=A+'v2/pouring-glass.webp',atlas=A+'v2/equipment-atlas.webp',c=418,P=A+'learning/experiment-props-20261107/';
 const props={
  1:[['glass-tall-empty',g,{left:60,top:0,width:400,height:610}],['glass-wide-empty',g,{left:520,top:0,width:700,height:620}],['glass-tall-full',g,{left:60,top:620,width:400,height:620}],['glass-wide-full',g,{left:520,top:620,width:700,height:620}],['jug',atlas,{left:c,top:0,width:c,height:c}],['ice-cubes',atlas,{left:2*c,top:0,width:c,height:c}],['plate',A+'learning/real-ice.webp',{left:0,top:0,width:512,height:420}],['lid',P+'jar-lid.webp']],
  2:[['freezer-open',P+'freezer.webp'],['freezer-closed',A+'learning/freeze-props-20261108/freezer-closed.webp'],['scale',A+'learning/scale.webp'],['pop-soft',A+'learning/freeze-props-20261109/ice-pop-soft.webp'],['pop-frozen',A+'learning/freeze-props-20261109/ice-pop-frozen.webp'],['bottle',P+'bottle-body.webp'],['bottle-cracked',A+'learning/coldnight-20261109/bottle-cracked.webp']],
  3:[['board',A+'learning/drawing-board.webp'],['brush',A+'learning/real-painting.webp',{left:0,top:560,width:512,height:464}],['hotplate',A+'learning/heat-plate-guide.webp']],
  4:[['cup-sealed',P+'cup-sealed.webp'],['cup-cold',P+'cup-cold.webp'],['cup-wet',P+'cup-wet.webp'],['icepack',P+'icepack.webp'],['plate-dry',A+'learning/cold-plate-dry.webp'],['plate-wet',A+'learning/condensation-20261108/cold-plate-wet.webp'],['catcher',P+'catcher.webp'],['dew',P+'dew.webp']],
  5:[['tub',P+'tub.webp'],['condenser',A+'learning/condenser-plate.webp'],['catcher',P+'catcher.webp'],['dew',P+'dew.webp'],['greenhouse',A+'stages/dew-greenhouse.webp'],['cup-wet',P+'cup-wet.webp'],['freezer-closed',A+'learning/freeze-props-20261108/freezer-closed.webp'],['board',A+'learning/drawing-board.webp'],['glass-tall-full',g,{left:60,top:620,width:400,height:620}]]
 };
 for(let n=1;n<=5;n++){
  const out=film(n);
  for(const f of ['jua-korean-400.woff2','jua-latin-400.woff2'])copy(A+'fonts/'+f,path.join(out,'fonts',f));
  for(const [name,i] of Object.entries(poses)){const p=path.join(out,'img',`bangul-${name}.webp`);if(n===1||!fs.existsSync(p))await cut(A+'v2/buddy-poses-clean.webp',{left:(i%4)*362,top:Math.floor(i/4)*272,width:362,height:272},p);}
  for(const [name,src,box] of props[n]){if(name==='greenhouse'){fs.mkdirSync(path.join(out,'img'),{recursive:true});await sharp(path.join(root,src)).resize(1200).webp({quality:86}).toFile(path.join(out,'img/greenhouse.webp'));continue;}await cut(src,box,path.join(out,'img',name+'.webp'));}
  for(const f of ['kit.css','kit.js'])copy('films/kit/'+f,path.join(out,f));
  for(const [name,file] of Object.entries(sounds))copy(`${A}audio/${file}.ogg`,path.join(out,'sfx',name+'.ogg'));
 }
})();
