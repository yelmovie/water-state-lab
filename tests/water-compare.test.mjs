import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,sortCards} from '../src/activity-model.js';
import {initialInquiry} from '../src/inquiry-model.js';
import {pourComparison,comparedPours,compareStage,iceSeat,iceDropTarget,vesselGeometry,restingIceY,beakerShell,beakerInner,waterHeight} from '../src/scene-model.js';
import {beaker} from '../src/ui.js';

globalThis.document??={addEventListener(){}};
const {assistStep,observationDwell}=await import('../src/stage-assist.js');
const {experimentMove}=await import('../src/stage-guide.js');
const world=(change=()=>{})=>{const state={fieldwork:{active:0},settings:{adminUnlock:false},activities:initialActivities(),inquiry:initialInquiry(),lab:{workshop:{parts:{},cold:false,angle:0,trials:[]}}};change(state);return state;};

test('the level comparison opens only when both vessels hold the same full amount',()=>{
 assert.equal(pourComparison({tall:100,wide:0}).ready,false);
 assert.equal(pourComparison({tall:100,wide:60}).ready,false);
 const c=pourComparison({tall:100,wide:100});
 assert.equal(c.ready,true);
 assert.equal(c.higher,'tall');
 assert.ok(c.heights.tall>c.heights.wide);
 assert.equal(c.ratio,3,'the wide vessel is 1.76 times wider, so the narrow column stands about 3 times higher');
});

test('a finished pour keeps its water in the comparison even from a save without measured amounts',()=>{
 const inquiry=initialInquiry();
 assert.deepEqual(comparedPours(inquiry,{pours:['tall','wide']}),{tall:100,wide:100});
 inquiry.pours={tall:40,wide:0};
 assert.deepEqual(comparedPours(inquiry,{pours:['wide']}),{tall:40,wide:100});
});

test('water and ice are compared in the same pair of vessels',()=>{
 const {water,ice}=compareStage;
 assert.deepEqual(Object.keys(water),Object.keys(vesselGeometry));
 assert.deepEqual(Object.keys(ice),Object.keys(vesselGeometry));
 for(const key of Object.keys(vesselGeometry))assert.notEqual(water[key],ice[key]);
 const half=key=>vesselGeometry[key].width*compareStage.scale/2+14;
 assert.ok(water.tall+half('tall')<water.wide-half('wide')+14,'the water pair does not overlap');
 assert.ok(ice.tall+half('tall')<ice.wide-half('wide')+14,'the ice pair does not overlap');
 assert.ok(water.wide+half('wide')<ice.tall-half('tall'),'the water and ice groups stay apart');
});

test('ice keeps one size and rests on the floor of either vessel',()=>{
 const tall=iceSeat('tall'),wide=iceSeat('wide');
 assert.equal(tall.size,wide.size);
 assert.equal(tall.y,wide.y);
 assert.equal(tall.x,compareStage.ice.tall);
 assert.equal(wide.x,compareStage.ice.wide);
 assert.ok(tall.size*compareStage.iceFill<=vesselGeometry.tall.width*compareStage.scale,'the block fits inside the narrow vessel');
 assert.ok(tall.y+tall.size/2>=compareStage.floor-6,'the block sits on the floor instead of hovering');
});

test('ice lands only in a vessel it was dropped over',()=>{
 assert.equal(iceDropTarget({x:compareStage.ice.wide+40,y:170}),'wide');
 assert.equal(iceDropTarget({x:compareStage.ice.tall,y:170}),'tall');
 assert.equal(iceDropTarget({x:compareStage.water.wide,y:170}),null,'the water pair is not a landing place');
 assert.equal(iceDropTarget({x:compareStage.ice.wide,y:20}),null);
});

test('the learner keeps the comparison on screen until choosing to move on',()=>{
 const poured=world(x=>{x.activities.observe.pours=['tall','wide'];});
 assert.equal(assistStep(1,poured),null,'two filled vessels wait for the learner');
 const moved=world(x=>{Object.assign(x.activities.observe,{pours:['tall','wide'],step:1,iceMoved:true});});
 assert.equal(assistStep(1,moved),null,'the moved ice waits for the learner');
});

test('the automatic demonstration lingers on each comparison',()=>{
 const pouring=world();
 const poured=world(x=>{x.activities.observe.pours=['tall','wide'];});
 const moved=world(x=>{Object.assign(x.activities.observe,{pours:['tall','wide'],step:1,iceMoved:true});});
 assert.equal(observationDwell(1,pouring),1250);
 assert.ok(observationDwell(1,poured)>=3000);
 assert.ok(observationDwell(1,moved)>=3000);
 assert.equal(observationDwell(3,world()),1250);
});

test('ice guidance names the vessels used for the water',()=>{
 const before=experimentMove(1,world(x=>{Object.assign(x.activities.observe,{pours:['tall','wide'],step:1});}));
 const after=experimentMove(1,world(x=>{Object.assign(x.activities.observe,{pours:['tall','wide'],step:1,iceMoved:true});}));
 for(const move of [before,after])assert.doesNotMatch(move.title+move.instruction,/접시/);
 assert.match(before.title,/넓은 그릇/);
 assert.match(after.title,/물과 얼음/);
 const [x]=before.regions[0];
 assert.equal(x,compareStage.ice.wide,'the highlight sits on the vessel the ice goes to');
 assert.doesNotMatch(sortCards.find(c=>c.id==='ice').proof,/접시/);
});

test('ice floats in deep water and rests on the floor of a shallow or empty vessel',()=>{
 const floor=231,size=65;
 assert.equal(restingIceY({floor,size,waterTop:null}),floor-size/2);
 assert.equal(restingIceY({floor,size,waterTop:205}),floor-size/2,'shallow water cannot lift the block');
 const deep=restingIceY({floor,size,waterTop:130});
 assert.ok(deep<floor-size/2,'deep water lifts the block');
 assert.ok(deep-size/2<130,'a little of the block stays above the surface');
});

test('beaker water stays inside the glass in every beaker size',()=>{
 for(const [x,base,width,height] of [[220,267,125,205],[330,250,135,220]]){
  const shell=beakerShell(x,base,width,height),{cx,half,ry,floor}=beakerInner(shell);
  assert.ok(cx-half>shell.left&&cx+half<shell.left+shell.width,'the walls sit inside the art');
  assert.ok(floor+ry<shell.top+shell.height,'the curved floor stays above the bottom of the art');
  assert.ok(base-waterHeight(100,width)>shell.top,'a full beaker does not reach past the rim');
 }
});

test('the record beaker shows the same open water surface as the scenes',()=>{
 const water=beaker(60),ice=beaker(65.4,true);
 assert.match(water,/<ellipse cx="130" cy="141" /,'the surface is centred on the measured level');
 assert.doesNotMatch(water,/water-material/);
 assert.doesNotMatch(ice,/<ellipse/,'ice has no open water surface');
});
