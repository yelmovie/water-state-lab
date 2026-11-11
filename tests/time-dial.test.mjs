import test from 'node:test';
import assert from 'node:assert/strict';
import {mountTimeTools,paintTimeDial} from '../src/time-dial.js';

function classList(){
 const values=new Set();
 return {
  contains:name=>values.has(name),
  add:name=>values.add(name),
  remove:name=>values.delete(name),
  toggle(name,on){if(on)values.add(name);else values.delete(name);}
 };
}
function fixture(t,{waitControl=false,reduced=false}={}){
 const styles=new Map(),events=new Map(),attributes=new Map();
 const label={textContent:''},output={textContent:''};
 const magic={
  dataset:{},classList:classList(),disabled:false,
  style:{setProperty:(name,value)=>styles.set(name,value),getPropertyValue:name=>styles.get(name)||''},
  querySelector:selector=>selector==='.time-magic-label'?label:output,
  setAttribute:(name,value)=>attributes.set(name,value),
  addEventListener:(name,listener)=>events.set(name,listener),
  remove(){}
 };
 let mounted=false,playing=false,blocked=false;
 const progress={value:0};
 const range={value:0,max:100,classList:classList(),hasAttribute:()=>true,closest:()=>stage};
 const wait={disabled:false,click(){wait.disabled=true;}};
 const stage={
  dataset:{},classList:classList(),isConnected:true,
  append(){mounted=true;},
  querySelector(selector){
   if(selector==='[data-time-magic]')return mounted?magic:null;
   if(selector.includes('[data-inquiry-time]'))return waitControl?null:range;
   if(selector.includes('[data-tray-action='))return waitControl?wait:null;
   return progress;
  }
 };
 const previousDocument=globalThis.document,previousMedia=globalThis.matchMedia;
 globalThis.document={
  hidden:false,documentElement:{classList:classList()},createElement:()=>magic,
  querySelector:()=>blocked?{}:null,
  dispatchEvent(){wait.disabled=false;}
 };
 globalThis.matchMedia=()=>({matches:reduced});
 t.after(()=>{globalThis.document=previousDocument;globalThis.matchMedia=previousMedia;});
 const mount=()=>mountTimeTools(stage,()=>{playing=!playing;},()=>playing);
 mount();
 return {magic,range,wait,progress,styles,mount,output,
  click:()=>events.get('click')(),
  finishCast:()=>events.get('animationend')({animationName:'time-wand-tap'}),
  block:()=>{blocked=true;}
 };
}

test('the wand casts once when the clock starts and stays gone as progress advances',t=>{
 const f=fixture(t);
 assert.equal(f.magic.classList.contains('is-casting'),false);
 f.click();assert.equal(f.magic.classList.contains('is-casting'),true);
 assert.equal(f.styles.get('--time-start-minute'),'0deg');
 f.range.value=10;paintTimeDial(f.range);
 assert.equal(f.styles.get('--time-start-minute'),'0deg','progress must not restart the tap');
 f.finishCast();f.range.value=30;paintTimeDial(f.range);f.mount();
 assert.equal(f.magic.classList.contains('is-casting'),false);
 assert.equal(f.magic.classList.contains('is-running'),true);
 assert.equal(f.styles.get('--time-minute'),'432deg');
 assert.equal(f.output.textContent,'30%');
});

test('pausing cancels the tap and resuming casts from the saved hand position',t=>{
 const f=fixture(t);f.click();f.range.value=25;paintTimeDial(f.range);f.click();
 assert.equal(f.magic.classList.contains('is-running'),false);
 assert.equal(f.magic.classList.contains('is-casting'),false);
 f.click();assert.equal(f.styles.get('--time-start-minute'),'360deg');
 assert.equal(f.magic.classList.contains('is-casting'),true);
 f.range.value=100;paintTimeDial(f.range);
 assert.equal(f.magic.disabled,true);
 assert.equal(f.magic.classList.contains('is-casting'),false);
 assert.equal(f.magic.classList.contains('is-running'),false);
});

test('process clocks detect automatic starts and share the same pause behavior',t=>{
 const f=fixture(t,{waitControl:true});f.wait.click();f.mount();
 assert.equal(f.magic.classList.contains('is-casting'),true);
 f.finishCast();f.progress.value=50;f.mount();
 assert.equal(f.output.textContent,'50%');assert.equal(f.magic.classList.contains('is-casting'),false);
 f.click();assert.equal(f.wait.disabled,false);assert.equal(f.magic.classList.contains('is-running'),false);
});

test('reduced motion skips the wand while preserving the actual observation progress',t=>{
 const f=fixture(t,{reduced:true});f.click();f.range.value=40;paintTimeDial(f.range);
 assert.equal(f.magic.classList.contains('is-casting'),false);
 assert.equal(f.magic.classList.contains('is-running'),true);
 assert.equal(f.output.textContent,'40%');
});

test('an open dialog prevents starting a clock behind it',t=>{
 const f=fixture(t);f.block();f.click();
 assert.equal(f.magic.classList.contains('is-running'),false);
 assert.equal(f.magic.classList.contains('is-casting'),false);
});

 test("guided clock highlights preserve absolute placement",async()=>{
 const {readFile}=await import("node:fs/promises");
 const css=await readFile(new URL("../src/experience.css",import.meta.url),"utf8");
 assert.ok(css.includes(".guided-control:not(.phaser-stage):not(#field-canvas):not(.time-magic){position:relative;z-index:2}"));
 assert.ok(!css.includes(".guided-control:not(.phaser-stage):not(#field-canvas){position:relative"));
 });

test("clock arrival cue hides on first use and stays hidden when paused",t=>{
 const f=fixture(t);
 assert.equal(f.magic.classList.contains("needs-attention"),true);
 assert.match(f.magic.innerHTML,/time-tap-cue/);
 f.click();assert.equal(f.magic.classList.contains("needs-attention"),false);
 f.click();f.mount();assert.equal(f.magic.classList.contains("needs-attention"),false);
});
test("automatic observation and completion do not ask for another tap",t=>{
 const f=fixture(t,{waitControl:true});
 f.wait.click();f.mount();assert.equal(f.magic.classList.contains("needs-attention"),false);
 f.click();f.mount();assert.equal(f.magic.classList.contains("needs-attention"),false);
 f.progress.value=100;f.mount();assert.equal(f.magic.classList.contains("needs-attention"),false);
});
test("reduced motion keeps the static arrival cue available",t=>{
 const f=fixture(t,{reduced:true});assert.equal(f.magic.classList.contains("needs-attention"),true);
 f.click();assert.equal(f.magic.classList.contains("needs-attention"),false);
});
