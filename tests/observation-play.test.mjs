import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../src/state.js';
import {measureAction} from '../src/freeze-measure.js';
globalThis.document??={addEventListener(){}};
const {observationStep,bindObservation,stopObservation,observationPlaying,CHECKPOINT_STEPS}=await import('../src/observation-play.js');

test('measurement playback stops for a prediction and then uses every existing observation step',()=>{
 const s=initialState(),f=s.activities.freeze;
 assert.equal(observationStep(3,s),'@[data-measure-action="measure"]');
 measureAction(f,'measure');assert.equal(observationStep(3,s),null);
 f.predicted=true;
 for(const action of ['load','wait','take','measure-ice','rest','wait','measure-melt','compare']){
  assert.equal(observationStep(3,s),`@[data-measure-action="${action}"]`);measureAction(f,action,100);
 }
 assert.equal(observationStep(3,s),null);assert.deepEqual(f.records.map(r=>r.mass),[100,100,100]);
});
test('sorting playback previews the pictures without answering or awarding classification progress',()=>{
 const s=initialState(),visited=[];
 for(let i=0;i<6;i++){const action=observationStep(2,s,null,visited);assert.match(action,/^ix-sort-card-/);visited.push(action.slice(13));}
 assert.equal(new Set(visited).size,6);assert.equal(observationStep(2,s,null,visited),null);assert.deepEqual(s.activities.sort.placed,{});
});
test('drawing and cup playback keep predictions with the learner',()=>{
 const s=initialState();assert.equal(observationStep(5,s),'ix-draw-example');s.activities.draw.strokes=[[[0,0],[10,20],[30,10]]];
 assert.equal(observationStep(5,s),null);assert.equal(observationStep(7,s),null);
 s.inquiry.drawPrediction='thin';assert.equal(observationStep(5,s),'ix-forward');
 s.inquiry.dewHypothesis='air';assert.equal(observationStep(7,s),'ix-wipe-cold');
});
test('field playback uses its own process controls and never chooses an answer',()=>{
 const s=initialState();for(const n of [2,4,10]){s.fieldwork.active=n;const action=observationStep(n,s);assert.ok(action.startsWith('@'));assert.doesNotMatch(action,/reason|field-finish|complete|core-activate/);}
});

test('a stage opens hands-on; once watching, it pauses at a question, resumes after the answer, and keeps a manual stop',async()=>{
 const original=globalThis.document;
 const attrs={},label={textContent:''},button={dataset:{},disabled:false,setAttribute(k,v){attrs[k]=v;},querySelector(){return label;}},main={dataset:{questionId:'sort-ice'}};
 globalThis.document={hidden:false,getElementById:()=>button,querySelector:selector=>selector==='.experiment-main'?main:null,dispatchEvent(){},addEventListener(){}};
 const s=initialState();s.settings.observationPace=2;s.route=2;s.inquiry.sortProof='ice';const actions=[];
 try{
  bindObservation(s,a=>actions.push(a));assert.equal(observationPlaying(),false);assert.equal(button.disabled,false);assert.equal(label.textContent,'자동으로 보기');
  await new Promise(r=>setTimeout(r,330));assert.equal(actions.length,0,'nothing moves until the learner asks to watch');
  button.onclick();await new Promise(r=>setTimeout(r,700));assert.equal(observationPlaying(),false);assert.equal(button.disabled,true);assert.equal(main.dataset.guidedPhase,'question');
  s.activities.sort.placed.ice='solid';s.inquiry.sortProof='';main.dataset.questionId='';bindObservation(s,a=>actions.push(a));
  assert.equal(observationPlaying(),true);await new Promise(r=>setTimeout(r,700));assert.equal(actions[0],'ix-sort-card-water');
  stopObservation();const before=actions.length;bindObservation(s,a=>actions.push(a));await new Promise(r=>setTimeout(r,330));assert.equal(actions.length,before);assert.equal(observationPlaying(),false);
 }finally{stopObservation();globalThis.document=original;}
});

test('watching hands the tools back after a couple of steps',async()=>{
 const original=globalThis.document;
 const attrs={},label={textContent:''},button={dataset:{},disabled:false,setAttribute(k,v){attrs[k]=v;},querySelector(){return label;}},main={dataset:{questionId:''}};
 globalThis.document={hidden:false,getElementById:()=>button,querySelector:selector=>selector==='.experiment-main'?main:null,dispatchEvent(){},addEventListener(){}};
 const s=initialState();s.settings.observationPace=2;s.settings.autoplay=false;s.route=2;const actions=[];let manual=false;
 try{
  bindObservation(s,a=>actions.push(a),null,()=>{},value=>{manual=value;});
  button.onclick();
  const deadline=Date.now()+12000;while(observationPlaying()&&Date.now()<deadline)await new Promise(r=>setTimeout(r,100));
  assert.equal(observationPlaying(),false);assert.equal(actions.length,CHECKPOINT_STEPS);assert.equal(manual,true);assert.equal(label.textContent,'이어서 보기');
 }finally{stopObservation();globalThis.document=original;}
});

test('direct interaction opens the controls and observation can resume across a render',async()=>{
 const original=globalThis.document;
 const attrs={},label={textContent:''},button={dataset:{},disabled:false,setAttribute(k,v){attrs[k]=v;},querySelector(){return label;}},main={dataset:{questionId:''}};
 globalThis.document={hidden:false,getElementById:()=>button,querySelector:selector=>selector==='.experiment-main'?main:null,dispatchEvent(){},addEventListener(){}};
 const s=initialState();s.route=3;let manual=false;
 const render=()=>bindObservation(s,()=>{},null,()=>{},value=>{manual=value;render();});
 try{
  render();assert.equal(observationPlaying(),false);assert.equal(label.textContent,'자동으로 보기');await Promise.resolve();assert.equal(manual,true,'the stage opens with the tools showing');
  button.onclick();assert.equal(manual,false);assert.equal(observationPlaying(),true);assert.equal(label.textContent,'직접 해보기');assert.equal(attrs['aria-label'],'직접 해보기');
  button.onclick();assert.equal(manual,true);assert.equal(observationPlaying(),false);assert.equal(label.textContent,'자동으로 보기');
  button.onclick();assert.equal(observationPlaying(),true);
  measureAction(s.activities.freeze,'measure');main.dataset.questionId='freeze-prediction';render();
  assert.equal(button.disabled,true);assert.equal(observationPlaying(),false);assert.equal(label.textContent,'답을 고르면 계속');assert.equal(s.activities.freeze.predicted,false);
 }finally{stopObservation();globalThis.document=original;}
});
