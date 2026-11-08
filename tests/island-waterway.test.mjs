import test from 'node:test';
import assert from 'node:assert/strict';
import {islandWaterwayLayout,MILL,MILL_CUP} from '../src/three-layout.js';

test('the restored island has a continuous downhill route from the mill cup into the village water',()=>{
 const {cup,path,landing}=islandWaterwayLayout();
 const points=[cup,...path,landing];
 for(let i=1;i<points.length;i++){
  assert.ok(points[i].y<=points[i-1].y,'water must never climb toward the village');
  assert.ok(Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z)<.04,'each reach stays supported across the short gap');
 }
 assert.ok(landing.x>=.095&&landing.x<=.11&&landing.z>=.13&&landing.z<=.14,'the outlet joins the existing painted village channel');
 assert.ok(landing.y>=.0505&&landing.y<.052,'the final water touches the surveyed channel surface');
 assert.ok(cup.x>path.at(-1).x,'the water visibly travels from the detached mill toward the island');
});

test('the inlet remains attached when the mill placement changes',()=>{
 const original=islandWaterwayLayout(),moved=islandWaterwayLayout({...MILL,x:MILL.x+.01,y:MILL.y+.004});
 assert.ok(Math.abs(moved.cup.x-original.cup.x-.01)<1e-8);
 assert.ok(Math.abs(moved.cup.y-original.cup.y-.004)<1e-8);
 assert.ok(Math.abs(original.cup.y-(MILL.y+MILL_CUP.y*MILL.scale))<1e-8);
 assert.deepEqual(original.landing,moved.landing,'the village endpoint stays fixed');
});
