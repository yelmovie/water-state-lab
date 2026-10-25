import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,activityReady,heatingTrial,pipeTrial,dryTrace,dewTrial,sortCards,validateActivities} from '../src/activity-model.js';
import {state} from '../src/state.js';
import {activityView,handleActivity,getActivityProgress} from '../src/activities.js';

test('pouring guidance follows the next unfinished comparison and keeps the other vessel usable',()=>{
 const before=structuredClone({activities:state.activities,inquiry:state.inquiry});
 try{
  state.activities=initialActivities();
  state.activities.observe.pours=['tall'];
  state.inquiry.pours={tall:100,wide:0};state.inquiry.pourTarget='tall';
  assert.match(getActivityProgress(1).instruction,/넓은 그릇/);
  assert.match(activityView(1),/id="hold-pour" disabled/);
  state.inquiry.pourTarget='wide';
  assert.doesNotMatch(activityView(1),/id="hold-pour" disabled/);
  state.activities.observe.pours.push('wide');state.inquiry.pours.wide=100;
  assert.match(getActivityProgress(1).instruction,/얼음도 옮겨 보기/);
  state.activities.observe.step=1;state.activities.observe.iceMoved=true;
  assert.match(getActivityProgress(1).instruction,/사라지는 물을 찾아보자/);
 }finally{Object.assign(state,before);}
});

test('pipe comparison guidance matches meaningful condition changes',()=>{
 const before=state.activities;
 try{
  state.activities=initialActivities();
  state.activities.pipe.trials=[{fill:95},{fill:95}];
  assert.equal(getActivityProgress(4).steps[1].done,false);
  state.activities.pipe.trials.push({fill:90});
  assert.equal(getActivityProgress(4).steps[1].done,true);
 }finally{state.activities=before;}
});

