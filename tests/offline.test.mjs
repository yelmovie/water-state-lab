import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const swContext=extra=>{const ctx=vm.createContext({self:{addEventListener(){}},location:{origin:'http://lab.test'},Response,Blob,URL,...extra});return ctx;};

test('the built precache list covers every asset the app references, without PNG originals',t=>{
 mkdirSync('tmp',{recursive:true});
 const out=mkdtempSync('tmp/offline-test-dist-');
 t.after(()=>rmSync(out,{recursive:true,force:true}));
 const built=spawnSync(process.execPath,['scripts/build.mjs','--out',out],{encoding:'utf8'});
 assert.equal(built.status,0,built.stderr);
 const sw=readFileSync(`${out}/sw.js`,'utf8');
 new vm.Script(sw);
 const [,cache,shell,later]=/^const CACHE=("[^"]+"),SHELL=(\[.*?\]),LATER=(\[.*?\]);$/m.exec(sw).map((v,i)=>i?JSON.parse(v):v);
 assert.match(cache,/^water-[0-9a-f]{12}$/);
 const all=new Set([...shell,...later]);
 assert.ok(![...all].some(url=>url.includes('colorfigures')||url.includes('collector-figure-')),'retired 2D viewer stays out of the delivery');
 assert.equal(all.size,shell.length+later.length,'install and background lists do not overlap');
 const engine='/assets/vendor/phaser.min.js';
 assert.ok(!all.has(engine),'the engine waits until a scene opens');
 assert.ok(readFileSync(out+engine).length>0,'the on-demand engine is shipped');
 all.add(engine);
 for(const url of ['/','/manifest.webmanifest','/src/app.js','/src/style.css','/assets/fonts/jua-korean-400.woff2','/assets/icons/icon-192.png'])assert.ok(shell.includes(url),url);
 assert.ok(!later.some(u=>u.startsWith('/src/')),'code ships with the first screen so versions never mix');
 for(const url of all)assert.ok(!url.endsWith('.png')||url.startsWith('/assets/icons/'),`PNG original in precache: ${url}`);
 for(const film of ['/assets/story/intro.mp4','/assets/story/final.mp4'])assert.ok(later.includes(film)&&!shell.includes(film),'story films warm after install');
 for(const file of ['/assets/audio/music/main-theme.mp3','/assets/audio/music/ending-theme.mp3','/assets/story/intro.vtt','/assets/story/final.webp'])assert.ok(later.includes(file)&&!shell.includes(file),'music and film extras warm after install');
 assert.ok(later.indexOf('/assets/audio/music/main-theme.mp3')<later.indexOf('/assets/story/intro.mp4'),'music warms before the large films');
 for(let n=1;n<=5;n++)for(const ext of ['webp','mp4'])assert.ok(all.has(`/assets/concepts/zone-${n}.${ext}`),`concept ${n}.${ext}`);
 // Legacy MVP backgrounds in style.css were never part of the built site.
 const legacy=new Set();
 const files=[...readdirSync(`${out}/src`).filter(f=>/\.(js|css)$/.test(f)).map(f=>`${out}/src/`+f),'index.html'];
 let checked=0;
 for(const file of files){
  const text=readFileSync(file,'utf8'),refs=[...text.matchAll(/\/assets\/(?:\$\{[^}]*\}|[^'"`)\s])*/g)].map(m=>m[0]);
  for(const ref of refs.filter(r=>!r.endsWith('/')&&!legacy.has(r))){
   const pattern=new RegExp('^'+ref.split(/\$\{[^}]*\}/).map(s=>s.replace(/[.*+?^()|[\]\\]/g,'\\$&')).join('[^/]+')+'$');
   assert.ok([...all].some(u=>pattern.test(u)),`${file} references ${ref}, which is not precached`);checked++;
  }
  // '/assets/learning/'+name style lookups: every quoted file name must exist under one of the file's prefixes.
  const prefixes=refs.filter(r=>r.endsWith('/'));
  if(prefixes.length)for(const [,name] of text.matchAll(/'([\w-]+\.(?:webp|ogg|mp4|webm|png))'/g)){assert.ok(prefixes.some(p=>all.has(p+name)),`${file} loads ${name} from ${prefixes}`);checked++;}
 }
 assert.ok(checked>30,`only ${checked} references checked`);
});

test('the service worker parses, warms every file, and answers byte ranges from cache',async()=>{
 const source=readFileSync('public/sw.js','utf8');
 const added=[],cached=new Set(['/']),ctx=swContext({caches:{open:async()=>({match:async u=>cached.has(u)?new Response('x'):undefined,add:async u=>{added.push(u);cached.add(u);}})}});
 vm.runInContext(source.replace("SHELL=[],LATER=[]","SHELL=['/','/src/app.js'],LATER=['/assets/a.webp','/assets/concepts/zone-1.mp4','/assets/story/intro.mp4','/assets/story/final.mp4']"),ctx);
 assert.deepEqual({...await ctx.warmNext()},{done:2,total:6});
 assert.deepEqual(added,['/src/app.js']);
 while((await ctx.warmNext()).done<6);
 assert.ok(added.includes('/assets/story/intro.mp4')&&added.includes('/assets/story/final.mp4'),'the two MP4-only story films are also available offline');
 assert.ok(added.includes('/assets/concepts/zone-1.mp4'),'the area clips are stored');
 const full=()=>new Response('0123456789',{headers:{'Content-Type':'video/mp4'}});
 for(const [range,body,header] of [['bytes=2-4','234','bytes 2-4/10'],['bytes=7-','789','bytes 7-9/10'],['bytes=-3','789','bytes 7-9/10'],['bytes=0-99','0123456789','bytes 0-9/10']]){
  const r=await ctx.partial(full(),range);
  assert.equal(r.status,206,range);assert.equal(await r.text(),body,range);assert.equal(r.headers.get('Content-Range'),header);assert.equal(r.headers.get('Content-Type'),'video/mp4');
 }
 assert.equal((await ctx.partial(full(),'bytes=20-')).status,416);
});

test('an uncached video answers byte ranges from one download when the host ignores Range',async()=>{
 const stored=new Map(),calls=[];
 const cache={match:async r=>stored.get(r.url??r)?.clone(),put:async(u,r)=>{stored.set(u,r);}};
 // Cloudflare Pages replies 200 with the whole file whatever Range says.
 const fetch=async r=>{calls.push(r.url??r);return new Response('0123456789',{headers:{'Content-Type':'video/mp4','Content-Length':'10'}});};
 const ctx=swContext({caches:{open:async()=>cache},fetch});
 vm.runInContext(readFileSync('public/sw.js','utf8'),ctx);
 const ask=(path,range)=>({url:'http://lab.test'+path,mode:'no-cors',headers:new Headers(range?{range}:{})});
 const [probe,rest]=await Promise.all([ctx.respond(ask('/assets/story/intro.mp4','bytes=0-1')),ctx.respond(ask('/assets/story/intro.mp4','bytes=2-9'))]);
 assert.equal(probe.status,206);assert.equal(probe.headers.get('Content-Range'),'bytes 0-1/10');assert.equal(await probe.text(),'01');
 assert.equal(rest.status,206);assert.equal(await rest.text(),'23456789');
 assert.deepEqual(calls,['http://lab.test/assets/story/intro.mp4'],'parallel ranges share one download');
 assert.equal((await ctx.respond(ask('/assets/story/intro.mp4','bytes=5-6'))).status,206);
 assert.equal(calls.length,1,'later ranges come from the stored file');
 // Chrome opens with bytes=0-: a worker-made 206 too, or the next range mixes response kinds and the video fails.
 const stream=await ctx.respond(ask('/assets/story/final.mp4','bytes=0-'));
 assert.equal(stream.status,206);assert.equal(stream.headers.get('Content-Range'),'bytes 0-9/10');assert.equal(await stream.text(),'0123456789');
 assert.equal((await ctx.respond(ask('/assets/story/final.mp4','bytes=8-'))).status,206);
 assert.equal(calls.filter(u=>u.endsWith('/assets/story/final.mp4')).length,1,'the opening stream and later ranges share one download');
 assert.ok(stored.has('http://lab.test/assets/story/final.mp4'));
 assert.equal((await ctx.respond(ask('/assets/audio/music/main-theme.mp3','bytes=0-'))).status,206,'music streams like video, which Safari needs');
 assert.equal((await ctx.respond(ask('/assets/a.webp','bytes=0-1'))).status,200,'only streamed media needs cut ranges');
});
