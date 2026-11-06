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
export function drawRealDrop(ctx,x,y,r=4,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;
 const shine=ctx.createRadialGradient(x-r*.3,y-r*.45,r*.12,x,y,r*1.2);
 shine.addColorStop(0,'#ffffffee');shine.addColorStop(.35,'#d4f0f34a');shine.addColorStop(.72,'#d0edf34d');shine.addColorStop(1,'#326d829e');
 ctx.fillStyle=shine;ctx.strokeStyle='#3867737a';ctx.lineWidth=.65;
 ctx.beginPath();ctx.ellipse(x,y,r*.75,r,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.strokeStyle='#ffffffdf';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x-r*.1,y-r*.15,r*.47,Math.PI*1.03,Math.PI*1.53);ctx.stroke();
 ctx.restore();
}
export function drawWaterStroke(ctx,lines,{left,top,width,height,amount=1,time=0,grain}){
 const remaining=Math.max(0,1-time/(amount>1?110:60));
 if(!remaining)return;
 ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
 for(const line of lines){
  if(line.length<2)continue;
  const path=()=>{
   ctx.beginPath();
   line.forEach(([x,y],i)=>{x=left+x/500*width;y=top+y/310*height;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  };
  ctx.globalAlpha=remaining*(amount>1?.74:.53);
  ctx.strokeStyle='#387e89';ctx.lineWidth=amount>1?14:10;ctx.shadowColor='#527d75';ctx.shadowBlur=amount>1?3:1;path();ctx.stroke();
  ctx.shadowBlur=0;if(grain){ctx.strokeStyle=grain;ctx.globalAlpha=remaining*(amount>1?.58:.37);ctx.lineWidth=amount>1?11:7;path();ctx.stroke();}
  ctx.globalAlpha=remaining*remaining*(amount>1?.5:.23);
  ctx.strokeStyle='#d9f6f1';ctx.lineWidth=2;path();ctx.stroke();
 }
 ctx.restore();
}

