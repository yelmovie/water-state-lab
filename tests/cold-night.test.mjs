import test from 'node:test';
import assert from 'node:assert/strict';
import {pipeTrial} from '../src/activity-model.js';
import {nights,reasons,vesselTrial,nightTrial,levelHeight,currentNight,nightFills,coldNightsDone,retryHint} from '../src/cold-night-model.js';
import {chapterState,fieldAction,fieldReady,fieldProgress,cleanFieldwork,initialFieldwork} from '../src/fieldwork-model.js';
import {coldNightMarkup} from '../src/field-coldnight.js';

const fill=(c,night,index,value)=>fieldAction(4,c,'fill',{night,index,value});
const freeze=(c,night)=>fieldAction(4,c,'freeze-night',{night});
function clearNight(c,night,value=85){
 nights[night-1].vessels.forEach((_,index)=>{c=fill(c,night,index,value);});
 return freeze(c,night);
}
const allNights=()=>[1,2,3].reduce((c,night)=>clearNight(c,night),chapterState(4));

test('the game freezes water with the same model as the chapter 4 experiment',()=>{
 for(const value of [70,90,95])assert.equal(vesselTrial('tub',value).ice,pipeTrial(value).expanded);
});

test('too much water fails differently in an open tub and a closed jar',()=>{
 assert.equal(vesselTrial('tub',91).outcome,'ok');
 assert.equal(vesselTrial('tub',92).outcome,'overflow');
 assert.equal(vesselTrial('jar',91).outcome,'ok');
 assert.equal(vesselTrial('jar',92).outcome,'crack');
 assert.equal(vesselTrial('bottle',92).outcome,'crack');
});

test('a narrow neck looks emptier than it is',()=>{
 assert.equal(levelHeight('tub',80),.8);
 assert.equal(levelHeight('bottle',0),0);
 assert.equal(levelHeight('bottle',100),1);
 assert.ok(levelHeight('bottle',92)<.85,'a fifth of the bottle still looks empty');
 assert.equal(vesselTrial('bottle',92).outcome,'crack','but it has no room left for the ice');
});

test('a night needs enough water and room for every vessel to grow',()=>{
 const short=nightTrial(1,[50]);
 assert.equal(short.ok,false);assert.equal(short.enough,false);assert.equal(short.safe,true);
 const full=nightTrial(1,[100]);
 assert.equal(full.ok,false);assert.equal(full.safe,false);assert.equal(full.kept,0,'a ruined tub keeps no usable water');
 const right=nightTrial(1,[80]);
 assert.equal(right.ok,true);assert.equal(right.kept,80);
 const mixed=nightTrial(2,[90,100]);
 assert.equal(mixed.kept,90);assert.equal(mixed.vessels[1].outcome,'crack');assert.equal(mixed.ok,false);
});

test('every night can be cleared without a precise pour',()=>{
 for(const night of nights){
  const low=Math.ceil(night.need/night.vessels.length);
  assert.ok(91-low>=10,`${night.name} leaves at least ten units of room for a rough pour`);
  assert.equal(nightTrial(night.id,night.vessels.map(()=>low)).ok,true);
  assert.equal(nightTrial(night.id,night.vessels.map(()=>91)).ok,true);
 }
});

test('nights open in order and a failed night keeps the pour for adjusting',()=>{
 let c=chapterState(4);
 assert.equal(currentNight(c).id,1);
 c=fill(c,2,0,80);assert.deepEqual(nightFills(c,nights[1]),[0,0],'a later night stays closed');
 c=fill(c,1,0,100);c=freeze(c,1);
 assert.equal(currentNight(c).id,1);assert.equal(c.tested.at(-1).ok,false);assert.match(c.message,/넘쳤/);
 assert.deepEqual(nightFills(c,nights[0]),[100]);
 c=fill(c,1,0,80);c=freeze(c,1);
 assert.equal(currentNight(c).id,2);assert.equal(c.tested.at(-1).ok,true);
 const closed=fill(c,1,0,30);assert.deepEqual(nightFills(closed,nights[0]),[80],'a cleared night is finished');
});

