import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../src/state.js';
import {waterHeight,vesselGeometry,pourInto,islandRoute,islandStops,islandLanding,islandWalkTo,walkIslandStep,nearbyMapActions,pointOnRoute,discoveryStars} from '../src/scene-model.js';

test('equal amounts occupy equal cross-section area in different vessels',()=>{
 const {tall,wide}=vesselGeometry;
 assert.ok(waterHeight(100,tall.width)>waterHeight(100,wide.width));
 assert.equal(waterHeight(100,tall.width)*tall.width,waterHeight(100,wide.width)*wide.width);
 assert.equal(waterHeight(-10,tall.width),0);
 assert.equal(waterHeight(150,tall.width),waterHeight(100,tall.width));
});

test('partial pours persist without awarding an observation until the vessel is full',()=>{
 const s=initialState(),q=s.inquiry,o=s.activities.observe;
 assert.equal(pourInto(q,o,'tall',40),false);
 assert.deepEqual(o.pours,[]);
 assert.equal(q.pours.tall,40);
 assert.equal(pourInto(q,o,'tall',80),true);
 pourInto(q,o,'tall',10);
 assert.deepEqual(o.pours,['tall']);
 assert.equal(q.pours.tall,100);
 assert.equal(q.pours.wide,0);
 assert.equal(pourInto(q,o,'missing',100),false);
});

test('island travel reaches each destination in either direction along connected paths',()=>{
 for(let from=0;from<5;from++)for(let to=0;to<5;to++){
  if(from===to)continue;
  const route=islandRoute(from,to);
  assert.deepEqual(pointOnRoute(route,0),islandStops[from]);
  const end=pointOnRoute(route,1);
  assert.ok(Math.hypot(end[0]-islandStops[to][0],end[1]-islandStops[to][1])<1e-8);
  assert.ok(route.every(p=>p.every(Number.isFinite)));
 }
});

test('choosing a stop after steering starts at the current feet and joins a nearby path',()=>{
 const feet=[768,313];
 for(let to=0;to<islandStops.length;to++){
  const path=islandWalkTo(feet,to);
  assert.deepEqual(path[0],feet);
  assert.ok(Math.hypot(path[1][0]-feet[0],path[1][1]-feet[1])<3);
  assert.deepEqual(path.at(-1),islandStops[to]);
 }
 assert.deepEqual(islandWalkTo(islandLanding,0).at(-1),islandStops[0]);
});

test('steering moves along the painted bridge and cannot leave its shoreline',()=>{
 let feet=islandLanding;
 for(let i=0;i<18;i++)feet=walkIslandStep(feet,-4,0);
 assert.ok(feet[0]<islandLanding[0]-55);
 for(let i=0;i<85;i++)feet=walkIslandStep(feet,0,4);
 assert.ok(feet[1]<370);
});
test('nearby actions use character feet and order overlapping choices by distance',()=>{
 const npc={feet:[10,10]},gate={feet:[35,10]},far={feet:[100,10]};
 assert.deepEqual(nearbyMapActions([12,10],[gate,npc,far]),[npc,gate]);
 assert.deepEqual(nearbyMapActions([32,10],[gate,npc,far]),[gate,npc]);
 assert.deepEqual(nearbyMapActions([150,60],[gate,npc,far]),[]);
});
test('discovery stars track the learner observations and survive a state round trip',()=>{
 const s=initialState();
 for(let m=1;m<=5;m++)assert.deepEqual(discoveryStars(m,s),[false,false,false]);
 s.activities.observe.pours=['tall','wide'];s.activities.observe.iceMoved=true;
 s.activities.observe.records=[{kind:'cloth',time:100}];
 assert.deepEqual(discoveryStars(1,JSON.parse(JSON.stringify(s))),[true,true,true]);
 assert.deepEqual(discoveryStars(2,s),[false,false,false]);
});
