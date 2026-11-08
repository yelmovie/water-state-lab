import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMissions,fieldStages,initialFieldwork,chapterState,fieldAction,fieldReady,cleanFieldwork,migrateFieldwork} from '../src/fieldwork-model.js';
import {state,initialState,readState,save,setPreviewMode,KEY} from '../src/state.js';

function freezeTray(c){for(const step of ['fill','load','wait','take','compare'])c=fieldAction(2,c,'freeze-tray',{step,time:100});return c;}
const processes={melt:['place','wait','compare'],evaporate:['fill','heat','wait','stop','compare'],condense:['dry','cool','wait','wipe','wait','compare']};
function process(c,kind){for(const step of processes[kind])c=fieldAction(2,c,'phase-process',{kind,step,time:100});return c;}
function solve(n){let c=chapterState(n);const act=(a,p)=>c=fieldAction(n,c,a,p),put=(item,target)=>act('place',{item,target});
 if(n===1)for(const item of ['water','ice'])for(const target of ['tall','wide'])put(item,target);
 if(n===2){c=freezeTray(c);for(const kind of Object.keys(processes))c=process(c,kind);}
 if(n===10)for(const step of ['prepare','wait','observe','receiver','cool','wait','collect','compare'])act('greenhouse-cycle',{step,time:100});
 if(n===3){for(const [item,target] of [['water','first'],['ice','middle'],['melt','last']])put(item,target);act('test');act('guess-weight',{guess:'same'});put('weight','balance');for(const item of ['water','ice','melt'])put(item,'pan');}
 if(n===4){for(const [night,count] of [[1,1],[2,2],[3,3]]){for(let index=0;index<count;index++)act('fill',{night,index,value:85});act('freeze-night',{night});}act('reason',{choice:'grow'});}
 if(n===6){for(let cell=0;cell<16;cell++)act('spread',{cell});act('test');put('destination','air');}
 if(n===5){for(const site of ['surface','inside','level'])act('inspect',{site});put('A','air');put('B','air');}
 if(n===7){put('pack','A');act('test');put('pack','B');act('test');put('condition','cold');}
 if(n===8){put('tray','under');act('test');put('cold','plate');act('test');}
 if(n===9)for(let from=0;from<4;from++)act('connect',{from,to:from+1});
 return c;
}
test('every field application needs a distinct observed solution, with no time or click count gate',()=>{
 for(let n=1;n<=10;n++){
  assert.equal(fieldReady(n,chapterState(n)),false,'untouched '+n);
  assert.equal(fieldReady(n,solve(n)),true,'solvable '+n);
  if(fieldStages.includes(n))assert.ok(fieldMissions[n].standard.startsWith('4과10-'));
 }
});
test('the boiling task requires sufficient heating and changing a tool invalidates its result',()=>{
 let c=solve(2);assert.equal(c.moves.evaporate,'hotplate-process');
 c=fieldAction(2,c,'place',{item:'warm',target:'freeze'});
 assert.equal(fieldReady(2,c),false);
 c=fieldAction(2,c,'test');assert.equal(fieldReady(2,c),false);
});
test('drying comparisons retain their evidence and require a trial of the current condition',()=>{
 let d=solve(6);d=fieldAction(6,d,'spread',{cell:17});assert.equal(fieldReady(6,d),false);
 d=fieldAction(6,d,'test');assert.equal(fieldReady(6,d),true);
});

test('retired extra activities resume the experiment and preserve old evidence',()=>{
 for(const n of [6,8]){
  const original={...initialFieldwork(),active:n,pending:`act-complete-${n/2}`,chapters:{[n]:solve(n)}};
  const moved=migrateFieldwork(original);
  assert.equal(moved.active,0);assert.equal(moved.pending,'');
  assert.deepEqual(moved.chapters,original.chapters);
  assert.deepEqual(migrateFieldwork(moved),moved,'migration is idempotent');
 }
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
 let e=chapterState(5);e=fieldAction(5,e,'place',{item:'A',target:'air'});assert.equal(fieldReady(5,e),false);e=fieldAction(5,e,'place',{item:'B',target:'air'});assert.equal(fieldReady(5,e),true);assert.match(e.message,/수증기/);
});

