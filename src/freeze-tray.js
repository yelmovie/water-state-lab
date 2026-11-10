import {materialPattern} from './study-materials.js';
import {paintTimeDial} from './time-dial.js';
import {createObservationClock} from './observation-speed.js';
import {icon,esc,beakerGlass} from './ui.js';
import {fieldAction} from './fieldwork-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

// The water and the ice use the same six wells in the generated empty tray.
let drawing=0;
const wells=[
 ['M193 284Q195 272 213 272H510Q528 272 529 290L532 408Q533 429 512 430H168Q145 429 152 407Z',328,338],
 ['M625 272H912Q932 272 933 290L939 409Q939 430 919 430H613Q593 430 594 409L603 292Q604 272 625 272Z',765,338],
 ['M1032 272H1302Q1323 272 1328 291L1362 407Q1368 430 1344 430H1040Q1020 430 1018 410L1008 292Q1006 272 1032 272Z',1178,338],
 ['M140 536Q143 520 162 520H500Q519 520 518 539L510 682Q509 704 488 704H128Q104 704 109 681Z',311,598],
 ['M611 520H928Q947 520 950 539L961 683Q963 704 940 704H594Q571 704 573 682L589 539Q591 520 611 520Z',770,598],
 ['M1046 520H1383Q1403 520 1407 540L1435 681Q1440 704 1416 704H1047Q1027 704 1027 684L1025 541Q1024 520 1046 520Z',1225,598]
];
export const trayFillLevels=amount=>Array.from({length:6},(_,i)=>Math.max(0,Math.min(1,Number(amount)*.06-i)));
const cupInside=[[53,38],[207,38],[207,253],[192,268],[68,268],[53,253]];
const rotated=(x,y,angle)=>{const a=angle*Math.PI/180;return {x:130+(x-130)*Math.cos(a)-(y-160)*Math.sin(a),y:160+(x-130)*Math.sin(a)+(y-160)*Math.cos(a)};};
function area(points){return Math.abs(points.reduce((sum,p,i)=>{const n=points[(i+1)%points.length];return sum+p.x*n.y-n.x*p.y;},0))/2;}
// Horizontal free surface found by area, so tilting the glass does not create or lose water.
export function cupWaterSurface(amount,angle){
 const poly=cupInside.map(([x,y])=>rotated(x,y,angle)),total=area(poly),target=Math.max(0,Math.min(100,amount))/100*total;
 let lo=Math.min(...poly.map(p=>p.y)),hi=Math.max(...poly.map(p=>p.y));
 for(let i=0;i<22;i++){
  const y=(lo+hi)/2,wet=[];
  poly.forEach((p,j)=>{const n=poly[(j+1)%poly.length];if(p.y>=y)wet.push(p);if((p.y>=y)!==(n.y>=y)){const t=(y-p.y)/(n.y-p.y);wet.push({x:p.x+(n.x-p.x)*t,y});}});
  if(area(wet)>target)lo=y;else hi=y;
 }
 return (lo+hi)/2;
}
function cupArt(amount=72){
 const id='tray-cup-'+(++drawing),y=cupWaterSurface(amount,0);
 return `<svg class="beaker tray-cup-art" data-tray-cup-art viewBox="30 20 200 280" role="img" aria-label="얼음틀에 나누어 부을 물컵"><defs><clipPath id="${id}"><path d="M53 38H207V253Q207 268 192 268H68Q53 268 53 253Z"/></clipPath><linearGradient id="${id}-water" x2=".3" y2="1"><stop stop-color="#9ae7f5"/><stop offset=".5" stop-color="#4cbddd"/><stop offset="1" stop-color="#1788bc"/></linearGradient>${materialPattern(id+'-liquid','water',{x:53,y:38,width:154,height:230,base:'#d4e9e9'})}</defs>${beakerGlass()}<g clip-path="url(#${id})"><g data-cup-water transform="rotate(0 130 160)"><rect data-cup-level x="-250" y="${y}" width="800" height="700" fill="url(#${id}-liquid)"/><ellipse data-cup-surface cx="130" cy="${y}" rx="170" ry="7" fill="#c8f3fc" stroke="#f5feff" stroke-width="2"/></g></g><path d="M58 52V247Q58 260 72 261" fill="none" stroke="#fff" stroke-width="6" opacity=".65"/><path d="M201 54V250Q201 259 194 262" fill="none" stroke="#3d7c98" stroke-width="2" opacity=".5"/>${Array.from({length:7},(_,i)=>`<path d="M54 ${61+i*26}h${i%2?12:22}" stroke="#477b94" stroke-width="2"/>`).join('')}</svg>`;
}
export function trayArt(kind='empty',melted=0,fill=100){
 const id='ice-tray-'+(++drawing),ice=kind==='ice',fraction=Math.max(0,Math.min(1,melted/100));
 const water=kind==='water'||ice&&fraction>0,solid=ice&&fraction<1,scale=1-fraction*.9;
 const label=kind==='empty'?'비어 있는 여섯 칸 얼음틀':solid?fraction?'같은 틀 안에서 작아지는 얼음과 녹은 물':'같은 얼음틀의 여섯 칸에 생긴 얼음':'여섯 칸에 물이 담긴 얼음틀';
 const levels=trayFillLevels(fill);
 return `<svg class="transform-art ice-tray-art" viewBox="0 110 1536 800" role="img" aria-label="${label}"><defs><linearGradient id="${id}-water" x2=".2" y2="1"><stop stop-color="#9de6f3"/><stop offset=".52" stop-color="#58b9d4"/><stop offset="1" stop-color="#258dab"/></linearGradient><linearGradient id="${id}-ice" x2=".2" y2="1"><stop stop-color="#f2fdff"/><stop offset=".52" stop-color="#c9eaf1"/><stop offset="1" stop-color="#a9d4e4"/></linearGradient>${wells.map(([d],i)=>`<clipPath id="${id}-${i}"><rect data-well-clip="${i}" x="0" y="${(i<3?430:704)-(i<3?158:184)*levels[i]}" width="1536" height="${(i<3?158:184)*levels[i]+(levels[i]?4:0)}"/></clipPath>`).join('')}${wells.map(([,x,y],i)=>['water','ice'].map(kind=>materialPattern(id+'-'+kind+i,kind,{x:x-205,y:y-92,width:410,height:196,base:kind==='ice'?'#bce4f3':'#86d7e7'})).join('')).join('')}</defs><image href="/assets/learning/ice-tray-20261108/ice-tray-empty.webp" width="1536" height="1024"/>${wells.map(([d,x,y],i)=>`<g data-tray-well="${i}" data-well-x="${x}" data-well-y="${y}">${water?`<g class="tray-liquid" clip-path="url(#${id}-${i})" opacity="${ice?.35+fraction*.65:1}"><path d="${d}" fill="url(#${id}-water${i})" stroke="#a8eaf1" stroke-width="5"/><path d="M${x-68} ${y-27}q52-16 113-6" fill="none" stroke="#f4ffff" stroke-width="5" opacity=".85"/></g>`:''}${solid?`<g class="tray-solid" transform="translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})"><path d="${d}" fill="url(#${id}-ice${i})" stroke="#efffff" stroke-width="5"/><path d="M${x-68} ${y-27}q52-16 113-6" fill="none" stroke="#f7ffff" stroke-width="6" opacity=".85"/></g>`:''}<ellipse data-tray-ripple="${i}" cx="${x}" cy="${y}" rx="42" ry="12" fill="none" stroke="#f4ffff" stroke-width="7" opacity="0"/></g>`).join('')}</svg>`;
}
const steps={
 empty:{index:0,title:'여섯 칸에 같은 양을 담아 봐',hint:'물컵을 얼음틀 위로 끌어 여섯 칸에 나눠 담아. 아래 버튼으로 부어도 돼.',action:'fill',label:'얼음틀에 물 붓기'},
 water:{index:1,title:'물 든 얼음틀을 냉동고에 넣어 봐',hint:'물을 담은 틀을 오른쪽 냉동고에 넣고 문을 닫자.',action:'load',label:'넣고 문 닫기'},
 cooling:{index:2,title:'차가운 냉동고에서 기다려 보자',hint:'시계를 톡 눌러 봐. 충분히 기다리면 어떻게 될까?',action:'wait',label:'충분히 기다리기'},
 frozen:{index:3,title:'이제 문을 열고 꺼내 보자',hint:'냉동고 안에서 충분한 시간이 지났어. 틀 속을 확인해 봐.',action:'take',label:'문 열고 꺼내기'},
 taken:{index:3,title:'같은 얼음틀, 무엇이 달라졌을까?',hint:'물은 어디에서 어떤 모양으로 얼었는지 나란히 살펴봐.',action:'compare',label:'얼기 전·후 비교했어'},
 compared:{index:4,title:'물에서 얼음으로, 얼기를 관찰했어!',hint:'네모난 틀의 칸 모양대로 얼음이 생겼어.'}
};
export function freezeTrayView(c){
 const stage=c.moves.freezeTray||'empty',task=steps[stage]||steps.empty,inside=['cooling','frozen'].includes(stage),comparison=['taken','compared'].includes(stage),time=Number(c.moves.freezeTime)||0,fill=stage==='empty'?Number(c.moves.freezeFill)||0:100;
 return `<section class="tray-lab" data-tray-stage="${esc(stage)}" aria-label="얼음틀과 냉동고로 물 얼리기">
 <div class="tray-heading"><small>첫 번째 변신 · 물 → 얼음</small><h2>${task.title}</h2><p>${task.hint}</p></div>
 <ol class="tray-steps" aria-label="얼음 만드는 순서">${['물 붓기','냉동고에 넣기','얼리기','꺼내 비교'].map((label,i)=>`<li class="${task.index>i?'is-done':''}" ${task.index===i?'aria-current="step"':''}><span>${task.index>i?icon('check',16):i+1}</span>${label}</li>`).join('')}</ol>
 ${comparison?`<div class="tray-comparison"><figure><figcaption>얼리기 전 <b>물</b></figcaption>${trayArt('water')}<p>같은 틀에 물을 나누어 담았어</p></figure><span class="tray-change-arrow" aria-label="냉동고에서 충분히 얼린 뒤">${icon('arrow',24)}</span><figure><figcaption>꺼낸 뒤 <b>얼음</b></figcaption>${trayArt('ice')}<p>여섯 칸의 모양대로 얼었어</p></figure></div>`:
 `<div class="tray-workbench"><div class="tray-prep"><h3>물컵에서 여섯 칸으로</h3><div class="tray-prep-art">
 <button type="button" class="tray-cup" data-tray-source="cup" aria-label="물컵을 얼음틀에 부어 보기" ${stage==='empty'?'':'disabled'}>${cupArt(72*(1-fill/100))}<span>${fill===100?'빈 컵':fill?'남은 물':'물컵'}</span></button>
 ${inside?'<div class="tray-away"><span>얼음틀은<br>냉동고 안에 있어</span></div>':`<div class="tray-seat" data-tray-target="tray"><button type="button" class="tray-carry" data-tray-source="tray" aria-label="물 든 얼음틀을 냉동고에 넣기" ${stage==='water'?'':'disabled'}>${trayArt('water',0,fill)}</button><span data-tray-fill-label class="tray-fill-goal">${fill===100?'물을 담은 얼음틀':fill?`${Math.floor(fill*.06)} / 6칸에 물을 담았어`:'목표 · 6칸에 같은 양'}</span></div>`}
 </div></div><div class="tray-freezer"><h3>같은 틀을 냉동고로</h3><div class="tray-freezer-visual ${inside?'is-closed':''}" data-tray-target="freezer"><img class="tray-freezer-open" src="/assets/learning/ice-tray-20261108/freezer-open.webp" alt="문이 ${inside?'닫힌':'열린'} 냉동고" draggable="false"><img class="tray-freezer-closed" src="/assets/learning/freeze-props-20261108/freezer-closed.webp" alt="" aria-hidden="true" draggable="false"><div class="tray-freezer-drop" aria-hidden="true"></div><div class="tray-freezer-load">${inside?trayArt(stage==='frozen'?'ice':'water'):''}</div><span class="tray-freezer-readout">${stage==='frozen'?'얼리기 완료':inside?'얼리는 중':'준비'}</span></div></div></div>`}
 <div class="tray-action-row"><div class="tray-notice" role="status"><span class="tray-state-dot" aria-hidden="true"></span><p data-tray-status>${esc(c.message||'컵의 물을 먼저 얼음틀에 나누어 담자.')}</p></div>
 ${stage==='cooling'?`<div class="tray-time"><label for="tray-freeze-time">시간 보내기 <output data-tray-time-label>${time===0?'처음':'조금 지난 뒤'}</output></label><input id="tray-freeze-time" type="range" min="0" max="100" step="5" value="${time}" aria-valuetext="${time}%만큼 시간 보내기"><progress data-tray-progress max="100" value="${time}" aria-label="냉동고에서 기다린 정도"></progress></div>`:''}
 ${task.action?`<button type="button" class="btn primary tray-primary" data-tray-action="${task.action}">${task.label}${icon('arrow',20)}</button>`:'<button type="button" class="btn primary tray-primary" data-transform-next>다음 · 이 얼음을 녹여 보기'+icon('arrow',20)+'</button>'}</div></section>`;
}

