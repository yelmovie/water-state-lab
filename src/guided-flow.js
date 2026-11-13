// The lesson demonstrates routine operations; predictions and conclusions stay with the learner.
import {cupSummarySeen,activityReady,experimentActivities,sortCards} from './activity-model.js';
import {measureStatus} from './freeze-measure.js';
import {pipeChoices,talkDone} from './freeze-talk.js';
import {currentNight,nightFills,reasons} from './cold-night-model.js';
import {chapterState,fieldAction,fieldReady} from './fieldwork-model.js';
import {currentTrialValid} from './domain.js';
import {coreTransfer} from './core-transfer.js';

const question=(id,prompt,choices,note='')=>({id,prompt,choices,note});
const choices=(prefix,items)=>items.map(([value,label])=>({label,action:prefix+value}));
const where=[['air','공기 중 수증기로 바뀌었어'],['cup','컵 안에 그대로 있어'],['floor','바닥으로 흘러내렸어']];
export const guidedVisitComplete=(n,state)=>state.pages.includes(n)||(n<=8&&state.completed.includes(Math.ceil(n/2)))||(n===9&&state.completed.includes(5))||(n===10&&state.restored);

/** Pure descriptor used by both the screen and its automatic observation controller. */
export function guidedQuestion(n,state,final=null){
 const a=experimentActivities(n,state),q=state.inquiry;
 if(state.fieldwork.active===n){
  const c=state.fieldwork.chapters[n];
  if(n===4&&c&&!currentNight(c)&&!fieldReady(4,c))return question('night-reason','통 위쪽에 물을 채우지 않은 공간을 남긴 까닭은 뭘까?',choices('guide-night-reason-',reasons.map(r=>[r.id,r.label])),c.selected?c.message:'사흘 밤 동안 통과 얼음이 어떻게 달라졌는지 떠올려 봐.');
  return null;
 }
 if(n===2){
  const card=sortCards.find(c=>!a.sort.placed[c.id]);
  if(card&&q.sortProof===card.id)return question('sort-'+card.id,`${card.name}은 어떤 상태일까?`,choices('ix-sort-answer-',[['solid','고체'],['liquid','액체'],['gas','기체']]),'앞에서 관찰한 모양과 흐르는 모습을 떠올려 봐.');
 }
 if(n===3){
  const f=a.freeze;
  if(measureStatus(f).stage==='measured'&&!f.predicted)return question('freeze-prediction','같은 물을 얼리면 눈금은 어떻게 될까?',choices('act-freeze-guess-',[[56,'처음보다 낮아질 것 같아'],[60,'처음과 같을 것 같아'],[66,'처음보다 높아질 것 같아']]),'예상은 달라도 괜찮아. 실제로 얼리고 녹여서 비교할 거야.');
  if(activityReady(3,a)&&f.talk===2)return question('freeze-pipe','겨울 배관은 왜 깨질 수 있을까?',choices('act-talk-pipe-',pipeChoices.map(c=>[c.id,c.label])),'물을 더 넣지 않아도 얼음이 차지하는 자리는 달라졌어.');
 }
 if(n===4){
  const p=a.pipe;
  if(!activityReady(4,a)&&p.trials.some(t=>t.safe)&&p.trials.some(t=>!t.safe)){
   const specimens=[...new Map(p.trials.map((t,i)=>[t.fill,{t,i}])).values()];
   return question('pipe-space','물을 얼린 뒤에도 위쪽에 공간이 남은 시험관은 어느 것일까?',specimens.slice(-4).map(({t,i})=>({label:`물 ${t.fill}만큼 담은 시험관`,action:'act-pipe-mark-'+i})),'점선은 얼리기 전 물높이야. 얼음 위에 남은 공간이 넉넉한 쪽을 골라 봐.');
  }
 }
 if(n===5&&a.draw.strokes.some(s=>s.length>=3)){
  if(!q.drawPrediction)return question('draw-prediction','어느 물그림이 먼저 마를까?',choices('ix-draw-predict-',[['thin','A · 물을 조금 묻힌 그림'],['thick','B · 물을 많이 묻힌 그림'],['same','비슷할 것 같아']]),'같은 그림과 바닥에서 물의 양만 달라.');
  if(a.draw.time>=110&&a.draw.faster!=='thin')return question('draw-result','관찰했을 때 어느 그림이 먼저 말랐어?',choices('ix-draw-answer-',[['thin','A가 먼저 말랐어'],['thick','B가 먼저 말랐어'],['same','동시에 말랐어']]),'가운데 기록과 마지막 기록을 비교해 봐.');
  if(a.draw.faster==='thin'&&a.draw.destination!=='air')return question('draw-destination','그림에 있던 물은 어디로 갔을까?',choices('ix-draw-where-',where));
 }
 if(n===6&&a.compare.baseline&&a.compare.records.some(r=>r.boiling)&&['surface','inside','level'].every(k=>a.compare.pins.includes(k))&&a.compare.destination!=='air')return question('heat-destination','두 컵에서 줄어든 물은 어디로 갔을까?',choices('ix-heat-where-',where),'A는 표면에서, 끓는 B는 물속에서도 변화가 일어났어.');
 if(n===7&&!q.dewHypothesis)return question('dew-source','차가운 컵 바깥의 물방울은 어디서 왔을까?',choices('ix-dew-predict-',[['inside','컵 안의 물이 밖으로 나왔어'],['air','공기 중 수증기에서 왔어'],['unknown','아직 잘 모르겠어']]),'먼저 예상한 뒤 두 컵을 같은 시간 동안 관찰할 거야.');
 if(n===8&&activityReady(7,a)&&cupSummarySeen(a.explain)&&!q.transferPrediction)return question('bottle-prediction','새 음료병에서도 물방울이 생길까?',choices('ix-transfer-predict-',[['cold','차가운 병 바깥에 생길 거야'],['both','두 병 모두 생길 거야'],['neither','두 병 모두 안 생길 거야']]),'컵에서 본 증거를 새 병에도 적용해 봐.');
 if(n===10){
  const d=final?.progress?.diagnosis;
  if(d?.tests.length&&!d.resolved&&(!d.hypothesis||d.hypothesis!==d.fault))return question('core-diagnosis','어디를 고쳐야 물이 끝까지 도착할까?',choices('diagnose-',[['cooling','냉각 문제를 고칠래'],['connection','물길 연결을 고칠래']]),d.hypothesis?'물이 멈춘 곳을 다시 살펴보고 원인을 골라 봐.':'먼저 시험한 물방울의 이동을 근거로 골라 봐.');
 }
 return null;
}

