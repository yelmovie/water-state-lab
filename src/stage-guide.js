import {measureStatus,measureTask} from './freeze-measure.js';
import {coreTransfer} from './core-transfer.js';
import {activityReady,experimentActivities,heatingTrial,nextSortCard,sortCards,pipeStep} from './activity-model.js';
import {currentTrialValid,testCollector,stageLessons} from './domain.js';
import {funnelSeat} from './workshop-controls.js';
import {icon,esc} from './ui.js';
import {iceSeat} from './scene-model.js';

const gestures={
 drag:['끌어 놓기','hand'],tap:['눌러 고르기','check'],slide:['손잡이 밀기','arrow'],brush:['손가락으로 문지르기','hand'],
 draw:['손가락으로 그리기','hand'],watch:['지켜보기','book'],pour:['물 붓기','drop'],compare:['나란히 비교하기','book'],measure:['재고 기록하기','flask'],
 connect:['이어 주기','arrow'],test:['작동시켜 보기','flask'],next:['다음으로','arrow']
};
const actions=(...names)=>names.map(name=>`[data-action="${name}"]`).join(',');
export const move=(kind,title,instruction,target='',regions=[])=>({kind,title,instruction,target,regions});
const board='.phaser-stage';
const time=n=>`#inquiry-time-${n},[data-action="ix-forward"]`;
const record=actions('ix-record');
const next=['','act-next-1','act-complete-1','act-next-3','act-complete-2','act-next-5','act-complete-3','act-next-7','act-complete-4','complete-5'];
const shortSteps=[[],['붓기','얼음 옮기기','물자국'],['고체','액체','기체'],['예상','얼리기','녹이기'],['가득 담기','덜 담기','남은 공간 찾기'],['그리기','시간 비교','물의 행방'],['가열 전','끓이기','물의 행방'],['닦기','겉면 비교','다시 닦기'],['증거','설명 잇기','새 병'],['판 차갑게','기울이기','고치기'],['증상','고치기','물 보내기']];

