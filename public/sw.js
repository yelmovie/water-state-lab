// Offline cache for classroom use. scripts/build.mjs replaces the next line with the real lists; the dev server never registers this file.
const CACHE='water-dev',SHELL=[],LATER=[];
const SCENE_ENGINE='/assets/vendor/phaser.min.js';
const STREAMED=/\.(mp4|webm|mp3)$/;
// Install keeps only the first screen; the page warms the rest one file at a time when idle.
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll(SHELL.map(url=>new Request(url,{cache:'reload'})));}
 catch(error){await caches.delete(CACHE);throw error;}
 await self.skipWaiting();
})()));
async function oldCaches(){return (await caches.keys()).filter(k=>/^water-[0-9a-f]{12}$/.test(k)&&k!==CACHE).reverse();}
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
async function warmNext(){
 const cache=await caches.open(CACHE),list=[...SHELL,...LATER];
 let done=0,missing;for(const url of list){if(await cache.match(url))done++;else missing??=url;}
 if(missing){await cache.add(missing);done++;}
 if(done===list.length)for(const name of await oldCaches())await caches.delete(name);
 return {done,total:list.length};
}
self.addEventListener('message',e=>{
 if(e.data==='skip-waiting')self.skipWaiting();
 if(e.data==='save-scene-engine')e.waitUntil(caches.open(CACHE).then(async cache=>{if(!await cache.match(SCENE_ENGINE))await cache.add(SCENE_ENGINE);}).catch(()=>{}));
 if(e.data?.type==='warm'&&e.ports[0])e.waitUntil(warmNext().then(r=>e.ports[0].postMessage(r),()=>e.ports[0].postMessage({error:true})));
});
// <video> asks for byte ranges; Safari needs 206 answers even when the whole file is cached.
async function partial(response,range){
 const blob=await response.blob(),size=blob.size,m=/^bytes=(\d*)-(\d*)$/.exec(range||'');
 let start=0,end=size-1;
 if(m&&m[1]){start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}else if(m&&m[2])start=Math.max(0,size-Number(m[2]));
 if(!m||(!m[1]&&!m[2])||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 return new Response(blob.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
}
// Cloudflare Pages ignores Range, so uncached video or music is fetched once and stored while the worker answers every range:
// Chrome fails a video that mixes network and worker-made responses, and 'bytes=0-' streams so play starts before the download ends.
const downloads=new Map();
function wholeVideo(cache,url){
 if(!downloads.has(url)){
  const started=fetch(url);
  downloads.set(url,started);
  started.then(response=>response.ok&&cache.put(url,response.clone())).catch(()=>{}).finally(()=>downloads.delete(url));
 }
 return downloads.get(url).then(response=>response.clone());
}
async function networkRange(cache,url,range){
 const whole=await wholeVideo(cache,url),size=Number(whole.headers.get('Content-Length'));
 if(!whole.ok)return whole;
 if(range==='bytes=0-'&&size)return new Response(whole.body,{status:206,headers:{'Content-Type':whole.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes 0-${size-1}/${size}`,'Content-Length':String(size),'Accept-Ranges':'bytes'}});
 return partial(whole,range);
}
async function respond(request){
 if(new URL(request.url).pathname==='/update.html')return fetch(request,{cache:'no-cache'});
 const cache=await caches.open(CACHE),url=new URL(request.url),range=request.headers.get('range');
 const page=request.mode==='navigate'&&/^\/(index\.html)?$/.test(url.pathname);
 // Revalidate HTML and code together. Do not overwrite the offline snapshot with online responses.
 if(page||url.pathname.startsWith('/src/')||url.pathname.startsWith('/assets/fonts/')){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
  try{const response=await fetch(request,{cache:'no-cache',signal:controller.signal});if(response.ok||response.status<500)return response;}
  catch{}finally{clearTimeout(timer);}
  return await cache.match(page?'/':url.pathname,{ignoreVary:true})||Response.error();
 }
 const hit=await cache.match(page?'/':request);
 if(hit)return range?partial(hit,range):hit;
 try{
  if(range&&STREAMED.test(url.pathname))return await networkRange(cache,url.href,range);
  const response=await fetch(request);
  if(response.status===200&&!range&&response.type==='basic'){
   const stored=cache.put(request,response.clone()).catch(()=>{});
   if(url.pathname===SCENE_ENGINE)await stored;
  }
  return response;
 }catch(error){
  const fallback=request.mode==='navigate'&&await cache.match('/');
  if(fallback)return fallback;
  if(url.pathname.startsWith('/assets/'))for(const name of await oldCaches()){
   const old=await (await caches.open(name)).match(request,{ignoreVary:true});
   if(old)return range?partial(old,range):old;
  }
  throw error;
 }
}
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==location.origin)return;
 e.respondWith(respond(e.request));
});
