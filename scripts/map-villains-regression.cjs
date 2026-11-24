const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--disable-crash-reporter','--disable-breakpad','--use-mock-keychain']});const results=[];fs.mkdirSync(process.env.TEST_OUT || 'output',{recursive:true});
for(const [id,port] of [[6,5186]]){
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:'+port);
 const ready=page.locator('.journey-world .mv-target[data-state=ready]');
 for(let completed=0;completed<=5;completed++){
  await page.evaluate(async completed=>{
   const {state}=await import('/src/state.js');
   const {render}=await import('/src/app.js');
   state.completed=Array.from({length:completed},(_,i)=>i+1);
   state.pages=Array.from({length:Math.min(completed*2+1,9)},(_,i)=>i+1);
   state.route='map';render();
  },completed);
  const expected=Array.from({length:Math.min(completed,4)},(_,i)=>String(i));
  assert.deepEqual(await ready.evaluateAll(nodes=>nodes.map(node=>node.dataset.stage)),expected);
  assert.equal(await page.locator('.journey-world .mv-target').count(),expected.length);
 }
 await page.evaluate(async()=>{
  const {state}=await import('/src/state.js');
  const {render}=await import('/src/app.js');
  state.pages.push(10);state.restored=true;render();
 });
 assert.deepEqual(await ready.evaluateAll(nodes=>nodes.map(node=>node.dataset.stage)),['0','1','2','3','4']);
 await page.screenshot({path:(process.env.TEST_OUT || 'output')+'/'+id+'-map.png'});
 // Isolated fixture exercises actual shipped module, never changes learner evidence.
 // Attacks now need Bangul within reach (map-villains.js RANGE), so the fixture stands a stub fighter beside the villain.
 async function fixture(preview=false,reduced=false,token='attempt-one'){await page.evaluate(async({preview,reduced,token})=>{window.fixtureCleanup?.();let world=document.getElementById('qa-world');if(!world){world=document.createElement('div');world.id='qa-world';document.body.append(world);}world.style='position:fixed;inset:0;z-index:99999;background:#acd6c8';const {mountMapVillains}=await import('/src/map-villains.js');window.fixtureSounds=[];window.fixtureCleanup=mountMapVillains(world,{key:'qa-villains',power:'과학 파동',preview,reduced,stages:[{ready:false},{name:'테스트 구역',x:50,y:50,ready:true,token}],sound:x=>window.fixtureSounds.push(x),fighter:{at:()=>({x:44,y:50}),pose(){},hurt(){}}});},{preview,reduced,token});}
 await fixture();const target=page.locator('#qa-world .mv-target');await target.tap();assert.equal(await target.locator('.mv-meter').innerText(),'● ● ○');await page.waitForTimeout(1250);await target.focus();await page.keyboard.press('Enter');await page.waitForTimeout(1250);await page.keyboard.press('Space');assert.equal(await target.getAttribute('data-state'),'leaving');await page.waitForTimeout(1600);assert.equal(await target.getAttribute('data-state'),'cleared');assert.equal(await target.locator('.mv-creature').isVisible(),false);assert.equal(await page.evaluate(()=>window.fixtureSounds.filter(k=>k==='hit'||k==='finish').length),3);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('qa-villains'))),{'1':'attempt-one'});
 await page.reload();await fixture();assert.equal(await target.getAttribute('data-state'),'cleared');await page.evaluate(()=>localStorage.removeItem('qa-villains'));await fixture(true,true,'attempt-two');for(let i=0;i<3;i++){await target.tap();await page.waitForTimeout(150);}assert.equal(await target.getAttribute('data-state'),'cleared');assert.equal(await page.evaluate(()=>localStorage.getItem('qa-villains')),null);await fixture(false,false,'attempt-two');assert.equal(await target.getAttribute('data-state'),'ready');await target.tap();await page.evaluate(()=>window.fixtureCleanup());await page.waitForTimeout(400);assert.equal(await page.locator('#qa-world .mv-target').count(),0);assert.deepEqual(errors,[]);results.push({project:id,stageAppearances:true,touchKeyboard:true,exit:true,reload:true,previewIsolation:true,reducedMotion:true,cleanup:true,errors});await context.close();}
await browser.close();fs.writeFileSync((process.env.TEST_OUT || 'output')+'/map-villains-qa.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));})().catch(e=>{console.error(e);process.exit(1)});
