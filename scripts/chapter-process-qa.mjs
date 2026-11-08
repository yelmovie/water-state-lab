// Isolated browser checks. Use an externally stored Playwright installation; no dependencies are installed here.
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PW_MODULE||'/Volumes/T7 Shield/DevCaches/playwright-runner/node_modules/playwright/index.mjs');
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.env.QA_OUT||fileURLToPath(new URL('../.tmp/visual-qa/all-chapters-20261108/',import.meta.url));
await mkdir(out,{recursive:true});
const browser=await chromium.launch({...(process.env.QA_BROWSER?{executablePath:process.env.QA_BROWSER}:{channel:'chrome'}),headless:true,args:['--disable-crash-reporter','--disable-breakpad','--use-mock-keychain']});
const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,hasTouch:process.argv[2]==='touch'});
const page=await context.newPage(),errors=[],checks=[],layouts=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
page.setDefaultTimeout(10000);
await page.goto(process.env.QA_URL||'http://127.0.0.1:4316/',{waitUntil:'networkidle'});
async function hook(){await page.evaluate(()=>{if(Phaser.Game.__qaWrapped)return;const Base=Phaser.Game;Phaser.Game=class extends Base{static __qaWrapped=true;constructor(...args){super(...args);window.__qaGame=this;}};});}await hook();
const get=()=>page.evaluate(async()=>(await import('/src/state.js')).state);
async function setup(n,field=false,reduced=true,reset=true){
 await page.evaluate(async({n,field,reduced,reset})=>{
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  const {state,initialState,setPreviewMode,save}=await import('/src/state.js'),{chapterState}=await import('/src/fieldwork-model.js'),{render}=await import('/src/app.js');
  setPreviewMode(false);if(reset)Object.assign(state,initialState());
  Object.assign(state.settings,{sound:false,bgm:false,sfx:false,reduced,adminUnlock:false});
  state.route=n;state.lastScreen=n;state.pages=Array.from({length:n-1},(_,i)=>i+1);state.completed=Array.from({length:Math.floor((n-1)/2)},(_,i)=>i+1);
  state.fieldwork.introSeen=true;state.fieldwork.briefed=[2,4,10];state.inquiry.stageBriefed=Array.from({length:10},(_,i)=>i+1);state.fieldwork.active=field?n:0;
  if(field&&reset)state.fieldwork.chapters[n]=chapterState(n);save();render();
 },{n,field,reduced,reset});
 await page.waitForTimeout(180);
}
const click=async action=>{const el=page.locator(`[data-action="${action}"]`).first();await el.evaluate(e=>{for(let p=e;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;}).catch(()=>{});await el.click();await page.waitForTimeout(120);};
const measure=async step=>{await page.locator(`[data-measure-action="${step}"]`).click();await page.waitForTimeout(60);};
const cycle=async step=>{await page.locator(`[data-cycle-action="${step}"]`).click();await page.waitForTimeout(60);};
const ready=async n=>{await page.locator(n===3?'#freeze-measure':n===4?'#freeze-bench':n===8?'.phaser-stage[data-ready=true],.stage-guard':'.phaser-stage[data-ready=true]').waitFor();};
const shot=async name=>page.screenshot({path:`${out}/${name}.png`,fullPage:true});
const audit=()=>{
 const issues=[],visible=e=>{if(e.closest('[hidden],.sr-only,dialog:not([open])'))return false;for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden')return false;}const d=e.closest('details:not([open])');return (!d||!!e.closest('summary'))&&e.getBoundingClientRect().width>1;};
 if(document.documentElement.scrollWidth>innerWidth+2)issues.push('horizontal overflow');
 if(document.querySelectorAll('#field-greenhouse').length>1)issues.push('duplicate greenhouse root');
 for(const e of document.querySelectorAll('button,summary,input,select')){if(!visible(e))continue;const r=e.getBoundingClientRect(),name=(e.textContent||e.getAttribute('aria-label')||e.id).trim().slice(0,35);
  if(e.tagName!=='INPUT'&&(r.width<40||r.height<40))issues.push(`small target ${name} ${r.width}x${r.height}`);
  if(r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight){let clipped=false;for(let p=e.parentElement;p;p=p.parentElement){const pr=p.getBoundingClientRect(),cs=getComputedStyle(p);if(/hidden|clip|auto|scroll/.test(cs.overflowY)&&(r.top+r.height/2<pr.top||r.top+r.height/2>pr.bottom))clipped=true;}
   const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(!clipped&&hit&&!e.contains(hit)&&!hit.contains(e))issues.push(`covered ${name} by ${hit.className}`);
  }
 }
 for(const img of document.querySelectorAll('img'))if(visible(img)&&img.complete&&!img.naturalWidth)issues.push('broken image '+img.src);
 return [...new Set(issues)];
};
async function layout(name){const issues=await page.evaluate(audit);layouts.push({name,viewport:page.viewportSize(),issues});await shot(name);}
async function world(x,y){return page.evaluate(({x,y})=>{const game=window.__qaGame,cam=game.scene.getScenes(true)[0].cameras.main,r=game.canvas.getBoundingClientRect(),o=cam.getWorldPoint(0,0),p=cam.getWorldPoint(1,1);return {x:r.x+(x-o.x)/(p.x-o.x)*r.width/game.canvas.width,y:r.y+(y-o.y)/(p.y-o.y)*r.height/game.canvas.height};},{x,y});}
async function tap(x,y){await ready((await get()).route);const p=await world(x,y);await page.mouse.click(p.x,p.y);await page.waitForTimeout(160);}
async function drag(x,y,tx,ty){const a=await world(x,y),b=await world(tx,ty);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:20});await page.mouse.up();await page.waitForTimeout(200);}
async function scrub(n,end=true){await page.locator(`#inquiry-time-${n}`).focus();await page.keyboard.press(end?'End':'Home');await page.waitForTimeout(120);}
async function isReady(n){return page.evaluate(async n=>{const {state}=await import('/src/state.js');return !!(await import('/src/activity-model.js')).activityReady(n,state.activities);},n);}
async function complete(n){assert.equal(await isReady(n),true,`chapter ${n}`);await layout(`flow-lab-${n}-done`);checks.push(`lab-${n}`);console.log('PASS lab '+n);}
try{
 if(process.argv[2]==='flow'){
  await setup(1);await ready(1);
  await click('ix-pour-auto');
  // Target selection is on the canvas; the second pour still uses the actual accessible button.
  await tap(570,158);
  await click('ix-pour-auto');await click('act-observe-step-1');await ready(1);await drag(440,203,590,203);
  assert.equal((await get()).activities.observe.iceMoved,true);await click('act-observe-step-2');await ready(1);await tap(360,160);await scrub(1);await click('ix-record');await complete(1);
  await setup(2);await ready(2);
  for(const [i,type] of ['solid','liquid','gas','solid','liquid','gas'].entries()){await tap(86+(i%3)*155,77+Math.floor(i/3)*151);await tap(600,70+['solid','liquid','gas'].indexOf(type)*84);}
  await complete(2);
  await setup(3);await measure('measure');await click('act-freeze-guess-66');await measure('load');await layout('flow-freeze-cooling');
  await measure('wait');await measure('take');await measure('measure-ice');assert.equal((await get()).activities.freeze.records.length,2);
  await measure('rest');await measure('wait');await measure('measure-melt');assert.equal(await isReady(3),false);await measure('compare');await complete(3);
  await click('act-talk-pop-no');await click('act-talk-chill');await click('act-talk-pipe-burst');
  await setup(4);await page.locator('[data-bench-run]').click();await page.waitForTimeout(250);
  for(let i=0;i<5;i++)await page.locator('[data-bench-less]').press('Enter');
  await page.locator('[data-bench-run]').click();await page.waitForTimeout(250);await click('act-pipe-mark-1');await complete(4);
  await setup(5);await ready(5);const a=await world(60,110),b=await world(290,200);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:35});await page.mouse.up();await page.waitForTimeout(180);
  assert.ok((await get()).activities.draw.strokes[0].length>=3);await click('ix-draw-predict-thin');await scrub(5);await click('ix-draw-answer-thin');await click('ix-draw-where-air');await complete(5);
  const strokes=(await get()).activities.draw.strokes;await page.reload({waitUntil:'networkidle'});await hook();await ready(5);assert.deepEqual((await get()).activities.draw.strokes,strokes);checks.push('drawing-reload');
  await setup(6);await ready(6);await scrub(6);await click('ix-record');let h=(await get()).activities.compare;assert.equal(h.records[0].room,h.records[0].heated);await click('ix-heat-prepare');await click('ix-heat-on');await scrub(6);await click('ix-record');await click('ix-heat-where-air');await complete(6);
  await setup(7);await click('ix-dew-predict-air');await click('ix-wipe-cold');if(!(await get()).activities.dew.wiped.includes('room'))await click('ix-wipe-room');if(!(await get()).activities.dew.sealed)await click('act-dew-seal');await scrub(7);await click('ix-record');await click('ix-wipe-middle');await scrub(7);await click('ix-record');await complete(7);
  await click('act-next-7');if(await page.locator('dialog[open] #close-dialog').count())await page.locator('#close-dialog').click();await ready(8);
  for(const [key,x] of [['sealed',130],['contrast',360]])if(!(await get()).activities.explain.evidence.includes(key))await tap(x,85);
  for(const k of ['air','cold','drops'])await click('ix-chain-'+k);
  await click('ix-transfer-predict-cold');await click('ix-bottle-start');await scrub(8);await click('ix-record');await complete(8);
  await setup(9);await ready(9);await click('toggle-cold');await click('ramp-tilt');await click('funnel-fix');
  await page.locator('[data-action="test-workshop"]').evaluate(e=>e.closest('details').open=true);await click('test-workshop');
  assert.equal((await get()).lab.workshop.trials.at(-1).ok,true);await layout('flow-lab-9-done');checks.push('lab-9');
  await click('complete-5');if(await page.locator('dialog[open] #close-dialog').count())await page.locator('#close-dialog').click();await ready(10);
  const fault=(await get()).lab.final.diagnosis.fault;
  if(!(await get()).lab.final.diagnosis.tests.length)await click('diagnosis-test');
  await click('diagnose-'+fault);await click(fault==='cooling'?'core-cooling':'core-funnel');await click('diagnosis-test');
  assert.equal((await get()).lab.final.diagnosis.resolved,true);if(!(await get()).lab.final.connected)await click('connect-core');
  await page.locator('#core-inlet-height').focus();await page.keyboard.press('Home');
  await click('core-toggle-valve');if(!(await get()).lab.final.tested)await click('test-core');
  assert.equal((await get()).lab.final.tested,true);await layout('flow-lab-10-done');checks.push('lab-10-'+fault);
  await click('core-activate');assert.equal((await get()).fieldwork.pending,'field-ending');
  for(const step of ['prepare','wait','observe','receiver','cool','wait','collect','compare'])await cycle(step);
  await click('field-finish');await page.locator('dialog.concept-dialog[open]').waitFor();assert.equal((await get()).restored,false);
  await page.locator('[data-concept="continue"]').click();await page.locator('.ending-main').waitFor();assert.equal((await get()).restored,true);checks.push('core-to-field10-concept-ending');
  await page.reload({waitUntil:'networkidle'});await hook();assert.equal((await get()).route,'ending');assert.equal((await get()).fieldwork.chapters[10].done,true);checks.push('ending-reload');
  await setup(2,true);for(const step of ['fill','load','wait','take','compare'])await page.locator(`[data-tray-action="${step}"]`).click();await page.locator('[data-transform-next]').click();
  for(const [kind,steps] of Object.entries({melt:['place','wait','compare'],evaporate:['fill','heat','wait','stop','compare'],condense:['dry','cool','wait','wipe','wait','compare']})){for(const step of steps)await page.locator(`[data-process-action="${step}"]`).click();await page.locator('[data-transform-next]').click();}
  assert.equal((await get()).fieldwork.chapters[2].done,true);checks.push('field-2');await layout('flow-field-2-done');
  await setup(4,true);for(let n=1;n<=3;n++){
   for(let i=0;i<n;i++)for(let j=0;j<17;j++)await page.locator(`[data-pour="${i}"][data-dir="1"]`).press('Enter');
   await page.locator('[data-night-start]').click();await page.locator('[data-night-next]').click();
  }await page.locator('[data-reason="grow"]').click();assert.equal((await get()).fieldwork.chapters[4].done,true);checks.push('field-4');await layout('flow-field-4-done');
  await setup(10,true);for(const step of ['prepare','wait','observe','receiver','cool','wait','collect','compare']){await cycle(step);await layout('flow-greenhouse-'+step+(step==='wait'?'-'+(await get()).fieldwork.chapters[10].moves.cycleStage:''));}
  assert.equal((await get()).fieldwork.chapters[10].done,true);checks.push('field-10');
  await page.reload({waitUntil:'networkidle'});assert.equal((await get()).fieldwork.chapters[10].done,true);checks.push('greenhouse-reload');
 }else if(process.argv[2]==='states'){
  const stages=['start','measured','cooling','frozen','taken','ice-measured','resting','melted','melt-measured','compared'];
  const cycles=['start','evaporating','evaporated','observed','receiving','condensing','droplets','collected','compared'];
  for(const [w,h] of [[1280,800],[1024,600],[915,412],[390,844]]){
   await page.setViewportSize({width:w,height:h});
   for(const stage of stages){
    await setup(3);await page.evaluate(async stage=>{const {state,save}=await import('/src/state.js'),{measureAction,measureStatus}=await import('/src/freeze-measure.js');const f=state.activities.freeze;for(const step of ['measure','load','wait','take','measure-ice','rest','wait','measure-melt','compare']){if(measureStatus(f).stage===stage)break;if(step==='load')f.predicted=true;measureAction(f,step,100);}save();(await import('/src/app.js')).render();},stage);await layout(`state-measure-${stage}-${w}x${h}`);
   }
   for(const stage of cycles){
    await setup(10,true);await page.evaluate(async stage=>{const {state,save}=await import('/src/state.js'),{fieldAction}=await import('/src/fieldwork-model.js'),{cycleStatus}=await import('/src/greenhouse-cycle.js');let c=state.fieldwork.chapters[10];for(const step of ['prepare','wait','observe','receiver','cool','wait','collect','compare']){if(cycleStatus(c).stage===stage)break;c=fieldAction(10,c,'greenhouse-cycle',{step,time:100});}state.fieldwork.chapters[10]=c;save();(await import('/src/app.js')).render();},stage);await layout(`state-greenhouse-${stage}-${w}x${h}`);
   }
  }
 }else if(process.argv[2]==='touch'){
  await page.setViewportSize({width:1024,height:600});
  await setup(3);const t=selector=>page.locator(selector).tap();
  await t('[data-measure-action="measure"]');await t('[data-action="act-freeze-guess-66"]');
  for(const step of ['load','wait','take','measure-ice','rest','wait','measure-melt','compare'])await t(`[data-measure-action="${step}"]`);
  assert.equal(await isReady(3),true);await layout('touch-measure-done');checks.push('measure-touch');
  await setup(10,true);for(const step of ['prepare','wait','observe','receiver','cool','wait','collect','compare'])await t(`[data-cycle-action="${step}"]`);
  assert.equal((await get()).fieldwork.chapters[10].done,true);assert.equal(await page.locator('#field-greenhouse').count(),1);await layout('touch-greenhouse-done');checks.push('greenhouse-touch');
 }else if(process.argv[2]==='motion'){
  await setup(3,false,false);await measure('measure');await click('act-freeze-guess-66');await measure('load');await measure('wait');await page.waitForTimeout(850);
  let f=(await get()).activities.freeze;assert.ok(f.processTime>0&&f.processTime<100);await click('stage-letter');await page.waitForTimeout(120);const paused=(await get()).activities.freeze.processTime;await page.waitForTimeout(500);assert.equal((await get()).activities.freeze.processTime,paused);await page.locator('#close-dialog').click();
  await page.reload({waitUntil:'networkidle'});await hook();assert.equal((await get()).activities.freeze.processTime,paused);assert.equal((await get()).activities.freeze.processStage,'cooling');
  await measure('wait');await page.locator('[data-measure-action="take"]').waitFor();await measure('take');await measure('measure-ice');checks.push('measure-motion-modal-pause-reload');
  await setup(10,true,false);await cycle('prepare');await cycle('wait');await page.waitForTimeout(800);let c=(await get()).fieldwork.chapters[10];assert.ok(+c.moves.cycleTime>0&&+c.moves.cycleTime<100);await click('field-help');await page.waitForTimeout(120);const t=(await get()).fieldwork.chapters[10].moves.cycleTime;await page.waitForTimeout(500);assert.equal((await get()).fieldwork.chapters[10].moves.cycleTime,t);await page.locator('#close-dialog').click();
  await page.reload({waitUntil:'networkidle'});assert.equal((await get()).fieldwork.chapters[10].moves.cycleTime,t);await cycle('wait');await page.locator('[data-cycle-action="observe"]').waitFor();
  for(const step of ['observe','receiver','cool','wait'])await cycle(step);await page.locator('[data-cycle-action="collect"]').waitFor();await cycle('collect');await cycle('compare');assert.equal((await get()).fieldwork.chapters[10].done,true);checks.push('greenhouse-motion-modal-pause-reload');await layout('motion-greenhouse-done');
 }else if(process.argv[2]==='preview'){
  await setup(3);await ready(3);await layout('measure-initial');
  await setup(10,true);await layout('greenhouse-initial');
 }else{
  for(const [w,h] of [[1280,800],[1024,600],[915,412],[390,844]]){
   await page.setViewportSize({width:w,height:h});
   for(let n=1;n<=10;n++){
    await setup(n);if(n===8){await page.evaluate(async()=>{const {state}=await import('/src/state.js');state.settings.adminUnlock=true;(await import('/src/app.js')).render();});}
    if(n===10){await page.evaluate(async()=>{const {state}=await import('/src/state.js');state.settings.adminUnlock=true;(await import('/src/app.js')).render();});}
    await ready(n);await layout(`lab-${n}-${w}x${h}`);
   }
   for(const n of [2,4,10]){await setup(n,true);await layout(`field-${n}-${w}x${h}`);}
  }
 }
}catch(e){errors.push(e.stack);await shot('failure');throw e;}
finally{await writeFile(`${out}/report-${process.argv[2]||'layout'}.json`,JSON.stringify({checks,layouts,errors},null,2));await Promise.race([context.close().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,5000))]);await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,8000))]);console.log(JSON.stringify({checks,layoutScreens:layouts.length,issues:layouts.filter(x=>x.issues.length),errors}));process.exit(errors.length||layouts.some(x=>x.issues.length)?1:0);}