test('pours stay inside the vessel and an empty night cannot be frozen',()=>{
 let c=chapterState(4);
 assert.equal(c.tested.length,0);
 c=freeze(c,1);assert.equal(c.tested.length,0);assert.match(c.message,/물/);
 c=fill(c,1,0,240);assert.deepEqual(nightFills(c,nights[0]),[100]);
 c=fill(c,1,0,-5);assert.deepEqual(nightFills(c,nights[0]),[0]);
 c=fill(c,1,0,Number.NaN);assert.deepEqual(nightFills(c,nights[0]),[0]);
 c=fill(c,1,4,80);assert.deepEqual(nightFills(c,nights[0]),[0]);
});

test('the chapter ends with the learner explaining the empty space',()=>{
 let c=allNights();
 assert.equal(currentNight(c),undefined);assert.equal(fieldReady(4,c),false);assert.deepEqual(fieldProgress(4,c),[3,4]);
 const wrong=reasons.filter(r=>!r.ok);
 assert.ok(wrong.length>=2);
 for(const r of wrong){c=fieldAction(4,c,'reason',{choice:r.id});assert.equal(fieldReady(4,c),false);assert.equal(c.message,r.hint);}
 c=fieldAction(4,c,'reason',{choice:'nothing'});assert.equal(fieldReady(4,c),false);
 c=fieldAction(4,c,'reason',{choice:reasons.find(r=>r.ok).id});
 assert.equal(fieldReady(4,c),true);assert.equal(coldNightsDone(c),true);assert.deepEqual(fieldProgress(4,c),[4,4]);
});

test('the explanation cannot be answered before the nights',()=>{
 const c=fieldAction(4,chapterState(4),'reason',{choice:reasons.find(r=>r.ok).id});
 assert.equal(fieldReady(4,c),false);assert.deepEqual(c.marks,[]);
});

test('repeated failures point at evidence the screen shows, not the answer',()=>{
 const crack=nightTrial(3,[85,85,95]);
 assert.equal(retryHint(crack,0),'');
 assert.match(retryHint(crack,2),/좁/);
 assert.match(retryHint(nightTrial(1,[100]),2),/점선/);
 assert.match(retryHint(nightTrial(1,[30]),2),/더 담/);
 assert.doesNotMatch(retryHint(nightTrial(1,[100]),2),/\d/);
});

test('a reload keeps the nights, the pours and the explanation',()=>{
 let c=allNights();
 c=fieldAction(4,c,'reason',{choice:reasons.find(r=>r.ok).id});
 const raw=initialFieldwork();raw.chapters[4]=c;
 const restored=cleanFieldwork(JSON.parse(JSON.stringify(raw))).chapters[4];
 assert.equal(fieldReady(4,restored),true);assert.equal(restored.done,true);
 assert.deepEqual(nightFills(restored,nights[2]),[85,85,85]);
 let partial=clearNight(chapterState(4),1);partial=fill(partial,2,1,60);
 const raw2=initialFieldwork();raw2.chapters[4]=partial;
 const back=cleanFieldwork(JSON.parse(JSON.stringify(raw2))).chapters[4];
 assert.equal(currentNight(back).id,2);assert.deepEqual(nightFills(back,nights[1]),[0,60]);
});

test('a chapter finished under the old water-tank rules keeps its stamp',()=>{
 const raw=initialFieldwork();
 raw.chapters[4]={...chapterState(4),setting:80,tested:[{value:100,amount:109,ok:false,source:'buddy'},{value:80,amount:87.2,ok:true}],done:true};
 const restored=cleanFieldwork(JSON.parse(JSON.stringify(raw))).chapters[4];
 assert.equal(fieldReady(4,restored),true);assert.equal(restored.done,true);
 const unfinished=initialFieldwork();
 unfinished.chapters[4]={...chapterState(4),setting:80,tested:[{value:100,amount:109,ok:false,source:'buddy'}]};
 assert.equal(fieldReady(4,cleanFieldwork(JSON.parse(JSON.stringify(unfinished))).chapters[4]),false);
});

test('a cleared night stays on screen as its morning before the next night opens',()=>{
 for(const id of [1,2,3]){
  let c=chapterState(4);
  for(let night=1;night<=id;night++)c=clearNight(c,night);
  const trial=nightTrial(id,nights[id-1].vessels.map(()=>85));
  const html=coldNightMarkup(c,{phase:'result',trial});
  assert.equal(html.match(/class="cold-vessel"/g)?.length,id,'night '+id+' still shows its own vessels');
  assert.match(html,/data-night-next/);
  assert.match(html,/data-outcome="ok"/);
 }
});
