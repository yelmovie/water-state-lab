import {createObservationClock} from './observation-speed.js';
import {btn,beaker,esc} from './ui.js';
import {playCue} from './sound.js';

export const cycleStatus=c=>({stage:c.moves.cycleStage||(c.done&&['evaporate','condense'].every(k=>c.marks.includes(k))?'compared':'start'),time:Number(c.moves.cycleTime)||0});
const tasks={
 start:['온실 모형에 물과 마른 판을 준비하자','prepare','물·마른 판 준비하기'],
 evaporating:['가열하지 않은 물도 증발할까?','wait','시간 보내며 물높이 보기'],
 evaporated:['처음 선과 지금 물높이를 비교하자','observe','줄어든 물 관찰하기'],
 observed:['물방울을 받을 통부터 놓자','receiver','기울어진 판 아래 받이 놓기'],
 receiving:['판 뒷면을 충분히 차갑게 하자','cool','판 뒷면 냉각 시작'],
 condensing:['물기 없는 판 앞면에 무슨 일이 생길까?','wait','물방울 맺힐 때까지 기다리기'],
 droplets:['판 앞면의 물방울을 아래로 모아 보자','collect','물방울을 받이로 흘려 모으기'],
 collected:['처음 물·남은 물·모인 물을 함께 보자','compare','변화의 과정 비교하기']
};
export const cycleTask=c=>tasks[cycleStatus(c).stage]?.[0]||'물의 상태 변화를 관찰해서 온실에 물을 모았어.';
/** Water is transferred, never produced: 100 = 95 in source + 3 collected + 2 remaining in air. Unit-free model. */
export function cycleAction(c,{step,time}){
 const {stage}=cycleStatus(c),set=(next,message)=>{c.moves.cycleStage=next;c.message=message;};
 if(step==='prepare'&&stage==='start'){c.moves.cycleSource='process';c.moves.cycleTime='0';set('evaporating','물 100과 물기 없는 판을 준비했어. 닫힌 온실 모형 안에서 물높이를 지켜보자. 가열하지 않아도 증발해.');}
 if(step==='wait'&&['evaporating','condensing'].includes(stage)&&Number.isFinite(time)&&time>=0&&time<=100&&time>=Number(c.moves.cycleTime||0)){
  c.moves.cycleTime=String(time);
  if(time===100)set(stage==='evaporating'?'evaporated':'droplets',stage==='evaporating'?'처음 100이던 물이 95만큼 남았어. 줄어든 물은 보이지 않는 수증기로 공기 중에 있어. 판은 아직 실온이라 마른 채야.':'차가운 판 앞면에 새 물방울이 맺혔어. 판 뒤 냉각장치의 물이 새어 나온 게 아니야.');
 }
 if(step==='observe'&&stage==='evaporated'){c.marks=[...new Set([...c.marks,'evaporate'])];set('observed','물은 모두 없어진 게 아니야. 대부분은 그릇에 남고, 일부가 증발했어. 수증기는 눈에 보이지 않아.');}
 if(step==='receiver'&&stage==='observed')set('receiving','받이를 판 끝보다 낮게 놓았어. 판을 따라 흘러내리는 물방울을 받을 수 있어.');
 if(step==='cool'&&stage==='receiving'){c.moves.cycleTime='0';set('condensing','수증기가 충분한 공기에서 판 뒷면만 차갑게 했어. 판 앞면이 충분히 차가워질 때까지 기다리자.');}
 if(step==='collect'&&stage==='droplets')set('collected','판 앞면의 물방울 3만큼이 기울기를 따라 아래 받이에 모였어. 물이 새로 만들어진 것은 아니야.');
 if(step==='compare'&&stage==='collected'){c.marks=[...new Set([...c.marks,'condense'])];set('compared','물 → 보이지 않는 수증기 → 차가운 판의 물방울 → 받이의 물! 처음 물 중 일부를 다시 모았어. 모든 물을 모은 건 아니야.');}
}
function cycleDrops(time){
 const wet=Math.max(0,Math.min(1,time/100));
 return wet?`<image href="/assets/learning/condensation-20261108/collector-cold-wet.webp" width="1536" height="1024" opacity="${wet}"/>`:'';
}

