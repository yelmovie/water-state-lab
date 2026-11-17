import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshAdventure,adventureMove,expeditions} from '../src/drop-adventure-model.js';
import {RUN,RUN_ACTIONS,runMove,runHint,adventureMode,buildCourse,createRunner,stepRunner,runZone,groundBelow,beginTransit,bounce} from '../src/run-stage-model.js';
import {initialState,readState} from '../src/state.js';

const rank={ice:0,water:1,vapor:2};
/** What the learner still has to do before the current gate, in stage terms. */
function nextJob(adventure){
 const gate=expeditions[adventure.chapter].gates[adventure.gate];
 if(adventure.phase===gate.phase)return 'gate';
 const kind=rank[gate.phase]>rank[adventure.phase]?'heat':'cool';
 return kind==='cool'&&adventure.phase==='water'&&gate.space&&!adventure.space?'valve':kind;
}
/** Plays one expedition with the stage physics, the way a child would with the buttons. */
function play(chapter,{limit=240}={}){
 let adventure=freshAdventure(chapter);
 const course=buildCourse(chapter),r=createRunner(course,adventure),dt=1/60,seen={jump:0,fell:0,flinch:0,blocked:0};
 let time=0,wait=0,push=0;
 while(!adventure.done||r.transit){
  if((time+=dt)>limit)assert.fail(`expedition ${chapter+1} was not finished in ${limit}s at x=${r.x.toFixed(1)} gate ${adventure.gate}`);
  const input={x:0,z:0,jump:false};
  if(!r.transit&&!adventure.done){
   const seg=course.segments[adventure.gate],job=nextJob(adventure),zone=runZone(course,r);
   const target=job==='gate'?{x:seg.gateX+1,z:r.z}:job==='valve'?seg.valve:seg.pads[job];
   wait-=dt;
   if(job!=='gate'&&zone?.kind===job&&zone.segment===seg.index){if(wait<=0){adventure=runMove(adventure,job).state;wait=.3;}}
   else{
    const lane=course.lanes.find(l=>r.x>l.x0&&r.x<l.x1),depth=lane?lane.z:target.z,aligned=Math.abs(depth-r.z)<.3;
    if(!aligned)input.z=Math.sign(depth-r.z);
    if(!lane||aligned)input.x=Math.abs(target.x-r.x)>.2?Math.sign(target.x-r.x):0;
    push=input.x>0&&Math.abs(r.vx)<.5?push+dt:0;
    const ahead=groundBelow(course,r.x+RUN.halfW+.3,r.z,r.y);
    if(input.x>0&&r.grounded&&(ahead<r.y-.3||push>.12))input.jump=true;
   }
  }
  for(const event of stepRunner(r,course,adventure,input,dt)){
   if(event.type in seen)seen[event.type]++;
   if(event.type==='gate'){
    const move=runMove(adventure,'gate');adventure=move.state;
    if(move.passed)beginTransit(r,course.segments[event.segment]);else{bounce(r);seen.blocked++;}
   }
  }
 }
 return {adventure,course,r,seen,time};
}

test('stage events use only the four existing adventure actions',()=>{
 assert.deepEqual(Object.values(RUN_ACTIONS).sort(),['cool','move','space','warm']);
 const start=freshAdventure(0),ignored=runMove(start,'fly');
 assert.deepEqual(ignored.state,start);assert.equal(ignored.action,null);
 for(const [kind,action] of Object.entries(RUN_ACTIONS))assert.deepEqual(runMove(start,kind).state,adventureMove(start,action),kind);
});

test('a gate reached in the wrong form stops the runner and keeps the model hint',()=>{
 const start=freshAdventure(0),move=runMove(start,'gate');
 assert.equal(move.blocked,true);assert.equal(move.passed,false);
 assert.equal(move.state.gate,0);assert.equal(move.state.mistakes,1);assert.equal(move.state.message,expeditions[0].gates[0].hint);
 let s=runMove(runMove(start,'heat').state,'heat');
 assert.equal(s.phaseChanged,true);assert.equal(s.state.phase,'water');
 s=runMove(s.state,'gate');
 assert.equal(s.passed,true);assert.deepEqual(s.state.log,[expeditions[0].gates[0].proof]);
});

