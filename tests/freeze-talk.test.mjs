import test from 'node:test';
import assert from 'node:assert/strict';
import {initialActivities,activityReady,validateActivities} from '../src/activity-model.js';
import {freezeTalk,talkDone,pipeChoices,freezeLevelText} from '../src/freeze-talk.js';
import {chapterState,fieldAction,fieldReady,fieldProgress,cleanFieldwork} from '../src/fieldwork-model.js';

const frozen=()=>{const a=initialActivities(),f=a.freeze;f.onScale=true;f.predicted=true;f.compared=true;f.records=[{kind:'water',level:60,mass:100},{kind:'ice',level:65.4,mass:100},{kind:'melt',level:60,mass:100}];return a;};

test('the talk runs in order: ice pop memory, freezing the pop, then the pipe question',()=>{
 const f=frozen().freeze;
 assert.equal(f.talk,0);
 assert.equal(freezeTalk(f,'talk-chill'),'','the pop cannot freeze before it is on the table');
 assert.equal(f.talk,0);
 assert.ok(freezeTalk(f,'talk-pop-no'));assert.equal(f.talk,1);
 assert.equal(freezeTalk(f,'talk-pipe-burst'),'','the pipe question waits for the frozen pop');
 assert.ok(freezeTalk(f,'talk-chill'));assert.equal(f.talk,2);
 assert.equal(talkDone(f),false);
 assert.ok(freezeTalk(f,'talk-pipe-burst'));assert.equal(f.talk,3);
 assert.equal(talkDone(f),true);
});
test('either memory answer moves on, because having seen one is not a right or wrong answer',()=>{
 for(const answer of ['yes','no']){const f=frozen().freeze;freezeTalk(f,'talk-pop-'+answer);assert.equal(f.talk,1);assert.equal(f.popSeen,answer);}
});
test('a wrong pipe idea stays on the question and points back at what the learner saw',()=>{
 const f=frozen().freeze;f.talk=2;
 const wrong=pipeChoices.filter(c=>!c.ok);
 assert.equal(wrong.length,2);
 for(const c of wrong){const said=freezeTalk(f,'talk-pipe-'+c.id);assert.equal(f.talk,2);assert.equal(f.pipeTry,c.id);assert.equal(said,c.hint);assert.ok(c.hint.length>8);}
 assert.equal(freezeTalk(f,'talk-pipe-nothing'),'','an unknown idea changes nothing');
 assert.equal(f.talk,2);
});
test('the conversation never changes what counts as a finished experiment',()=>{
 const a=frozen();assert.equal(activityReady(3,a),true);assert.equal(a.freeze.talk,0);
});
test('saves from before the conversation still load, and damaged talk values are rejected',()=>{
 const a=frozen();delete a.freeze.talk;delete a.freeze.popSeen;delete a.freeze.pipeTry;
 const merged={...a,freeze:{...initialActivities().freeze,...a.freeze}};
 assert.equal(validateActivities(merged),true);assert.equal(merged.freeze.talk,0);
 for(const bad of [4,-1,1.5,'2']){const b=frozen();b.freeze.talk=bad;assert.equal(validateActivities(b),false,String(bad));}
});
test('height is always stated against the starting line, not as a bare number',()=>{
 assert.equal(freezeLevelText(60),'빨간 선과 같아');
 assert.equal(freezeLevelText(65.4),'빨간 선보다 5.4 위');
});
const putPhotos=(c,order=[['water','first'],['ice','middle'],['melt','last']])=>order.reduce((c,[item,target])=>fieldAction(3,c,'place',{item,target}),c);
const ordered=()=>fieldAction(3,putPhotos(chapterState(3)),'test');
test('field photos give a clue about the slot that is wrong instead of a generic retry',()=>{
 let c=putPhotos(chapterState(3),[['melt','first'],['ice','middle'],['water','last']]);
 c=fieldAction(3,c,'test');
 assert.equal(c.marks.includes('order'),false);
 assert.match(c.message,/냉각팩/);
 c=fieldAction(3,putPhotos(c),'test');
 assert.equal(c.marks.includes('order'),true);
 assert.equal(fieldReady(3,c),false,'the right order is only half of the task');
});
test('the balance compares each state with the 100 g weight, after the learner commits to a prediction',()=>{
 const put=(c,item,target)=>fieldAction(3,c,'place',{item,target});
 let c=ordered();
 c=put(c,'ice','pan');assert.equal(c.moves.pan,undefined,'nothing is weighed before the prediction');assert.match(c.message,/예상/);
 c=fieldAction(3,c,'guess-weight',{guess:'nonsense'});assert.equal(c.selected,'');
 c=fieldAction(3,c,'guess-weight',{guess:'heavier'});assert.equal(c.selected,'heavier');
 c=put(c,'ice','pan');assert.equal(c.moves.pan,undefined,'the sample needs the weight on the other side');assert.match(c.message,/추/);
 c=put(c,'weight','balance');
 c=put(c,'ice','pan');assert.equal(c.moves.pan,'ice');assert.equal(c.moves.ice,'middle','weighing keeps the photo order');
 assert.equal(fieldReady(3,c),false);
 c=put(c,'water','pan');assert.equal(fieldReady(3,c),false);
 c=put(c,'melt','pan');assert.equal(fieldReady(3,c),true);assert.equal(c.done,true);
 assert.match(c.message,/예상과 달랐/);assert.match(c.message,/100 g/);
});
test('a correct prediction is acknowledged when the third weighing ends',()=>{
 const put=(c,item,target)=>fieldAction(3,c,'place',{item,target});
 let c=fieldAction(3,ordered(),'guess-weight',{guess:'same'});c=put(c,'weight','balance');
 for(const item of ['water','ice','melt'])c=put(c,item,'pan');
 assert.match(c.message,/예상이 맞았/);
});
test('a stage finished before the balance existed keeps its stamp',()=>{
 const old={...chapterState(3),moves:{water:'first',ice:'middle',melt:'last',weight:'balance'},done:true};
 const restored=cleanFieldwork({chapters:{3:old}}).chapters[3];
 assert.equal(restored.done,true);assert.equal(fieldReady(3,restored),true);
 assert.deepEqual(fieldProgress(3,restored).slice(0,1),[fieldProgress(3,restored)[1]]);
});
