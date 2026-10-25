// Offline cache for classroom use. scripts/build.mjs replaces the next line with the real lists; the dev server never registers this file.
const CACHE='water-dev',SHELL=[],LATER=[];
const VIDEO=/\.(mp4|webm)$/;
// Install keeps only the first screen; the page warms the rest one file at a time when idle.
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('water-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function warmNext(video){
 const cache=await caches.open(CACHE),list=[...SHELL,...LATER.filter(u=>!VIDEO.test(u)||u.endsWith('.'+video))];
 let done=0,missing;for(const url of list){if(await cache.match(url))done++;else missing??=url;}
 if(missing){await cache.add(missing);done++;}
 return {done,total:list.length};
}
self.addEventListener('message',e=>{
 if(e.data==='skip-waiting')self.skipWaiting();
 if(e.data?.type==='warm'&&e.ports[0])e.waitUntil(warmNext(e.data.video==='webm'?'webm':'mp4').then(r=>e.ports[0].postMessage(r),()=>e.ports[0].postMessage({error:true})));
});
// <video> asks for byte ranges; Safari needs 206 answers even when the whole file is cached.
async function partial(response,range){
 const blob=await response.blob(),size=blob.size,m=/^bytes=(\d*)-(\d*)$/.exec(range||'');
 let start=0,end=size-1;
 if(m&&m[1]){start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}else if(m&&m[2])start=Math.max(0,size-Number(m[2]));
 if(!m||(!m[1]&&!m[2])||start>end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
 return new Response(blob.slice(start,end+1),{status:206,headers:{'Content-Type':response.headers.get('Content-Type')||'application/octet-stream','Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes'}});
}
async function respond(request){
 const cache=await caches.open(CACHE),url=new URL(request.url),range=request.headers.get('range');
 const page=request.mode==='navigate'&&/^\/(index\.html)?$/.test(url.pathname);
 const hit=await cache.match(page?'/':request);
 if(hit)return range?partial(hit,range):hit;
 try{
  const response=await fetch(request);
  if(response.status===200&&!range&&response.type==='basic')cache.put(request,response.clone()).catch(()=>{});
  return response;
 }catch(error){
  const fallback=request.mode==='navigate'&&await cache.match('/');
  if(fallback)return fallback;
  throw error;
 }
}
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==location.origin)return;
 e.respondWith(respond(e.request));
});