export function bindFreezeTray(host,get,paint){
 const life=new AbortController(),{signal}=life;
 let busy=false,timer=0,frame=0,drag=null,suppressClickUntil=0,actors=[],stream=null;
 const still=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const commit=(step,time)=>{state.fieldwork.chapters[2]=fieldAction(2,get(),'freeze-tray',{step,time});save();};
 function lock(value){busy=value;const lab=host.querySelector('.tray-lab');lab?.setAttribute('aria-busy',String(value));host.querySelectorAll('[data-tray-action]').forEach(b=>b.disabled=value);const input=host.querySelector('#tray-freeze-time');if(input)input.disabled=value;}
 function showTime(value){
  const input=host.querySelector('#tray-freeze-time'),progress=host.querySelector('[data-tray-progress]'),label=host.querySelector('[data-tray-time-label]');
  if(input){input.value=value;paintTimeDial(input);input.setAttribute('aria-valuetext',value+'%만큼 시간 보내기');}
  if(progress)progress.value=value;if(label)label.textContent=value===100?'충분히 지난 뒤':value===0?'처음':'얼음이 될 때까지 기다리는 중';
 }
 const cup=()=>host.querySelector('[data-tray-cup-art]');
 function setCup(svg,amount,angle=0){
  if(!svg)return;const y=cupWaterSurface(72*(1-amount/100),angle);
  svg.querySelector('[data-cup-water]').setAttribute('transform',`rotate(${-angle} 130 160)`);
  svg.querySelector('[data-cup-level]').setAttribute('y',y);svg.querySelector('[data-cup-surface]').setAttribute('cy',y);
 }
 function showFill(amount,index=-1,ripple=0){
  const levels=trayFillLevels(amount);
  host.querySelectorAll('[data-well-clip]').forEach(clip=>{const i=+clip.dataset.wellClip,height=(i<3?158:184)*levels[i];clip.setAttribute('y',(i<3?430:704)-height);clip.setAttribute('height',height+(height?4:0));});
  host.querySelectorAll('[data-tray-ripple]').forEach(e=>{const active=+e.dataset.trayRipple===index;e.setAttribute('opacity',active?.65:0);if(active){e.setAttribute('rx',24+ripple*50);e.setAttribute('ry',7+ripple*14);}});
  const label=host.querySelector('[data-tray-fill-label]');if(label)label.textContent=amount>=100?'여섯 칸에 물을 담았어':`${Math.floor(amount*.06)} / 6칸 · 물을 나누어 담는 중`;
  setCup(cup(),amount);
 }
 function actor(html,rect,type){
  const el=document.createElement('div');el.className='tray-motion-actor '+type;el.setAttribute('aria-hidden','true');el.innerHTML=html;
  Object.assign(el.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px'});document.body.append(el);actors.push(el);return el;
 }
 function clearMotion(){
  cancelAnimationFrame(frame);clearTimeout(timer);actors.forEach(e=>{e.getAnimations().forEach(a=>a.cancel());e.remove();});actors=[];stream?.remove();stream=null;
  for(const selector of ['[data-tray-cup-art]','.tray-carry','.tray-freezer-load']){const e=host.querySelector(selector);if(e)e.style.visibility='';}
 }
 function door(closed){
  const freezer=host.querySelector('.tray-freezer-visual');if(!freezer)return;freezer.classList.toggle('is-closed',closed);freezer.querySelector('.tray-freezer-readout').textContent=closed?'얼리는 중':'준비';freezer.querySelector('.tray-freezer-open').alt=`문이 ${closed?'닫힌':'열린'} 냉동고`;
 }
 function pour(finish,startRect){
  const original=cup(),home=original.getBoundingClientRect(),tray=host.querySelector('.tray-carry .ice-tray-art'),matrix=tray.getScreenCTM(),from=Number(get().moves.freezeFill)||0;
  const centres=wells.map(([,x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
  const first=Math.min(5,Math.floor(from*.06)),moving=actor(cupArt(72*(1-from/100)),startRect||home,'tray-motion-cup');original.style.visibility='hidden';
  const width=home.width,height=home.height,scale=width/200,angle=58,lip=rotated(219,28,angle),bench=host.querySelector('.tray-workbench').getBoundingClientRect();
  const poses=centres.map(p=>({x:p.x-(lip.x-130)*scale,y:Math.max(bench.top+height/2+8,p.y-32-(lip.y-160)*scale),angle}));
  const origin=startRect||home,initial={x:origin.x+origin.width/2,y:origin.y+origin.height/2,angle:0},rest={x:home.x+width/2,y:home.y+height/2,angle:0};
  const phases=[],add=(duration,a,b,start,end,well=-1,flow=false)=>phases.push({duration,a,b,start,end,well,flow});
  add(420,initial,poses[first],from,from);
  for(let i=first;i<6;i++){
   const start=Math.max(from,i*100/6),end=(i+1)*100/6;
   if(i>first)add(160,poses[i-1],poses[i],start,start);
   add(Math.max(60,470*(end-start)/(100/6)),poses[i],poses[i],start,end,i,true);add(70,poses[i],poses[i],end,end);
  }
  add(380,poses[5],rest,100,100);
  stream=document.createElementNS('http://www.w3.org/2000/svg','svg');stream.classList.add('tray-pour-stream');stream.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);stream.setAttribute('aria-hidden','true');stream.innerHTML='<path class="tray-stream-body"/><path class="tray-stream-light"/><ellipse class="tray-stream-impact" rx="8" ry="3"/>';document.body.append(stream);
  let phase=0,began=performance.now();const ease=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
  const tick=now=>{
   if(signal.aborted)return;let step=phases[phase],elapsed=now-began;
   while(elapsed>=step.duration&&phase<phases.length-1){began+=step.duration;phase++;step=phases[phase];elapsed=now-began;}
   const t=Math.min(1,elapsed/step.duration),e=ease(t),pose={x:mix(step.a.x,step.b.x,e),y:mix(step.a.y,step.b.y,e),angle:mix(step.a.angle,step.b.angle,e)},amount=mix(step.start,step.end,t);
   Object.assign(moving.style,{left:(pose.x-width/2)+'px',top:(pose.y-height/2)+'px',width:width+'px',height:height+'px',transform:`rotate(${pose.angle}deg)`});
   setCup(moving.querySelector('svg'),amount,pose.angle);showFill(amount,step.flow?step.well:-1,(now%320)/320);
   const saved=Math.min(98,Math.floor(amount/2)*2);if(saved>Number(get().moves.freezeFill||0))commit('fill',saved);
   stream.style.opacity=step.flow?'1':'0';
   if(step.flow){
    const spout=rotated(219,28,pose.angle),sx=pose.x+(spout.x-130)*scale,sy=pose.y+(spout.y-160)*scale,target=centres[step.well],tx=target.x,ty=target.y+(1-trayFillLevels(amount)[step.well])*12;
    const d=`M${sx} ${sy}Q${sx+5} ${mix(sy,ty,.6)} ${tx} ${ty}`;stream.querySelectorAll('path').forEach(p=>p.setAttribute('d',d));const impact=stream.querySelector('ellipse');impact.setAttribute('cx',tx);impact.setAttribute('cy',ty);
   }
   if(phase===phases.length-1&&t===1){clearMotion();finish();}else frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);
 }
 function runClock(){
  if(busy||get().moves.freezeTray!=='cooling')return;
  if(still()){commit('wait',100);paint();return;}
  lock(true);const clock=createObservationClock(state.settings),from=Number(get().moves.freezeTime)||0;
  const tick=now=>{
   if(signal.aborted)return;
   const p=Math.min(1,clock(now)/1000),value=Math.round((from+(100-from)*p)/5)*5;
   if(value!==Number(get().moves.freezeTime)){commit('wait',value);showTime(value);}
   if(p<1)frame=requestAnimationFrame(tick);else{lock(false);void playCue('success');paint();}
  };frame=requestAnimationFrame(tick);
 }
 function act(step,startRect){
  if(busy||!host.querySelector('.tray-lab'))return;
  const expected=steps[get().moves.freezeTray||'empty']?.action;if(expected!==step)return;
  if(step==='wait'){runClock();return;}
  const finish=()=>{if(signal.aborted)return;commit(step);lock(false);void playCue(step==='compare'?'success':'drop');paint();};
  if(still()||step==='compare'){finish();return;}
  lock(true);
  if(step==='fill'){
   host.querySelector('[data-tray-status]').textContent='물을 여섯 칸에 나누어 붓는 중이야…';
   pour(finish,startRect);return;
  }else if(step==='load'){
   const tray=host.querySelector('.tray-carry'),from=startRect||tray.getBoundingClientRect(),slot=host.querySelector('.tray-freezer-load'),to=slot.getBoundingClientRect(),flight=actor(trayArt('water'),from,'tray-motion-tray');tray.style.visibility='hidden';
   flight.animate([{transform:'none'},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px) scale(${to.width/from.width},${to.height/from.height})`}],{duration:700,fill:'forwards',easing:'cubic-bezier(.3,.6,.25,1)'});
   host.querySelector('[data-tray-status]').textContent='물을 담은 틀을 냉동고에 넣고 문을 닫는 중이야…';
   timer=setTimeout(()=>{flight.remove();slot.innerHTML=trayArt('water');door(true);timer=setTimeout(()=>{clearMotion();finish();},300);},720);return;
  }else if(step==='take'){
   door(false);timer=setTimeout(()=>{const slot=host.querySelector('.tray-freezer-load'),from=slot.getBoundingClientRect(),to=host.querySelector('.tray-away').getBoundingClientRect(),flight=actor(trayArt('ice'),from,'tray-motion-tray');slot.style.visibility='hidden';flight.animate([{transform:'none'},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px) scale(${to.width/from.width},${to.height/from.height})`}],{duration:650,fill:'forwards',easing:'ease-in-out'});timer=setTimeout(()=>{clearMotion();finish();},680);},220);return;
  }
  timer=setTimeout(finish,step==='fill'?800:650);
 }
 host.addEventListener('click',e=>{
  const button=e.target.closest('[data-tray-action],[data-tray-source]');if(!button||button.disabled||performance.now()<suppressClickUntil)return;
  const source=button.dataset.traySource;act(button.dataset.trayAction||(source==='cup'?'fill':'load'));
 },{signal});
 host.addEventListener('input',e=>{
  if(e.target.id!=='tray-freeze-time'||busy)return;
  const value=Math.max(Number(get().moves.freezeTime)||0,+e.target.value);commit('wait',value);showTime(value);
  if(value===100){void playCue('success');paint();}
 },{signal});
 const target=()=>host.querySelector(`[data-tray-target="${drag?.source==='cup'?'tray':'freezer'}"]`);
 const over=e=>{const r=target()?.getBoundingClientRect();return r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
 host.addEventListener('pointerdown',e=>{
  const button=e.target.closest('[data-tray-source]');if(!button||button.disabled||e.button!==0||busy||drag)return;
  drag={button,source:button.dataset.traySource,id:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};
  if(e.pointerType==='mouse')button.setPointerCapture(e.pointerId);
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(drag?.id!==e.pointerId)return;
  if(!drag.ghost){
   if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<10)return;
   drag.ghost=document.createElement('div');drag.ghost.className='tray-drag-ghost';drag.ghost.setAttribute('aria-hidden','true');const source=drag.button.querySelector('svg'),r=source.getBoundingClientRect();drag.ghost.innerHTML=drag.source==='cup'?cupArt(72*(1-Number(get().moves.freezeFill||0)/100)):trayArt('water');drag.ghost.style.width=r.width+'px';drag.ghost.style.height=r.height+'px';source.style.visibility='hidden';document.body.append(drag.ghost);
  }
  drag.ghost.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  target()?.classList.toggle('is-drop-target',!!over(e));
 },{signal});
 function release(e){
  if(drag?.id!==e.pointerId)return;
  const hit=over(e),{ghost,source,button}=drag,rect=ghost?.getBoundingClientRect();target()?.classList.remove('is-drop-target');drag=null;ghost?.remove();button.querySelector('svg').style.visibility='';
  if(!ghost)return;suppressClickUntil=performance.now()+350;
  if(e.type==='pointerup'&&hit)act(source==='cup'?'fill':'load',rect);
 }
 for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,release,{signal});
 const pause=()=>{if(!busy&&!drag)return;clearMotion();if(drag)drag.button.querySelector('svg').style.visibility='';drag?.ghost?.remove();drag=null;if(host.querySelector('.tray-lab')){lock(false);const stage=get().moves.freezeTray||'empty';if(stage==='empty')showFill(Number(get().moves.freezeFill)||0);door(['cooling','frozen'].includes(stage));host.querySelector('[data-tray-status]').textContent=get().message||'잠깐 멈췄어. 같은 자리에서 이어서 관찰할 수 있어.';}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();},{signal});
 host.addEventListener('transform-pause',pause,{signal});
 window.addEventListener('resize',pause,{signal});
 document.addEventListener('observation-stop',()=>{
  pause();
 },{signal});
 return ()=>{life.abort();clearMotion();drag?.ghost?.remove();};
}
