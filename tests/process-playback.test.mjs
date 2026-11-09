import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities} from '../src/activity-model.js';
import {chapterState} from '../src/fieldwork-model.js';
import {bindMeasure,measureAction,measureStatus} from '../src/freeze-measure.js';
import {bindCycle,cycleAction,cycleStatus} from '../src/greenhouse-cycle.js';

// Exercise the real click listeners and animation callbacks. Pure model tests do
// not catch missing runtime dependencies between a control and its clock.
function playbackHarness(t,prefix){
 const old={document:globalThis.document,performance:globalThis.performance,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 let now=0,id=0,paints=0;const frames=new Map(),cleanups=[];
 const events=()=>{
  const listeners=new Map();
  return {
   addEventListener(name,handler,{signal}={}){const list=listeners.get(name)||new Set();list.add(handler);listeners.set(name,list);signal?.addEventListener('abort',()=>list.delete(handler),{once:true});},
   dispatchEvent(event){for(const handler of [...(listeners.get(event.type)||[])])handler(event);}
  };
 };
 const action={dataset:{[prefix+'Action']:'wait'},disabled:false,focus(){},closest(selector){return selector===`[data-${prefix}-action]`?this:null;}};
 const pause={hidden:true,closest(selector){return selector===`[data-${prefix}-pause]`?this:null;}};
 const clock={textContent:''},progress={value:0},source={textContent:''},drops={innerHTML:''};
 const host={...events(),querySelector(selector){
  if(selector===`[data-${prefix}-action="wait"]`||selector===`[data-${prefix}-action],[data-action="field-finish"]`)return action;
  if(selector===`[data-${prefix}-pause]`)return pause;
  if(selector===`[data-${prefix}-clock]`)return clock;
  if(selector===`[data-${prefix}-progress]`)return progress;
  if(selector==='[data-cycle-source]')return source;
  if(selector==='[data-cycle-droplets]')return drops;
  return null;
 },set innerHTML(value){paints++;action.disabled=false;pause.hidden=true;}};
 const doc={...events(),hidden:false,dialog:false,querySelector(selector){return selector==='dialog[open]'&&this.dialog?{}:null;},getElementById(){return null;}};
 globalThis.document=doc;globalThis.performance={now:()=>now};
 globalThis.requestAnimationFrame=callback=>{frames.set(++id,callback);return id;};
 globalThis.cancelAnimationFrame=frame=>frames.delete(frame);
 t.after(()=>{for(const cleanup of cleanups)cleanup();Object.assign(globalThis,old);});
 return {host,doc,action,pause,progress,frames,clock,onCleanup:cleanup=>cleanups.push(cleanup),
  click(){host.dispatchEvent({type:'click',target:action});},
  advance(milliseconds){now+=milliseconds;const queued=[...frames.values()];frames.clear();for(const callback of queued)callback(now);},
  get paints(){return paints;}
 };
}

for(const speed of [.25,.5,1,2]){
 test(`freezing and melting advance to the next stage at ${speed}×`,t=>{
  const h=playbackHarness(t,'measure'),f=initialActivities().freeze,settings={observationSpeed:speed};
  measureAction(f,'measure');f.predicted=true;measureAction(f,'load');
  let renders=0;
  const cleanup=bindMeasure(h.host,()=>f,{save(){},render(){renders++;h.action.disabled=false;h.pause.hidden=true;},reduced:()=>false,settings});h.onCleanup(cleanup);
  h.click();assert.equal(h.frames.size,1,'waiting schedules an animation');
  h.advance(2000/speed);assert.equal(measureStatus(f).time,50);assert.equal(measureStatus(f).stage,'cooling');
  h.advance(2000/speed);assert.equal(measureStatus(f).stage,'frozen');assert.equal(h.frames.size,0);assert.equal(renders,1);
  measureAction(f,'take');measureAction(f,'measure-ice');measureAction(f,'rest');
  h.click();h.advance(4000/speed);
  assert.equal(measureStatus(f).stage,'melted');assert.equal(renders,2);assert.equal(h.frames.size,0);
 });

 test(`greenhouse evaporation and condensation advance at ${speed}×`,t=>{
  const h=playbackHarness(t,'cycle'),c=chapterState(10),settings={observationSpeed:speed};
  const commit=(step,time)=>cycleAction(c,{step,time});commit('prepare');
  const cleanup=bindCycle(h.host,()=>c,commit,()=>false,settings);h.onCleanup(cleanup);
  h.click();assert.equal(h.frames.size,1,'waiting schedules an animation');
  h.advance(2250/speed);assert.equal(cycleStatus(c).time,50);assert.equal(cycleStatus(c).stage,'evaporating');
  h.advance(2250/speed);assert.equal(cycleStatus(c).stage,'evaporated');assert.equal(h.frames.size,0);assert.equal(h.paints,1);
  for(const step of ['observe','receiver','cool'])commit(step);
  h.click();h.advance(4500/speed);
  assert.equal(cycleStatus(c).stage,'droplets');assert.equal(h.paints,2);assert.equal(h.frames.size,0);
 });
}

test('freezing resumes its saved progress, honors live speed changes, and cancels on leaving',t=>{
 const h=playbackHarness(t,'measure'),f=initialActivities().freeze,settings={observationSpeed:.5};
 measureAction(f,'measure');f.predicted=true;measureAction(f,'load');
 const cleanup=bindMeasure(h.host,()=>f,{save(){},render(){h.action.disabled=false;h.pause.hidden=true;},reduced:()=>false,settings});h.onCleanup(cleanup);
 h.click();h.advance(1000);assert.equal(f.processTime,12);
 h.doc.dispatchEvent(new Event('observation-stop'));
 assert.equal(h.frames.size,0);assert.equal(h.action.disabled,false);assert.equal(h.pause.hidden,true);
 h.advance(10000);assert.equal(f.processTime,12,'paused time is not counted');
 h.click();h.advance(1000);assert.equal(f.processTime,24);
 settings.observationSpeed=2;h.advance(1000);assert.equal(f.processTime,74,'the new speed continues without resetting');
 cleanup();h.advance(10000);assert.equal(f.processTime,74);assert.equal(h.frames.size,0);
 h.click();assert.equal(h.frames.size,0,'old controls do nothing after navigation');
});

test('greenhouse pauses when hidden and does not retain callbacks after leaving',t=>{
 const h=playbackHarness(t,'cycle'),c=chapterState(10),settings={observationSpeed:1};
 const commit=(step,time)=>cycleAction(c,{step,time});commit('prepare');
 const cleanup=bindCycle(h.host,()=>c,commit,()=>false,settings);h.onCleanup(cleanup);
 h.click();h.advance(900);assert.equal(cycleStatus(c).time,20);
 h.doc.hidden=true;h.doc.dispatchEvent(new Event('visibilitychange'));
 assert.equal(h.frames.size,0);h.advance(10000);assert.equal(cycleStatus(c).time,20);
 h.doc.hidden=false;h.click();h.advance(900);assert.equal(cycleStatus(c).time,40);
 cleanup();h.advance(10000);assert.equal(cycleStatus(c).time,40);assert.equal(h.frames.size,0);
 h.click();assert.equal(h.frames.size,0);
});
