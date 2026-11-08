import test from 'node:test';
import assert from 'node:assert/strict';
import {observationSpeed,observationDelay,createObservationClock} from '../src/observation-speed.js';
import {initialState,readState} from '../src/state.js';

test('observation starts slower and restores the chosen speed without changing learning records',()=>{
 const s=initialState();assert.equal(s.settings.observationSpeed,.5);
 s.settings.observationSpeed=.25;s.pages=[1];s.activities.observe.pours=['tall'];
 const restored=readState({getItem:()=>JSON.stringify(s)});
 assert.equal(restored.settings.observationSpeed,.25);assert.deepEqual(restored.pages,[1]);assert.deepEqual(restored.activities.observe.pours,['tall']);
 for(const value of [undefined,0,-1,Infinity,'fast',.33]){s.settings.observationSpeed=value;assert.equal(readState({getItem:()=>JSON.stringify(s)}).settings.observationSpeed,.5);}
});
test('selected rates consistently control reading pauses and animation time',()=>{
 for(const speed of [.25,.5,1,2]){assert.equal(observationSpeed({observationSpeed:speed}),speed);assert.equal(observationDelay(2000,{observationSpeed:speed}),2000/speed);}
 const settings={observationSpeed:.5},clock=createObservationClock(settings,1000);
 assert.equal(clock(2000),500);
 settings.observationSpeed=.25;assert.equal(clock(3000),750);
 settings.observationSpeed=2;assert.equal(clock(3500),1750,'changing speed continues from the current observation');
});
