import {materialPattern} from './study-materials.js';
import {observationDelay} from './observation-speed.js';
import {pipeTrial,pipeStep,limit} from './activity-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';
import {experimentMove,markStageControls} from './stage-guide.js';

const TOP=36,BOTTOM=236,VIEW_TOP=-14,VIEW_HEIGHT=264,SHELF=3,FLY_MS=650,DOOR_MS=250,FREEZE_MS=900,EXIT_MS=650;
const results={높음:{label:'마개가 튀어 나갔어',line:'퐁! 얼음이 커지면서 마개를 밀어냈어. 이번엔 물을 덜 담아 보자.'},보통:{label:'남은 공간이 빠듯해',line:'얼음이 입구에 거의 닿았어. 물을 더 덜 담아, 위쪽에 물을 채우지 않은 공간을 넉넉히 남겨 보자.'},낮음:{label:'남은 공간이 넉넉해',line:'물을 덜 담았더니 얼음 위에도 공간이 남았어! 앞 시험관과 비교해 봐.'}};
const motionOff=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
const levelY=amount=>BOTTOM-(BOTTOM-TOP)*amount/100;
let justFrozen=false;

export const benchFill=value=>Math.round(limit(value,40,100)/5)*5;
export const fillAtHeight=ratio=>benchFill(100-ratio*100);
export const canMark=trials=>trials.some(t=>t.safe)&&trials.some(t=>!t.safe);
/** Keep the latest specimen and the contrasting full/less-filled specimens together. */
export function shelfTrials(trials){
 const seen=new Set(),list=[];
 for(let i=trials.length-1;i>=0;i--){if(seen.has(trials[i].fill))continue;seen.add(trials[i].fill);list.unshift({t:trials[i],i});}
 const chosen=list.slice(-SHELF);
 for(const safe of [false,true]){
  if(chosen.some(x=>x.t.safe===safe))continue;
  const contrast=list.findLast(x=>x.t.safe===safe);
  if(contrast)chosen.splice(0,1,contrast);
 }
 return chosen.sort((a,b)=>a.i-b.i);
}
const tubeWall='M26 30V212a24 24 0 0 0 48 0V30';
const ticks=[20,40,60,80,100].map(v=>`<path class="bench-tick" d="M27 ${levelY(v)}h${v%40===0?10:6}"/>`).join('');
function tubeArt(id,fill,{ice=null,popped=false,space=false,target=null}={}){
 const top=ice===null?levelY(fill):levelY(ice),from=ice===null?1:fill/ice;
 return `<svg class="bench-art" viewBox="0 ${VIEW_TOP} 110 ${VIEW_HEIGHT}" aria-hidden="true"><defs>
 <clipPath id="${id}"><path d="M27 22V212a23 23 0 0 0 46 0V22Z"/></clipPath>
 <linearGradient id="${id}-glass"><stop stop-color="#83b5c5" stop-opacity=".55"/><stop offset=".2" stop-color="#fff" stop-opacity=".9"/><stop offset=".48" stop-color="#e9f9fb" stop-opacity=".15"/><stop offset=".8" stop-color="#b4d8e1" stop-opacity=".4"/><stop offset="1" stop-color="#59899b" stop-opacity=".65"/></linearGradient>
 <linearGradient id="${id}-water"><stop stop-color="#147fa9"/><stop offset=".24" stop-color="#6bdded"/><stop offset=".65" stop-color="#3ab5d5"/><stop offset="1" stop-color="#1781ad"/></linearGradient>
 <linearGradient id="${id}-ice" x2=".65" y2="1"><stop stop-color="#effeff"/><stop offset=".4" stop-color="#b6e5f4"/><stop offset=".7" stop-color="#7fc5e0"/><stop offset="1" stop-color="#dbf7fd"/></linearGradient>
 <linearGradient id="${id}-cork" x2=".4" y2="1"><stop stop-color="#e0b67c"/><stop offset=".5" stop-color="#b68149"/><stop offset="1" stop-color="#81532e"/></linearGradient>
 ${materialPattern(id+'-material',ice===null?'water':'ice',{x:24,y:12,width:52,height:228,base:ice===null?'#a1e0ed':'#c2e6f4'})}
 </defs><ellipse cx="50" cy="242" rx="29" ry="4" fill="#385e65" opacity=".15"/>
 <path fill="url(#${id}-glass)" stroke="#6f9cab" stroke-width="1.4" d="${tubeWall}Z"/>
 <g clip-path="url(#${id})"><rect class="${ice===null?'bench-water':'bench-ice'}" data-bench-water x="24" y="${top}" width="52" height="${BOTTOM+4-top}" fill="url(#${id}-material)" style="--from:${from}"/>
 ${ice===null?`<ellipse data-bench-surface cx="50" cy="${top}" rx="23" ry="3.2" fill="#9be5f3" stroke="#e4fcff" stroke-width="1.2"/>`:''}
 </g>
 ${space?`<rect class="bench-space" x="31" y="${TOP+2}" width="38" height="${Math.max(6,top-TOP-5)}" rx="5"/>`:''}
 ${target===null?'':`<path class="bench-fill-line" d="M16 ${levelY(target)}h68"/>`}
 ${ice===null?'':`<path class="bench-start" d="M18 ${levelY(fill)}h64"/>`}
 <image href="/assets/learning/experiment-props-20261107/tube-body.webp" x="25" y="26" width="50" height="211" preserveAspectRatio="none" opacity=".78"/>${ticks}<path class="bench-wall" d="${tubeWall}"/>
 <path d="M31 43v164q0 19 14 22" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
 <path d="M69 47v164q0 12-6 17" fill="none" stroke="#46758c" stroke-width="1.5" opacity=".4"/>
 <ellipse cx="50" cy="30" rx="25" ry="4" fill="none" stroke="#8fb5c2" stroke-width="2"/>
 <g class="bench-cork ${popped?'is-popped':''}" ${popped?'transform="translate(43 -14) rotate(18 50 20)"':''}><image href="/assets/learning/experiment-props-20261107/tube-cork.webp" x="30" y="6" width="40" height="32" preserveAspectRatio="none"/></g>
 </svg>`;
}
function freezerArt(){return '<img class="bench-cabinet bench-cabinet-open" src="/assets/learning/experiment-props-20261107/freezer.webp" alt="문이 열린 실험용 냉동고" draggable="false"><img class="bench-cabinet bench-cabinet-closed" src="/assets/learning/freeze-props-20261108/bench-freezer-closed.webp" alt="" aria-hidden="true" draggable="false">';}
function sample({t,i},s,open){
 const r=pipeTrial(t.fill),result=results[r.risk],marked=s.marked&&s.chosen===i,fresh=justFrozen&&i===s.trials.length-1;
 const art=tubeArt(`bench-clip-${i}`,r.fill,{ice:r.expanded,popped:r.risk==='높음',space:marked});
 const tube=open?`<button type="button" class="bench-mark" data-action="act-pipe-mark-${i}" aria-label="물 ${r.fill} 시험관의 얼음 위에 남은 공간 확인하기" aria-pressed="${marked}">${art}<span class="bench-space-prompt">${r.safe?'남은 공간 찾기':'앞 결과'}</span></button>`:`<div class="bench-mark">${art}</div>`;
 return `<figure class="bench-sample ${fresh?'is-fresh':''} ${marked?'is-marked':''}" data-risk="${r.risk}">${tube}<figcaption><b>물 ${r.fill} → 얼음 ${r.expanded}</b><span>${marked?'선택했어 · 얼음 위 공간 '+r.space+'눈금':result.label}</span></figcaption></figure>`;
}
function benchLine(s,done){
 if(done)return `물 ${s.trials[s.chosen].fill}만큼 담으니 얼어도 위쪽에 공간이 남았어. 이 기록으로 마을의 물통도 지켜 보자!`;
 const t=s.trials.at(-1);
 return t?results[pipeTrial(t.fill).risk].line:'같은 시험관에서 물의 양만 바꿔 볼 거야. 물을 채우지 않은 공간은 얼린 뒤에 어떻게 달라질까?';
}
export function benchMarkup(s,done){
 const fill=benchFill(s.fill),open=canMark(s.trials),shelf=shelfTrials(s.trials),target=open?null:s.trials.length&&!s.trials.some(t=>t.safe)?80:95;
 return `<section class="activity activity-4 bench" id="freeze-bench" data-step="${pipeStep(s)}" aria-label="시험관 얼리기 실험">
 <div class="bench-zone bench-prep"><h2 class="bench-zone-title"><span>1</span>물의 양 정하기 ${target===null?'':`<b class="bench-fill-goal">비교 기준 ${target}</b>`}</h2>
 <div class="bench-tube-space"><div class="bench-tube" data-bench-tube>${tubeArt('bench-clip-live',fill,{target})}
 <div class="bench-handle" data-bench-handle role="slider" tabindex="0" aria-label="시험관에 담을 물의 양" aria-valuemin="40" aria-valuemax="100" aria-valuenow="${fill}" aria-valuetext="물 ${fill}" style="top:${(levelY(fill)-VIEW_TOP)/VIEW_HEIGHT*100}%"><span aria-hidden="true">↕</span></div></div></div>
 <div class="bench-fill-controls"><button type="button" data-bench-less aria-label="물을 5만큼 덜 담기">−<small>덜 담기</small></button><p class="bench-readout">담은 물<b data-bench-amount>${fill}</b><small>/ 100 눈금</small></p><button type="button" data-bench-more aria-label="물을 5만큼 더 담기">＋<small>더 담기</small></button></div>
 <p class="bench-tip">노란 손잡이를 위아래로 움직여도 돼</p></div>
 <div class="bench-zone bench-freezer" data-bench-freezer><h2 class="bench-zone-title"><span>2</span>같은 조건으로 얼리기</h2>
 <div class="bench-freezer-inside"><div class="bench-freezer-frame">${freezerArt()}<div class="bench-freezer-display" data-bench-temperature>준비</div><div class="bench-chamber-tube">${tubeArt('bench-clip-chamber',fill)}</div><span class="bench-freeze-progress" aria-hidden="true"></span></div></div>
 <button type="button" class="activity-button bench-run" data-bench-run>${fill}만큼 담아 얼리기</button><p class="bench-tip" data-bench-freezer-note>시험관을 끌어 넣어도 돼</p></div>
 <div class="bench-zone bench-shelf" aria-label="얼린 시험관 선반"><h2 class="bench-zone-title"><span>3</span>얼리기 전·후 비교</h2>
 ${shelf.length?`<div class="bench-rack" style="--count:${shelf.length}">${shelf.map(x=>sample(x,s,open)).join('')}</div>`:'<div class="bench-empty"><span aria-hidden="true"></span><b>얼린 시험관을 놓는 곳</b><p>가득 담은 물과 덜 담은 물을<br>나란히 비교해 보자</p></div>'}
 <p class="bench-tip bench-legend"><i aria-hidden="true"></i>점선은 얼리기 전 물높이야</p></div>
 <div class="bench-foot"><div class="bench-feedback"><p class="activity-status" aria-live="polite">${benchLine(s,done)}</p><small class="bench-gate">${done?'다음 · 한파가 온다: 실험에서 찾은 물의 양으로 마을의 물통을 채워 보자.':open?'얼음 위에 남은 공간을 비교하고, 넉넉한 쪽을 눌러 봐.':'두 조건을 얼린 뒤, 얼음 위에 공간이 5눈금 이상 남은 시험관을 찾아 봐.'}</small></div>
 <details class="science-detail"><summary>모형 안내</summary><p>물을 덜 담으면 위쪽에 물을 채우지 않은 공간이 생겨. 물이 얼면 부피가 커져 이 공간이 줄어들어. 눈금은 비교를 위한 가상 값이고, 얼음 위에 5눈금 이상 남으면 넉넉한 것으로 보는 모형이야. 실제 용기를 얼리는 실험은 선생님과 함께 해.</p></details>
 <button class="activity-button activity-primary" data-action="act-complete-2" ${done?'':'disabled'}>${done?'이 물의 양으로 마을 물통 지키기 →':'남은 공간을 확인하면 마을로 →'}</button></div>
 </section>`;
}
export function bindBench(host,get,freeze){
 justFrozen=false;
 const life=new AbortController(),{signal}=life;
 const tube=host.querySelector('[data-bench-tube]'),handle=host.querySelector('[data-bench-handle]'),freezer=host.querySelector('[data-bench-freezer]'),inside=freezer.querySelector('.bench-freezer-inside'),runButton=host.querySelector('[data-bench-run]');
 let hold=null,carry=null,busy=false,timers=[],flights=[],originalShelf=null,buttonStates=[];
 function guide(){
  const root=host.closest('.experiment-main');if(!root)return;
  const task=experimentMove(4,state),title=root.querySelector('#stage-direction'),how=root.querySelector('#stage-how');
  if(title)title.textContent=task.title;if(how)how.textContent=task.instruction;
  root.querySelectorAll('.guided-control').forEach(el=>el.classList.remove('guided-control'));root.querySelectorAll('.tap-cue').forEach(el=>el.remove());
  markStageControls(root,task);
 }
 function showFill(value){
  const fill=benchFill(value),y=levelY(fill),water=tube.querySelector('[data-bench-water]');
  get().fill=fill;host.dataset.step=pipeStep(get());
  water.setAttribute('y',y);water.setAttribute('height',BOTTOM+4-y);tube.querySelector('[data-bench-surface]').setAttribute('cy',y);
  handle.style.top=(y-VIEW_TOP)/VIEW_HEIGHT*100+'%';handle.setAttribute('aria-valuenow',fill);handle.setAttribute('aria-valuetext','물 '+fill);
  host.querySelector('[data-bench-amount]').textContent=fill;runButton.textContent=fill+'만큼 담아 얼리기';
  host.querySelector('[data-bench-less]').disabled=fill<=40;host.querySelector('[data-bench-more]').disabled=fill>=100;
  guide();
 }
 const fromPointer=e=>{const r=tube.getBoundingClientRect(),top=r.top+(TOP-VIEW_TOP)/VIEW_HEIGHT*r.height,bottom=r.top+(BOTTOM-VIEW_TOP)/VIEW_HEIGHT*r.height;showFill(fillAtHeight((e.clientY-top)/(bottom-top)));};
 const over=e=>{const r=freezer.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
 function fly(art,from,to){
  const image=art.cloneNode(true);image.classList.add('bench-flight');
  Object.assign(image.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});
  document.body.append(image);flights.push(image);
  image.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`}],{duration:FLY_MS,easing:'cubic-bezier(.25,.65,.3,1)',fill:'forwards'});
  return image;
 }
 function run(){
  if(busy)return;busy=true;host.setAttribute('aria-busy','true');
  buttonStates=[...host.querySelectorAll('button')].map(b=>[b,b.disabled]);
  host.querySelectorAll('button').forEach(b=>b.disabled=true);handle.setAttribute('aria-disabled','true');handle.tabIndex=-1;
  const amount=get().fill,finish=()=>{justFrozen=!motionOff();freeze();};
  host.querySelector('.activity-status').textContent=`물 ${amount}만큼 담은 시험관을 얼리고 있어. 물높이가 어떻게 바뀌는지 봐.`;
  host.querySelector('[data-bench-freezer-note]').textContent='같은 냉동고에서 얼리는 중이야';runButton.textContent='얼음이 만들어지고 있어…';
  if(motionOff()){finish();return;}
  const chamber=inside.querySelector('.bench-chamber-tube'),art=tube.querySelector('.bench-art');
  chamber.innerHTML=tubeArt('bench-clip-chamber',amount);
  const incoming=fly(art,art.getBoundingClientRect(),chamber.getBoundingClientRect());
  tube.style.visibility='hidden';void playCue('drop');
  timers.push(setTimeout(()=>{incoming.remove();chamber.style.visibility='visible';},FLY_MS));
  timers.push(setTimeout(()=>{
   freezer.classList.add('is-closed');inside.querySelector('[data-bench-temperature]').textContent='냉각 중';
   host.querySelector('.bench-cabinet-open').alt='문이 닫힌 실험용 냉동고';
  },FLY_MS+DOOR_MS));
  const freezing=observationDelay(FREEZE_MS,state.settings);freezer.style.setProperty('--bench-freeze-duration',freezing+'ms');
  const opened=FLY_MS+DOOR_MS+freezing;
  timers.push(setTimeout(()=>{
   const trial=pipeTrial(amount);
   chamber.innerHTML=tubeArt('bench-clip-chamber',amount,{ice:trial.expanded,popped:trial.risk==='높음'});
   freezer.classList.remove('is-closed');inside.querySelector('[data-bench-temperature]').textContent='얼리기 완료';
   host.querySelector('.bench-cabinet-open').alt='문이 열린 실험용 냉동고';
   host.querySelector('[data-bench-freezer-note]').textContent='문을 열고 얼린 시험관을 꺼낼게';
  },opened));
  timers.push(setTimeout(()=>{
   const trials=[...get().trials,pipeTrial(amount)],shelf=shelfTrials(trials),rack=document.createElement('div');
   rack.className='bench-rack';rack.style.setProperty('--count',shelf.length);
   rack.innerHTML=shelf.map(x=>sample(x,{...get(),trials},false)).join('');
   originalShelf=host.querySelector('.bench-rack,.bench-empty');originalShelf.replaceWith(rack);
   const seat=rack.querySelector('.bench-sample:last-child .bench-mark');seat.style.visibility='hidden';
   const outgoing=fly(chamber.querySelector('.bench-art'),chamber.getBoundingClientRect(),seat.getBoundingClientRect());
   chamber.style.visibility='hidden';
   host.querySelector('.activity-status').textContent='같은 시험관을 선반으로 옮겨 얼리기 전·후를 비교해 보자.';
   timers.push(setTimeout(()=>{outgoing.remove();finish();},EXIT_MS));
  },opened+DOOR_MS));
 }
 host.addEventListener('pointerdown',e=>{
  if(e.button!==0||busy||hold||carry)return;
  if(e.target.closest('[data-bench-handle]')){hold={id:e.pointerId};handle.classList.add('is-held');e.preventDefault();}
  else if(e.target.closest('[data-bench-tube]')){carry={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};e.preventDefault();}
  else return;
  host.setPointerCapture?.(e.pointerId);
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(hold?.id===e.pointerId)fromPointer(e);
  if(carry?.id===e.pointerId){carry.dx=e.clientX-carry.x;carry.dy=e.clientY-carry.y;tube.classList.add('is-carried');tube.style.transform=`translate(${carry.dx}px,${carry.dy}px)`;freezer.classList.toggle('is-target',over(e));}
 },{signal});
 function release(e){
  if(hold?.id===e.pointerId){hold=null;handle.classList.remove('is-held');save();}
  if(carry?.id===e.pointerId){const {dx,dy}=carry,drop=e.type==='pointerup'&&over(e)&&Math.hypot(dx,dy)>12;carry=null;tube.classList.remove('is-carried');freezer.classList.remove('is-target');if(drop)run(dx,dy);else tube.style.transform='';}
 }
 for(const type of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(type,release,{signal});
 handle.addEventListener('keydown',e=>{
  if(busy)return;
  const step=({ArrowUp:5,ArrowRight:5,PageUp:20,ArrowDown:-5,ArrowLeft:-5,PageDown:-20})[e.key],value=e.key==='Home'?40:e.key==='End'?100:step?get().fill+step:null;
  if(value===null)return;e.preventDefault();showFill(value);save();
 },{signal});
 for(const [selector,delta] of [['[data-bench-less]',-5],['[data-bench-more]',5]])host.querySelector(selector).addEventListener('click',()=>{if(!busy){showFill(get().fill+delta);save();}},{signal});
 runButton.addEventListener('click',()=>run(),{signal});
 document.addEventListener('observation-stop',()=>{
  if(!busy)return;
  timers.forEach(clearTimeout);flights.forEach(image=>image.remove());timers=[];flights=[];busy=false;
  host.removeAttribute('aria-busy');freezer.classList.remove('is-closed');
  if(originalShelf)host.querySelector('.bench-rack')?.replaceWith(originalShelf);originalShelf=null;
  inside.querySelector('.bench-chamber-tube').style.visibility='hidden';
  inside.querySelector('[data-bench-temperature]').textContent='준비';
  host.querySelector('.bench-cabinet-open').alt='문이 열린 실험용 냉동고';
  tube.style.visibility='';tube.style.transform='';handle.removeAttribute('aria-disabled');handle.tabIndex=0;
  for(const [b,disabled] of buttonStates)b.disabled=disabled;
  host.querySelector('[data-bench-freezer-note]').textContent='시험관을 끌어 넣어도 돼';
  host.querySelector('.activity-status').textContent=benchLine(get(),pipeStep(get())==='done');showFill(get().fill);
 },{signal});
 host.querySelector('[data-bench-less]').disabled=get().fill<=40;host.querySelector('[data-bench-more]').disabled=get().fill>=100;
 return ()=>{life.abort();timers.forEach(clearTimeout);flights.forEach(image=>image.remove());};
}
