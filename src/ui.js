export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon=(name,size=22)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({arrow:'<path d="M4 12h15M13 6l6 6-6 6"/>',back:'<path d="M20 12H5m6-6-6 6 6 6"/>',book:'<path d="M12 5v16M12 5C8 2 3 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z"/>',home:'<path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-8h6v8"/>',check:'<path d="m5 12 4 4L20 5"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',drop:'<path d="M12 2C9 7 4 12 4 16a8 8 0 0 0 16 0c0-4-5-9-8-14Z"/><path d="M8 16a4 4 0 0 0 4 4"/>',settings:'<path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 3-1 2 3 3-1 1-3 3-1 1-3-2-2 1-3-3-2-3 1-2-2Z"/><circle cx="12" cy="11" r="3"/>',speaker:'<path d="M11 4 5 9H2v6h3l6 5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',speakerOff:'<path d="M11 4 5 9H2v6h3l6 5Z"/><path d="m16 9 6 6m0-6-6 6"/>' ,star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1Z"/>',zoom:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>',flask:'<path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10"/>',print:'<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7Z"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',retry:'<path d="M4 10a8 8 0 1 1 1 8M4 3v7h7"/>',hand:'<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',expand:'<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>'})[name]||''}</svg>`;
export const btn=(text,action,cls='',disabled=false)=>`<button class="btn ${cls}" data-action="${action}" ${cls.split(' ').includes('selected')?'aria-pressed="true"':''} ${disabled?'disabled':''}>${text}</button>`;
export const range=(id,label,value,min=0,max=100,step=1)=>`<label class="range-label" for="${id}">${label}<output for="${id}" id="${id}-out">${value}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}">`;
export function buddy(pose='wave',cls=''){
 const poses={wave:0,happy:1,yes:2,cheer:3,think:4,question:5,surprise:6,worry:7,proud:8,record:9,point:10,experiment:11,inspect:12,care:13,celebrate:14,sleep:15};
 const index=poses[pose]??0;
 return `<span class="buddy-pose ${cls}" style="--buddy-x:${index%4*100/3}%;--buddy-y:${Math.floor(index/4)*100/3}%" role="img" aria-label="방울이"><span class="sr-only">물방울 연구원 방울이</span></span>`;
}
export function mascot(small=false){return buddy('wave',small?'small':'');}
export function propArt(name,cls='',label=''){
 const names=['beaker','jug','ice','cloth','can','icepack','thermometer','magnifier','seedling'];const index=Math.max(0,names.indexOf(name));
 return `<span class="prop-art ${cls}" style="--prop-x:${index%3*50}%;--prop-y:${Math.floor(index/3)*50}%" ${label?`role="img" aria-label="${esc(label)}"`:'aria-hidden="true"'}></span>`;
}

export const note=(text)=>`<div class="guide">${mascot(true)}<div><span class="eyebrow">방울이의 연구 메모</span><p>${text}</p></div></div>`;
// Keep the cup and support in one coordinate system, including the transparent art margins.
// Cup base: 131 wide. Usable heating disc: 170 wide, with its centre under the cup base.
export function heatingRig(level=60,boiling=false,heated=false,active=false){
 const cup=beaker(level,false,boiling).replace(/^<svg[^>]*>/,'<g class="heating-cup" transform="translate(55 4) scale(.8076923077)">').replace(/<\/svg>$/,'</g>');
 const support=heated?`<image class="heating-plate-image" href="/assets/learning/heat-plate-guide.webp" x="35" y="168.4" width="250" height="192.3077"/>${active?'<ellipse cx="160" cy="223.7" rx="80" ry="18" fill="none" stroke="#f6aa45" stroke-width="4" opacity=".65"/>':''}`:'';
 return `<svg class="heating-rig" viewBox="0 0 320 370" role="img" aria-label="${heated?'비커 바닥보다 넓은 가열판 위의 물':'가열하지 않은 비커의 물'}"><title>${heated?'비커 바닥 전체가 가열판 안에 놓여 있어':'같은 크기의 비커 · 가열하지 않음'}</title>${support}${cup}</svg>`;
}
// Mark labels sit beside the beaker (not inside it) and never overlap, so they stay legible when the SVG is small.
function markLines(marks){const ys=marks.map(m=>267-m.level*2.1),order=marks.map((_,i)=>i).sort((a,b)=>ys[a]-ys[b]),at=[];order.forEach((i,k)=>{at[i]=Math.min(286,Math.max(26,k?Math.max(ys[i],at[order[k-1]]+42):ys[i]));});return marks.map((m,i)=>`<path d="M48 ${ys[i]}h170L226 ${at[i]}" fill="none" stroke="${m.color}" stroke-width="2" ${i===1?'stroke-dasharray="5 4"':' '}/><text x="230" y="${at[i]}" dominant-baseline="middle" fill="${m.color}" font-size="26" font-family="NanumSquareNeo, sans-serif" stroke="#fffdf4" stroke-width="4" paint-order="stroke">${m.label}</text>`).join('');}
let beakerCount=0;
// Cropped glass photograph, aligned to the shared 53..207 interior and 267 water floor.
export function beakerGlass(){
 return '<svg x="44" y="26" width="172" height="250" viewBox="122 24 276 571" preserveAspectRatio="none" aria-hidden="true"><image href="/assets/v2/pouring-glass.webp" width="1261" height="1247"/></svg>';
}
export function beaker(level=60,frozen=false,bubbles=false,marks=[]){
 const amount=Math.max(0,Math.min(100,Number(level)||0));
 const clip='water-clip-'+(++beakerCount),levelY=267-amount*2.1;
 const liquid=`M53 ${levelY}h154V253q0 15-15 15H68q-15 0-15-15Z`;
 const contents=amount?`<g clip-path="url(#${clip})"><path d="${liquid}" fill="#a9d4dd" opacity=".2"/><image opacity="${frozen?1:.66}" href="/assets/learning/${frozen?'ice':'water'}-texture.webp" x="53" y="${levelY}" width="154" height="${268-levelY}" preserveAspectRatio="none"/></g>`:'';
 const surface=amount&&!frozen?`<ellipse cx="130" cy="${levelY}" rx="77" ry="7" fill="#d2eeed" fill-opacity=".68" stroke="#f5ffff" stroke-width="1.4"/><path d="M56 ${levelY}Q130 ${levelY+12} 204 ${levelY}" fill="none" stroke="#76a7b0" stroke-width="1" opacity=".7"/>`:'';
 const boiling=amount&&!frozen&&bubbles?`<g clip-path="url(#${clip})">${Array.from({length:12},(_,i)=>{
  const x=72+(i*29)%116,y=258-i*(258-levelY)/13,r=2+i%4;
  return `<g class="bubble" style="animation-delay:${i*.17}s"><circle cx="${x}" cy="${y}" r="${r}" fill="#edffff" fill-opacity=".16" stroke="#e9ffff" stroke-width="1"/><path d="M${x-r*.6} ${y}Q${x-r*.7} ${y-r*.7} ${x} ${y-r*.6}" fill="none" stroke="#fff" stroke-width="1.2"/></g>`;
 }).join('')}</g>`:'';
 return `<svg class="beaker" viewBox="0 0 ${marks.length?340:260} 300" role="img" aria-label="${amount?frozen?'얼음':'물':'빈 공간'}이 담긴 비커"><defs><clipPath id="${clip}"><path d="${liquid}"/></clipPath></defs>${beakerGlass()}${contents}${surface}${boiling}<path d="M58 53V248M200 51V249" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>${Array.from({length:8},(_,i)=>`<path d="M57 ${61+i*26}h${i%2?12:22}" stroke="#527d80" stroke-width="1.5"/>`).join('')}${markLines(marks)}</svg>`;
}
// Generated metal body stays identical in both conditions; droplets alone follow trial data.
export function canArt(droplets=0){
 const count=Math.max(0,Math.min(24,Number.isFinite(droplets)?Math.floor(droplets):0));
 return `<svg class="can-art" viewBox="0 0 240 290" role="img" aria-label="용기 겉면 · ${count?'물방울 '+count+'개':'마른 표면'}"><image href="/assets/learning/overnight-20261108/condensation-can.webp" x="-9" y="16" width="258" height="267" preserveAspectRatio="none"/>${Array.from({length:count},(_,i)=>`<g data-condensation-drop><ellipse cx="${65+(i*37)%109}" cy="${79+(i*47)%155}" rx="${3+i%4}" ry="${4+i%5}" fill="#d9faff" stroke="#3e789d" stroke-width="1.3" opacity=".92"/><ellipse cx="${64+(i*37)%109}" cy="${77+(i*47)%155}" rx="1.3" ry="2" fill="#fff"/></g>`).join('')}</svg>`;
}

/** A short burst of drops and stars inside `host`. Skipped when motion is turned off. */
export function celebrate(host,delay=0){
 if(!host||document.documentElement.classList.contains('reduce-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const layer=document.createElement('div');layer.className='confetti';layer.setAttribute('aria-hidden','true');
 layer.innerHTML=Array.from({length:36},(_,i)=>`<i class="bit-${i%4}" style="--x:${i*37%100}%;--wait:${delay+i*53%700}ms;--turn:${i*67%360}deg;--drift:${i*29%120-60}px"></i>`).join('');
 host.append(layer);setTimeout(()=>layer.remove(),delay+3400);
}
export function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3800);}
let modalOpener;
const modalDialogs=new WeakSet();
export function modal(title,body){
 const d=document.querySelector('#dialog'),wasOpen=d.open;
 if(!wasOpen&&!d.contains(document.activeElement))modalOpener=document.activeElement;
 if(!modalDialogs.has(d)){
  modalDialogs.add(d);
  d.addEventListener('close',()=>{
   if(d.open)return;
   const opener=modalOpener;modalOpener=undefined;
   if(opener?.isConnected&&!document.querySelector('dialog[open]'))opener.focus({preventScroll:true});
  });
 }
 const story=body.includes('story-overlay');
 d.className='app-dialog'+(story?' story-dialog':'')+(body.includes('reward-modal')?' reward-dialog':'');
 d.innerHTML=`<div class="dialog-head"><h2 id="dialog-title" tabindex="-1">${esc(title)}</h2><button type="button" class="icon-btn" id="close-dialog" aria-label="닫기">${icon('close')}</button></div><div class="dialog-body">${body}</div>`;
 d.querySelector('#close-dialog').onclick=()=>d.close();
 if(!wasOpen)d.showModal();
 d.querySelector('.dialog-body').scrollTop=0;d.scrollTop=0;
 (story?d.querySelector('.story-actions button'):d.querySelector('#dialog-title'))?.focus({preventScroll:true});
 return d;
}
