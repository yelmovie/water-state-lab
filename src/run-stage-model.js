// A learning model, not a simulation of real time or scale.
// The 3D run stage only reports what happened (stood on a plate, opened the valve, reached a gate).
// drop-adventure-model.js still decides every change of form and every gate, exactly as in the 2D screen.
import {expeditions,restoreAdventure,adventureMove} from './drop-adventure-model.js';

/** Ice, water and vapour all run and jump with these same numbers. Only the gates tell the forms apart. */
export const RUN={speed:5.6,depthSpeed:4.2,accel:40,airAccel:26,gravity:26,jump:9.6,halfW:.42,height:1.1,coyote:.1,buffer:.14,substeps:5,maxDt:.05,halfZ:3,fallDepth:7,level:3,deviceSpan:5.6,padHalf:1.1,valveReach:1.4};
export const RUN_ACTIONS={heat:'warm',cool:'cool',valve:'space',gate:'move'};
const FLOOR=1.2,EDGE=1e-4;

/** Rule connection: one stage event becomes one existing adventure action, nothing more. */
export function runMove(adventure,kind){
 const before=restoreAdventure(adventure),action=RUN_ACTIONS[kind];
 if(!action)return {state:before,action:null,passed:false,blocked:false,phaseChanged:false};
 const state=adventureMove(before,action);
 return {state,action,passed:state.gate>before.gate,blocked:kind==='gate'&&!before.done&&state.gate===before.gate,phaseChanged:state.phase!==before.phase};
}

/** After three stops at one gate the companion says which plate to try. The gate itself is still judged by the model. */
export function runHint(adventure){
 const s=restoreAdventure(adventure);if(s.done)return '';
 const gate=expeditions[s.chapter].gates[s.gate],rank={ice:0,water:1,vapor:2};
 if(s.phase===gate.phase)return '지금 모습이면 지나갈 수 있어. 관문까지 달려가 봐.';
 if(rank[gate.phase]>rank[s.phase])return '주황색 열판 위에 서서 ‘열 주기’를 두 번 눌러 봐.';
 if(s.phase==='water'&&gate.space&&!s.space)return '밸브 앞에서 물을 조금 덜어 얼 자리를 남긴 다음, 파란 냉각판에서 ‘열 빼앗기’를 두 번 눌러 봐.';
 return '파란 냉각판 위에 서서 ‘열 빼앗기’를 두 번 눌러 봐.';
}

/** 3D first unless the device, a setting or the learner asks for the existing screen. Teachers start on the existing screen and may switch. */
export function adventureMode({webgl=false,reduced=false,admin=false,choice=null,failed=false}={}){
 if(!webgl||reduced||failed)return '2d';
 if(choice==='2d'||choice==='3d')return choice;
 return admin?'2d':'3d';
}

// Obstacles between gates. A stretch that is walked as invisible vapour stays gentle.
const PLAN=[
 [['step'],['gap']],
 [['step','gap'],['bridge:front']],
 [['gap','stairs','mole'],['step']],
 [['step'],['stepping','mole']],
 [['step','gap'],['bridge:back','mole'],['step']]
];
const rise=gate=>gate.scene==='air'?RUN.level:gate.scene==='condenser'?-RUN.level:0;

