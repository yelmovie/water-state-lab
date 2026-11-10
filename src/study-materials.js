import {waterDrawingStyle} from './inquiry-model.js';
export const studySheets={
 cloth:{file:'real-cloth.webp',cols:2,rows:1},
 ice:{file:'real-ice.webp',cols:2,rows:2},
 painting:{file:'real-painting.webp',cols:2,rows:2},
 dew:{file:'real-dew.webp',cols:2,rows:2},
 tools:{file:'real-tools.webp',cols:3,rows:1}
};
export function addStudyFrames(scene){
 for(const [key,sheet] of Object.entries(studySheets)){
  const texture=scene.textures.exists('real-'+key)&&scene.textures.get('real-'+key);
  if(!texture)continue;
  for(let i=0;i<sheet.cols*sheet.rows;i++)texture.add(String(i),0,i%sheet.cols*512,Math.floor(i/sheet.cols)*512,512,512);
 }
}
export function drawStudyArt(ctx,image,index,x,y,w,h=w,cols=2){
 if(!image?.complete||!image.naturalWidth)return false;
 ctx.drawImage(image,index%cols*512,Math.floor(index/cols)*512,512,512,x-w/2,y-h/2,w,h);
 return true;
}
let bead;
function beadTexture(){if(!bead&&typeof Image!=='undefined'){bead=new Image();bead.src='/assets/learning/experiment-props-20261107/dew.webp';}return bead;}
export function drawRealDrop(ctx,x,y,r=4,alpha=1){
 const image=beadTexture();
 if(image?.complete&&image.naturalWidth){ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(image,x-r*.86,y-r,r*1.72,r*2);ctx.restore();return;}
 ctx.save();ctx.globalAlpha=alpha;
 const shine=ctx.createRadialGradient(x-r*.3,y-r*.45,r*.12,x,y,r*1.2);
 shine.addColorStop(0,'#ffffffee');shine.addColorStop(.35,'#d4f0f34a');shine.addColorStop(.72,'#d0edf34d');shine.addColorStop(1,'#326d829e');
 ctx.fillStyle=shine;ctx.strokeStyle='#3867737a';ctx.lineWidth=.65;
 ctx.beginPath();ctx.ellipse(x,y,r*.75,r,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.strokeStyle='#ffffffdf';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x-r*.1,y-r*.15,r*.47,Math.PI*1.03,Math.PI*1.53);ctx.stroke();
 ctx.restore();
}
export function drawWaterStroke(ctx,lines,{left,top,width,height,amount=1,time=0,grain}){
 const remaining=Math.max(0,1-time/(amount>1?110:60)),style=waterDrawingStyle(amount),strokeWidth=style.width*width/500;
 if(!remaining)return;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 for(const line of lines){
  if(line.length<2)continue;
  const path=()=>{
   ctx.beginPath();
   line.forEach(([x,y],i)=>{x=left+x/500*width;y=top+y/310*height;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  };
  ctx.globalAlpha=remaining*style.opacity;
  ctx.strokeStyle=style.color;ctx.lineWidth=strokeWidth;ctx.shadowColor='#527d75';ctx.shadowBlur=.5;path();ctx.stroke();
  ctx.shadowBlur=0;if(grain){ctx.strokeStyle=grain;ctx.globalAlpha=remaining*(amount>1?.3:.12);ctx.lineWidth=strokeWidth*.8;path();ctx.stroke();}
  ctx.globalAlpha=remaining*remaining*(amount>1?.18:.05);
  ctx.strokeStyle='#d9f6f1';ctx.lineWidth=1;path();ctx.stroke();
 }
 ctx.restore();
}


/** Large, shaded liquid beads remain legible on glass on tablets and whiteboards. */
export function drawDewBead(ctx,x,y,r){
 ctx.save();
 const body=ctx.createRadialGradient(x-r*.28,y-r*.4,r*.08,x,y,r*1.15);
 body.addColorStop(0,'#ecffff');body.addColorStop(.3,'#b8edf0d9');body.addColorStop(.7,'#4fa0b0bd');body.addColorStop(1,'#17566da6');
 ctx.fillStyle=body;ctx.strokeStyle='#236078c9';ctx.lineWidth=Math.max(.8,r*.13);
 ctx.shadowColor='#18485c66';ctx.shadowBlur=r*.2;ctx.shadowOffsetY=r*.18;
 ctx.beginPath();ctx.ellipse(x,y,r*.76,r,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.fillStyle='#ffffffef';
 ctx.beginPath();ctx.ellipse(x-r*.22,y-r*.38,r*.2,r*.28,-.35,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
