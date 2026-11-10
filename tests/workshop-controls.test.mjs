import test from 'node:test';
import assert from 'node:assert/strict';
import {funnelSeat,rampTilt} from '../src/workshop-controls.js';
import {workshopView,handleWorkshop,finalView} from '../src/workshop.js';
import {state,initialState} from '../src/state.js';
import {targetParts,testCollector,defaultParts,currentTrialValid} from '../src/domain.js';
import {workshopProgress} from '../src/journey.js';
import {newDiagnosis} from '../src/collector-model.js';

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

test('core height buttons and valve controls invalidate a previous flow and respect bounds',()=>{
 fresh();
 for(const action of ['toggle-cold','ramp-tilt','funnel-fix','test-workshop','complete-5'])handleWorkshop(action,ctx);
 finalView();
 const f=state.lab.final;
 handleWorkshop('core-lower',ctx);
 assert.equal(f.coreHeight,90,'connect and repair before adjusting the core');
 f.connected=true;f.diagnosis.resolved=true;f.tested=true;f.lever=100;
 handleWorkshop('core-lower',ctx);
 assert.equal(f.coreHeight,80);assert.equal(f.tested,false);assert.equal(f.lever,0);
 for(let i=0;i<12;i++)handleWorkshop('core-lower',ctx);
 assert.equal(f.coreHeight,25);
 for(let i=0;i<12;i++)handleWorkshop('core-raise',ctx);
 assert.equal(f.coreHeight,95);
 f.tested=true;f.lever=100;handleWorkshop('core-open-valve',ctx);
 assert.equal(f.valve,100);assert.equal(f.tested,false);assert.equal(f.lever,0);
 handleWorkshop('core-close-valve',ctx);assert.equal(f.valve,0);
});

test('choosing the cause after a successful repair unlocks the visible core connection',()=>{
 for(const fault of ['cooling','connection']){
  fresh();state.settings.sound=false;
  const design={parts:structuredClone(targetParts),cold:true,angle:20,result:testCollector(targetParts,true,20)};
  state.evidence[5]=design;
  const d=newDiagnosis(design,fault);state.lab.final.diagnosis=d;
  handleWorkshop('diagnosis-test',ctx);
  handleWorkshop('diagnose-'+(fault==='cooling'?'connection':'cooling'),ctx);
  handleWorkshop(fault==='cooling'?'core-cooling':'core-funnel',ctx);
  handleWorkshop('diagnosis-test',ctx);
  assert.equal(d.resolved,false);
  assert.match(finalView(),/class="core-connect-step"/);
  handleWorkshop('diagnose-'+fault,ctx);
  assert.equal(d.resolved,true,'the existing successful trial confirms the corrected cause');
  handleWorkshop('connect-core',ctx);
  assert.equal(state.lab.final.connected,true);
  d.working.angle=0;
  handleWorkshop('diagnose-'+fault,ctx);
  assert.equal(d.resolved,false,'a stale successful trial cannot approve a changed device');
 }
});

test('the required water-path test stays outside the optional details',()=>{
 fresh();const html=workshopView(),test=html.indexOf('data-action="test-workshop"');
 assert.ok(test>0);assert.ok(test<html.indexOf('<details>'));
});
