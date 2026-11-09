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
