import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,pipeTrial,pipeStep,recordPipeTrial,activityReady} from '../src/activity-model.js';
import {benchMarkup,benchFill,shelfTrials,fillAtHeight,canMark} from '../src/freeze-bench.js';

const pipe=(...fills)=>({...initialActivities().pipe,trials:fills.map(pipeTrial)});

test('the water handle moves in fives inside the model range',()=>{
 assert.equal(benchFill(72),70);assert.equal(benchFill(73),75);
 assert.equal(benchFill(5),40);assert.equal(benchFill(130),100);assert.equal(benchFill(Number.NaN),40);
 assert.equal(fillAtHeight(0),100);assert.equal(fillAtHeight(1),40);
});
test('the shelf keeps the newest tube of each amount and their real trial numbers',()=>{
 const list=shelfTrials(pipe(95,70,95,60,50).trials);
 assert.deepEqual(list.map(x=>x.t.fill),[95,60,50]);
 assert.deepEqual(list.map(x=>x.i),[2,3,4]);
});
test('each result shows its own outcome and the two measured lines',()=>{
 const html=benchMarkup(pipe(95,90,70),false);
 assert.match(html,/물 95 → 얼음 103\.6/);assert.match(html,/물 70 → 얼음 76\.3/);
 assert.match(html,/data-risk="높음"/);assert.match(html,/data-risk="보통"/);assert.match(html,/data-risk="낮음"/);
 assert.match(html,/마개가 튀어 나갔어/);assert.match(html,/빠듯해/);assert.match(html,/넉넉해/);
});
test('pointing at the space opens only after both kinds of tube were seen',()=>{
 assert.equal(canMark(pipe(95).trials),false);
 assert.equal(canMark(pipe(60,70).trials),false);
 assert.equal(canMark(pipe(95,70).trials),true);
 assert.doesNotMatch(benchMarkup(pipe(95),false),/act-pipe-mark-/);
 assert.match(benchMarkup(pipe(95,70),false),/data-action="act-pipe-mark-1"/);
});
test('the handle, the drag target and the button alternative are all on the bench',()=>{
 const html=benchMarkup(pipe(),false);
 assert.match(html,/role="slider"/);assert.match(html,/aria-valuemin="40"/);assert.match(html,/aria-valuemax="100"/);assert.match(html,/aria-valuenow="95"/);
 assert.match(html,/data-bench-tube/);assert.match(html,/data-bench-freezer/);assert.match(html,/data-bench-run/);
 assert.match(html,/data-action="act-complete-2"[^>]*disabled/);
 assert.doesNotMatch(benchMarkup({...pipe(95,70),chosen:1,marked:true},true),/data-action="act-complete-2"[^>]*disabled/);
});

test('lowering the water changes the instruction from adjusting to freezing',()=>{
 const s=pipe();
 assert.equal(pipeStep(s),'first');
 recordPipeTrial(s);
 assert.equal(pipeStep(s),'reduce');
 s.fill=90;assert.equal(pipeStep(s),'reduce','a nearly full tube still needs more space');
 s.fill=70;assert.equal(pipeStep(s),'freeze');
 recordPipeTrial(s);assert.equal(pipeStep(s),'compare');
 const a=initialActivities();a.pipe=s;
 assert.equal(activityReady(4,a),false,'both results must be observed and a space selected');
 s.chosen=1;s.marked=true;
 assert.equal(pipeStep(s),'done');assert.equal(activityReady(4,a),true);
});

test('starting with less water asks for the contrasting full tube',()=>{
 const s=pipe(70);s.fill=70;
 assert.equal(pipeStep(s),'add');
 s.fill=95;assert.equal(pipeStep(s),'freeze');
 recordPipeTrial(s);assert.equal(pipeStep(s),'compare');
});

test('autoplay compares two amounts and leaves choosing the empty space to the learner',async()=>{
 globalThis.document??={addEventListener(){},querySelector(){return null;},getElementById(){return null;}};
 const {observationStep,replayStep}=await import('../src/observation-play.js');
 for(const fill of [95,60]){
  const state={activities:initialActivities(),fieldwork:{active:0},inquiry:{}};state.activities.pipe.fill=fill;
  const p=state.activities.pipe;
  for(let i=0;i<30;i++){
   const action=observationStep(4,state);if(!action)break;
   if(action==='bench-run')recordPipeTrial(p);else p.fill=benchFill(p.fill+(action==='bench-less'?-5:5));
  }
  assert.equal(canMark(p.trials),true);assert.equal(p.trials.length,2);
  assert.equal(p.marked,false);assert.equal(activityReady(4,state.activities),false);
  assert.equal(observationStep(4,state),null);assert.equal(replayStep(4,state),'bench-run');
  state.fieldwork.active=4;assert.equal(observationStep(4,state),'@[data-night-next], [data-night-start]');assert.equal(replayStep(4,state),null);
 }
});

test('repeated trials keep the contrasting result visible and selectable',()=>{
 const s=pipe(95);
 for(const fill of [70,65,60,55,50,45,40,75,80]){s.fill=fill;recordPipeTrial(s);}
 assert.ok(s.trials.length<=8);
 assert.ok(s.trials.some(t=>!t.safe),'the full-tube evidence survives retries');
 const shelf=shelfTrials(s.trials);
 assert.ok(shelf.some(x=>!x.t.safe));assert.ok(shelf.some(x=>x.t.safe));
 assert.equal(shelf.at(-1).t.fill,80,'the latest result is on the shelf');
});

test('the pending action and the next mission are named explicitly',()=>{
 const s=pipe(95);s.fill=70;
 assert.match(benchMarkup(s,false),/data-bench-less/);
 assert.match(benchMarkup(s,false),/data-bench-more/);
 assert.match(benchMarkup(s,false),/70만큼 담아 얼리기/);
 assert.match(benchMarkup(s,false),/5눈금 이상/);
 s.trials.push(pipeTrial(70));s.chosen=1;s.marked=true;
 assert.match(benchMarkup(s,true),/한파가 온다/);
});
