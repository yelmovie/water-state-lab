// The Colorfigures primitives draw the physical parts with banded shading and camera-sorted ink.
import {setCam,P,pd,ink,fill,shape,box,loft,hullInk,ellUV,on,PZ,openShell,toneI,byDepth,board,boardTop,castShadow,vis} from '/assets/vendor/colorfigures/core.js';
import {figureFrame} from './collector-figure-model.js';
const brass={l:'#f9dfa0',m:'#d4a761',d:'#946839'};
const teal={l:'#9adcd0',m:'#5ea99f',d:'#397b77'};
const metal={l:'#e3eee7',m:'#b4cdcc',d:'#779e9f'};
const ice={l:'#d1f2f5',m:'#8accdc',d:'#578d9e'};
const ceramic={l:'#fff2cd',m:'#e1c993',d:'#b59866'};
const tile={l:'#f2ead1',m:'#e3cda4',d:'#ba9865'};
const outline='#23545c', water='#1886ad';
const n=v=>Number(v.toFixed(2));
const circle=(p,r,attrs)=>{const [x,y]=P(...p);return `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" ${attrs}/>`;};
const ring=(x,z,r,y=0)=>on(PZ(z),ellUV(x,y,r,r,22));
const colour=m=>normal=>toneI(normal,m);
const edge=(a,b)=>ink(pd(a),1.05)+ink(pd(b),1.25)+hullInk(a.concat(b),1.8);
function tubeWall(x,z0,z1,r0,r1,m,opacity=1,inside=''){
 const a=ring(x,z0,r0),b=ring(x,z1,r1);
 return `<g opacity="${opacity}">${openShell(a,b,colour(m),inside)}${edge(a,b)}</g>`;
}
const flange=(x,z,r,hole,m)=>fill(pd(ring(x,z,r))+pd(ring(x,z,hole)),m,'fill-rule="evenodd"')+ink(pd(ring(x,z,r)),1.2)+ink(pd(ring(x,z,hole)),.85);
function sloped(a,b,y0,y1,low,high,m){
 const wall=(p,y)=>[p.x,y,p.z],c=(p,y,h)=>wall({...p,z:p.z+h},y);
 const aR=[c(a,y0,low),c(a,y1,low),c(a,y1,high),c(a,y0,high)];
 const bR=[c(b,y0,low),c(b,y1,low),c(b,y1,high),c(b,y0,high)];
 const ends=vis([-1,0,0])?shape(aR,m.d,1):shape(bR,m.m,1);
 const top=[aR[3],aR[2],bR[2],bR[3]];
 return loft(aR,bR,colour(m))+ends+ink(pd(top),1.25)+hullInk(aR.concat(bR),1.9);
}
function modelArt(d,mode,collected,showSpill){
 const {plate:p,ramp:r,slopeEnd:e,funnel:u,tube:t,bucket:b,pipeTop,pipeBottom,coneSpout,rim,bounds}=d;
 const [xmin,xmax,ymin,ymax]=bounds;
 const base=board(xmin,ymin,xmax,ymax,4,6,tile);
 const shadowPts=d.anchors.flatMap(([x,y,z])=>[[x-9,y-7,z],[x+9,y+7,z]]);
 const shadow=`<g opacity=".22">${castShadow(shadowPts,4,boardTop(xmin,ymin,xmax,ymax,4,6))}</g>`;
 const s=[];
 const item=(x0,x1,y0,y1,z0,z1,svg)=>s.push({box:[[x0,y0,z0],[x1,y1,z1]],svg});
 // Rear and front struts are fixed to the same table and meet the parts they carry.
 const strut=(x,y,z)=>{if(z<=10)return;item(x-3.5,x+3.5,y-3,y+3,4,z,
  box(x-4,y-4,4,x+4,y+4,7,brass)+box(x-2,y-2,7,x+2,y+2,z,teal));};
 const rampZ=x=>r.z+(e.z-r.z)*(x-r.x)/(e.x-r.x);
 for(const y of [-12,12]){strut(p.x-8,y,p.z+9);strut(r.x+5,y,rampZ(r.x+5)-1);}
 strut(e.x-5,-10,rampZ(e.x-5)-2);
 const coneBracket=Math.max(12,u.z-8),tubeBracket=(pipeTop+pipeBottom)/2;
 strut(u.x,-15,coneBracket);strut(t.x,-10,tubeBracket);
 item(u.x-3,u.x+3,-15,-9,coneBracket-1,coneBracket+2,box(u.x-3,-15,coneBracket-1,u.x+3,-9,coneBracket+2,brass));
 item(t.x-3,t.x+3,-10,-5,tubeBracket-1,tubeBracket+2,box(t.x-3,-10,tubeBracket-1,t.x+3,-5,tubeBracket+2,brass));
 const plateA={x:p.x-13,z:p.z+13},plateB={x:p.x+12,z:p.z};
 const pack=box(p.x-7,-12,p.z+3,p.x+7,12,p.z+7,d.cold?ice:ceramic);
 item(p.x-13,p.x+12,-15,15,p.z-2,p.z+14,pack+sloped(plateA,plateB,-15,15,-2,0,d.cold?ice:metal)
   +sloped(plateA,plateB,-15,-12,0,2,brass)+sloped(plateA,plateB,12,15,0,2,brass));
 const trough=sloped(r,e,-11,11,-3,0,teal);
 item(r.x,e.x,-14,14,Math.min(r.z,e.z)-3,Math.max(r.z,e.z)+4,byDepth([
  {box:[[r.x,-11,Math.min(r.z,e.z)-3],[e.x,11,Math.max(r.z,e.z)]],svg:trough},
  ...[[-14,-11],[11,14]].map(([a,c])=>({box:[[r.x,a,Math.min(r.z,e.z)-1],[e.x,c,Math.max(r.z,e.z)+4]],svg:sloped(r,e,a,c,-1,4,brass)}))
 ]));
 item(u.x-15,u.x+15,-15,15,coneSpout,u.z,
  tubeWall(u.x,coneSpout,u.z,4,15,brass,mode?.46:1)+flange(u.x,u.z,15,12,'#f3d78a'));
 item(t.x-8,t.x+8,-8,8,pipeBottom,pipeTop,
  tubeWall(t.x,pipeBottom,pipeTop,6,6,ice,mode?.23:.76)+flange(t.x,pipeTop,7,4.5,'#f5dc9a')+flange(t.x,pipeBottom,7,4.5,'#c89952'));
 const floor=shape(ring(b.x,5,11),'#a78c60',1);
 const pool=collected?fill(pd(ring(b.x,d.waterline,12)),water,'opacity=".7"')+ink(pd(ring(b.x,d.waterline,12)),.85):'';
 item(b.x-15,b.x+15,-15,15,5,rim,floor+tubeWall(b.x,5,rim,11,15,teal,mode?.30:.84,pool)
  +flange(b.x,rim,15,12.8,'#f6db9d'));
 const spill=showSpill?`<g>${fill(pd(ring(showSpill[0],6,8,showSpill[1])), '#53b5cd','opacity=".7"')}${ink(pd(ring(showSpill[0],6,8,showSpill[1])),.8)}</g>`:'';
 return base+shadow+spill+byDepth(s);
}
// Fit the drawn structure rather than the empty corners of a projected 3D box.
function fit(b,aspect,canvasHeight,canvasWidth){
 const px=Math.max(b.width/Math.max(1,canvasWidth-30),b.height/Math.max(1,canvasHeight-42));
 const h=px*canvasHeight,w=h*aspect;
 return [b.x+(b.width-w)/2,b.y+(b.height-h)/2,w,h];
}
function trailArt({points,spill}){
 const d=pd(points,false),c=spill?'#a94f1c':'#067da4';
 return `<g data-figure-trail="${spill?'leak':'water'}"><path d="${d}" fill="none" stroke="#fff9e7" stroke-width="10" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${spill?5:6}" ${spill?'stroke-dasharray="8 6"':''} vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
function arrowArt({points,spill},pixel){
 const [a,b]=points.slice(-2).map(p=>P(...p)),len=Math.hypot(b[0]-a[0],b[1]-a[1]);
 if(len<20*pixel)return '';
 const angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
 return `<path transform="translate(${n((a[0]+b[0])/2)} ${n((a[1]+b[1])/2)}) rotate(${n(angle)}) scale(${pixel})" d="m-3-5 6 5-6 5" fill="none" stroke="white" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>`;
}
export function mountFigureArt(svg){
 const structure=svg.querySelector('[data-figure-structure]'),trail=svg.querySelector('[data-figure-trail-layer]');
 const moving=svg.querySelector('[data-figure-water]'),marker=svg.querySelector('[data-figure-marker]');
 let previous,geometryKey='',fitKey='',box;
 return ({layout,mode,time,yaw,pitch,zoom,selected,width,height})=>{
  if(width<1||height<1)return;
  setCam(yaw,pitch);
  const frame=time===null?{drops:[],trails:[],spilled:false,collected:false}:figureFrame(layout,time);
  if(layout!==previous){previous=layout;geometryKey='';fitKey='';}
  const key=[yaw,pitch,mode,frame.collected,frame.spilled].join('|');
  if(key!==geometryKey){
   geometryKey=key;
   const spill=frame.spilled&&frame.leak?.points.at(-1);
   structure.innerHTML=modelArt(layout,mode,frame.collected,spill);
  }
  const nextFit=[yaw,pitch,mode].join('|');
  if(nextFit!==fitKey){fitKey=nextFit;box=structure.getBBox();}
  const [x,y,w,h]=fit(box,width/height,height,width);
  const focus=P(...layout.anchors[selected]),zw=w/zoom,zh=h/zoom,pixel=zw/width;
  const crop=(v,start,whole,shown)=>Math.min(start+whole-shown,Math.max(start,v-shown/2));
  const vx=crop(focus[0],x,w,zw),vy=crop(focus[1],y,h,zh);
  svg.setAttribute('viewBox',[vx,vy,zw,zh].map(n).join(' '));
  trail.innerHTML=frame.trails.map(t=>trailArt(t)+arrowArt(t,pixel)).join('');
  moving.innerHTML=frame.drops.map(d=>{
   const [dx,dy]=P(...d.point);
   return `<g class="figure-drop" data-spill="${d.spill}" transform="translate(${n(dx)} ${n(dy)}) scale(${pixel})"><path d="M0-15C3-9 10-3 10 3a10 10 0 0 1-20 0C-10-3-3-9 0-15Z" fill="#42c9ee" stroke="#07506b" stroke-width="2.5"/><path d="M-4-1q-3 4 0 7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>`;
  }).join('');
  if(frame.leak){
   const [mx,my]=P(...frame.leak.points[0]);
   const bx=Math.min(vx+zw-49*pixel,Math.max(vx+49*pixel,mx+49*pixel));
   const by=Math.min(vy+zh-21*pixel,Math.max(vy+21*pixel,my-27*pixel));
   marker.innerHTML=`<g data-figure-leak-marker><path d="M${n(mx)} ${n(my)}L${n(bx)} ${n(by)}" fill="none" stroke="#9b4318" stroke-width="2" vector-effect="non-scaling-stroke"/><g transform="translate(${n(mx)} ${n(my)}) scale(${pixel})"><circle r="12" fill="#fff3d0" fill-opacity=".65" stroke="#a94f1c" stroke-width="3" stroke-dasharray="5 3"/></g><g transform="translate(${n(bx)} ${n(by)}) scale(${pixel})"><rect x="-42" y="-15" width="84" height="30" rx="13" fill="#fff1d2" stroke="#a94f1c" stroke-width="2"/><text y="1" text-anchor="middle" dominant-baseline="central" font-weight="800" font-size="16" fill="#7d3716">새는 곳</text></g></g>`;
   return;
  }
  const at=layout.anchors[selected],[mx,my]=P(...at);
  const bx=Math.max(vx+15*pixel,mx-23*pixel),by=Math.max(vy+15*pixel,my-16*pixel);
  marker.innerHTML=`<g><path d="M${n(mx)} ${n(my)}L${n(bx)} ${n(by)}" fill="none" stroke="${outline}" stroke-width="2" vector-effect="non-scaling-stroke"/><g transform="translate(${n(bx)} ${n(by)}) scale(${pixel})"><circle r="11" fill="#ffdf91" stroke="#23545c" stroke-width="2"/><text y="1" text-anchor="middle" dominant-baseline="central" font-weight="800" font-size="15" fill="#173f45">${selected+1}</text></g></g>`;
 };
}
