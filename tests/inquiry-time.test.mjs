import test, {beforeEach, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {state, initialState} from '../src/state.js';
import {handleInquiry, seekInquiryTime, observationTime, cleanupInquiry, stop} from '../src/inquiry.js';
import {toast} from '../src/ui.js';

const ctx = {render(){}, go(){}, pageDone(){}};
const toastElement = {textContent:'', classList:{add(){}, remove(){}}};
const playButton = {textContent:''};
globalThis.localStorage = {setItem(){}};
globalThis.document = {
 hidden:false,
 querySelector(selector){
  if(selector === '#toast') return toastElement;
  if(selector === '[data-action="ix-play"]') return playButton;
  return null;
 },
 getElementById(){return null;}
};

function reset(n){
 cleanupInquiry();
 Object.assign(state, initialState());
 state.route = 5;
 // A normal new-experiment action also clears the module's transient preview.
 handleInquiry('ix-draw-new', ctx);
 Object.assign(state, initialState());
 state.route = n;
}

function prepare(n){
 reset(n);
 if(n === 1){state.activities.observe.step = 2; state.activities.observe.clothWet = true;}
 if(n === 5){
  state.activities.draw.strokes = [[[20,30],[40,50],[60,30]]];
  state.inquiry.drawPrediction = 'thin';
 }
 if(n === 7){
  Object.assign(state.activities.dew, {wiped:['cold','room'], sealed:true});
  state.inquiry.dewHypothesis = 'air';
 }
 if(n === 8){
  Object.assign(state.activities.explain, {evidence:['sealed','contrast'], chain:['air','cold','drops'], bottleWiped:true});
  state.inquiry.transferPrediction = 'cold';
 }
}

function liveTime(n){
 return n === 1 ? state.activities.observe.time : n === 5 ? state.activities.draw.time : n === 6 ? state.activities.compare.time : n === 7 ? (state.activities.dew.rewiped ? state.activities.dew.againTime : state.activities.dew.time) : state.activities.explain.time;
}

beforeEach(() => reset(1));
afterEach(() => {stop(); clearTimeout(toast.timer);});

test('cloth observation needs a wet trace and reviewing it cannot replace its saved observation', () => {
 assert.equal(seekInquiryTime(1, 100), false);
 assert.equal(state.activities.observe.time, 0);
 assert.deepEqual(state.activities.observe.records, []);
 state.activities.observe.clothWet = true;
 assert.equal(seekInquiryTime(1, 100), true);
 handleInquiry('ix-record', ctx);
 const records = structuredClone(state.activities.observe.records);
 assert.equal(records.length, 1);
 assert.equal(seekInquiryTime(1, 20), true);
 assert.equal(observationTime(1), 20);
 assert.equal(state.activities.observe.time, 100);
 handleInquiry('ix-record', ctx);
 assert.deepEqual(state.activities.observe.records, records);
 assert.equal(observationTime(1), 20);
});

test('drawing time requires both a real stroke and a prediction before creating records', () => {
 reset(5);
 state.inquiry.drawPrediction = 'thin';
 assert.equal(seekInquiryTime(5, 110), false);
 state.activities.draw.strokes = [[[20,30],[40,50]]];
 assert.equal(seekInquiryTime(5, 110), false);
 state.activities.draw.strokes[0].push([60,30]);
 state.inquiry.drawPrediction = '';
 assert.equal(seekInquiryTime(5, 110), false);
 assert.equal(state.activities.draw.time, 0);
 assert.deepEqual(state.activities.draw.records, []);
 state.inquiry.drawPrediction = 'thin';
 assert.equal(seekInquiryTime(5, 1), true);
 assert.deepEqual(state.activities.draw.records.map(r => [r.band,r.time]), [[0,0]]);
});

test('one drawing drag keeps beginning, middle and end snapshots while backward drags only preview', () => {
 prepare(5);
 assert.equal(seekInquiryTime(5, 110), true);
 const drawing = state.activities.draw;
 assert.deepEqual(drawing.records.map(r => [r.band,r.time]), [[0,0],[1,30],[2,110]]);
 const records = structuredClone(drawing.records);
 for(const time of [80,10,70,0]){
  assert.equal(seekInquiryTime(5, time), true);
  assert.equal(observationTime(5), time);
  assert.equal(drawing.time, 110);
  handleInquiry('ix-record', ctx);
  assert.deepEqual(drawing.records, records);
 }
 assert.equal(seekInquiryTime(5, 110), true);
 assert.equal(observationTime(5), 110);
 assert.deepEqual(drawing.records, records);
});

test('supported experiments clamp their own time ranges and reject non-finite time without mutation', () => {
 for(const n of [1,5,6,7,8]){
  prepare(n);
  const maximum = n === 5 ? 110 : 100;
  assert.equal(seekInquiryTime(n, -30), true);
  assert.equal(observationTime(n), 0);
  assert.equal(seekInquiryTime(n, maximum + 200), true);
  assert.equal(liveTime(n), maximum);
  assert.equal(seekInquiryTime(n, -1), true);
  assert.equal(observationTime(n), 0);
  assert.equal(liveTime(n), maximum);
  const activities = structuredClone(state.activities);
  for(const value of [NaN, Infinity, -Infinity, 'not-a-number']){
   assert.equal(seekInquiryTime(n, value), false, `stage ${n}, value ${value}`);
   assert.equal(observationTime(n), 0);
   assert.deepEqual(state.activities, activities);
  }
 }
});

test('condensation needs two wiped cups, sealing and a prediction before time can advance', () => {
 for(const missing of ['cold','room','sealed','prediction']){
  prepare(7);
  if(missing === 'cold' || missing === 'room') state.activities.dew.wiped = state.activities.dew.wiped.filter(k => k !== missing);
  if(missing === 'sealed') state.activities.dew.sealed = false;
  if(missing === 'prediction') state.inquiry.dewHypothesis = '';
  assert.equal(seekInquiryTime(7, 100), false, missing);
  assert.equal(state.activities.dew.time, 0);
  assert.deepEqual(state.activities.dew.records, []);
 }
});

test('condensation saves the dry starting scene automatically and waits for explicit later recording', () => {
 prepare(7);
 assert.equal(seekInquiryTime(7, 90), true);
 const dew = state.activities.dew;
 assert.deepEqual(dew.records.map(r => r.kind), ['before']);
 assert.equal(dew.records[0].cold.time, 0);
 assert.equal(dew.records[0].cold.drops, 0);
 handleInquiry('ix-record', ctx);
 assert.deepEqual(dew.records.map(r => r.kind), ['before','after']);
 assert.equal(dew.records[1].cold.time, 90);
 assert.ok(dew.records[1].cold.drops > 0);
 assert.equal(dew.records[1].room.drops, 0);
 const records = structuredClone(dew.records);
 seekInquiryTime(7, 10);
 handleInquiry('ix-record', ctx);
 assert.equal(dew.time, 90);
 assert.deepEqual(dew.records, records);
});

test('rewiping starts a separate condensation clock without rewinding the original observations', () => {
 prepare(7);
 seekInquiryTime(7, 100);
 handleInquiry('ix-record', ctx);
 const records = structuredClone(state.activities.dew.records);
 handleInquiry('ix-wipe-middle', ctx);
 assert.equal(state.activities.dew.rewiped, true);
 assert.equal(state.activities.dew.againTime, 0);
 assert.equal(seekInquiryTime(7, 100), true);
 handleInquiry('ix-record', ctx);
 assert.equal(state.activities.dew.again, true);
 seekInquiryTime(7, 20);
 assert.equal(observationTime(7), 20);
 assert.equal(state.activities.dew.againTime, 100);
 assert.equal(state.activities.dew.time, 100);
 assert.deepEqual(state.activities.dew.records, records);
});

test('the new bottle experiment needs wiping and prediction and cannot be completed from a preview', () => {
 for(const missing of ['wiping','prediction']){
  prepare(8);
  if(missing === 'wiping') state.activities.explain.bottleWiped = false;
  else state.inquiry.transferPrediction = '';
  assert.equal(seekInquiryTime(8, 100), false, missing);
  handleInquiry('ix-record', ctx);
  assert.equal(state.activities.explain.transfer, false);
 }
 prepare(8);
 seekInquiryTime(8, 90);
 seekInquiryTime(8, 30);
 handleInquiry('ix-record', ctx);
 assert.equal(state.activities.explain.transfer, false);
 seekInquiryTime(8, 90);
 handleInquiry('ix-record', ctx);
 assert.equal(state.activities.explain.transfer, true);
});

test('forward, playback and recording share the same preparation guards as dragging', t => {
 let intervals = 0;
 t.mock.method(globalThis, 'setInterval', () => {intervals++; return {};});
 for(const n of [1,5,7,8]){
  reset(n);
  for(const action of ['ix-forward','ix-play','ix-record']){
   const before = structuredClone(state.activities);
   handleInquiry(action, ctx);
   assert.equal(liveTime(n), 0, `stage ${n}, ${action}`);
   assert.deepEqual(state.activities, before, `stage ${n}, ${action}`);
  }
 }
 assert.equal(intervals, 0);
});

test('forward resumes from the furthest observation and playback can prepare records without waiting', t => {
 let intervals = 0;
 t.mock.method(globalThis, 'setInterval', () => {intervals++; return {};});
 prepare(5);
 seekInquiryTime(5, 70);
 seekInquiryTime(5, 10);
 handleInquiry('ix-forward', ctx);
 assert.equal(state.activities.draw.time, 95);
 assert.equal(observationTime(5), 95);
 for(const n of [5,7]){
  prepare(n);
  handleInquiry('ix-play', ctx);
  const records = n === 5 ? state.activities.draw.records : state.activities.dew.records;
  assert.equal(records.length, 1);
  assert.equal(liveTime(n), 0);
  stop();
 }
 assert.equal(intervals, 2);
});

test('starting a new drawing clears old preview time and preserves its archived records', () => {
 prepare(5);
 seekInquiryTime(5, 110);
 const records = structuredClone(state.activities.draw.records);
 seekInquiryTime(5, 10);
 handleInquiry('ix-draw-new', ctx);
 assert.equal(observationTime(5), 0);
 assert.equal(state.activities.draw.time, 0);
 assert.deepEqual(state.activities.draw.records, []);
 assert.deepEqual(state.inquiry.drawArchive.at(-1).records, records);
 state.activities.draw.strokes = [[[20,30],[40,50],[60,30]]];
 seekInquiryTime(5, 50);
 assert.equal(observationTime(5), 50);
});

test('reviewing one experiment does not change the observation time of another', () => {
 prepare(5);
 seekInquiryTime(5, 100);
 seekInquiryTime(5, 20);
 state.activities.compare.time = 75;
 assert.equal(observationTime(5), 20);
 assert.equal(observationTime(6), 75);
 assert.equal(state.activities.draw.time, 100);
});
