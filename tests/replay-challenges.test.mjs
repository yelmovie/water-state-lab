import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,validateActivities,hiddenScenes,hiddenSceneTry,freezeChallengeTrial,bestFreezeChallenge} from '../src/activity-model.js';
import {initialState,readState} from '../src/state.js';
import {sanitizeInquiry,initialInquiry} from '../src/inquiry-model.js';

const storage=value=>({getItem:()=>JSON.stringify(value)});

test('hidden stage-2 scenes count a wrong state as a clue, not a lost record',()=>{
 const sort=initialActivities().sort;
 const wrong=hiddenSceneTry(sort,'mist','gas');
 assert.equal(wrong.ok,false);assert.equal(sort.hidden.tries.mist,1);assert.equal(sort.hidden.placed.mist,undefined);
 assert.equal(hiddenSceneTry(sort,'mist','liquid').ok,true);assert.equal(sort.hidden.placed.mist,'liquid');
 assert.equal(hiddenSceneTry(sort,'mist','gas').repeat,true,'a found scene cannot be overwritten');
 assert.equal(hiddenSceneTry(sort,'unknown','liquid').ok,false);
 assert.ok(hiddenScenes.every(c=>c.type==='liquid'&&c.clue&&c.proof),'both bonus scenes target the visible-water-is-not-vapour idea');
});

test('stage-3 transfer challenge uses the same ×1.09 model as the first measurement',()=>{
 assert.equal(freezeChallengeTrial(60,65.4).actual,65.4);
 const t=freezeChallengeTrial(40,44);assert.equal(t.actual,43.6);assert.equal(t.error,.4);assert.equal(t.close,true);
 assert.equal(freezeChallengeTrial(80,80).close,false);
 assert.equal(freezeChallengeTrial(80,200).prediction,95,'prediction stays inside the slider range');
 assert.equal(bestFreezeChallenge([]),null);
 assert.equal(bestFreezeChallenge([freezeChallengeTrial(40,50),freezeChallengeTrial(70,76.5)]).amount,70);
});

test('saves made before the replay goals keep every activity record',()=>{
 const old=initialState();delete old.activities.sort.hidden;delete old.activities.freeze.challenge;
 old.activities.sort.placed={ice:'solid'};old.activities.freeze.records=[{kind:'water',level:60,mass:100}];
 const loaded=readState(storage(old));
 assert.deepEqual(loaded.activities.sort.placed,{ice:'solid'});assert.equal(loaded.activities.freeze.records.length,1);
 assert.deepEqual(loaded.activities.sort.hidden,{placed:{},tries:{}});assert.deepEqual(loaded.activities.freeze.challenge.trials,[]);
});

test('replay data is validated and the hidden selection is sanitised',()=>{
 const a=initialActivities();a.sort.hidden.placed={mist:'liquid'};a.freeze.challenge.trials=[freezeChallengeTrial(50,55)];
 assert.equal(validateActivities(a),true);
 const bad=initialActivities();bad.sort.hidden.placed={mist:'gas'};assert.equal(validateActivities(bad),false);
 assert.equal(sanitizeInquiry({...initialInquiry(),hiddenProof:'drip'}).hiddenProof,'drip');
 assert.equal(sanitizeInquiry({...initialInquiry(),hiddenProof:'ice'}).hiddenProof,'');
});
