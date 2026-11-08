import test from 'node:test';
import assert from 'node:assert/strict';
import {funnelSeat,rampTilt} from '../src/workshop-controls.js';
import {workshopView,handleWorkshop} from '../src/workshop.js';
import {state,initialState} from '../src/state.js';
import {targetParts,testCollector,defaultParts,currentTrialValid} from '../src/domain.js';
import {workshopProgress} from '../src/journey.js';

globalThis.document??={addEventListener(){},querySelector(){return null;},getElementById(){return null;}};
const ctx={render(){},go(route){this.route=route;},pageDone(){}};
const fresh=()=>{Object.assign(state,initialState());return state.lab.workshop;};
const run=s=>handleWorkshop('test-workshop',ctx);

test('the seat a child aims for is the model\'s working design',()=>{
 assert.deepEqual(funnelSeat(targetParts.ramp),targetParts.funnel);
 assert.equal(testCollector(targetParts,true,rampTilt).ok,true);
});
test('stage 9 starts with only the ramp and funnel to fix',()=>{
 const start=defaultParts();
 for(const key of ['plate','ramp','tube','bucket'])assert.deepEqual(start[key],targetParts[key]);
 assert.notDeepEqual(start.funnel,targetParts.funnel);
});
test('each failed run names its physical reason, and three fixes finish the stage',()=>{
 const s=fresh();
 assert.match(workshopView(),/판이 차갑지 않으면/);
 handleWorkshop('toggle-cold',ctx);run();
 assert.match(workshopView(),/평평해서/);assert.equal(currentTrialValid(s),false);
 handleWorkshop('ramp-tilt',ctx);run();
 assert.match(workshopView(),/어긋나서/);assert.equal(currentTrialValid(s),false);
 handleWorkshop('funnel-fix',ctx);run();
 assert.match(workshopView(),/아래로 흘러 물통에 모였어/);assert.equal(currentTrialValid(s),true);
 assert.equal(workshopProgress(9).steps.every(step=>step.done),true);
});
test('finishing stage 9 records a design stage 10 can repair',()=>{
 const s=fresh();
 for(const action of ['toggle-cold','test-workshop','ramp-tilt','test-workshop','funnel-fix','test-workshop'])handleWorkshop(action,ctx);
 handleWorkshop('complete-5',ctx);
 assert.equal(ctx.route,10);assert.deepEqual(state.evidence[5].parts,targetParts);assert.equal(state.evidence[5].result.ok,true);
 assert.ok(s.trials.length>=3);
});
test('autoplay walks the three fixes and leaves leaving the stage to the child',async()=>{
 globalThis.document??={addEventListener(){},querySelector(){return null;},getElementById(){return null;}};
 const {observationStep}=await import('../src/observation-play.js');
 const s=fresh(),seen=[];
 for(let i=0;i<5;i++){const step=observationStep(9,state);if(!step)break;seen.push(step);handleWorkshop(step,ctx);handleWorkshop('test-workshop',ctx);}
 assert.deepEqual(seen,['toggle-cold','ramp-tilt','funnel-fix']);
 assert.equal(currentTrialValid(s),true);
});
test('moving a part after a good run asks for a new run',()=>{
 const s=fresh();
 for(const action of ['toggle-cold','test-workshop','ramp-tilt','funnel-fix','test-workshop'])handleWorkshop(action,ctx);
 handleWorkshop('ramp-tilt',ctx);
 assert.equal(currentTrialValid(s),false);
});

test('fast edits retain the initial condition and can finish after the first successful run',()=>{
 const s=fresh();
 for(const action of ['toggle-cold','ramp-tilt','funnel-fix','test-workshop'])handleWorkshop(action,ctx);
 assert.equal(s.trials[0].source,'initial-model');
 assert.equal(s.trials[0].design.cold,false);
 assert.equal(currentTrialValid(s),true);
 assert.equal(s.trials.length,2);
});
