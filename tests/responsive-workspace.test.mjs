import test from 'node:test';
import assert from 'node:assert/strict';
import {finalView,finalContext,resetFinalPreview,handleWorkshop} from '../src/workshop.js';
import {state,initialState} from '../src/state.js';
import {newDiagnosis} from '../src/collector-model.js';
import {drawDewBead} from '../src/study-materials.js';
globalThis.document??={addEventListener(){},querySelector(){return null;},getElementById(){return null;}};
const ctx={render(){}};
for(const fault of ['cooling','connection'])test(`core controls remain in their primary panel through ${fault} repair`,()=>{
 Object.assign(state,initialState());state.route=10;state.settings.adminUnlock=true;resetFinalPreview();
 const {progress:f,design}=finalContext();f.diagnosis=newDiagnosis(design,fault);
 handleWorkshop('diagnosis-test',ctx);handleWorkshop('diagnose-'+fault,ctx);handleWorkshop(fault==='cooling'?'core-cooling':'core-funnel',ctx);handleWorkshop('diagnosis-test',ctx);
 assert.equal(f.diagnosis.resolved,true);const before=finalView();assert.match(before,/control-panel core-control-panel/);assert.match(before,/data-action="connect-core"/);
 handleWorkshop('connect-core',ctx);const connected=finalView();assert.match(connected,/class="core-flow-controls"/);assert.match(connected,/id="core-inlet-height"/);assert.match(connected,/data-action="core-open-valve"/);assert.match(connected,/data-action="test-core"/);
 f.coreHeight=25;handleWorkshop('core-toggle-valve',ctx);handleWorkshop('test-core',ctx);assert.equal(f.tested,true);assert.match(finalView(),/data-action="core-activate"/);
});
test('condensation beads draw a filled, shaded liquid body and highlight',()=>{
 const calls=[],ctx={save(){},restore(){},createRadialGradient(){return {addColorStop(){}};},beginPath(){},ellipse(...args){calls.push(args);},fill(){},stroke(){}};
 drawDewBead(ctx,100,120,8);assert.equal(calls.length,2);assert.equal(calls[0][3],8);assert.ok(calls[0][2]>=6);assert.ok(ctx.fillStyle);
});
