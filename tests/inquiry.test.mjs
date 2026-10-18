import test from 'node:test';
import assert from 'node:assert/strict';
import {initialInquiry,sanitizeInquiry,visibleDew,wipeDroplets,dewMass,addRecord,drawingSVG} from '../src/inquiry-model.js';
import {collectorTrial,newDiagnosis,diagnosisResolved} from '../src/collector-model.js';
import {targetParts} from '../src/domain.js';
import {state,initialState,readState,KEY} from '../src/state.js';
import {handleInquiry,inquiryNotebook} from '../src/inquiry.js';
import {activityReady,pipeTrial,sortCards} from '../src/activity-model.js';
const ctx={render(){},go(){},pageDone(){}};
globalThis.localStorage={setItem(){}};
globalThis.document={querySelector(){return {textContent:'',classList:{add(){},remove(){}}}},getElementById(){return null}};
test('collector accounts for partial leakage and conserves the generated comparison amount',()=>{
 const p=structuredClone(targetParts);p.funnel.x=455;
 const partial=collectorTrial(p,true,20);assert.ok(partial.collected>0&&partial.collected<100);
 for(const cold of [true,false])for(const angle of [-10,0,20])for(let x=250;x<=650;x+=10){p.funnel.x=x;const r=collectorTrial(p,cold,angle);assert.ok(Math.abs(r.generated-r.collected-r.lost-r.retained)<.11);}
 const flat=collectorTrial(targetParts,true,0);assert.equal(flat.retained,100);assert.equal(flat.collected,0);
});
test('a saved trial remains independent when the live design changes',()=>{
 const p=structuredClone(targetParts),r=collectorTrial(p,true,20);p.funnel.x=600;assert.equal(r.design.parts.funnel.x,420);
});
test('both final faults are real and need a repaired design plus matching evidence',()=>{
 for(const x of [420,650])for(const fault of ['cooling','connection']){
 const parts=structuredClone(targetParts);parts.plate.x=x-190;parts.ramp.x=x-190;parts.funnel.x=x;parts.tube.x=x;parts.bucket.x=x;
 const original={parts,cold:true,angle:20},d=newDiagnosis(original,fault);
 assert.equal(collectorTrial(d.working.parts,d.working.cold,d.working.angle).ok,false);
 d.working=structuredClone(original);const good=collectorTrial(parts,true,20);assert.equal(diagnosisResolved(d,good),false);
 d.hypothesis=fault;d.evidence=fault==='cooling'?4:5;assert.equal(diagnosisResolved(d,good),true);assert.deepEqual(original.parts,parts);
 }
});
test('local wiping only removes nearby droplets and changes external water mass',()=>{
 const before=visibleDew(100),removed=wipeDroplets([],{x:120,y:155},35),after=visibleDew(100,removed);
 assert.ok(after.length>0&&after.length<before.length);assert.ok(dewMass(after)<dewMass(before));assert.equal(visibleDew(100,[],false).length,0);
 assert.ok(before.filter(p=>!removed.includes(p.id)).every(p=>after.some(a=>a.id===p.id)));
});
test('new snapshot data is copied and repeated snapshots are deduplicated',()=>{
 const q=initialInquiry(),data={level:50};addRecord(q,1,10,data,'observed');data.level=80;addRecord(q,1,10,{level:50},'again');assert.equal(q.records.length,1);assert.equal(q.records[0].data.level,50);
});
test('corrupt archive content cannot enter notebook rendering',()=>{
 const raw=initialInquiry();raw.drawArchive=[{strokes:[null],records:[null]}];raw.drawMode='invalid';raw.pourTarget='missing';
 const q=sanitizeInquiry(raw);assert.deepEqual(q.drawArchive,[]);assert.equal(q.drawMode,'live');assert.equal(q.pourTarget,'tall');
 assert.ok(!drawingSVG([[[NaN,10],[1,2]]]).includes('NaN'));
});
test('legacy save migration retains completed work and invalid diagnosis is isolated',()=>{
 const old=initialState();old.schemaVersion=1;delete old.inquiry;old.completed=[1];old.pages=[1,2];
 const migrated=readState({getItem(){return JSON.stringify(old)}});assert.equal(migrated.schemaVersion,2);assert.deepEqual(migrated.completed,[1]);
 migrated.lab.final.diagnosis={fault:'cooling',working:null,tests:[]};const repaired=readState({getItem(){return JSON.stringify(migrated)}});assert.deepEqual(repaired.completed,[1]);assert.equal(repaired.lab.final.diagnosis,undefined);
});
test('forward-only drawing time keeps all three scenes and record viewing never rewinds live time',()=>{
 Object.assign(state,initialState());state.route=5;
 for(const action of ['draw-example','draw-predict-thin','forward','forward','forward','forward','forward'])handleInquiry('ix-'+action,ctx);
 assert.deepEqual(state.activities.draw.records.map(r=>r.band),[0,1,2]);assert.equal(state.activities.draw.time,110);
 handleInquiry('ix-draw-view-0',ctx);assert.equal(state.inquiry.drawCursor,0);assert.equal(state.activities.draw.time,110);
 const html=inquiryNotebook();assert.ok(!html.includes('data-action="ix-draw-view'));
});
test('two different pipe fills are enough to compare without a hidden minimum gap',()=>{
 const a=initialState().activities;a.pipe.trials=[pipeTrial(80),pipeTrial(85)];a.pipe.chosen=0;a.pipe.marked=true;assert.equal(activityReady(4,a),true);
});

test('repeated preparation wiping cannot permanently hide future condensation',()=>{
 Object.assign(state,initialState());state.route=7;
 for(const action of ['dew-predict-air','wipe-cold','wipe-cold','wipe-room','wipe-room'])handleInquiry('ix-'+action,ctx);
 state.activities.dew.sealed=true;
 for(let j=0;j<4;j++)handleInquiry('ix-forward',ctx);handleInquiry('ix-record',ctx);
 assert.equal(state.activities.dew.records[1].cold.drops,20);assert.deepEqual(state.inquiry.dewRemoved,[]);
 handleInquiry('ix-wipe-middle',ctx);for(let j=0;j<4;j++)handleInquiry('ix-forward',ctx);handleInquiry('ix-record',ctx);assert.equal(activityReady(7,state.activities),true);
});

test('switching from a dragged classification to buttons advances to the next observation',()=>{
 Object.assign(state,initialState());state.route=2;
 const first=sortCards[0];
 for(const action of ['sort-card-'+first.id,'sort-place-'+first.type,'sort-check'])handleInquiry('ix-'+action,ctx);
 assert.equal(state.inquiry.sortProof,'');
 for(const card of sortCards.slice(1)){
  handleInquiry('ix-sort-place-'+card.type,ctx);handleInquiry('ix-sort-check',ctx);
 }
 assert.equal(Object.keys(state.activities.sort.placed).length,sortCards.length);
});
