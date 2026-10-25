import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';

const out='tmp/offline-test-dist';
const swContext=extra=>{const ctx=vm.createContext({self:{addEventListener(){}},location:{origin:'http://lab.test'},Response,Blob,URL,...extra});return ctx;};

test('the built precache list covers every asset the app references, without PNG originals',t=>{
 const built=spawnSync(process.execPath,['scripts/build.mjs','--out',out],{encoding:'utf8'});
 t.after(()=>rmSync(out,{recursive:true,force:true}));
 assert.equal(built.status,0,built.stderr);
 const sw=readFileSync(`${out}/sw.js`,'utf8');
 new vm.Script(sw);
 const [,cache,shell,later]=/^const CACHE=("[^"]+"),SHELL=(\[.*?\]),LATER=(\[.*?\]);$/m.exec(sw).map((v,i)=>i?JSON.parse(v):v);
 assert.match(cache,/^water-[0-9a-f]{12}$/);
 const all=new Set([...shell,...later]);
 assert.equal(all.size,shell.length+later.length,'install and background lists do not overlap');
 for(const url of ['/','/manifest.webmanifest','/src/app.js','/src/style.css','/assets/vendor/phaser.min.js','/assets/fonts/jua-korean-400.woff2','/assets/icons/icon-192.png'])assert.ok(shell.includes(url),url);
 assert.ok(!later.some(u=>u.startsWith('/src/')),'code ships with the first screen so versions never mix');
 for(const url of all)assert.ok(!url.endsWith('.png')||url.startsWith('/assets/icons/'),`PNG original in precache: ${url}`);
 for(let n=1;n<=10;n++)for(const ext of ['webp','mp4','webm'])assert.ok(all.has(`/assets/concepts/stage-${n}.${ext}`),`concept ${n}.${ext}`);
 // Legacy MVP backgrounds in style.css were never part of the built site.
 const legacy=new Set();
 const files=[...readdirSync('src').filter(f=>/\.(js|css)$/.test(f)).map(f=>'src/'+f),'index.html'];
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

test('the service worker parses, warms one video format, and answers byte ranges from cache',async()=>{
 const source=readFileSync('public/sw.js','utf8');
 const added=[],cached=new Set(['/']),ctx=swContext({caches:{open:async()=>({match:async u=>cached.has(u)?new Response('x'):undefined,add:async u=>{added.push(u);cached.add(u);}})}});
 vm.runInContext(source.replace("SHELL=[],LATER=[]","SHELL=['/','/src/app.js'],LATER=['/assets/a.webp','/assets/concepts/stage-1.mp4','/assets/concepts/stage-1.webm']"),ctx);
 assert.deepEqual({...await ctx.warmNext('webm')},{done:2,total:4});
 assert.deepEqual(added,['/src/app.js']);
 while((await ctx.warmNext('webm')).done<4);
 assert.ok(added.includes('/assets/concepts/stage-1.webm')&&!added.includes('/assets/concepts/stage-1.mp4'),'only the playable format is stored');
 const full=()=>new Response('0123456789',{headers:{'Content-Type':'video/mp4'}});
 for(const [range,body,header] of [['bytes=2-4','234','bytes 2-4/10'],['bytes=7-','789','bytes 7-9/10'],['bytes=-3','789','bytes 7-9/10'],['bytes=0-99','0123456789','bytes 0-9/10']]){
  const r=await ctx.partial(full(),range);
  assert.equal(r.status,206,range);assert.equal(await r.text(),body,range);assert.equal(r.headers.get('Content-Range'),header);assert.equal(r.headers.get('Content-Type'),'video/mp4');
 }
 assert.equal((await ctx.partial(full(),'bytes=20-')).status,416);
});
