import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,readState} from '../src/state.js';
const storage=value=>({getItem:()=>JSON.stringify(value)});

test('previous saved records survive the addition of interactive activity state',()=>{
 const old=initialState();delete old.activities;delete old.lab.final.cooling;
 old.completed=[1];old.pages=[1,2];old.evidence[1]={records:['얼음은 옮겨도 모양이 유지됨']};
 const loaded=readState(storage(old));
 assert.deepEqual(loaded.completed,[1]);assert.deepEqual(loaded.evidence,old.evidence);
 assert.deepEqual(loaded.activities,initialState().activities);assert.equal(loaded.lab.final.cooling,false);
});
test('damaged new observation data recovers without erasing completed research',()=>{
 const s=initialState();s.completed=[1];s.pages=[1,2];s.evidence[1]={records:['관찰 기록']};
 s.activities.dew.records=[{kind:'after',cold:null,room:{}}];
 const loaded=readState(storage(s));assert.deepEqual(loaded.activities,initialState().activities);
 assert.deepEqual(loaded.evidence,s.evidence);assert.deepEqual(loaded.pages,[1,2]);
});

let sessionId=0;
async function isolatedState(t,raw=null){
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 const box={raw,writes:0,failWrite:false};
 const store={getItem(){return box.raw;},setItem(key,value){if(box.failWrite)throw Error('QuotaExceededError');box.raw=value;box.writes++;}};
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});
 t.after(()=>{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;});
 const api=await import(`../src/state.js?storage-safety=${++sessionId}`);
 return {api,box};
}

test('invalid, incomplete and future records survive repeated autosaves unchanged',async t=>{
 const invalid=['{bad','null',JSON.stringify({schemaVersion:999}),JSON.stringify({...initialState(),lab:{workshop:{parts:{}}}})];
 const damaged=initialState();damaged.activities.dew.records=[{kind:'after',cold:null,room:{}}];invalid.push(JSON.stringify(damaged));
 const brokenInquiry=initialState();brokenInquiry.inquiry.drawArchive=[{strokes:'broken',records:[]}];invalid.push(JSON.stringify(brokenInquiry));
 const brokenField=initialState();brokenField.fieldwork.chapters={1:{marks:'broken'}};invalid.push(JSON.stringify(brokenField));
 for(const raw of invalid){
  const {api,box}=await isolatedState(t,raw);
  api.state.route='map';assert.equal(api.save(),false);assert.equal(api.save(),false);
  assert.equal(box.raw,raw);assert.equal(box.writes,0);assert.ok(['damaged','unsupported'].includes(api.getStorageStatus().code));
 }
});

test('missing save starts normally while blocked reads protect in-memory work',async t=>{
 const {api,box}=await isolatedState(t);
 api.state.lab.draw.strokes=[[[2,4],[6,8]]];assert.equal(api.save(),true);assert.equal(box.writes,1);
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('SecurityError');}});
 const blocked=await import(`../src/state.js?storage-safety=${++sessionId}`);
 assert.equal(blocked.save(),false);assert.equal(blocked.getStorageStatus().code,'unavailable');
 Object.defineProperty(globalThis,'localStorage',previous);
});

test('a failed write or reset keeps the last saved record and current state intact',async t=>{
 const original=initialState();original.completed=[1];original.evidence[1]={records:['한글 관찰 기록']};
 const raw=JSON.stringify(original),{api,box}=await isolatedState(t,raw);
 api.state.route='map';const current=api.state,token=api.captureResetToken();box.failWrite=true;
 assert.equal(api.save(),false);assert.equal(api.getStorageStatus().code,'full');assert.equal(box.raw,raw);
 assert.equal(api.reset(token),false);assert.equal(api.state,current);assert.equal(box.raw,raw);
 box.failWrite=false;assert.equal(api.save(),true);assert.equal(JSON.parse(box.raw).route,'map');
});

test('another tab blocks automatic saves and stale reset confirmations',async t=>{
 const raw=JSON.stringify(initialState()),{api,box}=await isolatedState(t,raw);
 const token=api.captureResetToken();const other=initialState();other.pages=[1];other.lab.draw.strokes=[[[1,2],[3,4]]];box.raw=JSON.stringify(other);const changed=box.raw;
 assert.equal(api.save(),false);assert.equal(api.reset(token),false);assert.equal(box.raw,changed);assert.equal(api.getStorageStatus().code,'conflict');assert.equal(api.captureResetToken(),null);
});

test('confirmed reset preserves audio and accessibility settings and cannot run during preview',async t=>{
 const original=initialState();original.completed=[1];Object.assign(original.settings,{bgm:true,bgmVolume:55,reduced:true});
 const {api,box}=await isolatedState(t,JSON.stringify(original));
 api.state.settings.adminUnlock=true;api.setPreviewMode(true);api.state.completed=[1,2,3];
 assert.equal(api.captureResetToken(),null);assert.equal(api.reset({}),false);assert.equal(JSON.parse(box.raw).completed.length,1);
 api.state.settings.adminUnlock=false;api.setPreviewMode(false);
 const token=api.captureResetToken();assert.equal(api.reset(token),true);
 assert.deepEqual(api.state.completed,[]);assert.equal(api.state.settings.bgm,true);assert.equal(api.state.settings.bgmVolume,55);assert.equal(api.state.settings.reduced,true);assert.equal(api.reset(token),false);
});
