import test from 'node:test';
import assert from 'node:assert/strict';
import {freezeTrial,opacityAt,testCollector,canFinishCollector,currentTrialValid,confirmedWorkshop,targetParts,canEnter,defaultParts,previousRoute} from '../src/domain.js';
import {initialState,readState,KEY,state} from '../src/state.js';
import {finalContext,resetFinalPreview,handleWorkshop} from '../src/workshop.js';
test('freezing expands volume; different fills lead to different risk',()=>{assert.equal(freezeTrial(95).risk,'높음');assert.equal(freezeTrial(70).risk,'낮음');assert.ok(freezeTrial(70).expanded>70);});
test('thin water trace disappears before thick trace; scrubbing is reversible',()=>{assert.equal(opacityAt(1,70),0);assert.ok(opacityAt(2,70)>0);assert.equal(opacityAt(1,0),1);});
test('collection requires condensation, slope, and an unbroken gravity path',()=>{const p=structuredClone(targetParts);const success=testCollector(p,true,20);assert.equal(success.ok,true);assert.equal(success.generated,success.collected+success.lost);assert.equal(testCollector(p,false,20).generated,0);assert.equal(testCollector(p,true,-10).ok,false);p.bucket.x=100;assert.equal(testCollector(p,true,20).ok,false);});
test('each missing connection is diagnosed at the first broken point',()=>{for(const key of ['plate','funnel','tube','bucket']){const p=structuredClone(targetParts);p[key].x=650;const r=testCollector(p,true,20);assert.equal(r.ok,false,key);assert.ok(r.steps.some(s=>!s.ok));}});
test('repeating the same successful design does not count as revision',()=>{const r=testCollector(targetParts,true,20);assert.equal(canFinishCollector([r]),false);assert.equal(canFinishCollector([r,r]),false);assert.equal(canFinishCollector([testCollector(targetParts,true,15),r]),true);});
test('editing a successful design requires a new trial',()=>{const w={parts:structuredClone(targetParts),cold:true,angle:20,trials:[testCollector(targetParts,true,15),testCollector(targetParts,true,20)]};assert.equal(currentTrialValid(w),true);w.angle=30;assert.equal(currentTrialValid(w),false);w.trials.push(testCollector(w.parts,w.cold,w.angle));assert.equal(currentTrialValid(w),true);});
test('recorded trial positions do not follow later part movement',()=>{const p=structuredClone(targetParts),r=testCollector(p,true,20);p.plate.y=200;assert.equal(r.steps[0].point.y,70);});
test('confirmed final design uses evidence snapshot instead of draft',()=>{const draft={parts:structuredClone(targetParts),cold:true,angle:20};const evidence={...structuredClone(draft),result:testCollector(draft.parts,true,20)};draft.parts.bucket.x=100;draft.cold=false;const confirmed=confirmedWorkshop(evidence);assert.equal(testCollector(confirmed.parts,confirmed.cold,confirmed.angle).ok,true);assert.equal(testCollector(draft.parts,draft.cold,draft.angle).ok,false);});
test('stage gates enforce prior mission and odd screen completion',()=>{const s=initialState();assert.equal(canEnter(1,s),true);assert.equal(canEnter(2,s),false);assert.equal(canEnter(3,s),false);s.pages.push(1);assert.equal(canEnter(2,s),true);s.completed.push(1);assert.equal(canEnter(3,s),true);assert.equal(canEnter(10,s),false);});
const storage=value=>({getItem:key=>{assert.equal(key,KEY);return value;}});
test('state restores experiment conditions and drawing points',()=>{const s=initialState();s.lab.freeze.prediction=80;s.lab.draw.strokes=[[[1,2],[30,40]]];const restored=readState(storage(JSON.stringify(s)));assert.equal(restored.lab.freeze.prediction,80);assert.deepEqual(restored.lab.draw.strokes,s.lab.draw.strokes);});
test('invalid JSON, unknown versions and damaged nested parts reset safely',()=>{assert.equal(readState(storage('{bad')).route,'home');assert.equal(readState(storage('{"schemaVersion":999}')).route,'home');const s=initialState();s.lab.workshop.parts={};assert.deepEqual(readState(storage(JSON.stringify(s))).lab.workshop.parts,defaultParts());});
test('blocked storage getter still starts with an in-memory state',()=>{const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('SecurityError');}});try{assert.equal(readState().route,'home');}finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else delete globalThis.localStorage;}});
test('storage cannot restore a locked screen or an unfinished ending',()=>{const s=initialState();s.route=10;assert.equal(readState(storage(JSON.stringify(s))).route,'map');s.route='ending';assert.equal(readState(storage(JSON.stringify(s))).route,'map');});
test('admin unlock opens every valid screen without awarding or erasing progress',()=>{
 const s=initialState();s.completed=[1];s.pages=[1,2];const before=JSON.stringify({completed:s.completed,pages:s.pages,evidence:s.evidence});
 s.settings.adminUnlock=true;for(let n=1;n<=10;n++)assert.equal(canEnter(n,s),true);
 for(const n of [0,11,1.5,NaN])assert.equal(canEnter(n,s),false);
 s.settings.adminUnlock=false;assert.equal(canEnter(3,s),true);assert.equal(canEnter(4,s),false);
 assert.equal(JSON.stringify({completed:s.completed,pages:s.pages,evidence:s.evidence}),before);
});
test('old saves acquire settings defaults and admin saves restore unlocked routes',()=>{
 const old=initialState();old.settings={reduced:true};assert.deepEqual(readState(storage(JSON.stringify(old))).settings,{reduced:true,sound:true,bgm:false,sfx:true,bgmVolume:35,adminUnlock:false});
 const s=initialState();s.settings.adminUnlock=true;s.settings.sound=false;
 for(const route of [10,'ending']){s.route=route;const loaded=readState(storage(JSON.stringify(s)));assert.equal(loaded.route,route);assert.equal(loaded.settings.sound,false);}
});
test('previous page follows the lesson sequence with a disabled home boundary',()=>{
 assert.equal(previousRoute('home'),null);assert.equal(previousRoute('map'),'home');assert.equal(previousRoute(1),'map');
 for(let n=2;n<=10;n++)assert.equal(previousRoute(n),n-1);assert.equal(previousRoute('ending'),10);
});
test('admin final preview keeps sample design and submissions out of student records',()=>{
 const before=structuredClone(state);try{
  Object.assign(state,initialState());state.settings.adminUnlock=true;resetFinalPreview();
  const snapshot=JSON.stringify(state);const context=finalContext();assert.equal(context.preview,true);assert.equal(testCollector(context.design.parts,true,20).ok,true);
  const ctx={render(){}};for(let n=1;n<=5;n++)handleWorkshop(`submit-${n}`,ctx);handleWorkshop('connect-core',ctx);
  assert.equal(finalContext().progress.connected,true);assert.equal(JSON.stringify(state),snapshot);
  context.design.parts.bucket.x=0;assert.equal(targetParts.bucket.x,420);
  state.settings.adminUnlock=false;assert.equal(finalContext().preview,false);assert.equal(finalContext().progress.connected,false);
 }finally{Object.assign(state,before);resetFinalPreview();}
});
