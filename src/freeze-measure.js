import {createObservationClock} from './observation-speed.js';
import {beaker,esc} from './ui.js';
import {startLevel,iceLevel} from './freeze-talk.js';

const has=(f,kind)=>f.records.some(r=>r.kind===kind);
export function measureStatus(f){
 const stage=f.processStage||(f.compared?'compared':has(f,'melt')?'melt-measured':has(f,'ice')?'ice-measured':has(f,'water')?'measured':'start');
 return {stage,time:Number(f.processTime)||0};
}
/** Only a specimen on the scale can create a measurement; cooling tools never enter that measurement. */
export function measureAction(f,step,time){
 const {stage}=measureStatus(f),set=(stage,message)=>{f.processStage=stage;return message;};
 const record=kind=>{f.records=f.records.filter(r=>r.kind!==kind);f.records.push({kind,level:kind==='ice'?iceLevel:startLevel,mass:100,source:'freezer-process'});f.onScale=true;};
 if(step==='measure'&&stage==='start'){record('water');return set('measured','처음 눈금 60, 물의 무게 100.0 g을 기록했어. 얼었을 때의 높이를 예상해 보자.');}
 if(step==='load'&&stage==='measured'&&f.predicted){f.onScale=false;f.processTime=0;return set('cooling','냉동고에 넣고 문을 닫았어. 충분히 얼 때까지 기다리자.');}
 if(step==='wait'&&['cooling','resting'].includes(stage)&&Number.isFinite(time)&&time>=Number(f.processTime||0)&&time>=0&&time<=100){
  f.processTime=time;
  if(time===100){f.phase=stage==='cooling'?'ice':'melt';return set(stage==='cooling'?'frozen':'melted',stage==='cooling'?'물이 얼었어. 꺼내서 저울에 올려 보자.':'얼음이 녹았어. 같은 통을 다시 저울에 올려 보자.');}
 }
 if(step==='take'&&stage==='frozen')return set('taken','얼린 통만 꺼냈어. 겉의 물기는 닦고 같은 저울로 재 보자.');
 if(step==='measure-ice'&&stage==='taken'){record('ice');return set('ice-measured','눈금은 65.4로 높아졌지만 물의 무게는 100.0 g 그대로야.');}
 if(step==='rest'&&stage==='ice-measured'){f.onScale=false;f.processTime=0;return set('resting','통을 실온 준비대에 놓았어. 물을 더 넣지 않고 녹을 때까지 기다리자.');}
 if(step==='measure-melt'&&stage==='melted'){record('melt');return set('melt-measured','다시 물이 되니 눈금 60, 물의 무게는 100.0 g이야.');}
 if(step==='compare'&&stage==='melt-measured'&&['water','ice','melt'].every(k=>has(f,k))){f.compared=true;return set('compared','같은 물은 얼면 부피가 커지고, 녹으면 돌아와. 물을 잃거나 더하지 않은 세 기록의 무게는 같아.');}
 return '';
}
const tasks={
 start:['같은 통의 처음 모습을 재 보자','measure','처음 높이·무게 재기'],
 measured:['얼음 높이를 예상하고 냉동고에 넣자','load','냉동고에 넣고 문 닫기'],
 cooling:['충분히 차가운 냉동고에서 기다려','wait','얼 때까지 시간 보내기'],
 frozen:['문을 열고 통을 꺼내 보자','take','문 열고 통 꺼내기'],
 taken:['냉동고 밖의 같은 저울로 다시 재자','measure-ice','겉을 닦고 얼음 측정하기'],
 'ice-measured':['같은 통을 실온에 놓고 녹여 보자','rest','실온 준비대에 놓기'],
 resting:['주변에서 열을 받아 녹을 때까지 기다려','wait','녹을 때까지 시간 보내기'],
 melted:['물을 더하지 않은 같은 통을 재 보자','measure-melt','겉을 닦고 녹은 물 측정'],
 'melt-measured':['처음·얼린 뒤·녹인 뒤를 나란히 비교해','compare','세 기록 비교하기']
};
export const measureTask=f=>tasks[measureStatus(f).stage]?.[0]||'같은 물의 높이와 무게를 비교했어.';
const control=(step,label,disabled=false)=>`<button type="button" class="activity-button activity-primary" data-measure-action="${step}" ${disabled?'disabled':''}>${label}</button>`;
export function measureView(f,{after='',next='',challenge=''}={}){
 const {stage,time}=measureStatus(f),done=stage==='compared',cold=['cooling','frozen'].includes(stage),waiting=['cooling','resting'].includes(stage),task=tasks[stage];
 const ice=f.phase==='ice',level=ice?iceLevel:startLevel;
 const specimen=`<div class="measure-specimen">${beaker(level,ice,false,[{level:60,color:'#d9483b',label:'처음 선'}]).replace('<path d="M44 34h172"','<path d="M43 26 214 33" fill="none" stroke="#b7cec7" stroke-width="8" stroke-linecap="round"/><path d="M44 34h172"')}<span>냉동용 눈금통 · 느슨한 덮개</span></div>`;
 const pop=frozen=>`<figure><img src="/assets/learning/freeze-props-20261108/ice-pop-${frozen?'frozen':'soft'}.webp" alt="${frozen?'같은 쭈쭈바가 얼어 봉지가 부푼 모습':'얼리기 전, 주황색 물이 든 말랑한 쭈쭈바 봉지'}"><figcaption>${frozen?'얼린 뒤 · 부푼 봉지':'얼리기 전 · 말랑한 봉지'}</figcaption></figure>`;
 const life=f.talk>=3?'<img src="/assets/learning/pipe-burst.webp" alt="얼음이 커져 밀어낸 배관">':pop(false)+(f.talk===2?pop(true):'');
 const scene=done&&f.talk>0?`<div class="measure-life${f.talk===2?' measure-pop-compare':''}">${life}</div>`:`<div class="measure-stations"><div class="measure-station ${cold?'is-active':''}"><h3>냉동고${cold?' · 문 닫음':''}</h3><div class="measure-freezer"><img src="/assets/learning/${cold?'freeze-props-20261108/freezer-closed.webp':'ice-tray-20261108/freezer-open.webp'}" alt="${cold?'문이 닫힌 냉동고':'문이 열린 냉동고'}"></div></div><div class="measure-station ${!cold?'is-active':''}"><h3>${f.onScale?'같은 저울':'실온 준비대'}</h3>${!cold?specimen:'<div class="measure-empty">통이 냉동고 안에 있어</div>'}<div class="measure-scale"><span>용기값을 뺀 물의 무게</span><b>${f.onScale?'100.0 g':'—'}</b></div></div></div>`;
 const prediction=stage==='measured'&&!f.predicted?`<p>빨간 선은 처음 눈금 60이야. 얼면 높이가 어떻게 될까?</p><div class="freeze-guess">${[[56,'더 낮아져'],[60,'그대로야'],[66,'더 높아져']].map(([v,label])=>`<button class="activity-button" data-action="act-freeze-guess-${v}">${label}</button>`).join('')}</div><p>틀려도 괜찮아. 직접 확인하면 돼.</p>`:'';
 const snapshots=`<div class="measure-records" aria-label="같은 물의 측정 기록">${['water','ice','melt'].map((kind,i)=>{const r=f.records.find(r=>r.kind===kind);return `<figure><figcaption>${['처음 물','얼린 뒤','녹인 뒤'][i]}</figcaption>${r?`<b>눈금 ${r.level}</b><span>${r.mass.toFixed(1)} g</span>`:'<span>측정 전</span>'}</figure>`;}).join('')}</div>`;
 return `<section id="freeze-measure" class="activity activity-3"><div class="activity-scene"><p class="activity-stage-caption">같은 통 · 같은 물 · 물을 더하거나 흘리지 않아요</p>${scene}${snapshots}</div><aside class="activity-tools"><h3>${esc(measureTask(f))}</h3>${done?after:prediction}${!done&&task?control(task[1],task[2],stage==='measured'&&!f.predicted):''}${waiting?`<label class="process-clock">${cold?'얼리는':'녹이는'} 과정 <b data-measure-clock>${time}%</b><progress data-measure-progress max="100" value="${time}" aria-label="과정 진행"></progress></label><button type="button" class="activity-button" data-measure-pause hidden>직접 해보기</button>`:''}${done?next+challenge:''}<details class="science-detail"><summary>모형 안내</summary><p>시간과 눈금 변화는 줄여 보여 주는 모형이야. 냉동용 통 위에 느슨한 덮개를 두고, 물을 더하거나 잃지 않은 조건을 비교해. 통과 덮개 무게는 저울에서 뺀 값이야. 높이가 달라져도 같은 물의 무게는 같아.</p></details></aside></section>`;
}
export function bindMeasure(host,get,{save,render,reduced,settings}){
 const life=new AbortController();let frame=0,running=false;
 const pause=()=>{cancelAnimationFrame(frame);running=false;save();};
 document.addEventListener('observation-stop',()=>{
  if(!running)return;pause();
  host.querySelector('[data-measure-action="wait"]').disabled=false;
  host.querySelector('[data-measure-pause]').hidden=true;
 },{signal:life.signal});
 host.addEventListener('click',e=>{
  if(e.target.closest('[data-measure-pause]')){pause();render();return;}
  const b=e.target.closest('[data-measure-action]');if(!b||b.disabled||running)return;
  const step=b.dataset.measureAction;
  if(step!=='wait'){measureAction(get(),step);save();render();return;}
  if(reduced()){measureAction(get(),'wait',100);save();render();return;}
  running=true;b.disabled=true;host.querySelector('[data-measure-pause]').hidden=false;
  const clock=createObservationClock(settings),from=measureStatus(get()).time;
  const tick=now=>{if(document.hidden||document.querySelector('dialog[open]')){pause();b.disabled=false;host.querySelector('[data-measure-pause]').hidden=true;return;}const time=Math.min(100,Math.floor(from+clock(now)/40));measureAction(get(),'wait',time);host.querySelector('[data-measure-clock]').textContent=time+'%';host.querySelector('[data-measure-progress]').value=time;if(time<100)frame=requestAnimationFrame(tick);else{pause();render();}};
  frame=requestAnimationFrame(tick);
 },{signal:life.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){pause();render();}},{signal:life.signal});
 return ()=>{pause();life.abort();};
}