// What the learner expected, set against what happened. Empty when no prediction was made.
function predictionNote(n,a,q){
 if(n===3)return ({66:'예상대로 얼음 윗면이 높아졌어. ',60:'그대로일 줄 알았지만 높아졌어. ',56:'낮아질 줄 알았지만 높아졌어. '})[a.freeze.prediction]??'';
 if(n===5)return q.drawPrediction==='thin'?'예상대로 물이 적은 A가 먼저 말랐어. ':q.drawPrediction?'예상과 달리 물이 적은 A가 먼저 말랐어. ':'';
 if(n===7)return ({inside:'컵 안에서 나온다고 예상했지만, 입구를 막아도 생겼어. ',air:'예상대로 물방울은 공기에서 왔어. '})[q.dewHypothesis]??'';
 return '';
}
export function experimentMove(n,state,final){
 const a=experimentActivities(n,state),q=state.inquiry;
 if(n===3&&activityReady(3,a)&&a.freeze.talk<3)return [move('tap','쭈쭈바 본 적 있어?','오른쪽에서 네 경험을 골라 봐. 정답은 없어.','.freeze-guess'),move('tap','쭈쭈바를 얼려 봐','‘냉동실에 넣기’를 누르고 봉지가 어떻게 달라지는지 봐.',actions('act-talk-chill')),move('tap','배관은 왜 고장 났을까?','쭈쭈바 봉지를 떠올리며 네 생각을 골라 봐.','.freeze-guess')][a.freeze.talk];
 if(n<=8&&activityReady(n,a))return move('next','오늘 알게 된 것',predictionNote(n,a,q)+stageLessons[n],actions(next[n]));
 if(n===1){
  const s=a.observe;
  if(s.step===0){
   if(s.pours.length===2)return move('compare','두 그릇의 물높이를 비교해 봐','둘 다 100mL인데 어느 쪽이 더 높이 찼어? 다 봤으면 얼음도 옮겨 봐.',actions('act-observe-step-1'));
   const tall=!s.pours.includes('tall');
   return move('pour',`${tall?'길쭉한':'넓은'} 그릇에 물을 부어 봐`,s.pours.length?'주전자에 남은 반을 다른 그릇에 부어 봐.':'왼쪽 주전자를 그릇 위로 끌어 봐. 주전자의 물이 줄어드는 모습도 살펴봐.',board,s.pours.length?[]:[[117,162,190,230]]);
  }
  if(s.step===1)return s.iceMoved?move('compare','물과 얼음을 나란히 비교해 봐','물은 그릇마다 모양이 달랐는데 얼음은 어때? 다 봤으면 물자국을 보러 가자.',actions('act-observe-step-2')):move('drag','얼음을 넓은 그릇으로 옮겨 봐','물을 담았던 것과 같은 두 그릇이야. 얼음도 모양이 바뀔까?',board,[[iceSeat('wide').x,158,166,176],[iceSeat('tall').x,158,106,176]]);
  if(!s.clothWet)return move('brush','천에 물자국을 만들어 봐','천 위를 손가락으로 문질러 봐.',board,[[280,157,276,185]]);
  return s.time<80?move('slide','물자국이 마르는 모습을 봐','시간 손잡이를 오른쪽으로 밀어 봐.',time(n)):move('slide','마른 모습을 끝까지 봐','시간 손잡이를 끝까지 밀면 관찰이 저절로 기록돼.',time(n));
 }
 if(n===2){
  const s=a.sort,card=sortCards.find(c=>c.id===q.sortProof)||nextSortCard(s);
  return move('tap',`‘${card.name}’, 물의 어떤 상태일까?`,'모양이 그대로면 고체, 그릇 따라 바뀌면 액체, 눈에 안 보이면 기체야.',board,[[597.5,71,215,72,22],[597.5,155,215,72,22],[597.5,239,215,72,22]]);
 }
 if(n===3){
  const f=a.freeze,{stage}=measureStatus(f);
  if(stage==='measured'&&!f.predicted)return move('tap','얼면 물 윗면은 어떻게 될까?','빨간 선이 처음 물높이야. 오른쪽에서 네 생각을 골라 봐.','.freeze-guess');
  return move('tap',measureTask(f),'화면의 큰 버튼으로 한 단계씩 해 보자. 같은 통과 같은 물을 유지해서 비교해.','[data-measure-action]');
 }
 if(n===4){
  const step=pipeStep(a.pipe);
  if(step==='first')return move('drag','먼저 시험관을 얼려 봐','물의 양을 확인하고 냉동고에 넣어 봐. 몸통을 끌거나 ‘얼리기’를 눌러도 돼.','[data-bench-tube],[data-bench-run]');
  if(step==='add')return move('slide','가득 담은 물과도 비교해 봐','‘더 담기’를 누르거나 노란 손잡이를 올려 물을 더 담아 봐.','[data-bench-more],[data-bench-handle]');
  if(step==='reduce')return move('slide','이번엔 물을 덜 담아 봐','‘덜 담기’를 누르거나 노란 손잡이를 내려 봐. 물의 양만 바꾸고 똑같이 얼릴 거야.','[data-bench-less],[data-bench-handle]');
  if(step==='freeze')return move('drag',`물 ${a.pipe.fill}만큼 담은 시험관을 얼려 봐`,'물의 양이 바뀌었어. 냉동고에 넣고 오른쪽의 앞 시험관과 비교해 봐.','[data-bench-run]');
  return move('tap','얼음 위에 공간이 남은 시험관을 찾아 봐','물을 덜 담으면 얼린 뒤에도 위쪽에 공간이 남아. 그 공간이 넉넉한 시험관을 눌러 봐.','[data-action^="act-pipe-mark-"]');
 }
 if(n===5){
  const s=a.draw;
  if(!s.strokes.some(line=>line.length>=3))return move('draw','왼쪽 판에 물로 그림을 그려 봐','손가락으로 선을 그리면 오른쪽에도 같은 모양이 생겨.',board,[[184,158,283,210]]);
  if(!q.drawPrediction)return move('tap','어느 물그림이 먼저 마를까?','그림을 비교하고 네 예상을 골라 봐. 예상은 틀려도 괜찮아.','[data-action^="ix-draw-predict-"]');
  if(q.drawMode==='record')return move('compare','처음·중간·나중 그림을 비교해 봐','기록 손잡이를 밀어 두 판의 물자국이 사라지는 순서를 확인해 봐.','#record-scrub');
  if(s.records.length<3)return move('slide','두 물그림이 마르는 순서를 봐','시간 손잡이를 ‘나중’까지 밀어 처음 모습과 비교해 봐.',time(n));
  if(s.faster!=='thin')return move('compare','먼저 마른 물그림을 골라 봐','두 판의 가운데 시간 기록을 보고 어느 쪽 물자국이 먼저 옅어졌는지 눌러 봐.','[data-action^="ix-draw-answer-"]');
  return move('tap','그림에서 줄어든 물은 어디로 갔을까?','바닥은 다시 말랐어. 물이 어디로 갔을지 골라 봐.','[data-action^="ix-draw-where-"]');
 }
 if(n===6){
  const s=a.compare,t=heatingTrial(s.heat,s.time);
  if(!s.baseline&&s.time<30)return move('slide','가열하지 않고 두 컵을 지켜봐','시간 손잡이를 오른쪽으로 밀어 두 컵의 물높이를 봐.',time(n));
  if(!s.baseline)return move('slide','가열하기 전 모습을 봐','가열하지 않은 채 시간 손잡이를 밀면 두 컵의 모습이 기록돼.',time(n));
  if(!s.records.some(r=>r.boiling)){
   if(s.heat<55&&!s.batchPrepared)return move('tap','새 실험의 두 컵을 같은 양으로 준비해','첫 실험은 기록했어. 같은 두 컵에 같은 양을 다시 담아, 이번에는 B만 가열해서 비교하자.',actions('ix-heat-prepare'));
   if(s.heat<55)return move('tap','B 컵만 가열해 봐','같은 양으로 다시 준비했어. A는 그대로 두고 B만 가열해.',actions('ix-heat-on'));
   if(!t.boiling)return move('slide','B의 물속에 기포가 생기는지 봐','시간 손잡이를 더 밀고 B의 물속을 자세히 살펴봐.',time(n));
   return move('slide','기포가 올라오는 모습을 봐','시간 손잡이를 밀면 끓는 모습이 기록돼.',time(n));
  }
  return move('tap','두 컵에서 줄어든 물은 어디로 갔을까?','끓은 물도, 끓지 않은 물도 줄었어. 공통점을 골라 봐.','[data-action^="ix-heat-where-"]');
 }
 if(n===7){
  const s=a.dew;
  if(!q.dewHypothesis)return move('tap','컵 바깥 물방울은 어디서 왔을까?','실험하기 전에 네 생각을 하나 골라 봐.','[data-action^="ix-dew-predict-"]');
  if(s.wiped.length<2){
   return move('brush','차가운 컵의 겉면을 닦아 봐','컵을 손가락으로 문지르거나 ‘A 전체 닦기’를 눌러 봐.',actions('ix-wipe-cold')+',#wipe-cold');
  }
  if(!s.sealed)return move('tap','두 컵의 입구를 막아 봐','컵 안의 물이 밖으로 나오지 않게 ‘두 컵 입구 막기’를 눌러 봐.',actions('act-dew-seal'));
  if(s.records.length<2)return s.time<70?move('slide','같은 시간 뒤의 두 컵을 비교해 봐','시간 손잡이를 밀어 어느 컵 바깥에 물방울이 생기는지 봐.',time(n)):move('slide','두 컵의 겉면을 비교해 봐','시간 손잡이를 끝까지 밀면 두 컵의 모습이 기록돼.',time(n));
  if(!s.rewiped)return move('brush','차가운 컵의 물방울을 한 번 더 닦아 봐','물방울을 문지르거나 ‘A 가운데 닦기’를 눌러 봐.',actions('ix-wipe-middle'));
  return s.againTime<70?move('slide','닦은 자리에 물방울이 다시 생길까?','시간 손잡이를 다시 오른쪽으로 밀어 봐.',time(n)):move('slide','다시 생긴 물방울을 봐','시간 손잡이를 끝까지 밀면 닦은 자리 모습이 기록돼.',time(n));
 }
 if(n===8){
  const s=a.explain;
  if(!activityReady(7,a))return move('next','컵 실험에서 증거를 가져와 봐','두 컵의 겉면을 관찰한 뒤 이 설명을 만들 수 있어.',actions('act-go-7'));
  if(s.evidence.length<2)return move('tap','네가 본 증거 그림 두 장을 골라 봐','그림을 눌러 설명에 쓸 관찰을 모아 봐.',board);
  if(s.chain.length<3)return move('connect',['물방울의 출발을 골라 봐','무엇을 만났는지 이어 봐','어떤 모습으로 바뀌었는지 이어 봐'][s.chain.length],'위쪽 그림을 누르거나 빈 칸으로 끌어 네 설명을 이어 봐.',board,[[125+s.chain.length*235,258,184,96]]);
  if(!q.transferPrediction)return move('tap','어느 음료병에 물방울이 생길까?','차가운 병과 실온 병을 보고 네 예상을 골라 봐.','[data-action^="ix-transfer-predict-"]');
  if(!s.bottleWiped)return move('brush','두 음료병의 겉면을 닦아 봐','두 병을 손가락으로 문질러. 아래 버튼으로 한 번에 닦아도 돼.',board);
  return s.time<70?move('slide','음료병에도 같은 일이 생길까?','시간 손잡이를 밀어 두 병 바깥을 비교해 봐.',time(n)):move('slide','음료병 바깥을 끝까지 봐','시간 손잡이를 끝까지 밀면 두 병의 모습이 기록돼.',time(n));
 }
 if(n===9){
  const s=state.lab.workshop,last=s.trials.at(-1),live=last?.signature===testCollector(s.parts,s.cold,s.angle).signature,seat=funnelSeat(s.parts.ramp);
  if(!s.cold)return move('tap','판을 차갑게 만들어 봐','공기 중 수증기는 차가운 판에 닿아야 물방울이 돼. ‘냉각팩 붙이기’를 눌러 봐.',actions('toggle-cold'));
  if(!live)return move('tap','물방울을 따라가 봐','‘같은 시간 뒤 물길 시험’을 눌러 물이 어디까지 가는지 봐.',actions('test-workshop'));
  if(s.angle<=0)return move('tap','경사판을 기울여 봐','판이 평평해서 물방울이 멈췄어. 물은 아래로 흐르니까 ‘경사판 기울이기’를 눌러 봐.',actions('ramp-tilt'));
  if(currentTrialValid(s))return move('next','물이 물통에 모였어!',stageLessons[9],actions('complete-5'));
  if(last?.ok)return move('tap','한 조건을 바꾸어 비교해 봐','물이 잘 모였어. 냉각을 껐다 켜며 결과를 비교해 봐. 더 살펴보기에서 직접 시험할 수도 있어.',actions('toggle-cold'));
  return move('drag','깔때기를 빛나는 자리로 옮겨 봐','물이 경사판 끝에서 샜어. 깔때기를 끌어 놓거나 ‘깔때기 옮기기’를 눌러 봐.',actions('funnel-fix'),[[s.parts.funnel.x,Math.round(s.parts.funnel.y*.64+10),110,110]]);
 }
 const f=final?.progress,d=f?.diagnosis;
 if(!final?.design)return move('next','먼저 물 모으는 장치를 만들어 봐','공방에서 완성한 장치로 코어를 다시 움직일 수 있어.',actions('screen-9'));
 if(f.tested)return move('tap','도착한 물로 코어를 깨워 봐','밸브를 지나 코어까지 물이 왔어. ‘코어 깨우기’를 눌러 봐.',actions('core-activate'));
 if(f.connected&&d?.resolved&&!coreTransfer(f,d.working).downhill)return move('slide','코어 입구를 물통의 물높이보다 낮춰 봐','높이 손잡이를 왼쪽으로 밀어 봐. 물은 높은 곳에서 낮은 곳으로 흘러.','#core-inlet-height');
 if(f.connected&&d?.resolved)return f.valve>0?move('test','코어에 물을 보내 봐','‘연결관으로 물 보내기’를 눌러 물이 코어까지 닿는지 확인해 봐.',actions('test-core')):move('slide','밸브를 열어 물길을 열어 봐','그림 속 밸브를 눌러 돌리거나, 밸브 열림 손잡이를 밀어 봐.','#final-valve');
 if(d?.resolved)return move('connect','고친 장치를 코어에 이어 봐','‘코어에 연결’을 눌러 물이 갈 길을 열어 봐.',actions('connect-core'));
 if(!d?.tests.length)return move('test','물이 어디에서 멈췄는지 찾아 봐','‘장치 시험’을 눌러 물방울이 생기는 곳과 새는 곳을 살펴봐.',actions('diagnosis-test'));
 if(!d.hypothesis)return move('tap','고장의 원인을 골라 봐','물이 생기지 않았는지, 중간에 샜는지 보고 네 생각을 눌러 봐.','[data-action^="diagnose-"]');
 if(d.hypothesis==='cooling'&&!d.working.cold)return move('tap','냉각을 켜 봐','판이 차가워야 수증기가 물방울이 돼. ‘냉각 켜기’를 눌러 봐.',actions('core-cooling'));
 if(d.hypothesis==='connection'&&d.working.parts.funnel.x!==final.design.parts.funnel.x)return move('tap','깔때기를 제자리로 옮겨 봐','물이 새는 곳을 고쳐 봐. ‘깔때기 제자리로’를 눌러 봐.',actions('core-funnel'));
 // After the chosen fix, ask for a new test first; 'pick another cause' only fits once the fixed device was tested and still failed.
 const fixedNow=d.hypothesis==='cooling'?d.working.cold:d.working.parts.funnel.x===final.design.parts.funnel.x;
 if(fixedNow&&d.tests.at(-1)?.signature!==testCollector(d.working.parts,d.working.cold,d.working.angle).signature)return move('test','고친 장치를 시험해 봐','‘장치 시험’을 눌러 물이 끝까지 오는지 확인해 봐.',actions('diagnosis-test'));
 return move('tap','다른 원인을 골라 봐','고쳐도 물이 오지 않아. 물방울이 안 생기는지, 중간에 새는지 다시 살펴봐.','[data-action^="diagnose-"]');
}

