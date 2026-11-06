import {pipeTrial,limit} from './activity-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

// Chapter 4 experiment: test tubes at Ttukttak's bench. The mission after it uses a faucet and a lever, so this one stays hand-held.
const TOP=36,BOTTOM=236,VIEW_TOP=-14,VIEW_HEIGHT=264,SHELF=3,FLY_MS=380,FREEZE_MS=1400;
const results={높음:{label:'마개가 튀어 나갔어',line:'퐁! 얼음이 커지면서 마개를 밀어냈어.'},보통:{label:'자리가 빠듯해',line:'얼음이 입구에 거의 닿았어. 자리가 빠듯해.'},낮음:{label:'빈자리가 넉넉해',line:'얼음이 커져도 위에 빈자리가 넉넉해!'}};
const motionOff=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const levelY=amount=>BOTTOM-(BOTTOM-TOP)*amount/100;
let justFrozen=false;

export const benchFill=value=>Math.round(limit(value,40,100)/5)*5;
export const fillAtHeight=ratio=>benchFill(100-ratio*100);
export const canMark=trials=>trials.some(t=>t.safe)&&trials.some(t=>!t.safe);
/** The newest tube of each amount, with its index in the saved trial list. */
export function shelfTrials(trials){
 const seen=new Set(),list=[];
 for(let i=trials.length-1;i>=0;i--){if(seen.has(trials[i].fill))continue;seen.add(trials[i].fill);list.unshift({t:trials[i],i});}
 return list.slice(-SHELF);
}
const tubeWall='M26 30V212a24 24 0 0 0 48 0V30';
const ticks=[20,40,60,80].map(v=>`<path class="bench-tick" d="M26 ${levelY(v)}h10"/>`).join('');
function tubeArt(clip,fill,{ice=null,popped=false,space=false}={}){
 const top=ice===null?levelY(fill):levelY(ice),from=ice===null?1:fill/ice;
 return `<svg class="bench-art" viewBox="0 ${VIEW_TOP} 110 ${VIEW_HEIGHT}" aria-hidden="true"><defs><clipPath id="${clip}"><path d="M26 10V212a24 24 0 0 0 48 0V10Z"/></clipPath></defs>
  <path class="bench-glass" d="${tubeWall}Z"/>
  <g clip-path="url(#${clip})"><rect class="${ice===null?'bench-water':'bench-ice'}" data-bench-water x="20" y="${top}" width="60" height="${BOTTOM+6-top}" style="--from:${from}"/></g>
  ${space?`<rect class="bench-space" x="30" y="${TOP+2}" width="40" height="${Math.max(6,top-TOP-5)}" rx="5"/>`:''}
  ${ice===null?'':`<path class="bench-start" d="M18 ${levelY(fill)}h64"/>`}
  ${ticks}<path class="bench-wall" d="${tubeWall}"/>
  <path class="bench-cork ${popped?'is-popped':''}" d="${popped?'M72 -10l30 8-6 22-30-8Z':'M30 12h40l-4 26H34Z'}"/>
 </svg>`;
}
function sample({t,i},s,open){
 const r=pipeTrial(t.fill),result=results[r.risk],marked=s.marked&&s.chosen===i,fresh=justFrozen&&i===s.trials.length-1;
 const art=tubeArt(`bench-clip-${i}`,r.fill,{ice:r.expanded,popped:r.risk==='높음',space:marked});
 const tube=open?`<button type="button" class="bench-mark" data-action="act-pipe-mark-${i}" aria-label="물 ${r.fill} 시험관의 얼음 위 빈자리 짚기" aria-pressed="${marked}">${art}</button>`:`<div class="bench-mark">${art}</div>`;
 return `<figure class="bench-sample ${fresh?'is-fresh':''} ${marked?'is-marked':''}" data-risk="${r.risk}">${tube}<figcaption><b>물 ${r.fill} → 얼음 ${r.expanded}</b><span>${marked?'여기가 빈자리야':result.label}</span></figcaption></figure>`;
}
function benchLine(s,done){
 if(done)return '찾았다! 물이 얼면 커지니까, 얼음이 자랄 빈자리를 남겨야 해.';
 const t=s.trials.at(-1);
 return t?results[pipeTrial(t.fill).risk].line:'시험관을 냉동고에 넣으면 어떻게 될까?';
}
export function benchMarkup(s,done){
 const fill=benchFill(s.fill),open=canMark(s.trials),shelf=shelfTrials(s.trials);
 return `<section class="activity activity-4 bench" id="freeze-bench" aria-label="시험관 얼리기 실험">
  <div class="bench-zone bench-prep">
   <div class="bench-tube" data-bench-tube>${tubeArt('bench-clip-live',fill)}
    <div class="bench-handle" data-bench-handle role="slider" tabindex="0" aria-label="시험관에 담을 물의 양" aria-valuemin="40" aria-valuemax="100" aria-valuenow="${fill}" aria-valuetext="물 ${fill}" style="top:${(levelY(fill)-VIEW_TOP)/VIEW_HEIGHT*100}%"><span aria-hidden="true">↕</span></div>
   </div>
   <p class="bench-readout">담은 물 <b data-bench-amount>${fill}</b></p>
  </div>
  <div class="bench-zone bench-freezer" data-bench-freezer><div class="bench-freezer-inside"><span class="bench-freezer-door" aria-hidden="true"></span></div><button type="button" class="activity-button bench-run" data-bench-run>냉동고에 넣기</button></div>
  <div class="bench-zone bench-shelf" aria-label="얼린 시험관 선반">${shelf.length?`<div class="bench-rack" style="--count:${shelf.length}">${shelf.map(x=>sample(x,s,open)).join('')}</div>`:'<p class="bench-empty">얼린 시험관이<br>여기 놓여</p>'}</div>
  <div class="bench-foot"><p class="activity-status" aria-live="polite">${benchLine(s,done)}</p>
   <details class="science-detail"><summary>알아두기</summary><p>물이 얼면 차지하는 공간이 커져. 눈금은 비교하려고 만든 값이고, 실제 수도관 안전 기준이 아니야.</p></details>
   <button class="activity-button activity-primary" data-action="act-complete-2" ${done?'':'disabled'}>이 조건으로 배관 복구하기</button></div>
 </section>`;
}
export function bindBench(host,get,freeze){
 justFrozen=false;
 const life=new AbortController(),{signal}=life;
 const tube=host.querySelector('[data-bench-tube]'),handle=host.querySelector('[data-bench-handle]'),freezer=host.querySelector('[data-bench-freezer]'),inside=freezer.querySelector('.bench-freezer-inside');
 let hold=null,carry=null,busy=false,timers=[];
 function showFill(value){
  const fill=benchFill(value),y=levelY(fill),water=tube.querySelector('[data-bench-water]');
  get().fill=fill;
  water.setAttribute('y',y);water.setAttribute('height',BOTTOM+6-y);
  handle.style.top=(y-VIEW_TOP)/VIEW_HEIGHT*100+'%';
  handle.setAttribute('aria-valuenow',fill);handle.setAttribute('aria-valuetext','물 '+fill);
  host.querySelector('[data-bench-amount]').textContent=fill;
 }
 const fromPointer=e=>{const r=tube.getBoundingClientRect(),top=r.top+(TOP-VIEW_TOP)/VIEW_HEIGHT*r.height,bottom=r.top+(BOTTOM-VIEW_TOP)/VIEW_HEIGHT*r.height;showFill(fillAtHeight((e.clientY-top)/(bottom-top)));};
 const over=e=>{const r=freezer.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
 function run(dx=0,dy=0){
  if(busy)return;busy=true;
  const finish=()=>{justFrozen=!motionOff();freeze();};
  if(motionOff()){finish();return;}
  const from=tube.getBoundingClientRect(),to=inside.getBoundingClientRect();
  void playCue('drop');
  tube.classList.add('is-flying');
  tube.style.transform=`translate(${dx+to.left+to.width/2-from.left-from.width/2}px,${dy+to.top+to.height/2-from.top-from.height/2}px) scale(.55)`;
  timers.push(setTimeout(()=>freezer.classList.add('is-closed'),FLY_MS),setTimeout(finish,FLY_MS+FREEZE_MS));
 }
 host.addEventListener('pointerdown',e=>{
  if(e.button!==0||busy||hold||carry)return;
  if(e.target.closest('[data-bench-handle]')){hold={id:e.pointerId};handle.classList.add('is-held');e.preventDefault();fromPointer(e);}
  else if(e.target.closest('[data-bench-tube]'))carry={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};
  else return;
  if(e.pointerType==='mouse')e.target.setPointerCapture?.(e.pointerId);
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(hold?.id===e.pointerId)fromPointer(e);
  if(carry?.id===e.pointerId){
   carry.dx=e.clientX-carry.x;carry.dy=e.clientY-carry.y;
   tube.classList.add('is-carried');tube.style.transform=`translate(${carry.dx}px,${carry.dy}px)`;
   freezer.classList.toggle('is-target',over(e));
  }
 },{signal});
 function release(e){
  if(hold?.id===e.pointerId){
   hold=null;handle.classList.remove('is-held');save();
   if(handle.classList.contains('guided-control')){handle.classList.remove('guided-control');tube.classList.add('guided-control');const title=document.getElementById('stage-direction');if(title)title.textContent='시험관을 냉동고에 넣어 봐';}
  }
  if(carry?.id===e.pointerId){
   const {dx,dy}=carry,drop=e.type==='pointerup'&&over(e);carry=null;
   tube.classList.remove('is-carried');freezer.classList.remove('is-target');
   if(drop)run(dx,dy);else tube.style.transform='';
  }
 }
 for(const type of ['pointerup','pointercancel'])host.addEventListener(type,release,{signal});
 handle.addEventListener('keydown',e=>{
  const step=({ArrowUp:5,ArrowRight:5,PageUp:20,ArrowDown:-5,ArrowLeft:-5,PageDown:-20})[e.key];
  const value=e.key==='Home'?40:e.key==='End'?100:step?get().fill+step:null;
  if(value===null)return;
  e.preventDefault();showFill(value);save();
 },{signal});
 host.querySelector('[data-bench-run]').addEventListener('click',()=>run(),{signal});
 return ()=>{life.abort();timers.forEach(clearTimeout);};
}
