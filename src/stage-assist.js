import {activityReady,experimentActivities} from './activity-model.js';
import {testCollector} from './domain.js';
import {observationClockBusy} from './inquiry.js';

// The stage plays its routine parts by itself: time passing, record keeping, moving on.
// Learners act only at a decision or the one action a concept needs. Never pick a prediction,
// a conclusion or a reward here. A missing step means the learner's turn.
const step=(action,delay,title,note)=>({action,delay,title,note});
const watch=(title,note)=>step('ix-watch',800,title,note);

function observeStep(o){
 // Comparing is the concept of this stage, so the learner decides when it is done.
 if(o.step<2||!o.clothWet)return null;
 if(o.time<100)return watch('젖은 자국이 마르고 있어','자국이 점점 옅어지는 걸 지켜봐.');
 return o.records.length?null:step('ix-record',2000,'물자국이 사라졌어','물은 눈에 보이지 않는 수증기가 되어 공기 중으로 갔어.');
}
function drawStep(d,q){
 if(!d.strokes.some(line=>line.length>=3)||!q.drawPrediction||q.drawMode==='record')return null;
 return d.time<110?watch('두 물그림이 마르고 있어','어느 쪽 물자국이 먼저 옅어지는지 지켜봐.'):null;
}
function heatStep(c){
 if(!c.baseline)return c.time<100?watch('가열하지 않아도 물이 줄어드는지 봐','두 컵의 물높이를 지켜봐.'):step('ix-record',1800,'끓이지 않아도 조금씩 줄어들어','표면에서 물이 수증기로 변해. 이게 증발이야.');
 if(c.heat<55)return null;
 if(!c.records.some(r=>r.boiling))return c.time<100?watch('B 컵의 물이 끓고 있어','물속에서 기포가 올라오는지 지켜봐.'):step('ix-record',1800,'물속에서 기포가 올라와','끓을 때는 물속에서도 수증기가 생겨.');
 const site=['surface','inside','level'].find(key=>!c.pins.includes(key));
 if(!site)return null;
 return step('ix-lens-'+site,2800,({surface:'A 표면을 돋보기로 볼게',inside:'B 물속을 돋보기로 볼게',level:'두 컵의 물높이를 비교할게'})[site],'돋보기 속 모습을 살펴봐.');
}
function dewStep(d,q){
 if(!q.dewHypothesis||!d.wiped.includes('cold'))return null;
 if(!d.wiped.includes('room'))return step('ix-wipe-room',1000,'B 컵도 똑같이 닦을게','두 컵의 조건을 같게 맞추는 거야.');
 if(!d.sealed)return step('act-dew-seal',1200,'두 컵의 입구를 막을게','컵 안의 물이 밖으로 나올 수 없게 하는 거야.');
 if(d.records.length<2)return d.time<100?watch('같은 시간 동안 두 컵을 지켜봐','어느 컵 바깥에 물방울이 생기는지 봐.'):step('ix-record',1800,'차가운 컵에만 물방울이 생겼어','입구를 막았으니 컵 안에서 나온 물이 아니야.');
 if(!d.rewiped)return null;
 if(d.again)return null;
 return d.againTime<100?watch('닦은 자리를 지켜봐','같은 자리에 물방울이 다시 생기는지 봐.'):step('ix-record',1600,'닦은 자리에 또 생겼어','공기 중 수증기가 차가운 겉면에서 물방울이 돼.');
}
function explainStep(a,q){
 if(!activityReady(7,a))return null;
 const e=a.explain;
 if(e.evidence.length<2){const key=['sealed','contrast'].find(id=>!e.evidence.includes(id));return step('ix-evidence-'+key,1500,'컵 실험의 증거를 모을게','네가 본 증거를 그대로 가져왔어.');}
 if(e.chain.length<3||!q.transferPrediction)return null;
 if(!e.bottleWiped)return step('ix-bottle-start',1000,'두 음료병의 겉면을 닦을게','닦은 뒤 어떻게 되는지 지켜봐.');
 if(e.time<100)return watch('음료병을 지켜봐','어느 병 바깥에 물방울이 생기는지 봐.');
 return e.transfer?null:step('ix-record',1600,'차가운 병에도 물방울이 생겼어','차가운 표면이면 어디서든 같은 일이 일어나.');
}
function workshopStep(s){
 const last=s.trials.at(-1);
 if(!s.cold&&!last)return null;
 if(!last||last.signature!==testCollector(s.parts,s.cold,s.angle).signature)return step('test-workshop',900,'물방울을 따라가 봐','물이 어디까지 가는지 지켜봐.');
 return null;
}
function finalStep(final){
 const f=final?.progress,d=f?.diagnosis;
 if(!final?.design||!d||f.tested)return null;
 const last=d.tests.at(-1);
 if(!last)return step('diagnosis-test',1200,'장치를 시험해 볼게','물이 어디서 멈추는지 지켜봐.');
 if(d.resolved){
  if(!f.connected)return step('connect-core',1400,'다 고쳤어! 코어에 이을게','고친 장치와 코어를 연결하는 중이야.');
  if(!f.valve)return step('core-open-valve',1100,'밸브를 열게','물이 지나갈 길을 여는 중이야.');
  return step('test-core',1200,'코어로 물을 보낼게','물이 코어까지 닿는지 지켜봐.');
 }
 const changed=last.signature!==testCollector(d.working.parts,d.working.cold,d.working.angle).signature;
 return d.hypothesis&&(changed||d.hypothesis===d.fault&&last.ok)?step('diagnosis-test',1100,'고친 장치를 시험할게','물이 끝까지 가는지 지켜봐.'):null;
}
export function assistStep(n,state,final=null){
 if(state.fieldwork.active===n)return null;
 const a=experimentActivities(n,state),q=state.inquiry;
 if(n===1)return observeStep(a.observe);
 if(n===5)return activityReady(5,a)?null:drawStep(a.draw,q);
 if(n===6)return activityReady(6,a)?null:heatStep(a.compare);
 if(n===7)return activityReady(7,a)?null:dewStep(a.dew,q);
 if(n===8)return activityReady(8,a)?null:explainStep(a,q);
 if(n===9)return workshopStep(state.lab.workshop);
 if(n===10)return finalStep(final);
 return null;
}

/** How long the automatic demonstration stays on a screen before its next step. */
export function observationDwell(n,state){
 const o=state.activities.observe;
 if(n===3&&state.activities.freeze.records.some(r=>r.kind==='ice'))return 5200; // The freezing animation finishes first.
 if(n===9)return 3200; // Long enough to read why the water stopped.
 return n===1&&(o.step===0?o.pours.length===2:o.step===1&&o.iceMoved)?3600:1250;
}

let timer=0,pending=null;
const motionOff=state=>state.settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
function arm(wait){
 clearTimeout(timer);
 if(!pending)return;
 timer=setTimeout(()=>{
  if(!pending)return;
  if(document.hidden||document.querySelector('dialog[open]')||observationClockBusy()){arm(700);return;}
  const {run,step:next}=pending;pending=null;run(next.action);
 },wait);
}
/** Called after every render. A touch on the screen holds the next step until the finger lifts. */
export function bindAssist(state,run,final){
 const route=state.route,next=typeof route==='number'?assistStep(route,state,final):null;
 pending=next?{run,step:next}:null;
 arm(next?(motionOff(state)?150:next.delay):0);
}
document.addEventListener('pointerdown',()=>clearTimeout(timer),true);
document.addEventListener('pointerup',()=>{if(pending)arm(pending.step.delay);},true);
document.addEventListener('pointercancel',()=>{if(pending)arm(pending.step.delay);},true);
