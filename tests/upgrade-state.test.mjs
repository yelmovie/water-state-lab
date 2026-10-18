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
