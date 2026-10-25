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
 if(n===8){act('test');put('cold','plate');put('tray','under');act('test');}
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
