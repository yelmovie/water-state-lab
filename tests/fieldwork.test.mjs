import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMissions,initialFieldwork,chapterState,fieldAction,fieldReady,cleanFieldwork} from '../src/fieldwork-model.js';
import {state,initialState,readState,save,setPreviewMode,KEY} from '../src/state.js';

function solve(n){let c=chapterState(n);const act=(a,p)=>c=fieldAction(n,c,a,p),put=(item,target)=>act('place',{item,target});
 if(n===1)for(const item of ['water','ice'])for(const target of ['tall','wide'])put(item,target);
 if(n===2||n===10){for(const [target,item] of (n===2?[['freeze','cold'],['melt','warm'],['evaporate','time'],['condense','cold']]:[['evaporate','time'],['condense','cold']]))put(item,target);act('test');}
 if(n===3)for(const [item,target] of [['water','first'],['ice','middle'],['melt','last'],['weight','balance']])put(item,target);
 if(n===4){act('test');act('setting',{value:70});act('test');}
 if(n===5){for(let cell=0;cell<16;cell++)act('spread',{cell});act('test');put('destination','air');}
 if(n===6){for(const site of ['surface','inside','level'])act('inspect',{site});put('A','air');put('B','air');}
 if(n===7){put('pack','A');act('test');put('pack','B');act('test');put('condition','cold');}
 if(n===8){put('tray','under');act('test');put('cold','plate');act('test');}
 if(n===9)for(let from=0;from<4;from++)act('connect',{from,to:from+1});
 return c;
}
test('every field application needs a distinct observed solution, with no time or click count gate',()=>{
 for(let n=1;n<=10;n++){
  assert.equal(fieldReady(n,chapterState(n)),false,'untouched '+n);
  assert.equal(fieldReady(n,solve(n)),true,'solvable '+n);
  assert.ok(fieldMissions[n].standard.startsWith('4과10-'));
 }
});
test('unheated evaporation is valid and changed tools invalidate the previous result',()=>{
 let c=solve(2);assert.equal(c.moves.evaporate,'time');
 c=fieldAction(2,c,'place',{item:'warm',target:'freeze'});
 assert.equal(fieldReady(2,c),false);
 c=fieldAction(2,c,'test');assert.equal(fieldReady(2,c),false);
});
test('space and drying comparisons retain their evidence and require a trial of the current condition',()=>{
 let c=solve(4);const previous=JSON.stringify(c.tested[0]);c=fieldAction(4,c,'setting',{value:80});
 assert.equal(fieldReady(4,c),false);assert.equal(JSON.stringify(c.tested[0]),previous);
 c=fieldAction(4,c,'test');assert.equal(fieldReady(4,c),true);
 let d=solve(5);d=fieldAction(5,d,'spread',{cell:17});assert.equal(fieldReady(5,d),false);
 d=fieldAction(5,d,'test');assert.equal(fieldReady(5,d),true);
});
test('swapped cup identities still need the shared cold-surface explanation',()=>{
 let c=solve(7);c=fieldAction(7,c,'place',{item:'condition',target:'identity'});
 assert.equal(fieldReady(7,c),false);assert.equal(c.tested.length,2);
 c=fieldAction(7,c,'place',{item:'condition',target:'cold'});assert.equal(fieldReady(7,c),true);
});
test('an uphill or skipped water connection gives feedback without awarding it',()=>{
 for(const [from,to] of [[2,1],[0,4]]){const c=fieldAction(9,chapterState(9),'connect',{from,to});assert.deepEqual(c.lines,[]);assert.ok(c.message.length>5);}
});