test('freezing in the full pipe still needs the valve first',()=>{
 let s=freshAdventure(1);
 s=runMove(runMove(s,'cool').state,'cool').state;
 assert.equal(s.phase,'water');assert.equal(s.mistakes,1);
 s=runMove(s,'valve').state;assert.equal(s.space,true);
 s=runMove(runMove(s,'cool').state,'cool').state;assert.equal(s.phase,'ice');
 assert.equal(runMove(s,'gate').passed,true);
});

test('every gate has a station with both plates, and a valve only where the model asks for room',()=>{
 for(let chapter=0;chapter<expeditions.length;chapter++){
  const course=buildCourse(chapter),gates=expeditions[chapter].gates;
  assert.equal(course.segments.length,gates.length);
  course.segments.forEach((seg,i)=>{
   assert.equal(seg.gate,gates[i]);
   assert.ok(seg.pads.heat&&seg.pads.cool);
   assert.equal(!!seg.valve,!!gates[i].space,gates[i].name);
   assert.ok(seg.checkpoint.x<seg.station.x&&seg.station.x<seg.pads.heat.x&&seg.pads.heat.x<seg.gateX);
   for(const point of [seg.checkpoint,seg.station,{...seg.pads.heat,y:seg.level},{...seg.pads.cool,y:seg.level}])assert.equal(groundBelow(course,point.x,point.z),seg.level,'stands on the path');
   assert.equal(groundBelow(course,seg.exit.x,seg.exit.z),seg.exit.y,'the ride ends on the next platform');
  });
  assert.ok(course.minY>=0);assert.equal(groundBelow(course,course.finish.x,0),course.finish.y);
 }
});

test('gaps and steps fit the one jump every form shares',()=>{
 const air=2*RUN.jump/RUN.gravity,reach=RUN.speed*air+2*RUN.halfW,height=RUN.jump**2/(2*RUN.gravity);
 for(let chapter=0;chapter<expeditions.length;chapter++){
  const course=buildCourse(chapter);
  for(const b of course.boxes)if(b.kind==='step')assert.ok(b.y1-b.y0<=.9+1e-9&&b.y1-b.y0<height*.6);
  for(const seg of course.segments){
   // Between the checkpoint and the gate, any break in the path at the walking depth is jumpable with room to spare.
   let gap=0;
   for(let x=seg.checkpoint.x;x<seg.gateX;x+=.1){
    const depth=course.lanes.find(l=>x>l.x0&&x<l.x1)?.z??0;
    if(groundBelow(course,x,depth)===-Infinity)gap+=.1;else{assert.ok(gap<reach*.7,`gap of ${gap.toFixed(1)} at ${x.toFixed(1)}`);gap=0;}
   }
  }
  assert.ok(RUN.deviceSpan>reach,'a device cannot be jumped across without the model');
 }
});

test('the runner stands, is stopped by a closed gate once, and falling only returns to the checkpoint',()=>{
 const adventure=freshAdventure(0),course=buildCourse(0),r=createRunner(course,adventure);
 for(let i=0;i<30;i++)stepRunner(r,course,adventure,{x:0,z:0},1/60);
 assert.equal(r.y,course.segments[0].level);assert.equal(r.grounded,true);
 r.x=course.segments[0].gateX-1;const events=[];
 for(let i=0;i<90;i++)events.push(...stepRunner(r,course,adventure,{x:1,z:0},1/60));
 assert.equal(events.filter(e=>e.type==='gate').length,1);
 assert.ok(r.x<=course.segments[0].gateX-RUN.halfW+1e-6);
 const before=structuredClone(adventure);
 r.x=course.segments[0].gateX+2;r.y=course.segments[0].level;r.armed=true;const fall=[];
 for(let i=0;i<240&&!fall.some(e=>e.type==='fell');i++)fall.push(...stepRunner(r,course,adventure,{x:0,z:0},1/60));
 assert.ok(fall.some(e=>e.type==='fell'));
 assert.deepEqual({x:r.x,y:r.y},{x:r.checkpoint.x,y:r.checkpoint.y});
 assert.deepEqual(adventure,before,'no lives, no penalty, no record change');
});