test('a transformation confirms only the one the student tried and keeps earlier discoveries',()=>{
 const run=(current,target,item,time=0)=>fieldAction(2,current,'try-route',{target,item,time});
 const draft=fieldAction(2,chapterState(2),'place',{target:'melt',item:'warm'});
 const wrong=run(draft,'freeze','warm');
 assert.deepEqual(wrong.marks,[]);
 assert.deepEqual(run(wrong,'freeze','cold').marks,[],'a cooling pack cannot turn a cup into ice cubes');
 const frozen=freezeTray(wrong);
 assert.deepEqual(frozen.marks,['freeze']);
 assert.deepEqual(run(frozen,'freeze','warm').marks,['freeze']);
 assert.deepEqual(run(frozen,'melt','warm').marks,['freeze'],'a warm prop does not instantly melt the tray');
 const melted=process(frozen,'melt');
 assert.deepEqual(run(melted,'evaporate','time',100).marks,['freeze','melt']);
 assert.deepEqual(run(melted,'evaporate','warm',35).marks,['freeze','melt']);
 assert.deepEqual(run(melted,'evaporate','warm',100).marks,['freeze','melt']);
 const evaporated=process(melted,'evaporate');
 assert.deepEqual(run(evaporated,'condense','cold').marks,['freeze','melt','evaporate']);
 const done=process(evaporated,'condense');
 assert.ok(fieldReady(2,done));
});

test('melting needs a room-temperature tray, time and a comparison, without instant tool awards',()=>{
 let c=freezeTray(chapterState(2));
 const act=(step,time)=>c=fieldAction(2,c,'phase-process',{kind:'melt',step,time});
 act('wait',100);act('compare');assert.equal(c.moves.meltStage,undefined);
 act('place');assert.equal(c.moves.meltStage,'resting');assert.equal(c.moves.meltTime,'0');
 act('wait',45);assert.equal(c.moves.meltStage,'resting');act('compare');assert.ok(!c.marks.includes('melt'));
 act('wait',100);assert.equal(c.moves.meltStage,'melted');assert.ok(!c.marks.includes('melt'));
 act('compare');assert.equal(c.moves.meltStage,'compared');assert.equal(c.moves.melt,'room-time');assert.ok(c.marks.includes('melt'));
});

test('boiling requires equal-water preparation, heating, sufficient time, stopping and comparison',()=>{
 let c=process(freezeTray(chapterState(2)),'melt');
 const act=(step,time)=>c=fieldAction(2,c,'phase-process',{kind:'evaporate',step,time});
 act('heat');act('wait',100);act('stop');act('compare');assert.equal(c.moves.boilStage,undefined);
 act('fill');assert.equal(c.moves.boilStage,'ready');act('wait',100);assert.equal(c.moves.boilTime,'0');
 act('heat');act('wait',40);act('stop');assert.equal(c.moves.boilStage,'heating');assert.ok(!c.marks.includes('evaporate'));
 act('wait',100);assert.equal(c.moves.boilStage,'boiling');act('compare');assert.ok(!c.marks.includes('evaporate'));
 act('stop');assert.equal(c.moves.boilStage,'observed');act('compare');assert.equal(c.moves.evaporate,'hotplate-process');assert.ok(c.marks.includes('evaporate'));
 assert.match(c.message,/수증기/);
});

test('condensation needs dry surfaces, cooling, new drops, wiping and observing their return',()=>{
 let c=process(process(freezeTray(chapterState(2)),'melt'),'evaporate');
 const act=(step,time)=>c=fieldAction(2,c,'phase-process',{kind:'condense',step,time});
 act('cool');act('wait',100);act('wipe');act('compare');assert.equal(c.moves.dewStage,undefined);
 act('dry');assert.equal(c.moves.dewStage,'dry');act('wait',100);assert.equal(c.moves.dewTime,'0');
 act('cool');act('wait',60);assert.equal(c.moves.dewStage,'cooling');act('compare');assert.ok(!c.marks.includes('condense'));
 act('wait',100);assert.equal(c.moves.dewStage,'wet');act('compare');assert.ok(!c.marks.includes('condense'));
 act('wipe');assert.equal(c.moves.dewStage,'rewiped');assert.equal(c.moves.dewTime,'0');
 act('compare');assert.ok(!c.marks.includes('condense'));act('wait',100);assert.equal(c.moves.dewStage,'again');
 act('compare');assert.equal(c.moves.condense,'cold-surface-process');assert.ok(c.marks.includes('condense'));assert.ok(fieldReady(2,c));assert.match(c.message,/공기/);
});

