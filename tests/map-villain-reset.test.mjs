import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,readState} from '../src/state.js';
test('legacy map run identity is stable across reloads without modifying evidence',()=>{
 const legacy=initialState();delete legacy.mapRunId;legacy.evidence={1:{records:['same result']}};
 const storage={getItem:()=>JSON.stringify(legacy)};
 assert.equal(readState(storage).mapRunId,'legacy');assert.equal(readState(storage).mapRunId,'legacy');
 assert.deepEqual(readState(storage).evidence,legacy.evidence);
});
test('confirmed reset changes map identity even when identical evidence is earned again',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let raw=null;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>raw,setItem:(_k,v)=>{raw=v;}}});
 t.after(()=>{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;});
 const api=await import('../src/state.js?map-reset-test');const evidence={records:['same result']};
 api.state.evidence[1]=evidence;api.state.completed=[1];assert.equal(api.save(),true);
 const oldToken=api.state.mapRunId+JSON.stringify(evidence);const reset=api.captureResetToken();assert.equal(api.reset(reset),true);
 api.state.evidence[1]=evidence;api.state.completed=[1];assert.equal(api.save(),true);
 const newToken=api.state.mapRunId+JSON.stringify(evidence);assert.notEqual(newToken,oldToken);
 assert.equal(readState({getItem:()=>raw}).mapRunId,api.state.mapRunId);
});

test('the finale waits for every villain from the current completed run',async()=>{
 const {remainingMapVillains,mapVillainToken}=await import('../src/map-villains.js');
 const state=initialState();state.completed=[1,2,3,4,5];state.restored=true;
 const record={};const storage={getItem:()=>JSON.stringify(record)};
 assert.equal(remainingMapVillains(state,storage),5);
 for(let index=0;index<5;index++){
  record[index]=mapVillainToken(state,index+1);
  assert.equal(remainingMapVillains(state,storage),4-index);
 }
 state.mapRunId+='-new';assert.equal(remainingMapVillains(state,storage),5);
});

test('missing or damaged villain saves keep the finale pending',async()=>{
 const {remainingMapVillains}=await import('../src/map-villains.js');
 const state=initialState();state.completed=[1,2,3,4,5];
 for(const raw of [null,'{','[]','null'])assert.equal(remainingMapVillains(state,{getItem:()=>raw}),5);
});

test('a defeated villain remains cleared for this session when saving fails',async()=>{
 const {remainingMapVillains,mapVillainToken,recordMapVillainClear}=await import('../src/map-villains.js');
 const state=initialState();state.completed=[1,2,3,4,5];
 const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 for(let index=0;index<5;index++)assert.equal(recordMapVillainClear(index,mapVillainToken(state,index+1),storage),false);
 assert.equal(remainingMapVillains(state,storage),0);
});

test('pending finale survives reload and older saves receive a safe default',()=>{
 const legacy=initialState();delete legacy.finalePending;
 assert.equal(readState({getItem:()=>JSON.stringify(legacy)}).finalePending,false);
 const pending={...legacy,restored:true,finalePending:true};
 assert.equal(readState({getItem:()=>JSON.stringify(pending)}).finalePending,true);
});