test('ice, water and vapour move with the same speed and jump',()=>{
 const course=buildCourse(0),paths={};
 for(const phase of ['ice','water','vapor']){
  const adventure={...freshAdventure(0),phase},r=createRunner(course,adventure);paths[phase]=[];
  for(let i=0;i<120;i++){stepRunner(r,course,adventure,{x:1,z:i%40<10?1:0,jump:i===20||i===70},1/60);paths[phase].push([r.x,r.y,r.z]);}
 }
 assert.deepEqual(paths.ice,paths.water);assert.deepEqual(paths.water,paths.vapor);
});

test('all five expeditions can be run to the end and leave the same record as the existing screen',()=>{
 for(let chapter=0;chapter<expeditions.length;chapter++){
  const {adventure,course,r,time}=play(chapter);
  assert.equal(adventure.done,true);assert.equal(adventure.gate,expeditions[chapter].gates.length);
  assert.deepEqual(adventure.log,expeditions[chapter].gates.map(g=>g.proof));
  assert.deepEqual(Object.keys(adventure).sort(),Object.keys(freshAdventure(chapter)).sort(),'no new saved fields');
  assert.deepEqual({x:r.x,y:r.y},{x:course.finish.x,y:course.finish.y});
  assert.ok(time>8&&time<150,`expedition ${chapter+1} took ${time.toFixed(0)}s for the test runner`);
  const state=initialState();state.route='adventure';state.dropAdventure=adventure;
  const loaded=readState({getItem:()=>JSON.stringify(state)});
  assert.deepEqual(loaded.dropAdventure,adventure);
  assert.equal(adventureMove(loaded.dropAdventure,'next').chapter,(chapter+1)%expeditions.length);
 }
});

test('a saved gate restarts at that gate\'s checkpoint and a finished run at the arrival',()=>{
 const course=buildCourse(4);
 let s=freshAdventure(4);s=runMove(runMove(runMove(s,'heat').state,'heat').state,'gate').state;
 assert.equal(s.gate,1);
 const r=createRunner(course,s);assert.deepEqual({x:r.x,y:r.y,z:r.z},course.segments[1].checkpoint);
 assert.deepEqual({x:createRunner(course,{...s,gate:3,done:true}).x},{x:course.finish.x});
});

test('the third stop names a plate, and the hint follows the model state',()=>{
 assert.match(runHint(freshAdventure(0)),/열판/);
 assert.match(runHint(freshAdventure(1)),/밸브/);
 assert.match(runHint({...freshAdventure(1),space:true}),/냉각판/);
 assert.match(runHint({...freshAdventure(0),phase:'water'}),/지나갈 수 있어/);
 assert.match(runHint(freshAdventure(3)),/냉각판/);
});

test('the existing screen stays the fallback and the teacher default',()=>{
 assert.equal(adventureMode({webgl:true}),'3d');
 assert.equal(adventureMode({webgl:false}),'2d');
 assert.equal(adventureMode({webgl:true,reduced:true,choice:'3d'}),'2d');
 assert.equal(adventureMode({webgl:true,failed:true}),'2d');
 assert.equal(adventureMode({webgl:true,choice:'2d'}),'2d');
 assert.equal(adventureMode({webgl:true,admin:true}),'2d');
 assert.equal(adventureMode({webgl:true,admin:true,choice:'3d'}),'3d');
});

test('the run screen keeps the learning-model notice and ships its art',()=>{
 const view=readFileSync('src/run-stage.js','utf8'),build=readFileSync('scripts/build.mjs','utf8');
 assert.ok(view.includes('게임의 표현이며 실제 변화 시간이나 크기를 나타내지 않아'));
 assert.ok(view.includes('수증기'));
 assert.ok(!/cannon|ammo|rapier/i.test(view),'no physics engine');
 if(view.includes('/assets/run-stage/'))assert.match(build,/'run-stage'/);
});
