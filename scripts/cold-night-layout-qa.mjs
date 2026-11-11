// Run against a local server, or QA_URL for a deployed build. No dependencies installed here.
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PW_MODULE||'/Volumes/T7 Shield/DevCaches/playwright-runner/node_modules/playwright/index.mjs');
const out=process.env.QA_OUT||'.tmp/cold-overlap-qa';await mkdir(out,{recursive:true});
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter','--disable-breakpad','--use-mock-keychain']});
try{const p=await browser.newPage({hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(String(e)));await p.goto(process.env.QA_URL||'http://127.0.0.1:4336');await p.locator('[data-action=title-start]').waitFor();
for(const [w,h] of [[1811,850],[1280,800],[1024,768],[1024,600],[768,1024],[844,390],[390,844]])for(const night of [1,2,3]){
await p.setViewportSize({width:w,height:h});await p.evaluate(async night=>{const {state,initialState}=await import('/src/state.js'),{chapterState}=await import('/src/fieldwork-model.js');Object.assign(state,initialState());Object.assign(state.settings,{sound:false,bgm:false,reduced:true});state.route=4;state.pages=[1,2,3,4];state.completed=[1];state.inquiry.stageBriefed=[4];state.fieldwork.active=4;state.fieldwork.briefed=[4];state.fieldwork.introSeen=true;const c=chapterState(4);c.marks=Array.from({length:night-1},(_,i)=>'night-'+(i+1));c.moves[`fill-${night}-0`]='29';state.fieldwork.chapters[4]=c;(await import('/src/app.js')).render()},night);
await p.waitForTimeout(180);
const r=await p.evaluate(()=>{const sels=['.cold-intro','.cold-top','.transform-progress','.cold-goal','.cold-row','.cold-taps'];const rs=Object.fromEntries(sels.map(s=>{const e=document.querySelector(s);return [s,{...e.getBoundingClientRect().toJSON(),position:getComputedStyle(e).position,topStyle:getComputedStyle(e).top}]}));const a=rs['.transform-progress'];return {rs,overlap:[...document.querySelectorAll('.cold-taps,.cold-goal,.building-guide')].some(e=>{const b=e.getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top}),clipped:a.left<0||a.right>innerWidth||a.top<0||a.bottom>innerHeight}});
console.log(JSON.stringify({w,h,night,...r}));assert.equal(r.overlap,false);assert.equal(r.clipped,false);
if(night===3)await p.screenshot({path:`${out}/after-${w}.png`});
await p.locator('[data-pour="0"][data-dir="1"]').tap();
assert.ok(Number(await p.locator('[data-total]').textContent())>29,'touch fills water');
await p.locator('[data-pour="0"][data-dir="-1"]').tap();
assert.equal(Number(await p.locator('[data-total]').textContent()),29,'touch drains water');
}
assert.deepEqual(errors,[]);
}finally{await browser.close()}
