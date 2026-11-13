import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,readState} from '../src/state.js';
import {guidedQuestion,guidedRoutineAction,handleGuidedAction} from '../src/guided-flow.js';
import {sortCards,pipeTrial} from '../src/activity-model.js';
import {fieldAction,chapterState,fieldReady} from '../src/fieldwork-model.js';
import {newDiagnosis} from '../src/collector-model.js';
import {targetParts,testCollector} from '../src/domain.js';

test('automatic observation requires a new teacher opt-in without resetting saved progress',()=>{
 const old=initialState();assert.equal(old.settings.autoObservation,false);delete old.settings.autoObservation;
 old.settings.autoplay=true;old.route=1;old.activities.observe.pours=['tall'];old.inquiry.pours.tall=100;
 const restore=()=>readState({getItem:()=>JSON.stringify(old)});
 const restored=restore();assert.equal(restored.settings.autoObservation,false);
 assert.deepEqual(restored.activities.observe.pours,['tall']);assert.equal(restored.inquiry.pours.tall,100);
 old.settings.autoObservation=true;assert.equal(restore().settings.autoObservation,true);
});
test('classification presents each unanswered picture and never fills a student answer',()=>{
 const s=initialState();assert.equal(guidedRoutineAction(2,s),'ix-sort-card-ice');
 for(const card of sortCards){
  s.inquiry.sortProof=card.id;const q=guidedQuestion(2,s);assert.equal(q.id,'sort-'+card.id);
  assert.equal(q.choices.length,3);assert.equal(guidedRoutineAction(2,s),null);
  assert.deepEqual(Object.keys(s.activities.sort.placed),sortCards.slice(0,sortCards.indexOf(card)).map(c=>c.id));
  s.activities.sort.placed[card.id]=card.type;s.inquiry.sortProof='';
 }
 assert.equal(guidedRoutineAction(2,s),'act-complete-1');
});
test('predictions and observed conclusions remain explicit choices',()=>{
 const s=initialState();s.activities.freeze.processStage='measured';assert.equal(guidedQuestion(3,s).id,'freeze-prediction');
 s.activities.draw.strokes=[[[0,0],[1,1],[2,0]]];assert.equal(guidedQuestion(5,s).id,'draw-prediction');
 s.inquiry.drawPrediction='thick';s.activities.draw.time=110;assert.equal(guidedQuestion(5,s).id,'draw-result');
 s.activities.draw.faster='thin';assert.equal(guidedQuestion(5,s).id,'draw-destination');
 assert.equal(guidedQuestion(7,s).id,'dew-source');
});
test('automatic observation freezes the pop and leaves the pipe question to the learner',()=>{
 const s=initialState(),f=s.activities.freeze;s.route=3;f.compared=true;f.records=['water','ice','melt'].map(kind=>({kind,level:60,mass:100}));
 assert.equal(guidedQuestion(3,s),null);
 assert.equal(guidedRoutineAction(3,s),'act-talk-chill');f.talk=2;assert.equal(guidedQuestion(3,s).id,'freeze-pipe');
});
test('night observation prepares conditions but stops for the explanation and never awards it',()=>{
 const s=initialState();s.route=4;s.fieldwork.active=4;s.fieldwork.chapters[4]=chapterState(4);
 for(let night=1;night<=3;night++){
  for(let i=0;i<night;i++){
   const action=guidedRoutineAction(4,s);assert.equal(action,`guide-night-fill-${night}-${i}`);assert.equal(handleGuidedAction(action,s),true);
  }
  assert.equal(guidedRoutineAction(4,s),null);
  s.fieldwork.chapters[4]=fieldAction(4,s.fieldwork.chapters[4],'freeze-night',{night});
 }
 assert.equal(fieldReady(4,s.fieldwork.chapters[4]),false);assert.equal(guidedQuestion(4,s).id,'night-reason');
 handleGuidedAction('guide-night-reason-heavy',s);assert.equal(fieldReady(4,s.fieldwork.chapters[4]),false);
 handleGuidedAction('guide-night-reason-grow',s);assert.equal(fieldReady(4,s.fieldwork.chapters[4]),true);
 assert.equal(guidedRoutineAction(4,s),'field-continue');
});
test('safe and unsafe trial observations lead to a choice rather than automatically marking a specimen',()=>{
 const s=initialState();s.activities.pipe.trials=[pipeTrial(95),pipeTrial(80)];
 const q=guidedQuestion(4,s);assert.equal(q.id,'pipe-space');assert.equal(q.choices.length,2);assert.equal(s.activities.pipe.marked,false);
});
test('a completed field process continues only after its actual observation guard is satisfied',()=>{
 const s=initialState();s.fieldwork.active=10;s.fieldwork.chapters[10]=chapterState(10);
 assert.equal(guidedRoutineAction(10,s),null);s.fieldwork.chapters[10].marks=['evaporate','condense'];s.fieldwork.chapters[10].done=true;
 assert.equal(guidedRoutineAction(10,s),'field-continue');
});
test('diagnosis waits for an observed fault and a correct user hypothesis before repair proceeds',()=>{
 const s=initialState(),design={parts:structuredClone(targetParts),cold:true,angle:20},d=newDiagnosis(design,'connection'),final={design,progress:{diagnosis:d,tested:false}};
 assert.equal(guidedQuestion(10,s,final),null);d.tests.push(testCollector(d.working.parts,d.working.cold,d.working.angle));
 assert.equal(guidedQuestion(10,s,final).id,'core-diagnosis');d.hypothesis='cooling';assert.equal(guidedQuestion(10,s,final).id,'core-diagnosis');
 d.hypothesis='connection';assert.equal(guidedQuestion(10,s,final),null);assert.equal(d.resolved,false);
});
test('revisiting finished work never triggers another completion or automatic exit',()=>{
 const s=initialState();for(const card of sortCards)s.activities.sort.placed[card.id]=card.type;
 s.pages=[2];assert.equal(guidedRoutineAction(2,s),null);
 s.fieldwork.active=10;s.fieldwork.chapters[10]={...chapterState(10),marks:['evaporate','condense'],done:true};s.completed=[5];
 assert.equal(guidedRoutineAction(10,s),'field-continue','the newly connected core still needs its first ending');
 s.restored=true;assert.equal(guidedRoutineAction(10,s),null);
});
