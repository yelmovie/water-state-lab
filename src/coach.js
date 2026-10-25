import {state} from './state.js';
import {fieldMissions,fieldReady} from './fieldwork-model.js';
import {btn,esc,icon} from './ui.js';
import {openConcept} from './concepts.js';
import {playCue} from './sound.js';

let current=null,level=0,help=null,spotlight=null;
function closeHelp(restoreFocus=false){
 help?.remove();help=null;spotlight?.classList.remove('coach-spotlight');spotlight=null;
 const trigger=document.querySelector('.coach-trigger');trigger?.setAttribute('aria-expanded','false');
 if(restoreFocus)trigger?.focus({preventScroll:true});
}
export function updateCoachMessage(text){
 const guide=document.querySelector('.compact-guide');if(!guide)return;
 const p=guide.querySelector(':scope > p');if(p)p.textContent=text;
 const badge=guide.querySelector('.coach-trigger-badge');if(badge){badge.textContent='!';badge.classList.add('has-news');}
 guide.querySelector('.coach-trigger')?.setAttribute('aria-label','방울이의 새 관찰 힌트 보기');
 if(current)current.notice=text;
}
document.addEventListener('click',event=>{
 if(help&&!event.target.closest('.compact-guide'))closeHelp();
 const mapHint=document.querySelector('#map-coach-help');
 if(mapHint&&!mapHint.hidden&&!event.target.closest('.journey-companion')){mapHint.hidden=true;document.querySelector('.map-coach')?.setAttribute('aria-expanded','false');}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&help){event.preventDefault();closeHelp(true);}});
