// Run after npm run build. All browser profiles and output must use the external TMPDIR.
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {initialState,KEY} from '../src/state.js';
const {chromium}=await import(process.env.PW_MODULE||'/Volumes/T7 Shield/DevCaches/playwright-runner/node_modules/playwright/index.mjs');
const root=path.resolve('dist');
const currentWorker=await readFile(path.join(root,'sw.js'),'utf8');
const oldWorker=currentWorker.replace(/^const CACHE=.*;$/m,'const CACHE="water-qa-legacy",SHELL=["/"],LATER=[];');
const oldPage=`<!doctype html><html><body><h1 id="legacy">Previous release</h1><script>
addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').then(reg=>reg.waiting?.postMessage('skip-waiting')));
</script></body></html>`;
let generation=0;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json','.svg':'image/svg+xml','.mp4':'video/mp4'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://localhost').pathname;
  res.setHeader('Cache-Control','no-store');
  if(pathname==='/sw.js'){
   res.setHeader('Content-Type','text/javascript');
   const source=generation===0?oldWorker:generation===1?currentWorker:currentWorker.replace(/water-[a-f0-9]{12}/,`water-qa-next-${generation}`);
   res.end(source);return;
  }
  if(generation===0&&pathname==='/'){res.setHeader('Content-Type','text/html');res.end(oldPage);return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  res.end(await readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-crash-reporter','--disable-breakpad','--use-mock-keychain']});
const context=await browser.newContext();
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
try{
 await page.goto(url);
 await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const saved=initialState();saved.pages=[1,2];saved.completed=[1];saved.settings.sound=false;saved.settings.bgm=false;
 await page.evaluate(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key:KEY,saved});
 generation=1;
 // Reproduce the original failure in an already controlled tab.
 await page.reload();
 await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting,null,{timeout:60000});
 assert.equal(await page.locator('#legacy').count(),1,'old page remains after the new worker has installed');
 // Recover via a URL that the old worker has never cached.
 await page.goto(url+'/update.html');
 await page.locator('[data-action="drop-start"]').waitFor({timeout:60000});
 const progress=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
 assert.deepEqual((await progress()).pages,[1,2]);
 assert.deepEqual((await progress()).completed,[1]);
 // Later updates must offer a button, keep the current screen, and reload on application.
 generation=2;
 await page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update();});
 await page.locator('#app-update').waitFor({timeout:60000});
 assert.equal(await page.locator('[data-action="drop-start"]').count(),1);
 await page.locator('#app-update').click();
 await page.waitForFunction(async()=>!(await caches.keys()).includes('water-qa-legacy')&&(await caches.keys()).includes('water-qa-next-2'));
 await page.waitForFunction(()=>!!document.querySelector('[data-action="drop-start"]')&&!document.querySelector('#app-update'));
 assert.deepEqual((await progress()).pages,[1,2]);
 assert.deepEqual((await progress()).completed,[1]);
 await context.setOffline(true);
 await page.reload();
 await page.locator('[data-action="drop-start"]').waitFor();
 assert.deepEqual((await progress()).pages,[1,2]);
 const freshContext=await browser.newContext();
 const freshPage=await freshContext.newPage();
 freshPage.on('pageerror',error=>errors.push(String(error)));
 await freshPage.goto(url);
 await freshPage.waitForFunction(()=>!!navigator.serviceWorker.controller);
 generation=3;
 await freshPage.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update();});
 await freshPage.locator('#app-update').waitFor({timeout:60000});
 await freshPage.locator('#app-update').click();
 await freshPage.waitForFunction(()=>!!document.querySelector('[data-action="drop-start"]')&&!document.querySelector('#app-update'));
 assert.ok(await freshPage.evaluate(async()=>(await caches.keys()).includes('water-qa-next-3')));
 await freshContext.close();
 assert.deepEqual(errors,[]);
 console.log('PASS stale-release reproduction, recovery link, update notification, first-visit update, saved progress, and offline reload');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
