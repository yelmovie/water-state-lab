import test from 'node:test';
import assert from 'node:assert/strict';
import {deviceLayout,pointAlong,RAMP} from '../src/three-layout.js';
import {targetParts} from '../src/domain.js';

const near=(a,b,eps=1e-6)=>assert.ok(Math.abs(a-b)<eps,`${a} ≉ ${b}`);

test('2D workshop pixels become millimetres in the 3D view, screen-down is world-down',()=>{
 const {parts}=deviceLayout({parts:targetParts,cold:true,angle:20});
 // Plate centre (230, 70·0.64+10) on the 720×330 stage; the model sits on its bottom origin.
 near(parts.plate.x,(230-360)/1000);near(parts.plate.y,(330-54.8)/1000-.035);
 assert.ok(parts.bucket.y<parts.tube.y&&parts.tube.y<parts.funnel.y,'lower parts on screen are lower in 3D');
 assert.ok(parts.ramp.rotation<0,'a positive slope tilts the ramp down to the right');
 near(parts.ramp.scale,RAMP.length/RAMP.model);
});

test('water path follows the parts and reaches the core only in the final view',()=>{
 const nine=deviceLayout({parts:targetParts,cold:true,angle:20}),ten=deviceLayout({parts:targetParts,cold:true,angle:20},true);
 assert.equal(nine.path.length,6);assert.equal(ten.path.length,7);assert.ok(ten.parts.core&&!nine.parts.core);
 assert.deepEqual(pointAlong(ten.path,0),ten.path[0]);assert.deepEqual(pointAlong(ten.path,1),ten.path.at(-1));
 const mid=pointAlong([{x:0,y:0},{x:1,y:0},{x:1,y:1}],.5);near(mid.x,1);near(mid.y,0);
 assert.equal(deviceLayout({parts:targetParts,cold:false,angle:0}).parts.ramp.rotation,-0);
});