const fieldClues={
 1:['물과 얼음을 각각 두 그릇으로 옮겨 봐.','그릇을 바꾸기 전과 후, 무엇의 모양이 달라졌는지 비교해.'],
 2:['도구 하나를 고른 뒤 변신길을 눌러 봐.','얼리기·녹이기·증발·응결에 필요한 조건이 같을까?'],
 3:['세 사진은 처음 → 얼린 뒤 → 녹인 뒤야. 저울에도 추를 놓아 봐.','높이 눈금과 무게를 따로 비교해.'],
 4:['가득 채웠을 때와 적게 채웠을 때를 둘 다 시험해 봐.','얼음 위에 빈 공간이 남는 조건을 찾아 봐.'],
 5:['B판의 물을 손가락으로 여러 방향으로 펴 봐.','양·시간·바닥을 같게 두고, 펼친 넓이만 비교해.'],
 6:['돋보기로 A 표면·B 물속·두 수위를 각각 살펴봐.','A와 B에서 줄어든 물은 각각 어디로 갔을까?'],
 7:['냉각팩을 붙이고 시험한 뒤, 다른 컵으로 옮겨 다시 시험해.','컵 이름이 바뀌어도 물방울이 생기는 조건은 무엇일까?'],
 8:['먼저 냉각 없이 시험해. 그다음 판과 받이 위치를 바꿔 비교해.','물방울이 생기는 곳과 떨어져 모이는 곳을 따로 살펴봐.'],
 9:['출발 부품을 누른 뒤 이어 받을 부품을 눌러도 돼.','물은 저절로 위로 올라갈까? 부품의 높이를 비교해.'],
 10:['따뜻한 도구와 차가운 도구를 물의 변화에 맞춰 연결해.','앞에서 관찰한 증발과 응결이 여기서는 어떻게 이어질까?']
};
function fieldInstruction(n){const c=state.fieldwork.chapters[n];if(!c)return fieldMissions[n].goal;
 if(fieldReady(n,c))return '현장 의뢰를 해결했어! ‘개념 영상 · 도장 받기’를 눌러 발견을 정리하자.';
 if(n===4)return !c.tested.some(t=>!t.ok)?'가득 채운 통부터 얼려 보자. 얼음이 커질 자리가 있을까?':!c.tested.some(t=>t.ok)?'손잡이를 내려 물을 덜 담고, 다시 얼려 비교해 보자.':'여유가 남는 물높이로 다시 시험해 줘.';
 if(n===7)return !c.tested.length?'냉각팩을 A나 B에 붙이고 같은 시간 뒤를 비교해.':!c.tested.some(t=>t.cold===0)||!c.tested.some(t=>t.cold===1)?'이번에는 냉각팩을 다른 컵으로 옮기고 다시 비교해.':'‘찾은 조건’을 차가운 표면에 연결해 줘.';
 if(n===8)return !c.tested.some(t=>!t.ok)?'아직 고치기 전이야. 먼저 시험해서 물이 모이는지 살펴봐.':!c.tested.at(-1)?.ok?'판을 차갑게 하고 받이를 판 아래로 옮겨 다시 시험해.':fieldMissions[n].goal;
 if(n===5)return c.spread.length<12?'B의 물자국을 손가락으로 넓게 펴 봐. A는 그대로 두자.':!c.tested.at(-1)?.ok?'‘같은 시간 뒤 비교’를 눌러 두 자국을 비교해.':'줄어든 물을 공기 중으로 연결해 줘.';
 return c.message||fieldMissions[n].goal;
}
export function cleanupCoach(){closeHelp();current=null;}
export function syncCoach(n,progress,field,ready){
 cleanupCoach();level=0;current={n,progress,field,ready};
 const guide=document.querySelector('.compact-guide');if(!guide)return;
 const p=guide.querySelector('p');p.textContent=field?fieldInstruction(n):progress.instruction;
 p.setAttribute('role','status');p.setAttribute('aria-live','polite');
 guide.querySelector('.hint-button').setAttribute('aria-expanded','false');
 const steps=[...document.querySelectorAll('.activity-progress li')];const next=steps.find(s=>!s.classList.contains('done'));next?.classList.add('next');if(next)next.setAttribute('aria-current','step');
 const tools=document.querySelector('.activity-tools,.control-panel');
 if(tools){
  tools.querySelectorAll('.quest-prize').forEach(e=>e.remove());
  const optional=[...tools.querySelectorAll(':scope > details')];
  if(optional.length>1){const drawer=document.createElement('details');drawer.className='tool-drawer';drawer.innerHTML='<summary>조작 도움·더 알아보기</summary>';optional.forEach(d=>drawer.append(d));const back=tools.querySelector('[data-action=field-back]');if(back)drawer.append(back);tools.append(drawer);}
  // One forward action remains visible while optional tools scroll.
  const forward=[...tools.querySelectorAll(':scope > button')].reverse().find(b=>/next|complete|field-finish/.test(b.dataset.action||''));
  if(forward){forward.classList.add('stage-forward');if(!forward.disabled)forward.classList.add('next-action');}
  tools.querySelectorAll('.btn.primary,.activity-primary').forEach(b=>{if(!b.disabled&&!tools.querySelector('.current-action')&&!forward?.classList.contains('next-action'))b.classList.add('current-action');});
 }
}
export function handleCoach(action){
 if(!current)return false;const {n,progress,field,ready}=current;
 if(action==='concept-replay'){if(ready)openConcept(n,{reduced:state.settings.reduced});return true;}
 if(action!=='buddy-hint')return false;
 if(help){closeHelp(true);return true;}
 const guide=document.querySelector('.compact-guide');help=document.createElement('div');help.id='coach-help';help.className='coach-help';help.setAttribute('role','region');help.setAttribute('aria-label','방울이의 단계별 힌트');
 const badge=guide.querySelector('.coach-trigger-badge');if(badge){badge.textContent='…';badge.classList.remove('has-news');}
 guide.querySelector('.coach-trigger')?.setAttribute('aria-label','방울이 힌트 보기');
 const clues=field?[current.notice||fieldInstruction(n),fieldClues[n][1]]:[current.notice||progress.instruction,progress.hint];
 const draw=()=>{help.innerHTML=`<div class="coach-help-head"><b>방울이의 단서 ${level+1} / 2</b><button class="icon-btn" aria-label="힌트 닫기">${icon('close')}</button></div><p>${esc(clues[level])}</p><details class="coach-progress"><summary>이번 활동 순서</summary><ol>${[...progress.steps,{label:'현장 의뢰 해결',done:ready}].map(step=>`<li>${step.done?'완료 · ':''}${esc(step.label)}</li>`).join('')}</ol></details><div class="coach-help-actions">${ready?btn(icon('retry',20)+' 개념 다시 보기','concept-replay','concept-revisit'):''}${level===0?btn('단서 하나 더','','secondary').replace('data-action=""','data-hint-more'):''}<button class="btn primary" data-hint-try>직접 해 볼게</button></div>`;help.querySelector('.icon-btn').onclick=()=>handleCoach('buddy-hint');help.querySelector('[data-hint-more]')?.addEventListener('click',()=>{level=1;draw();void playCue('hint');});help.querySelector('[data-hint-try]').onclick=()=>{handleCoach('buddy-hint');const target=document.querySelector('.current-action,.next-action,.expedition-board,.phaser-stage');target?.scrollIntoView({block:'nearest'});if(target){spotlight=target;target.classList.add('coach-spotlight');target.focus?.({preventScroll:true});}};};
 draw();guide.append(help);guide.querySelector('.hint-button').setAttribute('aria-expanded','true');help.querySelector('.icon-btn')?.focus({preventScroll:true});void playCue('hint');return true;
}
