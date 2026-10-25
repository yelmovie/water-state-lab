import test from 'node:test';
import assert from 'node:assert/strict';
import {partPosition,movePart} from '../src/workshop-controls.js';
import {workshopView} from '../src/workshop.js';
import {state,initialState} from '../src/state.js';
import {targetParts,testCollector} from '../src/domain.js';
import {workshopProgress} from '../src/journey.js';

test('overlapping parts move independently through the same pointer and button grid',()=>{
 for(const key of ['plate','ramp','funnel']){
  const parts=Object.fromEntries(['plate','ramp','funnel','tube','bucket'].map(k=>[k,{x:230,y:170}]));
  const before=structuredClone(parts);movePart(parts,key,10,0);movePart(parts,key,0,10);
  assert.deepEqual(parts[key],partPosition(key,240,180));
  for(const other of Object.keys(parts).filter(k=>k!==key))assert.deepEqual(parts[other],before[other]);
 }
 assert.deepEqual(partPosition('plate',13,21),{x:60,y:60});
 assert.deepEqual(partPosition('ramp',900,500),{x:480,y:390});
});

test('equal collection is described without assuming improvement',()=>{
 Object.assign(state,initialState());const s=state.lab.workshop;
 s.parts=structuredClone(targetParts);s.cold=true;s.angle=25;
 s.trials=[testCollector(targetParts,false,20),testCollector(targetParts,true,20),testCollector(targetParts,true,25)];s.compare=true;
 const html=workshopView();assert.match(html,/모은 물은 같았어/);assert.match(html,/결과와 별개로/);
 assert.match(html,/essential-controls.*open/);
});

test('editing after comparison names the remaining trial instead of claiming completion',()=>{
 Object.assign(state,initialState());const s=state.lab.workshop;
 Object.assign(s,{parts:structuredClone(targetParts),cold:true,angle:25,trials:[testCollector(targetParts,true,20),testCollector(targetParts,true,25)]});
 state.inquiry.workshopCompared=s.trials.at(-1).signature;state.inquiry.workshopReason='angle';
 assert.equal(workshopProgress(9).steps[2].done,true);
 movePart(s.parts,'bucket',10,0);
 assert.equal(workshopProgress(9).steps[2].done,false);assert.match(workshopProgress(9).instruction,/다시 시험/);
});
