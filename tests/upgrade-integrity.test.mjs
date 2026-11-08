import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,readState} from '../src/state.js';
import {testCollector} from '../src/domain.js';
import {chooseDiagnosisFault,newDiagnosis} from '../src/collector-model.js';
globalThis.document??={addEventListener(){}};
const {assistStep,bindAssist}=await import('../src/stage-assist.js');
test('saved non-default geometry and trial evidence survive loading',()=>{
 const original=initialState(),s=original.lab.workshop;
 s.parts.plate.x=240;s.cold=true;s.trials=[testCollector(s.parts,s.cold,s.angle)];
 const loaded=readState({getItem:()=>JSON.stringify(original)});
 assert.deepEqual(loaded.lab.workshop,s);
});
test('both diagnostic faults are available without coupling to geometry',()=>{
 const s=initialState().lab.workshop;
 assert.equal(chooseDiagnosisFault(()=>0),'cooling');
 assert.equal(chooseDiagnosisFault(()=>.999),'connection');
 assert.equal(newDiagnosis(s,chooseDiagnosisFault(()=>.999)).fault,'connection');
});
test('reduced motion keeps the full observation dwell time',()=>{
 const s=initialState();s.route=1;s.settings.reduced=true;
 Object.assign(s.activities.observe,{pours:['tall','wide'],step:2,clothWet:true});
 const next=assistStep(1,s),original=globalThis.setTimeout;let delay;
 try{globalThis.setTimeout=(fn,ms)=>{delay=ms;return 0;};bindAssist(s,()=>{});assert.equal(delay,next.delay);assert.ok(delay>150);}
 finally{globalThis.setTimeout=original;}
});