export function stageGuide(n,task,{steps=[],counts,teacher=false,extra=''}={}){
 const [label,symbol]=gestures[task.kind],current=steps.findIndex(step=>!step.done);
 return `<section class="stage-instruction stage-guide" aria-labelledby="stage-direction" data-gesture="${task.kind}">
  <span class="stage-gesture" aria-hidden="true">${icon(symbol,28)}</span>
  <div class="stage-guide-copy"><small>${teacher?'교사 시연 · ':''}지금 할 일 <span>· ${label}</span></small><strong id="stage-direction">${esc(task.title)}</strong><p id="stage-how">${esc(task.instruction)}</p></div>
  <div class="stage-guide-side">${steps.length?`<ol class="stage-guide-steps" aria-label="관찰 순서">${steps.map((step,i)=>`<li ${i===current?'aria-current="step"':''} class="${step.done?'is-done':''}"><span aria-hidden="true">${step.done?icon('check',13):i+1}</span>${esc(shortSteps[n][i]||step.label)}</li>`).join('')}</ol><span class="step-count stage-guide-count" aria-label="관찰 단계 완료">${steps.filter(s=>s.done).length} / ${steps.length}</span>`:counts?`<span class="step-count" aria-label="찾은 단서">${counts.join(' / ')}</span>`:''}${extra}</div>
 </section>`;
}
export function markStageControls(root,task){
 if(!task?.target)return;
 const targets=[...root.querySelectorAll(task.target)].filter(el=>!el.disabled&&!el.closest('[hidden],.phaser-replaced'));
 const available=targets.filter(el=>!el.closest('details:not([open])'));
 let cue=false;
 for(const el of available.length?available:targets){
  const target=el.closest('details:not([open])')?.querySelector(':scope > summary')??(el.matches('input[type=range]')?el.closest('label')??el:el);
  target.classList.add('guided-control');
  if(!cue&&target.matches('button,summary,label')){cue=true;target.insertAdjacentHTML('beforeend',`<span class="tap-cue" aria-hidden="true">${icon('hand',30)}</span>`);}
  if(target.matches('button,input,summary')&&!target.hasAttribute('aria-describedby'))target.setAttribute('aria-describedby','stage-how');
 }
}

