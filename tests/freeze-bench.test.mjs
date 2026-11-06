import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,pipeTrial} from '../src/activity-model.js';
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