test('unheated identical cups lose equal water at every observation time',()=>{
 for(let time=0;time<=100;time+=5){const t=heatingTrial(0,time);assert.equal(t.room,t.heated);assert.equal(t.boiling,false);}
 assert.equal(heatingTrial(100,0).boiling,false);
 assert.equal(heatingTrial(100,20).boiling,false);
 assert.equal(heatingTrial(100,80).boiling,true);
});
test('same drawing with less water dries first, and rewinding restores the trace',()=>{
 assert.equal(dryTrace('thin',60),0);assert.ok(dryTrace('thick',60)>0);
 assert.equal(dryTrace('thin',0),1);assert.equal(dryTrace('thick',110),0);
});
test('cold and room-temperature controls differ, with outside droplets adding mass',()=>{
 assert.equal(dewTrial(0).mass,250);assert.equal(dewTrial(80,false).drops,0);
 assert.equal(dewTrial(80,false).mass,250);assert.ok(dewTrial(80).mass>250);
 assert.equal(dewTrial(80).drops,16);
});
test('repeated pipe trials do not substitute for a meaningfully changed condition',()=>{
 const a=initialActivities();a.pipe.trials=[pipeTrial(70),pipeTrial(70)];a.pipe.chosen=1;a.pipe.marked=true;
 assert.equal(activityReady(4,a),false);a.pipe.trials.unshift(pipeTrial(95));a.pipe.chosen=2;
 assert.equal(activityReady(4,a),true);a.pipe.chosen=0;assert.equal(activityReady(4,a),false);
});
test('all untouched activities remain incomplete and state copies are independent',()=>{
 const a=initialActivities(),b=initialActivities();a.observe.pours.push('tall');assert.deepEqual(b.observe.pours,[]);
 for(let n=1;n<=8;n++)assert.equal(!!activityReady(n,b),false);
 assert.equal(validateActivities(a),true);a.draw.strokes=[[[Infinity,0]]];assert.equal(validateActivities(a),false);
});
test('malformed saved observation measurements are rejected before rendering',()=>{
 const a=initialActivities();a.dew.records=[{kind:'before'}];assert.equal(validateActivities(a),false);
 a.dew.records=[];a.freeze.records=[{kind:'ice',level:'wrong',mass:100}];assert.equal(validateActivities(a),false);
 a.freeze.records=[];a.compare.records=[{}];assert.equal(validateActivities(a),false);
});
test('first eight activities render without completion or fabricated observation evidence',()=>{
 state.activities=initialActivities();for(let n=1;n<=8;n++){const html=activityView(n);assert.ok(html.includes(`activity-${n}`));assert.equal(getActivityProgress(n).steps.length,3);assert.ok(getActivityProgress(n).instruction);}
 assert.ok(activityView(8).includes('act-go-7'));assert.ok(!activityView(8).includes('ix-evidence-'));
});
test('complete interaction sequence requires observations, comparisons, and transfer',()=>{
 state.activities=initialActivities();const a=state.activities,completed={},pages=[],routes=[];
 const ctx={render(){},pageDone(n){pages.push(n);},go(n){routes.push(n);},complete(n,evidence){completed[n]=evidence;}};
 const act=action=>assert.equal(handleActivity(`act-${action}`,ctx),true);
 const put=(token,to)=>{act(`pick-${token}`);act(`place-${to}`);};
 act('complete-1');assert.equal(completed[1],undefined);
 put('jug','tall');put('jug','wide');act('observe-step-1');put('ice','dish');act('observe-step-2');act('wet-cloth');a.observe.time=90;act('observe-record');act('next-1');
 assert.deepEqual(pages,[1]);assert.deepEqual(routes,[2]);
 put('card:ice','bin:gas');assert.equal(a.sort.placed.ice,undefined);
 for(const c of sortCards)put(`card:${c.id}`,`bin:${c.type}`);
 act('complete-1');assert.equal(completed[1].records.length,6);
 put('icepack','freeze-cup');assert.equal(a.freeze.phase,'water');
 put('measure-cup','scale');act('freeze-predict');put('icepack','freeze-cup');act('freeze-record');put('warm','freeze-cup');act('freeze-record');
 assert.equal(activityReady(3,a),false);act('freeze-compare');act('next-3');
 a.pipe.fill=95;act('pipe-test');a.pipe.fill=70;act('pipe-test');act('mark-space');act('pipe-choose-1');act('complete-2');
 assert.equal(completed[2].safeFill,70);assert.equal(completed[2].measurements.length,3);
 act('draw-example');for(const time of [0,40,90]){a.draw.time=time;act('draw-record');}
 act('draw-faster-thick');assert.equal(a.draw.faster,'');act('draw-faster-thin');put('drawing-water','drawing-air');act('next-5');
 a.compare.heat=100;a.compare.time=80;act('heat-record');assert.equal(a.compare.records.length,0);
 a.compare.heat=0;a.compare.time=40;act('heat-record');a.compare.heat=100;a.compare.time=80;act('heat-record');
 for(const site of ['surface','inside','level'])put('lens',site);put('heated-water','heat-air');act('complete-3');
 assert.equal(completed[3].trials[0].room,completed[3].trials[0].heated);assert.equal(completed[3].trials[1].boiling,true);
 act('dew-wipe-cold');act('dew-wipe-room');act('dew-seal');act('dew-record');a.dew.time=80;act('dew-record');
 assert.equal(activityReady(7,a),false);act('dew-wipe-cold');a.dew.againTime=80;act('dew-again');act('next-7');
 put('proof:contrast','proof-board');put('proof:again','proof-board');put('cause:cold','chain:0');assert.equal(a.explain.chain.length,0);
 for(const [i,k] of ['air','cold','drops'].entries())put(`cause:${k}`,`chain:${i}`);
 act('complete-4');assert.equal(completed[4],undefined);act('bottle-wipe');a.explain.time=80;act('transfer-record');act('complete-4');
 assert.equal(completed[4].reobserved,true);assert.equal(completed[4].snapshots[1].cold.drops,16);
 assert.equal(completed[4].mass,'250.0 g → 251.6 g');assert.deepEqual(pages,[1,3,5,7]);assert.deepEqual(routes,[2,4,6,8]);
 for(let n=1;n<=8;n++){assert.equal(activityReady(n,a),true,`screen ${n}`);assert.ok(activityView(n));}
 assert.equal(validateActivities(a),true);
});
