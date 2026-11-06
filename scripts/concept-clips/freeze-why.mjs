// Stage 3 concept: the water line rises past the red line as the same water freezes.
import {W,H,FPS} from './scenes.mjs';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const txt=(x,y,s,size=30,fill='#27594f',extra='')=>`<text x="${x}" y="${y}" font-family="Apple SD Gothic Neo, sans-serif" font-size="${size}" font-weight="700" fill="${fill}" text-anchor="middle" ${extra}>${s}</text>`;
const arrowUp=(x,y0,y1,color='#14506e')=>`<path d="M${x} ${y0}V${y1+12}" stroke="${color}" stroke-width="6"/><path d="M${x} ${y1}l-11 16h22z" fill="${color}"/>`;
function beaker(t){
 const p=ease((t-.9)/2.4),unit=3,x=360,w=240,floor=470,level=60+5.4*p,top=floor-level*unit,line=floor-60*unit;
 const color=p>.5?'#d8f3fa':'#5cc4dc';
 let s=`<rect x="${x}" y="${top}" width="${w}" height="${floor-top}" fill="${color}"/>`;
 if(p>0&&p<1)s+=`<rect x="${x}" y="${top}" width="${w*p/2}" height="${floor-top}" fill="#d8f3fa"/><rect x="${x+w-w*p/2}" y="${top}" width="${w*p/2}" height="${floor-top}" fill="#d8f3fa"/>`;
 if(p>.6)s+=`<path d="M${x+40} ${top+40}l60 50-30 70M${x+100} ${top+90}l70-30 40 70" stroke="#fff" stroke-width="5" fill="none" opacity="${(p-.6)/.4}"/>`;
 s+=`<path d="M${x-4} 96V${floor+6}H${x+w+4}V96" fill="none" stroke="#78a99f" stroke-width="7"/>`;
 s+=`<path d="M${x-40} ${line}H${x+w+40}" stroke="#d9483b" stroke-width="6"/>${txt(x-84,line+10,'60',32,'#b5352a')}`;
 s+=`<path d="M${x+4} ${top}H${x+w+34}" stroke="#1f7fb3" stroke-width="4" stroke-dasharray="10 8"/>`;
 if(p>.08)s+=arrowUp(x+w+24,line-4,top+2)+txt(x+w+98,top+14,(Math.round(level*10)/10).toFixed(1),32,'#14506e');
 return s;
}
export function freezeSvg(frame){
 const t=frame/FPS*.8;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><radialGradient id="bg"><stop stop-color="#fffdf4"/><stop offset="1" stop-color="#e1eddf"/></radialGradient><radialGradient id="ball" cx=".38" cy=".32"><stop stop-color="#bff0fa"/><stop offset=".55" stop-color="#59c3e2"/><stop offset="1" stop-color="#2b98c9"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect x="24" y="24" width="912" height="492" rx="28" fill="none" stroke="#cfba83" stroke-width="2"/>${beaker(t)}</svg>`;
}