test('later transformations cannot bypass their preceding observation',()=>{
 for(const [kind,recipe] of Object.entries(processes)){
  let c=chapterState(2);for(const step of recipe)c=fieldAction(2,c,'phase-process',{kind,step,time:100});
  assert.deepEqual(c.marks,[]);assert.deepEqual(c.moves,{});
 }
});

test('all process clocks reject malformed and backwards time without mutating earlier records',()=>{
 for(const [kind,prerequisite,start,clock] of [['melt',freezeTray(chapterState(2)),['place'],'meltTime'],['evaporate',process(freezeTray(chapterState(2)),'melt'),['fill','heat'],'boilTime'],['condense',process(process(freezeTray(chapterState(2)),'melt'),'evaporate'),['dry','cool'],'dewTime']]){
  let c=prerequisite;for(const step of start)c=fieldAction(2,c,'phase-process',{kind,step});
  c=fieldAction(2,c,'phase-process',{kind,step:'wait',time:60});
  for(const time of [-1,40,101,Infinity,NaN,'100']){
   const next=fieldAction(2,c,'phase-process',{kind,step:'wait',time});assert.equal(next.moves[clock],'60',kind+' clock');
  }
  assert.equal(c.moves[clock],'60');assert.ok(!c.marks.includes(kind));
 }
});

test('all in-progress transformations, poured water and completed process fields survive reload',()=>{
 let c=freezeTray(chapterState(2));
 for(const [kind,recipe] of Object.entries(processes)){
  const first=recipe.slice(0,recipe.indexOf('wait'));
  let partial=c;for(const step of first)partial=fieldAction(2,partial,'phase-process',{kind,step});
  partial=fieldAction(2,partial,'phase-process',{kind,step:'wait',time:55});
  const raw=initialState();raw.fieldwork.chapters[2]=partial;
  const loaded=readState({getItem:()=>JSON.stringify(raw)}).fieldwork.chapters[2];
  assert.deepEqual(loaded.moves,partial.moves);assert.deepEqual(loaded.marks,partial.marks);assert.equal(loaded.done,false);
  c=process(c,kind);
 }
 const raw=initialState();raw.fieldwork.chapters[2]=c;const loaded=readState({getItem:()=>JSON.stringify(raw)}).fieldwork.chapters[2];
 assert.equal(c.moves.freezeFill,'100');assert.equal(Object.keys(c.moves).length,13);assert.deepEqual(loaded.moves,c.moves);assert.equal(fieldReady(2,loaded),true);
 raw.fieldwork.chapters[2]={...c,moves:{oldTool:'time',...c.moves}};
 const withEarlierAttempt=readState({getItem:()=>JSON.stringify(raw)}).fieldwork.chapters[2];
 assert.deepEqual(withEarlierAttempt.moves,raw.fieldwork.chapters[2].moves,'earlier attempts must not push the new evidence past the save limit');
 assert.equal(fieldReady(2,withEarlierAttempt),true);
});

test('new transformation badges require their final observations even if done is forged',()=>{
 const c=solve(2);
 for(const [key,value] of [['meltStage','resting'],['meltTime','30'],['boilStage','heating'],['boilTime','30'],['dewStage','wet'],['dewTime','30']]){
  const forged={...c,moves:{...c.moves,[key]:value},done:true};assert.equal(fieldReady(2,forged),false,key);
  assert.equal(cleanFieldwork({...initialFieldwork(),chapters:{2:forged}}).chapters[2].done,false,key);
 }
});

test('freezing requires filling a tray, loading a closed freezer, enough cooling, taking it out and comparing',()=>{
 let c=chapterState(2);
 for(const step of ['load','wait','take','compare']){
  c=fieldAction(2,c,'freeze-tray',{step,time:100});
  assert.equal(c.moves.freezeTray,undefined);assert.deepEqual(c.marks,[]);
 }
 c=fieldAction(2,c,'freeze-tray',{step:'fill'});assert.equal(c.moves.freezeTray,'water');
 c=fieldAction(2,c,'freeze-tray',{step:'take'});assert.equal(c.moves.freezeTray,'water');
 c=fieldAction(2,c,'freeze-tray',{step:'load'});assert.equal(c.moves.freezeTray,'cooling');
 c=fieldAction(2,c,'freeze-tray',{step:'wait',time:45});assert.equal(c.moves.freezeTray,'cooling');assert.equal(c.moves.freezeTime,'45');
 c=fieldAction(2,c,'freeze-tray',{step:'take'});assert.equal(c.moves.freezeTray,'cooling');
 c=fieldAction(2,c,'freeze-tray',{step:'wait',time:100});assert.equal(c.moves.freezeTray,'frozen');assert.deepEqual(c.marks,[]);
 c=fieldAction(2,c,'freeze-tray',{step:'compare'});assert.deepEqual(c.marks,[]);
 c=fieldAction(2,c,'freeze-tray',{step:'take'});assert.equal(c.moves.freezeTray,'taken');assert.deepEqual(c.marks,[]);
 c=fieldAction(2,c,'freeze-tray',{step:'compare'});assert.equal(c.moves.freezeTray,'compared');assert.equal(c.moves.freeze,'freezer');assert.deepEqual(c.marks,['freeze']);
 assert.match(c.message,/얼음틀/);assert.equal(fieldReady(2,c),false,'other transformations still require their observations');
 assert.deepEqual(fieldAction(2,c,'freeze-tray',{step:'compare'}),c,'comparison is idempotent');
});

