import test from 'node:test';
import assert from 'node:assert/strict';
import {pipeAssessment,pipeFinding} from '../src/activity-model.js';
import {chapterState,fieldAction} from '../src/fieldwork-model.js';

test('the same fill produces the same volume and two explicitly distinct model goals',()=>{
 for(const [fill,fits,reserve] of [[85,true,true],[90,true,false],[95,false,false],[100,false,false]]){
  const lab=pipeAssessment(fill,'reserve'),field=pipeAssessment(fill,'capacity');
  assert.equal(lab.expanded,field.expanded);
  assert.equal(lab.space,field.space);
  assert.equal(lab.fits,fits);assert.equal(field.fits,fits);
  assert.equal(lab.extraReserve,reserve);assert.equal(field.extraReserve,reserve);
  assert.equal(lab.met,reserve);assert.equal(field.met,fits);
  const state=chapterState(4);state.setting=fill;
  const tested=fieldAction(4,state,'test');
  assert.equal(tested.tested.at(-1).amount,lab.expanded);
  assert.equal(tested.tested.at(-1).ok,field.met);
  assert.ok(tested.message.includes(pipeFinding(fill)));
 }
 const t=pipeAssessment(90);
 assert.equal(t.expanded,98.1);assert.equal(t.space,1.9);
 assert.match(pipeFinding(90),/넘치지 않음/);
 assert.match(pipeFinding(90),/추가 5% 여유 미달/);
});
