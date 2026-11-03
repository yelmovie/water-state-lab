import {resumeObservationTime} from './inquiry.js';
import {activityReady} from './activity-model.js';

// Each entry is an observation the learner could make with the existing controls.
// A missing entry is a decision point. Never choose a prediction, answer or reward.
export function observationStep(n, state) {
 const a = state.activities, q = state.inquiry;
 if (state.fieldwork.active === n) return null;
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
  case 3: {
   const f = a.freeze;
   if (!f.onScale) return 'act-drop-measure-cup-scale';
   if (!f.predicted) return null;
   if (!f.records.some(record => record.kind === 'ice'))
    return f.phase === 'ice' ? 'act-freeze-record' : 'act-drop-icepack-freeze-cup';
   if (!f.records.some(record => record.kind === 'melt'))
    return f.phase === 'melt' ? 'act-freeze-record' : 'act-drop-warm-freeze-cup';
   return null;
  }
  case 5:
   if (!q.drawPrediction || q.drawMode === 'record' || !a.draw.strokes.some(stroke => stroke.length >= 3)) return null;
   return a.draw.time < 110 ? 'ix-forward' : null;
  case 6: {
   const c = a.compare;
   if (c.baseline && (!c.heat || c.records.some(record => record.heat === c.heat && record.time >= 100))) return null;
   if (c.time < 100) return 'ix-forward';
   return 'ix-record';
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
  default: return null;
 }
}
let playingStage = null, timer;
export function stopObservation() {
 clearTimeout(timer);
 playingStage = null;
 const button = document.getElementById('observation-play');
 if (button) {
  button.setAttribute('aria-pressed','false');
  button.textContent='▶ 자동재생';
 }
}
export function bindObservation(state, perform) {
 clearTimeout(timer);
 const button = document.getElementById('observation-play');
 if (!button || (playingStage !== null && playingStage !== state.route)) stopObservation();
 if (!button) return;
 if (playingStage !== null) {
  button.setAttribute('aria-pressed','true');
  button.textContent='Ⅱ 멈추기';
  const stage=playingStage;
  timer=setTimeout(()=>{
   if (state.route!==stage || document.hidden || document.querySelector('dialog[open]')) return stopObservation();
   const step=observationStep(stage,state);
   if (step) perform(step); else stopObservation();
  },1250);
 }
 button.onclick=()=>{
  if (playingStage !== null) return stopObservation();
  resumeObservationTime();
  playingStage=state.route;
  bindObservation(state,perform);
 };
}
// Hand control back on the first manual interaction, including navigation and dialogs.
function manual(event) {
 if (playingStage!==null && !event.target.closest?.('#observation-play')) stopObservation();
}
document.addEventListener('pointerdown', manual, true);
document.addEventListener('keydown', event=>{
 if(event.key==='Escape')stopObservation();else manual(event);
},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopObservation();});

