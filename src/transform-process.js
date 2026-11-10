import {paintTimeDial} from './time-dial.js';
import {createObservationClock} from './observation-speed.js';
import {heatingRig,icon,esc} from './ui.js';
import {trayArt} from './freeze-tray.js';
import {phaseStatus,fieldAction,phaseProcesses} from './fieldwork-model.js';
import {heatingTrial,dewTrial} from './activity-model.js';
import {state,save} from './state.js';
import {playCue} from './sound.js';

const art={plate:'/assets/learning/cold-plate-dry.webp',wet:'/assets/learning/condensation-20261108/cold-plate-wet.webp',bench:'/assets/learning/condensation-20261108/room-bench.webp',pack:'/assets/learning/experiment-props-20261107/icepack.webp'};
const config={
 melt:{name:'녹이기',order:'두 번째 변신 · 얼음 → 물',steps:['실온에 놓기','기다려 관찰','전후 비교'],states:{
  start:[0,'얼음틀을 실온 준비대로 옮겨 봐','방금 얼린 같은 틀이야. 냉동고 밖에서 시간이 지나면 어떻게 될까?','place','실온 준비대에 놓기'],
  resting:[1,'얼음이 조금씩 녹는 모습을 지켜봐','시간을 보내며 남은 얼음과 녹은 물을 함께 살펴보자.','wait','시간 보내기'],
  melted:[2,'같은 틀의 처음과 나중을 비교해 봐','틀은 그대로인데, 안에 담긴 물질의 모습은 어떻게 달라졌어?','compare','녹기 전·후 비교했어'],
  compared:[3,'얼음이 녹아 같은 틀 안의 물이 됐어','실온에서도 시간이 지나면 얼음이 녹아. 이 변화를 녹기라고 해.']
 }},
 evaporate:{name:'끓이기',order:'세 번째 변신 · 물 → 수증기',steps:['같은 양 준비','B만 가열','같은 시간 관찰','끄고 비교'],states:{
  start:[0,'두 컵에 같은 양의 물을 준비해 봐','같은 컵 두 개로 비교할 거야. A는 그대로 두고 B만 가열하자.','fill','두 컵에 같은 양 담기'],
  ready:[1,'B컵 아래 가열판을 켜 봐','A는 실온에 둬. 한 가지 조건, 가열만 바꾸어 비교해 보자.','heat','B 가열판 켜기'],
  heating:[2,'두 컵의 물높이와 물속을 관찰해 봐','시간이 지나면 A의 표면과 B의 물속에서 무엇이 달라질까?','wait','같은 시간 보내기'],
  boiling:[3,'B 물속에서 기포가 계속 올라와!','아직 물이 남아 있어도 끓을 수 있어. 가열을 멈추고 관찰 기록을 남기자.','stop','가열 끄고 기록 남기기'],
  observed:[3,'같은 시간 뒤 관찰한 모습을 비교해 봐','아래는 가열을 멈추기 직전의 기록이야. 두 물높이와 B의 기포를 봐.','compare','증발과 끓음을 비교했어'],
  compared:[4,'증발과 끓음 모두 수증기로 바뀌는 변화야','A는 표면에서 증발했고, B는 물속에서도 기포가 생기며 끓었어.']
 }},
 condense:{name:'응결',order:'네 번째 변신 · 수증기 → 물방울',steps:['두 판 닦기','B만 차갑게','기다려 관찰','다시 닦아 확인'],states:{
  start:[0,'먼저 두 판 앞면의 물기를 닦아 봐','남아 있던 물과 새로 생긴 물을 구별할 수 있게 준비하자. 문질러도 돼.','dry','두 판 앞면 닦기'],
  dry:[1,'B판 뒷면에 냉각팩을 붙여 봐','두 판은 같은 공기와 닿아 있어. B만 차갑게 만들어 보자.','cool','B판 뒷면 차갑게 하기'],
  cooling:[2,'같은 시간 뒤 두 판 앞면을 살펴봐','공기 중 수증기는 눈에 보이지 않아. 차가운 판과 닿으면 어떻게 될까?','wait','같은 시간 기다리기'],
  wet:[3,'B판 앞면을 한 번 더 닦아 봐','냉각팩은 뒷면에 그대로 둬. 앞면을 다시 닦아도 물방울이 생길까?','wipe','B판 앞면 다시 닦기'],
  rewiped:[3,'다시 닦은 B판을 그대로 지켜봐','B는 계속 차갑고 앞면은 깨끗해. 한 번 더 시간을 보내 보자.','wait','다시 기다려 보기'],
  again:[3,'닦은 앞면에 물방울이 다시 생겼어!','냉각팩에서 샌 물이 아니라, 공기 중 수증기가 차가운 앞면에서 물방울이 됐어.','compare','다시 맺힌 물방울 확인했어'],
  compared:[4,'수증기가 물방울이 되는 변화가 응결이야','같은 공기와 닿은 두 판 중 차가운 B판 앞면에만 새 물방울이 맺혔어.']
 }}
};
export function processTask(c,kind){
 const {stage,time}=phaseStatus(kind,c),data=config[kind],row=data.states[stage]||data.states.start;
 return {stage,time,data,index:row[0],title:row[1],hint:row[2],action:row[3],label:row[4],waiting:row[3]==='wait'};
}
function meltBench(kind,time=0){return `<div class="melt-bench-scene"><img class="melt-bench-image" src="${art.bench}" alt="실온 실험 준비대"><div class="melt-bench-tray">${trayArt(kind,time)}</div></div>`;}
function meltScene(c){
 const {stage,time}=phaseStatus('melt',c),compare=['melted','compared'].includes(stage);
 if(stage==='start')return `<div class="process-pair melt-preparation"><figure><figcaption>방금 꺼낸 <b>얼음틀</b></figcaption><button type="button" class="process-source melt-source" data-process-source="tray" aria-label="얼음틀을 실온 준비대로 옮기기">${trayArt('ice')}</button><p>얼음이 들어 있는 같은 틀이야</p></figure><div class="melt-room-zone" data-process-target="room"><span class="process-location">${icon('home',28)}실온 준비대</span><img class="melt-landing" src="${art.bench}" alt="물기 없는 실온 실험 준비대"><p>이곳에 놓고 기다려 봐</p></div></div>`;
 if(compare)return `<div class="process-pair process-comparison"><figure><figcaption>처음 <b>얼음</b></figcaption>${meltBench('ice')}<p>고체인 얼음이 있었어</p></figure><figure><figcaption>실온에서 시간이 지난 뒤 <b>물</b></figcaption>${meltBench('water')}<p>같은 칸 안에서 액체 물로 녹았어</p></figure></div>`;
 return `<div class="melt-observation"><span class="process-location">${icon('home',24)}실온 준비대</span><div class="melt-live" data-melt-progress="${time}">${meltBench('ice',time)}</div><p>${time===0?'얼음을 그대로 두고 시간을 보내 보자':time<100?'얼음은 작아지고, 틀 안에 녹은 물이 생기고 있어':'얼음이 모두 녹아 물이 됐어'}</p></div>`;
}
function boilScene(c){
 const {stage,time}=phaseStatus('evaporate',c),filled=stage!=='start',active=['heating','boiling'].includes(stage),record=['observed','compared'].includes(stage),t=heatingTrial(100,time);
 return `<div class="boil-observation ${record?'is-record':''}">${record?'<span class="process-record-tag">가열을 멈추기 직전 · 같은 시간 뒤 관찰 기록</span>':'<span class="process-science-tag">수증기는 눈에 보이지 않아</span>'}<div class="process-pair boil-pair">${['A','B'].map((key,i)=>`<figure class="process-cup ${i&&active?'is-heating':''} ${i&&t.boiling?'is-boiling':''}"><figcaption>${key} <b>${i?record?'가열한 물':active?'가열하는 물':'가열할 물':'실온에 둔 물'}</b></figcaption><div class="boil-rig">${heatingRig(filled?(i?t.heated:t.room):0,!!(i&&t.boiling),!!i,!!(i&&active))}${i?`<span class="heater-state ${active?'is-on':''}">${active?'가열 중':'가열 꺼짐'}</span>`:''}${stage==='compared'?`<strong class="process-result-stamp ${i?'is-boiling':'is-evaporation'}">${i?'끓음':'증발'}</strong>`:''}</div><p>${!filled?'아직 빈 컵이야':!time?'같은 양의 물로 시작해':i?t.boiling?'물속에서도 기포가 계속 올라와':'아직 끓기 전이야':'표면에서 증발해 물높이가 조금 낮아져'}</p></figure>`).join('')}</div><p class="process-condition">같은 컵 · 같은 처음 물의 양 · 같은 관찰 시간</p></div>`;
}
let plateDrawing=0;
function plateArt(cold,count,label){
 const id='process-plate-'+(++plateDrawing);
 return `<svg class="process-plate-art" viewBox="0 0 540 400" role="img" aria-label="${esc(label)}"><defs><clipPath id="${id}"><path d="M170 32 395 46 352 320 119 294Z"/></clipPath></defs>${cold?`<image href="${art.pack}" x="338" y="52" width="120" height="150"/>`:''}<image href="${art.plate}" width="540" height="400"/><g class="process-droplets" clip-path="url(#${id})">${count?`<image href="${art.wet}" width="540" height="400" opacity="${Math.min(1,count/24)}"/>`:''}</g></svg>`;
}
function dewScene(c){
 const {stage,time}=phaseStatus('condense',c),cold=['cooling','wet','rewiped','again','compared'].includes(stage),wiping=['start','wet'].includes(stage),initial=stage==='start',count=initial?3:cold?dewTrial(time).drops:0;
 return `<div class="dew-observation"><span class="process-science-tag">같은 공기 · 공기 중 수증기는 눈에 보이지 않아</span><div class="process-pair dew-pair">${['A','B'].map((key,i)=>`<figure class="process-plate ${i&&cold?'is-cold':''}"><figcaption>${key} <b>${i&&cold?'뒷면을 차갑게':'실온 그대로'}</b></figcaption><div class="plate-workspace" ${i?'data-process-target="plate"':''}><button type="button" class="plate-surface" ${wiping&&(initial||i)?'data-process-wipe aria-label="'+(initial?'두 판 앞면의 남은 물기 닦기':'B판 앞면의 새 물방울 다시 닦기')+'"':'disabled aria-label="'+key+'판 앞면 관찰"'}>${plateArt(!!(i&&cold),i?count:initial?3:0,`${key}판 앞면 ${i&&count||initial?'물방울 있음':'마른 상태'}`)}</button>${i&&stage==='dry'?`<button type="button" class="process-source pack-source" data-process-source="pack" aria-label="냉각팩을 B판 뒷면에 붙이기"><img src="${art.pack}" alt=""><span>냉각팩</span></button>`:''}${i&&cold?'<span class="cold-pack-location">냉각팩은 뒷면에</span>':''}</div><p>${initial?'남아 있는 물기부터 닦자':i?stage==='rewiped'&&time===0?'다시 닦았어 · 새 물방울이 생길까?':count?'닦은 앞면에 새 물방울이 맺혔어':cold?'앞면을 관찰하며 기다려 봐':'같이 닦은 마른 판이야':cold?'같은 시간 뒤에도 마른 앞면':'같이 닦은 마른 판이야'}</p></figure>`).join('')}</div></div>`;
}
function scene(c,kind){return kind==='melt'?meltScene(c):kind==='evaporate'?boilScene(c):dewScene(c);}
export function processView(c,kind){
 const t=processTask(c,kind),notice=t.stage==='start'?t.hint:c.message;
 return `<section class="process-lab process-${kind}" data-process-kind="${kind}" data-process-stage="${t.stage}" aria-label="${t.data.name} 과정 실험"><div class="process-heading"><small>${t.data.order}</small><h2>${t.title}</h2><p>${t.hint}</p></div><ol class="process-steps" aria-label="${t.data.name} 순서">${t.data.steps.map((label,i)=>`<li class="${t.index>i?'is-done':''}" ${t.index===i?'aria-current="step"':''}><span>${t.index>i?icon('check',16):i+1}</span>${label}</li>`).join('')}</ol><div class="process-board">${scene(c,kind)}</div><div class="process-controls"><p class="process-status" role="status">${esc(notice)}</p>${t.waiting?`<div class="process-time"><label for="process-time">${kind==='condense'&&t.stage==='rewiped'?'다시 기다리기':'시간 보내기'} <output data-process-time-label>${t.time?'시간이 지난 정도 '+t.time+'%':'처음'}</output></label><input id="process-time" type="range" min="0" max="100" step="5" value="${t.time}" aria-valuetext="관찰 시간이 ${t.time}%만큼 지났어"><progress data-process-progress max="100" value="${t.time}" aria-label="기다린 정도"></progress></div>`:''}${t.action?`<button type="button" class="btn primary process-primary" data-process-action="${t.action}">${t.label}${icon('arrow',20)}</button>`:`<button type="button" class="btn primary process-primary" data-transform-next>${kind==='condense'?'네 가지 변신 마치기':'다음 변신 해 보기'}${icon('arrow',20)}</button>`}</div></section>`;
}

