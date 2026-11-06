import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities} from '../src/activity-model.js';

globalThis.document??={addEventListener(){}};
const {assistStep}=await import('../src/stage-assist.js');
const inquiry=()=>({drawPrediction:'',drawMode:'live',dewHypothesis:'',transferPrediction:'',workshopCompared:''});
const world=(change=()=>{})=>{const state={fieldwork:{active:0},settings:{adminUnlock:false},activities:initialActivities(),inquiry:inquiry(),lab:{workshop:{parts:{},cold:false,angle:0,trials:[]}}};change(state);return state;};

test('routine steps play by themselves once the learner has acted',()=>{
 const s=world(x=>{Object.assign(x.activities.observe,{pours:['tall','wide'],step:2,clothWet:true});});
 assert.equal(assistStep(1,s).action,'ix-watch');
 s.activities.observe.time=100;
 assert.equal(assistStep(1,s).action,'ix-record');
});

test('assist waits for every prediction and conclusion',()=>{
 const draw=world(x=>{x.activities.draw.strokes=[[[0,0],[1,1],[2,2]]];});
 assert.equal(assistStep(5,draw),null,'drawing prediction stays with the learner');
 const dew=world(x=>{x.activities.dew.wiped=['cold'];});
 assert.equal(assistStep(7,dew),null,'dew hypothesis stays with the learner');
 const heat=world(x=>{Object.assign(x.activities.compare,{baseline:true,heat:0});});
 assert.equal(assistStep(6,heat),null,'turning the heater on stays with the learner');
 const air=world(x=>{Object.assign(x.activities.compare,{baseline:true,heat:100,time:100,records:[{heat:100,boiling:true}],pins:['surface','inside','level']});});
 assert.equal(assistStep(6,air),null,'the destination of the water stays with the learner');
 assert.equal(assistStep(9,world()),null,'the first cooling step stays with the learner');
});

test('field missions never run on assist',()=>{
 const s=world(x=>{x.fieldwork.active=1;x.activities.observe.pours=['tall','wide'];});
 assert.equal(assistStep(1,s),null);
});
