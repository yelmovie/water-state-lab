import test from 'node:test';
import assert from 'node:assert/strict';
import {residents,residentForStage,returnedResidents,nextGreeting,villageFriend} from '../src/island-residents.js';
import {initialState,readState} from '../src/state.js';

test('each building has one resident and related stages share that guide',()=>{
 assert.deepEqual(residents.map(r=>r.stage),[2,4,6,8,10]);
 for(let n=1;n<=10;n+=2)assert.equal(residentForStage(n),residentForStage(n+1));
 const s=initialState();
 s.settings.adminUnlock=true;
 assert.equal(returnedResidents(s).length,0);
 for(let n=1;n<10;n++){
  s.pages.push(n);
  if(n%2===0||n===9)s.completed.push(Math.ceil(n/2));
  assert.equal(returnedResidents(s).length,Math.floor(n/2));
  if(n>=2)assert.equal(nextGreeting(s).stage,Math.floor(n/2)*2);
 }
 s.pages.push(10);
 assert.equal(returnedResidents(s).length,4);
 s.restored=true;
 assert.equal(returnedResidents(s).length,5);
 s.residentsMet=[10];
 assert.equal(nextGreeting(s).stage,8);
 s.residentsMet=[1,3,5,7,9];assert.equal(villageFriend(s),true,'old greetings count for their building without duplicating NPCs');
});

test('legacy area records restore residents while an individual demo stage stays independent',()=>{
 const original=initialState();
 delete original.residentsMet;
 original.completed=[1,5];
 const s=readState({getItem:()=>JSON.stringify(original)});
 assert.deepEqual(s.residentsMet,[]);
 assert.deepEqual(returnedResidents(s).map(r=>r.stage),[2]);
 s.completed=[1];s.pages=[2];s.settings.adminUnlock=true;
 assert.deepEqual(returnedResidents(s).map(r=>r.stage),[2]);
});

test('the map has five building entries and keeps its guides inside those buildings',async()=>{
 globalThis.matchMedia=()=>({matches:true});
 const {state}=await import('../src/state.js'),{journeyView}=await import('../src/journey.js');
 Object.assign(state,initialState());state.settings.adminUnlock=true;state.completed=[1,2,3,4,5];state.pages=[1,2,3,4,5,6,7,8,9,10];state.restored=true;state.villageArrivals=[10];
 const html=journeyView();
 assert.equal((html.match(/class="journey-node /g)||[]).length,5);
 assert.doesNotMatch(html,/class="island-resident/);
 assert.doesNotMatch(html,/data-action="resident-talk-/);
 assert.doesNotMatch(html,/\d장 복구/);
 for(const r of residents)assert.ok(html.includes('담당 '+r.name),r.name+' belongs to one building');
 Object.assign(state,initialState());
});