export function buildCourse(chapter){
 const mission=expeditions[chapter],boxes=[],segments=[],moles=[],lanes=[];
 let y=0,low=0;for(const gate of mission.gates){y+=rise(gate);low=Math.min(low,y);}
 y=-low;let x=0;
 const add=(kind,x0,x1,y0,y1,z0=-RUN.halfZ,z1=RUN.halfZ)=>boxes.push({kind,x0,x1,y0,y1,z0,z1});
 const floor=(x0,x1)=>add('floor',x0,x1,y-FLOOR,y);
 mission.gates.forEach((gate,index)=>{
  const checkpoint={x:x+1.4,y,z:0};floor(x,x+4);x+=4;
  for(const name of PLAN[chapter][index]){
   const [type,side]=name.split(':');
   if(type==='step'){floor(x,x+7);add('step',x+2.5,x+5,y,y+.9);x+=7;}
   if(type==='gap'){floor(x,x+2.6);floor(x+5,x+7.6);x+=7.6;}
   if(type==='stairs'){floor(x,x+9.5);add('step',x+2,x+8,y,y+.9);add('step',x+4,x+6,y+.9,y+1.8);x+=9.5;}
   if(type==='bridge'){const z=side==='front'?[.6,2.8]:[-2.8,-.6];floor(x,x+2.5);add('bridge',x+2.5,x+8.5,y-.5,y,z[0],z[1]);floor(x+8.5,x+11);lanes.push({x0:x+.8,x1:x+8.8,z:(z[0]+z[1])/2});x+=11;}
   if(type==='stepping'){floor(x,x+2.5);add('stone',x+4.8,x+6.8,y-FLOOR,y,-1.8,1.8);floor(x+9.1,x+11.6);x+=11.6;}
   if(type==='mole'){floor(x,x+5);moles.push({x:x+2.5,y,range:2.1,speed:1.5,phase:moles.length*1.7+chapter});x+=5;}
  }
  const station={x:x+1,y,z:0},pads={heat:{x:x+3.4,z:-1.5},cool:{x:x+3.4,z:1.5}},valve=gate.space?{x:x+6.4,z:-2.1}:null;
  floor(x,x+9);x+=9;
  boxes.push({kind:'gate',gate:index,x0:x,x1:x+.5,y0:-99,y1:99,z0:-RUN.halfZ,z1:RUN.halfZ});
  const next=y+rise(gate);
  segments.push({index,gate,level:y,checkpoint,station,pads,valve,gateX:x,exit:{x:x+RUN.deviceSpan+1.4,y:next,z:0}});
  x+=RUN.deviceSpan;y=next;
 });
 floor(x,x+9);
 return {chapter,boxes,segments,moles,lanes,finish:{x:x+1.4,y,z:0},length:x+9,minY:Math.min(...boxes.filter(b=>b.kind!=='gate').map(b=>b.y1))};
}

export function createRunner(course,adventure){
 const s=restoreAdventure(adventure),at=s.done?course.finish:course.segments[s.gate].checkpoint;
 return {x:at.x,y:at.y,z:at.z,vx:0,vy:0,vz:0,grounded:true,coyote:0,buffer:0,facing:1,checkpoint:{...at},armed:true,transit:null,stun:0,safe:0,time:0,falls:0};
}

const solid=(box,openGates)=>box.kind!=='gate'||box.gate>=openGates;
const overlaps=(r,b)=>r.x+RUN.halfW>b.x0+EDGE&&r.x-RUN.halfW<b.x1-EDGE&&r.z+RUN.halfW>b.z0+EDGE&&r.z-RUN.halfW<b.z1-EDGE&&r.y+RUN.height>b.y0+EDGE&&r.y<b.y1-EDGE;
const approach=(value,target,amount)=>value<target?Math.min(target,value+amount):Math.max(target,value-amount);
export const moleDepth=(mole,time)=>mole.range*Math.sin(time*mole.speed/mole.range+mole.phase);

/** Highest surface under a point, for the round shadow and for looking one step ahead. */
export function groundBelow(course,x,z,y=Infinity){
 let top=-Infinity;
 for(const b of course.boxes)if(b.kind!=='gate'&&x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&b.y1<=y+.05&&b.y1>top)top=b.y1;
 return top;
}

/** Where the runner stands, if it is a place with a job: a plate or the valve. */
export function runZone(course,r){
 if(!r.grounded||r.transit)return null;
 for(const seg of course.segments){
  if(Math.abs(r.y-seg.level)>.3)continue;
  for(const kind of ['heat','cool']){const p=seg.pads[kind];if(Math.abs(r.x-p.x)<=RUN.padHalf&&Math.abs(r.z-p.z)<=RUN.padHalf)return {kind,segment:seg.index};}
  if(seg.valve&&Math.hypot(r.x-seg.valve.x,r.z-seg.valve.z)<=RUN.valveReach)return {kind:'valve',segment:seg.index};
 }
 return null;
}

/** The ride through a device is a game picture of the passage the model already allowed. */
export function transitPoint(seg,from,k){
 const e=k*k*(3-2*k),to=seg.exit,scene=seg.gate.scene;
 const x=from.x+(to.x-from.x)*e,z=from.z+(to.z-from.z)*Math.min(1,e*2);
 let y=from.y+(to.y-from.y)*e+Math.sin(Math.PI*e)*.5;
 if(scene==='air')y=from.y+(to.y-from.y)*Math.min(1,e*1.7)+Math.sin(Math.PI*e)*1.1;
 if(scene==='condenser')y=from.y+(to.y-from.y)*Math.max(0,(e-.25)/.75)+Math.sin(Math.PI*e)*.4;
 return {x,y,z};
}
export function beginTransit(r,seg){
 r.transit={segment:seg.index,t:0,dur:rise(seg.gate)?2:1.5,from:{x:r.x,y:r.y,z:r.z}};
 r.vx=r.vy=r.vz=0;r.grounded=false;r.stun=0;
}
/** Stopped at a gate: a small hop back, no penalty. */
export function bounce(r){r.vx=-6.5;r.vy=5.5;r.vz=0;r.grounded=false;r.stun=.45;r.armed=false;}

