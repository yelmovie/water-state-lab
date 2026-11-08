import test from 'node:test';
import assert from 'node:assert/strict';
import {coreTransfer} from '../src/core-transfer.js';
import {targetParts} from '../src/domain.js';
import {deviceLayout} from '../src/three-layout.js';
const device={parts:targetParts};
test('opening the valve alone cannot lift water to a higher inlet',()=>{
 const f={coreHeight:90,valve:100,connected:true};
 assert.equal(coreTransfer(f,device).canFlow,false);
 const lower=coreTransfer({...f,coreHeight:50},device);
 assert.equal(lower.downhill,true);assert.equal(lower.canFlow,true);
 assert.ok(lower.inletY>lower.sourceY);
});
test('a downhill inlet also needs an attached pipe and an open valve',()=>{
 assert.equal(coreTransfer({coreHeight:50,valve:0,connected:true},device).canFlow,false);
 assert.equal(coreTransfer({coreHeight:50,valve:100,connected:false},device).canFlow,false);
});
test('the optional 3D view preserves the core height chosen in the experiment',()=>{
 const high=deviceLayout(device,true,coreTransfer({coreHeight:90},device).inletY);
 const low=deviceLayout(device,true,coreTransfer({coreHeight:50},device).inletY);
 assert.ok(low.parts.core.y<high.parts.core.y);
 assert.ok(low.path.at(-1).y<high.path.at(-1).y);
 assert.deepEqual(low.parts.bucket,high.parts.bucket,'adjusting the inlet keeps the source water at its original height');
});
