import test from 'node:test';
import assert from 'node:assert/strict';
import {returnedResidents,nextGreeting} from '../src/island-residents.js';
import {initialState,readState} from '../src/state.js';

test('each completed stage brings back one resident, with separate workshop and greenhouse milestones',()=>{
 const s=initialState();
 s.settings.adminUnlock=true;
 assert.equal(returnedResidents(s).length,0);
 for(let n=1;n<10;n++){
  s.pages.push(n);
  if(n%2===0||n===9)s.completed.push(Math.ceil(n/2));
  assert.equal(returnedResidents(s).length,n);
  assert.equal(nextGreeting(s).stage,n);
 }
 s.pages.push(10);
 assert.equal(returnedResidents(s).length,9);
 s.restored=true;
 assert.equal(returnedResidents(s).length,10);
 s.residentsMet=[10];
 assert.equal(nextGreeting(s).stage,9);
});

test('legacy area records restore residents while an individual demo stage stays independent',()=>{
 const original=initialState();
 delete original.residentsMet;
 original.completed=[1,5];
 const s=readState({getItem:()=>JSON.stringify(original)});
 assert.deepEqual(s.residentsMet,[]);
 assert.deepEqual(returnedResidents(s).map(r=>r.stage),[1,2,9]);
 s.completed=[1];s.pages=[2];s.settings.adminUnlock=true;
 assert.deepEqual(returnedResidents(s).map(r=>r.stage),[2]);
});