/** One frame of running. `input` is {x,z,jump}; returns what happened so the caller can ask the model. */
export function stepRunner(r,course,adventure,input,dt){
 const events=[];dt=Math.min(RUN.maxDt,Math.max(0,Number(dt)||0));if(!dt)return events;
 r.time+=dt;
 if(r.transit){
  const seg=course.segments[r.transit.segment];r.transit.t+=dt;
  const k=Math.min(1,r.transit.t/r.transit.dur);Object.assign(r,transitPoint(seg,r.transit.from,k));
  if(k>=1){const next=course.segments[seg.index+1]?.checkpoint??course.finish;r.transit=null;Object.assign(r,next);r.checkpoint={...next};r.grounded=true;r.armed=true;events.push({type:'arrived',segment:seg.index});}
  return events;
 }
 const s=restoreAdventure(adventure),openGates=s.done?Infinity:s.gate,seg=s.done?null:course.segments[s.gate];
 if(input.jump)r.buffer=RUN.buffer;
 const held=r.stun>0,ix=held?0:Math.sign(input.x||0),iz=held?0:Math.sign(input.z||0);
 if(ix)r.facing=ix;
 const h=dt/RUN.substeps;let touched=null,landed=0;
 for(let i=0;i<RUN.substeps;i++){
  const rate=(held?.25:1)*(r.grounded?RUN.accel:RUN.airAccel)*h;
  r.vx=approach(r.vx,ix*RUN.speed,rate);r.vz=approach(r.vz,iz*RUN.depthSpeed,rate);
  r.coyote=r.grounded?RUN.coyote:r.coyote-h;r.buffer-=h;r.stun-=h;r.safe-=h;
  if(r.buffer>0&&r.coyote>0&&!held){r.vy=RUN.jump;r.grounded=false;r.coyote=0;r.buffer=0;events.push({type:'jump'});}
  r.vy=Math.max(-30,r.vy-RUN.gravity*h);
  r.x=Math.max(RUN.halfW,Math.min(course.length-RUN.halfW,r.x+r.vx*h));
  for(const b of course.boxes)if(solid(b,openGates)&&overlaps(r,b)){r.x=r.vx>0?b.x0-RUN.halfW:b.x1+RUN.halfW;if(b.kind==='gate'&&r.vx>0)touched=b;r.vx=0;}
  r.z=Math.max(-RUN.halfZ+RUN.halfW,Math.min(RUN.halfZ-RUN.halfW,r.z+r.vz*h));
  for(const b of course.boxes)if(solid(b,openGates)&&overlaps(r,b)){r.z=r.vz>0?b.z0-RUN.halfW:b.z1+RUN.halfW;r.vz=0;}
  const falling=r.vy;r.y+=r.vy*h;r.grounded=false;
  for(const b of course.boxes)if(solid(b,openGates)&&overlaps(r,b)){if(r.vy<=0){r.y=b.y1;r.grounded=true;landed=Math.min(landed,falling);}else r.y=b.y0-RUN.height;r.vy=0;}
 }
 if(landed<-4)events.push({type:'land'});
 if(r.y<course.minY-RUN.fallDepth){Object.assign(r,r.checkpoint,{vx:0,vy:0,vz:0,grounded:true,stun:0,armed:true});r.falls++;events.push({type:'fell'});return events;}
 if(seg){
  if(r.grounded&&r.x>=seg.station.x&&r.checkpoint.x<seg.station.x&&Math.abs(r.y-seg.level)<.05){r.checkpoint={...seg.station,z:r.z};events.push({type:'checkpoint',segment:seg.index});}
  if(!r.armed&&r.x<seg.gateX-RUN.halfW-1)r.armed=true;
  if(touched&&touched.gate===seg.index&&r.armed){r.armed=false;events.push({type:'gate',segment:seg.index});}
 }
 for(const mole of course.moles){
  if(r.safe>0||Math.abs(r.y-mole.y)>1)continue;
  if(Math.abs(r.x-mole.x)<.8&&Math.abs(r.z-moleDepth(mole,r.time))<.8){r.vx=-5.5;r.vy=4.5;r.grounded=false;r.stun=.4;r.safe=1.4;events.push({type:'flinch'});}
 }
 return events;
}
