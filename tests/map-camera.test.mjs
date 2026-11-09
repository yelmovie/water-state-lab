import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mountMapCamera,cleanupMapCamera,journeyView} from '../src/journey.js';
import {state,initialState} from '../src/state.js';

class Element{
 constructor(){this.style={};this.dataset={};this.events=new Map();this.attributes=new Map();this.nodes=new Map();this.hidden=false;this.offsetWidth=120;this.offsetHeight=48;this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
 querySelector(selector){return this.nodes.get(selector)??null;}
 querySelectorAll(){return [];}
 addEventListener(type,fn){this.events.set(type,fn);}
 setAttribute(key,value){this.attributes.set(key,value);}
 focus(){}
 setPointerCapture(){}
 closest(){return null;}
 append(){}
 getBoundingClientRect(){return {top:0,bottom:0,left:0,right:0};}
 remove(){}
 toggleAttribute(){}
 animate(){return {finished:Promise.resolve()};}
 fire(type,event={}){this.events.get(type)?.(event);}
}
// Map villains build their own buttons; any part they look up exists.
class Built extends Element{querySelector(selector){if(!this.nodes.has(selector))this.nodes.set(selector,new Built());return this.nodes.get(selector);}}
function camera(t,width,height,top=100,bottom=height-160){
 const previous=new Map(),replace=(key,value)=>{previous.set(key,globalThis[key]);globalThis[key]=value;};
 const root=new Element(),view=new Element(),world=new Element(),actor=new Element(),hand=new Element(),overview=new Element(),arrow=new Element(),nearby=new Element();
 const globalEvents=new Map();let resized;
 Object.assign(view,{clientWidth:width,clientHeight:height,getBoundingClientRect:()=>({top:0,bottom:view.clientHeight}),closest:()=>root});
 root.nodes.set('.journey-heading',{getBoundingClientRect:()=>({bottom:top})});root.nodes.set('.journey-bottom',{getBoundingClientRect:()=>({top:bottom})});
 root.nodes.set('[data-map-mode="hand"]',hand);root.nodes.set('[data-map-mode="overview"]',overview);arrow.dataset.mapMove='right';root.querySelectorAll=()=>[arrow];
 view.nodes.set('.journey-world',world);view.nodes.set('.map-hand-hint',new Element());view.nodes.set('.map-nearby',nearby);view.nodes.set('.map-nearby-status',new Element());
 world.nodes.set('.journey-traveler',actor);actor.nodes.set('.map-walk-sprite',new Element());
 const document={querySelector:selector=>selector==='.map-viewport'?view:null,addEventListener(){},body:new Element(),createElement:()=>new Built()};
 replace('document',document);replace('addEventListener',(type,fn)=>globalEvents.set(type,fn));replace('matchMedia',()=>({matches:true}));replace('Image',class{});
 replace('requestAnimationFrame',()=>1);replace('cancelAnimationFrame',()=>{});replace('ResizeObserver',class{constructor(fn){resized=fn;}observe(){}disconnect(){}});
 Object.assign(state,initialState());state.settings.reduced=true;mountMapCamera();
 t.after(()=>{if(overview.attributes.get('aria-pressed')==='true')overview.fire('click');if(hand.attributes.get('aria-pressed')==='true')hand.fire('click');cleanupMapCamera();for(const [key,value] of previous){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 const bounds=()=>{const [x,y]=world.style.transform.match(/-?[\d.]+(?=px)/g).map(Number);return {x,y,w:parseFloat(world.style.width),h:parseFloat(world.style.height)};};
 const drag=(dx,dy)=>{view.fire('pointerdown',{button:0,pointerId:1,clientX:width/2,clientY:height/2,target:new Element()});globalEvents.get('pointermove')({pointerId:1,clientX:width/2+dx,clientY:height/2+dy});globalEvents.get('pointerup')({pointerId:1});};
 return {view,world,hand,overview,arrow,bounds,drag,resize:(w,h)=>{view.clientWidth=w;view.clientHeight=h;bottom=h-160;resized();}};
}

for(const [width,height] of [[1024,768],[768,1024],[1366,768],[1920,1080],[1024,600],[390,844]])test(`overview contains the whole island clear of controls at ${width}x${height}`,t=>{
 const c=camera(t,width,height),normal=c.bounds();
 assert.ok(normal.w>=width&&normal.h>=height,'normal camera still covers the viewport');
 c.overview.fire('click');const b=c.bounds();
 assert.equal(c.overview.attributes.get('aria-pressed'),'true');
 assert.ok(b.x>=12-1e-8&&b.x+b.w<=width-12+1e-8,'both island edges fit');
 assert.ok(b.y>=112-1e-8&&b.y+b.h<=height-172+1e-8,'island clears title and controls');
 assert.ok(Math.abs(b.w/b.h-1000/563)<1e-8,'map keeps its aspect ratio');
 c.arrow.fire('click',{detail:0});assert.deepEqual(c.bounds(),b,'walking does not pan the overview');
 c.overview.fire('click');assert.equal(c.overview.attributes.get('aria-pressed'),'false');
 assert.equal(c.bounds().w,normal.w,'restoring follows the original zoom');
});

test('overview preserves a panned normal camera and repeated fit/restore is stable',t=>{
 const c=camera(t,1024,768),initial=c.bounds();c.drag(-150,-90);const panned=c.bounds();assert.notDeepEqual(panned,initial);
 for(let i=0;i<3;i++){c.overview.fire('click');const fit=c.bounds();c.drag(200,200);assert.deepEqual(c.bounds(),fit,'overview remains fully fitted while dragging');c.overview.fire('click');assert.deepEqual(c.bounds(),panned,'return restores the previous pan');}
 c.overview.fire('click');c.resize(768,1024);const b=c.bounds();assert.ok(b.x>=12-1e-8&&b.x+b.w<=756+1e-8);assert.ok(b.y>=112-1e-8&&b.y+b.h<=852+1e-8);
});

test('hand mode suppresses place taps while a normal tap and keyboard activation remain available',t=>{
 const c=camera(t,1024,768);let prevented=0;const event={detail:1,target:new Element(),preventDefault(){prevented++;},stopPropagation(){}};
 c.view.fire('click',event);assert.equal(prevented,0);
 c.hand.fire('click');assert.equal(c.hand.attributes.get('aria-pressed'),'true');c.view.fire('click',event);assert.equal(prevented,1);
 c.view.fire('click',{...event,detail:0});assert.equal(prevented,1);
 c.hand.fire('click');c.drag(-40,-40);c.view.fire('click',event);assert.equal(prevented,2,'released drag never opens a place');
});

test('map mode controls stay icon-only with accessible labels and 48px targets',()=>{
 const previous=globalThis.matchMedia;globalThis.matchMedia=()=>({matches:true});let html;try{html=journeyView();}finally{globalThis.matchMedia=previous;}
 for(const mode of ['hand','overview'])assert.match(html,new RegExp(`data-map-mode="${mode}" aria-label="[^"]+" aria-pressed="false"><svg[^]*?</svg></button>`));
 const css=readFileSync(new URL('../src/experience.css',import.meta.url),'utf8');assert.match(css,/\.map-mode\{[^}]*min-width:48px;min-height:48px/);
});
