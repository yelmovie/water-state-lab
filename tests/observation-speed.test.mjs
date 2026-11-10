import test from 'node:test';
import assert from 'node:assert/strict';
import {observationSpeed,observationRate,observationDelay,createObservationClock,PACE} from '../src/observation-speed.js';
import {initialState,readState} from '../src/state.js';

test('observation starts at the classroom pace and restores the chosen speed without changing learning records',()=>{
 const s=initialState();assert.equal(s.settings.observationPace,1);
 s.settings.observationPace=.5;s.pages=[1];s.activities.observe.pours=['tall'];
 const restored=readState({getItem:()=>JSON.stringify(s)});
 assert.equal(restored.settings.observationPace,.5);assert.deepEqual(restored.pages,[1]);assert.deepEqual(restored.activities.observe.pours,['tall']);
 for(const value of [undefined,0,-1,Infinity,'fast',.33,.25]){s.settings.observationPace=value;assert.equal(readState({getItem:()=>JSON.stringify(s)}).settings.observationPace,1);}
});
test('a save from the old speed scale starts again at the new 1× pace',()=>{
 const s=initialState();delete s.settings.observationPace;s.settings.observationSpeed=2;
 const restored=readState({getItem:()=>JSON.stringify(s)});
 assert.equal(restored.settings.observationPace,1);assert.equal('observationSpeed' in restored.settings,false);
});
test('each menu speed runs at twice the previous classroom rate',()=>{
 assert.equal(observationRate({observationPace:1}),.5);assert.equal(observationRate({observationPace:2}),1);
});
test('selected rates consistently control reading pauses and animation time',()=>{
 for(const speed of [.5,1,1.5,2]){assert.equal(observationSpeed({observationPace:speed}),speed);assert.equal(observationDelay(2000,{observationPace:speed}),2000/(speed*PACE));}
 const settings={observationPace:2},clock=createObservationClock(settings,1000);
 assert.equal(clock(2000),1000);
 settings.observationPace=1;assert.equal(clock(3000),1500);
 settings.observationPace=.5;assert.equal(clock(5000),2000,'changing speed continues from the current observation');
});
