import {observationSpeed,observationDelay} from './observation-speed.js';
import {resumeObservationTime,stop as stopClock,observationClockBusy} from './inquiry.js';
import {activityReady,pipeTrial,sortCards} from './activity-model.js';
import {assistStep,observationDwell} from './stage-assist.js';
import {funnelSeat} from './workshop-controls.js';
import {measureStatus} from './freeze-measure.js';
import {currentNight,nightFills} from './cold-night-model.js';
import {coreTransfer} from './core-transfer.js';
import {toast} from './ui.js';
import {guidedQuestion,guidedRoutineAction} from './guided-flow.js';

// Each entry is an observation the learner could make with the existing controls.
// A missing entry is a decision point. Never choose a prediction or reward.
export function observationStep(n, state, final=null, visited=[]) {
 const a = state.activities, q = state.inquiry;
 if (state.fieldwork.active === n) {
  if(n===2)return '@[data-tray-action], [data-process-action], [data-transform-next]';
  if(n===4)return '@[data-night-next], [data-night-start]';
  if(n===10)return '@[data-cycle-action]';
  return null;
 }
 switch (n) {
  case 1: {
   const o = a.observe;
   if (o.step === 0) {
    const target = ['tall', 'wide'].find(key => !o.pours.includes(key));
    if (!target) return 'act-observe-step-1';
    return q.pourTarget === target ? 'ix-pour-auto' : 'ix-pour-target-' + target;
   }
   if (o.step === 1) return o.iceMoved ? 'act-observe-step-2' : 'act-drop-ice-dish';
   if (!o.clothWet) return 'act-wet-cloth';
   if (o.time < 100) return 'ix-forward';
   return activityReady(1,a) ? null : 'ix-record';
  }
  case 2: {const card=sortCards.find(c=>!visited.includes(c.id));return card?'ix-sort-card-'+card.id:null;}
  case 3: {
   const f=a.freeze,{stage}=measureStatus(f);
   if(stage==='measured'&&!f.predicted)return null;
   const step={start:'measure',measured:'load',cooling:'wait',frozen:'take',taken:'measure-ice','ice-measured':'rest',resting:'wait',melted:'measure-melt','melt-measured':'compare'}[stage];
   return step?'@[data-measure-action="'+step+'"]':null;
  }
  case 4: {
   const p=a.pipe,safe=p.trials.some(t=>t.safe),full=p.trials.some(t=>!t.safe);
   if(safe&&full)return null; // Finding the empty space stays with the learner.
   if(!p.trials.length)return 'bench-run';
   if(!safe&&!pipeTrial(p.fill).safe)return 'bench-less';
   if(!full&&pipeTrial(p.fill).safe)return 'bench-more';
   return 'bench-run';
  }
  case 5:
   if(!a.draw.strokes.some(stroke=>stroke.length>=3))return 'ix-draw-example';
   if (!q.drawPrediction || q.drawMode === 'record') return null;
   return a.draw.time < 110 ? 'ix-forward' : null;
  case 6: {
   const c = a.compare;
   return c.baseline&&c.heat<55?(c.batchPrepared?'ix-heat-on':'ix-heat-prepare'):null;
  }
  case 7: {
   const d = a.dew;
   if (!q.dewHypothesis || d.again) return null;
   if (!d.wiped.includes('cold')) return 'ix-wipe-cold';
   if (!d.wiped.includes('room')) return 'ix-wipe-room';
   if (!d.sealed) return 'act-dew-seal';
   if (d.records.length < 2) return d.time < 100 ? 'ix-forward' : 'ix-record';
   if (!d.rewiped) return 'ix-wipe-middle';
   return d.againTime < 100 ? 'ix-forward' : 'ix-record';
  }
  case 8: {
   const e = a.explain;
   if (e.chain.length !== 3 || !q.transferPrediction || e.transfer) return null;
   if (!e.bottleWiped) return 'ix-bottle-start';
   return e.time < 100 ? 'ix-forward' : 'ix-record';
  }
  case 9: {
   const s = state.lab.workshop, seat = funnelSeat(s.parts.ramp);
   if (!s.cold) return 'toggle-cold';
   if (s.angle <= 0) return 'ramp-tilt';
   return s.parts.funnel.x === seat.x && s.parts.funnel.y === seat.y ? null : 'funnel-fix';
  }
  case 10: {
   const f=final?.progress,d=f?.diagnosis;
   if(!d||f.tested)return null;
   if(!d.resolved){
    if(d.hypothesis==='cooling'&&!d.working.cold)return 'core-cooling';
    if(d.hypothesis==='connection'&&d.working.parts.funnel.x!==final.design.parts.funnel.x)return 'core-funnel';
    return null;
   }
   if(f.connected&&!coreTransfer(f,d.working).downhill)return {selector:'#core-inlet-height',value:25};
   return f.connected&&f.valve<100?'core-open-valve':null;
  }
  default: return null;
 }
}
/** Repeat an observation through the same controls, without choosing its conclusion. */
export function replayStep(n, state) {
 if(n===4&&state.fieldwork.active!==n&&state.activities.pipe.trials.some(t=>t.safe)&&state.activities.pipe.trials.some(t=>!t.safe))return 'bench-run';
 return n === 3 && state.fieldwork.active !== n && activityReady(3, state.activities) ? 'act-freeze-replay' : null;
}
let playingStage=null,playingField=false,timer,revision=0,visited=[],scope=null,pauseScope=null,pausedBy=null,preference=null,stepsSincePause=0;
// Watching hands back to the learner after this many steps so they can step in.
export const CHECKPOINT_STEPS=2;
export const observationPlaying = () => playingStage !== null;
export function stopObservation(message='',reason='manual') {
 clearTimeout(timer);
 const wasPlaying=playingStage!==null;
 playingStage=null;pausedBy=reason;pauseScope=scope;
 revision++;
 stopClock();
 if(wasPlaying)document.dispatchEvent(new Event('observation-stop'));
 const button=document.getElementById('observation-play');
 if(button){button.disabled=false;button.setAttribute('aria-pressed','false');const resumeText=reason==='checkpoint'?'이어서 보기':'자동으로 보기';button.setAttribute('aria-label',resumeText);button.title='자동으로 이어서 관찰해.';button.dataset.playState='paused';const label=button.querySelector?.('[data-guided-play-label]');if(label)label.textContent=resumeText;else button.textContent='▶ 자동재생';}
 const main=document.querySelector('.experiment-main');if(main)main.dataset.guidedPhase=reason==='question'?'question':'manual';
 if(typeof message==='string'&&message)toast(message);
}
export function observationPauseMessage(n,state){
 if(state.fieldwork.active===n)return n===4?'먼저 담을 물의 양이나 통을 비운 까닭을 골라 줘.':'관찰을 마쳤어. 결과를 비교하고 다음 행동을 골라 줘.';
 if(n===2)return '장면을 살펴봤어. 고체·액체·기체는 직접 분류해 봐.';
 if(n===3&&!state.activities.freeze.predicted)return '얼었을 때의 높이를 먼저 예상해 줘.';
 if(n===5&&!state.inquiry.drawPrediction)return '어느 그림이 먼저 마를지 먼저 예상해 줘.';
 if(n===7&&!state.inquiry.dewHypothesis)return '물방울이 어디서 왔을지 먼저 예상해 줘.';
 if(n===8)return '증거를 연결하고 새 병에서 생길 일을 먼저 예상해 줘.';
 if(n===10&&!state.lab.final.tested)return '고장 원인을 먼저 골라 줘. 그다음 자동으로 관찰할 수 있어.';
 return '관찰을 마쳤어. 결과를 비교하고 직접 선택해 봐.';
}
export function bindObservation(state, perform, final=null,onPreferenceChange=()=>{},onManualChange=()=>{}) {
 clearTimeout(timer);
 let binding=++revision;
 let awaitedMotion=false;
 const button=document.getElementById('observation-play'),guided=state.settings.autoplay!==false;
 if(!button||typeof state.route!=='number'){stopObservation('','transition');scope=null;return;}
 const nextScope=state.route+'|'+(state.fieldwork.active===state.route?'field':'experiment');
 // Every stage opens with the learner's own hands on the tools; watching is an opt-in button.
 const opening=nextScope!==scope;
 if(opening){stopObservation('','transition');scope=nextScope;pauseScope=scope;pausedBy='manual';visited=[];}
 if(preference!==null&&preference!==guided){stopObservation('','transition');pauseScope=scope;pausedBy='manual';}
 if(opening&&guided){const opened=revision;queueMicrotask(()=>{if(revision===opened&&playingStage===null)onManualChange(true);});}
 preference=guided;
 binding=revision;
 const question=()=>guided?guidedQuestion(state.route,state,final):null;
 const paint=()=>{
  const q=question(),playing=playingStage!==null,main=document.querySelector('.experiment-main'),phase=q&&pausedBy==='question'?'question':playing?'observe':'manual';
  if(main)main.dataset.guidedPhase=phase;
  button.disabled=phase==='question';button.setAttribute('aria-pressed',String(playing));button.dataset.playState=phase==='question'?'question':playing?'playing':'paused';
  const text=phase==='question'?'답을 고르면 계속':playing?'직접 해보기':pausedBy==='checkpoint'?'이어서 보기':'자동으로 보기',label=button.querySelector?.('[data-guided-play-label]');
  if(label)label.textContent=text;else button.textContent=phase==='question'?text:playing?'직접 해보기':'▶ 자동재생';
  button.setAttribute('aria-label',text);button.title=phase==='question'?'답을 고르면 관찰이 이어져.':playing?'실험 도구를 직접 조작해 봐.':'자동으로 이어서 관찰해.';
 };
 const schedule=(delay,scaled=true)=>{clearTimeout(timer);timer=setTimeout(tick,scaled?observationDelay(delay,state.settings):delay);};
 const speedControl=document.getElementById('observation-speed');
 if(speedControl)speedControl.onchange=()=>{state.settings.observationPace=observationSpeed({observationPace:Number(speedControl.value)});onPreferenceChange();if(playingStage!==null)schedule(assistStep(state.route,state,final)?.delay??observationDwell(state.route,state));};
 const begin=()=>{resumeObservationTime();stepsSincePause=0;playingStage=state.route;playingField=state.fieldwork.active===state.route;pausedBy=null;pauseScope=null;};
 const notifyQuestion=q=>{
  const main=document.querySelector('.experiment-main');if(main&&(main.dataset.questionId||'')!==(q?.id||''))document.dispatchEvent(new Event('guided-question-change'));
 };
 const waitForAnswer=q=>{
  if(playingStage!==null||pausedBy!=='question')stopObservation('','question');
  binding=revision;paint();notifyQuestion(q);if(binding===revision)schedule(250,false);
 };
 const run=step=>{
  if(typeof step==='object'){
   const control=document.querySelector(step.selector);if(!control)return false;
   control.value=step.value;control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  if(step.startsWith('@')||step.startsWith('bench-')){
   const control=document.querySelector(step[0]==='@'?step.slice(1):`[data-${step}]`);
   if(!control)return false;
   if(control.disabled)return true;
   if(control.hasAttribute('data-night-start')){
    const c=state.fieldwork.chapters[4],night=currentNight(c);
    if(!night||!nightFills(c,night).some(Boolean))return false;
   }
   control.click();return true;
  }
  if(step.startsWith('ix-sort-card-'))visited.push(step.slice(13));
  perform(step);return true;
 };
 function tick(){
  if(revision!==binding)return;
  if(document.hidden)return stopObservation();
  if(document.querySelector('dialog[open]')){if(pausedBy==='question')return schedule(500,false);return stopObservation();}
  if(playingStage!==null&&(observationClockBusy()||document.querySelector('[aria-busy="true"], [data-measure-pause]:not([hidden]), [data-cycle-pause]:not([hidden])'))){awaitedMotion=true;return schedule(150,false);}
  if(awaitedMotion){awaitedMotion=false;return schedule(state.fieldwork.active===4?1400:500);}
  const q=question();if(q&&(playingStage!==null||pausedBy==='question'))return waitForAnswer(q);
  if(playingStage===null){if(pausedBy!=='question')return;begin();paint();notifyQuestion(null);if(revision!==binding)return;}
  // Every few steps the learner gets the tools back, after the reading pause and any running motion.
  if(stepsSincePause>=CHECKPOINT_STEPS){stepsSincePause=0;stopObservation('','checkpoint');paint();onManualChange(true);return;}
  const n=state.route,assist=assistStep(n,state,final),routine=guided?guidedRoutineAction(n,state,final):null,step=routine??assist?.action??observationStep(n,state,final,visited);
  if(!step||!run(step)){stopObservation(guided?'':observationPauseMessage(n,state),'complete');paint();return;}
  stepsSincePause++;
  // In-place process animations do not render the app; keep the same controller alive for them.
  if(revision===binding&&playingStage!==null)schedule(routine?900:assist?.delay??observationDwell(n,state));
 }
 const q=question();
 if(q&&(guided&&pausedBy!=='manual'||playingStage!==null||pausedBy==='question'))waitForAnswer(q);
 else{
  const resume=guided&&pauseScope!==scope||guided&&pausedBy==='question';
  if(playingStage===null&&resume)begin();
  paint();if(playingStage!==null)schedule(assistStep(state.route,state,final)?.delay??250);
 }
 button.onclick=()=>{
  if (playingStage !== null){stopObservation();onManualChange(true);return;}
  binding=++revision;
  begin();visited=[];
  paint();schedule(250);onManualChange(false);
 };
}
// Hand control back on the first manual interaction, including navigation and dialogs.
function manual(event) {
 if (playingStage!==null && !event.target.closest?.('#observation-play,[data-observation-speed]')) stopObservation();
}
document.addEventListener('pointerdown', manual, true);
document.addEventListener('input',event=>{if(event.isTrusted)manual(event);},true);
document.addEventListener('wheel',manual,{capture:true,passive:true});
document.addEventListener('keydown', event=>{
 if(event.key==='Escape')stopObservation();else manual(event);
},true);
// Hiding the page stops a running playback; a waiting question stays a question.
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playingStage!==null)stopObservation();});

