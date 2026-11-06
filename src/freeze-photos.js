import {startLevel,iceLevel} from './freeze-talk.js';
import {paintWaterColumn} from './pouring-scene.js';

// Evidence photos for the shuffled-record task. The order can only be worked out from what is in the
// picture: where the cold pack is, whether the beaker sits on the warm plate, and the water against the red line.
export const photoLevel={water:startLevel,ice:iceLevel,melt:startLevel};
/** The same beaker in every view: water or ice against the red starting line. */
export function drawFreezeBeaker(g,kind,bx,floor,bw,unit){
 const level=photoLevel[kind],surface=floor-level*unit,rim=floor-100*unit;
 if(kind==='ice'){
  const fill=g.createLinearGradient(0,surface,0,floor);fill.addColorStop(0,'#e8f8fc');fill.addColorStop(1,'#bfe6f2');
  g.fillStyle=fill;g.fillRect(bx-bw/2+2,surface,bw-4,floor-surface);
  g.strokeStyle='#fff';g.lineWidth=1.6;g.beginPath();g.moveTo(bx-bw*.3,surface+9);g.lineTo(bx-bw*.05,surface+22);g.lineTo(bx-bw*.22,floor-8);g.moveTo(bx-bw*.05,surface+22);g.lineTo(bx+bw*.3,surface+16);g.stroke();
  g.strokeStyle='#6fb8d3';g.lineWidth=2.5;g.beginPath();g.moveTo(bx-bw/2+2,surface);g.lineTo(bx+bw/2-2,surface);g.stroke();
 }else{
  const ry=bw*.07;
  g.save();g.translate(bx,0);paintWaterColumn(g,{half:bw/2-2,ry,top:surface,floor:floor-ry});g.restore();
 }
 g.strokeStyle='#7da2ae';g.lineWidth=2.5;g.beginPath();g.moveTo(bx-bw/2,rim);g.lineTo(bx-bw/2,floor);g.lineTo(bx+bw/2,floor);g.lineTo(bx+bw/2,rim);g.stroke();
 const line=floor-startLevel*unit;
 g.strokeStyle='#d9483b';g.lineWidth=2.5;g.beginPath();g.moveTo(bx-bw/2-8,line);g.lineTo(bx+bw/2+8,line);g.stroke();
}
export function drawFreezePhoto(g,kind,x,y,w,h,drawPack){
 const left=x-w/2,top=y-h/2;
 g.save();g.beginPath();g.roundRect(left,top,w,h,8);g.clip();
 const wall=g.createLinearGradient(0,top,0,top+h);wall.addColorStop(0,'#eef6f7');wall.addColorStop(.74,'#dfeaea');wall.addColorStop(.75,'#cfbf9f');wall.addColorStop(1,'#bda983');
 g.fillStyle=wall;g.fillRect(left,top,w,h);
 const bw=w*.34,bx=left+w*.33,table=top+h*.88,plate=kind==='melt'?h*.1:0,floor=table-plate-2,unit=(h*.72)/100;
 if(kind==='melt'){
  const heat=g.createLinearGradient(0,table-plate,0,table);heat.addColorStop(0,'#ffb35c');heat.addColorStop(1,'#d9652c');
  g.fillStyle=heat;g.beginPath();g.roundRect(bx-bw*.72,table-plate,bw*1.44,plate,3);g.fill();
  g.strokeStyle='#e8863bb0';g.lineWidth=2;
  for(const dx of [-.78,.78]){const hx=bx+bw*dx;g.beginPath();g.moveTo(hx,table-plate-3);g.bezierCurveTo(hx-6,table-plate-14,hx+6,table-plate-20,hx,table-plate-32);g.stroke();}
 }
 drawFreezeBeaker(g,kind,bx,floor,bw,unit);
 const packW=w*.3;
 if(kind==='water')drawPack(left+w*.82,table-packW*.34,packW);
 if(kind==='ice'){drawPack(bx+bw/2+packW*.38,floor-packW*.5,packW);g.fillStyle='#ffffffd0';for(let i=0;i<7;i++){g.beginPath();g.arc(bx+bw/2-3,floor-8-i*7,1.8,0,7);g.fill();}}
 g.restore();
 g.strokeStyle='#a9bdb4';g.lineWidth=1.5;g.beginPath();g.roundRect(left,top,w,h,8);g.stroke();
}