export function bindProcess(host,get,currentKind,paint){
 const life=new AbortController(),{signal}=life;
 let busy=false,timer=0,frame=0,drag=null,suppressClickUntil=0;
 const kind=()=>phaseProcesses[currentKind()]?currentKind():null;
 const still=()=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const commit=(step,time)=>{state.fieldwork.chapters[2]=fieldAction(2,get(),'phase-process',{kind:kind(),step,time});save();};
 function lock(value){busy=value;host.querySelector('.process-lab')?.setAttribute('aria-busy',String(value));host.querySelectorAll('[data-process-action],#process-time').forEach(e=>e.disabled=value);}
 function showTime(){
  const t=processTask(get(),kind()),input=host.querySelector('#process-time'),output=host.querySelector('[data-process-time-label]'),progress=host.querySelector('[data-process-progress]');
  if(input){input.value=t.time;paintTimeDial(input);input.setAttribute('aria-valuetext',`관찰 시간이 ${t.time}%만큼 지났어`);}if(output)output.textContent=t.time===100?'충분히 지난 뒤':`시간이 지난 정도 ${t.time}%`;if(progress)progress.value=t.time;
  host.querySelector('.process-board').innerHTML=scene(get(),kind());
  const status=host.querySelector('.process-status');if(status.textContent!==get().message)status.textContent=get().message;
 }
 function clock(){
  if(still()){commit('wait',100);void playCue('drop');paint();return;}
  lock(true);const from=processTask(get(),kind()).time,clock=createObservationClock(state.settings),duration=kind()==='melt'?1200:2400;
  const tick=now=>{
   if(signal.aborted||!kind())return;
   const p=Math.min(1,clock(now)/duration),value=Math.round((from+(100-from)*p)/5)*5;
   if(value!==processTask(get(),kind()).time){commit('wait',value);showTime();}
   if(p<1)frame=requestAnimationFrame(tick);else{lock(false);void playCue('drop');paint();}
  };frame=requestAnimationFrame(tick);
 }
 function act(step){
  if(!kind()||busy||processTask(get(),kind()).action!==step)return;
  if(step==='wait'){clock();return;}
  const finish=()=>{if(signal.aborted)return;commit(step);lock(false);void playCue(step==='compare'?'success':'drop');paint();};
  if(still()||step==='compare'){finish();return;}
  lock(true);const board=host.querySelector('.process-board');board.classList.add('is-acting');
  if(kind()==='melt'&&step==='place'){
   const source=board.querySelector('[data-process-source]'),target=board.querySelector('[data-process-target]'),a=source.getBoundingClientRect(),b=target.getBoundingClientRect();
   source.animate([{transform:'none'},{transform:`translate(${b.x+b.width/2-a.x-a.width/2}px,${b.y+b.height/2-a.y-a.height/2}px) scale(.8)`}],{duration:520,fill:'forwards',easing:'ease-in-out'});
  }
  const status=host.querySelector('.process-status');status.textContent=({place:'같은 얼음틀을 실온 준비대로 옮기는 중이야…',fill:'두 컵에 같은 양의 물을 준비하는 중이야…',heat:'B 가열판을 켜는 중이야…',stop:'가열을 끄고 관찰한 모습을 기록하는 중이야…',dry:'두 판 앞면의 남아 있던 물기를 닦는 중이야…',cool:'냉각팩을 B판 뒷면에 붙이는 중이야…',wipe:'냉각팩은 그대로 두고 B판 앞면만 다시 닦는 중이야…'})[step];
  timer=setTimeout(finish,650);
 }
 host.addEventListener('click',e=>{
  if(performance.now()<suppressClickUntil||!kind())return;
  const button=e.target.closest('[data-process-action],[data-process-source],[data-process-wipe]');if(!button||button.disabled)return;
  const step=button.dataset.processAction||(button.hasAttribute('data-process-wipe')?processTask(get(),kind()).action:button.dataset.processSource==='tray'?'place':'cool');act(step);
 },{signal});
 host.addEventListener('input',e=>{
  if(e.target.id!=='process-time'||busy||!kind()||!processTask(get(),kind()).waiting)return;
  const value=Math.max(phaseStatus(kind(),get()).time,+e.target.value);commit('wait',value);showTime();if(value===100)paint();
 },{signal});
 const target=()=>host.querySelector(`[data-process-target="${drag?.source==='tray'?'room':'plate'}"]`);
 const inside=(e,element)=>{const r=element?.getBoundingClientRect();return r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;};
 host.addEventListener('pointerdown',e=>{
  const button=e.target.closest('[data-process-source],[data-process-wipe]');if(!button||button.disabled||e.button!==0||drag||busy||!kind())return;
  drag={button,mode:button.hasAttribute('data-process-wipe')?'wipe':'carry',source:button.dataset.processSource,id:e.pointerId,x:e.clientX,y:e.clientY,distance:0,ghost:null};
  if(e.pointerType==='mouse')button.setPointerCapture(e.pointerId);
 },{signal});
 host.addEventListener('pointermove',e=>{
  if(drag?.id!==e.pointerId)return;
  const d=drag,delta=Math.hypot(e.clientX-d.x,e.clientY-d.y);d.distance+=delta;d.x=e.clientX;d.y=e.clientY;
  if(!d.ghost){if(d.distance<10)return;d.ghost=document.createElement('div');d.ghost.className='process-ghost'+(d.mode==='wipe'?' is-cloth':'');d.ghost.setAttribute('aria-hidden','true');d.ghost.innerHTML=d.mode==='wipe'?'<span class="process-cloth"></span>':d.source==='tray'?trayArt('ice'):`<img src="${art.pack}" alt="">`;document.body.append(d.ghost);}
  d.ghost.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
  if(d.mode==='wipe'){
   if(d.distance>=80&&inside(e,d.button)){d.ghost.remove();drag=null;suppressClickUntil=performance.now()+350;act(processTask(get(),kind()).action);}
  }else target()?.classList.toggle('is-drop-target',!!inside(e,target()));
 },{signal});
 function release(e){
  if(drag?.id!==e.pointerId)return;const d=drag,hit=inside(e,target());target()?.classList.remove('is-drop-target');drag=null;d.ghost?.remove();
  if(!d.ghost)return;suppressClickUntil=performance.now()+350;
  if(d.mode==='carry'&&e.type==='pointerup'&&hit)act(d.source==='tray'?'place':'cool');
 }
 for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,release,{signal});
 const pause=()=>{clearTimeout(timer);cancelAnimationFrame(frame);drag?.ghost?.remove();drag=null;if(kind()){lock(false);paint();}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();},{signal});
 host.addEventListener('transform-pause',pause,{signal});
 document.addEventListener('observation-stop',()=>{
  if(!busy)return;clearTimeout(timer);cancelAnimationFrame(frame);lock(false);
  host.querySelectorAll('[data-process-source]').forEach(e=>e.getAnimations().forEach(a=>a.cancel()));
 },{signal});
 return ()=>{life.abort();clearTimeout(timer);cancelAnimationFrame(frame);drag?.ghost?.remove();};
}
