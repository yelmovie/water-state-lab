import test from 'node:test';
import assert from 'node:assert/strict';
import {deviceLayout,pointAlong,RAMP,orbitDistance} from '../src/three-layout.js';
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

test('the core connector shares the water path and follows the chosen inlet height',()=>{
 for(const inlet of [244,272,300]){
  const layout=deviceLayout({parts:targetParts},true,inlet);
  assert.deepEqual(layout.corePipe,layout.path.slice(-2));
  near(layout.corePipe[0].x,layout.parts.bucket.x);
  near(layout.corePipe[1].x,layout.parts.core.x-.04);
  near(layout.corePipe[1].y,layout.parts.core.y+.027);
 }
 const disconnected=deviceLayout({parts:targetParts},true,272,false);
 assert.ok(disconnected.parts.core);
 assert.deepEqual(disconnected.corePipe,[]);
 assert.equal(disconnected.path.length,6);
 assert.deepEqual(deviceLayout({parts:targetParts}).corePipe,[]);
});


test('the rotating model fits at every yaw, pitch and viewport aspect',async()=>{
 const THREE=await import('../public/assets/vendor/three/three.module.min.js');
 for(const size of [{x:.65,y:.32,z:.16},{x:.7,y:.21,z:.6}]){
  for(const aspect of [.5,1,1.8,3]){
   const camera=new THREE.PerspectiveCamera(30,aspect,.005,20);
   const distance=orbitDistance(size,aspect,camera.fov);
   for(let yaw=0;yaw<Math.PI*2;yaw+=.15)for(const pitch of [-.05,.32,.7,1.1]){
    camera.position.set(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,Math.cos(yaw)*Math.cos(pitch)*distance);
    camera.lookAt(0,0,0);camera.updateMatrixWorld();
    for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
     const p=new THREE.Vector3(x*size.x/2,y*size.y/2,z*size.z/2).project(camera);
     assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1&&p.z>-1&&p.z<1,`clipped at aspect ${aspect}, yaw ${yaw}, pitch ${pitch}`);
    }
   }
  }
 }
});