/** Teaching operations and guarded transitions. This function never chooses a question's answer. */
export function guidedRoutineAction(n,state,final=null){
 const a=experimentActivities(n,state);
 if(guidedVisitComplete(n,state))return null;
 if(state.fieldwork.active===n){
  const c=state.fieldwork.chapters[n];if(!c)return null;
  if(fieldReady(n,c))return 'field-continue';
  if(n===4){const night=currentNight(c);if(night){const index=nightFills(c,night).findIndex(v=>v!==80);if(index>=0)return `guide-night-fill-${night.id}-${index}`;}}
  return null;
 }
 if(guidedQuestion(n,state,final))return null;
 if(n===2){const card=sortCards.find(c=>!a.sort.placed[c.id]);return card?'ix-sort-card-'+card.id:'act-complete-1';}
 if(n===3&&activityReady(3,a))return a.freeze.talk<2?'act-talk-chill':talkDone(a.freeze)?'act-next-3':null;
 if(n===6&&a.compare.records.some(r=>r.boiling)){const pin=['surface','inside','level'].find(k=>!a.compare.pins.includes(k));if(pin)return 'ix-lens-'+pin;}
 if(n===7&&a.dew.rewiped&&!a.dew.again||n===8&&cupSummarySeen(a.explain)&&!a.explain.transfer)return null;
 if(n===9&&currentTrialValid(state.lab.workshop))return 'complete-5';
 if(n===10&&final?.progress?.tested&&final.progress.diagnosis?.resolved&&coreTransfer(final.progress,final.progress.diagnosis.working).canFlow)return 'core-activate';
 const next={4:'act-complete-2',5:'act-next-5',6:'act-complete-3',7:'act-next-7',8:'act-complete-4'};
 return next[n]&&activityReady(n,a)?next[n]:null;
}

/** Only the small operations absent from the old manual control set live here. */
export function handleGuidedAction(action,state){
 const fill=/^guide-night-fill-([123])-([012])$/.exec(action),reason=/^guide-night-reason-(dry|grow|heavy)$/.exec(action);
 if(!fill&&!reason)return false;
 if(state.route!==4||state.fieldwork.active!==4)return true;
 const c=state.fieldwork.chapters[4]||chapterState(4);
 state.fieldwork.chapters[4]=fill?fieldAction(4,c,'fill',{night:+fill[1],index:+fill[2],value:80}):fieldAction(4,c,'reason',{choice:reason[1]});
 return true;
}
