import React from 'react';
import {Easing,interpolate,useCurrentFrame} from 'remotion';
import {LOOP,REVEAL,places} from './places.mjs';

const TAU=Math.PI*2,clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};
const wave=(phase,cycles=1,offset=0)=>Math.sin(TAU*(phase*cycles+offset));
const AMBER=['#fff3b8','#ffc95e'],AQUA=['#e8ffff','#6df0ea'];

function Glow({x,y,rx,ry=rx,colors=AMBER,strength=1,id}){
 return <>
  <defs><radialGradient id={id}><stop offset="0" stopColor={colors[0]} stopOpacity=".95"/><stop offset=".45" stopColor={colors[1]} stopOpacity=".5"/><stop offset="1" stopColor={colors[1]} stopOpacity="0"/></radialGradient></defs>
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} opacity={Math.max(0,Math.min(1,strength))}/>
 </>;
}
function Lantern({x,y,on,flicker,id}){
 return <g>
  <Glow id={id} x={x} y={y+7} rx={30+flicker*2} strength={on*(.85+flicker*.1)}/>
  <path d={`M${x} ${y-9}V${y}`} stroke="#7a5a2b" strokeWidth="1.4"/>
  <path d={`M${x-5} ${y+1}h10l2 3v9l-3 2h-8l-3-2v-9z`} fill={on>.05?'#ffe7a3':'#7c6d55'} fillOpacity={.35+on*.6} stroke="#8a642c" strokeWidth="1.2"/>
  <path d={`M${x} ${y+3.5}c3 3.5 3.5 6.5 0 9c-3.5-2.5-3-5.5 0-9z`} fill="#fff6bd" opacity={on}/>
 </g>;
}
const Falling=({d,width,phase,on,color='#dffcff'})=><path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="9 7" strokeDashoffset={-32*phase} opacity={on}/>;