/** Keep a question and its answers together. Runs after every experiment render. */
export function pinQuestion(root){
 const main=root.querySelector('.experiment-main'),heading=root.querySelector('#stage-direction');if(!main||!heading)return;
 const text=heading.textContent.trim(),isQuestion=/[?？]\s*$/.test(text);
 heading.classList.toggle('is-question',isQuestion);
 if(!isQuestion||!main.classList.contains('manual-tools'))return; // while watching, the question panel already holds both
 const panel=root.querySelector('.guided-question-panel'),shown=el=>el.offsetParent!==null&&!el.disabled;
 let answers;
 if(panel){
  const actions=[...panel.querySelectorAll('[data-action]')].map(b=>b.dataset.action);
  answers=actions.flatMap(a=>[...root.querySelectorAll(`[data-action="${CSS.escape(a)}"]`)]).filter(b=>!panel.contains(b)&&shown(b));
  // The tools hold no answer buttons for this question: show the question card itself.
  if(!answers.length){panel.classList.add('show-in-manual');return;}
 }else answers=[...root.querySelectorAll('.guided-control')].filter(shown);
 if(!answers.length)return;
 let group=answers.length>1?answers[0].parentElement:(answers[0].matches('button,input,summary,label')?answers[0].parentElement:answers[0]);
 while(group&&!answers.every(b=>group.contains(b)))group=group.parentElement;
 // A canvas stage draws over its first row, leaving an empty frame; the title bar already shows this question.
 if(!group||group===main||group.matches('.phaser-stage'))return;
 // The question becomes the first row of the answer group, so it sits on top of the answers in any layout.
 group.classList.add('stage-answer-group');group.classList.toggle('qa-wrap',getComputedStyle(group).display.includes('flex'));
 group.insertAdjacentHTML('afterbegin',`<div class="stage-question-pop" role="note"><b>❓ 문제</b><span>${esc(text)}</span></div>`);
}