test('cooling cannot rewind or skip its prerequisites, and rejects non-finite times',()=>{
 let c=fieldAction(2,chapterState(2),'freeze-tray',{step:'fill'});
 const before=c;c=fieldAction(2,c,'freeze-tray',{step:'wait',time:100});assert.deepEqual(c.moves,before.moves);
 c=fieldAction(2,c,'freeze-tray',{step:'load'});c=fieldAction(2,c,'freeze-tray',{step:'wait',time:60});
 for(const time of [-1,40,101,Infinity,NaN,'100']){
  const next=fieldAction(2,c,'freeze-tray',{step:'wait',time});
  assert.equal(next.moves.freezeTime,'60');assert.equal(next.moves.freezeTray,'cooling');assert.deepEqual(next.marks,[]);
 }
 assert.equal(before.moves.freezeTray,'water','actions do not mutate earlier evidence');
});

test('freezer work resumes after a reload without awarding unobserved changes',()=>{
 let c=fieldAction(2,chapterState(2),'freeze-tray',{step:'fill'});
 c=fieldAction(2,c,'freeze-tray',{step:'load'});c=fieldAction(2,c,'freeze-tray',{step:'wait',time:55});
 const raw=initialState();raw.fieldwork.chapters[2]=c;
 const loaded=readState({getItem:()=>JSON.stringify(raw)}).fieldwork.chapters[2];
 assert.deepEqual(loaded.moves,c.moves);assert.deepEqual(loaded.marks,[]);
 assert.equal(loaded.done,false);
 const done=freezeTray(chapterState(2));
 const restored=cleanFieldwork({...initialFieldwork(),chapters:{2:done}}).chapters[2];
 assert.deepEqual(restored.moves,done.moves);assert.deepEqual(restored.marks,['freeze']);
});

test('older completed transformations keep their recorded discoveries',()=>{
 const c={...chapterState(2),moves:{freeze:'cold',melt:'warm',evaporate:'warm',condense:'cold'},marks:['freeze','melt','evaporate','condense'],done:true};
 const loaded=cleanFieldwork({...initialFieldwork(),chapters:{2:c}}).chapters[2];
 assert.equal(fieldReady(2,loaded),true);assert.deepEqual(loaded.moves,c.moves);assert.deepEqual(loaded.marks,c.marks);
});

test('a new freezer completion cannot be granted by a done flag without the full comparison',()=>{
 const solved=solve(2);
 for(const moves of [{...solved.moves,freezeTray:'frozen'},{...solved.moves,freezeTime:'40'}]){
  const forged={...solved,moves,done:true};assert.equal(fieldReady(2,forged),false);
  assert.equal(cleanFieldwork({...initialFieldwork(),chapters:{2:forged}}).chapters[2].done,false);
 }
});

test('each area ends with exactly one request',()=>{
 assert.deepEqual(fieldMissions.flatMap((m,n)=>m?[n]:[]),[2,4,10]);
 assert.deepEqual(fieldStages,[2,4,10]);
});
test('an old save keeps its drying seal after the request moved to the end of the area',()=>{
 const raw={...initialFieldwork(),version:1,active:5,pending:'act-next-5',chapters:{5:solve(6),6:solve(5)}};
 const moved=cleanFieldwork(migrateFieldwork(raw));
 assert.equal(fieldReady(6,moved.chapters[6]),true);
 assert.equal(moved.active,0);assert.equal(moved.pending,'');
 const again=migrateFieldwork(migrateFieldwork(raw));
 assert.equal(again.chapters[6].spread.length,raw.chapters[5].spread.length,'migrating twice does not swap back');
});