function Ripples({x,y,rx,ratio=.27,count=3,phase,on}){
 return Array.from({length:count},(_,i)=>{
  const t=(phase+i/count)%1,r=rx*(.18+.82*t);
  return <ellipse key={i} cx={x} cy={y} rx={r} ry={r*ratio} fill="none" stroke="#e9ffff" strokeWidth={2.2-t} opacity={on*(1-t)*.95}/>;
 });
}
function Fountain({phase,reveal}){
 const on=reveal,bottom=interpolate(reveal,[0,.7],[408,448],clamp);
 return <g>
  <Glow id="f" x={315} y={453} rx={92} ry={30} colors={AQUA} strength={on*.55}/>
  <Ripples x={315} y={453} rx={70} phase={phase} on={on}/>
  {[-11,-5,0,6,12].map((dx,i)=><Falling key={i} d={`M${312+dx*.55} 406Q${312+dx*1.5} 424 ${312+dx*1.35} ${bottom}`} width={i%2?2.6:3.4} phase={(phase+i*.25)%1} on={on}/>)}
  {Array.from({length:12},(_,i)=>{
   const t=(phase+i/12)%1,side=i%2?1:-1,spread=10+i%4*5,x=312+side*spread*t*1.5,y=402-46*on*t*(1-t)*4*.5+t*t*30;
   return <circle key={i} cx={x} cy={y} r={2.1-t*.9} fill="#f2ffff" opacity={on*(1-t*.55)}/>;
  })}
 </g>;
}
function Corridor({phase,reveal,frame}){
 const spark=frame<24&&frame%6<3?.45:1,on=reveal*spark,flicker=wave(phase,2);
 return <g>
  {[[211,386],[278,386]].map(([x,y],i)=><Glow key={i} id={'c'+i} x={x} y={y} rx={25} ry={34} strength={on*.62}/>)}
  <Lantern id="l0" x={211} y={352} on={on} flicker={flicker}/>
  <Lantern id="l1" x={278} y={352} on={on} flicker={wave(phase,2,.5)}/>
  {Array.from({length:6},(_,i)=>{const t=(phase+i/6)%1;return <circle key={i} cx={204+i*17+wave(t,1)*3} cy={410-t*42} r={1.5} fill="#fff1a8" opacity={on*(1-t)}/>;})}
 </g>;
}
function Gauge({x,top,bottom,count=9,side=1,phase,reveal,colors,id,cx,cy,rx,ry}){
 const lit=reveal*count,sweep=phase*(count+2)-1;
 return <g>
  <Glow id={id} x={cx} y={cy} rx={rx} ry={ry} colors={colors} strength={reveal*.72}/>
  {Array.from({length:count},(_,i)=>{
   const y=bottom-(bottom-top)*i/(count-1),long=i%2===0,on=Math.max(0,Math.min(1,lit-i)),boost=Math.max(0,1-Math.abs(sweep-i));
   return <g key={i} opacity={on}>
    <path d={`M${x} ${y}h${side*(long?14:8)}`} stroke={colors[1]} strokeWidth={6+boost*3} strokeLinecap="round" opacity={.35+boost*.3}/>
    <path d={`M${x} ${y}h${side*(long?14:8)}`} stroke="#fffff0" strokeWidth={2.4+boost} strokeLinecap="round"/>
   </g>;
  })}
 </g>;
}
function Bridge({phase,frame}){
 const lamps=[[549,204,8],[585,204,22],[627,208,36]];
 return <g>{lamps.map(([x,y,at],i)=>{
  const on=interpolate(frame,[at,at+9],[0,1],clamp),flicker=wave(phase,2,i/3);
  return <g key={i}>
   <Lantern id={'b'+i} x={x} y={y} on={on} flicker={flicker}/>
   <Glow id={'br'+i} x={x} y={250+i%2*2} rx={18+flicker} ry={5} strength={on*.5}/>
  </g>;
 })}</g>;
}
const cordPoint=t=>{const a=1-t;return [a*a*724+2*a*t*784+t*t*859,a*a*356+2*a*t*371+t*t*329];};
function Flags({phase,reveal}){
 const colors=['#f3bf57','#5cbfb2','#e98a66'],count=9;
 return <g>
  <path d="M724 356Q784 371 859 329" fill="none" stroke="#7a5a2b" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="170" strokeDashoffset={170*(1-Math.min(1,reveal*2))}/>
  {Array.from({length:count},(_,i)=>{
   const [x,y]=cordPoint((i+.6)/(count+.2)),drop=interpolate(reveal,[.25+i*.06,.42+i*.06],[0,1],clamp),sway=wave(phase,1,i/count)*5,tip=19*drop;
   return <path key={i} d={`M${x-8} ${y}L${x+8} ${y+.6}L${x+sway} ${y+tip}Z`} fill={colors[i%3]} stroke="#fff5d8" strokeWidth=".8" opacity={Math.min(1,drop*2)}/>;
  })}
 </g>;
}
function Hearth({phase,reveal}){
 const on=reveal,h=1+.16*wave(phase,3)+.1*wave(phase,5,.3),lean=wave(phase,2)*1.8;
 const flame=(w,height,color)=><path d={`M${918-w} 439Q${918-w*1.2+lean} ${439-height*.5} ${918+lean} ${439-height*h*on}Q${918+w*1.2+lean} ${439-height*.5} ${918+w} 439Z`} fill={color}/>;
 return <g>
  <defs><filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".7"/></filter></defs>
  <Glow id="h" x={918} y={428} rx={38} ry={34} strength={on*(.8+.1*wave(phase,3))}/>
  <g filter="url(#soft)">{flame(8,19,'#ff9a2e')}{flame(5.2,13,'#ffc93f')}{flame(2.6,7,'#fff3b0')}</g>
  {Array.from({length:5},(_,i)=>{const t=(phase+i/5)%1;return <circle key={i} cx={918+wave(t,1,i/5)*9} cy={424-t*26} r={1.4-t*.6} fill="#ffcf6a" opacity={on*(1-t)}/>;})}
 </g>;
}
function Dew({phase,reveal}){
 return <g>
  <Gauge id="d" x={1249} top={181} bottom={226} count={7} side={-1} phase={phase} reveal={reveal} colors={AQUA} cx={1227} cy={200} rx={46} ry={48}/>
  {Array.from({length:6},(_,i)=>{
   const t=(phase+i/6)%1,x=1206+i*6.5,y=176+t*50,on=interpolate(reveal,[.2+i*.1,.45+i*.1],[0,1],clamp);
   return <g key={i} opacity={on*(t<.85?1:(1-t)/.15)}>
    <path d={`M${x} ${y-9}V${y}`} stroke="#ffffff" strokeOpacity=".5" strokeWidth="1.2"/>
    <circle cx={x} cy={y} r="2.3" fill="#fbffff"/>
   </g>;
  })}
 </g>;
}
function Greenhouse({phase,frame}){
 const panes=[[1090,146,17,50],[1112,140,17,56],[1136,140,12,30],[1172,134,16,58],[1190,138,10,28]];
 return <g>
  <defs><filter id="pane" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
  {panes.map(([x,y,w,h],i)=>{
   const on=interpolate(frame,[6+i*9,16+i*9],[0,1],clamp),breathe=.82+.1*wave(phase,1,i/5);
   return <g key={i} opacity={on}>
    <Glow id={'g'+i} x={x+w/2} y={y+h/2} rx={w+16} ry={h*.85} strength={breathe*.8}/>
    <path d={`M${x} ${y+h}V${y+6}q${w/2}-9 ${w} 0V${y+h}Z`} fill="#fff0b4" fillOpacity={breathe*.3} filter="url(#pane)"/>
   </g>;
  })}
  <g opacity={interpolate(frame,[50,62],[0,1],clamp)}>
   <Glow id="gd" x={1154} y={182} rx={22} ry={26} strength={.7}/>
   <path d="M1146 198V174q8-11 16 0V198Z" fill="#fff0b4" fillOpacity={.42+.08*wave(phase,1)} filter="url(#pane)"/>
  </g>
 </g>;
}
function Spout({phase,reveal}){
 const on=Math.min(1,reveal*1.4),bottom=interpolate(reveal,[0,.55],[498,527],clamp);
 return <g>
  <Glow id="s" x={1368} y={527} rx={42} ry={15} colors={AQUA} strength={on*.55}/>
  <Ripples x={1368} y={528} rx={33} ratio={.3} phase={phase} on={interpolate(reveal,[.5,.7],[0,1],clamp)}/>
  <path d={`M1369 497V${bottom}`} stroke="#b9f3fb" strokeWidth="6" strokeLinecap="round" opacity={on*.5}/>
  <Falling d={`M1369 497V${bottom}`} width={3.2} phase={phase} on={on}/>
  {Array.from({length:6},(_,i)=>{const t=(phase+i/6)%1,side=i%2?1:-1;return <circle key={i} cx={1369+side*(3+t*11)} cy={525-12*t*(1-t)*4+t*3} r={1.5} fill="#f3ffff" opacity={on*(1-t)*(reveal>.55?1:0)}/>;})}
 </g>;
}
// Eight spokes repeat every 45 degrees, so 90 degrees per loop closes without a jump.
const wheelAngle=(frame,mode)=>{
 const speed=90/LOOP;
 if(mode==='idle')return speed*frame;
 return frame<=LOOP?speed*frame*frame/(2*LOOP):speed*LOOP/2+speed*(frame-LOOP);
};
function Wheel({phase,reveal,frame,mode}){
 const angle=wheelAngle(frame,mode),on=Math.min(1,reveal*1.6);
 return <g>
  <g transform="translate(1504 531) scale(1 1.24)" opacity={on}>
   <g transform={`rotate(${angle})`}>
    {Array.from({length:8},(_,i)=><g key={i} transform={`rotate(${i*45})`}>
     <path d="M6 0H45" stroke="#8d5a26" strokeWidth="4.6" strokeLinecap="round"/>
     <path d="M6 -1H45" stroke="#d9a860" strokeWidth="2" strokeLinecap="round"/>
     <path d="M41 -5L47 -5L47 5L41 5Z" fill="#a8743a" stroke="#6f461c" strokeWidth="1"/>
    </g>)}
    <circle r="45" fill="none" stroke="#8d5a26" strokeWidth="3.4"/>
    <circle r="27" fill="none" stroke="#b78344" strokeWidth="2"/>
   </g>
   <circle r="8" fill="#ffe08a" stroke="#8a5a22" strokeWidth="2.4"/>
  </g>
  <Glow id="w" x={1504} y={531} rx={20} strength={on*.7}/>
  {[-6,0,6].map((dx,i)=><Falling key={i} d={`M${1508+dx} 548Q${1506+dx} 570 ${1504+dx*1.6} 597`} width={i===1?3.2:2.4} phase={(phase+i*.3)%1} on={on}/>)}
  <Ripples x={1504} y={596} rx={26} ratio={.22} count={2} phase={phase} on={on}/>
 </g>;
}
const scenes={1:Fountain,2:Corridor,5:Flags,6:Hearth,7:Dew,8:Greenhouse,9:Spout,10:Wheel,4:Bridge};

export function Place({id,mode}){
 const raw=useCurrentFrame(),{box}=places.find(p=>p.id===id);
 const frame=mode==='idle'?raw:raw,phase=(raw%LOOP)/LOOP;
 const reveal=mode==='idle'?1:interpolate(raw,[0,REVEAL*.62],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
 const shown=mode==='idle'?REVEAL:frame;
 const Scene=scenes[id];
 return <svg xmlns="http://www.w3.org/2000/svg" viewBox={box.join(' ')} width="100%" height="100%" style={{position:'absolute',inset:0}}>
  {id===3?<Gauge id="m" x={490} top={120} bottom={165} phase={phase} reveal={reveal} colors={AQUA} cx={510} cy={140} rx={42} ry={44}/>:
   <Scene phase={phase} reveal={reveal} frame={id===10?raw:shown} mode={mode}/>}
 </svg>;
}
