import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../src/state.js';
import {measureAction} from '../src/freeze-measure.js';
globalThis.document??={addEventListener(){}};
const {observationStep,bindObservation,stopObservation,observationPlaying}=await import('../src/observation-play.js');

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

test('default observation pauses at a question, resumes after its answer, and keeps a manual stop',async()=>{
 const original=globalThis.document;
 const attrs={},label={textContent:''},button={dataset:{},disabled:false,setAttribute(k,v){attrs[k]=v;},querySelector(){return label;}},main={dataset:{questionId:'sort-ice'}};
 globalThis.document={hidden:false,getElementById:()=>button,querySelector:selector=>selector==='.experiment-main'?main:null,dispatchEvent(){},addEventListener(){}};
 const s=initialState();s.settings.observationSpeed=1;s.route=2;s.inquiry.sortProof='ice';const actions=[];
 try{
  bindObservation(s,a=>actions.push(a));assert.equal(observationPlaying(),false);assert.equal(button.disabled,true);assert.equal(main.dataset.guidedPhase,'question');
  s.activities.sort.placed.ice='solid';s.inquiry.sortProof='';main.dataset.questionId='';bindObservation(s,a=>actions.push(a));
  assert.equal(observationPlaying(),true);await new Promise(r=>setTimeout(r,330));assert.equal(actions[0],'ix-sort-card-water');
  stopObservation();const before=actions.length;bindObservation(s,a=>actions.push(a));await new Promise(r=>setTimeout(r,330));assert.equal(actions.length,before);assert.equal(observationPlaying(),false);
 }finally{stopObservation();globalThis.document=original;}
});