test('cooling comparison keeps the receiver fixed and names the missing condition',()=>{
 let c=chapterState(8);
 c=fieldAction(8,c,'test');assert.equal(c.tested.length,0);assert.match(c.message,/받이/);
 c=fieldAction(8,c,'place',{item:'tray',target:'under'});
 c=fieldAction(8,c,'place',{item:'cold',target:'plate'});
 c=fieldAction(8,c,'test');assert.equal(c.tested.length,0);assert.match(c.message,/냉각 전/);
 c=fieldAction(8,c,'place',{item:'cold',target:'removed'});
 c=fieldAction(8,c,'test');assert.equal(c.tested[0].cold,0);assert.equal(fieldReady(8,c),false);
 c=fieldAction(8,c,'place',{item:'cold',target:'plate'});
 c=fieldAction(8,c,'test');assert.equal(fieldReady(8,c),true);assert.equal(c.moves.tray,'under');
 const raw=initialFieldwork();raw.chapters[8]={...c,rulesVersion:undefined,tested:[{ok:false},{cold:1,amount:20,ok:true}],done:true};
 assert.equal(cleanFieldwork(raw).chapters[8].done,true,'previously completed comparisons stay completed');
 raw.chapters[8].done=false;
 assert.equal(cleanFieldwork(raw).chapters[8].done,false,'unfinished old data still needs a measured baseline');
});
test('save cleaning retains actual evidence, ignores a forged done flag, and isolates damaged field records',()=>{
 const raw=initialFieldwork();raw.chapters[4]=solve(4);raw.chapters[2]={...chapterState(2),done:true};raw.chapters[7]={tested:[null,{cold:NaN,ok:true}],moves:null};
 const restored=cleanFieldwork(JSON.parse(JSON.stringify(raw)));
 assert.equal(restored.chapters[4].done,true);assert.equal(restored.chapters[2].done,false);assert.equal(restored.chapters[7].done,false);
 const old=initialState();delete old.fieldwork;old.completed=[1];old.pages=[1,2];
 const migrated=readState({getItem:()=>JSON.stringify(old)});assert.deepEqual(migrated.completed,[1]);assert.deepEqual(migrated.fieldwork.chapters,{});
});
test('teacher preview and its rewards never overwrite the student save',async t=>{
 const previous=globalThis.localStorage;let saved=null;globalThis.localStorage={getItem:()=>saved,setItem:(key,value)=>{assert.equal(key,KEY);saved=value;}};
 t.after(()=>{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;});
 const {state,save,setPreviewMode}=await import('../src/state.js?field-preview-test');
 Object.assign(state,initialState());state.completed=[1];state.pages=[1,2];
 state.settings.adminUnlock=true;setPreviewMode(true);state.completed=[1,2,3,4,5];state.fieldwork.chapters[10]=solve(10);save();
 assert.deepEqual(JSON.parse(saved).completed,[1]);assert.equal(JSON.parse(saved).fieldwork.chapters[10],undefined);
 assert.equal(JSON.parse(saved).settings.adminUnlock,false,'reload never restores preview permission');
 state.settings.adminUnlock=false;state.settings.bgmVolume=50;setPreviewMode(false);
 assert.deepEqual(state.completed,[1]);assert.equal(state.settings.bgmVolume,50);assert.deepEqual(state.fieldwork.chapters,{});
});


test('shorter field activities still require the meaningful choices and preserve trial evidence',()=>{
 let c=chapterState(1);c=fieldAction(1,c,'place',{item:'water',target:'wide'});assert.equal(fieldReady(1,c),false);c=fieldAction(1,c,'place',{item:'ice',target:'tall'});assert.equal(fieldReady(1,c),true);
 let d=chapterState(4);assert.deepEqual(d.tested[0],{value:100,amount:109,ok:false,source:'buddy'});assert.equal(fieldReady(4,d),false);d=fieldAction(4,d,'setting',{value:75});d=fieldAction(4,d,'test');assert.equal(fieldReady(4,d),true);for(let i=0;i<10;i++)d=fieldAction(4,d,'test');assert.equal(fieldReady(4,d),true);assert.equal(d.tested[0].source,'buddy');d=fieldAction(4,d,'setting',{value:100});assert.equal(fieldReady(4,d),false);
 let e=chapterState(6);e=fieldAction(6,e,'place',{item:'A',target:'air'});assert.equal(fieldReady(6,e),false);e=fieldAction(6,e,'place',{item:'B',target:'air'});assert.equal(fieldReady(6,e),true);assert.match(e.message,/수증기/);
});