export function cyclePlate(cold,receiver,collected,time=0){
 const cup=beaker(collected?28:0).replace(/^<svg[^>]*>/,'<g transform="translate(1300 825) scale(.8)">').replace(/<\/svg>$/,'</g>');
 return `<svg class="cycle-plate-art" viewBox="0 0 1600 1120" role="img" aria-label="${cold?'뒷면을 냉각한':'실온의 마른'} 원형 응결판${receiver?'과 물받이':''}${time?' 앞면에 새 물방울':''}"><image href="${cold?'/assets/learning/condensation-20261108/collector-cold-dry.webp':'/assets/learning/ending-collector-20261108/collector-plate-dry.webp'}" width="1536" height="1024"/><g data-cycle-droplets>${cold?cycleDrops(time):''}</g>${receiver?cup:''}${collected?'<path class="cycle-collected-stream" d="M1350 746Q1390 800 1402 1008" fill="none" stroke="#6ac7e0" stroke-width="9" stroke-linecap="round"/>':''}</svg>`;
}
function cycleMarkup(c){
 const {stage,time}=cycleStatus(c),task=tasks[stage],ready=stage!=='start',evap=['evaporated','observed','receiving','condensing','droplets','collected','compared'].includes(stage),cold=['condensing','droplets','collected','compared'].includes(stage),drops=stage==='droplets',collected=['collected','compared'].includes(stage),receiver=['receiving','condensing','droplets','collected','compared'].includes(stage),waiting=['evaporating','condensing'].includes(stage);
 const source=stage==='evaporating'?100-time*.05:evap?95:100;
 const steps=['준비','증발 관찰','냉각·응결','모으고 비교'],at=!ready?0:!cold&&!receiver?1:!collected?2:3;
 const plate=cyclePlate(cold,receiver,collected,stage==='condensing'?time:drops?100:0);
 return `<div class="transform-top"><ol class="transform-progress" aria-label="온실 순환 과정">${steps.map((label,i)=>`<li class="${i<at?'is-done':''}" ${i===at?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('')}</ol><button class="field-help-btn" data-action="field-help">느티의 부탁 다시 보기</button></div><div class="cycle-heading"><h2>${esc(cycleTask(c))}</h2><p>같은 온실 모형 안에서 물이 어디로 가는지 따라가 봐.</p></div><div class="cycle-scene"><article><h3>① 처음 물이 있던 곳</h3>${ready?beaker(source*.6,false,false,[{level:60,color:'#d9483b',label:'처음'}]):'<div class="cycle-placeholder">여기에 물을 준비해</div>'}<b data-cycle-source>${ready?`남은 물 ${Math.round(source*10)/10}`:'물 준비 전'}</b><p>실온 · 가열하지 않음</p></article><div class="cycle-air"><span>공기 중</span><b>${evap?'눈에 보이지 않는 수증기':'수증기는 눈에 보이지 않아'}</b><p>물 표면에서 증발<br>차가운 표면에서 응결</p><span aria-hidden="true">→</span></div><article><h3>② 판 앞면과 받이</h3>${plate}<b>${!ready?'마른 판 준비 전':drops?'판 앞면에 물방울':collected?'받이에 모인 물 3':cold?'차가워지는 판':receiver?'받이 배치 · 판은 실온':'실온 판 · 마른 상태'}</b><p>${cold?'뒷면만 냉각 · 앞면 관찰':'준비할 때 판 앞면을 말려'}</p></article></div><div class="cycle-controls"><p role="status">${esc(c.message||'물과 판을 준비한 뒤 한 단계씩 관찰해 보자.')}</p>${task?`<button type="button" class="btn primary" data-cycle-action="${task[1]}">${task[2]}</button>`:btn('개념 영상 보고 도장 받기','field-finish','primary')}${waiting?`<label class="process-clock">과정 <b data-cycle-clock>${time}%</b><progress data-cycle-progress value="${time}" max="100" aria-label="과정 진행"></progress></label><button type="button" class="btn quiet" data-cycle-pause hidden>직접 해보기</button>`:''}</div><div class="transform-footer">${btn('앞 실험 다시 보기','field-back','quiet')}<details><summary>모형 안내</summary><p>시간과 양은 비교를 위한 가상 값이야. 수증기가 충분하고 판이 충분히 차가운 조건이야. 닫힌 모형에서 처음 물 100 중 95는 그릇에, 3은 받이에, 나머지 2는 공기 중에 남는 예를 보여 줘. 실제 응결량은 습도·표면 온도·시간에 따라 달라져. 물방울은 저절로 위로 흐르지 않아.</p></details></div>`;
}
export function cycleView(c){return `<section id="field-greenhouse" class="field-transform greenhouse">${cycleMarkup(c)}</section>`;}
export function bindCycle(host,get,commit,reduced,settings){
 const life=new AbortController();let frame=0,running=false;
 const paint=()=>{host.innerHTML=cycleMarkup(get());const direction=document.getElementById('stage-direction');if(direction)direction.textContent=cycleTask(get());const count=document.querySelector('.stage-guide .step-count');if(count)count.textContent=['evaporate','condense'].filter(k=>get().marks.includes(k)).length+' / 2';if(!document.querySelector('dialog[open]'))host.querySelector('[data-cycle-action],[data-action="field-finish"]')?.focus({preventScroll:true});};
 const pause=()=>{cancelAnimationFrame(frame);running=false;};
 document.addEventListener('observation-stop',()=>{
  if(!running)return;pause();
  host.querySelector('[data-cycle-action="wait"]').disabled=false;
  host.querySelector('[data-cycle-pause]').hidden=true;
 },{signal:life.signal});
 host.addEventListener('click',e=>{
  if(e.target.closest('[data-cycle-pause]')){pause();paint();return;}
  const b=e.target.closest('[data-cycle-action]');if(!b||b.disabled||running)return;
  const step=b.dataset.cycleAction;
  // Same step sounds as the other process screens: a drop per step, success on the final comparison.
  if(step!=='wait'||reduced()){commit(step,step==='wait'?100:undefined);void playCue(step==='compare'?'success':'drop');paint();return;}
  running=true;b.disabled=true;host.querySelector('[data-cycle-pause]').hidden=false;
  const clock=createObservationClock(settings),from=cycleStatus(get()).time;
  const tick=now=>{if(document.hidden||document.querySelector('dialog[open]')){pause();paint();return;}const time=Math.min(100,Math.floor(from+clock(now)/45));commit('wait',time);host.querySelector('[data-cycle-clock]').textContent=time+'%';host.querySelector('[data-cycle-progress]').value=time;const source=host.querySelector('[data-cycle-source]');if(cycleStatus(get()).stage==='evaporating')source.textContent='남은 물 '+Math.round((100-time*.05)*10)/10;const drops=host.querySelector('[data-cycle-droplets]');if(drops&&cycleStatus(get()).stage==='condensing')drops.innerHTML=cycleDrops(time);if(time<100)frame=requestAnimationFrame(tick);else{pause();void playCue('drop');paint();}};
  frame=requestAnimationFrame(tick);
 },{signal:life.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){pause();paint();}},{signal:life.signal});
 return ()=>{pause();life.abort();};
}
